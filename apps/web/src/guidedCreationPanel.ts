import type { CharacterDocument, GenerationDecision } from "../../../packages/character-model/src/index.js";
import {
  classChoiceRules, clericCantripCount, currentGuidedDnd5eSpeciesSpellIds, defaultGuidedDnd5eCoreChoices, druidCantripCount,
  DND5E_ALIGNMENT_OPTIONS, DND5E_BONUS_LANGUAGE_OPTIONS, DND5E_CLERIC_CANTRIP_OPTIONS, DND5E_CLERIC_DIVINE_ORDER_OPTIONS,
  DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS, DND5E_DRAGONBORN_ANCESTRY_OPTIONS, DND5E_DRUID_CANTRIP_OPTIONS,
  DND5E_DRUID_PREPARED_LEVEL_ONE_SPELL_OPTIONS, DND5E_DRUID_PRIMAL_ORDER_OPTIONS, DND5E_ELF_KEEN_SENSES_SKILL_OPTIONS,
  DND5E_ELF_LINEAGE_OPTIONS, DND5E_FIGHTING_STYLE_OPTIONS, DND5E_GNOME_LINEAGE_OPTIONS, DND5E_GOLIATH_ANCESTRY_OPTIONS,
  DND5E_HUMAN_ORIGIN_FEAT_OPTIONS, DND5E_LEVEL_ONE_ELDRITCH_INVOCATION_OPTIONS, DND5E_MONK_TOOL_OPTIONS,
  DND5E_MUSICAL_INSTRUMENT_OPTIONS, DND5E_PACT_TOME_CANTRIP_OPTIONS, DND5E_PACT_TOME_LEVEL_ONE_RITUAL_OPTIONS,
  DND5E_SKILL_OPTIONS, DND5E_SKILLED_PROFICIENCY_OPTIONS, DND5E_SPELLCASTING_ABILITY_OPTIONS,
  DND5E_SRD_521_BACKGROUND_OPTIONS, DND5E_SRD_521_CLASS_OPTIONS, DND5E_SRD_521_SPECIES_OPTIONS,
  DND5E_STANDARD_LANGUAGE_OPTIONS, DND5E_TIEFLING_LEGACY_OPTIONS, DND5E_WEAPON_OPTIONS, GUIDED_DND5E_BACKGROUND_IDS,
  GUIDED_DND5E_CLASS_IDS, GUIDED_DND5E_SPECIES_IDS, elfLineage, gnomeLineage, guidedGenerateDnd5eFirstSlice,
  magicInitiateSpellList, pactTomeCantripOptionsExcluding, pactTomeRitualSpellOptionsExcluding, preparedCasterCatalog,
  resolveDnd5eCharacterName, tieflingLegacy,
  type Dnd5eAbilityId, type Dnd5eAbilityIncreasePlan, type Dnd5eClericDivineOrderId,
  type Dnd5eDruidPrimalOrderId, type Dnd5eElfLineageId, type Dnd5eGnomeLineageId, type Dnd5eLevelOneEldritchInvocationId,
  type Dnd5eMagicInitiateSpellListId, type Dnd5eSpellcastingAbilityId, type Dnd5eTieflingLegacyId,
  type GuidedChoiceSelectionMode, type GuidedDnd5eBackgroundId, type GuidedDnd5eClassId, type GuidedDnd5eCoreChoices,
  type GuidedDnd5eSpeciesId,
} from "../../../packages/system-dnd5e/src/index.js";
import { mountGuidedAbilityControls } from "./guidedAbilityControls.js";
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
  const abilityControls = mountGuidedAbilityControls(root, methodSelect, methodHost, error);

  root.querySelector<HTMLButtonElement>("#creator-name-random")?.addEventListener("click", () => { if (nameInput) { nameInput.value = resolveDnd5eCharacterName(); nameMode = "random"; } });
  nameInput?.addEventListener("input", () => { nameMode = "direct"; });

  const renderCoreControls = (): void => { coreHost.innerHTML = coreControlsHtml(classState.selectedId, backgroundState.selectedId, speciesState.selectedId); bindCoreControls(); };
  const refreshAfterBackground = (): void => { refreshBackgroundBoosts(boostSelect, backgroundState.selectedId); refreshBackgroundEquipment(backgroundEquipmentSelect, backgroundState.selectedId); renderCoreControls(); };

  bindPool("class", classSelect, DND5E_SRD_521_CLASS_OPTIONS, GUIDED_DND5E_CLASS_IDS, () => classState, (next) => { classState = next; classMode = "direct"; saveStickyChoicePool(localStorage, CLASS_STORAGE_KEY, classState); renderCoreControls(); });
  bindPool("background", backgroundSelect, DND5E_SRD_521_BACKGROUND_OPTIONS, GUIDED_DND5E_BACKGROUND_IDS, () => backgroundState, (next) => { backgroundState = next; backgroundMode = "direct"; saveStickyChoicePool(localStorage, BACKGROUND_STORAGE_KEY, backgroundState); refreshAfterBackground(); });
  bindPool("species", speciesSelect, DND5E_SRD_521_SPECIES_OPTIONS, GUIDED_DND5E_SPECIES_IDS, () => speciesState, (next) => { speciesState = next; speciesMode = "direct"; saveStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, speciesState); renderCoreControls(); });

  classSelect.addEventListener("change", () => { classState = includeDirectChoice(classState, classSelect.value as GuidedDnd5eClassId); classMode = "direct"; saveStickyChoicePool(localStorage, CLASS_STORAGE_KEY, classState); renderCoreControls(); });
  backgroundSelect.addEventListener("change", () => { backgroundState = includeDirectChoice(backgroundState, backgroundSelect.value as GuidedDnd5eBackgroundId); backgroundMode = "direct"; saveStickyChoicePool(localStorage, BACKGROUND_STORAGE_KEY, backgroundState); refreshAfterBackground(); });
  speciesSelect.addEventListener("change", () => { speciesState = includeDirectChoice(speciesState, speciesSelect.value as GuidedDnd5eSpeciesId); speciesMode = "direct"; saveStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, speciesState); renderCoreControls(); });

  bindRandomButton("class", classSelect, DND5E_SRD_521_CLASS_OPTIONS, GUIDED_DND5E_CLASS_IDS, () => classState, (next) => { classState = next; classMode = "random"; saveStickyChoicePool(localStorage, CLASS_STORAGE_KEY, classState); renderCoreControls(); });
  bindRandomButton("background", backgroundSelect, DND5E_SRD_521_BACKGROUND_OPTIONS, GUIDED_DND5E_BACKGROUND_IDS, () => backgroundState, (next) => { backgroundState = next; backgroundMode = "random"; saveStickyChoicePool(localStorage, BACKGROUND_STORAGE_KEY, backgroundState); refreshAfterBackground(); });
  bindRandomButton("species", speciesSelect, DND5E_SRD_521_SPECIES_OPTIONS, GUIDED_DND5E_SPECIES_IDS, () => speciesState, (next) => { speciesState = next; speciesMode = "random"; saveStickyChoicePool(localStorage, SPECIES_STORAGE_KEY, speciesState); renderCoreControls(); });

  function bindCoreControls(): void {
    const prefix = coreKey(classState.selectedId, backgroundState.selectedId, speciesState.selectedId);
    const defaults = defaultGuidedDnd5eCoreChoices(classState.selectedId, backgroundState.selectedId, speciesState.selectedId);
    const rules = classChoiceRules(classState.selectedId);
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
      } else bindMultiChoice(`${prefix}.${caster.classId}-prepared`, "class-prepared", caster.preparedSpellOptions.map((o) => o.id), defaults.preparedCaster.preparedSpellIds, caster.preparedSpellCount);
    }

    if (classState.selectedId === "bard") bindMultiChoice(`${prefix}.bard-instruments`, "bard-instruments", DND5E_MUSICAL_INSTRUMENT_OPTIONS.map((o) => o.id), defaults.bardInstrumentIds ?? DND5E_MUSICAL_INSTRUMENT_OPTIONS.slice(0, 3).map((o) => o.id), 3);
    if (classState.selectedId === "fighter") bindStickySelect("fighting-style", DND5E_FIGHTING_STYLE_OPTIONS.map((o) => o.id), defaults.fightingStyleFeatId ?? "defense", prefix);
    if (classState.selectedId === "monk") bindStickySelect("monk-tool", DND5E_MONK_TOOL_OPTIONS.map((o) => o.id), defaults.monkToolProficiencyId ?? DND5E_MONK_TOOL_OPTIONS[0]!.id, prefix);

    if (defaults.magicInitiate) {
      const list = magicInitiateSpellList(defaults.magicInitiate.spellListId);
      bindStickySelect("magic-initiate-ability", DND5E_SPELLCASTING_ABILITY_OPTIONS.map((o) => o.id), defaults.magicInitiate.spellcastingAbilityId, prefix);
      bindMultiChoice(`${prefix}.magic-initiate-cantrips`, "magic-initiate-cantrips", list.cantrips.map((o) => o.id), defaults.magicInitiate.cantripIds, 2);
      bindStickySelect("magic-initiate-level-one", list.levelOneSpells.map((o) => o.id), defaults.magicInitiate.levelOneSpellId, prefix, true);
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
      const humanFeat = readStickySelect(root, "human-feat");
      const host = root.querySelector<HTMLElement>("#creator-human-feat-host");
      if (humanFeat === "skilled") {
        if (host) host.innerHTML = multiChoiceHtml("Skilled proficiencies", "human-skilled", DND5E_SKILLED_PROFICIENCY_OPTIONS.map((o) => o.id), 3);
        bindMultiChoice(`${prefix}.skilled`, "human-skilled", DND5E_SKILLED_PROFICIENCY_OPTIONS.map((o) => o.id), defaults.human?.skilledProficiencyIds ?? DND5E_SKILLED_PROFICIENCY_OPTIONS.slice(0, 3).map((o) => o.id), 3);
      } else if (humanFeat === "magic-initiate" && host) {
        const listIds = humanMagicInitiateListIds(backgroundState.selectedId);
        const defaultListId = defaults.human?.magicInitiate && listIds.includes(defaults.human.magicInitiate.spellListId) ? defaults.human.magicInitiate.spellListId : listIds[0]!;
        const listState = loadStickyChoicePool(localStorage, `${prefix}.human-magic-initiate-list`, listIds, listIds, defaultListId);
        const listId = listState.selectedId;
        const list = magicInitiateSpellList(listId);
        const savedDefaults = defaults.human?.magicInitiate?.spellListId === listId ? defaults.human.magicInitiate : undefined;
        const ability = savedDefaults?.spellcastingAbilityId ?? defaultMagicInitiateAbility(listId);
        const cantrips = savedDefaults?.cantripIds ?? [list.cantrips[0]!.id, list.cantrips[1]!.id];
        const levelOne = savedDefaults?.levelOneSpellId ?? list.levelOneSpells[0]!.id;
        host.innerHTML = humanMagicInitiateControlsHtml(backgroundState.selectedId, listId, ability, cantrips, levelOne);
        bindStickySelect("human-magic-initiate-list", listIds, listId, prefix, true);
        bindStickySelect("human-magic-initiate-ability", DND5E_SPELLCASTING_ABILITY_OPTIONS.map((o) => o.id), ability, prefix);
        bindMultiChoice(`${prefix}.human-magic-initiate.${listId}.cantrips`, "human-magic-initiate-cantrips", list.cantrips.map((o) => o.id), cantrips, 2);
        bindStickySelect("human-magic-initiate-level-one", list.levelOneSpells.map((o) => o.id), levelOne, prefix);
      }
    }
    if (speciesState.selectedId === "elf" && defaults.elf) {
      bindStickySelect("elf-lineage", DND5E_ELF_LINEAGE_OPTIONS.map((o) => o.id), defaults.elf.lineageId, prefix, true);
      bindStickySelect("elf-spellcasting-ability", DND5E_SPELLCASTING_ABILITY_OPTIONS.map((o) => o.id), defaults.elf.spellcastingAbilityId, prefix);
      const taken = new Set([...readMultiSelected(root, "class-skills", rules.skillCount), ...background.skillProficiencies]);
      const remaining = DND5E_ELF_KEEN_SENSES_SKILL_OPTIONS.map((o) => o.id).filter((id) => !taken.has(id));
      const keenOptions = remaining.length ? remaining : DND5E_ELF_KEEN_SENSES_SKILL_OPTIONS.map((o) => o.id);
      bindStickySelect("elf-keen-senses", keenOptions, defaults.elf.keenSensesSkillId, prefix);
    }
    if (speciesState.selectedId === "gnome" && defaults.gnome) {
      bindStickySelect("gnome-lineage", DND5E_GNOME_LINEAGE_OPTIONS.map((o) => o.id), defaults.gnome.lineageId, prefix, true);
      bindStickySelect("gnome-spellcasting-ability", DND5E_SPELLCASTING_ABILITY_OPTIONS.map((o) => o.id), defaults.gnome.spellcastingAbilityId, prefix);
    }
    if (speciesState.selectedId === "tiefling" && defaults.tiefling) {
      bindStickySelect("tiefling-size", ["small", "medium"], defaults.tiefling.size, prefix);
      bindStickySelect("tiefling-legacy", DND5E_TIEFLING_LEGACY_OPTIONS.map((o) => o.id), defaults.tiefling.legacyId, prefix, true);
      bindStickySelect("tiefling-spellcasting-ability", DND5E_SPELLCASTING_ABILITY_OPTIONS.map((o) => o.id), defaults.tiefling.spellcastingAbilityId, prefix);
    }

    if (classState.selectedId === "warlock" && defaults.warlock) {
      bindStickySelect("warlock-invocation", DND5E_LEVEL_ONE_ELDRITCH_INVOCATION_OPTIONS.map((o) => o.id), defaults.warlock.invocationId, prefix, true);
      const invocation = readStickySelect(root, "warlock-invocation") as Dnd5eLevelOneEldritchInvocationId;
      const host = root.querySelector<HTMLElement>("#creator-warlock-invocation-host");
      if (host && invocation === "pact-of-the-tome") {
        const classCantrips = caster?.cantripCount ? readMultiSelected(root, "class-cantrips", caster.cantripCount) : [];
        const classPrepared = caster ? readMultiSelected(root, "class-prepared", caster.preparedSpellCount) : [];
        const magicList = defaults.magicInitiate ? magicInitiateSpellList(defaults.magicInitiate.spellListId) : undefined;
        const magicCantrips = defaults.magicInitiate && magicList
          ? loadStickyMultiChoicePool(localStorage, `${prefix}.magic-initiate-cantrips`, magicList.cantrips.map((o) => o.id), magicList.cantrips.map((o) => o.id), defaults.magicInitiate.cantripIds, 2).selectedIds
          : [];
        const magicLevelOne = defaults.magicInitiate && magicList
          ? loadStickyChoicePool(localStorage, `${prefix}.magic-initiate-level-one`, magicList.levelOneSpells.map((o) => o.id), magicList.levelOneSpells.map((o) => o.id), defaults.magicInitiate.levelOneSpellId).selectedId
          : undefined;
        const humanMagic = speciesState.selectedId === "human" && readStickySelect(root, "human-feat") === "magic-initiate";
        const humanMagicCantrips = humanMagic ? readMultiSelected(root, "human-magic-initiate-cantrips", 2) : [];
        const humanMagicLevelOne = humanMagic ? readStickySelect(root, "human-magic-initiate-level-one") : undefined;
        const speciesSpells = currentSpeciesSpellIdsFromControls(root, speciesState.selectedId);
        const alreadyPrepared = [...classCantrips, ...classPrepared, ...magicCantrips, ...(magicLevelOne ? [magicLevelOne] : []), ...humanMagicCantrips, ...(humanMagicLevelOne ? [humanMagicLevelOne] : []), ...speciesSpells];
        const tomeCantripIds = pactTomeCantripOptionsExcluding(alreadyPrepared).map((o) => o.id);
        const ritualIds = pactTomeRitualSpellOptionsExcluding(alreadyPrepared).map((o) => o.id);
        host.innerHTML = `<p class="muted">Book of Shadows choices are current native state and may change when the book is conjured after a rest. Spells already prepared from Pact Magic, Magic Initiate, or species grants are excluded.</p>${multiChoiceHtml("Book of Shadows cantrips", "warlock-tome-cantrips", tomeCantripIds, 3)}${multiChoiceHtml("Book of Shadows Level 1 rituals", "warlock-tome-rituals", ritualIds, 2)}`;
        bindMultiChoice(`${prefix}.warlock-tome-cantrips`, "warlock-tome-cantrips", tomeCantripIds, fillDefaults(defaults.warlock.pactTomeCantripIds ?? [], tomeCantripIds, 3), 3);
        bindMultiChoice(`${prefix}.warlock-tome-rituals`, "warlock-tome-rituals", ritualIds, fillDefaults(defaults.warlock.pactTomeRitualSpellIds ?? [], ritualIds, 2), 2);
      }
    }

    if (classState.selectedId === "rogue") {
      const selectedSkills = readMultiSelected(root, "class-skills", rules.skillCount);
      const humanSkill = speciesState.selectedId === "human" ? root.querySelector<HTMLSelectElement>("#creator-human-skill")?.value : undefined;
      const elfSkill = speciesState.selectedId === "elf" ? root.querySelector<HTMLSelectElement>("#creator-elf-keen-senses")?.value : undefined;
      const options = [...new Set([...selectedSkills, ...background.skillProficiencies, ...(humanSkill ? [humanSkill] : []), ...(elfSkill ? [elfSkill] : [])])];
      const host = root.querySelector<HTMLElement>("#creator-expertise-host"); if (host) host.innerHTML = multiChoiceHtml("Expertise", "expertise", options, 2);
      bindMultiChoice(`${prefix}.expertise`, "expertise", options, defaults.expertiseSkillIds ?? options.slice(0, 2), 2);
      bindStickySelect("rogue-language", DND5E_BONUS_LANGUAGE_OPTIONS.map((o) => o.id), defaults.rogueBonusLanguageId ?? "giant", prefix);
    }
  }

  function bindStickySelect(field: string, allowed: readonly string[], fallback: string, prefix: string, rerenderOnChange = false): void {
    const select = root.querySelector<HTMLSelectElement>(`#creator-${field}`); if (!select || !allowed.length) return;
    const key = `${prefix}.${field}`; let state = loadStickyChoicePool(localStorage, key, allowed, allowed, allowed.includes(fallback) ? fallback : allowed[0]!);
    const refresh = (): void => { select.innerHTML = allowed.map((id) => `<option value="${escapeAttribute(id)}"${id === state.selectedId ? " selected" : ""}>${labelFor(id)}</option>`).join(""); for (const checkbox of root.querySelectorAll<HTMLInputElement>(`[data-core-pool='${field}']`)) checkbox.checked = state.acceptableIds.includes(checkbox.value); };
    refresh();
    select.addEventListener("change", () => { state = includeDirectChoice(state, select.value); saveStickyChoicePool(localStorage, key, state); if (rerenderOnChange) renderCoreControls(); else refresh(); });
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
      select.innerHTML = allowedIds.map((id) => `<option value="${escapeAttribute(id)}">${labelFor(id)}</option>`).join(""); select.value = state.selectedIds[index] ?? allowedIds[index]!;
      select.addEventListener("change", () => {
        const selectedIds = Array.from({ length: count }, (_, slot) => root.querySelector<HTMLSelectElement>(`#creator-${field}-${slot}`)?.value ?? "");
        if (new Set(selectedIds).size !== count) { showError(error, new Error("Selected options must be distinct."), "Invalid choices."); return; }
        const acceptableIds = [...state.acceptableIds]; for (const id of selectedIds) if (!acceptableIds.includes(id)) acceptableIds.push(id);
        persistAndRender({ acceptableIds, selectedIds });
      });
    }
    root.querySelector<HTMLButtonElement>(`#creator-${field}-random`)?.addEventListener("click", () => persistAndRender({ ...state, selectedIds: pickManyFromAcceptablePool(state.acceptableIds, count) }));
  }

  refreshBackgroundBoosts(boostSelect, backgroundState.selectedId); refreshBackgroundEquipment(backgroundEquipmentSelect, backgroundState.selectedId); renderCoreControls();
  form.addEventListener("submit", (event) => {
    event.preventDefault(); clearError(error);
    try { const core = readCoreChoices(root, classState.selectedId, backgroundState.selectedId, speciesState.selectedId); onCharacter(guidedGenerateDnd5eFirstSlice({ name: nameInput?.value ?? "", nameSelectionMode: nameMode, classChoice: { selectedId: classState.selectedId, acceptableIds: classState.acceptableIds, selectionMode: classMode }, backgroundChoice: { selectedId: backgroundState.selectedId, acceptableIds: backgroundState.acceptableIds, selectionMode: backgroundMode }, speciesChoice: { selectedId: speciesState.selectedId, acceptableIds: speciesState.acceptableIds, selectionMode: speciesMode }, coreChoices: core.choices, coreChoiceProvenance: core.provenance, abilityMethod: abilityControls.read(), backgroundIncreases: parseBoostPlan(boostSelect.value), backgroundEquipmentChoice: readBackgroundEquipmentChoice(root) })); }
    catch (caught) { showError(error, caught, "Character generation failed."); }
  });

  function bindPool<TId extends string>(poolName: string, select: HTMLSelectElement, options: readonly { id: string; label: string }[], allowedIds: readonly TId[], getState: () => StickyChoicePoolState<TId>, setState: (state: StickyChoicePoolState<TId>) => void): void { for (const checkbox of root.querySelectorAll<HTMLInputElement>(`[data-choice-pool='${poolName}']`)) checkbox.addEventListener("change", () => { const next = updatePoolFromCheckboxes(root, poolName, getState(), allowedIds, error); setState(next); refreshSelect(select, next, options.filter((o) => allowedIds.includes(o.id as TId))); }); }
  function bindRandomButton<TId extends string>(poolName: string, select: HTMLSelectElement, options: readonly { id: string; label: string }[], allowedIds: readonly TId[], getState: () => StickyChoicePoolState<TId>, setState: (state: StickyChoicePoolState<TId>) => void): void { root.querySelector<HTMLButtonElement>(`#creator-${poolName}-random`)?.addEventListener("click", () => { const state = getState(); const next = { ...state, selectedId: pickFromAcceptablePool(state.acceptableIds) }; setState(next); refreshSelect(select, next, options.filter((o) => allowedIds.includes(o.id as TId))); }); }
}

