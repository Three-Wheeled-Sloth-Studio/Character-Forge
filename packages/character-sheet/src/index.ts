import { CHARACTER_SHEET_STYLES } from "./styles.js";

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
export type CharacterSheetPageLayout = "flow" | "play-3" | "play-2";
export type CharacterSheetZone = "left" | "main" | "right" | "wide";

export interface CharacterSheetMediaSlot {
  id: string;
  label: string;
  kind: CharacterSheetMediaSlotKind;
}

export interface CharacterSheetHeaderFact {
  label: string;
  value: string;
}

export interface CharacterSheetPresentationContext {
  campaignName?: string;
  portraitSrc?: string;
  tokenSrc?: string;
}

export interface CharacterSheetDescriptor {
  title: string;
  subtitle?: string;
  footerNote?: string;
  systemTheme?: string;
  headerFacts?: CharacterSheetHeaderFact[];
  sourceNativeStateId: string;
  sourceSchemaVersion: string;
  pages: CharacterSheetPage[];
}

export interface CharacterSheetPage {
  id: string;
  number: number;
  title?: string;
  layout?: CharacterSheetPageLayout;
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
  zone?: CharacterSheetZone;
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

export function renderCharacterSheet(
  descriptor: CharacterSheetDescriptor,
  context: CharacterSheetPresentationContext = {},
): string {
  const label = `${descriptor.title} character sheet`;
  const systemTheme = descriptor.systemTheme?.trim() || "neutral";
  return `<style data-character-sheet-styles>${CHARACTER_SHEET_STYLES}</style><article class="character-sheet" aria-label="${escapeHtml(label)}" data-sheet-system="${escapeHtml(systemTheme)}" data-source-native-state="${escapeHtml(descriptor.sourceNativeStateId)}" data-source-schema="${escapeHtml(descriptor.sourceSchemaVersion)}">
    ${descriptor.pages.map((page) => renderPage(page, descriptor, context)).join("")}
  </article>`;
}

function renderPage(
  page: CharacterSheetPage,
  descriptor: CharacterSheetDescriptor,
  context: CharacterSheetPresentationContext,
): string {
  const subtitle = descriptor.subtitle ? `<p>${escapeHtml(descriptor.subtitle)}</p>` : "";
  const ariaPageTitle = page.title ? `: ${page.title}` : "";
  const effectiveMediaSlots = page.mediaSlots ?? (page.number === 1 ? DEFAULT_PRIMARY_MEDIA_SLOTS : []);
  const portrait = effectiveMediaSlots.find((slot) => slot.kind === "portrait");
  const token = effectiveMediaSlots.find((slot) => slot.kind === "token");
  const campaignBadge = context.campaignName?.trim()
    ? `<div class="sheet-campaign-badge" title="Campaign">${escapeHtml(context.campaignName.trim())}</div>`
    : "";
  const headerFacts = descriptor.headerFacts?.length
    ? `<dl class="sheet-header-facts">${descriptor.headerFacts.map((fact) => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value)}</dd></div>`).join("")}</dl>`
    : "";
  const footer = descriptor.footerNote ? `<footer class="sheet-footer">${escapeHtml(descriptor.footerNote)}</footer>` : "";
  const layout = page.layout ?? "flow";

  return `<section class="sheet-page sheet-layout-${layout}" data-sheet-page="${page.number}" aria-label="${escapeHtml(`Page ${page.number}${ariaPageTitle}`)}">
    <header class="sheet-page-header">
      ${portrait ? renderMediaSlot(portrait, context.portraitSrc) : ""}
      <div class="sheet-page-header-copy">
        <h2>${escapeHtml(descriptor.title)}</h2>
        ${subtitle}
        ${headerFacts}
      </div>
      <div class="sheet-page-header-side">${campaignBadge}${token ? renderMediaSlot(token, context.tokenSrc) : ""}</div>
    </header>
    ${renderPageContent(page.sections, layout)}
    ${footer}
  </section>`;
}

function renderMediaSlot(slot: CharacterSheetMediaSlot, source?: string): string {
  const image = source?.trim()
    ? `<img src="${escapeHtml(source.trim())}" alt="" />`
    : "";
  return `<div class="sheet-media-slot sheet-media-slot-${slot.kind}${image ? " has-image" : ""}" data-sheet-media-slot="${escapeHtml(slot.id)}" aria-label="Reserved ${escapeHtml(slot.label)} space">${image}</div>`;
}

function renderPageContent(sections: CharacterSheetSection[], layout: CharacterSheetPageLayout): string {
  if (layout === "flow") {
    return `<div class="sheet-page-content">${sections.map(renderSection).join("")}</div>`;
  }

  const left = sections.filter((section) => (section.zone ?? "main") === "left");
  const main = sections.filter((section) => (section.zone ?? "main") === "main");
  const right = sections.filter((section) => section.zone === "right");
  const wide = sections.filter((section) => section.zone === "wide");

  if (layout === "play-2") {
    return `<div class="sheet-page-content sheet-play-grid sheet-play-grid-2">
      <div class="sheet-zone-column sheet-zone-left">${left.map(renderSection).join("")}</div>
      <div class="sheet-zone-column sheet-zone-right">${[...main, ...right].map(renderSection).join("")}</div>
      ${wide.length ? `<div class="sheet-zone-wide">${wide.map(renderSection).join("")}</div>` : ""}
    </div>`;
  }

  return `<div class="sheet-page-content sheet-play-grid sheet-play-grid-3">
    <div class="sheet-zone-column sheet-zone-left">${left.map(renderSection).join("")}</div>
    <div class="sheet-zone-column sheet-zone-main">${main.map(renderSection).join("")}</div>
    <div class="sheet-zone-column sheet-zone-right">${right.map(renderSection).join("")}</div>
    ${wide.length ? `<div class="sheet-zone-wide">${wide.map(renderSection).join("")}</div>` : ""}
  </div>`;
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
