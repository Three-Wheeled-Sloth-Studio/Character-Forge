import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { defaultGuidedDnd5eCoreChoices } from "./guidedDefaults.js";
import { guidedGenerateDnd5eFirstSlice } from "./guidedGenerate.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";

const classChoice = { selectedId: "fighter" as const, acceptableIds: ["barbarian", "fighter", "monk", "rogue"] as const, selectionMode: "direct" as const };
const humanChoice = { selectedId: "human" as const, acceptableIds: ["dwarf", "halfling", "human", "orc"] as const, selectionMode: "direct" as const };
const soldierChoice = { selectedId: "soldier" as const, acceptableIds: ["criminal", "soldier"] as const, selectionMode: "direct" as const };
const criminalChoice = { selectedId: "criminal" as const, acceptableIds: ["criminal", "soldier"] as const, selectionMode: "random" as const };
const standardAssignment = { strength: 15, dexterity: 14, constitution: 13, intelligence: 12, wisdom: 10, charisma: 8 };

function payloadOf(character: ReturnType<typeof guidedGenerateDnd5eFirstSlice>): Dnd5eNativeCharacter {
  return character.nativeStates[0]!.payload as Dnd5eNativeCharacter;
}

function baseInput(background: "criminal" | "soldier" = "soldier") {
  return {
    classChoice,
    backgroundChoice: background === "criminal" ? criminalChoice : soldierChoice,
    speciesChoice: humanChoice,
    coreChoices: defaultGuidedDnd5eCoreChoices("fighter", background, "human"),
    abilityMethod: { method: "standard-array" as const, assignment: standardAssignment },
    backgroundIncreases: background === "criminal" ? { dexterity: 2 as const, intelligence: 1 as const } : { strength: 2 as const, constitution: 1 as const },
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

  it("builds Criminal as real background state and preserves Alert initiative", () => {
    const character = guidedGenerateDnd5eFirstSlice({ ...baseInput("criminal"), name: "Mara Voss" });
    const payload = payloadOf(character);
    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!).valid).toBe(true);
    expect(payload.origin.backgroundOriginFeatId).toBe("alert");
    expect(payload.origin.speciesOriginFeatId).toBe("savage-attacker");
    expect(payload.derived.initiativeModifier).toBe(5);
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
      backgroundChoice: soldierChoice,
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
