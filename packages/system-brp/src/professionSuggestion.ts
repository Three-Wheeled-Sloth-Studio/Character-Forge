import type { CharacterDocument, JsonObject } from "../../character-model/src/index.js";
import {
  createGeneratedSeed,
  evaluateRandomTable,
  RANDOM_TABLE_EVALUATOR_VERSION,
  type RandomTable,
} from "../../generator-core/src/index.js";
import type { BrpProfessionId } from "./nativeCharacter.js";
import { BRP_UGE_ORC_1_05_SOURCE } from "./rulesSource.js";

export const BRP_PROFESSION_SUGGESTION_TABLE_ID = "brp-uge.profession.first-slice" as const;
export const BRP_PROFESSION_SUGGESTION_TABLE_VERSION = "1" as const;

export interface BrpProfessionSuggestionResult extends JsonObject {
  professionId: BrpProfessionId;
  label: string;
}

export interface BrpProfessionSuggestionProvenance extends JsonObject {
  evaluatorVersion: typeof RANDOM_TABLE_EVALUATOR_VERSION;
  tableId: typeof BRP_PROFESSION_SUGGESTION_TABLE_ID;
  tableVersion: typeof BRP_PROFESSION_SUGGESTION_TABLE_VERSION;
  sourceId: typeof BRP_UGE_ORC_1_05_SOURCE.id;
  sourceVersion: typeof BRP_UGE_ORC_1_05_SOURCE.version;
  seed: string;
  drawIndex: number;
  selectedEntryId: string;
  selectedWeight: number;
  totalWeight: number;
  selectedProfessionId: BrpProfessionId;
}

export interface BrpProfessionSuggestion {
  result: BrpProfessionSuggestionResult;
  provenance: BrpProfessionSuggestionProvenance;
}

export interface BrpProfessionSuggestionOptions {
  seed?: string;
  drawIndex?: number;
}

export const BRP_PROFESSION_SUGGESTION_TABLE = {
  id: BRP_PROFESSION_SUGGESTION_TABLE_ID,
  version: BRP_PROFESSION_SUGGESTION_TABLE_VERSION,
  source: {
    id: BRP_UGE_ORC_1_05_SOURCE.id,
    version: BRP_UGE_ORC_1_05_SOURCE.version,
  },
  entries: [
    {
      id: "profession:detective",
      result: { professionId: "detective", label: "Detective" },
    },
    {
      id: "profession:scholar",
      result: { professionId: "scholar", label: "Scholar" },
    },
  ],
} as const satisfies RandomTable<BrpProfessionSuggestionResult>;

export function suggestBrpProfession(
  options: BrpProfessionSuggestionOptions = {},
): BrpProfessionSuggestion {
  const seed = options.seed?.trim() || createGeneratedSeed("brp-profession");
  const evaluation = evaluateRandomTable(BRP_PROFESSION_SUGGESTION_TABLE, {
    seed,
    drawIndex: options.drawIndex ?? 0,
  });

  return {
    result: { ...evaluation.result },
    provenance: {
      evaluatorVersion: evaluation.provenance.evaluatorVersion,
      tableId: BRP_PROFESSION_SUGGESTION_TABLE_ID,
      tableVersion: BRP_PROFESSION_SUGGESTION_TABLE_VERSION,
      sourceId: BRP_UGE_ORC_1_05_SOURCE.id,
      sourceVersion: BRP_UGE_ORC_1_05_SOURCE.version,
      seed: evaluation.provenance.seed,
      drawIndex: evaluation.provenance.drawIndex,
      selectedEntryId: evaluation.provenance.selectedEntryId,
      selectedWeight: evaluation.provenance.selectedWeight,
      totalWeight: evaluation.provenance.totalWeight,
      selectedProfessionId: evaluation.result.professionId,
    },
  };
}

