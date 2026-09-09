import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { defaultGuidedDnd5eCoreChoices } from "./guidedDefaults.js";
import { guidedGenerateDnd5eFirstSlice } from "./guidedGenerate.js";
import {
  applyDnd5eGuidedNarrativeContinuation,
  createDnd5eGuidedNarrativeContinuation,
  DND5E_GUIDED_NARRATIVE_CONTINUATION_METHOD_ID,
  DND5E_GUIDED_NARRATIVE_CONTINUATION_RECIPE_VERSION,
} from "./guidedNarrativeContinuation.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";
import type { GuidedDnd5eClassId } from "./srdCatalog.js";

const narrativeAnswers = {
  role: "front-line" as const,
  past: "hard-duty" as const,
  heritage: "adaptable" as const,
  order: "honor-structure" as const,
  regard: "protect-others" as const,
};

function mechanicalCharacter(classId: GuidedDnd5eClassId = "paladin", alignmentId = "chaotic-evil") {
  const coreChoices = defaultGuidedDnd5eCoreChoices(classId, "soldier", "human");
  coreChoices.alignmentId = alignmentId;
  return guidedGenerateDnd5eFirstSlice({
    name: "Continued Hero",
    classChoice: { selectedId: classId, acceptableIds: ["fighter"], selectionMode: "direct" },
    backgroundChoice: { selectedId: "soldier", acceptableIds: ["soldier"], selectionMode: "direct" },
    speciesChoice: { selectedId: "human", acceptableIds: ["human"], selectionMode: "direct" },
    coreChoices,
    abilityMethod: {
      method: "standard-array",
      assignment: { strength: 15, dexterity: 12, constitution: 13, intelligence: 8, wisdom: 10, charisma: 14 },
    },
    backgroundIncreases: { strength: 2, constitution: 1 },
    backgroundEquipmentChoice: "A",
  });
}

describe("D&D Guided Narrative continuation", () => {
  it("creates a replayable continuation with narrowed pre-Guided choices including mapped alignment", () => {
    const continuation = createDnd5eGuidedNarrativeContinuation({
      answers: narrativeAnswers,
      seed: "continue-replay",
      overrides: { classId: "fighter" },
    });

    expect(continuation.seed).toBe("continue-replay");
    expect(continuation.classChoice.candidateIds).toEqual(["barbarian", "fighter", "paladin"]);
    expect(continuation.alignmentChoice).toEqual({ candidateIds: ["lawful-good"], recommendedId: "lawful-good" });
    expect(continuation.initialChoices).toEqual({ classId: "fighter", backgroundId: "soldier", speciesId: "human", alignmentId: "lawful-good" });
  });

  it("retains Narrative provenance while later Guided Mechanical class and alignment edits remain authoritative", () => {
    const continuation = createDnd5eGuidedNarrativeContinuation({
      answers: narrativeAnswers,
      seed: "continue-edit",
      overrides: { classId: "fighter" },
    });
    const mechanical = mechanicalCharacter("paladin", "chaotic-evil");
    const nativeState = mechanical.nativeStates[0];
    const continued = applyDnd5eGuidedNarrativeContinuation(mechanical, continuation);
    const payload = continued.nativeStates[0].payload as Dnd5eNativeCharacter;

    expect(continued.nativeStates[0]).toBe(nativeState);
    expect(dnd5eSrd521Adapter.validateNativeState(continued.nativeStates[0])).toEqual({ valid: true, issues: [] });
    expect(payload.identity.alignment).toBe("chaotic-evil");
    expect(continued.generation?.methodId).toBe(DND5E_GUIDED_NARRATIVE_CONTINUATION_METHOD_ID);
    expect(continued.generation?.mode).toBe("hybrid");
    expect(continued.generation?.recipeVersion).toBe(DND5E_GUIDED_NARRATIVE_CONTINUATION_RECIPE_VERSION);
    expect(continued.generation?.recipe).toMatchObject({
      mappingId: continuation.mappingId,
      mappingVersion: continuation.mappingVersion,
      narrativeSeed: "continue-edit",
      initialChoices: { classId: "fighter", backgroundId: "soldier", speciesId: "human", alignmentId: "lawful-good" },
    });
    expect(continued.generation?.decisions.find((decision) => decision.stepId === "narrative.mapping.class")?.answer).toMatchObject({
      narrativeFinalId: "fighter",
      finalId: "paladin",
      changedAfterContinuation: true,
    });
    expect(continued.generation?.decisions.find((decision) => decision.stepId === "narrative.mapping.alignment")?.answer).toMatchObject({
      narrativeFinalId: "lawful-good",
      finalId: "chaotic-evil",
      changedAfterContinuation: true,
    });
    expect(continued.generation?.decisions.find((decision) => decision.stepId === "class")?.choiceId).toBe("paladin");
    expect(continued.generation?.decisions.find((decision) => decision.stepId === "alignment")?.choiceId).toBe("chaotic-evil");
    expect(continued.generation?.decisions.find((decision) => decision.stepId === "class.acceptable-pool")?.answer).toEqual(["fighter"]);
  });

  it("rejects retained continuation provenance that no longer replays", () => {
    const continuation = createDnd5eGuidedNarrativeContinuation({ answers: narrativeAnswers, seed: "tamper-check" });
    const tampered = {
      ...continuation,
      alignmentChoice: { ...continuation.alignmentChoice, recommendedId: "neutral" },
    };

    expect(() => applyDnd5eGuidedNarrativeContinuation(mechanicalCharacter(), tampered)).toThrow("does not replay");
  });
});
