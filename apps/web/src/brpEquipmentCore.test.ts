import { describe, expect, it } from "vitest";
import {
  BRP_STARTING_EQUIPMENT_CATALOG,
  applyBrpStartingEquipment,
  brpEquipmentReviewLine,
  brpStartingEquipmentEligibility,
  brpUge105Adapter,
  readBrpStartingEquipment,
  type BrpNativeCharacter,
} from "../../../packages/system-brp/src/index.js";
import {
  autoAllocateBrpCreatorState,
  buildBrpCreatorCharacter,
  createDefaultBrpCreatorState,
  reopenBrpCreatorState,
} from "./brpCreatorState.js";
import { brpEquipmentControlsHtml } from "./brpEquipmentControls.js";

function validDefaultCharacter() {
  return buildBrpCreatorCharacter(autoAllocateBrpCreatorState(createDefaultBrpCreatorState()));
}

describe("BRP finish-the-character equipment", () => {
  it("retains source-audited equipment IDs and reconstructs them across reopen", () => {
    const original = applyBrpStartingEquipment(
      validDefaultCharacter(),
      ["first-aid-kit", "leather-soft", "pistol-medium"],
    );
    const nativeState = original.nativeStates.find((entry) => entry.id === original.primaryNativeStateId)!;
    expect(brpUge105Adapter.validateNativeState(nativeState).valid).toBe(true);
    expect(readBrpStartingEquipment(original)).toEqual(["first-aid-kit", "leather-soft", "pistol-medium"]);

    const reopenedState = reopenBrpCreatorState(original);
    const rebuilt = applyBrpStartingEquipment(
      buildBrpCreatorCharacter(reopenedState),
      readBrpStartingEquipment(original),
    );
    expect(rebuilt).toEqual(original);
  });

  it("enforces the BRP starting-weapon skill threshold without blocking ordinary gear", () => {
    const beggar = buildBrpCreatorCharacter(autoAllocateBrpCreatorState({
      ...createDefaultBrpCreatorState(),
      professionId: "beggar",
      wealth: "destitute",
    }));
    expect(brpStartingEquipmentEligibility(beggar, "first-aid-kit").eligible).toBe(true);
    expect(brpStartingEquipmentEligibility(beggar, "pistol-medium").eligible).toBe(false);
    expect(() => applyBrpStartingEquipment(beggar, ["pistol-medium"])).toThrow(/50% or better/);
  });

  it("rejects unknown retained equipment IDs through the canonical adapter", () => {
    const character = validDefaultCharacter();
    const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId)!;
    (nativeState.payload as BrpNativeCharacter).equipment = ["mystery-gear"];
    const validation = brpUge105Adapter.validateNativeState(nativeState);
    expect(validation.valid).toBe(false);
    expect(validation.issues.some((issue) => issue.code === "brp.equipment.item-id")).toBe(true);
  });

  it("projects useful weapon and armor table data from stable native equipment IDs", () => {
    const character = applyBrpStartingEquipment(validDefaultCharacter(), ["pistol-medium", "leather-soft"]);
    const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId)!;
    const payload = nativeState.payload as BrpNativeCharacter;
    expect(brpEquipmentReviewLine(payload, "pistol-medium")).toContain("attack 75%; damage 1D8; attacks 2/round; range 20m; ammo 12; malfunction 98-00");
    expect(BRP_STARTING_EQUIPMENT_CATALOG["leather-soft"]).toMatchObject({
      armorValue: 1,
      burden: "light",
      enc: 3.5,
      value: "inexpensive",
    });
  });

  it("shows weapon eligibility and source table summaries in the finishing controls", () => {
    const detectiveHtml = brpEquipmentControlsHtml(validDefaultCharacter(), ["pistol-medium"]);
    expect(detectiveHtml).toContain("Pistol, Medium");
    expect(detectiveHtml).toContain("1D8 damage");
    expect(detectiveHtml).not.toContain('value="pistol-medium" checked disabled');

    const beggar = buildBrpCreatorCharacter(autoAllocateBrpCreatorState({
      ...createDefaultBrpCreatorState(),
      professionId: "beggar",
      wealth: "destitute",
    }));
    const beggarHtml = brpEquipmentControlsHtml(beggar, []);
    expect(beggarHtml).toContain('value="pistol-medium" disabled');
    expect(beggarHtml).toContain("50% or better");
  });
});
