import { describe, expect, it } from "vitest";
import {
  renderCharacterSheet,
  type CharacterSheetDescriptor,
  type CharacterSheetSection,
} from "../../../packages/character-sheet/src/index.js";
import {
  applyBrpFinishingDetails,
  applyBrpStartingEquipment,
  buildBrpCharacterSheet,
  createEmptyBrpFinishingDetails,
  type BrpNativeCharacter,
} from "../../../packages/system-brp/src/index.js";
import {
  autoAllocateBrpCreatorState,
  buildBrpCreatorCharacter,
  createDefaultBrpCreatorState,
} from "./brpCreatorState.js";
import {
  characterDocumentControlsHtml,
  characterDocumentDownloadName,
  characterDocumentJson,
} from "./characterSheetControls.js";

function validDefaultCharacter() {
  return buildBrpCreatorCharacter(autoAllocateBrpCreatorState(createDefaultBrpCreatorState()));
}

function sheetSection(sheet: CharacterSheetDescriptor, pageNumber: number, id: string): CharacterSheetSection {
  const page = sheet.pages.find((entry) => entry.number === pageNumber);
  if (!page) throw new Error(`Missing sheet page ${pageNumber}.`);
  const section = page.sections.find((entry) => entry.id === id);
  if (!section) throw new Error(`Missing sheet section ${id}.`);
  return section;
}

describe("adaptive character sheet BRP first proof", () => {
  it("projects authoritative BRP native state into deterministic two-page presentation state without mutating it", () => {
    const character = validDefaultCharacter();
    const before = structuredClone(character);
    const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId)!;
    const payload = nativeState.payload as BrpNativeCharacter;

    const sheet = buildBrpCharacterSheet(character);

    expect(character).toEqual(before);
    expect(sheet.sourceNativeStateId).toBe(nativeState.id);
    expect(sheet.sourceSchemaVersion).toBe("brp-character/0.1");
    expect(sheet.pages.map((page) => page.number)).toEqual([1, 2]);
    expect(sheet.pages[0]?.sections.map((section) => section.id)).toEqual([
      "identity",
      "characteristics",
      "derived",
      "skills",
      "profile",
    ]);

    const skills = sheetSection(sheet, 1, "skills");
    expect(skills.kind).toBe("ratings");
    if (skills.kind !== "ratings") throw new Error("Expected ratings section.");
    const firstSkill = payload.skills[0]!;
    expect(skills.items.some((item) => item.label.startsWith(firstSkill.label)
      && item.value === `${firstSkill.finalRating}%`)).toBe(true);
  });

  it("collapses BRP optional sheet sections when no equipment category or finishing content is present", () => {
    const sheet = buildBrpCharacterSheet(validDefaultCharacter());
    const pageOneIds = sheet.pages[0]!.sections.map((section) => section.id);
    const pageTwoIds = sheet.pages[1]!.sections.map((section) => section.id);

    expect(pageOneIds).not.toContain("weapons");
    expect(pageOneIds).not.toContain("armor");
    expect(pageTwoIds).not.toContain("appearance");
    expect(pageTwoIds).not.toContain("background");
    expect(pageTwoIds).toEqual(["equipment", "source-context"]);
  });

  it("projects final skills, weapons, armor, equipment, and populated finishing details into their assigned pages", () => {
    const withEquipment = applyBrpStartingEquipment(
      validDefaultCharacter(),
      ["first-aid-kit", "leather-soft", "pistol-medium"],
    );
    const character = applyBrpFinishingDetails(withEquipment, {
      ...createEmptyBrpFinishingDetails(),
      appearance: "Weathered face and immaculate boots",
      reputation: "Patient investigator",
      personalItem: "A dented brass compass",
      background: "Former dockworker and bookkeeper",
      beliefs: "Institutions should answer to the people they affect.",
    });
    const sheet = buildBrpCharacterSheet(character);

    const weapons = sheetSection(sheet, 1, "weapons");
    expect(weapons.kind).toBe("table");
    if (weapons.kind !== "table") throw new Error("Expected weapons table.");
    expect(weapons.rows).toContainEqual(expect.objectContaining({
      weapon: "Pistol, Medium",
      attack: "75%",
      damage: "1D8",
      range: "20 m",
      ammo: "12",
    }));

    const armor = sheetSection(sheet, 1, "armor");
    expect(armor.kind).toBe("table");
    if (armor.kind !== "table") throw new Error("Expected armor table.");
    expect(armor.rows).toContainEqual(expect.objectContaining({
      armor: "Leather, Soft",
      av: "1",
      enc: "3.5",
    }));

    const equipment = sheetSection(sheet, 2, "equipment");
    expect(equipment.kind).toBe("details");
    if (equipment.kind !== "details") throw new Error("Expected equipment details.");
    expect(equipment.items.find((item) => item.label === "Selected equipment")?.value)
      .toContain("First Aid Kit");

    const appearance = sheetSection(sheet, 2, "appearance");
    expect(appearance.kind).toBe("details");
    if (appearance.kind !== "details") throw new Error("Expected appearance details.");
    expect(appearance.items).toContainEqual({
      label: "Appearance",
      value: "Weathered face and immaculate boots",
    });

    const background = sheetSection(sheet, 2, "background");
    expect(background.kind).toBe("details");
    if (background.kind !== "details") throw new Error("Expected background details.");
    expect(background.items.map((item) => item.label)).toEqual([
      "Reputation",
      "Personal item",
      "Background",
      "Beliefs",
    ]);
  });

  it("renders semantic page and section markers, repeatable table headers, and escaped player text", () => {
    const character = applyBrpStartingEquipment(validDefaultCharacter(), ["pistol-medium"]);
    character.displayName = "Mara <North>";
    const html = renderCharacterSheet(buildBrpCharacterSheet(character));

    expect(html).toContain("Mara &lt;North&gt;");
    expect(html).toContain('data-sheet-page="1"');
    expect(html).toContain('data-sheet-page="2"');
    expect(html).toContain('data-sheet-role="actions"');
    expect(html).toContain('data-sheet-section="weapons"');
    expect(html).toContain("<thead>");
    expect(html).toContain("sheet-section-splittable");
    expect(html).not.toContain("Inspect native character document");
  });

  it("exposes browser print and lossless CharacterDocument JSON controls without creating a PDF model", () => {
    const character = validDefaultCharacter();
    character.displayName = "Avery North";
    const printControls = characterDocumentControlsHtml(true);
    const jsonOnlyControls = characterDocumentControlsHtml(false);

    expect(printControls).toContain('data-sheet-action="print"');
    expect(printControls).toContain("Print / Save PDF");
    expect(printControls).toContain('data-sheet-action="copy-json"');
    expect(printControls).toContain('data-sheet-action="download-json"');
    expect(printControls).toContain('aria-label="Copy full CharacterDocument JSON"');
    expect(jsonOnlyControls).not.toContain('data-sheet-action="print"');
    expect(JSON.parse(characterDocumentJson(character))).toEqual(character);
    expect(characterDocumentDownloadName(character)).toBe("avery-north.json");
  });
});
