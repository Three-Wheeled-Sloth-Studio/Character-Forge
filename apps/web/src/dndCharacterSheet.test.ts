import { describe, expect, it } from "vitest";
import {
  renderCharacterSheet,
  type CharacterSheetDescriptor,
  type CharacterSheetSection,
} from "../../../packages/character-sheet/src/index.js";
import {
  buildDnd5eCharacterSheet,
  guidedStandardArrayGenerateDnd5eFirstSlice,
} from "../../../packages/system-dnd5e/src/index.js";
import { characterDocumentControlsHtml } from "./characterSheetControls.js";

const assignment = {
  strength: 15,
  dexterity: 14,
  constitution: 13,
  intelligence: 10,
  wisdom: 12,
  charisma: 8,
};

function fighterCharacter() {
  return guidedStandardArrayGenerateDnd5eFirstSlice({
    name: "Jonas Vale",
    classChoice: { selectedId: "fighter", acceptableIds: ["fighter"], selectionMode: "direct" },
    speciesChoice: { selectedId: "human", acceptableIds: ["human"], selectionMode: "direct" },
    assignment,
    backgroundIncreases: { strength: 2, constitution: 1 },
  });
}

function sheetSection(sheet: CharacterSheetDescriptor, pageNumber: number, id: string): CharacterSheetSection {
  const page = sheet.pages.find((entry) => entry.number === pageNumber);
  if (!page) throw new Error(`Missing sheet page ${pageNumber}.`);
  const section = page.sections.find((entry) => entry.id === id);
  if (!section) throw new Error(`Missing sheet section ${id}.`);
  return section;
}

describe("D&D dedicated character sheet", () => {
  it("compacts a sparse generated character into one play-focused page without exposing A/B equipment choice codes", () => {
    const character = fighterCharacter();
    const before = structuredClone(character);
    const sheet = buildDnd5eCharacterSheet(character);

    expect(character).toEqual(before);
    expect(sheet.systemTheme).toBe("dnd5e");
    expect(sheet.pages.map((page) => page.number)).toEqual([1]);
    expect(sheet.pages[0]?.layout).toBe("play-3");
    expect(sheet.pages[0]?.sections.map((section) => section.id)).toEqual(expect.arrayContaining([
      "resources",
      "saving-throws",
      "skills",
      "abilities",
      "equipment",
      "proficiencies",
    ]));
    expect(sheet.headerFacts?.map((fact) => fact.label)).toEqual(["Class", "Species", "Background", "Alignment"]);
    expect(sheet.pages[0]?.sections.map((section) => section.id)).not.toContain("rules-context");
    expect(sheet.footerNote).toBe("D&D 5E 2024 | SRD 5.2.1");

    const equipment = sheetSection(sheet, 1, "equipment");
    expect(equipment.kind).toBe("list");
    if (equipment.kind !== "list") throw new Error("Expected D&D equipment list.");
    const labels = equipment.items.map((item) => item.label);
    expect(labels).toContain("Chain Mail");
    expect(labels).toContain("Greatsword");
    expect(labels).not.toContain("A");
    expect(labels).not.toContain("B");
  });

  it("calculates ordinary skill and saving-throw ratings from authoritative ability and proficiency state", () => {
    const sheet = buildDnd5eCharacterSheet(fighterCharacter());
    const skills = sheetSection(sheet, 1, "skills");
    const saves = sheetSection(sheet, 1, "saving-throws");

    expect(skills.kind).toBe("ratings");
    expect(saves.kind).toBe("ratings");
    if (skills.kind !== "ratings" || saves.kind !== "ratings") throw new Error("Expected D&D ratings sections.");

    expect(skills.zone).toBe("main");
    expect(saves.zone).toBe("left");
    expect(skills.items).toContainEqual(expect.objectContaining({ label: "Athletics", detail: "Proficient" }));
    expect(saves.items).toContainEqual(expect.objectContaining({ label: "STR", detail: "Proficient" }));
  });

  it("uses portrait-first header composition, campaign badging, and no visible media placeholder prose", () => {
    const html = renderCharacterSheet(buildDnd5eCharacterSheet(fighterCharacter()), { campaignName: "Lantern Coast" });

    expect(html).toContain('data-sheet-system="dnd5e"');
    expect(html).toContain('data-sheet-media-slot="portrait"');
    expect(html).toContain('data-sheet-media-slot="token"');
    expect(html).toContain("Lantern Coast");
    expect(html).not.toContain(">Portrait<");
    expect(html).not.toContain(">VTT Token<");
    expect(html).toContain("sheet-play-grid-3");
    expect(html).toContain('<footer class="sheet-footer">D&amp;D 5E 2024 | SRD 5.2.1</footer>');
    expect(html).not.toContain("Character Forge");
    expect(html).not.toContain("Rules Context");
    expect(html).not.toContain("Generation seed");
  });

  it("uses icon-only media, print, copy, and download actions with hover and accessible text", () => {
    const html = characterDocumentControlsHtml(true, true);

    expect(html).toContain('data-sheet-action="attach-portrait"');
    expect(html).toContain('data-sheet-action="attach-token"');
    expect(html).toContain('data-sheet-action="print"');
    expect(html).toContain('data-sheet-action="copy-json"');
    expect(html).toContain('data-sheet-action="download-json"');
    expect(html).toContain("<svg");
    expect(html).toContain('title="Attach character portrait"');
    expect(html).toContain('title="Print character sheet or save as PDF"');
    expect(html).toContain('aria-label="Copy full CharacterDocument JSON"');
    expect(html).not.toContain("<span>Copy JSON</span>");
    expect(html).not.toContain("<span>Download JSON</span>");
  });
});
