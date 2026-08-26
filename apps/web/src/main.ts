import {
  dnd5eSrd521Adapter,
  quickGenerateDnd5eFirstSlice,
  type Dnd5eNativeCharacter,
} from "../../../packages/system-dnd5e/src/index.js";
import type { CharacterDocument } from "../../../packages/character-model/src/index.js";

const CHARACTER_GENERATED_MESSAGE = "character-forge:character-generated";
const params = new URLSearchParams(window.location.search);
const projectId = params.get("pwProjectId") ?? "";
const projectName = params.get("pwProjectName") ?? "";
const returnUrl = params.get("pwReturnUrl") ?? "";
const app = document.querySelector<HTMLElement>("#app");

if (!app) throw new Error("Character Forge application root was not found.");

app.innerHTML = `
  <section class="forge-shell">
    <header class="forge-header">
      <div>
        <p class="eyebrow">Parchment Worlds module</p>
        <h1>Character Forge</h1>
        <p class="lede">Create a system-native character first. Translation magic comes later.</p>
      </div>
      ${projectName ? `<div class="project-chip">Project: <strong>${escapeHtml(projectName)}</strong></div>` : ""}
    </header>

    <section class="creator-panel">
      <div class="creator-copy">
        <p class="eyebrow">D&D 5E 2024 / SRD 5.2.1</p>
        <h2>Quick character</h2>
        <p>This first playable seam generates a legal Level 1 Human Soldier Fighter using the Character Forge rules engine.</p>
      </div>
      <form id="quick-form" class="quick-form">
        <label>
          Character name
          <input id="character-name" name="characterName" type="text" maxlength="80" placeholder="Leave blank for a generated name" />
        </label>
        <label>
          Seed
          <input id="character-seed" name="seed" type="text" maxlength="120" placeholder="Optional, for repeatable generation" />
        </label>
        <button type="submit">Generate character</button>
      </form>
    </section>

    <section id="result" class="result-panel empty-result" aria-live="polite">
      <p>Your generated character will appear here.</p>
    </section>
  </section>
`;

const form = document.querySelector<HTMLFormElement>("#quick-form");
const nameInput = document.querySelector<HTMLInputElement>("#character-name");
const seedInput = document.querySelector<HTMLInputElement>("#character-seed");
const result = document.querySelector<HTMLElement>("#result");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const character = quickGenerateDnd5eFirstSlice({
    ...(nameInput?.value.trim() ? { name: nameInput.value.trim() } : {}),
    ...(seedInput?.value.trim() ? { seed: seedInput.value.trim() } : {}),
  });
  renderCharacter(character);
  postCharacterToHost(character);
});

function renderCharacter(character: CharacterDocument): void {
  if (!result) return;
  const nativeState = character.nativeStates[0];
  const validation = dnd5eSrd521Adapter.validateNativeState(nativeState);
  const payload = nativeState.payload as Dnd5eNativeCharacter;
  const abilities = payload.abilities.final;
  const seed = character.generation?.seed ?? "not recorded";

  result.classList.remove("empty-result");
  result.innerHTML = `
    <div class="result-heading">
      <div>
        <p class="eyebrow">Generated character</p>
        <h2>${escapeHtml(character.displayName)}</h2>
        <p>Level 1 Human Soldier Fighter</p>
      </div>
      <span class="validation-pill ${validation.valid ? "valid" : "invalid"}">
        ${validation.valid ? "Native state valid" : "Validation failed"}
      </span>
    </div>
    <div class="ability-grid">
      ${abilityCard("STR", abilities.strength)}
      ${abilityCard("DEX", abilities.dexterity)}
      ${abilityCard("CON", abilities.constitution)}
      ${abilityCard("INT", abilities.intelligence)}
      ${abilityCard("WIS", abilities.wisdom)}
      ${abilityCard("CHA", abilities.charisma)}
    </div>
    <div class="stat-grid">
      ${statCard("HP", String(payload.resources.hitPointsMaximum))}
      ${statCard("AC", String(payload.derived.armorClass))}
      ${statCard("Initiative", signed(payload.derived.initiativeModifier))}
      ${statCard("Passive Perception", String(payload.derived.passivePerception))}
    </div>
    <div class="result-details">
      <div><strong>Fighting style</strong><span>${humanize(payload.class.fightingStyleFeatId)}</span></div>
      <div><strong>Origin feats</strong><span>${humanize(payload.origin.backgroundOriginFeatId)}, ${humanize(payload.origin.speciesOriginFeatId)}</span></div>
      <div><strong>Weapon mastery</strong><span>${payload.class.weaponMasteryIds.map(humanize).join(", ")}</span></div>
      <div><strong>Equipment</strong><span>${payload.equipment.map((item) => `${item.quantity} x ${humanize(item.itemId)}`).join(", ")}</span></div>
      <div><strong>Generation seed</strong><code>${escapeHtml(seed)}</code></div>
    </div>
    <details>
      <summary>Inspect native character document</summary>
      <pre>${escapeHtml(JSON.stringify(character, null, 2))}</pre>
    </details>
  `;
}

function postCharacterToHost(character: CharacterDocument): void {
  if (window.parent === window) return;
  let targetOrigin = "*";
  try {
    if (returnUrl) targetOrigin = new URL(returnUrl).origin;
  } catch {
    targetOrigin = "*";
  }
  window.parent.postMessage({
    type: CHARACTER_GENERATED_MESSAGE,
    payload: {
      projectId,
      character,
    },
  }, targetOrigin);
}

function abilityCard(label: string, score: number): string {
  const modifier = Math.floor((score - 10) / 2);
  return `<div class="ability-card"><span>${label}</span><strong>${score}</strong><small>${signed(modifier)}</small></div>`;
}

function statCard(label: string, value: string): string {
  return `<div class="stat-card"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function signed(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

function humanize(value: string): string {
  return value
    .split(":").at(-1)!
    .split("-")
    .map((part) => part ? part[0]!.toUpperCase() + part.slice(1) : part)
    .join(" ");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
