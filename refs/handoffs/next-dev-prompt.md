---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green first BRP Universal Game Engine native slice.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Promoted baseline remains unchanged

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not implicitly promote either the accumulated D&D Level 1 batch or BRP work. Preserve exact-SHA `dev -> qa -> main` promotion.

## Current BRP automated-green checkpoint

- checkpoint: `da045ea71d9827ad756a706429399f2101f36498`
- Actions: `34225597834`
- job: `102058824469`
- refs / OKF green
- strict TypeScript green
- 26 test files / 123 tests / 0 failures
- BRP tests: 6
- web build green
- build identity: `Character Forge build 0.0.1 da045ea7`
- BRP native schema: `brp-character/0.1`
- BRP adapter: `0.1.0`
- rules source: `chaosium-brp-uge-orc-1.05`

## D&D gate is still open and separate

D&D 5E 2024 mechanical SRD Level 1 breadth remains automated-green on `dev` at `55f79a1004c14eef1635e92c602e1fefa18cab15`, with 12 classes, 4 backgrounds, 9 species, and all 108 class/species combinations covered.

Issue #11 remains open for the requested accumulated owner runtime QA and exact-SHA promotion. Starting BRP work does not waive that gate.

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
12. `packages/system-brp/src/firstSlice.ts`
13. `packages/system-brp/src/adapter.ts`
14. `packages/system-brp/src/firstSlice.test.ts`
15. GitHub issue #13

## Source boundary

Implement Basic Roleplaying: Universal Game Engine, 2023 ORC content, pinned to corrections `CHA2036 BRP UGE Corrections 1.05` for the current adapter version.

Do not use the older 2020 online BRP SRD as implementation authority.

Do not import Call of Cthulhu-specific protected content. Keep call-of-cthulhu as a separately licensed future product target.

## Current first-slice profile

The first BRP path is deliberately narrow:

- Human.
- Normal power level.
- Non-powered.
- Explicit characteristics.
- Age 18 through 49.
- Detective profession.
- No EDU, Sanity, Fatigue, hit locations, cultural modifiers, category bonuses, non-human rules, or powers.
- No BRP creator UI yet.

The existing shared CharacterDocument and RulesSystemAdapter contracts remain unchanged because the first BRP evidence did not require a shared-schema change.

## Immediate implementation slice: standard rolled characteristics

Add source-faithful standard BRP characteristic generation while converging on the same `brp-character/0.1` native state used by explicit entry.

Required behavior:

- use deterministic seeded randomness through existing system-neutral generator-core primitives where appropriate;
- STR, CON, POW, DEX, and CHA: roll 3D6;
- INT and SIZ: roll 2D6+6;
- retain raw dice, pre-redistribution characteristic values, seed, and roll-slot provenance;
- support the standard up-to-3-point redistribution step explicitly rather than silently normalizing rolls;
- retain each redistribution decision with source/destination and amount;
- independently validate that redistribution is legal and net-neutral;
- preserve the supported characteristic bounds after redistribution;
- recompute characteristic rolls and all derived values from final characteristics;
- route the final values through shared first-slice native construction rather than forking a rolled-only character schema;
- keep professional and personal skill allocation behavior unchanged;
- add tests proving deterministic replay, retained raw rolls, legal redistribution, illegal redistribution rejection, derived-state recomputation, and CharacterDocument round trip.

Do not add a second BRP native schema merely because the generation method differs. Generation method is provenance unless source rules prove otherwise.

## After rolled characteristics

Choose the next BRP stressor from evidence:

- second profession with a materially different or broader skill-choice shape; or
- second power level to test whether retained rules-profile context scales cleanly across changed professional budgets and starting caps.

Do not choose based only on catalog breadth.

Keep BRP creator UI deferred until at least explicit and standard-rolled creation converge on the same native-state builder and validation path.

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
