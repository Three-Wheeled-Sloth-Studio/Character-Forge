import { createCharacterDocument, createCharacterId, createNativeStateId, type CharacterDocument, type GenerationRecord, type NativeSystemState } from "../../character-model/src/index.js";
import { createLevelOneClericSpellcasting, createLevelOneDruidSpellcasting, createLevelOnePreparedCasterSpellcasting } from "./classSpellcasting.js";
import { DND5E_DRAGONBORN_ANCESTRY_OPTIONS, DND5E_SKILL_OPTIONS, type GuidedDnd5eCoreChoices } from "./guidedChoices.js";
import { assertGuidedDnd5eCoreChoices } from "./guidedCoreValidation.js";
import { abilityModifier, type Dnd5eAbilityState, type Dnd5eClassSpellcastingState, type Dnd5eClassState, type Dnd5eEquipmentEntry, type Dnd5eNativeCharacter, type Dnd5eOriginState, type Dnd5eResourcesState, type Dnd5eSpellGrantState, type Dnd5eSpellState } from "./nativeCharacter.js";
import { preparedCasterCatalog } from "./preparedCasterCatalog.js";
import { DND5E_SRD_521_BACKGROUND_OPTIONS, type GuidedDnd5eBackgroundId, type GuidedDnd5eClassId, type GuidedDnd5eSpeciesId } from "./srdCatalog.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";

interface GuidedClassProfile {
  hitDie: number;
  primaryAbilityIds: Dnd5eClassState["primaryAbilityIds"];
  savingThrowProficiencies: string[];
  fixedToolProficiencyIds?: string[];
  featureIds: string[];
}

const CLASS_PROFILES: Record<GuidedDnd5eClassId, GuidedClassProfile> = {
  barbarian: { hitDie: 12, primaryAbilityIds: ["strength"], savingThrowProficiencies: ["strength", "constitution"], featureIds: ["barbarian:rage", "barbarian:unarmored-defense", "barbarian:weapon-mastery"] },
  bard: { hitDie: 8, primaryAbilityIds: ["charisma"], savingThrowProficiencies: ["dexterity", "charisma"], featureIds: ["bard:bardic-inspiration", "bard:spellcasting"] },
  cleric: { hitDie: 8, primaryAbilityIds: ["wisdom"], savingThrowProficiencies: ["wisdom", "charisma"], featureIds: ["cleric:spellcasting", "cleric:divine-order"] },
  druid: { hitDie: 8, primaryAbilityIds: ["wisdom"], savingThrowProficiencies: ["intelligence", "wisdom"], fixedToolProficiencyIds: ["herbalism-kit"], featureIds: ["druid:spellcasting", "druid:druidic", "druid:primal-order"] },
  fighter: { hitDie: 10, primaryAbilityIds: ["strength", "dexterity"], savingThrowProficiencies: ["strength", "constitution"], featureIds: ["fighter:fighting-style", "fighter:second-wind", "fighter:weapon-mastery"] },
  monk: { hitDie: 8, primaryAbilityIds: ["dexterity", "wisdom"], savingThrowProficiencies: ["strength", "dexterity"], featureIds: ["monk:martial-arts", "monk:unarmored-defense"] },
  paladin: { hitDie: 10, primaryAbilityIds: ["strength", "charisma"], savingThrowProficiencies: ["wisdom", "charisma"], featureIds: ["paladin:lay-on-hands", "paladin:spellcasting", "paladin:weapon-mastery"] },
  ranger: { hitDie: 10, primaryAbilityIds: ["dexterity", "wisdom"], savingThrowProficiencies: ["strength", "dexterity"], featureIds: ["ranger:favored-enemy", "ranger:spellcasting", "ranger:weapon-mastery"] },
  rogue: { hitDie: 8, primaryAbilityIds: ["dexterity"], savingThrowProficiencies: ["dexterity", "intelligence"], fixedToolProficiencyIds: ["thieves-tools"], featureIds: ["rogue:expertise", "rogue:sneak-attack:1d6", "rogue:thieves-cant", "rogue:weapon-mastery"] },
  sorcerer: { hitDie: 6, primaryAbilityIds: ["charisma"], savingThrowProficiencies: ["constitution", "charisma"], featureIds: ["sorcerer:innate-sorcery", "sorcerer:spellcasting"] },
  wizard: { hitDie: 6, primaryAbilityIds: ["intelligence"], savingThrowProficiencies: ["intelligence", "wisdom"], featureIds: ["wizard:spellcasting", "wizard:ritual-adept", "wizard:arcane-recovery"] },
};

