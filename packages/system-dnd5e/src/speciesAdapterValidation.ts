import type { JsonObject, NativeSystemState, RulesValidationIssue, RulesValidationResult } from "../../character-model/src/index.js";
import { preparedCasterCatalog } from "./preparedCasterCatalog.js";
import {
  DND5E_ELF_KEEN_SENSES_SKILL_OPTIONS,
  DND5E_ELF_LINEAGE_OPTIONS,
  DND5E_GNOME_LINEAGE_OPTIONS,
  DND5E_TIEFLING_LEGACY_OPTIONS,
  elfLineage,
  gnomeLineage,
  tieflingLegacy,
} from "./speciesCatalog.js";
import { isGuidedDnd5eSpeciesId } from "./srdCatalog.js";

export function validateGuidedDnd5eLineageSpeciesNativeState(state: NativeSystemState): RulesValidationResult {
  const issues: RulesValidationIssue[] = [];
  if (state.schemaVersion !== "dnd5e-character/0.3" || !isObject(state.payload)) return { valid: true, issues };
  const payload = state.payload;
  const origin = readObject(payload, "origin");
  const resources = readObject(payload, "resources");
  if (!origin || !resources) return { valid: true, issues };
  const speciesId = readString(origin, "speciesId");
  if (!speciesId || !isGuidedDnd5eSpeciesId(speciesId)) return { valid: true, issues };
  const spells = readObject(payload, "spells");
  const grants = spells ? readObjects(spells, "speciesGrants") : [];

  if (speciesId !== "elf" && speciesId !== "gnome" && speciesId !== "tiefling") {
    if (grants.length) error(issues, "dnd5e.species-spells.unexpected", "This species does not use the lineage spell-grant seam.", "spells.speciesGrants");
    return result(issues);
  }

  if (grants.length !== 1) {
    error(issues, "dnd5e.species-spells.grant-count", `${speciesId} requires exactly one species spell-grant entry.`, "spells.speciesGrants");
    return result(issues);
  }
  const grant = grants[0]!;
  if (readString(grant, "sourceSpeciesId") !== speciesId) error(issues, "dnd5e.species-spells.source", "Species spell-grant source does not match the character species.", "spells.speciesGrants.sourceSpeciesId");
  const ability = readString(grant, "spellcastingAbilityId");
  if (ability !== "intelligence" && ability !== "wisdom" && ability !== "charisma") error(issues, "dnd5e.species-spells.ability", "Species spellcasting ability must be Intelligence, Wisdom, or Charisma.", "spells.speciesGrants.spellcastingAbilityId");

  if (speciesId === "elf") validateElf(payload, origin, grant, issues);
  if (speciesId === "gnome") validateGnome(payload, origin, resources, grant, issues);
  if (speciesId === "tiefling") validateTiefling(payload, origin, grant, issues);
  return result(issues);
}

function validateElf(payload: JsonObject, origin: JsonObject, grant: JsonObject, issues: RulesValidationIssue[]): void {
  const lineageId = readString(origin, "speciesAncestryId");
  const lineage = lineageId && DND5E_ELF_LINEAGE_OPTIONS.some((option) => option.id === lineageId) ? elfLineage(lineageId as "drow" | "high" | "wood") : undefined;
  if (!lineage) { error(issues, "dnd5e.elf.lineage", "Elf requires a legal Elven Lineage.", "origin.speciesAncestryId"); return; }
  if (readString(origin, "size") !== "medium" || readNumber(origin, "speedFeet") !== lineage.speedFeet) error(issues, "dnd5e.elf.core", "Elf size and Speed must match its lineage.", "origin");
  if (readNumber(origin, "speciesDarkvisionFeet") !== lineage.darkvisionFeet) error(issues, "dnd5e.elf.darkvision", "Elf Darkvision range must match its lineage.", "origin.speciesDarkvisionFeet");
  const keen = readString(origin, "speciesSkillId");
  if (!keen || !DND5E_ELF_KEEN_SENSES_SKILL_OPTIONS.some((option) => option.id === keen)) error(issues, "dnd5e.elf.keen-senses", "Elf Keen Senses must grant Insight, Perception, or Survival.", "origin.speciesSkillId");
  if (readString(grant, "featureId") !== "elf:elven-lineage" || readString(grant, "lineageId") !== lineage.id) error(issues, "dnd5e.elf.spell-source", "Elf spell grant must retain its Elven Lineage source.", "spells.speciesGrants");
  const cantrips = readStrings(grant, "cantripIds");
  if (lineage.id === "high") {
    const wizard = preparedCasterCatalog("wizard");
    const legal = wizard?.cantripOptions.map((option) => option.id) ?? [];
    if (cantrips.length !== 1 || !legal.includes(cantrips[0]!)) error(issues, "dnd5e.elf.high-cantrip", "High Elf requires one Wizard cantrip.", "spells.speciesGrants.cantripIds");
    if (readString(grant, "cantripReplacementListId") !== "wizard" || readString(grant, "cantripReplacementRecharge") !== "long-rest") error(issues, "dnd5e.elf.high-replacement", "High Elf cantrip replacement must retain Wizard-list and Long-Rest semantics.", "spells.speciesGrants");
  } else {
    if (!sameStrings(cantrips, [lineage.initialCantripId])) error(issues, "dnd5e.elf.cantrip", "Elf lineage cantrip does not match the selected lineage.", "spells.speciesGrants.cantripIds");
    if (readString(grant, "cantripReplacementListId") || readString(grant, "cantripReplacementRecharge")) error(issues, "dnd5e.elf.replacement-unexpected", "Only High Elf has a replaceable lineage cantrip.", "spells.speciesGrants");
  }
  if (readStrings(grant, "preparedSpellIds").length || readStrings(grant, "alwaysPreparedSpellIds").length || readObjects(grant, "freeCasts").length) error(issues, "dnd5e.elf.level-one-spells", "Elf level-gated lineage spells are not active at Level 1.", "spells.speciesGrants");
  validateFutureGrants(grant, lineage.levelGatedSpells, "elf", issues);
  requireFeatures(payload, ["elf:darkvision", "elf:elven-lineage", `elf:elven-lineage:${lineage.id}`, "elf:fey-ancestry", "elf:keen-senses", "elf:trance"], "dnd5e.elf.features", issues);
}

