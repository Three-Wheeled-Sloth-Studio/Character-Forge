import {
  createCharacterDocument,
  type CharacterDocument,
  type NativeSystemState,
} from "../../character-model/src/index.js";
import {
  createStandardArrayAbilityState,
  type Dnd5eAbilityIncreasePlan,
} from "./abilityGeneration.js";
import {
  abilityModifier,
  type Dnd5eAbilityId,
  type Dnd5eAbilityScores,
  type Dnd5eNativeCharacter,
} from "./nativeCharacter.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";

export const FIRST_SLICE_NATIVE_STATE_ID = "native-dnd5e-avery-stone";

export const SOLDIER_BACKGROUND_ABILITY_IDS = [
  "strength",
  "dexterity",
  "constitution",
] as const satisfies readonly Dnd5eAbilityId[];

export interface FirstSliceAbilityChoices {
  assignment: Dnd5eAbilityScores;
  backgroundIncreases: Dnd5eAbilityIncreasePlan;
}

export const DEFAULT_FIRST_SLICE_ABILITY_CHOICES: FirstSliceAbilityChoices = {
  assignment: {
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 8,
    wisdom: 10,
    charisma: 12,
  },
  backgroundIncreases: {
    strength: 2,
    constitution: 1,
  },
};

export function createFirstSliceNativePayload(
  abilityChoices: FirstSliceAbilityChoices = DEFAULT_FIRST_SLICE_ABILITY_CHOICES,
): Dnd5eNativeCharacter {
  const abilities = createStandardArrayAbilityState({
    assignment: abilityChoices.assignment,
    backgroundAbilityIds: SOLDIER_BACKGROUND_ABILITY_IDS,
    backgroundIncreases: abilityChoices.backgroundIncreases,
  });
  const constitutionModifier = abilityModifier(abilities.final.constitution);
  const dexterityModifier = abilityModifier(abilities.final.dexterity);
  const wisdomModifier = abilityModifier(abilities.final.wisdom);
  const proficiencyBonus = 2;

  return {
    schemaVersion: "dnd5e-character/0.1",
    rulesSourceIds: [DND5E_SRD_5_2_1_SOURCE.id],
    identity: {
      name: "Avery Stone",
      level: 1,
      experiencePoints: 0,
      alignment: "neutral-good",
    },
    origin: {
      backgroundId: "soldier",
      speciesId: "human",
      size: "medium",
      speedFeet: 30,
      languages: ["common", "dwarvish", "elvish"],
      backgroundOriginFeatId: "savage-attacker",
      speciesOriginFeatId: "alert",
      speciesSkillId: "perception",
      toolProficiencyId: "gaming-set:dice",
      backgroundEquipmentChoice: "B:50-gp",
    },
    abilities,
    class: {
      classId: "fighter",
      level: 1,
      hitDie: 10,
      proficiencyBonus,
      savingThrowProficiencies: ["strength", "constitution"],
      skillProficiencies: ["acrobatics", "history"],
      fightingStyleFeatId: "defense",
      weaponMasteryIds: ["greatsword", "flail", "javelin"],
      classEquipmentChoice: "A",
    },
    featureIds: [
      "human:resourceful",
      "human:skillful",
      "human:versatile",
      "feat:alert",
      "feat:savage-attacker",
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
    currencyGp: 54,
    resources: {
      hitPointsMaximum: 10 + constitutionModifier,
      hitPointsCurrent: 10 + constitutionModifier,
      hitDiceTotal: 1,
      hitDiceSpent: 0,
      secondWindMaximum: 2,
      secondWindCurrent: 2,
    },
    derived: {
      armorClass: 17,
      initiativeModifier: dexterityModifier + proficiencyBonus,
      passivePerception: 10 + wisdomModifier + proficiencyBonus,
    },
  };
}

export function createFirstSliceNativeState(
  abilityChoices: FirstSliceAbilityChoices = DEFAULT_FIRST_SLICE_ABILITY_CHOICES,
): NativeSystemState {
  return {
    id: FIRST_SLICE_NATIVE_STATE_ID,
    systemId: "dnd5e",
    editionId: "2024",
    rulesVersion: DND5E_SRD_5_2_1_SOURCE.version,
    schemaVersion: "dnd5e-character/0.1",
    payload: createFirstSliceNativePayload(abilityChoices),
    provenance: {
      origin: "generated",
      sourceId: DND5E_SRD_5_2_1_SOURCE.id,
      notes: "Parameterized legal Level 1 fixture for the first vertical slice.",
    },
  };
}

export function createFirstSliceCharacterDocument(
  abilityChoices: FirstSliceAbilityChoices = DEFAULT_FIRST_SLICE_ABILITY_CHOICES,
): CharacterDocument {
  const nativeState = createFirstSliceNativeState(abilityChoices);
  const payload = nativeState.payload as Dnd5eNativeCharacter;

  return createCharacterDocument({
    characterId: "character-avery-stone",
    displayName: "Avery Stone",
    primaryNativeStateId: nativeState.id,
    nativeStates: [nativeState],
    generation: {
      methodId: "dnd5e:standard-array",
      mode: "mechanical",
      recipeVersion: "0.2",
      rulesSourceIds: [DND5E_SRD_5_2_1_SOURCE.id],
      recipe: {
        classId: "fighter",
        backgroundId: "soldier",
        speciesId: "human",
        abilityMethod: "standard-array",
      },
      decisions: [
        { stepId: "class", choiceId: "fighter" },
        { stepId: "background", choiceId: "soldier" },
        { stepId: "species", choiceId: "human" },
        { stepId: "abilities.standard-array", answer: payload.abilities.base },
        {
          stepId: "background.ability-increases",
          answer: payload.abilities.backgroundIncreases,
        },
        { stepId: "fighting-style", choiceId: "defense" },
        { stepId: "human-origin-feat", choiceId: "alert" },
      ],
    },
  });
}
