import type { CharacterDocument } from '../../../packages/character-model/src/index.js';
import { createFateProbeCharacter, fateCondensedProbeAdapter, type FateNativeCharacter } from '../../../packages/system-fate/src/index.js';

const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export function fateSheetHtml(character: CharacterDocument): string {
  const native = character.nativeStates.find((s) => s.id === character.primaryNativeStateId)!;
  const validation = fateCondensedProbeAdapter.validateNativeState(native);
  if (!validation.valid) return `<p class="fate-feedback error">${escape(validation.issues.map((i) => i.message).join(' '))}</p>`;
  const p = native.payload as unknown as FateNativeCharacter;
  return `<article class="fate-sheet"><h2>${escape(character.displayName)}</h2>
    <h3>Aspects</h3><ul>${p.aspects.map((a) => `<li>${escape(a.text)}</li>`).join('')}</ul>
    <h3>Skills</h3><p>${p.skills.map((s) => `${escape(s.skillId)} +${s.rating}`).join(' · ')}</p>
    <h3>Stunts</h3><ul>${p.stunts.map((s) => `<li>${escape(s.text)}</li>`).join('')}</ul>
    <p>Fate points: ${p.fatePoints} · Refresh: ${p.refresh}</p>
    <p>Physical stress: ${p.stress.physical.boxes.map((b) => b ? '☒' : '☐').join(' ')}<br>Mental stress: ${p.stress.mental.boxes.map((b) => b ? '☒' : '☐').join(' ')}</p>
    <h3>Consequences</h3><ul>${p.consequences.map((c) => `<li>${escape(c.severity)}: ${escape(c.text ?? '—')}</li>`).join('')}</ul></article>`;
}

/** Bounded manual creator for the existing Fate probe, not a rules catalog. */
export function mountFateCreator(root: HTMLElement, onCharacter: (character: CharacterDocument) => void) {
  const labels = ['Name', 'High concept', 'Trouble', 'Relationship', 'Free aspect', 'Free aspect', 'First original Stunt'];
  const skills = ['notice', 'physique', 'rapport', 'will', 'crafts', 'drive', 'fight', 'lore', 'stealth', 'investigate'];
  root.innerHTML = `<form class="creator-panel creator-form fate-creator"><h2>Fate Condensed</h2>
    ${labels.map((label, i) => `<label>${label}<input name="field${i}" required></label>`).join('')}
    <details><summary>Skill pyramid</summary>${skills.map((skill, i) => `<label>+${i === 0 ? 4 : i < 3 ? 3 : i < 6 ? 2 : 1}<input name="skill${i}" value="${skill}" required></label>`).join('')}</details>
    <button class="primary-action" type="submit" title="Create a character with two Stunt slots left for later">Create character</button>
    <p role="status" class="fate-feedback error"></p></form>`;
  root.querySelector('form')!.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const field = (i: number) => String(data.get(`field${i}`) ?? '').trim();
    try {
      const character = createFateProbeCharacter({ characterId: crypto.randomUUID(), nativeStateId: crypto.randomUUID(), displayName: field(0),
        highConcept: field(1), trouble: field(2), relationship: field(3), freeAspects: [field(4), field(5)],
        stunts: [{ id: crypto.randomUUID(), text: field(6) }],
        skills: skills.map((_, i) => ({ skillId: String(data.get(`skill${i}`)).trim().toLowerCase(), rating: i === 0 ? 4 : i < 3 ? 3 : i < 6 ? 2 : 1 })),
      });
      root.querySelector('[role=status]')!.textContent = '';
      onCharacter(character);
    } catch (error) { root.querySelector('[role=status]')!.textContent = error instanceof Error ? error.message : 'Character could not be created.'; }
  });
}
