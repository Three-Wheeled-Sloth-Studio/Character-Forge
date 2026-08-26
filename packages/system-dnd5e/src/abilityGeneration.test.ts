import { describe, expect, it } from "vitest";
import {
  createStandardArrayAbilityState,
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

describe("D&D 5E Standard Array generation", () => {
  it("exposes the SRD Standard Array without prescribing an assignment", () => {
    expect(DND5E_STANDARD_ARRAY).toEqual([15, 14, 13, 12, 10, 8]);
  });

  it("builds any permutation of the Standard Array with a legal +2/+1 background plan", () => {
    const state = createStandardArrayAbilityState({
      assignment: alternativeAssignment,
      backgroundAbilityIds: soldierAbilityIds,
      backgroundIncreases: { dexterity: 2, constitution: 1 },
    });

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

  it("rejects a background increase outside the background's listed abilities", () => {
    expect(() =>
      createStandardArrayAbilityState({
        assignment: alternativeAssignment,
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
