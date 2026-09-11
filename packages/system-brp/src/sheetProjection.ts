import type { CharacterDocument, NativeSystemState } from "../../character-model/src/index.js";
import type {
  CharacterSheetDescriptor,
  CharacterSheetDetailItem,
  CharacterSheetSection,
} from "../../character-sheet/src/index.js";
import {
  BRP_STARTING_EQUIPMENT_CATALOG,
  isBrpEquipmentId,
} from "./equipment.js";
import { readBrpFinishingDetailsForPayload } from "./finishing.js";
import { brpUge105Adapter } from "./finishingAdapter.js";
import type { BrpNativeCharacter, BrpProfessionState } from "./nativeCharacter.js";
import { BRP_FIRST_SLICE_SKILL_CATALOG, type BrpFirstSliceSkillKey } from "./skills.js";

const CHARACTERISTIC_IDS = ["STR", "CON", "SIZ", "INT", "POW", "DEX", "CHA"] as const;

export function buildBrpCharacterSheet(character: CharacterDocument): CharacterSheetDescriptor {
  const nativeState = primaryBrpState(character);
  const validation = brpUge105Adapter.validateNativeState(nativeState);
  if (!validation.valid) {
    const message = validation.issues.map((issue) => issue.message).join(" ") || "BRP native state validation failed.";
    throw new Error(message);
  }

  const payload = nativeState.payload as BrpNativeCharacter;
  const profession = professionLabel(payload.identity.profession);
  const finishing = readBrpFinishingDetailsForPayload(payload);
  const equipmentIds = payload.equipment.map((itemId) => {
    if (!isBrpEquipmentId(itemId)) throw new Error(`Unsupported BRP equipment ID ${itemId}.`);
    return itemId;
  });

  const pageOneSections: CharacterSheetSection[] = [
    {
      id: "identity",
      title: "Identity",
      role: "identity",
      priority: 100,
      kind: "details",
      preferredColumns: 3,
      items: [
        { label: "Profession", value: profession },
        { label: "Age", value: String(payload.identity.age) },
        { label: "Gender", value: payload.identity.gender },
      ],
    },
    {
      id: "characteristics",
      title: "Characteristics",
      role: "primary_stats",
      priority: 95,
      kind: "stats",
      preferredColumns: 4,
      items: CHARACTERISTIC_IDS.map((id) => ({ label: id, value: String(payload.characteristics[id].final) })),
    },
    {
      id: "derived",
      title: "Resources and Derived Values",
      role: "resources",
      priority: 90,
      kind: "stats",
      preferredColumns: 3,
      items: [
        { label: "Hit Points", value: String(payload.derived.hitPoints) },
        { label: "Major Wound", value: String(payload.derived.majorWoundLevel) },
        { label: "Power Points", value: String(payload.derived.powerPoints) },
        { label: "Move", value: String(payload.derived.move) },
        { label: "Damage Modifier", value: payload.derived.damageModifier },
        { label: "Experience Bonus", value: String(payload.derived.experienceBonus) },
      ],
    },
    {
      id: "skills",
      title: "Skills",
      role: "actions",
      priority: 85,
      kind: "ratings",
      preferredColumns: 2,
      allowSplit: true,
      items: payload.skills.map((skill) => ({
        label: skill.specialty ? `${skill.label} (${skill.specialty.label})` : skill.label,
        value: `${skill.finalRating}%`,
      })),
    },
  ];

  const weaponRows = equipmentIds.flatMap((itemId) => {
    const item = BRP_STARTING_EQUIPMENT_CATALOG[itemId];
    if (item.kind !== "weapon") return [];
    return [{
      weapon: item.label,
      attack: `${weaponAttackRating(payload, item.skillKey)}%`,
      damage: item.damage,
      apr: String(item.attacksPerRound),
      range: `${item.rangeMeters} m`,
      ammo: String(item.ammo),
      malfunction: item.malfunction,
    }];
  });
  if (weaponRows.length) {
    pageOneSections.push({
      id: "weapons",
      title: "Weapons",
      role: "actions",
      priority: 75,
      kind: "table",
      repeatHeader: true,
      columns: [
        { key: "weapon", label: "Weapon" },
        { key: "attack", label: "Attack", align: "right" },
        { key: "damage", label: "Damage", align: "center" },
        { key: "apr", label: "APR", align: "right" },
        { key: "range", label: "Range", align: "right" },
        { key: "ammo", label: "Ammo", align: "right" },
        { key: "malfunction", label: "Malfunction", align: "center" },
      ],
      rows: weaponRows,
    });
  }

  const armorRows = equipmentIds.flatMap((itemId) => {
    const item = BRP_STARTING_EQUIPMENT_CATALOG[itemId];
    if (item.kind !== "armor") return [];
    return [{
      armor: item.label,
      av: String(item.armorValue),
      burden: titleCase(item.burden),
      enc: String(item.enc),
      modifier: signed(item.skillModifier),
    }];
  });
  if (armorRows.length) {
    pageOneSections.push({
      id: "armor",
      title: "Armor",
      role: "equipment",
      priority: 70,
      kind: "table",
      columns: [
        { key: "armor", label: "Armor" },
        { key: "av", label: "AV", align: "right" },
        { key: "burden", label: "Burden", align: "center" },
        { key: "enc", label: "ENC", align: "right" },
        { key: "modifier", label: "Skill Mod", align: "right" },
      ],
      rows: armorRows,
    });
  }

  const pageTwoSections: CharacterSheetSection[] = [
    {
      id: "equipment",
      title: "Equipment and Wealth",
      role: "equipment",
      priority: 90,
      kind: "details",
      items: [
        { label: "Wealth", value: titleCase(payload.identity.profession.wealth) },
        {
          label: "Selected equipment",
          value: equipmentIds.length
            ? equipmentIds.map((itemId) => BRP_STARTING_EQUIPMENT_CATALOG[itemId].label).join(", ")
            : "No explicit play-important equipment selected",
        },
      ],
    },
  ];

  const appearanceItems = nonEmptyDetails([
    ["Size / build", finishing.sizeDescription],
    ["Appearance", finishing.appearance],
    ["Mannerisms / motto", finishing.mannerisms],
  ]);
  if (appearanceItems.length) {
    pageTwoSections.push({
      id: "appearance",
      title: "Appearance and Manner",
      role: "narrative",
      priority: 75,
      kind: "details",
      items: appearanceItems,
    });
  }

  const backgroundItems = nonEmptyDetails([
    ["Reputation", finishing.reputation],
    ["Personal item", finishing.personalItem],
    ["Background", finishing.background],
    ["Beliefs", finishing.beliefs],
  ]);
  if (backgroundItems.length) {
    pageTwoSections.push({
      id: "background",
      title: "Background and Beliefs",
      role: "narrative",
      priority: 70,
      kind: "details",
      items: backgroundItems,
    });
  }

  if (payload.identity.profession.professionId === "custom" && payload.identity.profession.description.trim()) {
    pageTwoSections.push({
      id: "profession-context",
      title: "Profession Context",
      role: "narrative",
      priority: 60,
      kind: "details",
      items: [{ label: profession, value: payload.identity.profession.description.trim() }],
    });
  }

  return {
    title: character.displayName,
    subtitle: profession,
    footerNote: "BRP UGE 2023 | ORC 1.05",
    sourceNativeStateId: nativeState.id,
    sourceSchemaVersion: nativeState.schemaVersion,
    pages: [
      { id: "play", number: 1, title: "At the table", sections: pageOneSections },
      { id: "depth", number: 2, title: "Depth and logistics", sections: pageTwoSections },
    ],
  };
}

