import { renderCharacterSheet } from "../../../packages/character-sheet/src/index.js";
import type { CharacterDocument, NativeSystemState } from "../../../packages/character-model/src/index.js";
import { buildBrpCharacterSheet, brpUge105Adapter } from "../../../packages/system-brp/src/index.js";
import { buildDnd5eCharacterSheet, dnd5eSrd521Adapter } from "../../../packages/system-dnd5e/src/index.js";
import { characterForgeBuildTitle, currentCharacterForgeBuildInfo, visibleCharacterForgeBuildLabel } from "./buildInfo.js";
import {
  bindCharacterDocumentControls,
  characterDocumentControlsHtml,
  characterDocumentJson,
} from "./characterSheetControls.js";
import { parseCharacterOpenMessage, resolveHostOrigin } from "./characterForgeHostBridge.js";
import { mountCreatorWorkspace } from "./creatorWorkspace.js";
import {
  creatorSystemsForProjectContext,
  projectContextLocksCreatorSystem,
  readCharacterForgeProjectContext,
} from "./projectContext.js";
import { SHEET_TOOLBAR_STYLES } from "./sheetToolbarStyles.js";

const CHARACTER_GENERATED_MESSAGE = "character-forge:character-generated";
const params = new URLSearchParams(window.location.search);
const projectContext = readCharacterForgeProjectContext(params);
const projectId = projectContext.projectId;
const projectName = projectContext.projectName;
const returnUrl = params.get("pwReturnUrl") ?? "";
const hostOrigin = resolveHostOrigin(returnUrl);
const buildInfo = currentCharacterForgeBuildInfo();
const app = document.querySelector<HTMLElement>("#app");
if (!app) throw new Error("Character Forge application root was not found.");

app.innerHTML = `
  <section class="forge-shell">
    <header class="forge-header">
      <div><p class="eyebrow">Parchment Worlds module</p><h1>Character Forge</h1><p class="lede">Create a system-native character first. Translation magic comes later.</p></div>
      <div class="forge-header-meta">
        ${projectName ? `<div class="project-chip">Project: <strong>${escapeHtml(projectName)}</strong></div>` : ""}
        <span class="build-chip" title="${escapeHtml(characterForgeBuildTitle(buildInfo))}">${escapeHtml(visibleCharacterForgeBuildLabel(buildInfo))}</span>
      </div>
    </header>
    <div class="forge-workspace">
      <aside id="creator-root" class="creator-column" aria-label="Character generation controls"></aside>
      <section id="result" class="result-panel empty-result" aria-live="polite"><div class="empty-state"><p class="eyebrow">Character details</p><h2>Build a character</h2><p>Your generated character will stay visible here while you adjust generation choices on the left.</p></div></section>
    </div>
  </section>`;

const creatorRootCandidate = document.querySelector<HTMLElement>("#creator-root");
const resultCandidate = document.querySelector<HTMLElement>("#result");
if (!creatorRootCandidate || !resultCandidate) throw new Error("Character Forge workspace failed to initialize.");
const creatorRoot: HTMLElement = creatorRootCandidate;
const resultElement: HTMLElement = resultCandidate;
const projectSystems = creatorSystemsForProjectContext(projectContext);
const lockedProjectSystem = projectContextLocksCreatorSystem(projectContext);
const creatorController = mountCreatorWorkspace(creatorRoot, publishCharacter, {
  ...(projectSystems.length ? { allowedSystems: projectSystems } : {}),
  ...(lockedProjectSystem ? { initialSystem: lockedProjectSystem, lockedSystem: lockedProjectSystem } : {}),
  onSystemChange: clearRenderedCharacter,
});

window.addEventListener("message", (event: MessageEvent<unknown>) => {
  if (window.parent === window || event.source !== window.parent || !hostOrigin || event.origin !== hostOrigin) return;
  const opened = parseCharacterOpenMessage(event.data);
  if (!opened || (projectId && opened.payload.projectId !== projectId)) return;
  try { creatorController.openCharacter(opened.payload.character); }
  catch { /* The review surface below reports invalid retained native state. */ }
  renderCharacter(opened.payload.character);
});

