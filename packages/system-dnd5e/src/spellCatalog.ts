export interface Dnd5eSpellOption {
  id: string;
  label: string;
}

export type Dnd5eMagicInitiateSpellListId = "cleric" | "druid" | "wizard";

const CLERIC_CANTRIP_IDS = [
  "guidance", "light", "mending", "resistance", "sacred-flame", "spare-the-dying", "thaumaturgy",
] as const;

const CLERIC_LEVEL_ONE_SPELL_IDS = [
  "bane", "bless", "command", "create-or-destroy-water", "cure-wounds", "detect-evil-and-good",
  "detect-magic", "detect-poison-and-disease", "guiding-bolt", "healing-word", "inflict-wounds",
  "protection-from-evil-and-good", "purify-food-and-drink", "sanctuary", "shield-of-faith",
] as const;

const DRUID_CANTRIP_IDS = [
  "druidcraft", "elementalism", "guidance", "mending", "message", "poison-spray", "produce-flame",
  "resistance", "shillelagh", "spare-the-dying", "starry-wisp", "thorn-whip", "thunderclap",
] as const;

const DRUID_LEVEL_ONE_SPELL_IDS = [
  "animal-friendship", "charm-person", "create-or-destroy-water", "cure-wounds", "detect-magic",
  "detect-poison-and-disease", "entangle", "faerie-fire", "fog-cloud", "goodberry", "healing-word",
  "ice-knife", "jump", "longstrider", "protection-from-evil-and-good", "purify-food-and-drink",
  "speak-with-animals", "thunderwave",
] as const;

const WIZARD_CANTRIP_IDS = [
  "acid-splash", "blade-ward", "chill-touch", "dancing-lights", "elementalism", "fire-bolt", "friends",
  "light", "mage-hand", "mending", "message", "minor-illusion", "poison-spray", "prestidigitation", "true-strike",
] as const;

const WIZARD_LEVEL_ONE_SPELL_IDS = [
  "alarm", "burning-hands", "charm-person", "chromatic-orb", "color-spray", "comprehend-languages",
  "detect-magic", "disguise-self", "expeditious-retreat", "false-life", "feather-fall", "find-familiar",
  "fog-cloud", "grease", "identify", "illusory-script", "jump", "longstrider", "mage-armor", "magic-missile",
  "protection-from-evil-and-good", "ray-of-sickness", "shield", "sleep", "tashas-hideous-laughter",
] as const;

export interface Dnd5eMagicInitiateSpellList {
  id: Dnd5eMagicInitiateSpellListId;
  label: string;
  cantrips: readonly Dnd5eSpellOption[];
  levelOneSpells: readonly Dnd5eSpellOption[];
}

export const DND5E_MAGIC_INITIATE_SPELL_LISTS: Record<Dnd5eMagicInitiateSpellListId, Dnd5eMagicInitiateSpellList> = {
  cleric: {
    id: "cleric",
    label: "Cleric",
    cantrips: CLERIC_CANTRIP_IDS.map(spellOption),
    levelOneSpells: CLERIC_LEVEL_ONE_SPELL_IDS.map(spellOption),
  },
  druid: {
    id: "druid",
    label: "Druid",
    cantrips: DRUID_CANTRIP_IDS.map(spellOption),
    levelOneSpells: DRUID_LEVEL_ONE_SPELL_IDS.map(spellOption),
  },
  wizard: {
    id: "wizard",
    label: "Wizard",
    cantrips: WIZARD_CANTRIP_IDS.map(spellOption),
    levelOneSpells: WIZARD_LEVEL_ONE_SPELL_IDS.map(spellOption),
  },
};

export function magicInitiateSpellList(listId: Dnd5eMagicInitiateSpellListId): Dnd5eMagicInitiateSpellList {
  return DND5E_MAGIC_INITIATE_SPELL_LISTS[listId];
}

function spellOption(id: string): Dnd5eSpellOption {
  return { id, label: id.split("-").map((part) => part ? part[0]!.toUpperCase() + part.slice(1) : part).join(" ") };
}
