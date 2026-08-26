import type { CharacterDocument } from "../../character-model/src/index.js";
import {
  createManualAbilityState,
  type Dnd5eAbilityIncreasePlan,
} from "./abilityGeneration.js";
import {
  createFirstSliceCharacterDocumentFromAbilityState,
  SOLDIER_BACKGROUND_ABILITY_IDS,
} from "./firstSliceCharacter.js";
import type { Dnd5eAbilityScores } from "./nativeCharacter.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";

export interface ManualGenerateDnd5eInput {
  name: string;
  scores: Dnd5eAbilityScores;
  backgroundIncreases: Dnd5eAbilityIncreasePlan;
}

export function manualGenerateDnd5eFirstSlice(
  input: ManualGenerateDnd5eInput,
): CharacterDocument {
  const displayName = input.name.trim();
  if (!displayName) throw new Error("Character name is required for manual generation.");

  const abilities = createManualAbilityState({
    scores: input.scores,
    backgroundAbilityIds: SOLDIER_BACKGROUND_ABILITY_IDS,
    backgroundIncreases: input.backgroundIncreases,
  });

  return createFirstSliceCharacterDocumentFromAbilityState({
    displayName,
    abilities,
    nativeOrigin: "manual",
    generation: {
      methodId: "dnd5e:manual-first-slice",
      mode: "manual",
      recipeVersion: "0.1",
      rulesSourceIds: [DND5E_SRD_5_2_1_SOURCE.id],
      recipe: {
        classId: "fighter",
        backgroundId: "soldier",
        speciesId: "human",
        abilityMethod: "manual",
      },
      decisions: [
        { stepId: "class", choiceId: "fighter" },
        { stepId: "background", choiceId: "soldier" },
        { stepId: "species", choiceId: "human" },
        { stepId: "abilities.manual", answer: abilities.base },
        { stepId: "background.ability-increases", answer: abilities.backgroundIncreases },
        { stepId: "fighting-style", choiceId: "defense" },
        { stepId: "human-origin-feat", choiceId: "alert" },
      ],
    },
  });
}
