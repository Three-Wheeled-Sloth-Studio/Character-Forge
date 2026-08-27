import type {
  JsonObject,
  NativeSystemState,
  RulesSystemAdapter,
  RulesValidationIssue,
  RulesValidationResult,
} from "../../character-model/src/index.js";
import {
  DND5E_POINT_COST_BUDGET,
  DND5E_POINT_COSTS,
} from "./abilityGeneration.js";
import {
  abilityModifier,
  DND5E_ABILITY_IDS,
  type Dnd5eAbilityId,
} from "./nativeCharacter.js";
import {
  isGuidedDnd5eClassId,
  isGuidedDnd5eSpeciesId,
  type GuidedDnd5eClassId,
  type GuidedDnd5eSpeciesId,
} from "./srdCatalog.js";
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

function readStringArray(object: JsonObject, key: string): string[] {
  const value = object[key];
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : [];
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
    pushError(issues, "dnd5e.abilities.shape", "Base scores, background increases, and final scores are required.", "abilities");
    return;
  }

  for (const abilityId of DND5E_ABILITY_IDS) {
    const baseScore = readNumber(base, abilityId);
    const increase = readNumber(increases, abilityId);
    const finalScore = readNumber(final, abilityId);

    if (baseScore === undefined || increase === undefined || finalScore === undefined) {
      pushError(issues, "dnd5e.abilities.value-missing", `Ability ${abilityId} requires base, increase, and final values.`, `abilities.${abilityId}`);
      continue;
    }
    if (finalScore !== baseScore + increase) {
      pushError(issues, "dnd5e.abilities.final-mismatch", `Final ${abilityId} must equal base score plus background increase.`, `abilities.final.${abilityId}`);
    }
    if (!Number.isInteger(finalScore) || finalScore < 1 || finalScore > 20) {
      pushError(issues, "dnd5e.abilities.range", `Final ${abilityId} must be an integer from 1 through 20 in this Level 1 slice.`, `abilities.final.${abilityId}`);
    }
  }
}

function validateRangeBase(
  base: JsonObject,
  issues: RulesValidationIssue[],
  methodCode: string,
  methodLabel: string,
  minimum: number,
  maximum: number,
): void {
  for (const abilityId of DND5E_ABILITY_IDS) {
    const score = readNumber(base, abilityId);
    if (score === undefined || !Number.isInteger(score) || score < minimum || score > maximum) {
      pushError(issues, `dnd5e.${methodCode}.base-range`, `${methodLabel} base ${abilityId} must be an integer from ${minimum} through ${maximum} before background increases.`, `abilities.base.${abilityId}`);
    }
  }
}

function validatePointCostBase(base: JsonObject, issues: RulesValidationIssue[]): void {
  let pointsSpent = 0;
  let allScoresValid = true;
  for (const abilityId of DND5E_ABILITY_IDS) {
    const score = readNumber(base, abilityId);
    const cost = score === undefined ? undefined : DND5E_POINT_COSTS[score];
    if (score === undefined || !Number.isInteger(score) || cost === undefined) {
      allScoresValid = false;
      pushError(issues, "dnd5e.point-cost.base-range", `Point Cost base ${abilityId} must be an integer from 8 through 15 before background increases.`, `abilities.base.${abilityId}`);
      continue;
    }
    pointsSpent += cost;
  }
  if (allScoresValid && pointsSpent > DND5E_POINT_COST_BUDGET) {
    pushError(issues, "dnd5e.point-cost.budget", `Point Cost ability scores spend ${pointsSpent} points, exceeding the ${DND5E_POINT_COST_BUDGET}-point budget.`, "abilities.base");
  }
}

