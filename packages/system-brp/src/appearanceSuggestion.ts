import type { JsonObject } from "../../character-model/src/index.js";
import { RANDOM_TABLE_EVALUATOR_VERSION } from "../../generator-core/src/index.js";
import {
  BRP_FLAVOR_SUGGESTION_SOURCE,
  BRP_FLAVOR_SUGGESTION_TABLES,
  suggestBrpFinishingField,
  type BrpFlavorSuggestionOptions,
} from "./flavorSuggestion.js";

export const BRP_APPEARANCE_SUGGESTION_TABLE_ID = "brp-uge.appearance.inspiration" as const;
export const BRP_APPEARANCE_SUGGESTION_TABLE_VERSION = "1" as const;
export const BRP_APPEARANCE_SUGGESTION_SOURCE = BRP_FLAVOR_SUGGESTION_SOURCE;
export const BRP_APPEARANCE_SUGGESTION_TABLE = BRP_FLAVOR_SUGGESTION_TABLES.appearance;

export interface BrpAppearanceSuggestionResult extends JsonObject {
  appearance: string;
}

export interface BrpAppearanceSuggestionProvenance extends JsonObject {
  evaluatorVersion: typeof RANDOM_TABLE_EVALUATOR_VERSION;
  tableId: typeof BRP_APPEARANCE_SUGGESTION_TABLE_ID;
  tableVersion: typeof BRP_APPEARANCE_SUGGESTION_TABLE_VERSION;
  sourceId: typeof BRP_APPEARANCE_SUGGESTION_SOURCE.id;
  sourceVersion: typeof BRP_APPEARANCE_SUGGESTION_SOURCE.version;
  seed: string;
  drawIndex: number;
  selectedEntryId: string;
}

export interface BrpAppearanceSuggestion {
  result: BrpAppearanceSuggestionResult;
  provenance: BrpAppearanceSuggestionProvenance;
}

export type BrpAppearanceSuggestionOptions = BrpFlavorSuggestionOptions;

export function suggestBrpAppearance(
  options: BrpAppearanceSuggestionOptions = {},
): BrpAppearanceSuggestion {
  const suggestion = suggestBrpFinishingField("appearance", options);
  return {
    result: { appearance: suggestion.result.value },
    provenance: {
      evaluatorVersion: suggestion.provenance.evaluatorVersion,
      tableId: BRP_APPEARANCE_SUGGESTION_TABLE_ID,
      tableVersion: BRP_APPEARANCE_SUGGESTION_TABLE_VERSION,
      sourceId: BRP_APPEARANCE_SUGGESTION_SOURCE.id,
      sourceVersion: BRP_APPEARANCE_SUGGESTION_SOURCE.version,
      seed: suggestion.provenance.seed,
      drawIndex: suggestion.provenance.drawIndex,
      selectedEntryId: suggestion.provenance.selectedEntryId,
    },
  };
}
