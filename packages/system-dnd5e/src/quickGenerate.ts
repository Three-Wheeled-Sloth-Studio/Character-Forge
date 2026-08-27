import {
  createCharacterId,
  createNativeStateId,
  type CharacterDocument,
} from "../../character-model/src/index.js";
import { createGeneratedSeed, createSeededRandom, type RandomSource } from "../../generator-core/src/index.js";
import {
  createFirstSliceCharacterDocument,
  type FirstSliceAbilityChoices,
} from "./firstSliceCharacter.js";
import { pickDnd5eGeneratedName } from "./nameGeneration.js";
import type { Dnd5eAbilityScores, Dnd5eNativeCharacter } from "./nativeCharacter.js";

const STANDARD_ARRAY_ASSIGNMENTS: readonly Dnd5eAbilityScores[] = [
  { strength: 15, dexterity: 14, constitution: 13, intelligence: 8, wisdom: 10, charisma: 12 },
  { strength: 14, dexterity: 15, constitution: 13, intelligence: 10, wisdom: 12, charisma: 8 },
  { strength: 15, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 13, charisma: 8 },
  { strength: 13, dexterity: 15, constitution: 14, intelligence: 8, wisdom: 12, charisma: 10 },
] as const;

const SOLDIER_INCREASE_PLANS: readonly FirstSliceAbilityChoices["backgroundIncreases"][] = [
  { strength: 2, constitution: 1 },
  { dexterity: 2, constitution: 1 },
  { constitution: 2, strength: 1 },
  { strength: 1, dexterity: 1, constitution: 1 },
] as const;

export interface QuickGenerateDnd5eInput {
  name?: string;
  seed?: string;
}

export function quickGenerateDnd5eFirstSlice(
  input: QuickGenerateDnd5eInput = {},
): CharacterDocument {
  const seed = input.seed?.trim() || createGeneratedSeed("quick");
  const random = createSeededRandom(seed);
  const abilityChoices: FirstSliceAbilityChoices = {
    assignment: cloneScores(pick(STANDARD_ARRAY_ASSIGNMENTS, random)),
    backgroundIncreases: { ...pick(SOLDIER_INCREASE_PLANS, random) },
  };
  const character = createFirstSliceCharacterDocument(abilityChoices);
  const name = input.name?.trim() || pickDnd5eGeneratedName(random);
  const nativeState = character.nativeStates[0];
  if (!nativeState) throw new Error("Quick generation did not produce a native state.");
  const payload = nativeState.payload as Dnd5eNativeCharacter;

  character.characterId = createCharacterId();
  character.displayName = name;
  character.primaryNativeStateId = createNativeStateId();
  nativeState.id = character.primaryNativeStateId;
  payload.identity.name = name;

  if (character.generation) {
    character.generation.methodId = "dnd5e:quick-first-slice";
    character.generation.mode = "quick";
    character.generation.recipeVersion = "0.1";
    character.generation.seed = seed;
    character.generation.decisions.unshift({
      stepId: "quick.template",
      choiceId: "human-soldier-fighter-1",
      rationale: "First testable quick-generation template.",
    });
  }

  return character;
}

function cloneScores(scores: Dnd5eAbilityScores): Dnd5eAbilityScores {
  return { ...scores };
}

function pick<T>(values: readonly T[], random: RandomSource): T {
  const value = values[Math.floor(random() * values.length)];
  if (value === undefined) throw new Error("Quick-generation choice set is empty.");
  return value;
}
