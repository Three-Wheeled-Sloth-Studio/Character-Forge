import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { defaultGuidedDnd5eCoreChoices } from "./guidedDefaults.js";
import { guidedGenerateDnd5eFirstSlice } from "./guidedGenerate.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";
import type { GuidedDnd5eBackgroundId } from "./srdCatalog.js";

const classChoice = { selectedId: "fighter" as const, acceptableIds: ["barbarian", "fighter", "monk", "rogue"] as const, selectionMode: "direct" as const };
const humanChoice = { selectedId: "human" as const, acceptableIds: ["dragonborn", "dwarf", "goliath", "halfling", "human", "orc"] as const, selectionMode: "direct" as const };
const standardAssignment = { strength: 15, dexterity: 14, constitution: 13, intelligence: 12, wisdom: 10, charisma: 8 };

function payloadOf(character: ReturnType<typeof guidedGenerateDnd5eFirstSlice>): Dnd5eNativeCharacter {
  return character.nativeStates[0]!.payload as Dnd5eNativeCharacter;
}

function backgroundChoice(background: GuidedDnd5eBackgroundId) {
  return { selectedId: background, acceptableIds: ["acolyte", "criminal", "sage", "soldier"] as const, selectionMode: "direct" as const };
}

function boostsFor(background: GuidedDnd5eBackgroundId) {
  if (background === "acolyte") return { wisdom: 2 as const, charisma: 1 as const };
  if (background === "criminal") return { dexterity: 2 as const, intelligence: 1 as const };
  if (background === "sage") return { intelligence: 2 as const, wisdom: 1 as const };
  return { strength: 2 as const, constitution: 1 as const };
}

function baseInput(background: GuidedDnd5eBackgroundId = "soldier") {
  return {
    classChoice,
    backgroundChoice: backgroundChoice(background),
    speciesChoice: humanChoice,
    coreChoices: defaultGuidedDnd5eCoreChoices("fighter", background, "human"),
    abilityMethod: { method: "standard-array" as const, assignment: standardAssignment },
    backgroundIncreases: boostsFor(background),
    backgroundEquipmentChoice: "B:50-gp" as const,
  };
}

