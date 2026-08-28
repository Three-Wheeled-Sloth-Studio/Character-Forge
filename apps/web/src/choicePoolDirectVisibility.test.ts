import { describe, expect, it } from "vitest";
import { directSelectableIds } from "./choicePoolDirectVisibility.js";

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
});
