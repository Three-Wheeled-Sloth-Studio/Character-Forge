---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- brp
- productization
- rules-profile
- browser-qa
- character-sheet
---
# Current Handoff

Date: 2026-09-11
Branch: `dev`
Active epic: GitHub Issue #14 - **Make BRP UGE a player-usable core character generator**

## Current Direction

BRP Player-Usable Core remains in browser acceptance. The first owner/browser QA pass found creator-workspace blockers, which were repaired. The next pass exposed a cross-system sheet/review defect: D&D still used an older custom result surface, leaked starting-equipment choice IDs such as `A/B`, and did not expose the dedicated print path already available to BRP.

That second QA finding is now repaired in code. D&D is the second proof of the adaptive sheet framework, both BRP and D&D use the dedicated sheet result path, and the shared first page reserves portrait and VTT-token space. Issue #14 remains open because the owner has not yet completed real-browser sheet/print acceptance.

Accepted sequence remains:

1. close BRP Player-Usable Core after browser acceptance;
2. BRP Investigative Horror;
3. bounded Fate Condensed third-system probe;
4. Universal Grammar v0.1 from D&D + BRP + Fate evidence.

D&D Guided Narrative remains intentionally parked. Do not resume it by chronology.

## Exact Green D&D-Sheet QA-Remediation Checkpoint

The second browser-QA repair is green at:

- SHA: `caff03275bc714f7189a5c7c9e30daeddd1a12b4`
- Actions: `34605994371`
- Job: `103284429489`
- `npm run verify`: green
- 56 test files
- 273 tests passed
- 0 failures
- 215 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- Agent context: 4449 characters
- Build: `Character Forge build 0.0.1 caff0327`

Any later documentation or implementation head requires its own exact-head Verify before being called green.

## Browser QA Findings And Repairs

### First pass - creator workspace

Owner QA found:

1. action buttons were too square and too close to input/select geometry;
2. enabled actions looked muted enough to read as disabled;
3. compact actions were wordy instead of icon-first;
4. BRP creator elements could overflow/clamp through the left panel;
5. there was no user-resizable divider between creator and result panes; and
6. BRP `Randomize All` did not behave like a whole-character randomizer.

The repair at `6110dc4d58a7949a0df0da0f189bbab0a033ef61` added stronger action affordance, icon-first randomize/suggest controls, containment-safe grids, a bounded draggable/keyboard splitter, and a legal BRP whole-character randomization pass over supported identity/mechanical state.

### Second pass - dedicated sheet and D&D result

Owner QA then found:

1. D&D starting equipment was displayed as internal `A/B` choice IDs rather than concrete equipment;
2. Copy JSON / Download JSON controls were visible text buttons rather than compact standard icons;
3. D&D had no visible Print / Save as PDF action; and
4. D&D did not appear to have a dedicated character-sheet result path.

The repair at `caff03275bc714f7189a5c7c9e30daeddd1a12b4` adds:

- `packages/system-dnd5e/src/sheetProjection.ts` as a D&D-owned two-page sheet projection;
- D&D routing through the same shared presentation-only sheet renderer as BRP;
- player-facing concrete native D&D equipment and currency instead of generation choice IDs such as `A/B/C`;
- icon-only standard Print, Copy, and Download controls with tooltip/title and ARIA labels;
- browser Print / Save as PDF from the D&D dedicated sheet;
- shared first-page portrait and VTT-token reserved spaces; and
- focused D&D sheet regression tests while preserving existing BRP tests.

The media spaces are presentation placeholders only. Actual portrait/token asset references are future character-asset relationships, not D&D or BRP native rules state.

## Shared Design Guidance

The studio-wide guidance remains updated in `Three-Wheeled-Sloth-Studio/TWS-Design-Principles`:

- commit: `b0af7cc5a4086b0306ab1de16bc14ad60e9600ce`
- Actions: `34602603904`
- result: green

Character Forge's own `refs/product/creator-workspace.md` now additionally records that supported systems should use their dedicated sheet projection as the result surface, common document actions should be icon-first, and internal equipment-choice IDs are not final player-facing content.

## Adaptive Character Sheet Framework - Two Systems Proven

The current path is:

```text
authoritative native character state
    -> system-owned sheet projection
    -> shared character-sheet renderer
    -> screen / browser print / PDF-via-print
```

Implemented system projections:

- BRP: `packages/system-brp/src/sheetProjection.ts`
- D&D: `packages/system-dnd5e/src/sheetProjection.ts`

The shared renderer owns presentation mechanics only. BRP and D&D retain ownership of system meaning, calculations, grouping, page priorities, and source interpretation.

The D&D second proof exposed an important boundary: generation option/provenance IDs may remain in native/generation context, but player-facing sheet content should use the constructed concrete native state. In particular, D&D equipment should display `payload.equipment` and `currencyGp`, not `A/B/C` choice IDs.

The first sheet page reserves Portrait and VTT Token spaces. No image URL, binary asset, Foundry path, or VTT document ID has been added to CharacterDocument or native rules payloads.

## Foundry Readiness Boundary

Foundry remains planned, not implemented. The repository already has the main source-side prerequisites for a bounded D&D export proof:

- lossless CharacterDocument/native-state preservation;
- a rich current D&D native payload with abilities, class/origin state, concrete equipment, resources, features, and spells;
- complete CharacterDocument JSON export;
- an explicit adapter boundary that forbids Foundry Actor/Item JSON from becoming canonical Character Forge state; and
- roadmap intent for a future `packages/foundry-adapter`.

A first export-only Foundry slice still needs a versioned adapter, target Foundry/D&D system schema mapping, compatibility metadata/tests, export UX, and validation through a real Foundry import. Direct push/synchronization is a later increment because it additionally requires connection/auth/version discovery, asset transfer, update semantics, and eventually conflict/ownership rules.

Do not pull Foundry implementation into Issue #14 unless explicitly reprioritized.

## Campaign / Rules-Profile Seam - Preserved

`packages/system-brp/src/campaignProfile.ts` remains the narrow BRP profile seam.

The first active profile remains:

- stable ID: `generic`;
- label: `Generic BRP Core`;
- profile version: `0.1`; and
- defaults: Normal power level, Explicit characteristics, no enabled optional rules, no enabled power systems.

Reopen reconstructs effective rules from authoritative native state. Randomize All and sheet presentation do not reinterpret campaign/rules configuration.

No Investigative Horror content, Sanity configuration, Call of Cthulhu content, or universal profile model was introduced.

## Immediate Next Work Package - Owner Browser Sheet Re-check

Re-test the second QA repair in the actual browser before further implementation:

1. Build a D&D character with prepared starting gear and confirm the result sheet shows the concrete items and currency, not `A/B/C` or `Equipment package`.
2. Confirm the sheet toolbar shows recognizable icon-only Print, Copy, and Download actions with useful hover text.
3. Use Print and inspect actual browser Print / Save as PDF preview.
4. Confirm the D&D result is visibly the dedicated two-page sheet rather than the old custom detail list.
5. Confirm Portrait and VTT Token spaces exist on Page 1 and do not crowd core play information unacceptably.
6. Re-check BRP uses the same icon toolbar/media-space conventions and still renders its BRP-owned sheet correctly.

Then resume the full BRP Issue #14 journey:

```text
create -> finish -> review -> save -> reopen -> print/export
```

Exercise multiple BRP professions, long labels/content, equipment, finishing details, profile persistence, JSON controls, actual print pagination/readability, and ordinary office-printer/grayscale behavior.

Treat remaining visual or workflow defects as bounded acceptance fixes. Close Issue #14 only after real-browser acceptance succeeds.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical and lossless.
- Preserve `brp-character/0.1` and canonical BRP adapter identity `0.7.0` unless concrete evidence requires a change.
- Profile identity is provenance/configuration context, not canonical rules state.
- Profession is not class.
- Open specialties and languages remain source-owned.
- UI, review, sheet, export, profile controls, randomization, and splitter behavior are projections or interaction layers over native state.
- Shared sheet code owns presentation mechanics only.
- Portrait/token spaces do not imply portrait/token ownership in native rules state.
- Foundry Actor/Item schemas must remain adapter targets rather than canonical Character Forge state.
- Do not import Call of Cthulhu-only or branded content.

## Branch / Promotion Boundary

Work directly on `dev`.

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D or BRP work.

## Validation

Milestone gate:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
