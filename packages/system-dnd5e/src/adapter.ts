import type {
  JsonObject,
  NativeSystemState,
  RulesSystemAdapter,
  RulesValidationIssue,
  RulesValidationResult,
} from "../../character-model/src/index.js";
import {
  abilityModifier,
  DND5E_ABILITY_IDS,
  type Dnd5eAbilityId,
} from "./nativeCharacter.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(object: JsonObject, key: string): number | undefined {
  const value = object[key];
  return typeof value === "number" ? value : undefined;
}

function readString(object: JsonObject, key: string): string | undefined {
  const value = object[key];
  return typeof value === "string" ? value : undefined;
}

function readObject(object: JsonObject, key: string): JsonObject | undefined {
  const value = object[key];
  return isJsonObject(value) ? value : undefined;
}

function pushError(
  issues: RulesValidationIssue[],
  code: string,
  message: string,
  path?: string,
): void {
  issues.push({
    code,
    message,
    severity: "error",
    ...(path ? { path } : {}),
  });
}

function validateAbilityState(payload: JsonObject, issues: RulesValidationIssue[]): void {
  const abilities = readObject(payload, "abilities");
  if (!abilities) {
    pushError(issues, "dnd5e.abilities.missing", "Ability state is required.", "abilities");
    return;
  }

  const base = readObject(abilities, "base");
  const increases = readObject(abilities, "backgroundIncreases");
  const final = readObject(abilities, "final");
  if (!base || !increases || !final) {
    pushError(
      issues,
      "dnd5e.abilities.shape",
      "Base scores, background increases, and final scores are required.",
      "abilities",
    );
    return;
  }

  for (const abilityId of DND5E_ABILITY_IDS) {
    const baseScore = readNumber(base, abilityId);
    const increase = readNumber(increases, abilityId);
    const finalScore = readNumber(final, abilityId);

    if (baseScore === undefined || increase === undefined || finalScore === undefined) {
      pushError(
        issues,
        "dnd5e.abilities.value-missing",
        `Ability ${abilityId} requires base, increase, and final values.`,
        `abilities.${abilityId}`,
      );
      continue;
    }

    if (finalScore !== baseScore + increase) {
      pushError(
        issues,
        "dnd5e.abilities.final-mismatch",
        `Final ${abilityId} must equal base score plus background increase.`,
        `abilities.final.${abilityId}`,
      );
    }

    if (!Number.isInteger(finalScore) || finalScore < 1 || finalScore > 20) {
      pushError(
        issues,
        "dnd5e.abilities.range",
        `Final ${abilityId} must be an integer from 1 through 20 in this Level 1 slice.`,
        `abilities.final.${abilityId}`,
      );
    }
  }
}

function validateAbilityMethodAndSoldierBoosts(
  payload: JsonObject,
  issues: RulesValidationIssue[],
): void {
  const abilities = readObject(payload, "abilities");
  if (!abilities) return;

  const base = readObject(abilities, "base");
  const increases = readObject(abilities, "backgroundIncreases");
  if (!base || !increases) return;

  const generationMethod = readString(abilities, "generationMethod");
  if (generationMethod === "standard-array") {
    const baseScores = DND5E_ABILITY_IDS
      .map((abilityId) => readNumber(base, abilityId))
      .filter((value): value is number => value !== undefined)
      .sort((left, right) => right - left);
    const expectedStandardArray = [15, 14, 13, 12, 10, 8];

    if (
      baseScores.length !== expectedStandardArray.length ||
      baseScores.some((score, index) => score !== expectedStandardArray[index])
    ) {
      pushError(
        issues,
        "dnd5e.standard-array.values",
        "Standard Array must use 15, 14, 13, 12, 10, and 8 exactly once.",
        "abilities.base",
      );
    }
  } else if (generationMethod === "manual") {
    for (const abilityId of DND5E_ABILITY_IDS) {
      const score = readNumber(base, abilityId);
      if (score === undefined || !Number.isInteger(score) || score < 3 || score > 18) {
        pushError(
          issues,
          "dnd5e.manual.base-range",
          `Manual base ${abilityId} must be an integer from 3 through 18 before background increases.`,
          `abilities.base.${abilityId}`,
        );
      }
    }
  } else {
    pushError(
      issues,
      "dnd5e.slice.ability-method",
      "This slice currently supports Standard Array and Manual ability entry.",
      "abilities.generationMethod",
    );
  }

  const increaseValues = Object.fromEntries(
    DND5E_ABILITY_IDS.map((abilityId) => [abilityId, readNumber(increases, abilityId) ?? 0]),
  ) as Record<Dnd5eAbilityId, number>;
  const allowedSoldierAbilities = new Set<Dnd5eAbilityId>([
    "strength",
    "dexterity",
    "constitution",
  ]);
  const nonZeroIncreases = DND5E_ABILITY_IDS.filter(
    (abilityId) => increaseValues[abilityId] !== 0,
  );
  const sortedIncreases = nonZeroIncreases
    .map((abilityId) => increaseValues[abilityId])
    .sort((left, right) => right - left);
  const isTwoPlusOne =
    sortedIncreases.length === 2 &&
    sortedIncreases[0] === 2 &&
    sortedIncreases[1] === 1;
  const isThreeOnes =
    sortedIncreases.length === 3 && sortedIncreases.every((increase) => increase === 1);

  if (
    nonZeroIncreases.some((abilityId) => !allowedSoldierAbilities.has(abilityId)) ||
    (!isTwoPlusOne && !isThreeOnes)
  ) {
    pushError(
      issues,
      "dnd5e.soldier.ability-increases",
      "Soldier ability increases must use +2/+1 on two different Strength, Dexterity, or Constitution scores, or +1 on all three.",
      "abilities.backgroundIncreases",
    );
  }
}

