import { describe, expect, it } from "vitest";
import { parseCharacterDocument } from "../../character-model/src/index.js";
import {
  brpUge105Adapter,
  buildBrpFirstSliceCharacter,
  buildBrpStandardRolledFirstSliceCharacter,
  type BrpFirstSliceInput,
  type BrpNativeCharacter,
  type BrpStandardRolledFirstSliceInput,
} from "./index.js";

function heroicExplicitInput(): BrpFirstSliceInput {
  return {
    characterId: "character-heroic-1111-4222-8333-444444444444",
    nativeStateId: "native-brp-heroic-1111-4222-8333-444444444444",
    displayName: "Jordan Pike",
    age: 20,
    defaultStartingAge: 20,
    powerLevel: "heroic",
    gender: "man",
    wealth: "affluent",
    characteristics: {
      STR: 13,
      CON: 12,
      SIZ: 14,
      INT: 17,
      POW: 14,
      DEX: 14,
      CHA: 15,
    },
    detectiveElectiveSkillKeys: ["insight", "science:forensics", "stealth", "track"],
    professionalAllocations: [
      { skillKey: "firearm:handgun", points: 50 },
      { skillKey: "knowledge:law", points: 55 },
      { skillKey: "listen", points: 40 },
      { skillKey: "persuade", points: 45 },
      { skillKey: "spot", points: 40 },
      { skillKey: "research", points: 35 },
      { skillKey: "science:forensics", points: 30 },
      { skillKey: "insight", points: 30 },
    ],
    personalAllocations: [
      { skillKey: "first-aid", points: 50 },
      { skillKey: "research", points: 20 },
      { skillKey: "spot", points: 20 },
      { skillKey: "science:forensics", points: 40 },
      { skillKey: "stealth", points: 40 },
    ],
  };
}

