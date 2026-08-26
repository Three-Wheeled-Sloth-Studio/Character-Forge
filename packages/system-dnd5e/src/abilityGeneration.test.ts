import { describe, expect, it } from "vitest";
import {
  calculateDnd5ePointCost,
  createManualAbilityState,
  createPointCostAbilityState,
  createStandardArrayAbilityState,
  DND5E_POINT_COST_BUDGET,
  DND5E_POINT_COSTS,
  DND5E_STANDARD_ARRAY,
} from "./abilityGeneration.js";

const alternativeAssignment = {
  strength: 14,
  dexterity: 15,
  constitution: 13,
  intelligence: 10,
  wisdom: 12,
  charisma: 8,
};

const soldierAbilityIds = [
  "strength",
  "dexterity",
  "constitution",
] as const;

describe("D&D 5E ability generation", () => {
  it("exposes the SRD Standard Array without prescribing an assignment", () => {
    expect(DND5E_STANDARD_ARRAY).toEqual([15, 14, 13, 12, 10, 8]);
  });

  it("exposes the SRD Point Cost budget and score costs", () => {
    expect(DND5E_POINT_COST_BUDGET).toBe(27);
    expect(DND5E_POINT_COSTS).toEqual({
      8: 0,
      9: 1,
      10: 2,
      11: 3,
      12: 4,
      13: 5,
      14: 7,
      15: 9,
    });
    expect(calculateDnd5ePointCost(alternativeAssignment)).toBe(27);
  });

  it("builds any permutation of the Standard Array with a legal +2/+1 background plan", () => {
    const state = createStandardArrayAbilityState({
      assignment: alternativeAssignment,
      backgroundAbilityIds: soldierAbilityIds,
      backgroundIncreases: { dexterity: 2, constitution: 1 },
    });

    expect(state.generationMethod).toBe("standard-array");
    expect(state.base).toEqual(alternativeAssignment);
    expect(state.final).toEqual({
      strength: 14,
      dexterity: 17,
      constitution: 14,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    });
  });

  it("uses the same background-adjustment path for manual base scores", () => {
    const state = createManualAbilityState({
      scores: {
        strength: 16,
        dexterity: 11,
        constitution: 15,
        intelligence: 9,
        wisdom: 13,
        charisma: 7,
      },
      backgroundAbilityIds: soldierAbilityIds,
      backgroundIncreases: { strength: 2, constitution: 1 },
    });

    expect(state).toEqual({
      generationMethod: "manual",
      base: {
        strength: 16,
        dexterity: 11,
        constitution: 15,
        intelligence: 9,
        wisdom: 13,
        charisma: 7,
      },
      backgroundIncreases: {
        strength: 2,
        dexterity: 0,
        constitution: 1,
        intelligence: 0,
        wisdom: 0,
        charisma: 0,
      },
      final: {
        strength: 18,
        dexterity: 11,
        constitution: 16,
        intelligence: 9,
        wisdom: 13,
        charisma: 7,
      },
    });
  });

  it("uses the same background-adjustment path for Point Cost scores", () => {
    const state = createPointCostAbilityState({
      scores: alternativeAssignment,
      backgroundAbilityIds: soldierAbilityIds,
      backgroundIncreases: { dexterity: 2, constitution: 1 },
    });

    expect(state.generationMethod).toBe("point-cost");
    expect(state.base).toEqual(alternativeAssignment);
    expect(state.final.dexterity).toBe(17);
    expect(state.final.constitution).toBe(14);
  });

  it("supports the legal +1/+1/+1 background alternative", () => {
    const state = createStandardArrayAbilityState({
      assignment: alternativeAssignment,
      backgroundAbilityIds: soldierAbilityIds,
      backgroundIncreases: {
        strength: 1,
        dexterity: 1,
        constitution: 1,
      },
    });

    expect(state.final).toEqual({
      strength: 15,
      dexterity: 16,
      constitution: 14,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    });
  });

  it("rejects a Standard Array assignment that duplicates a score", () => {
    expect(() =>
      createStandardArrayAbilityState({
        assignment: {
          ...alternativeAssignment,
          charisma: 10,
        },
        backgroundAbilityIds: soldierAbilityIds,
        backgroundIncreases: { dexterity: 2, constitution: 1 },
      }),
    ).toThrow("must use 15, 14, 13, 12, 10, and 8 exactly once");
  });

  it("rejects manual base scores outside the pre-background generation range", () => {
    expect(() =>
      createManualAbilityState({
        scores: { ...alternativeAssignment, charisma: 2 },
        backgroundAbilityIds: soldierAbilityIds,
        backgroundIncreases: { dexterity: 2, constitution: 1 },
      }),
    ).toThrow("Manual base charisma must be an integer from 3 through 18");
  });

  it("rejects Point Cost base scores outside 8 through 15", () => {
    expect(() =>
      createPointCostAbilityState({
        scores: { ...alternativeAssignment, charisma: 16 },
        backgroundAbilityIds: soldierAbilityIds,
        backgroundIncreases: { dexterity: 2, constitution: 1 },
      }),
    ).toThrow("Point Cost base charisma must be an integer from 8 through 15");
  });

  it("rejects Point Cost allocations that exceed 27 points", () => {
    expect(() =>
      createPointCostAbilityState({
        scores: {
          strength: 15,
          dexterity: 15,
          constitution: 15,
          intelligence: 15,
          wisdom: 8,
          charisma: 8,
        },
        backgroundAbilityIds: soldierAbilityIds,
        backgroundIncreases: { strength: 2, constitution: 1 },
      }),
    ).toThrow("exceeding the 27-point budget");
  });

  it("rejects a background increase outside the background's listed abilities for every method", () => {
    expect(() =>
      createManualAbilityState({
        scores: alternativeAssignment,
        backgroundAbilityIds: soldierAbilityIds,
        backgroundIncreases: { intelligence: 2, constitution: 1 },
      }),
    ).toThrow("only to abilities listed by that background");
  });

  it("rejects an incomplete background increase pattern", () => {
    expect(() =>
      createStandardArrayAbilityState({
        assignment: alternativeAssignment,
        backgroundAbilityIds: soldierAbilityIds,
        backgroundIncreases: { dexterity: 2 },
      }),
    ).toThrow("must be +2/+1");
  });
});
