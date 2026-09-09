import { describe, expect, it } from "vitest";
import type { CharacterDocument } from "../../character-model/src/index.js";
import {
  BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE,
  BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE_ID,
  applyBrpScholarAcademicSuggestion,
  parseBrpScholarAcademicSuggestionRecord,
  readBrpScholarAcademicSuggestions,
  suggestBrpScholarAcademicSkill,
  type BrpScholarAcademicSuggestion,
} from "./scholarAcademicSuggestion.js";
import type { BrpAcademicSkillSelection } from "./nativeCharacter.js";
import { BRP_UGE_ORC_1_05_SOURCE } from "./rulesSource.js";
import { BRP_FIRST_SLICE_SKILL_CATALOG } from "./skills.js";

const DEFAULT_ACADEMICS: BrpAcademicSkillSelection[] = [
  { skillId: "knowledge", specialty: { id: "history", label: "History" } },
  { skillId: "knowledge", specialty: { id: "literature", label: "Literature" } },
  { skillId: "science", specialty: { id: "biology", label: "Biology" } },
  { skillId: "science", specialty: { id: "chemistry", label: "Chemistry" } },
  { skillId: "science", specialty: { id: "physics", label: "Physics" } },
];

function scholarCharacter(academics: readonly BrpAcademicSkillSelection[]): CharacterDocument {
  return {
    schemaVersion: "character-document/0.1",
    characterId: "character-brp-scholar-academic-suggestion",
    displayName: "Academic Suggestion Test",
    primaryNativeStateId: "native-brp-scholar-academic-suggestion",
    nativeStates: [
      {
        id: "native-brp-scholar-academic-suggestion",
        systemId: "brp",
        editionId: "uge-2023",
        rulesVersion: BRP_UGE_ORC_1_05_SOURCE.version,
        schemaVersion: "brp-character/0.1",
        payload: {
          identity: {
            profession: {
              professionId: "scholar",
              selectedAcademicSkills: academics.map((selection) => ({
                skillId: selection.skillId,
                specialty: { ...selection.specialty },
              })),
            },
          },
        },
        provenance: {
          origin: "generated",
          sourceId: BRP_UGE_ORC_1_05_SOURCE.id,
        },
      },
    ],
    generation: {
      methodId: "brp-scholar-academic-suggestion-test",
      mode: "mechanical",
      recipeVersion: "1",
      rulesSourceIds: [BRP_UGE_ORC_1_05_SOURCE.id],
      recipe: { professionId: "scholar" },
      decisions: [{ stepId: "identity.profession", choiceId: "scholar" }],
    },
  };
}

function characterAccepting(slotIndex: number, suggestion: BrpScholarAcademicSuggestion): CharacterDocument {
  const academics = DEFAULT_ACADEMICS.map((selection) => ({
    skillId: selection.skillId,
    specialty: { ...selection.specialty },
  })) as BrpAcademicSkillSelection[];
  academics[slotIndex] = {
    skillId: suggestion.result.selection.skillId,
    specialty: { ...suggestion.result.selection.specialty },
  };
  return scholarCharacter(academics);
}

