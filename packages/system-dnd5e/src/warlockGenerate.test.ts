import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { defaultGuidedDnd5eCoreChoices } from "./guidedDefaults.js";
import { guidedGenerateDnd5eFirstSlice } from "./guidedGenerate.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";

const dwarfChoice = { selectedId: "dwarf" as const, acceptableIds: ["dwarf"] as const, selectionMode: "direct" as const };
const criminalChoice = { selectedId: "criminal" as const, acceptableIds: ["criminal"] as const, selectionMode: "direct" as const };
const assignment = { strength: 8, dexterity: 14, constitution: 13, intelligence: 12, wisdom: 10, charisma: 15 };

function warlockCharacter(invocationId: "armor-of-shadows" | "eldritch-mind" | "pact-of-the-blade" | "pact-of-the-chain" | "pact-of-the-tome" = "pact-of-the-tome") {
  const core = defaultGuidedDnd5eCoreChoices("warlock", "criminal", "dwarf");
  core.warlock = invocationId === "pact-of-the-tome"
    ? { invocationId, pactTomeCantripIds: ["guidance", "sacred-flame", "vicious-mockery"], pactTomeRitualSpellIds: ["detect-magic", "find-familiar"] }
    : { invocationId };
  return guidedGenerateDnd5eFirstSlice({
    name: `Warlock ${invocationId}`,
    classChoice: { selectedId: "warlock", acceptableIds: ["warlock"], selectionMode: "direct" },
    backgroundChoice: criminalChoice,
    speciesChoice: dwarfChoice,
    coreChoices: core,
    abilityMethod: { method: "standard-array", assignment },
    backgroundIncreases: { dexterity: 2, constitution: 1 },
    backgroundEquipmentChoice: "B:50-gp",
  });
}

function payload(character = warlockCharacter()): Dnd5eNativeCharacter {
  return character.nativeStates[0]!.payload as Dnd5eNativeCharacter;
}

describe("guided Level 1 Warlock", () => {
  it("retains Pact Magic as one short-or-long-rest slot rather than standard class slots", () => {
    const character = warlockCharacter();
    const result = dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!);
    expect(result.valid, result.issues.map((issue) => issue.message).join(" | ")).toBe(true);
    const casting = payload(character).spells?.classCasting?.[0];
    expect(casting).toEqual(expect.objectContaining({
      sourceClassId: "warlock",
      featureId: "warlock:pact-magic",
      spellcastingAbilityId: "charisma",
      castingMode: "pact-magic",
      cantripIds: ["eldritch-blast", "prestidigitation"],
      preparedSpellIds: ["charm-person", "hex"],
    }));
    expect(casting?.spellSlots).toEqual([{ level: 1, maximum: 1, current: 1, recharge: "short-or-long-rest" }]);
  });

  it("retains Pact of the Tome Book of Shadows selections explicitly", () => {
    const p = payload();
    expect(p.class.eldritchInvocations).toEqual([{
      invocationId: "pact-of-the-tome",
      pactTomeCantripIds: ["guidance", "sacred-flame", "vicious-mockery"],
      pactTomeRitualSpellIds: ["detect-magic", "find-familiar"],
    }]);
  });

  it("accepts every genuinely Level 1 legal invocation without inventing use-time choices", () => {
    for (const invocationId of ["armor-of-shadows", "eldritch-mind", "pact-of-the-blade", "pact-of-the-chain", "pact-of-the-tome"] as const) {
      const character = warlockCharacter(invocationId);
      const result = dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!);
      expect(result.valid, `${invocationId}: ${result.issues.map((issue) => issue.message).join(" | ")}`).toBe(true);
      expect((character.nativeStates[0]!.payload as Dnd5eNativeCharacter).class.eldritchInvocations?.[0]?.invocationId).toBe(invocationId);
    }
  });

  it("rejects standard-slot semantics substituted for Pact Magic", () => {
    const character = warlockCharacter();
    const nativeState = JSON.parse(JSON.stringify(character.nativeStates[0]!)) as typeof character.nativeStates[0];
    const p = nativeState.payload as Dnd5eNativeCharacter;
    p.spells!.classCasting![0]!.spellSlots = [{ level: 1, maximum: 2, current: 2, recharge: "long-rest" }];
    const result = dnd5eSrd521Adapter.validateNativeState(nativeState);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("dnd5e.warlock.pact-slots");
  });

  it("rejects an invocation that is not legal at Level 1", () => {
    const character = warlockCharacter("eldritch-mind");
    const nativeState = JSON.parse(JSON.stringify(character.nativeStates[0]!)) as typeof character.nativeStates[0];
    const p = nativeState.payload as Dnd5eNativeCharacter;
    p.class.eldritchInvocations![0]!.invocationId = "agonizing-blast";
    const result = dnd5eSrd521Adapter.validateNativeState(nativeState);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("dnd5e.warlock.invocation");
  });

  it("rejects a Pact of the Tome ritual duplicated in base prepared spells", () => {
    const character = warlockCharacter();
    const nativeState = JSON.parse(JSON.stringify(character.nativeStates[0]!)) as typeof character.nativeStates[0];
    const p = nativeState.payload as Dnd5eNativeCharacter;
    p.class.eldritchInvocations![0]!.pactTomeRitualSpellIds = ["comprehend-languages", "find-familiar"];
    p.spells!.classCasting![0]!.preparedSpellIds = ["comprehend-languages", "hex"];
    const result = dnd5eSrd521Adapter.validateNativeState(nativeState);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("dnd5e.warlock.tome-duplicate-prepared");
  });
});
