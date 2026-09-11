---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- brp
- productization
- browser-qa
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

The active epic is GitHub Issue #14: **Make BRP UGE a player-usable core character generator**.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "BRP player usable browser QA randomize splitter sheet print reopen"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/product/creator-workspace.md`
3. `refs/planning/brp-player-usability-gap-audit.md`
4. `refs/planning/brp-player-usable-core.md`
5. `refs/architecture/adaptive-character-sheet-framework.md`
6. `refs/planning/brp-investigative-horror-profile.md`
7. `refs/implementation/fileMap.yaml`
8. GitHub Issue #14
9. only creator/layout/randomization/review/save/reopen/print/profile code needed to diagnose defects found by QA.

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Exact Green QA-Remediation Checkpoint

The first owner/browser QA blocker repair is green at:

- SHA: `6110dc4d58a7949a0df0da0f189bbab0a033ef61`
- Actions: `34603217834`
- Job: `103275340363`
- `npm run verify`: green
- 55 test files / 269 tests / 0 failures
- 212 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- agent context: 3804 characters
- build: `Character Forge build 0.0.1 6110dc4d`

Documentation may be ahead of this implementation checkpoint. Validate the exact current `dev` SHA before declaring a new milestone green.

The related shared-design update is `Three-Wheeled-Sloth-Studio/TWS-Design-Principles` commit `b0af7cc5a4086b0306ab1de16bc14ad60e9600ce`, validated green in Actions `34602603904`.

## First Owner QA Outcome

The initial browser pass stopped before sheet testing because the creator workspace exposed material usability defects:

- clickable buttons looked too square/muted;
- compact actions were too text-heavy;
- controls could overflow the left panel;
- there was no adjustable divider between creator and result panes; and
- BRP `Randomize All` did not behave like a whole-character randomizer.

Those findings are remediated at the checkpoint above. Issue #14 remains open because the owner has not yet re-accepted the repaired browser experience.

## Current Product State

The bounded BRP Player-Usable Core implementation now includes:

- explicit and standard-rolled characteristics;
- Normal and Heroic creation;
- Detective, Scholar, Athlete, Beggar, and Custom Profession;
- broad ordinary skills plus open Scholar specialties/languages;
- exact professional/personal allocation causality and actionable validation UX;
- bounded equipment, armor, modern pistols, and weapon eligibility;
- optional identity/background finishing details;
- lossless save/reopen;
- adaptive two-page BRP sheet through the shared presentation-only renderer;
- browser Print / Save as PDF;
- full CharacterDocument Copy JSON / Download JSON;
- a BRP-owned versioned campaign/rules-profile seam with `Generic BRP Core` as the only current active profile;
- a bounded resizable creator/result split pane with keyboard support; and
- a real BRP whole-character `Randomize All` pass that produces legal, fully allocated state.

The profile reference is provenance, not authority. Reopen reconstructs the exact effective `BrpRulesProfile` from native state and does not reapply today's profile definition. Explicit profile selection is the action that applies current defaults.

BRP `Randomize All` preserves campaign/rules configuration, the selected characteristic-generation method, freeform language identities, and finishing/background details while randomizing supported identity, profession, characteristic, specialty, and allocation state.

## Immediate Task - Re-check QA Blockers Before Sheet Acceptance

Use the actual browser and first confirm the repaired creator experience:

1. No creator control, action, label, or row clips through the left panel at the normal desktop width.
2. Drag the creator/result splitter both directions and verify both panes remain contained and usable.
3. Verify keyboard Left/Right adjustments on the focused splitter and normal one-column collapse at narrow width.
4. Enabled actions clearly read as clickable, buttons are visibly rounder than inputs/selects, and compact randomize/suggest/re-roll actions are icon-first with useful hover text.
5. Click BRP `Randomize All` and confirm an obvious whole-character change: name, age, gender, profession/wealth, characteristics or roll seed, applicable electives/specialties, and skill allocations. Professional and personal budgets should be fully spent and the result should remain legal.

If any of these still fail, make the smallest evidence-backed fix and add structural regression coverage where practical. Do not begin sheet acceptance while a creator blocker remains.

## Then Resume Representative Sheet / Persistence QA

After the repaired creator passes, run the complete player journey:

```text
create -> finish -> review -> save -> reopen -> print/export
```

Exercise at least three characters:

1. Detective, Normal, explicit characteristics, selected pistol and armor, populated finishing details.
2. Scholar, standard-rolled characteristics, deliberately long language/specialty labels, equipment, and background text.
3. Athlete, Beggar, or Custom Profession, preferably Heroic for one case, with enough content to stress the sheet and reopen path.

For each useful case verify:

- Generate becomes available through understandable allocation guidance or legal Randomize All output.
- Review shows the expected native-state-derived data.
- Profile selector shows retained/current profile context without implying the label is canonical rules state.
- Save and reopen preserve effective BRP rules, profession choices, skills, equipment, and finishing information.
- Copy JSON and Download JSON operate on the complete CharacterDocument.
- Browser Print and Save as PDF preview contain only the character sheet, not creator/application/debug chrome.
- Page 1 remains table-usable and Page 2 contains depth/logistics content.
- No clipping, unreadable overlap, accidental blank sections, or pathological page breaks occur.
- Long skill/specialty/background content behaves acceptably.
- Grayscale/ordinary office-printer readability is acceptable.

## Issue #14 Acceptance

If representative browser QA succeeds after any bounded fixes:

1. update the maintained audit and handoff documents with exact final provenance;
2. record the acceptance evidence on Issue #14; and
3. close Issue #14.

If a material player-usable defect remains, keep Issue #14 open and document the specific blocker.

## Guardrails

- Native system state is mandatory and lossless.
- Native BRP state remains canonical and lossless.
- Preserve `brp-character/0.1`.
- Preserve canonical adapter identity `0.7.0`.
- Preserve exact-SHA `dev -> qa -> main` promotion.
- Profile identity is provenance/configuration context, not effective rules authority.
- Campaign/profile is not Universal Grammar.
- Profession is not class.
- Do not import Call of Cthulhu-only/branded content.
- Do not implement Investigative Horror before Issue #14 closeout.
- Do not retrofit D&D to the adaptive sheet renderer.
- Do not implement Fate early.
- Do not add a PDF-generation dependency unless browser output has demonstrated a concrete unresolved need.
- Keep whole-character randomization as an interaction over supported native choices; do not invent universal identity/profile semantics from convenience randomizer content.

## After Issue #14

Proceed to BRP Investigative Horror using the now-proven profile seam. Re-check current official BRP ORC/license sources before implementing that profile's substantive rules/content. After Investigative Horror, proceed to the bounded Fate Condensed probe and only then Universal Grammar v0.1.

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
