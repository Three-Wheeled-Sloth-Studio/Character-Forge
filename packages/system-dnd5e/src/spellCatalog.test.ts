import { describe, expect, it } from "vitest";
import { DND5E_MAGIC_INITIATE_SPELL_LISTS, magicInitiateSpellList } from "./spellCatalog.js";

describe("D&D Magic Initiate SRD spell catalogs", () => {
  it("retains the complete SRD 5.2.1 Cleric options used by Acolyte", () => {
    const cleric = magicInitiateSpellList("cleric");
    expect(cleric.cantrips).toHaveLength(7);
    expect(cleric.levelOneSpells).toHaveLength(15);
    expect(cleric.cantrips.map((spell) => spell.id)).toContain("sacred-flame");
    expect(cleric.levelOneSpells.map((spell) => spell.id)).toEqual(expect.arrayContaining(["bless", "cure-wounds", "shield-of-faith"]));
  });

  it("retains the complete SRD 5.2.1 Wizard options used by Sage", () => {
    const wizard = DND5E_MAGIC_INITIATE_SPELL_LISTS.wizard;
    expect(wizard.cantrips).toHaveLength(15);
    expect(wizard.levelOneSpells).toHaveLength(25);
    expect(wizard.cantrips.map((spell) => spell.id)).toEqual(expect.arrayContaining(["fire-bolt", "mage-hand", "true-strike"]));
    expect(wizard.levelOneSpells.map((spell) => spell.id)).toEqual(expect.arrayContaining(["find-familiar", "magic-missile", "shield"]));
  });
});
