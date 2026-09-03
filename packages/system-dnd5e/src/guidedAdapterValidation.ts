import type { JsonObject, NativeSystemState, RulesValidationIssue, RulesValidationResult } from "../../character-model/src/index.js";
import { DND5E_POINT_COST_BUDGET, DND5E_POINT_COSTS } from "./abilityGeneration.js";
import { clericCantripCount, DND5E_CLERIC_CANTRIP_OPTIONS, DND5E_CLERIC_DIVINE_ORDER_OPTIONS, DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS } from "./clericCatalog.js";
import { druidCantripCount, DND5E_DRUID_CANTRIP_OPTIONS, DND5E_DRUID_PREPARED_LEVEL_ONE_SPELL_OPTIONS, DND5E_DRUID_PRIMAL_ORDER_OPTIONS } from "./druidCatalog.js";
import { assertGuidedDnd5eCoreChoices } from "./guidedCoreValidation.js";
import { DND5E_DRAGONBORN_ANCESTRY_OPTIONS, DND5E_MUSICAL_INSTRUMENT_OPTIONS, DND5E_SPELLCASTING_ABILITY_OPTIONS, type GuidedDnd5eCoreChoices } from "./guidedChoices.js";
import { abilityModifier, DND5E_ABILITY_IDS, type Dnd5eAbilityId, type Dnd5eSpellcastingAbilityId } from "./nativeCharacter.js";
import { preparedCasterCatalog } from "./preparedCasterCatalog.js";
import { magicInitiateSpellList, type Dnd5eMagicInitiateSpellListId } from "./spellCatalog.js";
import { DND5E_SRD_521_BACKGROUND_OPTIONS, isGuidedDnd5eBackgroundId, isGuidedDnd5eClassId, isGuidedDnd5eSpeciesId, type GuidedDnd5eBackgroundId, type GuidedDnd5eClassId, type GuidedDnd5eSpeciesId } from "./srdCatalog.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";

const HIT_DIE: Record<GuidedDnd5eClassId, number> = { barbarian: 12, bard: 8, cleric: 8, druid: 8, fighter: 10, monk: 8, paladin: 10, ranger: 10, rogue: 8, sorcerer: 6, wizard: 6 };
const BACKGROUND_EXPECTED: Record<GuidedDnd5eBackgroundId, { feat: string; skills: readonly string[]; tool: string }> = {
  acolyte: { feat: "magic-initiate:cleric", skills: ["insight", "religion"], tool: "calligraphers-supplies" },
  criminal: { feat: "alert", skills: ["sleight-of-hand", "stealth"], tool: "thieves-tools" },
  sage: { feat: "magic-initiate:wizard", skills: ["arcana", "history"], tool: "calligraphers-supplies" },
  soldier: { feat: "savage-attacker", skills: ["athletics", "intimidation"], tool: "gaming-set:dice" },
};

export function validateGuidedCoreNativeState(state: NativeSystemState): RulesValidationResult {
  const issues: RulesValidationIssue[] = [];
  if (state.systemId !== "dnd5e") error(issues, "adapter.system-mismatch", "Expected system dnd5e.", "systemId");
  if (state.editionId !== "2024") error(issues, "adapter.edition-mismatch", "Expected edition 2024.", "editionId");
  if (state.rulesVersion !== DND5E_SRD_5_2_1_SOURCE.version) error(issues, "adapter.rules-version", "This adapter supports SRD 5.2.1.", "rulesVersion");
  if (state.schemaVersion !== "dnd5e-character/0.3") error(issues, "adapter.schema-version", "Unsupported D&D native schema version.", "schemaVersion");
  if (!isObject(state.payload)) { error(issues, "dnd5e.payload.object", "D&D native payload must be an object.", "payload"); return { valid: false, issues }; }
  const payload = state.payload;
  if (!readStrings(payload, "rulesSourceIds").includes(DND5E_SRD_5_2_1_SOURCE.id)) error(issues, "dnd5e.rules-source.missing", "Native state must retain SRD 5.2.1 provenance.", "rulesSourceIds");
  const identity = readObject(payload, "identity"); const origin = readObject(payload, "origin"); const classState = readObject(payload, "class");
  const resources = readObject(payload, "resources"); const derived = readObject(payload, "derived"); const abilities = readObject(payload, "abilities");
  if (!identity || !origin || !classState || !resources || !derived || !abilities) { error(issues, "dnd5e.guided.shape", "Guided native state requires identity, origin, class, abilities, resources, and derived state."); return { valid: false, issues }; }
  if (readNumber(identity, "level") !== 1 || readNumber(identity, "experiencePoints") !== 0) error(issues, "dnd5e.level-one.identity", "Guided generation requires Level 1 and 0 XP.", "identity");
  if (readNumber(classState, "proficiencyBonus") !== 2) error(issues, "dnd5e.proficiency.level-one", "Level 1 Proficiency Bonus must be +2.", "class.proficiencyBonus");
  const classId = readString(classState, "classId"); const backgroundId = readString(origin, "backgroundId"); const speciesId = readString(origin, "speciesId");
  if (!classId || !isGuidedDnd5eClassId(classId)) error(issues, "dnd5e.guided.class", "Unsupported guided class.", "class.classId");
  if (!backgroundId || !isGuidedDnd5eBackgroundId(backgroundId)) error(issues, "dnd5e.guided.background", "Unsupported guided background.", "origin.backgroundId");
  if (!speciesId || !isGuidedDnd5eSpeciesId(speciesId)) error(issues, "dnd5e.guided.species", "Unsupported guided species.", "origin.speciesId");
  if (!classId || !backgroundId || !speciesId || !isGuidedDnd5eClassId(classId) || !isGuidedDnd5eBackgroundId(backgroundId) || !isGuidedDnd5eSpeciesId(speciesId)) return { valid: false, issues };

  validateAbilities(abilities, origin, issues);
  validateBackground(origin, backgroundId, issues);
  validateMagicInitiateNativeState(payload, backgroundId, issues);
  const final = readObject(abilities, "final");
  validateClassSpellcastingNativeState(payload, classState, final, classId, issues);
  validateClassTrainingAndResources(classState, resources, final, classId, issues);
  const core = reconstructCoreChoices(identity, origin, classState, payload, classId, backgroundId, speciesId, issues);
  if (core) { try { assertGuidedDnd5eCoreChoices(classId, backgroundId, speciesId, core); } catch (caught) { error(issues, "dnd5e.guided.core-choices", caught instanceof Error ? caught.message : "Invalid guided core choices.", "class"); } }
  if (final) validateDerivedAndSpecies(origin, classState, resources, derived, final, classId, backgroundId, speciesId, issues);
  return { valid: !issues.some((issue) => issue.severity === "error"), issues };
}

