/**
 * Append-only, system-neutral record of *decisions*, not a rules engine.
 * System adapters determine when options are legal and apply selected effects
 * to their own native character state. Never infer eligibility here.
 */
export interface LifecycleBaseEvent {
  eventId: string;
  choiceId: string;
  occurredAt: string;
}

export interface ChoiceOpenedEvent extends LifecycleBaseEvent {
  type: "choice-opened";
  sourceId: string;
  prompt: string;
  optionIds: string[];
  canDefer: boolean;
  /** System-owned open narrative choice; option identities are validated by the adapter. */
  allowsFreeformOptions?: boolean;
}

export interface ChoiceAssessedEvent extends LifecycleBaseEvent {
  type: "choice-assessed";
  sourceNativeStateId: string;
  rulesSourceId: string;
  eligibleOptionIds: string[];
  reason: string;
}

export interface ChoiceDeferredEvent extends LifecycleBaseEvent {
  type: "choice-deferred";
  reason?: string;
}

export interface ChoiceSelectedEvent extends LifecycleBaseEvent {
  type: "choice-selected";
  optionId: string;
  assessmentEventId: string;
}

export interface NativeRevisionLinkedEvent {
  eventId: string;
  type: "native-revision-linked";
  occurredAt: string;
  selectionEventId: string;
  sourceNativeStateId: string;
  resultingNativeStateId: string;
  systemAdapterId: string;
}

export interface ExperienceRecordedEvent {
  eventId: string;
  type: "experience-recorded";
  occurredAt: string;
  sourceNativeStateId: string;
  category: "practice" | "discovery" | "milestone" | "consequence" | "other";
  description: string;
}

export interface ExperienceRevisionLinkedEvent {
  eventId: string;
  type: "experience-revision-linked";
  occurredAt: string;
  experienceEventId: string;
  sourceNativeStateId: string;
  resultingNativeStateId: string;
  systemAdapterId: string;
}

export type CharacterLifecycleEvent = ChoiceOpenedEvent | ChoiceAssessedEvent | ChoiceDeferredEvent | ChoiceSelectedEvent | NativeRevisionLinkedEvent | ExperienceRecordedEvent | ExperienceRevisionLinkedEvent;

export interface CharacterLifecycle {
  schemaVersion: "character-lifecycle/0.1";
  characterId: string;
  events: CharacterLifecycleEvent[];
}

export interface ChoiceSummary {
  choiceId: string;
  status: "open" | "deferred" | "selected";
  eligibleOptionIds: string[];
  selectedOptionId?: string;
  appliedNativeStateId?: string;
}

export function createCharacterLifecycle(characterId: string): CharacterLifecycle {
  if (!characterId.trim()) throw new Error("Lifecycle characterId is required.");
  return { schemaVersion: "character-lifecycle/0.1", characterId, events: [] };
}

export function getChoiceSummary(lifecycle: CharacterLifecycle, choiceId: string): ChoiceSummary | null {
  let status: ChoiceSummary["status"] | null = null;
  let eligibleOptionIds: string[] = [];
  let selectedOptionId: string | undefined;
  let appliedNativeStateId: string | undefined;
  const selections = new Map<string, string>();
  for (const event of lifecycle.events) {
    if (event.type === "experience-recorded" || event.type === "experience-revision-linked") continue;
    if (event.type === "native-revision-linked") {
      if (selections.get(event.selectionEventId) === choiceId) appliedNativeStateId = event.resultingNativeStateId;
      continue;
    }
    if (event.choiceId !== choiceId) continue;
    if (event.type === "choice-opened") status = "open";
    if (event.type === "choice-assessed") eligibleOptionIds = [...event.eligibleOptionIds];
    if (event.type === "choice-deferred") status = "deferred";
    if (event.type === "choice-selected") {
      status = "selected";
      selectedOptionId = event.optionId;
      selections.set(event.eventId, event.choiceId);
    }
  }
  return status === null ? null : {
    choiceId, status, eligibleOptionIds,
    ...(selectedOptionId ? { selectedOptionId } : {}),
    ...(appliedNativeStateId ? { appliedNativeStateId } : {}),
  };
}

