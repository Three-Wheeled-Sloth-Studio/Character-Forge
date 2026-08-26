import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { pointCostGenerateDnd5eFirstSlice } from "./pointCostGenerate.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";

describe("D&D 5E Point Cost generation", () => {
  it("creates a valid Level 1 character through the shared ability-state path", () => {
    const character = pointCostGenerateDnd5eFirstSlice({
      name: "Ilya Mercer",
      scores: {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      },
      backgroundIncreases: { strength: 2, constitution: 1 },
    });
    const nativeState = character.nativeStates[0];
    const payload = nativeState.payload as Dnd5eNativeCharacter;

    expect(dnd5eSrd521Adapter.validateNativeState(nativeState)).toEqual({ valid: true, issues: [] });
    expect(payload.abilities.generationMethod).toBe("point-cost");
    expect(payload.abilities.final.strength).toBe(17);
    expect(payload.abilities.final.constitution).toBe(14);
    expect(payload.resources.hitPointsMaximum).toBe(12);
  });

  it("records Point Cost provenance without inventing a random seed", () => {
    const character = pointCostGenerateDnd5eFirstSlice({
      name: "Ilya Mercer",
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

    expect(character.generation).toMatchObject({
      methodId: "dnd5e:point-cost-first-slice",
      mode: "mechanical",
      recipeVersion: "0.1",
      recipe: {
        abilityMethod: "point-cost",
        pointBudget: 27,
      },
    });
    expect(character.generation?.seed).toBeUndefined();
    expect(character.generation?.decisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          stepId: "abilities.point-cost",
          rationale: "27 of 27 points spent.",
        }),
      ]),
    );
  });

  it("rejects an over-budget allocation before CharacterDocument creation", () => {
    expect(() => pointCostGenerateDnd5eFirstSlice({
      name: "Over Budget",
      scores: {
        strength: 15,
        dexterity: 15,
        constitution: 15,
        intelligence: 15,
        wisdom: 8,
        charisma: 8,
      },
      backgroundIncreases: { strength: 2, constitution: 1 },
    })).toThrow("exceeding the 27-point budget");
  });
});
