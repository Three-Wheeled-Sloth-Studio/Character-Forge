import { describe, expect, it } from "vitest";
import {
  createCharacterDocument,
  type NativeSystemState,
} from "./characterDocument.js";

const dndNativeState: NativeSystemState = {
  id: "native-dnd5e-primary",
  systemId: "dnd5e",
  editionId: "2024",
  rulesVersion: "srd-5.2.1",
  schemaVersion: "prototype/1",
  payload: {
    abilities: { strength: 15, dexterity: 12 },
    class: { id: "fighter", level: 1 },
    sourceSpecificField: {
      preserveMeExactly: true,
      nested: [1, 2, { three: 3 }],
    },
  },
  provenance: {
    origin: "generated",
    sourceId: "test-fixture",
  },
};

describe("CharacterDocument", () => {
  it("requires at least one complete native system state", () => {
    expect(() =>
      createCharacterDocument({
        characterId: "character-1",
        displayName: "Test Character",
        primaryNativeStateId: "missing",
        nativeStates: [],
      }),
    ).toThrow("requires at least one native system state");
  });

  it("requires the primary native state to remain present", () => {
    expect(() =>
      createCharacterDocument({
        characterId: "character-1",
        displayName: "Test Character",
        primaryNativeStateId: "missing",
        nativeStates: [dndNativeState],
      }),
    ).toThrow("must reference a retained native system state");
  });

  it("preserves native payload through a JSON round trip", () => {
    const character = createCharacterDocument({
      characterId: "character-1",
      displayName: "Test Character",
      primaryNativeStateId: dndNativeState.id,
      nativeStates: [dndNativeState],
    });

    const reloaded = JSON.parse(JSON.stringify(character)) as typeof character;

    expect(reloaded.nativeStates[0].payload).toEqual(dndNativeState.payload);
    expect(reloaded.semanticProjection).toBeUndefined();
  });
});
