import { describe, expect, it } from "vitest";
import { appendLifecycleEvent, createCharacterLifecycle, getChoiceSummary, type CharacterLifecycleEvent, type ChoiceOpenedEvent } from "./characterLifecycle.js";

const at = "2026-11-21T14:00:00.000Z";
const opened: CharacterLifecycleEvent = { eventId: "e1", choiceId: "specialization", type: "choice-opened", occurredAt: at, sourceId: "fate:free-stunt-slot", prompt: "Choose a stunt when ready", optionIds: ["shipwise", "sharp-eye"], canDefer: true };
const deferred: CharacterLifecycleEvent = { eventId: "e2", choiceId: "specialization", type: "choice-deferred", occurredAt: at, reason: "Discover in play" };
const assessment: CharacterLifecycleEvent = { eventId: "e3", choiceId: "specialization", type: "choice-assessed", occurredAt: at, sourceNativeStateId: "native-before", rulesSourceId: "fate-probe", eligibleOptionIds: ["sharp-eye"], reason: "System-owned assessment following play" };
const selection: CharacterLifecycleEvent = { eventId: "e4", choiceId: "specialization", type: "choice-selected", occurredAt: at, optionId: "sharp-eye", assessmentEventId: "e3" };

describe("character lifecycle: deferred choice and progression causality", () => {
  it("retains a deferred choice, later eligibility assessment, selected option and native revision", () => {
    const base = createCharacterLifecycle("character-1");
    const openedState = appendLifecycleEvent(base, opened);
    const deferredState = appendLifecycleEvent(openedState, deferred);
    expect(getChoiceSummary(deferredState, "specialization")?.status).toBe("deferred");
    const assessed = appendLifecycleEvent(deferredState, assessment);
    const selected = appendLifecycleEvent(assessed, selection);
    const updated = appendLifecycleEvent(selected, { eventId: "e5", type: "native-revision-linked", occurredAt: at, selectionEventId: "e4", sourceNativeStateId: "native-before", resultingNativeStateId: "native-after", systemAdapterId: "fate-probe" });
    expect(getChoiceSummary(updated, "specialization")).toEqual({ choiceId: "specialization", status: "selected", eligibleOptionIds: ["sharp-eye"], selectedOptionId: "sharp-eye", appliedNativeStateId: "native-after" });
    expect(JSON.parse(JSON.stringify(updated))).toEqual(updated);
    expect(base.events).toHaveLength(0);
    expect(openedState.events).toHaveLength(1);
  });

  it("rejects unassessed, ineligible and stale choices rather than applying rules itself", () => {
    const open = appendLifecycleEvent(createCharacterLifecycle("character-1"), opened);
    expect(() => appendLifecycleEvent(open, selection)).toThrow(/latest eligibility/i);
    const assessed = appendLifecycleEvent(open, assessment);
    expect(() => appendLifecycleEvent(assessed, { ...selection, optionId: "shipwise" })).toThrow(/legal option/i);
    const reassessed = appendLifecycleEvent(assessed, { ...assessment, eventId: "e6", eligibleOptionIds: [] });
    expect(() => appendLifecycleEvent(reassessed, selection)).toThrow(/latest eligibility/i);
    expect(() => appendLifecycleEvent(assessed, { ...selection, assessmentEventId: "e1" })).toThrow(/latest eligibility/i);
  });

  it("does not permit deferral of mandatory system-owned choices", () => {
    const state = appendLifecycleEvent(createCharacterLifecycle("character-1"), { ...opened, canDefer: false });
    expect(() => appendLifecycleEvent(state, deferred)).toThrow(/cannot be deferred/i);
  });

  it("prevents duplicate IDs, choice reopening, and ungrounded native changes", () => {
    const first = appendLifecycleEvent(createCharacterLifecycle("character-1"), opened);
    expect(() => appendLifecycleEvent(first, opened)).toThrow(/Duplicate/i);
    expect(() => appendLifecycleEvent(first, { ...opened, eventId: "another" })).toThrow(/open once/i);
    expect(() => appendLifecycleEvent(first, { eventId: "e10", type: "native-revision-linked", occurredAt: at, selectionEventId: "unknown", sourceNativeStateId: "before", resultingNativeStateId: "after", systemAdapterId: "adapter" })).toThrow(/recorded selection/i);
  });

  it("retains D&D/BRP/Fate-specific eligibility semantics as source evidence only", () => {
    for (const [system, source] of [["dnd5e", "class-feature"], ["brp", "skill-improvement"], ["fate", "stunt-slot"]]) {
      const state = appendLifecycleEvent(createCharacterLifecycle("character-1"), { ...opened, sourceId: `${system}:${source}` });
      const assessed = appendLifecycleEvent(state, { ...assessment, rulesSourceId: `${system}:rules`, reason: "Adapter has checked native eligibility" });
      expect(getChoiceSummary(assessed, "specialization")?.eligibleOptionIds).toEqual(["sharp-eye"]);
      expect(assessed.events[1]).toMatchObject({ rulesSourceId: `${system}:rules` });
    }
  });

  it("records meaningful experience without automatically awarding advancement", () => {
    const state = appendLifecycleEvent(createCharacterLifecycle("character-1"), { eventId: "xp-1", type: "experience-recorded", occurredAt: at, sourceNativeStateId: "native-before", category: "discovery", description: "Learned why the machine sings" });
    expect(state.events[0]).toMatchObject({ category: "discovery", sourceNativeStateId: "native-before" });
    expect(getChoiceSummary(state, "specialization")).toBeNull();
  });

  it("supports a system-validated freeform choice made after deferral", () => {
    const opened = appendLifecycleEvent(createCharacterLifecycle("character-1"), { ...openedEvent(), allowsFreeformOptions: true, optionIds: [] });
    const assessed = appendLifecycleEvent(opened, { ...assessment, eligibleOptionIds: ["new-original-stunt"] });
    expect(getChoiceSummary(assessed, "specialization")?.eligibleOptionIds).toEqual(["new-original-stunt"]);
    const selected = appendLifecycleEvent(assessed, { ...selection, optionId: "new-original-stunt" });
    expect(getChoiceSummary(selected, "specialization")?.selectedOptionId).toBe("new-original-stunt");
  });
});

function openedEvent(): ChoiceOpenedEvent { return opened as ChoiceOpenedEvent; }
