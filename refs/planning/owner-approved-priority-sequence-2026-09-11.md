---
type: "Planning Sequence"
title: "Owner-Approved Priority Sequence - 2026-09-11"
tags:
- character-forge
- roadmap
- prioritization
- productization
- engineering-health
- naming
- vtt
- foundry
- universal-grammar
---
# Owner-Approved Priority Sequence - 2026-09-11

Status: **owner-approved direction**

This document establishes the preferred staging order for the next major Character Forge work. It is intentionally more opinionated than `refs/planning/roadmap.yaml`: the roadmap remains the broader capability/history inventory, while this file governs near-to-mid-term sequencing unless later owner evidence changes the order.

## Stage 0 - Close Current Player-Usable Acceptance

Goal: stop carrying known correctness/usability defects into broader product work.

Include:

- fix the real-browser D&D physical pagination defect so representative low-complexity characters do not unnecessarily split;
- perform the equivalent BRP sheet sanity check;
- complete the BRP/D&D primary-UI minimalism sweep;
- define safe system-switch behavior so changing rules systems never leaves a generated character presented under the wrong system;
- until real translation exists, prefer explicit clear/separate behavior over fake translation;
- complete BRP Issue #14 through `create -> finish -> review -> save -> reopen -> print/export`.

Do not pull branding, Foundry, durable media, Universal Grammar, or major new content into this acceptance slice unless a concrete acceptance defect requires it.

## Stage 1 - Engineering Health And Refactoring

Goal: consolidate before adding another architecture layer.

Use `refs/planning/engineering-health-cleanup.md` as the detailed audit/remediation contract.

Focus on:

- stale or obsolete tests;
- redundant/low-value tests;
- brittle implementation-detail assertions;
- missing regression coverage around important behavior;
- dead/transitional scaffolding;
- largest-file inventory;
- responsibility-boundary review;
- orchestration/controller monolith detection;
- refactoring by coherent responsibility rather than arbitrary line count.

This is a bounded cleanup/refactor pass, not a rewrite. Preserve high-value native-state, replay, adapter, and regression guarantees.

## Stage 2 - Productization And Branding

Goal: make Character Forge and its Parchment-hosted experience credible for external demos/shopping.

Include:

- use the shared branding assets in `Three-Wheeled-Sloth-Studio/TWS-Design-Principles/Branding/`;
- establish consistent Character Forge shell/product branding;
- move the Character Forge version pill to the user-facing `version:build:revision` pattern used by World Forge;
- add corresponding parent-level Parchment Worlds build/version identity;
- finish obvious icon/affordance/visual-consistency cleanup;
- continue eliminating redundant project/campaign questions already answered upstream.

### Character-sheet branding rule

Primary branding on the play artifact belongs to the user's Project/Campaign.

A very small, unobtrusive Three-Wheeled Sloth or Character Forge studio mark/wordmark is acceptable on the sheet when it fits naturally and does not compete with character data, campaign identity, or at-table scanning. Treat this as a maker's mark, not the dominant badge.

Campaign/project identity remains visually primary.

## Stage 3 - Name Generator And Random Tables

Goal: create reusable generation companions with broad leverage across systems and future worldbuilding.

### Name generator

Do not evolve the current placeholder corpus into a larger word-list mashup.

The intended generator should provide a distinctly flavored but very large generation space. Build around a probabilistic / Markov-style generation step or comparable sequence model that learns or applies phonotactic patterns rather than merely concatenating fixed fragments.

Architecture should separate:

- generation mechanism;
- training/reference corpora or pattern data;
- naming context;
- culture/language inputs;
- post-generation constraints/validation;
- deterministic seed/provenance.

Context may eventually include:

- genre;
- campaign/setting;
- culture/region;
- species/race/ancestry;
- profession/class/archetype where justified;
- other character characteristics that materially affect naming conventions.

Design this from the start with the expectation that future **language generators** and **culture generators** will inform name generation. Those future systems may provide phonology, phonotactics, morphology, syllable structure, orthography, naming customs, honorifics, family-name rules, social-class patterns, regional variation, and similar constraints.

Species must not be treated as synonymous with culture or language.

### Random tables

Use BRP free-text flavor fields as an early proving ground for the system-neutral random-table companion: build/size, appearance, mannerisms, reputation, background, distinctive details where applicable, and similar optional inspiration surfaces.

Suggestions remain editable/overridable and feed ordinary generation decisions rather than bypassing native state.

## Stage 4 - Durable Portrait And Token Assets

Goal: move beyond session-only media and establish the asset workflow needed for VTT interoperability.

Implement a Parchment-owned character asset relationship rather than putting media/VTT metadata into native RPG state.

