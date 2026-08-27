import type { JsonObject, NativeSystemState, RulesValidationIssue, RulesValidationResult } from "../../character-model/src/index.js";
import { DND5E_POINT_COST_BUDGET, DND5E_POINT_COSTS } from "./abilityGeneration.js";
import { assertGuidedDnd5eCoreChoices } from "./guidedCoreValidation.js";
import type { GuidedDnd5eCoreChoices } from "./guidedChoices.js";
import { abilityModifier, DND5E_ABILITY_IDS, type Dnd5eAbilityId } from "./nativeCharacter.js";
import {
  DND5E_SRD_521_BACKGROUND_OPTIONS,
  isGuidedDnd5eBackgroundId,
  isGuidedDnd5eClassId,
  isGuidedDnd5eSpeciesId,
  type GuidedDnd5eBackgroundId,
  type GuidedDnd5eClassId,
  type GuidedDnd5eSpeciesId,
} from "./srdCatalog.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";

const HIT_DIE: Record<GuidedDnd5eClassId, number> = { barbarian: 12, fighter: 10, monk: 8, rogue: 8 };
const BACKGROUND_EXPECTED: Record<GuidedDnd5eBackgroundId, { feat: string; skills: readonly string[]; tool: string }> = {
  criminal: { feat: "alert", skills: ["sleight-of-hand", "stealth"], tool: "thieves-tools" },
  soldier: { feat: "savage-attacker", skills: ["athletics", "intimidation"], tool: "gaming-set:dice" },
};

export function validateGuidedCoreNativeState(state: NativeSystemState): RulesValidationResult {
  const issues: RulesValidationIssue[] = [];
  if (state.systemId !== "dnd5e") error(issues, "adapter.system-mismatch", "Expected system dnd5e.", "systemId");
  if (state.editionId !== "2024") error(issues, "adapter.edition-mismatch", "Expected edition 2024.", "editionId");
  if (state.rulesVersion !== DND5E_SRD_5_2_1_SOURCE.version) error(issues, "adapter.rules-version", "This adapter supports SRD 5.2.1.", "rulesVersion");
  if (state.schemaVersion !== "dnd5e-character/0.3") error(issues, "adapter.schema-version", "Unsupported D&D native schema version.", "schemaVersion");
  if (!isObject(state.payload)) {
    error(issues, "dnd5e.payload.object", "D&D native payload must be an object.", "payload");
    return { valid: false, issues };
  }
  const payload = state.payload;
  if (!readStrings(payload, "rulesSourceIds").includes(DND5E_SRD_5_2_1_SOURCE.id)) {
    error(issues, "dnd5e.rules-source.missing", "Native state must retain SRD 5.2.1 provenance.", "rulesSourceIds");
  }

  const identity = readObject(payload, "identity");
  const origin = readObject(payload, "origin");
  const classState = readObject(payload, "class");
  const resources = readObject(payload, "resources");
  const derived = readObject(payload, "derived");
  const abilities = readObject(payload, "abilities");
  if (!identity || !origin || !classState || !resources || !derived || !abilities) {
    error(issues, "dnd5e.guided.shape", "Guided native state requires identity, origin, class, abilities, resources, and derived state.");
    return { valid: false, issues };
  }
  if (readNumber(identity, "level") !== 1 || readNumber(identity, "experiencePoints") !== 0) {
    error(issues, "dnd5e.level-one.identity", "Guided generation requires Level 1 and 0 XP.", "identity");
  }
  if (readNumber(classState, "proficiencyBonus") !== 2) error(issues, "dnd5e.proficiency.level-one", "Level 1 Proficiency Bonus must be +2.", "class.proficiencyBonus");

  const classId = readString(classState, "classId");
  const backgroundId = readString(origin, "backgroundId");
  const speciesId = readString(origin, "speciesId");
  if (!classId || !isGuidedDnd5eClassId(classId)) error(issues, "dnd5e.guided.class", "Unsupported guided class.", "class.classId");
  if (!backgroundId || !isGuidedDnd5eBackgroundId(backgroundId)) error(issues, "dnd5e.guided.background", "Unsupported guided background.", "origin.backgroundId");
  if (!speciesId || !isGuidedDnd5eSpeciesId(speciesId)) error(issues, "dnd5e.guided.species", "Unsupported guided species.", "origin.speciesId");
  if (!classId || !backgroundId || !speciesId || !isGuidedDnd5eClassId(classId) || !isGuidedDnd5eBackgroundId(backgroundId) || !isGuidedDnd5eSpeciesId(speciesId)) {
    return { valid: false, issues };
  }

  validateAbilities(abilities, origin, issues);
  validateBackground(origin, backgroundId, issues);

  const coreChoices = reconstructCoreChoices(identity, origin, classState, classId, speciesId, issues);
  if (coreChoices) {
    try {
      assertGuidedDnd5eCoreChoices(classId, backgroundId, speciesId, coreChoices);
    } catch (caught) {
      error(issues, "dnd5e.guided.core-choices", caught instanceof Error ? caught.message : "Invalid guided core choices.", "class");
    }
  }

  const final = readObject(abilities, "final");
  if (final) validateDerivedAndResources(origin, classState, resources, derived, final, classId, backgroundId, speciesId, issues);
  return { valid: !issues.some((issue) => issue.severity === "error"), issues };
}