interface GuidedBackgroundProfile { originFeatId: string; skillProficiencies: string[]; toolProficiencyId: string; packageEquipment: Dnd5eEquipmentEntry[]; packageGold: number; }
const BACKGROUND_PROFILES: Record<GuidedDnd5eBackgroundId, GuidedBackgroundProfile> = {
  acolyte: { originFeatId: "magic-initiate:cleric", skillProficiencies: ["insight", "religion"], toolProficiencyId: "calligraphers-supplies", packageEquipment: [{ itemId: "calligraphers-supplies", quantity: 1 }, { itemId: "book:prayers", quantity: 1 }, { itemId: "holy-symbol", quantity: 1 }, { itemId: "parchment-sheet", quantity: 10 }, { itemId: "robe", quantity: 1 }], packageGold: 8 },
  criminal: { originFeatId: "alert", skillProficiencies: ["sleight-of-hand", "stealth"], toolProficiencyId: "thieves-tools", packageEquipment: [{ itemId: "dagger", quantity: 2 }, { itemId: "thieves-tools", quantity: 1 }, { itemId: "crowbar", quantity: 1 }, { itemId: "pouch", quantity: 2 }, { itemId: "travelers-clothes", quantity: 1 }], packageGold: 16 },
  sage: { originFeatId: "magic-initiate:wizard", skillProficiencies: ["arcana", "history"], toolProficiencyId: "calligraphers-supplies", packageEquipment: [{ itemId: "quarterstaff", quantity: 1 }, { itemId: "calligraphers-supplies", quantity: 1 }, { itemId: "book:history", quantity: 1 }, { itemId: "parchment-sheet", quantity: 8 }, { itemId: "robe", quantity: 1 }], packageGold: 8 },
  soldier: { originFeatId: "savage-attacker", skillProficiencies: ["athletics", "intimidation"], toolProficiencyId: "gaming-set:dice", packageEquipment: [{ itemId: "spear", quantity: 1 }, { itemId: "shortbow", quantity: 1 }, { itemId: "arrow", quantity: 20 }, { itemId: "gaming-set:dice", quantity: 1 }, { itemId: "healers-kit", quantity: 1 }, { itemId: "quiver", quantity: 1 }, { itemId: "travelers-clothes", quantity: 1 }], packageGold: 14 },
};
interface GuidedSpeciesProfile { size: "small" | "medium"; speedFeet: number; featureIds: string[]; hitPointBonus: number; resources: (proficiencyBonus: number) => Partial<Dnd5eResourcesState>; }
const SPECIES_PROFILES: Record<GuidedDnd5eSpeciesId, GuidedSpeciesProfile> = {
  dragonborn: { size: "medium", speedFeet: 30, featureIds: ["dragonborn:breath-weapon", "dragonborn:damage-resistance", "dragonborn:darkvision-60", "dragonborn:draconic-flight:level-5"], hitPointBonus: 0, resources: (pb) => ({ breathWeaponMaximum: pb, breathWeaponCurrent: pb }) },
  dwarf: { size: "medium", speedFeet: 30, featureIds: ["dwarf:darkvision-120", "dwarf:dwarven-resilience", "dwarf:dwarven-toughness", "dwarf:stonecunning"], hitPointBonus: 1, resources: (pb) => ({ stonecunningMaximum: pb, stonecunningCurrent: pb }) },
  goliath: { size: "medium", speedFeet: 35, featureIds: ["goliath:giant-ancestry", "goliath:large-form:level-5", "goliath:powerful-build"], hitPointBonus: 0, resources: (pb) => ({ giantAncestryMaximum: pb, giantAncestryCurrent: pb }) },
  halfling: { size: "small", speedFeet: 30, featureIds: ["halfling:brave", "halfling:nimbleness", "halfling:luck", "halfling:naturally-stealthy"], hitPointBonus: 0, resources: () => ({}) },
  human: { size: "medium", speedFeet: 30, featureIds: ["human:resourceful", "human:skillful", "human:versatile"], hitPointBonus: 0, resources: () => ({}) },
  orc: { size: "medium", speedFeet: 30, featureIds: ["orc:adrenaline-rush", "orc:darkvision-120", "orc:relentless-endurance"], hitPointBonus: 0, resources: (pb) => ({ adrenalineRushMaximum: pb, adrenalineRushCurrent: pb, relentlessEnduranceMaximum: 1, relentlessEnduranceCurrent: 1 }) },
};