function creatorHtml(classState: StickyChoicePoolState<GuidedDnd5eClassId>, backgroundState: StickyChoicePoolState<GuidedDnd5eBackgroundId>, speciesState: StickyChoicePoolState<GuidedDnd5eSpeciesId>): string {
  return `<section class="creator-panel compact-creator"><div class="creator-heading"><p class="eyebrow">D&D 5E 2024 · SRD 5.2.1</p><h2>Create character</h2><p>Official order by default. Leave the name blank to generate one.</p></div><form id="creator-form" class="creator-form"><div class="choice-pick-row"><label>Character name<input id="creator-name" type="text" maxlength="80" placeholder="Optional · generated if blank" /></label><button id="creator-name-random" type="button" class="icon-button" title="Generate a random character name" aria-label="Generate a random character name">↻</button></div>${choiceSectionHtml("Class", "class", DND5E_SRD_521_CLASS_OPTIONS, classState)}${choiceSectionHtml("Background", "background", DND5E_SRD_521_BACKGROUND_OPTIONS, backgroundState)}${choiceSectionHtml("Species", "species", DND5E_SRD_521_SPECIES_OPTIONS, speciesState)}<label>Background equipment<select id="creator-background-equipment">${backgroundEquipmentOptions(backgroundState.selectedId)}</select></label><div id="core-choice-controls"></div><div class="section-divider"></div><label>Ability generation<select id="creator-generation-method"><option value="standard-array" selected>Standard Array</option><option value="point-cost">Point Cost</option><option value="random">Random · 4d6 keep highest 3</option><option value="manual">Manual Entry</option></select></label><details class="field-help"><summary>ⓘ About ability-generation methods</summary><p><strong>Standard Array:</strong> assign 15, 14, 13, 12, 10, and 8 once each. <strong>Point Cost:</strong> spend up to 27 points on scores from 8–15. <strong>Random:</strong> roll 4d6, keep the highest 3, six times. <strong>Manual:</strong> enter legal base scores directly.</p></details><div id="generation-method-controls" class="method-controls"></div><label>Background ability increases<select id="creator-boost-plan"></select></label><p id="creator-error" class="form-error" role="alert"></p><button type="submit" class="primary-action">Build character</button></form></section>`;
}

