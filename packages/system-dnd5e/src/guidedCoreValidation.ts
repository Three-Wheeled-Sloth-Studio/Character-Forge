import {
  DND5E_ALIGNMENT_OPTIONS, DND5E_BONUS_LANGUAGE_OPTIONS, DND5E_DRAGONBORN_ANCESTRY_OPTIONS,
  DND5E_FIGHTING_STYLE_OPTIONS, DND5E_GOLIATH_ANCESTRY_OPTIONS, DND5E_GUIDED_CLASS_CHOICE_RULES,
  DND5E_HUMAN_ORIGIN_FEAT_OPTIONS, DND5E_MONK_TOOL_OPTIONS, DND5E_MUSICAL_INSTRUMENT_OPTIONS,
  DND5E_SKILL_OPTIONS, DND5E_SKILLED_PROFICIENCY_OPTIONS, DND5E_SPELLCASTING_ABILITY_OPTIONS,
  DND5E_STANDARD_LANGUAGE_OPTIONS, type GuidedDnd5eCoreChoices, type GuidedDnd5eMagicInitiateChoices,
} from "./guidedChoices.js";
import { clericCantripCount, DND5E_CLERIC_CANTRIP_OPTIONS, DND5E_CLERIC_DIVINE_ORDER_OPTIONS, DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS } from "./clericCatalog.js";
import { druidCantripCount, DND5E_DRUID_CANTRIP_OPTIONS, DND5E_DRUID_PREPARED_LEVEL_ONE_SPELL_OPTIONS, DND5E_DRUID_PRIMAL_ORDER_OPTIONS } from "./druidCatalog.js";
import { preparedCasterCatalog } from "./preparedCasterCatalog.js";
import { magicInitiateSpellList, type Dnd5eMagicInitiateSpellListId } from "./spellCatalog.js";
import { assertGuidedDnd5eLineageSpeciesChoices, currentGuidedDnd5eSpeciesSpellIds } from "./speciesState.js";
import { DND5E_SRD_521_BACKGROUND_OPTIONS, type GuidedDnd5eBackgroundId, type GuidedDnd5eClassId, type GuidedDnd5eSpeciesId } from "./srdCatalog.js";
import { DND5E_LEVEL_ONE_ELDRITCH_INVOCATION_OPTIONS, DND5E_PACT_TOME_CANTRIP_OPTIONS, DND5E_PACT_TOME_LEVEL_ONE_RITUAL_OPTIONS } from "./warlockCatalog.js";

