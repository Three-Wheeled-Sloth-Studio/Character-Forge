import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { defaultGuidedDnd5eCoreChoices } from "./guidedDefaults.js";
import { guidedGenerateDnd5eFirstSlice } from "./guidedGenerate.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";
import type { GuidedDnd5eBackgroundId } from "./srdCatalog.js";

const clericChoice = { selectedId: "cleric" as const, acceptableIds: ["cleric"] as const, selectionMode: "direct" as const };
const dwarfChoice = { selectedId: "dwarf" as const, acceptableIds: ["dwarf"] as const, selectionMode: "direct" as const };
const assignment = { strength: 8, dexterity: 12, constitution: 13, intelligence: 10, wisdom: 15, charisma: 14 };

function backgroundChoice(background: GuidedDnd5eBackgroundId) {
  return { selectedId: background, acceptableIds: [background], selectionMode: "direct" as const };
}

function boostsFor(background: GuidedDnd5eBackgroundId) {
  if (background === "acolyte") return { wisdom: 2 as const, charisma: 1 as const };
  if (background === "criminal") return { dexterity: 2 as const, intelligence: 1 as const };
  if (background === "sage") return { intelligence: 2 as const, wisdom: 1 as const };
  return { strength: 2 as const, constitution: 1 as const };
}

function clericCharacter(background: GuidedDnd5eBackgroundId = "soldier") {
  return guidedGenerateDnd5eFirstSlice({
    name: `Cleric ${background}`,
    classChoice: clericChoice,
    backgroundChoice: backgroundChoice(background),
    speciesChoice: dwarfChoice,
    coreChoices: defaultGuidedDnd5eCoreChoices("cleric", background, "dwarf"),
    abilityMethod: { method: "standard-array", assignment },
    backgroundIncreases: boostsFor(background),
    backgroundEquipmentChoice: "B:50-gp",
  });
}

function payloadOf(character: ReturnType<typeof clericCharacter>): Dnd5eNativeCharacter {
  return character.nativeStates[0]!.payload as Dnd5eNativeCharacter;
}

describe("guided Cleric Level 1 generation", () => {
  it("builds Protector with class spellcasting, slots, focus, and training", () => {
    const character = clericCharacter();
    const payload = payloadOf(character);
    const casting = payload.spells?.classCasting?.[0];

    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!)).toEqual({ valid: true, issues: [] });
    expect(payload.class.classId).toBe("cleric");
    expect(payload.class.divineOrderId).toBe("protector");
    expect(payload.class.weaponProficiencyIds).toEqual(["simple", "martial"]);
    expect(payload.class.armorTrainingIds).toEqual(["light", "medium", "heavy", "shield"]);
    expect(payload.class.spellcastingFocusIds).toEqual(["holy-symbol"]);
    expect(casting).toEqual(expect.objectContaining({
      sourceClassId: "cleric",
      spellListId: "cleric",
      spellcastingAbilityId: "wisdom",
      cantripIds: ["guidance", "sacred-flame", "thaumaturgy"],
      preparedSpellIds: ["bless", "cure-wounds", "guiding-bolt", "shield-of-faith"],
      preparationChange: "long-rest-any",
      focusItemIds: ["holy-symbol"],
    }));
    expect(casting?.spellSlots).toEqual([{ level: 1, maximum: 2, current: 2, recharge: "long-rest" }]);
    expect(character.generation?.decisions).toEqual(expect.arrayContaining([
      expect.objectContaining({ stepId: "class.cleric.divine-order", choiceId: "protector" }),
      expect.objectContaining({ stepId: "class.cleric.cantrips" }),
      expect.objectContaining({ stepId: "class.cleric.prepared-spells" }),
    ]));
  });

  it("builds Thaumaturge with the fourth cantrip and Wisdom-based knowledge bonus", () => {
    const coreChoices = defaultGuidedDnd5eCoreChoices("cleric", "acolyte", "dwarf");
    coreChoices.cleric = {
      divineOrderId: "thaumaturge",
      cantripIds: ["guidance", "light", "sacred-flame", "thaumaturgy"],
      preparedSpellIds: ["bless", "cure-wounds", "guiding-bolt", "shield-of-faith"],
    };
    const character = guidedGenerateDnd5eFirstSlice({
      name: "Thaumaturge",
      classChoice: clericChoice,
      backgroundChoice: backgroundChoice("acolyte"),
      speciesChoice: dwarfChoice,
      coreChoices,
      abilityMethod: { method: "standard-array", assignment },
      backgroundIncreases: boostsFor("acolyte"),
      backgroundEquipmentChoice: "B:50-gp",
    });
    const payload = payloadOf(character);

    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!).valid).toBe(true);
    expect(payload.class.divineOrderId).toBe("thaumaturge");
    expect(payload.class.weaponProficiencyIds).toEqual(["simple"]);
    expect(payload.class.armorTrainingIds).toEqual(["light", "medium", "shield"]);
    expect(payload.class.thaumaturgeKnowledgeBonus).toBe(3);
    expect(payload.spells?.classCasting?.[0]?.cantripIds).toHaveLength(4);
  });

  it("keeps Acolyte Magic Initiate separate from Cleric class spellcasting", () => {
    const character = clericCharacter("acolyte");
    const payload = payloadOf(character);

    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!)).toEqual({ valid: true, issues: [] });
    expect(payload.spells?.grants).toHaveLength(1);
    expect(payload.spells?.grants[0]).toEqual(expect.objectContaining({ sourceId: "feat:magic-initiate", spellListId: "cleric" }));
    expect(payload.spells?.classCasting).toHaveLength(1);
    expect(payload.spells?.classCasting?.[0]).toEqual(expect.objectContaining({ sourceClassId: "cleric", spellListId: "cleric" }));
  });

  it("rejects tampered Cleric slot state on reopen", () => {
    const character = clericCharacter();
    const nativeState = JSON.parse(JSON.stringify(character.nativeStates[0]!)) as typeof character.nativeStates[0];
    const payload = nativeState.payload as Dnd5eNativeCharacter;
    payload.spells!.classCasting![0]!.spellSlots[0]!.maximum = 3;

    const result = dnd5eSrd521Adapter.validateNativeState(nativeState);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("dnd5e.cleric.spell-slots");
  });

  it("rejects a tampered Cleric class spellcasting ability", () => {
    const character = clericCharacter();
    const nativeState = JSON.parse(JSON.stringify(character.nativeStates[0]!)) as typeof character.nativeStates[0];
    const payload = nativeState.payload as Dnd5eNativeCharacter;
    payload.spells!.classCasting![0]!.spellcastingAbilityId = "charisma";

    const result = dnd5eSrd521Adapter.validateNativeState(nativeState);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("dnd5e.cleric.spellcasting-ability");
  });
});
