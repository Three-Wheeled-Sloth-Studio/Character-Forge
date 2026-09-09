import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { classChoiceRules, DND5E_ALIGNMENT_OPTIONS, DND5E_FIGHTING_STYLE_OPTIONS } from "./guidedChoices.js";
import {
  DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
  DND5E_GUIDED_NARRATIVE_FIGHTER_STYLE_QUESTION,
  DND5E_GUIDED_NARRATIVE_MAPPING_ID,
  DND5E_GUIDED_NARRATIVE_MAPPING_VERSION,
  DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES,
  DND5E_GUIDED_NARRATIVE_QUESTIONS,
  guidedNarrativeGenerateDnd5eFirstSlice,
  recommendDnd5eGuidedNarrative,
  resolveDnd5eGuidedNarrativeEquipmentChoices,
  resolveDnd5eGuidedNarrativeFighterStyle,
  type Dnd5eGuidedNarrativeAnswers,
} from "./guidedNarrative.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";
import { GUIDED_DND5E_BACKGROUND_IDS, GUIDED_DND5E_CLASS_IDS, GUIDED_DND5E_SPECIES_IDS } from "./srdCatalog.js";

const chooseForMeAnswers: Dnd5eGuidedNarrativeAnswers = {
  role: DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
  past: DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
  heritage: DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
  equipment: DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
  order: DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
  regard: DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
};

const explicitAnswers: Dnd5eGuidedNarrativeAnswers = {
  role: "wield-magic",
  past: "study",
  heritage: "uncanny",
  equipment: "prepared-gear",
  order: "personal-freedom",
  regard: "protect-others",
};