export function assertGuidedDnd5eCoreChoices(classId: GuidedDnd5eClassId, backgroundId: GuidedDnd5eBackgroundId, speciesId: GuidedDnd5eSpeciesId, choices: GuidedDnd5eCoreChoices): void {
  assertOneOf(choices.alignmentId, DND5E_ALIGNMENT_OPTIONS.map((o) => o.id), "alignment");
  assertExactUnique(choices.originLanguageIds, 2, "origin languages");
  for (const id of choices.originLanguageIds) assertOneOf(id, DND5E_STANDARD_LANGUAGE_OPTIONS.map((o) => o.id), "origin language");

  const classRules = DND5E_GUIDED_CLASS_CHOICE_RULES[classId];
  const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((o) => o.id === backgroundId);
  if (!background) throw new Error(`Unknown guided background ${backgroundId}.`);
  assertExactUnique(choices.classSkillIds, classRules.skillCount, `${classId} class skills`);
  for (const id of choices.classSkillIds) assertOneOf(id, classRules.skillIds, `${classId} class skill`);
  if (choices.classSkillIds.some((id) => background.skillProficiencies.includes(id))) throw new Error("Class skill choices must not duplicate a background-granted skill proficiency.");
  assertOneOf(choices.classEquipmentChoice, classRules.equipmentChoices.map((o) => o.id), `${classId} starting equipment`);
  assertExactUnique(choices.weaponMasteryIds, classRules.weaponMasteryCount, `${classId} Weapon Mastery choices`);
  for (const id of choices.weaponMasteryIds) assertOneOf(id, classRules.weaponMasteryIds, `${classId} mastery weapon`);

  assertClericChoices(classId, choices);
  assertDruidChoices(classId, choices);
  assertPreparedCasterChoices(classId, choices);
  assertWarlockChoices(classId, speciesId, choices);

  if (classId === "bard") {
    const ids = choices.bardInstrumentIds ?? [];
    assertExactUnique(ids, 3, "Bard musical instrument proficiencies");
    for (const id of ids) assertOneOf(id, DND5E_MUSICAL_INSTRUMENT_OPTIONS.map((o) => o.id), "Bard musical instrument");
  } else if (choices.bardInstrumentIds?.length) throw new Error("Bard-only instrument choices were supplied to another class.");

  if (classId === "fighter") {
    if (!choices.fightingStyleFeatId) throw new Error("Fighter requires a Fighting Style choice.");
    assertOneOf(choices.fightingStyleFeatId, DND5E_FIGHTING_STYLE_OPTIONS.map((o) => o.id), "Fighting Style");
  } else if (choices.fightingStyleFeatId) throw new Error("Only the current Fighter slice has a Level 1 Fighting Style choice.");

  if (classId === "monk") {
    if (!choices.monkToolProficiencyId) throw new Error("Monk requires one Artisan's Tools or Musical Instrument proficiency.");
    assertOneOf(choices.monkToolProficiencyId, DND5E_MONK_TOOL_OPTIONS.map((o) => o.id), "Monk tool proficiency");
  } else if (choices.monkToolProficiencyId) throw new Error("Only Monk uses the current Level 1 tool-choice slot.");

  if (classId === "rogue") {
    const expertise = choices.expertiseSkillIds ?? [];
    assertExactUnique(expertise, 2, "Rogue Expertise choices");
    const proficient = new Set<string>([
      ...choices.classSkillIds, ...background.skillProficiencies,
      ...(speciesId === "human" && choices.human ? [choices.human.skillId] : []),
      ...(speciesId === "human" && choices.human?.originFeatId === "skilled" ? (choices.human.skilledProficiencyIds ?? []).filter((id) => DND5E_SKILL_OPTIONS.some((o) => o.id === id)) : []),
      ...(speciesId === "elf" && choices.elf ? [choices.elf.keenSensesSkillId] : []),
    ]);
    if (expertise.some((id) => !proficient.has(id))) throw new Error("Rogue Expertise choices must be skills in which the character is proficient.");
    if (!choices.rogueBonusLanguageId) throw new Error("Rogue Thieves' Cant requires one additional language choice.");
    assertOneOf(choices.rogueBonusLanguageId, DND5E_BONUS_LANGUAGE_OPTIONS.map((o) => o.id), "Rogue bonus language");
  } else if (choices.expertiseSkillIds?.length || choices.rogueBonusLanguageId) throw new Error("Rogue-only Expertise/language choices were supplied to another class.");

  assertMagicInitiate(backgroundId, choices);
  assertSpeciesChoices(speciesId, background, choices);
  assertGuidedDnd5eLineageSpeciesChoices(speciesId, choices);
}

function assertClericChoices(classId: GuidedDnd5eClassId, choices: GuidedDnd5eCoreChoices): void {
  if (classId !== "cleric") { if (choices.cleric) throw new Error("Cleric-only choices were supplied to another class."); return; }
  const cleric = choices.cleric;
  if (!cleric) throw new Error("Cleric requires Divine Order and spell choices.");
  assertOneOf(cleric.divineOrderId, DND5E_CLERIC_DIVINE_ORDER_OPTIONS.map((o) => o.id), "Cleric Divine Order");
  const count = clericCantripCount(cleric.divineOrderId);
  assertExactUnique(cleric.cantripIds, count, "Cleric cantrips");
  for (const id of cleric.cantripIds) assertOneOf(id, DND5E_CLERIC_CANTRIP_OPTIONS.map((o) => o.id), "Cleric cantrip");
  assertExactUnique(cleric.preparedSpellIds, 4, "Cleric prepared spells");
  for (const id of cleric.preparedSpellIds) assertOneOf(id, DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS.map((o) => o.id), "Cleric level 1 spell");
}

function assertDruidChoices(classId: GuidedDnd5eClassId, choices: GuidedDnd5eCoreChoices): void {
  if (classId !== "druid") { if (choices.druid) throw new Error("Druid-only choices were supplied to another class."); return; }
  const druid = choices.druid;
  if (!druid) throw new Error("Druid requires Primal Order and spell choices.");
  assertOneOf(druid.primalOrderId, DND5E_DRUID_PRIMAL_ORDER_OPTIONS.map((o) => o.id), "Druid Primal Order");
  const count = druidCantripCount(druid.primalOrderId);
  assertExactUnique(druid.cantripIds, count, "Druid cantrips");
  for (const id of druid.cantripIds) assertOneOf(id, DND5E_DRUID_CANTRIP_OPTIONS.map((o) => o.id), "Druid cantrip");
  assertExactUnique(druid.preparedSpellIds, 4, "Druid prepared spells");
  for (const id of druid.preparedSpellIds) assertOneOf(id, DND5E_DRUID_PREPARED_LEVEL_ONE_SPELL_OPTIONS.map((o) => o.id), "Druid prepared level 1 spell");
}

