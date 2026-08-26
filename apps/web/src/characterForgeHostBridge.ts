import {
  parseCharacterDocument,
  type CharacterDocument,
} from "../../../packages/character-model/src/index.js";

export const CHARACTER_OPEN_MESSAGE = "character-forge:open-character";

export interface CharacterOpenMessage {
  type: typeof CHARACTER_OPEN_MESSAGE;
  payload: {
    projectId: string;
    character: CharacterDocument;
  };
}

export function parseCharacterOpenMessage(value: unknown): CharacterOpenMessage | null {
  if (!isRecord(value) || value.type !== CHARACTER_OPEN_MESSAGE || !isRecord(value.payload)) {
    return null;
  }
  if (typeof value.payload.projectId !== "string") return null;
  const character = parseCharacterDocument(value.payload.character);
  if (!character) return null;
  return {
    type: CHARACTER_OPEN_MESSAGE,
    payload: {
      projectId: value.payload.projectId,
      character,
    },
  };
}

export function resolveHostOrigin(returnUrl: string): string | null {
  if (!returnUrl) return null;
  try {
    return new URL(returnUrl).origin;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
