import { describe, expect, it } from "vitest";
import { appendLifecycleEvent, createCharacterLifecycle } from "./characterLifecycle.js";
import { projectGmLifecycle, projectPlayerLifecycle } from "./lifecyclePresentation.js";

const at = "2026-11-22T12:00:00Z";

describe("role-oriented lifecycle read models", () => {
  it("shows a deferred choice without leaking rules rationale into the player view", () => {
    let state = appendLifecycleEvent(createCharacterLifecycle("hero"), {
      type: "choice-opened", eventId: "open", choiceId: "stunt", occurredAt: at,
      sourceId: "fate:stunt", prompt: "Choose a stunt when ready", optionIds: [],
      allowsFreeformOptions: true, canDefer: true,
    });
    state = appendLifecycleEvent(state, { type: "choice-deferred", eventId: "later", choiceId: "stunt", occurredAt: at });
    state = appendLifecycleEvent(state, {
      type: "choice-assessed", eventId: "assessment", choiceId: "stunt", occurredAt: at,
      sourceNativeStateId: "before", rulesSourceId: "fate-condensed", reason: "One slot remains",
      eligibleOptionIds: ["quick-draw"],
    });
    const player = projectPlayerLifecycle(state);
    expect(player.choices).toEqual([{ choiceId: "stunt", prompt: "Choose a stunt when ready", status: "deferred", canDefer: true, eligibleOptionIds: ["quick-draw"], applied: false }]);
    expect(JSON.stringify(player)).not.toContain("One slot remains");
    expect(projectGmLifecycle(state).choices[0]?.assessment).toMatchObject({ reason: "One slot remains", sourceNativeStateId: "before" });
    state = appendLifecycleEvent(state, { type: "choice-selected", eventId: "select", choiceId: "stunt", occurredAt: at, optionId: "quick-draw", assessmentEventId: "assessment" });
    expect(projectPlayerLifecycle(state).choices[0]?.applied).toBe(false);
    state = appendLifecycleEvent(state, { type: "native-revision-linked", eventId: "revision", occurredAt: at, selectionEventId: "select", sourceNativeStateId: "before", resultingNativeStateId: "after", systemAdapterId: "fate" });
    expect(projectPlayerLifecycle(state).choices[0]?.applied).toBe(true);
    expect(projectGmLifecycle(state).choices[0]?.resultingNativeStateId).toBe("after");
  });

  it("distinguishes a recorded experience from applied native advancement", () => {
    let state = appendLifecycleEvent(createCharacterLifecycle("hero"), {
      type: "experience-recorded", eventId: "practice", occurredAt: at,
      category: "practice", description: "Practiced lockpicking", sourceNativeStateId: "before",
    });
    expect(projectPlayerLifecycle(state).experiences[0]?.advancementApplied).toBe(false);
    state = appendLifecycleEvent(state, {
      type: "experience-revision-linked", eventId: "gain", occurredAt: at,
      experienceEventId: "practice", sourceNativeStateId: "before", resultingNativeStateId: "after", systemAdapterId: "brp",
    });
    expect(projectPlayerLifecycle(state).experiences[0]?.advancementApplied).toBe(true);
    expect(projectGmLifecycle(state).experiences[0]).toMatchObject({ systemAdapterId: "brp", resultingNativeStateId: "after" });
  });

  it("returns detached read values without mutating the lifecycle", () => {
    const state = appendLifecycleEvent(createCharacterLifecycle("hero"), {
      type: "choice-opened", eventId: "open", choiceId: "origin", occurredAt: at,
      sourceId: "system:origin", prompt: "Choose origin", optionIds: ["one"], canDefer: false,
    });
    const view = projectPlayerLifecycle(state);
    view.choices[0]!.eligibleOptionIds.push("two");
    expect(state.events[0]).toMatchObject({ optionIds: ["one"] });
    expect(projectPlayerLifecycle(state).choices[0]?.eligibleOptionIds).toEqual([]);
  });
});
