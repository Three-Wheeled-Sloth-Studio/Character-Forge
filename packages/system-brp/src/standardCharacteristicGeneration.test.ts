import { describe, expect, it } from "vitest";
import { parseCharacterDocument } from "../../character-model/src/index.js";
import {
  BRP_STANDARD_REDISTRIBUTION_SOURCE_ID,
  brpUge105Adapter,
  buildBrpStandardRolledFirstSliceCharacter,
  generateBrpStandardRolledCharacteristics,
  type BrpNativeCharacter,
  type BrpStandardRolledFirstSliceInput,
} from "./index.js";

function rolledInput(): BrpStandardRolledFirstSliceInput {
  return {
    characterId: "character-aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    nativeStateId: "native-brp-aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    displayName: "Riley Hart",
    age: 31,
    gender: "nonbinary",
    wealth: "average",
    seed: "brp-standard-roll-test",
    redistribution: [
      { from: "SIZ", to: "INT", points: 2 },
      { from: "CHA", to: "DEX", points: 1 },
    ],
    detectiveElectiveSkillKeys: ["insight", "science:forensics", "stealth", "track"],
    professionalAllocations: [
      { skillKey: "firearm:handgun", points: 35 },
      { skillKey: "knowledge:law", points: 45 },
      { skillKey: "listen", points: 35 },
      { skillKey: "persuade", points: 25 },
      { skillKey: "spot", points: 30 },
      { skillKey: "research", points: 35 },
      { skillKey: "science:forensics", points: 25 },
      { skillKey: "insight", points: 20 },
    ],
    personalAllocations: [
      { skillKey: "first-aid", points: 30 },
      { skillKey: "research", points: 15 },
      { skillKey: "spot", points: 15 },
      { skillKey: "science:forensics", points: 20 },
      { skillKey: "stealth", points: 35 },
      { skillKey: "track", points: 15 },
    ],
  };
}

describe("BRP UGE standard characteristic generation", () => {
  it("deterministically retains raw dice, redistribution, and final causal layers", () => {
    const document = buildBrpStandardRolledFirstSliceCharacter(rolledInput());
    const state = document.nativeStates[0];
    const native = state.payload as BrpNativeCharacter;

    expect(document.generation).toMatchObject({
      methodId: "brp-uge-first-slice-standard-rolled",
      mode: "mechanical",
      recipeVersion: "brp-uge-first-slice/0.2",
      seed: "brp-standard-roll-test",
    });
    expect(native.rulesProfile.characteristicGeneration).toBe("standard-rolled");
    expect(native.characteristicGenerationState).toEqual({
      method: "standard-rolled",
      seed: "brp-standard-roll-test",
      rolls: {
        STR: { notation: "3d6", rolls: [4, 1, 4], modifier: 0, total: 9 },
        CON: { notation: "3d6", rolls: [5, 4, 2], modifier: 0, total: 11 },
        SIZ: { notation: "2d6+6", rolls: [6, 5], modifier: 6, total: 17 },
        INT: { notation: "2d6+6", rolls: [1, 4], modifier: 6, total: 11 },
        POW: { notation: "3d6", rolls: [3, 5, 3], modifier: 0, total: 11 },
        DEX: { notation: "3d6", rolls: [5, 6, 1], modifier: 0, total: 12 },
        CHA: { notation: "3d6", rolls: [5, 6, 3], modifier: 0, total: 14 },
      },
      redistribution: [
        { from: "SIZ", to: "INT", points: 2 },
        { from: "CHA", to: "DEX", points: 1 },
      ],
    });

    expect(native.characteristics).toMatchObject({
      STR: { initial: 9, adjustments: [], final: 9 },
      CON: { initial: 11, adjustments: [], final: 11 },
      SIZ: {
        initial: 17,
        adjustments: [{ sourceId: BRP_STANDARD_REDISTRIBUTION_SOURCE_ID, amount: -2 }],
        final: 15,
      },
      INT: {
        initial: 11,
        adjustments: [{ sourceId: BRP_STANDARD_REDISTRIBUTION_SOURCE_ID, amount: 2 }],
        final: 13,
      },
      POW: { initial: 11, adjustments: [], final: 11 },
      DEX: {
        initial: 12,
        adjustments: [{ sourceId: BRP_STANDARD_REDISTRIBUTION_SOURCE_ID, amount: 1 }],
        final: 13,
      },
      CHA: {
        initial: 14,
        adjustments: [{ sourceId: BRP_STANDARD_REDISTRIBUTION_SOURCE_ID, amount: -1 }],
        final: 13,
      },
    });
    expect(native.skillBudgets.personal).toEqual({ total: 130, spent: 130 });
    expect(native.characteristicRolls.idea).toBe(65);
    expect(brpUge105Adapter.validateNativeState(state)).toEqual({ valid: true, issues: [] });
  });

  it("replays the same raw characteristic rolls from the same seed", () => {
    const first = generateBrpStandardRolledCharacteristics("brp-standard-roll-test");
    const second = generateBrpStandardRolledCharacteristics("brp-standard-roll-test");

    expect(second).toEqual(first);
    expect(first.initial).toEqual({
      STR: 9,
      CON: 11,
      SIZ: 17,
      INT: 11,
      POW: 11,
      DEX: 12,
      CHA: 14,
    });
  });

  it("enforces the standard up-to-three-point redistribution limit", () => {
    expect(() => generateBrpStandardRolledCharacteristics("brp-standard-roll-test", [
      { from: "SIZ", to: "INT", points: 2 },
      { from: "CHA", to: "DEX", points: 2 },
    ])).toThrow(/at most 3 points/);
  });

  it("detects tampered seed-derived dice independently of the builder", () => {
    const document = buildBrpStandardRolledFirstSliceCharacter(rolledInput());
    const state = structuredClone(document.nativeStates[0]);
    const native = state.payload as BrpNativeCharacter;
    if (native.characteristicGenerationState.method !== "standard-rolled") {
      throw new Error("Expected standard rolled generation state.");
    }
    native.characteristicGenerationState.rolls.STR.rolls[0] = 6;

    const validation = brpUge105Adapter.validateNativeState(state);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain("brp.characteristic-generation.rolls");
  });

  it("detects redistribution state that no longer matches the characteristic layers", () => {
    const document = buildBrpStandardRolledFirstSliceCharacter(rolledInput());
    const state = structuredClone(document.nativeStates[0]);
    const native = state.payload as BrpNativeCharacter;
    native.characteristics.INT.adjustments[0] = {
      sourceId: BRP_STANDARD_REDISTRIBUTION_SOURCE_ID,
      amount: 1,
    };

    const validation = brpUge105Adapter.validateNativeState(state);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain("brp.characteristics.redistribution");
  });

  it("round-trips rolled construction provenance without reconstructing native state", () => {
    const document = buildBrpStandardRolledFirstSliceCharacter(rolledInput());
    const parsed = parseCharacterDocument(JSON.parse(JSON.stringify(document)));

    expect(parsed).toEqual(document);
    expect(parsed?.nativeStates[0].payload).toEqual(document.nativeStates[0].payload);
    expect(parsed?.generation?.seed).toBe("brp-standard-roll-test");
  });
});
