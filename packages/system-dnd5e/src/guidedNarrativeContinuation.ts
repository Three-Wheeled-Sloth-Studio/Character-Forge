import type { CharacterDocument, GenerationDecision, JsonObject } from "../../character-model/src/index.js";
import {
  DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
  DND5E_GUIDED_NARRATIVE_MAPPING_ID,
  DND5E_GUIDED_NARRATIVE_MAPPING_VERSION,
  recommendDnd5eGuidedNarrative,
  type Dnd5eGuidedNarrativeAnswers,
  type Dnd5eGuidedNarrativeMappedChoice,
  type Dnd5eGuidedNarrativeOverrides,
  type Dnd5eGuidedNarrativeQuestionId,
  type Dnd5eGuidedNarrativeRecommendation,
  type RecommendDnd5eGuidedNarrativeInput,
} from "./guidedNarrative.js";
import {
  isGuidedDnd5eBackgroundId,
  isGuidedDnd5eClassId,
  isGuidedDnd5eSpeciesId,
  type GuidedDnd5eBackgroundId,
  type GuidedDnd5eClassId,
  type GuidedDnd5eSpeciesId,
} from "./srdCatalog.js";

export const DND5E_GUIDED_NARRATIVE_CONTINUATION_METHOD_ID = "dnd5e:guided-narrative-to-guided-level-one";
export const DND5E_GUIDED_NARRATIVE_CONTINUATION_RECIPE_VERSION = "0.1";

export interface Dnd5eGuidedNarrativeContinuation extends Dnd5eGuidedNarrativeRecommendation {
  initialChoices: {
    classId: GuidedDnd5eClassId;
    backgroundId: GuidedDnd5eBackgroundId;
    speciesId: GuidedDnd5eSpeciesId;
  };
}

export interface CreateDnd5eGuidedNarrativeContinuationInput extends RecommendDnd5eGuidedNarrativeInput {
  overrides?: Dnd5eGuidedNarrativeOverrides;
}

export function createDnd5eGuidedNarrativeContinuation(
  input: CreateDnd5eGuidedNarrativeContinuationInput,
): Dnd5eGuidedNarrativeContinuation {
  const recommendation = recommendDnd5eGuidedNarrative(input);
  const initialChoices = {
    classId: resolveNarrowedChoice(input.overrides?.classId, recommendation.classChoice, isGuidedDnd5eClassId, "class"),
    backgroundId: resolveNarrowedChoice(input.overrides?.backgroundId, recommendation.backgroundChoice, isGuidedDnd5eBackgroundId, "background"),
    speciesId: resolveNarrowedChoice(input.overrides?.speciesId, recommendation.speciesChoice, isGuidedDnd5eSpeciesId, "species"),
  };
  return { ...recommendation, initialChoices };
}

export function applyDnd5eGuidedNarrativeContinuation(
  character: CharacterDocument,
  continuation: Dnd5eGuidedNarrativeContinuation,
): CharacterDocument {
  assertContinuationReplay(continuation);
  const generation = character.generation;
  if (!generation) throw new Error("Guided Narrative continuation requires generation provenance from Guided Mechanical.");

  const finalChoices = {
    classId: requiredFinalChoice(generation.decisions, "class", isGuidedDnd5eClassId),
    backgroundId: requiredFinalChoice(generation.decisions, "background", isGuidedDnd5eBackgroundId),
    speciesId: requiredFinalChoice(generation.decisions, "species", isGuidedDnd5eSpeciesId),
  };
  const baseGeneration: JsonObject = {
    methodId: generation.methodId,
    mode: generation.mode,
    recipeVersion: generation.recipeVersion,
    rulesSourceIds: [...generation.rulesSourceIds],
    recipe: generation.recipe,
    ...(generation.seed ? { seed: generation.seed } : {}),
  };
  const narrativeDecisions = createContinuationDecisions(continuation, finalChoices);

  return {
    ...character,
    generation: {
      ...generation,
      methodId: DND5E_GUIDED_NARRATIVE_CONTINUATION_METHOD_ID,
      mode: "hybrid",
      recipeVersion: DND5E_GUIDED_NARRATIVE_CONTINUATION_RECIPE_VERSION,
      recipe: {
        sequence: ["guided-narrative", "guided-mechanical"],
        mappingId: continuation.mappingId,
        mappingVersion: continuation.mappingVersion,
        narrativeSeed: continuation.seed,
        initialChoices: { ...continuation.initialChoices },
        baseGuidedGeneration: baseGeneration,
      },
      decisions: [...narrativeDecisions, ...generation.decisions],
    },
  };
}

