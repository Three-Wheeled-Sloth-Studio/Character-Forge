import type { CharacterDocument, GenerationDecision } from "../../../packages/character-model/src/index.js";
import {
  calculateDnd5ePointCost, classChoiceRules, clericCantripCount, defaultGuidedDnd5eCoreChoices, druidCantripCount,
  DND5E_ALIGNMENT_OPTIONS, DND5E_BONUS_LANGUAGE_OPTIONS, DND5E_CLERIC_CANTRIP_OPTIONS, DND5E_CLERIC_DIVINE_ORDER_OPTIONS,
  DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS, DND5E_DRAGONBORN_ANCESTRY_OPTIONS, DND5E_DRUID_CANTRIP_OPTIONS,
  DND5E_DRUID_PREPARED_LEVEL_ONE_SPELL_OPTIONS, DND5E_DRUID_PRIMAL_ORDER_OPTIONS, DND5E_FIGHTING_STYLE_OPTIONS,
  DND5E_GOLIATH_ANCESTRY_OPTIONS, DND5E_HUMAN_ORIGIN_FEAT_OPTIONS, DND5E_MONK_TOOL_OPTIONS,
  DND5E_MUSICAL_INSTRUMENT_OPTIONS, DND5E_POINT_COST_BUDGET, DND5E_SKILL_OPTIONS, DND5E_SKILLED_PROFICIENCY_OPTIONS,
  DND5E_SPELLCASTING_ABILITY_OPTIONS, DND5E_SRD_521_BACKGROUND_OPTIONS, DND5E_SRD_521_CLASS_OPTIONS,
  DND5E_SRD_521_SPECIES_OPTIONS, DND5E_STANDARD_ARRAY, DND5E_STANDARD_LANGUAGE_OPTIONS, DND5E_WEAPON_OPTIONS,
  GUIDED_DND5E_BACKGROUND_IDS, GUIDED_DND5E_CLASS_IDS, GUIDED_DND5E_SPECIES_IDS, guidedGenerateDnd5eFirstSlice,
  magicInitiateSpellList, preparedCasterCatalog, resolveDnd5eCharacterName, rollDnd5eRandomAbilitySet,
  type Dnd5eAbilityId, type Dnd5eAbilityIncreasePlan, type Dnd5eAbilityScores, type Dnd5eClericDivineOrderId,
  type Dnd5eDruidPrimalOrderId, type Dnd5eMagicInitiateSpellListId, type Dnd5eRandomAbilityAssignment,
  type Dnd5eRandomAbilitySet, type Dnd5eSpellcastingAbilityId, type GuidedAbilityMethodInput,
  type GuidedChoiceSelectionMode, type GuidedDnd5eBackgroundId, type GuidedDnd5eClassId,
  type GuidedDnd5eCoreChoices, type GuidedDnd5eSpeciesId,
} from "../../../packages/system-dnd5e/src/index.js";
import { loadStickyMultiChoicePool, pickManyFromAcceptablePool, saveStickyMultiChoicePool, type StickyMultiChoicePoolState } from "./stickyMultiChoicePool.js";
import { loadStickyChoicePool, pickFromAcceptablePool, saveStickyChoicePool, type StickyChoicePoolState } from "./stickyChoicePool.js";

const CLASS_STORAGE_KEY = "character-forge.dnd5e.guided.class-pool.v1";
const BACKGROUND_STORAGE_KEY = "character-forge.dnd5e.guided.background-pool.v1";
const SPECIES_STORAGE_KEY = "character-forge.dnd5e.guided.species-pool.v1";
const CORE_STORAGE_PREFIX = "character-forge.dnd5e.guided.core.v3";
type BackgroundCatalogEntry = (typeof DND5E_SRD_521_BACKGROUND_OPTIONS)[number];
type CoreSingleField = { id: string; stepId: string; allowed: (background: BackgroundCatalogEntry) => string[] };

