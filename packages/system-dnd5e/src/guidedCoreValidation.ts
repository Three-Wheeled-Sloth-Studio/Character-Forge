import {
  DND5E_ALIGNMENT_OPTIONS,
  DND5E_BONUS_LANGUAGE_OPTIONS,
  DND5E_DRAGONBORN_ANCESTRY_OPTIONS,
  DND5E_FIGHTING_STYLE_OPTIONS,
  DND5E_GOLIATH_ANCESTRY_OPTIONS,
  DND5E_GUIDED_CLASS_CHOICE_RULES,
  DND5E_HUMAN_ORIGIN_FEAT_OPTIONS,
  DND5E_MONK_TOOL_OPTIONS,
  DND5E_SKILL_OPTIONS,
  DND5E_SKILLED_PROFICIENCY_OPTIONS,
  DND5E_SPELLCASTING_ABILITY_OPTIONS,
  DND5E_STANDARD_LANGUAGE_OPTIONS,
  type GuidedDnd5eCoreChoices,
} from "./guidedChoices.js";
import {
  clericCantripCount,
  DND5E_CLERIC_CANTRIP_OPTIONS,
  DND5E_CLERIC_DIVINE_ORDER_OPTIONS,
  DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS,
} from "./clericCatalog.js";
import { magicInitiateSpellList, type Dnd5eMagicInitiateSpellListId } from "./spellCatalog.js";
import { DND5E_SRD_521_BACKGROUND_OPTIONS, type GuidedDnd5eBackgroundId, type GuidedDnd5eClassId, type GuidedDnd5eSpeciesId } from "./srdCatalog.js";

export function assertGuidedDnd5eCoreChoices(
  classId: GuidedDnd5eClassId,
  backgroundId: GuidedDnd5eBackgroundId,
  speciesId: GuidedDnd5eSpeciesId,
  choices: GuidedDnd5eCoreChoices,
): void {
  assertOneOf(choices.alignmentId, DND5E_ALIGNMENT_OPTIONS.map((option) => option.id), "alignment");
  assertExactUnique(choices.originLanguageIds, 2, "origin languages");
  for (const languageId of choices.originLanguageIds) {
    assertOneOf(languageId, DND5E_STANDARD_LANGUAGE_OPTIONS.map((option) => option.id), "origin language");
  }

  const classRules = DND5E_GUIDED_CLASS_CHOICE_RULES[classId];
  const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((option) => option.id === backgroundId);
  if (!background) throw new Error(`Unknown guided background ${backgroundId}.`);

  assertExactUnique(choices.classSkillIds, classRules.skillCount, `${classId} class skills`);
  for (const skillId of choices.classSkillIds) assertOneOf(skillId, classRules.skillIds, `${classId} class skill`);
  if (choices.classSkillIds.some((skillId) => background.skillProficiencies.includes(skillId))) {
    throw new Error("Class skill choices must not duplicate a background-granted skill proficiency.");
  }

  assertOneOf(choices.classEquipmentChoice, classRules.equipmentChoices.map((option) => option.id), `${classId} starting equipment`);
  assertExactUnique(choices.weaponMasteryIds, classRules.weaponMasteryCount, `${classId} Weapon Mastery choices`);
  for (const weaponId of choices.weaponMasteryIds) assertOneOf(weaponId, classRules.weaponMasteryIds, `${classId} mastery weapon`);

  assertClericChoices(classId, choices);

  if (classId === "fighter") {
    if (!choices.fightingStyleFeatId) throw new Error("Fighter requires a Fighting Style choice.");
    assertOneOf(choices.fightingStyleFeatId, DND5E_FIGHTING_STYLE_OPTIONS.map((option) => option.id), "Fighting Style");
  } else if (choices.fightingStyleFeatId) {
    throw new Error("Only the current Fighter slice has a Level 1 Fighting Style choice.");
  }

  if (classId === "monk") {
    if (!choices.monkToolProficiencyId) throw new Error("Monk requires one Artisan's Tools or Musical Instrument proficiency.");
    assertOneOf(choices.monkToolProficiencyId, DND5E_MONK_TOOL_OPTIONS.map((option) => option.id), "Monk tool proficiency");
  } else if (choices.monkToolProficiencyId) {
    throw new Error("Only Monk uses the current Level 1 tool-choice slot.");
  }

  if (classId === "rogue") {
    const expertiseIds = choices.expertiseSkillIds ?? [];
    assertExactUnique(expertiseIds, 2, "Rogue Expertise choices");
    const laterSkills = new Set<string>([
      ...choices.classSkillIds,
      ...background.skillProficiencies,
      ...(speciesId === "human" && choices.human ? [choices.human.skillId] : []),
      ...(speciesId === "human" && choices.human?.originFeatId === "skilled"
        ? (choices.human.skilledProficiencyIds ?? []).filter((id) => DND5E_SKILL_OPTIONS.some((option) => option.id === id))
        : []),
    ]);
    if (expertiseIds.some((id) => !laterSkills.has(id))) {
      throw new Error("Rogue Expertise choices must be skills in which the character is proficient.");
    }
    if (!choices.rogueBonusLanguageId) throw new Error("Rogue Thieves' Cant requires one additional language choice.");
    assertOneOf(choices.rogueBonusLanguageId, DND5E_BONUS_LANGUAGE_OPTIONS.map((option) => option.id), "Rogue bonus language");
  } else if (choices.expertiseSkillIds?.length || choices.rogueBonusLanguageId) {
    throw new Error("Rogue-only Expertise/language choices were supplied to another class.");
  }

  assertMagicInitiate(backgroundId, choices);

  if (speciesId === "dragonborn") {
    if (!choices.dragonbornAncestryId) throw new Error("Dragonborn requires a Draconic Ancestry choice.");
    assertOneOf(choices.dragonbornAncestryId, DND5E_DRAGONBORN_ANCESTRY_OPTIONS.map((option) => option.id), "Draconic Ancestry");
  } else if (choices.dragonbornAncestryId) {
    throw new Error("Dragonborn-only ancestry was supplied to another species.");
  }

  if (speciesId === "goliath") {
    if (!choices.goliathAncestryId) throw new Error("Goliath requires a Giant Ancestry choice.");
    assertOneOf(choices.goliathAncestryId, DND5E_GOLIATH_ANCESTRY_OPTIONS.map((option) => option.id), "Giant Ancestry");
  } else if (choices.goliathAncestryId) {
    throw new Error("Goliath-only ancestry was supplied to another species.");
  }

  if (speciesId === "human") {
    if (!choices.human) throw new Error("Human requires size, Skillful, and Versatile choices.");
    if (choices.human.size !== "small" && choices.human.size !== "medium") throw new Error("Human size must be Small or Medium.");
    assertOneOf(choices.human.skillId, DND5E_SKILL_OPTIONS.map((option) => option.id), "Human Skillful proficiency");
    const alreadySkilled = new Set([...choices.classSkillIds, ...background.skillProficiencies]);
    if (alreadySkilled.has(choices.human.skillId)) throw new Error("Human Skillful must add a skill proficiency the character does not already have.");
    assertOneOf(choices.human.originFeatId, DND5E_HUMAN_ORIGIN_FEAT_OPTIONS.filter((option) => option.supported).map((option) => option.id), "Human Versatile Origin feat");
    if (choices.human.originFeatId === background.originFeatId && choices.human.originFeatId !== "skilled") {
      throw new Error("Human Versatile must not duplicate the non-repeatable Origin feat granted by the background.");
    }
    const skilledIds = choices.human.skilledProficiencyIds ?? [];
    if (choices.human.originFeatId === "skilled") {
      assertExactUnique(skilledIds, 3, "Skilled feat proficiencies");
      for (const id of skilledIds) assertOneOf(id, DND5E_SKILLED_PROFICIENCY_OPTIONS.map((option) => option.id), "Skilled proficiency");
    } else if (skilledIds.length) {
      throw new Error("Skilled proficiency choices require the Skilled Origin feat.");
    }
  } else if (choices.human) {
    throw new Error("Human-only choices were supplied to a non-Human character.");
  }
}

