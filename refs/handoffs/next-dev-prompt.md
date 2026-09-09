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

The first bounded BRP Superpowers architecture proof is complete and automated-green on `dev`.

There is **no automatic follow-on implementation authorized by chronology**. Follow the user's explicitly selected product line.

## Bounded Re-entry

If continuing BRP Powers work, begin with:

`python refs/tools/generate_agent_context.py --focus "BRP power-system architecture"`

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/integration/brp-uge-orc.md`
3. `refs/implementation/fileMap.yaml`
4. `packages/system-brp/src/superpowers.ts`
5. `packages/system-brp/src/poweredAdapter.ts`
6. `packages/system-brp/src/superpowers.test.ts`
7. targeted existing BRP builder/native files only when required.

Prefer diff-first continuation and conserve agent context.

## Accepted Superpowers Checkpoint

Implementation checkpoint:

- SHA: `bc0a05fb9b96c9777a73726100828712cd8bbb41`
- Actions: `34413436457`
- job: `102672848273`
- Verify: success
- 45 test files / 223 tests / 0 failures
- 175 tracked paths
- 14 required project-memory files
- OKF: 20 concepts / 10 indexes
- agent context: 3,730 characters
- build: `Character Forge build 0.0.1 bc0a05fb`

The final documentation head may be newer; use the current `dev` head at re-entry and preserve the implementation checkpoint above as the tested code milestone.

Promoted branches remain unchanged unless an explicit promotion decision is made:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion.

## What The First Powers Slice Proved

BRP skill-construction level and power level must remain separate dimensions.

The current `rulesProfile.powerLevel` remains the established Normal/Heroic skill-construction profile. The optional Superpowers state owns its own independent Normal/Heroic power level.

A test explicitly retains Normal skill construction with Heroic Superpowers.

`brp-character/0.1` did not require a schema bump. Existing non-powered documents remain valid.

Implemented Superpowers are intentionally only:

- Extra Energy;
- Extra Hit Points.

The retained Superpowers state includes:

- system ID;
- independent power level;
- source budget method;
- highest initial characteristic basis;
- total/spent/remaining character points;
- exact power IDs, levels, and costs.

Powered derived state applies Extra Energy to Power Points and Extra Hit Points to Hit Points / Major Wound level.

For standard-rolled characters, the Superpowers budget uses initial characteristic values before redistribution.

## Candidate Next Architecture Probe

If the user explicitly asks to continue BRP Powers architecture, prefer a **Psychic Abilities verification slice** before broadening Superpowers.

Why Psychic is the useful contrast:

- it is a distinct BRP power system rather than another Superpower entry;
- abilities are skill-rated;
- they can interact with personal skill-point allocation;
- they commonly consume Power Points;
- their source grammar therefore differs materially from Superpowers character-point purchasing.

Before implementation, verify exact source behavior and choose the smallest legal Psychic subset that demonstrates the grammar without inventing a universal ability ontology.

If that evidence fits the existing optional power-system union, extend it. If not, change BRP-native state based on the source evidence. Do not modify shared CharacterDocument merely to make the systems look alike.

## Do Not Add By Default

Do not automatically add:

- the full Superpowers catalog;
- Epic or Superhuman power levels;
- power failings or modifiers;
- fixed GM character-point budgets;
- Magic, Mutations, Sorcery, or Psychic systems without a bounded source audit;
- BRP Powers creator UI;
- power randomization;
- D&D spell-state reuse;
- a universal cross-system power/capability ontology.

The current slice is a backend architecture proof, not a claim of broad BRP power support.

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
