import type { Dnd5eSpellcastingAbilityId } from "./nativeCharacter.js";
import { magicInitiateSpellList, type Dnd5eSpellOption } from "./spellCatalog.js";

export type GuidedPreparedCasterClassId = "bard" | "paladin" | "ranger" | "sorcerer" | "wizard";

export interface Dnd5ePreparedCasterCatalog {
  classId: GuidedPreparedCasterClassId;
  label: string;
  spellcastingAbilityId: Dnd5eSpellcastingAbilityId;
  cantripOptions: readonly Dnd5eSpellOption[];
  preparedSpellOptions: readonly Dnd5eSpellOption[];
  cantripCount: number;
  preparedSpellCount: number;
  alwaysPreparedSpellIds: readonly string[];
  preparationChange: "long-rest-any" | "long-rest-one" | "level-one";
  focusItemIds: readonly string[];
  spellbookCount?: number;
}

const BARD_CANTRIPS = spells([
  "dancing-lights", "light", "mage-hand", "mending", "message", "minor-illusion", "prestidigitation",
  "starry-wisp", "true-strike", "vicious-mockery",
]);
const BARD_LEVEL_ONE = spells([
  "animal-friendship", "bane", "charm-person", "color-spray", "command", "comprehend-languages",
  "cure-wounds", "detect-magic", "disguise-self", "dissonant-whispers", "faerie-fire", "feather-fall",
  "healing-word", "heroism", "hideous-laughter", "identify", "illusory-script", "longstrider",
  "silent-image", "sleep", "speak-with-animals", "thunderwave", "unseen-servant",
]);
const PALADIN_LEVEL_ONE = spells([
  "bless", "command", "cure-wounds", "detect-evil-and-good", "detect-magic", "detect-poison-and-disease",
  "divine-favor", "divine-smite", "heroism", "protection-from-evil-and-good", "purify-food-and-drink",
  "searing-smite", "shield-of-faith",
]);
const RANGER_LEVEL_ONE = spells([
  "alarm", "animal-friendship", "cure-wounds", "detect-magic", "detect-poison-and-disease", "ensnaring-strike",
  "entangle", "fog-cloud", "goodberry", "hunters-mark", "jump", "longstrider", "speak-with-animals",
]);
const SORCERER_CANTRIPS = spells([
  "acid-splash", "chill-touch", "dancing-lights", "elementalism", "fire-bolt", "light", "mage-hand", "mending",
  "message", "minor-illusion", "poison-spray", "prestidigitation", "ray-of-frost", "shocking-grasp",
  "sorcerous-burst", "true-strike",
]);
const SORCERER_LEVEL_ONE = spells([
  "burning-hands", "charm-person", "chromatic-orb", "color-spray", "comprehend-languages", "detect-magic",
  "disguise-self", "expeditious-retreat", "false-life", "feather-fall", "fog-cloud", "grease", "ice-knife",
  "jump", "mage-armor", "magic-missile", "ray-of-sickness", "shield", "silent-image", "sleep", "thunderwave",
]);
const WIZARD = magicInitiateSpellList("wizard");

export const DND5E_PREPARED_CASTER_CATALOGS: Record<GuidedPreparedCasterClassId, Dnd5ePreparedCasterCatalog> = {
  bard: {
    classId: "bard", label: "Bard", spellcastingAbilityId: "charisma",
    cantripOptions: BARD_CANTRIPS, preparedSpellOptions: BARD_LEVEL_ONE,
    cantripCount: 2, preparedSpellCount: 4, alwaysPreparedSpellIds: [],
    preparationChange: "level-one", focusItemIds: ["musical-instrument"],
  },
  paladin: {
    classId: "paladin", label: "Paladin", spellcastingAbilityId: "charisma",
    cantripOptions: [], preparedSpellOptions: PALADIN_LEVEL_ONE,
    cantripCount: 0, preparedSpellCount: 2, alwaysPreparedSpellIds: [],
    preparationChange: "long-rest-one", focusItemIds: ["holy-symbol"],
  },
  ranger: {
    classId: "ranger", label: "Ranger", spellcastingAbilityId: "wisdom",
    cantripOptions: [], preparedSpellOptions: RANGER_LEVEL_ONE.filter((spell) => spell.id !== "hunters-mark"),
    cantripCount: 0, preparedSpellCount: 2, alwaysPreparedSpellIds: ["hunters-mark"],
    preparationChange: "long-rest-one", focusItemIds: ["druidic-focus"],
  },
  sorcerer: {
    classId: "sorcerer", label: "Sorcerer", spellcastingAbilityId: "charisma",
    cantripOptions: SORCERER_CANTRIPS, preparedSpellOptions: SORCERER_LEVEL_ONE,
    cantripCount: 4, preparedSpellCount: 2, alwaysPreparedSpellIds: [],
    preparationChange: "level-one", focusItemIds: ["arcane-focus"],
  },
  wizard: {
    classId: "wizard", label: "Wizard", spellcastingAbilityId: "intelligence",
    cantripOptions: WIZARD.cantrips, preparedSpellOptions: WIZARD.levelOneSpells,
    cantripCount: 3, preparedSpellCount: 4, alwaysPreparedSpellIds: [],
    preparationChange: "long-rest-any", focusItemIds: ["arcane-focus", "spellbook"], spellbookCount: 6,
  },
};

export function preparedCasterCatalog(classId: string): Dnd5ePreparedCasterCatalog | undefined {
  return isPreparedCasterClassId(classId) ? DND5E_PREPARED_CASTER_CATALOGS[classId] : undefined;
}

export function isPreparedCasterClassId(classId: string): classId is GuidedPreparedCasterClassId {
  return classId === "bard" || classId === "paladin" || classId === "ranger" || classId === "sorcerer" || classId === "wizard";
}

function spells(ids: readonly string[]): readonly Dnd5eSpellOption[] {
  return ids.map((id) => ({ id, label: id.split("-").map(capitalize).join(" ") }));
}

function capitalize(part: string): string {
  return part ? part[0]!.toUpperCase() + part.slice(1) : part;
}
