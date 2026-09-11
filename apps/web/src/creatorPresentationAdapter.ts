import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import { mountBrpCreatorPanel, type BrpCreatorPanelController } from "./brpCreatorPanel.js";
import {
  mountDndCreatorPanel,
  type DndCreatorPanelOptions,
} from "./dndCreatorPanel.js";
import { applyPrimaryCreatorMinimalism } from "./primaryUiMinimalism.js";

export interface PresentedBrpCreator {
  controller: BrpCreatorPanelController;
  dispose(): void;
}

export function mountPresentedBrpCreator(
  root: HTMLElement,
  onCharacter: (character: CharacterDocument) => void,
): PresentedBrpCreator {
  const observer = new MutationObserver(() => applyPrimaryCreatorMinimalism(root));
  observer.observe(root, { childList: true, subtree: true });
  const controller = mountBrpCreatorPanel(root, onCharacter);
  applyPrimaryCreatorMinimalism(root);
  return {
    controller,
    dispose(): void {
      observer.disconnect();
    },
  };
}

export function mountPresentedDndCreator(
  root: HTMLElement,
  onCharacter: (character: CharacterDocument) => void,
  options: DndCreatorPanelOptions = {},
): void {
  mountDndCreatorPanel(root, onCharacter, {
    ...options,
    onModeChange: (mode) => {
      options.onModeChange?.(mode);
      applyPrimaryCreatorMinimalism(root);
    },
  });
  applyPrimaryCreatorMinimalism(root);
}
