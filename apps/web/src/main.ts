import { dnd5eSrd521Adapter, type Dnd5eNativeCharacter } from "../../../packages/system-dnd5e/src/index.js";
import { BRP_CHARACTERISTIC_IDS, brpUge105Adapter, type BrpNativeCharacter } from "../../../packages/system-brp/src/index.js";
import type { CharacterDocument, NativeSystemState } from "../../../packages/character-model/src/index.js";
import { characterForgeBuildTitle, currentCharacterForgeBuildInfo, visibleCharacterForgeBuildLabel } from "./buildInfo.js";
import { appendBrpEquipmentReview } from "./brpEquipmentReview.js";
import { parseCharacterOpenMessage, resolveHostOrigin } from "./characterForgeHostBridge.js";
import { mountCreatorWorkspace } from "./creatorWorkspace.js";

const CHARACTER_GENERATED_MESSAGE = "character-forge:character-generated";
const params = new URLSearchParams(window.location.search);
const projectId = params.get("pwProjectId") ?? "";
const projectName = params.get("pwProjectName") ?? "";
const returnUrl = params.get("pwReturnUrl") ?? "";
const hostOrigin = resolveHostOrigin(returnUrl);
const buildInfo = currentCharacterForgeBuildInfo();
const app = document.querySelector<HTMLElement>("#app");
if (!app) throw new Error("Character Forge application root was not found.");

app.innerHTML = `
  <section class="forge-shell">
    <header class="forge-header">
      <div><p class="eyebrow">Parchment Worlds module</p><h1>Character Forge</h1><p class="lede">Create a system-native character first. Translation magic comes later.</p></div>
      <div class="forge-header-meta">
        ${projectName ? `<div class="project-chip">Project: <strong>${escapeHtml(projectName)}</strong></div>` : ""}
        <span class="build-chip" title="${escapeHtml(characterForgeBuildTitle(buildInfo))}">${escapeHtml(visibleCharacterForgeBuildLabel(buildInfo))}</span>
      </div>
    </header>
    <div class="forge-workspace">
      <aside id="creator-root" class="creator-column" aria-label="Character generation controls"></aside>
      <section id="result" class="result-panel empty-result" aria-live="polite"><div class="empty-state"><p class="eyebrow">Character details</p><h2>Build a character</h2><p>Your generated character will stay visible here while you adjust generation choices on the left.</p></div></section>
    </div>
  </section>`;

const creatorRootCandidate = document.querySelector<HTMLElement>("#creator-root");
const resultCandidate = document.querySelector<HTMLElement>("#result");
if (!creatorRootCandidate || !resultCandidate) throw new Error("Character Forge workspace failed to initialize.");
const creatorRoot: HTMLElement = creatorRootCandidate;
const resultElement: HTMLElement = resultCandidate;
const creatorController = mountCreatorWorkspace(creatorRoot, publishCharacter);

window.addEventListener("message", (event: MessageEvent<unknown>) => {
  if (window.parent === window || event.source !== window.parent || !hostOrigin || event.origin !== hostOrigin) return;
  const opened = parseCharacterOpenMessage(event.data);
  if (!opened || (projectId && opened.payload.projectId !== projectId)) return;
  try { creatorController.openCharacter(opened.payload.character); }
  catch { /* The review surface below reports invalid retained native state. */ }
  renderCharacter(opened.payload.character);
});

function publishCharacter(character: CharacterDocument): void { renderCharacter(character); postCharacterToHost(character); }

function renderCharacter(character: CharacterDocument): void {
  const nativeState = character.nativeStates.find((state) => state.id === character.primaryNativeStateId);
  if (!nativeState) { renderCharacterFailure(character, "The primary native state is missing from this character document."); return; }
  if (nativeState.systemId === dnd5eSrd521Adapter.systemId && nativeState.editionId === dnd5eSrd521Adapter.editionId) {
    renderDnd5eCharacter(character, nativeState);
    return;
  }
  if (nativeState.systemId === brpUge105Adapter.systemId && nativeState.editionId === brpUge105Adapter.editionId) {
    renderBrpCharacter(character, nativeState);
    return;
  }
  renderCharacterFailure(character, `This Character Forge build cannot open ${nativeState.systemId} ${nativeState.editionId}.`);
}

