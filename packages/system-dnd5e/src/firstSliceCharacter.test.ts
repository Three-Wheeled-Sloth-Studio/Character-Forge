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
    expect(dnd5eSrd521Adapter.adapterVersion).toBe("0.1.0");
    expect(dnd5eSrd521Adapter.supportedRulesSources).toEqual([
      DND5E_SRD_5_2_1_SOURCE,
    ]);
    expect(DND5E_SRD_5_2_1_SOURCE.license.id).toBe("CC-BY-4.0");
  });

  it("validates the fixed Human Soldier Fighter Level 1 path", () => {
    const result = dnd5eSrd521Adapter.validateNativeState(
      createFirstSliceNativeState(),
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
