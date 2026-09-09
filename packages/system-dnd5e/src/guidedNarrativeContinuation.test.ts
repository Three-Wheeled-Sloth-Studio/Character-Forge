import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { defaultGuidedDnd5eCoreChoices } from "./guidedDefaults.js";
import { guidedGenerateDnd5eFirstSlice } from "./guidedGenerate.js";
import {
  applyDnd5eGuidedNarrativeContinuation,
  createDnd5eGuidedNarrativeContinuation,
  DND5E_GUIDED_NARRATIVE_CONTINUATION_METHOD_ID,
} from "./guidedNarrativeContinuation.js";
import type { GuidedDnd5eClassId } from "./srdCatalog.js";

const narrativeAnswers = {
  role: "front-line" as const,
  past: "hard-duty" as const,
  heritage: "adaptable" as const,
};

function mechanicalCharacter(classId: GuidedDnd5eClassId = "paladin") {
  return guidedGenerateDnd5eFirstSlice({
    name: "Continued Hero",
    classChoice: { selectedId: classId, acceptableIds: ["fighter"], selectionMode: "direct" },
    backgroundChoice: { selectedId: "soldier", acceptableIds: ["soldier"], selectionMode: "direct" },
    speciesChoice: { selectedId: "human", acceptableIds: ["human"], selectionMode: "direct" },
    coreChoices: defaultGuidedDnd5eCoreChoices(classId, "soldier", "human"),
    abilityMethod: {
      method: "standard-array",
      assignment: { strength: 15, dexterity: 12, constitution: 13, intelligence: 8, wisdom: 10, charisma: 14 },
    },
    backgroundIncreases: { strength: 2, constitution: 1 },
    backgroundEquipmentChoice: "A",
  });
}

describe("D&D Guided Narrative continuation", () => {
  it("creates a replayable continuation with the narrowed pre-Guided choices", () => {
    const continuation = createDnd5eGuidedNarrativeContinuation({
      answers: narrativeAnswers,
      seed: "continue-replay",
      overrides: { classId: "fighter" },
    });

    expect(continuation.seed).toBe("continue-replay");
    expect(continuation.classChoice.candidateIds).toEqual(["barbarian", "fighter", "paladin"]);
    expect(continuation.initialChoices).toEqual({ classId: "fighter", backgroundId: "soldier", speciesId: "human" });
  });

  it("retains Narrative provenance while later Guided Mechanical edits remain authoritative", () => {
    const continuation = createDnd5eGuidedNarrativeContinuation({
      answers: narrativeAnswers,
      seed: "continue-edit",
      overrides: { classId: "fighter" },
    });
    const mechanical = mechanicalCharacter("paladin");
    const nativeState = mechanical.nativeStates[0];
    const continued = applyDnd5eGuidedNarrativeContinuation(mechanical, continuation);

    expect(continued.nativeStates[0]).toBe(nativeState);
    expect(dnd5eSrd521Adapter.validateNativeState(continued.nativeStates[0])).toEqual({ valid: true, issues: [] });
    expect(continued.generation?.methodId).toBe(DND5E_GUIDED_NARRATIVE_CONTINUATION_METHOD_ID);
    expect(continued.generation?.mode).toBe("hybrid");
    expect(continued.generation?.recipe).toMatchObject({
      mappingId: continuation.mappingId,
      mappingVersion: continuation.mappingVersion,
      narrativeSeed: "continue-edit",
      initialChoices: { classId: "fighter", backgroundId: "soldier", speciesId: "human" },
    });
    expect(continued.generation?.decisions.find((decision) => decision.stepId === "narrative.mapping.class")?.answer).toMatchObject({
      narrativeFinalId: "fighter",
      finalId: "paladin",
      changedAfterContinuation: true,
    });
    expect(continued.generation?.decisions.find((decision) => decision.stepId === "class")?.choiceId).toBe("paladin");
    expect(continued.generation?.decisions.find((decision) => decision.stepId === "class.acceptable-pool")?.answer).toEqual(["fighter"]);
  });

  it("rejects retained continuation provenance that no longer replays", () => {
    const continuation = createDnd5eGuidedNarrativeContinuation({ answers: narrativeAnswers, seed: "tamper-check" });
    const tampered = {
      ...continuation,
      classChoice: { ...continuation.classChoice, recommendedId: "rogue" as GuidedDnd5eClassId },
    };

    expect(() => applyDnd5eGuidedNarrativeContinuation(mechanicalCharacter(), tampered)).toThrow("does not replay");
  });
});