function assertPreparedCasterChoices(classId: GuidedDnd5eClassId, choices: GuidedDnd5eCoreChoices): void {
  const catalog = preparedCasterCatalog(classId);
  if (!catalog) { if (choices.preparedCaster) throw new Error("Prepared-caster choices were supplied to a class that does not use that guided seam."); return; }
  const casting = choices.preparedCaster;
  if (!casting || casting.classId !== classId) throw new Error(`${catalog.label} requires its Level 1 spell choices.`);
  assertExactUnique(casting.cantripIds, catalog.cantripCount, `${catalog.label} cantrips`);
  for (const id of casting.cantripIds) assertOneOf(id, catalog.cantripOptions.map((o) => o.id), `${catalog.label} cantrip`);
  assertExactUnique(casting.preparedSpellIds, catalog.preparedSpellCount, `${catalog.label} prepared spells`);
  for (const id of casting.preparedSpellIds) assertOneOf(id, catalog.preparedSpellOptions.map((o) => o.id), `${catalog.label} prepared level 1 spell`);
  if (catalog.spellbookCount) {
    const spellbook = casting.spellbookSpellIds ?? [];
    assertExactUnique(spellbook, catalog.spellbookCount, `${catalog.label} spellbook spells`);
    for (const id of spellbook) assertOneOf(id, catalog.preparedSpellOptions.map((o) => o.id), `${catalog.label} spellbook spell`);
    if (casting.preparedSpellIds.some((id) => !spellbook.includes(id))) throw new Error("Wizard prepared spells must be contained in the selected Level 1 spellbook spells.");
  } else if (casting.spellbookSpellIds?.length) throw new Error("Only the current Wizard slice owns a Level 1 spellbook selection.");
}

function assertWarlockChoices(classId: GuidedDnd5eClassId, speciesId: GuidedDnd5eSpeciesId, choices: GuidedDnd5eCoreChoices): void {
  if (classId !== "warlock") { if (choices.warlock) throw new Error("Warlock-only choices were supplied to another class."); return; }
  const warlock = choices.warlock;
  if (!warlock) throw new Error("Warlock requires one Level 1 Eldritch Invocation choice.");
  assertOneOf(warlock.invocationId, DND5E_LEVEL_ONE_ELDRITCH_INVOCATION_OPTIONS.map((o) => o.id), "Level 1 Eldritch Invocation");
  if (warlock.invocationId !== "pact-of-the-tome") {
    if (warlock.pactTomeCantripIds?.length || warlock.pactTomeRitualSpellIds?.length) throw new Error("Pact of the Tome spell choices require the Pact of the Tome invocation.");
    return;
  }
  const tomeCantrips = warlock.pactTomeCantripIds ?? [];
  const tomeRituals = warlock.pactTomeRitualSpellIds ?? [];
  assertExactUnique(tomeCantrips, 3, "Pact of the Tome cantrips");
  for (const id of tomeCantrips) assertOneOf(id, DND5E_PACT_TOME_CANTRIP_OPTIONS.map((o) => o.id), "Pact of the Tome cantrip");
  assertExactUnique(tomeRituals, 2, "Pact of the Tome ritual spells");
  for (const id of tomeRituals) assertOneOf(id, DND5E_PACT_TOME_LEVEL_ONE_RITUAL_OPTIONS.map((o) => o.id), "Pact of the Tome Level 1 ritual spell");
  const alreadyPrepared = new Set([
    ...(choices.preparedCaster?.cantripIds ?? []),
    ...(choices.preparedCaster?.preparedSpellIds ?? []),
    ...(choices.magicInitiate?.cantripIds ?? []),
    ...(choices.magicInitiate ? [choices.magicInitiate.levelOneSpellId] : []),
    ...(choices.human?.magicInitiate?.cantripIds ?? []),
    ...(choices.human?.magicInitiate ? [choices.human.magicInitiate.levelOneSpellId] : []),
    ...currentGuidedDnd5eSpeciesSpellIds(speciesId, choices),
  ]);
  if ([...tomeCantrips, ...tomeRituals].some((id) => alreadyPrepared.has(id))) throw new Error("Pact of the Tome spells must not duplicate spells the Warlock already has prepared from any source.");
}

function assertMagicInitiate(backgroundId: GuidedDnd5eBackgroundId, choices: GuidedDnd5eCoreChoices): void {
  const required: Dnd5eMagicInitiateSpellListId | undefined = backgroundId === "acolyte" ? "cleric" : backgroundId === "sage" ? "wizard" : undefined;
  if (!required) { if (choices.magicInitiate) throw new Error("Magic Initiate choices were supplied to a background that does not grant Magic Initiate."); return; }
  const selection = choices.magicInitiate;
  if (!selection) throw new Error(`${backgroundId} requires Magic Initiate spell choices.`);
  if (selection.spellListId !== required) throw new Error(`${backgroundId} must use the ${required} Magic Initiate spell list.`);
  assertMagicInitiateSelection(selection, required, "Magic Initiate");
}

