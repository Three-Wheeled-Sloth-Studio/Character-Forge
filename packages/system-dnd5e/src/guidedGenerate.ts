import type { CharacterDocument, GenerationDecision, JsonObject } from "../../character-model/src/index.js";
import {
  calculateDnd5ePointCost,
  createManualAbilityState,
  createPointCostAbilityState,
  createRandomAbilityState,
  createStandardArrayAbilityState,
  type Dnd5eAbilityIncreasePlan,
} from "./abilityGeneration.js";
import type { GuidedDnd5eCoreChoices } from "./guidedChoices.js";
import { createGuidedDnd5eFirstSliceCharacter } from "./guidedFirstSlice.js";
import { resolveDnd5eCharacterName } from "./nameGeneration.js";
import type { Dnd5eAbilityScores } from "./nativeCharacter.js";
import {
  assignDnd5eRandomAbilityScores,
  rollDnd5eRandomAbilitySet,
  type Dnd5eRandomAbilityAssignment,
} from "./randomGenerate.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";
import {
  DND5E_SRD_521_BACKGROUND_OPTIONS,
  isGuidedDnd5eBackgroundId,
  isGuidedDnd5eClassId,
  isGuidedDnd5eSpeciesId,
  type GuidedDnd5eBackgroundId,
  type GuidedDnd5eClassId,
  type GuidedDnd5eSpeciesId,
} from "./srdCatalog.js";

export type GuidedChoiceSelectionMode = "direct" | "random";

export interface GuidedChoiceProvenance<TId extends string> {
  selectedId: TId;
  acceptableIds: readonly TId[];
  selectionMode: GuidedChoiceSelectionMode;
}

export type GuidedBackgroundEquipmentChoice = "A" | "B:50-gp";

export type GuidedAbilityMethodInput =
  | { method: "standard-array"; assignment: Dnd5eAbilityScores }
  | { method: "manual"; scores: Dnd5eAbilityScores }
  | { method: "point-cost"; scores: Dnd5eAbilityScores }
  | { method: "random"; seed?: string; assignment: Dnd5eRandomAbilityAssignment };

export interface GuidedGenerateDnd5eInput {
  name?: string;
  classChoice: GuidedChoiceProvenance<GuidedDnd5eClassId>;
  backgroundChoice: GuidedChoiceProvenance<GuidedDnd5eBackgroundId>;
  speciesChoice: GuidedChoiceProvenance<GuidedDnd5eSpeciesId>;
  coreChoices: GuidedDnd5eCoreChoices;
  coreChoiceProvenance?: GenerationDecision[];
  abilityMethod: GuidedAbilityMethodInput;
  backgroundIncreases: Dnd5eAbilityIncreasePlan;
  backgroundEquipmentChoice: GuidedBackgroundEquipmentChoice;
}

export function guidedGenerateDnd5eFirstSlice(input: GuidedGenerateDnd5eInput): CharacterDocument {
  assertChoice(input.classChoice, isGuidedDnd5eClassId, "class");
  assertChoice(input.backgroundChoice, isGuidedDnd5eBackgroundId, "background");
  assertChoice(input.speciesChoice, isGuidedDnd5eSpeciesId, "species");

  const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((option) => option.id === input.backgroundChoice.selectedId);
  if (!background || !background.guidedSupported) {
    throw new Error("Selected background is not supported by the current guided D&D slice.");
  }

  const methodResult = createAbilityMethodResult(input.abilityMethod, background.abilityScoreIds, input.backgroundIncreases);
  const displayName = resolveDnd5eCharacterName(input.name, methodResult.seed);
  const decisions: GenerationDecision[] = [
    poolDecision("class", input.classChoice.acceptableIds), choiceDecision("class", input.classChoice),
    poolDecision("background", input.backgroundChoice.acceptableIds), choiceDecision("background", input.backgroundChoice),
    { stepId: "background.equipment", choiceId: input.backgroundEquipmentChoice },
    poolDecision("species", input.speciesChoice.acceptableIds), choiceDecision("species", input.speciesChoice),
    ...coreDecisions(input.coreChoices),
    ...(input.coreChoiceProvenance ?? []),
    ...methodResult.decisions,
    { stepId: "background.ability-increases", answer: methodResult.abilities.backgroundIncreases },
    {
      stepId: "identity.name",
      answer: displayName,
      rationale: input.name?.trim() ? "Direct user entry." : "Generated because the name field was left blank.",
    },
  ];

  return createGuidedDnd5eFirstSliceCharacter({
    displayName,
    classId: input.classChoice.selectedId,
    backgroundId: input.backgroundChoice.selectedId,
    speciesId: input.speciesChoice.selectedId,
    backgroundEquipmentChoice: input.backgroundEquipmentChoice,
    coreChoices: input.coreChoices,
    abilities: methodResult.abilities,
    generation: {
      methodId: `dnd5e:guided-${input.abilityMethod.method}-level-one`,
      mode: input.abilityMethod.method === "manual" ? "manual" : "mechanical",
      recipeVersion: "0.3",
      ...(methodResult.seed ? { seed: methodResult.seed } : {}),
      rulesSourceIds: [DND5E_SRD_5_2_1_SOURCE.id],
      recipe: {
        sequence: ["class", "background", "species", "origin-details", "abilities", "alignment"],
        classId: input.classChoice.selectedId,
        backgroundId: input.backgroundChoice.selectedId,
        speciesId: input.speciesChoice.selectedId,
        abilityMethod: input.abilityMethod.method,
        backgroundEquipmentChoice: input.backgroundEquipmentChoice,
        classEquipmentChoice: input.coreChoices.classEquipmentChoice,
      },
      decisions,
    },
  });
}

