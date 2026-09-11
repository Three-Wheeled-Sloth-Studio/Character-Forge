import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  BRP_STARTING_EQUIPMENT_CATALOG,
  brpEquipmentCatalogLine,
  brpStartingEquipmentEligibility,
  type BrpEquipmentId,
} from "../../../packages/system-brp/src/index.js";

export function mountBrpEquipmentControls(
  root: HTMLElement,
  character: CharacterDocument | null,
  selectedIds: readonly BrpEquipmentId[],
  onChange: (next: BrpEquipmentId[]) => void,
): void {
  const validation = root.querySelector<HTMLElement>("#brp-validation");
  if (!validation?.parentElement) return;

  const fieldset = document.createElement("fieldset");
  fieldset.className = "ability-fieldset brp-equipment-fieldset";
  fieldset.innerHTML = brpEquipmentControlsHtml(character, selectedIds);
  validation.parentElement.insertBefore(fieldset, validation);

  for (const input of fieldset.querySelectorAll<HTMLInputElement>("[data-brp-equipment]")) {
    input.addEventListener("change", () => {
      const next = [...fieldset.querySelectorAll<HTMLInputElement>("[data-brp-equipment]:checked")]
        .map((entry) => entry.value as BrpEquipmentId);
      onChange(next);
    });
  }
}

export function brpEquipmentControlsHtml(
  character: CharacterDocument | null,
  selectedIds: readonly BrpEquipmentId[],
): string {
  const selected = new Set(selectedIds);
  const options = (Object.keys(BRP_STARTING_EQUIPMENT_CATALOG) as BrpEquipmentId[])
    .map((itemId) => {
      const item = BRP_STARTING_EQUIPMENT_CATALOG[itemId];
      const eligibility = brpStartingEquipmentEligibility(character, itemId);
      const checked = selected.has(itemId) ? " checked" : "";
      const disabled = eligibility.eligible ? "" : " disabled";
      const title = eligibility.reason ? ` title="${escapeHtml(eligibility.reason)}"` : "";
      return `<label class="choice-pool-option brp-equipment-option"><input type="checkbox" data-brp-equipment value="${itemId}"${checked}${disabled}${title}><span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(brpEquipmentCatalogLine(itemId))}${eligibility.reason ? ` ${escapeHtml(eligibility.reason)}` : ""}</small></span></label>`;
    })
    .join("");

  return `<legend>Finish: important equipment</legend><div class="choice-pool-grid">${options}</div>`;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
