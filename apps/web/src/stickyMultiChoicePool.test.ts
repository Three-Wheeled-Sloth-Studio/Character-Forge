import { describe, expect, it } from "vitest";
import { loadStickyMultiChoicePool, pickManyFromAcceptablePool, saveStickyMultiChoicePool } from "./stickyMultiChoicePool.js";

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

describe("sticky multi-choice pools", () => {
  it("sanitizes stale saved options and keeps the requested number selected", () => {
    const storage = new MemoryStorage();
    storage.setItem("skills", JSON.stringify({ acceptableIds: ["a", "stale", "c"], selectedIds: ["stale"] }));
    const state = loadStickyMultiChoicePool(storage, "skills", ["a", "b", "c"], ["a", "b", "c"], ["a", "b"], 2);
    expect(state.acceptableIds).toEqual(["a", "b", "c"]);
    expect(state.selectedIds).toEqual(["a", "b"]);
  });

  it("persists only legal non-empty selected pools", () => {
    const storage = new MemoryStorage();
    saveStickyMultiChoicePool(storage, "mastery", { acceptableIds: ["a", "b", "c"], selectedIds: ["a", "c"] }, 2);
    expect(JSON.parse(storage.getItem("mastery")!)).toEqual({ acceptableIds: ["a", "b", "c"], selectedIds: ["a", "c"] });
    expect(() => saveStickyMultiChoicePool(storage, "bad", { acceptableIds: ["a"], selectedIds: ["a"] }, 2)).toThrow();
  });

  it("randomly chooses distinct values from the acceptable pool", () => {
    const values = [0.99, 0, 0.5];
    let index = 0;
    const selected = pickManyFromAcceptablePool(["a", "b", "c", "d"], 3, () => values[index++] ?? 0);
    expect(selected).toHaveLength(3);
    expect(new Set(selected).size).toBe(3);
    expect(selected.every((id) => ["a", "b", "c", "d"].includes(id))).toBe(true);
  });
});
