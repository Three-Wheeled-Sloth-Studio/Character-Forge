---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- brp
- productization
---
# Current Handoff

Date: 2026-09-10
Branch: `dev`
Active epic: GitHub Issue #14 - **Make BRP UGE a player-usable core character generator**

## Current Direction

The BRP second-system architecture stress test is complete. The active work is productizing the existing BRP UGE 2023 ORC / corrections 1.05 implementation into a narrow, credible player-facing character generator.

Accepted sequence remains:

1. BRP Player-Usable Core;
2. BRP Investigative Horror;
3. bounded Fate Condensed third-system probe;
4. Universal Grammar v0.1 from D&D + BRP + Fate evidence.

Do not skip ahead by chronology.

## Current BRP Player-Usable Core State

The bounded usability audit is at `refs/planning/brp-player-usability-gap-audit.md`.

Completed player-facing slices now include:

1. broader ordinary skill support plus correct professional/personal allocation causality;
2. Athlete, Beggar, and source-shaped Custom Profession, while preserving Detective and Scholar;
3. bounded source-audited equipment, armor, and modern pistol finishing with table-usable review projection; and
4. optional identity/background finishing fields for size/build, appearance, mannerisms/motto, reputation, personal item/keepsake, background, and beliefs.

The finishing slice follows BRP Steps Eight through Ten without introducing setting-owned name generation, a universal personality ontology, or implied mechanics for descriptive fields. The optional CHA-driven Distinctive Features rules remain deferred.

## Accepted Finishing Implementation Checkpoint

- SHA: `12277113316ac73ce89f34e5da1434a6ed431c70`
- Actions: `34518584917`
- Job: `103010142551`
- `npm run verify`: green
- 50 test files
- 247 tests passed
- 0 failures
- 199 tracked paths
- 14 required project-memory files
- OKF: 27 concepts / 10 indexes
- Agent context: 3651 characters
- Build: `Character Forge build 0.0.1 12277113`

The documentation-only commits after that checkpoint do not change the accepted implementation behavior and still require their own exact-head Verify before being called the current green head.

## Immediate Next Work Package

The next bounded slice is **allocation UX and validation clarity**.

Improve the existing BRP skill-allocation surface without weakening legality or replacing system-owned calculations. Prefer a small vertical UX pass that makes it obvious:

- how many professional points remain or are over budget;
- how many personal points remain or are over budget;
- which rows are profession-eligible versus personal-only;
- when a skill is at or above the current starting cap;
- what specific condition prevents generation; and
- what the player should change to resolve that condition.

Keep the current exact-budget and starting-cap validation authoritative. Do not move BRP rules into shared creator code merely to make the UI easier.

After allocation UX, the remaining v0.1 priorities are:

1. player-facing print/export projection;
2. the narrow campaign/rules-profile selection seam needed by Investigative Horror; and
3. representative owner browser QA / closeout.

Further profession/skill breadth should be added only when it closes a concrete player-use gap rather than as catalog completion for its own sake.

## Architecture Baseline To Preserve

- Native schema remains `brp-character/0.1`.
- Canonical adapter identity remains `0.7.0`; later validation layers preserve that established adapter-version contract.
- Native BRP state is canonical and lossless.
- UI, review, and future export are projections over native state.
- Profession is not class.
- Open specialties and languages remain source-owned.
- Equipment remains a native stable-ID list backed by source-owned catalog metadata.
- Descriptive finishing state remains optional and non-mechanical.
- Shared creator code coordinates interaction only; BRP owns BRP rules and content.
- No shared CharacterDocument change has been required.
- No universal power/capability/personality ontology should be inferred from the BRP implementation.

## Source / Licensing Boundary

Implementation authority remains the Basic Roleplaying: Universal Game Engine ORC Content Document, 2023, pinned to corrections 1.05.

Do not import Call of Cthulhu-only or other branded-game content. The later Investigative Horror profile is deliberately BRP-native and legally separate from Call of Cthulhu support.

## Branch / Promotion Boundary

Work directly on `dev`.

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D or BRP work.

D&D Guided Narrative remains intentionally parked. Do not resume it by chronology.

## Validation

Milestone gate:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.