export function mountGuidedCreationPanel(root: HTMLElement, onCharacter: (character: CharacterDocument) => void): void {
  let classState = loadStickyChoicePool(localStorage, CLASS_STORAGE_KEY, GUIDED_DND5E_CLASS_IDS, GUIDED_DND5E_CLASS_IDS, "fighter");
  let backgroundState = loadStickyChoicePool(localStorage, BACKGROUND_STORAGE_KEY, GUIDED_DND5E_BACKGROUND_IDS, GUIDED_DND5E_BACKGROUND_IDS, "soldier");
  let speciesState = loadStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, GUIDED_DND5E_SPECIES_IDS, GUIDED_DND5E_SPECIES_IDS, "human");
  let classMode: GuidedChoiceSelectionMode = "direct";
  let backgroundMode: GuidedChoiceSelectionMode = "direct";
  let speciesMode: GuidedChoiceSelectionMode = "direct";
  let nameMode: GuidedChoiceSelectionMode = "direct";
  let randomRollSet: Dnd5eRandomAbilitySet | null = null;

  root.innerHTML = creatorHtml(classState, backgroundState, speciesState);
  const form = requiredElement(root, "#creator-form", HTMLFormElement);
  const error = root.querySelector<HTMLElement>("#creator-error");
  const classSelect = requiredElement(root, "#creator-class-selected", HTMLSelectElement);
  const backgroundSelect = requiredElement(root, "#creator-background-selected", HTMLSelectElement);
  const speciesSelect = requiredElement(root, "#creator-species-selected", HTMLSelectElement);
  const backgroundEquipmentSelect = requiredElement(root, "#creator-background-equipment", HTMLSelectElement);
  const methodSelect = requiredElement(root, "#creator-generation-method", HTMLSelectElement);
  const methodHost = requiredElement(root, "#generation-method-controls", HTMLElement);
  const coreHost = requiredElement(root, "#core-choice-controls", HTMLElement);
  const boostSelect = requiredElement(root, "#creator-boost-plan", HTMLSelectElement);
  const nameInput = root.querySelector<HTMLInputElement>("#creator-name");

  root.querySelector<HTMLButtonElement>("#creator-name-random")?.addEventListener("click", () => { if (nameInput) { nameInput.value = resolveDnd5eCharacterName(); nameMode = "random"; } });
  nameInput?.addEventListener("input", () => { nameMode = "direct"; });

  const renderCoreControls = (): void => { coreHost.innerHTML = coreControlsHtml(classState.selectedId, backgroundState.selectedId, speciesState.selectedId); bindCoreControls(); };
  const refreshAfterBackground = (): void => { refreshBackgroundBoosts(boostSelect, backgroundState.selectedId); refreshBackgroundEquipment(backgroundEquipmentSelect, backgroundState.selectedId); renderCoreControls(); };

  bindPool("class", classSelect, DND5E_SRD_521_CLASS_OPTIONS, GUIDED_DND5E_CLASS_IDS, () => classState, (next) => { classState = next; classMode = "direct"; saveStickyChoicePool(localStorage, CLASS_STORAGE_KEY, classState); renderCoreControls(); });
  bindPool("background", backgroundSelect, DND5E_SRD_521_BACKGROUND_OPTIONS, GUIDED_DND5E_BACKGROUND_IDS, () => backgroundState, (next) => { backgroundState = next; backgroundMode = "direct"; saveStickyChoicePool(localStorage, BACKGROUND_STORAGE_KEY, backgroundState); refreshAfterBackground(); });
  bindPool("species", speciesSelect, DND5E_SRD_521_SPECIES_OPTIONS, GUIDED_DND5E_SPECIES_IDS, () => speciesState, (next) => { speciesState = next; speciesMode = "direct"; saveStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, speciesState); renderCoreControls(); });

  classSelect.addEventListener("change", () => { classState = { ...classState, selectedId: classSelect.value as GuidedDnd5eClassId }; classMode = "direct"; saveStickyChoicePool(localStorage, CLASS_STORAGE_KEY, classState); renderCoreControls(); });
  backgroundSelect.addEventListener("change", () => { backgroundState = { ...backgroundState, selectedId: backgroundSelect.value as GuidedDnd5eBackgroundId }; backgroundMode = "direct"; saveStickyChoicePool(localStorage, BACKGROUND_STORAGE_KEY, backgroundState); refreshAfterBackground(); });
  speciesSelect.addEventListener("change", () => { speciesState = { ...speciesState, selectedId: speciesSelect.value as GuidedDnd5eSpeciesId }; speciesMode = "direct"; saveStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, speciesState); renderCoreControls(); });

  bindRandomButton("class", classSelect, DND5E_SRD_521_CLASS_OPTIONS, () => classState, (next) => { classState = next; classMode = "random"; saveStickyChoicePool(localStorage, CLASS_STORAGE_KEY, classState); renderCoreControls(); });
  bindRandomButton("background", backgroundSelect, DND5E_SRD_521_BACKGROUND_OPTIONS, () => backgroundState, (next) => { backgroundState = next; backgroundMode = "random"; saveStickyChoicePool(localStorage, BACKGROUND_STORAGE_KEY, backgroundState); refreshAfterBackground(); });
  bindRandomButton("species", speciesSelect, DND5E_SRD_521_SPECIES_OPTIONS, () => speciesState, (next) => { speciesState = next; speciesMode = "random"; saveStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, speciesState); renderCoreControls(); });

  const renderMethodControls = (): void => { randomRollSet = null; methodHost.innerHTML = methodControlsHtml(methodSelect.value); bindMethodControls(methodSelect.value); };
  const bindMethodControls = (method: string): void => {
    if (method === "point-cost") { for (const input of root.querySelectorAll<HTMLInputElement>("[data-point-score]")) input.addEventListener("input", updatePointBudget); updatePointBudget(); }
    if (method === "random") root.querySelector<HTMLButtonElement>("#creator-random-roll")?.addEventListener("click", () => {
      clearError(error);
      try { const seedInput = root.querySelector<HTMLInputElement>("#creator-random-seed"); randomRollSet = rollDnd5eRandomAbilitySet(seedInput?.value ?? ""); if (seedInput) seedInput.value = randomRollSet.seed; renderRandomRollSet(root, randomRollSet); populateRandomAssignments(root, randomRollSet); }
      catch (caught) { randomRollSet = null; showError(error, caught, "Random ability generation failed."); }
    });
  };
  const updatePointBudget = (): void => {
    const budget = root.querySelector<HTMLElement>("#creator-point-budget"); if (!budget) return;
    try { const spent = calculateDnd5ePointCost(readAbilityScores(root, "creator-point")); const remaining = DND5E_POINT_COST_BUDGET - spent; budget.textContent = `${spent} / ${DND5E_POINT_COST_BUDGET} points spent · ${Math.abs(remaining)} ${remaining < 0 ? "over" : "remaining"}`; budget.classList.toggle("over-budget", remaining < 0); }
    catch { budget.textContent = "Enter scores from 8 through 15."; budget.classList.add("over-budget"); }
  };

  function bindCoreControls(): void {
    const prefix = coreKey(classState.selectedId, backgroundState.selectedId, speciesState.selectedId);
    const defaults = defaultGuidedDnd5eCoreChoices(classState.selectedId, backgroundState.selectedId, speciesState.selectedId);
    const rules = classChoiceRules(classState.selectedId)!;
    const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((o) => o.id === backgroundState.selectedId)!;
    const legalClassSkills = rules.skillIds.filter((id) => !(background.skillProficiencies as readonly string[]).includes(id));
    bindMultiChoice(`${prefix}.skills`, "class-skills", legalClassSkills, defaults.classSkillIds, rules.skillCount);
    if (rules.weaponMasteryCount) bindMultiChoice(`${prefix}.mastery`, "weapon-mastery", rules.weaponMasteryIds, defaults.weaponMasteryIds, rules.weaponMasteryCount);
    bindStickySelect("alignment", DND5E_ALIGNMENT_OPTIONS.map((o) => o.id), defaults.alignmentId, prefix);
    bindStickySelect("language-1", DND5E_STANDARD_LANGUAGE_OPTIONS.map((o) => o.id), defaults.originLanguageIds[0], prefix);
    bindStickySelect("language-2", DND5E_STANDARD_LANGUAGE_OPTIONS.map((o) => o.id), defaults.originLanguageIds[1], prefix);
    bindStickySelect("class-equipment", rules.equipmentChoices.map((o) => o.id), defaults.classEquipmentChoice, prefix);

    if (classState.selectedId === "cleric" && defaults.cleric) {
      bindStickySelect("cleric-order", DND5E_CLERIC_DIVINE_ORDER_OPTIONS.map((o) => o.id), defaults.cleric.divineOrderId, prefix, true);
      const order = readStickySelect(root, "cleric-order") as Dnd5eClericDivineOrderId; const count = clericCantripCount(order);
      const preferred = fillDefaults(defaults.cleric.cantripIds, DND5E_CLERIC_CANTRIP_OPTIONS.map((o) => o.id), count);
      const host = root.querySelector<HTMLElement>("#creator-cleric-cantrip-host"); if (host) host.innerHTML = multiChoiceHtml("Cleric cantrips", "cleric-cantrips", DND5E_CLERIC_CANTRIP_OPTIONS.map((o) => o.id), count);
      bindMultiChoice(`${prefix}.cleric-cantrips`, "cleric-cantrips", DND5E_CLERIC_CANTRIP_OPTIONS.map((o) => o.id), preferred, count);
      bindMultiChoice(`${prefix}.cleric-prepared`, "cleric-prepared", DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS.map((o) => o.id), defaults.cleric.preparedSpellIds, 4);
    }
    if (classState.selectedId === "druid" && defaults.druid) {
      bindStickySelect("druid-order", DND5E_DRUID_PRIMAL_ORDER_OPTIONS.map((o) => o.id), defaults.druid.primalOrderId, prefix, true);
      const order = readStickySelect(root, "druid-order") as Dnd5eDruidPrimalOrderId; const count = druidCantripCount(order);
      const preferred = fillDefaults(defaults.druid.cantripIds, DND5E_DRUID_CANTRIP_OPTIONS.map((o) => o.id), count);
      const host = root.querySelector<HTMLElement>("#creator-druid-cantrip-host"); if (host) host.innerHTML = multiChoiceHtml("Druid cantrips", "druid-cantrips", DND5E_DRUID_CANTRIP_OPTIONS.map((o) => o.id), count);
      bindMultiChoice(`${prefix}.druid-cantrips`, "druid-cantrips", DND5E_DRUID_CANTRIP_OPTIONS.map((o) => o.id), preferred, count);
      bindMultiChoice(`${prefix}.druid-prepared`, "druid-prepared", DND5E_DRUID_PREPARED_LEVEL_ONE_SPELL_OPTIONS.map((o) => o.id), defaults.druid.preparedSpellIds, 4);
    }

    const caster = preparedCasterCatalog(classState.selectedId);
    if (caster && defaults.preparedCaster) {
      if (caster.cantripCount) bindMultiChoice(`${prefix}.${caster.classId}-cantrips`, "class-cantrips", caster.cantripOptions.map((o) => o.id), defaults.preparedCaster.cantripIds, caster.cantripCount);
      if (caster.spellbookCount) {
        bindMultiChoice(`${prefix}.wizard-spellbook`, "wizard-spellbook", caster.preparedSpellOptions.map((o) => o.id), defaults.preparedCaster.spellbookSpellIds ?? caster.preparedSpellOptions.slice(0, caster.spellbookCount).map((o) => o.id), caster.spellbookCount);
        const spellbook = readMultiSelected(root, "wizard-spellbook", caster.spellbookCount);
        const preparedHost = root.querySelector<HTMLElement>("#creator-class-prepared-host");
        if (preparedHost) preparedHost.innerHTML = multiChoiceHtml("Prepared Level 1 spells", "class-prepared", spellbook, caster.preparedSpellCount);
        const preferred = fillDefaults(defaults.preparedCaster.preparedSpellIds.filter((id) => spellbook.includes(id)), spellbook, caster.preparedSpellCount);
        bindMultiChoice(`${prefix}.wizard-prepared`, "class-prepared", spellbook, preferred, caster.preparedSpellCount);
      } else {
        bindMultiChoice(`${prefix}.${caster.classId}-prepared`, "class-prepared", caster.preparedSpellOptions.map((o) => o.id), defaults.preparedCaster.preparedSpellIds, caster.preparedSpellCount);
      }
    }
    if (classState.selectedId === "bard") bindMultiChoice(`${prefix}.bard-instruments`, "bard-instruments", DND5E_MUSICAL_INSTRUMENT_OPTIONS.map((o) => o.id), defaults.bardInstrumentIds ?? DND5E_MUSICAL_INSTRUMENT_OPTIONS.slice(0, 3).map((o) => o.id), 3);
    if (classState.selectedId === "fighter") bindStickySelect("fighting-style", DND5E_FIGHTING_STYLE_OPTIONS.map((o) => o.id), defaults.fightingStyleFeatId ?? "defense", prefix);
    if (classState.selectedId === "monk") bindStickySelect("monk-tool", DND5E_MONK_TOOL_OPTIONS.map((o) => o.id), defaults.monkToolProficiencyId ?? DND5E_MONK_TOOL_OPTIONS[0]!.id, prefix);

    if (defaults.magicInitiate) {
      const list = magicInitiateSpellList(defaults.magicInitiate.spellListId);
      bindStickySelect("magic-initiate-ability", DND5E_SPELLCASTING_ABILITY_OPTIONS.map((o) => o.id), defaults.magicInitiate.spellcastingAbilityId, prefix);
      bindMultiChoice(`${prefix}.magic-initiate-cantrips`, "magic-initiate-cantrips", list.cantrips.map((o) => o.id), defaults.magicInitiate.cantripIds, 2);
      bindStickySelect("magic-initiate-level-one", list.levelOneSpells.map((o) => o.id), defaults.magicInitiate.levelOneSpellId, prefix);
    }
    if (speciesState.selectedId === "dragonborn") bindStickySelect("dragonborn-ancestry", DND5E_DRAGONBORN_ANCESTRY_OPTIONS.map((o) => o.id), defaults.dragonbornAncestryId ?? "red", prefix);
    if (speciesState.selectedId === "goliath") bindStickySelect("goliath-ancestry", DND5E_GOLIATH_ANCESTRY_OPTIONS.map((o) => o.id), defaults.goliathAncestryId ?? "stone", prefix);
    if (speciesState.selectedId === "human") {
      bindStickySelect("human-size", ["small", "medium"], defaults.human?.size ?? "medium", prefix);
      const taken = new Set([...readMultiSelected(root, "class-skills", rules.skillCount), ...background.skillProficiencies]);
      const humanSkills = DND5E_SKILL_OPTIONS.map((o) => o.id).filter((id) => !taken.has(id));
      bindStickySelect("human-skill", humanSkills, defaults.human?.skillId ?? humanSkills[0]!, prefix);
      const feats = DND5E_HUMAN_ORIGIN_FEAT_OPTIONS.filter((o) => o.supported && o.id !== background.originFeatId).map((o) => o.id);
      bindStickySelect("human-feat", feats, defaults.human?.originFeatId ?? feats[0]!, prefix, true);
      if (readStickySelect(root, "human-feat") === "skilled") {
        const host = root.querySelector<HTMLElement>("#creator-human-skilled-host"); if (host) host.innerHTML = multiChoiceHtml("Skilled proficiencies", "human-skilled", DND5E_SKILLED_PROFICIENCY_OPTIONS.map((o) => o.id), 3);
        bindMultiChoice(`${prefix}.skilled`, "human-skilled", DND5E_SKILLED_PROFICIENCY_OPTIONS.map((o) => o.id), defaults.human?.skilledProficiencyIds ?? DND5E_SKILLED_PROFICIENCY_OPTIONS.slice(0, 3).map((o) => o.id), 3);
      }
    }
    if (classState.selectedId === "rogue") {
      const selectedSkills = readMultiSelected(root, "class-skills", rules.skillCount); const humanSkill = speciesState.selectedId === "human" ? root.querySelector<HTMLSelectElement>("#creator-human-skill")?.value : undefined;
      const options = [...new Set([...selectedSkills, ...background.skillProficiencies, ...(humanSkill ? [humanSkill] : [])])];
      const host = root.querySelector<HTMLElement>("#creator-expertise-host"); if (host) host.innerHTML = multiChoiceHtml("Expertise", "expertise", options, 2);
      bindMultiChoice(`${prefix}.expertise`, "expertise", options, defaults.expertiseSkillIds ?? options.slice(0, 2), 2);
      bindStickySelect("rogue-language", DND5E_BONUS_LANGUAGE_OPTIONS.map((o) => o.id), defaults.rogueBonusLanguageId ?? "giant", prefix);
    }
  }

  function bindStickySelect(field: string, allowed: readonly string[], fallback: string, prefix: string, rerenderOnChange = false): void {
    const select = root.querySelector<HTMLSelectElement>(`#creator-${field}`); if (!select || !allowed.length) return;
    const key = `${prefix}.${field}`; let state = loadStickyChoicePool(localStorage, key, allowed, allowed, allowed.includes(fallback) ? fallback : allowed[0]!);
    const refresh = (): void => { select.innerHTML = state.acceptableIds.map((id) => `<option value="${escapeAttribute(id)}"${id === state.selectedId ? " selected" : ""}>${labelFor(id)}</option>`).join(""); for (const checkbox of root.querySelectorAll<HTMLInputElement>(`[data-core-pool='${field}']`)) checkbox.checked = state.acceptableIds.includes(checkbox.value); };
    refresh();
    select.addEventListener("change", () => { state = { ...state, selectedId: select.value }; saveStickyChoicePool(localStorage, key, state); if (rerenderOnChange) renderCoreControls(); });
    for (const checkbox of root.querySelectorAll<HTMLInputElement>(`[data-core-pool='${field}']`)) checkbox.addEventListener("change", () => {
      const acceptableIds = [...root.querySelectorAll<HTMLInputElement>(`[data-core-pool='${field}']:checked`)].map((input) => input.value).filter((id) => allowed.includes(id));
      if (!acceptableIds.length) { checkbox.checked = true; showError(error, new Error("Keep at least one acceptable option checked."), "Invalid choice pool."); return; }
      state = { acceptableIds, selectedId: acceptableIds.includes(state.selectedId) ? state.selectedId : acceptableIds[0]! }; saveStickyChoicePool(localStorage, key, state); if (rerenderOnChange) renderCoreControls(); else refresh();
    });
    root.querySelector<HTMLButtonElement>(`#creator-${field}-random`)?.addEventListener("click", () => { state = { ...state, selectedId: pickFromAcceptablePool(state.acceptableIds) }; saveStickyChoicePool(localStorage, key, state); if (rerenderOnChange) renderCoreControls(); else refresh(); });
  }

  function bindMultiChoice(storageKey: string, field: string, allowedIds: readonly string[], defaults: readonly string[], count: number): void {
    let state = loadStickyMultiChoicePool(localStorage, storageKey, allowedIds, allowedIds, fillDefaults(defaults, allowedIds, count), count);
    const persistAndRender = (next: StickyMultiChoicePoolState<string>): void => { state = next; saveStickyMultiChoicePool(localStorage, storageKey, state, count); renderCoreControls(); };
    for (const checkbox of root.querySelectorAll<HTMLInputElement>(`[data-multi-pool='${field}']`)) {
      checkbox.checked = state.acceptableIds.includes(checkbox.value);
      checkbox.addEventListener("change", () => {
        const acceptableIds = [...root.querySelectorAll<HTMLInputElement>(`[data-multi-pool='${field}']:checked`)].map((input) => input.value).filter((id) => allowedIds.includes(id));
        if (acceptableIds.length < count) { checkbox.checked = true; showError(error, new Error(`Keep at least ${count} acceptable options checked.`), "Invalid choice pool."); return; }
        const selectedIds = state.selectedIds.filter((id) => acceptableIds.includes(id)); for (const id of acceptableIds) if (selectedIds.length < count && !selectedIds.includes(id)) selectedIds.push(id);
        persistAndRender({ acceptableIds, selectedIds: selectedIds.slice(0, count) });
      });
    }
    for (let index = 0; index < count; index += 1) {
      const select = root.querySelector<HTMLSelectElement>(`#creator-${field}-${index}`); if (!select) continue;
      select.innerHTML = state.acceptableIds.map((id) => `<option value="${escapeAttribute(id)}">${labelFor(id)}</option>`).join(""); select.value = state.selectedIds[index] ?? state.acceptableIds[index]!;
      select.addEventListener("change", () => { const selectedIds = Array.from({ length: count }, (_, slot) => root.querySelector<HTMLSelectElement>(`#creator-${field}-${slot}`)?.value ?? ""); if (new Set(selectedIds).size !== count) { showError(error, new Error("Selected options must be distinct."), "Invalid choices."); return; } persistAndRender({ ...state, selectedIds }); });
    }
    root.querySelector<HTMLButtonElement>(`#creator-${field}-random`)?.addEventListener("click", () => persistAndRender({ ...state, selectedIds: pickManyFromAcceptablePool(state.acceptableIds, count) }));
  }

  methodSelect.addEventListener("change", renderMethodControls);
  refreshBackgroundBoosts(boostSelect, backgroundState.selectedId); refreshBackgroundEquipment(backgroundEquipmentSelect, backgroundState.selectedId); renderCoreControls(); renderMethodControls();
  form.addEventListener("submit", (event) => {
    event.preventDefault(); clearError(error);
    try { const core = readCoreChoices(root, classState.selectedId, backgroundState.selectedId, speciesState.selectedId); onCharacter(guidedGenerateDnd5eFirstSlice({ name: nameInput?.value ?? "", nameSelectionMode: nameMode, classChoice: { selectedId: classState.selectedId, acceptableIds: classState.acceptableIds, selectionMode: classMode }, backgroundChoice: { selectedId: backgroundState.selectedId, acceptableIds: backgroundState.acceptableIds, selectionMode: backgroundMode }, speciesChoice: { selectedId: speciesState.selectedId, acceptableIds: speciesState.acceptableIds, selectionMode: speciesMode }, coreChoices: core.choices, coreChoiceProvenance: core.provenance, abilityMethod: readAbilityMethod(root, methodSelect.value, randomRollSet), backgroundIncreases: parseBoostPlan(boostSelect.value), backgroundEquipmentChoice: readBackgroundEquipmentChoice(root) })); }
    catch (caught) { showError(error, caught, "Character generation failed."); }
  });

  function bindPool<TId extends string>(poolName: string, select: HTMLSelectElement, options: readonly { id: string; label: string }[], allowedIds: readonly TId[], getState: () => StickyChoicePoolState<TId>, setState: (state: StickyChoicePoolState<TId>) => void): void { for (const checkbox of root.querySelectorAll<HTMLInputElement>(`[data-choice-pool='${poolName}']`)) checkbox.addEventListener("change", () => { const next = updatePoolFromCheckboxes(root, poolName, getState(), allowedIds, error); setState(next); refreshSelect(select, next, options); }); }
  function bindRandomButton<TId extends string>(poolName: string, select: HTMLSelectElement, options: readonly { id: string; label: string }[], getState: () => StickyChoicePoolState<TId>, setState: (state: StickyChoicePoolState<TId>) => void): void { root.querySelector<HTMLButtonElement>(`#creator-${poolName}-random`)?.addEventListener("click", () => { const state = getState(); const next = { ...state, selectedId: pickFromAcceptablePool(state.acceptableIds) }; setState(next); refreshSelect(select, next, options); }); }
}

