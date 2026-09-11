import type { CharacterDocument, NativeSystemState } from "../../character-model/src/index.js";
import type {
  CharacterSheetDescriptor,
  CharacterSheetDetailItem,
  CharacterSheetRatingItem,
  CharacterSheetSection,
} from "../../character-sheet/src/index.js";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { DND5E_SKILL_OPTIONS } from "./guidedChoices.js";
import {
  DND5E_ABILITY_IDS,
  abilityModifier,
  type Dnd5eAbilityId,
  type Dnd5eNativeCharacter,
} from "./nativeCharacter.js";

const SKILL_ABILITY: Record<string, Dnd5eAbilityId> = {
  acrobatics: "dexterity",
  "animal-handling": "wisdom",
  arcana: "intelligence",
  athletics: "strength",
  deception: "charisma",
  history: "intelligence",
  insight: "wisdom",
  intimidation: "charisma",
  investigation: "intelligence",
  medicine: "wisdom",
  nature: "intelligence",
  perception: "wisdom",
  performance: "charisma",
  persuasion: "charisma",
  religion: "intelligence",
  "sleight-of-hand": "dexterity",
  stealth: "dexterity",
  survival: "wisdom",
};

export function buildDnd5eCharacterSheet(character: CharacterDocument): CharacterSheetDescriptor {
  const nativeState = primaryDndState(character);
  const validation = dnd5eSrd521Adapter.validateNativeState(nativeState);
  if (!validation.valid) {
    const message = validation.issues.map((issue) => issue.message).join(" ") || "D&D native state validation failed.";
    throw new Error(message);
  }

  const payload = nativeState.payload as Dnd5eNativeCharacter;
  const abilities = payload.abilities.final;
  const classLabel = titleId(payload.class.classId);
  const speciesLabel = titleId(payload.origin.speciesId);
  const backgroundLabel = titleId(payload.origin.backgroundId);
  const proficiencyBonus = payload.class.proficiencyBonus;

  const pageOneSections: CharacterSheetSection[] = [
    {
      id: "identity",
      title: "Identity",
      role: "identity",
      priority: 100,
      kind: "details",
      preferredColumns: 3,
      items: [
        { label: "Class", value: `${classLabel} ${payload.class.level}` },
        { label: "Species", value: speciesLabel },
        { label: "Background", value: backgroundLabel },
        { label: "Alignment", value: titleId(payload.identity.alignment) },
        { label: "Size", value: titleId(payload.origin.size) },
        { label: "Experience", value: String(payload.identity.experiencePoints) },
      ],
    },
    {
      id: "abilities",
      title: "Abilities",
      role: "primary_stats",
      priority: 95,
      kind: "stats",
      preferredColumns: 3,
      items: DND5E_ABILITY_IDS.map((id) => ({
        label: abilityAbbreviation(id),
        value: String(abilities[id]),
        help: signed(abilityModifier(abilities[id])),
      })),
    },
    {
      id: "resources",
      title: "Defenses and Resources",
      role: "resources",
      priority: 92,
      kind: "stats",
      preferredColumns: 4,
      items: [
        { label: "HP", value: `${payload.resources.hitPointsCurrent} / ${payload.resources.hitPointsMaximum}` },
        { label: "AC", value: String(payload.derived.armorClass) },
        { label: "Initiative", value: signed(payload.derived.initiativeModifier) },
        { label: "Passive Perception", value: String(payload.derived.passivePerception) },
        { label: "Speed", value: `${payload.origin.speedFeet} ft` },
        { label: "Proficiency", value: signed(proficiencyBonus) },
        { label: "Hit Dice", value: `${payload.resources.hitDiceTotal - payload.resources.hitDiceSpent} / ${payload.resources.hitDiceTotal} d${payload.class.hitDie}` },
        ...classResourceStats(payload),
      ],
    },
    {
      id: "saving-throws",
      title: "Saving Throws",
      role: "actions",
      priority: 88,
      kind: "ratings",
      preferredColumns: 2,
      items: DND5E_ABILITY_IDS.map((id) => {
        const proficient = payload.class.savingThrowProficiencies.includes(id);
        const bonus = abilityModifier(abilities[id]) + (proficient ? proficiencyBonus : 0);
        return {
          label: titleId(id),
          value: signed(bonus),
          ...(proficient ? { detail: "Proficient" } : {}),
        };
      }),
    },
    {
      id: "skills",
      title: "Skills",
      role: "actions",
      priority: 85,
      kind: "ratings",
      preferredColumns: 2,
      allowSplit: true,
      items: skillRatings(payload),
    },
  ];

  const pageTwoSections: CharacterSheetSection[] = [
    {
      id: "equipment",
      title: "Equipment and Currency",
      role: "equipment",
      priority: 95,
      kind: "list",
      preferredColumns: 2,
      items: [
        ...payload.equipment.map((item) => ({
          label: titleId(item.itemId),
          ...(item.quantity !== 1 ? { detail: `Quantity ${item.quantity}` } : {}),
        })),
        { label: "Currency", detail: `${payload.currencyGp} GP` },
      ],
    },
    {
      id: "proficiencies",
      title: "Languages and Proficiencies",
      role: "abilities",
      priority: 85,
      kind: "details",
      preferredColumns: 2,
      items: proficiencyDetails(payload),
    },
  ];

  const features = featureItems(payload);
  if (features.length) {
    pageTwoSections.push({
      id: "features",
      title: "Features",
      role: "abilities",
      priority: 80,
      kind: "list",
      preferredColumns: 2,
      items: features,
    });
  }

  const spells = spellDetails(payload);
  if (spells.length) {
    pageTwoSections.push({
      id: "spells",
      title: "Spellcasting",
      role: "abilities",
      priority: 78,
      kind: "details",
      items: spells,
    });
  }

  return {
    title: character.displayName,
    subtitle: `${speciesLabel} | ${backgroundLabel} | ${classLabel} ${payload.class.level}`,
    footerNote: "D&D 5E 2024 | SRD 5.2.1",
    sourceNativeStateId: nativeState.id,
    sourceSchemaVersion: nativeState.schemaVersion,
    pages: [
      {
        id: "play",
        number: 1,
        title: "At the table",
        mediaSlots: [
          { id: "portrait", label: "Portrait", kind: "portrait" },
          { id: "token", label: "VTT Token", kind: "token" },
        ],
        sections: pageOneSections,
      },
      { id: "depth", number: 2, title: "Features and gear", sections: pageTwoSections },
    ],
  };
}