function renderDnd5eCharacter(character: CharacterDocument, nativeState: NativeSystemState): void {
  const validation = dnd5eSrd521Adapter.validateNativeState(nativeState);
  if (!validation.valid) { renderCharacterFailure(character, validation.issues.map((issue) => issue.message).join(" ") || "Native state validation failed."); return; }

  const payload = nativeState.payload as Dnd5eNativeCharacter;
  const abilities = payload.abilities.final;
  const seed = character.generation?.seed;
  const originFeats = [payload.origin.backgroundOriginFeatId, payload.origin.speciesOriginFeatId].filter((value): value is string => Boolean(value));
  const classTools = payload.class.toolProficiencyIds ?? [];
  const expertise = payload.class.expertiseSkillIds ?? [];
  const bonusLanguages = payload.class.bonusLanguageIds ?? [];
  const skilled = payload.origin.speciesOriginFeatProficiencyIds ?? [];
  const invocations = payload.class.eldritchInvocations ?? [];
  const classCasting = payload.spells?.classCasting ?? [];
  const spellGrants = payload.spells?.grants ?? [];

  resultElement.classList.remove("empty-result");
  resultElement.innerHTML = `
    <div class="result-heading"><div><p class="eyebrow">Character details</p><h2>${escapeHtml(character.displayName)}</h2><p>${humanize(payload.origin.speciesId)} · ${humanize(payload.origin.backgroundId)} · ${humanize(payload.class.classId)} 1</p></div><span class="validation-pill valid">Native state valid</span></div>
    <div class="ability-grid">${abilityCard("STR", abilities.strength)}${abilityCard("DEX", abilities.dexterity)}${abilityCard("CON", abilities.constitution)}${abilityCard("INT", abilities.intelligence)}${abilityCard("WIS", abilities.wisdom)}${abilityCard("CHA", abilities.charisma)}</div>
    <div class="stat-grid">${statCard("HP", String(payload.resources.hitPointsMaximum))}${statCard("AC", String(payload.derived.armorClass))}${statCard("Initiative", signed(payload.derived.initiativeModifier))}${statCard("Passive Perception", String(payload.derived.passivePerception))}</div>
    <div class="result-details">
      <div><strong>Alignment</strong><span>${humanize(payload.identity.alignment)}</span></div>
      <div><strong>Languages</strong><span>${payload.origin.languages.map(humanize).join(", ")}</span></div>
      <div><strong>Ability method</strong><span>${humanize(payload.abilities.generationMethod)}</span></div>
      <div><strong>Origin feats</strong><span>${originFeats.map(humanize).join(", ") || "None"}</span></div>
      <div><strong>Background skills</strong><span>${(payload.origin.backgroundSkillProficiencies ?? []).map(humanize).join(", ")}</span></div>
      <div><strong>Class skills</strong><span>${payload.class.skillProficiencies.map(humanize).join(", ")}</span></div>
      ${payload.origin.speciesSkillId ? `<div><strong>Species skill</strong><span>${humanize(payload.origin.speciesSkillId)}</span></div>` : ""}
      ${skilled.length ? `<div><strong>Skilled proficiencies</strong><span>${skilled.map(humanize).join(", ")}</span></div>` : ""}
      ${expertise.length ? `<div><strong>Expertise</strong><span>${expertise.map(humanize).join(", ")}</span></div>` : ""}
      <div><strong>Background tool</strong><span>${humanize(payload.origin.toolProficiencyId)}</span></div>
      ${classTools.length ? `<div><strong>Class tools</strong><span>${classTools.map(humanize).join(", ")}</span></div>` : ""}
      ${bonusLanguages.length ? `<div><strong>Class languages</strong><span>${bonusLanguages.map(humanize).join(", ")}</span></div>` : ""}
      ${payload.class.divineOrderId ? `<div><strong>Divine Order</strong><span>${humanize(payload.class.divineOrderId)}</span></div>` : ""}
      ${payload.class.primalOrderId ? `<div><strong>Primal Order</strong><span>${humanize(payload.class.primalOrderId)}</span></div>` : ""}
      ${invocations.map((invocation) => `<div><strong>Eldritch Invocation</strong><span>${humanize(invocation.invocationId)}</span></div>${invocation.pactTomeCantripIds?.length ? `<div><strong>Book of Shadows cantrips</strong><span>${invocation.pactTomeCantripIds.map(humanize).join(", ")}</span></div>` : ""}${invocation.pactTomeRitualSpellIds?.length ? `<div><strong>Book of Shadows rituals</strong><span>${invocation.pactTomeRitualSpellIds.map(humanize).join(", ")}</span></div>` : ""}`).join("")}
      ${(payload.class.weaponProficiencyIds ?? []).length ? `<div><strong>Weapon training</strong><span>${payload.class.weaponProficiencyIds!.map(humanize).join(", ")}</span></div>` : ""}
      ${(payload.class.armorTrainingIds ?? []).length ? `<div><strong>Armor training</strong><span>${payload.class.armorTrainingIds!.map(humanize).join(", ")}</span></div>` : ""}
      ${payload.class.thaumaturgeKnowledgeBonus !== undefined ? `<div><strong>Thaumaturge knowledge bonus</strong><span>${signed(payload.class.thaumaturgeKnowledgeBonus)}</span></div>` : ""}
      ${payload.class.druidicKnowledgeBonus !== undefined ? `<div><strong>Druidic knowledge bonus</strong><span>${signed(payload.class.druidicKnowledgeBonus)}</span></div>` : ""}
      ${classResourceDetails(payload)}
      ${classCasting.map((casting) => `${casting.castingMode === "pact-magic" ? `<div><strong>Spellcasting</strong><span>Pact Magic</span></div>` : ""}<div><strong>${humanize(casting.sourceClassId)} cantrips</strong><span>${casting.cantripIds.length ? casting.cantripIds.map(humanize).join(", ") : "None"}</span></div>${casting.spellbookSpellIds?.length ? `<div><strong>Spellbook</strong><span>${casting.spellbookSpellIds.map(humanize).join(", ")}</span></div>` : ""}<div><strong>${humanize(casting.sourceClassId)} prepared spells</strong><span>${casting.preparedSpellIds.map(humanize).join(", ")}</span></div>${casting.alwaysPreparedSpellIds.length ? `<div><strong>${humanize(casting.sourceClassId)} always prepared</strong><span>${casting.alwaysPreparedSpellIds.map(humanize).join(", ")}</span></div>` : ""}<div><strong>Spell slots</strong><span>${casting.spellSlots.map((slot) => `Level ${slot.level}: ${slot.current} / ${slot.maximum} · ${humanize(slot.recharge)}`).join(", ")}</span></div>`).join("")}
      ${spellGrants.map((grant) => `<div><strong>${humanize(grant.sourceId)} cantrips</strong><span>${grant.cantripIds.map(humanize).join(", ")}</span></div><div><strong>${humanize(grant.sourceId)} spell</strong><span>${grant.preparedSpellIds.map(humanize).join(", ")} · ${grant.freeCastCurrent}/${grant.freeCastMaximum} free cast</span></div>`).join("")}
      <div><strong>Background equipment</strong><span>${payload.origin.backgroundEquipmentChoice === "A" ? "Equipment package" : "50 GP"}</span></div>
      <div><strong>Class equipment</strong><span>${humanize(payload.class.classEquipmentChoice)}</span></div>
      ${payload.class.fightingStyleFeatId ? `<div><strong>Fighting style</strong><span>${humanize(payload.class.fightingStyleFeatId)}</span></div>` : ""}
      ${payload.class.weaponMasteryIds.length ? `<div><strong>Weapon mastery</strong><span>${payload.class.weaponMasteryIds.map(humanize).join(", ")}</span></div>` : ""}
      <div><strong>Equipment</strong><span>${payload.equipment.length ? payload.equipment.map((item) => `${item.quantity} × ${humanize(item.itemId)}`).join(", ") : "Purchased from starting gold"}</span></div>
      <div><strong>Currency</strong><span>${payload.currencyGp} GP</span></div>
      ${seed ? `<div><strong>Generation seed</strong><code>${escapeHtml(seed)}</code></div>` : ""}
    </div>
    <details class="document-inspector"><summary>Inspect native character document</summary><pre>${escapeHtml(JSON.stringify(character, null, 2))}</pre></details>`;
}

