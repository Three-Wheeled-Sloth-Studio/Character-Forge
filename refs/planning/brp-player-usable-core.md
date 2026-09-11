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

Date: 2026-09-11
Status: implementation complete, browser acceptance pending after first QA remediation

Parent direction: `refs/planning/brp-to-universal-grammar-path.md`
Output architecture: `refs/architecture/adaptive-character-sheet-framework.md`

## Goal

Turn the existing BRP UGE architecture proof into a narrow but credible player-facing character generator without trying to implement every BRP option.

## Product acceptance criteria

A player unfamiliar with the repository should be able to:

1. select a coherent generic BRP rules profile;
2. make meaningful profession/skill/identity choices from a credible set;
3. complete legal characteristic and skill allocation without hand-calculating hidden budgets;
4. use whole-character randomization when desired and receive an obvious legal result rather than a partial hidden suggestion;
5. finish equipment/character details needed for table use within the supported slice;
6. review important characteristics, derived state, skills, equipment, and profile choices in a readable character view;
7. resize the creator/result workspace without controls escaping their owning panel;
8. save and reopen without loss; and
9. export/print a usable character projection without making the export format canonical state.

## Completed product slices

The bounded implementation now includes:

1. broader ordinary skill support and correct professional/personal allocation causality;
2. Detective, Scholar, Athlete, Beggar, and BRP-native Custom Profession coverage;
3. bounded source-audited equipment, armor, and modern pistol support with table-use projection;
4. optional identity/background finishing details retained in native state;
5. allocation UX that exposes budget progress, profession eligibility, legal ceilings, cap headroom/overage, and blocking corrections;
6. adaptive two-page BRP sheet projection through a shared presentation-only renderer, browser-native Print / Save as PDF, and full CharacterDocument JSON copy/download;
7. a BRP-owned versioned campaign/rules-profile selection seam; and
8. first-browser-QA remediation covering panel containment, a bounded resizable splitter, stronger/icon-first action affordance, and a true BRP whole-character Randomize All path.

The current profile seam has one active profile:

- `generic` / `Generic BRP Core` / version `0.1`.

The profile maps deterministically to current defaults but remains separate from the effective `BrpRulesProfile`. Reopened characters use the exact native effective rules state rather than reapplying the current profile definition. Explicit profile selection is the operation that reapplies current defaults.

The first QA-remediation implementation checkpoint is:

- SHA: `6110dc4d58a7949a0df0da0f189bbab0a033ef61`
- Actions: `34603217834`
- Job: `103275340363`
- 55 test files / 269 tests / 0 failures
- 212 tracked paths
- build: `Character Forge build 0.0.1 6110dc4d`

The related TWS Design Principles update is commit `b0af7cc5a4086b0306ab1de16bc14ad60e9600ce`, validated green by Actions `34602603904`.

## BRP Randomize All Contract

When BRP `Randomize All` is visible, it is a whole-character creation action, not a thin wrapper around isolated suggestion buttons.

It currently randomizes:

- display name;
- age;
- gender;
- supported non-custom profession;
- legal wealth for that profession;
- Detective/Athlete elective choices;
- characteristics or the roll seed, depending on the already-selected characteristic-generation method;
- Scholar academic specialties when relevant; and
- complete legal professional/personal skill allocations.

It preserves:

- campaign/rules profile and effective rules settings;
- selected characteristic-generation method;
- open/freeform language identities;
- finishing/background details; and
- native construction/validation authority.

Convenience names and open-specialty defaults used by the randomizer are Character Forge generation content. They are not additional BRP rules claims.

## Creator Workspace Acceptance Contract

The browser creator must satisfy the shared studio interaction standards and Character Forge's `refs/product/creator-workspace.md` specialization:

- action buttons are visibly more rounded than neighboring inputs/selects;
- enabled buttons read as active before hover;
- compact familiar actions default icon-first with tooltip and accessible labels;
- all creator controls remain contained by the left panel at supported widths;
- creator and result panes may be resized with the bounded splitter without creating clipping/overflow; and
- narrow layouts collapse normally rather than preserving unusably small side-by-side panes.

Automated structural tests protect the split bounds and randomization legality. Owner/browser QA still owns visual acceptance.

## Remaining Priority - Owner Browser Re-check, Then Sheet Closeout

The first owner/browser pass stopped before sheet testing because creator-workspace blockers were material enough to invalidate the rest of the pass.

First confirm in the real browser:

1. no creator controls clip through the panel;
2. splitter drag and keyboard behavior remain bounded and usable;
3. buttons/icon actions have the intended active affordance and hover text; and
4. BRP Randomize All visibly changes the expected identity/mechanical fields and ends in a legal fully allocated state.

After those pass, exercise the complete flow:

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
- setting-owned generated names beyond bounded Character Forge convenience content;
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
- Native state remains canonical; UI/review/sheet/export/profile/randomization controls are projections or interaction layers.
- Shared creator and sheet code do not own BRP rules.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Completion Gate

Close Issue #14 only when representative owner/browser QA demonstrates that a user can create or randomize, finish, save, reopen, and export/print a generic BRP character as a usable product, with the creator workspace, adaptive sheet, and profile seam behaving correctly in the actual browser experience.