function validateAbilityMethodAndSoldierBoosts(payload: JsonObject, issues: RulesValidationIssue[]): void {
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
    if (baseScores.length !== expectedStandardArray.length || baseScores.some((score, index) => score !== expectedStandardArray[index])) {
      pushError(issues, "dnd5e.standard-array.values", "Standard Array must use 15, 14, 13, 12, 10, and 8 exactly once.", "abilities.base");
    }
  } else if (generationMethod === "manual") {
    validateRangeBase(base, issues, "manual", "Manual", 3, 18);
  } else if (generationMethod === "point-cost") {
    validatePointCostBase(base, issues);
  } else if (generationMethod === "random") {
    validateRangeBase(base, issues, "random", "Random Generation", 3, 18);
  } else {
    pushError(issues, "dnd5e.slice.ability-method", "This slice supports Standard Array, Manual ability entry, Point Cost, and Random Generation.", "abilities.generationMethod");
  }

  const increaseValues = Object.fromEntries(
    DND5E_ABILITY_IDS.map((abilityId) => [abilityId, readNumber(increases, abilityId) ?? 0]),
  ) as Record<Dnd5eAbilityId, number>;
  const allowedSoldierAbilities = new Set<Dnd5eAbilityId>(["strength", "dexterity", "constitution"]);
  const nonZeroIncreases = DND5E_ABILITY_IDS.filter((abilityId) => increaseValues[abilityId] !== 0);
  const sortedIncreases = nonZeroIncreases.map((abilityId) => increaseValues[abilityId]).sort((left, right) => right - left);
  const isTwoPlusOne = sortedIncreases.length === 2 && sortedIncreases[0] === 2 && sortedIncreases[1] === 1;
  const isThreeOnes = sortedIncreases.length === 3 && sortedIncreases.every((increase) => increase === 1);
  if (nonZeroIncreases.some((abilityId) => !allowedSoldierAbilities.has(abilityId)) || (!isTwoPlusOne && !isThreeOnes)) {
    pushError(issues, "dnd5e.soldier.ability-increases", "Soldier ability increases must use +2/+1 on two different Strength, Dexterity, or Constitution scores, or +1 on all three.", "abilities.backgroundIncreases");
  }
}

interface LevelOneSliceParts {
  origin: JsonObject | undefined;
  classState: JsonObject | undefined;
  resources: JsonObject | undefined;
  finalAbilities: JsonObject | undefined;
  derived: JsonObject | undefined;
}

function validateLevelOneIdentityAndSoldier(
  payload: JsonObject,
  issues: RulesValidationIssue[],
): LevelOneSliceParts {
  const identity = readObject(payload, "identity");
  const origin = readObject(payload, "origin");
  const classState = readObject(payload, "class");
  const resources = readObject(payload, "resources");
  const derived = readObject(payload, "derived");
  const abilities = readObject(payload, "abilities");
  const finalAbilities = abilities ? readObject(abilities, "final") : undefined;

  if (identity && (readNumber(identity, "level") !== 1 || readNumber(identity, "experiencePoints") !== 0)) {
    pushError(issues, "dnd5e.level-one.identity", "The current D&D generation slice requires a Level 1 character with 0 XP.", "identity");
  }
  if (origin && readString(origin, "backgroundId") !== "soldier") {
    pushError(issues, "dnd5e.slice.background", "The current guided slice still uses the Soldier background.", "origin.backgroundId");
  }
  if (classState && readNumber(classState, "proficiencyBonus") !== 2) {
    pushError(issues, "dnd5e.proficiency.level-one", "A Level 1 character must have a +2 Proficiency Bonus.", "class.proficiencyBonus");
  }
  return { origin, classState, resources, finalAbilities, derived };
}

function validateLegacyFirstSliceRules(payload: JsonObject, issues: RulesValidationIssue[]): void {
  const { origin, classState, resources, finalAbilities } = validateLevelOneIdentityAndSoldier(payload, issues);
  if (!origin || !classState || !resources || !finalAbilities) return;

  if (readString(origin, "speciesId") !== "human") {
    pushError(issues, "dnd5e.slice.species", "The legacy first slice uses the Human species.", "origin.speciesId");
  }
  if (readString(classState, "classId") !== "fighter" || readNumber(classState, "level") !== 1) {
    pushError(issues, "dnd5e.slice.class", "The legacy first slice requires Fighter 1.", "class");
  }
  const constitution = readNumber(finalAbilities, "constitution");
  const hpMaximum = readNumber(resources, "hitPointsMaximum");
  if (constitution !== undefined && hpMaximum !== undefined) {
    const expectedHp = 10 + abilityModifier(constitution);
    if (hpMaximum !== expectedHp) {
      pushError(issues, "dnd5e.fighter.level-one-hp", `A Level 1 Fighter with Constitution ${constitution} must have ${expectedHp} maximum Hit Points.`, "resources.hitPointsMaximum");
    }
  }
}