function validateFirstSliceRules(payload: JsonObject, issues: RulesValidationIssue[]): void {
  const identity = readObject(payload, "identity");
  const origin = readObject(payload, "origin");
  const classState = readObject(payload, "class");
  const resources = readObject(payload, "resources");
  const abilities = readObject(payload, "abilities");
  const finalAbilities = abilities ? readObject(abilities, "final") : undefined;

  if (!identity || !origin || !classState || !resources || !finalAbilities) {
    return;
  }

  if (readNumber(identity, "level") !== 1 || readNumber(identity, "experiencePoints") !== 0) {
    pushError(
      issues,
      "dnd5e.level-one.identity",
      "The first supported D&D slice requires a Level 1 character with 0 XP.",
      "identity",
    );
  }

  if (readString(origin, "backgroundId") !== "soldier") {
    pushError(issues, "dnd5e.slice.background", "The first supported slice uses the Soldier background.", "origin.backgroundId");
  }

  if (readString(origin, "speciesId") !== "human") {
    pushError(issues, "dnd5e.slice.species", "The first supported slice uses the Human species.", "origin.speciesId");
  }

  if (readString(classState, "classId") !== "fighter" || readNumber(classState, "level") !== 1) {
    pushError(issues, "dnd5e.slice.class", "The first supported slice requires Fighter 1.", "class");
  }

  if (readNumber(classState, "proficiencyBonus") !== 2) {
    pushError(issues, "dnd5e.proficiency.level-one", "A Level 1 character must have a +2 Proficiency Bonus.", "class.proficiencyBonus");
  }

  const constitution = readNumber(finalAbilities, "constitution");
  const hpMaximum = readNumber(resources, "hitPointsMaximum");
  if (constitution !== undefined && hpMaximum !== undefined) {
    const expectedHp = 10 + abilityModifier(constitution);
    if (hpMaximum !== expectedHp) {
      pushError(
        issues,
        "dnd5e.fighter.level-one-hp",
        `A Level 1 Fighter with Constitution ${constitution} must have ${expectedHp} maximum Hit Points.`,
        "resources.hitPointsMaximum",
      );
    }
  }
}

export const dnd5eSrd521Adapter: RulesSystemAdapter = {
  adapterId: "character-forge:dnd5e-2024",
  adapterVersion: "0.2.0",
  systemId: "dnd5e",
  editionId: "2024",
  supportedRulesSources: [DND5E_SRD_5_2_1_SOURCE],

  validateNativeState(state: NativeSystemState): RulesValidationResult {
    const issues: RulesValidationIssue[] = [];

    if (state.systemId !== this.systemId) {
      pushError(issues, "adapter.system-mismatch", `Expected system ${this.systemId}.`, "systemId");
    }
    if (state.editionId !== this.editionId) {
      pushError(issues, "adapter.edition-mismatch", `Expected edition ${this.editionId}.`, "editionId");
    }
    if (state.rulesVersion !== DND5E_SRD_5_2_1_SOURCE.version) {
      pushError(issues, "adapter.rules-version", "This adapter slice currently supports SRD 5.2.1 only.", "rulesVersion");
    }
    if (state.schemaVersion !== "dnd5e-character/0.1") {
      pushError(issues, "adapter.schema-version", "Unsupported D&D native schema version.", "schemaVersion");
    }
    if (!isJsonObject(state.payload)) {
      pushError(issues, "dnd5e.payload.object", "D&D native payload must be a JSON object.", "payload");
      return { valid: false, issues };
    }

    const payload = state.payload;
    const rulesSourceIds = payload.rulesSourceIds;
    if (
      !Array.isArray(rulesSourceIds) ||
      !rulesSourceIds.includes(DND5E_SRD_5_2_1_SOURCE.id)
    ) {
      pushError(
        issues,
        "dnd5e.rules-source.missing",
        "Native state must retain the SRD 5.2.1 rules-source identifier.",
        "payload.rulesSourceIds",
      );
    }

    validateAbilityState(payload, issues);
    validateAbilityMethodAndSoldierBoosts(payload, issues);
    validateFirstSliceRules(payload, issues);

    return { valid: !issues.some((issue) => issue.severity === "error"), issues };
  },
};
