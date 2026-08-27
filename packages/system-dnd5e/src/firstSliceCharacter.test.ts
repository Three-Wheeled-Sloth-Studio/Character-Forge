import { describe, expect, it } from "vitest";
import type { JsonObject, NativeSystemState } from "../../character-model/src/index.js";
import { dnd5eSrd521Adapter } from "./adapter.js";
import {
  createFirstSliceCharacterDocument,
  createFirstSliceNativeState,
} from "./firstSliceCharacter.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";

function asObject(value: unknown): JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Expected JSON object in test fixture.");
  }
  return value as JsonObject;
}

describe("D&D 5E 2024 first vertical slice", () => {
  it("declares a versioned SRD source with license provenance", () => {
    expect(dnd5eSrd521Adapter.adapterVersion).toBe("0.8.0");
    expect(dnd5eSrd521Adapter.supportedRulesSources).toEqual([
      DND5E_SRD_5_2_1_SOURCE,
    ]);
    expect(DND5E_SRD_5_2_1_SOURCE.license.id).toBe("CC-BY-4.0");
  });

  it("validates the default Human Soldier Fighter Level 1 path", () => {
    const result = dnd5eSrd521Adapter.validateNativeState(
      createFirstSliceNativeState(),
    );

    expect(result).toEqual({ valid: true, issues: [] });
  });

  it("validates a reassigned Standard Array and recomputes dependent native values", () => {
    const character = createFirstSliceCharacterDocument({
      assignment: {
        strength: 14,
        dexterity: 15,
        constitution: 13,
        intelligence: 10,
        wisdom: 12,
        charisma: 8,
      },
      backgroundIncreases: { dexterity: 2, constitution: 1 },
    });
    const nativeState = character.nativeStates[0];
    const payload = asObject(nativeState.payload);
    const abilities = asObject(payload.abilities);
    const final = asObject(abilities.final);
    const derived = asObject(payload.derived);

    expect(dnd5eSrd521Adapter.validateNativeState(nativeState)).toEqual({
      valid: true,
      issues: [],
    });
    expect(final.dexterity).toBe(17);
    expect(derived.initiativeModifier).toBe(5);
    expect(derived.passivePerception).toBe(13);
    expect(character.generation?.decisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ stepId: "abilities.standard-array" }),
        expect.objectContaining({ stepId: "background.ability-increases" }),
      ]),
    );
  });

  it("validates the Soldier +1/+1/+1 background adjustment alternative", () => {
    const result = dnd5eSrd521Adapter.validateNativeState(
      createFirstSliceNativeState({
        assignment: {
          strength: 15,
          dexterity: 14,
          constitution: 13,
          intelligence: 8,
          wisdom: 10,
          charisma: 12,
        },
        backgroundIncreases: {
          strength: 1,
          dexterity: 1,
          constitution: 1,
        },
      }),
    );

    expect(result).toEqual({ valid: true, issues: [] });
  });

  it("preserves and revalidates exact native state through JSON save and reload", () => {
    const character = createFirstSliceCharacterDocument();
    const originalNativeState = character.nativeStates[0];
    const reloaded = JSON.parse(JSON.stringify(character)) as typeof character;

    expect(reloaded.nativeStates[0]).toEqual(originalNativeState);
    expect(reloaded.semanticProjection).toBeUndefined();
    expect(dnd5eSrd521Adapter.validateNativeState(reloaded.nativeStates[0]).valid).toBe(true);
    expect(reloaded.generation?.rulesSourceIds).toContain(
      DND5E_SRD_5_2_1_SOURCE.id,
    );
  });

  it("rejects a native state whose Level 1 Fighter hit points do not match Constitution", () => {
    const invalid = JSON.parse(
      JSON.stringify(createFirstSliceNativeState()),
    ) as NativeSystemState;
    const payload = asObject(invalid.payload);
    const resources = asObject(payload.resources);
    resources.hitPointsMaximum = 11;

    const result = dnd5eSrd521Adapter.validateNativeState(invalid);

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain(
      "dnd5e.fighter.level-one-hp",
    );
  });

  it("rejects native state that loses its rules-source provenance", () => {
    const invalid = JSON.parse(
      JSON.stringify(createFirstSliceNativeState()),
    ) as NativeSystemState;
    const payload = asObject(invalid.payload);
    payload.rulesSourceIds = [];

    const result = dnd5eSrd521Adapter.validateNativeState(invalid);

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain(
      "dnd5e.rules-source.missing",
    );
  });
});
