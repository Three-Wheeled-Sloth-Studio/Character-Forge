import type {
  JsonObject,
  NativeSystemState,
  RulesSystemAdapter,
  RulesValidationIssue,
  RulesValidationResult,
} from "../../character-model/src/index.js";
import {
  BRP_DETECTIVE_ELECTIVE_SKILL_KEYS,
  BRP_DETECTIVE_REQUIRED_SKILL_KEYS,
  BRP_FIRST_SLICE_SKILL_CATALOG,
  BRP_NORMAL_PROFESSIONAL_SKILL_POINTS,
  BRP_NORMAL_STARTING_SKILL_CAP,
  calculateBrpDerivedState,
  type BrpDetectiveElectiveSkillKey,
  type BrpFirstSliceSkillKey,
} from "./firstSlice.js";
import type { BrpCharacteristicValues } from "./nativeCharacter.js";
import { BRP_UGE_ORC_1_05_SOURCE } from "./rulesSource.js";

export const brpUge105Adapter: RulesSystemAdapter = {
  adapterId: "brp-uge",
  adapterVersion: "0.1.0",
  systemId: "brp",
  editionId: "uge-2023",
  supportedRulesSources: [BRP_UGE_ORC_1_05_SOURCE],
  validateNativeState,
};

function validateNativeState(state: NativeSystemState): RulesValidationResult {
  const issues: RulesValidationIssue[] = [];

  if (state.systemId !== "brp") {
    error(issues, "brp.envelope.system", "BRP native state must use systemId brp.", "systemId");
  }
  if (state.editionId !== "uge-2023") {
    error(issues, "brp.envelope.edition", "BRP native state must use editionId uge-2023.", "editionId");
  }
  if (state.rulesVersion !== BRP_UGE_ORC_1_05_SOURCE.version) {
    error(issues, "brp.envelope.rules-version", `BRP native state must use rules version ${BRP_UGE_ORC_1_05_SOURCE.version}.`, "rulesVersion");
  }
  if (state.schemaVersion !== "brp-character/0.1") {
    error(issues, "brp.envelope.schema", "BRP first slice requires brp-character/0.1.", "schemaVersion");
  }

  if (!isObject(state.payload)) {
    error(issues, "brp.payload.object", "BRP native payload must be an object.", "payload");
    return result(issues);
  }

  const payload = state.payload;
  if (payload.schemaVersion !== "brp-character/0.1") {
    error(issues, "brp.payload.schema", "BRP payload schemaVersion must be brp-character/0.1.", "payload.schemaVersion");
  }
  if (!isStringArray(payload.rulesSourceIds) || payload.rulesSourceIds.length !== 1 || payload.rulesSourceIds[0] !== BRP_UGE_ORC_1_05_SOURCE.id) {
    error(issues, "brp.payload.rules-source", "BRP first slice must retain exactly the UGE ORC 1.05 rules source.", "payload.rulesSourceIds");
  }

  validateRulesProfile(payload.rulesProfile, issues);
  const electives = validateIdentity(payload.identity, issues);
  const characteristics = validateCharacteristics(payload.characteristics, issues);

  if (characteristics) {
    validateCharacteristicRolls(payload.characteristicRolls, characteristics, issues);
    validateDerived(payload.derived, characteristics, issues);
    validateSkills(payload.skillBudgets, payload.skills, characteristics, electives, issues);
  }

  if (!Array.isArray(payload.equipment) || !payload.equipment.every((entry) => typeof entry === "string")) {
    error(issues, "brp.equipment.shape", "BRP first-slice equipment must be a string array.", "payload.equipment");
  }

  return result(issues);
}

function validateRulesProfile(value: unknown, issues: RulesValidationIssue[]): void {
  if (!isObject(value)) {
    error(issues, "brp.rules-profile.shape", "BRP rules profile must be retained as native state.", "payload.rulesProfile");
    return;
  }
  if (value.powerLevel !== "normal") {
    error(issues, "brp.rules-profile.power-level", "BRP first slice supports Normal power level only.", "payload.rulesProfile.powerLevel");
  }
  if (value.characteristicGeneration !== "explicit") {
    error(issues, "brp.rules-profile.characteristics", "BRP first slice supports explicit characteristic entry only.", "payload.rulesProfile.characteristicGeneration");
  }
  if (!isEmptyStringArray(value.enabledOptions)) {
    error(issues, "brp.rules-profile.options", "BRP first slice does not enable optional rules.", "payload.rulesProfile.enabledOptions");
  }
  if (!isEmptyStringArray(value.enabledPowerSystems)) {
    error(issues, "brp.rules-profile.powers", "BRP first slice is non-powered.", "payload.rulesProfile.enabledPowerSystems");
  }
}

