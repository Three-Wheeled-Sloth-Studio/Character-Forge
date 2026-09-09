---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green first BRP creator UI checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Do not reconstruct the full repository history.

Start with:

`python refs/tools/generate_agent_context.py --focus "BRP creator runtime QA"`

Treat that packet as derived orientation only. Then use `refs/implementation/fileMap.yaml`, targeted source reads/searches, and this handoff. Load deeper architecture, roadmap, BRP source material, or historical evidence only if a concrete finding crosses those boundaries.

Prefer diff-first continuation from the accepted checkpoint and conserve coding-agent context deliberately.

## Accepted Automated-Green Implementation Checkpoint

- code checkpoint: `b5cb07ab7c8873694e438bcc6e3ab799bfdf3c02`
- Actions: `34295950302`
- job: `102292513584`
- 32 test files / 159 tests / 0 failures
- 35 system-BRP tests plus 5 BRP creator-state tests
- tracked-path guard: 144 tracked paths collision-free
- required project-memory files: 14
- OKF: 17 concepts / 9 indexes
- bounded re-entry packet: 3,395 characters
- strict TypeScript: green
- web build: green
- build identity: `Character Forge build 0.0.1 b5cb07ab`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not implicitly promote accumulated D&D or BRP work. Preserve exact-SHA `dev -> qa -> main` promotion.

## What The First BRP UI Now Supports

The existing creator workspace exposes BRP UGE without broadening the backend rules surface:

- shared rules-system selector with D&D 5E 2024 still the default;
- left-side generation controls and right-side persistent review;
- display name, age, gender, Average/Affluent wealth;
- Normal/Heroic power level and retained Heroic default starting age;
- Detective/Scholar profession controls;
- Explicit and Standard Rolled characteristic generation;
- seed, re-roll, raw roll visibility, and up-to-three-point redistribution input;
- Detective four-of-seven electives;
- Scholar Own/Other language IDs and labels;
- five open Knowledge/Science specialty selections;
- professional/personal contribution controls with budget, remaining-point, starting-cap, and validity feedback;
- `Fill legal example` convenience that still passes through BRP-owned construction/validation;
- BRP review for final characteristics, derived state, skills, causal contribution layers, rules profile, languages/specialties, generation state, and native provenance;
- reopen directly from authoritative BRP primary native state.

Browser code uses BRP-owned profession resolution, characteristic generation, power-level profile, skill definitions/base chances, personal-budget helper, builders, and adapter validation. Do not move those formulas into the UI.

No shared CharacterDocument or semantic contract change was required.

## Immediate Slice: Runtime QA And Evidence-Driven Polish

Use the actual creator as the source of truth for the next changes. Do not add rules breadth during this slice.

Exercise at least these paths:

- explicit Detective, Normal;
- explicit Scholar, Normal;
- standard-rolled Detective;
- standard-rolled Scholar;
- Heroic with retained default starting age and age-derived professional budget;
- legal and illegal redistribution;
- Detective elective under/over-selection feedback;
- exact Scholar Own/Other language identities;
- exact open Knowledge/Science specialty identities;
- manual professional/personal allocation, starting-cap feedback, and `Fill legal example`;
- generation into the right-side review;
- JSON/native-state inspection and reopen;
- switching back to D&D and confirming existing defaults/sticky-choice behavior remain intact.

Patch concrete findings around clarity, control ergonomics, responsive layout, feedback, or reopen behavior. Favor easy-to-do/easy-to-undo interactions and inline feedback. Do not introduce broad E2E infrastructure unless existing unit/browser seams cannot cover an observed risk.

## Explicitly Out Of Scope

Do not expose or invent support for:

- EDU;
- Sanity;
- Fatigue;
- hit locations;
- BRP powers;
- non-human rules;
- age-50+ aging;
- below-starting-age penalties beyond current backend boundaries;
- cultural modifiers;
- skill-category bonuses;
- broad profession-catalog ingestion.

Do not use the older 2020 BRP SRD as implementation authority. Do not import Call of Cthulhu-specific protected content.

## Architecture Guardrails

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- `character-document/0.1` remains the shared contract unless concrete cross-system evidence requires change.
- BRP profession is not D&D class.
- Keep skill base chance, professional contribution, personal contribution, and final rating distinct.
- Keep open specialties and language identities BRP-owned.
- Preserve language subject identity and Own/Other role.
- Preserve effective rules profile and character-specific age causality.
- Future BRP powers must not reuse D&D spell architecture.
- `generator-core` remains system-neutral.
- Parchment remains system-agnostic.
- Preserve exact-SHA promotion provenance.
- Keep the random-table companion `ready_for_discovery`.
- D&D Issue #11 remains a separate runtime-QA/promotion gate.

## Before Stopping

Run:

`npm run verify`

Do not claim green unless the exact committed SHA passes GitHub Actions.

Update the delta-oriented `refs/handoffs/currentHandoff.md` with accepted baseline, what changed, evidence/gaps, next slice, relevant files, do-not-reopen constraints, and validation SHA/run/job. Update this prompt and roadmap only where new runtime evidence changes their truth. Do not promote `qa` or `main` unless explicitly instructed.
