import { describe, expect, it } from "vitest";
import { createFirstSliceNativePayload } from "../../system-dnd5e/src/firstSliceCharacter.js";
import type { Dnd5eNativeCharacter } from "../../system-dnd5e/src/nativeCharacter.js";
import {
  buildFoundryDnd5eEquipmentItems,
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
