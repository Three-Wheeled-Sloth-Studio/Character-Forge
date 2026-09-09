import type { CharacterDocument, JsonObject } from "../../character-model/src/index.js";
import {
  createGeneratedSeed,
  evaluateRandomTable,
  RANDOM_TABLE_EVALUATOR_VERSION,
  type RandomTable,
} from "../../generator-core/src/index.js";
import type { BrpAcademicSkillSelection } from "./nativeCharacter.js";
import { BRP_UGE_ORC_1_05_SOURCE } from "./rulesSource.js";
import { BRP_FIRST_SLICE_SKILL_CATALOG } from "./skills.js";

export const BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE_ID = "brp-uge.scholar-academic.first-slice" as const;
export const BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE_VERSION = "1" as const;

export type BrpScholarAcademicSuggestionSkillKey = "knowledge:law" | "science:forensics";

export interface BrpScholarAcademicSuggestionResult extends JsonObject {
  skillKey: BrpScholarAcademicSuggestionSkillKey;
  selection: BrpAcademicSkillSelection;
  label: string;
  baseChance: number;
}

export interface BrpScholarAcademicSuggestionProvenance extends JsonObject {
  evaluatorVersion: typeof RANDOM_TABLE_EVALUATOR_VERSION;
  tableId: typeof BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE_ID;
  tableVersion: typeof BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE_VERSION;
  sourceId: typeof BRP_UGE_ORC_1_05_SOURCE.id;
  sourceVersion: typeof BRP_UGE_ORC_1_05_SOURCE.version;
  seed: string;
  drawIndex: number;
  selectedEntryId: string;
  selectedWeight: number;
  totalWeight: number;
  selectedSkillKey: BrpScholarAcademicSuggestionSkillKey;
}

export interface BrpScholarAcademicSuggestion {
  result: BrpScholarAcademicSuggestionResult;
  provenance: BrpScholarAcademicSuggestionProvenance;
}

export interface BrpScholarAcademicSuggestionOptions {
  seed?: string;
  drawIndex?: number;
}

export interface BrpScholarAcademicSuggestionRecord extends JsonObject {
  slotIndex: number;
  result: BrpScholarAcademicSuggestionResult;
  provenance: BrpScholarAcademicSuggestionProvenance;
}

const BRP_SCHOLAR_ACADEMIC_SUGGESTION_SKILL_KEYS = [
  "knowledge:law",
  "science:forensics",
] as const satisfies readonly BrpScholarAcademicSuggestionSkillKey[];

export const BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE = {
  id: BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE_ID,
  version: BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE_VERSION,
  source: {
    id: BRP_UGE_ORC_1_05_SOURCE.id,
    version: BRP_UGE_ORC_1_05_SOURCE.version,
  },
  entries: BRP_SCHOLAR_ACADEMIC_SUGGESTION_SKILL_KEYS.map((skillKey) => ({
    id: `scholar-academic:${skillKey}`,
    result: resultForSkillKey(skillKey),
  })),
} satisfies RandomTable<BrpScholarAcademicSuggestionResult>;

export function suggestBrpScholarAcademicSkill(
  options: BrpScholarAcademicSuggestionOptions = {},
): BrpScholarAcademicSuggestion {
  const seed = options.seed?.trim() || createGeneratedSeed("brp-scholar-academic");
  const evaluation = evaluateRandomTable<BrpScholarAcademicSuggestionResult>(
    BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE,
    {
      seed,
      drawIndex: options.drawIndex ?? 0,
    },
  );

  return {
    result: cloneResult(evaluation.result),
    provenance: {
      evaluatorVersion: evaluation.provenance.evaluatorVersion,
      tableId: BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE_ID,
      tableVersion: BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE_VERSION,
      sourceId: BRP_UGE_ORC_1_05_SOURCE.id,
      sourceVersion: BRP_UGE_ORC_1_05_SOURCE.version,
      seed: evaluation.provenance.seed,
      drawIndex: evaluation.provenance.drawIndex,
      selectedEntryId: evaluation.provenance.selectedEntryId,
      selectedWeight: evaluation.provenance.selectedWeight,
      totalWeight: evaluation.provenance.totalWeight,
      selectedSkillKey: evaluation.result.skillKey,
    },
  };
}

