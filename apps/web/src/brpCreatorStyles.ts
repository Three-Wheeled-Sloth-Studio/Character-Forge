export function ensureBrpCreatorStyles(): void {
  const styleId = "character-forge-brp-creator-styles";
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .creator-system-panel { margin-bottom: 12px; padding: 14px 20px; display: grid; gap: 5px; }
    .creator-system-panel label { display: grid; gap: 5px; font-size: .82rem; font-weight: 750; }
    .creator-system-panel select { width: 100%; min-width: 0; padding: 10px 11px; border: 1px solid #b9aa96; border-radius: 9px; background: #fffdf9; color: #221d19; }
    .creator-system-panel p { margin: 0; }
    .brp-creator-panel,
    .brp-creator-panel .creator-form,
    .brp-creator-panel fieldset,
    .brp-creator-panel label,
    .brp-creator-panel .method-controls { min-width: 0; max-width: 100%; box-sizing: border-box; }
    .brp-creator-panel input,
    .brp-creator-panel select { width: 100%; min-width: 0; max-width: 100%; box-sizing: border-box; }
    .brp-creator-panel button { max-width: 100%; box-sizing: border-box; }
    .brp-creator-panel .choice-pick-row > label { min-width: 0; }
    .brp-inline-grid, .brp-language-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .brp-academic-list, .brp-redistribution-list, .brp-skill-grid { display: grid; gap: 6px; }
    .brp-academic-labels, .brp-academic-row { display: grid; grid-template-columns: .8fr 1fr 1.2fr; gap: 6px; align-items: center; }
    .brp-academic-labels, .brp-skill-labels, .brp-review-skill-labels { color: #74685a; font-size: .68rem; font-weight: 800; }
    .brp-redistribution-row { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) minmax(52px, 72px); gap: 6px; align-items: center; }
    .brp-budget-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
    .brp-budget-card { padding: 9px 10px; border: 1px solid #d4c8b8; border-radius: 9px; background: #f3eadc; }
    .brp-budget-card span, .brp-budget-card small { display: block; color: #74685a; font-size: .7rem; }
    .brp-budget-card strong { display: block; margin: 2px 0; }
    .brp-budget-card.over-budget, .brp-skill-row.over-cap { background: #f4dddd; color: #8a2525; }
    .brp-skill-heading { display: flex; align-items: end; justify-content: space-between; gap: 10px; }
    .brp-skill-heading p { margin: 3px 0 0; }
    .brp-skill-labels, .brp-skill-row, .brp-review-skill-labels, .brp-review-skill-row { display: grid; grid-template-columns: minmax(130px, 1fr) 54px 70px 70px 70px; gap: 6px; align-items: center; }
    .brp-skill-row { padding: 6px; border-radius: 8px; background: #fbf5eb; }
    .brp-skill-row input { padding: 7px; text-align: center; }
    .brp-suggestion-note { margin: -3px 0 4px; }
    .valid-feedback { color: #245a34; }
    .brp-review-characteristics { grid-template-columns: repeat(7, minmax(0, 1fr)); }
    .brp-review-skills { margin-top: 20px; border-top: 1px solid #d8ccbd; padding-top: 17px; }
    .brp-review-skill-row { padding: 6px 0; border-bottom: 1px solid #eee4d7; }
    .brp-review-skill-row small { display: block; color: #74685a; }
    @media (max-width: 650px) {
      .brp-inline-grid, .brp-language-grid, .brp-budget-summary { grid-template-columns: 1fr; }
      .brp-academic-list, .brp-skill-grid, .brp-review-skills { overflow-x: auto; }
      .brp-review-characteristics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
  `;
  document.head.append(style);
}