function primaryDndState(character: CharacterDocument): NativeSystemState {
  const nativeState = character.nativeStates.find((state) => state.id === character.primaryNativeStateId);
  if (!nativeState || nativeState.systemId !== "dnd5e" || nativeState.editionId !== "2024") {
    throw new Error("Character document does not contain a D&D 5E 2024 primary native state.");
  }
  return nativeState;
}

function skillRatings(payload: Dnd5eNativeCharacter): CharacterSheetRatingItem[] {
  const abilities = payload.abilities.final;
  const proficiencyBonus = payload.class.proficiencyBonus;
  const proficient = new Set<string>([
    ...(payload.origin.backgroundSkillProficiencies ?? []),
    ...payload.class.skillProficiencies,
    ...(payload.origin.speciesSkillId ? [payload.origin.speciesSkillId] : []),
    ...(payload.origin.speciesOriginFeatProficiencyIds ?? []).filter((id) => Boolean(SKILL_ABILITY[id])),
  ]);
  const expertise = new Set(payload.class.expertiseSkillIds ?? []);

  return DND5E_SKILL_OPTIONS.map((option) => {
    const abilityId = SKILL_ABILITY[option.id];
    if (!abilityId) throw new Error(`Missing ability mapping for D&D skill ${option.id}.`);
    const multiplier = expertise.has(option.id) ? 2 : proficient.has(option.id) ? 1 : 0;
    const bonus = abilityModifier(abilities[abilityId]) + (proficiencyBonus * multiplier);
    return {
      label: option.label,
      value: signed(bonus),
      ...(expertise.has(option.id)
        ? { detail: "Expertise" }
        : proficient.has(option.id)
          ? { detail: "Proficient" }
          : {}),
    };
  });
}

function classResourceStats(payload: Dnd5eNativeCharacter): Array<{ label: string; value: string }> {
  const resources = payload.resources;
  const items: Array<{ label: string; value: string }> = [];
  pushResource(items, "Second Wind", resources.secondWindCurrent, resources.secondWindMaximum);
  pushResource(items, "Rage", resources.rageCurrent, resources.rageMaximum, resources.rageDamageBonus !== undefined ? ` | +${resources.rageDamageBonus} damage` : undefined);
  pushResource(items, "Bardic Inspiration", resources.bardicInspirationCurrent, resources.bardicInspirationMaximum, resources.bardicInspirationDie !== undefined ? ` | d${resources.bardicInspirationDie}` : undefined);
  pushResource(items, "Lay on Hands", resources.layOnHandsCurrent, resources.layOnHandsMaximum, " HP pool");
  pushResource(items, "Favored Enemy", resources.favoredEnemyCurrent, resources.favoredEnemyMaximum);
  pushResource(items, "Innate Sorcery", resources.innateSorceryCurrent, resources.innateSorceryMaximum);
  pushResource(items, "Arcane Recovery", resources.arcaneRecoveryCurrent, resources.arcaneRecoveryMaximum, resources.arcaneRecoverySpellLevelBudget !== undefined ? ` | ${resources.arcaneRecoverySpellLevelBudget} spell level` : undefined);
  pushResource(items, "Stonecunning", resources.stonecunningCurrent, resources.stonecunningMaximum);
  pushResource(items, "Adrenaline Rush", resources.adrenalineRushCurrent, resources.adrenalineRushMaximum);
  pushResource(items, "Relentless Endurance", resources.relentlessEnduranceCurrent, resources.relentlessEnduranceMaximum);
  pushResource(items, "Breath Weapon", resources.breathWeaponCurrent, resources.breathWeaponMaximum);
  pushResource(items, "Giant Ancestry", resources.giantAncestryCurrent, resources.giantAncestryMaximum);
  pushResource(items, "Clockwork Devices", resources.rockGnomeClockworkDevicesCurrent, resources.rockGnomeClockworkDevicesMaximum);
  return items;
}

