import { describe, expect, it } from "vitest";
import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  creatorRandomizationHelp,
  creatorRandomizeAllAvailable,
  creatorRandomizerSelector,
  creatorSystemForCharacter,
  defaultCreatorSystem,
} from "./creatorWorkspace.js";

function character(systemId: string, editionId: string): CharacterDocument {
  return {
    schemaVersion: "character-document/0.1",
    characterId: "character-test",
    displayName: "Test",
    primaryNativeStateId: "native-test",
    nativeStates: [{
      id: "native-test",
      systemId,
      editionId,
      rulesVersion: "test",
      schemaVersion: "test",
      payload: {},
      provenance: { origin: "generated" },
    }],
  };
}

describe("creator workspace system routing", () => {
  it("preserves D&D as the creator default", () => {
    expect(defaultCreatorSystem()).toBe("dnd5e-2024");
  });

  it("routes supported native states without reading semantic projection", () => {
    expect(creatorSystemForCharacter(character("dnd5e", "2024"))).toBe("dnd5e-2024");
    expect(creatorSystemForCharacter(character("brp", "uge-2023"))).toBe("brp-uge");
    expect(creatorSystemForCharacter(character("unknown", "1"))).toBeNull();
  });

  it("keeps Randomize All orchestration separate from system random semantics", () => {
    expect(creatorRandomizerSelector("dnd5e-2024")).toBe(".icon-button[id$='-random'], #creator-random-roll");
    expect(creatorRandomizerSelector("brp-uge")).toBe("#brp-profession-random, #brp-reroll");
    expect(creatorRandomizerSelector("brp-uge")).not.toContain("academic");
  });

  it("makes intentionally unrandomized BRP fields explicit", () => {
    const help = creatorRandomizationHelp("brp-uge");
    expect(help).toContain("Age");
    expect(help).toContain("Gender");
    expect(help).toContain("Wealth");
    expect(help).toContain("stay unchanged");
  });

  it("does not expose Randomize All while D&D Quick mode owns generation", () => {
    expect(creatorRandomizeAllAvailable("dnd5e-2024", "guided")).toBe(true);
    expect(creatorRandomizeAllAvailable("dnd5e-2024", "quick")).toBe(false);
    expect(creatorRandomizeAllAvailable("brp-uge", "quick")).toBe(true);
    expect(creatorRandomizationHelp("dnd5e-2024", "quick")).toContain("hidden in Quick mode");
  });
});
