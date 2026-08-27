import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { guidedGenerateDnd5eFirstSlice } from "./guidedGenerate.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";

const classChoice = {
  selectedId: "fighter" as const,
  acceptableIds: ["barbarian", "fighter", "monk", "rogue"] as const,
  selectionMode: "direct" as const,
};
const speciesChoice = {
  selectedId: "human" as const,
  acceptableIds: ["dwarf", "halfling", "human", "orc"] as const,
  selectionMode: "direct" as const,
};
const soldierChoice = {
  selectedId: "soldier" as const,
  acceptableIds: ["criminal", "soldier"] as const,
  selectionMode: "direct" as const,
};
const criminalChoice = {
  selectedId: "criminal" as const,
  acceptableIds: ["criminal", "soldier"] as const,
  selectionMode: "random" as const,
};
const standardAssignment = {
  strength: 15,
  dexterity: 14,
  constitution: 13,
  intelligence: 12,
  wisdom: 10,
  charisma: 8,
};

function payloadOf(character: ReturnType<typeof guidedGenerateDnd5eFirstSlice>): Dnd5eNativeCharacter {
  return character.nativeStates[0]!.payload as Dnd5eNativeCharacter;
}

describe("guided D&D generation", () => {
  it("builds a valid Criminal background with background-owned increases and Alert", () => {
    const character = guidedGenerateDnd5eFirstSlice({
      name: "Mara Voss",
      classChoice,
      backgroundChoice: criminalChoice,
      speciesChoice,
      abilityMethod: { method: "standard-array", assignment: standardAssignment },
      backgroundIncreases: { dexterity: 2, intelligence: 1 },
      backgroundEquipmentChoice: "B:50-gp",
    });
    const payload = payloadOf(character);

    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!).valid).toBe(true);
    expect(payload.origin.backgroundId).toBe("criminal");
    expect(payload.origin.backgroundOriginFeatId).toBe("alert");
    expect(payload.origin.toolProficiencyId).toBe("thieves-tools");
    expect(payload.origin.backgroundSkillProficiencies).toEqual(["sleight-of-hand", "stealth"]);
    expect(payload.origin.speciesOriginFeatId).toBe("savage-attacker");
    expect(payload.derived.initiativeModifier).toBe(5);
    expect(character.generation?.decisions).toEqual(expect.arrayContaining([
      expect.objectContaining({ stepId: "background", choiceId: "criminal" }),
      expect.objectContaining({ stepId: "background.acceptable-pool" }),
    ]));
  });

  it("adds the selected background equipment package instead of 50 GP", () => {
    const character = guidedGenerateDnd5eFirstSlice({
      name: "Package Test",
      classChoice,
      backgroundChoice: soldierChoice,
      speciesChoice,
      abilityMethod: { method: "standard-array", assignment: standardAssignment },
      backgroundIncreases: { strength: 2, constitution: 1 },
      backgroundEquipmentChoice: "A",
    });
    const payload = payloadOf(character);

    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!).valid).toBe(true);
    expect(payload.equipment).toEqual(expect.arrayContaining([
      expect.objectContaining({ itemId: "spear", quantity: 1 }),
      expect.objectContaining({ itemId: "gaming-set:dice", quantity: 1 }),
    ]));
    expect(payload.currencyGp).toBe(18);
  });

  it("routes Standard Array, Manual, Point Cost, and Random through the same guided native builder", () => {
    const methods = [
      { method: "standard-array" as const, assignment: standardAssignment },
      { method: "manual" as const, scores: standardAssignment },
      { method: "point-cost" as const, scores: standardAssignment },
      {
        method: "random" as const,
        seed: "guided-method-test",
        assignment: {
          strength: 0,
          dexterity: 1,
          constitution: 2,
          intelligence: 3,
          wisdom: 4,
          charisma: 5,
        },
      },
    ];

    for (const abilityMethod of methods) {
      const character = guidedGenerateDnd5eFirstSlice({
        name: `Method ${abilityMethod.method}`,
        classChoice,
        backgroundChoice: soldierChoice,
        speciesChoice,
        abilityMethod,
        backgroundIncreases: { strength: 2, constitution: 1 },
        backgroundEquipmentChoice: "B:50-gp",
      });

      expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!).valid).toBe(true);
      expect(payloadOf(character).abilities.generationMethod).toBe(abilityMethod.method);
    }
  });

  it("rejects an increase outside the selected background's three abilities", () => {
    expect(() => guidedGenerateDnd5eFirstSlice({
      name: "Bad Criminal",
      classChoice,
      backgroundChoice: criminalChoice,
      speciesChoice,
      abilityMethod: { method: "standard-array", assignment: standardAssignment },
      backgroundIncreases: { strength: 2, intelligence: 1 },
      backgroundEquipmentChoice: "B:50-gp",
    })).toThrow("Background ability increases may apply only to abilities listed by that background");
  });
});
