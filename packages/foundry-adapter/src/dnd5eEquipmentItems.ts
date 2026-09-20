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

export const FOUNDRY_DND5E_MARTIAL_WEAPON_IDS = [
  "scimitar",
  "shortsword",
  "longbow",
  "greataxe",
  "longsword",
] as const;

export const FOUNDRY_DND5E_DIRECT_TOOL_IDS = [
  "calligraphers-supplies",
  "thieves-tools",
  "herbalism-kit",
] as const;

export const FOUNDRY_DND5E_ARTISAN_TOOL_IDS = [
  "artisan-tools:alchemists-supplies",
  "artisan-tools:brewers-supplies",
  "artisan-tools:calligraphers-supplies",
  "artisan-tools:carpenters-tools",
  "artisan-tools:cartographers-tools",
  "artisan-tools:cobblers-tools",
  "artisan-tools:cooks-utensils",
  "artisan-tools:glassblowers-tools",
  "artisan-tools:jewelers-tools",
  "artisan-tools:leatherworkers-tools",
  "artisan-tools:masons-tools",
  "artisan-tools:painters-supplies",
  "artisan-tools:potters-tools",
  "artisan-tools:smiths-tools",
  "artisan-tools:tinkers-tools",
  "artisan-tools:weavers-tools",
  "artisan-tools:woodcarvers-tools",
] as const;

export const FOUNDRY_DND5E_MUSICAL_INSTRUMENT_IDS = [
  "musical-instrument:bagpipes",
  "musical-instrument:drum",
  "musical-instrument:dulcimer",
  "musical-instrument:flute",
  "musical-instrument:horn",
  "musical-instrument:lute",
  "musical-instrument:lyre",
  "musical-instrument:pan-flute",
  "musical-instrument:shawm",
  "musical-instrument:viol",
] as const;

