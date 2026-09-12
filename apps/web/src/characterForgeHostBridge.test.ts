import { describe, expect, it } from "vitest";
import { createCharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  CHARACTER_MEDIA_CONTEXT_MESSAGE,
  CHARACTER_MEDIA_REQUEST_MESSAGE,
  CHARACTER_OPEN_MESSAGE,
  buildCharacterMediaRequestMessage,
  parseCharacterMediaContextMessage,
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

  it("accepts ephemeral host-owned portrait/token bytes without changing character state", () => {
    const parsed = parseCharacterMediaContextMessage({
      type: CHARACTER_MEDIA_CONTEXT_MESSAGE,
      payload: {
        projectId: "project_ashfall",
        characterId: character.characterId,
        portrait: { mediaType: "image/png", bytes: new Uint8Array([1, 2, 3]) },
        token: null,
      },
    });

    expect(parsed?.payload.characterId).toBe(character.characterId);
    expect(parsed?.payload.portrait?.mediaType).toBe("image/png");
    expect([...(parsed?.payload.portrait?.bytes ?? [])]).toEqual([1, 2, 3]);
    expect(parsed?.payload.token).toBeNull();
    expect(character.nativeStates[0]?.payload).toEqual({ preserve: { this: ["exactly", 42] } });
  });

  it("rejects malformed media payloads and builds explicit host media requests", () => {
    expect(parseCharacterMediaContextMessage({
      type: CHARACTER_MEDIA_CONTEXT_MESSAGE,
      payload: {
        projectId: "project_ashfall",
        characterId: character.characterId,
        portrait: { mediaType: "image/png", bytes: [] },
        token: null,
      },
    })).toBeNull();

    expect(buildCharacterMediaRequestMessage("project_ashfall", character.characterId, "portrait")).toEqual({
      type: CHARACTER_MEDIA_REQUEST_MESSAGE,
      payload: {
        projectId: "project_ashfall",
        characterId: character.characterId,
        role: "portrait",
      },
    });
  });

  it("derives the trusted Parchment origin from the return URL", () => {
    expect(resolveHostOrigin("http://localhost:5273/projects/project_ashfall/character-forge"))
      .toBe("http://localhost:5273");
    expect(resolveHostOrigin("not a url")).toBeNull();
  });
});
