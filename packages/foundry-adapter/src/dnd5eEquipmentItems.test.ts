import { describe, expect, it } from "vitest";
import { createFirstSliceNativePayload } from "../../system-dnd5e/src/firstSliceCharacter.js";
import type { Dnd5eNativeCharacter } from "../../system-dnd5e/src/nativeCharacter.js";
import {
  buildFoundryDnd5eEquipmentItems,
  FOUNDRY_DND5E_AMMUNITION_CONTAINER_IDS,
  FOUNDRY_DND5E_ARMOR_SHIELD_IDS,
  FOUNDRY_DND5E_EQUIPMENT_PROOF_IDS,
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
