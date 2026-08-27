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
  DND5E_SRD_521_BACKGROUND_OPTIONS,
  type GuidedDnd5eBackgroundId,
  type GuidedDnd5eClassId,
  type GuidedDnd5eSpeciesId,
} from "./srdCatalog.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";

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

interface GuidedBackgroundProfile {
  originFeatId: string;
  skillProficiencies: string[];
  toolProficiencyId: string;
  packageEquipment: Dnd5eEquipmentEntry[];
  packageGold: number;
}

const BACKGROUND_PROFILES: Record<GuidedDnd5eBackgroundId, GuidedBackgroundProfile> = {
  criminal: {
    originFeatId: "alert",
    skillProficiencies: ["sleight-of-hand", "stealth"],
    toolProficiencyId: "thieves-tools",
    packageEquipment: [
      { itemId: "dagger", quantity: 2 },
      { itemId: "thieves-tools", quantity: 1 },
      { itemId: "crowbar", quantity: 1 },
      { itemId: "pouch", quantity: 2 },
      { itemId: "travelers-clothes", quantity: 1 },
    ],
    packageGold: 16,
  },
  soldier: {
    originFeatId: "savage-attacker",
    skillProficiencies: ["athletics", "intimidation"],
    toolProficiencyId: "gaming-set:dice",
    packageEquipment: [
      { itemId: "spear", quantity: 1 },
      { itemId: "shortbow", quantity: 1 },
      { itemId: "arrow", quantity: 20 },
      { itemId: "gaming-set:dice", quantity: 1 },
      { itemId: "healers-kit", quantity: 1 },
      { itemId: "quiver", quantity: 1 },
      { itemId: "travelers-clothes", quantity: 1 },
    ],
    packageGold: 14,
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
    featureIds: ["human:resourceful", "human:skillful", "human:versatile"],
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
  backgroundId: GuidedDnd5eBackgroundId;
  speciesId: GuidedDnd5eSpeciesId;
  backgroundEquipmentChoice: "A" | "B:50-gp";
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
      notes: `Level 1 ${label(input.speciesId)} ${label(input.backgroundId)} ${label(input.classId)} built through guided SRD creation.`,
    },
  };
}

export function createGuidedDnd5eFirstSlicePayload(
  input: GuidedDnd5eFirstSliceInput,
): Dnd5eNativeCharacter {
  const classProfile = CLASS_PROFILES[input.classId];
  const backgroundProfile = BACKGROUND_PROFILES[input.backgroundId];
  const speciesProfile = SPECIES_PROFILES[input.speciesId];
  const proficiencyBonus = 2;
  const classSkills = classSkillsForBackground(input.classId, input.backgroundId, classProfile.skillProficiencies);
  const speciesSkillId = input.speciesId === "human"
    ? humanSkill([...classSkills, ...backgroundProfile.skillProficiencies])
    : undefined;
  const speciesOriginFeatId = input.speciesId === "human"
    ? humanOriginFeat(backgroundProfile.originFeatId)
    : undefined;
  const hasPerception = classSkills.includes("perception")
    || backgroundProfile.skillProficiencies.includes("perception")
    || speciesSkillId === "perception";
  const hitPoints = classProfile.hitDie
    + abilityModifier(input.abilities.final.constitution)
    + speciesProfile.hitPointBonus;
  const hasAlert = backgroundProfile.originFeatId === "alert" || speciesOriginFeatId === "alert";
  const initiativeModifier = abilityModifier(input.abilities.final.dexterity)
    + (hasAlert ? proficiencyBonus : 0);
  const passivePerception = 10
    + abilityModifier(input.abilities.final.wisdom)
    + (hasPerception ? proficiencyBonus : 0);

  const origin: Dnd5eOriginState = {
    backgroundId: input.backgroundId,
    speciesId: input.speciesId,
    size: speciesProfile.size,
    speedFeet: speciesProfile.speedFeet,
    languages: ["common", "dwarvish", "elvish"],
    backgroundOriginFeatId: backgroundProfile.originFeatId,
    backgroundSkillProficiencies: [...backgroundProfile.skillProficiencies],
    ...(speciesOriginFeatId ? { speciesOriginFeatId } : {}),
    ...(speciesSkillId ? { speciesSkillId } : {}),
    toolProficiencyId: backgroundProfile.toolProficiencyId,
    backgroundEquipmentChoice: input.backgroundEquipmentChoice,
  };

  const classState: Dnd5eClassState = {
    classId: input.classId,
    level: 1,
    hitDie: classProfile.hitDie,
    proficiencyBonus,
    ...(classProfile.primaryAbilityIds ? { primaryAbilityIds: [...classProfile.primaryAbilityIds] } : {}),
    savingThrowProficiencies: [...classProfile.savingThrowProficiencies],
    skillProficiencies: classSkills,
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

  const backgroundEquipment = input.backgroundEquipmentChoice === "A"
    ? backgroundProfile.packageEquipment.map((entry) => ({ ...entry }))
    : [];
  const backgroundGold = input.backgroundEquipmentChoice === "A"
    ? backgroundProfile.packageGold
    : 50;

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
      `feat:${backgroundProfile.originFeatId}`,
      ...(speciesOriginFeatId ? [`feat:${speciesOriginFeatId}`] : []),
      ...classProfile.featureIds,
    ],
    equipment: [
      ...classProfile.equipment.map((entry) => ({ ...entry })),
      ...backgroundEquipment,
    ],
    currencyGp: classProfile.classGold + backgroundGold,
    resources,
    derived: {
      armorClass: classProfile.armorClass(input.abilities),
      initiativeModifier,
      passivePerception,
    },
  };
}

export function guidedBackgroundAbilityIds(
  backgroundId: GuidedDnd5eBackgroundId,
): readonly [
  "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma",
  "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma",
  "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma",
] {
  const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((option) => option.id === backgroundId);
  if (!background) throw new Error(`Unknown guided background ${backgroundId}.`);
  return background.abilityScoreIds;
}

function classSkillsForBackground(
  classId: GuidedDnd5eClassId,
  backgroundId: GuidedDnd5eBackgroundId,
  baseSkills: readonly string[],
): string[] {
  if (classId === "rogue" && backgroundId === "criminal") {
    return ["acrobatics", "investigation", "perception", "persuasion"];
  }
  return [...baseSkills];
}

function humanSkill(takenSkills: readonly string[]): string {
  const taken = new Set(takenSkills);
  const candidates = ["perception", "persuasion", "animal-handling", "deception", "medicine", "nature"];
  return candidates.find((skill) => !taken.has(skill)) ?? "performance";
}

function humanOriginFeat(backgroundOriginFeatId: string): string {
  return backgroundOriginFeatId === "alert" ? "savage-attacker" : "alert";
}

function label(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
