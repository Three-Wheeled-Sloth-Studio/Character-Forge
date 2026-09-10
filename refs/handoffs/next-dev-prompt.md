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
python refs/tools/generate_agent_context.py --focus "BRP print export"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/brp-player-usability-gap-audit.md`
3. `refs/planning/brp-player-usable-core.md`
4. `refs/integration/brp-uge-orc.md`
5. `refs/implementation/fileMap.yaml`
6. GitHub Issue #14
7. the current Character Forge output/review/export files needed for the selected print/export slice.

Do not reread the entire repository history.

## Accepted Implementation Checkpoint

Allocation UX implementation:

- SHA: `04df62f64a17d780820e59b7d3f063ed379946c3`
- Actions: `34520028323`
- Job: `103014937323`
- 51 test files / 251 tests / 0 failures
- 200 tracked paths
- OKF: 27 concepts / 10 indexes
- agent context: 3788 characters
- build: `Character Forge build 0.0.1 04df62f6`

Documentation may be ahead of this implementation checkpoint. Always validate the exact current `dev` SHA before declaring a new milestone green.

## Current Player-Usable BRP Coverage

Implemented and retained through native state:

- explicit and standard-rolled characteristics;
- Normal and Heroic skill construction;
- Detective, Scholar, Athlete, Beggar, and Custom Profession;
- broader ordinary skill surface and open Scholar specialties/languages;
- exact professional/personal skill causality;
- player-facing allocation status with direct spend/remove guidance, profession eligibility, legal input ceilings, and cap headroom/overage;
- bounded equipment, armor, and modern pistols with table-use review details;
- starting-weapon 50% related-skill eligibility;
- optional finishing details: size/build, appearance, mannerisms/motto, reputation, personal item/keepsake, background, beliefs;
- save/reopen for the supported creator state;
- readable on-screen review.

Preserve `brp-character/0.1` and canonical adapter identity `0.7.0` unless concrete evidence proves they are insufficient.

## Immediate Task - Player-Facing Print/Export

Close the remaining output gap without creating another BRP rules model.

First inspect existing Character Forge export affordances. Reuse generic CharacterDocument JSON copy/download behavior if it already exists and is suitable. Then add the thinnest BRP-specific projection needed for a player to print or otherwise take a usable character away from the creator.

The printed/table-use projection should be sourced from authoritative native state and should include, where populated:

- display name, age/gender, profession, wealth, and BRP profile identity;
- characteristics and derived values;
- final skills, with enough causality only where useful to play/review;
- selected equipment with useful weapon/armor details;
- optional finishing details;
- rules source/profile identity sufficient to understand what was generated.

Keep debug/native-state inspection out of the normal printed sheet. Decide separately whether generation provenance belongs in the player sheet, a technical appendix, or JSON export.

Prefer browser-native printing plus reusable JSON export over a new PDF-generation dependency unless concrete product evidence requires otherwise.

Add focused tests for projection content and print/export controls. Do not make the export representation canonical state.

## Guardrails

- Native system state is mandatory and lossless.
- Native BRP state remains canonical.
- UI/review/export are projections.
- Profession is not class.
- Do not generalize a universal character-sheet schema from BRP.
- Do not enable optional BRP subsystems merely for output polish.
- The optional CHA-driven Distinctive Features rules remain deferred.
- Do not add setting-owned name generation.
- Do not import Call of Cthulhu-only/branded content.
- D&D Guided Narrative remains parked.

## After This Slice

Remaining v0.1 priorities are:

1. a narrow campaign/rules-profile selection seam for later Investigative Horror;
2. representative owner browser QA and Issue #14 closeout.

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
