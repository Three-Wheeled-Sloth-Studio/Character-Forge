import {
  createCharacterDocument,
  createCharacterId,
  createNativeStateId,
  type CharacterDocument,
  type GenerationRecord,
  type NativeSystemState,
} from "../../character-model/src/index.js";
import { DND5E_SKILL_OPTIONS, type GuidedDnd5eCoreChoices } from "./guidedChoices.js";
import { assertGuidedDnd5eCoreChoices } from "./guidedCoreValidation.js";
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
  fixedToolProficiencyIds?: string[];
  featureIds: string[];
  resources: (proficiencyBonus: number) => Partial<Dnd5eResourcesState>;
}

const CLASS_PROFILES: Record<GuidedDnd5eClassId, GuidedClassProfile> = {
  barbarian: {
    hitDie: 12,
    primaryAbilityIds: ["strength"],
    savingThrowProficiencies: ["strength", "constitution"],
    featureIds: ["barbarian:rage", "barbarian:unarmored-defense", "barbarian:weapon-mastery"],
    resources: () => ({ rageMaximum: 2, rageCurrent: 2, rageDamageBonus: 2 }),
  },
  fighter: {
    hitDie: 10,
    primaryAbilityIds: ["strength", "dexterity"],
    savingThrowProficiencies: ["strength", "constitution"],
    featureIds: ["fighter:fighting-style", "fighter:second-wind", "fighter:weapon-mastery"],
    resources: () => ({ secondWindMaximum: 2, secondWindCurrent: 2 }),
  },
  monk: {
    hitDie: 8,
    primaryAbilityIds: ["dexterity", "wisdom"],
    savingThrowProficiencies: ["strength", "dexterity"],
    featureIds: ["monk:martial-arts", "monk:unarmored-defense"],
    resources: () => ({}),
  },
  rogue: {
    hitDie: 8,
    primaryAbilityIds: ["dexterity"],
    savingThrowProficiencies: ["dexterity", "intelligence"],
    fixedToolProficiencyIds: ["thieves-tools"],
    featureIds: ["rogue:expertise", "rogue:sneak-attack:1d6", "rogue:thieves-cant", "rogue:weapon-mastery"],
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
      { itemId: "dagger", quantity: 2 }, { itemId: "thieves-tools", quantity: 1 },
      { itemId: "crowbar", quantity: 1 }, { itemId: "pouch", quantity: 2 },
      { itemId: "travelers-clothes", quantity: 1 },
    ],
    packageGold: 16,
  },
  soldier: {
    originFeatId: "savage-attacker",
    skillProficiencies: ["athletics", "intimidation"],
    toolProficiencyId: "gaming-set:dice",
    packageEquipment: [
      { itemId: "spear", quantity: 1 }, { itemId: "shortbow", quantity: 1 },
      { itemId: "arrow", quantity: 20 }, { itemId: "gaming-set:dice", quantity: 1 },
      { itemId: "healers-kit", quantity: 1 }, { itemId: "quiver", quantity: 1 },
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
    size: "medium", speedFeet: 30,
    featureIds: ["dwarf:darkvision-120", "dwarf:dwarven-resilience", "dwarf:dwarven-toughness", "dwarf:stonecunning"],
    hitPointBonus: 1,
    resources: (proficiencyBonus) => ({ stonecunningMaximum: proficiencyBonus, stonecunningCurrent: proficiencyBonus }),
  },
  halfling: {
    size: "small", speedFeet: 30,
    featureIds: ["halfling:brave", "halfling:nimbleness", "halfling:luck", "halfling:naturally-stealthy"],
    hitPointBonus: 0, resources: () => ({}),
  },
  human: {
    size: "medium", speedFeet: 30,
    featureIds: ["human:resourceful", "human:skillful", "human:versatile"],
    hitPointBonus: 0, resources: () => ({}),
  },
  orc: {
    size: "medium", speedFeet: 30,
    featureIds: ["orc:adrenaline-rush", "orc:darkvision-120", "orc:relentless-endurance"],
    hitPointBonus: 0,
    resources: (proficiencyBonus) => ({
      adrenalineRushMaximum: proficiencyBonus, adrenalineRushCurrent: proficiencyBonus,
      relentlessEnduranceMaximum: 1, relentlessEnduranceCurrent: 1,
    }),
  },
};

