import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  applyBrpFinishingDetails,
  applyBrpProfessionSuggestion,
  applyBrpScholarAcademicSuggestion,
  applyBrpStartingEquipment,
  createEmptyBrpFinishingDetails,
  defaultBrpWealthForProfession,
  filterBrpStartingEquipmentSelection,
  isBrpCampaignProfileId,
  readBrpFinishingDetails,
  readBrpProfessionSuggestion,
  readBrpScholarAcademicSuggestions,
  readBrpStartingEquipment,
  suggestBrpProfession,
  suggestBrpScholarAcademicSkill,
  type BrpAcademicSkillSelection,
  type BrpAthleteElectiveSkillKey,
  type BrpCharacteristicId,
  type BrpDetectiveElectiveSkillKey,
  type BrpEquipmentId,
  type BrpFinishingDetails,
  type BrpFirstSliceSkillKey,
  type BrpProfessionId,
  type BrpProfessionSuggestionProvenance,
  type BrpScholarAcademicSuggestionRecord,
  type BrpWealthLevel,
} from "../../../packages/system-brp/src/index.js";
import { randomizeBrpCreatorState } from "./brpCreatorRandomization.js";
import {
  autoAllocateBrpCreatorState,
  createDefaultBrpCreatorState,
  previewBrpCreatorState,
  reopenBrpCreatorState,
  rerollBrpCreatorState,
  selectBrpCampaignProfile,
  type BrpCreatorState,
} from "./brpCreatorState.js";
import { mountBrpEquipmentControls } from "./brpEquipmentControls.js";
import { mountBrpFinishingControls } from "./brpFinishingControls.js";
import { brpCreatorHtml, readBrpRedistribution } from "./brpCreatorPanelView.js";
import { ensureBrpCreatorStyles } from "./brpCreatorStyles.js";

export interface BrpCreatorPanelController {
  openCharacter(character: CharacterDocument): void;
  randomizeAll(): void;
}

