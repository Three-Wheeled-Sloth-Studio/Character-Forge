import type {
  JsonObject,
  NativeSystemState,
  RulesSystemAdapter,
  RulesValidationIssue,
  RulesValidationResult,
} from "../../character-model/src/index.js";
import { brpUge105Adapter as brpUge105PoweredAdapter } from "./poweredAdapter.js";
import type {
  BrpCharacteristicId,
  BrpCharacteristicValues,
  BrpPowerLevel,
} from "./nativeCharacter.js";
import { getBrpPowerLevelRules } from "./powerLevel.js";
import {
  BRP_PSYCHIC_ABILITIES_SYSTEM_ID,
  BRP_PSYCHIC_ABILITY_CATALOG,
  BRP_PSYCHIC_BASE_RATING_METHOD,
  type BrpPsychicAbilityState,
  type BrpPsychicAbilitySystemState,
  type BrpSupportedPsychicAbilityId,
} from "./psychicAbilities.js";

const BRP_CHARACTERISTIC_IDS: BrpCharacteristicId[] = [
  "STR",
  "CON",
  "SIZ",
  "INT",
  "POW",
  "DEX",
  "CHA",
];

export const brpUge105Adapter: RulesSystemAdapter = {
  ...brpUge105PoweredAdapter,
  adapterVersion: "0.7.0",
  validateNativeState,
};

function validateNativeState(state: NativeSystemState): RulesValidationResult {
  if (!isObject(state.payload)) {
    return brpUge105PoweredAdapter.validateNativeState(state);
  }

  const rulesProfile = isObject(state.payload.rulesProfile)
    ? state.payload.rulesProfile
    : null;
  const enabledPowerSystems = rulesProfile?.enabledPowerSystems;

  if (!Array.isArray(enabledPowerSystems)
    || enabledPowerSystems.length !== 1
    || enabledPowerSystems[0] !== BRP_PSYCHIC_ABILITIES_SYSTEM_ID) {
    return brpUge105PoweredAdapter.validateNativeState(state);
  }

  return validatePsychicState(state);
}

function validatePsychicState(state: NativeSystemState): RulesValidationResult {
  const issues: RulesValidationIssue[] = [];
  if (!isObject(state.payload)) {
    return brpUge105PoweredAdapter.validateNativeState(state);
  }

  const payload = state.payload;
  const base = validateBaseStateWithPsychicRemoved(state);
  issues.push(...base.issues.filter((issue) => issue.code !== "brp.skills.personal-total"));

  const finalCharacteristics = readCharacteristics(payload.characteristics, "final");
  if (!finalCharacteristics) {
    return result(issues);
  }

  const rulesProfile = isObject(payload.rulesProfile) ? payload.rulesProfile : null;
  const skillPowerLevel = rulesProfile?.powerLevel === "normal" || rulesProfile?.powerLevel === "heroic"
    ? rulesProfile.powerLevel
    : null;
  if (!skillPowerLevel) {
    return result(issues);
  }

  const psychic = validatePsychicPowerSystems(
    payload.powerSystems,
    finalCharacteristics,
    skillPowerLevel,
    issues,
  );

  if (psychic) {
    validatePersonalSkillPoolCausality(payload, finalCharacteristics, psychic, issues);
  }

  return result(issues);
}

function validateBaseStateWithPsychicRemoved(state: NativeSystemState): RulesValidationResult {
  const baseState = structuredClone(state);
  if (!isObject(baseState.payload)) {
    return brpUge105PoweredAdapter.validateNativeState(baseState);
  }
  if (isObject(baseState.payload.rulesProfile)) {
    baseState.payload.rulesProfile.enabledPowerSystems = [];
  }
  delete baseState.payload.powerSystems;
  return brpUge105PoweredAdapter.validateNativeState(baseState);
}

function validatePsychicPowerSystems(
  value: unknown,
  finalCharacteristics: BrpCharacteristicValues,
  skillPowerLevel: BrpPowerLevel,
  issues: RulesValidationIssue[],
): BrpPsychicAbilitySystemState | null {
  if (!Array.isArray(value) || value.length !== 1 || !isObject(value[0])) {
    error(
      issues,
      "brp.psychic.power-systems.shape",
      "Enabled BRP Psychic Abilities require exactly one retained Psychic Abilities state.",
      "payload.powerSystems",
    );
    return null;
  }

  const system = value[0];
  if (system.systemId !== BRP_PSYCHIC_ABILITIES_SYSTEM_ID) {
    error(
      issues,
      "brp.psychic.system-id",
      "Retained BRP psychic power-system state must identify Psychic Abilities.",
      "payload.powerSystems.0.systemId",
    );
    return null;
  }
  if (system.powerLevel !== "normal") {
    error(
      issues,
      "brp.psychic.power-level",
      "This BRP Psychic Abilities slice supports Normal psychic power level only.",
      "payload.powerSystems.0.powerLevel",
    );
  }

  const abilities = validatePsychicAbilities(
    system.abilities,
    finalCharacteristics.POW,
    skillPowerLevel,
    issues,
  );
  if (!abilities || system.powerLevel !== "normal") return null;

  const expectedSpend = abilities.reduce((sum, ability) => sum + ability.personalSkillPoints, 0);
  if (system.personalSkillPointSpend !== expectedSpend) {
    error(
      issues,
      "brp.psychic.personal-spend",
      "BRP Psychic Abilities personal skill-point spend must equal the retained ability training contributions.",
      "payload.powerSystems.0.personalSkillPointSpend",
    );
  }

  return {
    systemId: BRP_PSYCHIC_ABILITIES_SYSTEM_ID,
    powerLevel: "normal",
    personalSkillPointSpend: expectedSpend,
    abilities,
  };
}

