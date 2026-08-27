import {
  createCharacterDocument,
  createCharacterId,
  createNativeStateId,
  type CharacterDocument,
  type GenerationRecord,
  type NativeSystemState,
} from "../../character-model/src/index.js";
import {
  abilityModifier,
  type Dnd5eAbilityState,
  type Dnd5eClassState,
  type Dnd5eEquipmentEntry,
  type Dnd5eNativeCharacter,
  type Dnd5eOriginState,
  type Dnd5eResourcesState,
} from "./nativeCharacter.js";
import {
  type GuidedDnd5eClassId,
  type GuidedDnd5eSpeciesId,
} from "./srdCatalog.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";

const SOLDIER_SKILL_PROFICIENCIES = ["athletics", "intimidation"] as const;
const SOLDIER_BACKGROUND_ORIGIN_FEAT_ID = "savage-attacker";

interface GuidedClassProfile {
  hitDie: number;
  primaryAbilityIds: Dnd5eClassState["primaryAbilityIds"];
  savingThrowProficiencies: string[];
  skillProficiencies: string[];
  expertiseSkillIds?: string[];
  toolProficiencyIds?: string[];
  fightingStyleFeatId?: string;
  weaponMasteryIds: string[];
  featureIds: string[];
  equipment: Dnd5eEquipmentEntry[];
  classGold: number;
  armorClass: (abilities: Dnd5eAbilityState) => number;
  resources: (proficiencyBonus: number) => Partial<Dnd5eResourcesState>;
}

const CLASS_PROFILES: Record<GuidedDnd5eClassId, GuidedClassProfile> = {
  barbarian: {
    hitDie: 12,
    primaryAbilityIds: ["strength"],
    savingThrowProficiencies: ["strength", "constitution"],
    skillProficiencies: ["perception", "survival"],
    weaponMasteryIds: ["greataxe", "handaxe"],
    featureIds: ["barbarian:rage", "barbarian:unarmored-defense", "barbarian:weapon-mastery"],
    equipment: [
      { itemId: "greataxe", quantity: 1 },
      { itemId: "handaxe", quantity: 4 },
      { itemId: "explorers-pack", quantity: 1 },
    ],
    classGold: 15,
    armorClass: (abilities) => 10 + abilityModifier(abilities.final.dexterity) + abilityModifier(abilities.final.constitution),
    resources: () => ({ rageMaximum: 2, rageCurrent: 2, rageDamageBonus: 2 }),
  },
  fighter: {
    hitDie: 10,
    primaryAbilityIds: ["strength", "dexterity"],
    savingThrowProficiencies: ["strength", "constitution"],
    skillProficiencies: ["acrobatics", "history"],
    fightingStyleFeatId: "defense",
    weaponMasteryIds: ["greatsword", "flail", "javelin"],
    featureIds: [
      "fighter:fighting-style",
      "fighter:second-wind",
      "fighter:weapon-mastery",
      "fighting-style:defense",
    ],
    equipment: [
      { itemId: "chain-mail", quantity: 1 },
      { itemId: "greatsword", quantity: 1 },
      { itemId: "flail", quantity: 1 },
      { itemId: "javelin", quantity: 8 },
      { itemId: "dungeoneers-pack", quantity: 1 },
    ],
    classGold: 4,
    armorClass: () => 17,
    resources: () => ({ secondWindMaximum: 2, secondWindCurrent: 2 }),
  },
  monk: {
    hitDie: 8,
    primaryAbilityIds: ["dexterity", "wisdom"],
    savingThrowProficiencies: ["strength", "dexterity"],
    skillProficiencies: ["acrobatics", "insight"],
    toolProficiencyIds: ["artisan-tools:calligraphers-supplies"],
    weaponMasteryIds: [],
    featureIds: ["monk:martial-arts", "monk:unarmored-defense"],
    equipment: [
      { itemId: "spear", quantity: 1 },
      { itemId: "dagger", quantity: 5 },
      { itemId: "calligraphers-supplies", quantity: 1 },
      { itemId: "explorers-pack", quantity: 1 },
    ],
    classGold: 11,
    armorClass: (abilities) => 10 + abilityModifier(abilities.final.dexterity) + abilityModifier(abilities.final.wisdom),
    resources: () => ({}),
  },
  rogue: {
    hitDie: 8,
    primaryAbilityIds: ["dexterity"],
    savingThrowProficiencies: ["dexterity", "intelligence"],
    skillProficiencies: ["acrobatics", "investigation", "perception", "stealth"],
    expertiseSkillIds: ["perception", "stealth"],
    toolProficiencyIds: ["thieves-tools"],
    weaponMasteryIds: ["dagger", "shortbow"],
    featureIds: ["rogue:expertise", "rogue:sneak-attack:1d6", "rogue:thieves-cant", "rogue:weapon-mastery"],
    equipment: [
      { itemId: "leather-armor", quantity: 1 },
      { itemId: "dagger", quantity: 2 },
      { itemId: "shortsword", quantity: 1 },
      { itemId: "shortbow", quantity: 1 },
      { itemId: "arrow", quantity: 20 },
      { itemId: "quiver", quantity: 1 },
      { itemId: "thieves-tools", quantity: 1 },
      { itemId: "burglars-pack", quantity: 1 },
    ],
    classGold: 8,
    armorClass: (abilities) => 11 + abilityModifier(abilities.final.dexterity),
    resources: () => ({}),
  },
};

