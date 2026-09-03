import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { defaultGuidedDnd5eCoreChoices } from "./guidedDefaults.js";
import { guidedGenerateDnd5eFirstSlice } from "./guidedGenerate.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";

const druidChoice = { selectedId: "druid" as const, acceptableIds: ["druid"] as const, selectionMode: "direct" as const };
const dwarfChoice = { selectedId: "dwarf" as const, acceptableIds: ["dwarf"] as const, selectionMode: "direct" as const };
const soldierChoice = { selectedId: "soldier" as const, acceptableIds: ["soldier"] as const, selectionMode: "direct" as const };
const assignment = { strength: 8, dexterity: 14, constitution: 13, intelligence: 10, wisdom: 15, charisma: 12 };

function druidCharacter() {
  return guidedGenerateDnd5eFirstSlice({
    name: "Druid Warden",
    classChoice: druidChoice,
    backgroundChoice: soldierChoice,
    speciesChoice: dwarfChoice,
    coreChoices: defaultGuidedDnd5eCoreChoices("druid", "soldier", "dwarf"),
    abilityMethod: { method: "standard-array", assignment },
    backgroundIncreases: { strength: 2, constitution: 1 },
    backgroundEquipmentChoice: "B:50-gp",
  });
}

function payloadOf(character: ReturnType<typeof druidCharacter>): Dnd5eNativeCharacter {
  return character.nativeStates[0]!.payload as Dnd5eNativeCharacter;
}

describe("guided Druid Level 1 generation", () => {
  it("builds Warden with Druidic, class spellcasting, focus, and training", () => {
    const character = druidCharacter();
    const payload = payloadOf(character);
    const casting = payload.spells?.classCasting?.[0];

    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!)).toEqual({ valid: true, issues: [] });
    expect(payload.class.classId).toBe("druid");
    expect(payload.class.primalOrderId).toBe("warden");
    expect(payload.class.toolProficiencyIds).toEqual(["herbalism-kit"]);
    expect(payload.class.bonusLanguageIds).toEqual(["druidic"]);
    expect(payload.class.weaponProficiencyIds).toEqual(["simple", "martial"]);
    expect(payload.class.armorTrainingIds).toEqual(["light", "medium", "shield"]);
    expect(payload.class.spellcastingFocusIds).toEqual(["druidic-focus"]);
    expect(casting).toEqual(expect.objectContaining({
      sourceClassId: "druid",
      spellListId: "druid",
      spellcastingAbilityId: "wisdom",
      cantripIds: ["druidcraft", "produce-flame"],
      preparedSpellIds: ["animal-friendship", "cure-wounds", "faerie-fire", "thunderwave"],
      alwaysPreparedSpellIds: ["speak-with-animals"],
      preparationChange: "long-rest-any",
      focusItemIds: ["druidic-focus"],
    }));
    expect(casting?.spellSlots).toEqual([{ level: 1, maximum: 2, current: 2, recharge: "long-rest" }]);
    expect(character.generation?.decisions).toEqual(expect.arrayContaining([
      expect.objectContaining({ stepId: "class.druid.primal-order", choiceId: "warden" }),
      expect.objectContaining({ stepId: "class.druid.cantrips" }),
      expect.objectContaining({ stepId: "class.druid.prepared-spells" }),
    ]));
  });

  it("builds Magician with a third cantrip and Wisdom-derived knowledge bonus", () => {
    const coreChoices = defaultGuidedDnd5eCoreChoices("druid", "sage", "dwarf");
    coreChoices.druid = {
      primalOrderId: "magician",
      cantripIds: ["druidcraft", "guidance", "produce-flame"],
      preparedSpellIds: ["animal-friendship", "cure-wounds", "faerie-fire", "thunderwave"],
    };
    const character = guidedGenerateDnd5eFirstSlice({
      name: "Druid Magician",
      classChoice: druidChoice,
      backgroundChoice: { selectedId: "sage", acceptableIds: ["sage"], selectionMode: "direct" },
      speciesChoice: dwarfChoice,
      coreChoices,
      abilityMethod: { method: "standard-array", assignment },
      backgroundIncreases: { wisdom: 2, intelligence: 1 },
      backgroundEquipmentChoice: "B:50-gp",
    });
    const payload = payloadOf(character);

    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!).valid).toBe(true);
    expect(payload.class.primalOrderId).toBe("magician");
    expect(payload.class.weaponProficiencyIds).toEqual(["simple"]);
    expect(payload.class.armorTrainingIds).toEqual(["light", "shield"]);
    expect(payload.class.druidicKnowledgeBonus).toBe(3);
    expect(payload.spells?.classCasting?.[0]?.cantripIds).toHaveLength(3);
  });

  it("keeps Sage Magic Initiate separate from Druid class spellcasting", () => {
    const coreChoices = defaultGuidedDnd5eCoreChoices("druid", "sage", "dwarf");
    const character = guidedGenerateDnd5eFirstSlice({
      name: "Druid Sage",
      classChoice: druidChoice,
      backgroundChoice: { selectedId: "sage", acceptableIds: ["sage"], selectionMode: "direct" },
      speciesChoice: dwarfChoice,
      coreChoices,
      abilityMethod: { method: "standard-array", assignment },
      backgroundIncreases: { wisdom: 2, intelligence: 1 },
      backgroundEquipmentChoice: "B:50-gp",
    });
    const payload = payloadOf(character);

    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!)).toEqual({ valid: true, issues: [] });
    expect(payload.spells?.grants).toHaveLength(1);
    expect(payload.spells?.grants[0]).toEqual(expect.objectContaining({ sourceId: "feat:magic-initiate", spellListId: "wizard" }));
    expect(payload.spells?.classCasting).toHaveLength(1);
    expect(payload.spells?.classCasting?.[0]).toEqual(expect.objectContaining({ sourceClassId: "druid", spellListId: "druid" }));
  });

  it("rejects tampered Druid always-prepared spell state", () => {
    const character = druidCharacter();
    const nativeState = JSON.parse(JSON.stringify(character.nativeStates[0]!)) as typeof character.nativeStates[0];
    const payload = nativeState.payload as Dnd5eNativeCharacter;
    payload.spells!.classCasting![0]!.alwaysPreparedSpellIds = [];

    const result = dnd5eSrd521Adapter.validateNativeState(nativeState);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("dnd5e.druid.always-prepared");
  });

  it("rejects tampered Warden training on reopen", () => {
    const character = druidCharacter();
    const nativeState = JSON.parse(JSON.stringify(character.nativeStates[0]!)) as typeof character.nativeStates[0];
    const payload = nativeState.payload as Dnd5eNativeCharacter;
    payload.class.armorTrainingIds = ["light", "shield"];

    const result = dnd5eSrd521Adapter.validateNativeState(nativeState);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("dnd5e.druid.warden-training");
  });
});
