import { describe, expect, it } from "vitest";
import { createCharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  CHARACTER_OPEN_MESSAGE,
  parseCharacterOpenMessage,
  resolveHostOrigin,
} from "./characterForgeHostBridge.js";

const character = createCharacterDocument({
  characterId: "character-1",
  displayName: "Mara Voss",
  primaryNativeStateId: "native-1",
  nativeStates: [{
    id: "native-1",
    systemId: "dnd5e",
    editionId: "2024",
    rulesVersion: "srd-5.2.1",
    schemaVersion: "dnd5e-native/0.1",
    payload: { preserve: { this: ["exactly", 42] } },
    provenance: { origin: "generated", sourceId: "fixture" },
  }],
  generation: {
    methodId: "quick",
    mode: "quick",
    recipeVersion: "1",
    seed: "persist-me",
    rulesSourceIds: ["srd-5.2.1"],
    recipe: { method: "fixture" },
    decisions: [{ stepId: "class", choiceId: "fighter" }],
  },
});

describe("Character Forge host bridge", () => {
  it("accepts an intact persisted CharacterDocument", () => {
    const message = {
      type: CHARACTER_OPEN_MESSAGE,
      payload: { projectId: "project_ashfall", character },
    };

    const parsed = parseCharacterOpenMessage(message);

    expect(parsed?.payload.character).toBe(character);
    expect(parsed?.payload.character.nativeStates).toEqual(character.nativeStates);
    expect(parsed?.payload.character.generation).toEqual(character.generation);
  });

  it("rejects malformed or unsupported persisted documents", () => {
    expect(parseCharacterOpenMessage({
      type: CHARACTER_OPEN_MESSAGE,
      payload: {
        projectId: "project_ashfall",
        character: { ...character, schemaVersion: "character-document/99" },
      },
    })).toBeNull();
    expect(parseCharacterOpenMessage({ type: "other" })).toBeNull();
  });

  it("derives the trusted Parchment origin from the return URL", () => {
    expect(resolveHostOrigin("http://localhost:5273/projects/project_ashfall/character-forge"))
      .toBe("http://localhost:5273");
    expect(resolveHostOrigin("not a url")).toBeNull();
  });
});
