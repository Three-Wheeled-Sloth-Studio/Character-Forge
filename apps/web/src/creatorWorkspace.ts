import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import type { BrpCreatorPanelController } from "./brpCreatorPanel.js";
import { clickCreatorRandomizers } from "./creatorRandomization.js";
import {
  defaultDndCreationMode,
  dndCreationModeSupportsRandomizeAll,
  type DndCreationMode,
} from "./dndCreatorPanel.js";
import { mountPresentedBrpCreator, mountPresentedDndCreator } from "./creatorPresentationAdapter.js";
import { mountWorkspaceSplitter } from "./workspaceSplitter.js";

export type CreatorSystemId = "dnd5e-2024" | "brp-uge";

export interface CreatorWorkspaceOptions {
  initialSystem?: CreatorSystemId;
  lockedSystem?: CreatorSystemId | null;
  allowedSystems?: CreatorSystemId[];
  onSystemChange?: (system: CreatorSystemId) => void;
}

export interface CreatorWorkspaceController {
  openCharacter(character: CharacterDocument): void;
}

export function defaultCreatorSystem(): CreatorSystemId {
  return "dnd5e-2024";
}

export function creatorSystemForCharacter(character: CharacterDocument): CreatorSystemId | null {
  const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId);
  if (!nativeState) return null;
  if (nativeState.systemId === "dnd5e" && nativeState.editionId === "2024") return "dnd5e-2024";
  if (nativeState.systemId === "brp" && nativeState.editionId === "uge-2023") return "brp-uge";
  return null;
}

export function creatorRandomizerSelector(system: CreatorSystemId): string {
  if (system === "brp-uge") return "#brp-profession-random, #brp-reroll";
  return ".icon-button[id$='-random'], #creator-random-roll";
}

export function creatorRandomizeAllAvailable(
  system: CreatorSystemId,
  dndMode: DndCreationMode = defaultDndCreationMode(),
): boolean {
  return system === "brp-uge" || dndCreationModeSupportsRandomizeAll(dndMode);
}

export function creatorRandomizationHelp(
  system: CreatorSystemId,
  dndMode: DndCreationMode = defaultDndCreationMode(),
): string {
  if (system === "brp-uge") {
    return "Randomize All creates a fresh BRP name, age, gender, profession, legal wealth and electives, characteristics, Scholar specialties, and complete legal skill allocations. Campaign/rules settings, freeform language identities, and finishing details stay authoritative and unchanged.";
  }
  if (dndMode === "quick") {
    return "Quick Generate owns its randomization through Generate character. Randomize All is hidden in Quick mode so hidden Guided controls are never invoked.";
  }
  if (dndMode === "narrative") {
    return "Guided Narrative keeps Randomize All hidden. Every narrative question has its own Choose for me option, resolved from the visible narrative seed, so hidden Guided Mechanical controls are never invoked.";
  }
  return "Randomize All uses the existing D&D field randomizers and preserves every checked acceptable pool. If Random ability generation is selected, it also rolls a new ability set. Choices without an existing randomizer stay unchanged.";
}

