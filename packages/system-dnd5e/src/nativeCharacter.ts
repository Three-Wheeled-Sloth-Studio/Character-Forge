import type { JsonObject } from "../../character-model/src/index.js";

export const DND5E_ABILITY_IDS = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
] as const;

export type Dnd5eAbilityId = (typeof DND5E_ABILITY_IDS)[number];
export type Dnd5eSpellcastingAbilityId = "intelligence" | "wisdom" | "charisma";

export interface Dnd5eAbilityScores extends JsonObject {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Dnd5eAbilityState extends JsonObject {
  generationMethod: "standard-array" | "manual" | "point-cost" | "random";
  base: Dnd5eAbilityScores;
  backgroundIncreases: Dnd5eAbilityScores;
  final: Dnd5eAbilityScores;
}

export interface Dnd5eIdentityState extends JsonObject {
  name: string;
  level: number;
  experiencePoints: number;
  alignment: string;
}

export interface Dnd5eOriginState extends JsonObject {
  backgroundId: string;
  speciesId: string;
  size: "small" | "medium";
  speedFeet: number;
  languages: string[];
  backgroundOriginFeatId: string;
  backgroundSkillProficiencies?: string[];
  speciesOriginFeatId?: string;
  speciesOriginFeatProficiencyIds?: string[];
  speciesSkillId?: string;
  speciesAncestryId?: string;
  speciesDamageType?: string;
  toolProficiencyId: string;
  backgroundEquipmentChoice: string;
}

export interface Dnd5eClassState extends JsonObject {
  classId: string;
  level: number;
  hitDie: number;
  proficiencyBonus: number;
  primaryAbilityIds?: Dnd5eAbilityId[];
  savingThrowProficiencies: string[];
  skillProficiencies: string[];
  expertiseSkillIds?: string[];
  toolProficiencyIds?: string[];
  bonusLanguageIds?: string[];
  fightingStyleFeatId?: string;
  weaponMasteryIds: string[];
  classEquipmentChoice: string;
  divineOrderId?: string;
  weaponProficiencyIds?: string[];
  armorTrainingIds?: string[];
  spellcastingFocusIds?: string[];
  thaumaturgeKnowledgeBonus?: number;
}

export interface Dnd5eSpellGrantState extends JsonObject {
  grantId: string;
  sourceId: string;
  spellListId: string;
  spellcastingAbilityId: Dnd5eSpellcastingAbilityId;
  cantripIds: string[];
  preparedSpellIds: string[];
  alwaysPreparedSpellIds: string[];
  freeCastSpellId: string;
  freeCastMaximum: number;
  freeCastCurrent: number;
  freeCastRecharge: "long-rest";
}

export interface Dnd5eSpellSlotState extends JsonObject {
  level: number;
  maximum: number;
  current: number;
  recharge: "long-rest";
}

export interface Dnd5eClassSpellcastingState extends JsonObject {
  sourceClassId: string;
  featureId: string;
  spellListId: string;
  spellcastingAbilityId: Dnd5eSpellcastingAbilityId;
  cantripIds: string[];
  preparedSpellIds: string[];
  alwaysPreparedSpellIds: string[];
  spellSlots: Dnd5eSpellSlotState[];
  preparationChange: "long-rest-any" | "long-rest-one" | "level-one";
  focusItemIds?: string[];
}

export interface Dnd5eSpellState extends JsonObject {
  grants: Dnd5eSpellGrantState[];
  classCasting?: Dnd5eClassSpellcastingState[];
}

export interface Dnd5eEquipmentEntry extends JsonObject {
  itemId: string;
  quantity: number;
}

export interface Dnd5eResourcesState extends JsonObject {
  hitPointsMaximum: number;
  hitPointsCurrent: number;
  hitDiceTotal: number;
  hitDiceSpent: number;
  secondWindMaximum?: number;
  secondWindCurrent?: number;
  rageMaximum?: number;
  rageCurrent?: number;
  rageDamageBonus?: number;
  stonecunningMaximum?: number;
  stonecunningCurrent?: number;
  adrenalineRushMaximum?: number;
  adrenalineRushCurrent?: number;
  relentlessEnduranceMaximum?: number;
  relentlessEnduranceCurrent?: number;
  breathWeaponMaximum?: number;
  breathWeaponCurrent?: number;
  giantAncestryMaximum?: number;
  giantAncestryCurrent?: number;
}

export interface Dnd5eDerivedState extends JsonObject {
  armorClass: number;
  initiativeModifier: number;
  passivePerception: number;
}

export interface Dnd5eNativeCharacter extends JsonObject {
  schemaVersion: "dnd5e-character/0.1" | "dnd5e-character/0.2" | "dnd5e-character/0.3";
  rulesSourceIds: string[];
  identity: Dnd5eIdentityState;
  origin: Dnd5eOriginState;
  abilities: Dnd5eAbilityState;
  class: Dnd5eClassState;
  spells?: Dnd5eSpellState;
  featureIds: string[];
  equipment: Dnd5eEquipmentEntry[];
  currencyGp: number;
  resources: Dnd5eResourcesState;
  derived: Dnd5eDerivedState;
}

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}