function coreControlsHtml(classId: GuidedDnd5eClassId, backgroundId: GuidedDnd5eBackgroundId, speciesId: GuidedDnd5eSpeciesId): string {
  const defaults = defaultGuidedDnd5eCoreChoices(classId, backgroundId, speciesId); const rules = classChoiceRules(classId); const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((o) => o.id === backgroundId)!; const classSkills = rules.skillIds.filter((id) => !(background.skillProficiencies as readonly string[]).includes(id));
  const classDetails: string[] = [multiChoiceHtml("Class skills", "class-skills", classSkills, rules.skillCount), selectPoolRow("Starting equipment", "class-equipment", rules.equipmentChoices, defaults.classEquipmentChoice)];
  if (classId === "cleric" && defaults.cleric) classDetails.push(selectPoolRow("Divine Order", "cleric-order", DND5E_CLERIC_DIVINE_ORDER_OPTIONS, defaults.cleric.divineOrderId), '<div id="creator-cleric-cantrip-host"></div>', multiChoiceHtml("Prepared Level 1 spells", "cleric-prepared", DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS.map((o) => o.id), 4));
  if (classId === "druid" && defaults.druid) classDetails.push(selectPoolRow("Primal Order", "druid-order", DND5E_DRUID_PRIMAL_ORDER_OPTIONS, defaults.druid.primalOrderId), '<div id="creator-druid-cantrip-host"></div>', multiChoiceHtml("Prepared Level 1 spells", "druid-prepared", DND5E_DRUID_PREPARED_LEVEL_ONE_SPELL_OPTIONS.map((o) => o.id), 4), '<p class="muted">Druidic always prepares Speak with Animals separately from these four choices.</p>');
  const caster = preparedCasterCatalog(classId);
  if (caster && defaults.preparedCaster) {
    if (caster.cantripCount) classDetails.push(multiChoiceHtml(`${caster.label} cantrips`, "class-cantrips", caster.cantripOptions.map((o) => o.id), caster.cantripCount));
    if (caster.spellbookCount) classDetails.push(multiChoiceHtml("Level 1 spellbook spells", "wizard-spellbook", caster.preparedSpellOptions.map((o) => o.id), caster.spellbookCount), '<div id="creator-class-prepared-host"></div>');
    else classDetails.push(multiChoiceHtml("Prepared Level 1 spells", "class-prepared", caster.preparedSpellOptions.map((o) => o.id), caster.preparedSpellCount));
  }
  if (classId === "warlock" && defaults.warlock) classDetails.push('<p class="muted">Pact Magic has one Level 1 slot at Warlock 1 and restores it after a Short or Long Rest.</p>', selectPoolRow("Eldritch Invocation", "warlock-invocation", DND5E_LEVEL_ONE_ELDRITCH_INVOCATION_OPTIONS, defaults.warlock.invocationId), '<div id="creator-warlock-invocation-host"></div>');
  if (classId === "bard") classDetails.push(multiChoiceHtml("Musical instrument proficiencies", "bard-instruments", DND5E_MUSICAL_INSTRUMENT_OPTIONS.map((o) => o.id), 3));
  if (classId === "fighter") classDetails.push(selectPoolRow("Fighting Style", "fighting-style", DND5E_FIGHTING_STYLE_OPTIONS, defaults.fightingStyleFeatId ?? "defense"));
  if (rules.weaponMasteryCount) classDetails.push(multiChoiceHtml("Weapon Mastery", "weapon-mastery", rules.weaponMasteryIds, rules.weaponMasteryCount));
  if (classId === "monk") classDetails.push(selectPoolRow("Tool or instrument", "monk-tool", DND5E_MONK_TOOL_OPTIONS, defaults.monkToolProficiencyId ?? DND5E_MONK_TOOL_OPTIONS[0]!.id));
  if (classId === "rogue") classDetails.push('<div id="creator-expertise-host"></div>', selectPoolRow("Thieves' Cant bonus language", "rogue-language", DND5E_BONUS_LANGUAGE_OPTIONS, defaults.rogueBonusLanguageId ?? "giant"));
  const magicDetails = defaults.magicInitiate ? magicInitiateControlsHtml(defaults.magicInitiate.spellListId, defaults) : "";
  const speciesDetails = speciesControlsHtml(speciesId, defaults);
  return `<details class="choice-pool-details" open><summary>Class details</summary><div class="method-controls">${classDetails.join("")}</div></details><details class="choice-pool-details" open><summary>Origin details</summary><div class="method-controls">${selectPoolRow("Alignment", "alignment", DND5E_ALIGNMENT_OPTIONS, defaults.alignmentId)}${selectPoolRow("Language 1", "language-1", DND5E_STANDARD_LANGUAGE_OPTIONS, defaults.originLanguageIds[0])}${selectPoolRow("Language 2", "language-2", DND5E_STANDARD_LANGUAGE_OPTIONS, defaults.originLanguageIds[1])}${magicDetails}${speciesDetails}</div></details>`;
}
function magicInitiateControlsHtml(listId: Dnd5eMagicInitiateSpellListId, defaults: GuidedDnd5eCoreChoices): string { const selection = defaults.magicInitiate!; const list = magicInitiateSpellList(listId); return `<div class="choice-section"><strong>Magic Initiate · ${list.label}</strong><p class="muted">Choose the feat's casting ability, two ${list.label} cantrips, and one ${list.label} Level 1 spell.</p>${selectPoolRow("Spellcasting ability", "magic-initiate-ability", DND5E_SPELLCASTING_ABILITY_OPTIONS, selection.spellcastingAbilityId)}${multiChoiceHtml("Cantrips", "magic-initiate-cantrips", list.cantrips.map((o) => o.id), 2)}${selectPoolRow("Level 1 spell", "magic-initiate-level-one", list.levelOneSpells, selection.levelOneSpellId)}</div>`; }
function humanMagicInitiateControlsHtml(backgroundId: GuidedDnd5eBackgroundId, listId: Dnd5eMagicInitiateSpellListId, abilityId: Dnd5eSpellcastingAbilityId, cantripIds: readonly string[], levelOneSpellId: string): string {
  const list = magicInitiateSpellList(listId);
  const listOptions = humanMagicInitiateListIds(backgroundId).map((id) => ({ id, label: magicInitiateSpellList(id).label }));
  return `<div class="choice-section"><strong>Human Versatile · Magic Initiate</strong><p class="muted">Magic Initiate is repeatable only with a different spell list. If your background already grants it, that list is excluded here.</p>${selectPoolRow("Spell list", "human-magic-initiate-list", listOptions, listId)}${selectPoolRow("Spellcasting ability", "human-magic-initiate-ability", DND5E_SPELLCASTING_ABILITY_OPTIONS, abilityId)}${multiChoiceHtml("Cantrips", "human-magic-initiate-cantrips", list.cantrips.map((o) => o.id), 2)}${selectPoolRow("Level 1 spell", "human-magic-initiate-level-one", list.levelOneSpells, levelOneSpellId)}</div>`;
}
function speciesControlsHtml(speciesId: GuidedDnd5eSpeciesId, defaults: GuidedDnd5eCoreChoices): string {
  if (speciesId === "dragonborn") return selectPoolRow("Draconic Ancestry", "dragonborn-ancestry", DND5E_DRAGONBORN_ANCESTRY_OPTIONS, defaults.dragonbornAncestryId ?? "red");
  if (speciesId === "goliath") return selectPoolRow("Giant Ancestry", "goliath-ancestry", DND5E_GOLIATH_ANCESTRY_OPTIONS, defaults.goliathAncestryId ?? "stone");
  if (speciesId === "human") return `${selectPoolRow("Human size", "human-size", [{ id: "small", label: "Small" }, { id: "medium", label: "Medium" }], defaults.human?.size ?? "medium")}${selectPoolRow("Skillful", "human-skill", DND5E_SKILL_OPTIONS, defaults.human?.skillId ?? "perception")}${selectPoolRow("Versatile Origin feat", "human-feat", DND5E_HUMAN_ORIGIN_FEAT_OPTIONS.filter((o) => o.supported), defaults.human?.originFeatId ?? "alert")}<div id="creator-human-feat-host"></div>`;
  if (speciesId === "elf" && defaults.elf) return `${selectPoolRow("Elven Lineage", "elf-lineage", DND5E_ELF_LINEAGE_OPTIONS, defaults.elf.lineageId)}${selectPoolRow("Lineage spellcasting ability", "elf-spellcasting-ability", DND5E_SPELLCASTING_ABILITY_OPTIONS, defaults.elf.spellcastingAbilityId)}${selectPoolRow("Keen Senses", "elf-keen-senses", DND5E_ELF_KEEN_SENSES_SKILL_OPTIONS, defaults.elf.keenSensesSkillId)}<p class="muted">Level 3 and 5 lineage spells are retained as future-gated native grants. High Elf also retains its Long-Rest Wizard-cantrip replacement rule.</p>`;
  if (speciesId === "gnome" && defaults.gnome) return `${selectPoolRow("Gnomish Lineage", "gnome-lineage", DND5E_GNOME_LINEAGE_OPTIONS, defaults.gnome.lineageId)}${selectPoolRow("Lineage spellcasting ability", "gnome-spellcasting-ability", DND5E_SPELLCASTING_ABILITY_OPTIONS, defaults.gnome.spellcastingAbilityId)}<p class="muted">Forest Gnome retains proficiency-bonus free Speak with Animals casts. Rock Gnome retains its three-device clockwork capacity.</p>`;
  if (speciesId === "tiefling" && defaults.tiefling) return `${selectPoolRow("Tiefling size", "tiefling-size", [{ id: "small", label: "Small" }, { id: "medium", label: "Medium" }], defaults.tiefling.size)}${selectPoolRow("Fiendish Legacy", "tiefling-legacy", DND5E_TIEFLING_LEGACY_OPTIONS, defaults.tiefling.legacyId)}${selectPoolRow("Legacy spellcasting ability", "tiefling-spellcasting-ability", DND5E_SPELLCASTING_ABILITY_OPTIONS, defaults.tiefling.spellcastingAbilityId)}<p class="muted">Legacy resistance and Level 1 cantrips apply now; Level 3 and 5 spells are retained as future-gated native grants.</p>`;
  return "";
}

