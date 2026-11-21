import { describe, expect, it } from "vitest";
import { parseCharacterDocument } from "../../character-model/src/index.js";
import { projectUniversalCharacter } from "../../semantic-model/src/index.js";
import { createFateProbeCharacter, fateCondensedProbeAdapter, type FateProbeCreationInput } from "./index.js";

function input(): FateProbeCreationInput {
  return {
    characterId: "fate-character-1", nativeStateId: "fate-native-1", displayName: "Rowan",
    highConcept: "Reluctant skyship captain", trouble: "My promises always find me",
    relationship: "I owe the navigator my life", freeAspects: ["Knows every smuggler", "The old ship remembers"],
    skills: ["notice", "physique", "rapport", "will", "crafts", "drive", "fight", "lore", "stealth", "investigate"].map((skillId, i) => ({ skillId, rating: i === 0 ? 4 : i < 3 ? 3 : i < 6 ? 2 : 1 })),
    stunts: [{ id: "shipwise", text: "Can spot a failing engine before it breaks, but only aboard familiar vessels." }],
  };
}

describe("Fate Condensed third-system architecture probe", () => {
  it("creates, validates and JSON-round-trips native freeform choices", () => {
    const document = createFateProbeCharacter(input());
    expect(fateCondensedProbeAdapter.validateNativeState(document.nativeStates[0])).toEqual({ valid: true, issues: [] });
    expect(parseCharacterDocument(JSON.parse(JSON.stringify(document)))).toEqual(document);
    expect((document.nativeStates[0].payload as { stunts: { text: string }[] }).stunts[0]?.text).toContain("failing engine");
    expect(document.generation?.decisions).toHaveLength(6);
  });

  it("retains stress and consequence state without misidentifying it as hit points", () => {
    const document = createFateProbeCharacter(input());
    const native = document.nativeStates[0].payload as { stress: { physical: { boxes: boolean[] }; mental: { boxes: boolean[] } }; consequences: { severity: string; text: string | null }[] };
    expect(native.stress.physical.boxes).toHaveLength(6);
    expect(native.stress.mental.boxes).toHaveLength(4);
    const edited = structuredClone(document.nativeStates[0]);
    const payload = edited.payload as typeof native;
    payload.stress.mental.boxes[0] = true;
    payload.consequences[0]!.text = "Shaken by the impossible";
    expect(fateCondensedProbeAdapter.validateNativeState(edited).valid).toBe(true);
    const projection = projectUniversalCharacter(document);
    expect(projection.mappings).toHaveLength(1);
    expect(projection.omissions[0]).toContain("No characteristic projection");
  });

  it("rejects tampered skill pyramids and incomplete mechanically authoritative aspects", () => {
    const document = createFateProbeCharacter(input());
    const bad = structuredClone(document.nativeStates[0]);
    const p = bad.payload as { skills: { rating: number }[]; aspects: { text: string }[] };
    p.skills[0]!.rating = 2;
    p.aspects[1]!.text = "";
    const result = fateCondensedProbeAdapter.validateNativeState(bad);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(["fate.skills", "fate.aspects"]));
  });

  it("requires explicit narrative choices rather than silently defaulting them", () => {
    expect(() => createFateProbeCharacter({ ...input(), trouble: "" })).toThrow(/Aspects/i);
  });
});
