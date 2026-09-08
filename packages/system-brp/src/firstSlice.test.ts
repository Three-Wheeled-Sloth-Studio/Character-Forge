import { describe, expect, it } from "vitest";
import { parseCharacterDocument } from "../../character-model/src/index.js";
import {
  BRP_UGE_ORC_1_05_SOURCE,
  brpUge105Adapter,
  buildBrpFirstSliceCharacter,
  type BrpFirstSliceInput,
  type BrpNativeCharacter,
} from "./index.js";

function validInput(): BrpFirstSliceInput {
  return {
    characterId: "character-11111111-2222-4333-8444-555555555555",
    nativeStateId: "native-brp-11111111-2222-4333-8444-555555555555",
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

describe("BRP UGE first slice", () => {
  it("builds and independently validates a Normal non-powered Detective", () => {
    const document = buildBrpFirstSliceCharacter(validInput());
    const state = document.nativeStates[0];
    const native = state.payload as BrpNativeCharacter;

    expect(document.schemaVersion).toBe("character-document/0.1");
    expect(state.systemId).toBe("brp");
    expect(state.rulesVersion).toBe("1.05");
    expect(native.schemaVersion).toBe("brp-character/0.1");
    expect(native.rulesProfile).toEqual({
      powerLevel: "normal",
      characteristicGeneration: "explicit",
      enabledOptions: [],
      enabledPowerSystems: [],
    });
    expect(native.characteristicRolls).toEqual({
      effort: 65,
      stamina: 60,
      idea: 85,
      luck: 70,
      agility: 70,
      charisma: 75,
    });
    expect(native.derived).toEqual({
      hitPoints: 13,
      majorWoundLevel: 7,
      powerPoints: 14,
      experienceBonus: 9,
      move: 10,
      damageModifier: "+1D4",
    });
    expect(native.skillBudgets).toEqual({
      professional: { total: 250, spent: 250 },
      personal: { total: 170, spent: 170 },
    });

    const forensics = native.skills.find((skill) => skill.skillId === "science");
    expect(forensics).toMatchObject({
      specialty: { id: "forensics", label: "Forensics" },
      baseChance: 1,
      contributions: { professional: 25, personal: 30 },
      finalRating: 56,
    });

    const firstAid = native.skills.find((skill) => skill.skillId === "first-aid");
    expect(firstAid).toMatchObject({
      contributions: { professional: 0, personal: 40 },
      finalRating: 70,
    });

    expect(brpUge105Adapter.validateNativeState(state)).toEqual({ valid: true, issues: [] });
  });

  it("round-trips the BRP native payload through CharacterDocument JSON without reconstruction", () => {
    const document = buildBrpFirstSliceCharacter(validInput());
    const encoded = JSON.stringify(document);
    const parsed = parseCharacterDocument(JSON.parse(encoded));

    expect(parsed).not.toBeNull();
    expect(parsed).toEqual(document);
    expect(parsed?.nativeStates[0].payload).toEqual(document.nativeStates[0].payload);
  });

  it("keeps personal learning independent from Detective professional eligibility", () => {
    const input = validInput();
    input.professionalAllocations[0] = { skillKey: "first-aid", points: 35 };

    expect(() => buildBrpFirstSliceCharacter(input)).toThrow(/not available to the selected detective profile/i);
  });

  it("rejects a Normal starting skill above the 75 percent cap", () => {
    const input = validInput();
    input.personalAllocations = [
      { skillKey: "firearm:handgun", points: 40 },
      { skillKey: "first-aid", points: 50 },
      { skillKey: "science:forensics", points: 30 },
      { skillKey: "stealth", points: 50 },
    ];

    expect(() => buildBrpFirstSliceCharacter(input)).toThrow(/exceeds the Normal cap/);
  });

  it("detects tampering independently of the builder", () => {
    const document = buildBrpFirstSliceCharacter(validInput());
    const state = structuredClone(document.nativeStates[0]);
    const native = state.payload as BrpNativeCharacter;
    native.characteristicRolls.charisma = 70;
    const forensics = native.skills.find((skill) => skill.skillId === "science");
    if (!forensics) throw new Error("Expected Science (Forensics) fixture skill.");
    forensics.finalRating = 57;

    const validation = brpUge105Adapter.validateNativeState(state);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain("brp.characteristic-rolls.value");
    expect(validation.issues.map((issue) => issue.code)).toContain("brp.skills.final");
  });

  it("publishes the selected ORC source boundary in adapter metadata", () => {
    expect(brpUge105Adapter.supportedRulesSources).toEqual([BRP_UGE_ORC_1_05_SOURCE]);
    expect(BRP_UGE_ORC_1_05_SOURCE).toMatchObject({
      id: "chaosium-brp-uge-orc-1.05",
      systemId: "brp",
      editionId: "uge-2023",
      version: "1.05",
      license: { id: "ORC-1.0" },
    });
  });
});
