---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- brp
- powers
---
# Next Development Prompt

The bounded BRP Superpowers and Psychic Abilities architecture probes are complete and automated-green on `dev`.

There is **no automatic follow-on implementation authorized by chronology**. Follow the user's explicitly selected product line.

## Bounded Re-entry

For any BRP continuation, begin with:

`python refs/tools/generate_agent_context.py --focus "BRP current product line"`

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/integration/brp-uge-orc.md`
3. `refs/implementation/fileMap.yaml`
4. the system-owned files for the explicitly selected slice.

If the selected work concerns Powers, inspect:

- `packages/system-brp/src/superpowers.ts`
- `packages/system-brp/src/poweredAdapter.ts`
- `packages/system-brp/src/superpowers.test.ts`
- `packages/system-brp/src/psychicAbilities.ts`
- `packages/system-brp/src/psychicAdapter.ts`
- `packages/system-brp/src/psychicAbilities.test.ts`

Prefer diff-first continuation and conserve agent context.

## Accepted Psychic Checkpoint

Implementation checkpoint:

- SHA: `ae35b556dfc177f12e9f934fedd455803c6b74c7`
- Actions: `34417631582`
- job: `102685926895`
- Verify: success
- 46 test files / 231 tests / 0 failures
- 178 tracked paths
- 14 required project-memory files
- OKF: 20 concepts / 10 indexes
- agent context: 3,818 characters
- build: `Character Forge build 0.0.1 ae35b556`

The final documentation head may be newer; use the current `dev` head at re-entry and preserve the implementation checkpoint above as the tested code milestone.

Promoted branches remain unchanged unless an explicit promotion decision is made:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion.

## What The Two Powers Probes Proved

BRP skill-construction level and power-system level are independent dimensions.

The existing `rulesProfile.powerLevel` remains the established Normal/Heroic skill-construction profile. Individual BRP power systems retain their own source-native state.

### Superpowers

The first probe uses a separate character-point grammar:

- source-derived character-point budget from initial characteristics;
- Normal/Heroic Superpowers levels independent of skill profile;
- Extra Energy;
- Extra Hit Points;
- direct powered effects on Power Points / Hit Points / Major Wound level.

### Psychic Abilities

The second probe uses a different grammar:

- Normal Psychic profile only in the current proof;
- exactly two starting abilities;
- Empathy and Mind Shield;
- base rating `POW x 1`;
- percentile ratings kept outside ordinary `skills`;
- personal `INT x 10` skill points may be reallocated into Psychic Ability training;
- ordinary personal skill spend plus Psychic training must equal the single personal pool;
- skill-construction starting cap still governs the resulting Psychic rating;
- Power Point use belongs to the ability's power semantics rather than ordinary skill state.

For rolled characters, Psychic base rating uses final starting POW after redistribution. This intentionally differs from Superpowers budgeting, which uses initial characteristics before redistribution.

`brp-character/0.1` remains sufficient and shared CharacterDocument remains unchanged.

## Stress-Test Decision Point

The original BRP second-system architecture stress-test goal is now substantially complete.

Do not continue implementing BRP features merely to make the stress-test issue larger. Future BRP work should be one of:

- explicit product breadth;
- a deliberately selected source-supported architecture probe;
- creator/runtime work required by a real user-facing BRP target;
- eventual exact-SHA promotion after the user decides accumulated BRP is ready.

A future Sorcery or Magic probe could test prepared/list-based capability grammars, but that is **not** automatically next and may provide less architecture value than defining the intended BRP product breadth.

## Do Not Add By Default

Do not automatically add:

- more Superpowers entries;
- more Psychic Abilities;
- Heroic/Epic/Superhuman Psychic profiles;
- Psychic professional-pool training;
- Scholar Psychic support;
- multiple simultaneous power systems/power sets;
- Magic, Mutations, or Sorcery;
- runtime Psychic activation/resistance/combat handling;
- BRP Powers creator UI;
- power randomization;
- D&D spell-state reuse;
- a universal cross-system power/capability ontology.

Each needs explicit product intent and a bounded source audit.

## Other Independently Selectable Product Lines

The user may instead explicitly select:

- close/reframe BRP Issue #13 and spin future BRP breadth into separate epics;
- BRP creator product breadth;
- random-table companion work with a real consumer;
- structured naming when a real setting/campaign provider exists;
- Foundry integration;
- character advancement/maintenance;
- D&D accumulated runtime QA/promotion;
- a deliberate resumption of parked D&D Guided Narrative.

Do not choose among these merely because one appears later in the roadmap.

## D&D Parking State

D&D Guided Narrative remains parked. Do not resume Cleric/Druid order-preference work unless explicitly instructed.

D&D Issue #11 remains the accumulated owner runtime-QA/promotion gate.

## Foundation Guardrails

Native system state is mandatory and lossless.

Never reconstruct retained native state from semantic projection. Shared creator code coordinates interactions only; system-owned rules, mappings, distributions, and content remain system-owned. Parchment remains system-agnostic. BRP power systems remain BRP-native until repeated cross-system evidence justifies anything shared. Preserve exact-SHA promotion provenance.

## Validation

For any future implementation milestone:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
