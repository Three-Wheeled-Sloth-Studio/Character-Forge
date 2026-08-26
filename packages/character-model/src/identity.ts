export type CharacterId = `character_${string}`;
export type NativeStateId = `native_state_${string}`;

export function createCharacterId(): CharacterId {
  return `character_${createUuid()}`;
}

export function createNativeStateId(): NativeStateId {
  return `native_state_${createUuid()}`;
}

function createUuid(): string {
  if (typeof globalThis.crypto?.randomUUID !== "function") {
    throw new Error("Secure UUID generation is not available in this runtime.");
  }
  return globalThis.crypto.randomUUID();
}
