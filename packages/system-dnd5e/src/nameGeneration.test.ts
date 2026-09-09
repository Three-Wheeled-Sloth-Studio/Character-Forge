import { describe, expect, it } from "vitest";
import {
  DND5E_PLACEHOLDER_NAME_PROVIDER,
  resolveDnd5eCharacterName,
  suggestDnd5eCharacterName,
} from "./nameGeneration.js";

describe("D&D name suggestion provider", () => {
  it("preserves the existing deterministic placeholder-name behavior for an explicit seed", () => {
    const seed = "dnd-name-replay";
    const suggestion = suggestDnd5eCharacterName(seed);

    expect(suggestion.result.displayName).toBe(resolveDnd5eCharacterName(undefined, seed));
    expect(suggestDnd5eCharacterName(seed)).toEqual(suggestion);
  });

  it("identifies the temporary dataset as Character Forge placeholder content, not SRD identity data", () => {
    const suggestion = suggestDnd5eCharacterName("source-boundary");

    expect(suggestion.provenance).toMatchObject({
      providerId: DND5E_PLACEHOLDER_NAME_PROVIDER.id,
      providerVersion: DND5E_PLACEHOLDER_NAME_PROVIDER.version,
      sources: [{ id: "character-forge.dnd5e.placeholder-names", version: "1" }],
      seed: "source-boundary",
    });
  });

  it("keeps direct user entry authoritative over generated suggestions", () => {
    expect(resolveDnd5eCharacterName("  Player Chosen  ", "ignored-seed")).toBe("Player Chosen");
  });
});
