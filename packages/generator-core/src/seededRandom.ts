export type RandomSource = () => number;

export function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createSeededRandom(seed: string): RandomSource {
  const normalized = seed.trim();
  if (!normalized) throw new Error("A non-empty seed is required for deterministic generation.");
  let state = hashSeed(normalized) || 0x9e3779b9;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createGeneratedSeed(prefix: string): string {
  const normalizedPrefix = prefix.trim().replaceAll(/[^a-zA-Z0-9_-]/g, "-") || "generation";
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) return `${normalizedPrefix}-${randomUuid}`;

  const randomPart = Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, "0");
  return `${normalizedPrefix}-${Date.now().toString(36)}-${randomPart}`;
}
