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
Status: implementation complete, browser acceptance pending

Parent direction: `refs/planning/brp-to-universal-grammar-path.md`
Output architecture: `refs/architecture/adaptive-character-sheet-framework.md`

## Goal

Turn the existing BRP UGE architecture proof into a narrow but credible player-facing character generator without trying to implement every BRP option.

## Product acceptance criteria

A player unfamiliar with the repository should be able to:

1. select a coherent generic BRP rules profile;
2. make meaningful profession/skill/identity choices from a credible set;
3. complete legal characteristic and skill allocation without hand-calculating hidden budgets;
4. finish equipment/character details needed for table use within the supported slice;
5. review important characteristics, derived state, skills, equipment, and profile choices in a readable character view;
6. save and reopen without loss; and
7. export/print a usable character projection without making the export format canonical state.

## Completed product slices

The bounded implementation now includes:

1. broader ordinary skill support and correct professional/personal allocation causality;
2. Detective, Scholar, Athlete, Beggar, and BRP-native Custom Profession coverage;
3. bounded source-audited equipment, armor, and modern pistol support with table-use projection;
4. optional identity/background finishing details retained in native state;
5. allocation UX that exposes budget progress, profession eligibility, legal ceilings, cap headroom/overage, and blocking corrections;
6. adaptive two-page BRP sheet projection through a shared presentation-only renderer, browser-native Print / Save as PDF, and full CharacterDocument JSON copy/download; and
7. a BRP-owned versioned campaign/rules-profile selection seam.

The current profile seam has one active profile:

- `generic` / `Generic BRP Core` / version `0.1`.

The profile maps deterministically to current defaults but remains separate from the effective `BrpRulesProfile`. Reopened characters use the exact native effective rules state rather than reapplying the current profile definition. Explicit profile selection is the operation that reapplies current defaults.

Current green implementation checkpoint:

- SHA: `fabbc6567ffa8a9d4d24af9a940baa17a86a1b03`
- Actions: `34527156423`
- Job: `103038733378`
- 53 test files / 263 tests / 0 failures
- 208 tracked paths
- build: `Character Forge build 0.0.1 fabbc656`

## Remaining Priority - Representative Browser QA And Closeout

No additional planned implementation capability is missing for the bounded generic v0.1 target. The remaining gate is real-browser product acceptance.

Exercise the complete flow:

```text
create -> finish -> review -> save -> reopen -> print/export
```

Use multiple professions and deliberately include long skills/specialties, populated equipment, weapon/armor detail, finishing/background text, and both ordinary and less-common creator paths. Confirm profile context survives reopen without replacing native rule authority.

Print acceptance must be checked in an actual browser for pagination, clipping, page count, density, grayscale/readability, and removal of creator/application/debug chrome.

If QA exposes defects, fix the smallest evidence-backed issue and add structural regression coverage where practical. Further profession/skill/catalog breadth remains evidence-driven and should not displace closeout.

## Adaptive Sheet Boundary

The implemented output path remains:

```text
authoritative native state
    -> system-owned sheet projection
    -> shared character-sheet renderer
    -> screen / browser print / PDF-via-print
```

The shared renderer owns presentation mechanics. BRP owns labels, rules meaning, grouping, ordering, page assignment, conditional content, and source interpretation. Presentation roles are not Universal Grammar.

## Campaign / Rules-Profile Boundary

The implemented profile seam preserves:

- stable versioned profile identity distinct from effective BRP rules configuration;
- BRP-owned profile catalog and mapping;
- versioned profile provenance in generation context;
- exact effective `BrpRulesProfile` retained in authoritative native state;
- no catalog re-resolution during reopen;
- explicit rather than silent application of current profile defaults; and
- a future insertion point for `investigative-horror` without containing that profile's substantive rules yet.

Do not generalize this into a universal campaign/profile ontology from one system's evidence.

## Not Required For This Epic

- complete Superpowers/Psychic catalogs;
- Magic, Mutations, Sorcery;
- every BRP optional subsystem;
- every source profession;
- non-human breadth;
- setting-owned generated names;
- CoC-branded or CoC-only content;
- Investigative Horror substantive content before this epic closes;
- D&D adaptive-sheet retrofit;
- Fate implementation;
- Universal Grammar v0.1;
- deterministic server-side PDF generation unless browser evidence proves it necessary.

## Architecture Guardrails

- Native system state is mandatory and lossless.
- Preserve `brp-character/0.1` unless product evidence proves it insufficient.
- Preserve canonical adapter identity `0.7.0` unless concrete evidence proves it insufficient.
- Profession is not class.
- Campaign profile is provenance/configuration context, not canonical rule authority.
- Open specialties/languages remain source-owned.
- Native state remains canonical; UI/review/sheet/export/profile controls are projections or interaction layers.
- Shared creator and sheet code do not own BRP rules.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Completion Gate

Close Issue #14 only when representative owner/browser QA demonstrates that a user can create, finish, save, reopen, and export/print a generic BRP character as a usable product, with the adaptive sheet and profile seam behaving correctly in the actual browser experience.
