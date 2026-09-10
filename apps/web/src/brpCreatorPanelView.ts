import {
  BRP_ATHLETE_ELECTIVE_SKILL_KEYS,
  BRP_ATHLETE_FIXED_SKILL_KEYS,
  BRP_BEGGAR_SKILL_KEYS,
  BRP_CHARACTERISTIC_IDS,
  BRP_DETECTIVE_ELECTIVE_SKILL_KEYS,
  BRP_FIRST_SLICE_SKILL_CATALOG,
  allowedBrpWealthLevels,
  generateBrpStandardRolledCharacteristics,
  type BrpCharacteristicId,
  type BrpCharacteristicRedistributionInput,
  type BrpFirstSliceSkillKey,
  type BrpProfessionSuggestionProvenance,
  type BrpScholarAcademicSuggestionRecord,
} from "../../../packages/system-brp/src/index.js";
import type { BrpCreatorPreview, BrpCreatorState } from "./brpCreatorState.js";

export function brpCreatorHtml(
  state: BrpCreatorState,
  preview: BrpCreatorPreview,
  professionSuggestion: BrpProfessionSuggestionProvenance | null = null,
  academicSuggestions: readonly BrpScholarAcademicSuggestionRecord[] = [],
): string {
  return `
    <section class="creator-panel compact-creator brp-creator-panel">
      <div class="creator-heading"><p class="eyebrow">Basic Roleplaying</p><h2>BRP UGE creator</h2><p>2023 ORC rules profile, corrections 1.05. The core creator exposes only source-audited BRP choices currently supported by native state.</p></div>
      <form id="brp-creator-form" class="creator-form">
        <label>Display name<input id="brp-name" value="${escapeHtml(state.displayName)}" autocomplete="off"></label>
        <div class="brp-inline-grid"><label>Age<input id="brp-age" type="number" min="18" max="49" step="1" value="${state.age}"></label><label>Gender<input id="brp-gender" value="${escapeHtml(state.gender)}" autocomplete="off"></label></div>
        <div class="brp-inline-grid"><label>Wealth<select id="brp-wealth">${wealthOptionsHtml(state)}</select></label><label>Power level<select id="brp-power"><option value="normal"${selected(state.powerLevel === "normal")}>Normal</option><option value="heroic"${selected(state.powerLevel === "heroic")}>Heroic</option></select></label></div>
        ${state.powerLevel === "heroic" ? `<label>Retained default starting age<input id="brp-default-age" type="number" min="18" max="23" step="1" value="${state.defaultStartingAge}"><span class="muted">Heroic age causality remains retained in native state.</span></label>` : ""}
        <div class="choice-pick-row"><label>Profession<select id="brp-profession"><option value="detective"${selected(state.professionId === "detective")}>Detective</option><option value="scholar"${selected(state.professionId === "scholar")}>Scholar</option><option value="athlete"${selected(state.professionId === "athlete")}>Athlete</option><option value="beggar"${selected(state.professionId === "beggar")}>Beggar</option><option value="custom"${selected(state.professionId === "custom")}>Custom Profession</option></select></label><button id="brp-profession-random" class="secondary-button" type="button" title="Suggest Detective or Scholar from the existing source-backed suggestion table">Suggest</button></div>
        ${professionSuggestionHtml(professionSuggestion)}
        <div id="brp-profession-controls">${professionControlsHtml(state, academicSuggestions)}</div>
        <div class="section-divider"></div>
        <label>Characteristic generation<select id="brp-generation-method"><option value="explicit"${selected(state.characteristicMethod === "explicit")}>Explicit</option><option value="standard-rolled"${selected(state.characteristicMethod === "standard-rolled")}>Standard Rolled</option></select></label>
        <div id="brp-characteristic-controls">${characteristicControlsHtml(state)}</div>
        <div class="section-divider"></div>
        <div class="brp-budget-summary">${budgetCard("Professional", preview.professionalSpent, preview.professionalBudget, preview.professionalRemaining)}${budgetCard("Personal", preview.personalSpent, preview.personalBudget, preview.personalRemaining)}<div class="brp-budget-card"><span>Starting cap</span><strong>${preview.startingSkillCap || "-"}%</strong><small>System profile</small></div></div>
        <div class="brp-skill-heading"><div><strong>Skill allocation</strong><p class="muted">Professional points are limited to profession skills. Personal points may be spent on any currently supported ordinary skill. Base, professional, personal, and final ratings remain separate.</p></div><button id="brp-auto-allocate" class="secondary-button" type="button"${preview.skillRows.length ? "" : " disabled"}>Fill legal example</button></div>
        <div class="brp-skill-grid">${skillRowsHtml(preview.skillRows, preview.startingSkillCap)}</div>
        <p id="brp-validation" class="form-error ${preview.validCharacter ? "valid-feedback" : ""}">${escapeHtml(preview.validationMessage)}</p>
        <button id="brp-generate" class="primary-action" type="submit"${preview.validCharacter ? "" : " disabled"}>Generate BRP character</button>
      </form>
    </section>`;
}

