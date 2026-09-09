import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import { mountBrpCreatorPanel, type BrpCreatorPanelController } from "./brpCreatorPanel.js";
import { mountGuidedCreationPanel } from "./guidedCreationPanel.js";

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

export function mountCreatorWorkspace(
  root: HTMLElement,
  onCharacter: (character: CharacterDocument) => void,
): CreatorWorkspaceController {
  root.innerHTML = `
    <section class="creator-panel creator-system-panel">
      <label>Rules system
        <select id="creator-rules-system">
          <option value="dnd5e-2024">D&D 5E 2024</option>
          <option value="brp-uge">BRP UGE</option>
        </select>
      </label>
      <p class="muted">System-specific generation controls stay below. Native rules state remains authoritative.</p>
    </section>
    <div id="creator-system-host"></div>`;

  const systemSelect = requiredElement(root, "#creator-rules-system", HTMLSelectElement);
  const systemHost = requiredElement(root, "#creator-system-host", HTMLElement);
  let brpController: BrpCreatorPanelController | null = null;

  const renderSystem = (): void => {
    systemHost.innerHTML = "";
    brpController = null;
    if (systemSelect.value === "brp-uge") {
      brpController = mountBrpCreatorPanel(systemHost, onCharacter);
      return;
    }
    mountGuidedCreationPanel(systemHost, onCharacter);
  };

  systemSelect.value = defaultCreatorSystem();
  systemSelect.addEventListener("change", renderSystem);
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
