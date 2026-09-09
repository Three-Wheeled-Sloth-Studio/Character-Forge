import { describe, expect, it } from "vitest";
import { parseCharacterDocument } from "../../character-model/src/index.js";
import {
  brpUge105Adapter,
  buildBrpFirstSliceCharacter,
  buildBrpPoweredFirstSliceCharacter,
  buildBrpPoweredStandardRolledFirstSliceCharacter,
  type BrpFirstSliceInput,
  type BrpPoweredNativeCharacter,
  type BrpPoweredStandardRolledFirstSliceInput,
} from "./index.js";

function explicitInput(): BrpFirstSliceInput {
  return {
    characterId: "character-powered-1111-4222-8333-444444444444",
    nativeStateId: "native-brp-powered-1111-4222-8333-444444444444",
    displayName: "Morgan Vale",
    age: 33,
    gender: "woman",
    wealth: "average",
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
      { skillKey: "first-aid", points: 40 },
      { skillKey: "research", points: 15 },
      { skillKey: "spot", points: 20 },
      { skillKey: "science:forensics", points: 30 },
      { skillKey: "stealth", points: 50 },
      { skillKey: "track", points: 15 },
    ],
  };
}

function rolledInput(): BrpPoweredStandardRolledFirstSliceInput {
  return {
    characterId: "character-powered-aaaa-4bbb-8ccc-dddddddddddd",
    nativeStateId: "native-brp-powered-aaaa-4bbb-8ccc-dddddddddddd",
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
    superpowers: {
      powerLevel: "normal",
      powers: [
        { powerId: "extra-energy", levels: 2 },
        { powerId: "extra-hit-points", levels: 3 },
      ],
    },
  };
}

describe("BRP UGE Superpowers architecture slice", () => {
  it("keeps the existing Normal skill profile independent from a Heroic Superpowers profile", () => {
    const document = buildBrpPoweredFirstSliceCharacter({
      ...explicitInput(),
      superpowers: {
        powerLevel: "heroic",
        powers: [
          { powerId: "extra-energy", levels: 2 },
          { powerId: "extra-hit-points", levels: 3 },
        ],
      },
    });
    const native = document.nativeStates[0].payload as BrpPoweredNativeCharacter;

    expect(native.schemaVersion).toBe("brp-character/0.1");
    expect(native.rulesProfile.powerLevel).toBe("normal");
    expect(native.rulesProfile.enabledPowerSystems).toEqual(["superpowers"]);
    expect(native.powerSystems).toEqual([{
      systemId: "superpowers",
      powerLevel: "heroic",
      characterPointBudget: {
        method: "highest-characteristic",
        highestCharacteristicValue: 17,
        total: 17,
        spent: 5,
        remaining: 12,
      },
      powers: [
        { powerId: "extra-energy", levels: 2, characterPointCost: 2 },
        { powerId: "extra-hit-points", levels: 3, characterPointCost: 3 },
      ],
    }]);
    expect(native.skillBudgets.professional).toEqual({ total: 250, spent: 250 });
    expect(native.derived).toMatchObject({
      hitPoints: 16,
      majorWoundLevel: 8,
      powerPoints: 34,
    });
    expect(document.generation).toMatchObject({
      methodId: "brp-uge-first-slice-explicit+superpowers",
      recipeVersion: "brp-uge-superpowers/0.1",
      recipe: {
        powerLevel: "normal",
        enabledPowerSystems: ["superpowers"],
        superpowers: {
          powerLevel: "heroic",
          budgetMethod: "highest-characteristic",
        },
      },
    });
    expect(brpUge105Adapter.validateNativeState(document.nativeStates[0])).toEqual({ valid: true, issues: [] });
  });

  it("keeps existing non-powered brp-character/0.1 documents valid under adapter 0.6", () => {
    const document = buildBrpFirstSliceCharacter(explicitInput());

    expect(brpUge105Adapter.adapterVersion).toBe("0.6.0");
    expect(brpUge105Adapter.validateNativeState(document.nativeStates[0])).toEqual({ valid: true, issues: [] });
  });

  it("calculates rolled Superpowers budget from initial characteristics before redistribution", () => {
    const document = buildBrpPoweredStandardRolledFirstSliceCharacter(rolledInput());
    const native = document.nativeStates[0].payload as BrpPoweredNativeCharacter;
    const superpowers = native.powerSystems[0];

    expect(native.characteristics.SIZ).toMatchObject({ initial: 17, final: 15 });
    expect(superpowers?.characterPointBudget).toEqual({
      method: "highest-characteristic",
      highestCharacteristicValue: 17,
      total: 9,
      spent: 5,
      remaining: 4,
    });
    expect(brpUge105Adapter.validateNativeState(document.nativeStates[0])).toEqual({ valid: true, issues: [] });
  });

  it("rejects Superpowers selections that overspend the source character-point budget", () => {
    expect(() => buildBrpPoweredFirstSliceCharacter({
      ...explicitInput(),
      superpowers: {
        powerLevel: "normal",
        powers: [{ powerId: "extra-energy", levels: 10 }],
      },
    })).toThrow(/spend 10 character points.*budget is 9/i);
  });

  it("enforces the current source limit on Extra Hit Points against initial CON", () => {
    expect(() => buildBrpPoweredFirstSliceCharacter({
      ...explicitInput(),
      superpowers: {
        powerLevel: "heroic",
        powers: [{ powerId: "extra-hit-points", levels: 13 }],
      },
    })).toThrow(/may not exceed.*initial CON/i);
  });

  it("detects Superpowers budget, cost, and powered-derived tampering independently", () => {
    const document = buildBrpPoweredFirstSliceCharacter({
      ...explicitInput(),
      superpowers: {
        powerLevel: "heroic",
        powers: [
          { powerId: "extra-energy", levels: 2 },
          { powerId: "extra-hit-points", levels: 3 },
        ],
      },
    });
    const state = structuredClone(document.nativeStates[0]);
    const native = state.payload as BrpPoweredNativeCharacter;
    native.powerSystems[0]!.characterPointBudget.total = 16;
    native.powerSystems[0]!.powers[0]!.characterPointCost = 3;
    native.derived.powerPoints = 33;

    const validation = brpUge105Adapter.validateNativeState(state);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain("brp.superpowers.budget.total");
    expect(validation.issues.map((issue) => issue.code)).toContain("brp.superpowers.power.cost");
    expect(validation.issues.map((issue) => issue.code)).toContain("brp.derived.powered-value");
  });

  it("round-trips powered native state and generation provenance without semantic reconstruction", () => {
    const document = buildBrpPoweredFirstSliceCharacter({
      ...explicitInput(),
      superpowers: {
        powerLevel: "heroic",
        powers: [
          { powerId: "extra-energy", levels: 1 },
          { powerId: "extra-hit-points", levels: 2 },
        ],
      },
    });
    const parsed = parseCharacterDocument(JSON.parse(JSON.stringify(document)));

    expect(parsed).toEqual(document);
    expect(parsed?.nativeStates[0].payload).toEqual(document.nativeStates[0].payload);
    expect(parsed?.generation?.decisions.some((decision) => decision.stepId === "powers.superpowers.selection")).toBe(true);
  });
});
