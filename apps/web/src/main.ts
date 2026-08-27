import {
  dnd5eSrd521Adapter,
  type Dnd5eNativeCharacter,
} from "../../../packages/system-dnd5e/src/index.js";
import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  parseCharacterOpenMessage,
  resolveHostOrigin,
} from "./characterForgeHostBridge.js";
import { mountGuidedCreationPanel } from "./guidedCreationPanel.js";

const CHARACTER_GENERATED_MESSAGE = "character-forge:character-generated";
const params = new URLSearchParams(window.location.search);
const projectId = params.get("pwProjectId") ?? "";
const projectName = params.get("pwProjectName") ?? "";
const returnUrl = params.get("pwReturnUrl") ?? "";
const hostOrigin = resolveHostOrigin(returnUrl);
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
    <div class="forge-workspace">
      <aside id="creator-root" class="creator-column" aria-label="Character generation controls"></aside>
      <section id="result" class="result-panel empty-result" aria-live="polite">
        <div class="empty-state">
          <p class="eyebrow">Character details</p>
          <h2>Build a character</h2>
          <p>Your generated character will stay visible here while you adjust generation choices on the left.</p>
        </div>
      </section>
    </div>
  </section>
`;

const creatorRoot = document.querySelector<HTMLElement>("#creator-root");
const result = document.querySelector<HTMLElement>("#result");
if (!creatorRoot || !result) throw new Error("Character Forge workspace failed to initialize.");

mountGuidedCreationPanel(creatorRoot, publishCharacter);

window.addEventListener("message", (event: MessageEvent<unknown>) => {
  if (window.parent === window || event.source !== window.parent) return;
  if (!hostOrigin || event.origin !== hostOrigin) return;
  const opened = parseCharacterOpenMessage(event.data);
  if (!opened) return;
  if (projectId && opened.payload.projectId !== projectId) return;
  renderCharacter(opened.payload.character);
});

function publishCharacter(character: CharacterDocument): void {
  renderCharacter(character);
  postCharacterToHost(character);
}

function renderCharacter(character: CharacterDocument): void {
  const nativeState = character.nativeStates.find((state) => state.id === character.primaryNativeStateId);
  if (!nativeState) {
    renderCharacterFailure(character, "The primary native state is missing from this character document.");
    return;
  }
  if (nativeState.systemId !== dnd5eSrd521Adapter.systemId || nativeState.editionId !== dnd5eSrd521Adapter.editionId) {
    renderCharacterFailure(character, `This Character Forge build cannot open ${nativeState.systemId} ${nativeState.editionId}.`);
    return;
  }

  const validation = dnd5eSrd521Adapter.validateNativeState(nativeState);
  if (!validation.valid) {
    renderCharacterFailure(
      character,
      validation.issues.map((issue) => issue.message).join(" ") || "Native state validation failed.",
    );
    return;
  }

  const payload = nativeState.payload as Dnd5eNativeCharacter;
  const abilities = payload.abilities.final;
  const seed = character.generation?.seed;
  const originFeats = [payload.origin.backgroundOriginFeatId, payload.origin.speciesOriginFeatId]
    .filter((value): value is string => Boolean(value));

  result.classList.remove("empty-result");
  result.innerHTML = `
    <div class="result-heading">
      <div>
        <p class="eyebrow">Character details</p>
        <h2>${escapeHtml(character.displayName)}</h2>
        <p>${humanize(payload.origin.speciesId)} · ${humanize(payload.origin.backgroundId)} · ${humanize(payload.class.classId)} 1</p>
      </div>
      <span class="validation-pill valid">Native state valid</span>
    </div>
    <div class="ability-grid">
      ${abilityCard("STR", abilities.strength)}${abilityCard("DEX", abilities.dexterity)}${abilityCard("CON", abilities.constitution)}
      ${abilityCard("INT", abilities.intelligence)}${abilityCard("WIS", abilities.wisdom)}${abilityCard("CHA", abilities.charisma)}
    </div>
    <div class="stat-grid">
      ${statCard("HP", String(payload.resources.hitPointsMaximum))}
      ${statCard("AC", String(payload.derived.armorClass))}
      ${statCard("Initiative", signed(payload.derived.initiativeModifier))}
      ${statCard("Passive Perception", String(payload.derived.passivePerception))}
    </div>
    <div class="result-details">
      <div><strong>Ability method</strong><span>${humanize(payload.abilities.generationMethod)}</span></div>
      <div><strong>Background feat</strong><span>${humanize(payload.origin.backgroundOriginFeatId)}</span></div>
      ${payload.origin.speciesOriginFeatId ? `<div><strong>Species Origin feat</strong><span>${humanize(payload.origin.speciesOriginFeatId)}</span></div>` : ""}
      <div><strong>Origin feats</strong><span>${originFeats.map(humanize).join(", ") || "None"}</span></div>
      <div><strong>Background skills</strong><span>${(payload.origin.backgroundSkillProficiencies ?? []).map(humanize).join(", ")}</span></div>
      <div><strong>Class skills</strong><span>${payload.class.skillProficiencies.map(humanize).join(", ")}</span></div>
      <div><strong>Tool proficiency</strong><span>${humanize(payload.origin.toolProficiencyId)}</span></div>
      <div><strong>Background equipment</strong><span>${payload.origin.backgroundEquipmentChoice === "A" ? "Equipment package" : "50 GP"}</span></div>
      ${payload.class.fightingStyleFeatId ? `<div><strong>Fighting style</strong><span>${humanize(payload.class.fightingStyleFeatId)}</span></div>` : ""}
      ${payload.class.weaponMasteryIds.length ? `<div><strong>Weapon mastery</strong><span>${payload.class.weaponMasteryIds.map(humanize).join(", ")}</span></div>` : ""}
      <div><strong>Equipment</strong><span>${payload.equipment.map((item) => `${item.quantity} × ${humanize(item.itemId)}`).join(", ")}</span></div>
      <div><strong>Currency</strong><span>${payload.currencyGp} GP</span></div>
      ${seed ? `<div><strong>Generation seed</strong><code>${escapeHtml(seed)}</code></div>` : ""}
    </div>
    <details class="document-inspector"><summary>Inspect native character document</summary><pre>${escapeHtml(JSON.stringify(character, null, 2))}</pre></details>
  `;
}

function renderCharacterFailure(character: CharacterDocument, message: string): void {
  result.classList.remove("empty-result");
  result.innerHTML = `
    <div class="result-heading">
      <div><p class="eyebrow">Character details</p><h2>${escapeHtml(character.displayName)}</h2></div>
      <span class="validation-pill invalid">Validation failed</span>
    </div>
    <p>${escapeHtml(message)}</p>
    <details class="document-inspector"><summary>Inspect retained character document</summary><pre>${escapeHtml(JSON.stringify(character, null, 2))}</pre></details>
  `;
}

function postCharacterToHost(character: CharacterDocument): void {
  if (window.parent === window) return;
  window.parent.postMessage({
    type: CHARACTER_GENERATED_MESSAGE,
    payload: { projectId, character },
  }, hostOrigin ?? "*");
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
