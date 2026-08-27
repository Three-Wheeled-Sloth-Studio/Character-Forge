import {
  calculateDnd5ePointCost,
  DND5E_POINT_COST_BUDGET,
  DND5E_STANDARD_ARRAY,
  dnd5eSrd521Adapter,
  manualGenerateDnd5eFirstSlice,
  pointCostGenerateDnd5eFirstSlice,
  quickGenerateDnd5eFirstSlice,
  randomGenerateDnd5eFirstSlice,
  rollDnd5eRandomAbilitySet,
  standardArrayGenerateDnd5eFirstSlice,
  type Dnd5eAbilityIncreasePlan,
  type Dnd5eAbilityScores,
  type Dnd5eNativeCharacter,
  type Dnd5eRandomAbilityAssignment,
  type Dnd5eRandomAbilitySet,
} from "../../../packages/system-dnd5e/src/index.js";
import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  parseCharacterOpenMessage,
  resolveHostOrigin,
} from "./characterForgeHostBridge.js";

const CHARACTER_GENERATED_MESSAGE = "character-forge:character-generated";
const params = new URLSearchParams(window.location.search);
const projectId = params.get("pwProjectId") ?? "";
const projectName = params.get("pwProjectName") ?? "";
const returnUrl = params.get("pwReturnUrl") ?? "";
const hostOrigin = resolveHostOrigin(returnUrl);
const app = document.querySelector<HTMLElement>("#app");

if (!app) throw new Error("Character Forge application root was not found.");