function coreDecisions(choices: GuidedDnd5eCoreChoices): GenerationDecision[] {
  const decisions: GenerationDecision[] = [
    { stepId: "alignment", choiceId: choices.alignmentId },
    { stepId: "origin.languages", answer: choices.originLanguageIds },
    { stepId: "class.skills", answer: choices.classSkillIds },
    { stepId: "class.equipment", choiceId: choices.classEquipmentChoice },
    { stepId: "class.weapon-mastery", answer: choices.weaponMasteryIds },
  ];
  if (choices.fightingStyleFeatId) decisions.push({ stepId: "class.fighting-style", choiceId: choices.fightingStyleFeatId });
  if (choices.monkToolProficiencyId) decisions.push({ stepId: "class.tool", choiceId: choices.monkToolProficiencyId });
  if (choices.expertiseSkillIds?.length) decisions.push({ stepId: "class.expertise", answer: choices.expertiseSkillIds });
  if (choices.rogueBonusLanguageId) decisions.push({ stepId: "class.bonus-language", choiceId: choices.rogueBonusLanguageId });
  if (choices.human) {
    decisions.push(
      { stepId: "species.human.size", choiceId: choices.human.size },
      { stepId: "species.human.skillful", choiceId: choices.human.skillId },
      { stepId: "species.human.versatile", choiceId: choices.human.originFeatId },
    );
    if (choices.human.skilledProficiencyIds?.length) {
      decisions.push({ stepId: "species.human.skilled", answer: choices.human.skilledProficiencyIds });
    }
  }
  return decisions;
}

function createAbilityMethodResult(
  method: GuidedAbilityMethodInput,
  backgroundAbilityIds: readonly ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma")[],
  backgroundIncreases: Dnd5eAbilityIncreasePlan,
): { abilities: ReturnType<typeof createStandardArrayAbilityState>; decisions: GenerationDecision[]; seed?: string } {
  switch (method.method) {
    case "standard-array": {
      const abilities = createStandardArrayAbilityState({ assignment: method.assignment, backgroundAbilityIds, backgroundIncreases });
      return { abilities, decisions: [{ stepId: "abilities.standard-array", answer: abilities.base }] };
    }
    case "manual": {
      const abilities = createManualAbilityState({ scores: method.scores, backgroundAbilityIds, backgroundIncreases });
      return { abilities, decisions: [{ stepId: "abilities.manual", answer: abilities.base }] };
    }
    case "point-cost": {
      const abilities = createPointCostAbilityState({ scores: method.scores, backgroundAbilityIds, backgroundIncreases });
      const pointsSpent = calculateDnd5ePointCost(method.scores);
      return { abilities, decisions: [{ stepId: "abilities.point-cost", answer: abilities.base, rationale: `${pointsSpent} of 27 points spent.` }] };
    }
    case "random": {
      const rollSet = rollDnd5eRandomAbilitySet(method.seed);
      const scores = assignDnd5eRandomAbilityScores(rollSet, method.assignment);
      const abilities = createRandomAbilityState({ scores, backgroundAbilityIds, backgroundIncreases });
      const rollEvidence: JsonObject = {
        expression: rollSet.expression,
        results: rollSet.results.map((result) => ({ rollIndex: result.rollIndex, rolls: result.rolls, keptValues: result.keptValues, total: result.total })),
      };
      return {
        abilities,
        seed: rollSet.seed,
        decisions: [
          { stepId: "abilities.random.rolls", answer: rollEvidence },
          { stepId: "abilities.random.assignment", answer: method.assignment },
          { stepId: "abilities.random.final-base", answer: abilities.base },
        ],
      };
    }
  }
}

function poolDecision(label: string, acceptableIds: readonly string[]): GenerationDecision {
  return { stepId: `${label}.acceptable-pool`, answer: [...acceptableIds], rationale: `User-sticky acceptable options used for this ${label} decision.` };
}

function choiceDecision<TId extends string>(label: string, choice: GuidedChoiceProvenance<TId>): GenerationDecision {
  return {
    stepId: label,
    choiceId: choice.selectedId,
    rationale: choice.selectionMode === "random" ? `Randomly selected from the user's acceptable ${label} pool.` : "Direct user choice.",
  };
}

function assertChoice<TId extends string>(
  choice: GuidedChoiceProvenance<TId>,
  isSupported: (value: string) => value is TId,
  label: string,
): void {
  if (!isSupported(choice.selectedId)) throw new Error(`Selected ${label} is not supported by the current guided D&D slice.`);
  const acceptable = new Set(choice.acceptableIds);
  if (acceptable.size === 0) throw new Error(`Choose at least one acceptable ${label}.`);
  for (const id of acceptable) if (!isSupported(id)) throw new Error(`Acceptable ${label} pool contains an unsupported option.`);
  if (!acceptable.has(choice.selectedId)) throw new Error(`Selected ${label} must be included in the acceptable ${label} pool.`);
}