function primaryBrpState(character: CharacterDocument): NativeSystemState {
  const nativeState = character.nativeStates.find((state) => state.id === character.primaryNativeStateId);
  if (!nativeState || nativeState.systemId !== "brp" || nativeState.editionId !== "uge-2023") {
    throw new Error("Character document does not contain a BRP UGE primary native state.");
  }
  return nativeState;
}

function professionLabel(profession: BrpProfessionState): string {
  if (profession.professionId === "custom") return profession.title.trim() || "Custom Profession";
  return titleCase(profession.professionId);
}

function weaponAttackRating(payload: BrpNativeCharacter, skillKey: BrpFirstSliceSkillKey): number {
  const definition = BRP_FIRST_SLICE_SKILL_CATALOG[skillKey];
  const specialtyId = definition.specialty?.id ?? null;
  const skill = payload.skills.find((entry) => entry.skillId === definition.skillId
    && (entry.specialty?.id ?? null) === specialtyId);
  if (skill) return skill.finalRating;
  return typeof definition.baseChance === "number" ? definition.baseChance : 0;
}

function nonEmptyDetails(entries: Array<readonly [string, string]>): CharacterSheetDetailItem[] {
  return entries
    .map(([label, value]) => ({ label, value: value.trim() }))
    .filter((entry) => entry.value.length > 0);
}

function titleCase(value: string): string {
  return value
    .split("-")
    .map((part) => part ? part[0]!.toUpperCase() + part.slice(1) : part)
    .join(" ");
}

function signed(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}