export const FOUNDRY_DND5E_FOCUS_IDS = [
  "arcane-focus:crystal",
  "arcane-focus:orb",
  "arcane-focus:quarterstaff",
  "druidic-focus:sprig-of-mistletoe",
  "druidic-focus:quarterstaff",
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
  type: "equipment" | "weapon" | "container" | "consumable" | "tool" | "loot";
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
  scimitar: weaponDefinition({
    name: "Scimitar",
    identifier: "scimitar",
    priceValue: 25,
    priceDenomination: "gp",
    weight: 3,
    damageNumber: 1,
    damageDenomination: 6,
    damageType: "slashing",
    weaponType: "martialM",
    properties: ["fin", "lgt"],
    mastery: "nick",
  }),
  shortsword: weaponDefinition({
    name: "Shortsword",
    identifier: "shortsword",
    priceValue: 10,
    priceDenomination: "gp",
    weight: 2,
    damageNumber: 1,
    damageDenomination: 6,
    damageType: "piercing",
    weaponType: "martialM",
    properties: ["fin", "lgt"],
    mastery: "vex",
  }),
  longbow: weaponDefinition({
    name: "Longbow",
    identifier: "longbow",
    priceValue: 50,
    priceDenomination: "gp",
    weight: 2,
    damageNumber: 1,
    damageDenomination: 8,
    damageType: "piercing",
    weaponType: "martialR",
    properties: ["amm", "hvy", "two"],
    mastery: "slow",
    range: { value: 150, long: 600, units: "ft", reach: null },
    ammunitionType: "arrow",
  }),
  greataxe: weaponDefinition({
    name: "Greataxe",
    identifier: "greataxe",
    priceValue: 30,
    priceDenomination: "gp",
    weight: 7,
    damageNumber: 1,
    damageDenomination: 12,
    damageType: "slashing",
    weaponType: "martialM",
    properties: ["hvy", "two"],
    mastery: "cleave",
  }),
  longsword: weaponDefinition({
    name: "Longsword",
    identifier: "longsword",
    priceValue: 15,
    priceDenomination: "gp",
    weight: 3,
    damageNumber: 1,
    damageDenomination: 8,
    damageType: "slashing",
    weaponType: "martialM",
    properties: ["ver"],
    mastery: "sap",
    versatileMarker: true,
  }),
  "calligraphers-supplies": toolDefinition({
    name: "Calligrapher's Supplies",
    identifier: "calligraphers-supplies",
    priceValue: 10,
    priceDenomination: "gp",
    weight: 5,
    toolType: "art",
    baseItem: "calligrapher",
    ability: "dex",
  }),
  "thieves-tools": toolDefinition({
    name: "Thieves' Tools",
    identifier: "thieves-tools",
    priceValue: 25,
    priceDenomination: "gp",
    weight: 1,
    toolType: "",
    baseItem: "thief",
    ability: "dex",
  }),
  "herbalism-kit": toolDefinition({
    name: "Herbalism Kit",
    identifier: "herbalism-kit",
    priceValue: 5,
    priceDenomination: "gp",
    weight: 8,
    toolType: "",
    baseItem: "herb",
    ability: "int",
  }),
  "artisan-tools:alchemists-supplies": toolDefinition({
    name: "Alchemist's Supplies",
    identifier: "alchemists-supplies",
    priceValue: 50,
    priceDenomination: "gp",
    weight: 8,
    toolType: "art",
    baseItem: "alchemist",
    ability: "int",
  }),
  "artisan-tools:brewers-supplies": toolDefinition({
    name: "Brewer's Supplies",
    identifier: "brewers-supplies",
    priceValue: 20,
    priceDenomination: "gp",
    weight: 9,
    toolType: "art",
    baseItem: "brewer",
    ability: "int",
  }),
  "artisan-tools:calligraphers-supplies": toolDefinition({
    name: "Calligrapher's Supplies",
    identifier: "calligraphers-supplies",
    priceValue: 10,
    priceDenomination: "gp",
    weight: 5,
    toolType: "art",
    baseItem: "calligrapher",
    ability: "dex",
  }),
  "artisan-tools:carpenters-tools": toolDefinition({
    name: "Carpenter's Tools",
    identifier: "carpenters-tools",
    priceValue: 8,
    priceDenomination: "gp",
    weight: 6,
    toolType: "art",
    baseItem: "carpenter",
    ability: "str",
  }),
  "artisan-tools:cartographers-tools": toolDefinition({
    name: "Cartographer's Tools",
    identifier: "cartographers-tools",
    priceValue: 15,
    priceDenomination: "gp",
    weight: 6,
    toolType: "art",
    baseItem: "cartographer",
    ability: "wis",
  }),
  "artisan-tools:cobblers-tools": toolDefinition({
    name: "Cobbler's Tools",
    identifier: "cobblers-tools",
    priceValue: 5,
    priceDenomination: "gp",
    weight: 5,
    toolType: "art",
    baseItem: "cobbler",
    ability: "dex",
  }),
  "artisan-tools:cooks-utensils": toolDefinition({
    name: "Cook's Utensils",
    identifier: "cooks-utensils",
    priceValue: 1,
    priceDenomination: "gp",
    weight: 8,
    toolType: "art",
    baseItem: "cook",
    ability: "wis",
  }),
  "artisan-tools:glassblowers-tools": toolDefinition({
    name: "Glassblower's Tools",
    identifier: "glassblowers-tools",
    priceValue: 30,
    priceDenomination: "gp",
    weight: 5,
    toolType: "art",
    baseItem: "glassblower",
    ability: "int",
  }),
  "artisan-tools:jewelers-tools": toolDefinition({
    name: "Jeweler's Tools",
    identifier: "jewelers-tools",
    priceValue: 25,
    priceDenomination: "gp",
    weight: 2,
    toolType: "art",
    baseItem: "jeweler",
    ability: "int",
  }),
  "artisan-tools:leatherworkers-tools": toolDefinition({
    name: "Leatherworker's Tools",
    identifier: "leatherworkers-tools",
    priceValue: 5,
    priceDenomination: "gp",
    weight: 5,
    toolType: "art",
    baseItem: "leatherworker",
    ability: "dex",
  }),
  "artisan-tools:masons-tools": toolDefinition({
    name: "Mason's Tools",
    identifier: "masons-tools",
    priceValue: 10,
    priceDenomination: "gp",
    weight: 8,
    toolType: "art",
    baseItem: "mason",
    ability: "str",
  }),
  "artisan-tools:painters-supplies": toolDefinition({
    name: "Painter's Supplies",
    identifier: "painters-supplies",
    priceValue: 10,
    priceDenomination: "gp",
    weight: 5,
    toolType: "art",
    baseItem: "painter",
    ability: "wis",
  }),
  "artisan-tools:potters-tools": toolDefinition({
    name: "Potter's Tools",
    identifier: "potters-tools",
    priceValue: 10,
    priceDenomination: "gp",
    weight: 3,
    toolType: "art",
    baseItem: "potter",
    ability: "int",
  }),
  "artisan-tools:smiths-tools": toolDefinition({
    name: "Smith's Tools",
    identifier: "smiths-tools",
    priceValue: 20,
    priceDenomination: "gp",
    weight: 8,
    toolType: "art",
    baseItem: "smith",
    ability: "str",
  }),
  "artisan-tools:tinkers-tools": toolDefinition({
    name: "Tinker's Tools",
    identifier: "tinkers-tools",
    priceValue: 50,
    priceDenomination: "gp",
    weight: 10,
    toolType: "art",
    baseItem: "tinker",
    ability: "dex",
  }),
  "artisan-tools:weavers-tools": toolDefinition({
    name: "Weaver's Tools",
    identifier: "weavers-tools",
    priceValue: 1,
    priceDenomination: "gp",
    weight: 5,
    toolType: "art",
    baseItem: "weaver",
    ability: "dex",
  }),
  "artisan-tools:woodcarvers-tools": toolDefinition({
    name: "Woodcarver's Tools",
    identifier: "woodcarvers-tools",
    priceValue: 1,
    priceDenomination: "gp",
    weight: 5,
    toolType: "art",
    baseItem: "woodcarver",
    ability: "dex",
  }),
  "musical-instrument:bagpipes": toolDefinition({
    name: "Bagpipes",
    identifier: "bagpipes",
    priceValue: 30,
    priceDenomination: "gp",
    weight: 1,
    toolType: "music",
    baseItem: "bagpipes",
    ability: "cha",
  }),
  "musical-instrument:drum": toolDefinition({
    name: "Drum",
    identifier: "drum",
    priceValue: 6,
    priceDenomination: "gp",
    weight: 3,
    toolType: "music",
    baseItem: "drum",
    ability: "cha",
  }),
  "musical-instrument:dulcimer": toolDefinition({
    name: "Dulcimer",
    identifier: "dulcimer",
    priceValue: 25,
    priceDenomination: "gp",
    weight: 10,
    toolType: "music",
    baseItem: "dulcimer",
    ability: "cha",
  }),
  "musical-instrument:flute": toolDefinition({
    name: "Flute",
    identifier: "flute",
    priceValue: 2,
    priceDenomination: "gp",
    weight: 1,
    toolType: "music",
    baseItem: "flute",
    ability: "cha",
  }),
  "musical-instrument:horn": toolDefinition({
    name: "Horn",
    identifier: "horn",
    priceValue: 3,
    priceDenomination: "gp",
    weight: 2,
    toolType: "music",
    baseItem: "horn",
    ability: "cha",
  }),
  "musical-instrument:lute": toolDefinition({
    name: "Lute",
    identifier: "lute",
    priceValue: 35,
    priceDenomination: "gp",
    weight: 2,
    toolType: "music",
    baseItem: "lute",
    ability: "cha",
  }),
  "musical-instrument:lyre": toolDefinition({
    name: "Lyre",
    identifier: "lyre",
    priceValue: 30,
    priceDenomination: "gp",
    weight: 2,
    toolType: "music",
    baseItem: "lyre",
    ability: "cha",
  }),
  "musical-instrument:pan-flute": toolDefinition({
    name: "Pan Flute",
    identifier: "pan-flute",
    priceValue: 12,
    priceDenomination: "gp",
    weight: 2,
    toolType: "music",
    baseItem: "panflute",
    ability: "cha",
  }),
  "musical-instrument:shawm": toolDefinition({
    name: "Shawm",
    identifier: "shawm",
    priceValue: 2,
    priceDenomination: "gp",
    weight: 1,
    toolType: "music",
    baseItem: "shawm",
    ability: "cha",
  }),
  "musical-instrument:viol": toolDefinition({
    name: "Viol",
    identifier: "viol",
    priceValue: 30,
    priceDenomination: "gp",
    weight: 1,
    toolType: "music",
    baseItem: "viol",
    ability: "cha",
  }),
  "arcane-focus:crystal": focusEquipmentDefinition({
    name: "Crystal",
    identifier: "crystal",
    priceValue: 10,
    weight: 1,
  }),
  "arcane-focus:orb": focusEquipmentDefinition({
    name: "Orb",
    identifier: "orb",
    priceValue: 20,
    weight: 3,
  }),
  "arcane-focus:quarterstaff": weaponDefinition({
    name: "Staff",
    identifier: "staff",
    priceValue: 5,
    priceDenomination: "gp",
    weight: 4,
    damageNumber: 1,
    damageDenomination: 6,
    damageType: "bludgeoning",
    weaponType: "simpleM",
    baseItem: "quarterstaff",
    properties: ["foc", "ver"],
    mastery: "topple",
    range: { value: null, long: null, units: "", reach: null },
    versatileMarker: true,
  }),
  "druidic-focus:sprig-of-mistletoe": focusEquipmentDefinition({
    name: "Sprig of mistletoe",
    identifier: "sprig-of-mistletoe",
    priceValue: 1,
    weight: 0,
  }),
  "druidic-focus:quarterstaff": weaponDefinition({
    name: "Wooden staff",
    identifier: "wooden-staff",
    priceValue: 5,
    priceDenomination: "gp",
    weight: 4,
    damageNumber: 1,
    damageDenomination: 6,
    damageType: "bludgeoning",
    weaponType: "simpleM",
    baseItem: "quarterstaff",
    properties: ["foc", "ver"],
    mastery: "topple",
    range: { value: null, long: null, units: "", reach: null },
    versatileMarker: true,
  }),
  "holy-symbol": {
    name: "Holy Symbol (Varies)",
    type: "loot",
    buildSystem(quantity) {
      return lootSystem({
        identifier: "holy-symbol-varies",
        quantity,
        priceValue: 0,
        priceDenomination: "gp",
        weight: 0,
        lootType: "gear",
        subtype: "",
        properties: [],
      });
    },
  },
  "gaming-set:dice": toolDefinition({
    name: "Dice",
    identifier: "dice",
    priceValue: 1,
    priceDenomination: "sp",
    weight: 0,
    toolType: "game",
    baseItem: "dice",
    ability: "wis",
  }),
  "book:prayers": {
    name: "Prayer Book",
    type: "loot",
    buildSystem(quantity) {
      return lootSystem({
        identifier: "book",
        quantity,
        priceValue: 25,
        priceDenomination: "gp",
        weight: 5,
        lootType: "gear",
        subtype: "",
        properties: [],
      });
    },
  },
  "book:history": {
    name: "History Book",
    type: "loot",
    buildSystem(quantity) {
      return lootSystem({
        identifier: "book",
        quantity,
        priceValue: 25,
        priceDenomination: "gp",
        weight: 5,
        lootType: "gear",
        subtype: "",
        properties: [],
      });
    },
  },
  "book:occult-lore": {
    name: "Occult Lore Book",
    type: "loot",
    buildSystem(quantity) {
      return lootSystem({
        identifier: "book",
        quantity,
        priceValue: 25,
        priceDenomination: "gp",
        weight: 5,
        lootType: "gear",
        subtype: "",
        properties: [],
      });
    },
  },
  "parchment-sheet": {
    name: "Parchment",
    type: "loot",
    buildSystem(quantity) {
      return lootSystem({
        identifier: "parchment",
        quantity,
        priceValue: 1,
        priceDenomination: "sp",
        weight: 0,
        lootType: "gear",
        subtype: "",
        properties: [],
      });
    },
  },
  robe: {
    name: "Robe",
    type: "equipment",
    buildSystem(quantity) {
      return {
        ...physicalSystem("robe", quantity, 1, "gp", 4, false),
        cover: null,
        crewed: false,
        uses: emptyUses(),
        armor: { value: null, magicalBonus: null, dex: null },
        hp: { value: null, max: null, dt: null, conditions: "" },
        type: { value: "clothing", baseItem: "" },
        properties: [],
        speed: { value: null, conditions: "" },
        strength: null,
        proficient: null,
        activities: {},
      };
    },
  },
  crowbar: {
    name: "Crowbar",
    type: "loot",
    buildSystem(quantity) {
      return lootSystem({
        identifier: "crowbar",
        quantity,
        priceValue: 2,
        priceDenomination: "gp",
        weight: 5,
        lootType: "gear",
        subtype: "",
        properties: [],
      });
    },
  },
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

interface LootSystemInput {
  identifier: string;
  quantity: number;
  priceValue: number;
  priceDenomination: string;
  weight: number;
  lootType: string;
  subtype: string;
  properties: string[];
}

function lootSystem(input: LootSystemInput): JsonObject {
  return {
    description: { value: "", chat: "" },
    source: {
      custom: "Character Forge export",
      rules: "2024",
      revision: 1,
    },
    identifier: input.identifier,
    identified: true,
    unidentified: { description: "" },
    container: null,
    quantity: input.quantity,
    weight: { value: input.weight, units: "lb" },
    price: { value: input.priceValue, denomination: input.priceDenomination },
    rarity: "",
    type: { value: input.lootType, subtype: input.subtype },
    properties: input.properties,
  };
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

interface FocusEquipmentDefinitionInput {
  name: string;
  identifier: string;
  priceValue: number;
  weight: number;
}

function focusEquipmentDefinition(input: FocusEquipmentDefinitionInput): EquipmentDefinition {
  return {
    name: input.name,
    type: "equipment",
    buildSystem(quantity) {
      return {
        ...physicalSystem(
          input.identifier,
          quantity,
          input.priceValue,
          "gp",
          input.weight,
          false,
        ),
        cover: null,
        crewed: false,
        uses: emptyUses(),
        armor: { value: null, magicalBonus: null, dex: null },
        hp: { value: null, max: null, dt: null, conditions: "" },
        type: { value: "trinket", baseItem: "" },
        properties: [],
        speed: { value: null, conditions: "" },
        strength: null,
        proficient: null,
        activities: {},
      };
    },
  };
}

interface ToolDefinitionInput {
  name: string;
  identifier: string;
  priceValue: number;
  priceDenomination: string;
  weight: number;
  toolType: string;
  baseItem: string;
  ability: string;
}

function toolDefinition(input: ToolDefinitionInput): EquipmentDefinition {
  return {
    name: input.name,
    type: "tool",
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
        uses: emptyUses(),
        type: { value: input.toolType, baseItem: input.baseItem },
        ability: input.ability,
        chatFlavor: "",
        proficient: null,
        properties: [],
        bonus: "",
        activities: {},
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
  baseItem?: string;
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
    type: { value: input.weaponType, baseItem: input.baseItem ?? input.identifier },
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