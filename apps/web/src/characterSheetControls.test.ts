import { describe, expect, it } from "vitest";
import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import { exportCharacterToFoundryDnd5eActor } from "../../../packages/foundry-adapter/src/dnd5eActor.js";
import { createFirstSliceCharacterDocument } from "../../../packages/system-dnd5e/src/firstSliceCharacter.js";
import {
  canDownloadFoundryDnd5eImport,
  characterDocumentControlsHtmlForCharacter,
  characterDocumentDownloadName,
  foundryDnd5eImportArtifact,
  foundryDnd5eImportDownloadName,
} from "./characterSheetControls.js";

describe("character sheet Foundry download controls", () => {
  it("builds a deterministic raw Foundry Actor import artifact without adapter wrapper metadata", () => {
    const character = createFirstSliceCharacterDocument();
    const first = foundryDnd5eImportArtifact(character);
    const second = foundryDnd5eImportArtifact(character);
    const exported = exportCharacterToFoundryDnd5eActor(character);

    expect(first).toEqual(second);
    expect(first.mimeType).toBe("application/json;charset=utf-8");
    expect(JSON.parse(first.json)).toEqual(exported.document);
    expect(first.json).not.toContain('"mappingNotes"');
    expect(first.json).not.toContain('"schemaVersion"');
    expect(first.json).not.toContain("character-forge/foundry-dnd5e-actor-export/0.1");
  });

  it("reuses the CharacterDocument slug for a stable sanitized Foundry filename", () => {
    const character = {
      ...createFirstSliceCharacterDocument(),
      displayName: "  Éowyn / Stone?!  ",
    };

    expect(characterDocumentDownloadName(character)).toBe("eowyn-stone.json");
    expect(foundryDnd5eImportDownloadName(character)).toBe("eowyn-stone-foundry-dnd5e.json");
    expect(foundryDnd5eImportDownloadName(character)).toMatch(/-foundry-dnd5e\.json$/);
  });

  it("exposes the Foundry action only for an exportable D&D 5E 2024 primary state", () => {
    const dndCharacter = createFirstSliceCharacterDocument();
    const primaryState = dndCharacter.nativeStates.find(
      (state) => state.id === dndCharacter.primaryNativeStateId,
    );
    if (!primaryState) throw new Error("test fixture primary state missing");

    const brpCharacter = {
      ...dndCharacter,
      nativeStates: [
        {
          ...primaryState,
          systemId: "brp",
          editionId: "uge-2023",
        },
      ],
    } as CharacterDocument;

    expect(canDownloadFoundryDnd5eImport(dndCharacter)).toBe(true);
    expect(canDownloadFoundryDnd5eImport(brpCharacter)).toBe(false);

    const dndControls = characterDocumentControlsHtmlForCharacter(dndCharacter);
    expect(dndControls).toContain('data-sheet-action="download-foundry-dnd5e"');
    expect(dndControls).toContain("Download Foundry D&D5e import JSON");
    expect(dndControls).toContain('data-sheet-action="download-json"');

    const brpControls = characterDocumentControlsHtmlForCharacter(brpCharacter);
    expect(brpControls).not.toContain('data-sheet-action="download-foundry-dnd5e"');
    expect(brpControls).toContain('data-sheet-action="download-json"');
  });
});