function renderBrpCharacter(character: CharacterDocument, nativeState: NativeSystemState): void {
  const validation = brpUge105Adapter.validateNativeState(nativeState);
  if (!validation.valid) { renderCharacterFailure(character, validation.issues.map((issue) => issue.message).join(" ") || "BRP native state validation failed."); return; }
  const payload = nativeState.payload as BrpNativeCharacter;
  const profession = payload.identity.profession;
  const rolled = payload.characteristicGenerationState.method === "standard-rolled" ? payload.characteristicGenerationState : null;
  const ageBasis = payload.identity.ageBasis;

  resultElement.classList.remove("empty-result");
  resultElement.innerHTML = `
    <div class="result-heading"><div><p class="eyebrow">Character details</p><h2>${escapeHtml(character.displayName)}</h2><p>Human · ${humanize(profession.professionId)} · BRP UGE</p></div><span class="validation-pill valid">Native state valid</span></div>
    <div class="ability-grid brp-review-characteristics">${BRP_CHARACTERISTIC_IDS.map((id) => brpCharacteristicCard(id, payload.characteristics[id].final)).join("")}</div>
    <div class="stat-grid">${statCard("HP", String(payload.derived.hitPoints))}${statCard("Major Wound", String(payload.derived.majorWoundLevel))}${statCard("Power Points", String(payload.derived.powerPoints))}${statCard("Move", String(payload.derived.move))}</div>
    <div class="result-details">
      <div><strong>Power level</strong><span>${humanize(payload.rulesProfile.powerLevel)}</span></div>
      <div><strong>Characteristic method</strong><span>${humanize(payload.rulesProfile.characteristicGeneration)}</span></div>
      <div><strong>Age / gender</strong><span>${payload.identity.age} / ${escapeHtml(payload.identity.gender)}</span></div>
      <div><strong>Wealth</strong><span>${humanize(profession.wealth)}</span></div>
      <div><strong>Damage modifier</strong><span>${escapeHtml(payload.derived.damageModifier)}</span></div>
      <div><strong>Experience bonus</strong><span>${payload.derived.experienceBonus}</span></div>
      <div><strong>Professional budget</strong><span>${payload.skillBudgets.professional.spent} / ${payload.skillBudgets.professional.total}</span></div>
      <div><strong>Personal budget</strong><span>${payload.skillBudgets.personal.spent} / ${payload.skillBudgets.personal.total}</span></div>
      ${ageBasis ? `<div><strong>Age causality</strong><span>Default ${ageBasis.defaultStartingAge}; +${ageBasis.addedYears} years; +${ageBasis.professionalSkillPointAdjustment} professional points</span></div>` : ""}
      ${profession.professionId === "detective" ? `<div><strong>Detective electives</strong><span>${profession.selectedElectiveSkillIds.map(humanize).join(", ")}</span></div>` : ""}
      ${profession.professionId === "scholar" ? `<div><strong>Own language</strong><span>${escapeHtml(profession.ownLanguage.label)} <code>${escapeHtml(profession.ownLanguage.id)}</code></span></div><div><strong>Other language</strong><span>${escapeHtml(profession.otherLanguage.label)} <code>${escapeHtml(profession.otherLanguage.id)}</code></span></div><div><strong>Academic specialties</strong><span>${profession.selectedAcademicSkills.map((entry) => `${humanize(entry.skillId)} (${escapeHtml(entry.specialty.label)})`).join(", ")}</span></div>` : ""}
      ${rolled ? `<div><strong>Generation seed</strong><code>${escapeHtml(rolled.seed)}</code></div><div><strong>Redistribution</strong><span>${rolled.redistribution.length ? rolled.redistribution.map((entry) => `${entry.points} ${entry.from} to ${entry.to}`).join(", ") : "None"}</span></div>` : ""}
      <div><strong>Rules source</strong><code>${payload.rulesSourceIds.map(escapeHtml).join(", ")}</code></div>
    </div>
    <div class="brp-review-skills">
      <h3>Skills</h3>
      <div class="brp-review-skill-labels"><span>Skill</span><span>Base</span><span>Prof.</span><span>Personal</span><span>Final</span></div>
      ${payload.skills.map((skill) => `<div class="brp-review-skill-row"><span>${escapeHtml(skill.label)}${skill.specialty ? ` <small>${escapeHtml(skill.specialty.id)}</small>` : ""}</span><span>${skill.baseChance}</span><span>${skill.contributions.professional}</span><span>${skill.contributions.personal}</span><strong>${skill.finalRating}</strong></div>`).join("")}
    </div>
    ${rolled ? `<details class="document-inspector"><summary>Inspect retained characteristic rolls</summary><pre>${escapeHtml(JSON.stringify(rolled, null, 2))}</pre></details>` : ""}
    <details class="document-inspector"><summary>Inspect native character document</summary><pre>${escapeHtml(JSON.stringify(character, null, 2))}</pre></details>`;
  appendBrpEquipmentReview(resultElement, payload);
}