function validateAbilities(abilities: JsonObject, origin: JsonObject, issues: RulesValidationIssue[]): void {
  const base = readObject(abilities, "base"); const increases = readObject(abilities, "backgroundIncreases"); const final = readObject(abilities, "final");
  if (!base || !increases || !final) { error(issues, "dnd5e.abilities.shape", "Base, background increases, and final ability scores are required.", "abilities"); return; }
  for (const id of DND5E_ABILITY_IDS) { const b = readNumber(base, id); const inc = readNumber(increases, id); const f = readNumber(final, id); if (b === undefined || inc === undefined || f === undefined || f !== b + inc || !Number.isInteger(f) || f < 1 || f > 20) error(issues, "dnd5e.abilities.value", `Invalid ${id} base/increase/final relationship.`, `abilities.${id}`); }
  const method = readString(abilities, "generationMethod");
  if (method === "standard-array") {
    const scores = DND5E_ABILITY_IDS.map((id) => readNumber(base, id)).filter((v): v is number => v !== undefined).sort((a, b) => b - a);
    if (scores.join(",") !== "15,14,13,12,10,8") error(issues, "dnd5e.standard-array.values", "Standard Array must use 15,14,13,12,10,8 exactly once.", "abilities.base");
  } else if (method === "manual" || method === "random") {
    for (const id of DND5E_ABILITY_IDS) { const score = readNumber(base, id); if (score === undefined || !Number.isInteger(score) || score < 3 || score > 18) error(issues, `dnd5e.${method}.base-range`, `${method} base scores must be 3 through 18.`, `abilities.base.${id}`); }
  } else if (method === "point-cost") {
    let spent = 0; for (const id of DND5E_ABILITY_IDS) { const score = readNumber(base, id); const cost = score === undefined ? undefined : DND5E_POINT_COSTS[score]; if (cost === undefined) error(issues, "dnd5e.point-cost.base-range", "Point Cost scores must be 8 through 15.", `abilities.base.${id}`); else spent += cost; }
    if (spent > DND5E_POINT_COST_BUDGET) error(issues, "dnd5e.point-cost.budget", "Point Cost exceeds the 27-point budget.", "abilities.base");
  } else error(issues, "dnd5e.slice.ability-method", "Unsupported ability-generation method.", "abilities.generationMethod");
  const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((o) => o.id === readString(origin, "backgroundId")); if (!background) return;
  const values = Object.fromEntries(DND5E_ABILITY_IDS.map((id) => [id, readNumber(increases, id) ?? 0])) as Record<Dnd5eAbilityId, number>;
  const nonZero = DND5E_ABILITY_IDS.filter((id) => values[id] !== 0); const pattern = nonZero.map((id) => values[id]).sort((a, b) => b - a);
  const legal = (pattern.length === 2 && pattern[0] === 2 && pattern[1] === 1) || (pattern.length === 3 && pattern.every((v) => v === 1));
  if (!legal || nonZero.some((id) => !background.abilityScoreIds.includes(id))) error(issues, "dnd5e.background.ability-increases", `${background.label} ability increases are invalid.`, "abilities.backgroundIncreases");
}
function validateBackground(origin: JsonObject, backgroundId: GuidedDnd5eBackgroundId, issues: RulesValidationIssue[]): void {
  const expected = BACKGROUND_EXPECTED[backgroundId];
  if (readString(origin, "backgroundOriginFeatId") !== expected.feat) error(issues, "dnd5e.guided.background-feat", "Background Origin feat mismatch.", "origin.backgroundOriginFeatId");
  if (!sameSet(readStrings(origin, "backgroundSkillProficiencies"), expected.skills)) error(issues, "dnd5e.guided.background-skills", "Background skill proficiencies mismatch.", "origin.backgroundSkillProficiencies");
  if (readString(origin, "toolProficiencyId") !== expected.tool) error(issues, "dnd5e.guided.background-tool", "Background tool proficiency mismatch.", "origin.toolProficiencyId");
  if (!new Set(["A", "B:50-gp"]).has(readString(origin, "backgroundEquipmentChoice") ?? "")) error(issues, "dnd5e.guided.background-equipment", "Background equipment choice must be package A or 50 GP.", "origin.backgroundEquipmentChoice");
}
function validateMagicInitiateNativeState(payload: JsonObject, backgroundId: GuidedDnd5eBackgroundId, issues: RulesValidationIssue[]): void {
  const required = magicInitiateListForBackground(backgroundId); const spells = readObject(payload, "spells"); const grants = spells ? readObjects(spells, "grants") : [];
  const magic = grants.filter((g) => readString(g, "sourceId") === "feat:magic-initiate");
  if (!required) { if (magic.length) error(issues, "dnd5e.magic-initiate.unexpected", "This background does not grant Magic Initiate.", "spells.grants"); return; }
  if (magic.length !== 1) { error(issues, "dnd5e.magic-initiate.grant-count", "Magic Initiate background requires exactly one Magic Initiate spell grant.", "spells.grants"); return; }
  const grant = magic[0]!; const list = magicInitiateSpellList(required);
  if (readString(grant, "grantId") !== `origin:magic-initiate:${required}` || readString(grant, "spellListId") !== required) error(issues, "dnd5e.magic-initiate.list", "Magic Initiate spell-list provenance mismatch.", "spells.grants");
  const ability = readString(grant, "spellcastingAbilityId"); if (!ability || !DND5E_SPELLCASTING_ABILITY_OPTIONS.some((o) => o.id === ability)) error(issues, "dnd5e.magic-initiate.ability", "Magic Initiate casting ability must be Intelligence, Wisdom, or Charisma.", "spells.grants.spellcastingAbilityId");
  const cantrips = readStrings(grant, "cantripIds"); if (cantrips.length !== 2 || new Set(cantrips).size !== 2 || cantrips.some((id) => !list.cantrips.some((o) => o.id === id))) error(issues, "dnd5e.magic-initiate.cantrips", "Magic Initiate cantrip selection is invalid.", "spells.grants.cantripIds");
  const free = readString(grant, "freeCastSpellId"); if (!free || !list.levelOneSpells.some((o) => o.id === free) || !sameSet(readStrings(grant, "preparedSpellIds"), [free]) || !sameSet(readStrings(grant, "alwaysPreparedSpellIds"), [free])) error(issues, "dnd5e.magic-initiate.level-one", "Magic Initiate requires one always-prepared Level 1 spell.", "spells.grants.preparedSpellIds");
  if (readNumber(grant, "freeCastMaximum") !== 1 || readNumber(grant, "freeCastCurrent") !== 1 || readString(grant, "freeCastRecharge") !== "long-rest") error(issues, "dnd5e.magic-initiate.free-cast", "Magic Initiate level 1 spell must retain one free cast per Long Rest.", "spells.grants.freeCastMaximum");
}

