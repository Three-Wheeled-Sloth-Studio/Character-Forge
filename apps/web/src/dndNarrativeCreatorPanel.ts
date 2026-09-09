import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  createDnd5eGuidedNarrativeContinuation,
  DND5E_ALIGNMENT_OPTIONS,
  DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
  DND5E_GUIDED_NARRATIVE_QUESTIONS,
  DND5E_SRD_521_BACKGROUND_OPTIONS,
  DND5E_SRD_521_CLASS_OPTIONS,
  DND5E_SRD_521_SPECIES_OPTIONS,
  guidedNarrativeGenerateDnd5eFirstSlice,
  recommendDnd5eGuidedNarrative,
  type Dnd5eGuidedNarrativeAnswers,
  type Dnd5eGuidedNarrativeContinuation,
  type Dnd5eGuidedNarrativeQuestionId,
  type GuidedDnd5eBackgroundId,
  type GuidedDnd5eClassId,
  type GuidedDnd5eSpeciesId,
} from "../../../packages/system-dnd5e/src/index.js";

export interface DndNarrativeToGuidedTransfer {
  name: string;
  continuation: Dnd5eGuidedNarrativeContinuation;
}

export interface DndNarrativeCreatorPanelOptions {
  onContinueToGuided?: (transfer: DndNarrativeToGuidedTransfer) => void;
}