export interface GuidedDnd5eFirstSliceInput { displayName: string; classId: GuidedDnd5eClassId; backgroundId: GuidedDnd5eBackgroundId; speciesId: GuidedDnd5eSpeciesId; backgroundEquipmentChoice: "A" | "B:50-gp"; coreChoices: GuidedDnd5eCoreChoices; abilities: Dnd5eAbilityState; generation: GenerationRecord; }

export function createGuidedDnd5eFirstSliceCharacter(input: GuidedDnd5eFirstSliceInput): CharacterDocument {
  const displayName = input.displayName.trim();
  if (!displayName) throw new Error("Character name is required after generated-name resolution.");
  const nativeState = createGuidedDnd5eFirstSliceNativeState({ ...input, displayName });
  return createCharacterDocument({ characterId: createCharacterId(), displayName, primaryNativeStateId: nativeState.id, nativeStates: [nativeState], generation: input.generation });
}
export function createGuidedDnd5eFirstSliceNativeState(input: GuidedDnd5eFirstSliceInput): NativeSystemState {
  const payload = createGuidedDnd5eFirstSlicePayload(input);
  return { id: createNativeStateId(), systemId: "dnd5e", editionId: "2024", rulesVersion: DND5E_SRD_5_2_1_SOURCE.version, schemaVersion: "dnd5e-character/0.3", payload, provenance: { origin: "generated", sourceId: DND5E_SRD_5_2_1_SOURCE.id, notes: `Level 1 ${label(input.speciesId)} ${label(input.backgroundId)} ${label(input.classId)} built through guided SRD creation.` } };
}