function readCoreChoices(root: HTMLElement, classId: GuidedDnd5eClassId, backgroundId: GuidedDnd5eBackgroundId, speciesId: GuidedDnd5eSpeciesId): { choices: GuidedDnd5eCoreChoices; provenance: GenerationDecision[] } {
  const rules = classChoiceRules(classId); const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((o) => o.id === backgroundId)!; const legalClassSkills = rules.skillIds.filter((id) => !(background.skillProficiencies as readonly string[]).includes(id));
  const choices: GuidedDnd5eCoreChoices = { alignmentId: readStickySelect(root, "alignment"), originLanguageIds: [readStickySelect(root, "language-1"), readStickySelect(root, "language-2")], classSkillIds: readMultiSelected(root, "class-skills", rules.skillCount), classEquipmentChoice: readStickySelect(root, "class-equipment"), weaponMasteryIds: rules.weaponMasteryCount ? readMultiSelected(root, "weapon-mastery", rules.weaponMasteryCount) : [] };
  if (classId === "cleric") { const order = readStickySelect(root, "cleric-order") as Dnd5eClericDivineOrderId; choices.cleric = { divineOrderId: order, cantripIds: readMultiSelected(root, "cleric-cantrips", clericCantripCount(order)), preparedSpellIds: readMultiSelected(root, "cleric-prepared", 4) }; }
  if (classId === "druid") { const order = readStickySelect(root, "druid-order") as Dnd5eDruidPrimalOrderId; choices.druid = { primalOrderId: order, cantripIds: readMultiSelected(root, "druid-cantrips", druidCantripCount(order)), preparedSpellIds: readMultiSelected(root, "druid-prepared", 4) }; }
  const caster = preparedCasterCatalog(classId);
  if (caster) choices.preparedCaster = { classId: caster.classId, cantripIds: caster.cantripCount ? readMultiSelected(root, "class-cantrips", caster.cantripCount) : [], preparedSpellIds: readMultiSelected(root, "class-prepared", caster.preparedSpellCount), ...(caster.spellbookCount ? { spellbookSpellIds: readMultiSelected(root, "wizard-spellbook", caster.spellbookCount) } : {}) };
  if (classId === "warlock") { const invocationId = readStickySelect(root, "warlock-invocation") as Dnd5eLevelOneEldritchInvocationId; choices.warlock = invocationId === "pact-of-the-tome" ? { invocationId, pactTomeCantripIds: readMultiSelected(root, "warlock-tome-cantrips", 3), pactTomeRitualSpellIds: readMultiSelected(root, "warlock-tome-rituals", 2) } : { invocationId }; }
  if (classId === "bard") choices.bardInstrumentIds = readMultiSelected(root, "bard-instruments", 3);
  if (classId === "fighter") choices.fightingStyleFeatId = readStickySelect(root, "fighting-style");
  if (classId === "monk") choices.monkToolProficiencyId = readStickySelect(root, "monk-tool");
  if (classId === "rogue") { choices.expertiseSkillIds = readMultiSelected(root, "expertise", 2); choices.rogueBonusLanguageId = readStickySelect(root, "rogue-language"); }
  const magicListId = magicInitiateListForBackground(backgroundId);
  if (magicListId) { const cantrips = readMultiSelected(root, "magic-initiate-cantrips", 2); choices.magicInitiate = { spellListId: magicListId, spellcastingAbilityId: readStickySelect(root, "magic-initiate-ability") as Dnd5eSpellcastingAbilityId, cantripIds: [cantrips[0]!, cantrips[1]!], levelOneSpellId: readStickySelect(root, "magic-initiate-level-one") }; }
  if (speciesId === "dragonborn") choices.dragonbornAncestryId = readStickySelect(root, "dragonborn-ancestry") as GuidedDnd5eCoreChoices["dragonbornAncestryId"];
  if (speciesId === "goliath") choices.goliathAncestryId = readStickySelect(root, "goliath-ancestry") as GuidedDnd5eCoreChoices["goliathAncestryId"];
  if (speciesId === "human") {
    const feat = readStickySelect(root, "human-feat") as "alert" | "magic-initiate" | "savage-attacker" | "skilled";
    const human = { size: readStickySelect(root, "human-size") as "small" | "medium", skillId: readStickySelect(root, "human-skill"), originFeatId: feat } as NonNullable<GuidedDnd5eCoreChoices["human"]>;
    if (feat === "skilled") human.skilledProficiencyIds = readMultiSelected(root, "human-skilled", 3);
    if (feat === "magic-initiate") {
      const listId = readStickySelect(root, "human-magic-initiate-list") as Dnd5eMagicInitiateSpellListId;
      const cantrips = readMultiSelected(root, "human-magic-initiate-cantrips", 2);
      human.magicInitiate = { spellListId: listId, spellcastingAbilityId: readStickySelect(root, "human-magic-initiate-ability") as Dnd5eSpellcastingAbilityId, cantripIds: [cantrips[0]!, cantrips[1]!], levelOneSpellId: readStickySelect(root, "human-magic-initiate-level-one") };
    }
    choices.human = human;
  }
  if (speciesId === "elf") choices.elf = { lineageId: readStickySelect(root, "elf-lineage") as Dnd5eElfLineageId, spellcastingAbilityId: readStickySelect(root, "elf-spellcasting-ability") as Dnd5eSpellcastingAbilityId, keenSensesSkillId: readStickySelect(root, "elf-keen-senses") as "insight" | "perception" | "survival" };
  if (speciesId === "gnome") choices.gnome = { lineageId: readStickySelect(root, "gnome-lineage") as Dnd5eGnomeLineageId, spellcastingAbilityId: readStickySelect(root, "gnome-spellcasting-ability") as Dnd5eSpellcastingAbilityId };
  if (speciesId === "tiefling") choices.tiefling = { size: readStickySelect(root, "tiefling-size") as "small" | "medium", legacyId: readStickySelect(root, "tiefling-legacy") as Dnd5eTieflingLegacyId, spellcastingAbilityId: readStickySelect(root, "tiefling-spellcasting-ability") as Dnd5eSpellcastingAbilityId };

  const prefix = coreKey(classId, backgroundId, speciesId); const provenance: GenerationDecision[] = [];
  const skillState = loadStickyMultiChoicePool(localStorage, `${prefix}.skills`, legalClassSkills, legalClassSkills, choices.classSkillIds, rules.skillCount); provenance.push({ stepId: "class.skills.acceptable-pool", answer: skillState.acceptableIds });
  if (rules.weaponMasteryCount) provenance.push(poolEvidence(`${prefix}.mastery`, "class.weapon-mastery.acceptable-pool", rules.weaponMasteryIds, choices.weaponMasteryIds, rules.weaponMasteryCount));
  if (choices.cleric) provenance.push(poolEvidence(`${prefix}.cleric-cantrips`, "class.cleric.cantrips.acceptable-pool", DND5E_CLERIC_CANTRIP_OPTIONS.map((o) => o.id), choices.cleric.cantripIds, choices.cleric.cantripIds.length), poolEvidence(`${prefix}.cleric-prepared`, "class.cleric.prepared-spells.acceptable-pool", DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS.map((o) => o.id), choices.cleric.preparedSpellIds, 4));
  if (choices.druid) provenance.push(poolEvidence(`${prefix}.druid-cantrips`, "class.druid.cantrips.acceptable-pool", DND5E_DRUID_CANTRIP_OPTIONS.map((o) => o.id), choices.druid.cantripIds, choices.druid.cantripIds.length), poolEvidence(`${prefix}.druid-prepared`, "class.druid.prepared-spells.acceptable-pool", DND5E_DRUID_PREPARED_LEVEL_ONE_SPELL_OPTIONS.map((o) => o.id), choices.druid.preparedSpellIds, 4));
  if (choices.preparedCaster && caster) {
    if (caster.cantripCount) provenance.push(poolEvidence(`${prefix}.${caster.classId}-cantrips`, `class.${caster.classId}.cantrips.acceptable-pool`, caster.cantripOptions.map((o) => o.id), choices.preparedCaster.cantripIds, caster.cantripCount));
    if (caster.spellbookCount) { const spellbook = choices.preparedCaster.spellbookSpellIds ?? []; provenance.push(poolEvidence(`${prefix}.wizard-spellbook`, "class.wizard.spellbook.acceptable-pool", caster.preparedSpellOptions.map((o) => o.id), spellbook, caster.spellbookCount), poolEvidence(`${prefix}.wizard-prepared`, "class.wizard.prepared-spells.acceptable-pool", spellbook, choices.preparedCaster.preparedSpellIds, caster.preparedSpellCount)); }
    else provenance.push(poolEvidence(`${prefix}.${caster.classId}-prepared`, `class.${caster.classId}.prepared-spells.acceptable-pool`, caster.preparedSpellOptions.map((o) => o.id), choices.preparedCaster.preparedSpellIds, caster.preparedSpellCount));
  }
  if (choices.warlock?.invocationId === "pact-of-the-tome") {
    const alreadyPrepared = [
      ...(choices.preparedCaster?.cantripIds ?? []),
      ...(choices.preparedCaster?.preparedSpellIds ?? []),
      ...(choices.magicInitiate?.cantripIds ?? []),
      ...(choices.magicInitiate ? [choices.magicInitiate.levelOneSpellId] : []),
      ...(choices.human?.magicInitiate?.cantripIds ?? []),
      ...(choices.human?.magicInitiate ? [choices.human.magicInitiate.levelOneSpellId] : []),
      ...currentGuidedDnd5eSpeciesSpellIds(speciesId, choices),
    ];
    const tomeCantripAllowed = pactTomeCantripOptionsExcluding(alreadyPrepared).map((o) => o.id);
    const ritualAllowed = pactTomeRitualSpellOptionsExcluding(alreadyPrepared).map((o) => o.id);
    provenance.push(poolEvidence(`${prefix}.warlock-tome-cantrips`, "class.warlock.pact-tome.cantrips.acceptable-pool", tomeCantripAllowed, choices.warlock.pactTomeCantripIds ?? [], 3));
    provenance.push(poolEvidence(`${prefix}.warlock-tome-rituals`, "class.warlock.pact-tome.ritual-spells.acceptable-pool", ritualAllowed, choices.warlock.pactTomeRitualSpellIds ?? [], 2));
  }
  if (choices.bardInstrumentIds) provenance.push(poolEvidence(`${prefix}.bard-instruments`, "class.bard.instruments.acceptable-pool", DND5E_MUSICAL_INSTRUMENT_OPTIONS.map((o) => o.id), choices.bardInstrumentIds, 3));
  if (choices.magicInitiate) { const list = magicInitiateSpellList(choices.magicInitiate.spellListId); provenance.push(poolEvidence(`${prefix}.magic-initiate-cantrips`, "background.magic-initiate.cantrips.acceptable-pool", list.cantrips.map((o) => o.id), choices.magicInitiate.cantripIds, 2)); }
  if (classId === "rogue") { const options = [...new Set([...choices.classSkillIds, ...background.skillProficiencies, ...(choices.human?.skillId ? [choices.human.skillId] : []), ...(choices.elf?.keenSensesSkillId ? [choices.elf.keenSensesSkillId] : [])])]; provenance.push(poolEvidence(`${prefix}.expertise`, "class.expertise.acceptable-pool", options, choices.expertiseSkillIds ?? [], 2)); }
  if (speciesId === "human" && choices.human?.originFeatId === "skilled") provenance.push(poolEvidence(`${prefix}.skilled`, "species.human.skilled.acceptable-pool", DND5E_SKILLED_PROFICIENCY_OPTIONS.map((o) => o.id), choices.human.skilledProficiencyIds ?? [], 3));
  if (speciesId === "human" && choices.human?.originFeatId === "magic-initiate" && choices.human.magicInitiate) {
    const selection = choices.human.magicInitiate;
    const listIds = humanMagicInitiateListIds(backgroundId);
    const list = magicInitiateSpellList(selection.spellListId);
    const listState = loadStickyChoicePool(localStorage, `${prefix}.human-magic-initiate-list`, listIds, listIds, selection.spellListId);
    provenance.push({ stepId: "species.human.magic-initiate.spell-list.acceptable-pool", answer: listState.acceptableIds });
    const abilityIds = DND5E_SPELLCASTING_ABILITY_OPTIONS.map((o) => o.id);
    const abilityState = loadStickyChoicePool(localStorage, `${prefix}.human-magic-initiate-ability`, abilityIds, abilityIds, selection.spellcastingAbilityId);
    provenance.push({ stepId: "species.human.magic-initiate.spellcasting-ability.acceptable-pool", answer: abilityState.acceptableIds });
    provenance.push(poolEvidence(`${prefix}.human-magic-initiate.${selection.spellListId}.cantrips`, "species.human.magic-initiate.cantrips.acceptable-pool", list.cantrips.map((o) => o.id), selection.cantripIds, 2));
    const levelOneIds = list.levelOneSpells.map((o) => o.id);
    const levelOneState = loadStickyChoicePool(localStorage, `${prefix}.human-magic-initiate-level-one`, levelOneIds, levelOneIds, selection.levelOneSpellId);
    provenance.push({ stepId: "species.human.magic-initiate.level-one-spell.acceptable-pool", answer: levelOneState.acceptableIds });
  }
  for (const field of coreSingleFields(classId, backgroundId, speciesId)) { const options = field.allowed(background); const selected = coreSingleValue(field.id, choices); const state = loadStickyChoicePool(localStorage, `${prefix}.${field.id}`, options, options, options.includes(selected) ? selected : options[0]!); provenance.push({ stepId: `${field.stepId}.acceptable-pool`, answer: state.acceptableIds }); }
  return { choices, provenance };
}
function poolEvidence(key: string, stepId: string, allowed: readonly string[], selected: readonly string[], count: number): GenerationDecision { const state = loadStickyMultiChoicePool(localStorage, key, allowed, allowed, selected, count); return { stepId, answer: state.acceptableIds }; }
function coreSingleFields(classId: GuidedDnd5eClassId, backgroundId: GuidedDnd5eBackgroundId, speciesId: GuidedDnd5eSpeciesId): CoreSingleField[] {
  const rules = classChoiceRules(classId); const fields: CoreSingleField[] = [
    { id: "alignment", stepId: "alignment", allowed: () => DND5E_ALIGNMENT_OPTIONS.map((o) => o.id) }, { id: "language-1", stepId: "origin.language-1", allowed: () => DND5E_STANDARD_LANGUAGE_OPTIONS.map((o) => o.id) }, { id: "language-2", stepId: "origin.language-2", allowed: () => DND5E_STANDARD_LANGUAGE_OPTIONS.map((o) => o.id) }, { id: "class-equipment", stepId: "class.equipment", allowed: () => rules.equipmentChoices.map((o) => o.id) },
  ];
  if (classId === "cleric") fields.push({ id: "cleric-order", stepId: "class.cleric.divine-order", allowed: () => DND5E_CLERIC_DIVINE_ORDER_OPTIONS.map((o) => o.id) });
  if (classId === "druid") fields.push({ id: "druid-order", stepId: "class.druid.primal-order", allowed: () => DND5E_DRUID_PRIMAL_ORDER_OPTIONS.map((o) => o.id) });
  if (classId === "warlock") fields.push({ id: "warlock-invocation", stepId: "class.warlock.eldritch-invocation", allowed: () => DND5E_LEVEL_ONE_ELDRITCH_INVOCATION_OPTIONS.map((o) => o.id) });
  if (classId === "fighter") fields.push({ id: "fighting-style", stepId: "class.fighting-style", allowed: () => DND5E_FIGHTING_STYLE_OPTIONS.map((o) => o.id) });
  if (classId === "monk") fields.push({ id: "monk-tool", stepId: "class.tool", allowed: () => DND5E_MONK_TOOL_OPTIONS.map((o) => o.id) });
  if (classId === "rogue") fields.push({ id: "rogue-language", stepId: "class.bonus-language", allowed: () => DND5E_BONUS_LANGUAGE_OPTIONS.map((o) => o.id) });
  const magic = magicInitiateListForBackground(backgroundId); if (magic) { const list = magicInitiateSpellList(magic); fields.push({ id: "magic-initiate-ability", stepId: "background.magic-initiate.spellcasting-ability", allowed: () => DND5E_SPELLCASTING_ABILITY_OPTIONS.map((o) => o.id) }, { id: "magic-initiate-level-one", stepId: "background.magic-initiate.level-one-spell", allowed: () => list.levelOneSpells.map((o) => o.id) }); }
  if (speciesId === "dragonborn") fields.push({ id: "dragonborn-ancestry", stepId: "species.dragonborn.ancestry", allowed: () => DND5E_DRAGONBORN_ANCESTRY_OPTIONS.map((o) => o.id) });
  if (speciesId === "goliath") fields.push({ id: "goliath-ancestry", stepId: "species.goliath.ancestry", allowed: () => DND5E_GOLIATH_ANCESTRY_OPTIONS.map((o) => o.id) });
  if (speciesId === "human") fields.push({ id: "human-size", stepId: "species.human.size", allowed: () => ["small", "medium"] }, { id: "human-skill", stepId: "species.human.skillful", allowed: (bg) => DND5E_SKILL_OPTIONS.map((o) => o.id).filter((id) => !(bg.skillProficiencies as readonly string[]).includes(id)) }, { id: "human-feat", stepId: "species.human.versatile", allowed: (bg) => DND5E_HUMAN_ORIGIN_FEAT_OPTIONS.filter((o) => o.supported && o.id !== bg.originFeatId).map((o) => o.id) });
  if (speciesId === "elf") fields.push({ id: "elf-lineage", stepId: "species.elf.lineage", allowed: () => DND5E_ELF_LINEAGE_OPTIONS.map((o) => o.id) }, { id: "elf-spellcasting-ability", stepId: "species.elf.spellcasting-ability", allowed: () => DND5E_SPELLCASTING_ABILITY_OPTIONS.map((o) => o.id) }, { id: "elf-keen-senses", stepId: "species.elf.keen-senses", allowed: () => DND5E_ELF_KEEN_SENSES_SKILL_OPTIONS.map((o) => o.id) });
  if (speciesId === "gnome") fields.push({ id: "gnome-lineage", stepId: "species.gnome.lineage", allowed: () => DND5E_GNOME_LINEAGE_OPTIONS.map((o) => o.id) }, { id: "gnome-spellcasting-ability", stepId: "species.gnome.spellcasting-ability", allowed: () => DND5E_SPELLCASTING_ABILITY_OPTIONS.map((o) => o.id) });
  if (speciesId === "tiefling") fields.push({ id: "tiefling-size", stepId: "species.tiefling.size", allowed: () => ["small", "medium"] }, { id: "tiefling-legacy", stepId: "species.tiefling.legacy", allowed: () => DND5E_TIEFLING_LEGACY_OPTIONS.map((o) => o.id) }, { id: "tiefling-spellcasting-ability", stepId: "species.tiefling.spellcasting-ability", allowed: () => DND5E_SPELLCASTING_ABILITY_OPTIONS.map((o) => o.id) });
  return fields;
}
function coreSingleValue(field: string, choices: GuidedDnd5eCoreChoices): string { if (field === "alignment") return choices.alignmentId; if (field === "language-1") return choices.originLanguageIds[0]; if (field === "language-2") return choices.originLanguageIds[1]; if (field === "class-equipment") return choices.classEquipmentChoice; if (field === "cleric-order") return choices.cleric?.divineOrderId ?? ""; if (field === "druid-order") return choices.druid?.primalOrderId ?? ""; if (field === "warlock-invocation") return choices.warlock?.invocationId ?? ""; if (field === "fighting-style") return choices.fightingStyleFeatId ?? ""; if (field === "monk-tool") return choices.monkToolProficiencyId ?? ""; if (field === "rogue-language") return choices.rogueBonusLanguageId ?? ""; if (field === "magic-initiate-ability") return choices.magicInitiate?.spellcastingAbilityId ?? ""; if (field === "magic-initiate-level-one") return choices.magicInitiate?.levelOneSpellId ?? ""; if (field === "dragonborn-ancestry") return choices.dragonbornAncestryId ?? ""; if (field === "goliath-ancestry") return choices.goliathAncestryId ?? ""; if (field === "human-size") return choices.human?.size ?? ""; if (field === "human-skill") return choices.human?.skillId ?? ""; if (field === "human-feat") return choices.human?.originFeatId ?? ""; if (field === "elf-lineage") return choices.elf?.lineageId ?? ""; if (field === "elf-spellcasting-ability") return choices.elf?.spellcastingAbilityId ?? ""; if (field === "elf-keen-senses") return choices.elf?.keenSensesSkillId ?? ""; if (field === "gnome-lineage") return choices.gnome?.lineageId ?? ""; if (field === "gnome-spellcasting-ability") return choices.gnome?.spellcastingAbilityId ?? ""; if (field === "tiefling-size") return choices.tiefling?.size ?? ""; if (field === "tiefling-legacy") return choices.tiefling?.legacyId ?? ""; if (field === "tiefling-spellcasting-ability") return choices.tiefling?.spellcastingAbilityId ?? ""; return ""; }

