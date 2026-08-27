import type { CharacterDocument, GenerationDecision } from "../../../packages/character-model/src/index.js";
import {
  calculateDnd5ePointCost,
  classChoiceRules,
  defaultGuidedDnd5eCoreChoices,
  DND5E_ALIGNMENT_OPTIONS,
  DND5E_BONUS_LANGUAGE_OPTIONS,
  DND5E_FIGHTING_STYLE_OPTIONS,
  DND5E_HUMAN_ORIGIN_FEAT_OPTIONS,
  DND5E_MONK_TOOL_OPTIONS,
  DND5E_POINT_COST_BUDGET,
  DND5E_SKILL_OPTIONS,
  DND5E_SKILLED_PROFICIENCY_OPTIONS,
  DND5E_SRD_521_BACKGROUND_OPTIONS,
  DND5E_SRD_521_CLASS_OPTIONS,
  DND5E_SRD_521_SPECIES_OPTIONS,
  DND5E_STANDARD_ARRAY,
  DND5E_STANDARD_LANGUAGE_OPTIONS,
  DND5E_WEAPON_OPTIONS,
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
  type GuidedDnd5eCoreChoices,
  type GuidedDnd5eSpeciesId,
} from "../../../packages/system-dnd5e/src/index.js";
import {
  loadStickyMultiChoicePool,
  pickManyFromAcceptablePool,
  saveStickyMultiChoicePool,
  type StickyMultiChoicePoolState,
} from "./stickyMultiChoicePool.js";
import {
  loadStickyChoicePool,
  pickFromAcceptablePool,
  saveStickyChoicePool,
  type StickyChoicePoolState,
} from "./stickyChoicePool.js";

const CLASS_STORAGE_KEY = "character-forge.dnd5e.guided.class-pool.v1";
const BACKGROUND_STORAGE_KEY = "character-forge.dnd5e.guided.background-pool.v1";
const SPECIES_STORAGE_KEY = "character-forge.dnd5e.guided.species-pool.v1";
const CORE_STORAGE_PREFIX = "character-forge.dnd5e.guided.core.v1";

