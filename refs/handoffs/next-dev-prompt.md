---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green BRP Universal Game Engine Scholar profession checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Promoted baseline remains unchanged

- `qa`: `c7b64ac774b9f903f0ca1882812`
- `main`: `c7b64ac774b9f903f0ca1882812`

Do not implicitly promote either the accumulated D&D Level 1 batch or BRP work. Preserve exact-SHA `dev -> qa -> main` promotion.

## Current BRP automated-green code checkpoint

- code checkpoint: `96846485016c4b3082217db8de0b11a143d9e9e2`
- Actions: `34254069939`
- job: `102155313610`
- refs / OKF green
- strict TypeScript green
- 29 test files / 145 tests / 0 failures
- BRP tests: 28
- Scholar tests: 9
- web build green
- build identity: `Character Forge build 0.0.1 96846485`
- BRP native schema: `brp-character/0.1`
- BRP adapter: `0.4.0`
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
12. `packages/system-brp/src/skills.ts`
13. `packages/system-brp/src/professions.ts`
14. `packages/system-brp/src/powerLevel.ts`
15. `packages/system-brp/src/characteristicGeneration.ts`
16. `packages/system-brp/src/firstSlice.ts`
17. `packages/system-brp/src/adapter.ts`
18. `packages/system-brp/src/scholarProfession.test.ts`
19. GitHub issue #13

## Source boundary

Implement Basic Roleplaying: Universal Game Engine, 2023 ORC content, pinned to corrections `CHA2036 BRP UGE Corrections 1.05` for the current adapter family.

Do not use the older 2020 online BRP SRD as implementation authority.

Do not import Call of Cthulhu-specific protected content. Keep call-of-cthulhu as a separately licensed future product target.

## What is now proven

The current backend supports one BRP native ontology across:

- explicit and deterministic standard-rolled characteristics;
- Normal and Heroic power levels;
- Detective and Scholar professions.

Scholar proves a second materially different profession choice shape:

- Detective uses fixed skills plus four bounded electives;
- Scholar uses five fixed skills plus five open Knowledge or Science specialty choices.

Scholar's open academic skills preserve exact parent plus specialty identity. Multiple Knowledge specialties or multiple Science specialties are legal, while duplicate identical parent+specialty choices are rejected. Personal learning remains independent from profession eligibility.

No shared CharacterDocument or semantic schema change was required. `brp-character/0.1` remains sufficient.

## Immediate implementation slice: named language identity closure

Scholar exposed a concrete source-fidelity gap that should be closed before BRP creator UI.

The source distinguishes Language (Own) from Language (Other), but the current backend only retains those role labels as distinct BRP skill IDs. It does not yet retain which actual language is the character's own language or which other language is being trained.

Do not hide that gap behind a generic `language` skill, a hardcoded list of languages, or a UI default.

### Target architecture

Keep language identity BRP-native and open-ended.

The native model should be able to retain at least:

- a stable open ID and display label for the character's own language;
- a stable open ID and display label for the Scholar profession's selected other-language skill;
- the source role of each skill: Own versus Other;
- source base semantics for that role;
- professional/personal contribution layers and final rating;
- generation provenance for the language choices.

The exact representation may extend current skill specialty/variant state or add a small BRP-native language identity seam. Choose the smallest source-faithful representation. Do not add a shared CharacterDocument language contract.

### Source behavior to preserve

Within the current supported profile:

- Language (Own) uses `INT x 5` because EDU remains disabled;
- Language (Other) begins at 0%;
- Scholar includes both Language (Own) and Language (Other) as professional skills;
- language identity must remain open-ended rather than coming from a Character Forge global catalog.

Verify exact UGE 1.05 source wording before making any stronger claims about bilingual characters, multiple native languages, or additional personal languages. Do not infer those rules from another BRP-family game.

### Identity and legality requirements

At minimum:

- retain non-empty language ID and label;
- distinguish source role Own versus Other independently from the language identity itself;
- prevent a single identical language identity from occupying contradictory Own and Other roles on the same character unless source verification shows that is legal and meaningful;
- Scholar professional eligibility must point to the exact retained Own and Other language skill identities, not generic placeholder skills;
- adapter must independently derive/validate Language (Own) base chance from final INT;
- adapter must independently validate Language (Other) base chance at 0 in the current profile;
- changing retained language identity must invalidate any professional skill entry that no longer matches it;
- personal allocations must not accidentally become profession-restricted merely because they use language skills;
- preserve exact language choices through CharacterDocument JSON round trip and generation provenance.

### Existing matrix must remain green

Language identity closure must continue to support:

- Detective Normal explicit;
- Detective Normal standard-rolled;
- Detective Heroic explicit;
- Detective Heroic standard-rolled;
- Scholar Normal explicit;
- Scholar Normal standard-rolled;
- Scholar Heroic explicit;
- Scholar Heroic standard-rolled.

Do not change characteristic generation, Heroic age behavior, power-level budgets/caps, academic-specialty semantics, or power-system state except where source-faithful language identity genuinely requires it.

Powers remain disabled.

### Validation target

The automated gate should prove at minimum:

- all existing Detective and Scholar tests remain green;
- Scholar retains exact Own and Other language identities;
- Language (Own) is independently validated at INT x 5;
- Language (Other) is independently validated at 0% in the current profile;
- duplicate/contradictory Own/Other language identity is rejected according to verified source behavior;
- Scholar professional allocation remains tied to exact retained language identities;
- personal allocation independence remains intact;
- adapter detects language identity/base/profession tampering independently of the builder;
- CharacterDocument round trip preserves language identity and provenance;
- native schema remains `brp-character/0.1` if sufficient.

## After language identity closure

Reassess BRP creator UI immediately.

If the language seam closes without revealing another mandatory backend fidelity gap, the backend will have demonstrated:

- two characteristic-generation methods;
- two power levels;
- retained age causality;
- two materially different profession choice shapes;
- open academic specialties;
- open source-owned language identity;
- independent adapter validation across the matrix.

At that point the next useful slice is likely the first BRP creator UI rather than another backend catalog expansion.

The UI should follow the established Character Forge standard: generation options left, character details right, universal controls at top, dynamic method/profile/profession-specific controls, and no system-specific assumptions leaked into Parchment.

Do not ingest the full BRP profession catalog just to make the UI look broad.

## Architecture rules

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Do not change shared CharacterDocument or semantic contracts without concrete cross-system evidence.
- BRP profession is not D&D class.
- Preserve skill base chance, professional contribution, personal contribution, and final rating separately when causality matters.
- Keep open specialties and language identities source-owned; do not freeze universal enums.
- Preserve effective BRP rules-profile context in native state.
- Preserve character-specific age causality when it affects source-rule construction legality.
- Do not model future BRP powers through D&D spell-state structures.
- Generator-core remains system-neutral.
- Parchment remains ignorant of system-specific mechanics.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Parallel product work

The system-neutral random-table companion remains `ready_for_discovery` and should not be forgotten. Its eventual first consumers remain traits, ideals, bonds, flaws, equipment/trinkets, tags/native IDs, weighted results, and provenance-bearing subtable references.
