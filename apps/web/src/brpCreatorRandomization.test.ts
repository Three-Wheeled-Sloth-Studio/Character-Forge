import { describe, expect, it } from "vitest";
import { createDefaultBrpCreatorState, previewBrpCreatorState } from "./brpCreatorState.js";
import { randomizeBrpCreatorState } from "./brpCreatorRandomization.js";

describe("BRP Randomize All", () => {
  it("randomizes the visible character while preserving selected rules context", () => {
    const original = createDefaultBrpCreatorState();
    const result = randomizeBrpCreatorState(original, "qa-randomize-all");
    const randomized = result.state;
    const preview = previewBrpCreatorState(randomized);

    expect(result.seed).toBe("qa-randomize-all");
    expect(randomized.displayName).not.toBe(original.displayName);
    expect(randomized.age).not.toBe(original.age);
    expect(randomized.gender).not.toBe(original.gender);
    expect(randomized.professionId).not.toBe(original.professionId);
    expect(randomized.campaignProfile).toEqual(original.campaignProfile);
    expect(randomized.powerLevel).toBe(original.powerLevel);
    expect(randomized.characteristicMethod).toBe(original.characteristicMethod);
    expect(randomized.characteristics).not.toEqual(original.characteristics);
    expect(randomized.redistribution).toEqual([]);
    expect(Object.keys(randomized.allocations).length).toBeGreaterThan(0);
    expect(preview.professionalRemaining).toBe(0);
    expect(preview.personalRemaining).toBe(0);
    expect(preview.validCharacter).not.toBeNull();
  });

  it("is deterministic for an explicit seed and keeps Scholar specialties unique when Scholar is selected", () => {
    const original = createDefaultBrpCreatorState();
    const first = randomizeBrpCreatorState(original, "repeatable-brp-character").state;
    const second = randomizeBrpCreatorState(original, "repeatable-brp-character").state;

    expect(second).toEqual(first);
    expect(new Set(first.scholarAcademicSkills.map((selection) => `${selection.skillId}:${selection.specialty.id}`)).size).toBe(5);
  });

  it("re-rolls standard characteristics without silently changing the selected generation method", () => {
    const original = { ...createDefaultBrpCreatorState(), characteristicMethod: "standard-rolled" as const, rollSeed: "old-roll" };
    const randomized = randomizeBrpCreatorState(original, "new-random-character").state;

    expect(randomized.characteristicMethod).toBe("standard-rolled");
    expect(randomized.rollSeed).toBe("new-random-character:characteristics");
    expect(previewBrpCreatorState(randomized).validCharacter).not.toBeNull();
  });
});
