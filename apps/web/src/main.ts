import {
  calculateDnd5ePointCost,
  DND5E_POINT_COST_BUDGET,
  dnd5eSrd521Adapter,
  manualGenerateDnd5eFirstSlice,
  pointCostGenerateDnd5eFirstSlice,
  quickGenerateDnd5eFirstSlice,
  type Dnd5eAbilityIncreasePlan,
  type Dnd5eAbilityScores,
  type Dnd5eNativeCharacter,
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
        <p>Generate a legal Level 1 Human Soldier Fighter with minimal input. The rules engine still records the ability assignment, background increases, and generation seed.</p>
      </div>
      <form id="quick-form" class="quick-form">
        <label>
          Character name
          <input id="character-name" name="characterName" type="text" maxlength="80" placeholder="Leave blank for a generated name" />
        </label>
        <label>
          Seed
          <input id="character-seed" name="seed" type="text" maxlength="120" placeholder="Optional, for repeatable generation" />
        </label>
        <button type="submit">Generate character</button>
      </form>
    </section>

    <section class="creator-panel">
      <div class="creator-copy">
        <p class="eyebrow">Manual ability entry</p>
        <h2>Enter the scores yourself</h2>
        <p>Enter pre-background ability scores directly. This slice keeps Human, Soldier, and Fighter fixed, then applies a legal Soldier background increase through the same shared ability-state path used by Standard Array.</p>
      </div>
      <form id="manual-form" class="quick-form manual-form">
        <label>
          Character name
          <input id="manual-name" name="manualName" type="text" maxlength="80" required placeholder="Required for manual entry" />
        </label>
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
        <label>
          Soldier ability increases
          <select id="manual-boost-plan" name="manualBoostPlan">${soldierBoostOptions()}</select>
        </label>
        <p id="manual-error" class="form-error" role="alert"></p>
        <button type="submit">Build manual character</button>
      </form>
    </section>

    <section class="creator-panel">
      <div class="creator-copy">
        <p class="eyebrow">Point Cost</p>
        <h2>Spend a 27-point ability budget</h2>
        <p>Choose pre-background scores from 8 through 15. Character Forge applies the SRD 5.2.1 point costs, rejects allocations over 27 points, then uses the same Soldier adjustment and final-score pipeline as the other generation methods.</p>
      </div>
      <form id="point-form" class="quick-form point-form">
        <label>
          Character name
          <input id="point-name" name="pointName" type="text" maxlength="80" required placeholder="Required for Point Cost" />
        </label>
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
        <label>
          Soldier ability increases
          <select id="point-boost-plan" name="pointBoostPlan">${soldierBoostOptions()}</select>
        </label>
        <p id="point-error" class="form-error" role="alert"></p>
        <button id="point-submit" type="submit">Build point-cost character</button>
      </form>
    </section>

    <section id="result" class="result-panel empty-result" aria-live="polite">
      <p>Your generated character will appear here.</p>
    </section>
  </section>
`;

const form = document.querySelector<HTMLFormElement>("#quick-form");
const nameInput = document.querySelector<HTMLInputElement>("#character-name");
const seedInput = document.querySelector<HTMLInputElement>("#character-seed");
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
const result = document.querySelector<HTMLElement>("#result");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const character = quickGenerateDnd5eFirstSlice({
    ...(nameInput?.value.trim() ? { name: nameInput.value.trim() } : {}),
    ...(seedInput?.value.trim() ? { seed: seedInput.value.trim() } : {}),
  });
  renderCharacter(character);
  postCharacterToHost(character);
});

manualForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (manualError) manualError.textContent = "";
  try {
    const character = manualGenerateDnd5eFirstSlice({
      name: manualNameInput?.value ?? "",
      scores: readAbilityScores("manual"),
      backgroundIncreases: readSoldierBoostPlan(manualBoostSelect?.value ?? ""),
    });
    renderCharacter(character);
    postCharacterToHost(character);
  } catch (error) {
    if (manualError) {
      manualError.textContent = error instanceof Error ? error.message : "Manual character generation failed.";
    }
  }
});

pointForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (pointError) pointError.textContent = "";
  try {
    const character = pointCostGenerateDnd5eFirstSlice({
      name: pointNameInput?.value ?? "",
      scores: readAbilityScores("point"),
      backgroundIncreases: readSoldierBoostPlan(pointBoostSelect?.value ?? ""),
    });
    renderCharacter(character);
    postCharacterToHost(character);
  } catch (error) {
    if (pointError) {
      pointError.textContent = error instanceof Error ? error.message : "Point Cost generation failed.";
    }
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

function renderCharacter(character: CharacterDocument): void {
  if (!result) return;
  const nativeState = character.nativeStates.find((state) => state.id === character.primaryNativeStateId);
  if (!nativeState) {
    renderCharacterFailure(character, "The primary native state is missing from this character document.");
    return;
  }
  if (nativeState.systemId !== dnd5eSrd521Adapter.systemId
    || nativeState.editionId !== dnd5eSrd521Adapter.editionId) {
    renderCharacterFailure(
      character,
      `This Character Forge build cannot open ${nativeState.systemId} ${nativeState.editionId}.`,
    );
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
      <div>
        <p class="eyebrow">Character</p>
        <h2>${escapeHtml(character.displayName)}</h2>
        <p>Level 1 Human Soldier Fighter</p>
      </div>
      <span class="validation-pill valid">Native state valid</span>
    </div>
    <div class="ability-grid">
      ${abilityCard("STR", abilities.strength)}
      ${abilityCard("DEX", abilities.dexterity)}
      ${abilityCard("CON", abilities.constitution)}
      ${abilityCard("INT", abilities.intelligence)}
      ${abilityCard("WIS", abilities.wisdom)}
      ${abilityCard("CHA", abilities.charisma)}
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
    <details>
      <summary>Inspect native character document</summary>
      <pre>${escapeHtml(JSON.stringify(character, null, 2))}</pre>
    </details>
  `;
}

function renderCharacterFailure(character: CharacterDocument, message: string): void {
  if (!result) return;
  result.classList.remove("empty-result");
  result.innerHTML = `
    <div class="result-heading">
      <div>
        <p class="eyebrow">Character</p>
        <h2>${escapeHtml(character.displayName)}</h2>
      </div>
      <span class="validation-pill invalid">Validation failed</span>
    </div>
    <p>${escapeHtml(message)}</p>
    <details>
      <summary>Inspect retained character document</summary>
      <pre>${escapeHtml(JSON.stringify(character, null, 2))}</pre>
    </details>
  `;
}

function postCharacterToHost(character: CharacterDocument): void {
  if (window.parent === window) return;
  window.parent.postMessage({
    type: CHARACTER_GENERATED_MESSAGE,
    payload: {
      projectId,
      character,
    },
  }, hostOrigin ?? "*");
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

function abilityInput(
  prefix: string,
  label: string,
  abilityId: string,
  value: number,
  min: number,
  max: number,
): string {
  return `<label>${label}<input id="${prefix}-${abilityId}" name="${prefix}-${abilityId}" type="number" min="${min}" max="${max}" step="1" required value="${value}" /></label>`;
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
