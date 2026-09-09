import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  applyDnd5eNameSuggestion,
  matchingDnd5eNameSuggestion,
  suggestDnd5eCharacterName,
  type Dnd5eNameSuggestion,
} from "../../../packages/system-dnd5e/src/index.js";
import { mountGuidedCreationPanel } from "./guidedCreationPanel.js";

export function mountDndGuidedCreatorPanel(
  root: HTMLElement,
  onCharacter: (character: CharacterDocument) => void,
): void {
  let nameSuggestion: Dnd5eNameSuggestion | null = null;

  mountGuidedCreationPanel(root, (character) => {
    const current = matchingDnd5eNameSuggestion(character.displayName, nameSuggestion);
    onCharacter(current ? applyDnd5eNameSuggestion(character, current, "explicit-randomize") : character);
  });

  const nameInput = root.querySelector<HTMLInputElement>("#creator-name");
  const randomButton = root.querySelector<HTMLButtonElement>("#creator-name-random");
  if (!nameInput || !randomButton) throw new Error("D&D guided creator name controls are missing.");

  randomButton.addEventListener("click", (event) => {
    event.stopImmediatePropagation();
    nameSuggestion = suggestDnd5eCharacterName();
    nameInput.value = nameSuggestion.result.displayName;
  }, { capture: true });

  nameInput.addEventListener("input", () => {
    nameSuggestion = null;
  });
}
