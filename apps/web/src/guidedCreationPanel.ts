import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  DND5E_SRD_521_CLASS_OPTIONS,
  DND5E_SRD_521_SPECIES_OPTIONS,
  DND5E_STANDARD_ARRAY,
  GUIDED_DND5E_CLASS_IDS,
  GUIDED_DND5E_SPECIES_IDS,
  guidedStandardArrayGenerateDnd5eFirstSlice,
  type Dnd5eAbilityIncreasePlan,
  type Dnd5eAbilityScores,
  type GuidedChoiceSelectionMode,
  type GuidedDnd5eClassId,
  type GuidedDnd5eSpeciesId,
} from "../../../packages/system-dnd5e/src/index.js";
import {
  loadStickyChoicePool,
  pickFromAcceptablePool,
  saveStickyChoicePool,
  type StickyChoicePoolState,
} from "./stickyChoicePool.js";

const CLASS_STORAGE_KEY = "character-forge.dnd5e.guided.class-pool.v1";
const SPECIES_STORAGE_KEY = "character-forge.dnd5e.guided.species-pool.v1";

export function mountGuidedCreationPanel(
  root: HTMLElement,
  onCharacter: (character: CharacterDocument) => void,
): void {
  const header = root.querySelector(".forge-header");
  if (!header) return;

  let classState = loadStickyChoicePool(
    localStorage,
    CLASS_STORAGE_KEY,
    GUIDED_DND5E_CLASS_IDS,
    GUIDED_DND5E_CLASS_IDS,
    "fighter",
  );
  let speciesState = loadStickyChoicePool(
    localStorage,
    SPECIES_STORAGE_KEY,
    GUIDED_DND5E_SPECIES_IDS,
    GUIDED_DND5E_SPECIES_IDS,
    "human",
  );
  let classMode: GuidedChoiceSelectionMode = "direct";
  let speciesMode: GuidedChoiceSelectionMode = "direct";

  header.insertAdjacentHTML("afterend", guidedPanelHtml(classState, speciesState));

  const form = root.querySelector<HTMLFormElement>("#guided-form");
  const error = root.querySelector<HTMLElement>("#guided-error");
  const classSelect = root.querySelector<HTMLSelectElement>("#guided-class-selected");
  const speciesSelect = root.querySelector<HTMLSelectElement>("#guided-species-selected");

  for (const checkbox of root.querySelectorAll<HTMLInputElement>("[data-choice-pool='class']")) {
    checkbox.addEventListener("change", () => {
      classState = updatePoolFromCheckboxes(root, "class", classState, GUIDED_DND5E_CLASS_IDS, error);
      classMode = "direct";
      refreshSelect(classSelect, classState, DND5E_SRD_521_CLASS_OPTIONS);
      saveStickyChoicePool(localStorage, CLASS_STORAGE_KEY, classState);
    });
  }
  for (const checkbox of root.querySelectorAll<HTMLInputElement>("[data-choice-pool='species']")) {
    checkbox.addEventListener("change", () => {
      speciesState = updatePoolFromCheckboxes(root, "species", speciesState, GUIDED_DND5E_SPECIES_IDS, error);
      speciesMode = "direct";
      refreshSelect(speciesSelect, speciesState, DND5E_SRD_521_SPECIES_OPTIONS);
      saveStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, speciesState);
    });
  }

  classSelect?.addEventListener("change", () => {
    const selectedId = classSelect.value as GuidedDnd5eClassId;
    classState = { ...classState, selectedId };
    classMode = "direct";
    saveStickyChoicePool(localStorage, CLASS_STORAGE_KEY, classState);
  });
  speciesSelect?.addEventListener("change", () => {
    const selectedId = speciesSelect.value as GuidedDnd5eSpeciesId;
    speciesState = { ...speciesState, selectedId };
    speciesMode = "direct";
    saveStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, speciesState);
  });

  root.querySelector<HTMLButtonElement>("#guided-class-random")?.addEventListener("click", () => {
    const selectedId = pickFromAcceptablePool(classState.acceptableIds);
    classState = { ...classState, selectedId };
    classMode = "random";
    refreshSelect(classSelect, classState, DND5E_SRD_521_CLASS_OPTIONS);
    saveStickyChoicePool(localStorage, CLASS_STORAGE_KEY, classState);
  });
  root.querySelector<HTMLButtonElement>("#guided-species-random")?.addEventListener("click", () => {
    const selectedId = pickFromAcceptablePool(speciesState.acceptableIds);
    speciesState = { ...speciesState, selectedId };
    speciesMode = "random";
    refreshSelect(speciesSelect, speciesState, DND5E_SRD_521_SPECIES_OPTIONS);
    saveStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, speciesState);
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (error) error.textContent = "";
    try {
      const name = root.querySelector<HTMLInputElement>("#guided-name")?.value ?? "";
      const boost = root.querySelector<HTMLSelectElement>("#guided-boost-plan")?.value ?? "";
      onCharacter(guidedStandardArrayGenerateDnd5eFirstSlice({
        name,
        classChoice: {
          selectedId: classState.selectedId,
          acceptableIds: classState.acceptableIds,
          selectionMode: classMode,
        },
        speciesChoice: {
          selectedId: speciesState.selectedId,
          acceptableIds: speciesState.acceptableIds,
          selectionMode: speciesMode,
        },
        assignment: readStandardArrayScores(root),
        backgroundIncreases: readSoldierBoostPlan(boost),
      }));
    } catch (caught) {
      if (error) error.textContent = caught instanceof Error ? caught.message : "Guided generation failed.";
    }
  });
}

