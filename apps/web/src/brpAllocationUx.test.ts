import { describe, expect, it } from "vitest";
import {
  autoAllocateBrpCreatorState,
  createDefaultBrpCreatorState,
  previewBrpCreatorState,
} from "./brpCreatorState.js";
import { brpCreatorHtml } from "./brpCreatorPanelView.js";

describe("BRP allocation UX", () => {
  it("turns incomplete budgets into direct player actions", () => {
    const state = createDefaultBrpCreatorState();
    const preview = previewBrpCreatorState(state);
    const html = brpCreatorHtml(state, preview);

    expect(html).toContain('data-allocation-status="blocked"');
    expect(html).toContain("Spend 250 more professional points.");
    expect(html).toContain("Spend 100 more personal points.");
    expect(html).toContain("Resolve highlighted items to generate");
    expect(html).toContain('data-budget-status="incomplete"');
  });

  it("makes an exact legal allocation visibly ready", () => {
    const state = autoAllocateBrpCreatorState(createDefaultBrpCreatorState());
    const preview = previewBrpCreatorState(state);
    const html = brpCreatorHtml(state, preview);

    expect(preview.validCharacter).not.toBeNull();
    expect(html).toContain('data-allocation-status="ready"');
    expect(html).toContain("Professional and personal budgets are exact");
    expect(html).toContain('data-budget-status="complete"');
    expect(html).toContain(">Generate BRP character</button>");
  });

  it("marks profession eligibility and exposes legal input ceilings", () => {
    const state = createDefaultBrpCreatorState();
    const preview = previewBrpCreatorState(state);
    const personalOnly = preview.skillRows.find((row) => !row.professionalEligible);
    expect(personalOnly).toBeDefined();

    const html = brpCreatorHtml(state, preview);
    expect(html).toContain('data-brp-professional-eligible="false"');
    expect(html).toContain("Personal only");
    expect(html).toContain('disabled title="Not a selected profession skill"');
    expect(html).toMatch(/max="\d+"[^>]+data-brp-allocation-source="personalPoints"/);
  });

  it("names over-cap skills and shows their excess directly on the row", () => {
    const state = autoAllocateBrpCreatorState(createDefaultBrpCreatorState());
    const preview = previewBrpCreatorState(state);
    const first = preview.skillRows[0]!;
    const badPreview = {
      ...preview,
      validCharacter: null,
      validationMessage: `${first.label} exceeds the starting cap.`,
      skillRows: preview.skillRows.map((row, index) => index === 0
        ? { ...row, finalRating: preview.startingSkillCap + 3, overCap: true }
        : row),
    };

    const html = brpCreatorHtml(state, badPreview);
    expect(html).toContain(`1 skill is over the ${preview.startingSkillCap}% starting cap: ${first.label}.`);
    expect(html).toContain("Over cap by 3");
    expect(html).toContain("Resolve highlighted items to generate");
  });
});
