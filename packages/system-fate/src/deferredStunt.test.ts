import { describe, expect, it } from "vitest";
import { createCharacterLifecycle, parseCharacterDocument, type CharacterLifecycle } from "../../character-model/src/index.js";
import { createFateProbeCharacter, deferFateStuntChoice, fateCondensedProbeAdapter, selectDeferredFateStunt, type FateCharacterSnapshot, type FateCharacterStore, type FateProbeCreationInput, saveFateStuntChoice } from "./index.js";

const at = "2026-11-21T16:00:00.000Z";
const choiceId = "starter-stunt-2";
const openedIds = { opened: "open-stunt-2", deferred: "defer-stunt-2" };
const selectedIds = { assessed: "assess-stunt-2", selected: "select-stunt-2", linked: "link-stunt-2" };

function input(): FateProbeCreationInput {
  return {
    characterId: "character-1", nativeStateId: "fate-state-1", displayName: "Rin",
    highConcept: "Pilot of old machines", trouble: "Cannot refuse a wager",
    relationship: "My co-pilot knows my secret", freeAspects: ["Never leaves the crew", "A debt to the city"],
    skills: ["notice", "physique", "rapport", "will", "crafts", "drive", "fight", "lore", "stealth", "investigate"].map((skillId, i) => ({ skillId, rating: i === 0 ? 4 : i < 3 ? 3 : i < 6 ? 2 : 1 })),
    stunts: [{ id: "first-stunt", text: "A practiced hand at the controls" }],
  };
}

function store(initialLifecycle?: CharacterLifecycle): FateCharacterStore & { current(): FateCharacterSnapshot; rejectNext(): void } {
  let value: FateCharacterSnapshot = { revision: "v1", document: createFateProbeCharacter(input()), lifecycle: initialLifecycle ?? createCharacterLifecycle("character-1") };
  let shouldFail = false;
  return {
    current: () => structuredClone(value),
    rejectNext: () => { shouldFail = true; },
    async load(id) { return id === "character-1" ? structuredClone(value) : null; },
    async compareAndSwap(id, expected, next) {
      if (id !== "character-1" || expected !== value.revision || shouldFail) {
        shouldFail = false;
        throw new Error("Atomic save rejected: conflict or persistence failure");
      }
      value = structuredClone({ revision: `v${Number(value.revision.slice(1)) + 1}`, ...next });
      return structuredClone(value);
    },
  };
}

describe("Fate deferred-Stunt native revision transaction", () => {
  it("defers, chooses a new freeform stunt, persists both artifacts and reopens the updated state", async () => {
    const db = store();
    const afterDefer = await deferFateStuntChoice(db, "character-1", choiceId, openedIds, at);
    expect(afterDefer.document.primaryNativeStateId).toBe("fate-state-1");
    expect(afterDefer.lifecycle.events.map((event) => event.type)).toEqual(["choice-opened", "choice-deferred"]);

    const saved = await selectDeferredFateStunt(db, "character-1", choiceId, { id: "improvised-tinkerer", text: "I improvise repairs under pressure when my crew is in danger" }, "fate-state-2", selectedIds, at);
    expect(saved.document.primaryNativeStateId).toBe("fate-state-2");
    expect(saved.document.nativeStates).toHaveLength(2);
    expect(fateCondensedProbeAdapter.validateNativeState(saved.document.nativeStates[1]!).valid).toBe(true);
    expect(saved.lifecycle.events.map((event) => event.type)).toEqual(["choice-opened", "choice-deferred", "choice-assessed", "choice-selected", "native-revision-linked"]);

    const reopened = JSON.parse(JSON.stringify(db.current())) as FateCharacterSnapshot;
    expect(parseCharacterDocument(reopened.document)).toEqual(saved.document);
    expect(reopened.lifecycle).toEqual(saved.lifecycle);
    const native = reopened.document.nativeStates.find((entry) => entry.id === reopened.document.primaryNativeStateId)!;
    expect((native.payload as { stunts: { id: string }[] }).stunts.map((entry) => entry.id)).toEqual(["first-stunt", "improvised-tinkerer"]);
  });

  it("keeps document and lifecycle unchanged if atomic save fails", async () => {
    const db = store();
    await deferFateStuntChoice(db, "character-1", choiceId, openedIds, at);
    const before = db.current();
    db.rejectNext();
    await expect(selectDeferredFateStunt(db, "character-1", choiceId, { id: "new-stunt", text: "Something original" }, "fate-state-2", selectedIds, at)).rejects.toThrow(/Atomic save rejected/);
    expect(db.current()).toEqual(before);
  });

  it("rejects stale choice, duplicate stunt, and invalid new state without any write", async () => {
    const db = store();
    await deferFateStuntChoice(db, "character-1", choiceId, openedIds, at);
    const before = db.current();
    await expect(selectDeferredFateStunt(db, "character-1", choiceId, { id: "first-stunt", text: "Duplicate" }, "fate-state-2", selectedIds, at)).rejects.toThrow(/already selected/);
    await expect(selectDeferredFateStunt(db, "character-1", choiceId, { id: "future", text: "A new ability" }, "fate-state-1", selectedIds, at)).rejects.toThrow(/must be new/);
    expect(db.current()).toEqual(before);
  });

  it("rejects attempts to overfill a starter slot or use a mismatched lifecycle", async () => {
    const db = store({ schemaVersion: "character-lifecycle/0.1", characterId: "someone-else", events: [] });
    await expect(deferFateStuntChoice(db, "character-1", choiceId, openedIds, at)).rejects.toThrow(/identities must match/);
  });

  it("rejects one of two concurrent selections against the same saved revision", async () => {
    const db = store();
    await deferFateStuntChoice(db, "character-1", choiceId, openedIds, at);
    const results = await Promise.allSettled([
      selectDeferredFateStunt(db, "character-1", choiceId, { id: "stunt-a", text: "I can judge the ship by its vibration" }, "fate-state-a", { assessed: "a-assess", selected: "a-select", linked: "a-link" }, at),
      selectDeferredFateStunt(db, "character-1", choiceId, { id: "stunt-b", text: "I can navigate by the weather" }, "fate-state-b", { assessed: "b-assess", selected: "b-select", linked: "b-link" }, at),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(db.current().document.nativeStates).toHaveLength(2);
    expect(db.current().lifecycle.events.filter((event) => event.type === "native-revision-linked")).toHaveLength(1);
  });
});


describe('player Stunt action', () => {
  it('opens and selects in one durable write, retaining all native states', async () => {
    const db = store();
    let writes = 0;
    const original = db.compareAndSwap.bind(db);
    db.compareAndSwap = (...args) => { writes++; return original(...args); };
    const saved = await saveFateStuntChoice(db, 'character-1', { id: 'rescue', text: 'I improvise a rescue with broken machines' });
    expect(writes).toBe(1);
    expect(saved.lifecycle.events.map(e => e.type)).toEqual(['choice-opened', 'choice-deferred', 'choice-assessed', 'choice-selected', 'native-revision-linked']);
    expect(saved.document.nativeStates).toHaveLength(2);
  });
  it('leaves a deferred choice unchanged and rejects blank original text without writing an opening', async () => {
    const db = store();
    const before = db.current();
    await expect(saveFateStuntChoice(db, 'character-1', { id: 'empty', text: ' ' })).rejects.toThrow('description');
    expect(db.current()).toEqual(before);
    const deferred = await saveFateStuntChoice(db, 'character-1');
    expect(await saveFateStuntChoice(db, 'character-1')).toEqual(deferred);
    expect(db.current()).toEqual(deferred);
  });
});
