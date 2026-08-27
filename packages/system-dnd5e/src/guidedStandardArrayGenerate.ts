import type { CharacterDocument } from "../../character-model/src/index.js";
import type { Dnd5eAbilityIncreasePlan } from "./abilityGeneration.js";
import {
  guidedGenerateDnd5eFirstSlice,
  type GuidedChoiceProvenance,
} from "./guidedGenerate.js";
import type { Dnd5eAbilityScores } from "./nativeCharacter.js";
import type {
  GuidedDnd5eClassId,
  GuidedDnd5eSpeciesId,
} from "./srdCatalog.js";

export interface GuidedStandardArrayGenerateDnd5eInput {
  name: string;
  classChoice: GuidedChoiceProvenance<GuidedDnd5eClassId>;
  speciesChoice: GuidedChoiceProvenance<GuidedDnd5eSpeciesId>;
  assignment: Dnd5eAbilityScores;
  backgroundIncreases: Dnd5eAbilityIncreasePlan;
}

export function guidedStandardArrayGenerateDnd5eFirstSlice(
  input: GuidedStandardArrayGenerateDnd5eInput,
): CharacterDocument {
  return guidedGenerateDnd5eFirstSlice({
    name: input.name,
    classChoice: input.classChoice,
    backgroundChoice: {
      selectedId: "soldier",
      acceptableIds: ["soldier"],
      selectionMode: "direct",
    },
    speciesChoice: input.speciesChoice,
    abilityMethod: {
      method: "standard-array",
      assignment: input.assignment,
    },
    backgroundIncreases: input.backgroundIncreases,
    backgroundEquipmentChoice: "B:50-gp",
  });
}
