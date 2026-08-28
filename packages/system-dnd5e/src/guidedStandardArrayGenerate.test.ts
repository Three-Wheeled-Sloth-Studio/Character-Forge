import { describe, expect, it } from "vitest";
import { dnd5eSrd521Adapter } from "./adapter.js";
import { guidedStandardArrayGenerateDnd5eFirstSlice } from "./guidedStandardArrayGenerate.js";
import type { Dnd5eNativeCharacter } from "./nativeCharacter.js";
import { DND5E_SRD_521_BACKGROUND_OPTIONS, DND5E_SRD_521_CLASS_OPTIONS, DND5E_SRD_521_SPECIES_OPTIONS, GUIDED_DND5E_BACKGROUND_IDS, GUIDED_DND5E_CLASS_IDS, GUIDED_DND5E_SPECIES_IDS } from "./srdCatalog.js";

const assignment = { strength: 15, dexterity: 14, constitution: 13, intelligence: 10, wisdom: 12, charisma: 8 };

function payloadOf(character: ReturnType<typeof guidedStandardArrayGenerateDnd5eFirstSlice>): Dnd5eNativeCharacter {
  return character.nativeStates[0]!.payload as Dnd5eNativeCharacter;
}

describe("guided SRD class and species generation", () => {
  it("catalogs the full SRD core and enables only faithfully modeled choices", () => {
    expect(DND5E_SRD_521_CLASS_OPTIONS).toHaveLength(12);
    expect(DND5E_SRD_521_BACKGROUND_OPTIONS).toHaveLength(4);
    expect(DND5E_SRD_521_SPECIES_OPTIONS).toHaveLength(9);
    expect(GUIDED_DND5E_CLASS_IDS).toEqual(["barbarian", "cleric", "fighter", "monk", "rogue"]);
    expect(GUIDED_DND5E_BACKGROUND_IDS).toEqual(["acolyte", "criminal", "sage", "soldier"]);
    expect(GUIDED_DND5E_SPECIES_IDS).toEqual(["dragonborn", "dwarf", "goliath", "halfling", "human", "orc"]);
  });

  it("builds and validates a Dwarf Soldier Barbarian with class/species-sensitive derived state", () => {
    const character = guidedStandardArrayGenerateDnd5eFirstSlice({
      name: "Bryn Granite",
      classChoice: { selectedId: "barbarian", acceptableIds: ["barbarian", "fighter", "rogue"], selectionMode: "random" },
      speciesChoice: { selectedId: "dwarf", acceptableIds: ["dwarf", "halfling", "human", "orc"], selectionMode: "direct" },
      assignment,
      backgroundIncreases: { strength: 2, constitution: 1 },
    });
    const nativeState = character.nativeStates[0]!;
    const payload = payloadOf(character);
    expect(nativeState.schemaVersion).toBe("dnd5e-character/0.3");
    expect(payload.class.classId).toBe("barbarian");
    expect(payload.origin.speciesId).toBe("dwarf");
    expect(payload.resources.hitPointsMaximum).toBe(15);
    expect(payload.resources.rageMaximum).toBe(2);
    expect(payload.resources.stonecunningMaximum).toBe(2);
    expect(payload.derived.armorClass).toBe(14);
    expect(payload.derived.initiativeModifier).toBe(2);
    expect(payload.derived.passivePerception).toBe(13);
    expect(dnd5eSrd521Adapter.validateNativeState(nativeState)).toEqual({ valid: true, issues: [] });
  });

  it("retains Dragonborn ancestry, damage type, and Breath Weapon uses", () => {
    const character = guidedStandardArrayGenerateDnd5eFirstSlice({
      name: "Ember Scale",
      classChoice: { selectedId: "fighter", acceptableIds: ["fighter"], selectionMode: "direct" },
      speciesChoice: { selectedId: "dragonborn", acceptableIds: ["dragonborn"], selectionMode: "direct" },
      assignment,
      backgroundIncreases: { strength: 2, constitution: 1 },
    });
    const payload = payloadOf(character);
    expect(payload.origin.speciesAncestryId).toBe("red");
    expect(payload.origin.speciesDamageType).toBe("fire");
    expect(payload.resources.breathWeaponMaximum).toBe(2);
    expect(payload.resources.breathWeaponCurrent).toBe(2);
    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!).valid).toBe(true);
  });

  it("retains Goliath Giant Ancestry, 35-foot speed, and ancestry uses", () => {
    const character = guidedStandardArrayGenerateDnd5eFirstSlice({
      name: "Stone Walker",
      classChoice: { selectedId: "fighter", acceptableIds: ["fighter"], selectionMode: "direct" },
      speciesChoice: { selectedId: "goliath", acceptableIds: ["goliath"], selectionMode: "direct" },
      assignment,
      backgroundIncreases: { strength: 2, constitution: 1 },
    });
    const payload = payloadOf(character);
    expect(payload.origin.speciesAncestryId).toBe("stone");
    expect(payload.origin.speedFeet).toBe(35);
    expect(payload.resources.giantAncestryMaximum).toBe(2);
    expect(payload.resources.giantAncestryCurrent).toBe(2);
    expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!).valid).toBe(true);
  });

  it("builds all enabled class/species combinations through one native-state boundary", () => {
    for (const classId of GUIDED_DND5E_CLASS_IDS) {
      for (const speciesId of GUIDED_DND5E_SPECIES_IDS) {
        const character = guidedStandardArrayGenerateDnd5eFirstSlice({
          name: `${speciesId} ${classId}`,
          classChoice: { selectedId: classId, acceptableIds: [classId], selectionMode: "direct" },
          speciesChoice: { selectedId: speciesId, acceptableIds: [speciesId], selectionMode: "direct" },
          assignment,
          backgroundIncreases: { strength: 2, constitution: 1 },
        });
        expect(dnd5eSrd521Adapter.validateNativeState(character.nativeStates[0]!).valid).toBe(true);
      }
    }
  });

  it("rejects a selected choice that is outside its acceptable pool", () => {
    expect(() => guidedStandardArrayGenerateDnd5eFirstSlice({
      name: "Nope",
      classChoice: { selectedId: "fighter", acceptableIds: ["barbarian"], selectionMode: "direct" },
      speciesChoice: { selectedId: "human", acceptableIds: ["human"], selectionMode: "direct" },
      assignment,
      backgroundIncreases: { strength: 2, constitution: 1 },
    })).toThrow("Selected class must be included");
  });
});
