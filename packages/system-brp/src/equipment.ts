import type { CharacterDocument } from "../../character-model/src/index.js";
import type { BrpNativeCharacter } from "./nativeCharacter.js";
import {
  BRP_FIRST_SLICE_SKILL_CATALOG,
  type BrpFirstSliceSkillKey,
} from "./skills.js";

export type BrpEquipmentKind = "gear" | "armor" | "weapon";
export type BrpEquipmentValue = "cheap" | "inexpensive" | "average" | "expensive" | "priceless";

export interface BrpEquipmentDefinition {
  itemId: string;
  label: string;
  kind: BrpEquipmentKind;
  value: BrpEquipmentValue | null;
  relatedSkillKey?: BrpFirstSliceSkillKey;
  skillKey?: BrpFirstSliceSkillKey;
  armorValue?: number;
  burden?: "none" | "light";
  enc?: number;
  skillModifier?: number;
  locations?: string;
  damage?: string;
  attacksPerRound?: number;
  special?: string;
  rangeMeters?: number;
  hands?: number;
  hitPoints?: number;
  minimumStr?: number;
  minimumDex?: number;
  malfunction?: string;
  ammo?: number;
}

export const BRP_STARTING_EQUIPMENT_CATALOG = {
  "first-aid-kit": {
    itemId: "first-aid-kit",
    label: "First Aid Kit",
    kind: "gear",
    value: "cheap",
    relatedSkillKey: "first-aid",
  },
  rope: {
    itemId: "rope",
    label: "Rope",
    kind: "gear",
    value: null,
    relatedSkillKey: "climb",
  },
  "clothing-heavy": {
    itemId: "clothing-heavy",
    label: "Clothing, Heavy",
    kind: "armor",
    value: "cheap",
    armorValue: 1,
    burden: "none",
    enc: 2.5,
    skillModifier: 0,
    locations: "all",
  },
  "leather-soft": {
    itemId: "leather-soft",
    label: "Leather, Soft",
    kind: "armor",
    value: "inexpensive",
    armorValue: 1,
    burden: "light",
    enc: 3.5,
    skillModifier: 0,
    locations: "all",
  },
  "pistol-light": {
    itemId: "pistol-light",
    label: "Pistol, Light",
    kind: "weapon",
    value: "average",
    skillKey: "firearm:handgun",
    damage: "1D6",
    attacksPerRound: 3,
    special: "Impaling",
    rangeMeters: 10,
    hands: 1,
    hitPoints: 6,
    minimumStr: 5,
    minimumDex: 5,
    malfunction: "00",
    ammo: 8,
    enc: 0.7,
  },
  "pistol-medium": {
    itemId: "pistol-medium",
    label: "Pistol, Medium",
    kind: "weapon",
    value: "average",
    skillKey: "firearm:handgun",
    damage: "1D8",
    attacksPerRound: 2,
    special: "Impaling",
    rangeMeters: 20,
    hands: 1,
    hitPoints: 8,
    minimumStr: 7,
    minimumDex: 5,
    malfunction: "98-00",
    ammo: 12,
    enc: 1.0,
  },
  "pistol-heavy": {
    itemId: "pistol-heavy",
    label: "Pistol, Heavy",
    kind: "weapon",
    value: "average",
    skillKey: "firearm:handgun",
    damage: "1D10+2",
    attacksPerRound: 1,
    special: "Impaling",
    rangeMeters: 15,
    hands: 1,
    hitPoints: 8,
    minimumStr: 11,
    minimumDex: 7,
    malfunction: "00",
    ammo: 8,
    enc: 1.5,
  },
} as const satisfies Record<string, BrpEquipmentDefinition>;

export type BrpEquipmentId = keyof typeof BRP_STARTING_EQUIPMENT_CATALOG;

export interface BrpStartingEquipmentEligibility {
  eligible: boolean;
  reason: string | null;
}

export function isBrpEquipmentId(value: unknown): value is BrpEquipmentId {
  return typeof value === "string"
    && Object.prototype.hasOwnProperty.call(BRP_STARTING_EQUIPMENT_CATALOG, value);
}

export function readBrpStartingEquipment(character: CharacterDocument): BrpEquipmentId[] {
  const payload = readPrimaryBrpPayload(character);
  const result: BrpEquipmentId[] = [];
  const seen = new Set<BrpEquipmentId>();
  for (const value of payload.equipment) {
    if (!isBrpEquipmentId(value)) throw new Error(`Unsupported BRP starting equipment ID ${String(value)}.`);
    if (seen.has(value)) throw new Error(`BRP starting equipment must not repeat ${value}.`);
    seen.add(value);
    result.push(value);
  }
  return result;
}

export function applyBrpStartingEquipment(
  character: CharacterDocument,
  equipmentIds: readonly BrpEquipmentId[],
): CharacterDocument {
  const normalized = normalizeEquipmentIds(equipmentIds);
  for (const itemId of normalized) {
    const eligibility = brpStartingEquipmentEligibility(character, itemId);
    if (!eligibility.eligible) throw new Error(eligibility.reason ?? `BRP equipment ${itemId} is not eligible.`);
  }

  const result = structuredClone(character);
  const payload = readPrimaryBrpPayload(result);
  payload.equipment = [...normalized];
  return result;
}