function createContinuationDecisions(
  continuation: Dnd5eGuidedNarrativeContinuation,
  finalChoices: { classId: GuidedDnd5eClassId; backgroundId: GuidedDnd5eBackgroundId; speciesId: GuidedDnd5eSpeciesId },
): GenerationDecision[] {
  return [
    answerDecision("role", continuation.answers.role),
    answerDecision("past", continuation.answers.past),
    answerDecision("heritage", continuation.answers.heritage),
    continuationMappingDecision("class", continuation.classChoice, continuation.initialChoices.classId, finalChoices.classId),
    continuationMappingDecision("background", continuation.backgroundChoice, continuation.initialChoices.backgroundId, finalChoices.backgroundId),
    continuationMappingDecision("species", continuation.speciesChoice, continuation.initialChoices.speciesId, finalChoices.speciesId),
    {
      stepId: "narrative.continue-guided",
      answer: {
        mappingId: continuation.mappingId,
        mappingVersion: continuation.mappingVersion,
        seed: continuation.seed,
        classId: continuation.initialChoices.classId,
        backgroundId: continuation.initialChoices.backgroundId,
        speciesId: continuation.initialChoices.speciesId,
      },
      rationale: "The player continued from Guided Narrative into the existing Guided Mechanical editor.",
    },
  ];
}

function answerDecision(
  questionId: Dnd5eGuidedNarrativeQuestionId,
  resolution: { submittedId: string; resolvedId: string },
): GenerationDecision {
  return {
    stepId: `narrative.${questionId}`,
    choiceId: resolution.resolvedId,
    answer: {
      submittedId: resolution.submittedId,
      resolvedId: resolution.resolvedId,
      chooseForMe: resolution.submittedId === DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
    },
    rationale: resolution.submittedId === DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID
      ? "The player chose Choose for me; the substantive answer was resolved deterministically from the narrative seed."
      : "Direct narrative preference answer.",
  };
}

function continuationMappingDecision<TId extends string>(
  target: "class" | "background" | "species",
  mapping: Dnd5eGuidedNarrativeMappedChoice<TId>,
  narrativeFinalId: TId,
  finalId: TId,
): GenerationDecision {
  const overriddenBeforeContinuation = narrativeFinalId !== mapping.recommendedId;
  const changedAfterContinuation = finalId !== narrativeFinalId;
  const answer: JsonObject = {
    mappingId: DND5E_GUIDED_NARRATIVE_MAPPING_ID,
    mappingVersion: DND5E_GUIDED_NARRATIVE_MAPPING_VERSION,
    candidateIds: [...mapping.candidateIds],
    recommendedId: mapping.recommendedId,
    narrativeFinalId,
    finalId,
    overriddenBeforeContinuation,
    changedAfterContinuation,
  };
  return {
    stepId: `narrative.mapping.${target}`,
    choiceId: finalId,
    answer,
    rationale: changedAfterContinuation
      ? `Guided Narrative ended with ${narrativeFinalId}; the player later changed the ${target} to ${finalId} in Guided Mechanical.`
      : overriddenBeforeContinuation
        ? `The player retained a narrowed Guided Narrative ${target} override while continuing through Guided Mechanical.`
        : `The player retained the Guided Narrative ${target} recommendation while continuing through Guided Mechanical.`,
  };
}

