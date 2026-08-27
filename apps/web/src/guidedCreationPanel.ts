import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  calculateDnd5ePointCost,
  DND5E_POINT_COST_BUDGET,
  DND5E_SRD_521_BACKGROUND_OPTIONS,
  DND5E_SRD_521_CLASS_OPTIONS,
  DND5E_SRD_521_SPECIES_OPTIONS,
  DND5E_STANDARD_ARRAY,
  GUIDED_DND5E_BACKGROUND_IDS,
  GUIDED_DND5E_CLASS_IDS,
  GUIDED_DND5E_SPECIES_IDS,
  guidedGenerateDnd5eFirstSlice,
  rollDnd5eRandomAbilitySet,
  type Dnd5eAbilityId,
  type Dnd5eAbilityIncreasePlan,
  type Dnd5eAbilityScores,
  type Dnd5eRandomAbilityAssignment,
  type Dnd5eRandomAbilitySet,
  type GuidedAbilityMethodInput,
  type GuidedChoiceSelectionMode,
  type GuidedDnd5eBackgroundId,
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
const BACKGROUND_STORAGE_KEY = "character-forge.dnd5e.guided.background-pool.v1";
const SPECIES_STORAGE_KEY = "character-forge.dnd5e.guided.species-pool.v1";

export function mountGuidedCreationPanel(
  root: HTMLElement,
  onCharacter: (character: CharacterDocument) => void,
): void {
  let classState = loadStickyChoicePool(
    localStorage,
    CLASS_STORAGE_KEY,
    GUIDED_DND5E_CLASS_IDS,
    GUIDED_DND5E_CLASS_IDS,
    "fighter",
  );
  let backgroundState = loadStickyChoicePool(
    localStorage,
    BACKGROUND_STORAGE_KEY,
    GUIDED_DND5E_BACKGROUND_IDS,
    GUIDED_DND5E_BACKGROUND_IDS,
    "soldier",
  );
  let speciesState = loadStickyChoicePool(
    localStorage,
    SPECIES_STORAGE_KEY,
    GUIDED_DND5E_SPECIES_IDS,
    GUIDED_DND5E_SPECIES_IDS,
    "human",
  );
  let classMode: GuidedChoiceSelectionMode = "direct";
  let backgroundMode: GuidedChoiceSelectionMode = "direct";
  let speciesMode: GuidedChoiceSelectionMode = "direct";
  let randomRollSet: Dnd5eRandomAbilitySet | null = null;

  root.innerHTML = creatorHtml(classState, backgroundState, speciesState);

  const form = root.querySelector<HTMLFormElement>("#creator-form");
  const error = root.querySelector<HTMLElement>("#creator-error");
  const classSelect = root.querySelector<HTMLSelectElement>("#creator-class-selected");
  const backgroundSelect = root.querySelector<HTMLSelectElement>("#creator-background-selected");
  const speciesSelect = root.querySelector<HTMLSelectElement>("#creator-species-selected");
  const methodSelect = root.querySelector<HTMLSelectElement>("#creator-generation-method");
  const methodHost = root.querySelector<HTMLElement>("#generation-method-controls");
  const boostSelect = root.querySelector<HTMLSelectElement>("#creator-boost-plan");

  bindPool("class", classSelect, DND5E_SRD_521_CLASS_OPTIONS, GUIDED_DND5E_CLASS_IDS, () => classState, (next) => {
    classState = next;
    classMode = "direct";
    saveStickyChoicePool(localStorage, CLASS_STORAGE_KEY, classState);
  });
  bindPool("background", backgroundSelect, DND5E_SRD_521_BACKGROUND_OPTIONS, GUIDED_DND5E_BACKGROUND_IDS, () => backgroundState, (next) => {
    backgroundState = next;
    backgroundMode = "direct";
    saveStickyChoicePool(localStorage, BACKGROUND_STORAGE_KEY, backgroundState);
    refreshBackgroundBoosts(boostSelect, backgroundState.selectedId);
  });
  bindPool("species", speciesSelect, DND5E_SRD_521_SPECIES_OPTIONS, GUIDED_DND5E_SPECIES_IDS, () => speciesState, (next) => {
    speciesState = next;
    speciesMode = "direct";
    saveStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, speciesState);
  });

  classSelect?.addEventListener("change", () => {
    classState = { ...classState, selectedId: classSelect.value as GuidedDnd5eClassId };
    classMode = "direct";
    saveStickyChoicePool(localStorage, CLASS_STORAGE_KEY, classState);
  });
  backgroundSelect?.addEventListener("change", () => {
    backgroundState = { ...backgroundState, selectedId: backgroundSelect.value as GuidedDnd5eBackgroundId };
    backgroundMode = "direct";
    saveStickyChoicePool(localStorage, BACKGROUND_STORAGE_KEY, backgroundState);
    refreshBackgroundBoosts(boostSelect, backgroundState.selectedId);
  });
  speciesSelect?.addEventListener("change", () => {
    speciesState = { ...speciesState, selectedId: speciesSelect.value as GuidedDnd5eSpeciesId };
    speciesMode = "direct";
    saveStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, speciesState);
  });

  bindRandomButton("class", classSelect, DND5E_SRD_521_CLASS_OPTIONS, () => classState, (next) => {
    classState = next;
    classMode = "random";
    saveStickyChoicePool(localStorage, CLASS_STORAGE_KEY, classState);
  });
  bindRandomButton("background", backgroundSelect, DND5E_SRD_521_BACKGROUND_OPTIONS, () => backgroundState, (next) => {
    backgroundState = next;
    backgroundMode = "random";
    saveStickyChoicePool(localStorage, BACKGROUND_STORAGE_KEY, backgroundState);
    refreshBackgroundBoosts(boostSelect, backgroundState.selectedId);
  });
  bindRandomButton("species", speciesSelect, DND5E_SRD_521_SPECIES_OPTIONS, () => speciesState, (next) => {
    speciesState = next;
    speciesMode = "random";
    saveStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, speciesState);
  });

  const renderMethodControls = (): void => {
    randomRollSet = null;
    if (!methodHost || !methodSelect) return;
    methodHost.innerHTML = methodControlsHtml(methodSelect.value);
    bindMethodControls(methodSelect.value);
  };

  const bindMethodControls = (method: string): void => {
    if (method === "point-cost") {
      for (const input of root.querySelectorAll<HTMLInputElement>("[data-point-score]")) {
        input.addEventListener("input", updatePointBudget);
      }
      updatePointBudget();
    }
    if (method === "random") {
      const rollButton = root.querySelector<HTMLButtonElement>("#creator-random-roll");
      rollButton?.addEventListener("click", () => {
        clearError(error);
        try {
          const seedInput = root.querySelector<HTMLInputElement>("#creator-random-seed");
          randomRollSet = rollDnd5eRandomAbilitySet(seedInput?.value ?? "");
          if (seedInput) seedInput.value = randomRollSet.seed;
          renderRandomRollSet(root, randomRollSet);
          populateRandomAssignments(root, randomRollSet);
        } catch (caught) {
          randomRollSet = null;
          showError(error, caught, "Random ability generation failed.");
        }
      });
    }
  };

  const updatePointBudget = (): void => {
    const budget = root.querySelector<HTMLElement>("#creator-point-budget");
    if (!budget) return;
    try {
      const pointsSpent = calculateDnd5ePointCost(readAbilityScores(root, "creator-point"));
      const remaining = DND5E_POINT_COST_BUDGET - pointsSpent;
      const overBudget = remaining < 0;
      budget.textContent = `${pointsSpent} / ${DND5E_POINT_COST_BUDGET} points spent · ${Math.abs(remaining)} ${overBudget ? "over" : "remaining"}`;
      budget.classList.toggle("over-budget", overBudget);
    } catch {
      budget.textContent = "Enter scores from 8 through 15.";
      budget.classList.add("over-budget");
    }
  };

  methodSelect?.addEventListener("change", renderMethodControls);
  refreshBackgroundBoosts(boostSelect, backgroundState.selectedId);
  renderMethodControls();

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    clearError(error);
    try {
      if (!methodSelect || !boostSelect) throw new Error("Generation controls are unavailable.");
      onCharacter(guidedGenerateDnd5eFirstSlice({
        name: root.querySelector<HTMLInputElement>("#creator-name")?.value ?? "",
        classChoice: {
          selectedId: classState.selectedId,
          acceptableIds: classState.acceptableIds,
          selectionMode: classMode,
        },
        backgroundChoice: {
          selectedId: backgroundState.selectedId,
          acceptableIds: backgroundState.acceptableIds,
          selectionMode: backgroundMode,
        },
        speciesChoice: {
          selectedId: speciesState.selectedId,
          acceptableIds: speciesState.acceptableIds,
          selectionMode: speciesMode,
        },
        abilityMethod: readAbilityMethod(root, methodSelect.value, randomRollSet),
        backgroundIncreases: parseBoostPlan(boostSelect.value),
        backgroundEquipmentChoice: readBackgroundEquipmentChoice(root),
      }));
    } catch (caught) {
      showError(error, caught, "Character generation failed.");
    }
  });

  function bindPool<TId extends string>(
    poolName: string,
    select: HTMLSelectElement | null,
    options: readonly { id: string; label: string }[],
    allowedIds: readonly TId[],
    getState: () => StickyChoicePoolState<TId>,
    setState: (state: StickyChoicePoolState<TId>) => void,
  ): void {
    for (const checkbox of root.querySelectorAll<HTMLInputElement>(`[data-choice-pool='${poolName}']`)) {
      checkbox.addEventListener("change", () => {
        const next = updatePoolFromCheckboxes(root, poolName, getState(), allowedIds, error);
        setState(next);
        refreshSelect(select, next, options);
      });
    }
  }

  function bindRandomButton<TId extends string>(
    poolName: string,
    select: HTMLSelectElement | null,
    options: readonly { id: string; label: string }[],
    getState: () => StickyChoicePoolState<TId>,
    setState: (state: StickyChoicePoolState<TId>) => void,
  ): void {
    root.querySelector<HTMLButtonElement>(`#creator-${poolName}-random`)?.addEventListener("click", () => {
      const state = getState();
      const next = { ...state, selectedId: pickFromAcceptablePool(state.acceptableIds) };
      setState(next);
      refreshSelect(select, next, options);
    });
  }
}

