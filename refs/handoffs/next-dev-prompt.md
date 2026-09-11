---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- brp
- productization
- browser-qa
- character-sheet
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

The active epic is GitHub Issue #14: **Make BRP UGE a player-usable core character generator**.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "browser QA dedicated sheet D&D equipment print BRP reopen"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/product/creator-workspace.md`
3. `refs/architecture/adaptive-character-sheet-framework.md`
4. `refs/planning/brp-player-usability-gap-audit.md`
5. `refs/planning/brp-player-usable-core.md`
6. `refs/implementation/fileMap.yaml`
7. GitHub Issue #14
8. only sheet/review/export/save/reopen code needed to diagnose the next owner QA finding.

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Exact Green Starting Checkpoint

The D&D dedicated-sheet / export-control QA repair is green at:

- SHA: `caff03275bc714f7189a5c7c9e30daeddd1a12b4`
- Actions: `34605994371`
- Job: `103284429489`
- `npm run verify`: green
- 56 test files / 273 tests / 0 failures
- 215 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- agent context: 4449 characters
- build: `Character Forge build 0.0.1 caff0327`

Documentation may be ahead of this implementation checkpoint. Validate the exact current `dev` SHA before declaring a new milestone green.

The related shared-design update remains `Three-Wheeled-Sloth-Studio/TWS-Design-Principles` commit `b0af7cc5a4086b0306ab1de16bc14ad60e9600ce`, validated green in Actions `34602603904`.

## Owner QA So Far

### Pass 1 - creator workspace

The first browser pass found containment, button-affordance, resizable-pane, and BRP Randomize All defects. They were repaired at `6110dc4d58a7949a0df0da0f189bbab0a033ef61`.

### Pass 2 - D&D result / dedicated sheet

The next pass found:

- D&D starting equipment surfaced as `A/B` choice IDs rather than actual items;
- Copy/Download controls were text-heavy instead of icon-first;
- D&D had no visible Print / Save as PDF action; and
- D&D appeared to have no dedicated sheet result.

The checkpoint above repairs those findings by adding a D&D-owned sheet projection, routing D&D through the shared renderer, showing concrete native equipment/currency, providing icon-only Print/Copy/Download controls, and reserving first-page Portrait and VTT Token spaces for both current sheet systems.

Issue #14 remains open because the owner has not yet accepted actual browser sheet/print behavior.

## Current Sheet Architecture

The supported result path is now:

```text
authoritative native character state
    -> system-owned sheet projection
    -> shared presentation-only renderer
    -> screen / browser print / PDF-via-print
```

System projections:

- BRP: `packages/system-brp/src/sheetProjection.ts`
- D&D: `packages/system-dnd5e/src/sheetProjection.ts`

The D&D sheet reads concrete `payload.equipment` and `currencyGp`; generation option IDs such as `A/B/C` remain provenance/choice state and are not final player-facing equipment.

The shared renderer reserves Portrait and VTT Token layout space on Page 1. No image asset reference or Foundry-specific path has been added to native rules state.

## Immediate Task - Owner Browser Re-check

Use the actual browser and verify:

1. Build a D&D character using prepared starting equipment. The dedicated result sheet must show actual items and currency, not `A`, `B`, `C`, or `Equipment package`.
2. The sheet toolbar must show recognizable icon-only Print, Copy, and Download actions with useful hover text and accessible labels.
3. Print must open the browser Print / Save as PDF flow from the D&D result.
4. D&D should render as a dedicated two-page sheet, not the old long custom review list.
5. Page 1 must reserve visible Portrait and VTT Token spaces without damaging scan order or crowding key play information.
6. BRP should still render its own dedicated two-page sheet with the same shared toolbar/media treatment.
7. Inspect real print preview for clipping, page count, accidental blank pages, grayscale/readability, and removal of creator/debug chrome.

If any item fails, make the smallest evidence-backed fix and add structural regression coverage where practical.

## Then Complete BRP Issue #14 Acceptance

After the sheet re-check passes, run the complete BRP player journey:

```text
create -> finish -> review -> save -> reopen -> print/export
```

Exercise at least three BRP characters:

1. Detective, Normal, explicit characteristics, selected pistol and armor, populated finishing details.
2. Scholar, standard-rolled characteristics, deliberately long language/specialty labels, equipment, and background text.
3. Athlete, Beggar, or Custom Profession, preferably Heroic for one case, with enough content to stress the sheet and reopen path.

Verify profile context, exact effective rules, profession choices, skills, equipment, finishing data, Copy JSON, Download JSON, browser Print / Save as PDF, pagination, and ordinary-printer readability survive the full flow.

## Foundry Boundary - Do Not Implement Yet Without Reprioritization

Foundry D&D export is now relatively close from a source-data perspective but remains planned rather than implemented.

A bounded export-only proof would require:

1. a versioned `packages/foundry-adapter` boundary;
2. explicit target Foundry + D&D system version metadata;
3. mapping from authoritative D&D native state to Foundry Actor and embedded Item data;
4. compatibility/fixture tests;
5. an export action; and
6. manual validation by importing the result into a real supported Foundry environment.

Direct push/sync is a separate later increment requiring connection/auth, version discovery, asset transfer, update semantics, and eventual conflict/ownership rules.

Portrait/token asset references should come from a future character-asset relationship contract owned with Parchment Worlds, then be mapped by the Foundry adapter. Do not store Foundry paths or IDs in native D&D/BRP state.

The accepted product sequence remains Issue #14 closeout -> BRP Investigative Horror -> Fate probe -> Universal Grammar unless the owner explicitly reprioritizes Foundry work.

## Issue #14 Acceptance

If representative browser QA succeeds after any bounded fixes:

1. update maintained audit/handoff documents with exact final provenance;
2. record acceptance evidence on Issue #14; and
3. close Issue #14.

If a material player-usable defect remains, keep Issue #14 open and document the specific blocker.

## Guardrails

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical and lossless.
- Preserve `brp-character/0.1` and canonical BRP adapter identity `0.7.0` unless concrete evidence requires a change.
- Preserve exact-SHA `dev -> qa -> main` promotion.
- Profile identity is provenance/configuration context, not effective rules authority.
- Campaign/profile is not Universal Grammar.
- Profession is not class.
- Shared sheet code owns presentation mechanics only.
- Concrete native equipment belongs on the sheet; internal generation option IDs do not.
- Portrait/token layout placeholders are not native rules state or Foundry schema.
- Do not implement Investigative Horror before Issue #14 closeout.
- Do not resume D&D Guided Narrative by chronology.
- Do not broaden the D&D sheet into unrelated D&D feature work during BRP closeout.
- Do not implement Fate early.
- Do not implement Foundry export/push unless explicitly reprioritized.
- Do not add a PDF-generation dependency unless browser output demonstrates a concrete unresolved need.

## Branch / Promotion Boundary

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not promote either branch unless explicitly requested.

## Validation

For every repair or milestone:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