describe("guided D&D generation", () => {
  it("restores generated names when the guided name is blank", () => {
    const character = guidedGenerateDnd5eFirstSlice({ ...baseInput(), name: "" });
    const payload = payloadOf(character);
    expect(character.displayName.length).toBeGreaterThan(0);
    expect(payload.identity.name).toBe(character.displayName);
    expect(character.generation?.decisions).toContainEqual(expect.objectContaining({ stepId: "identity.name", rationale: expect.stringContaining("Generated") }));
  });

  it("retains explicit random-name provenance when the name button supplied the value", () => {
    const character = guidedGenerateDnd5eFirstSlice({ ...baseInput(), name: "Mara Voss", nameSelectionMode: "random" });
    expect(character.generation?.decisions).toContainEqual(expect.objectContaining({ stepId: "identity.name", rationale: expect.stringContaining("randomize-name") }));
  });

  it("builds Criminal as real background state and preserves Alert initiative", () => {
    const character = guidedGenerateDnd5eFirstSlice({ ...baseInput("criminal"), name: "Mara Voss" });
    const payload = payloadOf(character);
    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!).valid).toBe(true);
    expect(payload.origin.backgroundOriginFeatId).toBe("alert");
    expect(payload.origin.speciesOriginFeatId).toBe("savage-attacker");
    expect(payload.derived.initiativeModifier).toBe(5);
  });

  it("builds Acolyte Magic Initiate as a native Cleric spell grant", () => {
    const character = guidedGenerateDnd5eFirstSlice({ ...baseInput("acolyte"), name: "Acolyte" });
    const payload = payloadOf(character);
    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!)).toEqual({ valid: true, issues: [] });
    expect(payload.origin.backgroundOriginFeatId).toBe("magic-initiate:cleric");
    expect(payload.spells?.grants).toEqual([
      expect.objectContaining({
        sourceId: "feat:magic-initiate",
        spellListId: "cleric",
        spellcastingAbilityId: "wisdom",
        cantripIds: ["guidance", "sacred-flame"],
        alwaysPreparedSpellIds: ["bless"],
        freeCastSpellId: "bless",
        freeCastMaximum: 1,
        freeCastCurrent: 1,
        freeCastRecharge: "long-rest",
      }),
    ]);
  });

  it("builds Sage Magic Initiate as a native Wizard spell grant", () => {
    const character = guidedGenerateDnd5eFirstSlice({ ...baseInput("sage"), name: "Sage" });
    const payload = payloadOf(character);
    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!)).toEqual({ valid: true, issues: [] });
    expect(payload.origin.backgroundOriginFeatId).toBe("magic-initiate:wizard");
    expect(payload.spells?.grants[0]).toEqual(expect.objectContaining({
      spellListId: "wizard",
      spellcastingAbilityId: "intelligence",
      cantripIds: ["light", "mage-hand"],
      freeCastSpellId: "magic-missile",
    }));
  });

  it("rejects a Magic Initiate spell from the wrong source list", () => {
    const coreChoices = defaultGuidedDnd5eCoreChoices("fighter", "acolyte", "human");
    coreChoices.magicInitiate!.levelOneSpellId = "magic-missile";
    expect(() => guidedGenerateDnd5eFirstSlice({ ...baseInput("acolyte"), name: "Wrong List", coreChoices })).toThrow("Cleric level 1 spell");
  });

  it("adapter rejects a retained Magic Initiate grant whose free cast no longer matches the prepared spell", () => {
    const character = guidedGenerateDnd5eFirstSlice({ ...baseInput("sage"), name: "Tampered Sage" });
    const nativeState = JSON.parse(JSON.stringify(character.nativeStates[0]!)) as typeof character.nativeStates[0];
    const payload = nativeState.payload as Dnd5eNativeCharacter;
    payload.spells!.grants[0]!.freeCastSpellId = "shield";
    const result = dnd5eSrd521Adapter.validateNativeState(nativeState);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("dnd5e.magic-initiate.level-one");
  });

  it("uses Fighter equipment and Fighting Style choices to derive Armor Class", () => {
    const coreChoices = defaultGuidedDnd5eCoreChoices("fighter", "soldier", "human");
    coreChoices.classEquipmentChoice = "B";
    coreChoices.fightingStyleFeatId = "archery";
    const character = guidedGenerateDnd5eFirstSlice({ ...baseInput(), name: "Archer", coreChoices });
    const payload = payloadOf(character);
    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!).valid).toBe(true);
    expect(payload.class.classEquipmentChoice).toBe("B");
    expect(payload.class.fightingStyleFeatId).toBe("archery");
    expect(payload.derived.armorClass).toBe(14);
  });

  it("retains Human size, Skillful, Versatile Skilled, and Skilled proficiencies", () => {
    const coreChoices = defaultGuidedDnd5eCoreChoices("fighter", "soldier", "human");
    coreChoices.human = { size: "small", skillId: "perception", originFeatId: "skilled", skilledProficiencyIds: ["arcana", "medicine", "thieves-tools"] };
    const character = guidedGenerateDnd5eFirstSlice({ ...baseInput(), name: "Small Human", coreChoices });
    const payload = payloadOf(character);
    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!).valid).toBe(true);
    expect(payload.origin.size).toBe("small");
    expect(payload.origin.speciesSkillId).toBe("perception");
    expect(payload.origin.speciesOriginFeatId).toBe("skilled");
    expect(payload.origin.speciesOriginFeatProficiencyIds).toEqual(["arcana", "medicine", "thieves-tools"]);
    expect(payload.derived.passivePerception).toBe(12);
  });

  it("retains Rogue skills, Expertise, mastery, and bonus language", () => {
    const rogueChoice = { selectedId: "rogue" as const, acceptableIds: ["rogue"] as const, selectionMode: "direct" as const };
    const dwarfChoice = { selectedId: "dwarf" as const, acceptableIds: ["dwarf"] as const, selectionMode: "direct" as const };
    const coreChoices = defaultGuidedDnd5eCoreChoices("rogue", "soldier", "dwarf");
    coreChoices.classSkillIds = ["acrobatics", "investigation", "perception", "stealth"];
    coreChoices.expertiseSkillIds = ["perception", "stealth"];
    coreChoices.weaponMasteryIds = ["dagger", "shortbow"];
    coreChoices.rogueBonusLanguageId = "undercommon";
    const character = guidedGenerateDnd5eFirstSlice({
      name: "Rogue",
      classChoice: rogueChoice,
      backgroundChoice: backgroundChoice("soldier"),
      speciesChoice: dwarfChoice,
      coreChoices,
      abilityMethod: { method: "standard-array", assignment: standardAssignment },
      backgroundIncreases: { strength: 2, constitution: 1 },
      backgroundEquipmentChoice: "B:50-gp",
    });
    const payload = payloadOf(character);
    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!).valid).toBe(true);
    expect(payload.class.expertiseSkillIds).toEqual(["perception", "stealth"]);
    expect(payload.class.bonusLanguageIds).toEqual(["thieves-cant", "undercommon"]);
  });

  it("routes all four ability methods through the same 0.3 guided builder", () => {
    const methods = [
      { method: "standard-array" as const, assignment: standardAssignment },
      { method: "manual" as const, scores: standardAssignment },
      { method: "point-cost" as const, scores: standardAssignment },
      { method: "random" as const, seed: "guided-method-test", assignment: { strength: 0, dexterity: 1, constitution: 2, intelligence: 3, wisdom: 4, charisma: 5 } },
    ];
    for (const abilityMethod of methods) {
      const character = guidedGenerateDnd5eFirstSlice({ ...baseInput(), name: `Method ${abilityMethod.method}`, abilityMethod });
      expect(character.nativeStates[0]!.schemaVersion).toBe("dnd5e-character/0.3");
      expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!).valid).toBe(true);
      expect(payloadOf(character).abilities.generationMethod).toBe(abilityMethod.method);
    }
  });
});
