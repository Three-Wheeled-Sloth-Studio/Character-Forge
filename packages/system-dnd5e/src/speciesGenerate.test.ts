import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { defaultGuidedDnd5eCoreChoices } from "./guidedDefaults.js";
import { guidedGenerateDnd5eFirstSlice } from "./guidedGenerate.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";

const assignment = { strength: 15, dexterity: 14, constitution: 13, intelligence: 12, wisdom: 10, charisma: 8 };
const classChoice = { selectedId: "fighter" as const, acceptableIds: ["fighter"] as const, selectionMode: "direct" as const };
const backgroundChoice = { selectedId: "soldier" as const, acceptableIds: ["soldier"] as const, selectionMode: "direct" as const };

function buildSpecies(speciesId: "elf" | "gnome" | "tiefling", mutate?: (choices: ReturnType<typeof defaultGuidedDnd5eCoreChoices>) => void) {
  const choices = defaultGuidedDnd5eCoreChoices("fighter", "soldier", speciesId);
  mutate?.(choices);
  return guidedGenerateDnd5eFirstSlice({
    name: `${speciesId} test`,
    classChoice,
    backgroundChoice,
    speciesChoice: { selectedId: speciesId, acceptableIds: [speciesId], selectionMode: "direct" },
    coreChoices: choices,
    abilityMethod: { method: "standard-array", assignment },
    backgroundIncreases: { strength: 2, constitution: 1 },
    backgroundEquipmentChoice: "B:50-gp",
  });
}
function payload(character: ReturnType<typeof buildSpecies>): Dnd5eNativeCharacter { return character.nativeStates[0]!.payload as Dnd5eNativeCharacter; }
function expectValid(character: ReturnType<typeof buildSpecies>): void {
  const validation = dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!);
  expect(validation.valid, validation.issues.map((issue) => `${issue.code}: ${issue.message}`).join(" | ")).toBe(true);
}

