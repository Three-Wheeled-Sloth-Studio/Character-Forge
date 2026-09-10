---
type: "Implementation Plan"
title: "BRP Player-Usable Core"
tags:
- character-forge
- brp
- product-breadth
- creator
---
# BRP Player-Usable Core

Date: 2026-09-09
Status: next active product line

Parent direction: `refs/planning/brp-to-universal-grammar-path.md`

## Goal

Turn the existing BRP UGE architecture proof into a narrow but credible player-facing character generator without trying to implement every BRP option.

## First work package — bounded usability gap audit

Compare the authoritative BRP ORC 1.05 character-creation flow with the current creator and classify each relevant capability as:

- **supported** — already adequate for a player-usable core;
- **missing for v0.1** — required to make the generic BRP creator credible/table-usable;
- **deferred** — useful breadth but not a v0.1 blocker.

The audit should answer concrete implementation questions, not create a giant catalog backlog.

At minimum inspect:

- profession breadth and profession customization rules;
- ordinary skill breadth and specialties;
- characteristics/derived values already supported;
- age and wealth boundaries;
- equipment, weapons, and armor needed to finish a usable character;
- identity/background/finishing details from the BRP source;
- final review/output needs;
- existing save/reopen and generation provenance;
- which optional rules need a campaign-profile seam now versus later.

## Product acceptance criteria

A player unfamiliar with the repository should be able to:

1. select a coherent generic BRP rules profile;
2. make meaningful profession/skill/identity choices from a credible—not proof-sized—set;
3. complete legal characteristic and skill allocation without hand-calculating hidden budgets;
4. finish equipment/character details needed for table use within the supported slice;
5. review important characteristics, derived state, skills, equipment, and profile choices in a readable character view;
6. save and reopen without loss;
7. export/print a usable character projection without making the export format canonical state.

## Implementation priorities after the audit

Prefer the smallest vertical slices that close the largest player-facing gaps:

1. profession + skill breadth;
2. finish-the-character/equipment breadth;
3. allocation UX and validation clarity;
4. final review and print/export;
5. coherent campaign/rules profile seam required for the next Investigative Horror phase.

The exact slice order may change based on the audit, but avoid abstraction-first detours.

## Not required for this epic

- complete Superpowers/Psychic catalogs;
- Magic, Mutations, Sorcery;
- every BRP optional subsystem;
- every source profession;
- non-human breadth;
- setting-owned generated names;
- CoC-branded or CoC-only content;
- Fate support;
- Universal Grammar v0.1.

## Architecture guardrails

- Preserve `brp-character/0.1` unless product evidence proves it insufficient.
- Keep the current adapter stack and contribution causality unless a concrete gap requires change.
- Profession is not class.
- Open specialties/languages remain open/source-owned.
- Campaign profiles select source-native configuration; they do not become a generic universal rules ontology.
- Native state remains canonical; UI/review/export are projections.
- Shared creator code coordinates interaction but does not own BRP rules.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Completion gate

This epic is complete when representative owner browser QA can create, finish, save, reopen, and export/print a generic BRP character that feels like a usable product rather than an architecture demonstration.
