---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- brp
- productization
- character-sheet
---
# Current Handoff

Date: 2026-09-10
Branch: `dev`
Active epic: GitHub Issue #14 - **Make BRP UGE a player-usable core character generator**

## Current Direction

The BRP second-system architecture stress test is complete. BRP Player-Usable Core is now down to one narrow implementation seam plus representative browser QA.

Accepted sequence remains:

1. finish BRP Player-Usable Core;
2. BRP Investigative Horror;
3. bounded Fate Condensed third-system probe;
4. Universal Grammar v0.1 from D&D + BRP + Fate evidence.

D&D Guided Narrative remains intentionally parked. Do not resume it by chronology.

## Adaptive Character Sheet First Proof - Landed

The adaptive character-sheet framework is implemented and proven first with BRP.

Accepted architecture remains:

```text
authoritative native character state
    -> system-owned sheet projection
    -> shared character-sheet renderer
    -> screen / browser print / PDF-via-print
```

Implementation checkpoint:

- SHA: `d6ba965b32c7d47eb2cfa1ef4b73e486787431cb`
- Actions: `34525124229`
- Job: `103032033580`
- `npm run verify`: green
- 52 test files
- 256 tests passed
- 0 failures
- 206 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- Agent context: 3725 characters
- Build: `Character Forge build 0.0.1 d6ba965b`

The sheet slice added:

- presentation-only shared descriptor/rendering primitives in `packages/character-sheet/src/index.ts`;
- BRP-owned projection in `packages/system-brp/src/sheetProjection.ts`;
- deterministic BRP Page 1 at-the-table and Page 2 depth/logistics assignment;
- final skill projection without creation-budget noise;
- conditional weapon, armor, appearance, background, and custom-profession sections;
- screen and dedicated browser-print styling in `apps/web/sheet.css`;
- browser Print / Save as PDF without a PDF dependency;
- full current CharacterDocument Copy JSON / Download JSON controls; and
- focused structural tests for projection, omission, equipment/finishing, page assignment, rendering, and export controls.

The same document-level JSON controls are also available from the current D&D review, but D&D was not moved onto the adaptive sheet renderer.

## Boundaries Preserved

- Native system state remains mandatory and lossless.
- BRP native schema remains `brp-character/0.1`.
- Canonical BRP adapter identity remains `0.7.0`.
- Rendered sheet state is not canonical.
- Shared sheet roles are presentation hints only, not Universal Grammar.
- BRP owns BRP labels, grouping, priority, page assignment, rules meaning, and source interpretation.
- Shared renderer owns presentation mechanics only.
- No universal layout solver was introduced.
- No deterministic PDF library was introduced.
- No D&D adaptive-sheet retrofit or Fate implementation was introduced.
- No optional BRP subsystem was enabled merely to fill sheet space.

## Current Player-Usable BRP Coverage

Completed player-facing slices now include:

1. broader ordinary skill support and correct professional/personal allocation causality;
2. Detective, Scholar, Athlete, Beggar, and source-shaped Custom Profession;
3. bounded source-audited equipment, armor, and modern pistols;
4. optional identity/background finishing fields;
5. actionable allocation UX and validation clarity; and
6. adaptive two-page character sheet, browser print/Save as PDF, and lossless JSON export controls.

See `refs/planning/brp-player-usability-gap-audit.md` for the maintained bounded gap audit.

## Immediate Next Work Package

Implement the **narrow campaign/rules-profile selection seam** required by later Investigative Horror. Do not implement Investigative Horror content yet.

Read `refs/planning/brp-investigative-horror-profile.md` for the downstream evidence target.

The seam should prove only:

- stable profile identity distinct from the effective BRP rules configuration;
- a small BRP-owned profile catalog/registry;
- creator selection of the generic/base profile plus future-profile-ready plumbing;
- explicit profile -> BRP-native options/default mapping;
- save/reopen preservation;
- no profile label replacing source-native effective state; and
- no silent reinterpretation of an existing character when profile selection changes.

Do not create a universal campaign/profile ontology. Keep the implementation in BRP ownership unless a genuinely shared interaction primitive is demonstrated.

## After The Profile Seam

Run representative owner/browser QA across:

```text
create -> finish -> review -> save -> reopen -> print/export
```

Include multiple BRP professions and at least one character with populated equipment, long skill/specialty names, and finishing/background fields. Confirm real browser print pagination and grayscale/readability rather than relying only on structural tests.

Close Issue #14 only if that QA satisfies the player-usable acceptance target.

## Source / Licensing Boundary

Implementation authority remains the Basic Roleplaying: Universal Game Engine ORC Content Document, 2023, pinned to corrections 1.05.

Do not import Call of Cthulhu-only or other branded-game content. The later Investigative Horror profile is deliberately BRP-native and legally separate from Call of Cthulhu support.

## Branch / Promotion Boundary

Work directly on `dev`.

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D or BRP work.

## Validation

Milestone gate:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions. The implementation checkpoint above is green; any later documentation or implementation head requires its own exact-head Verify.