function validatePsychicAbilities(
  value: unknown,
  pow: number,
  skillPowerLevel: BrpPowerLevel,
  issues: RulesValidationIssue[],
): BrpPsychicAbilityState[] | null {
  if (!Array.isArray(value) || value.length !== 2) {
    error(
      issues,
      "brp.psychic.abilities.count",
      "Normal BRP Psychic Abilities require exactly two starting abilities in this slice.",
      "payload.powerSystems.0.abilities",
    );
    return null;
  }

  const startingSkillCap = getBrpPowerLevelRules(skillPowerLevel).startingSkillCap;
  const seen = new Set<BrpSupportedPsychicAbilityId>();
  const abilities: BrpPsychicAbilityState[] = [];

  for (let index = 0; index < value.length; index += 1) {
    const entry = value[index];
    const path = `payload.powerSystems.0.abilities.${index}`;
    if (!isObject(entry)
      || (entry.abilityId !== "empathy" && entry.abilityId !== "mind-shield")) {
      error(
        issues,
        "brp.psychic.ability.identity",
        "This BRP Psychic Abilities slice supports Empathy and Mind Shield only.",
        path,
      );
      continue;
    }

    const abilityId = entry.abilityId as BrpSupportedPsychicAbilityId;
    if (seen.has(abilityId)) {
      error(
        issues,
        "brp.psychic.ability.duplicate",
        "BRP Psychic Abilities must not repeat the same retained ability ID.",
        path,
      );
      continue;
    }
    seen.add(abilityId);

    const definition = BRP_PSYCHIC_ABILITY_CATALOG[abilityId];
    if (entry.label !== definition.label) {
      error(
        issues,
        "brp.psychic.ability.label",
        `BRP Psychic Ability ${definition.label} must retain its source label.`,
        `${path}.label`,
      );
    }
    if (entry.baseRatingMethod !== BRP_PSYCHIC_BASE_RATING_METHOD || entry.baseRating !== pow) {
      error(
        issues,
        "brp.psychic.ability.base",
        `BRP Psychic Ability ${definition.label} must begin at POW x 1 (${pow}%).`,
        path,
      );
    }
    if (!isNonNegativeInteger(entry.personalSkillPoints)) {
      error(
        issues,
        "brp.psychic.ability.personal-points",
        `BRP Psychic Ability ${definition.label} personal skill points must be a non-negative integer.`,
        `${path}.personalSkillPoints`,
      );
      continue;
    }

    const expectedFinal = pow + entry.personalSkillPoints;
    if (entry.finalRating !== expectedFinal) {
      error(
        issues,
        "brp.psychic.ability.final",
        `BRP Psychic Ability ${definition.label} final rating must equal POW x 1 plus personal skill-point training.`,
        `${path}.finalRating`,
      );
    }
    if (expectedFinal > startingSkillCap) {
      error(
        issues,
        "brp.psychic.ability.cap",
        `BRP Psychic Ability ${definition.label} exceeds the retained ${skillPowerLevel === "heroic" ? "Heroic" : "Normal"} skill cap of ${startingSkillCap}%.`,
        path,
      );
    }

    abilities.push({
      abilityId,
      label: definition.label,
      baseRatingMethod: BRP_PSYCHIC_BASE_RATING_METHOD,
      baseRating: pow,
      personalSkillPoints: entry.personalSkillPoints,
      finalRating: expectedFinal,
    });
  }

  return abilities.length === value.length ? abilities : null;
}

function validatePersonalSkillPoolCausality(
  payload: JsonObject,
  characteristics: BrpCharacteristicValues,
  psychic: BrpPsychicAbilitySystemState,
  issues: RulesValidationIssue[],
): void {
  if (!Array.isArray(payload.skills)) return;

  let ordinaryPersonalSpend = 0;
  for (const skill of payload.skills) {
    if (!isObject(skill) || !isObject(skill.contributions) || !isNonNegativeInteger(skill.contributions.personal)) {
      return;
    }
    ordinaryPersonalSpend += skill.contributions.personal;
  }

  const expectedTotal = characteristics.INT * 10;
  if (ordinaryPersonalSpend + psychic.personalSkillPointSpend !== expectedTotal) {
    error(
      issues,
      "brp.psychic.personal-pool-causality",
      `Retained ordinary personal skill contributions plus Psychic Ability training must total INT x 10 (${expectedTotal}).`,
      "payload.skills",
    );
  }
}

function readCharacteristics(
  value: unknown,
  layer: "initial" | "final",
): BrpCharacteristicValues | null {
  if (!isObject(value)) return null;
  const result = {} as BrpCharacteristicValues;
  for (const id of BRP_CHARACTERISTIC_IDS) {
    const entry = value[id];
    if (!isObject(entry) || !isInteger(entry[layer])) return null;
    result[id] = entry[layer] as number;
  }
  return result;
}

function result(issues: RulesValidationIssue[]): RulesValidationResult {
  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    issues,
  };
}

function error(
  issues: RulesValidationIssue[],
  code: string,
  message: string,
  path: string,
): void {
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
