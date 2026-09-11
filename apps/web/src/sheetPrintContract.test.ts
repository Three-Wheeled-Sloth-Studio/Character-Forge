import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const mainSource = readFileSync("apps/web/src/main.ts", "utf8");
const sheetCss = readFileSync("apps/web/sheet.css", "utf8");

describe("dedicated character-sheet print contract", () => {
  it("keeps a print-only sheet root outside the application shell and hides the shell for print", () => {
    expect(mainSource).toContain('id="character-print-root"');
    expect(mainSource).toContain("printRoot.innerHTML = sheetHtml");
    expect(sheetCss).toContain("#app > .forge-shell");
    expect(sheetCss).toContain("display: none !important;");
    expect(sheetCss).toContain("#app > .character-print-root");
    expect(sheetCss).toContain("display: block !important;");
  });

  it("renders toolbar SVGs as visible stroke icons rather than empty button chrome", () => {
    expect(sheetCss).toContain(".sheet-action-icon");
    expect(sheetCss).toContain("stroke: currentColor;");
    expect(sheetCss).toContain("fill: none;");
  });
});