function heroicRolledInput(): BrpStandardRolledFirstSliceInput {
  return {
    characterId: "character-heroic-aaaa-4bbb-8ccc-dddddddddddd",
    nativeStateId: "native-brp-heroic-aaaa-4bbb-8ccc-dddddddddddd",
    displayName: "Casey North",
    age: 20,
    defaultStartingAge: 20,
    powerLevel: "heroic",
    gender: "woman",
    wealth: "average",
    seed: "brp-standard-roll-test",
    redistribution: [
      { from: "SIZ", to: "INT", points: 2 },
      { from: "CHA", to: "DEX", points: 1 },
    ],
    detectiveElectiveSkillKeys: ["insight", "science:forensics", "stealth", "track"],
    professionalAllocations: [
      { skillKey: "firearm:handgun", points: 50 },
      { skillKey: "knowledge:law", points: 55 },
      { skillKey: "listen", points: 40 },
      { skillKey: "persuade", points: 45 },
      { skillKey: "spot", points: 40 },
      { skillKey: "research", points: 35 },
      { skillKey: "science:forensics", points: 30 },
      { skillKey: "insight", points: 30 },
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

describe("BRP UGE Heroic power-level profile", () => {
  it("builds and validates a non-powered Heroic Detective with the 325-point pool and 90 percent cap", () => {
    const input = heroicExplicitInput();
    input.professionalAllocations[0] = { skillKey: "firearm:handgun", points: 70 };
    input.professionalAllocations[1] = { skillKey: "knowledge:law", points: 35 };

    const document = buildBrpFirstSliceCharacter(input);
    const state = document.nativeStates[0];
    const native = state.payload as BrpNativeCharacter;
    const handgun = native.skills.find((skill) => skill.skillId === "firearm");

    expect(native.rulesProfile).toEqual({
      powerLevel: "heroic",
      characteristicGeneration: "explicit",
      enabledOptions: [],
      enabledPowerSystems: [],
    });
    expect(native.identity.ageBasis).toEqual({
      method: "default-starting-age",
      defaultStartingAge: 20,
      addedYears: 0,
      professionalSkillPointAdjustment: 0,
    });
    expect(native.skillBudgets).toEqual({
      professional: { total: 325, spent: 325 },
      personal: { total: 170, spent: 170 },
    });
    expect(handgun?.finalRating).toBe(90);
    expect(document.generation).toMatchObject({
      recipeVersion: "brp-uge-first-slice/0.3",
      recipe: {
        powerLevel: "heroic",
        characteristicGeneration: "explicit",
      },
    });
    expect(brpUge105Adapter.validateNativeState(state)).toEqual({ valid: true, issues: [] });
  });

  it("applies +20 professional points per full Heroic decade beyond the retained default starting age", () => {
    const input = heroicExplicitInput();
    input.age = 41;
    input.defaultStartingAge = 20;
    input.professionalAllocations.push({ skillKey: "stealth", points: 40 });

    const document = buildBrpFirstSliceCharacter(input);
    const native = document.nativeStates[0].payload as BrpNativeCharacter;

    expect(native.identity.ageBasis).toEqual({
      method: "default-starting-age",
      defaultStartingAge: 20,
      addedYears: 21,
      professionalSkillPointAdjustment: 40,
    });
    expect(native.skillBudgets.professional).toEqual({ total: 365, spent: 365 });
    expect(brpUge105Adapter.validateNativeState(document.nativeStates[0])).toEqual({ valid: true, issues: [] });
  });

  it("requires Heroic starting-age provenance and keeps below-starting-age characteristic penalties out of scope", () => {
    const missing = heroicExplicitInput();
    delete missing.defaultStartingAge;
    expect(() => buildBrpFirstSliceCharacter(missing)).toThrow(/default starting age/);

    const below = heroicExplicitInput();
    below.age = 19;
    below.defaultStartingAge = 20;
    expect(() => buildBrpFirstSliceCharacter(below)).toThrow(/must not be below the retained default starting age/);
  });

  it("supports Heroic standard-rolled characteristics through the same native schema and profile-aware builder", () => {
    const document = buildBrpStandardRolledFirstSliceCharacter(heroicRolledInput());
    const state = document.nativeStates[0];
    const native = state.payload as BrpNativeCharacter;

    expect(native.schemaVersion).toBe("brp-character/0.1");
    expect(native.rulesProfile.powerLevel).toBe("heroic");
    expect(native.rulesProfile.characteristicGeneration).toBe("standard-rolled");
    expect(native.skillBudgets.professional).toEqual({ total: 325, spent: 325 });
    expect(native.skillBudgets.personal).toEqual({ total: 130, spent: 130 });
    expect(document.generation?.seed).toBe("brp-standard-roll-test");
    expect(brpUge105Adapter.validateNativeState(state)).toEqual({ valid: true, issues: [] });
  });

  it("detects profile tampering that makes a Heroic budget and 90 percent skill illegal under Normal", () => {
    const input = heroicExplicitInput();
    input.professionalAllocations[0] = { skillKey: "firearm:handgun", points: 70 };
    input.professionalAllocations[1] = { skillKey: "knowledge:law", points: 35 };
    const document = buildBrpFirstSliceCharacter(input);
    const state = structuredClone(document.nativeStates[0]);
    const native = state.payload as BrpNativeCharacter;
    native.rulesProfile.powerLevel = "normal";

    const validation = brpUge105Adapter.validateNativeState(state);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain("brp.skill-budgets.professional");
    expect(validation.issues.map((issue) => issue.code)).toContain("brp.skills.cap");
  });

  it("detects tampering with retained Heroic age causality independently of stored budget totals", () => {
    const input = heroicExplicitInput();
    input.age = 41;
    input.professionalAllocations.push({ skillKey: "stealth", points: 40 });
    const document = buildBrpFirstSliceCharacter(input);
    const state = structuredClone(document.nativeStates[0]);
    const native = state.payload as BrpNativeCharacter;
    if (!native.identity.ageBasis) throw new Error("Expected Heroic age basis.");
    native.identity.ageBasis.professionalSkillPointAdjustment = 20;

    const validation = brpUge105Adapter.validateNativeState(state);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain("brp.identity.age-skill-adjustment");
  });

  it("round-trips Heroic power-level and age provenance without reconstruction", () => {
    const document = buildBrpFirstSliceCharacter(heroicExplicitInput());
    const parsed = parseCharacterDocument(JSON.parse(JSON.stringify(document)));

    expect(parsed).toEqual(document);
    expect(parsed?.nativeStates[0].payload).toEqual(document.nativeStates[0].payload);
    expect((parsed?.nativeStates[0].payload as BrpNativeCharacter).rulesProfile.powerLevel).toBe("heroic");
    expect((parsed?.nativeStates[0].payload as BrpNativeCharacter).identity.ageBasis?.defaultStartingAge).toBe(20);
  });
});