export function applyBrpProfessionSuggestion(
  character: CharacterDocument,
  provenance: BrpProfessionSuggestionProvenance,
): CharacterDocument {
  const parsed = parseBrpProfessionSuggestionProvenance(provenance);
  if (!parsed) throw new Error("BRP profession suggestion provenance is invalid or stale.");

  const professionId = primaryBrpProfessionId(character);
  if (!professionId) {
    throw new Error("BRP profession suggestions can only be applied to a supported BRP UGE character.");
  }
  if (parsed.selectedProfessionId !== professionId) {
    throw new Error("BRP profession suggestion does not match the character's selected profession.");
  }
  if (!character.generation) {
    throw new Error("BRP profession suggestion provenance requires a retained generation record.");
  }

  return {
    ...character,
    generation: {
      ...character.generation,
      decisions: [
        ...character.generation.decisions.filter((decision) => decision.stepId !== "identity.profession-suggestion"),
        {
          stepId: "identity.profession-suggestion",
          answer: { ...parsed },
        },
      ],
    },
  };
}

export function readBrpProfessionSuggestion(
  character: CharacterDocument,
): BrpProfessionSuggestionProvenance | null {
  const decision = [...(character.generation?.decisions ?? [])]
    .reverse()
    .find((candidate) => candidate.stepId === "identity.profession-suggestion");
  const parsed = parseBrpProfessionSuggestionProvenance(decision?.answer);
  if (!parsed) return null;
  return primaryBrpProfessionId(character) === parsed.selectedProfessionId ? parsed : null;
}

export function parseBrpProfessionSuggestionProvenance(
  value: unknown,
): BrpProfessionSuggestionProvenance | null {
  if (!isRecord(value)) return null;
  if (value.evaluatorVersion !== RANDOM_TABLE_EVALUATOR_VERSION
    || value.tableId !== BRP_PROFESSION_SUGGESTION_TABLE_ID
    || value.tableVersion !== BRP_PROFESSION_SUGGESTION_TABLE_VERSION
    || value.sourceId !== BRP_UGE_ORC_1_05_SOURCE.id
    || value.sourceVersion !== BRP_UGE_ORC_1_05_SOURCE.version) {
    return null;
  }

  const selectedProfessionId = value.selectedProfessionId;
  if (selectedProfessionId !== "detective" && selectedProfessionId !== "scholar") return null;
  if (value.selectedEntryId !== `profession:${selectedProfessionId}`) return null;
  if (typeof value.seed !== "string" || !value.seed.trim()) return null;
  if (typeof value.drawIndex !== "number" || !Number.isInteger(value.drawIndex) || value.drawIndex < 0) return null;
  if (typeof value.selectedWeight !== "number" || !Number.isFinite(value.selectedWeight) || value.selectedWeight <= 0) return null;
  if (typeof value.totalWeight !== "number" || !Number.isFinite(value.totalWeight) || value.totalWeight < value.selectedWeight) return null;

  return {
    evaluatorVersion: RANDOM_TABLE_EVALUATOR_VERSION,
    tableId: BRP_PROFESSION_SUGGESTION_TABLE_ID,
    tableVersion: BRP_PROFESSION_SUGGESTION_TABLE_VERSION,
    sourceId: BRP_UGE_ORC_1_05_SOURCE.id,
    sourceVersion: BRP_UGE_ORC_1_05_SOURCE.version,
    seed: value.seed,
    drawIndex: value.drawIndex,
    selectedEntryId: value.selectedEntryId,
    selectedWeight: value.selectedWeight,
    totalWeight: value.totalWeight,
    selectedProfessionId,
  };
}

function primaryBrpProfessionId(character: CharacterDocument): BrpProfessionId | null {
  const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId);
  if (!nativeState || nativeState.systemId !== "brp" || nativeState.editionId !== "uge-2023") return null;
  if (!isRecord(nativeState.payload)) return null;
  const identity = nativeState.payload.identity;
  if (!isRecord(identity)) return null;
  const profession = identity.profession;
  if (!isRecord(profession)) return null;
  return profession.professionId === "detective" || profession.professionId === "scholar"
    ? profession.professionId
    : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