function validateAbilities(abilities: JsonObject, origin: JsonObject, issues: RulesValidationIssue[]): void {
  const base = readObject(abilities, "base");
  const increases = readObject(abilities, "backgroundIncreases");
  const final = readObject(abilities, "final");
  if (!base || !increases || !final) {
    error(issues, "dnd5e.abilities.shape", "Base, background increases, and final ability scores are required.", "abilities");
    return;
  }
  for (const id of DND5E_ABILITY_IDS) {
    const b = readNumber(base, id); const inc = readNumber(increases, id); const f = readNumber(final, id);
    if (b === undefined || inc === undefined || f === undefined || f !== b + inc || !Number.isInteger(f) || f < 1 || f > 20) {
      error(issues, "dnd5e.abilities.value", `Invalid ${id} base/increase/final relationship.`, `abilities.${id}`);
    }
  }
  const method = readString(abilities, "generationMethod");
  if (method === "standard-array") {
    const scores = DND5E_ABILITY_IDS.map((id) => readNumber(base, id)).filter((value): value is number => value !== undefined).sort((a, b) => b - a);
    if (scores.join(",") !== "15,14,13,12,10,8") error(issues, "dnd5e.standard-array.values", "Standard Array must use 15,14,13,12,10,8 exactly once.", "abilities.base");
  } else if (method === "manual" || method === "random") {
    for (const id of DND5E_ABILITY_IDS) {
      const score = readNumber(base, id);
      if (score === undefined || !Number.isInteger(score) || score < 3 || score > 18) error(issues, `dnd5e.${method}.base-range`, `${method} base scores must be 3 through 18.`, `abilities.base.${id}`);
    }
  } else if (method === "point-cost") {
    let spent = 0;
    for (const id of DND5E_ABILITY_IDS) {
      const score = readNumber(base, id); const cost = score === undefined ? undefined : DND5E_POINT_COSTS[score];
      if (cost === undefined) error(issues, "dnd5e.point-cost.base-range", "Point Cost scores must be 8 through 15.", `abilities.base.${id}`);
      else spent += cost;
    }
    if (spent > DND5E_POINT_COST_BUDGET) error(issues, "dnd5e.point-cost.budget", "Point Cost exceeds the 27-point budget.", "abilities.base");
  } else {
    error(issues, "dnd5e.slice.ability-method", "Unsupported ability-generation method.", "abilities.generationMethod");
  }

  const backgroundId = readString(origin, "backgroundId");
  const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((option) => option.id === backgroundId);
  if (!background) return;
  const values = Object.fromEntries(DND5E_ABILITY_IDS.map((id) => [id, readNumber(increases, id) ?? 0])) as Record<Dnd5eAbilityId, number>;
  const nonZero = DND5E_ABILITY_IDS.filter((id) => values[id] !== 0);
  const pattern = nonZero.map((id) => values[id]).sort((a, b) => b - a);
  const legal = (pattern.length === 2 && pattern[0] === 2 && pattern[1] === 1) || (pattern.length === 3 && pattern.every((value) => value === 1));
  if (!legal || nonZero.some((id) => !background.abilityScoreIds.includes(id))) {
    error(issues, "dnd5e.background.ability-increases", `${background.label} ability increases are invalid.`, "abilities.backgroundIncreases");
  }
}

