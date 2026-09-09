import {
  NAME_SUGGESTION_CONTRACT_VERSION,
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

export type Dnd5eNameSuggestion = NameSuggestion;

export function pickDnd5eGeneratedName(random: RandomSource): string {
  const selected = DND5E_GENERATED_NAMES[Math.floor(random() * DND5E_GENERATED_NAMES.length)];
  if (!selected) throw new Error("D&D generated-name catalog is empty.");
  return selected;
}

export function suggestDnd5eCharacterName(seed?: string): Dnd5eNameSuggestion {
  return suggestGeneratedName(DND5E_PLACEHOLDER_NAME_PROVIDER, {
    context: undefined,
    ...(seed?.trim() ? { seed } : {}),
  });
}

export function matchingDnd5eNameSuggestion(
  name: string,
  suggestion?: Dnd5eNameSuggestion | null,
): Dnd5eNameSuggestion | undefined {
  if (!suggestion || suggestion.result.displayName.trim() !== name.trim()) return undefined;
  const provenance = suggestion.provenance;
  if (
    provenance.contractVersion !== NAME_SUGGESTION_CONTRACT_VERSION
    || provenance.providerId !== DND5E_PLACEHOLDER_NAME_PROVIDER.id
    || provenance.providerVersion !== DND5E_PLACEHOLDER_NAME_PROVIDER.version
    || !provenance.seed.trim()
  ) return undefined;

  const expectedSources = DND5E_PLACEHOLDER_NAME_PROVIDER.sources ?? [];
  if (provenance.sources.length !== expectedSources.length) return undefined;
  if (expectedSources.some((source, index) => (
    provenance.sources[index]?.id !== source.id
    || provenance.sources[index]?.version !== source.version
  ))) return undefined;

  const replay = suggestDnd5eCharacterName(provenance.seed);
  return replay.result.displayName === suggestion.result.displayName ? suggestion : undefined;
}

export function resolveDnd5eCharacterName(name?: string, seed?: string): string {
  const explicit = name?.trim();
  if (explicit) return explicit;
  return suggestDnd5eCharacterName(seed).result.displayName;
}
