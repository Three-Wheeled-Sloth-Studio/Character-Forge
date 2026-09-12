export function ensureBrpCreatorStyles(): void {
  const styleId = "character-forge-brp-creator-styles";
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .brp-creator-panel,
    .brp-creator-panel .creator-form,
    .brp-creator-panel fieldset,
    .brp-creator-panel label,
    .brp-creator-panel .method-controls { min-width: 0; max-width: 100%; box-sizing: border-box; }
    .brp-creator-panel input,
    .brp-creator-panel select,
    .brp-creator-panel textarea { width: 100%; min-width: 0; max-width: 100%; box-sizing: border-box; }
    .brp-creator-panel input[type="checkbox"] { width: 1rem; min-width: 1rem; max-width: 1rem; height: 1rem; flex: 0 0 1rem; margin: 0; }
    .brp-creator-panel textarea { resize: vertical; }
    .brp-creator-panel button { max-width: 100%; box-sizing: border-box; }
    .brp-creator-panel .choice-pick-row > label { min-width: 0; }
    .brp-inline-grid, .brp-language-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .brp-academic-list, .brp-redistribution-list, .brp-skill-grid { display: grid; gap: 6px; min-width: 0; max-width: 100%; }
    .brp-academic-labels, .brp-academic-row { display: grid; grid-template-columns: minmax(0, .72fr) minmax(0, .95fr) minmax(0, 1.15fr) 40px; gap: 6px; align-items: center; min-width: 0; max-width: 100%; }
    .brp-academic-row > * { min-width: 0; max-width: 100%; }
    .brp-academic-labels, .brp-skill-labels, .brp-review-skill-labels { color: #74685a; font-size: .68rem; font-weight: 800; }
    #brp-profession-random,
    #brp-reroll,
    .brp-academic-suggest,
    .brp-finishing-suggest { width: 40px; height: 40px; padding: 0; border-radius: 999px; font-size: 0; white-space: nowrap; justify-self: end; }
    #brp-profession-random::before,
    #brp-reroll::before,
    .brp-academic-suggest::before,
    .brp-finishing-suggest::before { content: "⚄"; font-size: 1.12rem; line-height: 1; }
    .brp-academic-suggest.suggested { font-weight: 800; }
    .brp-finishing-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
    .brp-finishing-heading label { margin: 0; }
    .creator-inline-help { display: inline-grid; place-items: center; width: 18px; height: 18px; margin-left: 6px; border: 1px solid #9b8c77; border-radius: 999px; color: #5f5548; font-size: .7rem; font-weight: 800; line-height: 1; cursor: help; vertical-align: middle; }
    .compact-status-note { display: block; margin-top: 4px; font-size: .76rem; }
    .brp-redistribution-row { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) minmax(46px, 64px); gap: 6px; align-items: center; min-width: 0; }
    .brp-budget-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
    .brp-budget-card { min-width: 0; padding: 9px 10px; border: 1px solid #d4c8b8; border-radius: 9px; background: #f3eadc; }
    .brp-budget-card span, .brp-budget-card small { display: block; color: #74685a; font-size: .7rem; }
    .brp-budget-card strong { display: block; margin: 2px 0; }
    .brp-budget-card progress { width: 100%; height: 7px; margin: 3px 0 5px; }
    .brp-budget-card.complete { border-width: 2px; }
    .brp-budget-card.over, .brp-skill-row.over-cap { background: #f4dddd; color: #8a2525; }
    .brp-allocation-status { margin: 10px 0 6px; padding: 8px 10px; border: 1px solid #d4c8b8; border-radius: 9px; }
    .brp-allocation-status strong, .brp-allocation-status span { display: block; }
    .brp-allocation-status span { margin-top: 3px; font-size: .78rem; }
    .brp-allocation-status ul { margin: 5px 0 0 18px; padding: 0; font-size: .78rem; }
    .brp-allocation-status.ready { display: inline-flex; gap: 4px; align-items: center; width: auto; margin: 8px 0 4px; padding: 4px 8px; background: #e4efe3; color: #245a34; }
    .brp-allocation-status.ready strong { display: inline; }
    .brp-allocation-status.blocked { background: #f4dddd; color: #8a2525; }
    .brp-skill-heading { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 10px; min-width: 0; }
    .brp-skill-heading > * { min-width: 0; }
    .brp-skill-heading p { margin: 3px 0 0; }
    .brp-skill-labels, .brp-skill-row, .brp-review-skill-labels, .brp-review-skill-row { display: grid; grid-template-columns: minmax(0, 1.55fr) repeat(4, minmax(0, .58fr)); gap: 6px; align-items: center; min-width: 0; max-width: 100%; }
    .brp-skill-labels > *, .brp-skill-row > *, .brp-review-skill-labels > *, .brp-review-skill-row > * { min-width: 0; overflow-wrap: anywhere; }
    .brp-skill-row { padding: 6px; border-radius: 8px; background: #fbf5eb; }
    .brp-skill-row.at-cap { box-shadow: inset 0 0 0 1px #b8a98f; }
    .brp-skill-row input { min-width: 0; width: 100%; padding: 7px 4px; text-align: center; }
    .brp-skill-row input:disabled { opacity: .45; cursor: not-allowed; }
    .brp-skill-name small, .brp-skill-final small { display: block; margin-top: 2px; color: #74685a; font-size: .62rem; font-weight: 600; }
    .brp-skill-final { line-height: 1.05; }
    .brp-suggestion-note { margin: -3px 0 4px; }
    .brp-validation-detail { margin-top: 8px; }
    .valid-feedback { color: #245a34; }
    .brp-review-characteristics { grid-template-columns: repeat(7, minmax(0, 1fr)); }
    .brp-review-skills { margin-top: 20px; border-top: 1px solid #d8ccbd; padding-top: 17px; min-width: 0; max-width: 100%; }
    .brp-review-skill-row { padding: 6px 0; border-bottom: 1px solid #eee4d7; }
    .brp-review-skill-row small { display: block; color: #74685a; }
    @media (max-width: 650px) {
      .brp-inline-grid, .brp-language-grid, .brp-budget-summary { grid-template-columns: 1fr; }
      .brp-academic-labels, .brp-academic-row { grid-template-columns: minmax(0, .72fr) minmax(0, .95fr) minmax(0, 1.15fr) 38px; }
      .brp-review-characteristics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
  `;
  document.head.append(style);
}