function validateClassSpellcastingNativeState(payload: JsonObject, classState: JsonObject, final: JsonObject | undefined, classId: GuidedDnd5eClassId, issues: RulesValidationIssue[]): void {
  const spells = readObject(payload, "spells"); const castingEntries = spells ? readObjects(spells, "classCasting") : [];
  if (classId === "cleric") { validateCleric(castingEntries, classState, final, issues); return; }
  if (classId === "druid") { validateDruid(castingEntries, classState, final, issues); return; }
  const catalog = preparedCasterCatalog(classId);
  if (catalog) { validatePreparedCaster(castingEntries, classState, classId, issues); return; }
  if (castingEntries.length) error(issues, "dnd5e.class-spellcasting.unexpected", "This class does not own Level 1 class spellcasting state.", "spells.classCasting");
}
function validateCleric(entries: JsonObject[], classState: JsonObject, final: JsonObject | undefined, issues: RulesValidationIssue[]): void {
  if (entries.length !== 1) { error(issues, "dnd5e.cleric.spellcasting-count", "Level 1 Cleric requires exactly one class spellcasting entry.", "spells.classCasting"); return; }
  const c = entries[0]!; const order = readString(classState, "divineOrderId");
  if (!order || !DND5E_CLERIC_DIVINE_ORDER_OPTIONS.some((o) => o.id === order)) { error(issues, "dnd5e.cleric.divine-order", "Cleric requires Protector or Thaumaturge Divine Order.", "class.divineOrderId"); return; }
  validateCastingIdentity(c, "cleric", "wisdom", issues);
  const cantrips = readStrings(c, "cantripIds"); const count = clericCantripCount(order as "protector" | "thaumaturge");
  if (cantrips.length !== count || new Set(cantrips).size !== count || cantrips.some((id) => !DND5E_CLERIC_CANTRIP_OPTIONS.some((o) => o.id === id))) error(issues, "dnd5e.cleric.cantrips", "Cleric cantrip selection is invalid.", "spells.classCasting.cantripIds");
  validateSpellSelection(c, DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS.map((o) => o.id), 4, [], "cleric", issues);
  validateStandardSlots(c, "cleric", "long-rest-any", issues);
  if (!sameSet(readStrings(c, "focusItemIds"), ["holy-symbol"]) || !sameSet(readStrings(classState, "spellcastingFocusIds"), ["holy-symbol"])) error(issues, "dnd5e.cleric.focus", "Cleric spellcasting must retain Holy Symbol focus capability.", "class.spellcastingFocusIds");
  validateClericOrder(classState, final, order as "protector" | "thaumaturge", issues);
}
function validateDruid(entries: JsonObject[], classState: JsonObject, final: JsonObject | undefined, issues: RulesValidationIssue[]): void {
  if (entries.length !== 1) { error(issues, "dnd5e.druid.spellcasting-count", "Level 1 Druid requires exactly one class spellcasting entry.", "spells.classCasting"); return; }
  const c = entries[0]!; const order = readString(classState, "primalOrderId");
  if (!order || !DND5E_DRUID_PRIMAL_ORDER_OPTIONS.some((o) => o.id === order)) { error(issues, "dnd5e.druid.primal-order", "Druid requires Magician or Warden Primal Order.", "class.primalOrderId"); return; }
  validateCastingIdentity(c, "druid", "wisdom", issues);
  const cantrips = readStrings(c, "cantripIds"); const count = druidCantripCount(order as "magician" | "warden");
  if (cantrips.length !== count || new Set(cantrips).size !== count || cantrips.some((id) => !DND5E_DRUID_CANTRIP_OPTIONS.some((o) => o.id === id))) error(issues, "dnd5e.druid.cantrips", "Druid cantrip selection is invalid.", "spells.classCasting.cantripIds");
  validateSpellSelection(c, DND5E_DRUID_PREPARED_LEVEL_ONE_SPELL_OPTIONS.map((o) => o.id), 4, ["speak-with-animals"], "druid", issues);
  validateStandardSlots(c, "druid", "long-rest-any", issues);
  if (!sameSet(readStrings(c, "focusItemIds"), ["druidic-focus"]) || !sameSet(readStrings(classState, "spellcastingFocusIds"), ["druidic-focus"])) error(issues, "dnd5e.druid.focus", "Druid spellcasting must retain Druidic Focus capability.", "class.spellcastingFocusIds");
  if (!sameSet(readStrings(classState, "toolProficiencyIds"), ["herbalism-kit"])) error(issues, "dnd5e.druid.herbalism", "Druid requires Herbalism Kit proficiency.", "class.toolProficiencyIds");
  if (!sameSet(readStrings(classState, "bonusLanguageIds"), ["druidic"])) error(issues, "dnd5e.druid.druidic", "Druidic must be retained as a class language.", "class.bonusLanguageIds");
  validateDruidOrder(classState, final, order as "magician" | "warden", issues);
}
function validatePreparedCaster(entries: JsonObject[], classState: JsonObject, classId: GuidedDnd5eClassId, issues: RulesValidationIssue[]): void {
  const catalog = preparedCasterCatalog(classId)!;
  if (entries.length !== 1) { error(issues, `dnd5e.${classId}.spellcasting-count`, `Level 1 ${catalog.label} requires exactly one class spellcasting entry.`, "spells.classCasting"); return; }
  const c = entries[0]!; validateCastingIdentity(c, classId, catalog.spellcastingAbilityId, issues);
  const cantrips = readStrings(c, "cantripIds");
  if (cantrips.length !== catalog.cantripCount || new Set(cantrips).size !== catalog.cantripCount || cantrips.some((id) => !catalog.cantripOptions.some((o) => o.id === id))) error(issues, `dnd5e.${classId}.cantrips`, `${catalog.label} cantrip selection is invalid.`, "spells.classCasting.cantripIds");
  validateSpellSelection(c, catalog.preparedSpellOptions.map((o) => o.id), catalog.preparedSpellCount, catalog.alwaysPreparedSpellIds, classId, issues);
  validateStandardSlots(c, classId, catalog.preparationChange, issues);
  const focus = readStrings(classState, "spellcastingFocusIds");
  if (classId === "bard") {
    const tools = readStrings(classState, "toolProficiencyIds");
    if (tools.length !== 3 || tools.some((id) => !DND5E_MUSICAL_INSTRUMENT_OPTIONS.some((o) => o.id === id)) || !sameSet(readStrings(c, "focusItemIds"), tools) || !sameSet(focus, tools)) error(issues, "dnd5e.bard.instruments", "Bard must retain three instrument proficiencies usable as spellcasting foci.", "class.toolProficiencyIds");
  } else if (!sameSet(focus, catalog.focusItemIds) || !sameSet(readStrings(c, "focusItemIds"), catalog.focusItemIds)) error(issues, `dnd5e.${classId}.focus`, `${catalog.label} spellcasting focus capability mismatch.`, "class.spellcastingFocusIds");
  const spellbook = readStrings(c, "spellbookSpellIds");
  if (catalog.spellbookCount) {
    if (spellbook.length !== catalog.spellbookCount || new Set(spellbook).size !== catalog.spellbookCount || spellbook.some((id) => !catalog.preparedSpellOptions.some((o) => o.id === id))) error(issues, "dnd5e.wizard.spellbook", "Level 1 Wizard spellbook requires six distinct Level 1 Wizard spells.", "spells.classCasting.spellbookSpellIds");
    if (readStrings(c, "preparedSpellIds").some((id) => !spellbook.includes(id))) error(issues, "dnd5e.wizard.prepared-subset", "Wizard prepared spells must be contained in the spellbook.", "spells.classCasting.preparedSpellIds");
  } else if (spellbook.length) error(issues, `dnd5e.${classId}.spellbook-unexpected`, "Only Wizard owns spellbook state in this slice.", "spells.classCasting.spellbookSpellIds");
}
function validateCastingIdentity(c: JsonObject, classId: string, ability: string, issues: RulesValidationIssue[]): void {
  if (readString(c, "sourceClassId") !== classId || readString(c, "featureId") !== `${classId}:spellcasting` || readString(c, "spellListId") !== classId) error(issues, `dnd5e.${classId}.spellcasting-source`, `${classId} class spellcasting source/list mismatch.`, "spells.classCasting");
  if (readString(c, "spellcastingAbilityId") !== ability) error(issues, `dnd5e.${classId}.spellcasting-ability`, `${classId} spellcasting ability mismatch.`, "spells.classCasting.spellcastingAbilityId");
}
function validateSpellSelection(c: JsonObject, allowedPrepared: readonly string[], preparedCount: number, always: readonly string[], classId: string, issues: RulesValidationIssue[]): void {
  const prepared = readStrings(c, "preparedSpellIds");
  if (prepared.length !== preparedCount || new Set(prepared).size !== preparedCount || prepared.some((id) => !allowedPrepared.includes(id))) error(issues, `dnd5e.${classId}.prepared-spells`, `Level 1 ${classId} prepared-spell selection is invalid.`, "spells.classCasting.preparedSpellIds");
  if (!sameSet(readStrings(c, "alwaysPreparedSpellIds"), always)) error(issues, `dnd5e.${classId}.always-prepared`, `${classId} always-prepared spell state is invalid.`, "spells.classCasting.alwaysPreparedSpellIds");
}
function validateStandardSlots(c: JsonObject, classId: string, preparation: string, issues: RulesValidationIssue[]): void {
  const slots = readObjects(c, "spellSlots"); const slot = slots[0];
  if (slots.length !== 1 || !slot || readNumber(slot, "level") !== 1 || readNumber(slot, "maximum") !== 2 || readNumber(slot, "current") !== 2 || readString(slot, "recharge") !== "long-rest") error(issues, `dnd5e.${classId}.spell-slots`, `Level 1 ${classId} requires two Level 1 spell slots restored on Long Rest.`, "spells.classCasting.spellSlots");
  if (readString(c, "preparationChange") !== preparation) error(issues, `dnd5e.${classId}.preparation`, `${classId} preparation-change cadence mismatch.`, "spells.classCasting.preparationChange");
}

