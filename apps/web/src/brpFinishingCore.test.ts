import { describe, expect, it } from "vitest";
import {
  applyBrpFinishingDetails,
  BRP_FINISHING_FIELD_KEYS,
  brpFinishingReviewRows,
  createEmptyBrpFinishingDetails,
  readBrpFinishingDetails,
  suggestBrpFinishingField,
  brpUge105Adapter,
  type BrpNativeCharacter,
} from "../../../packages/system-brp/src/index.js";
import {
  autoAllocateBrpCreatorState,
  buildBrpCreatorCharacter,
  createDefaultBrpCreatorState,
  reopenBrpCreatorState,
} from "./brpCreatorState.js";
import { brpFinishingControlsHtml, updateBrpFinishingField } from "./brpFinishingControls.js";

function validDefaultCharacter() {
  return buildBrpCreatorCharacter(autoAllocateBrpCreatorState(createDefaultBrpCreatorState()));
}

describe("BRP identity and background finishing", () => {
  it("retains descriptive finishing details in native state and reconstructs them across reopen", () => {
    const details = {
      sizeDescription: "Tall and lean",
      appearance: "Gray eyes, dark coat, old scar over the left brow",
      mannerisms: "Counts doorways under their breath",
      reputation: "Patient investigator who never forgets a favor",
      personalItem: "A dented brass compass inherited from an uncle",
      background: "Raised in a port city; studied bookkeeping; estranged from one sibling.",
      beliefs: "Institutions should answer to the people they affect.",
    };
    const original = applyBrpFinishingDetails(validDefaultCharacter(), details);
    const nativeState = original.nativeStates.find((entry) => entry.id === original.primaryNativeStateId)!;
    expect(brpUge105Adapter.validateNativeState(nativeState).valid).toBe(true);
    expect(readBrpFinishingDetails(original)).toEqual(details);

    const reopenedState = reopenBrpCreatorState(original);
    const rebuilt = applyBrpFinishingDetails(
      buildBrpCreatorCharacter(reopenedState),
      readBrpFinishingDetails(original),
    );
    expect(rebuilt).toEqual(original);
  });

  it("keeps finishing optional and omits an all-blank block", () => {
    const character = applyBrpFinishingDetails(validDefaultCharacter(), createEmptyBrpFinishingDetails());
    const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId)!;
    const payload = nativeState.payload as BrpNativeCharacter;
    expect((payload.identity as Record<string, unknown>).finishing).toBeUndefined();
    expect(brpUge105Adapter.validateNativeState(nativeState).valid).toBe(true);
  });

  it("rejects malformed retained finishing state through the canonical adapter", () => {
    const character = validDefaultCharacter();
    const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId)!;
    const payload = nativeState.payload as BrpNativeCharacter;
    (payload.identity as Record<string, unknown>).finishing = {
      sizeDescription: 42,
      appearance: "",
    };
    const validation = brpUge105Adapter.validateNativeState(nativeState);
    expect(validation.valid).toBe(false);
    expect(validation.issues.some((issue) => issue.code === "brp.identity.finishing")).toBe(true);
  });

  it("projects only populated finishing rows for the character review", () => {
    const character = applyBrpFinishingDetails(validDefaultCharacter(), {
      ...createEmptyBrpFinishingDetails(),
      appearance: "Weathered face and immaculate boots",
      personalItem: "A postcard never mailed",
    });
    const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId)!;
    const rows = brpFinishingReviewRows(nativeState.payload as BrpNativeCharacter);
    expect(rows).toEqual([
      { label: "Appearance", value: "Weathered face and immaculate boots" },
      { label: "Personal item", value: "A postcard never mailed" },
    ]);
  });

  it("offers one compact suggestion affordance for every finishing field", () => {
    const html = brpFinishingControlsHtml({
      ...createEmptyBrpFinishingDetails(),
      sizeDescription: "Short and broad",
      background: "Former dockworker",
    });
    expect(html).toContain("Finish: identity and background");
    expect(html).toContain("Short and broad");
    expect(html).toContain("Former dockworker");
    expect(html).toContain("Personal item / keepsake");
    for (const fieldKey of BRP_FINISHING_FIELD_KEYS) {
      expect(html).toContain(`data-brp-finishing-suggest="${fieldKey}"`);
    }
    expect(html.match(/data-brp-finishing-suggest=/g)).toHaveLength(BRP_FINISHING_FIELD_KEYS.length);
    expect(html).not.toContain("Distinctive Features");
  });

  it("treats any generated flavor as ordinary editable input before native-state persistence", () => {
    const suggested = suggestBrpFinishingField("background", { seed: "editable-background" });
    const withSuggestion = updateBrpFinishingField(
      createEmptyBrpFinishingDetails(),
      "background",
      suggested.result.value,
    );
    const edited = updateBrpFinishingField(withSuggestion, "background", "Player-authored final background");
    const character = applyBrpFinishingDetails(validDefaultCharacter(), edited);

    expect(readBrpFinishingDetails(character).background).toBe("Player-authored final background");
    expect(JSON.stringify(character)).not.toContain(suggested.provenance.seed);
  });
});
