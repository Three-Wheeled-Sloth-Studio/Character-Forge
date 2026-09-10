import type {
  JsonObject,
  NativeSystemState,
  RulesSystemAdapter,
  RulesValidationIssue,
  RulesValidationResult,
} from "../../character-model/src/index.js";
import { brpUge105Adapter as brpUge105BaseAdapter } from "./adapter.js";
import type {
  BrpCharacteristicId,
  BrpCharacteristicValues,
  BrpPowerLevel,
  BrpWealthLevel,
} from "./nativeCharacter.js";
import {
  resolveBrpAthleteProfession,
  resolveBrpBeggarProfession,
  resolveBrpCustomProfession,
  type BrpAthleteElectiveSkillKey,
  type BrpResolvedProfession,
} from "./professions.js";
import { resolveBrpPowerLevelProfile } from "./powerLevel.js";
import {
  BRP_FIRST_SLICE_SKILL_CATALOG,
  identifyBrpSkillDefinition,
  type BrpFirstSliceSkillKey,
  type BrpResolvedSkillDefinition,
} from "./skills.js";

const BRP_CHARACTERISTIC_IDS: BrpCharacteristicId[] = ["STR", "CON", "SIZ", "INT", "POW", "DEX", "CHA"];
const BASE_ISSUES_REPLACED_BY_PLAYER_CORE = new Set([
  "brp.profession.id",
  "brp.profession.wealth",
  "brp.skills.profession",
]);

export const brpPlayerCoreProfessionAdapter: RulesSystemAdapter = {
  ...brpUge105BaseAdapter,
  validateNativeState,
};

function validateNativeState(state: NativeSystemState): RulesValidationResult {
  const profession = readNewProfession(state);
  if (!profession) return brpUge105BaseAdapter.validateNativeState(state);

  const base = brpUge105BaseAdapter.validateNativeState(state);
  const issues = base.issues.filter((issue) => !BASE_ISSUES_REPLACED_BY_PLAYER_CORE.has(issue.code));
  if (!isObject(state.payload)) return result(issues);
  const payload = state.payload;
  const characteristics = readCharacteristics(payload.characteristics);
  const profile = readPowerProfile(payload, issues);
  const resolvedProfession = characteristics ? validateProfession(profession, characteristics, issues) : null;

  if (characteristics && profile && resolvedProfession) {
    validateProfessionalSkillState(payload, characteristics, profile, resolvedProfession, issues);
  }
  return result(issues);
}

function readNewProfession(state: NativeSystemState): JsonObject | null {
  if (!isObject(state.payload) || !isObject(state.payload.identity) || !isObject(state.payload.identity.profession)) return null;
  const profession = state.payload.identity.profession;
  return profession.professionId === "athlete" || profession.professionId === "beggar" || profession.professionId === "custom"
    ? profession
    : null;
}

function validateProfession(
  value: JsonObject,
  characteristics: BrpCharacteristicValues,
  issues: RulesValidationIssue[],
): BrpResolvedProfession | null {
  if (!isBrpWealthLevel(value.wealth)) {
    error(issues, "brp.profession.wealth", "BRP player-core profession must retain a supported wealth level.", "payload.identity.profession.wealth");
    return null;
  }

  try {
    if (value.professionId === "athlete") {
      if (!isStringArray(value.selectedElectiveSkillIds)) {
        error(issues, "brp.profession.electives", "Athlete must retain five supported elective skill IDs.", "payload.identity.profession.selectedElectiveSkillIds");
        return null;
      }
      return resolveBrpAthleteProfession(value.wealth, value.selectedElectiveSkillIds as BrpAthleteElectiveSkillKey[], characteristics);
    }
    if (value.professionId === "beggar") return resolveBrpBeggarProfession(value.wealth, characteristics);

    if (typeof value.title !== "string" || !value.title.trim()) {
      error(issues, "brp.profession.custom-title", "Custom BRP profession title must be non-empty.", "payload.identity.profession.title");
    }
    if (typeof value.description !== "string" || !value.description.trim()) {
      error(issues, "brp.profession.custom-description", "Custom BRP profession description must be non-empty.", "payload.identity.profession.description");
    }
    if (!isStringArray(value.selectedProfessionalSkillIds)) {
      error(issues, "brp.profession.custom-skills", "Custom BRP profession must retain exactly ten supported professional skill IDs.", "payload.identity.profession.selectedProfessionalSkillIds");
      return null;
    }
    const keys = value.selectedProfessionalSkillIds.filter(isFirstSliceSkillKey);
    if (keys.length !== value.selectedProfessionalSkillIds.length) {
      error(issues, "brp.profession.custom-skills", "Custom BRP profession retains an unsupported professional skill ID.", "payload.identity.profession.selectedProfessionalSkillIds");
      return null;
    }
    return resolveBrpCustomProfession(value.wealth, String(value.title ?? ""), String(value.description ?? ""), keys, characteristics);
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "BRP player-core profession validation failed.";
    const code = value.professionId === "custom" && message.includes("skill")
      ? "brp.profession.custom-skills"
      : value.professionId === "athlete" && message.includes("elective")
        ? "brp.profession.electives"
        : "brp.profession.profile";
    error(issues, code, message, "payload.identity.profession");
    return null;
  }
}

