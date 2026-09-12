import { describe, expect, it } from "vitest";
import { createFirstSliceCharacterDocument } from "../../system-dnd5e/src/firstSliceCharacter.js";
import {
  exportCharacterToFoundryDnd5eActor,
  serializeFoundryDnd5eActorDocument,
} from "./dnd5eActor.js";
import {
  FOUNDRY_CORE_TARGET_VERSION,
  FOUNDRY_DND5E_ACTOR_ADAPTER_VERSION,
  FOUNDRY_DND5E_TARGET_VERSION,
} from "./target.js";

describe("Foundry D&D5e Actor adapter", () => {
  it("pins the first adapter proof to Foundry 14.367 and D&D5e 6.0.0", () => {
    const exported = exportCharacterToFoundryDnd5eActor(createFirstSliceCharacterDocument());

    expect(exported.adapterVersion).toBe(FOUNDRY_DND5E_ACTOR_ADAPTER_VERSION);
    expect(exported.target).toEqual({
      coreVersion: FOUNDRY_CORE_TARGET_VERSION,
      systemId: "dnd5e",
      systemVersion: FOUNDRY_DND5E_TARGET_VERSION,
    });
  });

  it("maps authoritative actor-level state without fabricating embedded Items", () => {
    const exported = exportCharacterToFoundryDnd5eActor(createFirstSliceCharacterDocument());

    expect(exported.document).toMatchObject({
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
      items: [],
      effects: [],
    });

    expect(exported.mappingNotes).toEqual(expect.arrayContaining([
      expect.objectContaining({
        sourcePath: "class/origin/equipment/featureIds/spells",
        targetPath: "Actor.items",
        disposition: "deferred",
      }),
    ]));
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