describe("D&D 5E Guided Narrative first slice", () => {
  it("offers Choose for me on every global and Fighter-specific narrative question without exceeding the presentation ceiling", () => {
    expect(DND5E_GUIDED_NARRATIVE_QUESTIONS).toHaveLength(6);
    for (const question of [...DND5E_GUIDED_NARRATIVE_QUESTIONS, DND5E_GUIDED_NARRATIVE_FIGHTER_STYLE_QUESTION]) {
      expect(question.options.some((option) => option.id === DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID)).toBe(true);
      expect(question.options.filter((option) => option.id !== DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID).length).toBeGreaterThan(0);
      expect(question.options.length).toBeLessThanOrEqual(DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES);
    }
    expect(DND5E_GUIDED_NARRATIVE_FIGHTER_STYLE_QUESTION.options).toHaveLength(5);
  });

  it("resolves Choose for me deterministically and retains submitted versus resolved answers", () => {
    const first = recommendDnd5eGuidedNarrative({ answers: chooseForMeAnswers, seed: "narrative-replay" });
    const second = recommendDnd5eGuidedNarrative({ answers: chooseForMeAnswers, seed: "narrative-replay" });

    expect(second).toEqual(first);
    expect(first.mappingId).toBe(DND5E_GUIDED_NARRATIVE_MAPPING_ID);
    expect(first.mappingVersion).toBe(DND5E_GUIDED_NARRATIVE_MAPPING_VERSION);
    for (const resolution of Object.values(first.answers)) {
      expect(resolution.submittedId).toBe(DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID);
      expect(resolution.resolvedId).not.toBe(DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID);
    }
    expect(first.fighterStyle.submittedId).toBe(DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID);
    expect(first.fighterStyle.resolvedId).not.toBe(DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID);
    expect(GUIDED_DND5E_CLASS_IDS).toContain(first.classChoice.recommendedId);
    expect(GUIDED_DND5E_BACKGROUND_IDS).toContain(first.backgroundChoice.recommendedId);
    expect(GUIDED_DND5E_SPECIES_IDS).toContain(first.speciesChoice.recommendedId);
    expect(DND5E_ALIGNMENT_OPTIONS.map((option) => option.id)).toContain(first.alignmentChoice.recommendedId);
    expect(first.alignmentChoice.candidateIds).toEqual([first.alignmentChoice.recommendedId]);
  });

  it("maps two bounded fictional alignment questions onto the ordinary nine-choice alignment catalog", () => {
    const cases = [
      ["honor-structure", "protect-others", "lawful-good"],
      ["honor-structure", "balance-needs", "lawful-neutral"],
      ["honor-structure", "self-first", "lawful-evil"],
      ["case-by-case", "protect-others", "neutral-good"],
      ["case-by-case", "balance-needs", "neutral"],
      ["case-by-case", "self-first", "neutral-evil"],
      ["personal-freedom", "protect-others", "chaotic-good"],
      ["personal-freedom", "balance-needs", "chaotic-neutral"],
      ["personal-freedom", "self-first", "chaotic-evil"],
    ] as const;

    expect(DND5E_ALIGNMENT_OPTIONS).toHaveLength(9);
    for (const [order, regard, alignmentId] of cases) {
      const recommendation = recommendDnd5eGuidedNarrative({
        answers: { ...explicitAnswers, order, regard },
        seed: `alignment-${alignmentId}`,
      });
      expect(recommendation.alignmentChoice).toEqual({ candidateIds: [alignmentId], recommendedId: alignmentId });
    }
  });

  it("maps the outfitting preference only onto existing prepared-package and starting-gold choices", () => {
    expect(resolveDnd5eGuidedNarrativeEquipmentChoices("prepared-gear", "fighter")).toEqual({
      preferenceId: "prepared-gear",
      classEquipmentChoice: "A",
      backgroundEquipmentChoice: "A",
    });
    expect(resolveDnd5eGuidedNarrativeEquipmentChoices("starting-gold", "fighter")).toEqual({
      preferenceId: "starting-gold",
      classEquipmentChoice: "C",
      backgroundEquipmentChoice: "B:50-gp",
    });

    for (const classId of GUIDED_DND5E_CLASS_IDS) {
      const mapping = resolveDnd5eGuidedNarrativeEquipmentChoices("starting-gold", classId);
      expect(classChoiceRules(classId).equipmentChoices.map((option) => option.id)).toContain(mapping.classEquipmentChoice);
      expect(mapping.backgroundEquipmentChoice).toBe("B:50-gp");
      expect(mapping.classEquipmentChoice).toBe(classId === "fighter" ? "C" : "B");
    }
  });

  it("maps the bounded Fighter playstyle branch one-to-one onto existing Fighting Styles", () => {
    const cases = [
      ["control-from-range", "archery"],
      ["hold-the-line", "defense"],
      ["heavy-weapon", "great-weapon-fighting"],
      ["paired-weapons", "two-weapon-fighting"],
    ] as const;

    expect(DND5E_FIGHTING_STYLE_OPTIONS).toHaveLength(4);
    for (const [preferenceId, fightingStyleFeatId] of cases) {
      expect(resolveDnd5eGuidedNarrativeFighterStyle(preferenceId)).toBe(fightingStyleFeatId);
      const character = guidedNarrativeGenerateDnd5eFirstSlice({
        answers: { ...explicitAnswers, role: "front-line" },
        fighterStyle: preferenceId,
        seed: `fighter-style-${preferenceId}`,
        overrides: { classId: "fighter" },
      });
      expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0])).toEqual({ valid: true, issues: [] });
      expect(character.generation?.decisions.find((decision) => decision.stepId === "narrative.fighter-style")?.choiceId).toBe(preferenceId);
      expect(character.generation?.decisions.find((decision) => decision.stepId === "narrative.mapping.fighter-style")?.choiceId).toBe(fightingStyleFeatId);
      expect(character.generation?.decisions.find((decision) => decision.stepId === "class.fighting-style")?.choiceId).toBe(fightingStyleFeatId);
    }
  });

  it("keeps explicit narrative mappings bounded to already-supported small candidate sets", () => {
    const recommendation = recommendDnd5eGuidedNarrative({ answers: explicitAnswers, seed: "explicit-map" });

    expect(["wizard", "sorcerer", "warlock"]).toContain(recommendation.classChoice.recommendedId);
    expect(recommendation.backgroundChoice).toEqual({ candidateIds: ["sage"], recommendedId: "sage" });
    expect(["tiefling", "halfling", "gnome"]).toContain(recommendation.speciesChoice.recommendedId);
    expect(recommendation.alignmentChoice).toEqual({ candidateIds: ["chaotic-good"], recommendedId: "chaotic-good" });
    for (const mapping of [recommendation.classChoice, recommendation.backgroundChoice, recommendation.speciesChoice, recommendation.alignmentChoice]) {
      expect(mapping.candidateIds.length).toBeLessThanOrEqual(DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES);
    }
  });

  it("generates an ordinary valid native character with mapped alignment, equipment, and guided-narrative provenance", () => {
    const recommendation = recommendDnd5eGuidedNarrative({ answers: chooseForMeAnswers, seed: "narrative-character" });
    const character = guidedNarrativeGenerateDnd5eFirstSlice({
      name: "Narrative Test",
      answers: chooseForMeAnswers,
      seed: "narrative-character",
    });
    const payload = character.nativeStates[0].payload as Dnd5eNativeCharacter;
    const expectedEquipment = resolveDnd5eGuidedNarrativeEquipmentChoices(recommendation.answers.equipment.resolvedId, payload.class.classId as (typeof GUIDED_DND5E_CLASS_IDS)[number]);

    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0])).toEqual({ valid: true, issues: [] });
    expect(payload.identity.alignment).toBe(recommendation.alignmentChoice.recommendedId);
    expect(payload.origin.backgroundEquipmentChoice).toBe(expectedEquipment.backgroundEquipmentChoice);
    expect(character.generation?.mode).toBe("guided-narrative");
    expect(character.generation?.methodId).toBe("dnd5e:guided-narrative-level-one");
    expect(character.generation?.recipeVersion).toBe("0.4");
    expect(character.generation?.seed).toBe("narrative-character");
    expect(character.generation?.decisions.find((decision) => decision.stepId === "narrative.role")?.answer).toMatchObject({
      submittedId: "choose-for-me",
      chooseForMe: true,
    });
    expect(character.generation?.decisions.find((decision) => decision.stepId === "narrative.equipment")?.answer).toMatchObject({
      submittedId: "choose-for-me",
      resolvedId: recommendation.answers.equipment.resolvedId,
      chooseForMe: true,
    });
    expect(character.generation?.decisions.find((decision) => decision.stepId === "narrative.order")?.answer).toMatchObject({
      submittedId: "choose-for-me",
      chooseForMe: true,
    });
    expect(character.generation?.decisions.find((decision) => decision.stepId === "narrative.mapping.alignment")?.answer).toMatchObject({
      recommendedId: recommendation.alignmentChoice.recommendedId,
      finalId: recommendation.alignmentChoice.recommendedId,
      overridden: false,
    });
    expect(character.generation?.decisions.find((decision) => decision.stepId === "narrative.mapping.equipment")?.answer).toMatchObject({
      recommendedPreferenceId: recommendation.answers.equipment.resolvedId,
      startingClassEquipmentChoice: expectedEquipment.classEquipmentChoice,
      startingBackgroundEquipmentChoice: expectedEquipment.backgroundEquipmentChoice,
      finalClassEquipmentChoice: expectedEquipment.classEquipmentChoice,
      finalBackgroundEquipmentChoice: expectedEquipment.backgroundEquipmentChoice,
      changedAfterContinuation: false,
    });
    expect(character.generation?.decisions.find((decision) => decision.stepId === "class.equipment")?.choiceId).toBe(expectedEquipment.classEquipmentChoice);
    expect(character.generation?.decisions.find((decision) => decision.stepId === "background.equipment")?.choiceId).toBe(expectedEquipment.backgroundEquipmentChoice);
    expect(character.generation?.decisions.find((decision) => decision.stepId === "alignment")?.choiceId).toBe(recommendation.alignmentChoice.recommendedId);
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
    expect(payload.identity.alignment).toBe("chaotic-good");
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
