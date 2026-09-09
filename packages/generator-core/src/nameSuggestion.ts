import { createGeneratedSeed, createSeededRandom, type RandomSource } from "./seededRandom.js";

export const NAME_SUGGESTION_CONTRACT_VERSION = "name-suggestion/0.1" as const;

export interface NameSourceRef {
  id: string;
  version: string;
}

export interface NameSuggestionResult {
  displayName: string;
}

export interface NameSuggestionProvider<
  TContext,
  TResult extends NameSuggestionResult = NameSuggestionResult,
> {
  id: string;
  version: string;
  sources?: readonly NameSourceRef[];
  generate(context: TContext, random: RandomSource): TResult;
}

export interface NameSuggestionOptions<TContext> {
  context: TContext;
  seed?: string;
}

export interface NameSuggestionProvenance {
  contractVersion: typeof NAME_SUGGESTION_CONTRACT_VERSION;
  providerId: string;
  providerVersion: string;
  sources: NameSourceRef[];
  seed: string;
}

export interface NameSuggestion<TResult extends NameSuggestionResult = NameSuggestionResult> {
  result: TResult;
  provenance: NameSuggestionProvenance;
}

function requireNonEmpty(value: string, label: string): void {
  if (!value.trim()) throw new Error(`${label} must be non-empty.`);
}

export function validateNameSuggestionProvider<
  TContext,
  TResult extends NameSuggestionResult,
>(provider: NameSuggestionProvider<TContext, TResult>): void {
  requireNonEmpty(provider.id, "Name suggestion provider id");
  requireNonEmpty(provider.version, "Name suggestion provider version");

  const sourceKeys = new Set<string>();
  for (const source of provider.sources ?? []) {
    requireNonEmpty(source.id, "Name suggestion source id");
    requireNonEmpty(source.version, "Name suggestion source version");
    const key = `${source.id}\u0000${source.version}`;
    if (sourceKeys.has(key)) throw new Error(`Duplicate name suggestion source: ${source.id}@${source.version}`);
    sourceKeys.add(key);
  }
}

export function suggestGeneratedName<
  TContext,
  TResult extends NameSuggestionResult,
>(
  provider: NameSuggestionProvider<TContext, TResult>,
  options: NameSuggestionOptions<TContext>,
): NameSuggestion<TResult> {
  validateNameSuggestionProvider(provider);
  const seed = options.seed?.trim() || createGeneratedSeed("name");
  const result = provider.generate(options.context, createSeededRandom(seed));
  requireNonEmpty(result.displayName, "Generated display name");

  return {
    result,
    provenance: {
      contractVersion: NAME_SUGGESTION_CONTRACT_VERSION,
      providerId: provider.id,
      providerVersion: provider.version,
      sources: (provider.sources ?? []).map((source) => ({ ...source })),
      seed,
    },
  };
}
