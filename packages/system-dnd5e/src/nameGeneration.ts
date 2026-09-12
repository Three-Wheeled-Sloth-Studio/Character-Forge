import type { CharacterDocument, GenerationDecision, JsonObject } from "../../character-model/src/index.js";
import {
  NAME_MARKOV_GENERATOR_VERSION,
  NAME_SUGGESTION_CONTRACT_VERSION,
  generateNameFromMarkovModel,
  suggestGeneratedName,
  trainNameMarkovModel,
  type NameSuggestion,
  type NameSuggestionProvider,
  type RandomSource,
} from "../../generator-core/src/index.js";
import {
  DND5E_DEMO_FAMILY_NAME_CORPUS,
  DND5E_DEMO_GIVEN_NAME_CORPUS,
  DND5E_DEMO_NAME_CORPUS_SOURCE,
} from "./nameGenerationCorpus.js";

const DND5E_GIVEN_NAME_MODEL = trainNameMarkovModel(DND5E_DEMO_GIVEN_NAME_CORPUS, { order: 2 });
const DND5E_FAMILY_NAME_MODEL = trainNameMarkovModel(DND5E_DEMO_FAMILY_NAME_CORPUS, { order: 2 });
const DND5E_GIVEN_NAME_SAMPLES = new Set<string>(DND5E_DEMO_GIVEN_NAME_CORPUS);
const DND5E_FAMILY_NAME_SAMPLES = new Set<string>(DND5E_DEMO_FAMILY_NAME_CORPUS);

export const DND5E_MARKOV_NAME_PROVIDER: NameSuggestionProvider<undefined> = {
  id: "dnd5e:demo-markov-display-name",
  version: `0.2-${NAME_MARKOV_GENERATOR_VERSION}`,
  sources: [DND5E_DEMO_NAME_CORPUS_SOURCE],
  generate(_context, random) {
    return { displayName: pickDnd5eGeneratedName(random) };
  },
};

// Compatibility alias for callers that imported the original temporary provider
// constant. New code should use DND5E_MARKOV_NAME_PROVIDER.
export const DND5E_PLACEHOLDER_NAME_PROVIDER = DND5E_MARKOV_NAME_PROVIDER;

export type Dnd5eNameSuggestion = NameSuggestion;
export type Dnd5eNameSuggestionTrigger = "explicit-randomize" | "blank-fallback";

export function pickDnd5eGeneratedName(random: RandomSource): string {
  const givenName = generateNameFromMarkovModel(DND5E_GIVEN_NAME_MODEL, random, {
    minLength: 3,
    maxLength: 10,
    accept: (candidate) => !DND5E_GIVEN_NAME_SAMPLES.has(candidate),
  });
  const familyName = generateNameFromMarkovModel(DND5E_FAMILY_NAME_MODEL, random, {
    minLength: 4,
    maxLength: 12,
    accept: (candidate) => !DND5E_FAMILY_NAME_SAMPLES.has(candidate),
  });
  return `${givenName} ${familyName}`;
}

export function suggestDnd5eCharacterName(seed?: string): Dnd5eNameSuggestion {
  return suggestGeneratedName(DND5E_MARKOV_NAME_PROVIDER, {
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
    || provenance.providerId !== DND5E_MARKOV_NAME_PROVIDER.id
    || provenance.providerVersion !== DND5E_MARKOV_NAME_PROVIDER.version
    || !provenance.seed.trim()
  ) return undefined;

  const expectedSources = DND5E_MARKOV_NAME_PROVIDER.sources ?? [];
  if (provenance.sources.length !== expectedSources.length) return undefined;
  if (expectedSources.some((source, index) => (
    provenance.sources[index]?.id !== source.id
    || provenance.sources[index]?.version !== source.version
  ))) return undefined;

  const replay = suggestDnd5eCharacterName(provenance.seed);
  return replay.result.displayName === suggestion.result.displayName ? suggestion : undefined;
}

export function createDnd5eNameSuggestionDecision(
  suggestion: Dnd5eNameSuggestion,
  trigger: Dnd5eNameSuggestionTrigger,
): GenerationDecision {
  const current = matchingDnd5eNameSuggestion(suggestion.result.displayName, suggestion);
  if (!current) throw new Error("D&D name suggestion provenance is stale or not replayable.");
  const provenance: JsonObject = {
    contractVersion: current.provenance.contractVersion,
    providerId: current.provenance.providerId,
    providerVersion: current.provenance.providerVersion,
    sources: current.provenance.sources.map((source) => ({ id: source.id, version: source.version })),
    seed: current.provenance.seed,
  };
  const answer: JsonObject = { displayName: current.result.displayName, trigger, provenance };
  return {
    stepId: "identity.name.suggestion",
    answer,
    rationale: trigger === "explicit-randomize"
      ? "Retained provider provenance for the accepted randomize-name suggestion."
      : "Retained provider provenance for blank-name fallback generation.",
  };
}

export function applyDnd5eNameSuggestion(
  character: CharacterDocument,
  suggestion: Dnd5eNameSuggestion,
  trigger: Dnd5eNameSuggestionTrigger = "explicit-randomize",
): CharacterDocument {
  const current = matchingDnd5eNameSuggestion(character.displayName, suggestion);
  if (!current) throw new Error("D&D name suggestion does not match the authoritative character display name.");
  const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId);
  if (!nativeState || nativeState.systemId !== "dnd5e" || nativeState.editionId !== "2024") {
    throw new Error("D&D name suggestion can only be applied to a D&D 5E 2024 character.");
  }
  const payload = nativeState.payload as { identity?: { name?: unknown } };
  if (payload.identity?.name !== character.displayName) {
    throw new Error("D&D name suggestion does not match the authoritative native identity name.");
  }
  if (!character.generation) throw new Error("D&D name suggestion requires retained generation provenance.");

  const decisions = character.generation.decisions
    .filter((decision) => decision.stepId !== "identity.name.suggestion")
    .map((decision) => decision.stepId === "identity.name"
      ? { ...decision, answer: character.displayName, rationale: trigger === "explicit-randomize" ? "Generated by the user's explicit randomize-name action." : "Generated because the name field was left blank." }
      : decision);
  decisions.push(createDnd5eNameSuggestionDecision(current, trigger));

  return {
    ...character,
    generation: { ...character.generation, decisions },
  };
}

export function resolveDnd5eCharacterName(name?: string, seed?: string): string {
  const explicit = name?.trim();
  if (explicit) return explicit;
  return suggestDnd5eCharacterName(seed).result.displayName;
}
