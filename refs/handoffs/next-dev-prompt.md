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
python refs/tools/generate_agent_context.py --focus "BRP player usable browser QA print reopen"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/brp-player-usability-gap-audit.md`
3. `refs/planning/brp-player-usable-core.md`
4. `refs/architecture/adaptive-character-sheet-framework.md`
5. `refs/planning/brp-investigative-horror-profile.md`
6. `refs/implementation/fileMap.yaml`
7. GitHub Issue #14
8. only web/review/save/reopen/print/profile code needed to diagnose defects found by QA.

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Exact Green Starting Checkpoint

The BRP campaign/rules-profile seam is green at:

- SHA: `fabbc6567ffa8a9d4d24af9a940baa17a86a1b03`
- Actions: `34527156423`
- Job: `103038733378`
- `npm run verify`: green
- 53 test files / 263 tests / 0 failures
- 208 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- agent context: 3807 characters
- build: `Character Forge build 0.0.1 fabbc656`

Documentation may be ahead of this implementation checkpoint. Validate the exact current `dev` SHA before declaring a new milestone green.

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
- full CharacterDocument Copy JSON / Download JSON; and
- a BRP-owned versioned campaign/rules-profile seam with `Generic BRP Core` as the only current active profile.

The profile reference is provenance, not authority. Reopen reconstructs the exact effective `BrpRulesProfile` from native state and does not reapply today's profile definition. Explicit profile selection is the action that applies current defaults.

## Immediate Task - Representative Browser QA And Issue #14 Closeout

Run the actual web experience through the complete player journey:

```text
create -> finish -> review -> save -> reopen -> print/export
```

This is a product acceptance pass, not another architecture expansion.

### Representative cases

Exercise at least three characters:

1. Detective, Normal, explicit characteristics, selected pistol and armor, populated finishing details.
2. Scholar, standard-rolled characteristics, deliberately long language/specialty labels, equipment, and background text.
3. Athlete, Beggar, or Custom Profession, preferably Heroic for one case, with enough content to stress the sheet and reopen path.

For each useful case verify:

- Generate becomes available through understandable allocation guidance.
- Review shows the expected native-state-derived data.
- Profile selector shows the retained/current profile context without implying the label is canonical rules state.
- Save and reopen preserve effective BRP rules, profession choices, skills, equipment, and finishing information.
- Copy JSON and Download JSON operate on the complete CharacterDocument.
- Browser Print and Save as PDF preview contain only the character sheet, not creator/application/debug chrome.
- Page 1 remains table-usable and Page 2 contains depth/logistics content.
- No clipping, unreadable overlap, accidental blank sections, or pathological page breaks occur.
- Long skill/specialty/background content behaves acceptably.
- Grayscale/ordinary office-printer readability is acceptable.

### Fix boundary

If QA exposes a defect, make the smallest evidence-backed correction and add a structural regression test where practical. Do not broaden catalogs or architecture simply because a browser pass is being run.

Do not implement Investigative Horror substantive content during this QA slice.

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
