import type { JsonObject } from "../../character-model/src/index.js";
import {
  createGeneratedSeed,
  evaluateRandomTable,
  RANDOM_TABLE_EVALUATOR_VERSION,
  type RandomTable,
} from "../../generator-core/src/index.js";

export const BRP_APPEARANCE_SUGGESTION_TABLE_ID = "brp-uge.appearance.inspiration" as const;
export const BRP_APPEARANCE_SUGGESTION_TABLE_VERSION = "1" as const;
export const BRP_APPEARANCE_SUGGESTION_SOURCE = {
  id: "character-forge.brp.appearance-inspiration",
  version: "1",
} as const;

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

export interface BrpAppearanceSuggestionOptions {
  seed?: string;
  drawIndex?: number;
}

export const BRP_APPEARANCE_SUGGESTION_TABLE = {
  id: BRP_APPEARANCE_SUGGESTION_TABLE_ID,
  version: BRP_APPEARANCE_SUGGESTION_TABLE_VERSION,
  source: BRP_APPEARANCE_SUGGESTION_SOURCE,
  entries: [
    { id: "appearance:watchful", result: { appearance: "Watchful eyes, practical clothes, and a habit of keeping every button fastened." } },
    { id: "appearance:weathered", result: { appearance: "A weathered face, wind-tossed hair, and clothing repaired more carefully than replaced." } },
    { id: "appearance:precise", result: { appearance: "Immaculate grooming, precise posture, and one conspicuously well-kept accessory." } },
    { id: "appearance:scarred", result: { appearance: "An old scar near one eyebrow, steady hands, and a direct, assessing gaze." } },
    { id: "appearance:tired", result: { appearance: "Permanent shadows beneath the eyes, rumpled clothes, and surprisingly polished shoes." } },
    { id: "appearance:bright", result: { appearance: "Bright, expressive eyes, an easy smile, and one piece of clothing chosen for flair rather than utility." } },
    { id: "appearance:reserved", result: { appearance: "Reserved expression, neatly trimmed hair, and understated clothing in muted tones." } },
    { id: "appearance:restless", result: { appearance: "Restless hands, unevenly cut hair, and clothes marked by frequent travel or hard use." } },
    { id: "appearance:formal", result: { appearance: "Formal bearing, carefully maintained clothes, and a small personal detail that quietly breaks the symmetry." } },
    { id: "appearance:open", result: { appearance: "Open expression, relaxed posture, and comfortable clothes chosen for movement rather than display." } },
    { id: "appearance:angular", result: { appearance: "Angular features, closely kept hair, and a coat or jacket that has clearly seen years of service." } },
    { id: "appearance:distinctive", result: { appearance: "A distinctive streak in the hair, alert eyes, and an otherwise deliberately ordinary presentation." } },
  ],
} as const satisfies RandomTable<BrpAppearanceSuggestionResult>;

export function suggestBrpAppearance(
  options: BrpAppearanceSuggestionOptions = {},
): BrpAppearanceSuggestion {
  const seed = options.seed?.trim() || createGeneratedSeed("brp-appearance");
  const evaluation = evaluateRandomTable<BrpAppearanceSuggestionResult>(BRP_APPEARANCE_SUGGESTION_TABLE, {
    seed,
    drawIndex: options.drawIndex ?? 0,
  });

  return {
    result: { ...evaluation.result },
    provenance: {
      evaluatorVersion: evaluation.provenance.evaluatorVersion,
      tableId: BRP_APPEARANCE_SUGGESTION_TABLE_ID,
      tableVersion: BRP_APPEARANCE_SUGGESTION_TABLE_VERSION,
      sourceId: BRP_APPEARANCE_SUGGESTION_SOURCE.id,
      sourceVersion: BRP_APPEARANCE_SUGGESTION_SOURCE.version,
      seed: evaluation.provenance.seed,
      drawIndex: evaluation.provenance.drawIndex,
      selectedEntryId: evaluation.provenance.selectedEntryId,
    },
  };
}
