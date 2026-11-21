import { getChoiceSummary } from '../../character-model/src/index.js';
import { deferFateStuntChoice, selectDeferredFateStunt, type FateCharacterStore } from './deferredStunt.js';
import type { FateStunt } from './nativeCharacter.js';

/** Prepare opening/deferral plus selection locally, then commit once to the host. */
export async function saveFateStuntChoice(store: FateCharacterStore, characterId: string, stunt?: FateStunt) {
  const original = await store.load(characterId);
  if (!original) throw new Error('Save this character to a project first.');
  let staged = structuredClone(original);
  const local: FateCharacterStore = {
    async load() { return structuredClone(staged); },
    async compareAndSwap(_id, _revision, next) { staged = { ...next, revision: original.revision }; return structuredClone(staged); },
  };
  const at = new Date(Math.max(Date.now(), Date.parse(original.lifecycle.events.at(-1)?.occurredAt ?? '') || 0)).toISOString();
  const id = () => crypto.randomUUID();
  let choice = original.lifecycle.events.find((event) => event.type === 'choice-opened' && event.sourceId === 'fate:starter-stunt-slot' && getChoiceSummary(original.lifecycle, event.choiceId)?.status === 'deferred');
  const choiceId = choice && 'choiceId' in choice ? choice.choiceId : id();
  if (!choice) await deferFateStuntChoice(local, characterId, choiceId, { opened: id(), deferred: id() }, at);
  if (stunt) await selectDeferredFateStunt(local, characterId, choiceId, stunt, id(), { assessed: id(), selected: id(), linked: id() }, at);
  if (choice && !stunt) return original;
  return store.compareAndSwap(characterId, original.revision, { document: staged.document, lifecycle: staged.lifecycle });
}
