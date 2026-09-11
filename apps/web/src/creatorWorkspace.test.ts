import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  creatorRandomizationHelp,
  creatorRandomizeAllAvailable,
  creatorRandomizerSelector,
  creatorSystemForCharacter,
  defaultCreatorSystem,
} from "./creatorWorkspace.js";

const mainSource = readFileSync("apps/web/src/main.ts", "utf8");
const workspaceSource = readFileSync("apps/web/src/creatorWorkspace.ts", "utf8");

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

  it("clears the rendered character when the user explicitly changes rules systems", () => {
    expect(workspaceSource).toContain("onSystemChange?: (system: CreatorSystemId) => void");
    expect(workspaceSource).toContain("options.onSystemChange?.(currentSystem())");
    expect(mainSource).toContain("onSystemChange: clearRenderedCharacter");
    expect(mainSource).toContain('resultElement.classList.add("empty-result")');
    expect(workspaceSource).not.toContain("primaryNativeStateId =");
    expect(workspaceSource).not.toContain("nativeStates =");
  });

  it("keeps legacy field-randomizer selectors available for system-specific actions", () => {
    expect(creatorRandomizerSelector("dnd5e-2024")).toBe(".icon-button[id$='-random'], #creator-random-roll");
    expect(creatorRandomizerSelector("brp-uge")).toBe("#brp-profession-random, #brp-reroll");
  });

  it("describes BRP Randomize All as a complete player-facing randomization pass", () => {
    const help = creatorRandomizationHelp("brp-uge");
    expect(help).toContain("name");
    expect(help).toContain("age");
    expect(help).toContain("gender");
    expect(help).toContain("profession");
    expect(help).toContain("Scholar specialties");
    expect(help).toContain("complete legal skill allocations");
    expect(help).toContain("Campaign/rules settings");
  });

  it("does not expose Randomize All while D&D Quick mode owns generation", () => {
    expect(creatorRandomizeAllAvailable("dnd5e-2024", "guided")).toBe(true);
    expect(creatorRandomizeAllAvailable("dnd5e-2024", "quick")).toBe(false);
    expect(creatorRandomizeAllAvailable("brp-uge", "quick")).toBe(true);
    expect(creatorRandomizationHelp("dnd5e-2024", "quick")).toContain("hidden in Quick mode");
  });

  it("uses per-question Choose for me instead of shared Randomize All in Guided Narrative", () => {
    expect(creatorRandomizeAllAvailable("dnd5e-2024", "narrative")).toBe(false);
    const help = creatorRandomizationHelp("dnd5e-2024", "narrative");
    expect(help).toContain("Choose for me");
    expect(help).toContain("narrative seed");
  });
});
