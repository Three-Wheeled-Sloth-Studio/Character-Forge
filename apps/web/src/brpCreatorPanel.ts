import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import type {
  BrpAcademicSkillSelection,
  BrpCharacteristicId,
  BrpDetectiveElectiveSkillKey,
} from "../../../packages/system-brp/src/index.js";
import {
  autoAllocateBrpCreatorState,
  createDefaultBrpCreatorState,
  previewBrpCreatorState,
  reopenBrpCreatorState,
  rerollBrpCreatorState,
  type BrpCreatorState,
} from "./brpCreatorState.js";
import { brpCreatorHtml, readBrpRedistribution } from "./brpCreatorPanelView.js";
import { ensureBrpCreatorStyles } from "./brpCreatorStyles.js";

export interface BrpCreatorPanelController {
  openCharacter(character: CharacterDocument): void;
}

export function mountBrpCreatorPanel(
  root: HTMLElement,
  onCharacter: (character: CharacterDocument) => void,
): BrpCreatorPanelController {
  ensureBrpCreatorStyles();
  let state = createDefaultBrpCreatorState();

  const render = (): void => {
    root.innerHTML = brpCreatorHtml(state, previewBrpCreatorState(state));
    bindCurrentControls();
  };

  const bindCurrentControls = (): void => {
    const form = requiredElement(root, "#brp-creator-form", HTMLFormElement);
    bindText("#brp-name", (value) => { state.displayName = value; });
    bindText("#brp-gender", (value) => { state.gender = value; });
    bindNumberChange("#brp-age", (value) => { state.age = value; render(); });
    bindSelectChange("#brp-wealth", (value) => { state.wealth = value === "affluent" ? "affluent" : "average"; render(); });
    bindSelectChange("#brp-power", (value) => { state.powerLevel = value === "heroic" ? "heroic" : "normal"; render(); });
    bindNumberChange("#brp-default-age", (value) => { state.defaultStartingAge = value; render(); });
    bindSelectChange("#brp-profession", (value) => { state.professionId = value === "scholar" ? "scholar" : "detective"; state.allocations = {}; render(); });
    bindSelectChange("#brp-generation-method", (value) => { state.characteristicMethod = value === "standard-rolled" ? "standard-rolled" : "explicit"; state.allocations = {}; render(); });

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
    root.querySelector<HTMLButtonElement>("#brp-reroll")?.addEventListener("click", () => { state = rerollBrpCreatorState(state); render(); });
    for (const select of root.querySelectorAll<HTMLSelectElement>("[data-brp-redistribution]")) {
      select.addEventListener("change", () => { state.redistribution = readBrpRedistribution(root); state.allocations = {}; render(); });
    }

    for (const checkbox of root.querySelectorAll<HTMLInputElement>("[data-brp-detective-elective]")) {
      checkbox.addEventListener("change", () => {
        state.detectiveElectives = [...root.querySelectorAll<HTMLInputElement>("[data-brp-detective-elective]:checked")].map((item) => item.value as BrpDetectiveElectiveSkillKey);
        state.allocations = {};
        render();
      });
    }

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
      if (preview.validCharacter) onCharacter(preview.validCharacter);
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

    for (const control of root.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-brp-academic-index]")) {
      control.addEventListener("change", () => {
        const index = Number(control.dataset.brpAcademicIndex);
        if (!state.scholarAcademicSkills[index]) return;
        const parent = root.querySelector<HTMLSelectElement>(`[data-brp-academic-parent="${index}"]`)?.value;
        const id = root.querySelector<HTMLInputElement>(`[data-brp-academic-id="${index}"]`)?.value ?? "";
        const label = root.querySelector<HTMLInputElement>(`[data-brp-academic-label="${index}"]`)?.value ?? "";
        const next: BrpAcademicSkillSelection = { skillId: parent === "science" ? "science" : "knowledge", specialty: { id, label } };
        state.scholarAcademicSkills = state.scholarAcademicSkills.map((entry, candidate) => candidate === index ? next : entry);
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
  return { openCharacter(character: CharacterDocument): void { state = reopenBrpCreatorState(character); render(); } };
}

function requiredElement<T extends Element>(root: ParentNode, selector: string, type: { new (...args: never[]): T }): T {
  const element = root.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Required BRP creator element ${selector} was not found.`);
  return element;
}
