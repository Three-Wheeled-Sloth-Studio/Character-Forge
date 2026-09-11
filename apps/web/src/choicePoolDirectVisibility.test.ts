import { describe, expect, it } from "vitest";
import { directChoiceDisplayMatches, directSelectableIds } from "./choicePoolDirectVisibility.js";

describe("direct choice visibility", () => {
  it("keeps supported unchecked options visible for direct selection", () => {
    expect(directSelectableIds([
      { id: "fighter", checked: true, disabled: false },
      { id: "cleric", checked: false, disabled: false },
      { id: "wizard", checked: false, disabled: true },
    ])).toEqual(["fighter", "cleric"]);
  });

  it("deduplicates supported direct options without consulting random eligibility", () => {
    expect(directSelectableIds([
      { id: "orc", checked: false, disabled: false },
      { id: "orc", checked: true, disabled: false },
      { id: "human", checked: true, disabled: false },
    ])).toEqual(["orc", "human"]);
  });

  it("refreshes a select when IDs match but richer player-facing labels were replaced by raw codes", () => {
    expect(directChoiceDisplayMatches(
      [{ id: "A", label: "A" }, { id: "B", label: "B" }],
      [
        { id: "A", label: "Chain Mail, Greatsword, Flail, 8 Javelins, Dungeoneer's Pack + 4 GP" },
        { id: "B", label: "Studded Leather, Scimitar, Shortsword, Longbow, 20 Arrows, Quiver, Dungeoneer's Pack + 11 GP" },
      ],
    )).toBe(false);
  });
});