function validateGnome(payload: JsonObject, origin: JsonObject, resources: JsonObject, grant: JsonObject, issues: RulesValidationIssue[]): void {
  const lineageId = readString(origin, "speciesAncestryId");
  const lineage = lineageId && DND5E_GNOME_LINEAGE_OPTIONS.some((option) => option.id === lineageId) ? gnomeLineage(lineageId as "forest" | "rock") : undefined;
  if (!lineage) { error(issues, "dnd5e.gnome.lineage", "Gnome requires a legal Gnomish Lineage.", "origin.speciesAncestryId"); return; }
  if (readString(origin, "size") !== "small" || readNumber(origin, "speedFeet") !== 30 || readNumber(origin, "speciesDarkvisionFeet") !== 60) error(issues, "dnd5e.gnome.core", "Gnome must be Small with Speed 30 and Darkvision 60 feet.", "origin");
  if (readString(grant, "featureId") !== "gnome:gnomish-lineage" || readString(grant, "lineageId") !== lineage.id) error(issues, "dnd5e.gnome.spell-source", "Gnome spell grant must retain its Gnomish Lineage source.", "spells.speciesGrants");
  if (!sameStrings(readStrings(grant, "cantripIds"), lineage.cantripIds)) error(issues, "dnd5e.gnome.cantrips", "Gnome lineage cantrips do not match the selected lineage.", "spells.speciesGrants.cantripIds");
  if (!sameStrings(readStrings(grant, "preparedSpellIds"), lineage.alwaysPreparedSpellIds) || !sameStrings(readStrings(grant, "alwaysPreparedSpellIds"), lineage.alwaysPreparedSpellIds)) error(issues, "dnd5e.gnome.prepared", "Gnome lineage prepared spells do not match the selected lineage.", "spells.speciesGrants.preparedSpellIds");
  if (readObjects(grant, "futureSpellGrants").length) error(issues, "dnd5e.gnome.future-spells", "Gnome lineages have no level-gated future spell grants in this SRD slice.", "spells.speciesGrants.futureSpellGrants");
  const freeCasts = readObjects(grant, "freeCasts");
  if (lineage.id === "forest") {
    const free = freeCasts[0];
    if (freeCasts.length !== 1 || !free || readString(free, "spellId") !== "speak-with-animals" || readNumber(free, "maximum") !== 2 || readNumber(free, "current") !== 2 || readString(free, "recharge") !== "long-rest") error(issues, "dnd5e.gnome.forest-free-casts", "Forest Gnome must retain two free Speak with Animals casts per Long Rest at Level 1.", "spells.speciesGrants.freeCasts");
    if (readNumber(resources, "rockGnomeClockworkDevicesMaximum") !== undefined || readNumber(resources, "rockGnomeClockworkDevicesCurrent") !== undefined) error(issues, "dnd5e.gnome.rock-resource-unexpected", "Forest Gnome must not retain Rock Gnome clockwork-device state.", "resources");
  } else {
    if (freeCasts.length) error(issues, "dnd5e.gnome.rock-free-casts", "Rock Gnome has no free spell-cast resource in its lineage state.", "spells.speciesGrants.freeCasts");
    if (readNumber(resources, "rockGnomeClockworkDevicesMaximum") !== 3 || readNumber(resources, "rockGnomeClockworkDevicesCurrent") !== 0) error(issues, "dnd5e.gnome.clockwork", "Rock Gnome must retain a three-device clockwork capacity and zero active devices at generation.", "resources");
  }
  requireFeatures(payload, ["gnome:darkvision", "gnome:gnomish-cunning", "gnome:gnomish-lineage", `gnome:gnomish-lineage:${lineage.id}`], "dnd5e.gnome.features", issues);
}