export function createGuidedDnd5eFirstSlicePayload(input: GuidedDnd5eFirstSliceInput): Dnd5eNativeCharacter {
  assertGuidedDnd5eCoreChoices(input.classId, input.backgroundId, input.speciesId, input.coreChoices);
  const classProfile = CLASS_PROFILES[input.classId];
  const backgroundProfile = BACKGROUND_PROFILES[input.backgroundId];
  const speciesProfile = SPECIES_PROFILES[input.speciesId];
  const proficiencyBonus = 2;
  const human = input.speciesId === "human" ? input.coreChoices.human : undefined;
  const cleric = input.classId === "cleric" ? input.coreChoices.cleric : undefined;
  const druid = input.classId === "druid" ? input.coreChoices.druid : undefined;
  const dragonbornAncestryId = input.speciesId === "dragonborn" ? input.coreChoices.dragonbornAncestryId : undefined;
  const dragonbornAncestry = DND5E_DRAGONBORN_ANCESTRY_OPTIONS.find((o) => o.id === dragonbornAncestryId);
  const goliathAncestryId = input.speciesId === "goliath" ? input.coreChoices.goliathAncestryId : undefined;
  const speciesSkillId = human?.skillId;
  const speciesOriginFeatId = human?.originFeatId;
  const skilled = human?.originFeatId === "skilled" ? (human.skilledProficiencyIds ?? []) : [];
  const allSkills = new Set([...input.coreChoices.classSkillIds, ...backgroundProfile.skillProficiencies, ...(speciesSkillId ? [speciesSkillId] : []), ...skilled.filter((id) => DND5E_SKILL_OPTIONS.some((o) => o.id === id))]);
  const hitPoints = classProfile.hitDie + abilityModifier(input.abilities.final.constitution) + speciesProfile.hitPointBonus;
  const initiativeModifier = abilityModifier(input.abilities.final.dexterity) + (backgroundProfile.originFeatId === "alert" || speciesOriginFeatId === "alert" ? proficiencyBonus : 0);
  const passivePerception = 10 + abilityModifier(input.abilities.final.wisdom) + (allSkills.has("perception") ? proficiencyBonus : 0);
  const classEquipment = classEquipmentFor(input.classId, input.coreChoices);
  const armorClass = armorClassFor(input.classId, input.coreChoices.classEquipmentChoice, input.coreChoices.fightingStyleFeatId, input.abilities);

  const origin: Dnd5eOriginState = {
    backgroundId: input.backgroundId, speciesId: input.speciesId, size: human?.size ?? speciesProfile.size, speedFeet: speciesProfile.speedFeet,
    languages: ["common", ...input.coreChoices.originLanguageIds], backgroundOriginFeatId: backgroundProfile.originFeatId,
    backgroundSkillProficiencies: [...backgroundProfile.skillProficiencies], ...(speciesOriginFeatId ? { speciesOriginFeatId } : {}),
    ...(skilled.length ? { speciesOriginFeatProficiencyIds: [...skilled] } : {}), ...(speciesSkillId ? { speciesSkillId } : {}),
    ...(dragonbornAncestryId ? { speciesAncestryId: dragonbornAncestryId } : {}), ...(dragonbornAncestry ? { speciesDamageType: dragonbornAncestry.damageType } : {}),
    ...(goliathAncestryId ? { speciesAncestryId: goliathAncestryId } : {}), toolProficiencyId: backgroundProfile.toolProficiencyId,
    backgroundEquipmentChoice: input.backgroundEquipmentChoice,
  };

  const toolProficiencyIds = [...(classProfile.fixedToolProficiencyIds ?? []), ...(input.coreChoices.monkToolProficiencyId ? [input.coreChoices.monkToolProficiencyId] : []), ...(input.coreChoices.bardInstrumentIds ?? [])];
  const bonusLanguageIds = input.classId === "druid" ? ["druidic"] : input.coreChoices.rogueBonusLanguageId ? ["thieves-cant", input.coreChoices.rogueBonusLanguageId] : [];
  const training = classTrainingFor(input.classId, input.coreChoices);
  const classState: Dnd5eClassState = {
    classId: input.classId, level: 1, hitDie: classProfile.hitDie, proficiencyBonus,
    ...(classProfile.primaryAbilityIds ? { primaryAbilityIds: [...classProfile.primaryAbilityIds] } : {}),
    savingThrowProficiencies: [...classProfile.savingThrowProficiencies], skillProficiencies: [...input.coreChoices.classSkillIds],
    ...(input.coreChoices.expertiseSkillIds?.length ? { expertiseSkillIds: [...input.coreChoices.expertiseSkillIds] } : {}),
    ...(toolProficiencyIds.length ? { toolProficiencyIds } : {}), ...(bonusLanguageIds.length ? { bonusLanguageIds } : {}),
    ...(input.coreChoices.fightingStyleFeatId ? { fightingStyleFeatId: input.coreChoices.fightingStyleFeatId } : {}),
    ...training, ...(cleric ? clericOrderState(cleric.divineOrderId, input.abilities.final.wisdom) : {}), ...(druid ? druidOrderState(druid.primalOrderId, input.abilities.final.wisdom) : {}),
    weaponMasteryIds: [...input.coreChoices.weaponMasteryIds], classEquipmentChoice: input.coreChoices.classEquipmentChoice,
  };
  const resources: Dnd5eResourcesState = { hitPointsMaximum: hitPoints, hitPointsCurrent: hitPoints, hitDiceTotal: 1, hitDiceSpent: 0, ...classResourcesFor(input.classId, input.abilities), ...speciesProfile.resources(proficiencyBonus) };
  const spellState = spellStateFor(input.classId, input.backgroundId, input.coreChoices, classState.spellcastingFocusIds);
  const backgroundEquipment = input.backgroundEquipmentChoice === "A" ? backgroundProfile.packageEquipment.map((entry) => ({ ...entry })) : [];
  const backgroundGold = input.backgroundEquipmentChoice === "A" ? backgroundProfile.packageGold : 50;

  return {
    schemaVersion: "dnd5e-character/0.3", rulesSourceIds: [DND5E_SRD_5_2_1_SOURCE.id],
    identity: { name: input.displayName, level: 1, experiencePoints: 0, alignment: input.coreChoices.alignmentId }, origin, abilities: input.abilities, class: classState,
    ...(spellState ? { spells: spellState } : {}),
    featureIds: [...speciesProfile.featureIds, ...(dragonbornAncestryId ? [`dragonborn:draconic-ancestry:${dragonbornAncestryId}`] : []), ...(dragonbornAncestry ? [`dragonborn:damage-type:${dragonbornAncestry.damageType}`] : []), ...(goliathAncestryId ? [`goliath:giant-ancestry:${goliathAncestryId}`] : []), `feat:${backgroundProfile.originFeatId}`, ...(speciesOriginFeatId ? [`feat:${speciesOriginFeatId}`] : []), ...classProfile.featureIds, ...(cleric ? [`cleric:divine-order:${cleric.divineOrderId}`] : []), ...(druid ? [`druid:primal-order:${druid.primalOrderId}`] : []), ...(input.coreChoices.fightingStyleFeatId ? [`fighting-style:${input.coreChoices.fightingStyleFeatId}`] : [])],
    equipment: [...classEquipment.equipment, ...backgroundEquipment], currencyGp: classEquipment.gold + backgroundGold, resources,
    derived: { armorClass, initiativeModifier, passivePerception },
  };
}

