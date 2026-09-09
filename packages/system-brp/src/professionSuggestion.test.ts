import { describe, expect, it } from "vitest";
import type { CharacterDocument } from "../../character-model/src/index.js";
import {
  BRP_PROFESSION_SUGGESTION_TABLE,
  BRP_PROFESSION_SUGGESTION_TABLE_ID,
  applyBrpProfessionSuggestion,
  parseBrpProfessionSuggestionProvenance,
  readBrpProfessionSuggestion,
  suggestBrpProfession,
} from "./professionSuggestion.js";
import type { BrpProfessionId } from "./nativeCharacter.js";
import { BRP_UGE_ORC_1_05_SOURCE } from "./rulesSource.js";

function characterForProfession(professionId: BrpProfessionId): CharacterDocument {
  return {
    schemaVersion: "character-document/0.1",
    characterId: "character-brp-profession-suggestion",
    displayName: "Suggestion Test",
    primaryNativeStateId: "native-brp-profession-suggestion",
    nativeStates: [
      {
        id: "native-brp-profession-suggestion",
        systemId: "brp",
        editionId: "uge-2023",
        rulesVersion: BRP_UGE_ORC_1_05_SOURCE.version,
        schemaVersion: "brp-character/0.1",
        payload: {
          identity: {
            profession: { professionId },
          },
        },
        provenance: {
          origin: "generated",
          sourceId: BRP_UGE_ORC_1_05_SOURCE.id,
        },
      },
    ],
    generation: {
      methodId: "brp-profession-suggestion-test",
      mode: "mechanical",
      recipeVersion: "1",
      rulesSourceIds: [BRP_UGE_ORC_1_05_SOURCE.id],
      recipe: { professionId },
      decisions: [{ stepId: "identity.profession", choiceId: professionId }],
    },
  };
}

describe("BRP profession random-table consumer", () => {
  it("owns a source-safe table inside BRP and replays deterministic suggestions", () => {
    expect(BRP_PROFESSION_SUGGESTION_TABLE.source).toEqual({
      id: BRP_UGE_ORC_1_05_SOURCE.id,
      version: BRP_UGE_ORC_1_05_SOURCE.version,
    });
    expect(BRP_PROFESSION_SUGGESTION_TABLE.entries.map((entry) => entry.result.professionId)).toEqual([
      "detective",
      "scholar",
    ]);

    const first = suggestBrpProfession({ seed: "profession-replay", drawIndex: 3 });
    const second = suggestBrpProfession({ seed: "profession-replay", drawIndex: 3 });

    expect(first).toEqual(second);
    expect(first.provenance).toMatchObject({
      evaluatorVersion: "random-table/0.1",
      tableId: BRP_PROFESSION_SUGGESTION_TABLE_ID,
      sourceId: BRP_UGE_ORC_1_05_SOURCE.id,
      sourceVersion: BRP_UGE_ORC_1_05_SOURCE.version,
      seed: "profession-replay",
      drawIndex: 3,
      selectedProfessionId: first.result.professionId,
    });
    expect(first.provenance.selectedEntryId).toBe(`profession:${first.result.professionId}`);
  });

  it("applies accepted provenance only to the generation record, never native state", () => {
    const suggestion = suggestBrpProfession({ seed: "apply-profession", drawIndex: 1 });
    const original = characterForProfession(suggestion.result.professionId);
    const originalNativeStates = original.nativeStates;
    const originalPayload = original.nativeStates[0].payload;

    const applied = applyBrpProfessionSuggestion(original, suggestion.provenance);

    expect(applied.nativeStates).toBe(originalNativeStates);
    expect(applied.nativeStates[0].payload).toBe(originalPayload);
    expect(applied.generation?.decisions.at(-1)).toEqual({
      stepId: "identity.profession-suggestion",
      answer: suggestion.provenance,
    });
    expect(readBrpProfessionSuggestion(applied)).toEqual(suggestion.provenance);
  });

  it("replaces prior suggestion provenance instead of stacking replay records", () => {
    const first = suggestBrpProfession({ seed: "replace-profession", drawIndex: 0 });
    const second = suggestBrpProfession({ seed: "replace-profession", drawIndex: 2 });
    const targetProfession = second.result.professionId;
    const original = characterForProfession(targetProfession);
    const withFirst = first.result.professionId === targetProfession
      ? applyBrpProfessionSuggestion(original, first.provenance)
      : original;
    const withSecond = applyBrpProfessionSuggestion(withFirst, second.provenance);

    expect(withSecond.generation?.decisions.filter((decision) => decision.stepId === "identity.profession-suggestion")).toHaveLength(1);
    expect(readBrpProfessionSuggestion(withSecond)).toEqual(second.provenance);
  });

  it("rejects mismatched or stale suggestion provenance", () => {
    const suggestion = suggestBrpProfession({ seed: "mismatch-profession", drawIndex: 0 });
    const opposite: BrpProfessionId = suggestion.result.professionId === "detective" ? "scholar" : "detective";

    expect(() => applyBrpProfessionSuggestion(characterForProfession(opposite), suggestion.provenance)).toThrow(
      "does not match",
    );
    expect(parseBrpProfessionSuggestionProvenance({
      ...suggestion.provenance,
      sourceVersion: "stale-version",
    })).toBeNull();
  });
});