app.innerHTML = `
  <section class="forge-shell">
    <header class="forge-header">
      <div>
        <p class="eyebrow">Parchment Worlds module</p>
        <h1>Character Forge</h1>
        <p class="lede">Create a system-native character first. Translation magic comes later.</p>
      </div>
      ${projectName ? `<div class="project-chip">Project: <strong>${escapeHtml(projectName)}</strong></div>` : ""}
    </header>

    <section class="creator-panel">
      <div class="creator-copy">
        <p class="eyebrow">D&D 5E 2024 / SRD 5.2.1</p>
        <h2>Quick character</h2>
        <p>Generate a legal Level 1 Human Soldier Fighter with minimal input. The rules engine records the ability assignment, background increases, and generation seed.</p>
      </div>
      <form id="quick-form" class="quick-form">
        <label>Character name<input id="character-name" type="text" maxlength="80" placeholder="Leave blank for a generated name" /></label>
        <label>Seed<input id="character-seed" type="text" maxlength="120" placeholder="Optional, for repeatable generation" /></label>
        <button type="submit">Generate character</button>
      </form>
    </section>

    <section class="creator-panel">
      <div class="creator-copy">
        <p class="eyebrow">Standard Array</p>
        <h2>Assign the six standard scores</h2>
        <p>Assign 15, 14, 13, 12, 10, and 8 exactly once, then apply the Soldier background increase through the shared ability-state path.</p>
      </div>
      <form id="standard-form" class="quick-form">
        <label>Character name<input id="standard-name" type="text" maxlength="80" required placeholder="Required for Standard Array" /></label>
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
        <label>Soldier ability increases<select id="standard-boost-plan">${soldierBoostOptions()}</select></label>
        <p id="standard-error" class="form-error" role="alert"></p>
        <button type="submit">Build standard-array character</button>
      </form>
    </section>

    <section class="creator-panel">
      <div class="creator-copy">
        <p class="eyebrow">Manual ability entry</p>
        <h2>Enter the scores yourself</h2>
        <p>Enter pre-background ability scores directly. Manual entry is a validation utility, while the SRD generation methods remain independently represented.</p>
      </div>
      <form id="manual-form" class="quick-form manual-form">
        <label>Character name<input id="manual-name" type="text" maxlength="80" required placeholder="Required for manual entry" /></label>
        <fieldset class="manual-ability-fieldset">
          <legend>Base ability scores</legend>
          <div class="manual-ability-grid">
            ${abilityInput("manual", "STR", "strength", 15, 3, 18)}
            ${abilityInput("manual", "DEX", "dexterity", 14, 3, 18)}
            ${abilityInput("manual", "CON", "constitution", 13, 3, 18)}
            ${abilityInput("manual", "INT", "intelligence", 12, 3, 18)}
            ${abilityInput("manual", "WIS", "wisdom", 10, 3, 18)}
            ${abilityInput("manual", "CHA", "charisma", 8, 3, 18)}
          </div>
        </fieldset>
        <label>Soldier ability increases<select id="manual-boost-plan">${soldierBoostOptions()}</select></label>
        <p id="manual-error" class="form-error" role="alert"></p>
        <button type="submit">Build manual character</button>
      </form>
    </section>

    <section class="creator-panel">
      <div class="creator-copy">
        <p class="eyebrow">Point Cost</p>
        <h2>Spend a 27-point ability budget</h2>
        <p>Choose pre-background scores from 8 through 15. The SRD point-cost table and 27-point cap remain D&D-owned rules data.</p>
      </div>
      <form id="point-form" class="quick-form point-form">
        <label>Character name<input id="point-name" type="text" maxlength="80" required placeholder="Required for Point Cost" /></label>
        <fieldset class="manual-ability-fieldset">
          <legend>Base ability scores</legend>
          <div class="manual-ability-grid">
            ${abilityInput("point", "STR", "strength", 15, 8, 15)}
            ${abilityInput("point", "DEX", "dexterity", 14, 8, 15)}
            ${abilityInput("point", "CON", "constitution", 13, 8, 15)}
            ${abilityInput("point", "INT", "intelligence", 12, 8, 15)}
            ${abilityInput("point", "WIS", "wisdom", 10, 8, 15)}
            ${abilityInput("point", "CHA", "charisma", 8, 8, 15)}
          </div>
        </fieldset>
        <div id="point-budget" class="point-budget" aria-live="polite"></div>
        <label>Soldier ability increases<select id="point-boost-plan">${soldierBoostOptions()}</select></label>
        <p id="point-error" class="form-error" role="alert"></p>
        <button id="point-submit" type="submit">Build point-cost character</button>
      </form>
    </section>

    <section class="creator-panel">
      <div class="creator-copy">
        <p class="eyebrow">Random Generation</p>
        <h2>Roll 4d6, keep the highest 3</h2>
        <p>Generate six scores from a replayable seed, inspect every die, then assign each roll slot exactly once before applying the Soldier increase.</p>
      </div>
      <form id="random-form" class="quick-form">
        <label>Character name<input id="random-name" type="text" maxlength="80" required placeholder="Required for Random Generation" /></label>
        <label>Seed<input id="random-seed" type="text" maxlength="120" placeholder="Optional; generated if blank" /></label>
        <button id="random-roll" type="button">Roll six scores</button>
        <div id="random-roll-results" class="random-roll-grid" aria-live="polite"><span class="muted">Roll scores to begin.</span></div>
        <fieldset class="manual-ability-fieldset">
          <legend>Assign roll slots</legend>
          <div class="manual-ability-grid">
            ${randomAssignmentSelect("STR", "strength", 0)}
            ${randomAssignmentSelect("DEX", "dexterity", 1)}
            ${randomAssignmentSelect("CON", "constitution", 2)}
            ${randomAssignmentSelect("INT", "intelligence", 3)}
            ${randomAssignmentSelect("WIS", "wisdom", 4)}
            ${randomAssignmentSelect("CHA", "charisma", 5)}
          </div>
        </fieldset>
        <label>Soldier ability increases<select id="random-boost-plan">${soldierBoostOptions()}</select></label>
        <p id="random-error" class="form-error" role="alert"></p>
        <button id="random-submit" type="submit" disabled>Build random character</button>
      </form>
    </section>

    <section id="result" class="result-panel empty-result" aria-live="polite">
      <p>Your generated character will appear here.</p>
    </section>
  </section>
`;

const quickForm = document.querySelector<HTMLFormElement>("#quick-form");
const nameInput = document.querySelector<HTMLInputElement>("#character-name");
const seedInput = document.querySelector<HTMLInputElement>("#character-seed");
const standardForm = document.querySelector<HTMLFormElement>("#standard-form");
const standardNameInput = document.querySelector<HTMLInputElement>("#standard-name");
const standardBoostSelect = document.querySelector<HTMLSelectElement>("#standard-boost-plan");
const standardError = document.querySelector<HTMLElement>("#standard-error");
const manualForm = document.querySelector<HTMLFormElement>("#manual-form");
const manualNameInput = document.querySelector<HTMLInputElement>("#manual-name");
const manualBoostSelect = document.querySelector<HTMLSelectElement>("#manual-boost-plan");
const manualError = document.querySelector<HTMLElement>("#manual-error");
const pointForm = document.querySelector<HTMLFormElement>("#point-form");
const pointNameInput = document.querySelector<HTMLInputElement>("#point-name");
const pointBoostSelect = document.querySelector<HTMLSelectElement>("#point-boost-plan");
const pointBudget = document.querySelector<HTMLElement>("#point-budget");
const pointError = document.querySelector<HTMLElement>("#point-error");
const pointSubmit = document.querySelector<HTMLButtonElement>("#point-submit");
const randomForm = document.querySelector<HTMLFormElement>("#random-form");
const randomNameInput = document.querySelector<HTMLInputElement>("#random-name");
const randomSeedInput = document.querySelector<HTMLInputElement>("#random-seed");
const randomRollButton = document.querySelector<HTMLButtonElement>("#random-roll");
const randomRollResults = document.querySelector<HTMLElement>("#random-roll-results");
const randomBoostSelect = document.querySelector<HTMLSelectElement>("#random-boost-plan");
const randomError = document.querySelector<HTMLElement>("#random-error");
const randomSubmit = document.querySelector<HTMLButtonElement>("#random-submit");
const result = document.querySelector<HTMLElement>("#result");
let randomRollSet: Dnd5eRandomAbilitySet | null = null;

quickForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const character = quickGenerateDnd5eFirstSlice({
    ...(nameInput?.value.trim() ? { name: nameInput.value.trim() } : {}),
    ...(seedInput?.value.trim() ? { seed: seedInput.value.trim() } : {}),
  });
  publishCharacter(character);
});

standardForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError(standardError);
  try {
    publishCharacter(standardArrayGenerateDnd5eFirstSlice({
      name: standardNameInput?.value ?? "",
      assignment: readStandardArrayScores(),
      backgroundIncreases: readSoldierBoostPlan(standardBoostSelect?.value ?? ""),
    }));
  } catch (error) {
    showError(standardError, error, "Standard Array generation failed.");
  }
});

manualForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError(manualError);
  try {
    publishCharacter(manualGenerateDnd5eFirstSlice({
      name: manualNameInput?.value ?? "",
      scores: readAbilityScores("manual"),
      backgroundIncreases: readSoldierBoostPlan(manualBoostSelect?.value ?? ""),
    }));
  } catch (error) {
    showError(manualError, error, "Manual character generation failed.");
  }
});

pointForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError(pointError);
  try {
    publishCharacter(pointCostGenerateDnd5eFirstSlice({
      name: pointNameInput?.value ?? "",
      scores: readAbilityScores("point"),
      backgroundIncreases: readSoldierBoostPlan(pointBoostSelect?.value ?? ""),
    }));
  } catch (error) {
    showError(pointError, error, "Point Cost generation failed.");
  }
});

randomRollButton?.addEventListener("click", () => {
  clearError(randomError);
  try {
    randomRollSet = rollDnd5eRandomAbilitySet(randomSeedInput?.value ?? "");
    if (randomSeedInput) randomSeedInput.value = randomRollSet.seed;
    renderRandomRollSet(randomRollSet);
    populateRandomAssignments(randomRollSet);
    if (randomSubmit) randomSubmit.disabled = false;
  } catch (error) {
    randomRollSet = null;
    if (randomSubmit) randomSubmit.disabled = true;
    showError(randomError, error, "Random ability generation failed.");
  }
});

randomForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError(randomError);
  try {
    if (!randomRollSet) throw new Error("Roll six ability scores before building the character.");
    publishCharacter(randomGenerateDnd5eFirstSlice({
      name: randomNameInput?.value ?? "",
      seed: randomRollSet.seed,
      assignment: readRandomAssignment(),
      backgroundIncreases: readSoldierBoostPlan(randomBoostSelect?.value ?? ""),
    }));
  } catch (error) {
    showError(randomError, error, "Random character generation failed.");
  }
});

for (const input of document.querySelectorAll<HTMLInputElement>("[id^='point-']")) {
  if (input.type === "number") input.addEventListener("input", updatePointBudget);
}
updatePointBudget();

window.addEventListener("message", (event: MessageEvent<unknown>) => {
  if (window.parent === window || event.source !== window.parent) return;
  if (!hostOrigin || event.origin !== hostOrigin) return;
  const opened = parseCharacterOpenMessage(event.data);
  if (!opened) return;
  if (projectId && opened.payload.projectId !== projectId) return;
  renderCharacter(opened.payload.character);
});

function publishCharacter(character: CharacterDocument): void {
  renderCharacter(character);
  postCharacterToHost(character);
}