export function filterBrpStartingEquipmentSelection(
  character: CharacterDocument,
  equipmentIds: readonly BrpEquipmentId[],
): BrpEquipmentId[] {
  return normalizeEquipmentIds(equipmentIds).filter(
    (itemId) => brpStartingEquipmentEligibility(character, itemId).eligible,
  );
}

export function brpStartingEquipmentEligibility(
  character: CharacterDocument | null,
  itemId: BrpEquipmentId,
): BrpStartingEquipmentEligibility {
  const item = BRP_STARTING_EQUIPMENT_CATALOG[itemId];
  if (item.kind !== "weapon") return { eligible: true, reason: null };
  if (!character) {
    return {
      eligible: false,
      reason: "Finish a legal skill allocation to check the BRP starting-weapon threshold.",
    };
  }
  return brpStartingEquipmentEligibilityForPayload(readPrimaryBrpPayload(character), itemId);
}

export function brpStartingEquipmentEligibilityForPayload(
  payload: BrpNativeCharacter,
  itemId: BrpEquipmentId,
): BrpStartingEquipmentEligibility {
  const item = BRP_STARTING_EQUIPMENT_CATALOG[itemId];
  if (item.kind !== "weapon" || !item.skillKey) return { eligible: true, reason: null };
  const rating = brpFinalSkillRating(payload, item.skillKey);
  const skillLabel = BRP_FIRST_SLICE_SKILL_CATALOG[item.skillKey].label;
  if (rating !== null && rating >= 50) return { eligible: true, reason: null };
  return {
    eligible: false,
    reason: `${item.label} requires ${skillLabel} 50% or better for starting possession in this BRP creator. Current rating: ${rating ?? "not trained"}.`,
  };
}

export function brpEquipmentCatalogLine(itemId: BrpEquipmentId): string {
  const item = BRP_STARTING_EQUIPMENT_CATALOG[itemId];
  if (item.kind === "weapon") {
    return `${item.label}: ${item.damage} damage; ${item.attacksPerRound} attack${item.attacksPerRound === 1 ? "" : "s"}/round; range ${item.rangeMeters}m; ammo ${item.ammo}; ${item.special}; Value ${titleCase(item.value)}.`;
  }
  if (item.kind === "armor") {
    return `${item.label}: AV ${item.armorValue}; ${titleCase(item.burden)} burden; ENC ${item.enc}; skill modifier ${signed(item.skillModifier ?? 0)}; Value ${titleCase(item.value)}.`;
  }
  const value = item.value ? `; Value ${titleCase(item.value)}` : "";
  const related = item.relatedSkillKey
    ? `; useful with ${BRP_FIRST_SLICE_SKILL_CATALOG[item.relatedSkillKey].label}`
    : "";
  return `${item.label}${related}${value}.`;
}

export function brpEquipmentReviewLine(payload: BrpNativeCharacter, itemId: BrpEquipmentId): string {
  const item = BRP_STARTING_EQUIPMENT_CATALOG[itemId];
  if (item.kind === "weapon" && item.skillKey) {
    const rating = brpFinalSkillRating(payload, item.skillKey)
      ?? numericBaseChance(item.skillKey);
    return `${item.label}: attack ${rating}%; damage ${item.damage}; attacks ${item.attacksPerRound}/round; range ${item.rangeMeters}m; ammo ${item.ammo}; malfunction ${item.malfunction}.`;
  }
  return brpEquipmentCatalogLine(itemId);
}

function brpFinalSkillRating(payload: BrpNativeCharacter, skillKey: BrpFirstSliceSkillKey): number | null {
  const definition = BRP_FIRST_SLICE_SKILL_CATALOG[skillKey];
  const specialtyId = definition.specialty?.id ?? null;
  const found = payload.skills.find((skill) => skill.skillId === definition.skillId
    && (skill.specialty?.id ?? null) === specialtyId);
  return found?.finalRating ?? null;
}

function numericBaseChance(skillKey: BrpFirstSliceSkillKey): number {
  const value = BRP_FIRST_SLICE_SKILL_CATALOG[skillKey].baseChance;
  return typeof value === "number" ? value : 0;
}

function normalizeEquipmentIds(equipmentIds: readonly BrpEquipmentId[]): BrpEquipmentId[] {
  const result: BrpEquipmentId[] = [];
  const seen = new Set<BrpEquipmentId>();
  for (const itemId of equipmentIds) {
    if (!isBrpEquipmentId(itemId)) throw new Error(`Unsupported BRP starting equipment ID ${String(itemId)}.`);
    if (seen.has(itemId)) throw new Error(`BRP starting equipment must not repeat ${itemId}.`);
    seen.add(itemId);
    result.push(itemId);
  }
  return result;
}

function readPrimaryBrpPayload(character: CharacterDocument): BrpNativeCharacter {
  const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId);
  if (!nativeState || nativeState.systemId !== "brp" || nativeState.editionId !== "uge-2023") {
    throw new Error("Character document does not contain a BRP UGE primary native state.");
  }
  return nativeState.payload as BrpNativeCharacter;
}

function titleCase(value: string | null | undefined): string {
  if (!value) return "Unrated";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function signed(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}
