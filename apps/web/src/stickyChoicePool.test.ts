import { describe, expect, it } from "vitest";
import {
  loadStickyChoicePool,
  pickFromAcceptablePool,
  saveStickyChoicePool,
  type ChoicePoolStorage,
} from "./stickyChoicePool.js";

class MemoryStorage implements ChoicePoolStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

describe("sticky choice pools", () => {
  it("loads defaults, persists acceptable options, and restores the selected option", () => {
    const storage = new MemoryStorage();
    const allowed = ["a", "b", "c"] as const;

    expect(loadStickyChoicePool(storage, "test", allowed, ["a", "b"], "a")).toEqual({
      acceptableIds: ["a", "b"],
      selectedId: "a",
    });

    saveStickyChoicePool(storage, "test", { acceptableIds: ["b", "c"], selectedId: "c" });
    expect(loadStickyChoicePool(storage, "test", allowed, ["a"], "a")).toEqual({
      acceptableIds: ["b", "c"],
      selectedId: "c",
    });
  });

  it("sanitizes stale or unsupported stored options", () => {
    const storage = new MemoryStorage();
    storage.setItem("test", JSON.stringify({ acceptableIds: ["a", "retired"], selectedId: "retired" }));

    expect(loadStickyChoicePool(storage, "test", ["a", "b"] as const, ["b"], "b")).toEqual({
      acceptableIds: ["a"],
      selectedId: "a",
    });
  });

  it("selects deterministically from the acceptable pool when a random source is supplied", () => {
    const values = ["barbarian", "fighter", "rogue"] as const;
    expect(pickFromAcceptablePool(values, () => 0)).toBe("barbarian");
    expect(pickFromAcceptablePool(values, () => 0.5)).toBe("fighter");
    expect(pickFromAcceptablePool(values, () => 0.999)).toBe("rogue");
  });
});