function creatorHtml(
  classState: StickyChoicePoolState<GuidedDnd5eClassId>,
  backgroundState: StickyChoicePoolState<GuidedDnd5eBackgroundId>,
  speciesState: StickyChoicePoolState<GuidedDnd5eSpeciesId>,
): string {
  return `
    <section class="creator-panel compact-creator">
      <div class="creator-heading">
        <p class="eyebrow">D&D 5E 2024 · SRD 5.2.1</p>
        <h2>Create character</h2>
        <p>Official order by default. Checked option pools stay sticky between characters.</p>
      </div>
      <form id="creator-form" class="creator-form">
        <label>Character name<input id="creator-name" type="text" maxlength="80" required placeholder="Character name" /></label>
        ${choiceSectionHtml("Class", "class", DND5E_SRD_521_CLASS_OPTIONS, classState)}
        ${choiceSectionHtml("Background", "background", DND5E_SRD_521_BACKGROUND_OPTIONS, backgroundState)}
        ${choiceSectionHtml("Species", "species", DND5E_SRD_521_SPECIES_OPTIONS, speciesState)}
        <label>Background equipment
          <select id="creator-background-equipment">
            <option value="B:50-gp" selected>50 GP</option>
            <option value="A">Background equipment package</option>
          </select>
        </label>
        <div class="section-divider"></div>
        <label>Ability generation
          <select id="creator-generation-method">
            <option value="standard-array" selected>Standard Array</option>
            <option value="point-cost">Point Cost</option>
            <option value="random">Random · 4d6 keep highest 3</option>
            <option value="manual">Manual Entry</option>
          </select>
        </label>
        <div id="generation-method-controls" class="method-controls"></div>
        <label>Background ability increases<select id="creator-boost-plan"></select></label>
        <p id="creator-error" class="form-error" role="alert"></p>
        <button type="submit" class="primary-action">Build character</button>
      </form>
    </section>
  `;
}

