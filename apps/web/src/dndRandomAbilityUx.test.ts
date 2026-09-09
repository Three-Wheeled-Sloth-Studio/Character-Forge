import { describe, expect, it } from "vitest";
import { swapUniqueRandomAssignment } from "./dndRandomAbilityUx.js";

describe("D&D random ability assignment UX", () => {
  it("swaps the displaced roll slot instead of duplicating an assignment", () => {
    expect(swapUniqueRandomAssignment(["0", "1", "2", "3", "4", "5"], 0, "3")).toEqual([
      "3",
      "1",
      "2",
      "0",
      "4",
      "5",
    ]);
  });

  it("keeps an unchanged assignment stable", () => {
    expect(swapUniqueRandomAssignment(["0", "1", "2", "3", "4", "5"], 2, "2")).toEqual([
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
    ]);
  });

  it("rejects invalid or already-duplicated assignment state", () => {
    expect(() => swapUniqueRandomAssignment(["0", "0", "2"], 1, "2")).toThrow("must be unique");
    expect(() => swapUniqueRandomAssignment(["0", "1", "2"], 0, "9")).toThrow("existing roll slots");
    expect(() => swapUniqueRandomAssignment(["0", "1", "2"], 4, "1")).toThrow("out of range");
  });
});
