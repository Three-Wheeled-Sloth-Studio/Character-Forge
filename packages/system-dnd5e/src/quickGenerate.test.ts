import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { quickGenerateDnd5eFirstSlice } from "./quickGenerate.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";

describe("D&D 5E first-slice quick generation", () => {
  it("is deterministic when given the same seed", () => {
    const first = quickGenerateDnd5eFirstSlice({ seed: "deterministic-1" });
    const second = quickGenerateDnd5eFirstSlice({ seed: "deterministic-1" });

    expect(second).toEqual(first);
  });

  it("produces a native character that passes the D&D adapter", () => {
    const character = quickGenerateDnd5eFirstSlice({ seed: "legal-character" });

    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0])).toEqual({
      valid: true,
      issues: [],
    });
    expect(character.generation?.mode).toBe("quick");
    expect(character.generation?.seed).toBe("legal-character");
  });

  it("preserves an explicit character name in both shared and native state", () => {
    const character = quickGenerateDnd5eFirstSlice({ name: "Nyx Calder", seed: "named" });
    const payload = character.nativeStates[0].payload as Dnd5eNativeCharacter;

    expect(character.displayName).toBe("Nyx Calder");
    expect(payload.identity.name).toBe("Nyx Calder");
    expect(character.characterId).toContain("nyx-calder");
  });
});
