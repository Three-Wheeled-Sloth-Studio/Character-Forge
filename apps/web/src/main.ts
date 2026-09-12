import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import { characterForgeBuildTitle, currentCharacterForgeBuildInfo, visibleCharacterForgeBuildLabel } from "./buildInfo.js";
import {
  buildCharacterMediaRequestMessage,
  parseCharacterMediaContextMessage,
  parseCharacterOpenMessage,
  resolveHostOrigin,
  type CharacterMediaBinary,
  type CharacterMediaRole,
} from "./characterForgeHostBridge.js";
import { createCharacterResultRenderer, type CharacterResultMediaPresentation } from "./characterResultRenderer.js";
import { mountCreatorWorkspace } from "./creatorWorkspace.js";
import {
  creatorSystemsForProjectContext,
  projectContextLocksCreatorSystem,
  readCharacterForgeProjectContext,
} from "./projectContext.js";

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
      <div><p class="eyebrow">Parchment Worlds module</p><h1>Character Forge</h1><p class="muted">Three-Wheeled Sloth Studio</p></div>
      <div class="forge-header-meta">
        ${projectName ? `<div class="project-chip">Project: <strong>${escapeHtml(projectName)}</strong></div>` : ""}
        <span class="build-chip" title="${escapeHtml(characterForgeBuildTitle(buildInfo))}">${escapeHtml(visibleCharacterForgeBuildLabel(buildInfo))}</span>
      </div>
    </header>
    <div class="forge-workspace">
      <aside id="creator-root" class="creator-column" aria-label="Character generation controls"></aside>
      <section id="result" class="result-panel empty-result" aria-live="polite"><div class="empty-state"><p class="eyebrow">Character details</p><h2>Build a character</h2></div></section>
    </div>
  </section>`;

const creatorRootCandidate = document.querySelector<HTMLElement>("#creator-root");
const resultCandidate = document.querySelector<HTMLElement>("#result");
if (!creatorRootCandidate || !resultCandidate) throw new Error("Character Forge workspace failed to initialize.");
const creatorRoot: HTMLElement = creatorRootCandidate;
const resultElement: HTMLElement = resultCandidate;
let currentCharacterId = "";
let mediaObjectUrls: CharacterResultMediaPresentation = {};
const hostedMediaActions = window.parent !== window && !!hostOrigin;
const resultRenderer = createCharacterResultRenderer(resultElement, {
  ...(projectName ? { campaignName: projectName } : {}),
  ...(hostedMediaActions ? { onMediaSlotRequest: requestMediaFromHost } : {}),
});
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
  if (opened && (!projectId || opened.payload.projectId === projectId)) {
    currentCharacterId = opened.payload.character.characterId;
    clearMediaObjectUrls();
    try { creatorController.openCharacter(opened.payload.character); }
    catch { /* The review surface below reports invalid retained native state. */ }
    resultRenderer.render(opened.payload.character);
    return;
  }

  const media = parseCharacterMediaContextMessage(event.data);
  if (!media || (projectId && media.payload.projectId !== projectId) || media.payload.characterId !== currentCharacterId) return;
  applyMediaContext(media.payload.portrait, media.payload.token);
});

window.addEventListener("beforeunload", clearMediaObjectUrls);

function publishCharacter(character: CharacterDocument): void {
  if (currentCharacterId !== character.characterId) clearMediaObjectUrls();
  currentCharacterId = character.characterId;
  resultRenderer.render(character);
  postCharacterToHost(character);
}

function clearRenderedCharacter(): void {
  currentCharacterId = "";
  clearMediaObjectUrls();
  resultRenderer.clear();
}

function applyMediaContext(portrait: CharacterMediaBinary | null, token: CharacterMediaBinary | null): void {
  clearMediaObjectUrls();
  mediaObjectUrls = {
    ...(portrait ? { portraitSrc: objectUrlForMedia(portrait) } : {}),
    ...(token ? { tokenSrc: objectUrlForMedia(token) } : {}),
  };
  resultRenderer.setMedia(mediaObjectUrls);
}

function objectUrlForMedia(media: CharacterMediaBinary): string {
  const buffer = new ArrayBuffer(media.bytes.byteLength);
  new Uint8Array(buffer).set(media.bytes);
  return URL.createObjectURL(new Blob([buffer], { type: media.mediaType }));
}

function clearMediaObjectUrls(): void {
  if (mediaObjectUrls.portraitSrc) URL.revokeObjectURL(mediaObjectUrls.portraitSrc);
  if (mediaObjectUrls.tokenSrc) URL.revokeObjectURL(mediaObjectUrls.tokenSrc);
  mediaObjectUrls = {};
}

function requestMediaFromHost(role: CharacterMediaRole): void {
  if (!hostOrigin || window.parent === window || !projectId || !currentCharacterId) return;
  window.parent.postMessage(buildCharacterMediaRequestMessage(projectId, currentCharacterId, role), hostOrigin);
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
