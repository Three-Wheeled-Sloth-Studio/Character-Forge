import { magicInitiateSpellList } from "./spellCatalog.js";

export type Dnd5eDruidPrimalOrderId = "magician" | "warden";

export const DND5E_DRUID_PRIMAL_ORDER_OPTIONS = [
  { id: "magician", label: "Magician" },
  { id: "warden", label: "Warden" },
] as const satisfies readonly { id: Dnd5eDruidPrimalOrderId; label: string }[];

const DRUID_LIST = magicInitiateSpellList("druid");

export const DND5E_DRUID_CANTRIP_OPTIONS = DRUID_LIST.cantrips;
export const DND5E_DRUID_LEVEL_ONE_SPELL_OPTIONS = DRUID_LIST.levelOneSpells;

export function druidCantripCount(primalOrderId: Dnd5eDruidPrimalOrderId): number {
  return primalOrderId === "magician" ? 3 : 2;
}
