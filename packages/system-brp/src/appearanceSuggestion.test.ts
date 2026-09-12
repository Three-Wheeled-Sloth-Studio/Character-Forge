import { describe, expect, it } from "vitest";
import {
  BRP_APPEARANCE_SUGGESTION_SOURCE,
  BRP_APPEARANCE_SUGGESTION_TABLE,
  suggestBrpAppearance,
} from "./appearanceSuggestion.js";

describe("BRP appearance suggestions", () => {
  it("replays deterministically from the same seed and draw index", () => {
    const first = suggestBrpAppearance({ seed: "appearance-replay", drawIndex: 2 });
    const second = suggestBrpAppearance({ seed: "appearance-replay", drawIndex: 2 });

    expect(second).toEqual(first);
    expect(first.result.appearance.trim().length).toBeGreaterThan(0);
  });

  it("identifies the inspiration table as Character Forge content rather than BRP rules text", () => {
    const suggestion = suggestBrpAppearance({ seed: "appearance-source" });

    expect(BRP_APPEARANCE_SUGGESTION_SOURCE.id).toBe("character-forge.brp.appearance-inspiration");
    expect(suggestion.provenance).toMatchObject({
      tableId: BRP_APPEARANCE_SUGGESTION_TABLE.id,
      tableVersion: BRP_APPEARANCE_SUGGESTION_TABLE.version,
      sourceId: BRP_APPEARANCE_SUGGESTION_SOURCE.id,
      sourceVersion: BRP_APPEARANCE_SUGGESTION_SOURCE.version,
      seed: "appearance-source",
    });
  });

  it("keeps the bounded table purely descriptive and non-mechanical", () => {
    for (const entry of BRP_APPEARANCE_SUGGESTION_TABLE.entries) {
      expect(entry.result.appearance.trim().length).toBeGreaterThan(0);
      expect(JSON.stringify(entry.result)).not.toMatch(/strength|dexterity|constitution|skill|damage|armor|hit points/i);
    }
  });
});