describe("BRP Scholar academic random-table consumer", () => {
  it("owns a source-safe nested academic payload inside BRP and replays deterministically", () => {
    expect(BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE.source).toEqual({
      id: BRP_UGE_ORC_1_05_SOURCE.id,
      version: BRP_UGE_ORC_1_05_SOURCE.version,
    });
    expect(BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE.entries.map((entry) => entry.result.skillKey)).toEqual([
      "knowledge:law",
      "science:forensics",
    ]);
    expect(BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE.entries[0]?.result).toMatchObject({
      selection: {
        skillId: "knowledge",
        specialty: BRP_FIRST_SLICE_SKILL_CATALOG["knowledge:law"].specialty,
      },
      baseChance: BRP_FIRST_SLICE_SKILL_CATALOG["knowledge:law"].baseChance,
    });

    const first = suggestBrpScholarAcademicSkill({ seed: "academic-replay", drawIndex: 4 });
    const second = suggestBrpScholarAcademicSkill({ seed: "academic-replay", drawIndex: 4 });

    expect(first).toEqual(second);
    expect(first.provenance).toMatchObject({
      evaluatorVersion: "random-table/0.1",
      tableId: BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE_ID,
      sourceId: BRP_UGE_ORC_1_05_SOURCE.id,
      sourceVersion: BRP_UGE_ORC_1_05_SOURCE.version,
      seed: "academic-replay",
      drawIndex: 4,
      selectedSkillKey: first.result.skillKey,
    });
    expect(first.provenance.selectedEntryId).toBe(`scholar-academic:${first.result.skillKey}`);
  });

  it("persists the structured result and provenance only in generation decisions", () => {
    const suggestion = suggestBrpScholarAcademicSkill({ seed: "apply-academic", drawIndex: 1 });
    const original = characterAccepting(2, suggestion);
    const originalNativeStates = original.nativeStates;
    const originalPayload = original.nativeStates[0].payload;

    const applied = applyBrpScholarAcademicSuggestion(original, 2, suggestion);

    expect(applied.nativeStates).toBe(originalNativeStates);
    expect(applied.nativeStates[0].payload).toBe(originalPayload);
    expect(applied.generation?.decisions.at(-1)).toEqual({
      stepId: "identity.profession-academic-suggestion",
      answer: {
        slotIndex: 2,
        result: suggestion.result,
        provenance: suggestion.provenance,
      },
    });
    expect(readBrpScholarAcademicSuggestions(applied)).toEqual([
      {
        slotIndex: 2,
        result: suggestion.result,
        provenance: suggestion.provenance,
      },
    ]);
  });

  it("keeps independent slot records and replaces only the resuggested slot", () => {
    const first = suggestBrpScholarAcademicSkill({ seed: "slot-zero", drawIndex: 0 });
    const second = suggestBrpScholarAcademicSkill({ seed: "slot-three", drawIndex: 3 });
    const replacement = suggestBrpScholarAcademicSkill({ seed: "slot-zero-replacement", drawIndex: 0 });
    const academics = DEFAULT_ACADEMICS.map((selection) => ({
      skillId: selection.skillId,
      specialty: { ...selection.specialty },
    })) as BrpAcademicSkillSelection[];
    academics[0] = { skillId: replacement.result.selection.skillId, specialty: { ...replacement.result.selection.specialty } };
    academics[3] = { skillId: second.result.selection.skillId, specialty: { ...second.result.selection.specialty } };
    let character = scholarCharacter(academics);

    if (first.result.skillKey === replacement.result.skillKey) {
      character = applyBrpScholarAcademicSuggestion(character, 0, first);
    }
    character = applyBrpScholarAcademicSuggestion(character, 3, second);
    character = applyBrpScholarAcademicSuggestion(character, 0, replacement);

    const records = readBrpScholarAcademicSuggestions(character);
    expect(records).toHaveLength(2);
    expect(records.find((record) => record.slotIndex === 0)?.provenance.seed).toBe("slot-zero-replacement");
    expect(records.find((record) => record.slotIndex === 3)?.provenance.seed).toBe("slot-three");
    expect(character.generation?.decisions.filter((decision) => decision.stepId === "identity.profession-academic-suggestion")).toHaveLength(2);
  });

  it("rejects suggestion records that do not match authoritative Scholar native state", () => {
    const suggestion = suggestBrpScholarAcademicSkill({ seed: "mismatch-academic", drawIndex: 0 });
    const original = scholarCharacter(DEFAULT_ACADEMICS);

    expect(() => applyBrpScholarAcademicSuggestion(original, 1, suggestion)).toThrow("does not match");

    const accepted = applyBrpScholarAcademicSuggestion(characterAccepting(1, suggestion), 1, suggestion);
    const changed = scholarCharacter(DEFAULT_ACADEMICS);
    expect(accepted.generation).toBeDefined();
    changed.generation = accepted.generation!;
    expect(readBrpScholarAcademicSuggestions(changed)).toEqual([]);
  });

  it("rejects stale table provenance and malformed slot records", () => {
    const suggestion = suggestBrpScholarAcademicSkill({ seed: "stale-academic", drawIndex: 2 });
    expect(parseBrpScholarAcademicSuggestionRecord({
      slotIndex: 2,
      result: suggestion.result,
      provenance: {
        ...suggestion.provenance,
        sourceVersion: "stale-version",
      },
    })).toBeNull();
    expect(parseBrpScholarAcademicSuggestionRecord({
      slotIndex: 5,
      result: suggestion.result,
      provenance: suggestion.provenance,
    })).toBeNull();
  });
});
