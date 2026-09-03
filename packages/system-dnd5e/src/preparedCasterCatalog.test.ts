import { describe, expect, it } from "vitest";
import { DND5E_PREPARED_CASTER_CATALOGS } from "./preparedCasterCatalog.js";

describe("Level 1 prepared-caster SRD catalogs", () => {
  it("retains class-owned spell counts and automatic spell distinctions", () => {
    expect(DND5E_PREPARED_CASTER_CATALOGS.bard.cantripOptions).toHaveLength(10);
    expect(DND5E_PREPARED_CASTER_CATALOGS.bard.preparedSpellOptions).toHaveLength(23);
    expect(DND5E_PREPARED_CASTER_CATALOGS.paladin.preparedSpellOptions).toHaveLength(13);
    expect(DND5E_PREPARED_CASTER_CATALOGS.ranger.preparedSpellOptions.map((spell) => spell.id)).not.toContain("hunters-mark");
    expect(DND5E_PREPARED_CASTER_CATALOGS.ranger.alwaysPreparedSpellIds).toEqual(["hunters-mark"]);
    expect(DND5E_PREPARED_CASTER_CATALOGS.sorcerer.cantripOptions).toHaveLength(16);
    expect(DND5E_PREPARED_CASTER_CATALOGS.sorcerer.preparedSpellOptions).toHaveLength(21);
    expect(DND5E_PREPARED_CASTER_CATALOGS.wizard.cantripOptions).toHaveLength(15);
    expect(DND5E_PREPARED_CASTER_CATALOGS.wizard.preparedSpellOptions).toHaveLength(30);
    expect(DND5E_PREPARED_CASTER_CATALOGS.wizard.spellbookCount).toBe(6);
  });
});