describe("SRD 5.2.1 lineage species", () => {
  it("retains High Elf lineage, Keen Senses, replaceable Wizard cantrip, and future spells", () => {
    const character = buildSpecies("elf");
    expectValid(character);
    const p = payload(character);
    expect(p.origin).toEqual(expect.objectContaining({ speciesAncestryId: "high", speciesDarkvisionFeet: 60, speedFeet: 30 }));
    expect(["insight", "perception", "survival"]).toContain(p.origin.speciesSkillId);
    expect(p.spells?.speciesGrants?.[0]).toEqual(expect.objectContaining({
      sourceSpeciesId: "elf",
      lineageId: "high",
      spellcastingAbilityId: "intelligence",
      cantripIds: ["prestidigitation"],
      cantripReplacementListId: "wizard",
      cantripReplacementRecharge: "long-rest",
    }));
    expect(p.spells?.speciesGrants?.[0]?.futureSpellGrants).toEqual([
      expect.objectContaining({ characterLevel: 3, spellId: "detect-magic", alwaysPrepared: true, freeCastMaximum: 1 }),
      expect.objectContaining({ characterLevel: 5, spellId: "misty-step", alwaysPrepared: true, freeCastMaximum: 1 }),
    ]);
  });

  it("retains Drow and Wood Elf lineage-specific Darkvision, Speed, and grants", () => {
    const drow = buildSpecies("elf", (choices) => { choices.elf = { lineageId: "drow", spellcastingAbilityId: "charisma", keenSensesSkillId: "perception" }; });
    expectValid(drow);
    expect(payload(drow).origin.speciesDarkvisionFeet).toBe(120);
    expect(payload(drow).spells?.speciesGrants?.[0]?.cantripIds).toEqual(["dancing-lights"]);
    expect(payload(drow).spells?.speciesGrants?.[0]?.futureSpellGrants.map((grant) => grant.spellId)).toEqual(["faerie-fire", "darkness"]);

    const wood = buildSpecies("elf", (choices) => { choices.elf = { lineageId: "wood", spellcastingAbilityId: "wisdom", keenSensesSkillId: "survival" }; });
    expectValid(wood);
    expect(payload(wood).origin.speedFeet).toBe(35);
    expect(payload(wood).spells?.speciesGrants?.[0]?.cantripIds).toEqual(["druidcraft"]);
    expect(payload(wood).spells?.speciesGrants?.[0]?.futureSpellGrants.map((grant) => grant.spellId)).toEqual(["longstrider", "pass-without-trace"]);
  });

  it("retains Forest Gnome free Speak with Animals uses at proficiency bonus", () => {
    const character = buildSpecies("gnome");
    expectValid(character);
    const p = payload(character);
    expect(p.origin).toEqual(expect.objectContaining({ size: "small", speedFeet: 30, speciesDarkvisionFeet: 60, speciesAncestryId: "forest" }));
    expect(p.spells?.speciesGrants?.[0]).toEqual(expect.objectContaining({ cantripIds: ["minor-illusion"], preparedSpellIds: ["speak-with-animals"], alwaysPreparedSpellIds: ["speak-with-animals"] }));
    expect(p.spells?.speciesGrants?.[0]?.freeCasts).toEqual([{ spellId: "speak-with-animals", maximum: 2, current: 2, recharge: "long-rest" }]);
  });

  it("retains Rock Gnome cantrips and three-device clockwork capacity", () => {
    const character = buildSpecies("gnome", (choices) => { choices.gnome = { lineageId: "rock", spellcastingAbilityId: "intelligence" }; });
    expectValid(character);
    const p = payload(character);
    expect(p.spells?.speciesGrants?.[0]?.cantripIds).toEqual(["mending", "prestidigitation"]);
    expect(p.resources.rockGnomeClockworkDevicesMaximum).toBe(3);
    expect(p.resources.rockGnomeClockworkDevicesCurrent).toBe(0);
  });

  it("retains all three Tiefling legacies, their resistance, cantrips, future spells, and size choice", () => {
    const cases = [
      ["abyssal", "poison", "poison-spray", ["ray-of-sickness", "hold-person"]],
      ["chthonic", "necrotic", "chill-touch", ["false-life", "ray-of-enfeeblement"]],
      ["infernal", "fire", "fire-bolt", ["hellish-rebuke", "darkness"]],
    ] as const;
    for (const [legacyId, resistance, cantrip, future] of cases) {
      const character = buildSpecies("tiefling", (choices) => { choices.tiefling = { size: "small", legacyId, spellcastingAbilityId: "charisma" }; });
      expectValid(character);
      const p = payload(character);
      expect(p.origin).toEqual(expect.objectContaining({ size: "small", speciesAncestryId: legacyId, speciesResistanceDamageType: resistance, speciesDarkvisionFeet: 60 }));
      expect(p.spells?.speciesGrants?.[0]?.cantripIds).toEqual([cantrip, "thaumaturgy"]);
      expect(p.spells?.speciesGrants?.[0]?.futureSpellGrants.map((grant) => grant.spellId)).toEqual([...future]);
    }
  });

  it("rejects tampered future lineage spell semantics", () => {
    const character = buildSpecies("tiefling");
    const native = JSON.parse(JSON.stringify(character.nativeStates[0]!)) as typeof character.nativeStates[0];
    const p = native.payload as Dnd5eNativeCharacter;
    p.spells!.speciesGrants![0]!.futureSpellGrants[0]!.spellId = "magic-missile";
    const result = dnd5eSrd521Adapter.validateNativeState(native);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("dnd5e.tiefling.future-spells");
  });

  it("rejects Rock Gnome clockwork state above the SRD three-device capacity", () => {
    const character = buildSpecies("gnome", (choices) => { choices.gnome = { lineageId: "rock", spellcastingAbilityId: "wisdom" }; });
    const native = JSON.parse(JSON.stringify(character.nativeStates[0]!)) as typeof character.nativeStates[0];
    const p = native.payload as Dnd5eNativeCharacter;
    p.resources.rockGnomeClockworkDevicesMaximum = 4;
    const result = dnd5eSrd521Adapter.validateNativeState(native);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("dnd5e.gnome.clockwork");
  });
});