function creatorHtml(classState: StickyChoicePoolState<GuidedDnd5eClassId>, backgroundState: StickyChoicePoolState<GuidedDnd5eBackgroundId>, speciesState: StickyChoicePoolState<GuidedDnd5eSpeciesId>): string {
  return `<section class="creator-panel compact-creator"><div class="creator-heading"><p class="eyebrow">D&D 5E 2024 · SRD 5.2.1</p><h2>Create character</h2><p>Official order by default. Leave the name blank to generate one.</p></div><form id="creator-form" class="creator-form"><div class="choice-pick-row"><label>Character name<input id="creator-name" type="text" maxlength="80" placeholder="Optional · generated if blank" /></label><button id="creator-name-random" type="button" class="icon-button" title="Generate a random character name" aria-label="Generate a random character name">↻</button></div>${choiceSectionHtml("Class", "class", DND5E_SRD_521_CLASS_OPTIONS, classState)}${choiceSectionHtml("Background", "background", DND5E_SRD_521_BACKGROUND_OPTIONS, backgroundState)}${choiceSectionHtml("Species", "species", DND5E_SRD_521_SPECIES_OPTIONS, speciesState)}<label>Background equipment<select id="creator-background-equipment">${backgroundEquipmentOptions(backgroundState.selectedId)}</select></label><div id="core-choice-controls"></div><div class="section-divider"></div><label>Ability generation<select id="creator-generation-method"><option value="standard-array" selected>Standard Array</option><option value="point-cost">Point Cost</option><option value="random">Random · 4d6 keep highest 3</option><option value="manual">Manual Entry</option></select></label><details class="field-help"><summary>ⓘ About ability-generation methods</summary><p><strong>Standard Array:</strong> assign 15, 14, 13, 12, 10, and 8 once each. <strong>Point Cost:</strong> spend up to 27 points on scores from 8–15. <strong>Random:</strong> roll 4d6, keep the highest 3, six times. <strong>Manual:</strong> enter legal base scores directly.</p></details><div id="generation-method-controls" class="method-controls"></div><label>Background ability increases<select id="creator-boost-plan"></select></label><p id="creator-error" class="form-error" role="alert"></p><button type="submit" class="primary-action">Build character</button></form></section>`;
}