function renderCharacter(character: CharacterDocument): void {
  if (!result) return;
  const nativeState = character.nativeStates.find((state) => state.id === character.primaryNativeStateId);
  if (!nativeState) {
    renderCharacterFailure(character, "The primary native state is missing from this character document.");
    return;
  }
  if (nativeState.systemId !== dnd5eSrd521Adapter.systemId
    || nativeState.editionId !== dnd5eSrd521Adapter.editionId) {
    renderCharacterFailure(character, `This Character Forge build cannot open ${nativeState.systemId} ${nativeState.editionId}.`);
    return;
  }

  const validation = dnd5eSrd521Adapter.validateNativeState(nativeState);
  if (!validation.valid) {
    renderCharacterFailure(
      character,
      validation.issues.map((issue) => issue.message).join(" ") || "Native state validation failed.",
    );
    return;
  }

  const payload = nativeState.payload as Dnd5eNativeCharacter;
  const abilities = payload.abilities.final;
  const seed = character.generation?.seed;

  result.classList.remove("empty-result");
  result.innerHTML = `
    <div class="result-heading">
      <div><p class="eyebrow">Character</p><h2>${escapeHtml(character.displayName)}</h2><p>Level 1 Human Soldier Fighter</p></div>
      <span class="validation-pill valid">Native state valid</span>
    </div>
    <div class="ability-grid">
      ${abilityCard("STR", abilities.strength)}${abilityCard("DEX", abilities.dexterity)}${abilityCard("CON", abilities.constitution)}
      ${abilityCard("INT", abilities.intelligence)}${abilityCard("WIS", abilities.wisdom)}${abilityCard("CHA", abilities.charisma)}
    </div>
    <div class="stat-grid">
      ${statCard("HP", String(payload.resources.hitPointsMaximum))}
      ${statCard("AC", String(payload.derived.armorClass))}
      ${statCard("Initiative", signed(payload.derived.initiativeModifier))}
      ${statCard("Passive Perception", String(payload.derived.passivePerception))}
    </div>
    <div class="result-details">
      <div><strong>Ability method</strong><span>${humanize(payload.abilities.generationMethod)}</span></div>
      <div><strong>Fighting style</strong><span>${humanize(payload.class.fightingStyleFeatId)}</span></div>
      <div><strong>Origin feats</strong><span>${humanize(payload.origin.backgroundOriginFeatId)}, ${humanize(payload.origin.speciesOriginFeatId)}</span></div>
      <div><strong>Weapon mastery</strong><span>${payload.class.weaponMasteryIds.map(humanize).join(", ")}</span></div>
      <div><strong>Equipment</strong><span>${payload.equipment.map((item) => `${item.quantity} x ${humanize(item.itemId)}`).join(", ")}</span></div>
      ${seed ? `<div><strong>Generation seed</strong><code>${escapeHtml(seed)}</code></div>` : ""}
    </div>
    <details><summary>Inspect native character document</summary><pre>${escapeHtml(JSON.stringify(character, null, 2))}</pre></details>
  `;
}

function renderCharacterFailure(character: CharacterDocument, message: string): void {
  if (!result) return;
  result.classList.remove("empty-result");
  result.innerHTML = `
    <div class="result-heading"><div><p class="eyebrow">Character</p><h2>${escapeHtml(character.displayName)}</h2></div><span class="validation-pill invalid">Validation failed</span></div>
    <p>${escapeHtml(message)}</p>
    <details><summary>Inspect retained character document</summary><pre>${escapeHtml(JSON.stringify(character, null, 2))}</pre></details>
  `;
}

function postCharacterToHost(character: CharacterDocument): void {
  if (window.parent === window) return;
  window.parent.postMessage({
    type: CHARACTER_GENERATED_MESSAGE,
    payload: { projectId, character },
  }, hostOrigin ?? "*");
}

function readStandardArrayScores(): Dnd5eAbilityScores {
  return {
    strength: readSelectNumber("standard-strength"),
    dexterity: readSelectNumber("standard-dexterity"),
    constitution: readSelectNumber("standard-constitution"),
    intelligence: readSelectNumber("standard-intelligence"),
    wisdom: readSelectNumber("standard-wisdom"),
    charisma: readSelectNumber("standard-charisma"),
  };
}

function readAbilityScores(prefix: "manual" | "point"): Dnd5eAbilityScores {
  return {
    strength: readAbilityInput(prefix, "strength"),
    dexterity: readAbilityInput(prefix, "dexterity"),
    constitution: readAbilityInput(prefix, "constitution"),
    intelligence: readAbilityInput(prefix, "intelligence"),
    wisdom: readAbilityInput(prefix, "wisdom"),
    charisma: readAbilityInput(prefix, "charisma"),
  };
}

