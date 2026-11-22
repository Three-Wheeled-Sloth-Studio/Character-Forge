import { describe, expect, it, vi } from 'vitest';
import { LifecycleHostStore, parseLifecycle } from './lifecycleHostStore.js';
import { createCharacterLifecycle, type CharacterDocument } from '../../../packages/character-model/src/index.js';
const document: CharacterDocument = { schemaVersion: 'character-document/0.1', characterId: 'c', displayName: 'Rin', primaryNativeStateId: 'n', nativeStates: [{ id: 'n', systemId: 'fate', editionId: 'condensed', rulesVersion: 'test', schemaVersion: 'test', payload: {}, provenance: { origin: 'manual' } }] };
const context = { projectId: 'p', assetId: 'a', characterId: 'c', revision: 1, document, lifecycle: null };

describe('host-owned lifecycle store', () => {
  it('opens legacy history and only accepts an exact identity acknowledgment after persistence', async () => {
    let sent: any;
    const store = new LifecycleHostStore(message => { sent = message; });
    const before = store.open(context);
    const next = { document, lifecycle: createCharacterLifecycle('c') };
    const saving = store.compareAndSwap('c', '1', next);
    expect(await store.load('c')).toEqual(before);
    const reply = { ...sent.payload, ...next, ok: true, revision: 2 };
    for (const key of ['projectId', 'characterId', 'assetId', 'requestId']) expect(store.receive({ ...reply, [key]: 'wrong' })).toBe(false);
    expect(store.receive(reply)).toBe(true);
    expect((await saving).revision).toBe('2');
    expect((await store.load('c'))?.revision).toBe('2');
    expect(store.receive(reply)).toBe(false);
    await expect(store.compareAndSwap('c', '1', next)).rejects.toThrow('changed');
  });
  it('preserves the snapshot on failure and blocks simultaneous requests', async () => {
    let sent: any;
    const store = new LifecycleHostStore(message => { sent = message; });
    const before = store.open(context);
    const pending = store.compareAndSwap('c', '1', before);
    await expect(store.compareAndSwap('c', '1', before)).rejects.toThrow('progress');
    store.receive({ ...sent.payload, ok: false, error: 'Disk full' });
    await expect(pending).rejects.toThrow('Disk full');
    expect(await store.load('c')).toEqual(before);
  });
  it('reports uncertain timeout and requires reopening instead of retrying a potentially saved choice', async () => {
    vi.useFakeTimers();
    try {
      const store = new LifecycleHostStore(() => {});
      const before = store.open(context);
      const promise = store.compareAndSwap('c', '1', before);
      const rejected = expect(promise).rejects.toThrow('Reopen to check');
      await vi.advanceTimersByTimeAsync(15000);
      await rejected;
      expect(await store.load('c')).toBeNull();
    } finally { vi.useRealTimers(); }
  });
  it('rejects malformed or future lifecycle history instead of silently replacing it', () => {
    expect(() => parseLifecycle({ schemaVersion: 'future', characterId: 'c', events: [] }, 'c')).toThrow('Unsupported');
    expect(() => parseLifecycle({ schemaVersion: 'character-lifecycle/0.1', characterId: 'c', events: [{ type: 'future-event' }] }, 'c')).toThrow('Unsupported');
  });
  it('reopens BRP experience with a source-linked native revision', () => {
    const history = {
      schemaVersion: 'character-lifecycle/0.1', characterId: 'c', events: [
        { type: 'experience-recorded', eventId: 'xp', occurredAt: '2026-11-21T14:00:00Z', sourceNativeStateId: 'n', category: 'practice', description: 'GM-approved meaningful use' },
        { type: 'experience-revision-linked', eventId: 'rev', occurredAt: '2026-11-21T14:00:00Z', experienceEventId: 'xp', sourceNativeStateId: 'n', resultingNativeStateId: 'n2', systemAdapterId: 'brp-uge' },
      ],
    };
    expect(parseLifecycle(history, 'c').events).toEqual(history.events);
    const store = new LifecycleHostStore(() => {});
    expect(store.open({ ...context, lifecycle: history }).lifecycle.events).toHaveLength(2);
  });
});