function publishCharacter(character: CharacterDocument): void {
  renderCharacter(character);
  postCharacterToHost(character);
}

function clearRenderedCharacter(): void {
  resultElement.classList.add("empty-result");
  resultElement.innerHTML = `<div class="empty-state"><p class="eyebrow">Character details</p><h2>Build a character</h2><p>Generate a character for the selected rules system to review it here.</p></div>`;
}

function renderCharacter(character: CharacterDocument): void {
  const nativeState = character.nativeStates.find((state) => state.id === character.primaryNativeStateId);
  if (!nativeState) {
    renderCharacterFailure(character, "The primary native state is missing from this character document.");
    return;
  }
  if (nativeState.systemId === dnd5eSrd521Adapter.systemId && nativeState.editionId === dnd5eSrd521Adapter.editionId) {
    renderDnd5eCharacter(character, nativeState);
    return;
  }
  if (nativeState.systemId === brpUge105Adapter.systemId && nativeState.editionId === brpUge105Adapter.editionId) {
    renderBrpCharacter(character, nativeState);
    return;
  }
  renderCharacterFailure(character, `This Character Forge build cannot open ${nativeState.systemId} ${nativeState.editionId}.`);
}

function renderDnd5eCharacter(character: CharacterDocument, nativeState: NativeSystemState): void {
  const validation = dnd5eSrd521Adapter.validateNativeState(nativeState);
  if (!validation.valid) {
    renderCharacterFailure(character, validation.issues.map((issue) => issue.message).join(" ") || "D&D native state validation failed.");
    return;
  }

  renderDedicatedSheet(character, buildDnd5eCharacterSheet(character));
}

function renderBrpCharacter(character: CharacterDocument, nativeState: NativeSystemState): void {
  const validation = brpUge105Adapter.validateNativeState(nativeState);
  if (!validation.valid) {
    renderCharacterFailure(character, validation.issues.map((issue) => issue.message).join(" ") || "BRP native state validation failed.");
    return;
  }

  renderDedicatedSheet(character, buildBrpCharacterSheet(character));
}

function renderDedicatedSheet(character: CharacterDocument, sheet: ReturnType<typeof buildBrpCharacterSheet>): void {
  const sheetHtml = renderCharacterSheet(sheet, {
    ...(projectName ? { campaignName: projectName } : {}),
  });
  resultElement.classList.remove("empty-result");
  resultElement.innerHTML = `
    <style data-sheet-toolbar-styles>${SHEET_TOOLBAR_STYLES}</style>
    ${characterDocumentControlsHtml(true, true)}
    ${sheetHtml}
    <details class="document-inspector no-print"><summary>Inspect native character document</summary><pre>${escapeHtml(characterDocumentJson(character))}</pre></details>`;
  bindCharacterDocumentControls(resultElement, character, () => printableSheetFromResult(sheetHtml));
}

function printableSheetFromResult(fallback: string): string {
  const style = resultElement.querySelector<HTMLStyleElement>("style[data-character-sheet-styles]")?.outerHTML ?? "";
  const sheet = resultElement.querySelector<HTMLElement>(".character-sheet")?.outerHTML ?? "";
  return style && sheet ? `${style}${sheet}` : fallback;
}

function renderCharacterFailure(character: CharacterDocument, message: string): void {
  resultElement.classList.remove("empty-result");
  resultElement.innerHTML = `<div class="result-heading"><div><p class="eyebrow">Character details</p><h2>${escapeHtml(character.displayName)}</h2></div><span class="validation-pill invalid">Validation failed</span></div><p>${escapeHtml(message)}</p><details class="document-inspector"><summary>Inspect retained character document</summary><pre>${escapeHtml(characterDocumentJson(character))}</pre></details>`;
}

function postCharacterToHost(character: CharacterDocument): void {
  if (window.parent !== window) {
    window.parent.postMessage({ type: CHARACTER_GENERATED_MESSAGE, payload: { projectId, character } }, hostOrigin ?? "*");
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
