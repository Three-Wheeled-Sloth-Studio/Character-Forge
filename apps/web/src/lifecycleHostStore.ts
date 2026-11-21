import { appendLifecycleEvent, createCharacterLifecycle, parseCharacterDocument, type CharacterLifecycle, type CharacterLifecycleEvent } from "../../../packages/character-model/src/index.js";
import type { FateCharacterSnapshot, FateCharacterStore } from "../../../packages/system-fate/src/index.js";

export const LIFECYCLE_CONTEXT = "character-forge:lifecycle-context:v1";
export const LIFECYCLE_SAVE = "character-forge:lifecycle-save:v1";
export const LIFECYCLE_RESULT = "character-forge:lifecycle-result:v1";

export function parseLifecycle(value: unknown, characterId: string): CharacterLifecycle {
  if (value === null) return createCharacterLifecycle(characterId);
  const candidate = value as CharacterLifecycle | null;
  if (!candidate || candidate.schemaVersion !== "character-lifecycle/0.1" || candidate.characterId !== characterId || !Array.isArray(candidate.events)) throw new Error("Unsupported character history. Reopen with a compatible build.");
  let lifecycle = createCharacterLifecycle(characterId);
  for (const event of candidate.events) {
    if (!["choice-opened", "choice-deferred", "choice-assessed", "choice-selected", "experience-recorded", "native-revision-linked"].includes(event.type)) throw new Error("Unsupported history event.");
    lifecycle = appendLifecycleEvent(lifecycle, event as CharacterLifecycleEvent);
  }
  return lifecycle;
}

/** Cached read, host-owned durable CAS. Unacknowledged changes never enter the cache. */
export class LifecycleHostStore implements FateCharacterStore {
  private snapshot: FateCharacterSnapshot | null = null;
  private projectId = "";
  private assetId = "";
  private pending: { id: string; resolve: (s: FateCharacterSnapshot) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> } | null = null;

  constructor(private readonly send: (message: unknown) => void) {}

  open(payload: Record<string, unknown>): FateCharacterSnapshot {
    if (this.pending) throw new Error("Wait for the current save to finish.");
    const document = parseCharacterDocument(payload.document);
    if (!document || document.characterId !== payload.characterId || typeof payload.projectId !== "string" || !payload.projectId || typeof payload.assetId !== "string" || !payload.assetId || !Number.isSafeInteger(payload.revision) || Number(payload.revision) < 1) throw new Error("Invalid saved character context.");
    const lifecycle = parseLifecycle(payload.lifecycle, document.characterId);
    this.projectId = payload.projectId;
    this.assetId = payload.assetId;
    this.snapshot = { revision: String(payload.revision), document, lifecycle };
    return structuredClone(this.snapshot);
  }

  async load(characterId: string) {
    return this.snapshot?.document.characterId === characterId ? structuredClone(this.snapshot) : null;
  }

  compareAndSwap(characterId: string, expectedRevision: string, next: Omit<FateCharacterSnapshot, "revision">): Promise<FateCharacterSnapshot> {
    if (this.pending || !this.snapshot || this.snapshot.document.characterId !== characterId || this.snapshot.revision !== expectedRevision) return Promise.reject(new Error("Character changed or a save is already in progress. Reopen and try again."));
    const requestId = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending = null;
        this.snapshot = null;
        reject(new Error("Save confirmation was not received. Reopen to check whether it was saved before trying again."));
      }, 15000);
      this.pending = { id: requestId, resolve, reject, timer };
      try {
        this.send({ type: LIFECYCLE_SAVE, payload: { requestId, projectId: this.projectId, assetId: this.assetId, characterId, expectedRevision: Number(expectedRevision), ...next } });
      } catch (error) {
        clearTimeout(timer); this.pending = null; reject(error);
      }
    });
  }

  receive(payload: Record<string, unknown>): boolean {
    const pending = this.pending;
    if (!pending || !this.snapshot || payload.requestId !== pending.id || payload.projectId !== this.projectId || payload.assetId !== this.assetId || payload.characterId !== this.snapshot?.document.characterId) return false;
    clearTimeout(pending.timer);
    this.pending = null;
    if (payload.ok !== true) {
      pending.reject(new Error(typeof payload.error === "string" ? payload.error : "Save failed. Reopen and try again."));
      return true;
    }
    try {
      if (Number(payload.revision) <= Number(this.snapshot.revision)) throw new Error("Invalid save revision. Reopen the character.");
      pending.resolve(this.open(payload));
    } catch (error) { pending.reject(error instanceof Error ? error : new Error("Invalid save response.")); }
    return true;
  }
}