Preferred UX direction:

- empty portrait region itself is clickable to add;
- populated portrait supports natural replace/update/remove interaction;
- optional right-click context actions may supplement, not replace, discoverable interaction;
- token generation should minimize friction while always permitting manual import/override/edit.

Current preferred token-product hypothesis:

`portrait -> generated token suggestion -> quick crop/frame editor -> accept`

with equally obvious paths to import/replace an existing VTT token.

Once a user explicitly supplies a token, that token remains authoritative until the user asks to regenerate it.

## Stage 5 - Foundry Export / Import Validation

Goal: prove useful interoperability before tackling live synchronization.

Sequence:

1. add a bounded Foundry adapter;
2. map authoritative Character Forge state into supported Foundry Actor/embedded Item import data;
3. pin supported Foundry and game-system versions;
4. validate deterministic fixtures;
5. produce a downloadable import artifact;
6. test it in a real Foundry instance.

### Foundry license purchase trigger

Purchase a Foundry license when the exporter/import artifact is mature enough that real Foundry runtime import validation becomes the next blocker, or earlier only if schema/API discovery cannot be completed reliably without the licensed runtime.

Do not purchase merely because Foundry is on the roadmap.

## Stage 6 - Universal Grammar v0.1

Goal: turn concrete D&D + BRP evidence into an executable semantic/translation layer without pretending to have solved a universal RPG ontology.

Prioritize evidence-backed concepts such as:

- identity;
- characteristics/abilities;
- skills/competencies;
- class/profession/archetype distinctions;
- resources;
- equipment;
- languages;
- traits/features;
- descriptive/narrative fields;
- provenance;
- translation confidence/loss.

Mappings must be able to state `exact`, `approximate`, `lossy`, or `unmapped` rather than forcing false equivalence.

Native system state remains canonical and lossless.

Once a real translation path exists, system-switch UX may offer Translate; until then it must not imply translation capability.

## Stage 7 - Third-System Stress Test

Goal: deliberately attack Universal Grammar assumptions with a structurally different system before freezing shared semantics.

Fate remains a strong candidate because it challenges D&D/BRP-shaped assumptions around attributes, skills, equipment, damage, and character structure.

Preferred loop:

`D&D + BRP evidence -> UG v0.1 -> third system attacks UG -> revise UG`

Do not wait to build any UG until after the third system; give the stress test something concrete to break.

## Stage 8 - Proprietary RPG System

Goal: begin serious Character Forge implementation of the studio RPG after the first Universal Grammar / third-system feedback cycle.

Preserve existing direction:

- 2d10/2d12 normal resolution space;
- wounds rather than generic HP;
- psychic / techno-magic / dark-horror / cyber-steam-punk support;
- not merely a reskinned D&D/BRP hybrid.

Use shared infrastructure where appropriate - names, random tables, media/assets, project context - while keeping the proprietary system natively opinionated.

Design work may begin earlier, but major Character Forge implementation should benefit from the hardened shared architecture first.

## Stage 9 - Rich VTT Push / Update / Synchronization

Goal: build deeper interoperability only after one-way mapping and ownership boundaries are proven.

Progress from:

- downloadable export/import;
- one-click push/update;
- later bidirectional synchronization.

Round-trip sync requires explicit ownership/conflict rules for mutable state such as HP/resources, inventory, spells, notes, and media. Do not treat this as merely another export format.

## Investigative Horror Placement

Investigative Horror remains useful, but should not automatically displace the sequence above.

A small BRP Investigative Horror increment can fit opportunistically around Stages 3-4, especially where it can consume the new random-table/profile infrastructure and provide additional BRP evidence. Avoid turning it into a large detour before engineering health, productization, and reusable companion capabilities are in place.

## Cross-Stage Product Rules

- Nothing belongs in the primary creator UI unless it provides immediate player or GM value for the current task.
- Native system state is mandatory and lossless.
- Universal Grammar is derived semantic/translation state, not canonical character state.
- Shared presentation infrastructure must not force different systems into one generic play layout.
- Project/campaign context is authoritative where supplied; do not ask again without a real per-character override case.
- Campaign/project identity owns the primary character-sheet branding zone.
- A tiny subordinate studio mark is allowed when it does not compete with play or campaign information.
- Portrait/token/VTT metadata belongs to Parchment-owned asset relationships, not RPG native state.
- Foundry schemas remain adapter targets.
- Cleanup/refactoring is evidence-driven maintenance, not license for a broad rewrite.

## Branch / Validation Boundary

Work directly on `dev` until the owner explicitly requests promotion.

Preserve exact-SHA `dev -> qa -> main` promotion and exact-head validation for milestones.
