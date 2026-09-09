import { describe, expect, it } from "vitest";
import { defaultGuidedDnd5eCoreChoices } from "./guidedDefaults.js";
import { guidedGenerateDnd5eFirstSlice } from "./guidedGenerate.js";

function input(selectionMode: "direct" | "random") {
  return {
    name: "Pool Boundary",
    classChoice: { selectedId: "paladin" as const, acceptableIds: ["fighter"] as const, selectionMode },
    backgroundChoice: { selectedId: "soldier" as const, acceptableIds: ["soldier"] as const, selectionMode: "direct" as const },
    speciesChoice: { selectedId: "human" as const, acceptableIds: ["human"] as const, selectionMode: "direct" as const },
    coreChoices: defaultGuidedDnd5eCoreChoices("paladin", "soldier", "human"),
    abilityMethod: {
      method: "standard-array" as const,
      assignment: { strength: 15, dexterity: 12, constitution: 13, intelligence: 8, wisdom: 10, charisma: 14 },
    },
    backgroundIncreases: { strength: 2 as const, constitution: 1 as const },
    backgroundEquipmentChoice: "A" as const,
  };
}

describe("Guided direct choice versus sticky acceptable pool", () => {
  it("allows a direct current choice outside the sticky random pool while retaining the pool separately", () => {
    const character = guidedGenerateDnd5eFirstSlice(input("direct"));

    expect(character.generation?.decisions.find((decision) => decision.stepId === "class")?.choiceId).toBe("paladin");
    expect(character.generation?.decisions.find((decision) => decision.stepId === "class.acceptable-pool")?.answer).toEqual(["fighter"]);
  });

  it("still requires a random current choice to come from the acceptable pool", () => {
    expect(() => guidedGenerateDnd5eFirstSlice(input("random"))).toThrow("Randomly selected class must be included in the acceptable class pool");
  });
});