function coreControlsHtml(classId: GuidedDnd5eClassId, backgroundId: GuidedDnd5eBackgroundId, speciesId: GuidedDnd5eSpeciesId): string {
  const defaults = defaultGuidedDnd5eCoreChoices(classId, backgroundId, speciesId); const rules = classChoiceRules(classId)!; const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((o) => o.id === backgroundId)!; const classSkills = rules.skillIds.filter((id) => !(background.skillProficiencies as readonly string[]).includes(id));
  const classDetails: string[] = [multiChoiceHtml("Class skills", "class-skills", classSkills, rules.skillCount), selectPoolRow("Starting equipment", "class-equipment", rules.equipmentChoices, defaults.classEquipmentChoice)];
  if (classId === "cleric" && defaults.cleric) classDetails.push(selectPoolRow("Divine Order", "cleric-order", DND5E_CLERIC_DIVINE_ORDER_OPTIONS, defaults.cleric.divineOrderId), '<div id="creator-cleric-cantrip-host"></div>', multiChoiceHtml("Prepared Level 1 spells", "cleric-prepared", DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS.map((o) => o.id), 4));
  if (classId === "druid" && defaults.druid) classDetails.push(selectPoolRow("Primal Order", "druid-order", DND5E_DRUID_PRIMAL_ORDER_OPTIONS, defaults.druid.primalOrderId), '<div id="creator-druid-cantrip-host"></div>', multiChoiceHtml("Prepared Level 1 spells", "druid-prepared", DND5E_DRUID_PREPARED_LEVEL_ONE_SPELL_OPTIONS.map((o) => o.id), 4), '<p class="muted">Druidic always prepares Speak with Animals separately from these four choices.</p>');
  const caster = preparedCasterCatalog(classId);
  if (caster && defaults.preparedCaster) {
    if (caster.cantripCount) classDetails.push(multiChoiceHtml(`${caster.label} cantrips`, "class-cantrips", caster.cantripOptions.map((o) => o.id), caster.cantripCount));
    if (caster.spellbookCount) classDetails.push(multiChoiceHtml("Level 1 spellbook spells", "wizard-spellbook", caster.preparedSpellOptions.map((o) => o.id), caster.spellbookCount), '<div id="creator-class-prepared-host"></div>');
    else classDetails.push(multiChoiceHtml("Prepared Level 1 spells", "class-prepared", caster.preparedSpellOptions.map((o) => o.id), caster.preparedSpellCount));
    if (classId === "ranger") classDetails.push('<p class="muted">Favored Enemy always prepares Hunter\'s Mark and retains two free casts per Long Rest separately from these choices.</p>');
  }
  if (classId === "bard") classDetails.push(multiChoiceHtml("Instrument proficiencies · first is starting instrument", "bard-instruments", DND5E_MUSICAL_INSTRUMENT_OPTIONS.map((o) => o.id), 3));
  if (classId === "fighter") classDetails.push(selectPoolRow("Fighting Style", "fighting-style", DND5E_FIGHTING_STYLE_OPTIONS, defaults.fightingStyleFeatId ?? "defense"));
  if (rules.weaponMasteryCount) classDetails.push(multiChoiceHtml("Weapon Mastery", "weapon-mastery", rules.weaponMasteryIds, rules.weaponMasteryCount));
  if (classId === "monk") classDetails.push(selectPoolRow("Tool or instrument", "monk-tool", DND5E_MONK_TOOL_OPTIONS, defaults.monkToolProficiencyId ?? DND5E_MONK_TOOL_OPTIONS[0]!.id));
  if (classId === "rogue") classDetails.push('<div id="creator-expertise-host"></div>', selectPoolRow("Thieves' Cant bonus language", "rogue-language", DND5E_BONUS_LANGUAGE_OPTIONS, defaults.rogueBonusLanguageId ?? "giant"));
  const magicDetails = defaults.magicInitiate ? magicInitiateControlsHtml(defaults.magicInitiate.spellListId, defaults) : "";
  const speciesDetails = speciesId === "dragonborn" ? selectPoolRow("Draconic Ancestry", "dragonborn-ancestry", DND5E_DRAGONBORN_ANCESTRY_OPTIONS, defaults.dragonbornAncestryId ?? "red") : speciesId === "goliath" ? selectPoolRow("Giant Ancestry", "goliath-ancestry", DND5E_GOLIATH_ANCESTRY_OPTIONS, defaults.goliathAncestryId ?? "stone") : speciesId === "human" ? `${selectPoolRow("Human size", "human-size", [{ id: "small", label: "Small" }, { id: "medium", label: "Medium" }], defaults.human?.size ?? "medium")}${selectPoolRow("Skillful", "human-skill", DND5E_SKILL_OPTIONS, defaults.human?.skillId ?? "perception")}${selectPoolRow("Versatile Origin feat", "human-feat", DND5E_HUMAN_ORIGIN_FEAT_OPTIONS.filter((o) => o.supported), defaults.human?.originFeatId ?? "alert")}<div id="creator-human-skilled-host"></div>` : "";
  return `<details class="choice-pool-details" open><summary>Class details</summary><div class="method-controls">${classDetails.join("")}</div></details><details class="choice-pool-details" open><summary>Origin details</summary><div class="method-controls">${selectPoolRow("Alignment", "alignment", DND5E_ALIGNMENT_OPTIONS, defaults.alignmentId)}${selectPoolRow("Language 1", "language-1", DND5E_STANDARD_LANGUAGE_OPTIONS, defaults.originLanguageIds[0])}${selectPoolRow("Language 2", "language-2", DND5E_STANDARD_LANGUAGE_OPTIONS, defaults.originLanguageIds[1])}${magicDetails}${speciesDetails}</div></details>`;
}
function magicInitiateControlsHtml(listId: Dnd5eMagicInitiateSpellListId, defaults: GuidedDnd5eCoreChoices): string { const selection = defaults.magicInitiate!; const list = magicInitiateSpellList(listId); return `<div class="choice-section"><strong>Magic Initiate · ${list.label}</strong><p class="muted">Choose the feat's casting ability, two ${list.label} cantrips, and one ${list.label} Level 1 spell.</p>${selectPoolRow("Spellcasting ability", "magic-initiate-ability", DND5E_SPELLCASTING_ABILITY_OPTIONS, selection.spellcastingAbilityId)}${multiChoiceHtml("Cantrips", "magic-initiate-cantrips", list.cantrips.map((o) => o.id), 2)}${selectPoolRow("Level 1 spell", "magic-initiate-level-one", list.levelOneSpells, selection.levelOneSpellId)}</div>`; }

