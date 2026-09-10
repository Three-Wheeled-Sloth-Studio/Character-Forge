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

Date: 2026-09-10
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
| Equipment finishing | supported | Native stable equipment IDs cover bounded useful gear, armor, and modern pistols with starting-weapon skill eligibility. |
| Identity/background finishing | supported | Optional size/build, appearance, mannerisms/motto, reputation, personal item, background, and beliefs are retained losslessly. |
| Save/reopen | supported | Creator reconstruction starts from authoritative BRP native state; equipment, finishing, profile context, rules state, and allocations round-trip. |
| Adaptive character sheet and browser print | supported | BRP owns a deterministic two-page sheet projection; shared rendering is presentation-only. Empty optional sections collapse and print CSS removes application/debug chrome. |
| CharacterDocument JSON export | supported | Copy JSON and Download JSON operate on the complete current CharacterDocument. |
| Campaign/rules-profile selection seam | supported | `packages/system-brp/src/campaignProfile.ts` provides a BRP-owned versioned profile catalog. `Generic BRP Core` (`generic`, v0.1) maps deterministically to source-native defaults. Profile provenance is separate from the authoritative effective `BrpRulesProfile`; reopen never recalculates an existing character from the current catalog, and explicit profile selection is the action that reapplies current defaults. |
| Canonical schema/adapter preservation | supported | The profile and sheet work preserve `brp-character/0.1` and canonical adapter identity `0.7.0`. |

## Remaining v0.1 Acceptance Gate

No planned implementation capability remains missing for the bounded generic BRP v0.1 target.

Representative real-browser QA is still required before Issue #14 closeout. It must cover create -> finish -> review -> save -> reopen -> print/export with multiple professions, representative long labels/content, equipment, finishing details, profile persistence, JSON controls, and actual print pagination/readability.

Any defect found by that pass should be classified as a bounded acceptance fix or as deferred breadth. Do not turn browser QA into a new speculative backlog.

## Deferred

- Characters under 18 and age 50+ aging/characteristic adjustments.
- Full optional skill-category systems and every era-specific base-chance variant.
- Additional source professions and specialty breadth unless browser QA exposes a concrete generic-use gap.
- The optional CHA-driven Distinctive Features subsystem and exhaustive cosmetic feature tables.
- Exhaustive weapon, armor, vehicle, and specialty catalogs.
- Complete Superpowers/Psychic catalogs and Magic, Mutations, or Sorcery.
- Broad non-human support.
- Setting-owned generated names.
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

## Next bounded step

Run representative owner/browser QA and make only evidence-backed acceptance fixes. Close Issue #14 only if the resulting full player flow feels like a usable generic BRP product rather than an architecture demonstration.