export function mountBrpCreatorPanel(
  root: HTMLElement,
  onCharacter: (character: CharacterDocument) => void,
): BrpCreatorPanelController {
  ensureBrpCreatorStyles();
  let state = createDefaultBrpCreatorState();
  let professionSuggestion: BrpProfessionSuggestionProvenance | null = null;
  let academicSuggestions: BrpScholarAcademicSuggestionRecord[] = [];
  let equipmentIds: BrpEquipmentId[] = [];
  let finishingDetails: BrpFinishingDetails = createEmptyBrpFinishingDetails();

  const render = (): void => {
    const preview = previewBrpCreatorState(state);
    if (preview.validCharacter) {
      equipmentIds = filterBrpStartingEquipmentSelection(preview.validCharacter, equipmentIds);
    }
    root.innerHTML = brpCreatorHtml(
      state,
      preview,
      professionSuggestion,
      academicSuggestions,
    );
    mountBrpEquipmentControls(root, preview.validCharacter, equipmentIds, (next) => {
      equipmentIds = next;
      render();
    });
    mountBrpFinishingControls(root, finishingDetails, (next) => {
      finishingDetails = next;
    });
    bindCurrentControls();
  };

  const bindCurrentControls = (): void => {
    const form = requiredElement(root, "#brp-creator-form", HTMLFormElement);
    const professionRandom = root.querySelector<HTMLButtonElement>("#brp-profession-random");
    if (professionRandom) {
      professionRandom.title = "Randomize profession";
      professionRandom.setAttribute("aria-label", "Randomize profession");
    }
    const reroll = root.querySelector<HTMLButtonElement>("#brp-reroll");
    if (reroll) {
      reroll.title = "Re-roll characteristics";
      reroll.setAttribute("aria-label", "Re-roll characteristics");
    }
    for (const button of root.querySelectorAll<HTMLButtonElement>("[data-brp-academic-suggest]")) {
      const index = Number(button.dataset.brpAcademicSuggest);
      button.setAttribute("aria-label", `Randomize academic specialty ${Number.isFinite(index) ? index + 1 : ""}`.trim());
    }

    bindSelectChange("#brp-campaign-profile", (value) => {
      if (!isBrpCampaignProfileId(value)) return;
      state = selectBrpCampaignProfile(state, value);
      professionSuggestion = null;
      academicSuggestions = [];
      render();
    });
    bindText("#brp-name", (value) => { state.displayName = value; });
    bindText("#brp-gender", (value) => { state.gender = value; });
    bindNumberChange("#brp-age", (value) => { state.age = value; render(); });
    bindSelectChange("#brp-wealth", (value) => {
      state.wealth = parseBrpWealthLevel(value);
      state.allocations = {};
      render();
    });
    bindSelectChange("#brp-power", (value) => { state.powerLevel = value === "heroic" ? "heroic" : "normal"; render(); });
    bindNumberChange("#brp-default-age", (value) => { state.defaultStartingAge = value; render(); });
    bindSelectChange("#brp-profession", (value) => {
      state.professionId = parseBrpProfessionId(value);
      state.wealth = defaultBrpWealthForProfession(state.professionId);
      professionSuggestion = null;
      academicSuggestions = [];
      state.allocations = {};
      render();
    });
    bindSelectChange("#brp-generation-method", (value) => { state.characteristicMethod = value === "standard-rolled" ? "standard-rolled" : "explicit"; state.allocations = {}; render(); });

    professionRandom?.addEventListener("click", () => {
      const suggestion = suggestBrpProfession();
      const changedProfession = state.professionId !== suggestion.result.professionId;
      state.professionId = suggestion.result.professionId;
      professionSuggestion = suggestion.provenance;
      if (changedProfession) {
        state.wealth = defaultBrpWealthForProfession(state.professionId);
        academicSuggestions = [];
        state.allocations = {};
      }
      render();
    });

    for (const input of root.querySelectorAll<HTMLInputElement>("[data-brp-characteristic]")) {
      input.addEventListener("change", () => {
        const id = input.dataset.brpCharacteristic as BrpCharacteristicId | undefined;
        if (!id) return;
        state.characteristics[id] = Number(input.value);
        state.allocations = {};
        render();
      });
    }

    root.querySelector<HTMLInputElement>("#brp-roll-seed")?.addEventListener("change", (event) => {
      state.rollSeed = (event.currentTarget as HTMLInputElement).value;
      state.redistribution = [];
      state.allocations = {};
      render();
    });
    reroll?.addEventListener("click", () => { state = rerollBrpCreatorState(state); render(); });
    for (const select of root.querySelectorAll<HTMLSelectElement>("[data-brp-redistribution]")) {
      select.addEventListener("change", () => { state.redistribution = readBrpRedistribution(root); state.allocations = {}; render(); });
    }

    for (const checkbox of root.querySelectorAll<HTMLInputElement>("[data-brp-detective-elective]")) {
      checkbox.addEventListener("change", () => {
        state.detectiveElectives = [...root.querySelectorAll<HTMLInputElement>("[data-brp-detective-elective]:checked")]
          .map((item) => item.value as BrpDetectiveElectiveSkillKey);
        state.allocations = {};
        render();
      });
    }

    for (const checkbox of root.querySelectorAll<HTMLInputElement>("[data-brp-athlete-elective]")) {
      checkbox.addEventListener("change", () => {
        state.athleteElectives = [...root.querySelectorAll<HTMLInputElement>("[data-brp-athlete-elective]:checked")]
          .map((item) => item.value as BrpAthleteElectiveSkillKey);
        state.allocations = {};
        render();
      });
    }

    for (const checkbox of root.querySelectorAll<HTMLInputElement>("[data-brp-custom-skill]")) {
      checkbox.addEventListener("change", () => {
        state.customProfessionalSkillKeys = [...root.querySelectorAll<HTMLInputElement>("[data-brp-custom-skill]:checked")]
          .map((item) => item.value as BrpFirstSliceSkillKey);
        state.allocations = {};
        render();
      });
    }
    root.querySelector<HTMLInputElement>("#brp-custom-title")?.addEventListener("change", (event) => {
      state.customProfessionTitle = (event.currentTarget as HTMLInputElement).value;
      state.allocations = {};
      render();
    });
    root.querySelector<HTMLTextAreaElement>("#brp-custom-description")?.addEventListener("change", (event) => {
      state.customProfessionDescription = (event.currentTarget as HTMLTextAreaElement).value;
      state.allocations = {};
      render();
    });

    bindScholarControls();
    for (const input of root.querySelectorAll<HTMLInputElement>("[data-brp-allocation-row]")) {
      input.addEventListener("change", () => {
        const row = Number(input.dataset.brpAllocationRow);
        const source = input.dataset.brpAllocationSource;
        const skill = previewBrpCreatorState(state).skillRows[row];
        if (!skill || (source !== "professionalPoints" && source !== "personalPoints")) return;
        const current = state.allocations[skill.key] ?? { professionalPoints: 0, personalPoints: 0 };
        state.allocations[skill.key] = { ...current, [source]: Number(input.value) };
        render();
      });
    }

    root.querySelector<HTMLButtonElement>("#brp-auto-allocate")?.addEventListener("click", () => {
      try { state = autoAllocateBrpCreatorState(state); }
      catch { /* The inline preview reports the system-owned reason. */ }
      render();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const preview = previewBrpCreatorState(state);
      if (preview.validCharacter) {
        let character = professionSuggestion
          ? applyBrpProfessionSuggestion(preview.validCharacter, professionSuggestion)
          : preview.validCharacter;
        for (const record of academicSuggestions) {
          character = applyBrpScholarAcademicSuggestion(character, record.slotIndex, {
            result: record.result,
            provenance: record.provenance,
          });
        }
        character = applyBrpStartingEquipment(character, equipmentIds);
        character = applyBrpFinishingDetails(character, finishingDetails);
        onCharacter(character);
      }
      render();
    });
  };

  const bindScholarControls = (): void => {
    const ownId = root.querySelector<HTMLInputElement>("#brp-own-language-id");
    const ownLabel = root.querySelector<HTMLInputElement>("#brp-own-language-label");
    const otherId = root.querySelector<HTMLInputElement>("#brp-other-language-id");
    const otherLabel = root.querySelector<HTMLInputElement>("#brp-other-language-label");
    const updateLanguages = (): void => {
      state.scholarOwnLanguage = { id: ownId?.value ?? "", label: ownLabel?.value ?? "" };
      state.scholarOtherLanguage = { id: otherId?.value ?? "", label: otherLabel?.value ?? "" };
      state.allocations = {};
      render();
    };
    ownId?.addEventListener("change", updateLanguages);
    ownLabel?.addEventListener("change", updateLanguages);
    otherId?.addEventListener("change", updateLanguages);
    otherLabel?.addEventListener("change", updateLanguages);

    for (const button of root.querySelectorAll<HTMLButtonElement>("[data-brp-academic-suggest]")) {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.brpAcademicSuggest);
        if (!Number.isInteger(index) || index < 0 || index >= state.scholarAcademicSkills.length) return;
        const suggestion = suggestBrpScholarAcademicSkill({ drawIndex: index });
        state.scholarAcademicSkills = state.scholarAcademicSkills.map((entry, candidate) => candidate === index
          ? {
              skillId: suggestion.result.selection.skillId,
              specialty: { ...suggestion.result.selection.specialty },
            }
          : entry);
        academicSuggestions = [
          ...academicSuggestions.filter((record) => record.slotIndex !== index),
          {
            slotIndex: index,
            result: suggestion.result,
            provenance: suggestion.provenance,
          },
        ].sort((left, right) => left.slotIndex - right.slotIndex);
        state.allocations = {};
        render();
      });
    }

    for (const control of root.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-brp-academic-index]")) {
      control.addEventListener("change", () => {
        const index = Number(control.dataset.brpAcademicIndex);
        if (!state.scholarAcademicSkills[index]) return;
        const parent = root.querySelector<HTMLSelectElement>(`[data-brp-academic-parent="${index}"]`)?.value;
        const id = root.querySelector<HTMLInputElement>(`[data-brp-academic-id="${index}"]`)?.value ?? "";
        const label = root.querySelector<HTMLInputElement>(`[data-brp-academic-label="${index}"]`)?.value ?? "";
        const next: BrpAcademicSkillSelection = { skillId: parent === "science" ? "science" : "knowledge", specialty: { id, label } };
        state.scholarAcademicSkills = state.scholarAcademicSkills.map((entry, candidate) => candidate === index ? next : entry);
        academicSuggestions = academicSuggestions.filter((record) => record.slotIndex !== index);
        state.allocations = {};
        render();
      });
    }
  };

  const bindText = (selector: string, setValue: (value: string) => void): void => {
    root.querySelector<HTMLInputElement>(selector)?.addEventListener("input", (event) => setValue((event.currentTarget as HTMLInputElement).value));
  };
  const bindNumberChange = (selector: string, setValue: (value: number) => void): void => {
    root.querySelector<HTMLInputElement>(selector)?.addEventListener("change", (event) => setValue(Number((event.currentTarget as HTMLInputElement).value)));
  };
  const bindSelectChange = (selector: string, setValue: (value: string) => void): void => {
    root.querySelector<HTMLSelectElement>(selector)?.addEventListener("change", (event) => setValue((event.currentTarget as HTMLSelectElement).value));
  };

  render();
  return {
    openCharacter(character: CharacterDocument): void {
      state = reopenBrpCreatorState(character);
      professionSuggestion = readBrpProfessionSuggestion(character);
      academicSuggestions = readBrpScholarAcademicSuggestions(character);
      equipmentIds = readBrpStartingEquipment(character);
      finishingDetails = readBrpFinishingDetails(character);
      render();
    },
    randomizeAll(): void {
      state = randomizeBrpCreatorState(state).state;
      professionSuggestion = null;
      academicSuggestions = [];
      render();
    },
  };
}

function parseBrpProfessionId(value: string): BrpProfessionId {
  if (value === "scholar" || value === "athlete" || value === "beggar" || value === "custom") return value;
  return "detective";
}

function parseBrpWealthLevel(value: string): BrpWealthLevel {
  if (value === "destitute" || value === "poor" || value === "affluent" || value === "wealthy") return value;
  return "average";
}

function requiredElement<T extends Element>(root: ParentNode, selector: string, type: { new (...args: never[]): T }): T {
  const element = root.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Required BRP creator element ${selector} was not found.`);
  return element;
}
