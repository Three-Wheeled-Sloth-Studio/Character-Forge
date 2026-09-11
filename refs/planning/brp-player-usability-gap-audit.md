---
type: "Implementation Audit"
title: "BRP Player-Usability Gap Audit"
tags:
- character-forge
- brp
- player-usability
- creator
---
# BRP Player-Usability Gap Audit

Date: 2026-09-11
Epic: GitHub Issue #14 - Make BRP UGE a player-usable core character generator
Rules source: Basic Roleplaying: Universal Game Engine ORC Content Document, 2023, corrections 1.05

This is a bounded implementation-selection audit, not an exhaustive BRP backlog.

## Supported now

| Capability | Classification | Current evidence |
| --- | --- | --- |
| Characteristic construction | supported | Explicit and standard-rolled characteristics, retained roll provenance, and legal redistribution are system-owned. |
| Normal and Heroic creation | supported | Professional budgets, starting caps, and retained Heroic age causality are enforced by BRP native state and adapter validation. |
| Profession and generic skill breadth | supported | Detective, Scholar, Athlete, Beggar, and Custom Profession provide credible generic coverage without flattening profession into class. |
| Wealth boundaries | supported | Profession-specific creation supports the implemented Destitute through Wealthy ranges where source profiles allow them. |
| Knowledge/Science specialties and languages | supported | Scholar specialties and language identities remain open, named, and lossless in native state. |
| Professional/personal causality | supported | Base, professional, personal, and final skill values remain separate and validated. |
| Allocation UX and validation clarity | supported | Budget progress, spend/remove guidance, profession eligibility, legal ceilings, cap headroom, and blocking corrections are visible while builders/adapters remain authoritative. |
| Whole-character randomization | supported | BRP Randomize All now produces an obvious legal character-state change across identity, supported profession/wealth/electives, characteristics, Scholar specialties, and fully spent legal professional/personal allocations while preserving rules/profile settings and freeform context. |
| Creator workspace containment and resize | supported, owner re-check pending | Flexible creator grids prevent ordinary controls from escaping the left pane. A bounded pointer/keyboard splitter resizes creator and result panes and collapses at narrow width. Automated bounds tests are green; real-browser re-acceptance is still required. |
| Action affordance | supported, owner re-check pending | Buttons are more rounded than neighboring inputs/selects, enabled actions have stronger affordance, and compact randomize/suggest/re-roll actions are icon-first with tooltip/accessibility labels. |
| Equipment finishing | supported | Native stable equipment IDs cover bounded useful gear, armor, and modern pistols with starting-weapon skill eligibility. |
| Identity/background finishing | supported | Optional size/build, appearance, mannerisms/motto, reputation, personal item, background, and beliefs are retained losslessly. |
| Save/reopen | supported | Creator reconstruction starts from authoritative BRP native state; equipment, finishing, profile context, rules state, and allocations round-trip. |
| Adaptive character sheet and browser print | implementation supported, owner acceptance pending | BRP owns a deterministic two-page sheet projection; shared rendering is presentation-only. Empty optional sections collapse and print CSS removes application/debug chrome. The owner deferred sheet testing after creator blockers were found. |
| CharacterDocument JSON export | supported | Copy JSON and Download JSON operate on the complete current CharacterDocument. |
| Campaign/rules-profile selection seam | supported | `packages/system-brp/src/campaignProfile.ts` provides a BRP-owned versioned profile catalog. `Generic BRP Core` (`generic`, v0.1) maps deterministically to source-native defaults. Profile provenance is separate from the authoritative effective `BrpRulesProfile`; reopen never recalculates an existing character from the current catalog, and explicit profile selection is the action that reapplies current defaults. |
| Canonical schema/adapter preservation | supported | The profile, sheet, randomization, and workspace work preserve `brp-character/0.1` and canonical adapter identity `0.7.0`. |

## Remaining v0.1 Acceptance Gate

No planned implementation capability remains missing for the bounded generic BRP v0.1 target.

The first owner/browser QA pass on 2026-09-11 exposed bounded acceptance defects before sheet QA began: clipped/overflowing creator controls, weak action affordance, no resizable pane divider, and a misleadingly narrow `Randomize All` implementation. Those defects were repaired at `6110dc4d58a7949a0df0da0f189bbab0a033ef61`.

Before Issue #14 can close, owner/browser QA must now:

