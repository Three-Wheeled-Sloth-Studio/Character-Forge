---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- brp
- productization
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

The active epic is GitHub Issue #14: **Make BRP UGE a player-usable core character generator**.

Do not promote `qa` or `main` unless explicitly requested.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "BRP allocation UX"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/brp-player-usability-gap-audit.md`
3. `refs/planning/brp-player-usable-core.md`
4. `refs/integration/brp-uge-orc.md`
5. `refs/implementation/fileMap.yaml`
6. GitHub Issue #14
7. the BRP creator/state/view files needed for the allocation surface.

Do not reread the entire repository history.

## Accepted Implementation Checkpoint

Identity/background finishing implementation:

- SHA: `12277113316ac73ce89f34e5da1434a6ed431c70`
- Actions: `34518584917`
- Job: `103010142551`
- 50 test files / 247 tests / 0 failures
- 199 tracked paths
- OKF: 27 concepts / 10 indexes
- build: `Character Forge build 0.0.1 12277113`

Documentation may be ahead of this implementation checkpoint. Always validate the exact current `dev` SHA before declaring a new milestone green.

## Current Player-Usable BRP Coverage

Implemented and retained through native state:

- explicit and standard-rolled characteristics;
- Normal and Heroic skill construction;
- Detective, Scholar, Athlete, Beggar, and Custom Profession;
- broader ordinary skill surface and open Scholar specialties/languages;
- exact professional/personal skill causality;
- bounded equipment, armor, and modern pistols with table-use review details;
- starting-weapon 50% related-skill eligibility;
- optional finishing details: size/build, appearance, mannerisms/motto, reputation, personal item/keepsake, background, beliefs;
- save/reopen for the supported creator state;
- readable on-screen review.

Preserve `brp-character/0.1` and canonical adapter identity `0.7.0` unless concrete evidence proves they are insufficient.

## Immediate Task - Allocation UX and Validation Clarity

Improve the BRP skill-allocation experience without weakening or duplicating system-owned rules.

A player should be able to understand, at a glance:

- professional points spent, total, and remaining/overage;
- personal points spent, total, and remaining/overage;
- which skills accept professional points and which are personal-only;
- the active starting-skill cap and which rows are at or over it;
- why Generate is disabled; and
- the smallest obvious correction needed to make the character legal.

Prefer a bounded UI/state projection over a new allocation rules engine. Existing builders/adapters remain authoritative.

Useful files are likely to include:

- `apps/web/src/brpCreatorState.ts`
- `apps/web/src/brpCreatorPanelView.ts`
- `apps/web/src/brpCreatorPanel.ts`
- `apps/web/src/brpCreatorStyles.ts`
- focused BRP creator tests

Add or change system-package code only if the UI exposes a genuine missing BRP rule rather than a presentation problem.

## Guardrails

- Native BRP state remains canonical.
- UI/review/export are projections.
- Profession is not class.
- Do not generalize a universal allocation model from BRP.
- Do not enable optional BRP subsystems merely for UX polish.
- The optional CHA-driven Distinctive Features rules remain deferred.
- Do not add setting-owned name generation.
- Do not import Call of Cthulhu-only/branded content.
- D&D Guided Narrative remains parked.

## After This Slice

Remaining v0.1 priorities are:

1. player-facing print/export projection;
2. a narrow campaign/rules-profile selection seam for later Investigative Horror;
3. representative owner browser QA and Issue #14 closeout.

The longer accepted sequence remains BRP Player-Usable Core -> BRP Investigative Horror -> bounded Fate Condensed probe -> Universal Grammar v0.1.

## Branch / Promotion Boundary

Promoted branches remain:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every implementation milestone:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.