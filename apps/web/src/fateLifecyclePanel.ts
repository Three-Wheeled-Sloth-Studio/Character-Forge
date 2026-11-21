import { getChoiceSummary } from '../../../packages/character-model/src/index.js';
import { fateCondensedProbeAdapter, saveFateStuntChoice, type FateCharacterSnapshot, type FateNativeCharacter } from '../../../packages/system-fate/src/index.js';
import { LifecycleHostStore, LIFECYCLE_CONTEXT, LIFECYCLE_RESULT } from './lifecycleHostStore.js';

export function mountFateLifecyclePanel(root: HTMLElement, hostOrigin: string | null, projectId: string, currentId: () => string, onSaved: (snapshot: FateCharacterSnapshot) => void) {
  const store = new LifecycleHostStore((message) => {
    if (!hostOrigin || window.parent === window) throw new Error('Open this character from a Parchment project to save choices.');
    window.parent.postMessage(message, hostOrigin);
  });
  let snapshot: FateCharacterSnapshot | null = null;
  let busy = false;
  const clear = () => { snapshot = null; root.replaceChildren(); };
  const render = () => {
    if (!snapshot) return;
    const native = snapshot.document.nativeStates.find((s) => s.id === snapshot!.document.primaryNativeStateId);
    if (!native || native.systemId !== 'fate' || !fateCondensedProbeAdapter.validateNativeState(native).valid) { clear(); return; }
    const payload = native.payload as unknown as FateNativeCharacter;
    root.innerHTML = `<section class="fate-choice-panel">
      ${payload.stunts.length < payload.stuntSlots ? `<details class="fate-choice-editor"><summary title="Describe a new talent now, or leave it for later">✦ Stunt available</summary>
      <form><label>Your original Stunt<textarea name="stunt" rows="3" placeholder="What can your character do, and when does it help?"></textarea></label>
      <button class="icon-button" type="submit" title="Accept Stunt and save to project" aria-label="Accept Stunt and save">✓</button>
      <button class="icon-button" type="button" data-defer title="Leave this Stunt for later and save" aria-label="Leave Stunt deferred">◷</button></form></details>` : ''}
      <p data-feedback role="status" aria-live="polite"></p>
      <details><summary title="Read-only choice, experience and native revision history">☷ GM inspection</summary><div data-history></div></details>
    </section>`;
    const history = root.querySelector<HTMLElement>('[data-history]')!;
    const lines = [`Available Stunt slots: ${payload.stuntSlots - payload.stunts.length}`];
    for (const event of snapshot.lifecycle.events) {
      if (event.type === 'choice-opened') lines.push(`${event.prompt}: ${getChoiceSummary(snapshot.lifecycle, event.choiceId)?.status}`);
      if (event.type === 'experience-recorded') lines.push(`${event.occurredAt} • ${event.category}: ${event.description}`);
      if (event.type === 'choice-selected') lines.push(`${event.occurredAt} • Selected ${event.optionId}`);
      if (event.type === 'native-revision-linked') lines.push(`${event.sourceNativeStateId} → ${event.resultingNativeStateId} (${event.systemAdapterId})`);
    }
    lines.push(`Retained native revisions: ${snapshot.document.nativeStates.map((s) => s.id).join(', ')}`);
    const pre = document.createElement('pre'); pre.textContent = lines.join('\n'); history.append(pre);
    const raw = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = 'Event provenance';
    const ledger = document.createElement('pre'); ledger.textContent = JSON.stringify(snapshot.lifecycle, null, 2);
    raw.append(summary, ledger); history.append(raw);
    const revisions = document.createElement('details');
    const revisionSummary = document.createElement('summary'); revisionSummary.textContent = 'Native revisions';
    const revisionData = document.createElement('pre');
    revisionData.textContent = JSON.stringify({ primaryNativeStateId: snapshot.document.primaryNativeStateId, nativeStates: snapshot.document.nativeStates, generation: snapshot.document.generation }, null, 2);
    revisions.append(revisionSummary, revisionData); history.append(revisions);
    root.querySelector('form')?.addEventListener('submit', (event) => { event.preventDefault(); void save(false); });
    root.querySelector('[data-defer]')?.addEventListener('click', () => { void save(true); });
  };
  const feedback = (message: string, kind: string) => {
    const target = root.querySelector<HTMLElement>('[data-feedback]');
    if (target) { target.textContent = message; target.className = `fate-feedback ${kind}`; }
  };
  const save = async (defer: boolean) => {
    if (!snapshot || busy) return;
    const characterId = snapshot.document.characterId;
    const text = root.querySelector<HTMLTextAreaElement>('textarea')?.value.trim() ?? '';
    busy = true;
    root.setAttribute('aria-busy', 'true');
    root.querySelectorAll<HTMLButtonElement | HTMLTextAreaElement>('button, textarea').forEach((b) => { b.disabled = true; });
    feedback('Saving…', 'warning');
    try {
      const saved = await saveFateStuntChoice(store, characterId, defer ? undefined : { id: crypto.randomUUID(), text });
      if (currentId() !== characterId) return;
      snapshot = saved;
      onSaved(saved);
      render();
      feedback(defer ? '✓ Stunt left deferred in project storage.' : '✓ Stunt saved to project.', 'success');
    } catch (error) {
      feedback(error instanceof Error ? error.message : 'Save failed. Try again.', 'error');
    } finally {
      busy = false; root.removeAttribute('aria-busy');
      root.querySelectorAll<HTMLButtonElement | HTMLTextAreaElement>('button, textarea').forEach((b) => { b.disabled = false; });
    }
  };
  window.addEventListener('message', (event: MessageEvent) => {
    if (!hostOrigin || event.source !== window.parent || event.origin !== hostOrigin || !event.data?.payload) return;
    const p = event.data.payload as Record<string, unknown>;
    if ((projectId && p.projectId !== projectId) || p.characterId !== currentId()) return;
    if (event.data.type === LIFECYCLE_RESULT) { store.receive(p); return; }
    if (event.data.type !== LIFECYCLE_CONTEXT || busy) return;
    if (snapshot?.document.characterId === p.characterId && snapshot.revision === String(p.revision)) return;
    try { snapshot = store.open(p); onSaved(snapshot); render(); }
    catch (error) { root.textContent = error instanceof Error ? error.message : 'History could not be opened.'; }
  });
  return { clear };
}
