import { describe, expect, it } from "vitest";
import {
  DND5E_MARKOV_NAME_PROVIDER,
  matchingDnd5eNameSuggestion,
  resolveDnd5eCharacterName,
  suggestDnd5eCharacterName,
} from "./nameGeneration.js";
import {
  DND5E_DEMO_FAMILY_NAME_CORPUS,
  DND5E_DEMO_GIVEN_NAME_CORPUS,
  DND5E_DEMO_NAME_CORPUS_SOURCE,
} from "./nameGenerationCorpus.js";

describe("D&D name suggestion provider", () => {
  it("replays deterministically through the shared Markov generator for an explicit seed", () => {
    const seed = "dnd-name-replay";
    const suggestion = suggestDnd5eCharacterName(seed);

    expect(suggestion.result.displayName).toBe(resolveDnd5eCharacterName(undefined, seed));
    expect(suggestDnd5eCharacterName(seed)).toEqual(suggestion);
    expect(suggestion.result.displayName).toContain(" ");
  });

  it("keeps the demonstration corpus separate from D&D rules and records its source version", () => {
    const suggestion = suggestDnd5eCharacterName("source-boundary");

    expect(suggestion.provenance).toMatchObject({
      providerId: DND5E_MARKOV_NAME_PROVIDER.id,
      providerVersion: DND5E_MARKOV_NAME_PROVIDER.version,
      sources: [DND5E_DEMO_NAME_CORPUS_SOURCE],
      seed: "source-boundary",
    });
    expect(DND5E_DEMO_NAME_CORPUS_SOURCE.id).toContain("demo-name-corpus");
  });

  it("generates from observed character sequences instead of selecting whole corpus entries", () => {
    const suggestion = suggestDnd5eCharacterName("markov-not-pick-list");
    const [givenName, familyName] = suggestion.result.displayName.split(" ");

    expect(givenName).toBeTruthy();
    expect(familyName).toBeTruthy();
    expect(DND5E_DEMO_GIVEN_NAME_CORPUS).not.toContain(givenName as typeof DND5E_DEMO_GIVEN_NAME_CORPUS[number]);
    expect(DND5E_DEMO_FAMILY_NAME_CORPUS).not.toContain(familyName as typeof DND5E_DEMO_FAMILY_NAME_CORPUS[number]);
  });

  it("keeps only current, replayable D&D suggestions attached to a matching submitted name", () => {
    const suggestion = suggestDnd5eCharacterName("matching-name");
    expect(matchingDnd5eNameSuggestion(suggestion.result.displayName, suggestion)).toBe(suggestion);
    expect(matchingDnd5eNameSuggestion("Manual Override", suggestion)).toBeUndefined();
    expect(matchingDnd5eNameSuggestion(suggestion.result.displayName, {
      ...suggestion,
      provenance: { ...suggestion.provenance, providerVersion: "stale" },
    })).toBeUndefined();
  });

  it("keeps direct user entry authoritative over generated suggestions", () => {
    expect(resolveDnd5eCharacterName("  Player Chosen  ", "ignored-seed")).toBe("Player Chosen");
  });
});
