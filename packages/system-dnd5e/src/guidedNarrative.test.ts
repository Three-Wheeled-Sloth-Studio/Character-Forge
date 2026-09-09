import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import {
  DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
  DND5E_GUIDED_NARRATIVE_MAPPING_ID,
  DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES,
  DND5E_GUIDED_NARRATIVE_QUESTIONS,
  guidedNarrativeGenerateDnd5eFirstSlice,
  recommendDnd5eGuidedNarrative,
  type Dnd5eGuidedNarrativeAnswers,
} from "./guidedNarrative.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";
import { GUIDED_DND5E_BACKGROUND_IDS, GUIDED_DND5E_CLASS_IDS, GUIDED_DND5E_SPECIES_IDS } from "./srdCatalog.js";

const chooseForMeAnswers: Dnd5eGuidedNarrativeAnswers = {
  role: DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
  past: DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
  heritage: DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
};

const explicitAnswers: Dnd5eGuidedNarrativeAnswers = {
  role: "wield-magic",
  past: "study",
  heritage: "uncanny",
};

describe("D&D 5E Guided Narrative first slice", () => {
  it("offers Choose for me on every narrative question without exceeding the presentation ceiling", () => {
    expect(DND5E_GUIDED_NARRATIVE_QUESTIONS.length).toBeGreaterThan(0);
    for (const question of DND5E_GUIDED_NARRATIVE_QUESTIONS) {
      expect(question.options.some((option) => option.id === DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID)).toBe(true);
      expect(question.options.filter((option) => option.id !== DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID).length).toBeGreaterThan(0);
      expect(question.options.length).toBeLessThanOrEqual(DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES);
    }
  });

  it("resolves Choose for me deterministically and retains submitted versus resolved answers", () => {
    const first = recommendDnd5eGuidedNarrative({ answers: chooseForMeAnswers, seed: "narrative-replay" });
    const second = recommendDnd5eGuidedNarrative({ answers: chooseForMeAnswers, seed: "narrative-replay" });

    expect(second).toEqual(first);
    expect(first.mappingId).toBe(DND5E_GUIDED_NARRATIVE_MAPPING_ID);
    for (const resolution of Object.values(first.answers)) {
      expect(resolution.submittedId).toBe(DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID);
      expect(resolution.resolvedId).not.toBe(DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID);
    }
    expect(GUIDED_DND5E_CLASS_IDS).toContain(first.classChoice.recommendedId);
    expect(GUIDED_DND5E_BACKGROUND_IDS).toContain(first.backgroundChoice.recommendedId);
    expect(GUIDED_DND5E_SPECIES_IDS).toContain(first.speciesChoice.recommendedId);
  });

  it("keeps explicit narrative mappings bounded to already-supported small candidate sets", () => {
    const recommendation = recommendDnd5eGuidedNarrative({ answers: explicitAnswers, seed: "explicit-map" });

    expect(["wizard", "sorcerer", "warlock"]).toContain(recommendation.classChoice.recommendedId);
    expect(recommendation.backgroundChoice).toEqual({ candidateIds: ["sage"], recommendedId: "sage" });
    expect(["tiefling", "halfling", "gnome"]).toContain(recommendation.speciesChoice.recommendedId);
    for (const mapping of [recommendation.classChoice, recommendation.backgroundChoice, recommendation.speciesChoice]) {
      expect(mapping.candidateIds.length).toBeLessThanOrEqual(DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES);
    }
  });

  it("generates an ordinary valid native character with guided-narrative provenance", () => {
    const character = guidedNarrativeGenerateDnd5eFirstSlice({
      name: "Narrative Test",
      answers: chooseForMeAnswers,
      seed: "narrative-character",
    });

    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0])).toEqual({ valid: true, issues: [] });
    expect(character.generation?.mode).toBe("guided-narrative");
    expect(character.generation?.methodId).toBe("dnd5e:guided-narrative-level-one");
    expect(character.generation?.seed).toBe("narrative-character");
    expect(character.generation?.decisions.find((decision) => decision.stepId === "narrative.role")?.answer).toMatchObject({
      submittedId: "choose-for-me",
      chooseForMe: true,
    });
    expect(character.generation?.decisions.some((decision) => decision.stepId === "class.acceptable-pool")).toBe(false);
  });

  it("records overrides within the narrowed branch without changing the ordinary native-state model", () => {
    const recommendation = recommendDnd5eGuidedNarrative({ answers: explicitAnswers, seed: "override-map" });
    const classId = recommendation.classChoice.candidateIds.find((id) => id !== recommendation.classChoice.recommendedId)!;
    const speciesId = recommendation.speciesChoice.candidateIds.find((id) => id !== recommendation.speciesChoice.recommendedId)!;
    const character = guidedNarrativeGenerateDnd5eFirstSlice({
      name: "Override Test",
      answers: explicitAnswers,
      seed: "override-map",
      overrides: { classId, speciesId },
    });
    const payload = character.nativeStates[0].payload as Dnd5eNativeCharacter;

    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0])).toEqual({ valid: true, issues: [] });
    expect(payload.class.classId).toBe(classId);
    expect(payload.origin.backgroundId).toBe("sage");
    expect(payload.origin.speciesId).toBe(speciesId);
    expect(character.generation?.decisions.find((decision) => decision.stepId === "narrative.mapping.class")?.answer).toMatchObject({
      finalId: classId,
      overridden: true,
    });
    expect(character.generation?.decisions.find((decision) => decision.stepId === "class")?.rationale).toContain("narrowed candidate set");
  });

  it("rejects a mechanical override that bypasses the narrative narrowing branch", () => {
    expect(() => guidedNarrativeGenerateDnd5eFirstSlice({
      answers: explicitAnswers,
      seed: "reject-wide-override",
      overrides: { classId: "barbarian" },
    })).toThrow("narrowed narrative candidate set");
  });
});