interface GuidedSpeciesProfile {
  size: "small" | "medium";
  speedFeet: number;
  featureIds: string[];
  hitPointBonus: number;
  resources: (proficiencyBonus: number) => Partial<Dnd5eResourcesState>;
}

const SPECIES_PROFILES: Record<GuidedDnd5eSpeciesId, GuidedSpeciesProfile> = {
  dwarf: {
    size: "medium",
    speedFeet: 30,
    featureIds: ["dwarf:darkvision-120", "dwarf:dwarven-resilience", "dwarf:dwarven-toughness", "dwarf:stonecunning"],
    hitPointBonus: 1,
    resources: (proficiencyBonus) => ({ stonecunningMaximum: proficiencyBonus, stonecunningCurrent: proficiencyBonus }),
  },
  halfling: {
    size: "small",
    speedFeet: 30,
    featureIds: ["halfling:brave", "halfling:nimbleness", "halfling:luck", "halfling:naturally-stealthy"],
    hitPointBonus: 0,
    resources: () => ({}),
  },
  human: {
    size: "medium",
    speedFeet: 30,
    featureIds: ["human:resourceful", "human:skillful", "human:versatile", "feat:alert"],
    hitPointBonus: 0,
    resources: () => ({}),
  },
  orc: {
    size: "medium",
    speedFeet: 30,
    featureIds: ["orc:adrenaline-rush", "orc:darkvision-120", "orc:relentless-endurance"],
    hitPointBonus: 0,
    resources: (proficiencyBonus) => ({
      adrenalineRushMaximum: proficiencyBonus,
      adrenalineRushCurrent: proficiencyBonus,
      relentlessEnduranceMaximum: 1,
      relentlessEnduranceCurrent: 1,
    }),
  },
};

export interface GuidedDnd5eFirstSliceInput {
  displayName: string;
  classId: GuidedDnd5eClassId;
  speciesId: GuidedDnd5eSpeciesId;
  abilities: Dnd5eAbilityState;
  generation: GenerationRecord;
}

export function createGuidedDnd5eFirstSliceCharacter(
  input: GuidedDnd5eFirstSliceInput,
): CharacterDocument {
  const displayName = input.displayName.trim();
  if (!displayName) throw new Error("Character name is required.");

  const nativeState = createGuidedDnd5eFirstSliceNativeState({ ...input, displayName });
  return createCharacterDocument({
    characterId: createCharacterId(),
    displayName,
    primaryNativeStateId: nativeState.id,
    nativeStates: [nativeState],
    generation: input.generation,
  });
}

export function createGuidedDnd5eFirstSliceNativeState(
  input: GuidedDnd5eFirstSliceInput,
): NativeSystemState {
  const payload = createGuidedDnd5eFirstSlicePayload(input);
  return {
    id: createNativeStateId(),
    systemId: "dnd5e",
    editionId: "2024",
    rulesVersion: DND5E_SRD_5_2_1_SOURCE.version,
    schemaVersion: "dnd5e-character/0.2",
    payload,
    provenance: {
      origin: "generated",
      sourceId: DND5E_SRD_5_2_1_SOURCE.id,
      notes: `Level 1 ${label(input.speciesId)} Soldier ${label(input.classId)} built through guided SRD creation.`,
    },
  };
}

