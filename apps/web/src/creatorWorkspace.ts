import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import { mountBrpCreatorPanel, type BrpCreatorPanelController } from "./brpCreatorPanel.js";
import { clickCreatorRandomizers } from "./creatorRandomization.js";
import {
  defaultDndCreationMode,
  dndCreationModeSupportsRandomizeAll,
  mountDndCreatorPanel,
  type DndCreationMode,
} from "./dndCreatorPanel.js";

export type CreatorSystemId = "dnd5e-2024" | "brp-uge";

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
    return "Randomize All uses the BRP profession suggestion and re-rolls characteristics only when Standard Rolled is selected. Scholar academic suggestions remain field-level. Age, Gender, Wealth, name, and other fields stay unchanged until explicit system-owned distributions exist.";
  }
  if (dndMode === "quick") {
    return "Quick Generate owns its randomization through Generate character. Randomize All is hidden in Quick mode so hidden Guided controls are never invoked.";
  }
  return "Randomize All uses the existing D&D field randomizers and preserves every checked acceptable pool. If Random ability generation is selected, it also rolls a new ability set. Choices without an existing randomizer stay unchanged.";
}

export function mountCreatorWorkspace(
  root: HTMLElement,
  onCharacter: (character: CharacterDocument) => void,
): CreatorWorkspaceController {
  root.innerHTML = `
    <section class="creator-panel creator-system-panel">
      <div class="creator-system-actions">
        <label>Rules system
          <select id="creator-rules-system">
            <option value="dnd5e-2024">D&D 5E 2024</option>
            <option value="brp-uge">BRP UGE</option>
          </select>
        </label>
        <button id="creator-randomize-all" type="button" class="secondary-button">Randomize All</button>
      </div>
      <p id="creator-randomization-help" class="muted"></p>
      <p class="muted">System-specific generation controls stay below. Native rules state remains authoritative.</p>
    </section>
    <div id="creator-system-host"></div>`;

  const systemSelect = requiredElement(root, "#creator-rules-system", HTMLSelectElement);
  const systemHost = requiredElement(root, "#creator-system-host", HTMLElement);
  const randomizeAll = requiredElement(root, "#creator-randomize-all", HTMLButtonElement);
  const randomizationHelp = requiredElement(root, "#creator-randomization-help", HTMLElement);
  let brpController: BrpCreatorPanelController | null = null;
  let dndMode = defaultDndCreationMode();

  const currentSystem = (): CreatorSystemId => systemSelect.value === "brp-uge" ? "brp-uge" : "dnd5e-2024";

  const refreshRandomizationUi = (): void => {
    const available = creatorRandomizeAllAvailable(currentSystem(), dndMode);
    randomizeAll.hidden = !available;
    randomizeAll.disabled = !available;
    randomizationHelp.textContent = creatorRandomizationHelp(currentSystem(), dndMode);
  };

  const renderSystem = (): void => {
    systemHost.innerHTML = "";
    brpController = null;
    if (currentSystem() === "brp-uge") {
      brpController = mountBrpCreatorPanel(systemHost, onCharacter);
      refreshRandomizationUi();
      return;
    }
    mountDndCreatorPanel(systemHost, onCharacter, {
      initialMode: dndMode,
      onModeChange: (mode) => {
        dndMode = mode;
        refreshRandomizationUi();
      },
    });
  };

  systemSelect.value = defaultCreatorSystem();
  systemSelect.addEventListener("change", renderSystem);
  randomizeAll.addEventListener("click", () => {
    if (!creatorRandomizeAllAvailable(currentSystem(), dndMode)) return;
    clickCreatorRandomizers(systemHost, creatorRandomizerSelector(currentSystem()));
  });
  renderSystem();

  return {
    openCharacter(character: CharacterDocument): void {
      const system = creatorSystemForCharacter(character);
      if (!system) return;
      systemSelect.value = system;
      renderSystem();
      if (system === "brp-uge") brpController?.openCharacter(character);
    },
  };
}

function requiredElement<T extends Element>(root: ParentNode, selector: string, type: new () => T): T {
  const element = root.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Required creator workspace element ${selector} was not found.`);
  return element;
}
