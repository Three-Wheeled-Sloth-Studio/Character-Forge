import type { JsonObject } from "../../character-model/src/index.js";

export type BrpPowerLevel = "normal";
export type BrpCharacteristicGeneration = "explicit";
export type BrpWealthLevel = "average" | "affluent";

export interface BrpRulesProfile extends JsonObject {
  powerLevel: BrpPowerLevel;
  characteristicGeneration: BrpCharacteristicGeneration;
  enabledOptions: string[];
  enabledPowerSystems: string[];
}

export interface BrpCharacteristicState extends JsonObject {
  initial: number;
  adjustments: BrpCharacteristicAdjustment[];
  final: number;
}

export interface BrpCharacteristicAdjustment extends JsonObject {
  sourceId: string;
  amount: number;
}

export interface BrpCharacteristics extends JsonObject {
  STR: BrpCharacteristicState;
  CON: BrpCharacteristicState;
  SIZ: BrpCharacteristicState;
  INT: BrpCharacteristicState;
  POW: BrpCharacteristicState;
  DEX: BrpCharacteristicState;
  CHA: BrpCharacteristicState;
}

export interface BrpCharacteristicRolls extends JsonObject {
  effort: number;
  stamina: number;
  idea: number;
  luck: number;
  agility: number;
  charisma: number;
}

export type BrpDamageModifier = "-1D6" | "-1D4" | "None" | "+1D4" | "+1D6" | "+2D6";

export interface BrpDerivedState extends JsonObject {
  hitPoints: number;
  majorWoundLevel: number;
  powerPoints: number;
  experienceBonus: number;
  move: number;
  damageModifier: BrpDamageModifier;
}

export interface BrpSkillSpecialty extends JsonObject {
  id: string;
  label: string;
}

export interface BrpSkillContributions extends JsonObject {
  professional: number;
  personal: number;
}

export interface BrpSkillState extends JsonObject {
  skillId: string;
  label: string;
  specialty: BrpSkillSpecialty | null;
  baseChance: number;
  contributions: BrpSkillContributions;
  finalRating: number;
}

export interface BrpSkillBudget extends JsonObject {
  total: number;
  spent: number;
}

export interface BrpSkillBudgets extends JsonObject {
  professional: BrpSkillBudget;
  personal: BrpSkillBudget;
}

export interface BrpProfessionState extends JsonObject {
  professionId: "detective";
  wealth: BrpWealthLevel;
  selectedElectiveSkillIds: string[];
}

export interface BrpIdentityState extends JsonObject {
  age: number;
  gender: string;
  profession: BrpProfessionState;
}

export interface BrpNativeCharacter extends JsonObject {
  schemaVersion: "brp-character/0.1";
  rulesSourceIds: string[];
  rulesProfile: BrpRulesProfile;
  identity: BrpIdentityState;
  characteristics: BrpCharacteristics;
  characteristicRolls: BrpCharacteristicRolls;
  derived: BrpDerivedState;
  skillBudgets: BrpSkillBudgets;
  skills: BrpSkillState[];
  equipment: string[];
}

export interface BrpCharacteristicValues {
  STR: number;
  CON: number;
  SIZ: number;
  INT: number;
  POW: number;
  DEX: number;
  CHA: number;
}
