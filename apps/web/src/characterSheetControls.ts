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

export function characterDocumentControlsHtml(includePrint = false, includeMedia = false): string {
  return `<div class="sheet-toolbar no-print" aria-label="Character sheet and export controls">
    ${includeMedia ? sheetActionButton("attach-portrait", "Attach character portrait", portraitIcon()) : ""}
    ${includeMedia ? sheetActionButton("attach-token", "Attach VTT token image", tokenIcon()) : ""}
    ${includeMedia ? '<span class="sheet-toolbar-divider" aria-hidden="true"></span>' : ""}
    ${includePrint ? sheetActionButton("print", "Print character sheet or save as PDF", printIcon()) : ""}
    ${sheetActionButton("copy-json", "Copy full CharacterDocument JSON", copyIcon())}
    ${sheetActionButton("download-json", "Download full CharacterDocument JSON", downloadIcon())}
    <span class="sheet-action-status" data-sheet-action-status role="status" aria-live="polite"></span>
  </div>`;
}

export function bindCharacterDocumentControls(
  root: ParentNode,
  character: CharacterDocument,
  printableSheetHtml?: string | (() => string),
): void {
  const status = root.querySelector<HTMLElement>("[data-sheet-action-status]");
  const portraitButton = root.querySelector<HTMLButtonElement>("[data-sheet-action='attach-portrait']");
  const tokenButton = root.querySelector<HTMLButtonElement>("[data-sheet-action='attach-token']");
  const printButton = root.querySelector<HTMLButtonElement>("[data-sheet-action='print']");
  const copyButton = root.querySelector<HTMLButtonElement>("[data-sheet-action='copy-json']");
  const downloadButton = root.querySelector<HTMLButtonElement>("[data-sheet-action='download-json']");

  portraitButton?.addEventListener("click", () => attachSheetImage(root, "portrait", "Portrait", status));
  tokenButton?.addEventListener("click", () => attachSheetImage(root, "token", "VTT token", status));
  printButton?.addEventListener("click", () => {
    const sheetHtml = typeof printableSheetHtml === "function" ? printableSheetHtml() : printableSheetHtml;
    if (!sheetHtml) {
      setStatus(status, "Printable character sheet unavailable.");
      return;
    }
    printCharacterSheet(sheetHtml, status);
  });
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

export function printableCharacterSheetDocument(sheetHtml: string, baseHref = document.baseURI): string {
  const sheetCssUrl = new URL("sheet.css", baseHref).href;
  const sheetUiCssUrl = new URL("sheet-ui.css", baseHref).href;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Character Sheet</title>
  <link rel="stylesheet" href="${escapeAttribute(sheetCssUrl)}" />
  <link rel="stylesheet" href="${escapeAttribute(sheetUiCssUrl)}" />
</head>
<body class="sheet-print-document">
${sheetHtml}
</body>
</html>`;
}

function sheetActionButton(action: string, label: string, icon: string): string {
  return `<button type="button" class="sheet-action-button" data-sheet-action="${action}" aria-label="${label}" title="${label}">${icon}</button>`;
}

function svgIcon(contents: string): string {
  return `<svg class="sheet-action-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${contents}</svg>`;
}

function portraitIcon(): string {
  return svgIcon(`<rect x="4" y="4" width="16" height="16" rx="2"></rect><circle cx="12" cy="9" r="2.4"></circle><path d="M7.5 17c.9-2.4 2.4-3.6 4.5-3.6s3.6 1.2 4.5 3.6"></path>`);
}

function tokenIcon(): string {
  return svgIcon(`<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="9.5" r="2"></circle><path d="M8.5 16c.8-2 2-3 3.5-3s2.7 1 3.5 3"></path>`);
}

function copyIcon(): string {
  return svgIcon(`<rect x="8" y="8" width="11" height="11" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path>`);
}

function downloadIcon(): string {
  return svgIcon(`<path d="M12 3v12"></path><path d="m7.5 10.5 4.5 4.5 4.5-4.5"></path><path d="M5 20h14"></path>`);
}

function printIcon(): string {
  return svgIcon(`<path d="M7 8V3h10v5"></path><path d="M7 17H5a2 2 0 0 1-2-2v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4a2 2 0 0 1-2 2h-2"></path><rect x="7" y="14" width="10" height="7" rx="1"></rect>`);
}

function attachSheetImage(
  root: ParentNode,
  slotId: "portrait" | "token",
  label: string,
  status: HTMLElement | null,
): void {
  const slot = root.querySelector<HTMLElement>(`[data-sheet-media-slot='${slotId}']`);
  if (!slot) {
    setStatus(status, `${label} space unavailable on this sheet.`);
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.hidden = true;
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    input.remove();
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") return;
      const image = document.createElement("img");
      image.src = reader.result;
      image.alt = "";
      slot.replaceChildren(image);
      slot.classList.add("has-image");
      setStatus(status, `${label} attached to this sheet view.`);
    }, { once: true });
    reader.readAsDataURL(file);
  }, { once: true });
  document.body.append(input);
  input.click();
}

function printCharacterSheet(sheetHtml: string, status: HTMLElement | null): void {
  const frame = document.createElement("iframe");
  frame.className = "sheet-print-frame";
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "fixed";
  frame.style.width = "816px";
  frame.style.height = "1056px";
  frame.style.left = "-10000px";
  frame.style.top = "0";
  frame.style.border = "0";
  frame.style.opacity = "0";
  frame.style.pointerEvents = "none";
  frame.srcdoc = printableCharacterSheetDocument(sheetHtml);

  const cleanup = () => frame.remove();
  frame.addEventListener("load", () => {
    const printWindow = frame.contentWindow;
    if (!printWindow) {
      cleanup();
      setStatus(status, "Could not open printable character sheet.");
      return;
    }
    printWindow.addEventListener("afterprint", cleanup, { once: true });
    window.setTimeout(cleanup, 30000);
    printWindow.focus();
    printWindow.print();
  }, { once: true });

  document.body.append(frame);
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

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