function readCoreChoices(root: HTMLElement, classId: GuidedDnd5eClassId, backgroundId: GuidedDnd5eBackgroundId, speciesId: GuidedDnd5eSpeciesId): { choices: GuidedDnd5eCoreChoices; provenance: GenerationDecision[] } {
  const rules = classChoiceRules(classId)!; const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((o) => o.id === backgroundId)!; const legalClassSkills = rules.skillIds.filter((id) => !(background.skillProficiencies as readonly string[]).includes(id));
  const choices: GuidedDnd5eCoreChoices = { alignmentId: readStickySelect(root, "alignment"), originLanguageIds: [readStickySelect(root, "language-1"), readStickySelect(root, "language-2")], classSkillIds: readMultiSelected(root, "class-skills", rules.skillCount), classEquipmentChoice: readStickySelect(root, "class-equipment"), weaponMasteryIds: rules.weaponMasteryCount ? readMultiSelected(root, "weapon-mastery", rules.weaponMasteryCount) : [] };
  if (classId === "cleric") { const order = readStickySelect(root, "cleric-order") as Dnd5eClericDivineOrderId; choices.cleric = { divineOrderId: order, cantripIds: readMultiSelected(root, "cleric-cantrips", clericCantripCount(order)), preparedSpellIds: readMultiSelected(root, "cleric-prepared", 4) }; }
  if (classId === "druid") { const order = readStickySelect(root, "druid-order") as Dnd5eDruidPrimalOrderId; choices.druid = { primalOrderId: order, cantripIds: readMultiSelected(root, "druid-cantrips", druidCantripCount(order)), preparedSpellIds: readMultiSelected(root, "druid-prepared", 4) }; }
  const caster = preparedCasterCatalog(classId);
  if (caster) choices.preparedCaster = { classId: caster.classId, cantripIds: caster.cantripCount ? readMultiSelected(root, "class-cantrips", caster.cantripCount) : [], preparedSpellIds: readMultiSelected(root, "class-prepared", caster.preparedSpellCount), ...(caster.spellbookCount ? { spellbookSpellIds: readMultiSelected(root, "wizard-spellbook", caster.spellbookCount) } : {}) };
  if (classId === "bard") choices.bardInstrumentIds = readMultiSelected(root, "bard-instruments", 3);
  if (classId === "fighter") choices.fightingStyleFeatId = readStickySelect(root, "fighting-style");
  if (classId === "monk") choices.monkToolProficiencyId = readStickySelect(root, "monk-tool");
  if (classId === "rogue") { choices.expertiseSkillIds = readMultiSelected(root, "expertise", 2); choices.rogueBonusLanguageId = readStickySelect(root, "rogue-language"); }
  const magicListId = magicInitiateListForBackground(backgroundId);
  if (magicListId) { const cantrips = readMultiSelected(root, "magic-initiate-cantrips", 2); choices.magicInitiate = { spellListId: magicListId, spellcastingAbilityId: readStickySelect(root, "magic-initiate-ability") as Dnd5eSpellcastingAbilityId, cantripIds: [cantrips[0]!, cantrips[1]!], levelOneSpellId: readStickySelect(root, "magic-initiate-level-one") }; }
  if (speciesId === "dragonborn") choices.dragonbornAncestryId = readStickySelect(root, "dragonborn-ancestry") as GuidedDnd5eCoreChoices["dragonbornAncestryId"];
  if (speciesId === "goliath") choices.goliathAncestryId = readStickySelect(root, "goliath-ancestry") as GuidedDnd5eCoreChoices["goliathAncestryId"];
  if (speciesId === "human") { const feat = readStickySelect(root, "human-feat") as "alert" | "savage-attacker" | "skilled"; choices.human = { size: readStickySelect(root, "human-size") as "small" | "medium", skillId: readStickySelect(root, "human-skill"), originFeatId: feat, ...(feat === "skilled" ? { skilledProficiencyIds: readMultiSelected(root, "human-skilled", 3) } : {}) }; }

  const prefix = coreKey(classId, backgroundId, speciesId); const provenance: GenerationDecision[] = [];
  const skillState = loadStickyMultiChoicePool(localStorage, `${prefix}.skills`, legalClassSkills, legalClassSkills, choices.classSkillIds, rules.skillCount); provenance.push({ stepId: "class.skills.acceptable-pool", answer: skillState.acceptableIds });
  if (rules.weaponMasteryCount) provenance.push(poolEvidence(`${prefix}.mastery`, "class.weapon-mastery.acceptable-pool", rules.weaponMasteryIds, choices.weaponMasteryIds, rules.weaponMasteryCount));
  if (choices.cleric) { provenance.push(poolEvidence(`${prefix}.cleric-cantrips`, "class.cleric.cantrips.acceptable-pool", DND5E_CLERIC_CANTRIP_OPTIONS.map((o) => o.id), choices.cleric.cantripIds, choices.cleric.cantripIds.length), poolEvidence(`${prefix}.cleric-prepared`, "class.cleric.prepared-spells.acceptable-pool", DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS.map((o) => o.id), choices.cleric.preparedSpellIds, 4)); }
  if (choices.druid) { provenance.push(poolEvidence(`${prefix}.druid-cantrips`, "class.druid.cantrips.acceptable-pool", DND5E_DRUID_CANTRIP_OPTIONS.map((o) => o.id), choices.druid.cantripIds, choices.druid.cantripIds.length), poolEvidence(`${prefix}.druid-prepared`, "class.druid.prepared-spells.acceptable-pool", DND5E_DRUID_PREPARED_LEVEL_ONE_SPELL_OPTIONS.map((o) => o.id), choices.druid.preparedSpellIds, 4)); }
  if (choices.preparedCaster && caster) {
    if (caster.cantripCount) provenance.push(poolEvidence(`${prefix}.${caster.classId}-cantrips`, `class.${caster.classId}.cantrips.acceptable-pool`, caster.cantripOptions.map((o) => o.id), choices.preparedCaster.cantripIds, caster.cantripCount));
    if (caster.spellbookCount) { const spellbook = choices.preparedCaster.spellbookSpellIds ?? []; provenance.push(poolEvidence(`${prefix}.wizard-spellbook`, "class.wizard.spellbook.acceptable-pool", caster.preparedSpellOptions.map((o) => o.id), spellbook, caster.spellbookCount), poolEvidence(`${prefix}.wizard-prepared`, "class.wizard.prepared-spells.acceptable-pool", spellbook, choices.preparedCaster.preparedSpellIds, caster.preparedSpellCount)); }
    else provenance.push(poolEvidence(`${prefix}.${caster.classId}-prepared`, `class.${caster.classId}.prepared-spells.acceptable-pool`, caster.preparedSpellOptions.map((o) => o.id), choices.preparedCaster.preparedSpellIds, caster.preparedSpellCount));
  }
  if (choices.bardInstrumentIds) provenance.push(poolEvidence(`${prefix}.bard-instruments`, "class.bard.instruments.acceptable-pool", DND5E_MUSICAL_INSTRUMENT_OPTIONS.map((o) => o.id), choices.bardInstrumentIds, 3));
  if (choices.magicInitiate) { const list = magicInitiateSpellList(choices.magicInitiate.spellListId); provenance.push(poolEvidence(`${prefix}.magic-initiate-cantrips`, "background.magic-initiate.cantrips.acceptable-pool", list.cantrips.map((o) => o.id), choices.magicInitiate.cantripIds, 2)); }
  if (classId === "rogue") { const options = [...new Set([...choices.classSkillIds, ...background.skillProficiencies, ...(choices.human?.skillId ? [choices.human.skillId] : [])])]; provenance.push(poolEvidence(`${prefix}.expertise`, "class.expertise.acceptable-pool", options, choices.expertiseSkillIds ?? [], 2)); }
  if (speciesId === "human" && choices.human?.originFeatId === "skilled") provenance.push(poolEvidence(`${prefix}.skilled`, "species.human.skilled.acceptable-pool", DND5E_SKILLED_PROFICIENCY_OPTIONS.map((o) => o.id), choices.human.skilledProficiencyIds ?? [], 3));
  for (const field of coreSingleFields(classId, backgroundId, speciesId)) { const options = field.allowed(background); const selected = coreSingleValue(field.id, choices); const state = loadStickyChoicePool(localStorage, `${prefix}.${field.id}`, options, options, options.includes(selected) ? selected : options[0]!); provenance.push({ stepId: `${field.stepId}.acceptable-pool`, answer: state.acceptableIds }); }
  return { choices, provenance };
}
function poolEvidence(key: string, stepId: string, allowed: readonly string[], selected: readonly string[], count: number): GenerationDecision { const state = loadStickyMultiChoicePool(localStorage, key, allowed, allowed, selected, count); return { stepId, answer: state.acceptableIds }; }
function coreSingleFields(classId: GuidedDnd5eClassId, backgroundId: GuidedDnd5eBackgroundId, speciesId: GuidedDnd5eSpeciesId): CoreSingleField[] {
  const rules = classChoiceRules(classId)!; const fields: CoreSingleField[] = [
    { id: "alignment", stepId: "alignment", allowed: () => DND5E_ALIGNMENT_OPTIONS.map((o) => o.id) }, { id: "language-1", stepId: "origin.language-1", allowed: () => DND5E_STANDARD_LANGUAGE_OPTIONS.map((o) => o.id) }, { id: "language-2", stepId: "origin.language-2", allowed: () => DND5E_STANDARD_LANGUAGE_OPTIONS.map((o) => o.id) }, { id: "class-equipment", stepId: "class.equipment", allowed: () => rules.equipmentChoices.map((o) => o.id) },
  ];
  if (classId === "cleric") fields.push({ id: "cleric-order", stepId: "class.cleric.divine-order", allowed: () => DND5E_CLERIC_DIVINE_ORDER_OPTIONS.map((o) => o.id) });
  if (classId === "druid") fields.push({ id: "druid-order", stepId: "class.druid.primal-order", allowed: () => DND5E_DRUID_PRIMAL_ORDER_OPTIONS.map((o) => o.id) });
  if (classId === "fighter") fields.push({ id: "fighting-style", stepId: "class.fighting-style", allowed: () => DND5E_FIGHTING_STYLE_OPTIONS.map((o) => o.id) });
  if (classId === "monk") fields.push({ id: "monk-tool", stepId: "class.tool", allowed: () => DND5E_MONK_TOOL_OPTIONS.map((o) => o.id) });
  if (classId === "rogue") fields.push({ id: "rogue-language", stepId: "class.bonus-language", allowed: () => DND5E_BONUS_LANGUAGE_OPTIONS.map((o) => o.id) });
  const magic = magicInitiateListForBackground(backgroundId); if (magic) { const list = magicInitiateSpellList(magic); fields.push({ id: "magic-initiate-ability", stepId: "background.magic-initiate.spellcasting-ability", allowed: () => DND5E_SPELLCASTING_ABILITY_OPTIONS.map((o) => o.id) }, { id: "magic-initiate-level-one", stepId: "background.magic-initiate.level-one-spell", allowed: () => list.levelOneSpells.map((o) => o.id) }); }
  if (speciesId === "dragonborn") fields.push({ id: "dragonborn-ancestry", stepId: "species.dragonborn.ancestry", allowed: () => DND5E_DRAGONBORN_ANCESTRY_OPTIONS.map((o) => o.id) });
  if (speciesId === "goliath") fields.push({ id: "goliath-ancestry", stepId: "species.goliath.ancestry", allowed: () => DND5E_GOLIATH_ANCESTRY_OPTIONS.map((o) => o.id) });
  if (speciesId === "human") fields.push({ id: "human-size", stepId: "species.human.size", allowed: () => ["small", "medium"] }, { id: "human-skill", stepId: "species.human.skillful", allowed: (bg) => DND5E_SKILL_OPTIONS.map((o) => o.id).filter((id) => !(bg.skillProficiencies as readonly string[]).includes(id)) }, { id: "human-feat", stepId: "species.human.versatile", allowed: (bg) => DND5E_HUMAN_ORIGIN_FEAT_OPTIONS.filter((o) => o.supported && o.id !== bg.originFeatId).map((o) => o.id) });
  return fields;
}
function coreSingleValue(field: string, choices: GuidedDnd5eCoreChoices): string { if (field === "alignment") return choices.alignmentId; if (field === "language-1") return choices.originLanguageIds[0]; if (field === "language-2") return choices.originLanguageIds[1]; if (field === "class-equipment") return choices.classEquipmentChoice; if (field === "cleric-order") return choices.cleric?.divineOrderId ?? ""; if (field === "druid-order") return choices.druid?.primalOrderId ?? ""; if (field === "fighting-style") return choices.fightingStyleFeatId ?? ""; if (field === "monk-tool") return choices.monkToolProficiencyId ?? ""; if (field === "rogue-language") return choices.rogueBonusLanguageId ?? ""; if (field === "magic-initiate-ability") return choices.magicInitiate?.spellcastingAbilityId ?? ""; if (field === "magic-initiate-level-one") return choices.magicInitiate?.levelOneSpellId ?? ""; if (field === "dragonborn-ancestry") return choices.dragonbornAncestryId ?? ""; if (field === "goliath-ancestry") return choices.goliathAncestryId ?? ""; if (field === "human-size") return choices.human?.size ?? ""; if (field === "human-skill") return choices.human?.skillId ?? ""; if (field === "human-feat") return choices.human?.originFeatId ?? ""; return ""; }

