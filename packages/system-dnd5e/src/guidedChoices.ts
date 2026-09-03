import type { Dnd5eSpellcastingAbilityId } from "./nativeCharacter.js";
import type { Dnd5eClericDivineOrderId } from "./clericCatalog.js";
import type { Dnd5eDruidPrimalOrderId } from "./druidCatalog.js";
import type { GuidedPreparedCasterClassId } from "./preparedCasterCatalog.js";
import type { Dnd5eMagicInitiateSpellListId } from "./spellCatalog.js";
import type { Dnd5eSrdClassId } from "./srdCatalog.js";

export interface Dnd5eChoiceOption { id: string; label: string; supported?: boolean; blockedReason?: string; }
export type Dnd5eDragonbornAncestryId = "black" | "blue" | "brass" | "bronze" | "copper" | "gold" | "green" | "red" | "silver" | "white";
export type Dnd5eGoliathAncestryId = "cloud" | "fire" | "frost" | "hill" | "stone" | "storm";

export interface GuidedDnd5eMagicInitiateChoices {
  spellListId: Dnd5eMagicInitiateSpellListId;
  spellcastingAbilityId: Dnd5eSpellcastingAbilityId;
  cantripIds: [string, string];
  levelOneSpellId: string;
}
export interface GuidedDnd5eClericChoices { divineOrderId: Dnd5eClericDivineOrderId; cantripIds: string[]; preparedSpellIds: string[]; }
export interface GuidedDnd5eDruidChoices { primalOrderId: Dnd5eDruidPrimalOrderId; cantripIds: string[]; preparedSpellIds: string[]; }
export interface GuidedDnd5ePreparedCasterChoices {
  classId: GuidedPreparedCasterClassId;
  cantripIds: string[];
  preparedSpellIds: string[];
  spellbookSpellIds?: string[];
}
export interface GuidedDnd5eHumanChoices {
  size: "small" | "medium";
  skillId: string;
  originFeatId: "alert" | "savage-attacker" | "skilled";
  skilledProficiencyIds?: string[];
}
export interface GuidedDnd5eCoreChoices {
  alignmentId: string;
  originLanguageIds: [string, string];
  classSkillIds: string[];
  classEquipmentChoice: string;
  weaponMasteryIds: string[];
  cleric?: GuidedDnd5eClericChoices;
  druid?: GuidedDnd5eDruidChoices;
  preparedCaster?: GuidedDnd5ePreparedCasterChoices;
  bardInstrumentIds?: string[];
  fightingStyleFeatId?: string;
  monkToolProficiencyId?: string;
  expertiseSkillIds?: string[];
  rogueBonusLanguageId?: string;
  dragonbornAncestryId?: Dnd5eDragonbornAncestryId;
  goliathAncestryId?: Dnd5eGoliathAncestryId;
  magicInitiate?: GuidedDnd5eMagicInitiateChoices;
  human?: GuidedDnd5eHumanChoices;
}

export const DND5E_SPELLCASTING_ABILITY_OPTIONS = [
  { id: "intelligence", label: "Intelligence" }, { id: "wisdom", label: "Wisdom" }, { id: "charisma", label: "Charisma" },
] as const satisfies readonly (Dnd5eChoiceOption & { id: Dnd5eSpellcastingAbilityId })[];

