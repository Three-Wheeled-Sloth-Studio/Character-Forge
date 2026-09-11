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

BRP Player-Usable Core remains in browser acceptance. Three owner/browser QA passes have now produced bounded fixes rather than new feature work:

1. creator-workspace containment, affordance, splitter, and BRP Randomize All;
2. D&D adoption of the dedicated sheet framework and shared document controls; and
3. player-facing equipment labels, visible toolbar icons, and a hard print boundary that excludes the application shell.

The third repair is structurally green, but Issue #14 remains open until the owner confirms the actual browser result and print preview. Automated tests prove there are exactly two logical sheet pages and that the print stylesheet exposes only the dedicated print root; they do not prove that a particular browser will not overflow a logical page onto an extra physical page.

Accepted sequence remains:

1. close BRP Player-Usable Core after browser acceptance;
2. BRP Investigative Horror;
3. bounded Fate Condensed third-system probe;
4. Universal Grammar v0.1 from D&D + BRP + Fate evidence.

D&D Guided Narrative remains intentionally parked. Do not resume it by chronology.

## Exact Green Character-Only Print Checkpoint

The third browser-QA repair is green at:

- SHA: `ee63a0752e33e56aa94bce03e2ec69fa6099fc77`
- Actions: `34608731990`
- Job: `103293561221`
- `npm run verify`: green
- 57 test files
- 276 tests passed
- 0 failures
- 216 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- Agent context: 4140 characters
- Build: `Character Forge build 0.0.1 ee63a075`

Any later documentation or implementation head requires its own exact-head Verify before being called green.

## Browser QA Findings And Repairs

### Pass 1 - creator workspace

Owner QA found action affordance, pane containment, missing resize control, and weak BRP whole-character randomization. The repair at `6110dc4d58a7949a0df0da0f189bbab0a033ef61` added stronger action styling, icon-first compact randomizers, containment-safe layouts, a bounded draggable/keyboard splitter, and a legal BRP whole-character Randomize All pass.

### Pass 2 - D&D result / dedicated sheet

Owner QA found D&D still using the older custom result surface, internal equipment-choice IDs leaking into review, and no visible dedicated print path. The repair at `caff03275bc714f7189a5c7c9e30daeddd1a12b4` added the D&D-owned two-page sheet projection, shared sheet rendering, icon-only document controls, browser print, and reserved Portrait / VTT Token spaces.

### Pass 3 - labels, icons, and print isolation

The next owner QA showed that the second repair had not fixed the actual browser experience:

1. D&D Guided Mechanical `Starting equipment` still displayed raw `A/B/C` labels in the select;
2. the BRP sheet toolbar showed empty rounded buttons because the SVG markup had no visible stroke styling;
3. the character sheet still displayed unnecessary `Character Forge` product branding;
4. BRP and D&D sheet bodies still carried rules/provenance blocks that were not useful character-sheet content; and
5. browser print preview included the application shell and creator UI, expanding the intended two-page character sheet into many pages.

The repair ending at `ee63a0752e33e56aa94bce03e2ec69fa6099fc77` addresses those specific defects:

- `choicePoolDirectVisibility.ts` now reconciles both option IDs and player-facing labels, so an `A/B/C` select whose IDs are correct but labels have regressed is rebuilt from the richer equipment-package labels;
- a regression test explicitly covers the `A/B`-IDs-with-wrong-labels case;
- shared toolbar SVGs now have explicit `stroke: currentColor`, `fill: none`, width/height, and line styling so standard Print, Copy, and Download icons are visible;
- `Character Forge` is removed from sheet-page chrome;
- BRP Profile / Rules Context and D&D Rules Context / generation provenance are removed from the sheet body;
- rules identity is reduced to a tiny footer note: `BRP UGE 2023 | ORC 1.05` or `D&D 5E 2024 | SRD 5.2.1`;
- `main.ts` now maintains a dedicated `character-print-root` containing only the rendered character sheet; and
- print CSS hides `#app > .forge-shell` and exposes only `#app > .character-print-root`, structurally excluding header, creator, result toolbar, inspector, and other application chrome from print.

A dedicated print-contract test now protects both the isolated print root and visible SVG-stroke behavior.

## Character Sheet Product Boundary

The character sheet is a character artifact, not a design/debug/provenance report.

Current rule:

```text
authoritative native character state
    -> system-owned sheet projection
    -> shared character-sheet renderer
    -> screen sheet
    -> isolated print-only sheet root
```

The sheet should contain character information needed for play or character depth. Product branding, generation UI, generation seed, profile provenance, source explanation, native JSON inspection, and creator controls belong outside the sheet.

Rules identity may appear only as unobtrusive provenance, currently a tiny footer note. The sheet toolbar is application chrome and never prints.

The logical sheet model remains exactly two pages for both BRP and D&D. Real browser QA still must confirm that content density does not force extra physical print pages for representative characters.

## Portrait And VTT Token Boundary

Page 1 reserves presentation space for a portrait and VTT token. These remain layout placeholders only.

Future ownership remains:

```text
Parchment Worlds character asset relationship
    -> Character Forge presentation reference
    -> sheet portrait/token rendering
    -> VTT adapter mapping
```

Do not add image URLs, Foundry paths, VTT document IDs, or binary assets to D&D or BRP native rules state merely to fill those slots.

## Foundry Readiness Boundary

Foundry remains planned, not implemented. The repository already has the main source-side prerequisites for a bounded D&D export proof: lossless CharacterDocument/native state, concrete D&D equipment/resources/features/spells, and a clean adapter boundary.

A first export-only slice would still need a versioned Foundry adapter, target Foundry/D&D schema versioning, Actor/Item mapping, fixture tests, export UX, and validation through a real Foundry import. Direct push/synchronization remains a later integration increment.

Do not pull Foundry implementation into Issue #14 unless explicitly reprioritized.

## Campaign / Rules-Profile Seam - Preserved

`packages/system-brp/src/campaignProfile.ts` remains the narrow BRP profile seam. `Generic BRP Core` v0.1 remains the only current profile. Reopen reconstructs effective rules from authoritative native state; profile identity remains provenance/configuration context rather than canonical rules state.

The rules-profile seam remains important to creation and persistence, but its provenance does not need a large block on the printed play sheet.

## Immediate Next Work Package - Owner Browser Re-check

Re-test the third QA repair in the actual browser before any further implementation:

1. In D&D Guided Mechanical, `Starting equipment` must show the actual equipment-package descriptions, not bare `A`, `B`, or `C`.
2. On BRP and D&D sheets, Print, Copy JSON, and Download JSON must display recognizable icons with useful hover text.
3. The sheet itself must not display `Character Forge` branding.
4. The sheet body must not display Rules Context, Rules Profile, generation method, or generation seed sections.
5. Browser print preview must contain only the dedicated character sheet, never the app header, rules-system selector, creator controls, result toolbar, or native-document inspector.
6. Confirm actual print preview is 1-2 physical pages for representative characters. If browser pagination still exceeds two pages because of content overflow, treat that as the next bounded layout defect rather than accepting extra pages.
7. Confirm Portrait and VTT Token spaces remain useful and do not crowd core play information.

Then resume the full BRP Issue #14 journey:

```text
create -> finish -> review -> save -> reopen -> print/export
```

Exercise multiple BRP professions, long labels/content, equipment, finishing details, profile persistence, JSON controls, actual print pagination/readability, and ordinary office-printer/grayscale behavior.

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