function validateIdentity(value: unknown, issues: RulesValidationIssue[]): Set<BrpDetectiveElectiveSkillKey> | null {
  if (!isObject(value)) {
    error(issues, "brp.identity.shape", "BRP identity state is required.", "payload.identity");
    return null;
  }
  if (!isInteger(value.age) || value.age < 18 || value.age > 49) {
    error(issues, "brp.identity.age", "BRP first-slice age must be an integer from 18 through 49.", "payload.identity.age");
  }
  if (typeof value.gender !== "string" || !value.gender.trim()) {
    error(issues, "brp.identity.gender", "BRP first-slice gender must be non-empty.", "payload.identity.gender");
  }
  if (!isObject(value.profession)) {
    error(issues, "brp.profession.shape", "BRP profession state is required.", "payload.identity.profession");
    return null;
  }
  if (value.profession.professionId !== "detective") {
    error(issues, "brp.profession.id", "BRP first slice supports Detective only.", "payload.identity.profession.professionId");
  }
  if (value.profession.wealth !== "average" && value.profession.wealth !== "affluent") {
    error(issues, "brp.profession.wealth", "Detective wealth must be Average or Affluent.", "payload.identity.profession.wealth");
  }

  const selected = value.profession.selectedElectiveSkillIds;
  if (!isStringArray(selected) || selected.length !== 4 || new Set(selected).size !== 4) {
    error(issues, "brp.profession.electives", "Detective must retain exactly four unique elective skill IDs.", "payload.identity.profession.selectedElectiveSkillIds");
    return null;
  }

  const allowed = new Set<string>(BRP_DETECTIVE_ELECTIVE_SKILL_KEYS);
  if (selected.some((entry) => !allowed.has(entry))) {
    error(issues, "brp.profession.electives", "Detective retains an unsupported elective skill ID.", "payload.identity.profession.selectedElectiveSkillIds");
    return null;
  }
  return new Set(selected as BrpDetectiveElectiveSkillKey[]);
}

function validateCharacteristics(value: unknown, issues: RulesValidationIssue[]): BrpCharacteristicValues | null {
  if (!isObject(value)) {
    error(issues, "brp.characteristics.shape", "BRP characteristic state is required.", "payload.characteristics");
    return null;
  }

  const ranges: Array<[keyof BrpCharacteristicValues, number, number]> = [
    ["STR", 3, 21],
    ["CON", 3, 21],
    ["SIZ", 8, 21],
    ["INT", 8, 21],
    ["POW", 3, 21],
    ["DEX", 3, 21],
    ["CHA", 3, 21],
  ];
  const parsed = {} as BrpCharacteristicValues;

  for (const [id, minimum, maximum] of ranges) {
    const state = value[id];
    if (!isObject(state) || !isInteger(state.initial) || !isInteger(state.final) || !Array.isArray(state.adjustments)) {
      error(issues, "brp.characteristics.entry", `${id} must retain initial, adjustments, and final state.`, `payload.characteristics.${id}`);
      return null;
    }
    if (state.initial !== state.final || state.adjustments.length !== 0) {
      error(issues, "brp.characteristics.adjustments", `BRP first-slice ${id} must have no characteristic adjustments.`, `payload.characteristics.${id}`);
    }
    if (state.final < minimum || state.final > maximum) {
      error(issues, "brp.characteristics.range", `${id} is outside the supported first-slice range.`, `payload.characteristics.${id}.final`);
    }
    parsed[id] = state.final;
  }
  return parsed;
}

function validateCharacteristicRolls(value: unknown, characteristics: BrpCharacteristicValues, issues: RulesValidationIssue[]): void {
  if (!isObject(value)) {
    error(issues, "brp.characteristic-rolls.shape", "BRP characteristic rolls are required.", "payload.characteristicRolls");
    return;
  }
  const expected: Record<string, number> = {
    effort: characteristics.STR * 5,
    stamina: characteristics.CON * 5,
    idea: characteristics.INT * 5,
    luck: characteristics.POW * 5,
    agility: characteristics.DEX * 5,
    charisma: characteristics.CHA * 5,
  };
  for (const [key, expectedValue] of Object.entries(expected)) {
    if (value[key] !== expectedValue) {
      error(issues, "brp.characteristic-rolls.value", `${key} characteristic roll is incorrect.`, `payload.characteristicRolls.${key}`);
    }
  }
}

function validateDerived(value: unknown, characteristics: BrpCharacteristicValues, issues: RulesValidationIssue[]): void {
  if (!isObject(value)) {
    error(issues, "brp.derived.shape", "BRP derived state is required.", "payload.derived");
    return;
  }
  const expected = calculateBrpDerivedState(characteristics);
  for (const key of ["hitPoints", "majorWoundLevel", "powerPoints", "experienceBonus", "move", "damageModifier"] as const) {
    if (value[key] !== expected[key]) {
      error(issues, "brp.derived.value", `BRP derived ${key} is incorrect.`, `payload.derived.${key}`);
    }
  }
}

