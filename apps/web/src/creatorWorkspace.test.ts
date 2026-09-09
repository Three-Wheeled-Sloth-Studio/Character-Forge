import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import { creatorSystemForCharacter, defaultCreatorSystem } from "./creatorWorkspace.js";

function character(systemId: string, editionId: string): CharacterDocument {
  return {
    schemaVersion: "character-document/0.1",
    characterId: "character-test",
    displayName: "Test",
    primaryNativeStateId: "native-test",
    nativeStates: [{
      id: "native-test",
      systemId,
      editionId,
      rulesVersion: "test",
      schemaVersion: "test",
      payload: {},
      provenance: { origin: "generated" },
    }],
  };
}

describe("creator workspace system routing", () => {
  it("preserves D&D as the creator default", () => {
    expect(defaultCreatorSystem()).toBe("dnd5e-2024");
  });

  it("routes supported native states without reading semantic projection", () => {
    expect(creatorSystemForCharacter(character("dnd5e", "2024"))).toBe("dnd5e-2024");
    expect(creatorSystemForCharacter(character("brp", "uge-2023"))).toBe("brp-uge");
    expect(creatorSystemForCharacter(character("unknown", "1"))).toBeNull();
  });
});
