import type { ChoicePoolStorage } from "./stickyChoicePool.js";

export interface StickyMultiChoicePoolState<TId extends string> {
  acceptableIds: TId[];
  selectedIds: TId[];
}

export function loadStickyMultiChoicePool<TId extends string>(
  storage: ChoicePoolStorage,
  key: string,
  allowedIds: readonly TId[],
  defaultAcceptableIds: readonly TId[],
  defaultSelectedIds: readonly TId[],
  count: number,
): StickyMultiChoicePoolState<TId> {
  const allowed = new Set<string>(allowedIds);
  const fallbackAcceptable = unique(defaultAcceptableIds.filter((id) => allowed.has(id)));
  const fallbackSelected = unique(defaultSelectedIds.filter((id) => fallbackAcceptable.includes(id))).slice(0, count);
  const fill = (selected: TId[], acceptable: TId[]): TId[] => {
    for (const id of acceptable) {
      if (selected.length >= count) break;
      if (!selected.includes(id)) selected.push(id);
    }
    return selected.slice(0, count);
  };
  try {
    const raw = storage.getItem(key);
    if (!raw) return { acceptableIds: [...fallbackAcceptable], selectedIds: fill([...fallbackSelected], [...fallbackAcceptable]) };
    const parsed = JSON.parse(raw) as { acceptableIds?: unknown; selectedIds?: unknown };
    const acceptableIds = Array.isArray(parsed.acceptableIds)
      ? unique(parsed.acceptableIds.filter((id): id is TId => typeof id === "string" && allowed.has(id)))
      : [];
    const acceptable = acceptableIds.length >= count ? acceptableIds : [...fallbackAcceptable];
    const selectedIds = Array.isArray(parsed.selectedIds)
      ? unique(parsed.selectedIds.filter((id): id is TId => typeof id === "string" && acceptable.includes(id as TId)))
      : [];
    return { acceptableIds: acceptable, selectedIds: fill(selectedIds, acceptable) };
  } catch {
    return { acceptableIds: [...fallbackAcceptable], selectedIds: fill([...fallbackSelected], [...fallbackAcceptable]) };
  }
}

export function saveStickyMultiChoicePool<TId extends string>(
  storage: ChoicePoolStorage,
  key: string,
  state: StickyMultiChoicePoolState<TId>,
  count: number,
): void {
  if (state.acceptableIds.length < count) throw new Error(`Choice pool must retain at least ${count} acceptable options.`);
  if (state.selectedIds.length !== count || new Set(state.selectedIds).size !== count) throw new Error(`Exactly ${count} distinct selected options are required.`);
  if (state.selectedIds.some((id) => !state.acceptableIds.includes(id))) throw new Error("Selected options must be included in the acceptable pool.");
  storage.setItem(key, JSON.stringify({ acceptableIds: unique(state.acceptableIds), selectedIds: unique(state.selectedIds) }));
}

export function pickManyFromAcceptablePool<TId extends string>(
  acceptableIds: readonly TId[],
  count: number,
  random: () => number = browserRandom,
): TId[] {
  if (acceptableIds.length < count) throw new Error(`Choose at least ${count} acceptable options before selecting randomly.`);
  const remaining = [...acceptableIds];
  const selected: TId[] = [];
  while (selected.length < count) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error("Random source must return a value from 0 inclusive to 1 exclusive.");
    const index = Math.floor(value * remaining.length);
    const [choice] = remaining.splice(index, 1);
    if (choice !== undefined) selected.push(choice);
  }
  return selected;
}

function browserRandom(): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0]! / 4294967296;
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}
