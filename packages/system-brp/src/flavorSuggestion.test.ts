import { describe, expect, it } from "vitest";
import { BRP_FINISHING_FIELD_KEYS } from "./finishing.js";
import {
  BRP_FLAVOR_SUGGESTION_SOURCE,
  BRP_FLAVOR_SUGGESTION_TABLES,
  suggestBrpFinishingField,
} from "./flavorSuggestion.js";

describe("BRP finishing flavor suggestions", () => {
  it("provides a deterministic suggestion table for every supported finishing field", () => {
    for (const fieldKey of BRP_FINISHING_FIELD_KEYS) {
      const first = suggestBrpFinishingField(fieldKey, { seed: `replay-${fieldKey}`, drawIndex: 2 });
      const second = suggestBrpFinishingField(fieldKey, { seed: `replay-${fieldKey}`, drawIndex: 2 });

      expect(second).toEqual(first);
      expect(first.result.fieldKey).toBe(fieldKey);
      expect(first.result.value.trim().length).toBeGreaterThan(0);
      expect(first.provenance.fieldKey).toBe(fieldKey);
    }
  });

  it("keeps all tables under one Character Forge-owned inspiration source", () => {
    expect(BRP_FLAVOR_SUGGESTION_SOURCE.id).toBe("character-forge.brp.flavor-inspiration");

    for (const fieldKey of BRP_FINISHING_FIELD_KEYS) {
      const table = BRP_FLAVOR_SUGGESTION_TABLES[fieldKey];
      const suggestion = suggestBrpFinishingField(fieldKey, { seed: `source-${fieldKey}` });
      expect(table.source).toEqual(BRP_FLAVOR_SUGGESTION_SOURCE);
      expect(suggestion.provenance).toMatchObject({
        fieldKey,
        tableId: table.id,
        tableVersion: table.version,
        sourceId: BRP_FLAVOR_SUGGESTION_SOURCE.id,
        sourceVersion: BRP_FLAVOR_SUGGESTION_SOURCE.version,
        seed: `source-${fieldKey}`,
      });
    }
  });

  it("keeps catalog entries descriptive and non-mechanical", () => {
    for (const fieldKey of BRP_FINISHING_FIELD_KEYS) {
      for (const entry of BRP_FLAVOR_SUGGESTION_TABLES[fieldKey].entries) {
        expect(entry.result.fieldKey).toBe(fieldKey);
        expect(entry.result.value.trim().length).toBeGreaterThan(0);
        expect(entry.result.value).not.toMatch(/\b(?:STR|CON|SIZ|INT|POW|DEX|CHA|hit points?|damage modifier|armor points?|skill rating)\b/i);
      }
    }
  });
});
