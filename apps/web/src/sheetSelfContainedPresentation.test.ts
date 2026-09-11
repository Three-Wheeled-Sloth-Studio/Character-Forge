import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  renderCharacterSheet,
  type CharacterSheetDescriptor,
} from "../../../packages/character-sheet/src/index.js";
import { SHEET_TOOLBAR_STYLES } from "./sheetToolbarStyles.js";

const resultRendererSource = readFileSync("apps/web/src/characterResultRenderer.ts", "utf8");

const descriptor: CharacterSheetDescriptor = {
  title: "Avery Stone",
  systemTheme: "dnd5e",
  sourceNativeStateId: "native-test",
  sourceSchemaVersion: "test/1",
  headerFacts: [
    { label: "Class", value: "Cleric 1" },
    { label: "Species", value: "Orc" },
  ],
  pages: [
    {
      id: "play",
      number: 1,
      layout: "play-3",
      sections: [
        {
          id: "resources",
          title: "At a Glance",
          role: "resources",
          priority: 100,
          kind: "stats",
          preferredColumns: 2,
          zone: "left",
          items: [
            { label: "HP", value: "10 / 10" },
            { label: "AC", value: "12" },
          ],
        },
        {
          id: "skills",
          title: "Skills",
          role: "actions",
          priority: 90,
          kind: "ratings",
          preferredColumns: 1,
          zone: "main",
          items: [{ label: "Religion", value: "+3", detail: "Proficient" }],
        },
        {
          id: "abilities",
          title: "Abilities",
          role: "primary_stats",
          priority: 95,
          kind: "stats",
          preferredColumns: 2,
          zone: "right",
          items: [{ label: "WIS", value: "10", help: "+0" }],
        },
      ],
    },
  ],
};

describe("self-contained character-sheet presentation", () => {
  it("ships structural and print CSS with the rendered character artifact", () => {
    const html = renderCharacterSheet(descriptor);

    expect(html).toContain("data-character-sheet-styles");
    expect(html).toContain(".sheet-play-grid-3");
    expect(html).toContain("grid-template-columns");
    expect(html).toContain(".sheet-stat strong");
    expect(html).toContain("@media print");
    expect(html).toContain('<div class="sheet-stat"><span>HP</span><strong>10 / 10</strong>');
  });

  it("carries the embedded sheet style into the isolated print artifact", () => {
    expect(resultRendererSource).toContain('style[data-character-sheet-styles]');
    expect(resultRendererSource).toContain("`${style}${sheet}`");
    expect(resultRendererSource).toContain("printableSheetFromResult(resultElement, sheetHtml)");
  });

  it("ships toolbar affordance styling with the current JavaScript bundle", () => {
    expect(SHEET_TOOLBAR_STYLES).toContain(".sheet-action-button");
    expect(SHEET_TOOLBAR_STYLES).toContain("border-radius: 999px");
    expect(SHEET_TOOLBAR_STYLES).toContain(".sheet-action-icon");
    expect(SHEET_TOOLBAR_STYLES).toContain("stroke: currentColor");
  });
});