export interface GuidedDnd5eFirstSliceInput {
  displayName: string;
  classId: GuidedDnd5eClassId;
  backgroundId: GuidedDnd5eBackgroundId;
  speciesId: GuidedDnd5eSpeciesId;
  backgroundEquipmentChoice: "A" | "B:50-gp";
  coreChoices: GuidedDnd5eCoreChoices;
  abilities: Dnd5eAbilityState;
  generation: GenerationRecord;
}

export function createGuidedDnd5eFirstSliceCharacter(input: GuidedDnd5eFirstSliceInput): CharacterDocument {
  const displayName = input.displayName.trim();
  if (!displayName) throw new Error("Character name is required after generated-name resolution.");
  const nativeState = createGuidedDnd5eFirstSliceNativeState({ ...input, displayName });
  return createCharacterDocument({
    characterId: createCharacterId(), displayName, primaryNativeStateId: nativeState.id,
    nativeStates: [nativeState], generation: input.generation,
  });
}

export function createGuidedDnd5eFirstSliceNativeState(input: GuidedDnd5eFirstSliceInput): NativeSystemState {
  const payload = createGuidedDnd5eFirstSlicePayload(input);
  return {
    id: createNativeStateId(), systemId: "dnd5e", editionId: "2024",
    rulesVersion: DND5E_SRD_5_2_1_SOURCE.version, schemaVersion: "dnd5e-character/0.3", payload,
    provenance: {
      origin: "generated", sourceId: DND5E_SRD_5_2_1_SOURCE.id,
      notes: `Level 1 ${label(input.speciesId)} ${label(input.backgroundId)} ${label(input.classId)} built through guided SRD creation.`,
    },
  };
}

