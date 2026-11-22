import type { CharacterDocument } from "./characterDocument.js";
import type { CharacterLifecycle } from "./characterLifecycle.js";

export interface CharacterLifecycleSnapshot {
  revision: string;
  document: CharacterDocument;
  lifecycle: CharacterLifecycle;
}

/** Host-owned paired save with optimistic locking, independent of rules system. */
export interface CharacterLifecycleStore {
  load(characterId: string): Promise<CharacterLifecycleSnapshot | null>;
  compareAndSwap(characterId: string, expectedRevision: string, next: Omit<CharacterLifecycleSnapshot, "revision">): Promise<CharacterLifecycleSnapshot>;
}
