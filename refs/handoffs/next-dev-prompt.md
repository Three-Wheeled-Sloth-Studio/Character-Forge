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
python refs/tools/generate_agent_context.py --focus "browser QA standalone print document action affordance two page BRP D&D"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/product/creator-workspace.md`
3. `refs/architecture/adaptive-character-sheet-framework.md`
4. `refs/planning/brp-player-usability-gap-audit.md`
5. `refs/planning/brp-player-usable-core.md`
6. `refs/implementation/fileMap.yaml`
7. GitHub Issue #14
8. only sheet/print/export/save-reopen code needed to diagnose the next owner QA finding.

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Exact Green Implementation Checkpoint

The standalone-print browser-QA repair is green at:

- SHA: `a10d18e7c818c9c45afbd38f0d6f7a4cca473432`
- Actions: `34612582059`
- Job: `103306485403`
- `npm run verify`: green
- 57 test files / 277 tests / 0 failures
- 216 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- agent context: 4117 characters
- build: `Character Forge build 0.0.1 a10d18e7`

Documentation may be ahead of this implementation checkpoint. Validate the exact current `dev` SHA before declaring a new milestone green.

## Critical Change From QA Pass 5

After the sheet styles began loading correctly, owner QA confirmed icons were visible but found:

- compact sheet actions still looked too neutral/inactive; and
- both D&D and BRP print previews were still about eight pages of non-character-sheet material.

The shared Design Principles already require enabled buttons to look actionable before hover and compact icon actions to use circular or strongly rounded affordance with visible hover/active/focus states. Treat deviations as implementation defects, not a guidance gap.

The checkpoint above changes the print boundary:

- do not call `window.print()` on the running Character Forge page;
- `characterSheetControls.ts` creates a temporary off-screen iframe;
- the iframe `srcdoc` is a standalone HTML document containing only the rendered `.character-sheet` and sheet stylesheets;
- the iframe uses an `816 x 1056` desktop/letter-like viewport so narrow-screen media rules do not inflate pagination;
- print is invoked on the iframe's own `contentWindow` and the iframe is removed afterward;
- the old duplicate `character-print-root` path is removed from `main.ts`;
- sheet action buttons are circular, centered, visibly filled/bordered at rest, and have hover/active/focus styling;
- `sheet-ui.css` no longer overrides the shared action-button affordance;
- regression tests verify that the printable document contains sheet markup only and does not contain application-shell or rules-selector text.

## Immediate Task - Owner Browser Re-check

After pulling current `dev`, restart `npm run dev:web`, then verify both a D&D and BRP character:

1. Print, Copy JSON, and Download JSON are centered circular icon actions with visible enabled affordance before hover.
2. Hover text remains useful and text labels are not shoved into the toolbar.
3. Print preview contains only the character sheet. No Character Forge header, Rules system selector, creator controls, toolbar, JSON inspector, or other application text may appear.
4. Representative characters occupy no more than 1-2 physical print pages.
5. The print result remains readable in grayscale/ordinary office printing.
6. Portrait and VTT Token reserved spaces remain useful without crowding core play information.

If print is still over two pages, first determine whether the extra pages are actual character content overflow or non-sheet material. Do not add another application-level hide-selector workaround; keep the standalone print-document boundary and fix only the concrete sheet-density problem if one remains.

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
- The print target must be a standalone character-sheet document, never the running creator/application document.
- Internal generation IDs such as equipment `A/B/C` are not acceptable player-facing labels when the source owns meaningful labels.
- Rules/provenance belongs in a tiny footer at most, not a large sheet section.
- Enabled compact actions must look actionable before hover and should be circular/strongly-rounded icon-first controls.
- Static assets referenced by the browser must have explicit server/static paths; do not let missing CSS/JS silently fall through to SPA HTML.
- Portrait/token layout placeholders are not native rules state or Foundry schema.
- Do not implement Investigative Horror before Issue #14 closeout.
- Do not resume D&D Guided Narrative by chronology.
- Do not broaden D&D work beyond acceptance fixes during BRP closeout.
- Do not implement Fate early.
- Do not implement Foundry export/push unless explicitly reprioritized.
- Do not add a PDF-generation dependency unless the standalone browser-print document still demonstrates a concrete unresolved need.

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
