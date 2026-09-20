import { describe, expect, it } from "vitest";
import { createFirstSliceNativePayload } from "../../system-dnd5e/src/firstSliceCharacter.js";
import type { Dnd5eNativeCharacter } from "../../system-dnd5e/src/nativeCharacter.js";
import {
  buildFoundryDnd5eEquipmentItems,
  FOUNDRY_DND5E_AMMUNITION_CONTAINER_IDS,
  FOUNDRY_DND5E_ARMOR_SHIELD_IDS,
  FOUNDRY_DND5E_DIRECT_TOOL_IDS,
  FOUNDRY_DND5E_EQUIPMENT_PROOF_IDS,
  FOUNDRY_DND5E_MARTIAL_WEAPON_IDS,
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
        { itemId: "artisan-tools:smiths-tools", quantity: 1 },
      ],
    };

    const first = buildFoundryDnd5eEquipmentItems("character-simple-weapons", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-simple-weapons", payload);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(FOUNDRY_DND5E_SIMPLE_WEAPON_IDS.length);
    expect(first.unsupported).toEqual([
      {
        itemId: "artisan-tools:smiths-tools",
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
        { itemId: "artisan-tools:smiths-tools", quantity: 1 },
      ],
    };

    const first = buildFoundryDnd5eEquipmentItems("character-martial-weapons", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-martial-weapons", payload);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(FOUNDRY_DND5E_MARTIAL_WEAPON_IDS.length);
    expect(first.unsupported).toEqual([
      {
        itemId: "artisan-tools:smiths-tools",
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

  it("maps direct tool concepts while keeping compound tool translation deferred", () => {
    const original = createFirstSliceNativePayload();
    const payload: Dnd5eNativeCharacter = {
      ...original,
      equipment: [
        ...FOUNDRY_DND5E_DIRECT_TOOL_IDS.map((itemId) => ({ itemId, quantity: 2 })),
        { itemId: "artisan-tools:smiths-tools", quantity: 1 },
      ],
    };

    const first = buildFoundryDnd5eEquipmentItems("character-direct-tools", payload);
    const second = buildFoundryDnd5eEquipmentItems("character-direct-tools", payload);
    expect(first.items).toEqual(second.items);
    expect(first.items).toHaveLength(FOUNDRY_DND5E_DIRECT_TOOL_IDS.length);
    expect(first.unsupported).toEqual([
      {
        itemId: "artisan-tools:smiths-tools",
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