export function mountGuidedCreationPanel(
  root: HTMLElement,
  onCharacter: (character: CharacterDocument) => void,
): void {
  let classState = loadStickyChoicePool(localStorage, CLASS_STORAGE_KEY, GUIDED_DND5E_CLASS_IDS, GUIDED_DND5E_CLASS_IDS, "fighter");
  let backgroundState = loadStickyChoicePool(localStorage, BACKGROUND_STORAGE_KEY, GUIDED_DND5E_BACKGROUND_IDS, GUIDED_DND5E_BACKGROUND_IDS, "soldier");
  let speciesState = loadStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, GUIDED_DND5E_SPECIES_IDS, GUIDED_DND5E_SPECIES_IDS, "human");
  let classMode: GuidedChoiceSelectionMode = "direct";
  let backgroundMode: GuidedChoiceSelectionMode = "direct";
  let speciesMode: GuidedChoiceSelectionMode = "direct";
  let randomRollSet: Dnd5eRandomAbilitySet | null = null;

  root.innerHTML = creatorHtml(classState, backgroundState, speciesState);
  const form = requiredElement(root, "#creator-form", HTMLFormElement);
  const error = root.querySelector<HTMLElement>("#creator-error");
  const classSelect = requiredElement(root, "#creator-class-selected", HTMLSelectElement);
  const backgroundSelect = requiredElement(root, "#creator-background-selected", HTMLSelectElement);
  const speciesSelect = requiredElement(root, "#creator-species-selected", HTMLSelectElement);
  const methodSelect = requiredElement(root, "#creator-generation-method", HTMLSelectElement);
  const methodHost = requiredElement(root, "#generation-method-controls", HTMLElement);
  const coreHost = requiredElement(root, "#core-choice-controls", HTMLElement);
  const boostSelect = requiredElement(root, "#creator-boost-plan", HTMLSelectElement);

  const renderCoreControls = (): void => {
    coreHost.innerHTML = coreControlsHtml(classState.selectedId, backgroundState.selectedId, speciesState.selectedId);
    bindCoreControls();
  };

  const refreshAfterUniversalChoice = (): void => {
    refreshBackgroundBoosts(boostSelect, backgroundState.selectedId);
    renderCoreControls();
  };

  bindPool("class", classSelect, DND5E_SRD_521_CLASS_OPTIONS, GUIDED_DND5E_CLASS_IDS, () => classState, (next) => {
    classState = next; classMode = "direct"; saveStickyChoicePool(localStorage, CLASS_STORAGE_KEY, classState); renderCoreControls();
  });
  bindPool("background", backgroundSelect, DND5E_SRD_521_BACKGROUND_OPTIONS, GUIDED_DND5E_BACKGROUND_IDS, () => backgroundState, (next) => {
    backgroundState = next; backgroundMode = "direct"; saveStickyChoicePool(localStorage, BACKGROUND_STORAGE_KEY, backgroundState); refreshAfterUniversalChoice();
  });
  bindPool("species", speciesSelect, DND5E_SRD_521_SPECIES_OPTIONS, GUIDED_DND5E_SPECIES_IDS, () => speciesState, (next) => {
    speciesState = next; speciesMode = "direct"; saveStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, speciesState); renderCoreControls();
  });

  classSelect.addEventListener("change", () => {
    classState = { ...classState, selectedId: classSelect.value as GuidedDnd5eClassId };
    classMode = "direct"; saveStickyChoicePool(localStorage, CLASS_STORAGE_KEY, classState); renderCoreControls();
  });
  backgroundSelect.addEventListener("change", () => {
    backgroundState = { ...backgroundState, selectedId: backgroundSelect.value as GuidedDnd5eBackgroundId };
    backgroundMode = "direct"; saveStickyChoicePool(localStorage, BACKGROUND_STORAGE_KEY, backgroundState); refreshAfterUniversalChoice();
  });
  speciesSelect.addEventListener("change", () => {
    speciesState = { ...speciesState, selectedId: speciesSelect.value as GuidedDnd5eSpeciesId };
    speciesMode = "direct"; saveStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, speciesState); renderCoreControls();
  });

  bindRandomButton("class", classSelect, DND5E_SRD_521_CLASS_OPTIONS, () => classState, (next) => {
    classState = next; classMode = "random"; saveStickyChoicePool(localStorage, CLASS_STORAGE_KEY, classState); renderCoreControls();
  });
  bindRandomButton("background", backgroundSelect, DND5E_SRD_521_BACKGROUND_OPTIONS, () => backgroundState, (next) => {
    backgroundState = next; backgroundMode = "random"; saveStickyChoicePool(localStorage, BACKGROUND_STORAGE_KEY, backgroundState); refreshAfterUniversalChoice();
  });
  bindRandomButton("species", speciesSelect, DND5E_SRD_521_SPECIES_OPTIONS, () => speciesState, (next) => {
    speciesState = next; speciesMode = "random"; saveStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, speciesState); renderCoreControls();
  });

  const renderMethodControls = (): void => {
    randomRollSet = null;
    methodHost.innerHTML = methodControlsHtml(methodSelect.value);
    bindMethodControls(methodSelect.value);
  };

  const bindMethodControls = (method: string): void => {
    if (method === "point-cost") {
      for (const input of root.querySelectorAll<HTMLInputElement>("[data-point-score]")) input.addEventListener("input", updatePointBudget);
      updatePointBudget();
    }
    if (method === "random") {
      root.querySelector<HTMLButtonElement>("#creator-random-roll")?.addEventListener("click", () => {
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
      budget.textContent = `${pointsSpent} / ${DND5E_POINT_COST_BUDGET} points spent · ${Math.abs(remaining)} ${remaining < 0 ? "over" : "remaining"}`;
      budget.classList.toggle("over-budget", remaining < 0);
    } catch {
      budget.textContent = "Enter scores from 8 through 15.";
      budget.classList.add("over-budget");
    }
  };

  function bindCoreControls(): void {
    const prefix = coreKey(classState.selectedId, backgroundState.selectedId, speciesState.selectedId);
    const defaults = defaultGuidedDnd5eCoreChoices(classState.selectedId, backgroundState.selectedId, speciesState.selectedId);
    const rules = classChoiceRules(classState.selectedId)!;
    const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((option) => option.id === backgroundState.selectedId)!;
    const legalClassSkills = rules.skillIds.filter((id) => !(background.skillProficiencies as readonly string[]).includes(id));

    bindMultiChoice(`${prefix}.skills`, "class-skills", legalClassSkills, defaults.classSkillIds, rules.skillCount);
    if (rules.weaponMasteryCount > 0) bindMultiChoice(`${prefix}.mastery`, "weapon-mastery", rules.weaponMasteryIds, defaults.weaponMasteryIds, rules.weaponMasteryCount);

    bindStickySelect("alignment", DND5E_ALIGNMENT_OPTIONS.map((option) => option.id), defaults.alignmentId, prefix);
    bindStickySelect("language-1", DND5E_STANDARD_LANGUAGE_OPTIONS.map((option) => option.id), defaults.originLanguageIds[0], prefix);
    bindStickySelect("language-2", DND5E_STANDARD_LANGUAGE_OPTIONS.map((option) => option.id), defaults.originLanguageIds[1], prefix);
    bindStickySelect("class-equipment", rules.equipmentChoices.map((option) => option.id), defaults.classEquipmentChoice, prefix);
    if (classState.selectedId === "fighter") bindStickySelect("fighting-style", DND5E_FIGHTING_STYLE_OPTIONS.map((option) => option.id), defaults.fightingStyleFeatId ?? "defense", prefix);
    if (classState.selectedId === "monk") bindStickySelect("monk-tool", DND5E_MONK_TOOL_OPTIONS.map((option) => option.id), defaults.monkToolProficiencyId ?? DND5E_MONK_TOOL_OPTIONS[0]!.id, prefix);
    if (classState.selectedId === "rogue") {
      const selectedSkills = readMultiSelected(root, "class-skills", rules.skillCount);
      const expertiseOptions = [...new Set([...selectedSkills, ...background.skillProficiencies])];
      bindStickySelect("expertise-1", expertiseOptions, defaults.expertiseSkillIds?.[0] ?? expertiseOptions[0]!, prefix);
      bindStickySelect("expertise-2", expertiseOptions, defaults.expertiseSkillIds?.[1] ?? expertiseOptions[1] ?? expertiseOptions[0]!, prefix);
      bindStickySelect("rogue-language", DND5E_BONUS_LANGUAGE_OPTIONS.map((option) => option.id), defaults.rogueBonusLanguageId ?? "giant", prefix);
    }
    if (speciesState.selectedId === "human") {
      bindStickySelect("human-size", ["small", "medium"], defaults.human?.size ?? "medium", prefix);
      const takenSkills = new Set([...readMultiSelected(root, "class-skills", rules.skillCount), ...background.skillProficiencies]);
      const humanSkills = DND5E_SKILL_OPTIONS.map((option) => option.id).filter((id) => !takenSkills.has(id));
      bindStickySelect("human-skill", humanSkills, defaults.human?.skillId ?? humanSkills[0]!, prefix);
      const featOptions = DND5E_HUMAN_ORIGIN_FEAT_OPTIONS.filter((option) => option.supported && option.id !== background.originFeatId).map((option) => option.id);
      bindStickySelect("human-feat", featOptions, defaults.human?.originFeatId ?? featOptions[0]!, prefix, true);
      if (readStickySelect(root, "human-feat") === "skilled") {
        const skilledDefaults = defaults.human?.skilledProficiencyIds ?? DND5E_SKILLED_PROFICIENCY_OPTIONS.slice(0, 3).map((option) => option.id);
        bindMultiChoice(`${prefix}.skilled`, "human-skilled", DND5E_SKILLED_PROFICIENCY_OPTIONS.map((option) => option.id), skilledDefaults, 3);
      }
    }
  }

  function bindStickySelect(
    field: string,
    allowed: readonly string[],
    fallback: string,
    prefix: string,
    rerenderOnChange = false,
  ): void {
    const select = root.querySelector<HTMLSelectElement>(`#creator-${field}`);
    if (!select) return;
    const key = `${prefix}.${field}`;
    const stored = localStorage.getItem(key);
    const selected = stored && allowed.includes(stored) ? stored : (allowed.includes(fallback) ? fallback : allowed[0]);
    if (selected) select.value = selected;
    select.addEventListener("change", () => {
      if (allowed.includes(select.value)) localStorage.setItem(key, select.value);
      if (rerenderOnChange) renderCoreControls();
    });
    root.querySelector<HTMLButtonElement>(`#creator-${field}-random`)?.addEventListener("click", () => {
      if (allowed.length === 0) return;
      const selectedId = pickFromAcceptablePool(allowed);
      localStorage.setItem(key, selectedId);
      if (rerenderOnChange) renderCoreControls();
      else select.value = selectedId;
    });
  }

  function bindMultiChoice(
    storageKey: string,
    field: string,
    allowedIds: readonly string[],
    defaultSelectedIds: readonly string[],
    count: number,
  ): void {
    let state = loadStickyMultiChoicePool(localStorage, storageKey, allowedIds, allowedIds, defaultSelectedIds, count);
    const persistAndRender = (next: StickyMultiChoicePoolState<string>): void => {
      state = next;
      saveStickyMultiChoicePool(localStorage, storageKey, state, count);
      renderCoreControls();
    };
    for (const checkbox of root.querySelectorAll<HTMLInputElement>(`[data-multi-pool='${field}']`)) {
      checkbox.checked = state.acceptableIds.includes(checkbox.value);
      checkbox.addEventListener("change", () => {
        const acceptableIds = [...root.querySelectorAll<HTMLInputElement>(`[data-multi-pool='${field}']:checked`)].map((input) => input.value).filter((id) => allowedIds.includes(id));
        if (acceptableIds.length < count) {
          checkbox.checked = true;
          showError(error, new Error(`Keep at least ${count} acceptable options checked.`), "Invalid choice pool.");
          return;
        }
        const selectedIds = state.selectedIds.filter((id) => acceptableIds.includes(id));
        for (const id of acceptableIds) {
          if (selectedIds.length >= count) break;
          if (!selectedIds.includes(id)) selectedIds.push(id);
        }
        persistAndRender({ acceptableIds, selectedIds: selectedIds.slice(0, count) });
      });
    }
    for (let index = 0; index < count; index += 1) {
      const select = root.querySelector<HTMLSelectElement>(`#creator-${field}-${index}`);
      if (!select) continue;
      select.innerHTML = state.acceptableIds.map((id) => `<option value="${escapeAttribute(id)}">${labelFor(id)}</option>`).join("");
      select.value = state.selectedIds[index] ?? state.acceptableIds[index]!;
      select.addEventListener("change", () => {
        const selectedIds = Array.from({ length: count }, (_, slot) => root.querySelector<HTMLSelectElement>(`#creator-${field}-${slot}`)?.value ?? "");
        if (new Set(selectedIds).size !== count) {
          showError(error, new Error("Selected options must be distinct."), "Invalid choices.");
          return;
        }
        persistAndRender({ ...state, selectedIds });
      });
    }
    root.querySelector<HTMLButtonElement>(`#creator-${field}-random`)?.addEventListener("click", () => {
      persistAndRender({ ...state, selectedIds: pickManyFromAcceptablePool(state.acceptableIds, count) });
    });
  }

  methodSelect.addEventListener("change", renderMethodControls);
  refreshBackgroundBoosts(boostSelect, backgroundState.selectedId);
  renderCoreControls();
  renderMethodControls();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearError(error);
    try {
      const core = readCoreChoices(root, classState.selectedId, backgroundState.selectedId, speciesState.selectedId);
      onCharacter(guidedGenerateDnd5eFirstSlice({
        name: root.querySelector<HTMLInputElement>("#creator-name")?.value ?? "",
        classChoice: { selectedId: classState.selectedId, acceptableIds: classState.acceptableIds, selectionMode: classMode },
        backgroundChoice: { selectedId: backgroundState.selectedId, acceptableIds: backgroundState.acceptableIds, selectionMode: backgroundMode },
        speciesChoice: { selectedId: speciesState.selectedId, acceptableIds: speciesState.acceptableIds, selectionMode: speciesMode },
        coreChoices: core.choices,
        coreChoiceProvenance: core.provenance,
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
    select: HTMLSelectElement,
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
    select: HTMLSelectElement,
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
        <p>Official order by default. Leave the name blank to generate one.</p>
      </div>
      <form id="creator-form" class="creator-form">
        <label>Character name<input id="creator-name" type="text" maxlength="80" placeholder="Optional · generated if blank" /></label>
        ${choiceSectionHtml("Class", "class", DND5E_SRD_521_CLASS_OPTIONS, classState)}
        ${choiceSectionHtml("Background", "background", DND5E_SRD_521_BACKGROUND_OPTIONS, backgroundState)}
        ${choiceSectionHtml("Species", "species", DND5E_SRD_521_SPECIES_OPTIONS, speciesState)}
        <label>Background equipment
          <select id="creator-background-equipment"><option value="B:50-gp" selected>50 GP</option><option value="A">Background equipment package</option></select>
        </label>
        <div id="core-choice-controls"></div>
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

function coreControlsHtml(classId: GuidedDnd5eClassId, backgroundId: GuidedDnd5eBackgroundId, speciesId: GuidedDnd5eSpeciesId): string {
  const defaults = defaultGuidedDnd5eCoreChoices(classId, backgroundId, speciesId);
  const rules = classChoiceRules(classId)!;
  const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((option) => option.id === backgroundId)!;
  const classSkills = rules.skillIds.filter((id) => !(background.skillProficiencies as readonly string[]).includes(id));
  const classDetails = [
    multiChoiceHtml("Class skills", "class-skills", classSkills, rules.skillCount),
    selectRow("Starting equipment", "class-equipment", rules.equipmentChoices, defaults.classEquipmentChoice),
    ...(classId === "fighter" ? [selectRow("Fighting Style", "fighting-style", DND5E_FIGHTING_STYLE_OPTIONS, defaults.fightingStyleFeatId ?? "defense", true)] : []),
    ...(rules.weaponMasteryCount ? [multiChoiceHtml("Weapon Mastery", "weapon-mastery", rules.weaponMasteryIds, rules.weaponMasteryCount)] : []),
    ...(classId === "monk" ? [selectRow("Tool or instrument", "monk-tool", DND5E_MONK_TOOL_OPTIONS, defaults.monkToolProficiencyId ?? DND5E_MONK_TOOL_OPTIONS[0]!.id, true)] : []),
    ...(classId === "rogue" ? [
      multiSelectOnlyHtml("Expertise", "expertise", 2, defaults.expertiseSkillIds ?? defaults.classSkillIds.slice(0, 2)),
      selectRow("Thieves' Cant bonus language", "rogue-language", DND5E_BONUS_LANGUAGE_OPTIONS, defaults.rogueBonusLanguageId ?? "giant", true),
    ] : []),
  ].join("");
  const humanDetails = speciesId === "human" ? `
    ${selectRow("Human size", "human-size", [{ id: "small", label: "Small" }, { id: "medium", label: "Medium" }], defaults.human?.size ?? "medium", true)}
    ${selectRow("Skillful", "human-skill", DND5E_SKILL_OPTIONS, defaults.human?.skillId ?? "perception", true)}
    ${selectRow("Versatile Origin feat", "human-feat", DND5E_HUMAN_ORIGIN_FEAT_OPTIONS.filter((option) => option.supported), defaults.human?.originFeatId ?? "alert", true)}
    <div id="creator-human-skilled-host"></div>
  ` : "";
  return `
    <details class="choice-pool-details" open><summary>Class details</summary><div class="method-controls">${classDetails}</div></details>
    <details class="choice-pool-details"><summary>Origin details</summary><div class="method-controls">
      ${selectRow("Alignment", "alignment", DND5E_ALIGNMENT_OPTIONS, defaults.alignmentId, true)}
      ${selectRow("Language 1", "language-1", DND5E_STANDARD_LANGUAGE_OPTIONS, defaults.originLanguageIds[0], true)}
      ${selectRow("Language 2", "language-2", DND5E_STANDARD_LANGUAGE_OPTIONS, defaults.originLanguageIds[1], true)}
      ${humanDetails}
    </div></details>
  `;
}

function readCoreChoices(
  root: HTMLElement,
  classId: GuidedDnd5eClassId,
  backgroundId: GuidedDnd5eBackgroundId,
  speciesId: GuidedDnd5eSpeciesId,
): { choices: GuidedDnd5eCoreChoices; provenance: GenerationDecision[] } {
  const rules = classChoiceRules(classId)!;
  const choices: GuidedDnd5eCoreChoices = {
    alignmentId: readStickySelect(root, "alignment"),
    originLanguageIds: [readStickySelect(root, "language-1"), readStickySelect(root, "language-2")],
    classSkillIds: readMultiSelected(root, "class-skills", rules.skillCount),
    classEquipmentChoice: readStickySelect(root, "class-equipment"),
    weaponMasteryIds: rules.weaponMasteryCount ? readMultiSelected(root, "weapon-mastery", rules.weaponMasteryCount) : [],
  };
  if (classId === "fighter") choices.fightingStyleFeatId = readStickySelect(root, "fighting-style");
  if (classId === "monk") choices.monkToolProficiencyId = readStickySelect(root, "monk-tool");
  if (classId === "rogue") {
    choices.expertiseSkillIds = [readStickySelect(root, "expertise-0"), readStickySelect(root, "expertise-1")];
    choices.rogueBonusLanguageId = readStickySelect(root, "rogue-language");
  }
  if (speciesId === "human") {
    const featId = readStickySelect(root, "human-feat") as "alert" | "savage-attacker" | "skilled";
    choices.human = {
      size: readStickySelect(root, "human-size") as "small" | "medium",
      skillId: readStickySelect(root, "human-skill"),
      originFeatId: featId,
      ...(featId === "skilled" ? { skilledProficiencyIds: readMultiSelected(root, "human-skilled", 3) } : {}),
    };
  }
  const prefix = coreKey(classId, backgroundId, speciesId);
  const skillState = loadStickyMultiChoicePool(localStorage, `${prefix}.skills`, rules.skillIds, rules.skillIds, choices.classSkillIds, rules.skillCount);
  const provenance: GenerationDecision[] = [
    { stepId: "class.skills.acceptable-pool", answer: skillState.acceptableIds },
  ];
  if (rules.weaponMasteryCount) {
    const masteryState = loadStickyMultiChoicePool(localStorage, `${prefix}.mastery`, rules.weaponMasteryIds, rules.weaponMasteryIds, choices.weaponMasteryIds, rules.weaponMasteryCount);
    provenance.push({ stepId: "class.weapon-mastery.acceptable-pool", answer: masteryState.acceptableIds });
  }
  if (speciesId === "human" && choices.human?.originFeatId === "skilled") {
    const skilledState = loadStickyMultiChoicePool(localStorage, `${prefix}.skilled`, DND5E_SKILLED_PROFICIENCY_OPTIONS.map((option) => option.id), DND5E_SKILLED_PROFICIENCY_OPTIONS.map((option) => option.id), choices.human.skilledProficiencyIds ?? [], 3);
    provenance.push({ stepId: "species.human.skilled.acceptable-pool", answer: skilledState.acceptableIds });
  }
  return { choices, provenance };
}

function choiceSectionHtml<TId extends string>(label: string, poolName: string, options: readonly { id: string; label: string; guidedSupported: boolean; blockedReason?: string }[], state: StickyChoicePoolState<TId>): string {
  return `<div class="choice-section"><div class="choice-pick-row"><label>${label}<select id="creator-${poolName}-selected">${selectedOptions(options, state)}</select></label><button id="creator-${poolName}-random" type="button" class="icon-button" title="Randomly choose from checked ${poolName} options" aria-label="Randomly choose from checked ${poolName} options">↻</button></div><details class="choice-pool-details"><summary>Acceptable ${label.toLowerCase()} options</summary><div class="choice-pool-grid">${options.map((option) => `<label class="choice-pool-option${option.guidedSupported ? "" : " unsupported"}" title="${escapeAttribute(option.blockedReason ?? "")}"><input type="checkbox" data-choice-pool="${poolName}" value="${option.id}" ${state.acceptableIds.includes(option.id as TId) ? "checked" : ""} ${option.guidedSupported ? "" : "disabled"} /><span>${option.label}${option.guidedSupported ? "" : " · later"}</span></label>`).join("")}</div></details></div>`;
}

function multiChoiceHtml(label: string, field: string, allowedIds: readonly string[], count: number): string {
  return `<div class="choice-section"><div class="choice-pick-row"><div><strong>${label}</strong><div class="ability-input-grid">${Array.from({ length: count }, (_, index) => `<label>Choice ${index + 1}<select id="creator-${field}-${index}"></select></label>`).join("")}</div></div><button id="creator-${field}-random" type="button" class="icon-button" title="Randomly choose from checked options" aria-label="Randomly choose ${label}">↻</button></div><details class="choice-pool-details"><summary>Acceptable ${label.toLowerCase()}</summary><div class="choice-pool-grid">${allowedIds.map((id) => `<label class="choice-pool-option"><input type="checkbox" data-multi-pool="${field}" value="${escapeAttribute(id)}" checked /><span>${labelFor(id)}</span></label>`).join("")}</div></details></div>`;
}

function multiSelectOnlyHtml(label: string, field: string, count: number, defaults: readonly string[]): string {
  return `<fieldset class="ability-fieldset"><legend>${label}</legend><div class="ability-input-grid">${Array.from({ length: count }, (_, index) => `<label>Choice ${index + 1}<select id="creator-${field}-${index}" data-default="${escapeAttribute(defaults[index] ?? "")}"></select></label>`).join("")}</div></fieldset>`;
}

function selectRow(label: string, field: string, options: readonly { id: string; label: string }[], selected: string, random = false): string {
  return `<div class="choice-pick-row"><label>${label}<select id="creator-${field}">${options.map((option) => `<option value="${escapeAttribute(option.id)}"${option.id === selected ? " selected" : ""}>${option.label}</option>`).join("")}</select></label>${random ? `<button id="creator-${field}-random" type="button" class="icon-button" title="Random choice" aria-label="Random ${label}">↻</button>` : ""}</div>`;
}

function methodControlsHtml(method: string): string {
  if (method === "standard-array") return abilityFieldset("Standard Array assignment", [standardArraySelect("STR", "strength", 15), standardArraySelect("DEX", "dexterity", 14), standardArraySelect("CON", "constitution", 13), standardArraySelect("INT", "intelligence", 12), standardArraySelect("WIS", "wisdom", 10), standardArraySelect("CHA", "charisma", 8)]);
  if (method === "manual") return abilityFieldset("Base ability scores", [abilityInput("creator-manual", "STR", "strength", 15, 3, 18), abilityInput("creator-manual", "DEX", "dexterity", 14, 3, 18), abilityInput("creator-manual", "CON", "constitution", 13, 3, 18), abilityInput("creator-manual", "INT", "intelligence", 12, 3, 18), abilityInput("creator-manual", "WIS", "wisdom", 10, 3, 18), abilityInput("creator-manual", "CHA", "charisma", 8, 3, 18)]);
  if (method === "point-cost") return `${abilityFieldset("Base ability scores", [abilityInput("creator-point", "STR", "strength", 15, 8, 15, "data-point-score"), abilityInput("creator-point", "DEX", "dexterity", 14, 8, 15, "data-point-score"), abilityInput("creator-point", "CON", "constitution", 13, 8, 15, "data-point-score"), abilityInput("creator-point", "INT", "intelligence", 12, 8, 15, "data-point-score"), abilityInput("creator-point", "WIS", "wisdom", 10, 8, 15, "data-point-score"), abilityInput("creator-point", "CHA", "charisma", 8, 8, 15, "data-point-score")])}<div id="creator-point-budget" class="point-budget" aria-live="polite"></div>`;
  return `<label>Seed<input id="creator-random-seed" type="text" maxlength="120" placeholder="Optional; generated if blank" /></label><button id="creator-random-roll" type="button" class="secondary-button">Roll six scores</button><div id="creator-random-roll-results" class="random-roll-grid" aria-live="polite"><span class="muted">Roll scores to begin.</span></div>${abilityFieldset("Assign roll slots", [randomAssignmentSelect("STR", "strength", 0), randomAssignmentSelect("DEX", "dexterity", 1), randomAssignmentSelect("CON", "constitution", 2), randomAssignmentSelect("INT", "intelligence", 3), randomAssignmentSelect("WIS", "wisdom", 4), randomAssignmentSelect("CHA", "charisma", 5)])}`;
}

function readAbilityMethod(root: HTMLElement, method: string, randomRollSet: Dnd5eRandomAbilitySet | null): GuidedAbilityMethodInput {
  if (method === "standard-array") return { method, assignment: readStandardArrayScores(root) };
  if (method === "manual") return { method, scores: readAbilityScores(root, "creator-manual") };
  if (method === "point-cost") return { method, scores: readAbilityScores(root, "creator-point") };
  if (method === "random") {
    if (!randomRollSet) throw new Error("Roll six ability scores before building the character.");
    return { method, seed: randomRollSet.seed, assignment: readRandomAssignment(root) };
  }
  throw new Error("Choose a supported ability-generation method.");
}

function refreshBackgroundBoosts(select: HTMLSelectElement, backgroundId: GuidedDnd5eBackgroundId): void {
  const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((option) => option.id === backgroundId);
  if (background) select.innerHTML = backgroundBoostOptions(background.abilityScoreIds);
}
function backgroundBoostOptions(abilityIds: readonly Dnd5eAbilityId[]): string {
  const [first, second, third] = abilityIds; if (!first || !second || !third) return "";
  const pairs: readonly [Dnd5eAbilityId, Dnd5eAbilityId][] = [[first, second], [first, third], [second, first], [second, third], [third, first], [third, second]];
  return `${pairs.map(([plusTwo, plusOne]) => `<option value="${plusTwo}:2|${plusOne}:1">${abilityLabel(plusTwo)} +2, ${abilityLabel(plusOne)} +1</option>`).join("")}<option value="${first}:1|${second}:1|${third}:1">${abilityLabel(first)} +1, ${abilityLabel(second)} +1, ${abilityLabel(third)} +1</option>`;
}
function parseBoostPlan(value: string): Dnd5eAbilityIncreasePlan {
  const plan: Dnd5eAbilityIncreasePlan = {};
  for (const part of value.split("|")) { const [id, amountText] = part.split(":"); const amount = Number(amountText); if (!id || (amount !== 1 && amount !== 2)) throw new Error("Choose a legal background ability-increase plan."); (plan as Record<string, 1 | 2>)[id] = amount; }
  return plan;
}
function readBackgroundEquipmentChoice(root: HTMLElement): "A" | "B:50-gp" { const value = root.querySelector<HTMLSelectElement>("#creator-background-equipment")?.value; if (value !== "A" && value !== "B:50-gp") throw new Error("Choose a background equipment option."); return value; }
function updatePoolFromCheckboxes<TId extends string>(root: HTMLElement, poolName: string, current: StickyChoicePoolState<TId>, allowedIds: readonly TId[], error: HTMLElement | null): StickyChoicePoolState<TId> {
  const allowed = new Set<string>(allowedIds); const acceptableIds = [...root.querySelectorAll<HTMLInputElement>(`[data-choice-pool='${poolName}']:checked`)].map((input) => input.value).filter((id): id is TId => allowed.has(id));
  if (!acceptableIds.length) { const fallback = root.querySelector<HTMLInputElement>(`[data-choice-pool='${poolName}'][value='${current.selectedId}']`); if (fallback) fallback.checked = true; if (error) error.textContent = `Keep at least one acceptable ${poolName} checked.`; return current; }
  return { acceptableIds, selectedId: acceptableIds.includes(current.selectedId) ? current.selectedId : acceptableIds[0]! };
}
function refreshSelect<TId extends string>(select: HTMLSelectElement, state: StickyChoicePoolState<TId>, options: readonly { id: string; label: string }[]): void { select.innerHTML = selectedOptions(options, state); select.value = state.selectedId; }
function selectedOptions<TId extends string>(options: readonly { id: string; label: string }[], state: StickyChoicePoolState<TId>): string { const labels = new Map(options.map((option) => [option.id, option.label])); return state.acceptableIds.map((id) => `<option value="${id}"${id === state.selectedId ? " selected" : ""}>${labels.get(id) ?? id}</option>`).join(""); }
function readStandardArrayScores(root: HTMLElement): Dnd5eAbilityScores { return { strength: readSelectNumber(root, "creator-standard-strength"), dexterity: readSelectNumber(root, "creator-standard-dexterity"), constitution: readSelectNumber(root, "creator-standard-constitution"), intelligence: readSelectNumber(root, "creator-standard-intelligence"), wisdom: readSelectNumber(root, "creator-standard-wisdom"), charisma: readSelectNumber(root, "creator-standard-charisma") }; }
function readAbilityScores(root: HTMLElement, prefix: string): Dnd5eAbilityScores { return { strength: readInputNumber(root, `${prefix}-strength`), dexterity: readInputNumber(root, `${prefix}-dexterity`), constitution: readInputNumber(root, `${prefix}-constitution`), intelligence: readInputNumber(root, `${prefix}-intelligence`), wisdom: readInputNumber(root, `${prefix}-wisdom`), charisma: readInputNumber(root, `${prefix}-charisma`) }; }
function readRandomAssignment(root: HTMLElement): Dnd5eRandomAbilityAssignment { return { strength: readSelectNumber(root, "creator-random-strength"), dexterity: readSelectNumber(root, "creator-random-dexterity"), constitution: readSelectNumber(root, "creator-random-constitution"), intelligence: readSelectNumber(root, "creator-random-intelligence"), wisdom: readSelectNumber(root, "creator-random-wisdom"), charisma: readSelectNumber(root, "creator-random-charisma") }; }
function readSelectNumber(root: HTMLElement, id: string): number { const value = Number(root.querySelector<HTMLSelectElement>(`#${id}`)?.value); if (!Number.isInteger(value)) throw new Error(`${id} requires a numeric selection.`); return value; }
function readInputNumber(root: HTMLElement, id: string): number { const value = Number(root.querySelector<HTMLInputElement>(`#${id}`)?.value); if (!Number.isInteger(value)) throw new Error(`${id} requires a whole-number score.`); return value; }
function readStickySelect(root: HTMLElement, field: string): string { const value = root.querySelector<HTMLSelectElement>(`#creator-${field}`)?.value; if (!value) throw new Error(`Choose ${field.replaceAll("-", " ")}.`); return value; }
function readMultiSelected(root: HTMLElement, field: string, count: number): string[] { const values = Array.from({ length: count }, (_, index) => root.querySelector<HTMLSelectElement>(`#creator-${field}-${index}`)?.value ?? ""); if (values.some((value) => !value) || new Set(values).size !== count) throw new Error(`${field.replaceAll("-", " ")} choices must be distinct.`); return values; }
function renderRandomRollSet(root: HTMLElement, rollSet: Dnd5eRandomAbilitySet): void { const target = root.querySelector<HTMLElement>("#creator-random-roll-results"); if (target) target.innerHTML = rollSet.results.map((entry) => `<div class="random-roll-card"><span>Roll ${entry.rollIndex + 1}</span><strong>${entry.total}</strong><small>${entry.rolls.join(" · ")} → ${entry.keptValues.join(" + ")}</small></div>`).join(""); }
function populateRandomAssignments(root: HTMLElement, rollSet: Dnd5eRandomAbilitySet): void { (["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const).forEach((id, index) => { const select = root.querySelector<HTMLSelectElement>(`#creator-random-${id}`); if (select) { select.innerHTML = rollSet.results.map((entry) => `<option value="${entry.rollIndex}"${entry.rollIndex === index ? " selected" : ""}>Roll ${entry.rollIndex + 1}: ${entry.total}</option>`).join(""); select.disabled = false; } }); }
function abilityFieldset(legend: string, fields: readonly string[]): string { return `<fieldset class="ability-fieldset"><legend>${legend}</legend><div class="ability-input-grid">${fields.join("")}</div></fieldset>`; }
function standardArraySelect(label: string, abilityId: string, selected: number): string { return `<label>${label}<select id="creator-standard-${abilityId}">${DND5E_STANDARD_ARRAY.map((value) => `<option value="${value}"${value === selected ? " selected" : ""}>${value}</option>`).join("")}</select></label>`; }
function randomAssignmentSelect(label: string, abilityId: string, defaultIndex: number): string { return `<label>${label}<select id="creator-random-${abilityId}" disabled><option value="${defaultIndex}">Roll first</option></select></label>`; }
function abilityInput(prefix: string, label: string, abilityId: string, value: number, min: number, max: number, extraAttribute = ""): string { return `<label>${label}<input id="${prefix}-${abilityId}" type="number" min="${min}" max="${max}" step="1" required value="${value}" ${extraAttribute} /></label>`; }
function abilityLabel(id: Dnd5eAbilityId): string { return ({ strength: "STR", dexterity: "DEX", constitution: "CON", intelligence: "INT", wisdom: "WIS", charisma: "CHA" } as const)[id]; }
function coreKey(classId: GuidedDnd5eClassId, backgroundId: GuidedDnd5eBackgroundId, speciesId: GuidedDnd5eSpeciesId): string { return `${CORE_STORAGE_PREFIX}.${classId}.${backgroundId}.${speciesId}`; }
function labelFor(id: string): string { const weapon = DND5E_WEAPON_OPTIONS.find((option) => option.id === id); const option = [...DND5E_SKILL_OPTIONS, ...DND5E_MONK_TOOL_OPTIONS, ...DND5E_SKILLED_PROFICIENCY_OPTIONS, ...DND5E_STANDARD_LANGUAGE_OPTIONS, ...DND5E_BONUS_LANGUAGE_OPTIONS].find((entry) => entry.id === id); return weapon?.label ?? option?.label ?? id.split(":").at(-1)!.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" "); }
function requiredElement<T extends HTMLElement>(root: HTMLElement, selector: string, ctor: { new(): T }): T { const element = root.querySelector<T>(selector); if (!element || !(element instanceof ctor)) throw new Error(`Character Forge control ${selector} is missing.`); return element; }
function clearError(target: HTMLElement | null): void { if (target) target.textContent = ""; }
function showError(target: HTMLElement | null, error: unknown, fallback: string): void { if (target) target.textContent = error instanceof Error ? error.message : fallback; }
function escapeAttribute(value: string): string { return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
