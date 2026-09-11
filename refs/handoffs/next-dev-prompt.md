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
python refs/tools/generate_agent_context.py --focus "browser QA served sheet css isolated print icons BRP D&D"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/product/creator-workspace.md`
3. `refs/architecture/adaptive-character-sheet-framework.md`
4. `refs/planning/brp-player-usability-gap-audit.md`
5. `refs/planning/brp-player-usable-core.md`
6. `refs/implementation/fileMap.yaml`
7. GitHub Issue #14
8. only sheet/static-asset/print/export/save-reopen code needed to diagnose the next owner QA finding.

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Exact Green Implementation Checkpoint

The stylesheet-delivery browser-QA repair is green at:

- SHA: `5a8833d1b1e2ffccb298e30e71745108bc78a98b`
- Actions: `34610930531`
- Job: `103300946623`
- `npm run verify`: green
- 57 test files / 277 tests / 0 failures
- 216 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- agent context: 4158 characters
- build: `Character Forge build 0.0.1 5a8833d1`

Documentation may be ahead of this implementation checkpoint. Validate the exact current `dev` SHA before declaring a new milestone green.

## Critical Root Cause From QA Pass 4

The previous implementation had correct sheet and print CSS in the repository, but the local Character Forge server never served it.

`apps/web/index.html` referenced:

- `styles.css`
- `sheet.css`
- `sheet-ui.css`

`tools/web-server.mjs` served only `/styles.css` and `/dist/*`. Requests for `/sheet.css` and `/sheet-ui.css` fell through to the SPA fallback and returned `index.html` rather than CSS. This explains why:

- D&D and BRP toolbar buttons still looked empty;
- screen sheets looked like raw semantic text rather than character sheets; and
- print preview ignored the isolated print-root behavior and still showed the creator/application UI.

The checkpoint above explicitly serves both missing stylesheets, tests the referenced-asset/server-route contract, adds self-contained SVG stroke attributes, and removes visible designer page-role text from sheet headers.

## Immediate Task - Owner Browser Re-check

After pulling current `dev`, restart `npm run dev:web` so the fixed server routes are active, then verify:

1. D&D Guided Mechanical `Starting equipment` shows descriptive equipment/gold labels rather than bare `A/B/C`.
2. D&D and BRP result toolbars display recognizable Print, Copy JSON, and Download JSON icons.
3. D&D and BRP right-side results visibly render as styled character sheets rather than raw text.
4. The sheet does not display `Character Forge` branding or visible `Page 1 - At the table` / designer-role text.
5. Browser Print / Save as PDF contains only the dedicated sheet. No app header, system selector, creator controls, toolbar, or JSON inspector may appear.
6. Representative characters remain within 1-2 physical print pages and are readable in grayscale/ordinary office printing.

If any item fails, capture the actual browser result and make the smallest evidence-backed fix. Do not infer visual acceptance from automated structural tests.

## Then Complete BRP Issue #14 Acceptance

After the sheet re-check passes, run:

```text
create -> finish -> review -> save -> reopen -> print/export
```

Exercise at least three BRP characters:

1. Detective, Normal, explicit characteristics, selected pistol and armor, populated finishing details.
2. Scholar, standard-rolled characteristics, deliberately long language/specialty labels, equipment, and background text.
3. Athlete, Beggar, or Custom Profession, preferably Heroic for one case, with enough content to stress the sheet and reopen path.

Verify exact effective rules, profession choices, skills, equipment, finishing data, Copy JSON, Download JSON, browser Print / Save as PDF, physical page count, and ordinary-printer readability survive the full flow.

## Guardrails

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical and lossless.
- Preserve `brp-character/0.1` and canonical BRP adapter identity `0.7.0` unless concrete evidence requires a change.
- Preserve exact-SHA `dev -> qa -> main` promotion.
- Profile identity is provenance/configuration context, not effective rules authority.
- Campaign/profile is not Universal Grammar.
- Profession is not class.
- Shared sheet code owns presentation mechanics only.
- The print target must be character sheet only; never print creator/application chrome.
- Internal generation IDs such as equipment `A/B/C` are not acceptable player-facing labels when the source owns meaningful labels.
- Rules/provenance belongs in a tiny footer at most, not a large sheet section.
- Static assets referenced by the browser must have explicit server/static paths; do not let missing CSS/JS silently fall through to SPA HTML.
- Portrait/token layout placeholders are not native rules state or Foundry schema.
- Do not implement Investigative Horror before Issue #14 closeout.
- Do not resume D&D Guided Narrative by chronology.
- Do not broaden D&D work beyond acceptance fixes during BRP closeout.
- Do not implement Fate early.
- Do not implement Foundry export/push unless explicitly reprioritized.
- Do not add a PDF-generation dependency unless isolated browser printing still demonstrates a concrete unresolved need.

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