export function createGuidedDnd5eFirstSlicePayload(input: GuidedDnd5eFirstSliceInput): Dnd5eNativeCharacter {
  assertGuidedDnd5eCoreChoices(input.classId, input.backgroundId, input.speciesId, input.coreChoices);
  const classProfile = CLASS_PROFILES[input.classId];
  const backgroundProfile = BACKGROUND_PROFILES[input.backgroundId];
  const speciesProfile = SPECIES_PROFILES[input.speciesId];
  const proficiencyBonus = 2;
  const human = input.speciesId === "human" ? input.coreChoices.human : undefined;
  const speciesSkillId = human?.skillId;
  const speciesOriginFeatId = human?.originFeatId;
  const skilledProficiencies = human?.originFeatId === "skilled" ? (human.skilledProficiencyIds ?? []) : [];
  const skillIdsFromSkilled = skilledProficiencies.filter((id) => DND5E_SKILL_OPTIONS.some((option) => option.id === id));
  const allSkillIds = new Set([
    ...input.coreChoices.classSkillIds,
    ...backgroundProfile.skillProficiencies,
    ...(speciesSkillId ? [speciesSkillId] : []),
    ...skillIdsFromSkilled,
  ]);
  const hitPoints = classProfile.hitDie + abilityModifier(input.abilities.final.constitution) + speciesProfile.hitPointBonus;
  const hasAlert = backgroundProfile.originFeatId === "alert" || speciesOriginFeatId === "alert";
  const initiativeModifier = abilityModifier(input.abilities.final.dexterity) + (hasAlert ? proficiencyBonus : 0);
  const passivePerception = 10 + abilityModifier(input.abilities.final.wisdom) + (allSkillIds.has("perception") ? proficiencyBonus : 0);
  const classEquipment = classEquipmentFor(input.classId, input.coreChoices.classEquipmentChoice, input.coreChoices.monkToolProficiencyId);
  const armorClass = armorClassFor(input.classId, input.coreChoices.classEquipmentChoice, input.coreChoices.fightingStyleFeatId, input.abilities);

  const origin: Dnd5eOriginState = {
    backgroundId: input.backgroundId,
    speciesId: input.speciesId,
    size: human?.size ?? speciesProfile.size,
    speedFeet: speciesProfile.speedFeet,
    languages: ["common", ...input.coreChoices.originLanguageIds],
    backgroundOriginFeatId: backgroundProfile.originFeatId,
    backgroundSkillProficiencies: [...backgroundProfile.skillProficiencies],
    ...(speciesOriginFeatId ? { speciesOriginFeatId } : {}),
    ...(skilledProficiencies.length ? { speciesOriginFeatProficiencyIds: [...skilledProficiencies] } : {}),
    ...(speciesSkillId ? { speciesSkillId } : {}),
    toolProficiencyId: backgroundProfile.toolProficiencyId,
    backgroundEquipmentChoice: input.backgroundEquipmentChoice,
  };

  const toolProficiencyIds = [
    ...(classProfile.fixedToolProficiencyIds ?? []),
    ...(input.coreChoices.monkToolProficiencyId ? [input.coreChoices.monkToolProficiencyId] : []),
  ];
  const classState: Dnd5eClassState = {
    classId: input.classId,
    level: 1,
    hitDie: classProfile.hitDie,
    proficiencyBonus,
    ...(classProfile.primaryAbilityIds ? { primaryAbilityIds: [...classProfile.primaryAbilityIds] } : {}),
    savingThrowProficiencies: [...classProfile.savingThrowProficiencies],
    skillProficiencies: [...input.coreChoices.classSkillIds],
    ...(input.coreChoices.expertiseSkillIds?.length ? { expertiseSkillIds: [...input.coreChoices.expertiseSkillIds] } : {}),
    ...(toolProficiencyIds.length ? { toolProficiencyIds } : {}),
    ...(input.coreChoices.rogueBonusLanguageId ? { bonusLanguageIds: ["thieves-cant", input.coreChoices.rogueBonusLanguageId] } : {}),
    ...(input.coreChoices.fightingStyleFeatId ? { fightingStyleFeatId: input.coreChoices.fightingStyleFeatId } : {}),
    weaponMasteryIds: [...input.coreChoices.weaponMasteryIds],
    classEquipmentChoice: input.coreChoices.classEquipmentChoice,
  };

  const resources: Dnd5eResourcesState = {
    hitPointsMaximum: hitPoints, hitPointsCurrent: hitPoints, hitDiceTotal: 1, hitDiceSpent: 0,
    ...classProfile.resources(proficiencyBonus), ...speciesProfile.resources(proficiencyBonus),
  };

  const backgroundEquipment = input.backgroundEquipmentChoice === "A"
    ? backgroundProfile.packageEquipment.map((entry) => ({ ...entry })) : [];
  const backgroundGold = input.backgroundEquipmentChoice === "A" ? backgroundProfile.packageGold : 50;

  return {
    schemaVersion: "dnd5e-character/0.3",
    rulesSourceIds: [DND5E_SRD_5_2_1_SOURCE.id],
    identity: { name: input.displayName, level: 1, experiencePoints: 0, alignment: input.coreChoices.alignmentId },
    origin,
    abilities: input.abilities,
    class: classState,
    featureIds: [
      ...speciesProfile.featureIds,
      `feat:${backgroundProfile.originFeatId}`,
      ...(speciesOriginFeatId ? [`feat:${speciesOriginFeatId}`] : []),
      ...classProfile.featureIds,
      ...(input.coreChoices.fightingStyleFeatId ? [`fighting-style:${input.coreChoices.fightingStyleFeatId}`] : []),
    ],
    equipment: [...classEquipment.equipment, ...backgroundEquipment],
    currencyGp: classEquipment.gold + backgroundGold,
    resources,
    derived: { armorClass, initiativeModifier, passivePerception },
  };
}