function guidedPanelHtml(
  classState: StickyChoicePoolState<GuidedDnd5eClassId>,
  speciesState: StickyChoicePoolState<GuidedDnd5eSpeciesId>,
): string {
  return `
    <section class="creator-panel guided-panel">
      <div class="creator-copy">
        <p class="eyebrow">Guided D&D 5E 2024</p>
        <h2>Official-order character creation</h2>
        <p>Start with class, then origin, then abilities. Check every option you would be happy playing and use the shuffle button for a Nethack-style random pick. Your acceptable pools are remembered for the next character.</p>
      </div>
      <form id="guided-form" class="quick-form">
        <label>Character name<input id="guided-name" type="text" maxlength="80" required placeholder="Required for guided creation" /></label>
        ${choicePoolHtml("Class", "class", DND5E_SRD_521_CLASS_OPTIONS, classState)}
        <div class="choice-pick-row">
          <label>Chosen class<select id="guided-class-selected">${selectedOptions(DND5E_SRD_521_CLASS_OPTIONS, classState)}</select></label>
          <button id="guided-class-random" type="button" class="secondary-button" title="Randomly choose from checked classes">↻ Random from checked</button>
        </div>
        <div class="fixed-choice"><strong>Background</strong><span>Soldier <small>(fixed for this slice)</small></span></div>
        ${choicePoolHtml("Species", "species", DND5E_SRD_521_SPECIES_OPTIONS, speciesState)}
        <div class="choice-pick-row">
          <label>Chosen species<select id="guided-species-selected">${selectedOptions(DND5E_SRD_521_SPECIES_OPTIONS, speciesState)}</select></label>
          <button id="guided-species-random" type="button" class="secondary-button" title="Randomly choose from checked species">↻ Random from checked</button>
        </div>
        <fieldset class="manual-ability-fieldset">
          <legend>Standard Array assignment</legend>
          <div class="manual-ability-grid">
            ${standardArraySelect("STR", "strength", 15)}
            ${standardArraySelect("DEX", "dexterity", 14)}
            ${standardArraySelect("CON", "constitution", 13)}
            ${standardArraySelect("INT", "intelligence", 12)}
            ${standardArraySelect("WIS", "wisdom", 10)}
            ${standardArraySelect("CHA", "charisma", 8)}
          </div>
        </fieldset>
        <label>Soldier ability increases<select id="guided-boost-plan">${soldierBoostOptions()}</select></label>
        <p id="guided-error" class="form-error" role="alert"></p>
        <button type="submit">Build guided character</button>
      </form>
    </section>
  `;
}

