import {
  BRP_FINISHING_FIELD_KEYS,
  createEmptyBrpFinishingDetails,
  suggestBrpAppearance,
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

  fieldset.querySelector<HTMLButtonElement>("[data-brp-finishing-suggest=\"appearance\"]")?.addEventListener("click", () => {
    const appearance = fieldset.querySelector<HTMLTextAreaElement>("[data-brp-finishing=\"appearance\"]");
    if (!appearance) return;
    appearance.value = suggestBrpAppearance().result.appearance;
    onChange(readBrpFinishingControls(fieldset));
    appearance.focus();
  });
}

export function brpFinishingControlsHtml(details: BrpFinishingDetails): string {
  return `
    <legend>Finish: identity and background</legend>
    <label>Size / build<input data-brp-finishing="sizeDescription" value="${escapeHtml(details.sizeDescription)}" placeholder="Tall, compact, slender, broad-shouldered..."></label>
    <div class="brp-finishing-control">
      <div class="brp-finishing-heading">
        <label for="brp-finishing-appearance">Appearance</label>
        <button type="button" class="brp-finishing-suggest" data-brp-finishing-suggest="appearance" title="Suggest appearance" aria-label="Suggest appearance">Suggest appearance</button>
      </div>
      <textarea id="brp-finishing-appearance" data-brp-finishing="appearance" rows="2" placeholder="Hair, eyes, dress, scars, notable physical details...">${escapeHtml(details.appearance)}</textarea>
    </div>
    <label>Mannerisms / motto<textarea data-brp-finishing="mannerisms" rows="2" placeholder="Habits, gestures, sayings, or a recurring motto...">${escapeHtml(details.mannerisms)}</textarea></label>
    <label>Reputation<textarea data-brp-finishing="reputation" rows="2" placeholder="What do people who know of this character tend to say about them?">${escapeHtml(details.reputation)}</textarea></label>
    <label>Personal item / keepsake<textarea data-brp-finishing="personalItem" rows="2" placeholder="An heirloom, keepsake, or emotionally important trinket...">${escapeHtml(details.personalItem)}</textarea></label>
    <label>Background<textarea data-brp-finishing="background" rows="4" placeholder="Where are they from? Education? Family? Organizations? An interesting past?">${escapeHtml(details.background)}</textarea></label>
    <label>Beliefs<textarea data-brp-finishing="beliefs" rows="2" placeholder="Significant religious, political, philosophical, or personal beliefs, if relevant...">${escapeHtml(details.beliefs)}</textarea></label>`;
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

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
