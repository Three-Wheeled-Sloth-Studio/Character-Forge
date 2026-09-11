import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  autoAllocateBrpCreatorState,
  buildBrpCreatorCharacter,
  createDefaultBrpCreatorState,
} from "./brpCreatorState.js";
import { brpEquipmentControlsHtml } from "./brpEquipmentControls.js";

const sheetUiCss = readFileSync("apps/web/sheet-ui.css", "utf8");
const characterSheetStylesSource = readFileSync("packages/character-sheet/src/styles.ts", "utf8");

function validDefaultCharacter() {
  return buildBrpCreatorCharacter(autoAllocateBrpCreatorState(createDefaultBrpCreatorState()));
}

describe("Stage 0 browser-acceptance regressions", () => {
  it("forces compact print pagination to beat the later self-contained sheet style bundle", () => {
    expect(characterSheetStylesSource).toContain("min-height: 10.35in");
    expect(sheetUiCss).toMatch(/\.sheet-print-document \.sheet-page[\s\S]*min-height:\s*0\s*!important/);
  });

  it("keeps BRP equipment mechanics behind a compact keyboard-accessible info affordance", () => {
    const html = brpEquipmentControlsHtml(validDefaultCharacter(), ["pistol-medium"]);

    expect(html).toContain('class="creator-inline-help"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Pistol, Medium details:');
    expect(html).toContain("1D8 damage");
    expect(html).not.toContain("<small>");
  });
});