function classTrainingFor(classId: GuidedDnd5eClassId, choices: GuidedDnd5eCoreChoices): Partial<Dnd5eClassState> {
  if (classId === "bard") return { weaponProficiencyIds: ["simple"], armorTrainingIds: ["light"], spellcastingFocusIds: [...(choices.bardInstrumentIds ?? [])] };
  if (classId === "paladin") return { weaponProficiencyIds: ["simple", "martial"], armorTrainingIds: ["light", "medium", "heavy", "shield"], spellcastingFocusIds: ["holy-symbol"] };
  if (classId === "ranger") return { weaponProficiencyIds: ["simple", "martial"], armorTrainingIds: ["light", "medium", "shield"], spellcastingFocusIds: ["druidic-focus"] };
  if (classId === "sorcerer") return { weaponProficiencyIds: ["simple"], armorTrainingIds: [], spellcastingFocusIds: ["arcane-focus"] };
  if (classId === "wizard") return { weaponProficiencyIds: ["simple"], armorTrainingIds: [], spellcastingFocusIds: ["arcane-focus", "spellbook"] };
  return {};
}
function clericOrderState(order: "protector" | "thaumaturge", wisdom: number): Partial<Dnd5eClassState> {
  return order === "protector"
    ? { divineOrderId: order, weaponProficiencyIds: ["simple", "martial"], armorTrainingIds: ["light", "medium", "heavy", "shield"], spellcastingFocusIds: ["holy-symbol"] }
    : { divineOrderId: order, weaponProficiencyIds: ["simple"], armorTrainingIds: ["light", "medium", "shield"], spellcastingFocusIds: ["holy-symbol"], thaumaturgeKnowledgeBonus: Math.max(1, abilityModifier(wisdom)) };
}
function druidOrderState(order: "magician" | "warden", wisdom: number): Partial<Dnd5eClassState> {
  return order === "warden"
    ? { primalOrderId: order, weaponProficiencyIds: ["simple", "martial"], armorTrainingIds: ["light", "medium", "shield"], spellcastingFocusIds: ["druidic-focus"] }
    : { primalOrderId: order, weaponProficiencyIds: ["simple"], armorTrainingIds: ["light", "shield"], spellcastingFocusIds: ["druidic-focus"], druidicKnowledgeBonus: Math.max(1, abilityModifier(wisdom)) };
}
function classResourcesFor(classId: GuidedDnd5eClassId, abilities: Dnd5eAbilityState): Partial<Dnd5eResourcesState> {
  if (classId === "barbarian") return { rageMaximum: 2, rageCurrent: 2, rageDamageBonus: 2 };
  if (classId === "bard") { const uses = Math.max(1, abilityModifier(abilities.final.charisma)); return { bardicInspirationMaximum: uses, bardicInspirationCurrent: uses, bardicInspirationDie: 6 }; }
  if (classId === "fighter") return { secondWindMaximum: 2, secondWindCurrent: 2 };
  if (classId === "paladin") return { layOnHandsMaximum: 5, layOnHandsCurrent: 5 };
  if (classId === "ranger") return { favoredEnemyMaximum: 2, favoredEnemyCurrent: 2 };
  if (classId === "sorcerer") return { innateSorceryMaximum: 2, innateSorceryCurrent: 2 };
  if (classId === "wizard") return { arcaneRecoveryMaximum: 1, arcaneRecoveryCurrent: 1, arcaneRecoverySpellLevelBudget: 1 };
  return {};
}
function spellStateFor(classId: GuidedDnd5eClassId, backgroundId: GuidedDnd5eBackgroundId, choices: GuidedDnd5eCoreChoices, focusIds?: readonly string[]): Dnd5eSpellState | undefined {
  const grants: Dnd5eSpellGrantState[] = [];
  if (backgroundId === "acolyte" || backgroundId === "sage") {
    const selection = choices.magicInitiate;
    if (!selection) throw new Error(`${backgroundId} requires Magic Initiate choices.`);
    grants.push({ grantId: `origin:magic-initiate:${selection.spellListId}`, sourceId: "feat:magic-initiate", spellListId: selection.spellListId, spellcastingAbilityId: selection.spellcastingAbilityId, cantripIds: [...selection.cantripIds], preparedSpellIds: [selection.levelOneSpellId], alwaysPreparedSpellIds: [selection.levelOneSpellId], freeCastSpellId: selection.levelOneSpellId, freeCastMaximum: 1, freeCastCurrent: 1, freeCastRecharge: "long-rest" });
  }
  const classCasting: Dnd5eClassSpellcastingState[] = [];
  if (classId === "cleric") { if (!choices.cleric) throw new Error("Cleric requires class spellcasting choices."); classCasting.push(createLevelOneClericSpellcasting(choices.cleric)); }
  else if (classId === "druid") { if (!choices.druid) throw new Error("Druid requires class spellcasting choices."); classCasting.push(createLevelOneDruidSpellcasting(choices.druid)); }
  else if (preparedCasterCatalog(classId)) { if (!choices.preparedCaster) throw new Error(`${classId} requires class spellcasting choices.`); classCasting.push(createLevelOnePreparedCasterSpellcasting(choices.preparedCaster, focusIds)); }
  if (!grants.length && !classCasting.length) return undefined;
  return { grants, ...(classCasting.length ? { classCasting } : {}) };
}