function pushResource(
  items: Array<{ label: string; value: string }>,
  label: string,
  current: number | undefined,
  maximum: number | undefined,
  suffix = "",
): void {
  if (current === undefined || maximum === undefined) return;
  items.push({ label, value: `${current} / ${maximum}${suffix}` });
}

function proficiencyDetails(payload: Dnd5eNativeCharacter): CharacterSheetDetailItem[] {
  const items: CharacterSheetDetailItem[] = [
    { label: "Languages", value: joinIds([...payload.origin.languages, ...(payload.class.bonusLanguageIds ?? [])]) || "None" },
    { label: "Tools", value: joinIds([payload.origin.toolProficiencyId, ...(payload.class.toolProficiencyIds ?? [])]) || "None" },
  ];
  if (payload.class.weaponProficiencyIds?.length) items.push({ label: "Weapon training", value: joinIds(payload.class.weaponProficiencyIds) });
  if (payload.class.armorTrainingIds?.length) items.push({ label: "Armor training", value: joinIds(payload.class.armorTrainingIds) });
  if (payload.class.weaponMasteryIds.length) items.push({ label: "Weapon mastery", value: joinIds(payload.class.weaponMasteryIds) });
  if (payload.class.expertiseSkillIds?.length) items.push({ label: "Expertise", value: joinIds(payload.class.expertiseSkillIds) });
  return items;
}

function featureItems(payload: Dnd5eNativeCharacter): Array<{ label: string; detail?: string }> {
  const featureIds = new Set<string>(payload.featureIds);
  featureIds.add(payload.origin.backgroundOriginFeatId);
  if (payload.origin.speciesOriginFeatId) featureIds.add(payload.origin.speciesOriginFeatId);
  if (payload.class.fightingStyleFeatId) featureIds.add(`fighting-style:${payload.class.fightingStyleFeatId}`);
  if (payload.class.divineOrderId) featureIds.add(`divine-order:${payload.class.divineOrderId}`);
  if (payload.class.primalOrderId) featureIds.add(`primal-order:${payload.class.primalOrderId}`);
  for (const invocation of payload.class.eldritchInvocations ?? []) featureIds.add(`eldritch-invocation:${invocation.invocationId}`);
  return [...featureIds].map((id) => ({ label: titleId(id) }));
}

function spellDetails(payload: Dnd5eNativeCharacter): CharacterSheetDetailItem[] {
  const items: CharacterSheetDetailItem[] = [];
  for (const casting of payload.spells?.classCasting ?? []) {
    const source = titleId(casting.sourceClassId);
    if (casting.cantripIds.length) items.push({ label: `${source} cantrips`, value: joinIds(casting.cantripIds) });
    if (casting.spellbookSpellIds?.length) items.push({ label: "Spellbook", value: joinIds(casting.spellbookSpellIds) });
    if (casting.preparedSpellIds.length) items.push({ label: `${source} prepared`, value: joinIds(casting.preparedSpellIds) });
    if (casting.alwaysPreparedSpellIds.length) items.push({ label: `${source} always prepared`, value: joinIds(casting.alwaysPreparedSpellIds) });
    if (casting.spellSlots.length) items.push({
      label: "Spell slots",
      value: casting.spellSlots.map((slot) => `Level ${slot.level}: ${slot.current}/${slot.maximum} (${titleId(slot.recharge)})`).join(", "),
    });
  }
  for (const grant of payload.spells?.grants ?? []) {
    if (grant.cantripIds.length) items.push({ label: `${titleId(grant.sourceId)} cantrips`, value: joinIds(grant.cantripIds) });
    if (grant.preparedSpellIds.length) items.push({
      label: `${titleId(grant.sourceId)} spells`,
      value: `${joinIds(grant.preparedSpellIds)} | ${grant.freeCastCurrent}/${grant.freeCastMaximum} free cast`,
    });
  }
  for (const grant of payload.spells?.speciesGrants ?? []) {
    const spells = [...grant.cantripIds, ...grant.preparedSpellIds, ...grant.alwaysPreparedSpellIds];
    if (spells.length) items.push({ label: `${titleId(grant.sourceSpeciesId)} magic`, value: joinIds(spells) });
  }
  return items;
}

function joinIds(ids: readonly string[]): string {
  return [...new Set(ids)].map(titleId).join(", ");
}

function titleId(value: string): string {
  return value
    .split(":")
    .map((segment) => segment
      .split("-")
      .map((part) => part ? part[0]!.toUpperCase() + part.slice(1) : part)
      .join(" "))
    .join(": ");
}

function abilityAbbreviation(id: Dnd5eAbilityId): string {
  if (id === "strength") return "STR";
  if (id === "dexterity") return "DEX";
  if (id === "constitution") return "CON";
  if (id === "intelligence") return "INT";
  if (id === "wisdom") return "WIS";
  return "CHA";
}

function signed(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}
