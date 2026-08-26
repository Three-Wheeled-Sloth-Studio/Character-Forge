import {
  createCharacterDocument,
  type CharacterDocument,
  type NativeSystemState,
} from "../../character-model/src/index.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";

export const FIRST_SLICE_NATIVE_STATE_ID = "native-dnd5e-avery-stone";

export function createFirstSliceNativePayload(): Dnd5eNativeCharacter {
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
    abilities: {
      generationMethod: "standard-array",
      base: {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 8,
        wisdom: 10,
        charisma: 12,
      },
      backgroundIncreases: {
        strength: 2,
        dexterity: 0,
        constitution: 1,
        intelligence: 0,
        wisdom: 0,
        charisma: 0,
      },
      final: {
        strength: 17,
        dexterity: 14,
        constitution: 14,
        intelligence: 8,
        wisdom: 10,
        charisma: 12,
      },
    },
    class: {
      classId: "fighter",
      level: 1,
      hitDie: 10,
      proficiencyBonus: 2,
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
      hitPointsMaximum: 12,
      hitPointsCurrent: 12,
      hitDiceTotal: 1,
      hitDiceSpent: 0,
      secondWindMaximum: 2,
      secondWindCurrent: 2,
    },
    derived: {
      armorClass: 17,
      initiativeModifier: 4,
      passivePerception: 12,
    },
  };
}

export function createFirstSliceNativeState(): NativeSystemState {
  return {
    id: FIRST_SLICE_NATIVE_STATE_ID,
    systemId: "dnd5e",
    editionId: "2024",
    rulesVersion: DND5E_SRD_5_2_1_SOURCE.version,
    schemaVersion: "dnd5e-character/0.1",
    payload: createFirstSliceNativePayload(),
    provenance: {
      origin: "generated",
      sourceId: DND5E_SRD_5_2_1_SOURCE.id,
      notes: "Fixed legal Level 1 fixture for the first vertical slice.",
    },
  };
}

export function createFirstSliceCharacterDocument(): CharacterDocument {
  const nativeState = createFirstSliceNativeState();

  return createCharacterDocument({
    characterId: "character-avery-stone",
    displayName: "Avery Stone",
    primaryNativeStateId: nativeState.id,
    nativeStates: [nativeState],
    generation: {
      methodId: "dnd5e:first-legal-path",
      mode: "mechanical",
      recipeVersion: "0.1",
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
        { stepId: "fighting-style", choiceId: "defense" },
        { stepId: "human-origin-feat", choiceId: "alert" },
      ],
    },
  });
}
