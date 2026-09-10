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

Date: 2026-09-10
Status: active product line

Parent direction: `refs/planning/brp-to-universal-grammar-path.md`
Output architecture: `refs/architecture/adaptive-character-sheet-framework.md`

## Goal

Turn the existing BRP UGE architecture proof into a narrow but credible player-facing character generator without trying to implement every BRP option.

## Bounded usability approach

Compare the authoritative BRP ORC 1.05 character-creation flow with the current creator and classify each relevant capability as:

- **supported** - already adequate for a player-usable core;
- **missing for v0.1** - required to make the generic BRP creator credible/table-usable;
- **deferred** - useful breadth but not a v0.1 blocker.

The maintained audit is `refs/planning/brp-player-usability-gap-audit.md`. It should answer concrete implementation questions, not create a giant catalog backlog.

## Product acceptance criteria

A player unfamiliar with the repository should be able to:

1. select a coherent generic BRP rules profile;
2. make meaningful profession/skill/identity choices from a credible, not proof-sized, set;
3. complete legal characteristic and skill allocation without hand-calculating hidden budgets;
4. finish equipment/character details needed for table use within the supported slice;
5. review important characteristics, derived state, skills, equipment, and profile choices in a readable character view;
6. save and reopen without loss; and
7. export/print a usable character projection without making the export format canonical state.

## Completed product slices

The BRP Player-Usable Core now has:

1. broader ordinary skill support and correct professional/personal allocation causality;
2. Detective, Scholar, Athlete, Beggar, and BRP-native Custom Profession coverage;
3. bounded source-audited equipment, armor, and modern pistol support with table-use projection;
4. optional identity/background finishing details retained in native state; and
5. allocation UX that exposes budget progress, professional eligibility, legal ceilings, cap headroom/overage, and blocking corrections without moving BRP rules into UI code.

## Remaining implementation priorities

1. **Adaptive character-sheet framework, proven first with BRP.** Build a shared renderer and a BRP-owned sheet projection rather than a BRP-only print template or universal character rules model. The BRP acceptance target remains a practical two-page play-oriented print/export result.
2. **Campaign/rules-profile selection seam.** Add only the named profile/configuration boundary needed by the later Investigative Horror phase.
3. **Representative owner/browser QA and closeout.** Confirm create, finish, review, save, reopen, print/export, and profile behavior in the actual web experience before closing Issue #14.

Further profession/skill/catalog breadth is evidence-driven and should not displace these remaining product gaps.

## Adaptive sheet boundary

The accepted output path is:

```text
authoritative native state
    -> system-owned sheet projection
    -> shared character-sheet renderer
    -> screen / browser print / PDF-via-print
```

The shared renderer may own page geometry, typography, section/table primitives, overflow, print CSS, accessibility, and other presentation mechanics. BRP owns labels, rules meaning, grouping, ordering, and which data appears.

Broad presentation-role hints are permitted for layout but are not Universal Grammar. Do not infer a universal RPG ontology from `identity`, `primary_stats`, `resources`, `actions`, `equipment`, `abilities`, `conditions`, `narrative`, `notes`, or `provenance` rendering roles.

BRP should prove only the descriptor capabilities it actually needs. D&D can later validate whether BRP-specific assumptions leaked into the shared renderer. Fate remains the stronger architecture stress test before Universal Grammar v0.1 is frozen.

## BRP sheet acceptance target

The first adaptive-sheet proof should produce a readable default two-page BRP result:

- **Page 1 - at-the-table play:** identity/profession, characteristics and derived values, high-frequency resources/state, final skills, weapons and armor, concise profile identity.
- **Page 2 - depth/logistics:** equipment and wealth, appearance/finishing details, reputation/background/beliefs/personal item, useful source/profile context, and only player-relevant provenance.

Empty optional sections should collapse rather than reserve permanent blank space. Browser print should remove creator/debug/navigation chrome. Existing CharacterDocument JSON copy/download should be reused where suitable.

Do not make a deterministic PDF library, universal layout optimizer, D&D retrofit, Fate sheet, or four-mode sheet system part of this initial acceptance target.

## Not required for this epic

- complete Superpowers/Psychic catalogs;
- Magic, Mutations, Sorcery;
- every BRP optional subsystem;
- every source profession;
- non-human breadth;
- setting-owned generated names;
- CoC-branded or CoC-only content;
- D&D adaptive-sheet retrofit;
- Fate implementation;
- Universal Grammar v0.1;
- deterministic server-side PDF generation unless concrete product evidence requires it.

## Architecture guardrails

- Native system state is mandatory and lossless.
- Preserve `brp-character/0.1` unless product evidence proves it insufficient.
- Keep the current adapter stack and contribution causality unless a concrete gap requires change.
- Profession is not class.
- Open specialties/languages remain open/source-owned.
- Campaign profiles select source-native configuration; they do not become a generic universal rules ontology.
- Native state remains canonical; UI/review/sheet/export are projections.
- Shared creator and sheet code coordinate interaction/presentation but do not own BRP rules.
- The sheet presentation vocabulary is not Universal Grammar.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Completion gate

This epic is complete when representative owner browser QA can create, finish, save, reopen, and export/print a generic BRP character that feels like a usable product rather than an architecture demonstration, using the adaptive sheet framework without compromising native-system ownership.
