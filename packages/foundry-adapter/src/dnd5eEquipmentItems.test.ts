import { describe, expect, it } from "vitest";
import { createFirstSliceNativePayload } from "../../system-dnd5e/src/firstSliceCharacter.js";
import type { Dnd5eNativeCharacter } from "../../system-dnd5e/src/nativeCharacter.js";
import {
  buildFoundryDnd5eEquipmentItems,
  FOUNDRY_DND5E_AMMUNITION_CONTAINER_IDS,
  FOUNDRY_DND5E_ARMOR_SHIELD_IDS,
  FOUNDRY_DND5E_ARTISAN_TOOL_IDS,
  FOUNDRY_DND5E_DIRECT_TOOL_IDS,
  FOUNDRY_DND5E_EQUIPMENT_PROOF_IDS,
  FOUNDRY_DND5E_FOCUS_IDS,
  FOUNDRY_DND5E_MARTIAL_WEAPON_IDS,
  FOUNDRY_DND5E_MUSICAL_INSTRUMENT_IDS,
  FOUNDRY_DND5E_SIMPLE_WEAPON_IDS,
} from "./dnd5eEquipmentItems.js";
import { stableFoundryDocumentId } from "./dnd5eIdentityItems.js";

describe("Foundry D&D5e equipment mapping", () => {
  it("maps the bounded Fighter proof with deterministic IDs and native quantities", () => {
    const payload = createFirstSliceNativePayload();
    const first = buildFoundryDnd5eEquipmentItems("character-avery-stone", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-avery-stone", payload);

    expect(first.unsupported).toEqual([]);
    expect(first.items).toHaveLength(FOUNDRY_DND5E_EQUIPMENT_PROOF_IDS.length);
    expect(first.items).toEqual(second.items);

    const identifiers = first.items.map((item) => (item.system as { identifier: string }).identifier);
    expect(identifiers).toEqual([...FOUNDRY_DND5E_EQUIPMENT_PROOF_IDS]);

    const javelin = first.items.find((item) => (item.system as { identifier: string }).identifier === "javelin");
    expect(javelin).toMatchObject({
      _id: stableFoundryDocumentId("character-avery-stone:equipment:javelin"),
      type: "weapon",
      system: { quantity: 8 },
    });
  });

  it("aggregates repeated native stacks before mapping", () => {
    const original = createFirstSliceNativePayload();
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [
        ...original.equipment,
        { itemId: "javelin", quantity: 2 },
      ],
    };

    const result = buildFoundryDnd5eEquipmentItems("character-1", payload);
    const javelin = result.items.find((item) => (item.system as { identifier: string }).identifier === "javelin");
    expect(javelin).toMatchObject({ system: { quantity: 10 } });
  });

  it("translates Character Forge arrow explicitly to Foundry arrows and preserves quantity", () => {
    const original = createFirstSliceNativePayload();
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [{ itemId: "arrow", quantity: 20 }],
    };

    const first = buildFoundryDnd5eEquipmentItems("character-ranger", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-ranger", payload);

    expect(first.unsupported).toEqual([]);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(1);
    expect(first.items[0]).toMatchObject({
      _id: stableFoundryDocumentId("character-ranger:equipment:arrow"),
      name: "Arrows",
      type: "consumable",
      system: {
        identifier: "arrows",
        quantity: 20,
        weight: { value: 0.05, units: "lb" },
        type: { value: "ammo", subtype: "arrow" },
        activities: {},
      },
      flags: {
        "character-forge": {
          sourceId: "arrow",
          sourceQuantity: 20,
        },
      },
    });
  });

  it("maps proven mundane containers without inventing nested contents", () => {
    const original = createFirstSliceNativePayload();
    const containerIds = FOUNDRY_DND5E_AMMUNITION_CONTAINER_IDS.filter((id) => id !== "arrow");
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: containerIds.map((itemId) => ({ itemId, quantity: 1 })),
    };

    const result = buildFoundryDnd5eEquipmentItems("character-containers", payload);
    expect(result.unsupported).toEqual([]);
    expect(result.items).toHaveLength(containerIds.length);
    expect(result.items.every((item) => item.type === "container")).toBe(true);

    const byIdentifier = new Map(result.items.map((item) => [
      (item.system as { identifier: string }).identifier,
      item,
    ]));
    expect(byIdentifier.get("quiver")).toMatchObject({ system: { capacity: { count: 20 } } });
    expect(byIdentifier.get("pouch")).toMatchObject({
      system: { capacity: { weight: { value: 6, units: "lb" } } },
    });
    for (const identifier of [
      "explorers-pack",
      "entertainers-pack",
      "priests-pack",
      "burglars-pack",
      "scholars-pack",
    ]) {
      expect(byIdentifier.get(identifier)).toMatchObject({
        system: { capacity: { weight: { value: 30, units: "lb" } } },
      });
    }

    for (const item of result.items) {
      expect(item.system).toMatchObject({
        description: { value: "", chat: "" },
        container: null,
        quantity: 1,
      });
      expect("items" in item).toBe(false);
      expect(JSON.stringify(item)).not.toContain("@UUID");
    }
  });

  it("maps pinned armor and shield fixtures without copying prose or automation", () => {
    const original = createFirstSliceNativePayload();
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: FOUNDRY_DND5E_ARMOR_SHIELD_IDS.map((itemId) => ({ itemId, quantity: 1 })),
    };

    const first = buildFoundryDnd5eEquipmentItems("character-armor", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-armor", payload);
    expect(first.unsupported).toEqual([]);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(4);

    const byIdentifier = new Map(first.items.map((item) => [
      (item.system as { identifier: string }).identifier,
      item,
    ]));

    expect(byIdentifier.get("chain-shirt")).toMatchObject({
      _id: stableFoundryDocumentId("character-armor:equipment:chain-shirt"),
      name: "Chain Shirt",
      type: "equipment",
      system: {
        identifier: "chain-shirt",
        quantity: 1,
        equipped: false,
        weight: { value: 20, units: "lb" },
        price: { value: 50, denomination: "gp" },
        armor: { value: 13, magicalBonus: null, dex: 2 },
        type: { value: "medium", baseItem: "chainshirt" },
        properties: [],
        strength: null,
        activities: {},
      },
    });
    expect(byIdentifier.get("shield")).toMatchObject({
      name: "Shield",
      type: "equipment",
      system: {
        identifier: "shield",
        equipped: false,
        weight: { value: 6, units: "lb" },
        price: { value: 10, denomination: "gp" },
        armor: { value: 2, magicalBonus: null, dex: null },
        type: { value: "shield", baseItem: "shield" },
      },
    });
    expect(byIdentifier.get("leather-armor")).toMatchObject({
      name: "Leather Armor",
      system: {
        weight: { value: 10, units: "lb" },
        price: { value: 10, denomination: "gp" },
        armor: { value: 11, magicalBonus: null, dex: null },
        type: { value: "light", baseItem: "leather" },
      },
    });
    expect(byIdentifier.get("studded-leather-armor")).toMatchObject({
      name: "Studded Leather Armor",
      system: {
        weight: { value: 13, units: "lb" },
        price: { value: 45, denomination: "gp" },
        armor: { value: 12, magicalBonus: null, dex: null },
        type: { value: "light", baseItem: "studded" },
      },
    });

    for (const item of first.items) {
      expect(item.system).toMatchObject({
        description: { value: "", chat: "" },
        activities: {},
      });
      expect(JSON.stringify(item)).not.toContain("@UUID");
      expect(JSON.stringify(item)).not.toContain("advancement");
    }
  });

  it("maps the pinned simple-weapon slice while keeping unrelated equipment gaps explicit", () => {
    const original = createFirstSliceNativePayload();
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [
        ...FOUNDRY_DND5E_SIMPLE_WEAPON_IDS.map((itemId) => ({ itemId, quantity: 2 })),
        { itemId: "spellbook", quantity: 1 },
      ],
    };

    const first = buildFoundryDnd5eEquipmentItems("character-simple-weapons", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-simple-weapons", payload);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(FOUNDRY_DND5E_SIMPLE_WEAPON_IDS.length);
    expect(first.unsupported).toEqual([
      {
        itemId: "spellbook",
        quantity: 1,
        reason: "No pinned Foundry D&D5e 6.0 equipment mapping is registered for this Character Forge item ID.",
      },
    ]);

    const byIdentifier = new Map(first.items.map((item) => [
      (item.system as { identifier: string }).identifier,
      item,
    ]));

    expect(byIdentifier.get("dagger")).toMatchObject({
      _id: stableFoundryDocumentId("character-simple-weapons:equipment:dagger"),
      name: "Dagger",
      type: "weapon",
      system: {
        identifier: "dagger",
        quantity: 2,
        equipped: false,
        price: { value: 2, denomination: "gp" },
        weight: { value: 1, units: "lb" },
        damage: { base: { number: 1, denomination: 4, types: ["piercing"] } },
        type: { value: "simpleM", baseItem: "dagger" },
        properties: ["fin", "lgt", "thr"],
        mastery: "nick",
        range: { value: 20, long: 60, units: "ft", reach: null },
      },
    });
    expect(byIdentifier.get("quarterstaff")).toMatchObject({
      name: "Quarterstaff",
      system: {
        price: { value: 2, denomination: "sp" },
        weight: { value: 4, units: "lb" },
        damage: {
          base: { number: 1, denomination: 6, types: ["bludgeoning"] },
          versatile: { denomination: 0, custom: { enabled: false } },
        },
        type: { value: "simpleM", baseItem: "quarterstaff" },
        properties: ["ver"],
        mastery: "topple",
        range: { value: null, long: null, units: "ft", reach: null },
      },
    });
    expect(byIdentifier.get("spear")).toMatchObject({
      name: "Spear",
      system: {
        price: { value: 1, denomination: "gp" },
        weight: { value: 3, units: "lb" },
        damage: {
          base: { number: 1, denomination: 6, types: ["piercing"] },
          versatile: { denomination: 0, custom: { enabled: false } },
        },
        properties: ["thr", "ver"],
        mastery: "sap",
        range: { value: 20, long: 60, units: "ft", reach: null },
      },
    });
    expect(byIdentifier.get("shortbow")).toMatchObject({
      name: "Shortbow",
      system: {
        price: { value: 25, denomination: "gp" },
        weight: { value: 2, units: "lb" },
        damage: { base: { number: 1, denomination: 6, types: ["piercing"] } },
        type: { value: "simpleR", baseItem: "shortbow" },
        properties: ["amm", "two"],
        mastery: "vex",
        range: { value: 80, long: 320, units: "ft", reach: null },
        ammunition: { type: "arrow" },
      },
    });
    expect(byIdentifier.get("handaxe")).toMatchObject({
      name: "Handaxe",
      system: {
        price: { value: 5, denomination: "gp" },
        weight: { value: 2, units: "lb" },
        damage: { base: { number: 1, denomination: 6, types: ["slashing"] } },
        properties: ["lgt", "thr"],
        mastery: "vex",
        range: { value: 20, long: 60, units: "ft", reach: null },
      },
    });
    expect(byIdentifier.get("mace")).toMatchObject({
      name: "Mace",
      system: {
        price: { value: 5, denomination: "gp" },
        weight: { value: 4, units: "lb" },
        damage: { base: { number: 1, denomination: 6, types: ["bludgeoning"] } },
        properties: [],
        mastery: "sap",
      },
    });
    expect(byIdentifier.get("sickle")).toMatchObject({
      name: "Sickle",
      system: {
        price: { value: 1, denomination: "gp" },
        weight: { value: 2, units: "lb" },
        damage: { base: { number: 1, denomination: 4, types: ["slashing"] } },
        properties: ["lgt"],
        mastery: "nick",
      },
    });

    for (const item of first.items) {
      expect(item.system).toMatchObject({
        description: { value: "", chat: "" },
        quantity: 2,
        activities: {},
        magicalBonus: null,
      });
      expect((item.system as { ammunition?: { item?: unknown } }).ammunition?.item).toBeUndefined();
      expect(JSON.stringify(item)).not.toContain("@UUID");
    }
  });

  it("maps the pinned martial-weapon slice while keeping compound tool translation deferred", () => {
    const original = createFirstSliceNativePayload();
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [
        ...FOUNDRY_DND5E_MARTIAL_WEAPON_IDS.map((itemId) => ({ itemId, quantity: 2 })),
        { itemId: "spellbook", quantity: 1 },
      ],
    };

    const first = buildFoundryDnd5eEquipmentItems("character-martial-weapons", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-martial-weapons", payload);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(FOUNDRY_DND5E_MARTIAL_WEAPON_IDS.length);
    expect(first.unsupported).toEqual([
      {
        itemId: "spellbook",
        quantity: 1,
        reason: "No pinned Foundry D&D5e 6.0 equipment mapping is registered for this Character Forge item ID.",
      },
    ]);

    const byIdentifier = new Map(first.items.map((item) => [
      (item.system as { identifier: string }).identifier,
      item,
    ]));

    expect(byIdentifier.get("scimitar")).toMatchObject({
      name: "Scimitar",
      system: {
        price: { value: 25, denomination: "gp" },
        weight: { value: 3, units: "lb" },
        damage: { base: { number: 1, denomination: 6, types: ["slashing"] } },
        type: { value: "martialM", baseItem: "scimitar" },
        properties: ["fin", "lgt"],
        mastery: "nick",
        range: { value: null, long: null, units: "ft", reach: null },
      },
    });
    expect(byIdentifier.get("shortsword")).toMatchObject({
      name: "Shortsword",
      system: {
        price: { value: 10, denomination: "gp" },
        weight: { value: 2, units: "lb" },
        damage: { base: { number: 1, denomination: 6, types: ["piercing"] } },
        type: { value: "martialM", baseItem: "shortsword" },
        properties: ["fin", "lgt"],
        mastery: "vex",
        range: { value: null, long: null, units: "ft", reach: null },
      },
    });
    expect(byIdentifier.get("longbow")).toMatchObject({
      name: "Longbow",
      system: {
        price: { value: 50, denomination: "gp" },
        weight: { value: 2, units: "lb" },
        damage: { base: { number: 1, denomination: 8, types: ["piercing"] } },
        type: { value: "martialR", baseItem: "longbow" },
        properties: ["amm", "hvy", "two"],
        mastery: "slow",
        range: { value: 150, long: 600, units: "ft", reach: null },
        ammunition: { type: "arrow" },
      },
    });
    expect(byIdentifier.get("greataxe")).toMatchObject({
      name: "Greataxe",
      system: {
        price: { value: 30, denomination: "gp" },
        weight: { value: 7, units: "lb" },
        damage: { base: { number: 1, denomination: 12, types: ["slashing"] } },
        type: { value: "martialM", baseItem: "greataxe" },
        properties: ["hvy", "two"],
        mastery: "cleave",
        range: { value: null, long: null, units: "ft", reach: null },
      },
    });
    expect(byIdentifier.get("longsword")).toMatchObject({
      name: "Longsword",
      system: {
        price: { value: 15, denomination: "gp" },
        weight: { value: 3, units: "lb" },
        damage: {
          base: { number: 1, denomination: 8, types: ["slashing"] },
          versatile: { denomination: 0, custom: { enabled: false } },
        },
        type: { value: "martialM", baseItem: "longsword" },
        properties: ["ver"],
        mastery: "sap",
        range: { value: null, long: null, units: "ft", reach: null },
      },
    });

    for (const itemId of FOUNDRY_DND5E_MARTIAL_WEAPON_IDS) {
      const item = byIdentifier.get(itemId);
      expect(item).toMatchObject({
        _id: stableFoundryDocumentId(`character-martial-weapons:equipment:${itemId}`),
        type: "weapon",
        system: {
          identifier: itemId,
          quantity: 2,
          equipped: false,
          description: { value: "", chat: "" },
          activities: {},
          magicalBonus: null,
        },
        flags: {
          "character-forge": {
            role: "equipment",
            sourceId: itemId,
            sourceQuantity: 2,
          },
        },
      });
      expect((item?.system as { ammunition?: { item?: unknown } } | undefined)?.ammunition?.item).toBeUndefined();
      expect(JSON.stringify(item)).not.toContain("@UUID");
    }
  });

  it("maps direct tool concepts while keeping spellbook translation deferred", () => {
    const original = createFirstSliceNativePayload();
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [
        ...FOUNDRY_DND5E_DIRECT_TOOL_IDS.map((itemId) => ({ itemId, quantity: 2 })),
        { itemId: "spellbook", quantity: 1 },
      ],
    };

    const first = buildFoundryDnd5eEquipmentItems("character-direct-tools", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-direct-tools", payload);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(FOUNDRY_DND5E_DIRECT_TOOL_IDS.length);
    expect(first.unsupported).toEqual([
      {
        itemId: "spellbook",
        quantity: 1,
        reason: "No pinned Foundry D&D5e 6.0 equipment mapping is registered for this Character Forge item ID.",
      },
    ]);

    const byIdentifier = new Map(first.items.map((item) => [
      (item.system as { identifier: string }).identifier,
      item,
    ]));

    expect(byIdentifier.get("calligraphers-supplies")).toMatchObject({
      name: "Calligrapher's Supplies",
      type: "tool",
      system: {
        identifier: "calligraphers-supplies",
        price: { value: 10, denomination: "gp" },
        weight: { value: 5, units: "lb" },
        type: { value: "art", baseItem: "calligrapher" },
        ability: "dex",
      },
    });
    expect(byIdentifier.get("thieves-tools")).toMatchObject({
      name: "Thieves' Tools",
      type: "tool",
      system: {
        identifier: "thieves-tools",
        price: { value: 25, denomination: "gp" },
        weight: { value: 1, units: "lb" },
        type: { value: "", baseItem: "thief" },
        ability: "dex",
      },
    });
    expect(byIdentifier.get("herbalism-kit")).toMatchObject({
      name: "Herbalism Kit",
      type: "tool",
      system: {
        identifier: "herbalism-kit",
        price: { value: 5, denomination: "gp" },
        weight: { value: 8, units: "lb" },
        type: { value: "", baseItem: "herb" },
        ability: "int",
      },
    });

    for (const itemId of FOUNDRY_DND5E_DIRECT_TOOL_IDS) {
      const item = byIdentifier.get(itemId);
      expect(item).toMatchObject({
        _id: stableFoundryDocumentId(`character-direct-tools:equipment:${itemId}`),
        type: "tool",
        system: {
          identifier: itemId,
          quantity: 2,
          equipped: false,
          container: null,
          description: { value: "", chat: "" },
          proficient: null,
          properties: [],
          bonus: "",
          activities: {},
        },
        flags: {
          "character-forge": {
            role: "equipment",
            sourceId: itemId,
            sourceQuantity: 2,
          },
        },
      });
      expect(JSON.stringify(item)).not.toContain("@UUID");
    }
  });

  it("maps the explicit artisan-tool whitelist while keeping spellbook translation deferred", () => {
    const original = createFirstSliceNativePayload();
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [
        ...FOUNDRY_DND5E_ARTISAN_TOOL_IDS.map((itemId) => ({ itemId, quantity: 2 })),
        { itemId: "spellbook", quantity: 1 },
      ],
    };

    const first = buildFoundryDnd5eEquipmentItems("character-artisan-tools", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-artisan-tools", payload);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(FOUNDRY_DND5E_ARTISAN_TOOL_IDS.length);
    expect(first.unsupported).toEqual([
      {
        itemId: "spellbook",
        quantity: 1,
        reason: "No pinned Foundry D&D5e 6.0 equipment mapping is registered for this Character Forge item ID.",
      },
    ]);

    const expected = {
      "artisan-tools:alchemists-supplies": {
        name: "Alchemist's Supplies",
        identifier: "alchemists-supplies",
        price: 50,
        weight: 8,
        baseItem: "alchemist",
        ability: "int",
      },
      "artisan-tools:brewers-supplies": {
        name: "Brewer's Supplies",
        identifier: "brewers-supplies",
        price: 20,
        weight: 9,
        baseItem: "brewer",
        ability: "int",
      },
      "artisan-tools:calligraphers-supplies": {
        name: "Calligrapher's Supplies",
        identifier: "calligraphers-supplies",
        price: 10,
        weight: 5,
        baseItem: "calligrapher",
        ability: "dex",
      },
      "artisan-tools:carpenters-tools": {
        name: "Carpenter's Tools",
        identifier: "carpenters-tools",
        price: 8,
        weight: 6,
        baseItem: "carpenter",
        ability: "str",
      },
      "artisan-tools:cartographers-tools": {
        name: "Cartographer's Tools",
        identifier: "cartographers-tools",
        price: 15,
        weight: 6,
        baseItem: "cartographer",
        ability: "wis",
      },
      "artisan-tools:cobblers-tools": {
        name: "Cobbler's Tools",
        identifier: "cobblers-tools",
        price: 5,
        weight: 5,
        baseItem: "cobbler",
        ability: "dex",
      },
      "artisan-tools:cooks-utensils": {
        name: "Cook's Utensils",
        identifier: "cooks-utensils",
        price: 1,
        weight: 8,
        baseItem: "cook",
        ability: "wis",
      },
      "artisan-tools:glassblowers-tools": {
        name: "Glassblower's Tools",
        identifier: "glassblowers-tools",
        price: 30,
        weight: 5,
        baseItem: "glassblower",
        ability: "int",
      },
      "artisan-tools:jewelers-tools": {
        name: "Jeweler's Tools",
        identifier: "jewelers-tools",
        price: 25,
        weight: 2,
        baseItem: "jeweler",
        ability: "int",
      },
      "artisan-tools:leatherworkers-tools": {
        name: "Leatherworker's Tools",
        identifier: "leatherworkers-tools",
        price: 5,
        weight: 5,
        baseItem: "leatherworker",
        ability: "dex",
      },
      "artisan-tools:masons-tools": {
        name: "Mason's Tools",
        identifier: "masons-tools",
        price: 10,
        weight: 8,
        baseItem: "mason",
        ability: "str",
      },
      "artisan-tools:painters-supplies": {
        name: "Painter's Supplies",
        identifier: "painters-supplies",
        price: 10,
        weight: 5,
        baseItem: "painter",
        ability: "wis",
      },
      "artisan-tools:potters-tools": {
        name: "Potter's Tools",
        identifier: "potters-tools",
        price: 10,
        weight: 3,
        baseItem: "potter",
        ability: "int",
      },
      "artisan-tools:smiths-tools": {
        name: "Smith's Tools",
        identifier: "smiths-tools",
        price: 20,
        weight: 8,
        baseItem: "smith",
        ability: "str",
      },
      "artisan-tools:tinkers-tools": {
        name: "Tinker's Tools",
        identifier: "tinkers-tools",
        price: 50,
        weight: 10,
        baseItem: "tinker",
        ability: "dex",
      },
      "artisan-tools:weavers-tools": {
        name: "Weaver's Tools",
        identifier: "weavers-tools",
        price: 1,
        weight: 5,
        baseItem: "weaver",
        ability: "dex",
      },
      "artisan-tools:woodcarvers-tools": {
        name: "Woodcarver's Tools",
        identifier: "woodcarvers-tools",
        price: 1,
        weight: 5,
        baseItem: "woodcarver",
        ability: "dex",
      },
    } as const;

    const bySourceId = new Map(first.items.map((item) => [
      (item.flags as { "character-forge": { sourceId: string } })["character-forge"].sourceId,
      item,
    ]));

    for (const sourceId of FOUNDRY_DND5E_ARTISAN_TOOL_IDS) {
      const pinned = expected[sourceId];
      const item = bySourceId.get(sourceId);
      expect(item).toMatchObject({
        _id: stableFoundryDocumentId(`character-artisan-tools:equipment:${sourceId}`),
        name: pinned.name,
        type: "tool",
        system: {
          identifier: pinned.identifier,
          quantity: 2,
          equipped: false,
          container: null,
          description: { value: "", chat: "" },
          price: { value: pinned.price, denomination: "gp" },
          weight: { value: pinned.weight, units: "lb" },
          type: { value: "art", baseItem: pinned.baseItem },
          ability: pinned.ability,
          proficient: null,
          properties: [],
          bonus: "",
          activities: {},
        },
        flags: {
          "character-forge": {
            role: "equipment",
            sourceId,
            sourceQuantity: 2,
          },
        },
      });
      expect(JSON.stringify(item)).not.toContain("@UUID");
    }
  });

  it("maps the explicit musical-instrument whitelist while keeping spellbook translation deferred", () => {
    const original = createFirstSliceNativePayload();
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [
        ...FOUNDRY_DND5E_MUSICAL_INSTRUMENT_IDS.map((itemId) => ({ itemId, quantity: 2 })),
        { itemId: "spellbook", quantity: 1 },
      ],
    };

    const first = buildFoundryDnd5eEquipmentItems("character-musical-instruments", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-musical-instruments", payload);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(FOUNDRY_DND5E_MUSICAL_INSTRUMENT_IDS.length);
    expect(first.unsupported).toEqual([
      {
        itemId: "spellbook",
        quantity: 1,
        reason: "No pinned Foundry D&D5e 6.0 equipment mapping is registered for this Character Forge item ID.",
      },
    ]);

    const expected = {
      "musical-instrument:bagpipes": {
        name: "Bagpipes",
        identifier: "bagpipes",
        price: 30,
        weight: 1,
        baseItem: "bagpipes",
      },
      "musical-instrument:drum": {
        name: "Drum",
        identifier: "drum",
        price: 6,
        weight: 3,
        baseItem: "drum",
      },
      "musical-instrument:dulcimer": {
        name: "Dulcimer",
        identifier: "dulcimer",
        price: 25,
        weight: 10,
        baseItem: "dulcimer",
      },
      "musical-instrument:flute": {
        name: "Flute",
        identifier: "flute",
        price: 2,
        weight: 1,
        baseItem: "flute",
      },
      "musical-instrument:horn": {
        name: "Horn",
        identifier: "horn",
        price: 3,
        weight: 2,
        baseItem: "horn",
      },
      "musical-instrument:lute": {
        name: "Lute",
        identifier: "lute",
        price: 35,
        weight: 2,
        baseItem: "lute",
      },
      "musical-instrument:lyre": {
        name: "Lyre",
        identifier: "lyre",
        price: 30,
        weight: 2,
        baseItem: "lyre",
      },
      "musical-instrument:pan-flute": {
        name: "Pan Flute",
        identifier: "pan-flute",
        price: 12,
        weight: 2,
        baseItem: "panflute",
      },
      "musical-instrument:shawm": {
        name: "Shawm",
        identifier: "shawm",
        price: 2,
        weight: 1,
        baseItem: "shawm",
      },
      "musical-instrument:viol": {
        name: "Viol",
        identifier: "viol",
        price: 30,
        weight: 1,
        baseItem: "viol",
      },
    } as const;

    const bySourceId = new Map(first.items.map((item) => [
      (item.flags as { "character-forge": { sourceId: string } })["character-forge"].sourceId,
      item,
    ]));

    for (const sourceId of FOUNDRY_DND5E_MUSICAL_INSTRUMENT_IDS) {
      const pinned = expected[sourceId];
      const item = bySourceId.get(sourceId);
      expect(item).toMatchObject({
        _id: stableFoundryDocumentId(`character-musical-instruments:equipment:${sourceId}`),
        name: pinned.name,
        type: "tool",
        system: {
          identifier: pinned.identifier,
          quantity: 2,
          equipped: false,
          container: null,
          description: { value: "", chat: "" },
          price: { value: pinned.price, denomination: "gp" },
          weight: { value: pinned.weight, units: "lb" },
          type: { value: "music", baseItem: pinned.baseItem },
          ability: "cha",
          proficient: null,
          properties: [],
          bonus: "",
          activities: {},
        },
        flags: {
          "character-forge": {
            role: "equipment",
            sourceId,
            sourceQuantity: 2,
          },
        },
      });
      expect(JSON.stringify(item)).not.toContain("@UUID");
    }
  });

  it("maps compound spellcasting-focus aliases while keeping holy-symbol deferred", () => {
    const original = createFirstSliceNativePayload();
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [
        ...FOUNDRY_DND5E_FOCUS_IDS.map((itemId) => ({ itemId, quantity: 2 })),
        { itemId: "spellbook", quantity: 1 },
      ],
    };

    const first = buildFoundryDnd5eEquipmentItems("character-focuses", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-focuses", payload);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(FOUNDRY_DND5E_FOCUS_IDS.length);
    expect(first.unsupported).toEqual([
      {
        itemId: "spellbook",
        quantity: 1,
        reason: "No pinned Foundry D&D5e 6.0 equipment mapping is registered for this Character Forge item ID.",
      },
    ]);

    const bySourceId = new Map(first.items.map((item) => [
      (item.flags as { "character-forge": { sourceId: string } })["character-forge"].sourceId,
      item,
    ]));

    for (const sourceId of [
      "arcane-focus:crystal",
      "arcane-focus:orb",
      "druidic-focus:sprig-of-mistletoe",
    ] as const) {
      const item = bySourceId.get(sourceId);
      expect(item).toMatchObject({
        _id: stableFoundryDocumentId(`character-focuses:equipment:${sourceId}`),
        type: "equipment",
        system: {
          quantity: 2,
          equipped: false,
          container: null,
          description: { value: "", chat: "" },
          type: { value: "trinket", baseItem: "" },
          properties: [],
          strength: null,
          proficient: null,
          activities: {},
        },
        flags: {
          "character-forge": {
            role: "equipment",
            sourceId,
            sourceQuantity: 2,
          },
        },
      });
      expect(JSON.stringify(item)).not.toContain("@UUID");
    }

    expect(bySourceId.get("arcane-focus:crystal")).toMatchObject({
      name: "Crystal",
      system: {
        identifier: "crystal",
        price: { value: 10, denomination: "gp" },
        weight: { value: 1, units: "lb" },
      },
    });
    expect(bySourceId.get("arcane-focus:orb")).toMatchObject({
      name: "Orb",
      system: {
        identifier: "orb",
        price: { value: 20, denomination: "gp" },
        weight: { value: 3, units: "lb" },
      },
    });
    expect(bySourceId.get("druidic-focus:sprig-of-mistletoe")).toMatchObject({
      name: "Sprig of mistletoe",
      system: {
        identifier: "sprig-of-mistletoe",
        price: { value: 1, denomination: "gp" },
        weight: { value: 0, units: "lb" },
      },
    });

    expect(bySourceId.get("arcane-focus:quarterstaff")).toMatchObject({
      _id: stableFoundryDocumentId("character-focuses:equipment:arcane-focus:quarterstaff"),
      name: "Staff",
      type: "weapon",
      system: {
        identifier: "staff",
        quantity: 2,
        price: { value: 5, denomination: "gp" },
        weight: { value: 4, units: "lb" },
        damage: {
          base: { number: 1, denomination: 6, types: ["bludgeoning"] },
          versatile: { denomination: 0, custom: { enabled: false } },
        },
        type: { value: "simpleM", baseItem: "quarterstaff" },
        properties: ["foc", "ver"],
        mastery: "topple",
        range: { value: null, long: null, units: "", reach: null },
        activities: {},
        proficient: null,
      },
      flags: {
        "character-forge": {
          sourceId: "arcane-focus:quarterstaff",
          sourceQuantity: 2,
        },
      },
    });

    expect(bySourceId.get("druidic-focus:quarterstaff")).toMatchObject({
      _id: stableFoundryDocumentId("character-focuses:equipment:druidic-focus:quarterstaff"),
      name: "Wooden staff",
      type: "weapon",
      system: {
        identifier: "wooden-staff",
        quantity: 2,
        price: { value: 5, denomination: "gp" },
        weight: { value: 4, units: "lb" },
        damage: {
          base: { number: 1, denomination: 6, types: ["bludgeoning"] },
          versatile: { denomination: 0, custom: { enabled: false } },
        },
        type: { value: "simpleM", baseItem: "quarterstaff" },
        properties: ["foc", "ver"],
        mastery: "topple",
        range: { value: null, long: null, units: "", reach: null },
        activities: {},
        proficient: null,
      },
      flags: {
        "character-forge": {
          sourceId: "druidic-focus:quarterstaff",
          sourceQuantity: 2,
        },
      },
    });

    for (const item of first.items) {
      expect(item.system).toMatchObject({
        description: { value: "", chat: "" },
        equipped: false,
        container: null,
        activities: {},
      });
      expect(JSON.stringify(item)).not.toContain("@UUID");
    }
  });

  it("maps the generic holy-symbol concept to the pinned varies loot target", () => {
    const original = createFirstSliceNativePayload();
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [
        { itemId: "holy-symbol", quantity: 2 },
        { itemId: "spellbook", quantity: 1 },
      ],
    };

    const first = buildFoundryDnd5eEquipmentItems("character-holy-symbol", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-holy-symbol", payload);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(1);
    expect(first.unsupported).toEqual([
      {
        itemId: "spellbook",
        quantity: 1,
        reason: "No pinned Foundry D&D5e 6.0 equipment mapping is registered for this Character Forge item ID.",
      },
    ]);

    expect(first.items[0]).toMatchObject({
      _id: stableFoundryDocumentId("character-holy-symbol:equipment:holy-symbol"),
      name: "Holy Symbol (Varies)",
      type: "loot",
      system: {
        description: { value: "", chat: "" },
        identifier: "holy-symbol-varies",
        identified: true,
        unidentified: { description: "" },
        container: null,
        quantity: 2,
        weight: { value: 0, units: "lb" },
        price: { value: 0, denomination: "gp" },
        rarity: "",
        type: { value: "gear", subtype: "" },
        properties: [],
      },
      flags: {
        "character-forge": {
          role: "equipment",
          sourceId: "holy-symbol",
          sourceQuantity: 2,
        },
      },
    });

    const serialized = JSON.stringify(first.items[0]);
    expect(serialized).not.toContain("@UUID");
    expect(serialized).not.toContain("amulet");
    expect(serialized).not.toContain("emblem");
    expect(serialized).not.toContain("reliquary");
  });

  it("maps the compound gaming-set dice concept while keeping spellbook translation deferred", () => {
    const original = createFirstSliceNativePayload();
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [
        { itemId: "gaming-set:dice", quantity: 2 },
        { itemId: "spellbook", quantity: 1 },
      ],
    };

    const first = buildFoundryDnd5eEquipmentItems("character-gaming-dice", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-gaming-dice", payload);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(1);
    expect(first.unsupported).toEqual([
      {
        itemId: "spellbook",
        quantity: 1,
        reason: "No pinned Foundry D&D5e 6.0 equipment mapping is registered for this Character Forge item ID.",
      },
    ]);

    expect(first.items[0]).toMatchObject({
      _id: stableFoundryDocumentId("character-gaming-dice:equipment:gaming-set:dice"),
      name: "Dice",
      type: "tool",
      system: {
        description: { value: "", chat: "" },
        identifier: "dice",
        container: null,
        quantity: 2,
        weight: { value: 0, units: "lb" },
        price: { value: 1, denomination: "sp" },
        equipped: false,
        type: { value: "game", baseItem: "dice" },
        ability: "wis",
        proficient: null,
        properties: [],
        bonus: "",
        activities: {},
      },
      flags: {
        "character-forge": {
          role: "equipment",
          sourceId: "gaming-set:dice",
          sourceQuantity: 2,
        },
      },
    });

    const serialized = JSON.stringify(first.items[0]);
    expect(serialized).not.toContain("@UUID");
    expect(serialized).not.toContain("Catch Cheating");
    expect(serialized).not.toContain("Play to Win");
  });

  it("maps semantic book aliases to the generic pinned Foundry book target", () => {
    const original = createFirstSliceNativePayload();
    const sourceIds = [
      "book:prayers",
      "book:history",
      "book:occult-lore",
    ] as const;
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [
        ...sourceIds.map((itemId) => ({ itemId, quantity: 2 })),
        { itemId: "spellbook", quantity: 1 },
      ],
    };

    const first = buildFoundryDnd5eEquipmentItems("character-semantic-books", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-semantic-books", payload);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(sourceIds.length);
    expect(first.unsupported).toEqual([
      {
        itemId: "spellbook",
        quantity: 1,
        reason: "No pinned Foundry D&D5e 6.0 equipment mapping is registered for this Character Forge item ID.",
      },
    ]);

    const expectedNames = {
      "book:prayers": "Prayer Book",
      "book:history": "History Book",
      "book:occult-lore": "Occult Lore Book",
    } as const;
    const bySourceId = new Map(first.items.map((item) => [
      (item.flags as { "character-forge": { sourceId: string } })["character-forge"].sourceId,
      item,
    ]));

    for (const sourceId of sourceIds) {
      const item = bySourceId.get(sourceId);
      expect(item).toMatchObject({
        _id: stableFoundryDocumentId(`character-semantic-books:equipment:${sourceId}`),
        name: expectedNames[sourceId],
        type: "loot",
        system: {
          description: { value: "", chat: "" },
          identifier: "book",
          identified: true,
          unidentified: { description: "" },
          container: null,
          quantity: 2,
          weight: { value: 5, units: "lb" },
          price: { value: 25, denomination: "gp" },
          rarity: "",
          type: { value: "gear", subtype: "" },
          properties: [],
        },
        flags: {
          "character-forge": {
            role: "equipment",
            sourceId,
            sourceQuantity: 2,
          },
        },
      });

      const serialized = JSON.stringify(item);
      expect(serialized).not.toContain("@UUID");
      expect(serialized).not.toContain("+5");
      expect(serialized).not.toContain("Arcana");
      expect(serialized).not.toContain("Intelligence");
      expect(serialized).not.toContain("Nature");
      expect(serialized).not.toContain("Religion");
    }
  });

  it("maps confirmed 2024 simple gear while keeping legacy-only spellbook deferred", () => {
    const original = createFirstSliceNativePayload();
    const sourceIds = ["parchment-sheet", "robe", "crowbar"] as const;
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [
        ...sourceIds.map((itemId) => ({ itemId, quantity: 2 })),
        { itemId: "spellbook", quantity: 1 },
      ],
    };

    const first = buildFoundryDnd5eEquipmentItems("character-simple-gear", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-simple-gear", payload);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(sourceIds.length);
    expect(first.unsupported).toEqual([
      {
        itemId: "spellbook",
        quantity: 1,
        reason: "No pinned Foundry D&D5e 6.0 equipment mapping is registered for this Character Forge item ID.",
      },
    ]);

    const bySourceId = new Map(first.items.map((item) => [
      (item.flags as { "character-forge": { sourceId: string } })["character-forge"].sourceId,
      item,
    ]));

    expect(bySourceId.get("parchment-sheet")).toMatchObject({
      _id: stableFoundryDocumentId("character-simple-gear:equipment:parchment-sheet"),
      name: "Parchment",
      type: "loot",
      system: {
        description: { value: "", chat: "" },
        identifier: "parchment",
        identified: true,
        unidentified: { description: "" },
        container: null,
        quantity: 2,
        weight: { value: 0, units: "lb" },
        price: { value: 1, denomination: "sp" },
        rarity: "",
        type: { value: "gear", subtype: "" },
        properties: [],
      },
      flags: {
        "character-forge": {
          role: "equipment",
          sourceId: "parchment-sheet",
          sourceQuantity: 2,
        },
      },
    });

    expect(bySourceId.get("robe")).toMatchObject({
      _id: stableFoundryDocumentId("character-simple-gear:equipment:robe"),
      name: "Robe",
      type: "equipment",
      system: {
        description: { value: "", chat: "" },
        identifier: "robe",
        container: null,
        quantity: 2,
        weight: { value: 4, units: "lb" },
        price: { value: 1, denomination: "gp" },
        equipped: false,
        cover: null,
        crewed: false,
        armor: { value: null, magicalBonus: null, dex: null },
        hp: { value: null, max: null, dt: null, conditions: "" },
        type: { value: "clothing", baseItem: "" },
        properties: [],
        speed: { value: null, conditions: "" },
        strength: null,
        proficient: null,
        activities: {},
      },
      flags: {
        "character-forge": {
          role: "equipment",
          sourceId: "robe",
          sourceQuantity: 2,
        },
      },
    });

    expect(bySourceId.get("crowbar")).toMatchObject({
      _id: stableFoundryDocumentId("character-simple-gear:equipment:crowbar"),
      name: "Crowbar",
      type: "loot",
      system: {
        description: { value: "", chat: "" },
        identifier: "crowbar",
        identified: true,
        unidentified: { description: "" },
        container: null,
        quantity: 2,
        weight: { value: 5, units: "lb" },
        price: { value: 2, denomination: "gp" },
        rarity: "",
        type: { value: "gear", subtype: "" },
        properties: [],
      },
      flags: {
        "character-forge": {
          role: "equipment",
          sourceId: "crowbar",
          sourceQuantity: 2,
        },
      },
    });

    for (const sourceId of sourceIds) {
      const serialized = JSON.stringify(bySourceId.get(sourceId));
      expect(serialized).not.toContain("@UUID");
      expect(serialized).not.toContain("Advantage");
      expect(serialized).not.toContain("250 handwritten words");
      expect(serialized).not.toContain("vocational");
    }
  });

  it("maps Healer's Kit consumable uses while deferring its Stabilize activity", () => {
    const original = createFirstSliceNativePayload();
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [
        { itemId: "healers-kit", quantity: 2 },
        { itemId: "spellbook", quantity: 1 },
      ],
    };

    const first = buildFoundryDnd5eEquipmentItems("character-healers-kit", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-healers-kit", payload);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(1);
    expect(first.unsupported).toEqual([
      {
        itemId: "spellbook",
        quantity: 1,
        reason: "No pinned Foundry D&D5e 6.0 equipment mapping is registered for this Character Forge item ID.",
      },
    ]);

    expect(first.items[0]).toMatchObject({
      _id: stableFoundryDocumentId("character-healers-kit:equipment:healers-kit"),
      name: "Healer's Kit",
      type: "consumable",
      system: {
        description: { value: "", chat: "" },
        identifier: "healers-kit",
        identified: true,
        container: null,
        quantity: 2,
        weight: { value: 3, units: "lb" },
        price: { value: 5, denomination: "gp" },
        equipped: false,
        uses: {
          max: "10",
          autoDestroy: true,
          spent: 0,
          recovery: [],
        },
        damage: {
          base: {
            number: null,
            denomination: null,
            types: [],
            custom: { enabled: false },
            scaling: { number: 1 },
          },
          replace: false,
        },
        type: { value: "trinket", subtype: "" },
        magicalBonus: null,
        properties: [],
        activities: {},
      },
      flags: {
        "character-forge": {
          role: "equipment",
          sourceId: "healers-kit",
          sourceQuantity: 2,
        },
      },
    });

    const serialized = JSON.stringify(first.items[0]);
    expect(serialized).not.toContain("@UUID");
    expect(serialized).not.toContain("Stabilize");
    expect(serialized).not.toContain("Medicine");
    expect(serialized).not.toContain("Unconscious");
    expect(serialized).not.toContain("itemUses");
  });

  it("reports multi-container stacks explicitly because Foundry containers cannot stack", () => {
    const original = createFirstSliceNativePayload();
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [{ itemId: "pouch", quantity: 2 }],
    };

    const result = buildFoundryDnd5eEquipmentItems("character-1", payload);
    expect(result.items).toEqual([]);
    expect(result.unsupported).toEqual([
      {
        itemId: "pouch",
        quantity: 2,
        reason: "Foundry container mapping supports a maximum stack of 1.",
      },
    ]);
  });

  it("reports unsupported IDs explicitly instead of inventing generic loot", () => {
    const original = createFirstSliceNativePayload();
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [
        ...original.equipment,
        { itemId: "unmapped-proof-item", quantity: 3 },
      ],
    };

    const result = buildFoundryDnd5eEquipmentItems("character-1", payload);
    expect(result.unsupported).toEqual([
      {
        itemId: "unmapped-proof-item",
        quantity: 3,
        reason: "No pinned Foundry D&D5e 6.0 equipment mapping is registered for this Character Forge item ID.",
      },
    ]);
    expect(result.items.some((item) => item.type === "loot"
      && (item.system as { identifier?: string }).identifier === "unmapped-proof-item")).toBe(false);
  });
});