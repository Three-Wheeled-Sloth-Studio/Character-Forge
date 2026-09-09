import { describe, expect, it } from "vitest";
import { parseCharacterDocument } from "../../character-model/src/index.js";
import {
  BRP_PSYCHIC_ABILITY_CATALOG,
  brpUge105Adapter,
  buildBrpPsychicFirstSliceCharacter,
  buildBrpPsychicStandardRolledFirstSliceCharacter,
  type BrpFirstSliceInput,
  type BrpPsychicNativeCharacter,
  type BrpPsychicStandardRolledFirstSliceInput,
} from "./index.js";

function heroicInput(): BrpFirstSliceInput {
  return {
    characterId: "character-psychic-1111-4222-8333-444444444444",
    nativeStateId: "native-brp-psychic-1111-4222-8333-444444444444",
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

function rolledInput(): BrpPsychicStandardRolledFirstSliceInput {
  return {
    characterId: "character-psychic-aaaa-4bbb-8ccc-dddddddddddd",
    nativeStateId: "native-brp-psychic-aaaa-4bbb-8ccc-dddddddddddd",
    displayName: "Casey North",
    age: 31,
    gender: "nonbinary",
    wealth: "average",
    seed: "brp-standard-roll-test",
    redistribution: [
      { from: "SIZ", to: "INT", points: 2 },
      { from: "CHA", to: "POW", points: 1 },
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
    psychicAbilities: {
      powerLevel: "normal",
      abilities: [
        { abilityId: "empathy", personalSkillPoints: 5, reallocateFromSkillKey: "stealth" },
        { abilityId: "mind-shield", personalSkillPoints: 5, reallocateFromSkillKey: "first-aid" },
      ],
    },
  };
}

function heroicPsychicCharacter() {
  return buildBrpPsychicFirstSliceCharacter({
    ...heroicInput(),
    psychicAbilities: {
      powerLevel: "normal",
      abilities: [
        { abilityId: "empathy", personalSkillPoints: 20, reallocateFromSkillKey: "stealth" },
        { abilityId: "mind-shield", personalSkillPoints: 10, reallocateFromSkillKey: "first-aid" },
      ],
    },
  });
}

describe("BRP UGE Psychic Abilities architecture slice", () => {
  it("keeps Heroic skill construction separate from a Normal Psychic Abilities profile", () => {
    const document = heroicPsychicCharacter();
    const native = document.nativeStates[0].payload as BrpPsychicNativeCharacter;

    expect(brpUge105Adapter.adapterVersion).toBe("0.7.0");
    expect(native.schemaVersion).toBe("brp-character/0.1");
    expect(native.rulesProfile.powerLevel).toBe("heroic");
    expect(native.rulesProfile.enabledPowerSystems).toEqual(["psychic-abilities"]);
    expect(native.skillBudgets.personal).toEqual({ total: 170, spent: 170 });
    expect(native.powerSystems).toEqual([{
      systemId: "psychic-abilities",
      powerLevel: "normal",
      personalSkillPointSpend: 30,
      abilities: [
        {
          abilityId: "empathy",
          label: "Empathy",
          baseRatingMethod: "pow-x1",
          baseRating: 14,
          personalSkillPoints: 20,
          finalRating: 34,
        },
        {
          abilityId: "mind-shield",
          label: "Mind Shield",
          baseRatingMethod: "pow-x1",
          baseRating: 14,
          personalSkillPoints: 10,
          finalRating: 24,
        },
      ],
    }]);

    const ordinaryPersonalSpend = native.skills.reduce(
      (sum, skill) => sum + skill.contributions.personal,
      0,
    );
    expect(ordinaryPersonalSpend).toBe(140);
    expect(ordinaryPersonalSpend + native.powerSystems[0]!.personalSkillPointSpend).toBe(170);
    expect(document.generation).toMatchObject({
      methodId: "brp-uge-first-slice-explicit+psychic-abilities",
      recipeVersion: "brp-uge-psychic-abilities/0.1",
      recipe: {
        powerLevel: "heroic",
        enabledPowerSystems: ["psychic-abilities"],
        psychicAbilities: {
          powerLevel: "normal",
          baseRatingMethod: "pow-x1",
        },
      },
    });
    expect(brpUge105Adapter.validateNativeState(document.nativeStates[0])).toEqual({ valid: true, issues: [] });
  });

  it("retains source-use metadata without turning Psychic Abilities into ordinary BRP skills", () => {
    expect(BRP_PSYCHIC_ABILITY_CATALOG.empathy).toMatchObject({
      label: "Empathy",
      rangeRule: "POW in meters",
      durationRule: "instantaneous",
      powerPointCost: { kind: "fixed", points: 1 },
    });
    expect(BRP_PSYCHIC_ABILITY_CATALOG["mind-shield"]).toMatchObject({
      label: "Mind Shield",
      rangeRule: "self",
      powerPointCost: { kind: "variable", minimum: 1 },
    });
  });

  it("uses final starting POW after standard-roll redistribution for the POW x 1 psychic base", () => {
    const document = buildBrpPsychicStandardRolledFirstSliceCharacter(rolledInput());
    const native = document.nativeStates[0].payload as BrpPsychicNativeCharacter;

    expect(native.characteristics.POW).toMatchObject({ initial: 11, final: 12 });
    expect(native.characteristics.INT).toMatchObject({ initial: 11, final: 13 });
    expect(native.powerSystems[0]!.abilities.map((ability) => ability.baseRating)).toEqual([12, 12]);
    expect(native.powerSystems[0]!.abilities.map((ability) => ability.finalRating)).toEqual([17, 17]);
    expect(native.skillBudgets.personal).toEqual({ total: 130, spent: 130 });
    expect(brpUge105Adapter.validateNativeState(document.nativeStates[0])).toEqual({ valid: true, issues: [] });
  });

  it("requires exactly two starting abilities for the bounded Normal psychic profile", () => {
    expect(() => buildBrpPsychicFirstSliceCharacter({
      ...heroicInput(),
      psychicAbilities: {
        powerLevel: "normal",
        abilities: [
          { abilityId: "empathy", personalSkillPoints: 10, reallocateFromSkillKey: "stealth" },
        ],
      },
    })).toThrow(/exactly two starting abilities/i);
  });

  it("applies the retained skill-construction cap to personal Psychic Ability training", () => {
    const input = heroicInput();
    input.powerLevel = "normal";
    delete input.defaultStartingAge;
    input.professionalAllocations = [
      { skillKey: "firearm:handgun", points: 35 },
      { skillKey: "knowledge:law", points: 45 },
      { skillKey: "listen", points: 35 },
      { skillKey: "persuade", points: 25 },
      { skillKey: "spot", points: 30 },
      { skillKey: "research", points: 35 },
      { skillKey: "science:forensics", points: 25 },
      { skillKey: "insight", points: 20 },
    ];
    input.personalAllocations = [
      { skillKey: "first-aid", points: 45 },
      { skillKey: "research", points: 20 },
      { skillKey: "spot", points: 20 },
      { skillKey: "science:forensics", points: 40 },
      { skillKey: "stealth", points: 40 },
      { skillKey: "track", points: 5 },
    ];

    expect(() => buildBrpPsychicFirstSliceCharacter({
      ...input,
      psychicAbilities: {
        powerLevel: "normal",
        abilities: [
          { abilityId: "empathy", personalSkillPoints: 62, reallocateFromSkillKey: "first-aid" },
          { abilityId: "mind-shield", personalSkillPoints: 0, reallocateFromSkillKey: "stealth" },
        ],
      },
    })).toThrow(/exceeds the Normal skill cap of 75/i);
  });

  it("rejects psychic training that cannot be reallocated from retained personal skill points", () => {
    expect(() => buildBrpPsychicFirstSliceCharacter({
      ...heroicInput(),
      psychicAbilities: {
        powerLevel: "normal",
        abilities: [
          { abilityId: "empathy", personalSkillPoints: 45, reallocateFromSkillKey: "stealth" },
          { abilityId: "mind-shield", personalSkillPoints: 10, reallocateFromSkillKey: "first-aid" },
        ],
      },
    })).toThrow(/allocation is too small or absent/i);
  });

  it("detects psychic base-rating and personal-pool tampering independently", () => {
    const document = heroicPsychicCharacter();
    const state = structuredClone(document.nativeStates[0]);
    const native = state.payload as BrpPsychicNativeCharacter;
    const empathy = native.powerSystems[0]!.abilities[0]!;
    empathy.baseRating = 13;
    empathy.personalSkillPoints = 21;
    empathy.finalRating = 35;
    native.powerSystems[0]!.personalSkillPointSpend = 31;

    const validation = brpUge105Adapter.validateNativeState(state);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain("brp.psychic.ability.base");
    expect(validation.issues.map((issue) => issue.code)).toContain("brp.psychic.personal-pool-causality");
  });

  it("round-trips Psychic Abilities native state and generation provenance losslessly", () => {
    const document = heroicPsychicCharacter();
    const parsed = parseCharacterDocument(JSON.parse(JSON.stringify(document)));

    expect(parsed).toEqual(document);
    expect(parsed?.nativeStates[0].payload).toEqual(document.nativeStates[0].payload);
    expect(parsed?.generation?.decisions.some(
      (decision) => decision.stepId === "powers.psychic-abilities.personal-skill-reallocation",
    )).toBe(true);
  });
});
