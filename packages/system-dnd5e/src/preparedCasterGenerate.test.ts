import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { defaultGuidedDnd5eCoreChoices } from "./guidedDefaults.js";
import { guidedGenerateDnd5eFirstSlice } from "./guidedGenerate.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";
import type { GuidedPreparedCasterClassId } from "./preparedCasterCatalog.js";

const dwarfChoice = { selectedId: "dwarf" as const, acceptableIds: ["dwarf"] as const, selectionMode: "direct" as const };
const soldierChoice = { selectedId: "soldier" as const, acceptableIds: ["soldier"] as const, selectionMode: "direct" as const };
const assignment = { strength: 12, dexterity: 14, constitution: 13, intelligence: 10, wisdom: 8, charisma: 15 };

function characterFor(classId: GuidedPreparedCasterClassId) {
  return guidedGenerateDnd5eFirstSlice({
    name: `Batch ${classId}`,
    classChoice: { selectedId: classId, acceptableIds: [classId], selectionMode: "direct" },
    backgroundChoice: soldierChoice,
    speciesChoice: dwarfChoice,
    coreChoices: defaultGuidedDnd5eCoreChoices(classId, "soldier", "dwarf"),
    abilityMethod: { method: "standard-array", assignment },
    backgroundIncreases: { strength: 2, constitution: 1 },
    backgroundEquipmentChoice: "B:50-gp",
  });
}

function payloadFor(classId: GuidedPreparedCasterClassId): Dnd5eNativeCharacter {
  return characterFor(classId).nativeStates[0]!.payload as Dnd5eNativeCharacter;
}

describe("guided Level 1 prepared-caster class batch", () => {
  it("builds and independently validates Bard, Paladin, Ranger, Sorcerer, and Wizard", () => {
    for (const classId of ["bard", "paladin", "ranger", "sorcerer", "wizard"] as const) {
      const character = characterFor(classId);
      const validation = dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!);
      expect(validation.valid, `${classId}: ${validation.issues.map((issue) => issue.message).join(" | ")}`).toBe(true);
      expect((character.nativeStates[0]!.payload as Dnd5eNativeCharacter).spells?.classCasting).toHaveLength(1);
    }
  });

  it("retains Bard instrument focus/proficiencies and Bardic Inspiration state", () => {
    const payload = payloadFor("bard");
    expect(payload.class.toolProficiencyIds).toHaveLength(3);
    expect(payload.class.toolProficiencyIds?.every((id) => id.startsWith("musical-instrument:"))).toBe(true);
    expect(payload.class.spellcastingFocusIds).toEqual(payload.class.toolProficiencyIds);
    expect(payload.spells?.classCasting?.[0]?.cantripIds).toHaveLength(2);
    expect(payload.spells?.classCasting?.[0]?.preparedSpellIds).toHaveLength(4);
    expect(payload.resources.bardicInspirationDie).toBe(6);
    expect(payload.resources.bardicInspirationMaximum).toBe(2);
  });

  it("retains Paladin Lay on Hands, armor training, mastery, and Level 1 spellcasting", () => {
    const payload = payloadFor("paladin");
    expect(payload.class.weaponProficiencyIds).toEqual(["simple", "martial"]);
    expect(payload.class.armorTrainingIds).toEqual(["light", "medium", "heavy", "shield"]);
    expect(payload.class.weaponMasteryIds).toHaveLength(2);
    expect(payload.resources.layOnHandsMaximum).toBe(5);
    expect(payload.spells?.classCasting?.[0]).toEqual(expect.objectContaining({ spellcastingAbilityId: "charisma", preparedSpellIds: ["bless", "cure-wounds"] }));
  });

  it("keeps Favored Enemy Hunter's Mark separate from Ranger prepared choices", () => {
    const payload = payloadFor("ranger");
    const casting = payload.spells?.classCasting?.[0];
    expect(casting?.preparedSpellIds).toEqual(["goodberry", "longstrider"]);
    expect(casting?.preparedSpellIds).not.toContain("hunters-mark");
    expect(casting?.alwaysPreparedSpellIds).toEqual(["hunters-mark"]);
    expect(payload.resources.favoredEnemyMaximum).toBe(2);
    expect(payload.resources.favoredEnemyCurrent).toBe(2);
  });

  it("retains Sorcerer Innate Sorcery and four cantrips", () => {
    const payload = payloadFor("sorcerer");
    expect(payload.spells?.classCasting?.[0]?.spellcastingAbilityId).toBe("charisma");
    expect(payload.spells?.classCasting?.[0]?.cantripIds).toHaveLength(4);
    expect(payload.resources.innateSorceryMaximum).toBe(2);
    expect(payload.resources.innateSorceryCurrent).toBe(2);
  });

  it("retains a six-spell Wizard spellbook with four prepared spells as a subset", () => {
    const payload = payloadFor("wizard");
    const casting = payload.spells?.classCasting?.[0];
    expect(casting?.spellbookSpellIds).toHaveLength(6);
    expect(casting?.preparedSpellIds).toHaveLength(4);
    expect(casting?.preparedSpellIds.every((id) => casting.spellbookSpellIds?.includes(id))).toBe(true);
    expect(payload.resources.arcaneRecoveryMaximum).toBe(1);
    expect(payload.resources.arcaneRecoverySpellLevelBudget).toBe(1);
  });

  it("rejects tampered Ranger always-prepared state", () => {
    const character = characterFor("ranger");
    const nativeState = JSON.parse(JSON.stringify(character.nativeStates[0]!)) as typeof character.nativeStates[0];
    const payload = nativeState.payload as Dnd5eNativeCharacter;
    payload.spells!.classCasting![0]!.alwaysPreparedSpellIds = [];
    const result = dnd5eSrd521Adapter.validateNativeState(nativeState);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("dnd5e.ranger.always-prepared");
  });

  it("rejects a Wizard prepared spell that is not in its retained spellbook", () => {
    const character = characterFor("wizard");
    const nativeState = JSON.parse(JSON.stringify(character.nativeStates[0]!)) as typeof character.nativeStates[0];
    const payload = nativeState.payload as Dnd5eNativeCharacter;
    payload.spells!.classCasting![0]!.preparedSpellIds = ["alarm", "find-familiar", "mage-armor", "magic-missile"];
    const result = dnd5eSrd521Adapter.validateNativeState(nativeState);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("dnd5e.wizard.prepared-subset");
  });
});
