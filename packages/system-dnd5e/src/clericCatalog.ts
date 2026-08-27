import type { Dnd5eChoiceOption } from "./guidedChoices.js";
import { magicInitiateSpellList } from "./spellCatalog.js";

export type Dnd5eClericDivineOrderId = "protector" | "thaumaturge";

export const DND5E_CLERIC_DIVINE_ORDER_OPTIONS = [
  { id: "protector", label: "Protector" },
  { id: "thaumaturge", label: "Thaumaturge" },
] as const satisfies readonly (Dnd5eChoiceOption & { id: Dnd5eClericDivineOrderId })[];

export const DND5E_CLERIC_CANTRIP_OPTIONS = magicInitiateSpellList("cleric").cantrips;
export const DND5E_CLERIC_LEVEL_ONE_SPELL_OPTIONS = magicInitiateSpellList("cleric").levelOneSpells;

export function clericCantripCount(orderId: Dnd5eClericDivineOrderId): number {
  return orderId === "thaumaturge" ? 4 : 3;
}
