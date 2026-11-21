import { describe, expect, it } from "vitest";
import { createCharacterDocument, type NativeSystemState } from "../../character-model/src/index.js";
import { projectUniversalCharacter } from "./projection.js";

function character(systemId: string, schemaVersion: string, payload: NativeSystemState["payload"]) {
  const native: NativeSystemState = { id: "native-1", systemId, editionId: "edition", rulesVersion: "rules-1", schemaVersion, payload, provenance: { origin: "generated" } };
  return createCharacterDocument({ characterId: "char-1", displayName: "Arden", primaryNativeStateId: native.id, nativeStates: [native] });
}

describe("provisional Universal Grammar projection", () => {
  it("projects D&D values as scale-specific observations without modifying the source", () => {
    const source = character("dnd5e", "dnd5e-character/0.3", { abilities: { final: { strength: 15, dexterity: 12 } }, class: { classId: "fighter" } });
    const before = JSON.stringify(source);
    const result = projectUniversalCharacter(source);
    expect(result.sourceNativeStateId).toBe("native-1");
    expect(result.mappings).toContainEqual(expect.objectContaining({ concept: "characteristic.measurement", nativePath: "abilities.final.strength", value: 15, kind: "contextual" }));
    expect(result.mappings).toHaveLength(3);
    expect(JSON.stringify(source)).toBe(before);
  });

  it("preserves BRP labels and explicitly refuses implied numeric equivalence", () => {
    const result = projectUniversalCharacter(character("brp", "brp-character/0.1", { characteristics: { STR: { initial: 12, adjustments: [], final: 13 }, POW: { initial: 14, adjustments: [], final: 14 } } }));
    expect(result.mappings).toContainEqual(expect.objectContaining({ nativePath: "characteristics.STR.final", nativeLabel: "STR", value: 13, kind: "contextual" }));
    expect(result.mappings[1]?.note).toContain("not comparable");
  });

  it("declares unsupported-system omissions rather than inventing mappings", () => {
    const result = projectUniversalCharacter(character("fate", "fate-character/0.1", { aspects: ["Curious"] }));
    expect(result.mappings).toHaveLength(1);
    expect(result.omissions[0]).toContain("No characteristic projection");
  });
});