function currentSpeciesSpellIdsFromControls(root: HTMLElement, speciesId: GuidedDnd5eSpeciesId): string[] {
  if (speciesId === "elf") { const lineage = elfLineage(readStickySelect(root, "elf-lineage") as Dnd5eElfLineageId); return [lineage.initialCantripId]; }
  if (speciesId === "gnome") { const lineage = gnomeLineage(readStickySelect(root, "gnome-lineage") as Dnd5eGnomeLineageId); return [...lineage.cantripIds, ...lineage.alwaysPreparedSpellIds]; }
  if (speciesId === "tiefling") { const legacy = tieflingLegacy(readStickySelect(root, "tiefling-legacy") as Dnd5eTieflingLegacyId); return [legacy.legacyCantripId, "thaumaturgy"]; }
  return [];
}
function magicInitiateListForBackground(backgroundId: GuidedDnd5eBackgroundId): Dnd5eMagicInitiateSpellListId | undefined { return backgroundId === "acolyte" ? "cleric" : backgroundId === "sage" ? "wizard" : undefined; }
function humanMagicInitiateListIds(backgroundId: GuidedDnd5eBackgroundId): Dnd5eMagicInitiateSpellListId[] { const blocked = magicInitiateListForBackground(backgroundId); return (["cleric", "druid", "wizard"] as Dnd5eMagicInitiateSpellListId[]).filter((id) => id !== blocked); }
function defaultMagicInitiateAbility(listId: Dnd5eMagicInitiateSpellListId): Dnd5eSpellcastingAbilityId { return listId === "wizard" ? "intelligence" : "wisdom"; }
function choiceSectionHtml<TId extends string>(label: string, poolName: string, options: readonly { id: string; label: string; guidedSupported: boolean; blockedReason?: string }[], state: StickyChoicePoolState<TId>): string { const direct = options.filter((o) => o.guidedSupported); return `<div class="choice-section"><div class="choice-pick-row"><label>${label}<select id="creator-${poolName}-selected">${selectedOptions(direct, state)}</select></label><button id="creator-${poolName}-random" type="button" class="icon-button" title="Randomly choose from checked ${poolName} options" aria-label="Randomly choose from checked ${poolName} options">↻</button></div><details class="choice-pool-details"><summary>Acceptable ${label.toLowerCase()} options</summary><div class="choice-pool-grid">${options.map((o) => `<label class="choice-pool-option${o.guidedSupported ? "" : " unsupported"}" title="${escapeAttribute(o.blockedReason ?? "")}"><input type="checkbox" data-choice-pool="${poolName}" value="${o.id}" ${state.acceptableIds.includes(o.id as TId) ? "checked" : ""} ${o.guidedSupported ? "" : "disabled"} /><span>${o.label}${o.guidedSupported ? "" : " · later"}</span></label>`).join("")}</div></details></div>`; }
function multiChoiceHtml(label: string, field: string, allowedIds: readonly string[], count: number): string { return `<div class="choice-section"><div class="choice-pick-row"><div><strong>${label}</strong><div class="ability-input-grid">${Array.from({ length: count }, (_, i) => `<label>Choice ${i + 1}<select id="creator-${field}-${i}"></select></label>`).join("")}</div></div><button id="creator-${field}-random" type="button" class="icon-button" title="Randomly choose from checked options" aria-label="Randomly choose ${label}">↻</button></div><details class="choice-pool-details"><summary>Acceptable ${label.toLowerCase()}</summary><div class="choice-pool-grid">${allowedIds.map((id) => `<label class="choice-pool-option"><input type="checkbox" data-multi-pool="${field}" value="${escapeAttribute(id)}" checked /><span>${labelFor(id)}</span></label>`).join("")}</div></details></div>`; }
function selectPoolRow(label: string, field: string, options: readonly { id: string; label: string }[], selected: string): string { return `<div class="choice-section"><div class="choice-pick-row"><label>${label}<select id="creator-${field}">${options.map((o) => `<option value="${escapeAttribute(o.id)}"${o.id === selected ? " selected" : ""}>${o.label}</option>`).join("")}</select></label><button id="creator-${field}-random" type="button" class="icon-button" title="Random from checked" aria-label="Random ${label}">↻</button></div><details class="choice-pool-details"><summary>Acceptable ${label.toLowerCase()} options</summary><div class="choice-pool-grid">${options.map((o) => `<label class="choice-pool-option"><input type="checkbox" data-core-pool="${field}" value="${escapeAttribute(o.id)}" checked /><span>${o.label}</span></label>`).join("")}</div></details></div>`; }
function refreshBackgroundBoosts(select: HTMLSelectElement, id: GuidedDnd5eBackgroundId): void { const bg = DND5E_SRD_521_BACKGROUND_OPTIONS.find((o) => o.id === id)!; const [a,b,c] = bg.abilityScoreIds; select.innerHTML = `<option value="${a}:2,${b}:1">+2 ${abilityLabel(a)}, +1 ${abilityLabel(b)}</option><option value="${a}:2,${c}:1">+2 ${abilityLabel(a)}, +1 ${abilityLabel(c)}</option><option value="${b}:2,${a}:1">+2 ${abilityLabel(b)}, +1 ${abilityLabel(a)}</option><option value="${b}:2,${c}:1">+2 ${abilityLabel(b)}, +1 ${abilityLabel(c)}</option><option value="${c}:2,${a}:1">+2 ${abilityLabel(c)}, +1 ${abilityLabel(a)}</option><option value="${c}:2,${b}:1">+2 ${abilityLabel(c)}, +1 ${abilityLabel(b)}</option><option value="${a}:1,${b}:1,${c}:1">+1 ${abilityLabel(a)}, +1 ${abilityLabel(b)}, +1 ${abilityLabel(c)}</option>`; }
function parseBoostPlan(value:string): Dnd5eAbilityIncreasePlan { const plan:Dnd5eAbilityIncreasePlan={}; for(const part of value.split(",")){const [id,amount]=part.split(":"); if(!id||!amount)continue; const parsed=Number(amount); if(parsed!==1&&parsed!==2) throw new Error("Background ability increases must be +1 or +2."); plan[id as Dnd5eAbilityId]=parsed;} return plan; }
function backgroundEquipmentOptions(id: GuidedDnd5eBackgroundId): string { const descriptions:Record<GuidedDnd5eBackgroundId,string>={acolyte:"Calligrapher's Supplies, prayer book, Holy Symbol, 10 parchment, Robe + 8 GP",criminal:"2 Daggers, Thieves' Tools, Crowbar, 2 Pouches, Traveler's Clothes + 16 GP",sage:"Quarterstaff, Calligrapher's Supplies, history book, 8 parchment, Robe + 8 GP",soldier:"Spear, Shortbow, 20 Arrows, Dice Set, Healer's Kit, Quiver, Traveler's Clothes + 14 GP"}; return `<option value="A">${descriptions[id]}</option><option value="B:50-gp">50 GP</option>`; }
function refreshBackgroundEquipment(select:HTMLSelectElement,id:GuidedDnd5eBackgroundId):void { select.innerHTML=backgroundEquipmentOptions(id); }
function readBackgroundEquipmentChoice(root:HTMLElement):"A"|"B:50-gp" { const value=root.querySelector<HTMLSelectElement>("#creator-background-equipment")?.value; if(value!=="A"&&value!=="B:50-gp") throw new Error("Choose a supported background equipment option."); return value; }
function updatePoolFromCheckboxes<TId extends string>(root:HTMLElement,poolName:string,state:StickyChoicePoolState<TId>,allowedIds:readonly TId[],errorTarget:HTMLElement|null):StickyChoicePoolState<TId>{const checked=[...root.querySelectorAll<HTMLInputElement>(`[data-choice-pool='${poolName}']:checked`)].map((input)=>input.value as TId).filter((id)=>allowedIds.includes(id)); if(!checked.length){showError(errorTarget,new Error("Keep at least one acceptable option checked."),"Invalid choice pool."); return state;} return {acceptableIds:checked,selectedId:checked.includes(state.selectedId)?state.selectedId:checked[0]!};}
function refreshSelect<TId extends string>(select: HTMLSelectElement, state: StickyChoicePoolState<TId>, options: readonly { id: string; label: string }[]): void { select.innerHTML = selectedOptions(options,state); select.value = state.selectedId; }
function selectedOptions<TId extends string>(options: readonly { id:string; label:string }[], state: StickyChoicePoolState<TId>): string { return options.map((option) => `<option value="${escapeAttribute(option.id)}"${option.id === state.selectedId ? " selected" : ""}>${option.label}</option>`).join(""); }
function includeDirectChoice<TId extends string>(state: StickyChoicePoolState<TId>, selectedId: TId): StickyChoicePoolState<TId> { return { selectedId, acceptableIds: state.acceptableIds.includes(selectedId) ? state.acceptableIds : [...state.acceptableIds, selectedId] }; }
function readStickySelect(root: HTMLElement,field:string): string { const v = root.querySelector<HTMLSelectElement>(`#creator-${field}`)?.value; if (!v) throw new Error(`Choose ${field.replaceAll("-"," ")}.`); return v; }
function readMultiSelected(root: HTMLElement,field:string,count:number): string[] { const values = Array.from({length:count},(_,i) => root.querySelector<HTMLSelectElement>(`#creator-${field}-${i}`)?.value ?? ""); if (values.some((v) => !v) || new Set(values).size !== count) throw new Error(`${field.replaceAll("-"," ")} choices must be distinct.`); return values; }
function abilityLabel(id:Dnd5eAbilityId): string { return ({strength:"STR",dexterity:"DEX",constitution:"CON",intelligence:"INT",wisdom:"WIS",charisma:"CHA"} as const)[id]; }
function coreKey(classId:GuidedDnd5eClassId,backgroundId:GuidedDnd5eBackgroundId,speciesId:GuidedDnd5eSpeciesId): string { return `${CORE_STORAGE_PREFIX}.${classId}.${backgroundId}.${speciesId}`; }
function labelFor(id:string): string { const weapon = DND5E_WEAPON_OPTIONS.find((o) => o.id === id); const option = [...DND5E_SKILL_OPTIONS,...DND5E_MONK_TOOL_OPTIONS,...DND5E_SKILLED_PROFICIENCY_OPTIONS,...DND5E_STANDARD_LANGUAGE_OPTIONS,...DND5E_BONUS_LANGUAGE_OPTIONS,...DND5E_ALIGNMENT_OPTIONS,...DND5E_FIGHTING_STYLE_OPTIONS,...DND5E_CLERIC_DIVINE_ORDER_OPTIONS,...DND5E_CLERIC_CANTRIP_OPTIONS,...DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS,...DND5E_DRUID_PRIMAL_ORDER_OPTIONS,...DND5E_DRUID_CANTRIP_OPTIONS,...DND5E_DRUID_PREPARED_LEVEL_ONE_SPELL_OPTIONS,...DND5E_DRAGONBORN_ANCESTRY_OPTIONS,...DND5E_GOLIATH_ANCESTRY_OPTIONS,...DND5E_ELF_LINEAGE_OPTIONS,...DND5E_ELF_KEEN_SENSES_SKILL_OPTIONS,...DND5E_GNOME_LINEAGE_OPTIONS,...DND5E_TIEFLING_LEGACY_OPTIONS,...DND5E_LEVEL_ONE_ELDRITCH_INVOCATION_OPTIONS,...DND5E_PACT_TOME_CANTRIP_OPTIONS,...DND5E_PACT_TOME_LEVEL_ONE_RITUAL_OPTIONS].find((o) => o.id === id); return weapon?.label ?? option?.label ?? id.split(":").at(-1)!.split("-").map((p) => p ? p[0]!.toUpperCase()+p.slice(1) : p).join(" "); }
function requiredElement<T extends HTMLElement>(root:HTMLElement,selector:string,ctor:{new():T}): T { const el=root.querySelector<T>(selector); if (!el || !(el instanceof ctor)) throw new Error(`Character Forge control ${selector} is missing.`); return el; }
function clearError(target:HTMLElement|null):void { if(target) target.textContent=""; }
function showError(target:HTMLElement|null,error:unknown,fallback:string):void { if(target) target.textContent=error instanceof Error?error.message:fallback; }
function escapeAttribute(value:string):string { return value.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
function fillDefaults(preferred: readonly string[], allowed: readonly string[], count: number): string[] { const selected = preferred.filter((id) => allowed.includes(id)); for (const id of allowed) if (selected.length < count && !selected.includes(id)) selected.push(id); return selected.slice(0, count); }
