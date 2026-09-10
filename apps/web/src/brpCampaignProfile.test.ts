import { describe, expect, it } from "vitest";
import type { CharacterDocument, JsonObject } from "../../../packages/character-model/src/index.js";
import {
  BRP_CAMPAIGN_PROFILE_CATALOG,
  BRP_DEFAULT_CAMPAIGN_PROFILE_ID,
  applyBrpCampaignProfileContext,
  brpUge105Adapter,
  readBrpCampaignProfileReference,
  resolveBrpCampaignProfileSelection,
  type BrpNativeCharacter,
} from "../../../packages/system-brp/src/index.js";
import {
  autoAllocateBrpCreatorState,
  buildBrpCreatorCharacter,
  createDefaultBrpCreatorState,
  previewBrpCreatorState,
  reopenBrpCreatorState,
  selectBrpCampaignProfile,
} from "./brpCreatorState.js";
import { brpCreatorHtml } from "./brpCreatorPanelView.js";

function nativeState(character: CharacterDocument) {
  const state = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId);
  expect(state).toBeDefined();
  expect(brpUge105Adapter.validateNativeState(state!).valid).toBe(true);
  return state!;
}

function nativePayload(character: CharacterDocument): BrpNativeCharacter {
  return nativeState(character).payload as BrpNativeCharacter;
}

describe("BRP campaign profile seam", () => {
  it("defines one stable Generic BRP Core profile with deterministic source-native defaults", () => {
    expect(BRP_CAMPAIGN_PROFILE_CATALOG).toHaveLength(1);
    const selection = resolveBrpCampaignProfileSelection(BRP_DEFAULT_CAMPAIGN_PROFILE_ID);
    expect(selection.reference).toEqual({ id: "generic", version: "0.1" });
    expect(selection.rulesProfile).toEqual({
      powerLevel: "normal",
      characteristicGeneration: "explicit",
      enabledOptions: [],
      enabledPowerSystems: [],
    });
  });

  it("retains profile provenance separately from authoritative effective native rules", () => {
    const state = autoAllocateBrpCreatorState(createDefaultBrpCreatorState());
    const character = buildBrpCreatorCharacter(state);
    const payload = nativePayload(character);

    expect(payload.rulesProfile).toEqual({
      powerLevel: "normal",
      characteristicGeneration: "explicit",
      enabledOptions: [],
      enabledPowerSystems: [],
    });
    expect(readBrpCampaignProfileReference(character)).toEqual({ id: "generic", version: "0.1" });
    expect(character.generation?.decisions[0]).toMatchObject({
      stepId: "rules.campaign-profile",
      choiceId: "generic",
      answer: { version: "0.1" },
    });
    const recipe = character.generation?.recipe as JsonObject;
    expect(recipe.campaignProfile).toEqual({ id: "generic", version: "0.1" });
    expect(nativeState(character).schemaVersion).toBe("brp-character/0.1");
    expect(payload.schemaVersion).toBe("brp-character/0.1");
    expect(brpUge105Adapter.adapterVersion).toBe("0.7.0");
  });

  it("reopens from exact native effective rules rather than reapplying current profile defaults", () => {
    const state = autoAllocateBrpCreatorState({
      ...createDefaultBrpCreatorState(),
      powerLevel: "heroic",
      defaultStartingAge: 18,
      age: 18,
      characteristicMethod: "standard-rolled",
      rollSeed: "profile-reopen",
    });
    const original = buildBrpCreatorCharacter(state);
    const originalPayload = nativePayload(original);
    expect(originalPayload.rulesProfile.powerLevel).toBe("heroic");
    expect(originalPayload.rulesProfile.characteristicGeneration).toBe("standard-rolled");
    expect(readBrpCampaignProfileReference(original)).toEqual({ id: "generic", version: "0.1" });

    const reopened = reopenBrpCreatorState(original);
    expect(reopened.campaignProfile).toEqual({ id: "generic", version: "0.1" });
    expect(reopened.powerLevel).toBe("heroic");
    expect(reopened.characteristicMethod).toBe("standard-rolled");
    expect(reopened.enabledOptions).toEqual(originalPayload.rulesProfile.enabledOptions);
    expect(reopened.enabledPowerSystems).toEqual(originalPayload.rulesProfile.enabledPowerSystems);
    expect(buildBrpCreatorCharacter(reopened)).toEqual(original);
  });

  it("does not infer a current profile for legacy characters with no retained profile provenance", () => {
    const state = autoAllocateBrpCreatorState({
      ...createDefaultBrpCreatorState(),
      campaignProfile: null,
    });
    const original = buildBrpCreatorCharacter(state);
    expect(readBrpCampaignProfileReference(original)).toBeNull();

    const reopened = reopenBrpCreatorState(original);
    expect(reopened.campaignProfile).toBeNull();
    expect(buildBrpCreatorCharacter(reopened)).toEqual(original);

    const html = brpCreatorHtml(reopened, previewBrpCreatorState(reopened));
    expect(html).toContain("Existing BRP rules - no retained profile provenance");
    expect(html).toContain("effective BRP rules unchanged until you explicitly choose a current profile");
  });

  it("reapplies current defaults only through explicit profile selection", () => {
    const current = {
      ...createDefaultBrpCreatorState(),
      powerLevel: "heroic" as const,
      characteristicMethod: "standard-rolled" as const,
      enabledOptions: ["future-option"],
      enabledPowerSystems: ["future-power"],
      redistribution: [{ from: "STR" as const, to: "DEX" as const, points: 1 }],
      allocations: { sentinel: { professionalPoints: 1, personalPoints: 2 } },
    };
    const selected = selectBrpCampaignProfile(current, "generic");
    expect(selected.campaignProfile).toEqual({ id: "generic", version: "0.1" });
    expect(selected.powerLevel).toBe("normal");
    expect(selected.characteristicMethod).toBe("explicit");
    expect(selected.enabledOptions).toEqual([]);
    expect(selected.enabledPowerSystems).toEqual([]);
    expect(selected.redistribution).toEqual([]);
    expect(selected.allocations).toEqual({});
  });

  it("refuses to reinterpret mechanically significant native rules after construction", () => {
    const state = autoAllocateBrpCreatorState(createDefaultBrpCreatorState());
    const character = buildBrpCreatorCharacter(state);
    const payload = nativePayload(character);
    const profile = readBrpCampaignProfileReference(character);
    expect(profile).not.toBeNull();

    expect(() => applyBrpCampaignProfileContext(
      character,
      { ...payload.rulesProfile, powerLevel: "heroic" },
      profile,
    )).toThrow(/cannot reinterpret mechanically significant effective rules/);
  });

  it("renders an explicit profile selector while explaining that native effective rules are authoritative", () => {
    const state = createDefaultBrpCreatorState();
    const html = brpCreatorHtml(state, previewBrpCreatorState(state));
    expect(html).toContain('id="brp-campaign-profile"');
    expect(html).toContain("Generic BRP Core");
    expect(html).toContain("effective BRP rules below remain authoritative");
  });
});