function classResourceDetails(payload: Dnd5eNativeCharacter): string {
  const r = payload.resources;
  const details: string[] = [];
  if (r.bardicInspirationMaximum !== undefined) details.push(resourceRow("Bardic Inspiration", `${r.bardicInspirationCurrent}/${r.bardicInspirationMaximum} · d${r.bardicInspirationDie}`));
  if (r.layOnHandsMaximum !== undefined) details.push(resourceRow("Lay on Hands", `${r.layOnHandsCurrent}/${r.layOnHandsMaximum} HP pool`));
  if (r.favoredEnemyMaximum !== undefined) details.push(resourceRow("Favored Enemy", `${r.favoredEnemyCurrent}/${r.favoredEnemyMaximum} free Hunter's Mark casts`));
  if (r.innateSorceryMaximum !== undefined) details.push(resourceRow("Innate Sorcery", `${r.innateSorceryCurrent}/${r.innateSorceryMaximum}`));
  if (r.arcaneRecoveryMaximum !== undefined) details.push(resourceRow("Arcane Recovery", `${r.arcaneRecoveryCurrent}/${r.arcaneRecoveryMaximum} · ${r.arcaneRecoverySpellLevelBudget} spell level`));
  return details.join("");
}
function resourceRow(label: string, value: string): string { return `<div><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value)}</span></div>`; }