function validateSkills(
  budgetsValue: unknown,
  skillsValue: unknown,
  characteristics: BrpCharacteristicValues,
  electives: Set<BrpDetectiveElectiveSkillKey> | null,
  issues: RulesValidationIssue[],
): void {
  if (!isObject(budgetsValue) || !isObject(budgetsValue.professional) || !isObject(budgetsValue.personal)) {
    error(issues, "brp.skill-budgets.shape", "BRP skill budgets are required.", "payload.skillBudgets");
    return;
  }
  const personalTotal = characteristics.INT * 10;
  if (budgetsValue.professional.total !== BRP_NORMAL_PROFESSIONAL_SKILL_POINTS || budgetsValue.professional.spent !== BRP_NORMAL_PROFESSIONAL_SKILL_POINTS) {
    error(issues, "brp.skill-budgets.professional", "Normal BRP professional budget must retain 250 points spent of 250.", "payload.skillBudgets.professional");
  }
  if (budgetsValue.personal.total !== personalTotal || budgetsValue.personal.spent !== personalTotal) {
    error(issues, "brp.skill-budgets.personal", `BRP personal budget must retain INT x 10 (${personalTotal}) points spent.`, "payload.skillBudgets.personal");
  }
  if (!Array.isArray(skillsValue)) {
    error(issues, "brp.skills.shape", "BRP skills must be an array.", "payload.skills");
    return;
  }

  const allowedProfessional = new Set<string>(BRP_DETECTIVE_REQUIRED_SKILL_KEYS);
  if (electives) for (const elective of electives) allowedProfessional.add(elective);

  const seen = new Set<BrpFirstSliceSkillKey>();
  let professionalSpent = 0;
  let personalSpent = 0;

  for (let index = 0; index < skillsValue.length; index += 1) {
    const skill = skillsValue[index];
    const path = `payload.skills.${index}`;
    if (!isObject(skill) || !isObject(skill.contributions)) {
      error(issues, "brp.skills.entry", "BRP skill entries must retain contribution state.", path);
      continue;
    }
    const skillKey = identifySkill(skill);
    if (!skillKey) {
      error(issues, "brp.skills.identity", "BRP first slice contains an unknown or malformed skill identity.", path);
      continue;
    }
    if (seen.has(skillKey)) {
      error(issues, "brp.skills.duplicate", `BRP skill ${skillKey} is duplicated.`, path);
      continue;
    }
    seen.add(skillKey);

    const definition = BRP_FIRST_SLICE_SKILL_CATALOG[skillKey];
    if (skill.label !== definition.label || skill.baseChance !== definition.baseChance) {
      error(issues, "brp.skills.base", `BRP skill ${skillKey} has incorrect source identity or base chance.`, path);
    }
    const professional = skill.contributions.professional;
    const personal = skill.contributions.personal;
    if (!isNonNegativeInteger(professional) || !isNonNegativeInteger(personal)) {
      error(issues, "brp.skills.contributions", `BRP skill ${skillKey} contributions must be non-negative integers.`, `${path}.contributions`);
      continue;
    }
    if (professional > 0 && !allowedProfessional.has(skillKey)) {
      error(issues, "brp.skills.profession", `BRP skill ${skillKey} is not eligible for the selected Detective professional allocation.`, `${path}.contributions.professional`);
    }
    const professionalRating = definition.baseChance + professional;
    const finalRating = professionalRating + personal;
    if (professionalRating > BRP_NORMAL_STARTING_SKILL_CAP || finalRating > BRP_NORMAL_STARTING_SKILL_CAP) {
      error(issues, "brp.skills.cap", `BRP skill ${skillKey} exceeds the Normal starting cap.`, path);
    }
    if (skill.finalRating !== finalRating) {
      error(issues, "brp.skills.final", `BRP skill ${skillKey} final rating does not match its retained causal layers.`, `${path}.finalRating`);
    }
    professionalSpent += professional;
    personalSpent += personal;
  }

  if (professionalSpent !== BRP_NORMAL_PROFESSIONAL_SKILL_POINTS) {
    error(issues, "brp.skills.professional-total", "Retained professional skill contributions do not total 250.", "payload.skills");
  }
  if (personalSpent !== personalTotal) {
    error(issues, "brp.skills.personal-total", `Retained personal skill contributions do not total ${personalTotal}.`, "payload.skills");
  }
}

function identifySkill(value: JsonObject): BrpFirstSliceSkillKey | null {
  for (const [skillKey, definition] of Object.entries(BRP_FIRST_SLICE_SKILL_CATALOG) as Array<[BrpFirstSliceSkillKey, (typeof BRP_FIRST_SLICE_SKILL_CATALOG)[BrpFirstSliceSkillKey]]>) {
    if (value.skillId !== definition.skillId) continue;
    if (definition.specialty === null) {
      if (value.specialty === null) return skillKey;
      continue;
    }
    if (isObject(value.specialty) && value.specialty.id === definition.specialty.id && value.specialty.label === definition.specialty.label) {
      return skillKey;
    }
  }
  return null;
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

function isEmptyStringArray(value: unknown): value is string[] {
  return isStringArray(value) && value.length === 0;
}