export function readBrpRedistribution(root: HTMLElement): BrpCharacteristicRedistributionInput[] {
  const result: BrpCharacteristicRedistributionInput[] = [];
  for (const index of [0, 1, 2]) {
    const points = Number(root.querySelector<HTMLSelectElement>(`[data-brp-redistribution-points="${index}"]`)?.value ?? 0);
    if (points <= 0) continue;
    const from = root.querySelector<HTMLSelectElement>(`[data-brp-redistribution-from="${index}"]`)?.value as BrpCharacteristicId | undefined;
    const to = root.querySelector<HTMLSelectElement>(`[data-brp-redistribution-to="${index}"]`)?.value as BrpCharacteristicId | undefined;
    if (from && to) result.push({ from, to, points });
  }
  return result;
}

function professionSuggestionHtml(provenance: BrpProfessionSuggestionProvenance | null): string {
  if (!provenance) return "";
  const label = provenance.selectedProfessionId === "scholar" ? "Scholar" : "Detective";
  const details = `Table ${provenance.tableId} v${provenance.tableVersion}; source ${provenance.sourceId} ${provenance.sourceVersion}; evaluator ${provenance.evaluatorVersion}; seed ${provenance.seed}; draw ${provenance.drawIndex}; entry ${provenance.selectedEntryId}`;
  return `<p class="muted brp-suggestion-note" title="${escapeHtml(details)}">Suggested ${label}. Change Profession to override; replay provenance is retained.</p>`;
}

