import { describe, expect, it } from "vitest";
import {
  DND_CREATION_MODE_OPTIONS,
  defaultDndCreationMode,
  dndCreationModeSupportsRandomizeAll,
} from "./dndCreatorPanel.js";

describe("D&D creator top-level creation modes", () => {
  it("keeps Guided Mechanical as the default top-level mode", () => {
    expect(defaultDndCreationMode()).toBe("guided");
  });

  it("exposes Guided Narrative and Quick beside Guided rather than as ability methods", () => {
    expect(DND_CREATION_MODE_OPTIONS).toEqual([
      { id: "guided", label: "Guided Mechanical" },
      { id: "narrative", label: "Guided Narrative" },
      { id: "quick", label: "Quick Generate" },
    ]);
  });

  it("limits shared Randomize All to the Guided Mechanical D&D mode", () => {
    expect(dndCreationModeSupportsRandomizeAll("guided")).toBe(true);
    expect(dndCreationModeSupportsRandomizeAll("narrative")).toBe(false);
    expect(dndCreationModeSupportsRandomizeAll("quick")).toBe(false);
  });
});
