import type { Dnd5eAbilityId } from "./nativeCharacter.js";

export type Dnd5eSrdClassId =
  | "barbarian"
  | "bard"
  | "cleric"
  | "druid"
  | "fighter"
  | "monk"
  | "paladin"
  | "ranger"
  | "rogue"
  | "sorcerer"
  | "warlock"
  | "wizard";

export type Dnd5eSrdSpeciesId =
  | "dragonborn"
  | "dwarf"
  | "elf"
  | "gnome"
  | "goliath"
  | "halfling"
  | "human"
  | "orc"
  | "tiefling";

export type GuidedDnd5eClassId = "barbarian" | "fighter" | "monk" | "rogue";
export type GuidedDnd5eSpeciesId = "dwarf" | "halfling" | "human" | "orc";

export interface Dnd5eSrdClassOption {
  id: Dnd5eSrdClassId;
  label: string;
  primaryAbilityIds: readonly Dnd5eAbilityId[];
  guidedSupported: boolean;
  blockedReason?: string;
}

export interface Dnd5eSrdSpeciesOption {
  id: Dnd5eSrdSpeciesId;
  label: string;
  guidedSupported: boolean;
  blockedReason?: string;
}

export const DND5E_SRD_521_CLASS_OPTIONS: readonly Dnd5eSrdClassOption[] = [
  { id: "barbarian", label: "Barbarian", primaryAbilityIds: ["strength"], guidedSupported: true },
  { id: "bard", label: "Bard", primaryAbilityIds: ["charisma"], guidedSupported: false, blockedReason: "Spellcasting native state is not implemented yet." },
  { id: "cleric", label: "Cleric", primaryAbilityIds: ["wisdom"], guidedSupported: false, blockedReason: "Spellcasting and Divine Order choices are not implemented yet." },
  { id: "druid", label: "Druid", primaryAbilityIds: ["wisdom"], guidedSupported: false, blockedReason: "Spellcasting and Primal Order choices are not implemented yet." },
  { id: "fighter", label: "Fighter", primaryAbilityIds: ["strength", "dexterity"], guidedSupported: true },
  { id: "monk", label: "Monk", primaryAbilityIds: ["dexterity", "wisdom"], guidedSupported: true },
  { id: "paladin", label: "Paladin", primaryAbilityIds: ["strength", "charisma"], guidedSupported: false, blockedReason: "Spellcasting native state is not implemented yet." },
  { id: "ranger", label: "Ranger", primaryAbilityIds: ["dexterity", "wisdom"], guidedSupported: false, blockedReason: "Spellcasting native state is not implemented yet." },
  { id: "rogue", label: "Rogue", primaryAbilityIds: ["dexterity"], guidedSupported: true },
  { id: "sorcerer", label: "Sorcerer", primaryAbilityIds: ["charisma"], guidedSupported: false, blockedReason: "Spellcasting native state is not implemented yet." },
  { id: "warlock", label: "Warlock", primaryAbilityIds: ["charisma"], guidedSupported: false, blockedReason: "Pact Magic and invocation choices are not implemented yet." },
  { id: "wizard", label: "Wizard", primaryAbilityIds: ["intelligence"], guidedSupported: false, blockedReason: "Spellcasting and spellbook native state are not implemented yet." },
] as const;

export const DND5E_SRD_521_SPECIES_OPTIONS: readonly Dnd5eSrdSpeciesOption[] = [
  { id: "dragonborn", label: "Dragonborn", guidedSupported: false, blockedReason: "Draconic Ancestry choice is not implemented yet." },
  { id: "dwarf", label: "Dwarf", guidedSupported: true },
  { id: "elf", label: "Elf", guidedSupported: false, blockedReason: "Elven Lineage and lineage spell choices are not implemented yet." },
  { id: "gnome", label: "Gnome", guidedSupported: false, blockedReason: "Gnomish Lineage and spellcasting-ability choices are not implemented yet." },
  { id: "goliath", label: "Goliath", guidedSupported: false, blockedReason: "Giant Ancestry choice is not implemented yet." },
  { id: "halfling", label: "Halfling", guidedSupported: true },
  { id: "human", label: "Human", guidedSupported: true },
  { id: "orc", label: "Orc", guidedSupported: true },
  { id: "tiefling", label: "Tiefling", guidedSupported: false, blockedReason: "Fiendish Legacy and lineage spell choices are not implemented yet." },
] as const;

export const GUIDED_DND5E_CLASS_IDS = DND5E_SRD_521_CLASS_OPTIONS
  .filter((option): option is Dnd5eSrdClassOption & { id: GuidedDnd5eClassId } => option.guidedSupported)
  .map((option) => option.id);

export const GUIDED_DND5E_SPECIES_IDS = DND5E_SRD_521_SPECIES_OPTIONS
  .filter((option): option is Dnd5eSrdSpeciesOption & { id: GuidedDnd5eSpeciesId } => option.guidedSupported)
  .map((option) => option.id);

export function isGuidedDnd5eClassId(value: string): value is GuidedDnd5eClassId {
  return (GUIDED_DND5E_CLASS_IDS as readonly string[]).includes(value);
}

export function isGuidedDnd5eSpeciesId(value: string): value is GuidedDnd5eSpeciesId {
  return (GUIDED_DND5E_SPECIES_IDS as readonly string[]).includes(value);
}