function validateClassTrainingAndResources(classState: JsonObject, resources: JsonObject, final: JsonObject | undefined, classId: GuidedDnd5eClassId, issues: RulesValidationIssue[]): void {
  const weapons = readStrings(classState, "weaponProficiencyIds"); const armor = readStrings(classState, "armorTrainingIds"); const charisma = final ? readNumber(final, "charisma") : undefined;
  if (classId === "bard") {
    if (!sameSet(weapons, ["simple"]) || !sameSet(armor, ["light"])) error(issues, "dnd5e.bard.training", "Bard weapon/armor training mismatch.", "class");
    if (charisma !== undefined) { const uses = Math.max(1, abilityModifier(charisma)); if (readNumber(resources, "bardicInspirationMaximum") !== uses || readNumber(resources, "bardicInspirationCurrent") !== uses || readNumber(resources, "bardicInspirationDie") !== 6) error(issues, "dnd5e.bard.bardic-inspiration", "Bardic Inspiration resources mismatch.", "resources"); }
  }
  if (classId === "paladin") { if (!sameSet(weapons, ["simple", "martial"]) || !sameSet(armor, ["light", "medium", "heavy", "shield"])) error(issues, "dnd5e.paladin.training", "Paladin weapon/armor training mismatch.", "class"); if (readNumber(resources, "layOnHandsMaximum") !== 5 || readNumber(resources, "layOnHandsCurrent") !== 5) error(issues, "dnd5e.paladin.lay-on-hands", "Level 1 Lay on Hands pool must be 5.", "resources"); }
  if (classId === "ranger") { if (!sameSet(weapons, ["simple", "martial"]) || !sameSet(armor, ["light", "medium", "shield"])) error(issues, "dnd5e.ranger.training", "Ranger weapon/armor training mismatch.", "class"); if (readNumber(resources, "favoredEnemyMaximum") !== 2 || readNumber(resources, "favoredEnemyCurrent") !== 2) error(issues, "dnd5e.ranger.favored-enemy", "Favored Enemy must retain two free Hunter's Mark casts.", "resources"); }
  if (classId === "sorcerer") { if (!sameSet(weapons, ["simple"]) || armor.length) error(issues, "dnd5e.sorcerer.training", "Sorcerer training mismatch.", "class"); if (readNumber(resources, "innateSorceryMaximum") !== 2 || readNumber(resources, "innateSorceryCurrent") !== 2) error(issues, "dnd5e.sorcerer.innate-sorcery", "Innate Sorcery requires two uses.", "resources"); }
  if (classId === "wizard") { if (!sameSet(weapons, ["simple"]) || armor.length) error(issues, "dnd5e.wizard.training", "Wizard training mismatch.", "class"); if (readNumber(resources, "arcaneRecoveryMaximum") !== 1 || readNumber(resources, "arcaneRecoveryCurrent") !== 1 || readNumber(resources, "arcaneRecoverySpellLevelBudget") !== 1) error(issues, "dnd5e.wizard.arcane-recovery", "Level 1 Arcane Recovery state mismatch.", "resources"); }
  if (classId === "fighter" && (readNumber(resources, "secondWindMaximum") !== 2 || readNumber(resources, "secondWindCurrent") !== 2)) error(issues, "dnd5e.fighter.second-wind", "Fighter requires two Second Wind uses.", "resources");
  if (classId === "barbarian" && (readNumber(resources, "rageMaximum") !== 2 || readNumber(resources, "rageCurrent") !== 2 || readNumber(resources, "rageDamageBonus") !== 2)) error(issues, "dnd5e.barbarian.rage", "Barbarian Rage resources mismatch.", "resources");
}
function validateClericOrder(classState: JsonObject, final: JsonObject | undefined, order: "protector" | "thaumaturge", issues: RulesValidationIssue[]): void {
  const weapons = readStrings(classState, "weaponProficiencyIds"); const armor = readStrings(classState, "armorTrainingIds");
  if (order === "protector") { if (!sameSet(weapons, ["simple", "martial"]) || !sameSet(armor, ["light", "medium", "heavy", "shield"])) error(issues, "dnd5e.cleric.protector-training", "Protector training mismatch.", "class"); if (readNumber(classState, "thaumaturgeKnowledgeBonus") !== undefined) error(issues, "dnd5e.cleric.protector-bonus", "Protector must not retain Thaumaturge bonus.", "class.thaumaturgeKnowledgeBonus"); return; }
  if (!sameSet(weapons, ["simple"]) || !sameSet(armor, ["light", "medium", "shield"])) error(issues, "dnd5e.cleric.thaumaturge-training", "Thaumaturge training mismatch.", "class"); const wis = final ? readNumber(final, "wisdom") : undefined; if (wis !== undefined && readNumber(classState, "thaumaturgeKnowledgeBonus") !== Math.max(1, abilityModifier(wis))) error(issues, "dnd5e.cleric.thaumaturge-bonus", "Thaumaturge knowledge bonus mismatch.", "class.thaumaturgeKnowledgeBonus");
}
function validateDruidOrder(classState: JsonObject, final: JsonObject | undefined, order: "magician" | "warden", issues: RulesValidationIssue[]): void {
  const weapons = readStrings(classState, "weaponProficiencyIds"); const armor = readStrings(classState, "armorTrainingIds");
  if (order === "warden") { if (!sameSet(weapons, ["simple", "martial"]) || !sameSet(armor, ["light", "medium", "shield"])) error(issues, "dnd5e.druid.warden-training", "Warden training mismatch.", "class"); if (readNumber(classState, "druidicKnowledgeBonus") !== undefined) error(issues, "dnd5e.druid.warden-bonus", "Warden must not retain Magician bonus.", "class.druidicKnowledgeBonus"); return; }
  if (!sameSet(weapons, ["simple"]) || !sameSet(armor, ["light", "shield"])) error(issues, "dnd5e.druid.magician-training", "Magician training mismatch.", "class"); const wis = final ? readNumber(final, "wisdom") : undefined; if (wis !== undefined && readNumber(classState, "druidicKnowledgeBonus") !== Math.max(1, abilityModifier(wis))) error(issues, "dnd5e.druid.magician-bonus", "Magician knowledge bonus mismatch.", "class.druidicKnowledgeBonus");
}

