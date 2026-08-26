import type { CharacterDocument } from "../../character-model/src/index.js";
import {
  calculateDnd5ePointCost,
  createPointCostAbilityState,
  DND5E_POINT_COST_BUDGET,
  type Dnd5eAbilityIncreasePlan,
} from "./abilityGeneration.js";
import {
  createFirstSliceCharacterDocumentFromAbilityState,
  SOLDIER_BACKGROUND_ABILITY_IDS,
} from "./firstSliceCharacter.js";
import type { Dnd5eAbilityScores } from "./nativeCharacter.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";

export interface PointCostGenerateDnd5eInput {
  name: string;
  scores: Dnd5eAbilityScores;
  backgroundIncreases: Dnd5eAbilityIncreasePlan;
}

export function pointCostGenerateDnd5eFirstSlice(
  input: PointCostGenerateDnd5eInput,
): CharacterDocument {
  const displayName = input.name.trim();
  if (!displayName) throw new Error("Character name is required for Point Cost generation.");

  const abilities = createPointCostAbilityState({
    scores: input.scores,
    backgroundAbilityIds: SOLDIER_BACKGROUND_ABILITY_IDS,
    backgroundIncreases: input.backgroundIncreases,
  });
  const pointsSpent = calculateDnd5ePointCost(abilities.base);

  return createFirstSliceCharacterDocumentFromAbilityState({
    displayName,
    abilities,
    nativeOrigin: "generated",
    generation: {
      methodId: "dnd5e:point-cost-first-slice",
      mode: "mechanical",
      recipeVersion: "0.1",
      rulesSourceIds: [DND5E_SRD_5_2_1_SOURCE.id],
      recipe: {
        classId: "fighter",
        backgroundId: "soldier",
        speciesId: "human",
        abilityMethod: "point-cost",
        pointBudget: DND5E_POINT_COST_BUDGET,
      },
      decisions: [
        { stepId: "class", choiceId: "fighter" },
        { stepId: "background", choiceId: "soldier" },
        { stepId: "species", choiceId: "human" },
        {
          stepId: "abilities.point-cost",
          answer: abilities.base,
          rationale: `${pointsSpent} of ${DND5E_POINT_COST_BUDGET} points spent.`,
        },
        { stepId: "background.ability-increases", answer: abilities.backgroundIncreases },
        { stepId: "fighting-style", choiceId: "defense" },
        { stepId: "human-origin-feat", choiceId: "alert" },
      ],
    },
  });
}