export function mountDndNarrativeCreatorPanel(
  root: HTMLElement,
  onCharacter: (character: CharacterDocument) => void,
  options: DndNarrativeCreatorPanelOptions = {},
): void {
  root.innerHTML = `
    <section class="creator-panel compact-creator dnd-narrative-creator">
      <div class="creator-heading">
        <p class="eyebrow">D&D 5E 2024 - Guided Narrative</p>
        <h2>Start from the character idea</h2>
        <p>Answer a few preference questions, inspect the mapped mechanical suggestions, and override anything you want before building.</p>
      </div>
      <form id="dnd-narrative-form" class="creator-form">
        <label>Character name
          <input id="dnd-narrative-name" type="text" maxlength="80" placeholder="Optional - blank lets Character Forge choose" />
        </label>
        <label>Narrative seed
          <input id="dnd-narrative-seed" type="text" maxlength="160" placeholder="Generated automatically" autocomplete="off" />
        </label>
        <p class="muted">Every narrative question includes <strong>Choose for me</strong>. Narrative choice sets stay small; when the full rules catalog is larger, earlier answers narrow what is shown next.</p>
        ${DND5E_GUIDED_NARRATIVE_QUESTIONS.map(questionHtml).join("")}
        <div class="creator-system-actions">
          <button id="dnd-narrative-choose-again" type="button" class="secondary-button">Choose again</button>
        </div>
        <p id="dnd-narrative-resolution" class="muted"></p>
        <div class="section-divider"></div>
        <fieldset>
          <legend>Mapped mechanical choices</legend>
          <p class="muted">These choices have already been narrowed by your narrative answers. Change a selection within the narrowed set, or change an earlier answer to explore a different branch.</p>
          <label>Class
            <select id="dnd-narrative-class"></select>
          </label>
          <label>Background
            <select id="dnd-narrative-background"></select>
          </label>
          <label>Species
            <select id="dnd-narrative-species"></select>
          </label>
          <p id="dnd-narrative-mapping-summary" class="muted"></p>
        </fieldset>
        <p class="muted">Build now to use the current Guided Narrative defaults, or continue into Guided Mechanical to customize the remaining legal Level 1 choices in the existing detailed editor.</p>
        <p id="dnd-narrative-error" class="form-error" role="alert"></p>
        <div class="creator-system-actions">
          <button id="dnd-narrative-continue-guided" type="button" class="secondary-button">Continue in Guided Mechanical</button>
          <button type="submit" class="primary-action">Build character</button>
        </div>
      </form>
    </section>`;

  const form = requiredElement(root, "#dnd-narrative-form", HTMLFormElement);
  const nameInput = requiredElement(root, "#dnd-narrative-name", HTMLInputElement);
  const seedInput = requiredElement(root, "#dnd-narrative-seed", HTMLInputElement);
  const classSelect = requiredElement(root, "#dnd-narrative-class", HTMLSelectElement);
  const backgroundSelect = requiredElement(root, "#dnd-narrative-background", HTMLSelectElement);
  const speciesSelect = requiredElement(root, "#dnd-narrative-species", HTMLSelectElement);
  const resolution = requiredElement(root, "#dnd-narrative-resolution", HTMLElement);
  const mappingSummary = requiredElement(root, "#dnd-narrative-mapping-summary", HTMLElement);
  const error = requiredElement(root, "#dnd-narrative-error", HTMLElement);
  const continueGuided = requiredElement(root, "#dnd-narrative-continue-guided", HTMLButtonElement);
  continueGuided.hidden = !options.onContinueToGuided;

  const refreshRecommendation = (): void => {
    error.textContent = "";
    try {
      const recommendation = recommendDnd5eGuidedNarrative({
        answers: readAnswers(root),
        seed: seedInput.value,
      });
      seedInput.value = recommendation.seed;
      populateNarrowedCatalog(classSelect, DND5E_SRD_521_CLASS_OPTIONS, recommendation.classChoice.candidateIds, recommendation.classChoice.recommendedId);
      populateNarrowedCatalog(backgroundSelect, DND5E_SRD_521_BACKGROUND_OPTIONS, recommendation.backgroundChoice.candidateIds, recommendation.backgroundChoice.recommendedId);
      populateNarrowedCatalog(speciesSelect, DND5E_SRD_521_SPECIES_OPTIONS, recommendation.speciesChoice.candidateIds, recommendation.speciesChoice.recommendedId);
      resolution.textContent = DND5E_GUIDED_NARRATIVE_QUESTIONS.map((question) => {
        const answer = recommendation.answers[question.id];
        return resolutionText(question.id, answer.submittedId, answer.resolvedId);
      }).join(" | ");
      mappingSummary.textContent = [
        `Class candidates: ${recommendation.classChoice.candidateIds.map((id) => catalogLabel(DND5E_SRD_521_CLASS_OPTIONS, id)).join(", ")}`,
        `Background candidates: ${recommendation.backgroundChoice.candidateIds.map((id) => catalogLabel(DND5E_SRD_521_BACKGROUND_OPTIONS, id)).join(", ")}`,
        `Species candidates: ${recommendation.speciesChoice.candidateIds.map((id) => catalogLabel(DND5E_SRD_521_SPECIES_OPTIONS, id)).join(", ")}`,
        `Alignment: ${catalogLabel(DND5E_ALIGNMENT_OPTIONS, recommendation.alignmentChoice.recommendedId)}`,
      ].join(" | ");
    } catch (caught) {
      error.textContent = caught instanceof Error ? caught.message : "Guided Narrative recommendation failed.";
    }
  };

  const continuationInput = () => ({
    seed: seedInput.value,
    answers: readAnswers(root),
    overrides: {
      classId: classSelect.value as GuidedDnd5eClassId,
      backgroundId: backgroundSelect.value as GuidedDnd5eBackgroundId,
      speciesId: speciesSelect.value as GuidedDnd5eSpeciesId,
    },
  });

  for (const question of DND5E_GUIDED_NARRATIVE_QUESTIONS) {
    requiredElement(root, `#dnd-narrative-${question.id}`, HTMLSelectElement).addEventListener("change", refreshRecommendation);
  }
  seedInput.addEventListener("change", refreshRecommendation);
  requiredElement(root, "#dnd-narrative-choose-again", HTMLButtonElement).addEventListener("click", () => {
    seedInput.value = "";
    refreshRecommendation();
  });

  continueGuided.addEventListener("click", () => {
    error.textContent = "";
    try {
      const continuation = createDnd5eGuidedNarrativeContinuation(continuationInput());
      seedInput.value = continuation.seed;
      options.onContinueToGuided?.({ name: nameInput.value, continuation });
    } catch (caught) {
      error.textContent = caught instanceof Error ? caught.message : "Unable to continue Guided Narrative into Guided Mechanical.";
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.textContent = "";
    try {
      onCharacter(guidedNarrativeGenerateDnd5eFirstSlice({
        name: nameInput.value,
        ...continuationInput(),
      }));
    } catch (caught) {
      error.textContent = caught instanceof Error ? caught.message : "Guided Narrative character generation failed.";
    }
  });

  refreshRecommendation();
}

function questionHtml(question: (typeof DND5E_GUIDED_NARRATIVE_QUESTIONS)[number]): string {
  return `<label>${question.prompt}<select id="dnd-narrative-${question.id}">${question.options.map((option) => `<option value="${option.id}"${option.id === DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID ? " selected" : ""}>${option.label}</option>`).join("")}</select></label>`;
}

function readAnswers(root: ParentNode): Dnd5eGuidedNarrativeAnswers {
  return {
    role: requiredElement(root, "#dnd-narrative-role", HTMLSelectElement).value as Dnd5eGuidedNarrativeAnswers["role"],
    past: requiredElement(root, "#dnd-narrative-past", HTMLSelectElement).value as Dnd5eGuidedNarrativeAnswers["past"],
    heritage: requiredElement(root, "#dnd-narrative-heritage", HTMLSelectElement).value as Dnd5eGuidedNarrativeAnswers["heritage"],
    order: requiredElement(root, "#dnd-narrative-order", HTMLSelectElement).value as Dnd5eGuidedNarrativeAnswers["order"],
    regard: requiredElement(root, "#dnd-narrative-regard", HTMLSelectElement).value as Dnd5eGuidedNarrativeAnswers["regard"],
  };
}

function resolutionText(questionId: Dnd5eGuidedNarrativeQuestionId, submittedId: string, resolvedId: string): string {
  const question = DND5E_GUIDED_NARRATIVE_QUESTIONS.find((entry) => entry.id === questionId);
  const resolvedLabel = question?.options.find((option) => option.id === resolvedId)?.label ?? resolvedId;
  if (submittedId === DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID) return `${question?.prompt ?? questionId} Choose for me -> ${resolvedLabel}`;
  return `${question?.prompt ?? questionId} ${resolvedLabel}`;
}

function populateNarrowedCatalog(
  select: HTMLSelectElement,
  options: readonly { id: string; label: string; guidedSupported: boolean }[],
  candidateIds: readonly string[],
  selectedId: string,
): void {
  const candidates = candidateIds.map((id) => options.find((option) => option.id === id && option.guidedSupported));
  if (candidates.some((option) => !option)) throw new Error("Guided Narrative candidate is not available in the supported catalog.");
  select.innerHTML = candidates.map((option) => `<option value="${option!.id}">${option!.label}</option>`).join("");
  select.value = selectedId;
}

function catalogLabel(options: readonly { id: string; label: string }[], id: string): string {
  return options.find((option) => option.id === id)?.label ?? id;
}

function requiredElement<T extends Element>(root: ParentNode, selector: string, type: new () => T): T {
  const element = root.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Required D&D Guided Narrative creator element ${selector} was not found.`);
  return element;
}
