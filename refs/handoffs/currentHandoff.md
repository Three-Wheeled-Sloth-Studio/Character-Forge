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
3. bounded source-audited equipment, armor, and modern pistol finishing with table-usable review projection;
4. optional identity/background finishing fields for size/build, appearance, mannerisms/motto, reputation, personal item/keepsake, background, and beliefs; and
5. allocation UX that turns exact-budget, profession-eligibility, and starting-cap validation into visible player actions without moving rules out of BRP-owned builders/adapters.

## Accepted Allocation UX Implementation Checkpoint

- SHA: `04df62f64a17d780820e59b7d3f063ed379946c3`
- Actions: `34520028323`
- Job: `103014937323`
- `npm run verify`: green
- 51 test files
- 251 tests passed
- 0 failures
- 200 tracked paths
- 14 required project-memory files
- OKF: 27 concepts / 10 indexes
- Agent context: 3788 characters
- Build: `Character Forge build 0.0.1 04df62f6`

## Immediate Next Work Package

The next bounded slice is **player-facing print/export projection**.

Start by auditing the existing Character Forge output affordances so BRP reuses what already exists rather than inventing a second export framework. The v0.1 result should let a player take the completed BRP character away from the creator in a useful format while preserving native BRP state as the only authoritative rules model.

At minimum inspect:

- whether generic CharacterDocument JSON copy/download already exists and can be reused for BRP;
- whether the current BRP review can become a clean print projection with print-specific styling;
- which BRP details must appear in the printed/table-use view: identity, profession/wealth, characteristics, derived values, skills, equipment, finishing details, and source/profile identity;
- whether generation provenance belongs in the print view, export only, or an optional technical appendix; and
- browser behavior for printing without creator controls or debug/native-state inspectors.

Prefer a thin projection over native state. Do not create a second BRP sheet schema merely to print it.

After print/export, the remaining v0.1 priorities are:

1. the narrow campaign/rules-profile selection seam needed by Investigative Horror; and
2. representative owner browser QA / Issue #14 closeout.

Further profession/skill breadth should be added only when it closes a concrete player-use gap rather than as catalog completion for its own sake.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native schema remains `brp-character/0.1`.
- Canonical adapter identity remains `0.7.0`; later validation layers preserve that established adapter-version contract.
- Native BRP state is canonical and lossless.
- UI, review, and export are projections over native state.
- Profession is not class.
- Open specialties and languages remain source-owned.
- Equipment remains a native stable-ID list backed by source-owned catalog metadata.
- Descriptive finishing state remains optional and non-mechanical.
- Shared creator code coordinates interaction only; BRP owns BRP rules and content.
- No shared CharacterDocument change has been required.
- No universal power/capability/personality/allocation ontology should be inferred from the BRP implementation.

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
