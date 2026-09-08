---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green BRP Universal Game Engine explicit plus standard-rolled characteristic checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Promoted baseline remains unchanged

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not implicitly promote either the accumulated D&D Level 1 batch or BRP work. Preserve exact-SHA `dev -> qa -> main` promotion.

## Current BRP automated-green code checkpoint

- code checkpoint: `fab012deed4a0f795aee3d163112f7fafb357c7f`
- Actions: `34230839209`
- job: `102076260630`
- refs / OKF green
- strict TypeScript green
- 27 test files / 129 tests / 0 failures
- BRP tests: 12
- web build green
- build identity: `Character Forge build 0.0.1 fab012de`
- BRP native schema: `brp-character/0.1`
- BRP adapter: `0.2.0`
- rules source: `chaosium-brp-uge-orc-1.05`

## D&D gate is still open and separate

D&D 5E 2024 mechanical SRD Level 1 breadth remains automated-green on `dev` at `55f79a1004c14eef1635e92c602e1fefa18cab15`, with 12 classes, 4 backgrounds, 9 species, and all 108 class/species combinations covered.

Issue #11 remains open for the requested accumulated owner runtime QA and exact-SHA promotion. BRP work does not waive that gate.

## Read first

1. `AGENTS.md`
2. `refs/README.md`
3. `refs/project.yaml`
4. `refs/handoffs/currentHandoff.md`
5. `refs/architecture/character-architecture.md`
6. `refs/architecture/brp-second-system-premortem.md`
7. `refs/architecture/translation-bridge-rpg-notes.md`
8. `refs/integration/brp-uge-orc.md`
9. `refs/planning/roadmap.yaml`
10. `refs/testing/validationCommands.yaml`
11. `packages/system-brp/src/nativeCharacter.ts`
12. `packages/system-brp/src/characteristicGeneration.ts`
13. `packages/system-brp/src/firstSlice.ts`
14. `packages/system-brp/src/adapter.ts`
15. `packages/system-brp/src/firstSlice.test.ts`
16. `packages/system-brp/src/standardCharacteristicGeneration.test.ts`
17. GitHub issue #13

## Source boundary

Implement Basic Roleplaying: Universal Game Engine, 2023 ORC content, pinned to corrections `CHA2036 BRP UGE Corrections 1.05` for the current adapter family.

Do not use the older 2020 online BRP SRD as implementation authority.

Do not import Call of Cthulhu-specific protected content. Keep call-of-cthulhu as a separately licensed future product target.

## What is now proven

Two characteristic-generation methods converge on one native schema:

- explicit entry;
- deterministic standard rolling.

Standard rolling retains the seed, raw dice, notation, modifiers, initial characteristic values, explicit up-to-three-point redistribution transfers, matching native adjustment layers, and final values. Adapter validation replays the seed-derived dice and independently checks redistribution causality.

This second RPG now confirms a principle previously observed in D&D: generation method can remain primarily provenance while multiple construction paths converge on one validated native ontology.

Do not create a new BRP native schema for the next generation method or power level unless source rules actually require one.

## Immediate implementation slice: Heroic power-level profile

Use Heroic as the next BRP architecture stress test. Keep powers themselves disabled; this slice is about campaign power-level context changing character construction, not about implementing a BRP power system yet.

The selected ORC source specifies:

- Normal: 250 professional skill points, starting skill cap 75%.
- Heroic: 325 professional skill points, starting skill cap 90%.
- Personal skill points remain INT x 10.

The target is profile-aware construction and validation, not a duplicate Heroic builder.

Required behavior:

- expand the BRP native rules profile to support Normal and Heroic;
- parameterize professional skill budget and starting cap from the retained power level;
- route both explicit and standard-rolled characteristics through the same profile-aware first-slice construction path;
- preserve the same `brp-character/0.1` schema if it remains sufficient;
- independently validate that budget totals, skill caps, and downstream skill ratings match the retained power level;
- retain the selected power level in generation recipe/provenance;
- add cross-profile tests proving the same skill allocation can be legal or illegal depending on the retained profile where source rules say so;
- keep personal skill points at INT x 10;
- keep Detective as the representative profession for this slice so profession breadth does not confound the power-level test;
- preserve non-powered `enabledPowerSystems: []` state;
- keep explicit and standard-rolled characteristic-generation behavior unchanged except where the power profile legitimately affects it.

## Age interaction must not be skipped

Heroic exposes an important source interaction that Normal largely hid: age can alter professional skill points.

The UGE default starting age is `17+1d6`. For each full 10 years added beyond the rolled starting age, Heroic adds 20 professional skill points. The source also defines below-minimum-age effects and later characteristic aging rules.

Do not simply change 250 to 325 while continuing to accept arbitrary ages as mechanically inert.

For this slice, first choose and document the narrowest source-faithful age boundary that isolates the Heroic profile test. Good options include retaining the rolled/default starting-age provenance or explicitly constraining the fixture age so no age-based professional bonus applies. Do not silently ignore age rules while claiming general Heroic support.

Age 50+ characteristic aging and EDU remain out of scope unless the chosen test profile forces them in.

## Validation target

The automated gate should prove at minimum:

- existing Normal explicit and standard-rolled characters still validate;
- Heroic explicit and standard-rolled characters use the retained Heroic rules profile;
- Heroic professional budget is source-correct for the chosen age boundary;
- Heroic starting cap is 90%;
- Normal remains 75%;
- personal budget remains INT x 10 in both profiles;
- adapter rejects profile/budget/cap mismatches independently of the builder;
- CharacterDocument round trip preserves power-level context and generation provenance;
- no shared CharacterDocument or semantic schema change is introduced without evidence.

## After Heroic

Reassess the next BRP stressor from evidence. Strong candidates are:

- a second profession with materially different skill-choice branching;
- age/experience expansion if Heroic exposes a reusable native age-provenance seam;
- the first optional BRP subsystem only if rules-profile validation still needs a stronger test.

Do not choose based only on catalog breadth.

Keep BRP creator UI deferred until the backend profile and generation paths are stable enough to expose honestly.

## Architecture rules

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Do not change shared CharacterDocument or semantic contracts without concrete cross-system evidence.
- BRP profession is not D&D class.
- Preserve skill base chance, professional contribution, personal contribution, and final rating separately when causality matters.
- Keep open specialties source-owned; do not freeze a universal specialty enum.
- Preserve effective BRP rules-profile context in native state.
- Do not model future BRP powers through D&D spell-state structures.
- Generator-core remains system-neutral.
- Parchment remains ignorant of system-specific mechanics.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Parallel product work

The system-neutral random-table companion remains `ready_for_discovery` and should not be forgotten. Its eventual first consumers remain traits, ideals, bonds, flaws, equipment/trinkets, tags/native IDs, weighted results, and provenance-bearing subtable references.
