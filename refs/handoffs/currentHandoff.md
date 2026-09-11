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
---
# Current Handoff

Date: 2026-09-11
Branch: `dev`
Active epic: GitHub Issue #14 - **Make BRP UGE a player-usable core character generator**

## Current Direction

BRP Player-Usable Core remains in browser acceptance. The first owner/browser QA pass found material creator-workspace defects before character-sheet QA began. Those defects are now remediated in code, but Issue #14 remains open until the owner verifies the fixes in the real browser and completes the deferred sheet/save/reopen/print pass.

Accepted sequence remains:

1. close BRP Player-Usable Core after browser acceptance;
2. BRP Investigative Horror;
3. bounded Fate Condensed third-system probe;
4. Universal Grammar v0.1 from D&D + BRP + Fate evidence.

D&D Guided Narrative remains intentionally parked. Do not resume it by chronology.

## Exact Green QA-Remediation Checkpoint

The first browser-QA blocker repair is green at:

- SHA: `6110dc4d58a7949a0df0da0f189bbab0a033ef61`
- Actions: `34603217834`
- Job: `103275340363`
- `npm run verify`: green
- 55 test files
- 269 tests passed
- 0 failures
- 212 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- Agent context: 3804 characters
- Build: `Character Forge build 0.0.1 6110dc4d`

Any later documentation or implementation head requires its own exact-head Verify before being called green.

## First Browser QA Findings And Remediation

Owner QA on 2026-09-11 found four related workspace/interaction defects plus a functional Randomize All defect:

1. action buttons were too square and too close to input/select geometry;
2. enabled actions looked muted enough to read as disabled;
3. compact actions were wordy instead of icon-first;
4. BRP creator elements could overflow/clamp through the left panel, with the profession suggestion action visibly clipped; and
5. BRP `Randomize All` only orchestrated profession suggestion plus characteristic reroll, so ordinary identity, specialties, and allocations appeared unchanged.

The repair at `6110dc4d58a7949a0df0da0f189bbab0a033ef61` adds:

- stronger enabled-button affordance and visibly rounder action geometry than form inputs/selects;
- icon-first randomize/re-roll/suggest controls with tooltip/ARIA labels;
- a compact two-dice `Randomize All` action;
- containment-safe flexible BRP grids and skill rows instead of fixed child widths that could escape the pane;
- a bounded, draggable and keyboard-operable splitter between creator and result panes, with local width persistence and narrow-layout collapse;
- a real BRP whole-character randomization pass over display name, age, gender, supported profession, legal wealth/electives, characteristics, Scholar specialties, and fully spent legal skill allocations; and
- regression coverage for legal/deterministic BRP whole-character randomization and splitter bounds.

BRP whole-character randomization preserves campaign/rules settings, the chosen characteristic-generation method, freeform language identities, and finishing/background details. Native construction and adapter validation remain authoritative.

## Shared Design Guidance Updated

The studio-wide guidance was updated in `Three-Wheeled-Sloth-Studio/TWS-Design-Principles`:

- commit: `b0af7cc5a4086b0306ab1de16bc14ad60e9600ce`
- workflow: `Validate TWS Design Principles`
- Actions: `34602603904`
- result: green

`apps/Studio-UI-Style-Guide.md` now explicitly covers:

- panel containment;
- bounded resizable split panes;
- buttons being more rounded than neighboring form controls;
- enabled actions visually reading as active;
- icon-first compact actions with tooltip/accessibility labels; and
- anti-patterns for clipped controls, rigid two-pane widths, and action/input ambiguity.

Character Forge's own `refs/product/creator-workspace.md` mirrors and specializes those standards for creator workspaces.

## Campaign / Rules-Profile Seam - Preserved

`packages/system-brp/src/campaignProfile.ts` owns the narrow BRP profile seam.

The first active profile remains:

- stable ID: `generic`;
- label: `Generic BRP Core`;
- profile version: `0.1`; and
- defaults: Normal power level, Explicit characteristics, no enabled optional rules, no enabled power systems.

The profile reference and effective rules state remain separate:

```text
versioned profile reference
    -> explicit profile defaults when selected
    -> effective BrpRulesProfile retained in native state
```

Reopen reconstructs effective rules from authoritative native state. Randomize All does not reinterpret campaign/rules configuration.

No Investigative Horror content, Sanity configuration, Call of Cthulhu content, or universal profile model was introduced.

## Adaptive Character Sheet First Proof - Still Awaiting Owner Acceptance

The adaptive character-sheet implementation remains structurally green:

```text
authoritative native character state
    -> system-owned sheet projection
    -> shared character-sheet renderer
    -> screen / browser print / PDF-via-print
```

BRP has a two-page play-oriented sheet, browser Print / Save as PDF, and full CharacterDocument Copy JSON / Download JSON controls.

However, the owner explicitly deferred sheet testing when the creator-workspace defects were found. Do not claim sheet/browser acceptance is complete from automated tests alone.

## Player-Usable BRP Coverage

The bounded v0.1 implementation includes:

1. explicit and standard-rolled characteristics plus Normal and Heroic creation;
2. Detective, Scholar, Athlete, Beggar, and BRP-native Custom Profession;
3. broader ordinary skills, open specialties/languages, and exact allocation causality;
4. actionable allocation and validation UX;
5. bounded equipment, armor, modern pistols, and starting-weapon eligibility;
6. optional appearance/background/identity finishing state;
7. lossless save/reopen;
8. adaptive two-page review and browser print/Save as PDF;
9. full CharacterDocument JSON copy/download;
10. versioned BRP campaign/rules-profile selection; and
11. a player-facing BRP whole-character randomizer plus a bounded resizable creator/result workspace.

## Immediate Next Work Package - Owner Browser Re-check, Then Sheet QA

First re-check the defects that blocked the initial QA pass:

1. At the normal desktop width, no creator control, action, label, or row crosses/clips through the left panel.
2. Drag the creator/result splitter both directions and confirm both panes remain usable and contained.
3. Focus the splitter and verify keyboard Left/Right adjustments work; narrow the browser enough to confirm normal one-column collapse.
4. Enabled action buttons read as clickable, are visibly rounder than inputs/selects, and compact randomize/suggest actions use icons with useful hover text.
5. BRP `Randomize All` visibly changes identity and mechanical state in one click: name, age, gender, profession/wealth, characteristics or roll seed, profession-specific choices/specialties, and skill allocations. Budgets should end fully spent and Generate should be viable when the randomized state is otherwise complete.

Only after those checks pass, resume the deferred full player journey:

```text
create -> finish -> review -> save -> reopen -> print/export
```

Then exercise multiple professions, long labels/content, equipment, finishing details, profile persistence, JSON controls, and actual browser Print / Save as PDF pagination/readability.

Treat any remaining visual or workflow defect as a bounded Issue #14 fix. Do not use QA as an excuse to broaden profession catalogs, enable optional BRP systems, retrofit D&D, or start Investigative Horror early.

Close Issue #14 only after this real-browser pass satisfies the player-usable acceptance target.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP state remains canonical and lossless.
- Preserve `brp-character/0.1`.
- Preserve canonical adapter identity `0.7.0`.
- Profile identity is provenance/configuration context, not canonical rules state.
- Profile selection is BRP-owned and is not Universal Grammar.
- Profession is not class.
- Open specialties and languages remain source-owned.
- UI, review, sheet, export, profile controls, randomization, and splitter behavior are projections or interaction layers over native state.
- Shared sheet code owns presentation mechanics only.
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