function choiceSectionHtml<TId extends string>(
  label: string,
  poolName: string,
  options: readonly { id: string; label: string; guidedSupported: boolean; blockedReason?: string }[],
  state: StickyChoicePoolState<TId>,
): string {
  return `
    <div class="choice-section">
      <div class="choice-pick-row">
        <label>${label}<select id="creator-${poolName}-selected">${selectedOptions(options, state)}</select></label>
        <button id="creator-${poolName}-random" type="button" class="icon-button" title="Randomly choose from checked ${poolName} options" aria-label="Randomly choose from checked ${poolName} options">↻</button>
      </div>
      <details class="choice-pool-details">
        <summary>Acceptable ${label.toLowerCase()} options</summary>
        <div class="choice-pool-grid">
          ${options.map((option) => `
            <label class="choice-pool-option${option.guidedSupported ? "" : " unsupported"}" title="${escapeAttribute(option.blockedReason ?? "")}">
              <input type="checkbox" data-choice-pool="${poolName}" value="${option.id}" ${state.acceptableIds.includes(option.id as TId) ? "checked" : ""} ${option.guidedSupported ? "" : "disabled"} />
              <span>${option.label}${option.guidedSupported ? "" : " · later"}</span>
            </label>
          `).join("")}
        </div>
      </details>
    </div>
  `;
}