export const DND5E_SKILL_OPTIONS = [
  "acrobatics", "animal-handling", "arcana", "athletics", "deception", "history", "insight", "intimidation",
  "investigation", "medicine", "nature", "perception", "performance", "persuasion", "religion", "sleight-of-hand", "stealth", "survival",
].map((id) => ({ id, label: labelId(id) })) as readonly Dnd5eChoiceOption[];
export const DND5E_STANDARD_LANGUAGE_OPTIONS = ["common-sign-language", "draconic", "dwarvish", "elvish", "giant", "gnomish", "goblin", "halfling", "orc"].map((id) => ({ id, label: labelId(id) })) as readonly Dnd5eChoiceOption[];
export const DND5E_BONUS_LANGUAGE_OPTIONS = [...DND5E_STANDARD_LANGUAGE_OPTIONS, ...["abyssal", "celestial", "deep-speech", "druidic", "infernal", "primordial", "sylvan", "undercommon"].map((id) => ({ id, label: labelId(id) }))] as readonly Dnd5eChoiceOption[];
export const DND5E_ALIGNMENT_OPTIONS = ["lawful-good", "neutral-good", "chaotic-good", "lawful-neutral", "neutral", "chaotic-neutral", "lawful-evil", "neutral-evil", "chaotic-evil"].map((id) => ({ id, label: labelId(id) })) as readonly Dnd5eChoiceOption[];
export const DND5E_FIGHTING_STYLE_OPTIONS = [
  { id: "archery", label: "Archery" }, { id: "defense", label: "Defense" },
  { id: "great-weapon-fighting", label: "Great Weapon Fighting" }, { id: "two-weapon-fighting", label: "Two-Weapon Fighting" },
] as const;
export const DND5E_HUMAN_ORIGIN_FEAT_OPTIONS = [
  { id: "alert", label: "Alert", supported: true }, { id: "savage-attacker", label: "Savage Attacker", supported: true },
  { id: "skilled", label: "Skilled", supported: true },
  { id: "magic-initiate", label: "Magic Initiate", supported: false, blockedReason: "Human-selected Magic Initiate still needs its spell-list and spell choices wired into Human guided state." },
] as const;
export const DND5E_DRAGONBORN_ANCESTRY_OPTIONS = [
  { id: "black", label: "Black · Acid", damageType: "acid" }, { id: "blue", label: "Blue · Lightning", damageType: "lightning" },
  { id: "brass", label: "Brass · Fire", damageType: "fire" }, { id: "bronze", label: "Bronze · Lightning", damageType: "lightning" },
  { id: "copper", label: "Copper · Acid", damageType: "acid" }, { id: "gold", label: "Gold · Fire", damageType: "fire" },
  { id: "green", label: "Green · Poison", damageType: "poison" }, { id: "red", label: "Red · Fire", damageType: "fire" },
  { id: "silver", label: "Silver · Cold", damageType: "cold" }, { id: "white", label: "White · Cold", damageType: "cold" },
] as const satisfies readonly (Dnd5eChoiceOption & { id: Dnd5eDragonbornAncestryId; damageType: string })[];
export const DND5E_GOLIATH_ANCESTRY_OPTIONS = [
  { id: "cloud", label: "Cloud · Cloud's Jaunt" }, { id: "fire", label: "Fire · Fire's Burn" },
  { id: "frost", label: "Frost · Frost's Chill" }, { id: "hill", label: "Hill · Hill's Tumble" },
  { id: "stone", label: "Stone · Stone's Endurance" }, { id: "storm", label: "Storm · Storm's Thunder" },
] as const satisfies readonly (Dnd5eChoiceOption & { id: Dnd5eGoliathAncestryId })[];

const ARTISAN_TOOL_IDS = ["alchemists-supplies", "brewers-supplies", "calligraphers-supplies", "carpenters-tools", "cartographers-tools", "cobblers-tools", "cooks-utensils", "glassblowers-tools", "jewelers-tools", "leatherworkers-tools", "masons-tools", "painters-supplies", "potters-tools", "smiths-tools", "tinkers-tools", "weavers-tools", "woodcarvers-tools"] as const;
const INSTRUMENT_IDS = ["bagpipes", "drum", "dulcimer", "flute", "horn", "lute", "lyre", "pan-flute", "shawm", "viol"] as const;
export const DND5E_MUSICAL_INSTRUMENT_OPTIONS = INSTRUMENT_IDS.map((id) => ({ id: `musical-instrument:${id}`, label: labelId(id) })) as readonly Dnd5eChoiceOption[];
export const DND5E_MONK_TOOL_OPTIONS = [
  ...ARTISAN_TOOL_IDS.map((id) => ({ id: `artisan-tools:${id}`, label: labelId(id) })), ...DND5E_MUSICAL_INSTRUMENT_OPTIONS,
] as readonly Dnd5eChoiceOption[];
export const DND5E_SKILLED_PROFICIENCY_OPTIONS = [
  ...DND5E_SKILL_OPTIONS, ...DND5E_MONK_TOOL_OPTIONS,
  { id: "disguise-kit", label: "Disguise Kit" }, { id: "forgery-kit", label: "Forgery Kit" },
  { id: "gaming-set:dice", label: "Gaming Set: Dice" }, { id: "gaming-set:dragonchess", label: "Gaming Set: Dragonchess" },
  { id: "gaming-set:playing-cards", label: "Gaming Set: Playing Cards" }, { id: "gaming-set:three-dragon-ante", label: "Gaming Set: Three-Dragon Ante" },
  { id: "herbalism-kit", label: "Herbalism Kit" }, { id: "navigators-tools", label: "Navigator's Tools" },
  { id: "poisoners-kit", label: "Poisoner's Kit" }, { id: "thieves-tools", label: "Thieves' Tools" },
] as readonly Dnd5eChoiceOption[];

