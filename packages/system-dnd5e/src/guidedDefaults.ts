import { DND5E_MUSICAL_INSTRUMENT_OPTIONS, DND5E_SKILL_OPTIONS, type GuidedDnd5eCoreChoices } from "./guidedChoices.js";
import { preparedCasterCatalog } from "./preparedCasterCatalog.js";
import { DND5E_SRD_521_BACKGROUND_OPTIONS, type GuidedDnd5eBackgroundId, type GuidedDnd5eClassId, type GuidedDnd5eSpeciesId } from "./srdCatalog.js";

export function defaultGuidedDnd5eCoreChoices(classId: GuidedDnd5eClassId, backgroundId: GuidedDnd5eBackgroundId, speciesId: GuidedDnd5eSpeciesId): GuidedDnd5eCoreChoices {
  const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((option) => option.id === backgroundId);
  if (!background) throw new Error(`Unknown guided background ${backgroundId}.`);
  const backgroundSkills = new Set<string>(background.skillProficiencies);
  const candidates: Record<GuidedDnd5eClassId, string[]> = {
    barbarian: ["perception", "survival", "animal-handling", "nature", "athletics", "intimidation"],
    bard: ["performance", "persuasion", "deception", "insight", "perception", "arcana", "history", "stealth", "athletics", "survival"],
    cleric: ["insight", "medicine", "persuasion", "history", "religion"],
    druid: ["perception", "survival", "nature", "animal-handling", "insight", "medicine", "arcana", "religion"],
    fighter: ["acrobatics", "history", "perception", "insight", "athletics", "persuasion", "survival", "animal-handling", "intimidation"],
    monk: ["acrobatics", "insight", "history", "religion", "athletics", "stealth"],
    paladin: ["persuasion", "insight", "medicine", "religion", "athletics", "intimidation"],
    ranger: ["perception", "survival", "nature", "stealth", "animal-handling", "insight", "investigation", "athletics"],
    rogue: ["acrobatics", "investigation", "perception", "persuasion", "stealth", "deception", "insight", "intimidation", "athletics", "sleight-of-hand"],
    sorcerer: ["arcana", "persuasion", "deception", "insight", "intimidation", "religion"],
    wizard: ["arcana", "investigation", "history", "nature", "insight", "medicine", "religion"],
  };
  const count = classId === "rogue" ? 4 : classId === "bard" || classId === "ranger" ? 3 : 2;
  const classSkillIds = candidates[classId].filter((id) => !backgroundSkills.has(id)).slice(0, count);
  const choices: GuidedDnd5eCoreChoices = {
    alignmentId: "neutral-good",
    originLanguageIds: ["dwarvish", "elvish"],
    classSkillIds,
    classEquipmentChoice: "A",
    weaponMasteryIds: classId === "barbarian" ? ["greataxe", "handaxe"]
      : classId === "fighter" ? ["greatsword", "flail", "javelin"]
        : classId === "paladin" ? ["longsword", "javelin"]
          : classId === "ranger" ? ["scimitar", "longbow"]
            : classId === "rogue" ? ["dagger", "shortbow"] : [],
  };
  if (classId === "cleric") choices.cleric = { divineOrderId: "protector", cantripIds: ["guidance", "sacred-flame", "thaumaturgy"], preparedSpellIds: ["bless", "cure-wounds", "guiding-bolt", "shield-of-faith"] };
  if (classId === "druid") choices.druid = { primalOrderId: "warden", cantripIds: ["druidcraft", "produce-flame"], preparedSpellIds: ["animal-friendship", "cure-wounds", "faerie-fire", "thunderwave"] };
  const caster = preparedCasterCatalog(classId);
  if (caster) {
    const cantripIds = caster.cantripOptions.slice(0, caster.cantripCount).map((spell) => spell.id);
    if (classId === "bard") choices.preparedCaster = { classId, cantripIds, preparedSpellIds: ["cure-wounds", "dissonant-whispers", "healing-word", "thunderwave"] };
    if (classId === "paladin") choices.preparedCaster = { classId, cantripIds: [], preparedSpellIds: ["bless", "cure-wounds"] };
    if (classId === "ranger") choices.preparedCaster = { classId, cantripIds: [], preparedSpellIds: ["goodberry", "longstrider"] };
    if (classId === "sorcerer") choices.preparedCaster = { classId, cantripIds, preparedSpellIds: ["magic-missile", "shield"] };
    if (classId === "wizard") {
      const spellbookSpellIds = ["detect-magic", "find-familiar", "mage-armor", "magic-missile", "shield", "sleep"];
      choices.preparedCaster = { classId, cantripIds, spellbookSpellIds, preparedSpellIds: spellbookSpellIds.slice(0, 4) };
    }
  }
  if (classId === "bard") choices.bardInstrumentIds = DND5E_MUSICAL_INSTRUMENT_OPTIONS.slice(0, 3).map((option) => option.id);
  if (classId === "fighter") choices.fightingStyleFeatId = "defense";
  if (classId === "monk") choices.monkToolProficiencyId = "artisan-tools:calligraphers-supplies";
  if (classId === "rogue") { choices.expertiseSkillIds = [classSkillIds[0]!, classSkillIds[1]!]; choices.rogueBonusLanguageId = "giant"; }
  if (backgroundId === "acolyte") choices.magicInitiate = { spellListId: "cleric", spellcastingAbilityId: "wisdom", cantripIds: ["guidance", "sacred-flame"], levelOneSpellId: "bless" };
  if (backgroundId === "sage") choices.magicInitiate = { spellListId: "wizard", spellcastingAbilityId: "intelligence", cantripIds: ["light", "mage-hand"], levelOneSpellId: "magic-missile" };
  if (speciesId === "dragonborn") choices.dragonbornAncestryId = "red";
  if (speciesId === "goliath") choices.goliathAncestryId = "stone";
  if (speciesId === "human") {
    const taken = new Set([...classSkillIds, ...background.skillProficiencies]);
    const skillId = DND5E_SKILL_OPTIONS.map((option) => option.id).find((id) => !taken.has(id)) ?? "performance";
    choices.human = { size: "medium", skillId, originFeatId: background.originFeatId === "alert" ? "savage-attacker" : "alert" };
  }
  return choices;
}
