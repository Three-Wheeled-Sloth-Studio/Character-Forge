export interface DirectChoiceOptionState {
  id: string;
  checked: boolean;
  disabled: boolean;
}

export interface DirectChoiceDisplayOption {
  id: string;
  label: string;
}

export function directSelectableIds(options: readonly DirectChoiceOptionState[]): string[] {
  return [...new Set(options.filter((option) => !option.disabled).map((option) => option.id))];
}

export function directChoiceDisplayMatches(
  current: readonly DirectChoiceDisplayOption[],
  desired: readonly DirectChoiceDisplayOption[],
): boolean {
  return current.length === desired.length
    && current.every((option, index) => option.id === desired[index]?.id && option.label === desired[index]?.label);
}

interface ChoicePoolBinding {
  select: HTMLSelectElement;
  checkboxes: HTMLInputElement[];
}

export function installChoicePoolDirectVisibility(doc: Document = document): () => void {
  let refreshQueued = false;

  const bindings = (): ChoicePoolBinding[] => {
    const result: ChoicePoolBinding[] = [];

    for (const poolName of uniqueAttributeValues(doc, "input[data-choice-pool]", "data-choice-pool")) {
      const select = doc.querySelector<HTMLSelectElement>(`#creator-${cssSafe(poolName)}-selected`);
      const checkboxes = [...doc.querySelectorAll<HTMLInputElement>(`input[data-choice-pool='${attributeSafe(poolName)}']`)];
      if (select && checkboxes.length) result.push({ select, checkboxes });
    }

    for (const field of uniqueAttributeValues(doc, "input[data-core-pool]", "data-core-pool")) {
      const select = doc.querySelector<HTMLSelectElement>(`#creator-${cssSafe(field)}`);
      const checkboxes = [...doc.querySelectorAll<HTMLInputElement>(`input[data-core-pool='${attributeSafe(field)}']`)];
      if (select && checkboxes.length) result.push({ select, checkboxes });
    }

    return result;
  };

  const refresh = (): void => {
    refreshQueued = false;
    for (const binding of bindings()) refreshBinding(doc, binding);
  };

  const queueRefresh = (): void => {
    if (refreshQueued) return;
    refreshQueued = true;
    queueMicrotask(refresh);
  };

  const onChangeCapture = (event: Event): void => {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement)) return;
    const binding = bindings().find((candidate) => candidate.select === select);
    if (!binding) return;

    const desiredId = select.value;
    const checkbox = binding.checkboxes.find((candidate) => candidate.value === desiredId && !candidate.disabled);
    if (!checkbox || checkbox.checked) return;

    // The existing choice-pool state intentionally requires the selected value
    // to be part of the acceptable pool. A direct choice therefore marks that
    // option acceptable before the existing select handler persists it. The
    // random button still chooses only from checked options.
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    select.value = desiredId;
    queueRefresh();
  };

  doc.addEventListener("change", onChangeCapture, true);
  const observer = new MutationObserver(queueRefresh);
  observer.observe(doc.documentElement, { childList: true, subtree: true });
  refresh();

  return () => {
    observer.disconnect();
    doc.removeEventListener("change", onChangeCapture, true);
  };
}

function refreshBinding(doc: Document, binding: ChoicePoolBinding): void {
  const enabled = binding.checkboxes
    .filter((checkbox) => !checkbox.disabled)
    .map((checkbox) => ({
      id: checkbox.value,
      label: checkbox.closest("label")?.querySelector("span")?.textContent?.replace(/\s*·\s*later\s*$/u, "").trim() || checkbox.value,
    }));
  const desiredIds = directSelectableIds(enabled.map((option) => ({ id: option.id, checked: true, disabled: false })));
  const labels = new Map(enabled.map((option) => [option.id, option.label]));
  const desired = desiredIds.map((id) => ({ id, label: labels.get(id) ?? id }));
  const current = [...binding.select.options].map((option) => ({
    id: option.value,
    label: option.textContent?.trim() ?? "",
  }));
  if (directChoiceDisplayMatches(current, desired)) return;

  const selectedId = binding.select.value;
  binding.select.replaceChildren(...desired.map((entry) => {
    const option = doc.createElement("option");
    option.value = entry.id;
    option.textContent = entry.label;
    return option;
  }));
  if (desiredIds.includes(selectedId)) binding.select.value = selectedId;
}

function uniqueAttributeValues(doc: Document, selector: string, attribute: string): string[] {
  return [...new Set([...doc.querySelectorAll<HTMLElement>(selector)]
    .map((element) => element.getAttribute(attribute))
    .filter((value): value is string => Boolean(value)))];
}

function attributeSafe(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

function cssSafe(value: string): string {
  return typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(value) : value;
}

if (typeof document !== "undefined") installChoicePoolDirectVisibility(document);
