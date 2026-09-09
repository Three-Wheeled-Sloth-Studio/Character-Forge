import { describe, expect, it } from "vitest";
import {
  NAME_SUGGESTION_CONTRACT_VERSION,
  suggestGeneratedName,
  type NameSuggestionProvider,
} from "./nameSuggestion.js";

interface FixtureContext {
  prefix: string;
}

const provider: NameSuggestionProvider<FixtureContext> = {
  id: "fixture-names",
  version: "1",
  sources: [{ id: "fixture-source", version: "2026-09" }],
  generate(context, random) {
    const value = random() < 0.5 ? "Avery" : "Rowan";
    return { displayName: `${context.prefix}${value}` };
  },
};

describe("structured name suggestion contract", () => {
  it("replays deterministically from provider version, caller context, and retained seed", () => {
    const first = suggestGeneratedName(provider, { context: { prefix: "Captain " }, seed: "name-replay" });
    const second = suggestGeneratedName(provider, { context: { prefix: "Captain " }, seed: "name-replay" });

    expect(first).toEqual(second);
    expect(first.provenance).toEqual({
      contractVersion: NAME_SUGGESTION_CONTRACT_VERSION,
      providerId: "fixture-names",
      providerVersion: "1",
      sources: [{ id: "fixture-source", version: "2026-09" }],
      seed: "name-replay",
    });
  });

  it("keeps naming context provider-owned instead of defining shared species or culture fields", () => {
    const plain = suggestGeneratedName(provider, { context: { prefix: "" }, seed: "opaque-context" });
    const titled = suggestGeneratedName(provider, { context: { prefix: "Dr. " }, seed: "opaque-context" });

    expect(titled.result.displayName).toBe(`Dr. ${plain.result.displayName}`);
    expect(titled.provenance.seed).toBe(plain.provenance.seed);
  });

  it("creates replay provenance when the caller does not supply a seed", () => {
    const suggestion = suggestGeneratedName(provider, { context: { prefix: "" } });
    expect(suggestion.provenance.seed).toMatch(/^name-/);
    expect(suggestion.result.displayName.length).toBeGreaterThan(0);
  });

  it("rejects invalid provider identity, duplicate sources, and blank generated names", () => {
    expect(() => suggestGeneratedName({ ...provider, id: " " }, { context: { prefix: "" }, seed: "x" })).toThrow("provider id");
    expect(() => suggestGeneratedName({
      ...provider,
      sources: [{ id: "same", version: "1" }, { id: "same", version: "1" }],
    }, { context: { prefix: "" }, seed: "x" })).toThrow("Duplicate name suggestion source");
    expect(() => suggestGeneratedName({
      ...provider,
      generate: () => ({ displayName: "   " }),
    }, { context: { prefix: "" }, seed: "x" })).toThrow("Generated display name");
  });
});