export interface Dnd5eWeaponChoiceOption extends Dnd5eChoiceOption { category: "simple" | "martial"; finesse: boolean; light: boolean; }
export const DND5E_WEAPON_OPTIONS: readonly Dnd5eWeaponChoiceOption[] = [
  weapon("club", "simple", false, true), weapon("dagger", "simple", true, true), weapon("greatclub", "simple"), weapon("handaxe", "simple", false, true), weapon("javelin", "simple"), weapon("light-hammer", "simple", false, true), weapon("mace", "simple"), weapon("quarterstaff", "simple"), weapon("sickle", "simple", false, true), weapon("spear", "simple"), weapon("dart", "simple", true), weapon("light-crossbow", "simple"), weapon("shortbow", "simple"), weapon("sling", "simple"),
  weapon("battleaxe", "martial"), weapon("flail", "martial"), weapon("glaive", "martial"), weapon("greataxe", "martial"), weapon("greatsword", "martial"), weapon("halberd", "martial"), weapon("lance", "martial"), weapon("longsword", "martial"), weapon("maul", "martial"), weapon("morningstar", "martial"), weapon("pike", "martial"), weapon("rapier", "martial", true), weapon("scimitar", "martial", true, true), weapon("shortsword", "martial", true, true), weapon("trident", "martial"), weapon("warhammer", "martial"), weapon("war-pick", "martial"), weapon("whip", "martial", true), weapon("blowgun", "martial"), weapon("hand-crossbow", "martial", false, true), weapon("heavy-crossbow", "martial"), weapon("longbow", "martial"), weapon("musket", "martial"), weapon("pistol", "martial"),
] as const;

export interface GuidedDnd5eClassChoiceRules {
  skillIds: readonly string[];
  skillCount: number;
  weaponMasteryIds: readonly string[];
  weaponMasteryCount: number;
  equipmentChoices: readonly Dnd5eChoiceOption[];
}
const ALL_WEAPONS = DND5E_WEAPON_OPTIONS.map((option) => option.id);
const ROGUE_WEAPONS = DND5E_WEAPON_OPTIONS.filter((option) => option.category === "simple" || option.finesse || option.light).map((option) => option.id);
const ALL_SKILLS = DND5E_SKILL_OPTIONS.map((option) => option.id);

