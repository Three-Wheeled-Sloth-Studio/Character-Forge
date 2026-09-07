import type { Dnd5eSpellOption } from "./spellCatalog.js";

export type Dnd5eLevelOneEldritchInvocationId =
  | "armor-of-shadows"
  | "eldritch-mind"
  | "pact-of-the-blade"
  | "pact-of-the-chain"
  | "pact-of-the-tome";

export interface Dnd5eLevelOneEldritchInvocationOption {
  id: Dnd5eLevelOneEldritchInvocationId;
  label: string;
  description: string;
  requiresTomeChoices?: boolean;
}

export const DND5E_LEVEL_ONE_ELDRITCH_INVOCATION_OPTIONS: readonly Dnd5eLevelOneEldritchInvocationOption[] = [
  { id: "armor-of-shadows", label: "Armor of Shadows", description: "Cast Mage Armor on yourself without expending a spell slot." },
  { id: "eldritch-mind", label: "Eldritch Mind", description: "Gain Advantage on Constitution saving throws made to maintain Concentration." },
  { id: "pact-of-the-blade", label: "Pact of the Blade", description: "Conjure or bond a melee pact weapon; its weapon choice is made when the feature is used, not during character creation." },
  { id: "pact-of-the-chain", label: "Pact of the Chain", description: "Learn Find Familiar and cast it without a spell slot; familiar form is chosen when the spell is cast." },
  { id: "pact-of-the-tome", label: "Pact of the Tome", description: "Conjure a Book of Shadows containing three cantrips and two Level 1 ritual spells chosen when the book appears.", requiresTomeChoices: true },
] as const;

export const DND5E_WARLOCK_CANTRIP_OPTIONS: readonly Dnd5eSpellOption[] = spells([
  "blade-ward", "chill-touch", "eldritch-blast", "friends", "mage-hand", "mind-sliver", "minor-illusion",
  "poison-spray", "prestidigitation", "thunderclap", "toll-the-dead", "true-strike",
]);

export const DND5E_WARLOCK_LEVEL_ONE_SPELL_OPTIONS: readonly Dnd5eSpellOption[] = spells([
  "armor-of-agathys", "arms-of-hadar", "bane", "charm-person", "comprehend-languages", "detect-magic",
  "expeditious-retreat", "hellish-rebuke", "hex", "hideous-laughter", "illusory-script",
  "protection-from-evil-and-good", "speak-with-animals", "unseen-servant", "witch-bolt",
]);

export const DND5E_PACT_TOME_CANTRIP_OPTIONS: readonly Dnd5eSpellOption[] = spells([
  "acid-splash", "blade-ward", "chill-touch", "dancing-lights", "druidcraft", "eldritch-blast", "elementalism",
  "fire-bolt", "friends", "guidance", "light", "mage-hand", "mending", "message", "mind-sliver", "minor-illusion",
  "poison-spray", "prestidigitation", "produce-flame", "ray-of-frost", "resistance", "sacred-flame", "shillelagh",
  "shocking-grasp", "sorcerous-burst", "spare-the-dying", "starry-wisp", "thaumaturgy", "thorn-whip", "thunderclap",
  "toll-the-dead", "true-strike", "vicious-mockery",
]);

export const DND5E_PACT_TOME_LEVEL_ONE_RITUAL_OPTIONS: readonly Dnd5eSpellOption[] = spells([
  "alarm", "comprehend-languages", "detect-magic", "detect-poison-and-disease", "find-familiar", "floating-disk",
  "identify", "illusory-script", "purify-food-and-drink", "speak-with-animals", "unseen-servant",
]);

export function pactTomeCantripOptionsExcluding(alreadyPreparedSpellIds: readonly string[]): readonly Dnd5eSpellOption[] {
  return pactTomeOptionsExcluding(DND5E_PACT_TOME_CANTRIP_OPTIONS, alreadyPreparedSpellIds);
}

export function pactTomeRitualSpellOptionsExcluding(alreadyPreparedSpellIds: readonly string[]): readonly Dnd5eSpellOption[] {
  return pactTomeOptionsExcluding(DND5E_PACT_TOME_LEVEL_ONE_RITUAL_OPTIONS, alreadyPreparedSpellIds);
}

export function isLevelOneEldritchInvocationId(value: string): value is Dnd5eLevelOneEldritchInvocationId {
  return DND5E_LEVEL_ONE_ELDRITCH_INVOCATION_OPTIONS.some((option) => option.id === value);
}

function pactTomeOptionsExcluding(options: readonly Dnd5eSpellOption[], alreadyPreparedSpellIds: readonly string[]): readonly Dnd5eSpellOption[] {
  const alreadyPrepared = new Set(alreadyPreparedSpellIds);
  return options.filter((option) => !alreadyPrepared.has(option.id));
}

function spells(ids: readonly string[]): readonly Dnd5eSpellOption[] {
  return ids.map((id) => ({ id, label: id.split("-").map(capitalize).join(" ") }));
}

function capitalize(part: string): string {
  return part ? part[0]!.toUpperCase() + part.slice(1) : part;
}