function reconstructCoreChoices(identity: JsonObject, origin: JsonObject, classState: JsonObject, payload: JsonObject, classId: GuidedDnd5eClassId, backgroundId: GuidedDnd5eBackgroundId, speciesId: GuidedDnd5eSpeciesId, issues: RulesValidationIssue[]): GuidedDnd5eCoreChoices | undefined {
  const languages = readStrings(origin, "languages"); if (languages.length !== 3 || languages[0] !== "common" || !languages[1] || !languages[2]) { error(issues, "dnd5e.guided.origin-languages", "Origin languages must be Common plus two standard languages.", "origin.languages"); return undefined; }
  const alignmentId = readString(identity, "alignment"); const classEquipmentChoice = readString(classState, "classEquipmentChoice"); if (!alignmentId || !classEquipmentChoice) return undefined;
  const choices: GuidedDnd5eCoreChoices = { alignmentId, originLanguageIds: [languages[1], languages[2]], classSkillIds: readStrings(classState, "skillProficiencies"), classEquipmentChoice, weaponMasteryIds: readStrings(classState, "weaponMasteryIds") };
  const casting = findClassCasting(payload, classId);
  if (classId === "cleric") { const order = readString(classState, "divineOrderId"); if ((order === "protector" || order === "thaumaturge") && casting) choices.cleric = { divineOrderId: order, cantripIds: readStrings(casting, "cantripIds"), preparedSpellIds: readStrings(casting, "preparedSpellIds") }; }
  if (classId === "druid") { const order = readString(classState, "primalOrderId"); if ((order === "magician" || order === "warden") && casting) choices.druid = { primalOrderId: order, cantripIds: readStrings(casting, "cantripIds"), preparedSpellIds: readStrings(casting, "preparedSpellIds") }; }
  if (preparedCasterCatalog(classId) && casting) choices.preparedCaster = { classId, cantripIds: readStrings(casting, "cantripIds"), preparedSpellIds: readStrings(casting, "preparedSpellIds"), ...(readStrings(casting, "spellbookSpellIds").length ? { spellbookSpellIds: readStrings(casting, "spellbookSpellIds") } : {}) };
  if (classId === "bard") choices.bardInstrumentIds = readStrings(classState, "toolProficiencyIds");
  const style = readString(classState, "fightingStyleFeatId"); if (style) choices.fightingStyleFeatId = style;
  if (classId === "monk") { const tool = readStrings(classState, "toolProficiencyIds")[0]; if (tool) choices.monkToolProficiencyId = tool; }
  if (classId === "rogue") { choices.expertiseSkillIds = readStrings(classState, "expertiseSkillIds"); const bonus = readStrings(classState, "bonusLanguageIds").find((id) => id !== "thieves-cant"); if (bonus) choices.rogueBonusLanguageId = bonus; }
  const required = magicInitiateListForBackground(backgroundId); if (required) { const spells = readObject(payload, "spells"); const grant = spells ? readObjects(spells, "grants").find((g) => readString(g, "sourceId") === "feat:magic-initiate") : undefined; const ability = grant ? readString(grant, "spellcastingAbilityId") : undefined; const cantrips = grant ? readStrings(grant, "cantripIds") : []; const levelOne = grant ? readString(grant, "freeCastSpellId") : undefined; if (ability && isSpellcastingAbility(ability) && cantrips.length === 2 && cantrips[0] && cantrips[1] && levelOne) choices.magicInitiate = { spellListId: required, spellcastingAbilityId: ability, cantripIds: [cantrips[0], cantrips[1]], levelOneSpellId: levelOne }; }
  if (speciesId === "dragonborn") { const ancestry = readString(origin, "speciesAncestryId"); if (ancestry && DND5E_DRAGONBORN_ANCESTRY_OPTIONS.some((o) => o.id === ancestry)) choices.dragonbornAncestryId = ancestry as GuidedDnd5eCoreChoices["dragonbornAncestryId"]; }
  if (speciesId === "goliath") { const ancestry = readString(origin, "speciesAncestryId"); if (ancestry === "cloud" || ancestry === "fire" || ancestry === "frost" || ancestry === "hill" || ancestry === "stone" || ancestry === "storm") choices.goliathAncestryId = ancestry; }
  if (speciesId === "human") { const size = readString(origin, "size"); const skill = readString(origin, "speciesSkillId"); const feat = readString(origin, "speciesOriginFeatId"); if ((size === "small" || size === "medium") && skill && (feat === "alert" || feat === "savage-attacker" || feat === "skilled")) choices.human = { size, skillId: skill, originFeatId: feat, ...(feat === "skilled" ? { skilledProficiencyIds: readStrings(origin, "speciesOriginFeatProficiencyIds") } : {}) }; }
  return choices;
}
function findClassCasting(payload: JsonObject, classId: string): JsonObject | undefined { const spells = readObject(payload, "spells"); return spells ? readObjects(spells, "classCasting").find((entry) => readString(entry, "sourceClassId") === classId) : undefined; }