function validateBackground(origin: JsonObject, backgroundId: GuidedDnd5eBackgroundId, issues: RulesValidationIssue[]): void {
  const expected = BACKGROUND_EXPECTED[backgroundId];
  if (readString(origin, "backgroundOriginFeatId") !== expected.feat) error(issues, "dnd5e.guided.background-feat", "Background Origin feat mismatch.", "origin.backgroundOriginFeatId");
  if (!sameSet(readStrings(origin, "backgroundSkillProficiencies"), expected.skills)) error(issues, "dnd5e.guided.background-skills", "Background skill proficiencies mismatch.", "origin.backgroundSkillProficiencies");
  if (readString(origin, "toolProficiencyId") !== expected.tool) error(issues, "dnd5e.guided.background-tool", "Background tool proficiency mismatch.", "origin.toolProficiencyId");
  const equipment = readString(origin, "backgroundEquipmentChoice");
  if (equipment !== "A" && equipment !== "B:50-gp") error(issues, "dnd5e.guided.background-equipment", "Background equipment choice must be package A or 50 GP.", "origin.backgroundEquipmentChoice");
}

function reconstructCoreChoices(
  identity: JsonObject,
  origin: JsonObject,
  classState: JsonObject,
  classId: GuidedDnd5eClassId,
  speciesId: GuidedDnd5eSpeciesId,
  issues: RulesValidationIssue[],
): GuidedDnd5eCoreChoices | undefined {
  const languages = readStrings(origin, "languages");
  if (languages.length !== 3 || languages[0] !== "common" || !languages[1] || !languages[2]) {
    error(issues, "dnd5e.guided.origin-languages", "Origin languages must be Common plus two standard languages.", "origin.languages");
    return undefined;
  }
  const alignmentId = readString(identity, "alignment");
  const classEquipmentChoice = readString(classState, "classEquipmentChoice");
  if (!alignmentId || !classEquipmentChoice) return undefined;
  const choices: GuidedDnd5eCoreChoices = {
    alignmentId,
    originLanguageIds: [languages[1], languages[2]],
    classSkillIds: readStrings(classState, "skillProficiencies"),
    classEquipmentChoice,
    weaponMasteryIds: readStrings(classState, "weaponMasteryIds"),
  };
  const style = readString(classState, "fightingStyleFeatId"); if (style) choices.fightingStyleFeatId = style;
  if (classId === "monk") {
    const tool = readStrings(classState, "toolProficiencyIds")[0]; if (tool) choices.monkToolProficiencyId = tool;
  }
  if (classId === "rogue") {
    choices.expertiseSkillIds = readStrings(classState, "expertiseSkillIds");
    const bonusLanguages = readStrings(classState, "bonusLanguageIds");
    const bonus = bonusLanguages.find((id) => id !== "thieves-cant"); if (bonus) choices.rogueBonusLanguageId = bonus;
  }
  if (speciesId === "human") {
    const size = readString(origin, "size"); const skillId = readString(origin, "speciesSkillId"); const feat = readString(origin, "speciesOriginFeatId");
    if ((size === "small" || size === "medium") && skillId && (feat === "alert" || feat === "savage-attacker" || feat === "skilled")) {
      choices.human = {
        size, skillId, originFeatId: feat,
        ...(feat === "skilled" ? { skilledProficiencyIds: readStrings(origin, "speciesOriginFeatProficiencyIds") } : {}),
      };
    }
  }
  return choices;
}

