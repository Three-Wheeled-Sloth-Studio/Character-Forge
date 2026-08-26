import {
  createCharacterId,
  createNativeStateId,
  type CharacterDocument,
} from "../../character-model/src/index.js";
import {
  createFirstSliceCharacterDocument,
  type FirstSliceAbilityChoices,
} from "./firstSliceCharacter.js";
import type { Dnd5eAbilityScores, Dnd5eNativeCharacter } from "./nativeCharacter.js";

const QUICK_NAMES = [
  "Avery Stone",
  "Mara Voss",
  "Rowan Hale",
  "Tamsin Reed",
  "Jonas Vale",
  "Nia Calder",
] as const;

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
  const seed = normalizeSeed(input.seed);
  const random = createSeededRandom(seed);
  const abilityChoices: FirstSliceAbilityChoices = {
    assignment: cloneScores(pick(STANDARD_ARRAY_ASSIGNMENTS, random)),
    backgroundIncreases: { ...pick(SOLDIER_INCREASE_PLANS, random) },
  };
  const character = createFirstSliceCharacterDocument(abilityChoices);
  const name = input.name?.trim() || pick(QUICK_NAMES, random);
  const nativeState = character.nativeStates[0];
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

function normalizeSeed(seed?: string): string {
  const trimmed = seed?.trim();
  if (trimmed) return trimmed;
  const randomPart = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
  return `quick-${Date.now().toString(36)}-${randomPart}`;
}

function cloneScores(scores: Dnd5eAbilityScores): Dnd5eAbilityScores {
  return { ...scores };
}

function pick<T>(values: readonly T[], random: () => number): T {
  const value = values[Math.floor(random() * values.length)];
  if (value === undefined) throw new Error("Quick-generation choice set is empty.");
  return value;
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed: string): () => number {
  let state = hashSeed(seed) || 0x9e3779b9;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
