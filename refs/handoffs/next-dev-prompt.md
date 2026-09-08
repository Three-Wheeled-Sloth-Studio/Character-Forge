---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green BRP Universal Game Engine Normal/Heroic profile-aware backend checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Promoted baseline remains unchanged

- `qa`: `c7b64ac774b9f903f0ca1882812`
- `main`: `c7b64ac774b9f903f0ca1882812`

Do not implicitly promote either the accumulated D&D Level 1 batch or BRP work. Preserve exact-SHA `dev -> qa -> main` promotion.

## Current BRP automated-green code checkpoint

- code checkpoint: `a780f82378e1477d77cf1076cc769491dcb3043d`
- Actions: `34237331940`
- job: `102098319676`
- refs / OKF green
- strict TypeScript green
- 28 test files / 136 tests / 0 failures
- BRP tests: 19
- web build green
- build identity: `Character Forge build 0.0.1 a780f823`
- BRP native schema: `brp-character/0.1`
- BRP adapter: `0.3.0`
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
12. `packages/system-brp/src/powerLevel.ts`
13. `packages/system-brp/src/characteristicGeneration.ts`
14. `packages/system-brp/src/firstSlice.ts`
15. `packages/system-brp/src/adapter.ts`
16. `packages/system-brp/src/firstSlice.test.ts`
17. `packages/system-brp/src/standardCharacteristicGeneration.test.ts`
18. `packages/system-brp/src/heroicPowerLevel.test.ts`
19. GitHub issue #13

## Source boundary

Implement Basic Roleplaying: Universal Game Engine, 2023 ORC content, pinned to corrections `CHA2036 BRP UGE Corrections 1.05` for the current adapter family.

Do not use the older 2020 online BRP SRD as implementation authority.

Do not import Call of Cthulhu-specific protected content. Keep call-of-cthulhu as a separately licensed future product target.

## What is now proven

Two characteristic-generation methods and two power levels converge on the same `brp-character/0.1` native ontology:

- explicit characteristics;
- deterministic standard-rolled characteristics;
- Normal power level;
- Heroic power level.

The retained rules profile is operational state. Normal uses a 250-point professional pool and 75% starting cap. Heroic uses a 325-point base professional pool and 90% starting cap. Personal skill points remain INT x 10.

Heroic also retains the default starting age used for its age-based professional-skill adjustment. The current first-slice boundary accepts retained starting age 18 through 23, current age from that starting age through 49, and +20 professional skill points per full decade added after the retained starting age. Below-starting-age characteristic penalties and age-50+ aging remain out of scope.

No shared CharacterDocument or semantic schema change was required.

## Immediate implementation slice: Scholar profession

Add Scholar as the second BRP profession and use it to pressure-test open count-N specialty choice rather than merely expanding catalog breadth.

The selected ORC source defines Scholar as:

- wealth Average or Affluent, usually Average;
- fixed professional skills: Language (Other), Language (Own), Persuade, Research, Teach;
- choose five Knowledge or Science skills appropriate to the setting and related to the field of study.

This is materially different from Detective's bounded four-of-seven elective shape.

### Target architecture

Do not build a separate Scholar character pipeline.

Refactor the current Detective-specific profession seam only as far as needed so both professions can use the same characteristic, power-level, budget, skill-contribution, derived-state, CharacterDocument, and adapter infrastructure.

The profession layer should own:

- profession ID;
- allowed wealth range/default metadata where useful;
- fixed professional skills;
- profession-specific choice requirements;
- selected specialty identities needed to validate those choices.

Do not promote `profession`, `specialty`, or the BRP profession-choice shape into shared CharacterDocument semantics.

### Open specialty requirements

Scholar should prove real open specialty identity, not a hidden fixed catalog of academic subjects.

At minimum:

- represent Knowledge and Science as parent skill identities with explicit specialty ID/label;
- allow five unique selected Knowledge/Science specialty skill identities;
- allow more than one selected specialty under the same parent skill, such as multiple Knowledge specialties or multiple Science specialties;
- retain the exact selected specialties natively and in generation provenance;
- prevent duplicate identical parent+specialty selections;
- keep source base chance separate from professional/personal contributions and final rating;
- ensure professional allocation is legal only for Scholar fixed skills and the five selected academic specialties;
- retain personal learning independence from profession eligibility;
- keep specialty validation source-owned and avoid inventing a universal specialty enum.

Use a small test fixture set of specialty strings if necessary, but the implementation contract must accept source-faithful open identities rather than make that fixture set authoritative.

### Existing matrix must continue to work

Scholar must work with:

- Normal explicit;
- Normal standard-rolled;
- Heroic explicit;
- Heroic standard-rolled.

Heroic age-basis behavior must remain unchanged. Powers remain disabled.

### Validation target

The automated gate should prove at minimum:

- all existing Detective tests remain green;
- Scholar fixed skill eligibility;
- exactly five unique Knowledge/Science specialty choices;
- repeated parent skills with distinct specialties are accepted;
- duplicate parent+specialty identity is rejected;
- non-Knowledge/Science academic elective identity is rejected;
- professional allocations cannot escape the selected Scholar skill set;
- personal allocations remain independent from profession eligibility;
- profile-derived budgets/caps work for Scholar under Normal and Heroic;
- explicit and rolled characteristic generation remain unchanged;
- adapter detects specialty/profession-choice tampering independently of the builder;
- CharacterDocument round trip preserves Scholar specialty identities and provenance;
- native schema remains `brp-character/0.1` if sufficient.

## After Scholar

Reassess from evidence. Leading follow-ons are:

- a profession such as Student or Teacher with an even broader mixed-domain choice set if Scholar exposes useful profession-schema pressure;
- age/experience expansion if we need below-starting-age or age-50+ causality for a concrete consumer;
- one optional BRP subsystem only if the retained rules-profile boundary still needs another architecture test;
- BRP creator UI once the profession seam is stable enough to expose without lying about supported choices.

Do not jump into broad profession ingestion yet. Scholar is an architecture probe first.

## Architecture rules

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Do not change shared CharacterDocument or semantic contracts without concrete cross-system evidence.
- BRP profession is not D&D class.
- Preserve skill base chance, professional contribution, personal contribution, and final rating separately when causality matters.
- Keep open specialties source-owned; do not freeze a universal specialty enum.
- Preserve effective BRP rules-profile context in native state.
- Preserve character-specific age causality when it affects source-rule construction legality.
- Do not model future BRP powers through D&D spell-state structures.
- Generator-core remains system-neutral.
- Parchment remains ignorant of system-specific mechanics.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Parallel product work

The system-neutral random-table companion remains `ready_for_discovery` and should not be forgotten. Its eventual first consumers remain traits, ideals, bonds, flaws, equipment/trinkets, tags/native IDs, weighted results, and provenance-bearing subtable references.