export const DND5E_GUIDED_CLASS_CHOICE_RULES: Record<Exclude<Dnd5eSrdClassId, "warlock">, GuidedDnd5eClassChoiceRules> = {
  barbarian: { skillIds: ["animal-handling", "athletics", "intimidation", "nature", "perception", "survival"], skillCount: 2, weaponMasteryIds: ALL_WEAPONS, weaponMasteryCount: 2, equipmentChoices: [{ id: "A", label: "Greataxe, 4 Handaxes, Explorer's Pack + 15 GP" }, { id: "B", label: "75 GP" }] },
  bard: { skillIds: ALL_SKILLS, skillCount: 3, weaponMasteryIds: [], weaponMasteryCount: 0, equipmentChoices: [{ id: "A", label: "Leather Armor, 2 Daggers, chosen Musical Instrument, Entertainer's Pack + 19 GP" }, { id: "B", label: "90 GP" }] },
  cleric: { skillIds: ["history", "insight", "medicine", "persuasion", "religion"], skillCount: 2, weaponMasteryIds: [], weaponMasteryCount: 0, equipmentChoices: [{ id: "A", label: "Chain Shirt, Shield, Mace, Holy Symbol, Priest's Pack + 7 GP" }, { id: "B", label: "110 GP" }] },
  druid: { skillIds: ["animal-handling", "arcana", "insight", "medicine", "nature", "perception", "religion", "survival"], skillCount: 2, weaponMasteryIds: [], weaponMasteryCount: 0, equipmentChoices: [{ id: "A", label: "Leather Armor, Shield, Sickle, Druidic Focus (Quarterstaff), Explorer's Pack, Herbalism Kit + 9 GP" }, { id: "B", label: "50 GP" }] },
  fighter: { skillIds: ["acrobatics", "animal-handling", "athletics", "history", "insight", "intimidation", "persuasion", "perception", "survival"], skillCount: 2, weaponMasteryIds: ALL_WEAPONS, weaponMasteryCount: 3, equipmentChoices: [{ id: "A", label: "Chain Mail, Greatsword, Flail, 8 Javelins, Dungeoneer's Pack + 4 GP" }, { id: "B", label: "Studded Leather, Scimitar, Shortsword, Longbow, 20 Arrows, Quiver, Dungeoneer's Pack + 11 GP" }, { id: "C", label: "155 GP" }] },
  monk: { skillIds: ["acrobatics", "athletics", "history", "insight", "religion", "stealth"], skillCount: 2, weaponMasteryIds: [], weaponMasteryCount: 0, equipmentChoices: [{ id: "A", label: "Spear, 5 Daggers, chosen tool/instrument, Explorer's Pack + 11 GP" }, { id: "B", label: "50 GP" }] },
  paladin: { skillIds: ["athletics", "insight", "intimidation", "medicine", "persuasion", "religion"], skillCount: 2, weaponMasteryIds: ALL_WEAPONS, weaponMasteryCount: 2, equipmentChoices: [{ id: "A", label: "Chain Mail, Shield, Longsword, 6 Javelins, Holy Symbol, Priest's Pack + 9 GP" }, { id: "B", label: "150 GP" }] },
  ranger: { skillIds: ["animal-handling", "athletics", "insight", "investigation", "nature", "perception", "stealth", "survival"], skillCount: 3, weaponMasteryIds: ALL_WEAPONS, weaponMasteryCount: 2, equipmentChoices: [{ id: "A", label: "Studded Leather, Scimitar, Shortsword, Longbow, 20 Arrows, Quiver, Druidic Focus, Explorer's Pack + 7 GP" }, { id: "B", label: "150 GP" }] },
  rogue: { skillIds: ["acrobatics", "athletics", "deception", "insight", "intimidation", "investigation", "perception", "persuasion", "sleight-of-hand", "stealth"], skillCount: 4, weaponMasteryIds: ROGUE_WEAPONS, weaponMasteryCount: 2, equipmentChoices: [{ id: "A", label: "Leather Armor, 2 Daggers, Shortsword, Shortbow, 20 Arrows, Quiver, Thieves' Tools, Burglar's Pack + 8 GP" }, { id: "B", label: "100 GP" }] },
  sorcerer: { skillIds: ["arcana", "deception", "insight", "intimidation", "persuasion", "religion"], skillCount: 2, weaponMasteryIds: [], weaponMasteryCount: 0, equipmentChoices: [{ id: "A", label: "Spear, 2 Daggers, Arcane Focus (Crystal), Dungeoneer's Pack + 28 GP" }, { id: "B", label: "50 GP" }] },
  wizard: { skillIds: ["arcana", "history", "insight", "investigation", "medicine", "nature", "religion"], skillCount: 2, weaponMasteryIds: [], weaponMasteryCount: 0, equipmentChoices: [{ id: "A", label: "2 Daggers, Arcane Focus (Quarterstaff), Robe, Spellbook, Scholar's Pack + 5 GP" }, { id: "B", label: "55 GP" }] },
};

export function classChoiceRules(classId: Dnd5eSrdClassId): GuidedDnd5eClassChoiceRules | undefined {
  return classId === "warlock" ? undefined : DND5E_GUIDED_CLASS_CHOICE_RULES[classId];
}
export function labelId(value: string): string { return value.split(":").at(-1)!.split("-").map((part) => part ? part[0]!.toUpperCase() + part.slice(1) : part).join(" "); }
function weapon(id: string, category: "simple" | "martial", finesse = false, light = false): Dnd5eWeaponChoiceOption { return { id, label: labelId(id), category, finesse, light }; }
