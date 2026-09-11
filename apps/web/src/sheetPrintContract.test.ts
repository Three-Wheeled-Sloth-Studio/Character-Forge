import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  characterDocumentControlsHtml,
  printableCharacterSheetDocument,
} from "./characterSheetControls.js";

const mainSource = readFileSync("apps/web/src/main.ts", "utf8");
const resultRendererSource = readFileSync("apps/web/src/characterResultRenderer.ts", "utf8");
const controlsSource = readFileSync("apps/web/src/characterSheetControls.ts", "utf8");
const indexHtml = readFileSync("apps/web/index.html", "utf8");
const sheetCss = readFileSync("apps/web/sheet.css", "utf8");
const sheetUiCss = readFileSync("apps/web/sheet-ui.css", "utf8");
const webServerSource = readFileSync("tools/web-server.mjs", "utf8");

describe("dedicated character-sheet print contract", () => {
  it("serves every stylesheet referenced by the Character Forge page and isolated print document", () => {
    expect(indexHtml).toContain('href="styles.css"');
    expect(indexHtml).toContain('href="sheet.css"');
    expect(indexHtml).toContain('href="sheet-ui.css"');
    expect(webServerSource).toContain('pathname === "/styles.css"');
    expect(webServerSource).toContain('pathname === "/sheet.css"');
    expect(webServerSource).toContain('pathname === "/sheet-ui.css"');
    expect(webServerSource).toContain("return streamFile(sheetStylesPath, response)");
    expect(webServerSource).toContain("return streamFile(sheetUiStylesPath, response)");

    const printDocument = printableCharacterSheetDocument(
      '<article class="character-sheet"><section class="sheet-page">Only the character sheet</section></article>',
      "http://localhost:5174/",
    );
    expect(printDocument).toContain('href="http://localhost:5174/sheet.css"');
    expect(printDocument).toContain('href="http://localhost:5174/sheet-ui.css"');
  });

  it("lets compact logical pages keep their intrinsic physical print height", () => {
    expect(sheetUiCss).toContain("@media print");
    expect(sheetUiCss).toContain(".sheet-print-document .sheet-page");
    expect(sheetUiCss).toContain("min-height: 0");
  });

  it("prints a separate desktop-width document containing only the current sheet markup", () => {
    const printDocument = printableCharacterSheetDocument(
      '<article class="character-sheet"><section class="sheet-page">Only the character sheet</section></article>',
      "http://localhost:5174/",
    );

    expect(printDocument).toContain('body class="sheet-print-document"');
    expect(printDocument).toContain("Only the character sheet");
    expect(printDocument).not.toContain("forge-shell");
    expect(printDocument).not.toContain("creator-root");
    expect(printDocument).not.toContain("Rules system");
    expect(resultRendererSource).toContain('querySelector<HTMLElement>(".character-sheet")?.outerHTML');
    expect(mainSource).not.toContain('id="character-print-root"');
    expect(controlsSource).toContain('frame.srcdoc = printableCharacterSheetDocument(sheetHtml)');
    expect(controlsSource).toContain('frame.style.width = "816px"');
    expect(controlsSource).toContain('frame.style.left = "-10000px"');
    expect(controlsSource).not.toContain('frame.style.width = "1px"');
    expect(controlsSource).toContain("printWindow.print()");
    expect(controlsSource).not.toContain('printButton?.addEventListener("click", () => window.print())');
  });

  it("renders self-contained media/export SVGs inside visibly enabled circular action buttons", () => {
    const controls = characterDocumentControlsHtml(true, true);

    expect(controls).toContain('data-sheet-action="attach-portrait"');
    expect(controls).toContain('data-sheet-action="attach-token"');
    expect(controls).toContain('class="sheet-action-icon"');
    expect(controls).toContain('fill="none"');
    expect(controls).toContain('stroke="currentColor"');
    expect(controls).toContain('stroke-width="1.8"');
    expect(sheetCss).toContain(".sheet-action-button");
    expect(sheetCss).toContain("border-radius: 999px");
    expect(sheetCss).toContain("background: #dec6a6");
    expect(sheetCss).toContain(".sheet-action-button:active:not(:disabled)");
    expect(sheetUiCss).not.toContain(".sheet-action-button");
  });
});
