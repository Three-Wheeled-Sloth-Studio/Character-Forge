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

  it("retains the complete SRD 5.2.1 Druid options used by Druid and future Magic Initiate", () => {
    const druid = magicInitiateSpellList("druid");
    expect(druid.cantrips).toHaveLength(13);
    expect(druid.levelOneSpells).toHaveLength(18);
    expect(druid.cantrips.map((spell) => spell.id)).toEqual(expect.arrayContaining(["druidcraft", "produce-flame", "thorn-whip"]));
    expect(druid.levelOneSpells.map((spell) => spell.id)).toEqual(expect.arrayContaining(["animal-friendship", "faerie-fire", "speak-with-animals", "thunderwave"]));
  });

  it("retains the complete SRD 5.2.1 Wizard options used by Sage and Wizard", () => {
    const wizard = DND5E_MAGIC_INITIATE_SPELL_LISTS.wizard;
    expect(wizard.cantrips).toHaveLength(15);
    expect(wizard.levelOneSpells).toHaveLength(30);
    expect(wizard.cantrips.map((spell) => spell.id)).toEqual(expect.arrayContaining(["fire-bolt", "mage-hand", "ray-of-frost", "shocking-grasp", "true-strike"]));
    expect(wizard.levelOneSpells.map((spell) => spell.id)).toEqual(expect.arrayContaining(["find-familiar", "floating-disk", "magic-missile", "shield", "unseen-servant"]));
  });
});
