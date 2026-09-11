import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const mainSource = readFileSync("apps/web/src/main.ts", "utf8");
const controlsSource = readFileSync("apps/web/src/characterSheetControls.ts", "utf8");
const indexHtml = readFileSync("apps/web/index.html", "utf8");
const sheetCss = readFileSync("apps/web/sheet.css", "utf8");
const webServerSource = readFileSync("tools/web-server.mjs", "utf8");

describe("dedicated character-sheet print contract", () => {
  it("serves every stylesheet referenced by the Character Forge page", () => {
    expect(indexHtml).toContain('href="styles.css"');
    expect(indexHtml).toContain('href="sheet.css"');
    expect(indexHtml).toContain('href="sheet-ui.css"');
    expect(webServerSource).toContain('pathname === "/styles.css"');
    expect(webServerSource).toContain('pathname === "/sheet.css"');
    expect(webServerSource).toContain('pathname === "/sheet-ui.css"');
    expect(webServerSource).toContain("return streamFile(sheetStylesPath, response)");
    expect(webServerSource).toContain("return streamFile(sheetUiStylesPath, response)");
  });

  it("keeps a print-only sheet root outside the application shell and hides the shell for print", () => {
    expect(mainSource).toContain('id="character-print-root"');
    expect(mainSource).toContain("printRoot.innerHTML = sheetHtml");
    expect(sheetCss).toContain("#app > .forge-shell");
    expect(sheetCss).toContain("display: none !important;");
    expect(sheetCss).toContain("#app > .character-print-root");
    expect(sheetCss).toContain("display: block !important;");
  });

  it("renders toolbar SVGs with self-contained visible stroke attributes", () => {
    expect(controlsSource).toContain('class="sheet-action-icon"');
    expect(controlsSource).toContain('fill="none"');
    expect(controlsSource).toContain('stroke="currentColor"');
    expect(controlsSource).toContain('stroke-width="1.8"');
    expect(sheetCss).toContain(".sheet-action-icon");
  });
});
