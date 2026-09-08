import type { Dnd5eSpellcastingAbilityId } from "./nativeCharacter.js";

export type Dnd5eElfLineageId = "drow" | "high" | "wood";
export type Dnd5eGnomeLineageId = "forest" | "rock";
export type Dnd5eTieflingLegacyId = "abyssal" | "chthonic" | "infernal";

export interface GuidedDnd5eElfChoices {
  lineageId: Dnd5eElfLineageId;
  spellcastingAbilityId: Dnd5eSpellcastingAbilityId;
  keenSensesSkillId: "insight" | "perception" | "survival";
}

export interface GuidedDnd5eGnomeChoices {
  lineageId: Dnd5eGnomeLineageId;
  spellcastingAbilityId: Dnd5eSpellcastingAbilityId;
}

export interface GuidedDnd5eTieflingChoices {
  size: "small" | "medium";
  legacyId: Dnd5eTieflingLegacyId;
  spellcastingAbilityId: Dnd5eSpellcastingAbilityId;
}

export interface Dnd5eLevelGatedSpeciesSpell {
  characterLevel: 3 | 5;
  spellId: string;
}

export interface Dnd5eElfLineageOption {
  id: Dnd5eElfLineageId;
  label: string;
  darkvisionFeet: 60 | 120;
  speedFeet: 30 | 35;
  initialCantripId: string;
  cantripReplacementListId?: "wizard";
  levelGatedSpells: readonly [Dnd5eLevelGatedSpeciesSpell, Dnd5eLevelGatedSpeciesSpell];
}

export const DND5E_ELF_LINEAGE_OPTIONS: readonly Dnd5eElfLineageOption[] = [
  {
    id: "drow",
    label: "Drow",
    darkvisionFeet: 120,
    speedFeet: 30,
    initialCantripId: "dancing-lights",
    levelGatedSpells: [
      { characterLevel: 3, spellId: "faerie-fire" },
      { characterLevel: 5, spellId: "darkness" },
    ],
  },
  {
    id: "high",
    label: "High Elf",
    darkvisionFeet: 60,
    speedFeet: 30,
    initialCantripId: "prestidigitation",
    cantripReplacementListId: "wizard",
    levelGatedSpells: [
      { characterLevel: 3, spellId: "detect-magic" },
      { characterLevel: 5, spellId: "misty-step" },
    ],
  },
  {
    id: "wood",
    label: "Wood Elf",
    darkvisionFeet: 60,
    speedFeet: 35,
    initialCantripId: "druidcraft",
    levelGatedSpells: [
      { characterLevel: 3, spellId: "longstrider" },
      { characterLevel: 5, spellId: "pass-without-trace" },
    ],
  },
] as const;

export const DND5E_ELF_KEEN_SENSES_SKILL_OPTIONS = [
  { id: "insight", label: "Insight" },
  { id: "perception", label: "Perception" },
  { id: "survival", label: "Survival" },
] as const;

export interface Dnd5eGnomeLineageOption {
  id: Dnd5eGnomeLineageId;
  label: string;
  cantripIds: readonly string[];
  alwaysPreparedSpellIds: readonly string[];
  freeCastMode?: "proficiency-bonus-per-long-rest";
  clockworkDeviceCapacity?: number;
}

export const DND5E_GNOME_LINEAGE_OPTIONS: readonly Dnd5eGnomeLineageOption[] = [
  {
    id: "forest",
    label: "Forest Gnome",
    cantripIds: ["minor-illusion"],
    alwaysPreparedSpellIds: ["speak-with-animals"],
    freeCastMode: "proficiency-bonus-per-long-rest",
  },
  {
    id: "rock",
    label: "Rock Gnome",
    cantripIds: ["mending", "prestidigitation"],
    alwaysPreparedSpellIds: [],
    clockworkDeviceCapacity: 3,
  },
] as const;

export interface Dnd5eTieflingLegacyOption {
  id: Dnd5eTieflingLegacyId;
  label: string;
  resistanceDamageType: "poison" | "necrotic" | "fire";
  legacyCantripId: string;
  levelGatedSpells: readonly [Dnd5eLevelGatedSpeciesSpell, Dnd5eLevelGatedSpeciesSpell];
}

export const DND5E_TIEFLING_LEGACY_OPTIONS: readonly Dnd5eTieflingLegacyOption[] = [
  {
    id: "abyssal",
    label: "Abyssal",
    resistanceDamageType: "poison",
    legacyCantripId: "poison-spray",
    levelGatedSpells: [
      { characterLevel: 3, spellId: "ray-of-sickness" },
      { characterLevel: 5, spellId: "hold-person" },
    ],
  },
  {
    id: "chthonic",
    label: "Chthonic",
    resistanceDamageType: "necrotic",
    legacyCantripId: "chill-touch",
    levelGatedSpells: [
      { characterLevel: 3, spellId: "false-life" },
      { characterLevel: 5, spellId: "ray-of-enfeeblement" },
    ],
  },
  {
    id: "infernal",
    label: "Infernal",
    resistanceDamageType: "fire",
    legacyCantripId: "fire-bolt",
    levelGatedSpells: [
      { characterLevel: 3, spellId: "hellish-rebuke" },
      { characterLevel: 5, spellId: "darkness" },
    ],
  },
] as const;

export function elfLineage(id: Dnd5eElfLineageId): Dnd5eElfLineageOption {
  const option = DND5E_ELF_LINEAGE_OPTIONS.find((candidate) => candidate.id === id);
  if (!option) throw new Error(`Unknown Elven Lineage ${id}.`);
  return option;
}

export function gnomeLineage(id: Dnd5eGnomeLineageId): Dnd5eGnomeLineageOption {
  const option = DND5E_GNOME_LINEAGE_OPTIONS.find((candidate) => candidate.id === id);
  if (!option) throw new Error(`Unknown Gnomish Lineage ${id}.`);
  return option;
}

export function tieflingLegacy(id: Dnd5eTieflingLegacyId): Dnd5eTieflingLegacyOption {
  const option = DND5E_TIEFLING_LEGACY_OPTIONS.find((candidate) => candidate.id === id);
  if (!option) throw new Error(`Unknown Fiendish Legacy ${id}.`);
  return option;
}