const GUIDED_CLASS_HIT_DIE: Record<GuidedDnd5eClassId, number> = {
  barbarian: 12,
  fighter: 10,
  monk: 8,
  rogue: 8,
};

const GUIDED_SPECIES_SIZE: Record<GuidedDnd5eSpeciesId, "small" | "medium"> = {
  dwarf: "medium",
  halfling: "small",
  human: "medium",
  orc: "medium",
};

function validateGuidedFirstSliceRules(payload: JsonObject, issues: RulesValidationIssue[]): void {
  const { origin, classState, resources, finalAbilities, derived } = validateLevelOneIdentityAndSoldier(payload, issues);
  if (!origin || !classState || !resources || !finalAbilities || !derived) return;

  const classId = readString(classState, "classId");
  const speciesId = readString(origin, "speciesId");
  if (!classId || !isGuidedDnd5eClassId(classId)) {
    pushError(issues, "dnd5e.guided.class", "Guided generation currently supports Barbarian, Fighter, Monk, and Rogue.", "class.classId");
    return;
  }
  if (!speciesId || !isGuidedDnd5eSpeciesId(speciesId)) {
    pushError(issues, "dnd5e.guided.species", "Guided generation currently supports Dwarf, Halfling, Human, and Orc.", "origin.speciesId");
    return;
  }
  if (readNumber(classState, "level") !== 1 || readNumber(classState, "hitDie") !== GUIDED_CLASS_HIT_DIE[classId]) {
    pushError(issues, "dnd5e.guided.class-core", `Level 1 ${classId} must retain its SRD Hit Die and level.`, "class");
  }
  if (readString(origin, "size") !== GUIDED_SPECIES_SIZE[speciesId] || readNumber(origin, "speedFeet") !== 30) {
    pushError(issues, "dnd5e.guided.species-core", `${speciesId} size and Speed must match the current SRD guided profile.`, "origin");
  }

  const constitution = readNumber(finalAbilities, "constitution");
  const dexterity = readNumber(finalAbilities, "dexterity");
  const wisdom = readNumber(finalAbilities, "wisdom");
  if (constitution === undefined || dexterity === undefined || wisdom === undefined) return;

  const speciesHpBonus = speciesId === "dwarf" ? 1 : 0;
  const expectedHp = GUIDED_CLASS_HIT_DIE[classId] + abilityModifier(constitution) + speciesHpBonus;
  if (readNumber(resources, "hitPointsMaximum") !== expectedHp || readNumber(resources, "hitPointsCurrent") !== expectedHp) {
    pushError(issues, "dnd5e.guided.level-one-hp", `Level 1 ${classId} ${speciesId} must have ${expectedHp} Hit Points for this generated state.`, "resources.hitPointsMaximum");
  }

  const expectedArmorClass = classId === "fighter"
    ? 17
    : classId === "barbarian"
      ? 10 + abilityModifier(dexterity) + abilityModifier(constitution)
      : classId === "monk"
        ? 10 + abilityModifier(dexterity) + abilityModifier(wisdom)
        : 11 + abilityModifier(dexterity);
  if (readNumber(derived, "armorClass") !== expectedArmorClass) {
    pushError(issues, "dnd5e.guided.armor-class", `Generated ${classId} Armor Class must be ${expectedArmorClass}.`, "derived.armorClass");
  }

  const hasAlert = speciesId === "human" && readString(origin, "speciesOriginFeatId") === "alert";
  const expectedInitiative = abilityModifier(dexterity) + (hasAlert ? 2 : 0);
  if (readNumber(derived, "initiativeModifier") !== expectedInitiative) {
    pushError(issues, "dnd5e.guided.initiative", `Generated Initiative must be ${expectedInitiative}.`, "derived.initiativeModifier");
  }

  const classSkills = readStringArray(classState, "skillProficiencies");
  const speciesSkill = readString(origin, "speciesSkillId");
  const perceptionProficient = classSkills.includes("perception") || speciesSkill === "perception";
  const expectedPassive = 10 + abilityModifier(wisdom) + (perceptionProficient ? 2 : 0);
  if (readNumber(derived, "passivePerception") !== expectedPassive) {
    pushError(issues, "dnd5e.guided.passive-perception", `Generated Passive Perception must be ${expectedPassive}.`, "derived.passivePerception");
  }

  if (classId === "fighter" && (readNumber(resources, "secondWindMaximum") !== 2 || readNumber(resources, "secondWindCurrent") !== 2)) {
    pushError(issues, "dnd5e.fighter.second-wind", "Level 1 Fighter must retain two Second Wind uses.", "resources");
  }
  if (classId === "barbarian" && (readNumber(resources, "rageMaximum") !== 2 || readNumber(resources, "rageCurrent") !== 2 || readNumber(resources, "rageDamageBonus") !== 2)) {
    pushError(issues, "dnd5e.barbarian.rage", "Level 1 Barbarian must retain two Rage uses and +2 Rage Damage.", "resources");
  }
  if (speciesId === "dwarf" && (readNumber(resources, "stonecunningMaximum") !== 2 || readNumber(resources, "stonecunningCurrent") !== 2)) {
    pushError(issues, "dnd5e.dwarf.stonecunning", "Level 1 Dwarf must retain two Stonecunning uses at Proficiency Bonus +2.", "resources");
  }
  if (speciesId === "orc" && (readNumber(resources, "adrenalineRushMaximum") !== 2 || readNumber(resources, "relentlessEnduranceMaximum") !== 1)) {
    pushError(issues, "dnd5e.orc.resources", "Level 1 Orc must retain two Adrenaline Rush uses and one Relentless Endurance use.", "resources");
  }
}

