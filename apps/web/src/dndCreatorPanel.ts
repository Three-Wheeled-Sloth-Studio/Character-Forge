import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import { mountDndGuidedCreatorPanel } from "./dndGuidedCreatorPanel.js";
import { mountDndQuickCreatorPanel } from "./dndQuickCreatorPanel.js";
import { mountDndRandomAbilityUx } from "./dndRandomAbilityUx.js";

export type DndCreationMode = "guided" | "quick";

export const DND_CREATION_MODE_OPTIONS = [
  { id: "guided", label: "Guided Mechanical" },
  { id: "quick", label: "Quick Generate" },
] as const satisfies readonly { id: DndCreationMode; label: string }[];

export interface DndCreatorPanelOptions {
  initialMode?: DndCreationMode;
  onModeChange?: (mode: DndCreationMode) => void;
}

export function defaultDndCreationMode(): DndCreationMode {
  return "guided";
}

export function dndCreationModeSupportsRandomizeAll(mode: DndCreationMode): boolean {
  return mode === "guided";
}

export function mountDndCreatorPanel(
  root: HTMLElement,
  onCharacter: (character: CharacterDocument) => void,
  options: DndCreatorPanelOptions = {},
): void {
  const initialMode = options.initialMode ?? defaultDndCreationMode();
  root.innerHTML = `
    <section class="creator-panel creator-mode-panel">
      <label>Creation mode
        <select id="dnd-creation-mode">
          ${DND_CREATION_MODE_OPTIONS.map((entry) => `<option value="${entry.id}">${entry.label}</option>`).join("")}
        </select>
      </label>
      <p class="muted">Guided Mechanical exposes detailed character choices. Quick Generate uses the existing system-owned first-slice generator.</p>
    </section>
    <div id="dnd-guided-mode-host"></div>
    <div id="dnd-quick-mode-host"></div>`;

  const modeSelect = requiredElement(root, "#dnd-creation-mode", HTMLSelectElement);
  const guidedHost = requiredElement(root, "#dnd-guided-mode-host", HTMLElement);
  const quickHost = requiredElement(root, "#dnd-quick-mode-host", HTMLElement);

  mountDndGuidedCreatorPanel(guidedHost, onCharacter);
  mountDndRandomAbilityUx(guidedHost);
  mountDndQuickCreatorPanel(quickHost, onCharacter);

  const applyMode = (mode: DndCreationMode): void => {
    modeSelect.value = mode;
    guidedHost.hidden = mode !== "guided";
    quickHost.hidden = mode !== "quick";
    options.onModeChange?.(mode);
  };

  modeSelect.addEventListener("change", () => {
    applyMode(modeSelect.value === "quick" ? "quick" : "guided");
  });

  applyMode(initialMode);
}

function requiredElement<T extends Element>(root: ParentNode, selector: string, type: new () => T): T {
  const element = root.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Required D&D creator element ${selector} was not found.`);
  return element;
}