function professionControlsHtml(
  state: BrpCreatorState,
  academicSuggestions: readonly BrpScholarAcademicSuggestionRecord[],
): string {
  if (state.professionId === "detective") {
    const options = BRP_DETECTIVE_ELECTIVE_SKILL_KEYS.map((skillKey) => `<label class="choice-pool-option"><input type="checkbox" data-brp-detective-elective value="${skillKey}"${checked(state.detectiveElectives.includes(skillKey))}>${escapeHtml(BRP_FIRST_SLICE_SKILL_CATALOG[skillKey].label)}</label>`).join("");
    return `<fieldset class="ability-fieldset"><legend>Detective electives: choose exactly four</legend><p class="muted">This list is the currently implemented source-backed subset of the BRP Detective choices. Broader specialty substitution remains incremental breadth.</p><div class="choice-pool-grid">${options}</div></fieldset>`;
  }

  if (state.professionId === "athlete") {
    const fixed = BRP_ATHLETE_FIXED_SKILL_KEYS.map((skillKey) => escapeHtml(BRP_FIRST_SLICE_SKILL_CATALOG[skillKey].label)).join(", ");
    const options = BRP_ATHLETE_ELECTIVE_SKILL_KEYS.map((skillKey) => `<label class="choice-pool-option"><input type="checkbox" data-brp-athlete-elective value="${skillKey}"${checked(state.athleteElectives.includes(skillKey))}>${escapeHtml(BRP_FIRST_SLICE_SKILL_CATALOG[skillKey].label)}</label>`).join("");
    return `<fieldset class="ability-fieldset"><legend>Athlete profession</legend><p class="muted">Fixed skills: ${fixed}. Choose exactly five electives below. Ride and Martial Arts remain outside the bounded static catalog for now.</p><div class="choice-pool-grid">${options}</div></fieldset>`;
  }

  if (state.professionId === "beggar") {
    const skills = BRP_BEGGAR_SKILL_KEYS.map((skillKey) => escapeHtml(BRP_FIRST_SLICE_SKILL_CATALOG[skillKey].label)).join(", ");
    return `<fieldset class="ability-fieldset"><legend>Beggar profession</legend><p class="muted">Fixed professional skills: ${skills}.</p></fieldset>`;
  }

  if (state.professionId === "custom") {
    const options = (Object.keys(BRP_FIRST_SLICE_SKILL_CATALOG) as BrpFirstSliceSkillKey[])
      .map((skillKey) => `<label class="choice-pool-option"><input type="checkbox" data-brp-custom-skill value="${skillKey}"${checked(state.customProfessionalSkillKeys.includes(skillKey))}>${escapeHtml(BRP_FIRST_SLICE_SKILL_CATALOG[skillKey].label)}</label>`)
      .join("");
    return `<fieldset class="ability-fieldset"><legend>Custom profession</legend><p class="muted">BRP explicitly supports creating a profession from a title, description or social role, wealth, and ten essential skills. This picker is bounded to the current source-audited static catalog.</p><label>Profession title<input id="brp-custom-title" value="${escapeHtml(state.customProfessionTitle)}" autocomplete="off"></label><label>Description / training / social role<textarea id="brp-custom-description" rows="3">${escapeHtml(state.customProfessionDescription)}</textarea></label><div class="brp-skill-heading"><strong>Essential professional skills</strong><span class="muted">${state.customProfessionalSkillKeys.length} / 10 selected</span></div><div class="choice-pool-grid">${options}</div></fieldset>`;
  }

  const rows = state.scholarAcademicSkills.map((selection, index) => {
    const suggestion = academicSuggestions.find((record) => record.slotIndex === index);
    const suggestionTitle = suggestion
      ? `Suggested ${suggestion.result.label}. Table ${suggestion.provenance.tableId} v${suggestion.provenance.tableVersion}; source ${suggestion.provenance.sourceId} ${suggestion.provenance.sourceVersion}; evaluator ${suggestion.provenance.evaluatorVersion}; seed ${suggestion.provenance.seed}; draw ${suggestion.provenance.drawIndex}; entry ${suggestion.provenance.selectedEntryId}. Change any field in this row to override.`
      : "Suggest a source-safe Knowledge or Science specialty from the current BRP first-slice table.";
    return `<div class="brp-academic-row"><select data-brp-academic-index="${index}" data-brp-academic-parent="${index}" aria-label="Academic ${index + 1} parent"><option value="knowledge"${selected(selection.skillId === "knowledge")}>Knowledge</option><option value="science"${selected(selection.skillId === "science")}>Science</option></select><input data-brp-academic-index="${index}" data-brp-academic-id="${index}" value="${escapeHtml(selection.specialty.id)}" aria-label="Academic ${index + 1} specialty ID"><input data-brp-academic-index="${index}" data-brp-academic-label="${index}" value="${escapeHtml(selection.specialty.label)}" aria-label="Academic ${index + 1} specialty label"><button type="button" class="secondary-button brp-academic-suggest${suggestion ? " suggested" : ""}" data-brp-academic-suggest="${index}" title="${escapeHtml(suggestionTitle)}">${suggestion ? "Re-suggest" : "Suggest"}</button></div>`;
  }).join("");
  return `<fieldset class="ability-fieldset"><legend>Scholar languages</legend><div class="brp-language-grid"><label>Own language ID<input id="brp-own-language-id" value="${escapeHtml(state.scholarOwnLanguage.id)}"></label><label>Own language label<input id="brp-own-language-label" value="${escapeHtml(state.scholarOwnLanguage.label)}"></label><label>Other language ID<input id="brp-other-language-id" value="${escapeHtml(state.scholarOtherLanguage.id)}"></label><label>Other language label<input id="brp-other-language-label" value="${escapeHtml(state.scholarOtherLanguage.label)}"></label></div></fieldset><fieldset class="ability-fieldset"><legend>Five Knowledge/Science specialties</legend><p class="muted">Suggestions use the source-safe first-slice catalog. Manual edits remain authoritative and clear that row's suggestion provenance.</p><div class="brp-academic-list"><div class="brp-academic-labels"><span>Parent</span><span>Specialty ID</span><span>Label</span><span>Suggestion</span></div>${rows}</div></fieldset>`;
}

function wealthOptionsHtml(state: BrpCreatorState): string {
  return allowedBrpWealthLevels(state.professionId)
    .map((wealth) => `<option value="${wealth}"${selected(state.wealth === wealth)}>${humanizeLabel(wealth)}</option>`)
    .join("");
}

