import { describe, expect, it } from "vitest";
import { createCharacterLifecycle, parseCharacterDocument } from "../../character-model/src/index.js";
import { applyBrpSkillExperience, brpUge105Adapter, buildBrpFirstSliceCharacter, type BrpFirstSliceInput, type BrpNativeCharacter } from "./index.js";

const at = "2026-11-21T19:00:00.000Z";
function character() {
  const input: BrpFirstSliceInput = {
    characterId: "brp-character-1", nativeStateId: "brp-native-1", displayName: "Morgan Vale", age: 33,
    gender: "woman", wealth: "average",
    characteristics: { STR: 13, CON: 12, SIZ: 14, INT: 17, POW: 14, DEX: 14, CHA: 15 },
    detectiveElectiveSkillKeys: ["insight", "science:forensics", "stealth", "track"],
    professionalAllocations: [
      { skillKey: "firearm:handgun", points: 35 }, { skillKey: "knowledge:law", points: 45 },
      { skillKey: "listen", points: 35 }, { skillKey: "persuade", points: 25 },
      { skillKey: "spot", points: 30 }, { skillKey: "research", points: 35 },
      { skillKey: "science:forensics", points: 25 }, { skillKey: "insight", points: 20 },
    ],
    personalAllocations: [
      { skillKey: "first-aid", points: 40 }, { skillKey: "research", points: 15 },
      { skillKey: "spot", points: 20 }, { skillKey: "science:forensics", points: 30 },
      { skillKey: "stealth", points: 50 }, { skillKey: "track", points: 15 },
    ],
  };
  return buildBrpFirstSliceCharacter(input);
}

function input(roll: number, id = "exp-1", adventureId = "adventure-1") {
  return {
    skillId: "research", specialtyId: null, adventureId, experienceEventId: id,
    revisionEventId: `revision-${id}`, resultingNativeStateId: `brp-native-${id}`,
    occurredAt: at, significantUseDescription: "Researched the cult under pressure",
    gmApproved: true as const, percentileRoll: roll, improvement: { method: "fixed-3" as const },
  };
}

describe("BRP skill experience and native-state progression", () => {
  it("retains original point allocations while applying a successful source-owned experience check", () => {
    const before = character();
    const lifecycle = createCharacterLifecycle(before.characterId);
    const result = applyBrpSkillExperience(before, lifecycle, input(99));
    const original = before.nativeStates[0]!.payload as BrpNativeCharacter;
    const revised = result.document.nativeStates[1]!.payload as BrpNativeCharacter;
    expect(result).toMatchObject({ succeeded: true, increase: 3 });
    expect(revised.skills.find((skill) => skill.skillId === "research")?.finalRating).toBe(78);
    expect(revised.skills.find((skill) => skill.skillId === "research")?.contributions).toEqual(original.skills.find((skill) => skill.skillId === "research")?.contributions);
    expect(original.skills.find((skill) => skill.skillId === "research")?.experienceChecks).toBeUndefined();
    expect(brpUge105Adapter.validateNativeState(result.document.nativeStates[1]!).valid).toBe(true);
    expect(result.lifecycle.events.map((event) => event.type)).toEqual(["experience-recorded", "experience-revision-linked"]);
    expect(parseCharacterDocument(JSON.parse(JSON.stringify(result.document)))).toEqual(result.document);
  });

  it("records failed checks with zero improvement and retains their causality", () => {
    const before = character();
    const result = applyBrpSkillExperience(before, createCharacterLifecycle(before.characterId), input(1));
    expect(result.succeeded).toBe(false);
    expect(result.increase).toBe(0);
    const skill = (result.document.nativeStates[1]!.payload as BrpNativeCharacter).skills.find((entry) => entry.skillId === "research")!;
    expect(skill.finalRating).toBe(75);
    expect(skill.experienceChecks?.[0]).toMatchObject({ improvementMethod: "none", increase: 0 });
  });

  it("rejects a second experience check for the same skill and adventure", () => {
    const first = applyBrpSkillExperience(character(), createCharacterLifecycle("brp-character-1"), input(99));
    expect(() => applyBrpSkillExperience(first.document, first.lifecycle, input(96, "exp-2"))).toThrow(/one experience check/i);
  });

  it("rejects tampering with recorded roll, gain, or source-causal rating", () => {
    const first = applyBrpSkillExperience(character(), createCharacterLifecycle("brp-character-1"), input(99));
    const state = structuredClone(first.document.nativeStates[1]!);
    const skill = (state.payload as BrpNativeCharacter).skills.find((entry) => entry.skillId === "research")!;
    skill.experienceChecks![0]!.increase = 8;
    expect(brpUge105Adapter.validateNativeState(state).valid).toBe(false);
    skill.experienceChecks![0]!.increase = 3;
    skill.finalRating = 80;
    expect(brpUge105Adapter.validateNativeState(state).valid).toBe(false);
  });

  it("keeps source identity, GM approval, and dice bounds explicit", () => {
    expect(() => applyBrpSkillExperience(character(), createCharacterLifecycle("another-character"), input(99))).toThrow(/identity mismatch/i);
    expect(() => applyBrpSkillExperience(character(), createCharacterLifecycle("brp-character-1"), input(101))).toThrow(/1-100/i);
    expect(() => applyBrpSkillExperience(character(), createCharacterLifecycle("brp-character-1"), { ...input(99), gmApproved: false as true })).toThrow(/GM-approved/i);
  });

  it("supports recorded 1D6 gains and earned advancement beyond 100 without reapplying starting caps", () => {
    let document = character();
    let lifecycle = createCharacterLifecycle(document.characterId);
    for (let i = 0; i < 9; i += 1) {
      const result = applyBrpSkillExperience(document, lifecycle, {
        ...input(100, `experience-${i}`, `adventure-${i}`),
        improvement: { method: "roll-1d6", die: 4 },
      });
      document = result.document;
      lifecycle = result.lifecycle;
      expect(result.succeeded).toBe(true);
    }
    const skill = (document.nativeStates.at(-1)!.payload as BrpNativeCharacter).skills.find((entry) => entry.skillId === "research")!;
    expect(skill.finalRating).toBe(111);
    expect(brpUge105Adapter.validateNativeState(document.nativeStates.at(-1)!).valid).toBe(true);
  });
});