function validateDerivedAndResources(
  origin: JsonObject, classState: JsonObject, resources: JsonObject, derived: JsonObject, final: JsonObject,
  classId: GuidedDnd5eClassId, backgroundId: GuidedDnd5eBackgroundId, speciesId: GuidedDnd5eSpeciesId,
  issues: RulesValidationIssue[],
): void {
  const con = readNumber(final, "constitution"); const dex = readNumber(final, "dexterity"); const wis = readNumber(final, "wisdom");
  if (con === undefined || dex === undefined || wis === undefined) return;
  if (readNumber(classState, "hitDie") !== HIT_DIE[classId]) error(issues, "dnd5e.guided.class-core", "Class Hit Die mismatch.", "class.hitDie");
  const hp = HIT_DIE[classId] + abilityModifier(con) + (speciesId === "dwarf" ? 1 : 0);
  if (readNumber(resources, "hitPointsMaximum") !== hp || readNumber(resources, "hitPointsCurrent") !== hp) error(issues, "dnd5e.guided.level-one-hp", "Level 1 Hit Points mismatch.", "resources");
  const equipmentChoice = readString(classState, "classEquipmentChoice") ?? "";
  const style = readString(classState, "fightingStyleFeatId");
  const expectedAc = classId === "barbarian" ? 10 + abilityModifier(dex) + abilityModifier(con)
    : classId === "monk" ? 10 + abilityModifier(dex) + abilityModifier(wis)
      : classId === "rogue" ? (equipmentChoice === "A" ? 11 : 10) + abilityModifier(dex)
        : equipmentChoice === "A" ? 16 + (style === "defense" ? 1 : 0)
          : equipmentChoice === "B" ? 12 + abilityModifier(dex) + (style === "defense" ? 1 : 0)
            : 10 + abilityModifier(dex);
  if (readNumber(derived, "armorClass") !== expectedAc) error(issues, "dnd5e.guided.armor-class", "Armor Class does not match equipment and abilities.", "derived.armorClass");
  const alert = BACKGROUND_EXPECTED[backgroundId].feat === "alert" || readString(origin, "speciesOriginFeatId") === "alert";
  const initiative = abilityModifier(dex) + (alert ? 2 : 0);
  if (readNumber(derived, "initiativeModifier") !== initiative) error(issues, "dnd5e.guided.initiative", "Initiative does not match Dexterity and Alert proficiency.", "derived.initiativeModifier");
  const allSkills = new Set([
    ...readStrings(classState, "skillProficiencies"), ...readStrings(origin, "backgroundSkillProficiencies"),
    ...(readString(origin, "speciesSkillId") ? [readString(origin, "speciesSkillId")!] : []),
    ...readStrings(origin, "speciesOriginFeatProficiencyIds"),
  ]);
  const passive = 10 + abilityModifier(wis) + (allSkills.has("perception") ? 2 : 0);
  if (readNumber(derived, "passivePerception") !== passive) error(issues, "dnd5e.guided.passive-perception", "Passive Perception mismatch.", "derived.passivePerception");
  if (classId === "fighter" && (readNumber(resources, "secondWindMaximum") !== 2 || readNumber(resources, "secondWindCurrent") !== 2)) error(issues, "dnd5e.fighter.second-wind", "Fighter requires two Second Wind uses.", "resources");
  if (classId === "barbarian" && (readNumber(resources, "rageMaximum") !== 2 || readNumber(resources, "rageCurrent") !== 2 || readNumber(resources, "rageDamageBonus") !== 2)) error(issues, "dnd5e.barbarian.rage", "Barbarian Rage resources mismatch.", "resources");
  if (speciesId === "dwarf" && (readNumber(resources, "stonecunningMaximum") !== 2 || readNumber(resources, "stonecunningCurrent") !== 2)) error(issues, "dnd5e.dwarf.stonecunning", "Dwarf Stonecunning resources mismatch.", "resources");
  if (speciesId === "orc" && (readNumber(resources, "adrenalineRushMaximum") !== 2 || readNumber(resources, "relentlessEnduranceMaximum") !== 1)) error(issues, "dnd5e.orc.resources", "Orc resources mismatch.", "resources");
}

function isObject(value: unknown): value is JsonObject { return typeof value === "object" && value !== null && !Array.isArray(value); }
function readObject(object: JsonObject, key: string): JsonObject | undefined { const value = object[key]; return isObject(value) ? value : undefined; }
function readString(object: JsonObject, key: string): string | undefined { const value = object[key]; return typeof value === "string" ? value : undefined; }
function readNumber(object: JsonObject, key: string): number | undefined { const value = object[key]; return typeof value === "number" ? value : undefined; }
function readStrings(object: JsonObject, key: string): string[] { const value = object[key]; return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : []; }
function sameSet(left: readonly string[], right: readonly string[]): boolean { return left.length === right.length && left.every((value) => right.includes(value)); }
function error(issues: RulesValidationIssue[], code: string, message: string, path?: string): void {
  issues.push({ code, message, severity: "error", ...(path ? { path } : {}) });
}