export const dnd5eSrd521Adapter: RulesSystemAdapter = {
  adapterId: "character-forge:dnd5e-2024",
  adapterVersion: "0.5.0",
  systemId: "dnd5e",
  editionId: "2024",
  supportedRulesSources: [DND5E_SRD_5_2_1_SOURCE],

  validateNativeState(state: NativeSystemState): RulesValidationResult {
    const issues: RulesValidationIssue[] = [];
    if (state.systemId !== this.systemId) pushError(issues, "adapter.system-mismatch", `Expected system ${this.systemId}.`, "systemId");
    if (state.editionId !== this.editionId) pushError(issues, "adapter.edition-mismatch", `Expected edition ${this.editionId}.`, "editionId");
    if (state.rulesVersion !== DND5E_SRD_5_2_1_SOURCE.version) pushError(issues, "adapter.rules-version", "This adapter slice currently supports SRD 5.2.1 only.", "rulesVersion");
    if (state.schemaVersion !== "dnd5e-character/0.1" && state.schemaVersion !== "dnd5e-character/0.2") {
      pushError(issues, "adapter.schema-version", "Unsupported D&D native schema version.", "schemaVersion");
    }
    if (!isJsonObject(state.payload)) {
      pushError(issues, "dnd5e.payload.object", "D&D native payload must be a JSON object.", "payload");
      return { valid: false, issues };
    }

    const payload = state.payload;
    const rulesSourceIds = payload.rulesSourceIds;
    if (!Array.isArray(rulesSourceIds) || !rulesSourceIds.includes(DND5E_SRD_5_2_1_SOURCE.id)) {
      pushError(issues, "dnd5e.rules-source.missing", "Native state must retain the SRD 5.2.1 rules-source identifier.", "payload.rulesSourceIds");
    }

    validateAbilityState(payload, issues);
    validateAbilityMethodAndSoldierBoosts(payload, issues);
    if (state.schemaVersion === "dnd5e-character/0.2") validateGuidedFirstSliceRules(payload, issues);
    else validateLegacyFirstSliceRules(payload, issues);

    return { valid: !issues.some((issue) => issue.severity === "error"), issues };
  },
};
