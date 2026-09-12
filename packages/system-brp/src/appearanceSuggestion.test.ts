import { describe, expect, it } from "vitest";
import {
  BRP_APPEARANCE_SUGGESTION_SOURCE,
  BRP_APPEARANCE_SUGGESTION_TABLE,
  suggestBrpAppearance,
} from "./appearanceSuggestion.js";
import { suggestBrpFinishingField } from "./flavorSuggestion.js";

describe("BRP appearance suggestion compatibility wrapper", () => {
  it("replays deterministically from the same seed and draw index", () => {
    const first = suggestBrpAppearance({ seed: "appearance-replay", drawIndex: 2 });
    const second = suggestBrpAppearance({ seed: "appearance-replay", drawIndex: 2 });

    expect(second).toEqual(first);
    expect(first.result.appearance.trim().length).toBeGreaterThan(0);
  });

  it("delegates to the shared finishing-field catalog", () => {
    const appearance = suggestBrpAppearance({ seed: "appearance-shared", drawIndex: 1 });
    const generic = suggestBrpFinishingField("appearance", { seed: "appearance-shared", drawIndex: 1 });

    expect(appearance.result.appearance).toBe(generic.result.value);
    expect(appearance.provenance.selectedEntryId).toBe(generic.provenance.selectedEntryId);
    expect(BRP_APPEARANCE_SUGGESTION_TABLE.id).toBe(generic.provenance.tableId);
    expect(BRP_APPEARANCE_SUGGESTION_SOURCE.id).toBe("character-forge.brp.flavor-inspiration");
  });

  it("keeps appearance content descriptive and non-mechanical", () => {
    for (const entry of BRP_APPEARANCE_SUGGESTION_TABLE.entries) {
      expect(entry.result.value.trim().length).toBeGreaterThan(0);
      expect(entry.result.fieldKey).toBe("appearance");
      expect(entry.result.value).not.toMatch(/\b(?:STR|CON|SIZ|INT|POW|DEX|CHA|hit points?|damage modifier|armor points?|skill rating)\b/i);
    }
  });
});
