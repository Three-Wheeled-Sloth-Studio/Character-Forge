import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  applyDnd5eGuidedNarrativeContinuation,
  applyDnd5eNameSuggestion,
  matchingDnd5eNameSuggestion,
  suggestDnd5eCharacterName,
  type Dnd5eGuidedNarrativeContinuation,
  type Dnd5eNameSuggestion,
} from "../../../packages/system-dnd5e/src/index.js";
import { mountGuidedCreationPanel } from "./guidedCreationPanel.js";
import { setTransientChoicePoolSelection } from "./stickyChoicePool.js";

const CLASS_STORAGE_KEY = "character-forge.dnd5e.guided.class-pool.v1";
const BACKGROUND_STORAGE_KEY = "character-forge.dnd5e.guided.background-pool.v1";
const SPECIES_STORAGE_KEY = "character-forge.dnd5e.guided.species-pool.v1";

export interface DndGuidedNarrativeInitialization {
  name: string;
  continuation: Dnd5eGuidedNarrativeContinuation;
}

export interface DndGuidedCreatorController {
  initializeFromNarrative(initialization: DndGuidedNarrativeInitialization): void;
}

export function mountDndGuidedCreatorPanel(
  root: HTMLElement,
  onCharacter: (character: CharacterDocument) => void,
): DndGuidedCreatorController {
  let nameSuggestion: Dnd5eNameSuggestion | null = null;
  let narrativeContinuation: Dnd5eGuidedNarrativeContinuation | null = null;

  const mountGuided = (): void => {
    mountGuidedCreationPanel(root, (character) => {
      const current = matchingDnd5eNameSuggestion(character.displayName, nameSuggestion);
      const withNameProvenance = current
        ? applyDnd5eNameSuggestion(character, current, "explicit-randomize")
        : character;
      onCharacter(narrativeContinuation
        ? applyDnd5eGuidedNarrativeContinuation(withNameProvenance, narrativeContinuation)
        : withNameProvenance);
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

    if (narrativeContinuation) {
      const heading = root.querySelector<HTMLElement>(".creator-heading");
      const note = document.createElement("p");
      note.className = "muted";
      note.textContent = "Started from Guided Narrative. Class, Background, and Species were initialized from that result; later Guided Mechanical edits are authoritative.";
      heading?.append(note);
    }
  };

  mountGuided();

  return {
    initializeFromNarrative(initialization): void {
      narrativeContinuation = initialization.continuation;
      nameSuggestion = null;
      setTransientChoicePoolSelection(CLASS_STORAGE_KEY, initialization.continuation.initialChoices.classId);
      setTransientChoicePoolSelection(BACKGROUND_STORAGE_KEY, initialization.continuation.initialChoices.backgroundId);
      setTransientChoicePoolSelection(SPECIES_STORAGE_KEY, initialization.continuation.initialChoices.speciesId);
      mountGuided();
      const nameInput = root.querySelector<HTMLInputElement>("#creator-name");
      if (!nameInput) throw new Error("D&D guided creator name control is missing after Narrative continuation.");
      nameInput.value = initialization.name;
    },
  };
}