export function applyBrpScholarAcademicSuggestion(
  character: CharacterDocument,
  slotIndex: number,
  suggestion: BrpScholarAcademicSuggestion,
): CharacterDocument {
  assertScholarSlot(slotIndex);
  const result = parseBrpScholarAcademicSuggestionResult(suggestion.result);
  const provenance = parseBrpScholarAcademicSuggestionProvenance(suggestion.provenance);
  if (!result || !provenance || result.skillKey !== provenance.selectedSkillKey) {
    throw new Error("BRP Scholar academic suggestion is invalid or stale.");
  }

  const authoritativeSelection = primaryScholarAcademicSelection(character, slotIndex);
  if (!authoritativeSelection) {
    throw new Error("BRP Scholar academic suggestions can only be applied to a supported Scholar character.");
  }
  if (!academicSelectionsEqual(authoritativeSelection, result.selection)) {
    throw new Error("BRP Scholar academic suggestion does not match the character's selected academic specialty.");
  }
  if (!character.generation) {
    throw new Error("BRP Scholar academic suggestion provenance requires a retained generation record.");
  }

  const record: BrpScholarAcademicSuggestionRecord = {
    slotIndex,
    result: cloneResult(result),
    provenance: { ...provenance },
  };

  return {
    ...character,
    generation: {
      ...character.generation,
      decisions: [
        ...character.generation.decisions.filter((decision) => !isAcademicSuggestionDecisionForSlot(decision, slotIndex)),
        {
          stepId: "identity.profession-academic-suggestion",
          answer: record,
        },
      ],
    },
  };
}

export function readBrpScholarAcademicSuggestions(
  character: CharacterDocument,
): BrpScholarAcademicSuggestionRecord[] {
  const bySlot = new Map<number, BrpScholarAcademicSuggestionRecord>();
  for (const decision of character.generation?.decisions ?? []) {
    if (decision.stepId !== "identity.profession-academic-suggestion") continue;
    const record = parseBrpScholarAcademicSuggestionRecord(decision.answer);
    if (!record) continue;
    const authoritativeSelection = primaryScholarAcademicSelection(character, record.slotIndex);
    if (!authoritativeSelection || !academicSelectionsEqual(authoritativeSelection, record.result.selection)) continue;
    bySlot.set(record.slotIndex, record);
  }
  return [...bySlot.values()].sort((left, right) => left.slotIndex - right.slotIndex);
}

export function parseBrpScholarAcademicSuggestionRecord(
  value: unknown,
): BrpScholarAcademicSuggestionRecord | null {
  if (!isRecord(value)) return null;
  const slotIndex = value.slotIndex;
  if (typeof slotIndex !== "number" || !Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex > 4) return null;
  const result = parseBrpScholarAcademicSuggestionResult(value.result);
  const provenance = parseBrpScholarAcademicSuggestionProvenance(value.provenance);
  if (!result || !provenance || result.skillKey !== provenance.selectedSkillKey) return null;
  return {
    slotIndex,
    result,
    provenance,
  };
}

export function parseBrpScholarAcademicSuggestionResult(
  value: unknown,
): BrpScholarAcademicSuggestionResult | null {
  if (!isRecord(value)) return null;
  const skillKey = value.skillKey;
  if (!isAcademicSuggestionSkillKey(skillKey)) return null;
  const expected = resultForSkillKey(skillKey);
  if (value.label !== expected.label || value.baseChance !== expected.baseChance) return null;
  if (!isRecord(value.selection) || !academicSelectionsEqual(value.selection, expected.selection)) return null;
  return cloneResult(expected);
}