function methodControlsHtml(method: string): string {
  if (method === "standard-array") {
    return abilityFieldset("Standard Array assignment", [
      standardArraySelect("STR", "strength", 15),
      standardArraySelect("DEX", "dexterity", 14),
      standardArraySelect("CON", "constitution", 13),
      standardArraySelect("INT", "intelligence", 12),
      standardArraySelect("WIS", "wisdom", 10),
      standardArraySelect("CHA", "charisma", 8),
    ]);
  }
  if (method === "manual") {
    return abilityFieldset("Base ability scores", [
      abilityInput("creator-manual", "STR", "strength", 15, 3, 18),
      abilityInput("creator-manual", "DEX", "dexterity", 14, 3, 18),
      abilityInput("creator-manual", "CON", "constitution", 13, 3, 18),
      abilityInput("creator-manual", "INT", "intelligence", 12, 3, 18),
      abilityInput("creator-manual", "WIS", "wisdom", 10, 3, 18),
      abilityInput("creator-manual", "CHA", "charisma", 8, 3, 18),
    ]);
  }
  if (method === "point-cost") {
    return `${abilityFieldset("Base ability scores", [
      abilityInput("creator-point", "STR", "strength", 15, 8, 15, "data-point-score"),
      abilityInput("creator-point", "DEX", "dexterity", 14, 8, 15, "data-point-score"),
      abilityInput("creator-point", "CON", "constitution", 13, 8, 15, "data-point-score"),
      abilityInput("creator-point", "INT", "intelligence", 12, 8, 15, "data-point-score"),
      abilityInput("creator-point", "WIS", "wisdom", 10, 8, 15, "data-point-score"),
      abilityInput("creator-point", "CHA", "charisma", 8, 8, 15, "data-point-score"),
    ])}<div id="creator-point-budget" class="point-budget" aria-live="polite"></div>`;
  }
  return `
    <label>Seed<input id="creator-random-seed" type="text" maxlength="120" placeholder="Optional; generated if blank" /></label>
    <button id="creator-random-roll" type="button" class="secondary-button">Roll six scores</button>
    <div id="creator-random-roll-results" class="random-roll-grid" aria-live="polite"><span class="muted">Roll scores to begin.</span></div>
    ${abilityFieldset("Assign roll slots", [
      randomAssignmentSelect("STR", "strength", 0),
      randomAssignmentSelect("DEX", "dexterity", 1),
      randomAssignmentSelect("CON", "constitution", 2),
      randomAssignmentSelect("INT", "intelligence", 3),
      randomAssignmentSelect("WIS", "wisdom", 4),
      randomAssignmentSelect("CHA", "charisma", 5),
    ])}
  `;
}