function readPowerProfile(payload: JsonObject, issues: RulesValidationIssue[]) {
  if (!isObject(payload.rulesProfile) || (payload.rulesProfile.powerLevel !== "normal" && payload.rulesProfile.powerLevel !== "heroic")) return null;
  if (!isObject(payload.identity) || !isInteger(payload.identity.age)) return null;
  const powerLevel = payload.rulesProfile.powerLevel as BrpPowerLevel;
  const defaultStartingAge = powerLevel === "heroic" && isObject(payload.identity.ageBasis) && isInteger(payload.identity.ageBasis.defaultStartingAge)
    ? payload.identity.ageBasis.defaultStartingAge
    : undefined;
  try {
    return resolveBrpPowerLevelProfile(powerLevel, payload.identity.age, defaultStartingAge);
  } catch (caught) {
    error(
      issues,
      "brp.profession.power-profile",
      caught instanceof Error ? caught.message : "BRP player-core power profile could not be resolved.",
      "payload.identity",
    );
    return null;
  }
}

function validateProfessionalSkillState(
  payload: JsonObject,
  characteristics: BrpCharacteristicValues,
  profile: ReturnType<typeof resolveBrpPowerLevelProfile>,
  profession: BrpResolvedProfession,
  issues: RulesValidationIssue[],
): void {
  if (!isObject(payload.skillBudgets) || !isObject(payload.skillBudgets.professional)) return;
  const professionalBudget = payload.skillBudgets.professional;
  if (professionalBudget.total !== profile.professionalSkillPoints || professionalBudget.spent !== profile.professionalSkillPoints) {
    error(
      issues,
      "brp.skill-budgets.professional",
      `BRP professional budget must retain ${profile.professionalSkillPoints} points spent of ${profile.professionalSkillPoints} for the retained age profile.`,
      "payload.skillBudgets.professional",
    );
  }
  if (!Array.isArray(payload.skills)) return;

  let spent = 0;
  for (let index = 0; index < payload.skills.length; index += 1) {
    const skill = payload.skills[index];
    if (!isObject(skill) || !isObject(skill.contributions) || !isNonNegativeInteger(skill.contributions.professional)) continue;
    const professional = skill.contributions.professional;
    spent += professional;
    if (professional === 0) continue;
    const definition = identifyBrpSkillDefinition(skill.skillId, skill.specialty, characteristics);
    if (!definition) continue;
    const allowed = profession.allowedProfessionalSkills.get(definition.key);
    if (!allowed || !skillDefinitionsEqual(allowed, definition)) {
      error(
        issues,
        "brp.skills.profession",
        `BRP skill ${definition.label} is not eligible for the selected ${profession.professionId} professional allocation.`,
        `payload.skills.${index}.contributions.professional`,
      );
    }
  }
  if (spent !== profile.professionalSkillPoints) {
    error(
      issues,
      "brp.skills.professional-total",
      `Retained professional skill contributions do not total ${profile.professionalSkillPoints}.`,
      "payload.skills",
    );
  }
}

function readCharacteristics(value: unknown): BrpCharacteristicValues | null {
  if (!isObject(value)) return null;
  const result = {} as BrpCharacteristicValues;
  for (const id of BRP_CHARACTERISTIC_IDS) {
    const entry = value[id];
    if (!isObject(entry) || !isInteger(entry.final)) return null;
    result[id] = entry.final;
  }
  return result;
}

function isFirstSliceSkillKey(value: string): value is BrpFirstSliceSkillKey {
  return Object.prototype.hasOwnProperty.call(BRP_FIRST_SLICE_SKILL_CATALOG, value);
}

function isBrpWealthLevel(value: unknown): value is BrpWealthLevel {
  return value === "destitute" || value === "poor" || value === "average" || value === "affluent" || value === "wealthy";
}

function skillDefinitionsEqual(left: BrpResolvedSkillDefinition, right: BrpResolvedSkillDefinition): boolean {
  return left.key === right.key
    && left.skillId === right.skillId
    && left.label === right.label
    && left.baseChance === right.baseChance
    && left.specialty?.id === right.specialty?.id
    && left.specialty?.label === right.specialty?.label;
}

function result(issues: RulesValidationIssue[]): RulesValidationResult {
  return { valid: !issues.some((issue) => issue.severity === "error"), issues };
}

function error(issues: RulesValidationIssue[], code: string, message: string, path: string): void {
  issues.push({ code, message, severity: "error", path });
}

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return isInteger(value) && value >= 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}