function assertMagicInitiateSelection(selection: GuidedDnd5eMagicInitiateChoices, required: Dnd5eMagicInitiateSpellListId | undefined, label: string): void {
  if (required && selection.spellListId !== required) throw new Error(`${label} must use the ${required} spell list.`);
  assertOneOf(selection.spellListId, ["cleric", "druid", "wizard"], `${label} spell list`);
  assertOneOf(selection.spellcastingAbilityId, DND5E_SPELLCASTING_ABILITY_OPTIONS.map((o) => o.id), `${label} spellcasting ability`);
  const list = magicInitiateSpellList(selection.spellListId);
  assertExactUnique(selection.cantripIds, 2, `${label} cantrips`);
  for (const id of selection.cantripIds) assertOneOf(id, list.cantrips.map((o) => o.id), `${list.label} cantrip`);
  assertOneOf(selection.levelOneSpellId, list.levelOneSpells.map((o) => o.id), `${list.label} level 1 spell`);
}

function assertSpeciesChoices(speciesId: GuidedDnd5eSpeciesId, background: (typeof DND5E_SRD_521_BACKGROUND_OPTIONS)[number], choices: GuidedDnd5eCoreChoices): void {
  if (speciesId === "dragonborn") {
    if (!choices.dragonbornAncestryId) throw new Error("Dragonborn requires a Draconic Ancestry choice.");
    assertOneOf(choices.dragonbornAncestryId, DND5E_DRAGONBORN_ANCESTRY_OPTIONS.map((o) => o.id), "Draconic Ancestry");
  } else if (choices.dragonbornAncestryId) throw new Error("Dragonborn-only ancestry was supplied to another species.");
  if (speciesId === "goliath") {
    if (!choices.goliathAncestryId) throw new Error("Goliath requires a Giant Ancestry choice.");
    assertOneOf(choices.goliathAncestryId, DND5E_GOLIATH_ANCESTRY_OPTIONS.map((o) => o.id), "Giant Ancestry");
  } else if (choices.goliathAncestryId) throw new Error("Goliath-only ancestry was supplied to another species.");
  if (speciesId === "human") {
    if (!choices.human) throw new Error("Human requires size, Skillful, and Versatile choices.");
    if (choices.human.size !== "small" && choices.human.size !== "medium") throw new Error("Human size must be Small or Medium.");
    assertOneOf(choices.human.skillId, DND5E_SKILL_OPTIONS.map((o) => o.id), "Human Skillful proficiency");
    const already = new Set([...choices.classSkillIds, ...background.skillProficiencies]);
    if (already.has(choices.human.skillId)) throw new Error("Human Skillful must add a skill proficiency the character does not already have.");
    assertOneOf(choices.human.originFeatId, DND5E_HUMAN_ORIGIN_FEAT_OPTIONS.filter((o) => o.supported).map((o) => o.id), "Human Versatile Origin feat");
    if (choices.human.originFeatId === background.originFeatId && choices.human.originFeatId !== "skilled") throw new Error("Human Versatile must not duplicate the non-repeatable Origin feat granted by the background.");
    const skilled = choices.human.skilledProficiencyIds ?? [];
    if (choices.human.originFeatId === "skilled") {
      assertExactUnique(skilled, 3, "Skilled feat proficiencies");
      for (const id of skilled) assertOneOf(id, DND5E_SKILLED_PROFICIENCY_OPTIONS.map((o) => o.id), "Skilled proficiency");
    } else if (skilled.length) throw new Error("Skilled proficiency choices require the Skilled Origin feat.");
    if (choices.human.originFeatId === "magic-initiate") {
      const magic = choices.human.magicInitiate;
      if (!magic) throw new Error("Human Versatile Magic Initiate requires spell-list, casting ability, cantrip, and Level 1 spell choices.");
      assertMagicInitiateSelection(magic, undefined, "Human Versatile Magic Initiate");
      const backgroundList = background.originFeatId === "magic-initiate:cleric" ? "cleric" : background.originFeatId === "magic-initiate:wizard" ? "wizard" : undefined;
      if (backgroundList && magic.spellListId === backgroundList) throw new Error("A repeated Magic Initiate feat must choose a different spell list.");
    } else if (choices.human.magicInitiate) throw new Error("Human Magic Initiate choices require the Magic Initiate Versatile feat.");
  } else if (choices.human) throw new Error("Human-only choices were supplied to a non-Human character.");
}

function assertOneOf(value: string, allowed: readonly string[], label: string): void { if (!allowed.includes(value)) throw new Error(`Choose a supported ${label}.`); }
function assertExactUnique(values: readonly string[], expected: number, label: string): void {
  if (values.length !== expected || new Set(values).size !== expected) throw new Error(`${label} require exactly ${expected} distinct choice${expected === 1 ? "" : "s"}.`);
}
