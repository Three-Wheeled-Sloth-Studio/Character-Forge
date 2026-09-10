import { describe, expect, it } from "vitest";
import {
  BRP_BEGGAR_SKILL_KEYS,
  brpUge105Adapter,
  type BrpNativeCharacter,
} from "../../../packages/system-brp/src/index.js";
import {
  autoAllocateBrpCreatorState,
  buildBrpCreatorCharacter,
  createDefaultBrpCreatorState,
  previewBrpCreatorState,
  reopenBrpCreatorState,
} from "./brpCreatorState.js";

function native(character: ReturnType<typeof buildBrpCreatorCharacter>) {
  const state = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId);
  expect(state).toBeDefined();
  expect(brpUge105Adapter.validateNativeState(state!).valid).toBe(true);
  return state!;
}

describe("BRP player-usable profession breadth", () => {
  it("builds a source-backed Athlete with five retained electives and broad wealth", () => {
    const state = autoAllocateBrpCreatorState({
      ...createDefaultBrpCreatorState(),
      professionId: "athlete",
      wealth: "wealthy",
      athleteElectives: ["brawl", "first-aid", "grapple", "listen", "swim"],
    });
    const payload = native(buildBrpCreatorCharacter(state)).payload as BrpNativeCharacter;
    expect(payload.identity.profession).toEqual({
      professionId: "athlete",
      wealth: "wealthy",
      selectedElectiveSkillIds: state.athleteElectives,
    });
  });

  it("builds a Destitute Beggar with the source-backed ten-skill profile", () => {
    const state = autoAllocateBrpCreatorState({
      ...createDefaultBrpCreatorState(),
      professionId: "beggar",
      wealth: "destitute",
    });
    const payload = native(buildBrpCreatorCharacter(state)).payload as BrpNativeCharacter;
    expect(payload.identity.profession).toEqual({ professionId: "beggar", wealth: "destitute" });
    expect(previewBrpCreatorState(state).skillRows.some((skill) => skill.label === "Knowledge (Region: Local Area)" && skill.professionalEligible)).toBe(true);
    expect(BRP_BEGGAR_SKILL_KEYS).toHaveLength(10);
  });

  it("retains a custom profession title, description, wealth, and exactly ten professional skills losslessly", () => {
    const state = autoAllocateBrpCreatorState({
      ...createDefaultBrpCreatorState(),
      displayName: "Morgan Vale",
      professionId: "custom",
      wealth: "poor",
      customProfessionTitle: "Field Courier",
      customProfessionDescription: "Carries people, messages, and fragile cargo through difficult terrain.",
      customProfessionalSkillKeys: [
        "bargain",
        "climb",
        "dodge",
        "first-aid",
        "insight",
        "listen",
        "navigate",
        "spot",
        "stealth",
        "track",
      ],
    });
    const original = buildBrpCreatorCharacter(state);
    const payload = native(original).payload as BrpNativeCharacter;
    expect(payload.identity.profession).toEqual({
      professionId: "custom",
      wealth: "poor",
      title: "Field Courier",
      description: "Carries people, messages, and fragile cargo through difficult terrain.",
      selectedProfessionalSkillIds: state.customProfessionalSkillKeys,
    });

    const reopened = reopenBrpCreatorState(original);
    expect(reopened.customProfessionalSkillKeys).toEqual(state.customProfessionalSkillKeys);
    expect(buildBrpCreatorCharacter(reopened)).toEqual(original);
  });

  it("rejects tampered custom professions that do not retain exactly ten professional skills", () => {
    const state = autoAllocateBrpCreatorState({
      ...createDefaultBrpCreatorState(),
      professionId: "custom",
      customProfessionalSkillKeys: [
        "bargain", "brawl", "climb", "dodge", "first-aid",
        "insight", "listen", "persuade", "spot", "stealth",
      ],
    });
    const character = buildBrpCreatorCharacter(state);
    const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId)!;
    const payload = nativeState.payload as BrpNativeCharacter;
    if (payload.identity.profession.professionId !== "custom") throw new Error("Expected custom profession.");
    payload.identity.profession.selectedProfessionalSkillIds = payload.identity.profession.selectedProfessionalSkillIds.slice(0, 9);
    const validation = brpUge105Adapter.validateNativeState(nativeState);
    expect(validation.valid).toBe(false);
    expect(validation.issues.some((issue) => issue.code === "brp.profession.custom-skills")).toBe(true);
  });
});