function assertContinuationReplay(continuation: Dnd5eGuidedNarrativeContinuation): void {
  if (continuation.mappingId !== DND5E_GUIDED_NARRATIVE_MAPPING_ID
    || continuation.mappingVersion !== DND5E_GUIDED_NARRATIVE_MAPPING_VERSION) {
    throw new Error("Guided Narrative continuation mapping version is not supported by this D&D build.");
  }
  if (!continuation.seed.trim()) throw new Error("Guided Narrative continuation requires a replay seed.");

  const replay = recommendDnd5eGuidedNarrative({
    answers: submittedAnswers(continuation),
    seed: continuation.seed,
  });
  if (!sameResolution(replay.answers.role, continuation.answers.role)
    || !sameResolution(replay.answers.past, continuation.answers.past)
    || !sameResolution(replay.answers.heritage, continuation.answers.heritage)
    || !sameMapping(replay.classChoice, continuation.classChoice)
    || !sameMapping(replay.backgroundChoice, continuation.backgroundChoice)
    || !sameMapping(replay.speciesChoice, continuation.speciesChoice)) {
    throw new Error("Guided Narrative continuation does not replay to its retained recommendation provenance.");
  }

  resolveNarrowedChoice(continuation.initialChoices.classId, replay.classChoice, isGuidedDnd5eClassId, "class");
  resolveNarrowedChoice(continuation.initialChoices.backgroundId, replay.backgroundChoice, isGuidedDnd5eBackgroundId, "background");
  resolveNarrowedChoice(continuation.initialChoices.speciesId, replay.speciesChoice, isGuidedDnd5eSpeciesId, "species");
}

function submittedAnswers(continuation: Dnd5eGuidedNarrativeContinuation): Dnd5eGuidedNarrativeAnswers {
  return {
    role: continuation.answers.role.submittedId as Dnd5eGuidedNarrativeAnswers["role"],
    past: continuation.answers.past.submittedId as Dnd5eGuidedNarrativeAnswers["past"],
    heritage: continuation.answers.heritage.submittedId as Dnd5eGuidedNarrativeAnswers["heritage"],
  };
}

function sameResolution(
  left: { submittedId: string; resolvedId: string },
  right: { submittedId: string; resolvedId: string },
): boolean {
  return left.submittedId === right.submittedId && left.resolvedId === right.resolvedId;
}

function sameMapping<TId extends string>(
  left: Dnd5eGuidedNarrativeMappedChoice<TId>,
  right: Dnd5eGuidedNarrativeMappedChoice<TId>,
): boolean {
  return left.recommendedId === right.recommendedId
    && left.candidateIds.length === right.candidateIds.length
    && left.candidateIds.every((id, index) => id === right.candidateIds[index]);
}

function resolveNarrowedChoice<TId extends string>(
  override: string | undefined,
  mapping: Dnd5eGuidedNarrativeMappedChoice<TId>,
  isSupported: (value: string) => value is TId,
  label: string,
): TId {
  if (override === undefined) return mapping.recommendedId;
  if (!isSupported(override)) throw new Error(`Unsupported Guided Narrative ${label} continuation choice.`);
  if (!mapping.candidateIds.includes(override)) {
    throw new Error(`Guided Narrative ${label} continuation choice must stay within the narrowed candidate set.`);
  }
  return override;
}

function requiredFinalChoice<TId extends string>(
  decisions: readonly GenerationDecision[],
  stepId: string,
  isSupported: (value: string) => value is TId,
): TId {
  const choiceId = decisions.find((decision) => decision.stepId === stepId)?.choiceId;
  if (!choiceId || !isSupported(choiceId)) {
    throw new Error(`Guided Mechanical generation is missing a supported final ${stepId} decision.`);
  }
  return choiceId;
}
