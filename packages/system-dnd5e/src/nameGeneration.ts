import {
  suggestGeneratedName,
  type NameSuggestion,
  type NameSuggestionProvider,
  type RandomSource,
} from "../../generator-core/src/index.js";

const DND5E_GENERATED_NAMES = [
  "Avery Stone",
  "Mara Voss",
  "Rowan Hale",
  "Tamsin Reed",
  "Jonas Vale",
  "Nia Calder",
] as const;

export const DND5E_PLACEHOLDER_NAME_PROVIDER: NameSuggestionProvider<undefined> = {
  id: "dnd5e:placeholder-display-name",
  version: "0.1",
  sources: [{ id: "character-forge.dnd5e.placeholder-names", version: "1" }],
  generate(_context, random) {
    return { displayName: pickDnd5eGeneratedName(random) };
  },
};

export function pickDnd5eGeneratedName(random: RandomSource): string {
  const selected = DND5E_GENERATED_NAMES[Math.floor(random() * DND5E_GENERATED_NAMES.length)];
  if (!selected) throw new Error("D&D generated-name catalog is empty.");
  return selected;
}

export function suggestDnd5eCharacterName(seed?: string): NameSuggestion {
  return suggestGeneratedName(DND5E_PLACEHOLDER_NAME_PROVIDER, {
    context: undefined,
    ...(seed?.trim() ? { seed } : {}),
  });
}

export function resolveDnd5eCharacterName(name?: string, seed?: string): string {
  const explicit = name?.trim();
  if (explicit) return explicit;
  return suggestDnd5eCharacterName(seed).result.displayName;
}
