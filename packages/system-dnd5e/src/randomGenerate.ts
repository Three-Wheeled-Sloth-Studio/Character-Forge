import type { CharacterDocument, JsonObject } from "../../character-model/src/index.js";
import {
  createGeneratedSeed,
  createSeededRandom,
  formatDiceExpression,
  rollDiceExpression,
  type DiceExpression,
} from "../../generator-core/src/index.js";
import {
  createRandomAbilityState,
  type Dnd5eAbilityIncreasePlan,
} from "./abilityGeneration.js";
import {
  createFirstSliceCharacterDocumentFromAbilityState,
  SOLDIER_BACKGROUND_ABILITY_IDS,
} from "./firstSliceCharacter.js";
import {
  DND5E_ABILITY_IDS,
  type Dnd5eAbilityId,
  type Dnd5eAbilityScores,
} from "./nativeCharacter.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";

export const DND5E_RANDOM_ABILITY_EXPRESSION = Object.freeze({
  count: 4,
  sides: 6,
  keepHighest: 3,
}) satisfies DiceExpression;

export interface Dnd5eRandomAbilityRoll {
  rollIndex: number;
  rolls: number[];
  keptValues: number[];
  total: number;
}

export interface Dnd5eRandomAbilitySet {
  seed: string;
  expression: string;
  results: Dnd5eRandomAbilityRoll[];
}

export type Dnd5eRandomAbilityAssignment = Record<Dnd5eAbilityId, number>;

export interface RandomGenerateDnd5eInput {
  name: string;
  seed?: string;
  assignment: Dnd5eRandomAbilityAssignment;
  backgroundIncreases: Dnd5eAbilityIncreasePlan;
}

export function rollDnd5eRandomAbilitySet(seed?: string): Dnd5eRandomAbilitySet {
  const effectiveSeed = seed?.trim() || createGeneratedSeed("dnd5e-abilities");
  const random = createSeededRandom(effectiveSeed);
  const results = Array.from({ length: 6 }, (_, rollIndex) => {
    const result = rollDiceExpression(DND5E_RANDOM_ABILITY_EXPRESSION, random);
    return {
      rollIndex,
      rolls: result.rolls,
      keptValues: result.keptValues,
      total: result.total,
    };
  });

  return {
    seed: effectiveSeed,
    expression: formatDiceExpression(DND5E_RANDOM_ABILITY_EXPRESSION),
    results,
  };
}

export function assignDnd5eRandomAbilityScores(
  rollSet: Dnd5eRandomAbilitySet,
  assignment: Dnd5eRandomAbilityAssignment,
): Dnd5eAbilityScores {
  if (rollSet.results.length !== 6) {
    throw new Error("D&D Random Generation requires exactly six generated ability scores.");
  }

  const assignedIndices = DND5E_ABILITY_IDS.map((abilityId) => assignment[abilityId]);
  if (
    assignedIndices.some((index) => !Number.isInteger(index) || index < 0 || index >= 6)
    || new Set(assignedIndices).size !== 6
  ) {
    throw new Error("Each of the six random ability rolls must be assigned exactly once.");
  }

  const scoreFor = (abilityId: Dnd5eAbilityId): number => {
    const index = assignment[abilityId];
    const generated = rollSet.results[index];
    if (!generated || !Number.isInteger(generated.total) || generated.total < 3 || generated.total > 18) {
      throw new Error("Random ability roll totals must be integers from 3 through 18.");
    }
    return generated.total;
  };

  return {
    strength: scoreFor("strength"),
    dexterity: scoreFor("dexterity"),
    constitution: scoreFor("constitution"),
    intelligence: scoreFor("intelligence"),
    wisdom: scoreFor("wisdom"),
    charisma: scoreFor("charisma"),
  };
}

export function randomGenerateDnd5eFirstSlice(
  input: RandomGenerateDnd5eInput,
): CharacterDocument {
  const displayName = input.name.trim();
  if (!displayName) throw new Error("Character name is required for Random Generation.");

  const rollSet = rollDnd5eRandomAbilitySet(input.seed);
  const scores = assignDnd5eRandomAbilityScores(rollSet, input.assignment);
  const abilities = createRandomAbilityState({
    scores,
    backgroundAbilityIds: SOLDIER_BACKGROUND_ABILITY_IDS,
    backgroundIncreases: input.backgroundIncreases,
  });
  const rollEvidence: JsonObject = {
    expression: rollSet.expression,
    results: rollSet.results.map((result) => ({
      rollIndex: result.rollIndex,
      rolls: result.rolls,
      keptValues: result.keptValues,
      total: result.total,
    })),
  };

  return createFirstSliceCharacterDocumentFromAbilityState({
    displayName,
    abilities,
    nativeOrigin: "generated",
    generation: {
      methodId: "dnd5e:random-4d6kh3-first-slice",
      mode: "mechanical",
      recipeVersion: "0.1",
      seed: rollSet.seed,
      rulesSourceIds: [DND5E_SRD_5_2_1_SOURCE.id],
      recipe: {
        classId: "fighter",
        backgroundId: "soldier",
        speciesId: "human",
        abilityMethod: "random",
        diceExpression: rollSet.expression,
        generatedScoreCount: 6,
      },
      decisions: [
        { stepId: "class", choiceId: "fighter" },
        { stepId: "background", choiceId: "soldier" },
        { stepId: "species", choiceId: "human" },
        { stepId: "abilities.random.rolls", answer: rollEvidence },
        { stepId: "abilities.random.assignment", answer: input.assignment },
        { stepId: "abilities.random.final-base", answer: abilities.base },
        { stepId: "background.ability-increases", answer: abilities.backgroundIncreases },
        { stepId: "fighting-style", choiceId: "defense" },
        { stepId: "human-origin-feat", choiceId: "alert" },
      ],
    },
  });
}