function validateTiefling(payload: JsonObject, origin: JsonObject, grant: JsonObject, issues: RulesValidationIssue[]): void {
  const legacyId = readString(origin, "speciesAncestryId");
  const legacy = legacyId && DND5E_TIEFLING_LEGACY_OPTIONS.some((option) => option.id === legacyId) ? tieflingLegacy(legacyId as "abyssal" | "chthonic" | "infernal") : undefined;
  if (!legacy) { error(issues, "dnd5e.tiefling.legacy", "Tiefling requires a legal Fiendish Legacy.", "origin.speciesAncestryId"); return; }
  const size = readString(origin, "size");
  if ((size !== "small" && size !== "medium") || readNumber(origin, "speedFeet") !== 30 || readNumber(origin, "speciesDarkvisionFeet") !== 60) error(issues, "dnd5e.tiefling.core", "Tiefling must be Small or Medium with Speed 30 and Darkvision 60 feet.", "origin");
  if (readString(origin, "speciesResistanceDamageType") !== legacy.resistanceDamageType) error(issues, "dnd5e.tiefling.resistance", "Tiefling resistance must match its Fiendish Legacy.", "origin.speciesResistanceDamageType");
  if (readString(grant, "featureId") !== "tiefling:fiendish-legacy" || readString(grant, "lineageId") !== legacy.id) error(issues, "dnd5e.tiefling.spell-source", "Tiefling spell grant must retain its Fiendish Legacy source.", "spells.speciesGrants");
  if (!sameStrings(readStrings(grant, "cantripIds"), [legacy.legacyCantripId, "thaumaturgy"])) error(issues, "dnd5e.tiefling.cantrips", "Tiefling must retain its legacy cantrip and Thaumaturgy.", "spells.speciesGrants.cantripIds");
  if (readStrings(grant, "preparedSpellIds").length || readStrings(grant, "alwaysPreparedSpellIds").length || readObjects(grant, "freeCasts").length) error(issues, "dnd5e.tiefling.level-one-spells", "Tiefling level-gated legacy spells are not active at Level 1.", "spells.speciesGrants");
  validateFutureGrants(grant, legacy.levelGatedSpells, "tiefling", issues);
  requireFeatures(payload, ["tiefling:darkvision", "tiefling:fiendish-legacy", `tiefling:fiendish-legacy:${legacy.id}`, `tiefling:resistance:${legacy.resistanceDamageType}`, "tiefling:otherworldly-presence"], "dnd5e.tiefling.features", issues);
}

function validateFutureGrants(grant: JsonObject, expected: readonly { characterLevel: number; spellId: string }[], label: string, issues: RulesValidationIssue[]): void {
  const future = readObjects(grant, "futureSpellGrants");
  if (future.length !== expected.length) { error(issues, `dnd5e.${label}.future-spells`, `${label} future spell grants are incomplete.`, "spells.speciesGrants.futureSpellGrants"); return; }
  for (const source of expected) {
    const match = future.find((entry) => readNumber(entry, "characterLevel") === source.characterLevel && readString(entry, "spellId") === source.spellId);
    if (!match || readBoolean(match, "alwaysPrepared") !== true || readNumber(match, "freeCastMaximum") !== 1 || readString(match, "freeCastRecharge") !== "long-rest") error(issues, `dnd5e.${label}.future-spells`, `${label} future spell grant ${source.spellId} has invalid preparation/free-cast semantics.`, "spells.speciesGrants.futureSpellGrants");
  }
}

function requireFeatures(payload: JsonObject, required: readonly string[], code: string, issues: RulesValidationIssue[]): void {
  const features = readStrings(payload, "featureIds");
  if (required.some((id) => !features.includes(id))) error(issues, code, "Species feature identifiers are incomplete.", "featureIds");
}
function result(issues: RulesValidationIssue[]): RulesValidationResult { return { valid: !issues.some((issue) => issue.severity === "error"), issues }; }
function isObject(value: unknown): value is JsonObject { return typeof value === "object" && value !== null && !Array.isArray(value); }
function readObject(object: JsonObject, key: string): JsonObject | undefined { const value = object[key]; return isObject(value) ? value : undefined; }
function readObjects(object: JsonObject, key: string): JsonObject[] { const value = object[key]; return Array.isArray(value) ? value.filter(isObject) : []; }
function readString(object: JsonObject, key: string): string | undefined { const value = object[key]; return typeof value === "string" ? value : undefined; }
function readNumber(object: JsonObject, key: string): number | undefined { const value = object[key]; return typeof value === "number" ? value : undefined; }
function readBoolean(object: JsonObject, key: string): boolean | undefined { const value = object[key]; return typeof value === "boolean" ? value : undefined; }
function readStrings(object: JsonObject, key: string): string[] { const value = object[key]; return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : []; }
function sameStrings(left: readonly string[], right: readonly string[]): boolean { return left.length === right.length && left.every((value, index) => value === right[index]); }
function error(issues: RulesValidationIssue[], code: string, message: string, path?: string): void { issues.push({ code, message, severity: "error", ...(path ? { path } : {}) }); }