export function guidedBackgroundAbilityIds(backgroundId: GuidedDnd5eBackgroundId) {
  const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((o) => o.id === backgroundId);
  if (!background) throw new Error(`Unknown guided background ${backgroundId}.`);
  return background.abilityScoreIds;
}

function classEquipmentFor(classId: GuidedDnd5eClassId, choices: GuidedDnd5eCoreChoices): { equipment: Dnd5eEquipmentEntry[]; gold: number } {
  const choice = choices.classEquipmentChoice;
  if (choice !== "A") {
    const gold: Record<GuidedDnd5eClassId, number> = { barbarian: 75, bard: 90, cleric: 110, druid: 50, fighter: 155, monk: 50, paladin: 150, ranger: 150, rogue: 100, sorcerer: 50, wizard: 55 };
    if (classId === "fighter" && choice === "B") return { equipment: [{ itemId: "studded-leather-armor", quantity: 1 }, { itemId: "scimitar", quantity: 1 }, { itemId: "shortsword", quantity: 1 }, { itemId: "longbow", quantity: 1 }, { itemId: "arrow", quantity: 20 }, { itemId: "quiver", quantity: 1 }, { itemId: "dungeoneers-pack", quantity: 1 }], gold: 11 };
    return { equipment: [], gold: gold[classId] };
  }
  const packages: Record<GuidedDnd5eClassId, { equipment: Dnd5eEquipmentEntry[]; gold: number }> = {
    barbarian: { equipment: [{ itemId: "greataxe", quantity: 1 }, { itemId: "handaxe", quantity: 4 }, { itemId: "explorers-pack", quantity: 1 }], gold: 15 },
    bard: { equipment: [{ itemId: "leather-armor", quantity: 1 }, { itemId: "dagger", quantity: 2 }, { itemId: choices.bardInstrumentIds?.[0] ?? "musical-instrument:lute", quantity: 1 }, { itemId: "entertainers-pack", quantity: 1 }], gold: 19 },
    cleric: { equipment: [{ itemId: "chain-shirt", quantity: 1 }, { itemId: "shield", quantity: 1 }, { itemId: "mace", quantity: 1 }, { itemId: "holy-symbol", quantity: 1 }, { itemId: "priests-pack", quantity: 1 }], gold: 7 },
    druid: { equipment: [{ itemId: "leather-armor", quantity: 1 }, { itemId: "shield", quantity: 1 }, { itemId: "sickle", quantity: 1 }, { itemId: "druidic-focus:quarterstaff", quantity: 1 }, { itemId: "explorers-pack", quantity: 1 }, { itemId: "herbalism-kit", quantity: 1 }], gold: 9 },
    fighter: { equipment: [{ itemId: "chain-mail", quantity: 1 }, { itemId: "greatsword", quantity: 1 }, { itemId: "flail", quantity: 1 }, { itemId: "javelin", quantity: 8 }, { itemId: "dungeoneers-pack", quantity: 1 }], gold: 4 },
    monk: { equipment: [{ itemId: "spear", quantity: 1 }, { itemId: "dagger", quantity: 5 }, { itemId: choices.monkToolProficiencyId ?? "artisan-tools:calligraphers-supplies", quantity: 1 }, { itemId: "explorers-pack", quantity: 1 }], gold: 11 },
    paladin: { equipment: [{ itemId: "chain-mail", quantity: 1 }, { itemId: "shield", quantity: 1 }, { itemId: "longsword", quantity: 1 }, { itemId: "javelin", quantity: 6 }, { itemId: "holy-symbol", quantity: 1 }, { itemId: "priests-pack", quantity: 1 }], gold: 9 },
    ranger: { equipment: [{ itemId: "studded-leather-armor", quantity: 1 }, { itemId: "scimitar", quantity: 1 }, { itemId: "shortsword", quantity: 1 }, { itemId: "longbow", quantity: 1 }, { itemId: "arrow", quantity: 20 }, { itemId: "quiver", quantity: 1 }, { itemId: "druidic-focus:sprig-of-mistletoe", quantity: 1 }, { itemId: "explorers-pack", quantity: 1 }], gold: 7 },
    rogue: { equipment: [{ itemId: "leather-armor", quantity: 1 }, { itemId: "dagger", quantity: 2 }, { itemId: "shortsword", quantity: 1 }, { itemId: "shortbow", quantity: 1 }, { itemId: "arrow", quantity: 20 }, { itemId: "quiver", quantity: 1 }, { itemId: "thieves-tools", quantity: 1 }, { itemId: "burglars-pack", quantity: 1 }], gold: 8 },
    sorcerer: { equipment: [{ itemId: "spear", quantity: 1 }, { itemId: "dagger", quantity: 2 }, { itemId: "arcane-focus:crystal", quantity: 1 }, { itemId: "dungeoneers-pack", quantity: 1 }], gold: 28 },
    wizard: { equipment: [{ itemId: "dagger", quantity: 2 }, { itemId: "arcane-focus:quarterstaff", quantity: 1 }, { itemId: "robe", quantity: 1 }, { itemId: "spellbook", quantity: 1 }, { itemId: "scholars-pack", quantity: 1 }], gold: 5 },
  };
  return packages[classId];
}
function armorClassFor(classId: GuidedDnd5eClassId, equipmentChoice: string, fightingStyle: string | undefined, abilities: Dnd5eAbilityState): number {
  const dex = abilityModifier(abilities.final.dexterity);
  if (classId === "barbarian") return 10 + dex + abilityModifier(abilities.final.constitution);
  if (classId === "bard") return equipmentChoice === "A" ? 11 + dex : 10 + dex;
  if (classId === "cleric") return equipmentChoice === "A" ? 15 + Math.min(2, dex) : 10 + dex;
  if (classId === "druid") return equipmentChoice === "A" ? 13 + dex : 10 + dex;
  if (classId === "fighter") { const bonus = fightingStyle === "defense" && (equipmentChoice === "A" || equipmentChoice === "B") ? 1 : 0; return equipmentChoice === "A" ? 16 + bonus : equipmentChoice === "B" ? 12 + dex + bonus : 10 + dex; }
  if (classId === "monk") return 10 + dex + abilityModifier(abilities.final.wisdom);
  if (classId === "paladin") return equipmentChoice === "A" ? 18 : 10 + dex;
  if (classId === "ranger") return equipmentChoice === "A" ? 12 + dex : 10 + dex;
  if (classId === "rogue") return (equipmentChoice === "A" ? 11 : 10) + dex;
  return 10 + dex;
}
function label(value: string): string { return value.slice(0, 1).toUpperCase() + value.slice(1); }
