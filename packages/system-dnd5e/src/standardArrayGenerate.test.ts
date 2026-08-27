import { describe, expect, it } from "vitest";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";
import { standardArrayGenerateDnd5eFirstSlice } from "./standardArrayGenerate.js";

const assignment = {
  strength: 15,
  dexterity: 12,
  constitution: 14,
  intelligence: 10,
  wisdom: 13,
  charisma: 8,
};

describe("Standard Array generation", () => {
  it("creates a complete first-slice character with explicit Standard Array provenance", () => {
    const character = standardArrayGenerateDnd5eFirstSlice({
      name: "Mara Voss",
      assignment,
      backgroundIncreases: { strength: 1, dexterity: 1, constitution: 1 },
    });
    const payload = character.nativeStates[0].payload as Dnd5eNativeCharacter;

    expect(payload.abilities.generationMethod).toBe("standard-array");
    expect(payload.abilities.base).toEqual(assignment);
    expect(character.generation?.methodId).toBe("dnd5e:standard-array-first-slice");
    expect(character.generation?.seed).toBeUndefined();
    expect(character.generation?.decisions).toEqual(
      expect.arrayContaining([expect.objectContaining({ stepId: "abilities.standard-array" })]),
    );
  });

  it("rejects an invalid array assignment", () => {
    expect(() => standardArrayGenerateDnd5eFirstSlice({
      name: "Bad Array",
      assignment: { ...assignment, charisma: 10 },
      backgroundIncreases: { strength: 2, constitution: 1 },
    })).toThrow("must use 15, 14, 13, 12, 10, and 8 exactly once");
  });
});
