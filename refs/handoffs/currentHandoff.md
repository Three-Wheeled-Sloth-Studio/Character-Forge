---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
---
# Current Handoff

Date: 2026-09-08
Branch: `dev`

## Accepted Baseline

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D or BRP work.

D&D 5E 2024 mechanical SRD Level 1 breadth remains automated-green at code checkpoint `55f79a1004c14eef1635e92c602e1fefa18cab15`. Issue #11 remains open for accumulated owner runtime QA and exact-SHA promotion.

BRP remains bounded to Basic Roleplaying: Universal Game Engine 2023 ORC content with corrections 1.05:

- source ID: `chaosium-brp-uge-orc-1.05`
- native schema: `brp-character/0.1`
- adapter: `0.5.0`
- no Call of Cthulhu-specific protected content

First BRP creator UI automated-green implementation checkpoint:

- code checkpoint: `b5cb07ab7c8873694e438bcc6e3ab799bfdf3c02`
- Actions: `34295950302`
- job: `102292513584`
- 32 test files / 159 tests / 0 failures
- 35 system-BRP tests plus 5 BRP creator-state tests
- tracked-path case guard: 144 tracked paths collision-free
- required project-memory files: 14
- OKF: 17 concepts / 9 indexes
- bounded re-entry packet: 3,395 characters
- strict TypeScript: green
- web build: green
- build identity: `Character Forge build 0.0.1 b5cb07ab`

## What Landed

The existing Character Forge creator workspace now hosts both systems without making a second BRP application:

- a rules-system selector keeps D&D 5E 2024 as the default and mounts BRP UGE only when selected;
- the existing D&D guided creator module was left unchanged, and existing sticky-choice tests remain green;
- BRP controls cover display name, age, gender, Average/Affluent wealth, Normal/Heroic power level, retained Heroic default starting age, Detective/Scholar, Explicit/Standard Rolled characteristics, seed/re-roll, raw roll visibility, legal redistribution input, profession-specific choices, and professional/personal skill allocation;
- budget, remaining-point, starting-cap, and invalid-state feedback are inline;
- `Fill legal example` provides a deterministic convenience for reaching a legal supported allocation without weakening BRP validation;
- the right review surface shows retained characteristics, derived state, skills, causal contribution layers, rules profile, age causality, languages/specialties, generation state, and native document provenance;
- reopening a BRP CharacterDocument restores supported creator state directly from the authoritative BRP primary native payload, never from semantic projection.

A narrow BRP-owned `calculateBrpPersonalSkillPoints()` helper was added so browser feedback does not duplicate the `INT x 10` rule. Existing BRP-owned profession resolvers, characteristic generation, power-profile logic, skill definitions/base chances, builders, and adapter validation remain authoritative.

No shared CharacterDocument, semantic contract, generator-core contract, dependency, or lockfile change was required.

## Current Evidence / Gap

Automated coverage proves explicit and standard-rolled Detective/Scholar creation, Normal/Heroic profile retention, Heroic age causality, exact Scholar language/specialty identities, budget/cap agreement with backend validation, invalid allocation rejection, authoritative native-state reopen, D&D default routing, and unchanged D&D sticky-choice tests.

The remaining gap is owner runtime/browser QA of the first BRP creator UI. Treat visual friction, control clarity, responsive behavior, and reopen ergonomics as evidence-driven polish work. Do not expand BRP rules breadth merely because the first UI exists.

The D&D Issue #11 runtime-QA/promotion gate remains separate and open.

## Next Slice

Run a focused BRP creator runtime-QA and polish pass on `dev`.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "BRP creator runtime QA"`

Exercise at least:

- explicit Detective and Scholar;
- standard-rolled Detective and Scholar;
- Normal and Heroic, including retained default starting age and age-derived budget;
- legal and illegal redistribution;
- Scholar Own/Other language identity and open Knowledge/Science specialties;
- professional/personal budgets, cap feedback, and `Fill legal example`;
- generated review details and JSON/native provenance;
- reopen from a retained BRP CharacterDocument;
- switching back to D&D with existing defaults/sticky behavior intact.

Patch only concrete runtime/UX findings. Keep unsupported BRP rules out of this QA slice. Do not promote `qa` or `main` without explicit instruction.

## Relevant Files

- `refs/handoffs/next-dev-prompt.md`
- `refs/implementation/fileMap.yaml`
- `apps/web/src/creatorWorkspace.ts`
- `apps/web/src/brpCreatorPanel.ts`
- `apps/web/src/brpCreatorPanelView.ts`
- `apps/web/src/brpCreatorState.ts`
- `apps/web/src/brpCreatorStyles.ts`
- `apps/web/src/main.ts`
- `packages/system-brp/src/powerLevel.ts`
- `packages/system-brp/src/`

Load deeper architecture/source evidence only if a system boundary, semantic claim, or source-fidelity question actually requires it.

## Do Not Reopen Without New Evidence

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- BRP profession is not D&D class.
- Keep base chance, professional contribution, personal contribution, and final rating distinct.
- Keep open specialties and language identities BRP-owned.
- Preserve effective rules profile and character-specific age causality.
- Future BRP powers must not reuse D&D spell architecture.
- Keep generator-core system-neutral and Parchment system-agnostic.
- Do not import Call of Cthulhu-specific protected content.
- Do not broaden the profession catalog during UI polish without new evidence.
- Random-table companion remains `ready_for_discovery`.
- D&D runtime QA remains its own promotion gate.

## Validation

Milestone gate:

`npm run verify`

The gate includes tracked-path case-collision validation, durable refs/OKF validation, bounded agent-context validation, strict TypeScript, unit tests, and the web build.
