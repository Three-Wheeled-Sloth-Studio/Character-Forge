export const CHARACTER_SHEET_STYLES = String.raw`
.character-sheet {
  --sheet-accent: #5d4634;
  --sheet-accent-soft: #efe6dc;
  --sheet-ink: #201a16;
  --sheet-muted: #6d6259;
  --sheet-line: #c8bdb0;
  --sheet-paper: #fffdf9;
  display: grid;
  gap: 18px;
  width: 100%;
  color: var(--sheet-ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.character-sheet[data-sheet-system="dnd5e"] {
  --sheet-accent: #6a3540;
  --sheet-accent-soft: #f1e5e8;
}

.character-sheet[data-sheet-system="brp"] {
  --sheet-accent: #6c3e2c;
  --sheet-accent-soft: #f1e7df;
}

.sheet-page {
  box-sizing: border-box;
  width: min(100%, 8.5in);
  margin: 0 auto;
  padding: 22px;
  background: var(--sheet-paper);
  border: 1px solid var(--sheet-line);
  border-radius: 8px;
  box-shadow: 0 8px 22px rgba(55, 41, 28, .09);
}

.sheet-page-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;
  padding-bottom: 10px;
  border-bottom: 3px solid var(--sheet-accent);
}

.sheet-page-header-copy {
  min-width: 0;
}

.sheet-page-header h2 {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.65rem, 3vw, 2.35rem);
  line-height: .98;
  letter-spacing: -.02em;
}

.sheet-page-header p {
  margin: 5px 0 0;
  color: var(--sheet-muted);
  font-size: .78rem;
}

.sheet-page-header-side {
  display: grid;
  justify-items: end;
  gap: 8px;
  min-width: 0;
}

.sheet-campaign-badge {
  max-width: 190px;
  padding: 5px 9px;
  border: 1px solid var(--sheet-accent);
  border-radius: 999px;
  color: var(--sheet-accent);
  font-size: .64rem;
  font-weight: 800;
  line-height: 1.1;
  text-align: right;
  text-transform: uppercase;
  letter-spacing: .05em;
  overflow-wrap: anywhere;
}

.sheet-header-facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 5px 11px;
  margin: 11px 0 0;
}

.sheet-header-facts > div {
  min-width: 0;
  padding-top: 3px;
  border-top: 1px solid var(--sheet-line);
}

.sheet-header-facts dt {
  color: var(--sheet-muted);
  font-size: .56rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.sheet-header-facts dd {
  min-width: 0;
  margin: 2px 0 0;
  font-size: .78rem;
  font-weight: 750;
  overflow-wrap: anywhere;
}

.sheet-media-slot {
  position: relative;
  display: block;
  overflow: hidden;
  flex: 0 0 auto;
  border: 1px dashed #b9ad9f;
  background: #fbf8f2;
}

.sheet-media-slot.has-image {
  border-style: solid;
  background: #fff;
}

.sheet-media-slot img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sheet-media-slot-portrait {
  width: 88px;
  height: 112px;
  border-radius: 4px;
}

.sheet-media-slot-token {
  width: 54px;
  height: 54px;
  border-radius: 50%;
}

.sheet-page-content {
  padding-top: 11px;
}

.sheet-play-grid {
  display: grid;
  gap: 11px 13px;
  align-items: start;
}

.sheet-play-grid-3 {
  grid-template-columns: minmax(0, .84fr) minmax(0, 1.24fr) minmax(0, .92fr);
}

.sheet-play-grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.sheet-zone-column {
  display: grid;
  gap: 11px;
  align-content: start;
  min-width: 0;
}

.sheet-zone-main {
  padding: 0 11px;
  border-right: 1px solid var(--sheet-line);
  border-left: 1px solid var(--sheet-line);
}

.sheet-play-grid-2 .sheet-zone-right {
  padding-left: 11px;
  border-left: 1px solid var(--sheet-line);
}

.sheet-zone-wide {
  grid-column: 1 / -1;
  display: grid;
  gap: 9px;
  min-width: 0;
  padding-top: 2px;
}

.sheet-section {
  min-width: 0;
}

.sheet-section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 5px;
  padding: 4px 6px 3px;
  border-bottom: 1px solid var(--sheet-accent);
  background: linear-gradient(90deg, var(--sheet-accent-soft), transparent 88%);
}

.sheet-section-heading h3 {
  margin: 0;
  color: var(--sheet-accent);
  font-family: Georgia, "Times New Roman", serif;
  font-size: .9rem;
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: .025em;
}

.sheet-section-help {
  margin: 0;
  color: var(--sheet-muted);
  font-size: .62rem;
  text-align: right;
}

.sheet-stats,
.sheet-ratings,
.sheet-details,
.sheet-list {
  display: grid;
  gap: 4px;
}

.sheet-columns-1 { grid-template-columns: minmax(0, 1fr); }
.sheet-columns-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.sheet-columns-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.sheet-columns-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

.sheet-stat {
  min-width: 0;
  padding: 6px 7px;
  border: 1px solid var(--sheet-line);
  border-radius: 6px;
  background: #fff;
  text-align: center;
}

.sheet-stat span,
.sheet-stat small {
  display: block;
  color: var(--sheet-muted);
  font-size: .58rem;
  font-weight: 800;
  line-height: 1.05;
  text-transform: uppercase;
  letter-spacing: .03em;
}

.sheet-stat strong {
  display: block;
  margin-top: 3px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.18rem;
  line-height: 1;
}

.sheet-stat small {
  margin-top: 3px;
  color: var(--sheet-accent);
  font-size: .66rem;
}

.sheet-rating {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px 8px;
  align-items: baseline;
  min-width: 0;
  padding: 3px 3px 3px 5px;
  border-bottom: 1px dotted #b9aea2;
  font-size: .74rem;
  line-height: 1.15;
}

.sheet-rating span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.sheet-rating strong {
  color: var(--sheet-ink);
  font-size: .79rem;
  font-variant-numeric: tabular-nums;
}

.sheet-rating small {
  grid-column: 1 / -1;
  margin-top: -2px;
  color: var(--sheet-muted);
  font-size: .58rem;
  font-weight: 750;
  text-transform: uppercase;
}

.sheet-details {
  margin: 0;
}

.sheet-details > div {
  display: grid;
  grid-template-columns: minmax(88px, .34fr) minmax(0, 1fr);
  gap: 7px;
  min-width: 0;
  padding: 4px;
  border-bottom: 1px dotted #c8bdb0;
}

.sheet-details dt {
  color: var(--sheet-muted);
  font-size: .63rem;
  font-weight: 800;
  text-transform: uppercase;
}

.sheet-details dd {
  min-width: 0;
  margin: 0;
  font-size: .74rem;
  overflow-wrap: anywhere;
}

.sheet-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sheet-list li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 5px 8px;
  align-items: baseline;
  padding: 4px;
  border-bottom: 1px dotted #c8bdb0;
  font-size: .74rem;
}

.sheet-list li span {
  color: var(--sheet-muted);
  font-size: .65rem;
}

.sheet-table-wrap {
  overflow-x: auto;
}

.sheet-table-wrap table {
  width: 100%;
  border-collapse: collapse;
  font-size: .69rem;
}

.sheet-table-wrap th,
.sheet-table-wrap td {
  padding: 4px;
  border-bottom: 1px solid var(--sheet-line);
  vertical-align: top;
}

.sheet-table-wrap th {
  color: #fff;
  background: var(--sheet-accent);
  font-size: .58rem;
  text-transform: uppercase;
  letter-spacing: .03em;
}

.sheet-align-left { text-align: left; }
.sheet-align-center { text-align: center; }
.sheet-align-right { text-align: right; }

.sheet-footer {
  margin-top: 9px;
  padding-top: 4px;
  border-top: 1px solid #ded5ca;
  color: #8a8178;
  font-size: .53rem;
  line-height: 1.1;
  text-align: right;
}

@media (max-width: 760px) {
  .sheet-page {
    padding: 16px;
  }

  .sheet-page-header {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .sheet-page-header-side {
    grid-column: 1 / -1;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    justify-items: start;
  }

  .sheet-campaign-badge {
    max-width: none;
    text-align: left;
  }

  .sheet-header-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sheet-play-grid-3,
  .sheet-play-grid-2 {
    grid-template-columns: 1fr;
  }

  .sheet-zone-main,
  .sheet-play-grid-2 .sheet-zone-right {
    padding: 0;
    border: 0;
  }

  .sheet-zone-wide {
    grid-column: auto;
  }
}

@page {
  size: letter;
  margin: .28in;
}

@media print {
  :root,
  body,
  .sheet-print-document {
    color: #000;
    background: #fff;
  }

  body,
  .sheet-print-document {
    width: auto;
    height: auto;
    min-height: 0;
    margin: 0;
    overflow: visible;
  }

  .character-sheet {
    display: block;
    width: auto;
    color: #000;
    font-size: 8pt;
    line-height: 1.1;
  }

  .sheet-page {
    box-sizing: border-box;
    width: 7.94in;
    min-height: 10.35in;
    margin: 0 auto;
    padding: .12in;
    border: 0;
    border-radius: 0;
    background: #fff;
    box-shadow: none;
    break-after: page;
    page-break-after: always;
  }

  .sheet-page:last-child {
    break-after: auto;
    page-break-after: auto;
  }

  .sheet-page-header {
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: .1in;
    padding-bottom: .06in;
    border-bottom-width: 2px;
  }

  .sheet-page-header h2 {
    font-size: 18pt;
  }

  .sheet-page-header p {
    margin-top: 2px;
    color: #222;
    font-size: 6.5pt;
  }

  .sheet-campaign-badge {
    max-width: 1.55in;
    padding: 3px 6px;
    color: #000;
    border-color: #000;
    font-size: 5.8pt;
  }

  .sheet-header-facts {
    gap: 2px 7px;
    margin-top: 5px;
  }

  .sheet-header-facts > div {
    padding-top: 1px;
    border-top-color: #888;
  }

  .sheet-header-facts dt {
    color: #333;
    font-size: 5pt;
  }

  .sheet-header-facts dd {
    font-size: 6.4pt;
  }

  .sheet-media-slot {
    border-color: #aaa;
    background: #fff;
  }

  .sheet-media-slot-portrait {
    width: .72in;
    height: .92in;
  }

  .sheet-media-slot-token {
    width: .48in;
    height: .48in;
  }

  .sheet-page-content,
  .sheet-play-grid {
    gap: .055in .07in;
    padding-top: .06in;
  }

  .sheet-play-grid-3 {
    grid-template-columns: minmax(0, .84fr) minmax(0, 1.24fr) minmax(0, .92fr);
  }

  .sheet-play-grid-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sheet-zone-column {
    gap: .055in;
  }

  .sheet-zone-main {
    padding: 0 .06in;
    border-right-color: #aaa;
    border-left-color: #aaa;
  }

  .sheet-play-grid-2 .sheet-zone-right {
    padding-left: .06in;
    border-left-color: #aaa;
  }

  .sheet-zone-wide {
    grid-column: 1 / -1;
    gap: .04in;
  }

  .sheet-section:not(.sheet-section-splittable) {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .sheet-section-heading {
    margin-bottom: 2px;
    padding: 2px 3px 1px;
    border-bottom-color: #555;
    background: #eee;
  }

  .sheet-section-heading h3 {
    color: #000;
    font-size: 7.2pt;
  }

  .sheet-section-help {
    color: #333;
    font-size: 5.5pt;
  }

  .sheet-stats,
  .sheet-ratings,
  .sheet-details,
  .sheet-list {
    gap: 1px 3px;
  }

  .sheet-stat {
    padding: 2px 3px;
    border-color: #999;
    border-radius: 2px;
    background: #fff;
  }

  .sheet-stat span,
  .sheet-stat small {
    color: #222;
    font-size: 5.2pt;
  }

  .sheet-stat strong {
    font-size: 9.2pt;
  }

  .sheet-rating {
    gap: 2px 4px;
    padding: 1px 1px 1px 2px;
    border-bottom-color: #aaa;
    font-size: 6.2pt;
  }

  .sheet-rating strong {
    font-size: 6.6pt;
  }

  .sheet-rating small {
    color: #333;
    font-size: 4.8pt;
  }

  .sheet-details > div,
  .sheet-list li {
    gap: 3px;
    padding: 1px 2px;
    border-bottom-color: #aaa;
  }

  .sheet-details dt {
    color: #222;
    font-size: 5.5pt;
  }

  .sheet-details dd,
  .sheet-list li,
  .sheet-table-wrap table {
    font-size: 6.2pt;
  }

  .sheet-list li span {
    color: #333;
    font-size: 5.4pt;
  }

  .sheet-table-wrap {
    overflow: visible;
  }

  .sheet-table-wrap th,
  .sheet-table-wrap td {
    padding: 1.5px 2px;
    border-bottom-color: #999;
  }

  .sheet-table-wrap th {
    color: #000;
    background: #e8e8e8;
    font-size: 5.2pt;
  }

  .sheet-table-wrap thead {
    display: table-header-group;
  }

  .sheet-footer {
    margin-top: 3px;
    padding-top: 2px;
    border-top-color: #bbb;
    color: #444;
    font-size: 4.8pt;
  }
}
`;