function characteristicControlsHtml(state: BrpCreatorState): string {
  if (state.characteristicMethod === "explicit") return `<fieldset class="ability-fieldset"><legend>Characteristics</legend><div class="ability-input-grid brp-characteristic-grid">${BRP_CHARACTERISTIC_IDS.map((id) => `<label>${id}<input type="number" step="1" data-brp-characteristic="${id}" value="${state.characteristics[id]}"></label>`).join("")}</div></fieldset>`;
  let rollHtml = "";
  try {
    const generated = generateBrpStandardRolledCharacteristics(state.rollSeed, state.redistribution);
    rollHtml = `<div class="random-roll-grid brp-roll-grid">${BRP_CHARACTERISTIC_IDS.map((id) => { const roll = generated.generationState.rolls[id]; return `<div class="random-roll-card"><span>${id}</span><strong>${generated.final[id]}</strong><small>${escapeHtml(roll.notation)}: ${roll.rolls.join(" + ")}${roll.modifier ? ` + ${roll.modifier}` : ""}</small></div>`; }).join("")}</div>`;
  } catch (caught) {
    rollHtml = `<p class="form-error">${escapeHtml(caught instanceof Error ? caught.message : "Rolled characteristics are invalid.")}</p>`;
  }
  return `<div class="method-controls"><div class="choice-pick-row"><label>Seed<input id="brp-roll-seed" value="${escapeHtml(state.rollSeed)}"></label><button id="brp-reroll" class="secondary-button" type="button">Re-roll</button></div>${rollHtml}<fieldset class="ability-fieldset"><legend>Redistribution: move up to three total points</legend><div class="brp-redistribution-list">${[0, 1, 2].map((index) => redistributionRowHtml(state.redistribution[index], index)).join("")}</div></fieldset></div>`;
}

function redistributionRowHtml(transfer: BrpCharacteristicRedistributionInput | undefined, index: number): string {
  const from = transfer?.from ?? "STR";
  const to = transfer?.to ?? "DEX";
  const points = transfer?.points ?? 0;
  const options = (selectedId: BrpCharacteristicId): string => BRP_CHARACTERISTIC_IDS.map((id) => `<option value="${id}"${selected(id === selectedId)}>${id}</option>`).join("");
  return `<div class="brp-redistribution-row"><select data-brp-redistribution data-brp-redistribution-from="${index}" aria-label="Redistribution ${index + 1} from">${options(from)}</select><span>to</span><select data-brp-redistribution data-brp-redistribution-to="${index}" aria-label="Redistribution ${index + 1} to">${options(to)}</select><select data-brp-redistribution data-brp-redistribution-points="${index}" aria-label="Redistribution ${index + 1} points">${[0, 1, 2, 3].map((value) => `<option value="${value}"${selected(points === value)}>${value}</option>`).join("")}</select></div>`;
}

function skillRowsHtml(rows: BrpCreatorPreview["skillRows"], startingCap: number): string {
  if (!rows.length) return `<p class="muted">Complete the profession and characteristic choices to expose BRP-owned legal skill rows.</p>`;
  return `<div class="brp-skill-labels"><span>Skill</span><span>Base</span><span>Prof.</span><span>Personal</span><span>Final</span></div>${rows.map((row, index) => `<div class="brp-skill-row${row.overCap ? " over-cap" : ""}"><span class="brp-skill-name">${escapeHtml(row.label)}${row.professionalEligible ? "" : " <small>personal</small>"}</span><span>${row.baseChance}</span><input type="number" min="0" step="1" data-brp-allocation-row="${index}" data-brp-allocation-source="professionalPoints" value="${row.professionalPoints}" aria-label="${escapeHtml(row.label)} professional points"${row.professionalEligible ? "" : " disabled title=\"Not a selected profession skill\""}><input type="number" min="0" step="1" data-brp-allocation-row="${index}" data-brp-allocation-source="personalPoints" value="${row.personalPoints}" aria-label="${escapeHtml(row.label)} personal points"><strong>${row.finalRating}${row.overCap ? ` / cap ${startingCap}` : ""}</strong></div>`).join("")}`;
}

function budgetCard(label: string, spent: number, total: number, remaining: number): string {
  const status = remaining === 0 ? "exact" : remaining < 0 ? "over" : "remaining";
  return `<div class="brp-budget-card${remaining < 0 ? " over-budget" : ""}"><span>${label}</span><strong>${spent} / ${total}</strong><small>${Math.abs(remaining)} ${status}</small></div>`;
}

function humanizeLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("-", " ");
}

function selected(value: boolean): string { return value ? " selected" : ""; }
function checked(value: boolean): string { return value ? " checked" : ""; }
function escapeHtml(value: string): string { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
