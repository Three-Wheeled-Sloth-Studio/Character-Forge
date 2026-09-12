import { renderCharacterSheet, type CharacterSheetDescriptor } from "../../../packages/character-sheet/src/index.js";
import type { CharacterDocument, NativeSystemState } from "../../../packages/character-model/src/index.js";
import { buildBrpCharacterSheet, brpUge105Adapter } from "../../../packages/system-brp/src/index.js";
import { buildDnd5eCharacterSheet, dnd5eSrd521Adapter } from "../../../packages/system-dnd5e/src/index.js";
import {
  bindCharacterDocumentControls,
  characterDocumentControlsHtml,
  characterDocumentJson,
} from "./characterSheetControls.js";
import { SHEET_TOOLBAR_STYLES } from "./sheetToolbarStyles.js";
import type { CharacterMediaRole } from "./characterForgeHostBridge.js";

export interface CharacterResultMediaPresentation {
  portraitSrc?: string;
  tokenSrc?: string;
}

export interface CharacterResultRendererOptions {
  campaignName?: string;
  onMediaSlotRequest?: (role: CharacterMediaRole) => void;
}

export interface CharacterResultRenderer {
  clear(): void;
  render(character: CharacterDocument): void;
  setMedia(media: CharacterResultMediaPresentation): void;
}

export function createCharacterResultRenderer(
  resultElement: HTMLElement,
  options: CharacterResultRendererOptions = {},
): CharacterResultRenderer {
  let currentCharacter: CharacterDocument | null = null;
  let media: CharacterResultMediaPresentation = {};

  const clear = (): void => {
    currentCharacter = null;
    media = {};
    resultElement.classList.add("empty-result");
    resultElement.innerHTML = `<div class="empty-state"><p class="eyebrow">Character details</p><h2>Build a character</h2></div>`;
  };

  const render = (character: CharacterDocument): void => {
    if (currentCharacter?.characterId !== character.characterId) media = {};
    currentCharacter = character;
    renderCharacter(resultElement, character, options, media);
  };

  const setMedia = (next: CharacterResultMediaPresentation): void => {
    media = { ...next };
    if (currentCharacter) renderCharacter(resultElement, currentCharacter, options, media);
  };

  return { clear, render, setMedia };
}

function renderCharacter(
  resultElement: HTMLElement,
  character: CharacterDocument,
  options: CharacterResultRendererOptions,
  media: CharacterResultMediaPresentation,
): void {
  const nativeState = character.nativeStates.find((state) => state.id === character.primaryNativeStateId);
  if (!nativeState) {
    renderCharacterFailure(resultElement, character, "The primary native state is missing from this character document.");
    return;
  }
  if (nativeState.systemId === dnd5eSrd521Adapter.systemId && nativeState.editionId === dnd5eSrd521Adapter.editionId) {
    renderDnd5eCharacter(resultElement, character, nativeState, options, media);
    return;
  }
  if (nativeState.systemId === brpUge105Adapter.systemId && nativeState.editionId === brpUge105Adapter.editionId) {
    renderBrpCharacter(resultElement, character, nativeState, options, media);
    return;
  }
  renderCharacterFailure(resultElement, character, `This Character Forge build cannot open ${nativeState.systemId} ${nativeState.editionId}.`);
}

function renderDnd5eCharacter(
  resultElement: HTMLElement,
  character: CharacterDocument,
  nativeState: NativeSystemState,
  options: CharacterResultRendererOptions,
  media: CharacterResultMediaPresentation,
): void {
  const validation = dnd5eSrd521Adapter.validateNativeState(nativeState);
  if (!validation.valid) {
    renderCharacterFailure(
      resultElement,
      character,
      validation.issues.map((issue) => issue.message).join(" ") || "D&D native state validation failed.",
    );
    return;
  }
  renderDedicatedSheet(resultElement, character, buildDnd5eCharacterSheet(character), options, media);
}

