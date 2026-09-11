import { describe, expect, it } from "vitest";
import { guidedAbilityMethodControlsHtml } from "./guidedAbilityControls.js";

describe("Guided Mechanical ability controls", () => {
  it("renders the standard array as a distinct assignment surface", () => {
    const html = guidedAbilityMethodControlsHtml("standard-array");
    expect(html).toContain("Standard Array assignment");
    expect(html).toContain('id="creator-standard-strength"');
    expect(html).toContain('<option value="15" selected>15</option>');
    expect(html).not.toContain("creator-point-budget");
  });

  it("renders point-cost controls with the budget status contract", () => {
    const html = guidedAbilityMethodControlsHtml("point-cost");
    expect(html).toContain("Point Cost scores");
    expect(html).toContain("data-point-score");
    expect(html).toContain('id="creator-point-budget"');
    expect(html).toContain('min="8" max="15"');
  });

  it("renders random controls before a roll has been assigned", () => {
    const html = guidedAbilityMethodControlsHtml("random");
    expect(html).toContain('id="creator-random-seed"');
    expect(html).toContain('id="creator-random-roll"');
    expect(html).toContain('id="creator-random-strength" disabled');
    expect(html).toContain("Roll first");
  });

  it("renders manual entry with the existing legal score bounds", () => {
    const html = guidedAbilityMethodControlsHtml("manual");
    expect(html).toContain("Base ability scores");
    expect(html).toContain('id="creator-manual-strength"');
    expect(html).toContain('min="3" max="18"');
  });
});