function readAbilityMethod(
  root: HTMLElement,
  method: string,
  randomRollSet: Dnd5eRandomAbilitySet | null,
): GuidedAbilityMethodInput {
  switch (method) {
    case "standard-array":
      return { method, assignment: readStandardArrayScores(root) };
    case "manual":
      return { method, scores: readAbilityScores(root, "creator-manual") };
    case "point-cost":
      return { method, scores: readAbilityScores(root, "creator-point") };
    case "random":
      if (!randomRollSet) throw new Error("Roll six ability scores before building the character.");
      return {
        method,
        seed: randomRollSet.seed,
        assignment: readRandomAssignment(root),
      };
    default:
      throw new Error("Choose a supported ability-generation method.");
  }
}

function refreshBackgroundBoosts(
  select: HTMLSelectElement | null,
  backgroundId: GuidedDnd5eBackgroundId,
): void {
  if (!select) return;
  const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((option) => option.id === backgroundId);
  if (!background) return;
  select.innerHTML = backgroundBoostOptions(background.abilityScoreIds);
}

function backgroundBoostOptions(abilityIds: readonly Dnd5eAbilityId[]): string {
  const [first, second, third] = abilityIds;
  if (!first || !second || !third) return "";
  const pairs: readonly [Dnd5eAbilityId, Dnd5eAbilityId][] = [
    [first, second], [first, third], [second, first],
    [second, third], [third, first], [third, second],
  ];
  return `${pairs.map(([plusTwo, plusOne]) =>
    `<option value="${plusTwo}:2|${plusOne}:1">${abilityLabel(plusTwo)} +2, ${abilityLabel(plusOne)} +1</option>`,
  ).join("")}<option value="${first}:1|${second}:1|${third}:1">${abilityLabel(first)} +1, ${abilityLabel(second)} +1, ${abilityLabel(third)} +1</option>`;
}

function parseBoostPlan(value: string): Dnd5eAbilityIncreasePlan {
  const plan: Dnd5eAbilityIncreasePlan = {};
  for (const part of value.split("|")) {
    const [abilityId, amountText] = part.split(":");
    const amount = Number(amountText);
    if (!abilityId || (amount !== 1 && amount !== 2)) throw new Error("Choose a legal background ability-increase plan.");
    (plan as Record<string, 1 | 2>)[abilityId] = amount;
  }
  return plan;
}

function readBackgroundEquipmentChoice(root: HTMLElement): "A" | "B:50-gp" {
  const value = root.querySelector<HTMLSelectElement>("#creator-background-equipment")?.value;
  if (value !== "A" && value !== "B:50-gp") throw new Error("Choose a background equipment option.");
  return value;
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
    strength: readSelectNumber(root, "creator-standard-strength"),
    dexterity: readSelectNumber(root, "creator-standard-dexterity"),
    constitution: readSelectNumber(root, "creator-standard-constitution"),
    intelligence: readSelectNumber(root, "creator-standard-intelligence"),
    wisdom: readSelectNumber(root, "creator-standard-wisdom"),
    charisma: readSelectNumber(root, "creator-standard-charisma"),
  };
}

function readAbilityScores(root: HTMLElement, prefix: string): Dnd5eAbilityScores {
  return {
    strength: readInputNumber(root, `${prefix}-strength`),
    dexterity: readInputNumber(root, `${prefix}-dexterity`),
    constitution: readInputNumber(root, `${prefix}-constitution`),
    intelligence: readInputNumber(root, `${prefix}-intelligence`),
    wisdom: readInputNumber(root, `${prefix}-wisdom`),
    charisma: readInputNumber(root, `${prefix}-charisma`),
  };
}

