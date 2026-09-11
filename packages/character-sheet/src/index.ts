export type CharacterSheetRole =
  | "identity"
  | "primary_stats"
  | "resources"
  | "actions"
  | "equipment"
  | "abilities"
  | "conditions"
  | "narrative"
  | "notes"
  | "provenance";

export type CharacterSheetMediaSlotKind = "portrait" | "token";

export interface CharacterSheetMediaSlot {
  id: string;
  label: string;
  kind: CharacterSheetMediaSlotKind;
}

export interface CharacterSheetDescriptor {
  title: string;
  subtitle?: string;
  sourceNativeStateId: string;
  sourceSchemaVersion: string;
  pages: CharacterSheetPage[];
}

export interface CharacterSheetPage {
  id: string;
  number: number;
  title?: string;
  mediaSlots?: CharacterSheetMediaSlot[];
  sections: CharacterSheetSection[];
}

export interface CharacterSheetSectionBase {
  id: string;
  title: string;
  role: CharacterSheetRole;
  priority: number;
  preferredColumns?: 1 | 2 | 3 | 4;
  allowSplit?: boolean;
  help?: string;
}

export interface CharacterSheetStatItem {
  label: string;
  value: string;
  help?: string;
}

export interface CharacterSheetStatsSection extends CharacterSheetSectionBase {
  kind: "stats";
  items: CharacterSheetStatItem[];
}

export interface CharacterSheetRatingItem {
  label: string;
  value: string;
  detail?: string;
}

export interface CharacterSheetRatingsSection extends CharacterSheetSectionBase {
  kind: "ratings";
  items: CharacterSheetRatingItem[];
}

export interface CharacterSheetDetailItem {
  label: string;
  value: string;
}

export interface CharacterSheetDetailsSection extends CharacterSheetSectionBase {
  kind: "details";
  items: CharacterSheetDetailItem[];
}

export interface CharacterSheetTableColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
}

export interface CharacterSheetTableSection extends CharacterSheetSectionBase {
  kind: "table";
  columns: CharacterSheetTableColumn[];
  rows: Array<Record<string, string>>;
  repeatHeader?: boolean;
}

export interface CharacterSheetListItem {
  label: string;
  detail?: string;
}

export interface CharacterSheetListSection extends CharacterSheetSectionBase {
  kind: "list";
  items: CharacterSheetListItem[];
}

export type CharacterSheetSection =
  | CharacterSheetStatsSection
  | CharacterSheetRatingsSection
  | CharacterSheetDetailsSection
  | CharacterSheetTableSection
  | CharacterSheetListSection;

const DEFAULT_PRIMARY_MEDIA_SLOTS: CharacterSheetMediaSlot[] = [
  { id: "portrait", label: "Portrait", kind: "portrait" },
  { id: "token", label: "VTT Token", kind: "token" },
];

export function renderCharacterSheet(descriptor: CharacterSheetDescriptor): string {
  const label = `${descriptor.title} character sheet`;
  return `<article class="character-sheet" aria-label="${escapeHtml(label)}" data-source-native-state="${escapeHtml(descriptor.sourceNativeStateId)}" data-source-schema="${escapeHtml(descriptor.sourceSchemaVersion)}">
    ${descriptor.pages.map((page) => renderPage(page, descriptor)).join("")}
  </article>`;
}

function renderPage(page: CharacterSheetPage, descriptor: CharacterSheetDescriptor): string {
  const subtitle = descriptor.subtitle ? `<p>${escapeHtml(descriptor.subtitle)}</p>` : "";
  const pageTitle = page.title ? `<span>${escapeHtml(page.title)}</span>` : "";
  const ariaPageTitle = page.title ? `: ${page.title}` : "";
  const effectiveMediaSlots = page.mediaSlots ?? (page.number === 1 ? DEFAULT_PRIMARY_MEDIA_SLOTS : []);
  const mediaSlots = effectiveMediaSlots.length ? renderMediaSlots(effectiveMediaSlots) : "";
  return `<section class="sheet-page" data-sheet-page="${page.number}" aria-label="${escapeHtml(`Page ${page.number}${ariaPageTitle}`)}">
    <header class="sheet-page-header">
      <div class="sheet-page-header-copy"><p class="sheet-kicker">Character Forge</p><h2>${escapeHtml(descriptor.title)}</h2>${subtitle}</div>
      ${mediaSlots}
      <div class="sheet-page-number">Page ${page.number}${pageTitle}</div>
    </header>
    <div class="sheet-page-content">${page.sections.map(renderSection).join("")}</div>
  </section>`;
}

function renderMediaSlots(slots: CharacterSheetMediaSlot[]): string {
  return `<div class="sheet-media-slots" aria-label="Character media spaces">${slots.map((slot) => `<div class="sheet-media-slot sheet-media-slot-${slot.kind}" data-sheet-media-slot="${escapeHtml(slot.id)}" aria-label="Reserved ${escapeHtml(slot.label)} space"><span>${escapeHtml(slot.label)}</span></div>`).join("")}</div>`;
}

function renderSection(section: CharacterSheetSection): string {
  const classes = [
    "sheet-section",
    `sheet-section-${section.kind}`,
    `sheet-role-${section.role}`,
    section.allowSplit ? "sheet-section-splittable" : "",
  ].filter(Boolean).join(" ");
  const help = section.help ? `<p class="sheet-section-help">${escapeHtml(section.help)}</p>` : "";
  return `<section class="${classes}" data-sheet-section="${escapeHtml(section.id)}" data-sheet-role="${section.role}" data-sheet-priority="${section.priority}">
    <div class="sheet-section-heading"><h3>${escapeHtml(section.title)}</h3>${help}</div>
    ${renderSectionBody(section)}
  </section>`;
}

function renderSectionBody(section: CharacterSheetSection): string {
  switch (section.kind) {
    case "stats":
      return `<div class="sheet-stats sheet-columns-${section.preferredColumns ?? 3}">${section.items.map((item) => `<div class="sheet-stat"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong>${item.help ? `<small>${escapeHtml(item.help)}</small>` : ""}</div>`).join("")}</div>`;
    case "ratings":
      return `<div class="sheet-ratings sheet-columns-${section.preferredColumns ?? 2}">${section.items.map((item) => `<div class="sheet-rating"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong>${item.detail ? `<small>${escapeHtml(item.detail)}</small>` : ""}</div>`).join("")}</div>`;
    case "details":
      return `<dl class="sheet-details sheet-columns-${section.preferredColumns ?? 1}">${section.items.map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`).join("")}</dl>`;
    case "list":
      return `<ul class="sheet-list sheet-columns-${section.preferredColumns ?? 1}">${section.items.map((item) => `<li><strong>${escapeHtml(item.label)}</strong>${item.detail ? `<span>${escapeHtml(item.detail)}</span>` : ""}</li>`).join("")}</ul>`;
    case "table":
      return `<div class="sheet-table-wrap"><table><thead><tr>${section.columns.map((column) => `<th class="sheet-align-${column.align ?? "left"}" scope="col">${escapeHtml(column.label)}</th>`).join("")}</tr></thead><tbody>${section.rows.map((row) => `<tr>${section.columns.map((column) => `<td class="sheet-align-${column.align ?? "left"}">${escapeHtml(row[column.key] ?? "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