function renderCharacterFailure(character: CharacterDocument, message: string): void {
  resultElement.classList.remove("empty-result");
  resultElement.innerHTML = `<div class="result-heading"><div><p class="eyebrow">Character details</p><h2>${escapeHtml(character.displayName)}</h2></div><span class="validation-pill invalid">Validation failed</span></div><p>${escapeHtml(message)}</p><details class="document-inspector"><summary>Inspect retained character document</summary><pre>${escapeHtml(JSON.stringify(character, null, 2))}</pre></details>`;
}
function postCharacterToHost(character: CharacterDocument): void { if (window.parent !== window) window.parent.postMessage({ type: CHARACTER_GENERATED_MESSAGE, payload: { projectId, character } }, hostOrigin ?? "*"); }
function abilityCard(label: string, score: number): string { const modifier = Math.floor((score - 10) / 2); return `<div class="ability-card"><span>${label}</span><strong>${score}</strong><small>${signed(modifier)}</small></div>`; }
function brpCharacteristicCard(label: string, score: number): string { return `<div class="ability-card"><span>${label}</span><strong>${score}</strong></div>`; }
function statCard(label: string, value: string): string { return `<div class="stat-card"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`; }
function signed(value: number): string { return value >= 0 ? `+${value}` : String(value); }
function humanize(value: string): string { return value.split(":").at(-1)!.split("-").map((part) => part ? part[0]!.toUpperCase() + part.slice(1) : part).join(" "); }
function escapeHtml(value: string): string { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }