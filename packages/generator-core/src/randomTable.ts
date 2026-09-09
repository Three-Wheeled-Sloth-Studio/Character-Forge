import { createSeededRandom, type RandomSource } from "./seededRandom.js";

export const RANDOM_TABLE_EVALUATOR_VERSION = "random-table/0.1" as const;

export interface RandomTableSource {
  id: string;
  version: string;
}

export interface RandomTableEntry<TResult> {
  id: string;
  weight?: number;
  result: TResult;
}

export interface RandomTable<TResult> {
  id: string;
  version: string;
  source: RandomTableSource;
  entries: readonly RandomTableEntry<TResult>[];
}

export interface RandomTableEvaluationOptions {
  seed: string;
  drawIndex?: number;
}

export interface RandomTableProvenance {
  evaluatorVersion: typeof RANDOM_TABLE_EVALUATOR_VERSION;
  tableId: string;
  tableVersion: string;
  source: RandomTableSource;
  seed: string;
  drawIndex: number;
  selectedEntryId: string;
  selectedWeight: number;
  totalWeight: number;
}

export interface RandomTableEvaluation<TResult> {
  result: TResult;
  provenance: RandomTableProvenance;
}

export interface WeightedRandomTableSelection<TResult> {
  entry: RandomTableEntry<TResult>;
  selectedWeight: number;
  totalWeight: number;
}

function requireNonEmpty(value: string, label: string): void {
  if (!value.trim()) throw new Error(`${label} must be non-empty.`);
}

function entryWeight<TResult>(entry: RandomTableEntry<TResult>): number {
  const weight = entry.weight ?? 1;
  if (!Number.isFinite(weight) || weight <= 0) {
    throw new Error(`Random table entry ${entry.id || "<blank>"} must have a positive finite weight.`);
  }
  return weight;
}

export function validateRandomTable<TResult>(table: RandomTable<TResult>): void {
  requireNonEmpty(table.id, "Random table id");
  requireNonEmpty(table.version, "Random table version");
  requireNonEmpty(table.source.id, "Random table source id");
  requireNonEmpty(table.source.version, "Random table source version");
  if (table.entries.length === 0) throw new Error("Random table must contain at least one entry.");

  const entryIds = new Set<string>();
  for (const entry of table.entries) {
    requireNonEmpty(entry.id, "Random table entry id");
    if (entryIds.has(entry.id)) throw new Error(`Duplicate random table entry id: ${entry.id}`);
    entryIds.add(entry.id);
    entryWeight(entry);
  }
}

export function pickWeightedRandomTableEntry<TResult>(
  table: RandomTable<TResult>,
  random: RandomSource,
): WeightedRandomTableSelection<TResult> {
  validateRandomTable(table);

  const weightedEntries = table.entries.map((entry) => ({
    entry,
    weight: entryWeight(entry),
  }));
  const totalWeight = weightedEntries.reduce((sum, candidate) => sum + candidate.weight, 0);
  if (!Number.isFinite(totalWeight)) throw new Error("Random table total weight must be finite.");

  const randomValue = random();
  if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) {
    throw new Error("Random source must return a finite value in the range [0, 1).");
  }

  let cursor = randomValue * totalWeight;
  for (const candidate of weightedEntries) {
    if (cursor < candidate.weight) {
      return {
        entry: candidate.entry,
        selectedWeight: candidate.weight,
        totalWeight,
      };
    }
    cursor -= candidate.weight;
  }

  const fallback = weightedEntries[weightedEntries.length - 1];
  if (!fallback) throw new Error("Random table must contain at least one entry.");
  return {
    entry: fallback.entry,
    selectedWeight: fallback.weight,
    totalWeight,
  };
}

export function evaluateRandomTable<TResult>(
  table: RandomTable<TResult>,
  options: RandomTableEvaluationOptions,
): RandomTableEvaluation<TResult> {
  const seed = options.seed.trim();
  if (!seed) throw new Error("A non-empty seed is required for random-table evaluation.");

  const drawIndex = options.drawIndex ?? 0;
  if (!Number.isInteger(drawIndex) || drawIndex < 0) {
    throw new Error("Random-table drawIndex must be a non-negative integer.");
  }

  validateRandomTable(table);
  const random = createSeededRandom(
    [
      RANDOM_TABLE_EVALUATOR_VERSION,
      table.source.id,
      table.source.version,
      table.id,
      table.version,
      seed,
      drawIndex.toString(),
    ].join("|"),
  );
  const selected = pickWeightedRandomTableEntry(table, random);

  return {
    result: selected.entry.result,
    provenance: {
      evaluatorVersion: RANDOM_TABLE_EVALUATOR_VERSION,
      tableId: table.id,
      tableVersion: table.version,
      source: { ...table.source },
      seed,
      drawIndex,
      selectedEntryId: selected.entry.id,
      selectedWeight: selected.selectedWeight,
      totalWeight: selected.totalWeight,
    },
  };
}
