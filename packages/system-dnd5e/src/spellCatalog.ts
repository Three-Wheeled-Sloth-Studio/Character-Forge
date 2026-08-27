export type Dnd5eMagicInitiateSpellListId = "cleric" | "wizard";

export interface Dnd5eSpellChoiceOption {
  id: string;
  label: string;
}

export interface Dnd5eMagicInitiateSpellList {
  id: Dnd5eMagicInitiateSpellListId;
  label: string;
  cantrips: readonly Dnd5eSpellChoiceOption[];
  levelOneSpells: readonly Dnd5eSpellChoiceOption[];
}

const CLERIC_CANTRIPS = [
  "guidance",
  "light",
  "mending",
  "resistance",
  "sacred-flame",
  "spare-the-dying",
  "thaumaturgy",
] as const;

const CLERIC_LEVEL_ONE = [
  "bane",
  "bless",
  "command",
  "create-or-destroy-water",
  "cure-wounds",
  "detect-evil-and-good",
  "detect-magic",
  "detect-poison-and-disease",
  "guiding-bolt",
  "healing-word",
  "inflict-wounds",
  "protection-from-evil-and-good",
  "purify-food-and-drink",
  "sanctuary",
  "shield-of-faith",
] as const;

const WIZARD_CANTRIPS = [
  "acid-splash",
  "chill-touch",
  "dancing-lights",
  "fire-bolt",
  "light",
  "mage-hand",
  "mending",
  "message",
  "minor-illusion",
  "poison-spray",
  "prestidigitation",
  "ray-of-frost",
  "shocking-grasp",
  "thunderclap",
  "true-strike",
] as const;

const WIZARD_LEVEL_ONE = [
  "alarm",
  "burning-hands",
  "charm-person",
  "color-spray",
  "comprehend-languages",
  "detect-magic",
  "disguise-self",
  "expeditious-retreat",
  "false-life",
  "feather-fall",
  "find-familiar",
  "fog-cloud",
  "grease",
  "identify",
  "illusory-script",
  "jump",
  "longstrider",
  "mage-armor",
  "magic-missile",
  "protection-from-evil-and-good",
  "shield",
  "silent-image",
  "sleep",
  "thunderwave",
  "unseen-servant",
] as const;

export const DND5E_MAGIC_INITIATE_SPELL_LISTS: Record<Dnd5eMagicInitiateSpellListId, Dnd5eMagicInitiateSpellList> = {
  cleric: {
    id: "cleric",
    label: "Cleric",
    cantrips: CLERIC_CANTRIPS.map(spellOption),
    levelOneSpells: CLERIC_LEVEL_ONE.map(spellOption),
  },
  wizard: {
    id: "wizard",
    label: "Wizard",
    cantrips: WIZARD_CANTRIPS.map(spellOption),
    levelOneSpells: WIZARD_LEVEL_ONE.map(spellOption),
  },
};

export function magicInitiateSpellList(listId: Dnd5eMagicInitiateSpellListId): Dnd5eMagicInitiateSpellList {
  return DND5E_MAGIC_INITIATE_SPELL_LISTS[listId];
}

function spellOption(id: string): Dnd5eSpellChoiceOption {
  return {
    id,
    label: id
      .split("-")
      .map((part) => part ? part[0]!.toUpperCase() + part.slice(1) : part)
      .join(" "),
  };
}
