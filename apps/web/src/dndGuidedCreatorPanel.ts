import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  applyDnd5eGuidedNarrativeContinuation,
  applyDnd5eNameSuggestion,
  isGuidedDnd5eClassId,
  matchingDnd5eNameSuggestion,
  resolveDnd5eGuidedNarrativeEquipmentChoices,
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
  let narrativeObserver: MutationObserver | null = null;
  let narrativeAlignmentTouched = false;
  let narrativeClassEquipmentTouched = false;
  let narrativeBackgroundEquipmentTouched = false;
  let narrativeInteractionTargets = new WeakSet<EventTarget>();

  const mountGuided = (): void => {
    narrativeObserver?.disconnect();
    narrativeObserver = null;
    narrativeAlignmentTouched = false;
    narrativeClassEquipmentTouched = false;
    narrativeBackgroundEquipmentTouched = false;
    narrativeInteractionTargets = new WeakSet<EventTarget>();

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
      const markTouched = (target: EventTarget | null, eventName: "change" | "click", onTouch: () => void): void => {
        if (!target || narrativeInteractionTargets.has(target)) return;
        narrativeInteractionTargets.add(target);
        target.addEventListener(eventName, onTouch);
      };

      const applyNarrativeInitialization = (): void => {
        if (!narrativeContinuation) return;

        if (!narrativeAlignmentTouched) {
          const alignmentSelect = root.querySelector<HTMLSelectElement>("#creator-alignment");
          if (alignmentSelect) {
            const alignmentId = narrativeContinuation.initialChoices.alignmentId;
            if ([...alignmentSelect.options].some((option) => option.value === alignmentId)) alignmentSelect.value = alignmentId;
            markTouched(alignmentSelect, "change", () => { narrativeAlignmentTouched = true; });
            markTouched(root.querySelector<HTMLButtonElement>("#creator-alignment-random"), "click", () => { narrativeAlignmentTouched = true; });
            for (const checkbox of root.querySelectorAll<HTMLInputElement>("[data-core-pool='alignment']")) {
              markTouched(checkbox, "change", () => { narrativeAlignmentTouched = true; });
            }
          }
        }

        const classSelect = root.querySelector<HTMLSelectElement>("#creator-class-selected");
        const currentClassId = classSelect?.value;
        const equipmentChoices = currentClassId && isGuidedDnd5eClassId(currentClassId)
          ? resolveDnd5eGuidedNarrativeEquipmentChoices(narrativeContinuation.answers.equipment.resolvedId, currentClassId)
          : null;

        if (!narrativeClassEquipmentTouched && equipmentChoices) {
          const classEquipmentSelect = root.querySelector<HTMLSelectElement>("#creator-class-equipment");
          if (classEquipmentSelect) {
            if ([...classEquipmentSelect.options].some((option) => option.value === equipmentChoices.classEquipmentChoice)) {
              classEquipmentSelect.value = equipmentChoices.classEquipmentChoice;
            }
            markTouched(classEquipmentSelect, "change", () => { narrativeClassEquipmentTouched = true; });
            markTouched(root.querySelector<HTMLButtonElement>("#creator-class-equipment-random"), "click", () => { narrativeClassEquipmentTouched = true; });
            for (const checkbox of root.querySelectorAll<HTMLInputElement>("[data-core-pool='class-equipment']")) {
              markTouched(checkbox, "change", () => { narrativeClassEquipmentTouched = true; });
            }
          }
        }

        if (!narrativeBackgroundEquipmentTouched && equipmentChoices) {
          const backgroundEquipmentSelect = root.querySelector<HTMLSelectElement>("#creator-background-equipment");
          if (backgroundEquipmentSelect) {
            if ([...backgroundEquipmentSelect.options].some((option) => option.value === equipmentChoices.backgroundEquipmentChoice)) {
              backgroundEquipmentSelect.value = equipmentChoices.backgroundEquipmentChoice;
            }
            markTouched(backgroundEquipmentSelect, "change", () => { narrativeBackgroundEquipmentTouched = true; });
          }
        }
      };

      applyNarrativeInitialization();
      narrativeObserver = new MutationObserver(() => applyNarrativeInitialization());
      narrativeObserver.observe(root, { childList: true, subtree: true });

      const heading = root.querySelector<HTMLElement>(".creator-heading");
      const note = document.createElement("p");
      note.className = "muted";
      note.textContent = "Started from Guided Narrative. Class, Background, Species, Alignment, and starting equipment were initialized from that result; later Guided Mechanical edits are authoritative.";
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