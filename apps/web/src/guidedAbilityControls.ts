import {
  calculateDnd5ePointCost,
  DND5E_POINT_COST_BUDGET,
  DND5E_STANDARD_ARRAY,
  rollDnd5eRandomAbilitySet,
  type Dnd5eAbilityScores,
  type Dnd5eRandomAbilityAssignment,
  type Dnd5eRandomAbilitySet,
  type GuidedAbilityMethodInput,
} from "../../../packages/system-dnd5e/src/index.js";

export interface GuidedAbilityControlsController {
  read(): GuidedAbilityMethodInput;
}

export function mountGuidedAbilityControls(
  root: HTMLElement,
  methodSelect: HTMLSelectElement,
  methodHost: HTMLElement,
  errorTarget: HTMLElement | null,
): GuidedAbilityControlsController {
  let randomRollSet: Dnd5eRandomAbilitySet | null = null;

  const render = (): void => {
    randomRollSet = null;
    methodHost.innerHTML = guidedAbilityMethodControlsHtml(methodSelect.value);
    bindMethodControls(methodSelect.value);
  };

  const bindMethodControls = (method: string): void => {
    if (method === "point-cost") {
      for (const input of root.querySelectorAll<HTMLInputElement>("[data-point-score]")) {
        input.addEventListener("input", () => updateGuidedPointBudget(root));
      }
      updateGuidedPointBudget(root);
    }

    if (method === "random") {
      root.querySelector<HTMLButtonElement>("#creator-random-roll")?.addEventListener("click", () => {
        clearError(errorTarget);
        try {
          const seedInput = root.querySelector<HTMLInputElement>("#creator-random-seed");
          randomRollSet = rollDnd5eRandomAbilitySet(seedInput?.value ?? "");
          if (seedInput) seedInput.value = randomRollSet.seed;
          renderGuidedRandomRollSet(root, randomRollSet);
          populateGuidedRandomAssignments(root, randomRollSet);
        } catch (caught) {
          randomRollSet = null;
          showError(errorTarget, caught, "Random ability generation failed.");
        }
      });
    }
  };

  methodSelect.addEventListener("change", render);
  render();

  return {
    read(): GuidedAbilityMethodInput {
      return readGuidedAbilityMethod(root, methodSelect.value, randomRollSet);
    },
  };
}

export function guidedAbilityMethodControlsHtml(method: string): string {
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
    return `${abilityFieldset("Point Cost scores", [
      abilityInput("creator-point", "STR", "strength", 15, 8, 15, "data-point-score"),
      abilityInput("creator-point", "DEX", "dexterity", 14, 8, 15, "data-point-score"),
      abilityInput("creator-point", "CON", "constitution", 13, 8, 15, "data-point-score"),
      abilityInput("creator-point", "INT", "intelligence", 12, 8, 15, "data-point-score"),
      abilityInput("creator-point", "WIS", "wisdom", 10, 8, 15, "data-point-score"),
      abilityInput("creator-point", "CHA", "charisma", 8, 8, 15, "data-point-score"),
    ])}<p id="creator-point-budget" class="point-budget"></p>`;
  }
  return `<label>Optional random seed<input id="creator-random-seed" type="text" placeholder="Leave blank for a new seed" /></label><button id="creator-random-roll" type="button" class="secondary-action">Roll 4d6 keep highest 3</button><div id="creator-random-roll-results" class="random-roll-grid"></div>${abilityFieldset("Assign rolled totals", [
    randomAssignmentSelect("STR", "strength", 0),
    randomAssignmentSelect("DEX", "dexterity", 1),
    randomAssignmentSelect("CON", "constitution", 2),
    randomAssignmentSelect("INT", "intelligence", 3),
    randomAssignmentSelect("WIS", "wisdom", 4),
    randomAssignmentSelect("CHA", "charisma", 5),
  ])}`;
}

export function readGuidedAbilityMethod(
  root: HTMLElement,
  method: string,
  randomRollSet: Dnd5eRandomAbilitySet | null,
): GuidedAbilityMethodInput {
  if (method === "standard-array") return { method, assignment: readStandardArrayScores(root) };
  if (method === "manual") return { method, scores: readAbilityScores(root, "creator-manual") };
  if (method === "point-cost") return { method, scores: readAbilityScores(root, "creator-point") };
  if (method === "random") {
    if (!randomRollSet) throw new Error("Roll the six random ability totals before building the character.");
    return { method, seed: randomRollSet.seed, assignment: readRandomAssignment(root) };
  }
  throw new Error("Choose a supported ability-generation method.");
}

export function updateGuidedPointBudget(root: HTMLElement): void {
  const budget = root.querySelector<HTMLElement>("#creator-point-budget");
  if (!budget) return;
  try {
    const spent = calculateDnd5ePointCost(readAbilityScores(root, "creator-point"));
    const remaining = DND5E_POINT_COST_BUDGET - spent;
    budget.textContent = `${spent} / ${DND5E_POINT_COST_BUDGET} points spent · ${Math.abs(remaining)} ${remaining < 0 ? "over" : "remaining"}`;
    budget.classList.toggle("over-budget", remaining < 0);
  } catch {
    budget.textContent = "Enter scores from 8 through 15.";
    budget.classList.add("over-budget");
  }
}

export function renderGuidedRandomRollSet(root: HTMLElement, set: Dnd5eRandomAbilitySet): void {
  const target = root.querySelector<HTMLElement>("#creator-random-roll-results");
  if (!target) return;
  target.innerHTML = set.results
    .map((entry) => `<div class="random-roll-card"><span>Roll ${entry.rollIndex + 1}</span><strong>${entry.total}</strong><small>${entry.rolls.join(" · ")} → ${entry.keptValues.join(" + ")}</small></div>`)
    .join("");
}

export function populateGuidedRandomAssignments(root: HTMLElement, set: Dnd5eRandomAbilitySet): void {
  (["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const).forEach((id, index) => {
    const select = root.querySelector<HTMLSelectElement>(`#creator-random-${id}`);
    if (!select) return;
    select.innerHTML = set.results
      .map((entry) => `<option value="${entry.rollIndex}"${entry.rollIndex === index ? " selected" : ""}>Roll ${entry.rollIndex + 1}: ${entry.total}</option>`)
      .join("");
    select.disabled = false;
  });
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

function abilityFieldset(legend: string, fields: readonly string[]): string {
  return `<fieldset class="ability-fieldset"><legend>${legend}</legend><div class="ability-input-grid">${fields.join("")}</div></fieldset>`;
}

function standardArraySelect(label: string, id: string, selected: number): string {
  return `<label>${label}<select id="creator-standard-${id}">${DND5E_STANDARD_ARRAY.map((value) => `<option value="${value}"${value === selected ? " selected" : ""}>${value}</option>`).join("")}</select></label>`;
}

function randomAssignmentSelect(label: string, id: string, index: number): string {
  return `<label>${label}<select id="creator-random-${id}" disabled><option value="${index}">Roll first</option></select></label>`;
}

function abilityInput(
  prefix: string,
  label: string,
  id: string,
  value: number,
  min: number,
  max: number,
  extra = "",
): string {
  return `<label>${label}<input id="${prefix}-${id}" type="number" min="${min}" max="${max}" step="1" required value="${value}" ${extra} /></label>`;
}

function clearError(target: HTMLElement | null): void {
  if (target) target.textContent = "";
}

function showError(target: HTMLElement | null, error: unknown, fallback: string): void {
  if (target) target.textContent = error instanceof Error ? error.message : fallback;
}
