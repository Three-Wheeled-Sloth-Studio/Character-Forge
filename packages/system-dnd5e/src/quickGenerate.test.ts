import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { quickGenerateDnd5eFirstSlice } from "./quickGenerate.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";

describe("D&D 5E first-slice quick generation", () => {
  it("keeps seeded mechanics deterministic while assigning new opaque identities", () => {
    const first = quickGenerateDnd5eFirstSlice({ seed: "deterministic-1" });
    const second = quickGenerateDnd5eFirstSlice({ seed: "deterministic-1" });

    expect(withoutIdentity(second)).toEqual(withoutIdentity(first));
    expect(second.characterId).not.toBe(first.characterId);
    expect(second.primaryNativeStateId).not.toBe(first.primaryNativeStateId);
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

  it("keeps display names independent from opaque character and native-state IDs", () => {
    const character = quickGenerateDnd5eFirstSlice({ name: "Nyx Calder", seed: "named" });
    const payload = character.nativeStates[0].payload as Dnd5eNativeCharacter;

    expect(character.displayName).toBe("Nyx Calder");
    expect(payload.identity.name).toBe("Nyx Calder");
    expect(character.characterId).toMatch(/^character_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(character.primaryNativeStateId).toMatch(/^native_state_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(character.characterId).not.toContain("nyx");
  });
});

function withoutIdentity(character: ReturnType<typeof quickGenerateDnd5eFirstSlice>) {
  return {
    ...character,
    characterId: "character_test",
    primaryNativeStateId: "native_state_test",
    nativeStates: character.nativeStates.map((state) => ({
      ...state,
      id: state.id === character.primaryNativeStateId ? "native_state_test" : state.id,
    })),
  };
}
