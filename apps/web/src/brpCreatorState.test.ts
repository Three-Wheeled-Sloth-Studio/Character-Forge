import { brpUge105Adapter, type BrpNativeCharacter } from "../../../packages/system-brp/src/index.js";
import {
  autoAllocateBrpCreatorState,
  buildBrpCreatorCharacter,
  createDefaultBrpCreatorState,
  previewBrpCreatorState,
  reopenBrpCreatorState,
} from "./brpCreatorState.js";

function nativePayload(character: ReturnType<typeof buildBrpCreatorCharacter>): BrpNativeCharacter {
  const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId);
  expect(nativeState).toBeDefined();
  expect(brpUge105Adapter.validateNativeState(nativeState!).valid).toBe(true);
  return nativeState!.payload as BrpNativeCharacter;
}

describe("BRP creator state", () => {
  it("builds legal explicit Detective and Scholar characters through the BRP-owned pipeline", () => {
    const detective = autoAllocateBrpCreatorState(createDefaultBrpCreatorState());
    expect(previewBrpCreatorState(detective).validCharacter).not.toBeNull();
    expect(nativePayload(buildBrpCreatorCharacter(detective)).identity.profession.professionId).toBe("detective");

    const scholar = autoAllocateBrpCreatorState({
      ...createDefaultBrpCreatorState(),
      professionId: "scholar",
      displayName: "Ada Scholar",
      scholarOwnLanguage: { id: "english", label: "English" },
      scholarOtherLanguage: { id: "latin", label: "Latin" },
      scholarAcademicSkills: [
        { skillId: "knowledge", specialty: { id: "history", label: "History" } },
        { skillId: "knowledge", specialty: { id: "law", label: "Law" } },
        { skillId: "science", specialty: { id: "biology", label: "Biology" } },
        { skillId: "science", specialty: { id: "chemistry", label: "Chemistry" } },
        { skillId: "science", specialty: { id: "physics", label: "Physics" } },
      ],
    });
    const payload = nativePayload(buildBrpCreatorCharacter(scholar));
    expect(payload.identity.profession).toMatchObject({
      professionId: "scholar",
      ownLanguage: { id: "english", label: "English" },
      otherLanguage: { id: "latin", label: "Latin" },
    });
    expect(payload.identity.profession.professionId === "scholar" ? payload.identity.profession.selectedAcademicSkills : []).toEqual(scholar.scholarAcademicSkills);
  });

  it("builds deterministic standard-rolled Detective and Scholar characters", () => {
    for (const professionId of ["detective", "scholar"] as const) {
      const state = autoAllocateBrpCreatorState({
        ...createDefaultBrpCreatorState(),
        professionId,
        characteristicMethod: "standard-rolled",
        rollSeed: `creator-${professionId}`,
      });
      const payload = nativePayload(buildBrpCreatorCharacter(state));
      expect(payload.rulesProfile.characteristicGeneration).toBe("standard-rolled");
      expect(payload.characteristicGenerationState.method).toBe("standard-rolled");
      if (payload.characteristicGenerationState.method === "standard-rolled") {
        expect(payload.characteristicGenerationState.seed).toBe(`creator-${professionId}`);
        expect(payload.characteristicGenerationState.rolls.STR.rolls).toHaveLength(3);
      }
    }
  });

  it("uses retained Heroic age causality for budget and profile feedback", () => {
    const state = autoAllocateBrpCreatorState({
      ...createDefaultBrpCreatorState(),
      powerLevel: "heroic",
      defaultStartingAge: 18,
      age: 38,
    });
    const preview = previewBrpCreatorState(state);
    expect(preview.professionalBudget).toBe(365);
    expect(preview.startingSkillCap).toBe(90);
    const payload = nativePayload(buildBrpCreatorCharacter(state));
    expect(payload.rulesProfile.powerLevel).toBe("heroic");
    expect(payload.identity.ageBasis).toEqual({
      method: "default-starting-age",
      defaultStartingAge: 18,
      addedYears: 20,
      professionalSkillPointAdjustment: 40,
    });
  });

  it("reopens from authoritative BRP native state and rebuilds losslessly", () => {
    const originalState = autoAllocateBrpCreatorState({
      ...createDefaultBrpCreatorState(),
      professionId: "scholar",
      characteristicMethod: "standard-rolled",
      rollSeed: "reopen-scholar",
      scholarOwnLanguage: { id: "welsh", label: "Welsh" },
      scholarOtherLanguage: { id: "french", label: "French" },
    });
    const original = buildBrpCreatorCharacter(originalState);
    const reopened = reopenBrpCreatorState(original);
    const rebuilt = buildBrpCreatorCharacter(reopened);
    expect(rebuilt).toEqual(original);
  });

  it("cannot present an over-cap or over-budget allocation as a valid character", () => {
    const legal = autoAllocateBrpCreatorState(createDefaultBrpCreatorState());
    const preview = previewBrpCreatorState(legal);
    const first = preview.skillRows[0];
    expect(first).toBeDefined();
    const invalid = {
      ...legal,
      allocations: {
        ...legal.allocations,
        [first!.key]: {
          ...(legal.allocations[first!.key] ?? { professionalPoints: 0, personalPoints: 0 }),
          professionalPoints: 999,
        },
      },
    };
    const invalidPreview = previewBrpCreatorState(invalid);
    expect(invalidPreview.validCharacter).toBeNull();
    expect(invalidPreview.professionalRemaining).toBeLessThan(0);
  });
});
