import { describe, expect, it } from "vitest";
import {
  creatorSystemsForProjectContext,
  projectContextLocksCreatorSystem,
  readCharacterForgeProjectContext,
} from "./projectContext.js";

describe("Parchment project context", () => {
  it("reads repeated project metadata without widening native character state", () => {
    const params = new URLSearchParams();
    params.set("pwSource", "parchment-worlds");
    params.set("pwProjectId", "project_1");
    params.set("pwProjectName", "Lantern Coast");
    params.append("pwRulesSystem", "dnd-5e-2024");
    params.append("pwGenre", "fantasy");
    params.append("pwAttribute", "tone:hopeful.low");

    expect(readCharacterForgeProjectContext(params)).toEqual({
      source: "parchment-worlds",
      projectId: "project_1",
      projectName: "Lantern Coast",
      rulesSystems: ["dnd-5e-2024"],
      genres: ["fantasy"],
      attributes: ["tone:hopeful.low"],
    });
  });

  it("maps supported project rules systems to creator systems", () => {
    const context = readCharacterForgeProjectContext(new URLSearchParams(
      "pwProjectId=project_1&pwRulesSystem=dnd-5e-2024&pwRulesSystem=basic-roleplaying",
    ));
    expect(creatorSystemsForProjectContext(context)).toEqual(["dnd5e-2024", "brp-uge"]);
    expect(projectContextLocksCreatorSystem(context)).toBeNull();
  });

  it("locks creation to a single supported project rules system but not system-agnostic projects", () => {
    const dnd = readCharacterForgeProjectContext(new URLSearchParams(
      "pwProjectId=project_1&pwRulesSystem=dnd-5e-2024",
    ));
    const brp = readCharacterForgeProjectContext(new URLSearchParams(
      "pwProjectId=project_2&pwRulesSystem=basic-roleplaying",
    ));
    const agnostic = readCharacterForgeProjectContext(new URLSearchParams(
      "pwProjectId=project_3&pwRulesSystem=system-agnostic",
    ));

    expect(projectContextLocksCreatorSystem(dnd)).toBe("dnd5e-2024");
    expect(projectContextLocksCreatorSystem(brp)).toBe("brp-uge");
    expect(projectContextLocksCreatorSystem(agnostic)).toBeNull();
  });
});
