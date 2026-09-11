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
python refs/tools/generate_agent_context.py --focus "browser QA isolated print equipment labels sheet icons two page BRP reopen"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/product/creator-workspace.md`
3. `refs/architecture/adaptive-character-sheet-framework.md`
4. `refs/planning/brp-player-usability-gap-audit.md`
5. `refs/planning/brp-player-usable-core.md`
6. `refs/implementation/fileMap.yaml`
7. GitHub Issue #14
8. only creator-label, sheet, print, export, save/reopen code needed to diagnose the next owner QA finding.

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Exact Green Starting Checkpoint

The character-only sheet / isolated-print QA repair is green at:

- SHA: `ee63a0752e33e56aa94bce03e2ec69fa6099fc77`
- Actions: `34608731990`
- Job: `103293561221`
- `npm run verify`: green
- 57 test files / 276 tests / 0 failures
- 216 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- agent context: 4140 characters
- build: `Character Forge build 0.0.1 ee63a075`

Documentation may be ahead of this implementation checkpoint. Validate the exact current `dev` SHA before declaring a new milestone green.

## Owner QA So Far

### Pass 1 - creator workspace

The first browser pass found containment, button-affordance, splitter, and BRP Randomize All defects. They were repaired at `6110dc4d58a7949a0df0da0f189bbab0a033ef61`.

### Pass 2 - D&D dedicated result

The second pass showed D&D still on an older custom result path with internal equipment-choice IDs and no visible dedicated print path. D&D was moved onto the system-owned adaptive sheet framework at `caff03275bc714f7189a5c7c9e30daeddd1a12b4`.

### Pass 3 - actual browser labels/icons/print

The third pass showed that the intended repairs still did not match the browser experience:

- D&D Guided Mechanical `Starting equipment` still showed raw `A/B/C` labels;
- BRP document-action buttons rendered empty because the SVGs lacked visible stroke styling;
- `Character Forge` branding remained on the character sheet;
- rules/provenance material occupied sheet space; and
- browser Print included the application/creator shell, yielding many pages instead of the intended 1-2 page character sheet.

The starting checkpoint repairs those exact defects:

- choice-pool display reconciliation now compares IDs **and labels**, restoring richer equipment labels when another render path replaces them with raw codes;
- toolbar SVGs have explicit visible stroke styling;
- product branding is removed from sheet headers;
- large rules/provenance sections are removed from BRP and D&D sheets and reduced to tiny footer notes;
- a dedicated `character-print-root` contains only sheet HTML; and
- print CSS hides the full `.forge-shell` and shows only the print root.

A print-contract regression test now locks the hard separation between application UI and printable sheet.

## Current Sheet Contract

The supported path is:

```text
authoritative native character state
    -> system-owned sheet projection
    -> shared presentation-only renderer
    -> screen sheet
    -> isolated print-only sheet root
```

Current system projections:

- BRP: `packages/system-brp/src/sheetProjection.ts`
- D&D: `packages/system-dnd5e/src/sheetProjection.ts`

The logical model has exactly two pages for both systems. Rules/source identity is a tiny footer note only. Generation provenance, creator UI, native-document inspection, app branding, and document-action controls are not part of the printed sheet.

The first page still reserves Portrait and VTT Token presentation space. No image asset reference or Foundry-specific path has been added to native rules state.

## Immediate Task - Owner Browser Re-check

Use the actual browser and verify these exact points before any further feature implementation:

1. In D&D Guided Mechanical, select multiple classes and inspect `Starting equipment`. It must show real package descriptions such as the gear/gold option text, never bare `A`, `B`, or `C`.
2. Build both a D&D and BRP character. The result toolbar must show recognizable Print, Copy JSON, and Download JSON icons with useful hover text.
3. The sheet itself must not say `Character Forge`.
4. No Rules Context, Rules Profile, generation method, or generation seed block should consume player-facing sheet space.
5. Open browser Print / Save as PDF. The preview must contain only the character sheet, never the Character Forge header, rules-system selector, generation controls, app toolbar, or JSON inspector.
6. Confirm representative characters occupy no more than 1-2 physical print pages. If a logical page overflows into a third physical page, capture the case and treat it as a bounded density/layout defect.
7. Confirm Portrait and VTT Token spaces remain useful without crowding core at-table content.

Do not infer browser acceptance from the automated structural tests. The current tool environment cannot see the owner's local print preview.

## Then Complete BRP Issue #14 Acceptance

After the sheet re-check passes, run the full BRP journey:

```text
create -> finish -> review -> save -> reopen -> print/export
```

Exercise at least three BRP characters:

1. Detective, Normal, explicit characteristics, selected pistol and armor, populated finishing details.
2. Scholar, standard-rolled characteristics, deliberately long language/specialty labels, equipment, and background text.
3. Athlete, Beggar, or Custom Profession, preferably Heroic for one case, with enough content to stress the sheet and reopen path.

Verify exact effective rules, profession choices, skills, equipment, finishing data, Copy JSON, Download JSON, browser Print / Save as PDF, physical page count, and ordinary-printer readability survive the full flow.

## Foundry Boundary - Do Not Implement Yet Without Reprioritization

Foundry D&D export remains relatively close from a source-data perspective but is planned rather than implemented. A bounded export-only proof still needs the versioned adapter, target Foundry/D&D schema version, Actor/Item mapping, fixtures, export action, and real Foundry import validation. Direct push/sync remains a later increment.

Portrait/token references should come from a future Parchment Worlds character-asset relationship and be mapped by the Foundry adapter. Do not store Foundry paths or IDs in native D&D/BRP state.

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
- The print target must be character sheet only; never print creator/application chrome.
- Internal generation IDs such as equipment `A/B/C` are not acceptable player-facing labels when the source owns meaningful labels.
- Rules/provenance belongs in a tiny footer at most, not a large sheet section.
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
