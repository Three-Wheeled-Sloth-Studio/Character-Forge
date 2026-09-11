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
  it("projects authoritative compact BRP native state into one play page without mutating it", () => {
    const character = validDefaultCharacter();
    const before = structuredClone(character);
    const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId)!;
    const payload = nativeState.payload as BrpNativeCharacter;

    const sheet = buildBrpCharacterSheet(character);

    expect(character).toEqual(before);
    expect(sheet.sourceNativeStateId).toBe(nativeState.id);
    expect(sheet.sourceSchemaVersion).toBe("brp-character/0.1");
    expect(sheet.systemTheme).toBe("brp");
    expect(sheet.pages.map((page) => page.number)).toEqual([1]);
    expect(sheet.pages[0]?.layout).toBe("play-3");
    expect(sheet.pages[0]?.sections.map((section) => section.id)).not.toContain("identity");
    expect(sheet.headerFacts?.map((fact) => fact.label)).toEqual(["Profession", "Age", "Gender"]);
    expect(sheet.footerNote).toBe("BRP UGE 2023 | ORC 1.05");

    const ratingItems = sheet.pages[0]!.sections
      .filter((section) => section.kind === "ratings")
      .flatMap((section) => section.kind === "ratings" ? section.items : []);
    const firstSkill = payload.skills[0]!;
    expect(ratingItems.some((item) => item.label.startsWith(firstSkill.label)
      && item.value === `${firstSkill.finalRating}%`)).toBe(true);
  });

  it("collapses compact logistics onto page one when no equipment category or finishing content is present", () => {
    const sheet = buildBrpCharacterSheet(validDefaultCharacter());
    const pageOneIds = sheet.pages[0]!.sections.map((section) => section.id);

    expect(sheet.pages).toHaveLength(1);
    expect(pageOneIds).not.toContain("weapons");
    expect(pageOneIds).not.toContain("armor");
    expect(pageOneIds).not.toContain("appearance");
    expect(pageOneIds).not.toContain("background");
    expect(pageOneIds).toContain("equipment");
  });

  it("keeps modest equipment and finishing content on one page when the estimated columns fit", () => {
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

    expect(sheet.pages).toHaveLength(1);

    const weapons = sheetSection(sheet, 1, "weapons");
    expect(weapons.kind).toBe("table");
    if (weapons.kind !== "table") throw new Error("Expected weapons table.");
    expect(weapons.zone).toBe("wide");
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

    const equipment = sheetSection(sheet, 1, "equipment");
    expect(equipment.kind).toBe("details");
    if (equipment.kind !== "details") throw new Error("Expected equipment details.");
    expect(equipment.items.find((item) => item.label === "Equipment")?.value)
      .toContain("First Aid Kit");

    const appearance = sheetSection(sheet, 1, "appearance");
    expect(appearance.kind).toBe("details");
    if (appearance.kind !== "details") throw new Error("Expected appearance details.");
    expect(appearance.items).toContainEqual({
      label: "Appearance",
      value: "Weathered face and immaculate boots",
    });

    const background = sheetSection(sheet, 1, "background");
    expect(background.kind).toBe("details");
    if (background.kind !== "details") throw new Error("Expected background details.");
    expect(background.items.map((item) => item.label)).toEqual([
      "Reputation",
      "Personal item",
      "Background",
      "Beliefs",
    ]);
  });

  it("retains a second page when long narrative content genuinely exceeds the compact page budget", () => {
    const character = applyBrpFinishingDetails(validDefaultCharacter(), {
      ...createEmptyBrpFinishingDetails(),
      background: "Long-form campaign background detail. ".repeat(180),
      beliefs: "A deliberately long narrative should not be squeezed into unreadable print.",
    });
    const sheet = buildBrpCharacterSheet(character);

    expect(sheet.pages.map((page) => page.number)).toEqual([1, 2]);
    expect(sheetSection(sheet, 2, "background").kind).toBe("details");
  });

  it("renders campaign badging and empty media space without visible placeholder prose", () => {
    const character = applyBrpStartingEquipment(validDefaultCharacter(), ["pistol-medium"]);
    character.displayName = "Mara <North>";
    const html = renderCharacterSheet(buildBrpCharacterSheet(character), { campaignName: "Ashes of Bellweather" });

    expect(html).toContain("Mara &lt;North&gt;");
    expect(html).toContain('data-sheet-system="brp"');
    expect(html).toContain('data-sheet-page="1"');
    expect(html).not.toContain('data-sheet-page="2"');
    expect(html).toContain('data-sheet-section="weapons"');
    expect(html).toContain('data-sheet-media-slot="portrait"');
    expect(html).toContain('data-sheet-media-slot="token"');
    expect(html).toContain("Ashes of Bellweather");
    expect(html).not.toContain(">Portrait<");
    expect(html).not.toContain(">VTT Token<");
    expect(html).toContain('<footer class="sheet-footer">BRP UGE 2023 | ORC 1.05</footer>');
    expect(html).not.toContain("Character Forge");
    expect(html).not.toContain("Rules Context");
    expect(html).not.toContain("Rules profile");
  });

  it("exposes icon-only media, print, and lossless CharacterDocument actions without creating a PDF model", () => {
    const character = validDefaultCharacter();
    character.displayName = "Avery North";
    const controls = characterDocumentControlsHtml(true, true);
    const jsonOnlyControls = characterDocumentControlsHtml(false);

    expect(controls).toContain('data-sheet-action="attach-portrait"');
    expect(controls).toContain('data-sheet-action="attach-token"');
    expect(controls).toContain('data-sheet-action="print"');
    expect(controls).toContain('data-sheet-action="copy-json"');
    expect(controls).toContain('data-sheet-action="download-json"');
    expect(controls).toContain('aria-label="Attach character portrait"');
    expect(controls).toContain('title="Print character sheet or save as PDF"');
    expect(controls).toContain("<svg");
    expect(jsonOnlyControls).not.toContain('data-sheet-action="print"');
    expect(JSON.parse(characterDocumentJson(character))).toEqual(character);
    expect(characterDocumentDownloadName(character)).toBe("avery-north.json");
  });
});
