---
type: "Product And Architecture Plan"
title: "BRP To Universal Grammar Path"
tags:
- character-forge
- brp
- fate
- universal-grammar
- licensing
- roadmap
---
# BRP To Universal Grammar Path

Date: 2026-09-09
Status: accepted direction

## Decision

Character Forge will proceed in this order:

1. make the existing BRP UGE implementation a player-usable core character generator;
2. add a BRP-native **Investigative Horror** profile that deliberately approaches the useful character-generation territory associated with investigative cosmic-horror play while remaining inside the BRP ORC and independently sourced content boundaries;
3. implement a deliberately small **Fate Condensed** third-system architecture probe;
4. use D&D 5E + BRP UGE + Fate evidence to formalize **Universal Grammar v0.1**.

This sequence is product-led. Do not add another system or BRP subsystem merely to accumulate architecture examples.

## Governing Architecture Rule

Native system state remains canonical and lossless.

Universal Grammar is a portable semantic/translation layer, not a replacement storage model and not a lowest-common-denominator character schema.

A concept may enter Universal Grammar only when repeated implementation evidence justifies its meaning and translation behavior. System-specific concepts remain native, and translations must be able to declare loss, approximation, omission, or contextual dependence.

Start/continue the cross-system evidence ledger before Fate, but do **not** freeze Universal Grammar v0.1 until the Fate probe has challenged D&D- and BRP-shaped assumptions.

---

# Phase A — BRP Player-Usable Core

## Goal

Move BRP from an architecture-complete stress-test implementation to a character generator a BRP player could reasonably choose to use for an actual game.

The current implementation already proves the difficult structural pieces: BRP-native character state, explicit/rolled characteristics, Normal/Heroic skill construction, Detective/Scholar professions, open specialties/languages, contribution-layer causality, creator reopen, random-table consumers, and bounded Superpowers/Psychic power-system grammars.

The remaining gap is primarily product breadth, completion flow, and presentation.

## Product principle

BRP is a toolkit rather than one fixed campaign configuration. Do not expose every optional subsystem as an undifferentiated wall of switches.

Prefer **campaign/rules profiles** that choose coherent defaults, with a later Custom profile for advanced users.

## v0.1 player-usable acceptance target

A player should be able to enter the BRP creator with no repository knowledge and produce, review, save, reopen, and export a legally valid, table-usable character without encountering obvious stress-test placeholders.

The first useful target does **not** require every BRP optional rule or power system.

### Character breadth

Expand beyond Detective and Scholar enough that the profession selection feels like a product rather than a proof. Prioritize source-safe generic professions that exercise already-supported skill grammars before inventing new architecture.

Strongly consider a custom-profession path after the source profession audit if BRP permits it cleanly; a toolkit system gains disproportionate value from user-defined campaign professions.

Expand the ordinary skill/specialty surface to the useful BRP Core set required by the selected professions. Preserve open-ended specialty and language identity rather than converting them into closed global enumerations.

### Finish-the-character flow

Add the remaining information a player expects to leave the creator with a usable sheet, prioritizing:

- identity/details appropriate to generic BRP;
- possessions/equipment;
- weapons and armor presentation where supported by the selected source slice;
- distinctive/background notes or equivalent source-supported finishing details;
- clearer professional/personal point-allocation UX;
- final review that exposes important derived values and retained choices without requiring native-JSON inspection;
- printable/exportable output appropriate to a table character sheet.

Do not let print/export create a second canonical character model. It is a projection of the CharacterDocument/native state.

### Rules profiles

Introduce a profile seam before proliferating BRP switches. Initial candidates may include:

- Core Adventure;
- Heroic;
- Investigative Horror (Phase B).

Exact contents must be source-audited before implementation. Profiles select coherent rules/configuration; they do not erase the underlying source-native settings retained in the character.

### Explicit non-prerequisites for v0.1

Do not block player-usable BRP Core on:

- complete Superpowers catalog;
- complete Psychic Ability catalog;
- Magic, Mutations, or Sorcery;
- Epic/Superhuman power-system breadth;
- every optional BRP subsystem;
- non-human rules;
- every published profession;
- setting-owned generated-name content;
- a universal power/capability ontology.