function validateDerivedAndSpecies(origin: JsonObject, classState: JsonObject, resources: JsonObject, derived: JsonObject, final: JsonObject, classId: GuidedDnd5eClassId, backgroundId: GuidedDnd5eBackgroundId, speciesId: GuidedDnd5eSpeciesId, issues: RulesValidationIssue[]): void {
  const con = readNumber(final, "constitution"); const dex = readNumber(final, "dexterity"); const wis = readNumber(final, "wisdom"); if (con === undefined || dex === undefined || wis === undefined) return;
  if (readNumber(classState, "hitDie") !== HIT_DIE[classId]) error(issues, "dnd5e.guided.class-core", "Class Hit Die mismatch.", "class.hitDie");
  const hp = HIT_DIE[classId] + abilityModifier(con) + (speciesId === "dwarf" ? 1 : 0); if (readNumber(resources, "hitPointsMaximum") !== hp || readNumber(resources, "hitPointsCurrent") !== hp) error(issues, "dnd5e.guided.level-one-hp", "Level 1 Hit Points mismatch.", "resources");
  const equipment = readString(classState, "classEquipmentChoice") ?? ""; const style = readString(classState, "fightingStyleFeatId"); const d = abilityModifier(dex);
  const expectedAc = classId === "barbarian" ? 10 + d + abilityModifier(con) : classId === "bard" ? (equipment === "A" ? 11 + d : 10 + d) : classId === "cleric" ? (equipment === "A" ? 15 + Math.min(2, d) : 10 + d) : classId === "druid" ? (equipment === "A" ? 13 + d : 10 + d) : classId === "fighter" ? (equipment === "A" ? 16 + (style === "defense" ? 1 : 0) : equipment === "B" ? 12 + d + (style === "defense" ? 1 : 0) : 10 + d) : classId === "monk" ? 10 + d + abilityModifier(wis) : classId === "paladin" ? (equipment === "A" ? 18 : 10 + d) : classId === "ranger" ? (equipment === "A" ? 12 + d : 10 + d) : classId === "rogue" ? (equipment === "A" ? 11 : 10) + d : 10 + d;
  if (readNumber(derived, "armorClass") !== expectedAc) error(issues, "dnd5e.guided.armor-class", "Armor Class does not match equipment and abilities.", "derived.armorClass");
  const alert = BACKGROUND_EXPECTED[backgroundId].feat === "alert" || readString(origin, "speciesOriginFeatId") === "alert"; if (readNumber(derived, "initiativeModifier") !== d + (alert ? 2 : 0)) error(issues, "dnd5e.guided.initiative", "Initiative mismatch.", "derived.initiativeModifier");
  const skills = new Set([...readStrings(classState, "skillProficiencies"), ...readStrings(origin, "backgroundSkillProficiencies"), ...(readString(origin, "speciesSkillId") ? [readString(origin, "speciesSkillId")!] : []), ...readStrings(origin, "speciesOriginFeatProficiencyIds")]); const passive = 10 + abilityModifier(wis) + (skills.has("perception") ? 2 : 0); if (readNumber(derived, "passivePerception") !== passive) error(issues, "dnd5e.guided.passive-perception", "Passive Perception mismatch.", "derived.passivePerception");
  if (speciesId === "dragonborn") { const ancestry = readString(origin, "speciesAncestryId"); const expected = DND5E_DRAGONBORN_ANCESTRY_OPTIONS.find((o) => o.id === ancestry); if (!expected || readString(origin, "speciesDamageType") !== expected.damageType) error(issues, "dnd5e.dragonborn.ancestry", "Dragonborn ancestry/damage mismatch.", "origin.speciesAncestryId"); if (readNumber(resources, "breathWeaponMaximum") !== 2 || readNumber(resources, "breathWeaponCurrent") !== 2) error(issues, "dnd5e.dragonborn.breath-weapon", "Dragonborn Breath Weapon uses mismatch.", "resources"); }
  if (speciesId === "dwarf" && (readNumber(resources, "stonecunningMaximum") !== 2 || readNumber(resources, "stonecunningCurrent") !== 2)) error(issues, "dnd5e.dwarf.stonecunning", "Dwarf Stonecunning resources mismatch.", "resources");
  if (speciesId === "goliath" && (readNumber(resources, "giantAncestryMaximum") !== 2 || readNumber(resources, "giantAncestryCurrent") !== 2 || readNumber(origin, "speedFeet") !== 35)) error(issues, "dnd5e.goliath.giant-ancestry", "Goliath ancestry state mismatch.", "resources");
  if (speciesId === "orc" && (readNumber(resources, "adrenalineRushMaximum") !== 2 || readNumber(resources, "relentlessEnduranceMaximum") !== 1)) error(issues, "dnd5e.orc.resources", "Orc resources mismatch.", "resources");
}