export function parseBrpScholarAcademicSuggestionProvenance(
  value: unknown,
): BrpScholarAcademicSuggestionProvenance | null {
  if (!isRecord(value)) return null;
  if (value.evaluatorVersion !== RANDOM_TABLE_EVALUATOR_VERSION
    || value.tableId !== BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE_ID
    || value.tableVersion !== BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE_VERSION
    || value.sourceId !== BRP_UGE_ORC_1_05_SOURCE.id
    || value.sourceVersion !== BRP_UGE_ORC_1_05_SOURCE.version) {
    return null;
  }

  const selectedSkillKey = value.selectedSkillKey;
  if (!isAcademicSuggestionSkillKey(selectedSkillKey)) return null;
  if (value.selectedEntryId !== `scholar-academic:${selectedSkillKey}`) return null;
  if (typeof value.seed !== "string" || !value.seed.trim()) return null;
  if (typeof value.drawIndex !== "number" || !Number.isInteger(value.drawIndex) || value.drawIndex < 0) return null;
  if (typeof value.selectedWeight !== "number" || !Number.isFinite(value.selectedWeight) || value.selectedWeight <= 0) return null;
  if (typeof value.totalWeight !== "number" || !Number.isFinite(value.totalWeight) || value.totalWeight < value.selectedWeight) return null;

  return {
    evaluatorVersion: RANDOM_TABLE_EVALUATOR_VERSION,
    tableId: BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE_ID,
    tableVersion: BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE_VERSION,
    sourceId: BRP_UGE_ORC_1_05_SOURCE.id,
    sourceVersion: BRP_UGE_ORC_1_05_SOURCE.version,
    seed: value.seed,
    drawIndex: value.drawIndex,
    selectedEntryId: value.selectedEntryId,
    selectedWeight: value.selectedWeight,
    totalWeight: value.totalWeight,
    selectedSkillKey,
  };
}

function resultForSkillKey(skillKey: BrpScholarAcademicSuggestionSkillKey): BrpScholarAcademicSuggestionResult {
  const definition = BRP_FIRST_SLICE_SKILL_CATALOG[skillKey];
  if (!definition.specialty || (definition.skillId !== "knowledge" && definition.skillId !== "science")) {
    throw new Error(`BRP Scholar academic suggestion source ${skillKey} is not an academic specialty.`);
  }
  return {
    skillKey,
    selection: {
      skillId: definition.skillId,
      specialty: { ...definition.specialty },
    },
    label: definition.label,
    baseChance: definition.baseChance,
  };
}

function primaryScholarAcademicSelection(
  character: CharacterDocument,
  slotIndex: number,
): BrpAcademicSkillSelection | null {
  const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId);
  if (!nativeState || nativeState.systemId !== "brp" || nativeState.editionId !== "uge-2023") return null;
  if (!isRecord(nativeState.payload)) return null;
  const identity = nativeState.payload.identity;
  if (!isRecord(identity)) return null;
  const profession = identity.profession;
  if (!isRecord(profession) || profession.professionId !== "scholar") return null;
  if (!Array.isArray(profession.selectedAcademicSkills)) return null;
  const selection = profession.selectedAcademicSkills[slotIndex];
  if (!isRecord(selection) || (selection.skillId !== "knowledge" && selection.skillId !== "science")) return null;
  if (!isRecord(selection.specialty) || typeof selection.specialty.id !== "string" || typeof selection.specialty.label !== "string") return null;
  return {
    skillId: selection.skillId,
    specialty: {
      id: selection.specialty.id,
      label: selection.specialty.label,
    },
  };
}

function academicSelectionsEqual(left: unknown, right: BrpAcademicSkillSelection): boolean {
  if (!isRecord(left) || (left.skillId !== "knowledge" && left.skillId !== "science")) return false;
  if (!isRecord(left.specialty)) return false;
  return left.skillId === right.skillId
    && left.specialty.id === right.specialty.id
    && left.specialty.label === right.specialty.label;
}

function isAcademicSuggestionDecisionForSlot(
  decision: { stepId: string; answer?: unknown },
  slotIndex: number,
): boolean {
  if (decision.stepId !== "identity.profession-academic-suggestion") return false;
  if (!isRecord(decision.answer)) return false;
  return decision.answer.slotIndex === slotIndex;
}

function cloneResult(result: BrpScholarAcademicSuggestionResult): BrpScholarAcademicSuggestionResult {
  return {
    skillKey: result.skillKey,
    selection: {
      skillId: result.selection.skillId,
      specialty: { ...result.selection.specialty },
    },
    label: result.label,
    baseChance: result.baseChance,
  };
}

function isAcademicSuggestionSkillKey(value: unknown): value is BrpScholarAcademicSuggestionSkillKey {
  return value === "knowledge:law" || value === "science:forensics";
}

function assertScholarSlot(slotIndex: number): void {
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex > 4) {
    throw new Error("BRP Scholar academic suggestion slot must be an integer from 0 through 4.");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
