import { describe, expect, it } from "vitest";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";
import {
  assignDnd5eRandomAbilityScores,
  randomGenerateDnd5eFirstSlice,
  rollDnd5eRandomAbilitySet,
} from "./randomGenerate.js";

const identityAssignment = {
  strength: 0,
  dexterity: 1,
  constitution: 2,
  intelligence: 3,
  wisdom: 4,
  charisma: 5,
} as const;

describe("D&D Random Generation", () => {
  it("replays six 4d6kh3 score rolls from the same seed", () => {
    const first = rollDnd5eRandomAbilitySet("random-replay");
    const second = rollDnd5eRandomAbilitySet("random-replay");

    expect(first).toEqual(second);
    expect(first.expression).toBe("4d6kh3");
    expect(first.results).toHaveLength(6);
    for (const result of first.results) {
      expect(result.rolls).toHaveLength(4);
      expect(result.keptValues).toHaveLength(3);
      expect(result.total).toBeGreaterThanOrEqual(3);
      expect(result.total).toBeLessThanOrEqual(18);
    }
  });

  it("assigns roll slots exactly once and retains random-generation provenance", () => {
    const character = randomGenerateDnd5eFirstSlice({
      name: "Dice Test",
      seed: "random-character",
      assignment: identityAssignment,
      backgroundIncreases: { strength: 2, constitution: 1 },
    });
    const payload = character.nativeStates[0].payload as Dnd5eNativeCharacter;

    expect(payload.abilities.generationMethod).toBe("random");
    expect(character.generation?.methodId).toBe("dnd5e:random-4d6kh3-first-slice");
    expect(character.generation?.seed).toBe("random-character");
    expect(character.generation?.decisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ stepId: "abilities.random.rolls" }),
        expect.objectContaining({ stepId: "abilities.random.assignment" }),
      ]),
    );
  });

  it("rejects assignment that reuses a roll slot", () => {
    const rollSet = rollDnd5eRandomAbilitySet("duplicate-slot");
    expect(() => assignDnd5eRandomAbilityScores(rollSet, {
      ...identityAssignment,
      charisma: 4,
    })).toThrow("assigned exactly once");
  });
});
