import type { CharacterDocument, GenerationDecision } from "../../character-model/src/index.js";
import {
  createStandardArrayAbilityState,
  type Dnd5eAbilityIncreasePlan,
} from "./abilityGeneration.js";
import { createGuidedDnd5eFirstSliceCharacter } from "./guidedFirstSlice.js";
import type { Dnd5eAbilityScores } from "./nativeCharacter.js";
import {
  isGuidedDnd5eClassId,
  isGuidedDnd5eSpeciesId,
  type GuidedDnd5eClassId,
  type GuidedDnd5eSpeciesId,
} from "./srdCatalog.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";

export type GuidedChoiceSelectionMode = "direct" | "random";

export interface GuidedChoiceProvenance<TId extends string> {
  selectedId: TId;
  acceptableIds: readonly TId[];
  selectionMode: GuidedChoiceSelectionMode;
}

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
  const displayName = input.name.trim();
  if (!displayName) throw new Error("Character name is required for guided generation.");
  assertChoice(input.classChoice, isGuidedDnd5eClassId, "class");
  assertChoice(input.speciesChoice, isGuidedDnd5eSpeciesId, "species");

  const abilities = createStandardArrayAbilityState({
    assignment: input.assignment,
    backgroundAbilityIds: ["strength", "dexterity", "constitution"],
    backgroundIncreases: input.backgroundIncreases,
  });

  const decisions: GenerationDecision[] = [
    {
      stepId: "class.acceptable-pool",
      answer: [...input.classChoice.acceptableIds],
      rationale: "User-sticky acceptable options used for this class decision.",
    },
    {
      stepId: "class",
      choiceId: input.classChoice.selectedId,
      rationale: input.classChoice.selectionMode === "random"
        ? "Randomly selected from the user's acceptable class pool."
        : "Direct user choice.",
    },
    { stepId: "background", choiceId: "soldier" },
    {
      stepId: "species.acceptable-pool",
      answer: [...input.speciesChoice.acceptableIds],
      rationale: "User-sticky acceptable options used for this species decision.",
    },
    {
      stepId: "species",
      choiceId: input.speciesChoice.selectedId,
      rationale: input.speciesChoice.selectionMode === "random"
        ? "Randomly selected from the user's acceptable species pool."
        : "Direct user choice.",
    },
    { stepId: "abilities.standard-array", answer: abilities.base },
    { stepId: "background.ability-increases", answer: abilities.backgroundIncreases },
  ];

  return createGuidedDnd5eFirstSliceCharacter({
    displayName,
    classId: input.classChoice.selectedId,
    speciesId: input.speciesChoice.selectedId,
    abilities,
    generation: {
      methodId: "dnd5e:guided-standard-array-first-slice",
      mode: "mechanical",
      recipeVersion: "0.1",
      rulesSourceIds: [DND5E_SRD_5_2_1_SOURCE.id],
      recipe: {
        sequence: ["class", "background", "species", "abilities"],
        classId: input.classChoice.selectedId,
        backgroundId: "soldier",
        speciesId: input.speciesChoice.selectedId,
        abilityMethod: "standard-array",
      },
      decisions,
    },
  });
}

function assertChoice<TId extends string>(
  choice: GuidedChoiceProvenance<TId>,
  isSupported: (value: string) => value is TId,
  label: string,
): void {
  if (!isSupported(choice.selectedId)) {
    throw new Error(`Selected ${label} is not supported by the current guided D&D slice.`);
  }
  const acceptable = new Set(choice.acceptableIds);
  if (acceptable.size === 0) throw new Error(`Choose at least one acceptable ${label}.`);
  for (const id of acceptable) {
    if (!isSupported(id)) throw new Error(`Acceptable ${label} pool contains an unsupported option.`);
  }
  if (!acceptable.has(choice.selectedId)) {
    throw new Error(`Selected ${label} must be included in the acceptable ${label} pool.`);
  }
}
