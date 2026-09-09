export interface StickyChoicePoolState<TId extends string> {
  acceptableIds: TId[];
  selectedId: TId;
}

export interface ChoicePoolStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const transientSelections = new Map<string, string>();

export function setTransientChoicePoolSelection(key: string, selectedId: string): void {
  if (!key.trim()) throw new Error("Transient choice-pool key must not be empty.");
  if (!selectedId.trim()) throw new Error("Transient choice-pool selection must not be empty.");
  transientSelections.set(key, selectedId);
}

export function loadStickyChoicePool<TId extends string>(
  storage: ChoicePoolStorage,
  key: string,
  allowedIds: readonly TId[],
  defaultIds: readonly TId[],
  defaultSelectedId: TId,
): StickyChoicePoolState<TId> {
  const allowed = new Set<string>(allowedIds);
  const fallbackAcceptable = unique(defaultIds.filter((id) => allowed.has(id)));
  const fallback = fallbackAcceptable.length > 0 ? fallbackAcceptable : [defaultSelectedId];
  let state: StickyChoicePoolState<TId>;

  try {
    const raw = storage.getItem(key);
    if (!raw) {
      state = { acceptableIds: [...fallback], selectedId: defaultSelectedId };
    } else {
      const parsed = JSON.parse(raw) as { acceptableIds?: unknown; selectedId?: unknown };
      const acceptableIds = Array.isArray(parsed.acceptableIds)
        ? unique(parsed.acceptableIds.filter((id): id is TId => typeof id === "string" && allowed.has(id)))
        : [];
      const sanitizedAcceptable = acceptableIds.length > 0 ? acceptableIds : [...fallback];
      const selectedId = typeof parsed.selectedId === "string"
        && allowed.has(parsed.selectedId)
        && sanitizedAcceptable.includes(parsed.selectedId as TId)
        ? parsed.selectedId as TId
        : sanitizedAcceptable[0]!;
      state = { acceptableIds: sanitizedAcceptable, selectedId };
    }
  } catch {
    state = { acceptableIds: [...fallback], selectedId: defaultSelectedId };
  }

  const transientSelectedId = transientSelections.get(key);
  transientSelections.delete(key);
  if (transientSelectedId && allowed.has(transientSelectedId)) {
    return { acceptableIds: [...state.acceptableIds], selectedId: transientSelectedId as TId };
  }
  return state;
}

export function saveStickyChoicePool<TId extends string>(
  storage: ChoicePoolStorage,
  key: string,
  state: StickyChoicePoolState<TId>,
): void {
  if (state.acceptableIds.length === 0) {
    throw new Error("Choice pool must retain at least one acceptable option.");
  }
  if (!state.acceptableIds.includes(state.selectedId)) {
    throw new Error("Selected option must be included in the acceptable choice pool.");
  }
  storage.setItem(key, JSON.stringify({
    acceptableIds: unique(state.acceptableIds),
    selectedId: state.selectedId,
  }));
}

export function pickFromAcceptablePool<TId extends string>(
  acceptableIds: readonly TId[],
  random: () => number = browserRandom,
): TId {
  if (acceptableIds.length === 0) throw new Error("Choose at least one acceptable option before selecting randomly.");
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new Error("Random source must return a value from 0 inclusive to 1 exclusive.");
  }
  return acceptableIds[Math.floor(value * acceptableIds.length)]!;
}

function browserRandom(): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0]! / 4294967296;
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}
