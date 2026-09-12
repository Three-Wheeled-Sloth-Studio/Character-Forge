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

export const FOUNDRY_DND5E_AMMUNITION_CONTAINER_IDS = [
  "arrow",
  "quiver",
  "explorers-pack",
  "entertainers-pack",
  "priests-pack",
  "burglars-pack",
  "scholars-pack",
  "pouch",
] as const;

export const FOUNDRY_DND5E_ARMOR_SHIELD_IDS = [
  "chain-shirt",
  "shield",
  "leather-armor",
  "studded-leather-armor",
] as const;

export const FOUNDRY_DND5E_SIMPLE_WEAPON_IDS = [
  "dagger",
  "quarterstaff",
  "spear",
  "shortbow",
  "handaxe",
  "mace",
  "sickle",
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
  type: "equipment" | "weapon" | "container" | "consumable";
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
  "chain-shirt": armorDefinition({
    name: "Chain Shirt",
    identifier: "chain-shirt",
    priceValue: 50,
    priceDenomination: "gp",
    weight: 20,
    armorValue: 13,
    armorDex: 2,
    armorType: "medium",
    baseItem: "chainshirt",
  }),
  shield: armorDefinition({
    name: "Shield",
    identifier: "shield",
    priceValue: 10,
    priceDenomination: "gp",
    weight: 6,
    armorValue: 2,
    armorDex: null,
    armorType: "shield",
    baseItem: "shield",
  }),
  "leather-armor": armorDefinition({
    name: "Leather Armor",
    identifier: "leather-armor",
    priceValue: 10,
    priceDenomination: "gp",
    weight: 10,
    armorValue: 11,
    armorDex: null,
    armorType: "light",
    baseItem: "leather",
  }),
  "studded-leather-armor": armorDefinition({
    name: "Studded Leather Armor",
    identifier: "studded-leather-armor",
    priceValue: 45,
    priceDenomination: "gp",
    weight: 13,
    armorValue: 12,
    armorDex: null,
    armorType: "light",
    baseItem: "studded",
  }),
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
  dagger: weaponDefinition({
    name: "Dagger",
    identifier: "dagger",
    priceValue: 2,
    priceDenomination: "gp",
    weight: 1,
    damageNumber: 1,
    damageDenomination: 4,
    damageType: "piercing",
    weaponType: "simpleM",
    properties: ["fin", "lgt", "thr"],
    mastery: "nick",
    range: { value: 20, long: 60, units: "ft", reach: null },
  }),
  quarterstaff: weaponDefinition({
    name: "Quarterstaff",
    identifier: "quarterstaff",
    priceValue: 2,
    priceDenomination: "sp",
    weight: 4,
    damageNumber: 1,
    damageDenomination: 6,
    damageType: "bludgeoning",
    weaponType: "simpleM",
    properties: ["ver"],
    mastery: "topple",
    versatileMarker: true,
  }),
  spear: weaponDefinition({
    name: "Spear",
    identifier: "spear",
    priceValue: 1,
    priceDenomination: "gp",
    weight: 3,
    damageNumber: 1,
    damageDenomination: 6,
    damageType: "piercing",
    weaponType: "simpleM",
    properties: ["thr", "ver"],
    mastery: "sap",
    range: { value: 20, long: 60, units: "ft", reach: null },
    versatileMarker: true,
  }),
  shortbow: weaponDefinition({
    name: "Shortbow",
    identifier: "shortbow",
    priceValue: 25,
    priceDenomination: "gp",
    weight: 2,
    damageNumber: 1,
    damageDenomination: 6,
    damageType: "piercing",
    weaponType: "simpleR",
    properties: ["amm", "two"],
    mastery: "vex",
    range: { value: 80, long: 320, units: "ft", reach: null },
    ammunitionType: "arrow",
  }),
  handaxe: weaponDefinition({
    name: "Handaxe",
    identifier: "handaxe",
    priceValue: 5,
    priceDenomination: "gp",
    weight: 2,
    damageNumber: 1,
    damageDenomination: 6,
    damageType: "slashing",
    weaponType: "simpleM",
    properties: ["lgt", "thr"],
    mastery: "vex",
    range: { value: 20, long: 60, units: "ft", reach: null },
  }),
  mace: weaponDefinition({
    name: "Mace",
    identifier: "mace",
    priceValue: 5,
    priceDenomination: "gp",
    weight: 4,
    damageNumber: 1,
    damageDenomination: 6,
    damageType: "bludgeoning",
    weaponType: "simpleM",
    properties: [],
    mastery: "sap",
  }),
  sickle: weaponDefinition({
    name: "Sickle",
    identifier: "sickle",
    priceValue: 1,
    priceDenomination: "gp",
    weight: 2,
    damageNumber: 1,
    damageDenomination: 4,
    damageType: "slashing",
    weaponType: "simpleM",
    properties: ["lgt"],
    mastery: "nick",
  }),
  arrow: {
    name: "Arrows",
    type: "consumable",
    buildSystem(quantity) {
      return ammunitionSystem(quantity);
    },
  },
  "dungeoneers-pack": containerDefinition("Dungeoneer's Pack", "dungeoneers-pack", 12, "gp", 5, {
    weight: { value: 30, units: "lb" },
  }),
  quiver: containerDefinition("Quiver", "quiver", 1, "gp", 1, { count: 20 }),
  "explorers-pack": containerDefinition("Explorer's Pack", "explorers-pack", 10, "gp", 5, {
    weight: { value: 30, units: "lb" },
  }),
  "entertainers-pack": containerDefinition("Entertainer's Pack", "entertainers-pack", 40, "gp", 5, {
    weight: { value: 30, units: "lb" },
  }),
  "priests-pack": containerDefinition("Priest's Pack", "priests-pack", 33, "gp", 5, {
    weight: { value: 30, units: "lb" },
  }),
  "burglars-pack": containerDefinition("Burglar's Pack", "burglars-pack", 16, "gp", 5, {
    weight: { value: 30, units: "lb" },
  }),
  "scholars-pack": containerDefinition("Scholar's Pack", "scholars-pack", 40, "gp", 5, {
    weight: { value: 30, units: "lb" },
  }),
  pouch: containerDefinition("Pouch", "pouch", 5, "sp", 1, {
    weight: { value: 6, units: "lb" },
  }),
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

interface ArmorSystemInput {
  name: string;
  identifier: string;
  priceValue: number;
  priceDenomination: string;
  weight: number;
  armorValue: number;
  armorDex: number | null;
  armorType: "light" | "medium" | "heavy" | "shield";
  baseItem: string;
  properties?: string[];
  strength?: number | null;
}

function armorDefinition(input: ArmorSystemInput): EquipmentDefinition {
  return {
    name: input.name,
    type: "equipment",
    buildSystem(quantity) {
      return {
        ...physicalSystem(
          input.identifier,
          quantity,
          input.priceValue,
          input.priceDenomination,
          input.weight,
          false,
        ),
        activities: {},
        uses: emptyUses(),
        armor: { value: input.armorValue, magicalBonus: null, dex: input.armorDex },
        proficient: null,
        properties: input.properties ?? [],
        strength: input.strength ?? null,
        type: { value: input.armorType, baseItem: input.baseItem },
      };
    },
  };
}

function ammunitionSystem(quantity: number): JsonObject {
  return {
    ...physicalSystem("arrows", quantity, 1, "gp", 0.05, false),
    uses: { ...emptyUses(), autoDestroy: false },
    damage: {
      base: {
        number: null,
        denomination: 0,
        bonus: "",
        types: [],
        custom: { enabled: false, formula: "" },
        modifiers: [],
        scaling: { mode: "", number: 1, formula: "" },
      },
      replace: false,
    },
    magicalBonus: "",
    properties: [],
    type: { value: "ammo", subtype: "arrow" },
    activities: {},
  };
}

function containerDefinition(
  name: string,
  identifier: string,
  priceValue: number,
  priceDenomination: string,
  weight: number,
  capacity: JsonObject,
): EquipmentDefinition {
  return {
    name,
    type: "container",
    maximumQuantity: 1,
    buildSystem(quantity) {
      return {
        ...physicalSystem(identifier, quantity, priceValue, priceDenomination, weight, false),
        currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
        properties: [],
        capacity,
      };
    },
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
  ammunitionType?: string;
  versatileMarker?: boolean;
}

interface WeaponDefinitionInput extends Omit<WeaponSystemInput, "quantity"> {
  name: string;
}

function weaponDefinition(input: WeaponDefinitionInput): EquipmentDefinition {
  return {
    name: input.name,
    type: "weapon",
    buildSystem(quantity) {
      return weaponSystem({ ...input, quantity });
    },
  };
}

function weaponSystem(input: WeaponSystemInput): JsonObject {
  const versatile = input.versatileMarker
    ? {
        number: null,
        denomination: 0,
        bonus: "",
        types: [],
        custom: { enabled: false, formula: "" },
        scaling: { mode: "", number: null, formula: "" },
      }
    : {
        number: null,
        denomination: null,
        bonus: "",
        types: [],
        custom: { enabled: true, formula: "" },
        scaling: { mode: "", number: null, formula: "" },
      };

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
      versatile,
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
    magicalBonus: null,
    properties: input.properties,
    proficient: null,
    activities: {},
    ammunition: input.ammunitionType ? { type: input.ammunitionType } : {},
    mastery: input.mastery,
  };
}

function emptyUses(): JsonObject {
  return { max: "", spent: 0, recovery: [] };
}