function readRandomAssignment(root: HTMLElement): Dnd5eRandomAbilityAssignment {
  return {
    strength: readSelectNumber(root, "creator-random-strength"),
    dexterity: readSelectNumber(root, "creator-random-dexterity"),
    constitution: readSelectNumber(root, "creator-random-constitution"),
    intelligence: readSelectNumber(root, "creator-random-intelligence"),
    wisdom: readSelectNumber(root, "creator-random-wisdom"),
    charisma: readSelectNumber(root, "creator-random-charisma"),
  };
}

function readSelectNumber(root: HTMLElement, id: string): number {
  const value = Number(root.querySelector<HTMLSelectElement>(`#${id}`)?.value);
  if (!Number.isInteger(value)) throw new Error(`${id} requires a numeric selection.`);
  return value;
}

function readInputNumber(root: HTMLElement, id: string): number {
  const value = Number(root.querySelector<HTMLInputElement>(`#${id}`)?.value);
  if (!Number.isInteger(value)) throw new Error(`${id} requires a whole-number score.`);
  return value;
}

function renderRandomRollSet(root: HTMLElement, rollSet: Dnd5eRandomAbilitySet): void {
  const target = root.querySelector<HTMLElement>("#creator-random-roll-results");
  if (!target) return;
  target.innerHTML = rollSet.results.map((entry) => `
    <div class="random-roll-card">
      <span>Roll ${entry.rollIndex + 1}</span>
      <strong>${entry.total}</strong>
      <small>${entry.rolls.join(" · ")} → ${entry.keptValues.join(" + ")}</small>
    </div>
  `).join("");
}

function populateRandomAssignments(root: HTMLElement, rollSet: Dnd5eRandomAbilitySet): void {
  const abilityIds = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const;
  abilityIds.forEach((abilityId, defaultIndex) => {
    const select = root.querySelector<HTMLSelectElement>(`#creator-random-${abilityId}`);
    if (!select) return;
    select.innerHTML = rollSet.results.map((entry) =>
      `<option value="${entry.rollIndex}"${entry.rollIndex === defaultIndex ? " selected" : ""}>Roll ${entry.rollIndex + 1}: ${entry.total}</option>`,
    ).join("");
    select.disabled = false;
  });
}

function abilityFieldset(legend: string, fields: readonly string[]): string {
  return `<fieldset class="ability-fieldset"><legend>${legend}</legend><div class="ability-input-grid">${fields.join("")}</div></fieldset>`;
}

function standardArraySelect(label: string, abilityId: string, selected: number): string {
  const options = DND5E_STANDARD_ARRAY.map((value) => `<option value="${value}"${value === selected ? " selected" : ""}>${value}</option>`).join("");
  return `<label>${label}<select id="creator-standard-${abilityId}">${options}</select></label>`;
}

function randomAssignmentSelect(label: string, abilityId: string, defaultIndex: number): string {
  return `<label>${label}<select id="creator-random-${abilityId}" disabled><option value="${defaultIndex}">Roll first</option></select></label>`;
}

function abilityInput(
  prefix: string,
  label: string,
  abilityId: string,
  value: number,
  min: number,
  max: number,
  extraAttribute = "",
): string {
  return `<label>${label}<input id="${prefix}-${abilityId}" type="number" min="${min}" max="${max}" step="1" required value="${value}" ${extraAttribute} /></label>`;
}

function abilityLabel(abilityId: Dnd5eAbilityId): string {
  return ({
    strength: "STR",
    dexterity: "DEX",
    constitution: "CON",
    intelligence: "INT",
    wisdom: "WIS",
    charisma: "CHA",
  } as const)[abilityId];
}

function clearError(target: HTMLElement | null): void {
  if (target) target.textContent = "";
}

function showError(target: HTMLElement | null, error: unknown, fallback: string): void {
  if (target) target.textContent = error instanceof Error ? error.message : fallback;
}

function escapeAttribute(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
