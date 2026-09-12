import {
  parseCharacterDocument,
  type CharacterDocument,
} from "../../../packages/character-model/src/index.js";

export const CHARACTER_OPEN_MESSAGE = "character-forge:open-character";
export const CHARACTER_MEDIA_CONTEXT_MESSAGE = "character-forge:media-context";
export const CHARACTER_MEDIA_REQUEST_MESSAGE = "character-forge:media-request";

export type CharacterMediaRole = "portrait" | "token";

export interface CharacterOpenMessage {
  type: typeof CHARACTER_OPEN_MESSAGE;
  payload: {
    projectId: string;
    character: CharacterDocument;
  };
}

export interface CharacterMediaBinary {
  mediaType: string;
  bytes: Uint8Array;
}

export interface CharacterMediaContextMessage {
  type: typeof CHARACTER_MEDIA_CONTEXT_MESSAGE;
  payload: {
    projectId: string;
    characterId: string;
    portrait: CharacterMediaBinary | null;
    token: CharacterMediaBinary | null;
  };
}

export interface CharacterMediaRequestMessage {
  type: typeof CHARACTER_MEDIA_REQUEST_MESSAGE;
  payload: {
    projectId: string;
    characterId: string;
    role: CharacterMediaRole;
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

export function parseCharacterMediaContextMessage(value: unknown): CharacterMediaContextMessage | null {
  if (!isRecord(value) || value.type !== CHARACTER_MEDIA_CONTEXT_MESSAGE || !isRecord(value.payload)) return null;
  const { projectId, characterId } = value.payload;
  if (!isNonEmptyString(projectId) || !isNonEmptyString(characterId)) return null;
  const portrait = parseMediaBinary(value.payload.portrait);
  const token = parseMediaBinary(value.payload.token);
  if (value.payload.portrait !== null && portrait === null) return null;
  if (value.payload.token !== null && token === null) return null;
  return {
    type: CHARACTER_MEDIA_CONTEXT_MESSAGE,
    payload: { projectId, characterId, portrait, token },
  };
}

export function buildCharacterMediaRequestMessage(
  projectId: string,
  characterId: string,
  role: CharacterMediaRole,
): CharacterMediaRequestMessage {
  return {
    type: CHARACTER_MEDIA_REQUEST_MESSAGE,
    payload: { projectId, characterId, role },
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

function parseMediaBinary(value: unknown): CharacterMediaBinary | null {
  if (value === null) return null;
  if (!isRecord(value) || !isNonEmptyString(value.mediaType) || !value.mediaType.startsWith("image/")) return null;
  if (!(value.bytes instanceof Uint8Array) || value.bytes.byteLength === 0) return null;
  return { mediaType: value.mediaType, bytes: new Uint8Array(value.bytes) };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