export function appendLifecycleEvent(lifecycle: CharacterLifecycle, event: CharacterLifecycleEvent): CharacterLifecycle {
  if (!event.eventId.trim() || !Number.isFinite(Date.parse(event.occurredAt))) {
    throw new Error("Lifecycle events require a unique ID and valid timestamp.");
  }
  if (lifecycle.events.some((existing) => existing.eventId === event.eventId)) throw new Error("Duplicate lifecycle event ID.");
  const last = lifecycle.events.at(-1);
  if (last && Date.parse(event.occurredAt) < Date.parse(last.occurredAt)) throw new Error("Lifecycle event time cannot move backward.");
  if (event.type === "experience-revision-linked") {
    const experience = lifecycle.events.find((prior) => prior.eventId === event.experienceEventId);
    if (experience?.type !== "experience-recorded" || experience.sourceNativeStateId !== event.sourceNativeStateId) throw new Error("Experience revision must reference a matching recorded experience.");
    if (lifecycle.events.some((prior) => prior.type === "experience-revision-linked" && prior.experienceEventId === event.experienceEventId)) throw new Error("Experience already linked to a native revision.");
    if (!event.resultingNativeStateId.trim() || !event.systemAdapterId.trim() || event.resultingNativeStateId === event.sourceNativeStateId) throw new Error("Experience revision requires a new native state and an adapter.");
  } else if (event.type === "experience-recorded") {
    if (!event.sourceNativeStateId.trim() || !event.description.trim()) throw new Error("Experience requires native-state context and a description.");
  } else if (event.type === "choice-opened") {
    if (!event.choiceId.trim() || !event.sourceId.trim() || !event.prompt.trim() || (event.optionIds.length === 0 && !event.allowsFreeformOptions) || event.optionIds.some((id) => !id.trim()) || new Set(event.optionIds).size !== event.optionIds.length || getChoiceSummary(lifecycle, event.choiceId)) {
      throw new Error("Choice must open once with distinct possible options.");
    }
  } else if (event.type === "native-revision-linked") {
    const selection = lifecycle.events.find((prior) => prior.eventId === event.selectionEventId);
    if (!selection || selection.type !== "choice-selected") throw new Error("Native revision must reference a recorded selection.");
    if (lifecycle.events.some((prior) => prior.type === "native-revision-linked" && prior.selectionEventId === event.selectionEventId)) throw new Error("Selection already linked to a native revision.");
    if (!event.sourceNativeStateId.trim() || !event.resultingNativeStateId.trim() || !event.systemAdapterId.trim() || event.sourceNativeStateId === event.resultingNativeStateId) throw new Error("Native revision requires distinct state identities and an adapter.");
    const assessment = lifecycle.events.find((prior) => prior.eventId === selection.assessmentEventId);
    if (assessment?.type !== "choice-assessed" || assessment.sourceNativeStateId !== event.sourceNativeStateId) throw new Error("Native revision must match the selection's assessed source state.");
  } else {
    const summary = getChoiceSummary(lifecycle, event.choiceId);
    if (!summary || summary.status === "selected") throw new Error("Choice is missing or already selected.");
    const opening = lifecycle.events.find((prior) => prior.type === "choice-opened" && prior.choiceId === event.choiceId) as ChoiceOpenedEvent;
    if (event.type === "choice-deferred") {
      if (!opening.canDefer) throw new Error("This choice cannot be deferred.");
    } else if (event.type === "choice-assessed") {
      if (!event.sourceNativeStateId.trim() || !event.rulesSourceId.trim() || !event.reason.trim() || event.eligibleOptionIds.some((id) => !id.trim() || (!opening.allowsFreeformOptions && !opening.optionIds.includes(id))) || new Set(event.eligibleOptionIds).size !== event.eligibleOptionIds.length) {
        throw new Error("Assessment must provide a source and a subset of offered options.");
      }
    } else {
      const assessment = [...lifecycle.events].reverse().find((prior) => prior.type === "choice-assessed" && prior.choiceId === event.choiceId);
      if (assessment?.type !== "choice-assessed" || assessment.eventId !== event.assessmentEventId || !assessment.eligibleOptionIds.includes(event.optionId)) throw new Error("Selection requires the latest eligibility assessment and a legal option.");
    }
  }
  return { ...lifecycle, events: [...lifecycle.events, structuredClone(event)] };
}
