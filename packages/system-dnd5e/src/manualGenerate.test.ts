import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { manualGenerateDnd5eFirstSlice } from "./manualGenerate.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";

describe("D&D 5E first-slice manual generation", () => {
  it("creates a valid native character through the shared ability-state path", () => {
    const character = manualGenerateDnd5eFirstSlice({
      name: "Mara Voss",
      scores: {
        strength: 16,
        dexterity: 11,
        constitution: 15,
        intelligence: 9,
        wisdom: 13,
        charisma: 7,
      },
      backgroundIncreases: { strength: 2, constitution: 1 },
    });
    const nativeState = character.nativeStates[0];
    const payload = nativeState.payload as Dnd5eNativeCharacter;

    expect(dnd5eSrd521Adapter.validateNativeState(nativeState)).toEqual({ valid: true, issues: [] });
    expect(payload.abilities.generationMethod).toBe("manual");
    expect(payload.abilities.final.strength).toBe(18);
    expect(payload.resources.hitPointsMaximum).toBe(13);
    expect(character.displayName).toBe("Mara Voss");
  });

  it("records explicit manual provenance without inventing a random seed", () => {
    const character = manualGenerateDnd5eFirstSlice({
      name: "Manual Test",
      scores: {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      },
      backgroundIncreases: { strength: 1, dexterity: 1, constitution: 1 },
    });

    expect(character.nativeStates[0].provenance.origin).toBe("manual");
    expect(character.generation?.mode).toBe("manual");
    expect(character.generation?.methodId).toBe("dnd5e:manual-first-slice");
    expect(character.generation?.seed).toBeUndefined();
    expect(character.generation?.decisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ stepId: "abilities.manual" }),
        expect.objectContaining({ stepId: "background.ability-increases" }),
      ]),
    );
  });

  it("requires a name instead of silently inventing one for manual entry", () => {
    expect(() => manualGenerateDnd5eFirstSlice({
      name: "   ",
      scores: {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      },
      backgroundIncreases: { strength: 2, constitution: 1 },
    })).toThrow("Character name is required for manual generation");
  });
});
