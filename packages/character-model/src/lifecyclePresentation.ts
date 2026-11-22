import type { CharacterLifecycle, ChoiceOpenedEvent } from "./characterLifecycle.js";
import { getChoiceSummary } from "./characterLifecycle.js";

/** Read models only. Neither surface grants authority to perform a mutation. */
export interface PlayerLifecycleView {
  choices: Array<{
    choiceId: string;
    prompt: string;
    status: "open" | "deferred" | "selected";
    canDefer: boolean;
    eligibleOptionIds: string[];
    selectedOptionId?: string;
    applied: boolean;
  }>;
  experiences: Array<{ eventId: string; description: string; category: string; advancementApplied: boolean }>;
}

export interface GmLifecycleView {
  choices: Array<{
    choiceId: string;
    sourceId: string;
    assessment?: { rulesSourceId: string; sourceNativeStateId: string; reason: string; eventId: string };
    selectedOptionId?: string;
    resultingNativeStateId?: string;
  }>;
  experiences: Array<{
    eventId: string;
    sourceNativeStateId: string;
    description: string;
    resultingNativeStateId?: string;
    systemAdapterId?: string;
  }>;
}

export function projectPlayerLifecycle(lifecycle: CharacterLifecycle): PlayerLifecycleView {
  const openings = lifecycle.events.filter((event): event is ChoiceOpenedEvent => event.type === "choice-opened");
  const appliedChoices = new Set(lifecycle.events.filter((event) => event.type === "native-revision-linked").map((event) => event.selectionEventId));
  return {
    choices: openings.flatMap((opening) => {
      const summary = getChoiceSummary(lifecycle, opening.choiceId);
      if (!summary) return [];
      const selection = lifecycle.events.find((event) => event.type === "choice-selected" && event.choiceId === opening.choiceId);
      return [{
        choiceId: opening.choiceId, prompt: opening.prompt, status: summary.status,
        canDefer: opening.canDefer, eligibleOptionIds: [...summary.eligibleOptionIds],
        ...(summary.selectedOptionId ? { selectedOptionId: summary.selectedOptionId } : {}),
        applied: selection?.type === "choice-selected" && appliedChoices.has(selection.eventId),
      }];
    }),
    experiences: lifecycle.events.filter((event) => event.type === "experience-recorded").map((event) => ({
      eventId: event.eventId, description: event.description, category: event.category,
      advancementApplied: lifecycle.events.some((revision) => revision.type === "experience-revision-linked" && revision.experienceEventId === event.eventId),
    })),
  };
}

export function projectGmLifecycle(lifecycle: CharacterLifecycle): GmLifecycleView {
  const openings = lifecycle.events.filter((event) => event.type === "choice-opened");
  return {
    choices: openings.map((opening) => {
      const assessment = [...lifecycle.events].reverse().find((event) => event.type === "choice-assessed" && event.choiceId === opening.choiceId);
      const summary = getChoiceSummary(lifecycle, opening.choiceId);
      return {
        choiceId: opening.choiceId, sourceId: opening.sourceId,
        ...(assessment?.type === "choice-assessed" ? { assessment: {
          rulesSourceId: assessment.rulesSourceId, sourceNativeStateId: assessment.sourceNativeStateId,
          reason: assessment.reason, eventId: assessment.eventId,
        } } : {}),
        ...(summary?.selectedOptionId ? { selectedOptionId: summary.selectedOptionId } : {}),
        ...(summary?.appliedNativeStateId ? { resultingNativeStateId: summary.appliedNativeStateId } : {}),
      };
    }),
    experiences: lifecycle.events.filter((event) => event.type === "experience-recorded").map((event) => {
      const revision = lifecycle.events.find((candidate) => candidate.type === "experience-revision-linked" && candidate.experienceEventId === event.eventId);
      return {
        eventId: event.eventId, sourceNativeStateId: event.sourceNativeStateId, description: event.description,
        ...(revision?.type === "experience-revision-linked" ? {
          resultingNativeStateId: revision.resultingNativeStateId, systemAdapterId: revision.systemAdapterId,
        } : {}),
      };
    }),
  };
}
