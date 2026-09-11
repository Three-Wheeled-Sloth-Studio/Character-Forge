import { describe, expect, it } from "vitest";
import { clampWorkspaceSplit, workspaceSplitBounds } from "./workspaceSplitter.js";

describe("workspace splitter", () => {
  it("preserves minimum usable width for both creator and result panes", () => {
    expect(workspaceSplitBounds(1200)).toEqual({ min: 300, max: 812 });
    expect(clampWorkspaceSplit(1200, 100)).toBe(300);
    expect(clampWorkspaceSplit(1200, 900)).toBe(812);
    expect(clampWorkspaceSplit(1200, 515)).toBe(515);
  });

  it("degrades to the creator minimum when the desktop viewport cannot satisfy both panes", () => {
    expect(workspaceSplitBounds(640)).toEqual({ min: 300, max: 300 });
    expect(clampWorkspaceSplit(640, 430)).toBe(300);
  });

  it("uses the standard default for non-finite persisted values", () => {
    expect(clampWorkspaceSplit(1200, Number.NaN)).toBe(430);
  });
});