export function createGuidedDnd5eFirstSlicePayload(
  input: GuidedDnd5eFirstSliceInput,
): Dnd5eNativeCharacter {
  const classProfile = CLASS_PROFILES[input.classId];
  const speciesProfile = SPECIES_PROFILES[input.speciesId];
  const proficiencyBonus = 2;
  const speciesSkillId = input.speciesId === "human"
    ? humanSkillForClass(input.classId, classProfile.skillProficiencies)
    : undefined;
  const speciesOriginFeatId = input.speciesId === "human" ? "alert" : undefined;
  const hasPerception = classProfile.skillProficiencies.includes("perception")
    || speciesSkillId === "perception";
  const hitPoints = classProfile.hitDie
    + abilityModifier(input.abilities.final.constitution)
    + speciesProfile.hitPointBonus;
  const initiativeModifier = abilityModifier(input.abilities.final.dexterity)
    + (speciesOriginFeatId === "alert" ? proficiencyBonus : 0);
  const passivePerception = 10
    + abilityModifier(input.abilities.final.wisdom)
    + (hasPerception ? proficiencyBonus : 0);

  const origin: Dnd5eOriginState = {
    backgroundId: "soldier",
    speciesId: input.speciesId,
    size: speciesProfile.size,
    speedFeet: speciesProfile.speedFeet,
    languages: ["common", "dwarvish", "elvish"],
    backgroundOriginFeatId: SOLDIER_BACKGROUND_ORIGIN_FEAT_ID,
    backgroundSkillProficiencies: [...SOLDIER_SKILL_PROFICIENCIES],
    ...(speciesOriginFeatId ? { speciesOriginFeatId } : {}),
    ...(speciesSkillId ? { speciesSkillId } : {}),
    toolProficiencyId: "gaming-set:dice",
    backgroundEquipmentChoice: "B:50-gp",
  };

  const classState: Dnd5eClassState = {
    classId: input.classId,
    level: 1,
    hitDie: classProfile.hitDie,
    proficiencyBonus,
    ...(classProfile.primaryAbilityIds ? { primaryAbilityIds: [...classProfile.primaryAbilityIds] } : {}),
    savingThrowProficiencies: [...classProfile.savingThrowProficiencies],
    skillProficiencies: [...classProfile.skillProficiencies],
    ...(classProfile.expertiseSkillIds ? { expertiseSkillIds: [...classProfile.expertiseSkillIds] } : {}),
    ...(classProfile.toolProficiencyIds ? { toolProficiencyIds: [...classProfile.toolProficiencyIds] } : {}),
    ...(classProfile.fightingStyleFeatId ? { fightingStyleFeatId: classProfile.fightingStyleFeatId } : {}),
    weaponMasteryIds: [...classProfile.weaponMasteryIds],
    classEquipmentChoice: "A",
  };

  const resources: Dnd5eResourcesState = {
    hitPointsMaximum: hitPoints,
    hitPointsCurrent: hitPoints,
    hitDiceTotal: 1,
    hitDiceSpent: 0,
    ...classProfile.resources(proficiencyBonus),
    ...speciesProfile.resources(proficiencyBonus),
  };

  return {
    schemaVersion: "dnd5e-character/0.2",
    rulesSourceIds: [DND5E_SRD_5_2_1_SOURCE.id],
    identity: {
      name: input.displayName,
      level: 1,
      experiencePoints: 0,
      alignment: "neutral-good",
    },
    origin,
    abilities: input.abilities,
    class: classState,
    featureIds: [
      ...speciesProfile.featureIds,
      "feat:savage-attacker",
      ...classProfile.featureIds,
    ],
    equipment: classProfile.equipment.map((entry) => ({ ...entry })),
    currencyGp: 50 + classProfile.classGold,
    resources,
    derived: {
      armorClass: classProfile.armorClass(input.abilities),
      initiativeModifier,
      passivePerception,
    },
  };
}

function humanSkillForClass(
  classId: GuidedDnd5eClassId,
  classSkills: readonly string[],
): string {
  if (!classSkills.includes("perception")) return "perception";
  return classId === "rogue" ? "persuasion" : "animal-handling";
}

function label(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