export function guidedBackgroundAbilityIds(backgroundId: GuidedDnd5eBackgroundId): readonly [
  "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma",
  "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma",
  "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma",
] {
  const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((option) => option.id === backgroundId);
  if (!background) throw new Error(`Unknown guided background ${backgroundId}.`);
  return background.abilityScoreIds;
}

function classEquipmentFor(
  classId: GuidedDnd5eClassId,
  choice: string,
  monkToolProficiencyId?: string,
): { equipment: Dnd5eEquipmentEntry[]; gold: number } {
  if (classId === "barbarian") {
    return choice === "A"
      ? { equipment: [{ itemId: "greataxe", quantity: 1 }, { itemId: "handaxe", quantity: 4 }, { itemId: "explorers-pack", quantity: 1 }], gold: 15 }
      : { equipment: [], gold: 75 };
  }
  if (classId === "fighter") {
    if (choice === "A") return { equipment: [
      { itemId: "chain-mail", quantity: 1 }, { itemId: "greatsword", quantity: 1 }, { itemId: "flail", quantity: 1 },
      { itemId: "javelin", quantity: 8 }, { itemId: "dungeoneers-pack", quantity: 1 },
    ], gold: 4 };
    if (choice === "B") return { equipment: [
      { itemId: "studded-leather-armor", quantity: 1 }, { itemId: "scimitar", quantity: 1 }, { itemId: "shortsword", quantity: 1 },
      { itemId: "longbow", quantity: 1 }, { itemId: "arrow", quantity: 20 }, { itemId: "quiver", quantity: 1 },
      { itemId: "dungeoneers-pack", quantity: 1 },
    ], gold: 11 };
    return { equipment: [], gold: 155 };
  }
  if (classId === "monk") {
    return choice === "A"
      ? { equipment: [
        { itemId: "spear", quantity: 1 }, { itemId: "dagger", quantity: 5 },
        { itemId: monkToolProficiencyId ?? "artisan-tools:calligraphers-supplies", quantity: 1 },
        { itemId: "explorers-pack", quantity: 1 },
      ], gold: 11 }
      : { equipment: [], gold: 50 };
  }
  return choice === "A"
    ? { equipment: [
      { itemId: "leather-armor", quantity: 1 }, { itemId: "dagger", quantity: 2 }, { itemId: "shortsword", quantity: 1 },
      { itemId: "shortbow", quantity: 1 }, { itemId: "arrow", quantity: 20 }, { itemId: "quiver", quantity: 1 },
      { itemId: "thieves-tools", quantity: 1 }, { itemId: "burglars-pack", quantity: 1 },
    ], gold: 8 }
    : { equipment: [], gold: 100 };
}

function armorClassFor(
  classId: GuidedDnd5eClassId,
  equipmentChoice: string,
  fightingStyleFeatId: string | undefined,
  abilities: Dnd5eAbilityState,
): number {
  const dexterity = abilityModifier(abilities.final.dexterity);
  if (classId === "barbarian") return 10 + dexterity + abilityModifier(abilities.final.constitution);
  if (classId === "monk") return 10 + dexterity + abilityModifier(abilities.final.wisdom);
  if (classId === "rogue") return (equipmentChoice === "A" ? 11 : 10) + dexterity;
  const armored = equipmentChoice === "A" || equipmentChoice === "B";
  const defenseBonus = fightingStyleFeatId === "defense" && armored ? 1 : 0;
  if (equipmentChoice === "A") return 16 + defenseBonus;
  if (equipmentChoice === "B") return 12 + dexterity + defenseBonus;
  return 10 + dexterity;
}

function label(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
