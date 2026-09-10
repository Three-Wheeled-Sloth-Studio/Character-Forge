import { describe, expect, it } from "vitest";
import {
  BRP_DETECTIVE_ELECTIVE_SKILL_KEYS,
  brpSkillIdentityKey,
  brpUge105Adapter,
  type BrpNativeCharacter,
} from "../../../packages/system-brp/src/index.js";
import {
  autoAllocateBrpCreatorState,
  buildBrpCreatorCharacter,
  createDefaultBrpCreatorState,
  previewBrpCreatorState,
} from "./brpCreatorState.js";

describe("BRP player-usable core skill surface", () => {
  it("exposes the implemented source-backed Detective electives", () => {
    expect(BRP_DETECTIVE_ELECTIVE_SKILL_KEYS).toEqual(expect.arrayContaining([
      "disguise",
      "dodge",
      "grapple",
      "medicine",
      "technical:computer-use",
    ]));

    const state = autoAllocateBrpCreatorState({
      ...createDefaultBrpCreatorState(),
      detectiveElectives: ["disguise", "dodge", "grapple", "medicine"],
    });
    const preview = previewBrpCreatorState(state);
    expect(preview.validCharacter).not.toBeNull();
    expect(preview.skillRows.find((row) => row.label === "Dodge")?.baseChance).toBe(20);
  });

  it("allows personal points on supported skills outside the selected profession", () => {
    const state = autoAllocateBrpCreatorState(createDefaultBrpCreatorState());
    const preview = previewBrpCreatorState(state);
    const appraise = preview.skillRows.find((row) => row.label === "Appraise");
    expect(appraise).toMatchObject({ professionalEligible: false, professionalPoints: 0 });
    expect(appraise?.personalPoints).toBeGreaterThan(0);
    expect(preview.validCharacter).not.toBeNull();

    const character = buildBrpCreatorCharacter(state);
    const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId);
    expect(nativeState).toBeDefined();
    expect(brpUge105Adapter.validateNativeState(nativeState!).valid).toBe(true);
    const payload = nativeState!.payload as BrpNativeCharacter;
    const retained = payload.skills.find((skill) => brpSkillIdentityKey(skill.skillId, skill.specialty) === appraise?.key);
    expect(retained?.contributions).toEqual({ professional: 0, personal: appraise?.personalPoints });
  });
});