export function mountCreatorWorkspace(
  root: HTMLElement,
  onCharacter: (character: CharacterDocument) => void,
  options: CreatorWorkspaceOptions = {},
): CreatorWorkspaceController {
  mountCreatorWorkspaceSplitter(root);
  const allowedSystems = normalizeAllowedSystems(options.allowedSystems);
  const lockedSystem = options.lockedSystem && allowedSystems.includes(options.lockedSystem)
    ? options.lockedSystem
    : null;
  const initialSystem = lockedSystem
    ?? (options.initialSystem && allowedSystems.includes(options.initialSystem) ? options.initialSystem : null)
    ?? (allowedSystems.includes(defaultCreatorSystem()) ? defaultCreatorSystem() : allowedSystems[0]!);
  const systemOptions = allowedSystems.map((system) => `<option value="${system}">${creatorSystemLabel(system)}</option>`).join("");
  const systemSelector = lockedSystem
    ? `<select id="creator-rules-system" hidden aria-hidden="true">${systemOptions}</select>`
    : `<label>Rules system<select id="creator-rules-system">${systemOptions}</select></label>`;

  root.innerHTML = `
    <section class="creator-panel creator-system-panel${lockedSystem ? " creator-system-panel-locked" : ""}">
      <div class="creator-system-actions">
        ${systemSelector}
        <button id="creator-randomize-all" type="button" class="secondary-button icon-button creator-randomize-all" title="Randomize All" aria-label="Randomize All"><span aria-hidden="true">⚄<sup>⚅</sup></span></button>
      </div>
    </section>
    <div id="creator-system-host"></div>`;

  const systemSelect = requiredElement(root, "#creator-rules-system", HTMLSelectElement);
  const systemHost = requiredElement(root, "#creator-system-host", HTMLElement);
  const randomizeAll = requiredElement(root, "#creator-randomize-all", HTMLButtonElement);
  let brpController: BrpCreatorPanelController | null = null;
  let dndMode = defaultDndCreationMode();
  let disposePresentation: (() => void) | null = null;

  const currentSystem = (): CreatorSystemId => systemSelect.value === "brp-uge" ? "brp-uge" : "dnd5e-2024";

  const refreshRandomizationUi = (): void => {
    const available = creatorRandomizeAllAvailable(currentSystem(), dndMode);
    const help = creatorRandomizationHelp(currentSystem(), dndMode);
    randomizeAll.hidden = !available;
    randomizeAll.disabled = !available;
    randomizeAll.title = help;
    randomizeAll.setAttribute("aria-label", available ? `Randomize All. ${help}` : "Randomize All unavailable in this creation mode");
  };

  const renderSystem = (): void => {
    disposePresentation?.();
    disposePresentation = null;
    systemHost.innerHTML = "";
    brpController = null;
    if (currentSystem() === "brp-uge") {
      const presented = mountPresentedBrpCreator(systemHost, onCharacter);
      brpController = presented.controller;
      disposePresentation = presented.dispose;
      refreshRandomizationUi();
      return;
    }
    mountPresentedDndCreator(systemHost, onCharacter, {
      initialMode: dndMode,
      onModeChange: (mode) => {
        dndMode = mode;
        refreshRandomizationUi();
      },
    });
  };

  systemSelect.value = initialSystem;
  systemSelect.addEventListener("change", () => {
    renderSystem();
    options.onSystemChange?.(currentSystem());
  });
  randomizeAll.addEventListener("click", () => {
    if (!creatorRandomizeAllAvailable(currentSystem(), dndMode)) return;
    if (currentSystem() === "brp-uge") {
      brpController?.randomizeAll();
      return;
    }
    clickCreatorRandomizers(systemHost, creatorRandomizerSelector(currentSystem()));
  });
  renderSystem();

  return {
    openCharacter(character: CharacterDocument): void {
      const system = creatorSystemForCharacter(character);
      if (!system || !allowedSystems.includes(system)) return;
      systemSelect.value = system;
      renderSystem();
      if (system === "brp-uge") brpController?.openCharacter(character);
    },
  };
}

function normalizeAllowedSystems(systems: CreatorSystemId[] | undefined): CreatorSystemId[] {
  const all: CreatorSystemId[] = ["dnd5e-2024", "brp-uge"];
  const filtered = systems?.filter((system, index) => all.includes(system) && systems.indexOf(system) === index) ?? [];
  return filtered.length ? filtered : all;
}

function creatorSystemLabel(system: CreatorSystemId): string {
  return system === "brp-uge" ? "BRP UGE" : "D&D 5E 2024";
}

function mountCreatorWorkspaceSplitter(root: HTMLElement): void {
  const workspace = root.parentElement;
  if (!workspace?.classList.contains("forge-workspace")) return;
  const existing = workspace.querySelector<HTMLElement>(".workspace-splitter");
  if (existing) return;
  const splitter = document.createElement("div");
  splitter.className = "workspace-splitter";
  splitter.tabIndex = 0;
  splitter.setAttribute("role", "separator");
  splitter.setAttribute("aria-orientation", "vertical");
  splitter.setAttribute("aria-label", "Resize character generation and character details panels");
  splitter.title = "Drag to resize panels";
  root.insertAdjacentElement("afterend", splitter);
  mountWorkspaceSplitter(workspace, splitter);
}

function requiredElement<T extends Element>(root: ParentNode, selector: string, type: new () => T): T {
  const element = root.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Required creator workspace element ${selector} was not found.`);
  return element;
}
