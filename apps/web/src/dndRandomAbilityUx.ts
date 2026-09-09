const RANDOM_ASSIGNMENT_SELECTOR = "select[id^='creator-random-']";
const RANDOM_ROLL_BUTTON_ID = "creator-random-roll";
const RANDOM_METHOD_SELECT_ID = "creator-generation-method";
const PREVIOUS_ASSIGNMENT_DATASET_KEY = "randomAssignmentPrevious";

const mountedRoots = new WeakSet<HTMLElement>();

export function swapUniqueRandomAssignment(
  currentValues: readonly string[],
  changedIndex: number,
  nextValue: string,
): string[] {
  if (!Number.isInteger(changedIndex) || changedIndex < 0 || changedIndex >= currentValues.length) {
    throw new Error("Random ability assignment index is out of range.");
  }
  if (new Set(currentValues).size !== currentValues.length) {
    throw new Error("Random ability assignments must be unique before swapping.");
  }

  const previousValue = currentValues[changedIndex]!;
  if (previousValue === nextValue) return [...currentValues];

  const displacedIndex = currentValues.findIndex((value, index) => index !== changedIndex && value === nextValue);
  if (displacedIndex < 0) {
    throw new Error("Random ability assignment must use one of the existing roll slots.");
  }

  const nextValues = [...currentValues];
  nextValues[changedIndex] = nextValue;
  nextValues[displacedIndex] = previousValue;
  return nextValues;
}

export function mountDndRandomAbilityUx(root: HTMLElement): void {
  if (mountedRoots.has(root)) {
    syncDndRandomAbilityUx(root);
    return;
  }
  mountedRoots.add(root);

  root.addEventListener("focusin", (event) => {
    if (isRandomAssignmentSelect(event.target)) rememberAssignments(root);
  });

  root.addEventListener("change", (event) => {
    const target = event.target;
    if (isRandomAssignmentSelect(target)) {
      applyAssignmentSwap(root, target);
      return;
    }
    if (target instanceof HTMLSelectElement && target.id === RANDOM_METHOD_SELECT_ID) {
      syncDndRandomAbilityUx(root);
    }
  });

  root.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLButtonElement && target.id === RANDOM_ROLL_BUTTON_ID) {
      syncDndRandomAbilityUx(root);
    }
  });

  syncDndRandomAbilityUx(root);
}

function syncDndRandomAbilityUx(root: HTMLElement): void {
  const assignments = randomAssignmentSelects(root);
  const fieldset = assignments[0]?.closest("fieldset");
  if (fieldset instanceof HTMLElement) {
    fieldset.hidden = assignments.length > 0 && assignments.some((select) => select.disabled);
  }

  if (assignments.length > 0 && assignments.every((select) => !select.disabled)) {
    rememberAssignments(root);
  }

  for (const card of root.querySelectorAll<HTMLElement>(".random-roll-card")) {
    const detail = card.querySelector<HTMLElement>("small");
    if (!detail) continue;
    const detailText = detail.textContent?.trim() ?? "";
    if (!detailText) continue;
    card.title = detailText;
    const rollLabel = card.querySelector<HTMLElement>("span")?.textContent?.trim() ?? "Roll";
    const total = card.querySelector<HTMLElement>("strong")?.textContent?.trim() ?? "";
    card.setAttribute("aria-label", `${rollLabel}${total ? ` total ${total}` : ""}. ${detailText}`);
    detail.hidden = true;
  }
}

function applyAssignmentSwap(root: HTMLElement, changed: HTMLSelectElement): void {
  const assignments = randomAssignmentSelects(root).filter((select) => !select.disabled);
  const changedIndex = assignments.indexOf(changed);
  if (changedIndex < 0) return;

  const previousValues = assignments.map((select) => select.dataset[PREVIOUS_ASSIGNMENT_DATASET_KEY] ?? select.value);
  try {
    const nextValues = swapUniqueRandomAssignment(previousValues, changedIndex, changed.value);
    assignments.forEach((select, index) => {
      select.value = nextValues[index]!;
      select.dataset[PREVIOUS_ASSIGNMENT_DATASET_KEY] = nextValues[index]!;
    });
  } catch {
    assignments.forEach((select, index) => {
      select.value = previousValues[index]!;
      select.dataset[PREVIOUS_ASSIGNMENT_DATASET_KEY] = previousValues[index]!;
    });
  }
}

function rememberAssignments(root: HTMLElement): void {
  for (const select of randomAssignmentSelects(root)) {
    if (!select.disabled) select.dataset[PREVIOUS_ASSIGNMENT_DATASET_KEY] = select.value;
  }
}

function randomAssignmentSelects(root: HTMLElement): HTMLSelectElement[] {
  return [...root.querySelectorAll<HTMLSelectElement>(RANDOM_ASSIGNMENT_SELECTOR)];
}

function isRandomAssignmentSelect(target: EventTarget | null): target is HTMLSelectElement {
  return target instanceof HTMLSelectElement && target.matches(RANDOM_ASSIGNMENT_SELECTOR);
}
