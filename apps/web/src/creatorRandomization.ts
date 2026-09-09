export interface CreatorRandomizerAction {
  id: string;
  disabled?: boolean;
  invoke(): void;
}

export type CreatorRandomizerResolver = (
  seenIds: ReadonlySet<string>,
) => CreatorRandomizerAction | null;

export function runCreatorRandomizerSequence(
  resolveNext: CreatorRandomizerResolver,
): string[] {
  const seenIds = new Set<string>();
  const executedIds: string[] = [];

  while (true) {
    const action = resolveNext(seenIds);
    if (!action) break;

    const id = action.id.trim();
    if (!id) throw new Error("Creator randomizer actions require stable non-empty IDs.");
    if (seenIds.has(id)) throw new Error(`Creator randomizer ${id} was resolved more than once.`);

    seenIds.add(id);
    if (action.disabled) continue;

    action.invoke();
    executedIds.push(id);
  }

  return executedIds;
}

export function clickCreatorRandomizers(
  root: ParentNode,
  selector: string,
): string[] {
  return runCreatorRandomizerSequence((seenIds) => {
    const button = [...root.querySelectorAll<HTMLButtonElement>(selector)]
      .find((candidate) => candidate.id && !seenIds.has(candidate.id));
    if (!button) return null;

    return {
      id: button.id,
      disabled: button.disabled,
      invoke: () => button.click(),
    };
  });
}