function magicInitiateListForBackground(backgroundId: GuidedDnd5eBackgroundId): Dnd5eMagicInitiateSpellListId | undefined { return backgroundId === "acolyte" ? "cleric" : backgroundId === "sage" ? "wizard" : undefined; }
function choiceSectionHtml<TId extends string>(label: string, poolName: string, options: readonly { id: string; label: string; guidedSupported: boolean; blockedReason?: string }[], state: StickyChoicePoolState<TId>): string { return `<div class="choice-section"><div class="choice-pick-row"><label>${label}<select id="creator-${poolName}-selected">${selectedOptions(options, state)}</select></label><button id="creator-${poolName}-random" type="button" class="icon-button" title="Randomly choose from checked ${poolName} options" aria-label="Randomly choose from checked ${poolName} options">↻</button></div><details class="choice-pool-details"><summary>Acceptable ${label.toLowerCase()} options</summary><div class="choice-pool-grid">${options.map((o) => `<label class="choice-pool-option${o.guidedSupported ? "" : " unsupported"}" title="${escapeAttribute(o.blockedReason ?? "")}"><input type="checkbox" data-choice-pool="${poolName}" value="${o.id}" ${state.acceptableIds.includes(o.id as TId) ? "checked" : ""} ${o.guidedSupported ? "" : "disabled"} /><span>${o.label}${o.guidedSupported ? "" : " · later"}</span></label>`).join("")}</div></details></div>`; }
function multiChoiceHtml(label: string, field: string, allowedIds: readonly string[], count: number): string { return `<div class="choice-section"><div class="choice-pick-row"><div><strong>${label}</strong><div class="ability-input-grid">${Array.from({ length: count }, (_, i) => `<label>Choice ${i + 1}<select id="creator-${field}-${i}"></select></label>`).join("")}</div></div><button id="creator-${field}-random" type="button" class="icon-button" title="Randomly choose from checked options" aria-label="Randomly choose ${label}">↻</button></div><details class="choice-pool-details"><summary>Acceptable ${label.toLowerCase()}</summary><div class="choice-pool-grid">${allowedIds.map((id) => `<label class="choice-pool-option"><input type="checkbox" data-multi-pool="${field}" value="${escapeAttribute(id)}" checked /><span>${labelFor(id)}</span></label>`).join("")}</div></details></div>`; }
function selectPoolRow(label: string, field: string, options: readonly { id: string; label: string }[], selected: string): string { return `<div class="choice-section"><div class="choice-pick-row"><label>${label}<select id="creator-${field}">${options.map((o) => `<option value="${escapeAttribute(o.id)}"${o.id === selected ? " selected" : ""}>${o.label}</option>`).join("")}</select></label><button id="creator-${field}-random" type="button" class="icon-button" title="Random from checked" aria-label="Random ${label}">↻</button></div><details class="choice-pool-details"><summary>Acceptable ${label.toLowerCase()} options</summary><div class="choice-pool-grid">${options.map((o) => `<label class="choice-pool-option"><input type="checkbox" data-core-pool="${field}" value="${escapeAttribute(o.id)}" checked /><span>${o.label}</span></label>`).join("")}</div></details></div>`; }
function methodControlsHtml(method: string): string { if (method === "standard-array") return abilityFieldset("Standard Array assignment", [standardArraySelect("STR", "strength", 15), standardArraySelect("DEX", "dexterity", 14), standardArraySelect("CON", "constitution", 13), standardArraySelect("INT", "intelligence", 12), standardArraySelect("WIS", "wisdom", 10), standardArraySelect("CHA", "charisma", 8)]); if (method === "manual") return abilityFieldset("Base ability scores", [abilityInput("creator-manual", "STR", "strength", 15, 3, 18), abilityInput("creator-manual", "DEX", "dexterity", 14, 3, 18), abilityInput("creator-manual", "CON", "constitution", 13, 3, 18), abilityInput("creator-manual", "INT", "intelligence", 12, 3, 18), abilityInput("creator-manual", "WIS", "wisdom", 10, 3, 18), abilityInput("creator-manual", "CHA", "charisma", 8, 3, 18)]); if (method === "point-cost") return `${abilityFieldset("Base ability scores", [abilityInput("creator-point", "STR", "strength", 15, 8, 15, "data-point-score"), abilityInput("creator-point", "DEX", "dexterity", 14, 8, 15, "data-point-score"), abilityInput("creator-point", "CON", "constitution", 13, 8, 15, "data-point-score"), abilityInput("creator-point", "INT", "intelligence", 12, 8, 15, "data-point-score"), abilityInput("creator-point", "WIS", "wisdom", 10, 8, 15, "data-point-score"), abilityInput("creator-point", "CHA", "charisma", 8, 8, 15, "data-point-score")])}<div id="creator-point-budget" class="point-budget" aria-live="polite"></div>`; return `<label>Seed<input id="creator-random-seed" type="text" maxlength="120" placeholder="Optional; generated if blank" /></label><button id="creator-random-roll" type="button" class="secondary-button">Roll six scores</button><div id="creator-random-roll-results" class="random-roll-grid" aria-live="polite"><span class="muted">Roll scores to begin.</span></div>${abilityFieldset("Assign roll slots", [randomAssignmentSelect("STR", "strength", 0), randomAssignmentSelect("DEX", "dexterity", 1), randomAssignmentSelect("CON", "constitution", 2), randomAssignmentSelect("INT", "intelligence", 3), randomAssignmentSelect("WIS", "wisdom", 4), randomAssignmentSelect("CHA", "charisma", 5)])}`; }
function readAbilityMethod(root: HTMLElement, method: string, rolls: Dnd5eRandomAbilitySet | null): GuidedAbilityMethodInput { if (method === "standard-array") return { method, assignment: readStandardArrayScores(root) }; if (method === "manual") return { method, scores: readAbilityScores(root, "creator-manual") }; if (method === "point-cost") return { method, scores: readAbilityScores(root, "creator-point") }; if (method === "random") { if (!rolls) throw new Error("Roll six ability scores before building the character."); return { method, seed: rolls.seed, assignment: readRandomAssignment(root) }; } throw new Error("Choose a supported ability-generation method."); }
function refreshBackgroundBoosts(select: HTMLSelectElement, backgroundId: GuidedDnd5eBackgroundId): void { const bg = DND5E_SRD_521_BACKGROUND_OPTIONS.find((o) => o.id === backgroundId); if (bg) select.innerHTML = backgroundBoostOptions(bg.abilityScoreIds); }
function refreshBackgroundEquipment(select: HTMLSelectElement, backgroundId: GuidedDnd5eBackgroundId): void { select.innerHTML = backgroundEquipmentOptions(backgroundId); }
function backgroundEquipmentOptions(backgroundId: GuidedDnd5eBackgroundId): string { const labels: Record<GuidedDnd5eBackgroundId, string> = { acolyte: "Calligrapher's Supplies, Prayer Book, Holy Symbol, 10 Parchment, Robe + 8 GP", criminal: "2 Daggers, Thieves' Tools, Crowbar, 2 Pouches, Traveler's Clothes + 16 GP", sage: "Quarterstaff, Calligrapher's Supplies, History Book, 8 Parchment, Robe + 8 GP", soldier: "Spear, Shortbow, 20 Arrows, Dice Set, Healer's Kit, Quiver, Traveler's Clothes + 14 GP" }; return `<option value="B:50-gp" selected>50 GP</option><option value="A">${labels[backgroundId]}</option>`; }
function backgroundBoostOptions(ids: readonly Dnd5eAbilityId[]): string { const [a, b, c] = ids; if (!a || !b || !c) return ""; const pairs: readonly [Dnd5eAbilityId, Dnd5eAbilityId][] = [[a,b],[a,c],[b,a],[b,c],[c,a],[c,b]]; return `${pairs.map(([two,one]) => `<option value="${two}:2|${one}:1">${abilityLabel(two)} +2, ${abilityLabel(one)} +1</option>`).join("")}<option value="${a}:1|${b}:1|${c}:1">${abilityLabel(a)} +1, ${abilityLabel(b)} +1, ${abilityLabel(c)} +1</option>`; }
function parseBoostPlan(value: string): Dnd5eAbilityIncreasePlan { const plan: Dnd5eAbilityIncreasePlan = {}; for (const part of value.split("|")) { const [id,text] = part.split(":"); const amount = Number(text); if (!id || (amount !== 1 && amount !== 2)) throw new Error("Choose a legal background ability-increase plan."); (plan as Record<string,1|2>)[id] = amount; } return plan; }
function readBackgroundEquipmentChoice(root: HTMLElement): "A" | "B:50-gp" { const value = root.querySelector<HTMLSelectElement>("#creator-background-equipment")?.value; if (value !== "A" && value !== "B:50-gp") throw new Error("Choose a background equipment option."); return value; }
function updatePoolFromCheckboxes<TId extends string>(root: HTMLElement, pool: string, current: StickyChoicePoolState<TId>, allowedIds: readonly TId[], error: HTMLElement | null): StickyChoicePoolState<TId> { const allowed = new Set<string>(allowedIds); const acceptableIds = [...root.querySelectorAll<HTMLInputElement>(`[data-choice-pool='${pool}']:checked`)].map((i) => i.value).filter((id): id is TId => allowed.has(id)); if (!acceptableIds.length) { const fallback = root.querySelector<HTMLInputElement>(`[data-choice-pool='${pool}'][value='${current.selectedId}']`); if (fallback) fallback.checked = true; if (error) error.textContent = `Keep at least one acceptable ${pool} checked.`; return current; } return { acceptableIds, selectedId: acceptableIds.includes(current.selectedId) ? current.selectedId : acceptableIds[0]! }; }
function refreshSelect<TId extends string>(select: HTMLSelectElement, state: StickyChoicePoolState<TId>, options: readonly { id: string; label: string }[]): void { select.innerHTML = selectedOptions(options,state); select.value = state.selectedId; }
function selectedOptions<TId extends string>(options: readonly { id:string; label:string }[], state: StickyChoicePoolState<TId>): string { const labels = new Map(options.map((o) => [o.id,o.label])); return state.acceptableIds.map((id) => `<option value="${id}"${id === state.selectedId ? " selected" : ""}>${labels.get(id) ?? id}</option>`).join(""); }
function readStandardArrayScores(root: HTMLElement): Dnd5eAbilityScores { return { strength: readSelectNumber(root,"creator-standard-strength"), dexterity: readSelectNumber(root,"creator-standard-dexterity"), constitution: readSelectNumber(root,"creator-standard-constitution"), intelligence: readSelectNumber(root,"creator-standard-intelligence"), wisdom: readSelectNumber(root,"creator-standard-wisdom"), charisma: readSelectNumber(root,"creator-standard-charisma") }; }
function readAbilityScores(root: HTMLElement,prefix:string): Dnd5eAbilityScores { return { strength:readInputNumber(root,`${prefix}-strength`), dexterity:readInputNumber(root,`${prefix}-dexterity`), constitution:readInputNumber(root,`${prefix}-constitution`), intelligence:readInputNumber(root,`${prefix}-intelligence`), wisdom:readInputNumber(root,`${prefix}-wisdom`), charisma:readInputNumber(root,`${prefix}-charisma`) }; }
function readRandomAssignment(root: HTMLElement): Dnd5eRandomAbilityAssignment { return { strength:readSelectNumber(root,"creator-random-strength"), dexterity:readSelectNumber(root,"creator-random-dexterity"), constitution:readSelectNumber(root,"creator-random-constitution"), intelligence:readSelectNumber(root,"creator-random-intelligence"), wisdom:readSelectNumber(root,"creator-random-wisdom"), charisma:readSelectNumber(root,"creator-random-charisma") }; }
function readSelectNumber(root: HTMLElement,id:string): number { const v = Number(root.querySelector<HTMLSelectElement>(`#${id}`)?.value); if (!Number.isInteger(v)) throw new Error(`${id} requires a numeric selection.`); return v; }
function readInputNumber(root: HTMLElement,id:string): number { const v = Number(root.querySelector<HTMLInputElement>(`#${id}`)?.value); if (!Number.isInteger(v)) throw new Error(`${id} requires a whole-number score.`); return v; }
function readStickySelect(root: HTMLElement,field:string): string { const v = root.querySelector<HTMLSelectElement>(`#creator-${field}`)?.value; if (!v) throw new Error(`Choose ${field.replaceAll("-"," ")}.`); return v; }
function readMultiSelected(root: HTMLElement,field:string,count:number): string[] { const values = Array.from({length:count},(_,i) => root.querySelector<HTMLSelectElement>(`#creator-${field}-${i}`)?.value ?? ""); if (values.some((v) => !v) || new Set(values).size !== count) throw new Error(`${field.replaceAll("-"," ")} choices must be distinct.`); return values; }
function renderRandomRollSet(root: HTMLElement,set:Dnd5eRandomAbilitySet): void { const target = root.querySelector<HTMLElement>("#creator-random-roll-results"); if (target) target.innerHTML = set.results.map((e) => `<div class="random-roll-card"><span>Roll ${e.rollIndex+1}</span><strong>${e.total}</strong><small>${e.rolls.join(" · ")} → ${e.keptValues.join(" + ")}</small></div>`).join(""); }
function populateRandomAssignments(root: HTMLElement,set:Dnd5eRandomAbilitySet): void { (["strength","dexterity","constitution","intelligence","wisdom","charisma"] as const).forEach((id,i) => { const select = root.querySelector<HTMLSelectElement>(`#creator-random-${id}`); if (select) { select.innerHTML = set.results.map((e) => `<option value="${e.rollIndex}"${e.rollIndex===i?" selected":""}>Roll ${e.rollIndex+1}: ${e.total}</option>`).join(""); select.disabled=false; } }); }
function abilityFieldset(legend:string,fields:readonly string[]): string { return `<fieldset class="ability-fieldset"><legend>${legend}</legend><div class="ability-input-grid">${fields.join("")}</div></fieldset>`; }
function standardArraySelect(label:string,id:string,selected:number): string { return `<label>${label}<select id="creator-standard-${id}">${DND5E_STANDARD_ARRAY.map((v) => `<option value="${v}"${v===selected?" selected":""}>${v}</option>`).join("")}</select></label>`; }
function randomAssignmentSelect(label:string,id:string,index:number): string { return `<label>${label}<select id="creator-random-${id}" disabled><option value="${index}">Roll first</option></select></label>`; }
function abilityInput(prefix:string,label:string,id:string,value:number,min:number,max:number,extra=""): string { return `<label>${label}<input id="${prefix}-${id}" type="number" min="${min}" max="${max}" step="1" required value="${value}" ${extra} /></label>`; }
function abilityLabel(id:Dnd5eAbilityId): string { return ({strength:"STR",dexterity:"DEX",constitution:"CON",intelligence:"INT",wisdom:"WIS",charisma:"CHA"} as const)[id]; }
function coreKey(classId:GuidedDnd5eClassId,backgroundId:GuidedDnd5eBackgroundId,speciesId:GuidedDnd5eSpeciesId): string { return `${CORE_STORAGE_PREFIX}.${classId}.${backgroundId}.${speciesId}`; }
function labelFor(id:string): string { const weapon = DND5E_WEAPON_OPTIONS.find((o) => o.id === id); const option = [...DND5E_SKILL_OPTIONS,...DND5E_MONK_TOOL_OPTIONS,...DND5E_SKILLED_PROFICIENCY_OPTIONS,...DND5E_STANDARD_LANGUAGE_OPTIONS,...DND5E_BONUS_LANGUAGE_OPTIONS,...DND5E_ALIGNMENT_OPTIONS,...DND5E_FIGHTING_STYLE_OPTIONS,...DND5E_CLERIC_DIVINE_ORDER_OPTIONS,...DND5E_CLERIC_CANTRIP_OPTIONS,...DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS,...DND5E_DRUID_PRIMAL_ORDER_OPTIONS,...DND5E_DRUID_CANTRIP_OPTIONS,...DND5E_DRUID_PREPARED_LEVEL_ONE_SPELL_OPTIONS,...DND5E_DRAGONBORN_ANCESTRY_OPTIONS,...DND5E_GOLIATH_ANCESTRY_OPTIONS].find((o) => o.id === id); return weapon?.label ?? option?.label ?? id.split(":").at(-1)!.split("-").map((p) => p ? p[0]!.toUpperCase()+p.slice(1) : p).join(" "); }
function requiredElement<T extends HTMLElement>(root:HTMLElement,selector:string,ctor:{new():T}): T { const el=root.querySelector<T>(selector); if (!el || !(el instanceof ctor)) throw new Error(`Character Forge control ${selector} is missing.`); return el; }
function clearError(target:HTMLElement|null):void { if(target) target.textContent=""; }
function showError(target:HTMLElement|null,error:unknown,fallback:string):void { if(target) target.textContent=error instanceof Error?error.message:fallback; }
function escapeAttribute(value:string):string { return value.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
function fillDefaults(preferred: readonly string[], allowed: readonly string[], count: number): string[] { const selected = preferred.filter((id) => allowed.includes(id)); for (const id of allowed) if (selected.length < count && !selected.includes(id)) selected.push(id); return selected.slice(0, count); }