function readAbilityInput(prefix: string, abilityId: string): number {
  const input = document.querySelector<HTMLInputElement>(`#${prefix}-${abilityId}`);
  const value = Number(input?.value);
  if (!Number.isInteger(value)) throw new Error(`${abilityId} must be a whole-number ability score.`);
  return value;
}

function readSelectNumber(id: string): number {
  const select = document.querySelector<HTMLSelectElement>(`#${id}`);
  const value = Number(select?.value);
  if (!Number.isInteger(value)) throw new Error(`${id} requires a numeric selection.`);
  return value;
}

function updatePointBudget(): void {
  if (!pointBudget) return;
  try {
    const pointsSpent = calculateDnd5ePointCost(readAbilityScores("point"));
    const remaining = DND5E_POINT_COST_BUDGET - pointsSpent;
    const overBudget = remaining < 0;
    pointBudget.textContent = `${pointsSpent} / ${DND5E_POINT_COST_BUDGET} points spent · ${Math.abs(remaining)} ${overBudget ? "over" : "remaining"}`;
    pointBudget.classList.toggle("over-budget", overBudget);
    if (pointSubmit) pointSubmit.disabled = overBudget;
  } catch {
    pointBudget.textContent = "Enter scores from 8 through 15 to calculate the point budget.";
    pointBudget.classList.add("over-budget");
    if (pointSubmit) pointSubmit.disabled = true;
  }
}

function renderRandomRollSet(rollSet: Dnd5eRandomAbilitySet): void {
  if (!randomRollResults) return;
  randomRollResults.innerHTML = rollSet.results.map((entry) => `
    <div class="random-roll-card">
      <span>Roll ${entry.rollIndex + 1}</span>
      <strong>${entry.total}</strong>
      <small>${entry.rolls.join(" · ")} → keep ${entry.keptValues.join(" + ")}</small>
    </div>
  `).join("");
}

function populateRandomAssignments(rollSet: Dnd5eRandomAbilitySet): void {
  const abilityIds = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const;
  abilityIds.forEach((abilityId, defaultIndex) => {
    const select = document.querySelector<HTMLSelectElement>(`#random-${abilityId}`);
    if (!select) return;
    select.innerHTML = rollSet.results.map((entry) =>
      `<option value="${entry.rollIndex}"${entry.rollIndex === defaultIndex ? " selected" : ""}>Roll ${entry.rollIndex + 1}: ${entry.total}</option>`,
    ).join("");
    select.disabled = false;
  });
}

function readRandomAssignment(): Dnd5eRandomAbilityAssignment {
  return {
    strength: readSelectNumber("random-strength"),
    dexterity: readSelectNumber("random-dexterity"),
    constitution: readSelectNumber("random-constitution"),
    intelligence: readSelectNumber("random-intelligence"),
    wisdom: readSelectNumber("random-wisdom"),
    charisma: readSelectNumber("random-charisma"),
  };
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

function standardArraySelect(label: string, abilityId: string, selected: number): string {
  const options = DND5E_STANDARD_ARRAY.map((value) =>
    `<option value="${value}"${value === selected ? " selected" : ""}>${value}</option>`,
  ).join("");
  return `<label>${label}<select id="standard-${abilityId}">${options}</select></label>`;
}

function randomAssignmentSelect(label: string, abilityId: string, defaultIndex: number): string {
  return `<label>${label}<select id="random-${abilityId}" disabled><option value="${defaultIndex}">Roll first</option></select></label>`;
}

function abilityInput(
  prefix: string,
  label: string,
  abilityId: string,
  value: number,
  min: number,
  max: number,
): string {
  return `<label>${label}<input id="${prefix}-${abilityId}" type="number" min="${min}" max="${max}" step="1" required value="${value}" /></label>`;
}

function clearError(target: HTMLElement | null): void {
  if (target) target.textContent = "";
}

function showError(target: HTMLElement | null, error: unknown, fallback: string): void {
  if (target) target.textContent = error instanceof Error ? error.message : fallback;
}

function abilityCard(label: string, score: number): string {
  const modifier = Math.floor((score - 10) / 2);
  return `<div class="ability-card"><span>${label}</span><strong>${score}</strong><small>${signed(modifier)}</small></div>`;
}

function statCard(label: string, value: string): string {
  return `<div class="stat-card"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function signed(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

function humanize(value: string): string {
  return value
    .split(":").at(-1)!
    .split("-")
    .map((part) => part ? part[0]!.toUpperCase() + part.slice(1) : part)
    .join(" ");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