1. re-accept creator containment, action affordance, splitter behavior, and visible BRP Randomize All behavior; then
2. complete the previously deferred create -> finish -> review -> save -> reopen -> print/export pass with multiple professions, long labels/content, equipment, finishing details, profile persistence, JSON controls, and actual print pagination/readability.

Any further defect should be classified as a bounded acceptance fix or deferred breadth. Do not turn browser QA into a speculative backlog.

## Deferred

- Characters under 18 and age 50+ aging/characteristic adjustments.
- Full optional skill-category systems and every era-specific base-chance variant.
- Additional source professions and specialty breadth unless browser QA exposes a concrete generic-use gap.
- The optional CHA-driven Distinctive Features subsystem and exhaustive cosmetic feature tables.
- Exhaustive weapon, armor, vehicle, and specialty catalogs.
- Complete Superpowers/Psychic catalogs and Magic, Mutations, or Sorcery.
- Broad non-human support.
- Setting-owned generated names beyond bounded Character Forge convenience randomizer content.
- D&D adaptive-sheet retrofit.
- Multiple complete sheet modes beyond the current useful BRP play/print projection.
- Deterministic server-side PDF generation unless product evidence requires it.
- Investigative Horror substantive rules/content until Issue #14 closes.
- Fate Condensed implementation and Universal Grammar v0.1 freeze.

## Implemented Slice History

### 1. Skill breadth and causality

Expanded the ordinary skill catalog and corrected professional versus personal allocation while preserving source-native contribution causality.

### 2. Profession breadth

Added Athlete, Beggar, and BRP-native Custom Profession while retaining Detective and Scholar and keeping profession distinct from class.

### 3. Equipment finishing

Retained `equipment: string[]` as stable native item IDs backed by a bounded source-audited catalog with play-useful weapon and armor projection.

### 4. Identity/background finishing

Added optional player-authored finishing details from BRP Steps Nine and Ten without enabling the optional Distinctive Features subsystem.

### 5. Allocation UX

Exposed budget progress, legal input ceilings, profession eligibility, cap headroom/overage, and actionable blockers while leaving arithmetic and legality in BRP builders/adapters.

### 6. Adaptive character sheet

Implemented the accepted path:

```text
native system state -> system sheet projection -> shared renderer -> screen / print / PDF-via-print
```

BRP owns sheet meaning and shared code owns presentation mechanics only. Browser-native Print / Save as PDF and full CharacterDocument JSON export remain the output paths.

Adaptive-sheet implementation checkpoint `d6ba965b32c7d47eb2cfa1ef4b73e486787431cb` passed Actions `34525124229`, job `103032033580`, with 52 test files / 256 tests / 0 failures.

### 7. Campaign/rules-profile seam

Added a versioned BRP-owned profile catalog and creator selector. `Generic BRP Core` is currently the only active profile. Creating under a profile retains both its versioned provenance reference and the effective source-native rules configuration. Reopen restores effective rules from native state rather than re-resolving the catalog, including for legacy/no-profile provenance. Explicit profile selection reapplies current defaults; a post-construction context operation refuses to reinterpret mechanically significant rules.

Profile-seam implementation checkpoint `fabbc6567ffa8a9d4d24af9a940baa17a86a1b03` passed Actions `34527156423`, job `103038733378`, with 53 test files / 263 tests / 0 failures.

### 8. First browser-QA remediation

Owner QA exposed creator overflow/containment, button affordance, missing resizable split-pane behavior, and incomplete BRP Randomize All semantics. The bounded repair added:

- containment-safe responsive creator grids;
- a draggable and keyboard-operable bounded splitter;
- action styling that visibly distinguishes enabled buttons from disabled/data-entry controls;
- icon-first compact randomize/suggest/re-roll controls; and
- a deterministic BRP whole-character randomizer that fully spends legal skill budgets and validates through the ordinary native builder path.

QA-remediation checkpoint `6110dc4d58a7949a0df0da0f189bbab0a033ef61` passed Actions `34603217834`, job `103275340363`, with 55 test files / 269 tests / 0 failures.

The related studio-wide UI guidance update is TWS Design Principles commit `b0af7cc5a4086b0306ab1de16bc14ad60e9600ce`, validated green by Actions `34602603904`.

## Next bounded step

Re-run owner/browser QA against the creator fixes first. Only after containment, splitter, affordance, and Randomize All are accepted should the deferred sheet/save/reopen/print acceptance pass resume. Close Issue #14 only when the resulting full player flow feels like a usable generic BRP product rather than an architecture demonstration.
