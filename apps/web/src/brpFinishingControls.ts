import {
  BRP_FINISHING_FIELD_KEYS,
  createEmptyBrpFinishingDetails,
  suggestBrpFinishingField,
  type BrpFinishingDetails,
  type BrpFinishingFieldKey,
} from "../../../packages/system-brp/src/index.js";

export function mountBrpFinishingControls(
  root: HTMLElement,
  details: BrpFinishingDetails,
  onChange: (next: BrpFinishingDetails) => void,
): void {
  const validation = root.querySelector<HTMLElement>("#brp-validation");
  if (!validation?.parentElement) return;

  const fieldset = document.createElement("fieldset");
  fieldset.className = "ability-fieldset brp-finishing-fieldset";
  fieldset.innerHTML = brpFinishingControlsHtml(details);
  validation.parentElement.insertBefore(fieldset, validation);

  for (const control of fieldset.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-brp-finishing]")) {
    control.addEventListener("input", () => onChange(readBrpFinishingControls(fieldset)));
  }

  for (const button of fieldset.querySelectorAll<HTMLButtonElement>("[data-brp-finishing-suggest]")) {
    const fieldKey = button.dataset.brpFinishingSuggest ?? "";
    if (!isBrpFinishingFieldKey(fieldKey)) continue;
    button.addEventListener("click", () => {
      const control = fieldset.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-brp-finishing="${fieldKey}"]`);
      if (!control) return;
      control.value = suggestBrpFinishingField(fieldKey).result.value;
      onChange(readBrpFinishingControls(fieldset));
      control.focus();
    });
  }
}

export function brpFinishingControlsHtml(details: BrpFinishingDetails): string {
  return `
    <legend>Finish: identity and background</legend>
    ${finishingControlHtml("sizeDescription", "Size / build", details.sizeDescription, "Tall, compact, slender, broad-shouldered...")}
    ${finishingControlHtml("appearance", "Appearance", details.appearance, "Hair, eyes, dress, scars, notable physical details...", 2)}
    ${finishingControlHtml("mannerisms", "Mannerisms / motto", details.mannerisms, "Habits, gestures, sayings, or a recurring motto...", 2)}
    ${finishingControlHtml("reputation", "Reputation", details.reputation, "What do people who know of this character tend to say about them?", 2)}
    ${finishingControlHtml("personalItem", "Personal item / keepsake", details.personalItem, "An heirloom, keepsake, or emotionally important trinket...", 2)}
    ${finishingControlHtml("background", "Background", details.background, "Where are they from? Education? Family? Organizations? An interesting past?", 4)}
    ${finishingControlHtml("beliefs", "Beliefs", details.beliefs, "Significant religious, political, philosophical, or personal beliefs, if relevant...", 2)}`;
}

export function readBrpFinishingControls(root: ParentNode): BrpFinishingDetails {
  const result = createEmptyBrpFinishingDetails();
  for (const key of BRP_FINISHING_FIELD_KEYS) {
    result[key] = root.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-brp-finishing="${key}"]`)?.value ?? "";
  }
  return result;
}

export function updateBrpFinishingField(
  details: BrpFinishingDetails,
  key: BrpFinishingFieldKey,
  value: string,
): BrpFinishingDetails {
  return { ...details, [key]: value };
}

function finishingControlHtml(
  key: BrpFinishingFieldKey,
  label: string,
  value: string,
  placeholder: string,
  rows?: number,
): string {
  const id = `brp-finishing-${key}`;
  const control = rows
    ? `<textarea id="${id}" data-brp-finishing="${key}" rows="${rows}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value)}</textarea>`
    : `<input id="${id}" data-brp-finishing="${key}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}">`;
  return `<div class="brp-finishing-control">
      <div class="brp-finishing-heading">
        <label for="${id}">${escapeHtml(label)}</label>
        <button type="button" class="brp-finishing-suggest" data-brp-finishing-suggest="${key}" title="Suggest ${escapeHtml(label.toLowerCase())}" aria-label="Suggest ${escapeHtml(label.toLowerCase())}">Suggest ${escapeHtml(label)}</button>
      </div>
      ${control}
    </div>`;
}

function isBrpFinishingFieldKey(value: string): value is BrpFinishingFieldKey {
  return (BRP_FINISHING_FIELD_KEYS as readonly string[]).includes(value);
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