function assertClericChoices(classId: GuidedDnd5eClassId, choices: GuidedDnd5eCoreChoices): void {
  if (classId !== "cleric") {
    if (choices.cleric) throw new Error("Cleric-only choices were supplied to another class.");
    return;
  }
  const cleric = choices.cleric;
  if (!cleric) throw new Error("Cleric requires Divine Order and spell choices.");
  assertOneOf(cleric.divineOrderId, DND5E_CLERIC_DIVINE_ORDER_OPTIONS.map((option) => option.id), "Cleric Divine Order");
  const cantripCount = clericCantripCount(cleric.divineOrderId);
  assertExactUnique(cleric.cantripIds, cantripCount, "Cleric cantrips");
  for (const spellId of cleric.cantripIds) assertOneOf(spellId, DND5E_CLERIC_CANTRIP_OPTIONS.map((option) => option.id), "Cleric cantrip");
  assertExactUnique(cleric.preparedSpellIds, 4, "Cleric prepared spells");
  for (const spellId of cleric.preparedSpellIds) assertOneOf(spellId, DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS.map((option) => option.id), "Cleric level 1 spell");
}

function assertMagicInitiate(backgroundId: GuidedDnd5eBackgroundId, choices: GuidedDnd5eCoreChoices): void {
  const requiredListId: Dnd5eMagicInitiateSpellListId | undefined = backgroundId === "acolyte" ? "cleric" : backgroundId === "sage" ? "wizard" : undefined;
  if (!requiredListId) {
    if (choices.magicInitiate) throw new Error("Magic Initiate choices were supplied to a background that does not grant Magic Initiate.");
    return;
  }
  const selection = choices.magicInitiate;
  if (!selection) throw new Error(`${backgroundId} requires Magic Initiate spell choices.`);
  if (selection.spellListId !== requiredListId) throw new Error(`${backgroundId} must use the ${requiredListId} Magic Initiate spell list.`);
  assertOneOf(selection.spellcastingAbilityId, DND5E_SPELLCASTING_ABILITY_OPTIONS.map((option) => option.id), "Magic Initiate spellcasting ability");
  const list = magicInitiateSpellList(requiredListId);
  assertExactUnique(selection.cantripIds, 2, "Magic Initiate cantrips");
  for (const spellId of selection.cantripIds) assertOneOf(spellId, list.cantrips.map((option) => option.id), `${list.label} cantrip`);
  assertOneOf(selection.levelOneSpellId, list.levelOneSpells.map((option) => option.id), `${list.label} level 1 spell`);
}

function assertOneOf(value: string, allowed: readonly string[], label: string): void {
  if (!allowed.includes(value)) throw new Error(`Choose a supported ${label}.`);
}

function assertExactUnique(values: readonly string[], expected: number, label: string): void {
  if (values.length !== expected || new Set(values).size !== expected) {
    throw new Error(`${label} require exactly ${expected} distinct choice${expected === 1 ? "" : "s"}.`);
  }
}
