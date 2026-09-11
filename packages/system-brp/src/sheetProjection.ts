import type { CharacterDocument, NativeSystemState } from "../../character-model/src/index.js";
import type {
  CharacterSheetDescriptor,
  CharacterSheetDetailItem,
  CharacterSheetRatingItem,
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
const BRP_SINGLE_PAGE_COLUMN_BUDGET = 30;

type BrpSheetSkillGroup = "Communication" | "Mental" | "Perception" | "Physical" | "Combat";

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

  const groupedSkills = groupSkills(payload);
  const initialPageOneSections: CharacterSheetSection[] = [
    {
      id: "characteristics",
      title: "Characteristics",
      role: "primary_stats",
      priority: 100,
      kind: "stats",
      preferredColumns: 2,
      zone: "left",
      items: CHARACTERISTIC_IDS.map((id) => ({ label: id, value: String(payload.characteristics[id].final) })),
    },
    {
      id: "derived",
      title: "At a Glance",
      role: "resources",
      priority: 98,
      kind: "stats",
      preferredColumns: 2,
      zone: "left",
      items: [
        { label: "Hit Points", value: String(payload.derived.hitPoints) },
        { label: "Major Wound", value: String(payload.derived.majorWoundLevel) },
        { label: "Power Points", value: String(payload.derived.powerPoints) },
        { label: "Move", value: String(payload.derived.move) },
        { label: "Damage Mod", value: payload.derived.damageModifier },
        { label: "Experience", value: String(payload.derived.experienceBonus) },
      ],
    },
    skillSection("skills-communication", "Communication", groupedSkills.Communication, "main", 94),
    skillSection("skills-mental", "Mental", groupedSkills.Mental, "main", 92),
    skillSection("skills-perception", "Perception", groupedSkills.Perception, "right", 93),
    skillSection("skills-physical", "Physical", groupedSkills.Physical, "right", 91),
    skillSection("skills-combat", "Combat", groupedSkills.Combat, "right", 90),
  ];
  const pageOneSections = initialPageOneSections.filter(
    (section) => section.kind !== "ratings" || section.items.length > 0,
  );

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
      priority: 88,
      kind: "table",
      repeatHeader: true,
      zone: "wide",
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
      priority: 86,
      kind: "table",
      zone: "wide",
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
      zone: "left",
      items: [
        { label: "Wealth", value: titleCase(payload.identity.profession.wealth) },
        {
          label: "Equipment",
          value: equipmentIds.length
            ? equipmentIds.map((itemId) => BRP_STARTING_EQUIPMENT_CATALOG[itemId].label).join(", ")
            : "None recorded",
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
      zone: "left",
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
      zone: "right",
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
      zone: "right",
      items: [{ label: profession, value: payload.identity.profession.description.trim() }],
    });
  }

  const compactToOnePage = shouldCompactBrpSheet(pageOneSections, pageTwoSections);

  return {
    title: character.displayName,
    subtitle: profession,
    systemTheme: "brp",
    headerFacts: [
      { label: "Profession", value: profession },
      { label: "Age", value: String(payload.identity.age) },
      { label: "Gender", value: payload.identity.gender },
    ],
    footerNote: "BRP UGE 2023 | ORC 1.05",
    sourceNativeStateId: nativeState.id,
    sourceSchemaVersion: nativeState.schemaVersion,
    pages: compactToOnePage
      ? [
          {
            id: "play",
            number: 1,
            title: "At the table",
            layout: "play-3",
            sections: [...pageOneSections, ...pageTwoSections],
          },
        ]
      : [
          { id: "play", number: 1, title: "At the table", layout: "play-3", sections: pageOneSections },
          { id: "depth", number: 2, title: "Depth and logistics", layout: "play-2", sections: pageTwoSections },
        ],
  };
}

function shouldCompactBrpSheet(
  pageOneSections: CharacterSheetSection[],
  pageTwoSections: CharacterSheetSection[],
): boolean {
  const sections = [...pageOneSections, ...pageTwoSections];
  const wideLoad = sections
    .filter((section) => section.zone === "wide")
    .reduce((total, section) => total + estimatedSectionRows(section), 0);

  return (["left", "main", "right"] as const).every((zone) => {
    const columnLoad = sections
      .filter((section) => section.zone !== "wide" && (section.zone ?? "main") === zone)
      .reduce((total, section) => total + estimatedSectionRows(section), 0);
    return columnLoad + wideLoad <= BRP_SINGLE_PAGE_COLUMN_BUDGET;
  });
}

function estimatedSectionRows(section: CharacterSheetSection): number {
  const columns = section.preferredColumns ?? 1;
  switch (section.kind) {
    case "stats":
      return 1 + Math.ceil(section.items.length / columns);
    case "ratings": {
      const itemRows = Math.ceil(section.items.length / columns);
      const detailRows = section.items.filter((item) => item.detail).length * 0.4;
      return 1 + itemRows + detailRows;
    }
    case "details": {
      const itemRows = section.items.reduce(
        (total, item) => total + wrappedRowEstimate(`${item.label} ${item.value}`, 68),
        0,
      );
      return 1 + Math.ceil(itemRows / columns);
    }
    case "list": {
      const itemRows = section.items.reduce(
        (total, item) => total + wrappedRowEstimate(`${item.label} ${item.detail ?? ""}`, 58),
        0,
      );
      return 1 + Math.ceil(itemRows / columns);
    }
    case "table":
      return 2 + section.rows.length;
  }
}

function wrappedRowEstimate(value: string, charactersPerRow: number): number {
  return Math.max(1, Math.ceil(value.trim().length / charactersPerRow));
}

function skillSection(
  id: string,
  title: string,
  items: CharacterSheetRatingItem[],
  zone: "main" | "right",
  priority: number,
): CharacterSheetSection {
  return {
    id,
    title,
    role: "actions",
    priority,
    kind: "ratings",
    preferredColumns: 1,
    allowSplit: true,
    zone,
    items,
  };
}

function groupSkills(payload: BrpNativeCharacter): Record<BrpSheetSkillGroup, CharacterSheetRatingItem[]> {
  const groups: Record<BrpSheetSkillGroup, CharacterSheetRatingItem[]> = {
    Communication: [],
    Mental: [],
    Perception: [],
    Physical: [],
    Combat: [],
  };
  for (const skill of payload.skills) {
    groups[skillGroup(skill.skillId)].push({
      label: skill.specialty ? `${skill.label} (${skill.specialty.label})` : skill.label,
      value: `${skill.finalRating}%`,
    });
  }
  return groups;
}

function skillGroup(skillId: string): BrpSheetSkillGroup {
  if (["bargain", "command", "disguise", "fast-talk", "language-own", "language-other", "persuade", "status", "teach"].includes(skillId)) {
    return "Communication";
  }
  if (["insight", "listen", "navigate", "sense", "spot", "track"].includes(skillId)) return "Perception";
  if (["climb", "dodge", "hide", "jump", "sleight-of-hand", "stealth", "swim", "throw"].includes(skillId)) return "Physical";
  if (["brawl", "firearm", "grapple"].includes(skillId)) return "Combat";
  return "Mental";
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
