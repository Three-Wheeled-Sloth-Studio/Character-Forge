---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- brp
- productization
- browser-qa
- character-sheet
---
# Current Handoff

Date: 2026-09-11
Branch: `dev`
Active epic: GitHub Issue #14 - **Make BRP UGE a player-usable core character generator**

## Current Direction

BRP Player-Usable Core remains in browser acceptance. Owner QA has continued to expose presentation/print defects rather than rules-state defects. Five bounded QA repair passes have now landed:

1. creator-workspace containment, affordance, splitter, and BRP Randomize All;
2. D&D adoption of the dedicated sheet framework and shared document controls;
3. player-facing equipment labels, character-only sheet content, toolbar SVGs, and an attempted print-root isolation;
4. repair of the local server path that had not been serving `sheet.css` / `sheet-ui.css`; and
5. replacement of whole-app `window.print()` behavior with an isolated print document plus alignment of sheet action buttons with the existing studio affordance guidance.

Issue #14 remains open until the owner confirms the actual browser/print result.

## Exact Green Isolated-Print Checkpoint

The fifth browser-QA repair is green at:

- SHA: `a10d18e7c818c9c45afbd38f0d6f7a4cca473432`
- Actions: `34612582059`
- Job: `103306485403`
- `npm run verify`: green
- 57 test files
- 277 tests passed
- 0 failures
- 216 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- Agent context: 4117 characters
- Build: `Character Forge build 0.0.1 a10d18e7`

Any later documentation or implementation head requires its own exact-head Verify before being called green.

## Browser QA Findings And Repairs

### Pass 1 - creator workspace

Owner QA found action affordance, pane containment, missing resize control, and weak BRP whole-character randomization. The repair at `6110dc4d58a7949a0df0da0f189bbab0a033ef61` added stronger action styling, icon-first compact randomizers, containment-safe layouts, a bounded draggable/keyboard splitter, and a legal BRP whole-character Randomize All pass.

### Pass 2 - D&D dedicated result

Owner QA found D&D still using an older custom result surface, internal equipment-choice IDs leaking into review, and no visible dedicated print path. The repair at `caff03275bc714f7189a5c7c9e30daeddd1a12b4` added the D&D-owned two-page sheet projection, shared sheet rendering, document controls, browser print, and reserved Portrait / VTT Token spaces.

### Pass 3 - labels, content, and initial print isolation

Owner QA then showed raw `A/B/C` equipment labels, empty-looking icon buttons, unnecessary product/rules/provenance text on the sheet, and application UI in print preview. The repair through `ee63a0752e33e56aa94bce03e2ec69fa6099fc77` corrected equipment-label reconciliation, reduced rules identity to a tiny footer, removed `Character Forge` and large provenance blocks from sheet content, and introduced an initial print-only root.

### Pass 4 - stylesheet delivery root cause

Owner QA at build `985f87fc` still showed unstyled sheets and broken print because `apps/web/index.html` referenced `sheet.css` and `sheet-ui.css` while the local custom server did not serve those routes. The repair through `5a8833d1b1e2ffccb298e30e71745108bc78a98b` added explicit routes and regression coverage for all referenced stylesheets.

### Pass 5 - isolated print document and action affordance

After Pass 4, owner QA confirmed the icons were now visible but found two remaining defects shared by D&D and BRP:

1. the compact document actions still looked too neutral/inactive; and
2. browser print remained roughly eight pages of non-sheet material rather than the intended 1-2 page character artifact.

Audit confirmed the shared studio design guidance already covers the button requirement: enabled actions need visible affordance before hover, buttons should be rounder than neighboring inputs/selects, and compact icon actions should be circular or strongly rounded with visible hover/active/focus states. No Design Principles change was needed.

The repair ending at `a10d18e7c818c9c45afbd38f0d6f7a4cca473432` changes the print architecture rather than adding another hide-selector patch:

- Print no longer invokes `window.print()` on the running Character Forge application.
- The Print action creates an off-screen iframe whose `srcdoc` is a standalone HTML document containing only the already-rendered character sheet plus `sheet.css` and `sheet-ui.css`.
- The isolated frame is kept at a desktop/letter-like `816 x 1056` CSS-pixel viewport so responsive narrow-screen rules cannot collapse columns and inflate pagination before print.
- The print iframe invokes its own `contentWindow.print()` and cleans itself up after printing.
- `main.ts` no longer maintains a duplicate hidden `character-print-root`; the visible sheet HTML is passed directly to the document-control binder as the printable artifact.
- Regression coverage asserts that the printable document contains sheet markup only and does not contain `forge-shell`, `creator-root`, or Rules-system UI.
- Sheet action buttons are now circular, centered, visibly filled/bordered at rest, and have explicit hover, active, and focus states.
- `sheet-ui.css` no longer overrides the shared action-button affordance defined in `sheet.css`.

## Character Sheet Product Boundary

The character sheet is a character artifact, not a design/debug/provenance report.

Current path:

```text
authoritative native character state
    -> system-owned sheet projection
    -> shared character-sheet renderer
    -> screen sheet
    -> standalone print document containing only that sheet
```

Product branding, generation UI, generation seed, profile provenance, source explanation, native JSON inspection, creator controls, and designer-facing page labels belong outside the character sheet. Rules identity may appear only as unobtrusive provenance, currently a tiny footer note.

The logical model remains exactly two pages for both BRP and D&D. Real browser QA must still confirm representative characters stay within 1-2 physical print pages in the owner's browser.

## Immediate Next Work Package - Owner Browser Re-check

Pull current `dev`, restart `npm run dev:web`, and verify both D&D and BRP:

1. Print / Copy JSON / Download JSON controls are centered circular actions with visible enabled affordance before hover.
2. Print opens a preview of the character sheet only. No Character Forge header, rules selector, creator controls, result toolbar, JSON inspector, or other application material may appear.
3. Representative characters occupy no more than 1-2 physical pages.
4. The sheet remains readable in grayscale/ordinary office printing.
5. Portrait and VTT Token reserved spaces remain useful without crowding core play information.

If this passes, resume the complete BRP Issue #14 journey:

```text
create -> finish -> review -> save -> reopen -> print/export
```

Close Issue #14 only after real-browser acceptance succeeds.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical and lossless.
- Preserve `brp-character/0.1` and canonical BRP adapter identity `0.7.0` unless concrete evidence requires a change.
- Profile identity is provenance/configuration context, not canonical rules state.
- Profession is not class.
- Shared sheet code owns presentation mechanics only.
- The print target must be a standalone character-sheet document, never the running creator/application document.
- Internal generation IDs are not acceptable player-facing labels when richer source-owned labels exist.
- Static assets referenced by the browser must have explicit served/static-asset paths and must not silently fall through to SPA HTML.
- Enabled compact actions must visibly look actionable before hover and should use circular/strongly-rounded icon-first affordance consistent with studio guidance.
- Portrait/token spaces do not imply portrait/token ownership in native rules state.
- Foundry Actor/Item schemas remain adapter targets rather than canonical Character Forge state.
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
