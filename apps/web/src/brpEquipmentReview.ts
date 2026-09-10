import {
  brpEquipmentReviewLine,
  isBrpEquipmentId,
  type BrpNativeCharacter,
} from "../../../packages/system-brp/src/index.js";

export function appendBrpEquipmentReview(root: HTMLElement, payload: BrpNativeCharacter): void {
  const details = root.querySelector<HTMLElement>(".result-details");
  if (!details) return;
  const row = document.createElement("div");
  const lines = payload.equipment
    .filter(isBrpEquipmentId)
    .map((itemId) => brpEquipmentReviewLine(payload, itemId));
  row.innerHTML = `<strong>Equipment</strong><span>${lines.length
    ? lines.map(escapeHtml).join("<br>")
    : "No explicit play-important equipment selected. Ordinary clothing and Wealth-based pocket money remain implicit."}</span>`;
  details.append(row);
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