## Immediate implementation sequence

1. Audit the authoritative BRP ORC 1.05 character-creation flow against the current creator and produce a bounded **player-usability gap matrix**: supported / missing-for-v0.1 / deferred.
2. Select the minimum profession + skill breadth that makes the generic BRP creator credible.
3. Implement one vertical slice at a time, preserving exact contribution and reopen causality.
4. Add finish-the-character review/output.
5. Run owner browser QA as a player workflow, not merely a rules-validation exercise.

Do not redesign proven BRP native architecture unless this productization work supplies concrete evidence that it is insufficient.

---

# Phase B — BRP Investigative Horror Profile

## Goal

Provide an excellent BRP-based investigative-horror character-generation experience without presenting Character Forge as a Call of Cthulhu character builder and without importing Call of Cthulhu-only protected expression/content.

## Authoritative licensing boundary

Use the current BRP Universal Game Engine ORC material and required notices as the rules authority.

Official source references:

- Chaosium ORC page: https://www.chaosium.com/orc-license/
- BRP ORC Content Document announcement/download: https://www.chaosium.com/blogdownload-the-free-basic-roleplaying-orc-content-document-sell-the-games-you-create-royaltyfree/
- Chaosium BRP Design Challenge licensing Q&A: https://www.chaosium.com/blogthe-basic-roleplaying-design-challenge/

Chaosium states that the BRP Universal Game Engine text is broadly available under ORC subject to Product Identity exclusions, and specifically distinguishes the simplified BRP Sanity rules from Call of Cthulhu-specific Sanity rules.

Before commercial release, re-check the current ORC notice and attribution requirements and obtain legal review if product naming/marketing materially approaches Chaosium trademarks.

## Product boundary

Preferred product language:

**BRP: Universal Game Engine — Investigative Horror profile**

Do not market or label it as:

- Call of Cthulhu;
- a Call of Cthulhu character creator;
- CoC-compatible unless a later license expressly permits that claim;
- an implementation of Call of Cthulhu 7th Edition.

Do not use Call of Cthulhu logos, trade dress, artwork, protected setting material, occupations copied from CoC books, Mythos entities/content derived from Chaosium publications, or CoC-only rules text.

## Mechanically useful safe territory

Source-audit and use BRP ORC material where available, including the BRP version of Sanity and other generic investigative/social/combat/wealth/age mechanics.

Create or source separately any setting/flavor content not supplied by BRP ORC. Keep that content outside `system-brp` when it is campaign/content-package owned rather than BRP-system owned.

In particular:

- generic investigative-horror profession/profile content may be BRP-owned only when supported by the BRP source;
- original Character Forge horror tables/content must have its own source/provenance identity;
- public-domain cosmic-horror material, if ever used, requires a separate work-by-work source/rights audit and must never be reconstructed from Chaosium products;
- setting/world naming remains caller/content-package owned.

## Profile acceptance target

A player should be able to build a grounded human investigator suitable for an original investigative-horror campaign, with BRP-native Sanity and coherent profile defaults, without needing any Call of Cthulhu-owned rules or setting material.

This phase should also prove that BRP campaign profiles can configure optional rules without forking the underlying character model.

---

# Phase C — Fate Condensed Third-System Probe

## Why a third system before Universal Grammar v0.1

D&D and BRP already provide strong contrast, but a grammar frozen from only those systems risks becoming the union of D&D and BRP assumptions.

Call of Cthulhu is too closely related to BRP to provide a high-information third architecture probe. Pathfinder is too closely related to D&D for the same purpose.

Fate is deliberately selected because it stresses areas the first two systems do not:

- freeform Aspects that are mechanically authoritative;
- Stunts that do not naturally collapse into feats/spells/powers/skills;
- Stress and Consequences rather than conventional hit-point/wound assumptions;
- narrative statements as first-class mechanical state;
- a much weaker dependence on conventional numeric attributes/classes/levels;
- context-sensitive character meaning.

## Source/license boundary