function magicInitiateListForBackground(backgroundId: GuidedDnd5eBackgroundId): Dnd5eMagicInitiateSpellListId | undefined { return backgroundId === "acolyte" ? "cleric" : backgroundId === "sage" ? "wizard" : undefined; }
function isSpellcastingAbility(value: string): value is Dnd5eSpellcastingAbilityId { return value === "intelligence" || value === "wisdom" || value === "charisma"; }
function isObject(value: unknown): value is JsonObject { return typeof value === "object" && value !== null && !Array.isArray(value); }
function readObject(object: JsonObject, key: string): JsonObject | undefined { const value = object[key]; return isObject(value) ? value : undefined; }
function readObjects(object: JsonObject, key: string): JsonObject[] { const value = object[key]; return Array.isArray(value) ? value.filter(isObject) : []; }
function readString(object: JsonObject, key: string): string | undefined { const value = object[key]; return typeof value === "string" ? value : undefined; }
function readNumber(object: JsonObject, key: string): number | undefined { const value = object[key]; return typeof value === "number" ? value : undefined; }
function readStrings(object: JsonObject, key: string): string[] { const value = object[key]; return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : []; }
function sameSet(left: readonly string[], right: readonly string[]): boolean { return left.length === right.length && left.every((value) => right.includes(value)); }
function error(issues: RulesValidationIssue[], code: string, message: string, path?: string): void { issues.push({ code, message, severity: "error", ...(path ? { path } : {}) }); }
