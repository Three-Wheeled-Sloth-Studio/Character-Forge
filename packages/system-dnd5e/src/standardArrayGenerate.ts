import type { CharacterDocument } from "../../character-model/src/index.js";
import {
  createStandardArrayAbilityState,
  type Dnd5eAbilityIncreasePlan,
} from "./abilityGeneration.js";
import {
  createFirstSliceCharacterDocumentFromAbilityState,
  SOLDIER_BACKGROUND_ABILITY_IDS,
} from "./firstSliceCharacter.js";
import type { Dnd5eAbilityScores } from "./nativeCharacter.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";

export interface StandardArrayGenerateDnd5eInput {
  name: string;
  assignment: Dnd5eAbilityScores;
  backgroundIncreases: Dnd5eAbilityIncreasePlan;
}

export function standardArrayGenerateDnd5eFirstSlice(
  input: StandardArrayGenerateDnd5eInput,
): CharacterDocument {
  const displayName = input.name.trim();
  if (!displayName) throw new Error("Character name is required for Standard Array generation.");

  const abilities = createStandardArrayAbilityState({
    assignment: input.assignment,
    backgroundAbilityIds: SOLDIER_BACKGROUND_ABILITY_IDS,
    backgroundIncreases: input.backgroundIncreases,
  });

  return createFirstSliceCharacterDocumentFromAbilityState({
    displayName,
    abilities,
    nativeOrigin: "generated",
    generation: {
      methodId: "dnd5e:standard-array-first-slice",
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
        { stepId: "abilities.standard-array", answer: abilities.base },
        { stepId: "background.ability-increases", answer: abilities.backgroundIncreases },
        { stepId: "fighting-style", choiceId: "defense" },
        { stepId: "human-origin-feat", choiceId: "alert" },
      ],
    },
  });
}