Use the official Fate SRD licensing route, preferring the Creative Commons attribution path unless a later source audit identifies a better reason not to.

Official references:

- Fate official licensing: https://fate-srd.com/official-licensing-fate
- Fate CC-BY instructions/attribution: https://fate-srd.com/official-licensing-fate/cc
- Fate Condensed SRD: https://fate-srd.com/fate-condensed

At implementation time, freeze exact source/version/license metadata and required attribution in the system package before importing rule content.

## Probe scope

Keep this intentionally smaller than the BRP stress test. We already know the process.

The smallest useful Fate vertical slice should prove:

- Fate-native CharacterDocument state and round trip;
- core Aspects, including High Concept and Trouble if source-supported in the selected path;
- Skills/Approaches as appropriate to Fate Condensed source choice;
- at least one Stunt;
- Stress and Consequences representation;
- Fate Points or other character resource state where appropriate;
- adapter validation;
- enough generation/creator interaction to reveal whether freeform narrative state fits existing creator assumptions.

Do not build a full Fate catalog or polished product before the architecture questions are answered.

## Questions the Fate probe must answer

- Which concepts are truly portable across D&D, BRP, and Fate?
- Which "abilities" are only superficially similar and must remain native?
- How should Universal Grammar represent mechanically authoritative freeform statements without making every string universal?
- What common damage/condition semantics exist, if any, across HP, BRP-derived state, Fate Stress, and Fate Consequences?
- Which resources are genuinely comparable, and how should incomparable resources declare translation loss?
- Does the creator workspace need a more generic interaction primitive for open narrative construction?

---

# Phase D — Universal Grammar v0.1

## Goal

Formalize a versioned cross-system semantic grammar only after D&D, BRP, and Fate have supplied concrete mappings and counterexamples.

## Inputs

Use:

- D&D 5E 2024 native implementation evidence;
- BRP UGE native implementation evidence, including open specialties/languages and two distinct power grammars;
- Fate Condensed native implementation evidence;
- `refs/architecture/translation-bridge-rpg-notes.md` and successor evidence ledgers.

## Promotion rule

A concept enters Universal Grammar only when at least one of these is true:

1. multiple systems share substantially the same semantic meaning and mapping is useful;
2. a shared envelope can honestly preserve distinct variants without hiding meaningful differences;
3. an explicit translation-loss representation makes the common concept useful without pretending exact equivalence.

Do not promote concepts merely because their UI labels look similar.

## Required grammar properties

Universal Grammar v0.1 must:

- be versioned;
- remain subordinate to authoritative native state;
- support one-to-one, one-to-many, many-to-one, approximate, omitted, and contextual mappings;
- report translation loss explicitly;
- preserve provenance for derived semantic projections;
- permit system-native opaque extensions rather than forcing premature universality;
- avoid a universal spell/power/feat/ability bucket unless Fate + BRP + D&D evidence truly supports one;
- avoid a universal HP/damage model unless evidence supports it;
- distinguish character-generation provenance from runtime character semantics.

## Relationship to Bridge RPG

Universal Grammar should inform Bridge RPG and translation/export work, not be designed around the future original system. Bridge RPG remains a downstream consumer of accumulated evidence rather than the authority that shapes D&D, BRP, or Fate models.

---

# Sequence Guardrails

- Do not resume parked D&D Guided Narrative by chronology.
- Do not promote accumulated `dev` work to `qa` or `main` without explicit exact-SHA instruction.
- Do not implement CoC-branded/protected content as a shortcut to the Investigative Horror profile.
- Do not make Fate production-complete before using it as the third-system probe.
- Do not freeze Universal Grammar before the Fate evidence is reviewed.
- Do not delay all semantic-evidence work until Fate; keep the evidence ledger current while native implementations evolve.
- Prefer product-relevant vertical slices over abstraction-only work.

# Immediate Next Line

The next active implementation line is **BRP Player-Usable Core**.

Begin with the bounded BRP character-creation/player-usability gap audit, then implement the highest-value missing slice. The audit is a means to select work, not a reason to produce a giant speculative backlog before coding.
