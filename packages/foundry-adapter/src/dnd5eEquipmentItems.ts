import type { JsonObject } from "../../character-model/src/index.js";
import type {
  Dnd5eEquipmentEntry,
  Dnd5eNativeCharacter,
} from "../../system-dnd5e/src/nativeCharacter.js";
import { stableFoundryDocumentId } from "./dnd5eIdentityItems.js";

export const FOUNDRY_DND5E_EQUIPMENT_PROOF_IDS = [
  "chain-mail",
  "greatsword",
  "flail",
  "javelin",
  "dungeoneers-pack",
] as const;

export interface FoundryDnd5eUnsupportedEquipment {
  itemId: string;
  quantity: number;
  reason: string;
}

export interface FoundryDnd5eEquipmentBuildResult {
  items: JsonObject[];
  unsupported: FoundryDnd5eUnsupportedEquipment[];
}

interface EquipmentDefinition {
  name: string;
  type: "equipment" | "weapon" | "container";
  maximumQuantity?: number;
  buildSystem(quantity: number): JsonObject;
}

const EQUIPMENT_DEFINITIONS: Record<string, EquipmentDefinition> = {
  "chain-mail": {
    name: "Chain Mail",
    type: "equipment",
    buildSystem(quantity) {
      return {
        ...physicalSystem("chain-mail", quantity, 75, "gp", 55, true),
        activities: {},
        uses: emptyUses(),
        armor: { value: 16, magicalBonus: "", dex: 0 },
        proficient: null,
        properties: ["stealthDisadvantage"],
        strength: 13,
        type: { value: "heavy", baseItem: "chainmail" },
      };
    },
  },
  greatsword: {
    name: "Greatsword",
    type: "weapon",
    buildSystem(quantity) {
      return weaponSystem({
        identifier: "greatsword",
        quantity,
        priceValue: 50,
        priceDenomination: "gp",
        weight: 6,
        damageNumber: 2,
        damageDenomination: 6,
        damageType: "slashing",
        weaponType: "martialM",
        properties: ["hvy", "two"],
        mastery: "graze",
      });
    },
  },
  flail: {
    name: "Flail",
    type: "weapon",
    buildSystem(quantity) {
      return weaponSystem({
        identifier: "flail",
        quantity,
        priceValue: 10,
        priceDenomination: "gp",
        weight: 2,
        damageNumber: 1,
        damageDenomination: 8,
        damageType: "bludgeoning",
        weaponType: "martialM",
        properties: [],
        mastery: "sap",
      });
    },
  },
  javelin: {
    name: "Javelin",
    type: "weapon",
    buildSystem(quantity) {
      return weaponSystem({
        identifier: "javelin",
        quantity,
        priceValue: 5,
        priceDenomination: "sp",
        weight: 2,
        damageNumber: 1,
        damageDenomination: 6,
        damageType: "piercing",
        weaponType: "simpleM",
        properties: ["thr"],
        mastery: "slow",
        range: { value: 30, long: 120, units: "ft", reach: null },
      });
    },
  },
  "dungeoneers-pack": {
    name: "Dungeoneer's Pack",
    type: "container",
    maximumQuantity: 1,
    buildSystem(quantity) {
      return {
        ...physicalSystem("dungeoneers-pack", quantity, 12, "gp", 5, false),
        currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
        properties: [],
        capacity: {
          weight: { value: 30, units: "lb" },
        },
      };
    },
  },
};

export function buildFoundryDnd5eEquipmentItems(
  characterId: string,
  payload: Dnd5eNativeCharacter,
): FoundryDnd5eEquipmentBuildResult {
  const items: JsonObject[] = [];
  const unsupported: FoundryDnd5eUnsupportedEquipment[] = [];

  for (const entry of aggregateEquipment(payload.equipment)) {
    const definition = EQUIPMENT_DEFINITIONS[entry.itemId];
    if (!definition) {
      unsupported.push({
        ...entry,
        reason: "No pinned Foundry D&D5e 6.0 equipment mapping is registered for this Character Forge item ID.",
      });
      continue;
    }
    if (definition.maximumQuantity !== undefined && entry.quantity > definition.maximumQuantity) {
      unsupported.push({
        ...entry,
        reason: `Foundry ${definition.type} mapping supports a maximum stack of ${definition.maximumQuantity}.`,
      });
      continue;
    }

    items.push({
      _id: stableFoundryDocumentId(`${characterId}:equipment:${entry.itemId}`),
      name: definition.name,
      type: definition.type,
      img: null,
      system: definition.buildSystem(entry.quantity),
      effects: [],
      flags: {
        "character-forge": {
          role: "equipment",
          sourceId: entry.itemId,
          sourceQuantity: entry.quantity,
        },
      },
    });
  }

  return { items, unsupported };
}

function aggregateEquipment(entries: readonly Dnd5eEquipmentEntry[]): Dnd5eEquipmentEntry[] {
  const quantities = new Map<string, number>();
  for (const entry of entries) {
    quantities.set(entry.itemId, (quantities.get(entry.itemId) ?? 0) + entry.quantity);
  }
  return [...quantities].map(([itemId, quantity]) => ({ itemId, quantity }));
}

function physicalSystem(
  identifier: string,
  quantity: number,
  priceValue: number,
  priceDenomination: string,
  weight: number,
  equipped: boolean,
): JsonObject {
  return {
    description: { value: "", chat: "" },
    source: {
      custom: "Character Forge export",
      rules: "2024",
      revision: 1,
    },
    identifier,
    identified: true,
    unidentified: { name: "", description: "" },
    container: null,
    quantity,
    weight: { value: weight, units: "lb" },
    price: { value: priceValue, denomination: priceDenomination },
    rarities: [],
    attunement: "",
    attuned: false,
    equipped,
  };
}

interface WeaponSystemInput {
  identifier: string;
  quantity: number;
  priceValue: number;
  priceDenomination: string;
  weight: number;
  damageNumber: number;
  damageDenomination: number;
  damageType: string;
  weaponType: string;
  properties: string[];
  mastery: string;
  range?: JsonObject;
}

function weaponSystem(input: WeaponSystemInput): JsonObject {
  return {
    ...physicalSystem(
      input.identifier,
      input.quantity,
      input.priceValue,
      input.priceDenomination,
      input.weight,
      false,
    ),
    range: input.range ?? { value: null, long: null, units: "ft", reach: null },
    uses: emptyUses(),
    damage: {
      versatile: {
        number: null,
        denomination: null,
        bonus: "",
        types: [],
        custom: { enabled: true, formula: "" },
        scaling: { mode: "", number: null, formula: "" },
      },
      base: {
        number: input.damageNumber,
        denomination: input.damageDenomination,
        types: [input.damageType],
        custom: { enabled: false, formula: "" },
        scaling: { mode: "", number: 1, formula: "" },
        bonus: "",
      },
    },
    armor: { value: null },
    type: { value: input.weaponType, baseItem: input.identifier },
    magicalBonus: "",
    properties: input.properties,
    proficient: null,
    activities: {},
    ammunition: {},
    mastery: input.mastery,
  };
}

function emptyUses(): JsonObject {
  return { max: "", spent: 0, recovery: [] };
}
