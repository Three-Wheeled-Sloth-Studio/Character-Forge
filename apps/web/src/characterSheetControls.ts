import type { CharacterDocument } from "../../../packages/character-model/src/index.js";

export function characterDocumentJson(character: CharacterDocument): string {
  return JSON.stringify(character, null, 2);
}

export function characterDocumentDownloadName(character: CharacterDocument): string {
  const slug = character.displayName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${slug || "character"}.json`;
}

export function characterDocumentControlsHtml(includePrint = false): string {
  return `<div class="sheet-toolbar no-print" aria-label="Character export controls">
    ${includePrint ? `<button type="button" class="sheet-action-button" data-sheet-action="print" aria-label="Print character sheet or save as PDF" title="Print character sheet or save as PDF"><span class="sheet-action-icon" aria-hidden="true">&#9113;</span><span>Print / Save PDF</span></button>` : ""}
    <button type="button" class="sheet-action-button" data-sheet-action="copy-json" aria-label="Copy full CharacterDocument JSON" title="Copy full CharacterDocument JSON"><span class="sheet-action-icon" aria-hidden="true">&#9633;</span><span>Copy JSON</span></button>
    <button type="button" class="sheet-action-button" data-sheet-action="download-json" aria-label="Download full CharacterDocument JSON" title="Download full CharacterDocument JSON"><span class="sheet-action-icon" aria-hidden="true">&#8595;</span><span>Download JSON</span></button>
    <span class="sheet-action-status" data-sheet-action-status role="status" aria-live="polite"></span>
  </div>`;
}

export function bindCharacterDocumentControls(root: ParentNode, character: CharacterDocument): void {
  const status = root.querySelector<HTMLElement>("[data-sheet-action-status]");
  const printButton = root.querySelector<HTMLButtonElement>("[data-sheet-action='print']");
  const copyButton = root.querySelector<HTMLButtonElement>("[data-sheet-action='copy-json']");
  const downloadButton = root.querySelector<HTMLButtonElement>("[data-sheet-action='download-json']");

  printButton?.addEventListener("click", () => window.print());
  copyButton?.addEventListener("click", () => {
    if (!navigator.clipboard) {
      setStatus(status, "Clipboard unavailable in this browser.");
      return;
    }
    void navigator.clipboard.writeText(characterDocumentJson(character))
      .then(() => setStatus(status, "Character JSON copied."))
      .catch(() => setStatus(status, "Could not copy Character JSON."));
  });
  downloadButton?.addEventListener("click", () => downloadCharacterDocumentJson(character));
}

function downloadCharacterDocumentJson(character: CharacterDocument): void {
  const blob = new Blob([characterDocumentJson(character)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = characterDocumentDownloadName(character);
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function setStatus(target: HTMLElement | null, message: string): void {
  if (target) target.textContent = message;
}