function choicePoolHtml<TId extends string>(
  label: string,
  poolName: string,
  options: readonly { id: string; label: string; guidedSupported: boolean; blockedReason?: string }[],
  state: StickyChoicePoolState<TId>,
): string {
  return `
    <fieldset class="choice-pool-fieldset">
      <legend>${label}: acceptable options</legend>
      <div class="choice-pool-grid">
        ${options.map((option) => `
          <label class="choice-pool-option${option.guidedSupported ? "" : " unsupported"}" title="${escapeAttribute(option.blockedReason ?? "")}">
            <input type="checkbox" data-choice-pool="${poolName}" value="${option.id}" ${state.acceptableIds.includes(option.id as TId) ? "checked" : ""} ${option.guidedSupported ? "" : "disabled"} />
            <span>${option.label}${option.guidedSupported ? "" : " · later"}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `;
}

function updatePoolFromCheckboxes<TId extends string>(
  root: HTMLElement,
  poolName: string,
  current: StickyChoicePoolState<TId>,
  allowedIds: readonly TId[],
  error: HTMLElement | null,
): StickyChoicePoolState<TId> {
  const allowed = new Set<string>(allowedIds);
  const acceptableIds = [...root.querySelectorAll<HTMLInputElement>(`[data-choice-pool='${poolName}']:checked`)]
    .map((input) => input.value)
    .filter((id): id is TId => allowed.has(id));
  if (acceptableIds.length === 0) {
    const fallback = root.querySelector<HTMLInputElement>(`[data-choice-pool='${poolName}'][value='${current.selectedId}']`);
    if (fallback) fallback.checked = true;
    if (error) error.textContent = `Keep at least one acceptable ${poolName} checked.`;
    return current;
  }
  const selectedId = acceptableIds.includes(current.selectedId) ? current.selectedId : acceptableIds[0]!;
  return { acceptableIds, selectedId };
}

function refreshSelect<TId extends string>(
  select: HTMLSelectElement | null,
  state: StickyChoicePoolState<TId>,
  options: readonly { id: string; label: string }[],
): void {
  if (!select) return;
  select.innerHTML = selectedOptions(options, state);
  select.value = state.selectedId;
}

function selectedOptions<TId extends string>(
  options: readonly { id: string; label: string }[],
  state: StickyChoicePoolState<TId>,
): string {
  const labels = new Map(options.map((option) => [option.id, option.label]));
  return state.acceptableIds.map((id) => `<option value="${id}"${id === state.selectedId ? " selected" : ""}>${labels.get(id) ?? id}</option>`).join("");
}

function readStandardArrayScores(root: HTMLElement): Dnd5eAbilityScores {
  return {
    strength: readSelectNumber(root, "guided-strength"),
    dexterity: readSelectNumber(root, "guided-dexterity"),
    constitution: readSelectNumber(root, "guided-constitution"),
    intelligence: readSelectNumber(root, "guided-intelligence"),
    wisdom: readSelectNumber(root, "guided-wisdom"),
    charisma: readSelectNumber(root, "guided-charisma"),
  };
}

function readSelectNumber(root: HTMLElement, id: string): number {
  const value = Number(root.querySelector<HTMLSelectElement>(`#${id}`)?.value);
  if (!Number.isInteger(value)) throw new Error(`${id} requires a numeric selection.`);
  return value;
}

function standardArraySelect(label: string, abilityId: string, selected: number): string {
  const options = DND5E_STANDARD_ARRAY.map((value) => `<option value="${value}"${value === selected ? " selected" : ""}>${value}</option>`).join("");
  return `<label>${label}<select id="guided-${abilityId}">${options}</select></label>`;
}

function readSoldierBoostPlan(value: string): Dnd5eAbilityIncreasePlan {
  switch (value) {
    case "str2-con1": return { strength: 2, constitution: 1 };
    case "str2-dex1": return { strength: 2, dexterity: 1 };
    case "dex2-str1": return { dexterity: 2, strength: 1 };
    case "dex2-con1": return { dexterity: 2, constitution: 1 };
    case "con2-str1": return { constitution: 2, strength: 1 };
    case "con2-dex1": return { constitution: 2, dexterity: 1 };
    case "all1": return { strength: 1, dexterity: 1, constitution: 1 };
    default: throw new Error("Choose a legal Soldier ability-increase plan.");
  }
}

function soldierBoostOptions(): string {
  return `
    <option value="str2-con1">STR +2, CON +1</option>
    <option value="str2-dex1">STR +2, DEX +1</option>
    <option value="dex2-str1">DEX +2, STR +1</option>
    <option value="dex2-con1">DEX +2, CON +1</option>
    <option value="con2-str1">CON +2, STR +1</option>
    <option value="con2-dex1">CON +2, DEX +1</option>
    <option value="all1">STR +1, DEX +1, CON +1</option>
  `;
}

function escapeAttribute(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