function renderBrpCharacter(
  resultElement: HTMLElement,
  character: CharacterDocument,
  nativeState: NativeSystemState,
  options: CharacterResultRendererOptions,
  media: CharacterResultMediaPresentation,
): void {
  const validation = brpUge105Adapter.validateNativeState(nativeState);
  if (!validation.valid) {
    renderCharacterFailure(
      resultElement,
      character,
      validation.issues.map((issue) => issue.message).join(" ") || "BRP native state validation failed.",
    );
    return;
  }
  renderDedicatedSheet(resultElement, character, buildBrpCharacterSheet(character), options, media);
}

function renderDedicatedSheet(
  resultElement: HTMLElement,
  character: CharacterDocument,
  sheet: CharacterSheetDescriptor,
  options: CharacterResultRendererOptions,
  media: CharacterResultMediaPresentation,
): void {
  const sheetHtml = renderCharacterSheet(sheet, {
    ...(options.campaignName ? { campaignName: options.campaignName } : {}),
    ...(media.portraitSrc ? { portraitSrc: media.portraitSrc } : {}),
    ...(media.tokenSrc ? { tokenSrc: media.tokenSrc } : {}),
  });
  resultElement.classList.remove("empty-result");
  resultElement.innerHTML = `
    <style data-sheet-toolbar-styles>${SHEET_TOOLBAR_STYLES}</style>
    ${characterDocumentControlsHtml(true, true)}
    ${sheetHtml}
    <details class="document-inspector no-print"><summary>Inspect native character document</summary><pre>${escapeHtml(characterDocumentJson(character))}</pre></details>`;
  bindCharacterDocumentControls(resultElement, character, () => printableSheetFromResult(resultElement, sheetHtml));
  bindMediaSlotActions(resultElement, options.onMediaSlotRequest);
}

function bindMediaSlotActions(
  resultElement: HTMLElement,
  onRequest: CharacterResultRendererOptions["onMediaSlotRequest"],
): void {
  if (!onRequest) return;
  bindMediaSlot(resultElement, "portrait", onRequest);
  bindMediaSlot(resultElement, "token", onRequest);
}

function bindMediaSlot(
  resultElement: HTMLElement,
  role: CharacterMediaRole,
  onRequest: (role: CharacterMediaRole) => void,
): void {
  const slot = resultElement.querySelector<HTMLElement>(`.sheet-media-slot-${role}`);
  if (!slot) return;
  const verb = slot.classList.contains("has-image") ? "Replace" : "Add";
  const label = `${verb} character ${role}`;
  slot.dataset.sheetMediaAction = role;
  slot.dataset.sheetMediaActionLabel = label;
  slot.setAttribute("role", "button");
  slot.setAttribute("tabindex", "0");
  slot.setAttribute("title", label);
  slot.setAttribute("aria-label", label);
  slot.addEventListener("click", () => onRequest(role));
  slot.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onRequest(role);
  });
}

function printableSheetFromResult(resultElement: HTMLElement, fallback: string): string {
  const style = resultElement.querySelector<HTMLStyleElement>("style[data-character-sheet-styles]")?.outerHTML ?? "";
  const sheet = resultElement.querySelector<HTMLElement>(".character-sheet")?.outerHTML ?? "";
  return style && sheet ? `${style}${sheet}` : fallback;
}

function renderCharacterFailure(
  resultElement: HTMLElement,
  character: CharacterDocument,
  message: string,
): void {
  resultElement.classList.remove("empty-result");
  resultElement.innerHTML = `<div class="result-heading"><div><p class="eyebrow">Character details</p><h2>${escapeHtml(character.displayName)}</h2></div><span class="validation-pill invalid">Validation failed</span></div><p>${escapeHtml(message)}</p><details class="document-inspector"><summary>Inspect retained character document</summary><pre>${escapeHtml(characterDocumentJson(character))}</pre></details>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
