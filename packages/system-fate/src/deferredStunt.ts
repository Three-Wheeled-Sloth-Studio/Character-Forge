import {
  appendLifecycleEvent, getChoiceSummary, type CharacterDocument,
  type CharacterLifecycle, type NativeSystemState, type CharacterLifecycleSnapshot, type CharacterLifecycleStore,
} from "../../character-model/src/index.js";
import { fateCondensedProbeAdapter } from "./adapter.js";
import type { FateNativeCharacter, FateStunt } from "./nativeCharacter.js";
import { FATE_CONDENSED_PROBE_SOURCE } from "./rulesSource.js";

export type FateCharacterSnapshot = CharacterLifecycleSnapshot;

/** Implementations must atomically replace both values with optimistic locking. */
export type FateCharacterStore = CharacterLifecycleStore;

export interface FateEventIds { opened: string; deferred: string; assessed: string; selected: string; linked: string }

function sourceState(document: CharacterDocument): NativeSystemState {
  const native = document.nativeStates.find((state) => state.id === document.primaryNativeStateId);
  if (!native || !fateCondensedProbeAdapter.validateNativeState(native).valid) throw new Error("Current Fate native state is missing or invalid.");
  return native;
}

function checkSnapshot(snapshot: FateCharacterSnapshot, characterId: string): NativeSystemState {
  if (snapshot.document.characterId !== characterId || snapshot.lifecycle.characterId !== characterId) throw new Error("Character and lifecycle identities must match.");
  return sourceState(snapshot.document);
}

async function loadRequired(store: FateCharacterStore, characterId: string): Promise<FateCharacterSnapshot> {
  const snapshot = await store.load(characterId);
  if (!snapshot) throw new Error("Character not found.");
  return snapshot;
}

export async function deferFateStuntChoice(
  store: FateCharacterStore, characterId: string, choiceId: string,
  eventIds: Pick<FateEventIds, "opened" | "deferred">, occurredAt: string,
): Promise<FateCharacterSnapshot> {
  const snapshot = await loadRequired(store, characterId);
  const native = checkSnapshot(snapshot, characterId);
  const payload = native.payload as unknown as FateNativeCharacter;
  if (payload.stunts.length >= payload.stuntSlots) throw new Error("No deferred Fate stunt slots remain.");
  let lifecycle = appendLifecycleEvent(snapshot.lifecycle, {
    eventId: eventIds.opened, choiceId, type: "choice-opened", occurredAt,
    sourceId: "fate:starter-stunt-slot", prompt: "Choose an original stunt when ready",
    optionIds: [], canDefer: true, allowsFreeformOptions: true,
  });
  lifecycle = appendLifecycleEvent(lifecycle, { eventId: eventIds.deferred, choiceId, type: "choice-deferred", occurredAt });
  return store.compareAndSwap(characterId, snapshot.revision, { document: snapshot.document, lifecycle });
}

export async function selectDeferredFateStunt(
  store: FateCharacterStore, characterId: string, choiceId: string,
  stunt: FateStunt, resultingNativeStateId: string,
  eventIds: Pick<FateEventIds, "assessed" | "selected" | "linked">, occurredAt: string,
): Promise<FateCharacterSnapshot> {
  const snapshot = await loadRequired(store, characterId);
  const native = checkSnapshot(snapshot, characterId);
  const summary = getChoiceSummary(snapshot.lifecycle, choiceId);
  const opening = snapshot.lifecycle.events.find((event) => event.type === "choice-opened" && event.choiceId === choiceId);
  if (!summary || summary.status !== "deferred" || opening?.type !== "choice-opened" || opening.sourceId !== "fate:starter-stunt-slot" || !opening.allowsFreeformOptions) {
    throw new Error("There is no eligible deferred Fate stunt choice.");
  }
  if (!resultingNativeStateId.trim() || snapshot.document.nativeStates.some((state) => state.id === resultingNativeStateId)) throw new Error("Native revision ID must be new.");
  if (!stunt.id.trim() || !stunt.text.trim()) throw new Error("An original stunt requires an ID and a description.");
  const payload = native.payload as unknown as FateNativeCharacter;
  if (payload.stunts.length >= payload.stuntSlots || payload.stunts.some((existing) => existing.id === stunt.id)) throw new Error("Stunt slot unavailable or stunt ID already selected.");

  // Validate the exact new source-owned state before recording a legal assessment.
  const revised: NativeSystemState = {
    ...structuredClone(native), id: resultingNativeStateId,
    payload: { ...structuredClone(payload), stunts: [...payload.stunts.map((entry) => ({ ...entry })), { ...stunt }] },
  };
  const validation = fateCondensedProbeAdapter.validateNativeState(revised);
  if (!validation.valid) throw new Error(`Fate stunt revision rejected: ${validation.issues.map((issue) => issue.message).join("; ")}`);

  let lifecycle = appendLifecycleEvent(snapshot.lifecycle, {
    eventId: eventIds.assessed, choiceId, type: "choice-assessed", occurredAt,
    sourceNativeStateId: native.id, rulesSourceId: FATE_CONDENSED_PROBE_SOURCE.id,
    eligibleOptionIds: [stunt.id], reason: "Valid original Stunt; unfilled starter slot confirmed by Fate adapter",
  });
  lifecycle = appendLifecycleEvent(lifecycle, {
    eventId: eventIds.selected, choiceId, type: "choice-selected", occurredAt,
    optionId: stunt.id, assessmentEventId: eventIds.assessed,
  });
  lifecycle = appendLifecycleEvent(lifecycle, {
    eventId: eventIds.linked, type: "native-revision-linked", occurredAt,
    selectionEventId: eventIds.selected, sourceNativeStateId: native.id,
    resultingNativeStateId, systemAdapterId: fateCondensedProbeAdapter.adapterId,
  });
  const document: CharacterDocument = {
    ...snapshot.document, primaryNativeStateId: revised.id,
    nativeStates: [...snapshot.document.nativeStates, revised],
  };
  // Document and events cross the persistence boundary together, never separately.
  return store.compareAndSwap(characterId, snapshot.revision, { document, lifecycle });
}
