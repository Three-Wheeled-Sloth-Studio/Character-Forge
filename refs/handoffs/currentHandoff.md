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

BRP Player-Usable Core remains in browser acceptance. Four owner/browser QA passes have now produced bounded fixes rather than new feature work:

1. creator-workspace containment, affordance, splitter, and BRP Randomize All;
2. D&D adoption of the dedicated sheet framework and shared document controls;
3. player-facing equipment labels, character-only sheet content, visible toolbar-icon styling, and a dedicated print root; and
4. discovery and repair of the actual delivery defect that prevented the sheet and print styles from reaching the browser.

The fourth pass is the important root-cause correction. `apps/web/index.html` referenced `sheet.css` and `sheet-ui.css`, but the custom `tools/web-server.mjs` served only `/styles.css` and `/dist/*`. Requests for the two sheet stylesheets fell through to `index.html`, so the browser received HTML instead of CSS. That single delivery bug explains both remaining symptoms from owner QA: empty-looking document-action buttons and raw, UI-like sheet/print rendering despite the correct stylesheet rules existing in the repository.

Issue #14 remains open until the owner confirms the actual browser and print result after this repair.

## Exact Green Sheet-Asset Delivery Checkpoint

The fourth browser-QA repair is green at:

- SHA: `5a8833d1b1e2ffccb298e30e71745108bc78a98b`
- Actions: `34610930531`
- Job: `103300946623`
- `npm run verify`: green
- 57 test files
- 277 tests passed
- 0 failures
- 216 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- Agent context: 4158 characters
- Build: `Character Forge build 0.0.1 5a8833d1`

Any later documentation or implementation head requires its own exact-head Verify before being called green.

## Browser QA Findings And Repairs

### Pass 1 - creator workspace

Owner QA found action affordance, pane containment, missing resize control, and weak BRP whole-character randomization. The repair at `6110dc4d58a7949a0df0da0f189bbab0a033ef61` added stronger action styling, icon-first compact randomizers, containment-safe layouts, a bounded draggable/keyboard splitter, and a legal BRP whole-character Randomize All pass.

### Pass 2 - D&D dedicated result

Owner QA found D&D still using an older custom result surface, internal equipment-choice IDs leaking into review, and no visible dedicated print path. The repair at `caff03275bc714f7189a5c7c9e30daeddd1a12b4` added the D&D-owned two-page sheet projection, shared sheet rendering, document controls, browser print, and reserved Portrait / VTT Token spaces.

### Pass 3 - labels, content, and print isolation

Owner QA then showed raw `A/B/C` equipment labels, empty-looking icon buttons, unnecessary product/rules/provenance text on the sheet, and application UI in print preview. The repair through `ee63a0752e33e56aa94bce03e2ec69fa6099fc77` corrected equipment-label reconciliation, reduced rules identity to a tiny footer, removed `Character Forge` and large provenance blocks from sheet content, and introduced the isolated `character-print-root` plus print CSS that hides the application shell.

### Pass 4 - stylesheet delivery root cause

Owner QA at build `985f87fc` still showed:

- D&D and BRP sheet toolbar buttons without visible icons;
- BRP and D&D sheets rendered as mostly unstyled semantic text; and
- print preview still rendering the creator/application shell instead of the isolated sheet.

Audit found that the CSS changes from Pass 3 were never being served by the local Character Forge web server. `index.html` requested `/sheet.css` and `/sheet-ui.css`, but `tools/web-server.mjs` had no routes for either path and returned `index.html` for them.

The repair through `5a8833d1b1e2ffccb298e30e71745108bc78a98b`:

- explicitly serves `/sheet.css` from `apps/web/sheet.css`;
- explicitly serves `/sheet-ui.css` from `apps/web/sheet-ui.css`;
- adds regression coverage proving every stylesheet referenced by `index.html` has an owned web-server route;
- makes Print, Copy, and Download SVG presentation attributes self-contained in the SVG markup as a second line of defense rather than depending only on CSS; and
- removes visible designer page labels such as `Page 1 - At the table` from sheet headers while retaining page semantics through structure/ARIA.

The screen and print sheet styles should now actually execute in the browser. This is the first pass where the stylesheet delivery path itself is covered by regression tests.

## Character Sheet Product Boundary

The character sheet is a character artifact, not a design/debug/provenance report.

Current path:

```text
authoritative native character state
    -> system-owned sheet projection
    -> shared character-sheet renderer
    -> screen sheet
    -> isolated print-only sheet root
```

The sheet should contain character information needed for play or character depth. Product branding, generation UI, generation seed, profile provenance, source explanation, native JSON inspection, creator controls, and designer-facing page labels belong outside the visible sheet.

Rules identity may appear only as unobtrusive provenance, currently a tiny footer note. The toolbar is application chrome and never prints.

The logical model remains exactly two pages for both BRP and D&D. Real browser QA must still confirm representative characters remain within 1-2 physical print pages after the now-served print CSS is applied.

## Portrait And VTT Token Boundary

Page 1 reserves presentation space for a portrait and VTT token. These remain layout placeholders only. Do not add image URLs, Foundry paths, VTT document IDs, or binary assets to D&D or BRP native rules state merely to fill those slots.

## Campaign / Rules-Profile Seam - Preserved

`packages/system-brp/src/campaignProfile.ts` remains the narrow BRP profile seam. `Generic BRP Core` v0.1 remains the only current profile. Reopen reconstructs effective rules from authoritative native state; profile identity remains provenance/configuration context rather than canonical rules state.

## Immediate Next Work Package - Owner Browser Re-check

Pull the current `dev`, restart `npm run dev:web`, and re-test the actual browser:

1. D&D Guided Mechanical `Starting equipment` must show descriptive package labels rather than bare `A/B/C`.
2. BRP and D&D sheet toolbars must show recognizable Print, Copy JSON, and Download JSON icons.
3. The right-side result must look like the styled character sheet rather than raw semantic text.
4. The visible sheet must not display `Character Forge` branding or designer page-role labels.
5. Browser Print / Save as PDF must contain only the dedicated character sheet, never the application header, rules selector, creator controls, toolbar, or JSON inspector.
6. Confirm representative characters occupy no more than 1-2 physical print pages and remain readable in grayscale/ordinary office printing.

Then resume the full BRP Issue #14 journey:

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
- Open specialties and languages remain source-owned.
- UI, sheet, export, profile controls, randomization, and splitter behavior are interaction/presentation layers over native state.
- Shared sheet code owns presentation mechanics only.
- The printed sheet must contain only the sheet, never creator/application chrome.
- Internal generation IDs are not acceptable player-facing labels when richer source-owned labels exist.
- Stylesheets referenced by the browser must have an explicit served/static-asset path and must not silently fall through to the SPA HTML response.
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
