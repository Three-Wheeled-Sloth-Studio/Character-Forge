import { describe, expect, it } from "vitest";
import { createFirstSliceCharacterDocument } from "../../system-dnd5e/src/firstSliceCharacter.js";
import {
  exportCharacterToFoundryDnd5eActor,
  serializeFoundryDnd5eActorDocument,
} from "./dnd5eActor.js";
import { stableFoundryDocumentId } from "./dnd5eIdentityItems.js";
import {
  FOUNDRY_CORE_TARGET_VERSION,
  FOUNDRY_DND5E_ACTOR_ADAPTER_VERSION,
  FOUNDRY_DND5E_TARGET_VERSION,
} from "./target.js";

describe("Foundry D&D5e Actor adapter", () => {
  it("pins the adapter to Foundry 14.367 and D&D5e 6.0.0", () => {
    const exported = exportCharacterToFoundryDnd5eActor(createFirstSliceCharacterDocument());

    expect(exported.adapterVersion).toBe(FOUNDRY_DND5E_ACTOR_ADAPTER_VERSION);
    expect(exported.target).toEqual({
      coreVersion: FOUNDRY_CORE_TARGET_VERSION,
      systemId: "dnd5e",
      systemVersion: FOUNDRY_DND5E_TARGET_VERSION,
    });
  });

  it("maps authoritative actor-level state and identity-bearing embedded Items", () => {
    const exported = exportCharacterToFoundryDnd5eActor(createFirstSliceCharacterDocument());
    const document = JSON.parse(JSON.stringify(exported.document));

    expect(document).toMatchObject({
      name: "Avery Stone",
      type: "character",
      system: {
        abilities: {
          str: { value: 17, proficient: 1 },
          dex: { value: 14, proficient: 0 },
          con: { value: 14, proficient: 1 },
          int: { value: 8, proficient: 0 },
          wis: { value: 10, proficient: 0 },
          cha: { value: 12, proficient: 0 },
        },
        attributes: {
          ac: { flat: 17, calc: "flat" },
          hp: { value: 12, max: 12 },
          init: { bonus: "2" },
          movement: { walk: 30, units: "ft" },
        },
        details: {
          alignment: "Neutral Good",
          xp: { value: 0 },
        },
        traits: {
          size: "med",
          languages: { value: ["common", "dwarvish", "elvish"] },
        },
        currency: { gp: 54 },
        skills: {
          acr: { value: 1, ability: "dex" },
          his: { value: 1, ability: "int" },
          prc: { value: 0, ability: "wis" },
        },
      },
      prototypeToken: {
        name: "Avery Stone",
        actorLink: true,
      },
      effects: [],
    });

    expect(document.items).toHaveLength(3);
    expect(document.items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: "Fighter",
        type: "class",
        system: expect.objectContaining({
          identifier: "fighter",
          levels: 1,
          hd: expect.objectContaining({ denomination: "d10", spent: 0 }),
          advancement: {},
        }),
      }),
      expect.objectContaining({
        name: "Soldier",
        type: "background",
        system: expect.objectContaining({ identifier: "soldier", advancement: {} }),
      }),
      expect.objectContaining({
        name: "Human",
        type: "race",
        system: expect.objectContaining({ identifier: "human", advancement: {} }),
      }),
    ]));

    const classItem = document.items.find((item: { type: string }) => item.type === "class");
    const backgroundItem = document.items.find((item: { type: string }) => item.type === "background");
    const raceItem = document.items.find((item: { type: string }) => item.type === "race");
    expect(document.system.details.originalClass).toBe(classItem._id);
    expect(document.system.details.background).toBe(backgroundItem._id);
    expect(document.system.details.race).toBe(raceItem._id);

    expect(exported.mappingNotes).toEqual(expect.arrayContaining([
      expect.objectContaining({
        sourcePath: "class.classId/origin.backgroundId/origin.speciesId",
        targetPath: "Actor.items + Actor.system.details",
        disposition: "mapped",
      }),
      expect.objectContaining({
        sourcePath: "equipment/featureIds/spells",
        targetPath: "Actor.items",
        disposition: "deferred",
      }),
    ]));
  });

  it("uses stable valid Foundry document IDs without copying rules text or advancement automation", () => {
    const character = createFirstSliceCharacterDocument();
    const first = JSON.parse(JSON.stringify(exportCharacterToFoundryDnd5eActor(character).document));
    const second = JSON.parse(JSON.stringify(exportCharacterToFoundryDnd5eActor(character).document));

    expect(first.items.map((item: { _id: string }) => item._id)).toEqual(
      second.items.map((item: { _id: string }) => item._id),
    );
    for (const item of first.items as Array<{ _id: string; system: { description: { value: string; chat: string }; advancement: object } }>) {
      expect(item._id).toMatch(/^[0-9a-f]{16}$/);
      expect(item.system.description).toEqual({ value: "", chat: "" });
      expect(item.system.advancement).toEqual({});
    }

    expect(stableFoundryDocumentId("same input")).toBe(stableFoundryDocumentId("same input"));
    expect(stableFoundryDocumentId("same input")).not.toBe(stableFoundryDocumentId("other input"));
  });

  it("serializes the Foundry actor document deterministically without adapter metadata in the import JSON", () => {
    const character = createFirstSliceCharacterDocument();
    const first = exportCharacterToFoundryDnd5eActor(character);
    const second = exportCharacterToFoundryDnd5eActor(character);

    const firstJson = serializeFoundryDnd5eActorDocument(first);
    const secondJson = serializeFoundryDnd5eActorDocument(second);
    expect(firstJson).toBe(secondJson);
    expect(JSON.parse(firstJson)).toEqual(first.document);
    expect(firstJson).not.toContain("mappingNotes");
    expect(firstJson).not.toContain("character-forge/foundry-dnd5e-actor-export/0.1");
    expect(firstJson).toContain('"character-forge"');
  });

  it("rejects a non-D&D primary native state rather than projecting through shared semantics", () => {
    const character = createFirstSliceCharacterDocument();
    const wrongSystem = {
      ...character,
      nativeStates: [
        {
          ...character.nativeStates[0],
          systemId: "brp",
          editionId: "uge",
        },
      ],
    } as typeof character;

    expect(() => exportCharacterToFoundryDnd5eActor(wrongSystem)).toThrow(
      "requires a primary D&D 5E 2024 native state",
    );
  });
});
