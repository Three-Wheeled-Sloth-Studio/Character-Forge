---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
---
# Current Handoff

Date: 2026-09-09
Branch: `dev`

## Accepted Baseline

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D, BRP, random-table, or creator-orchestration work.

D&D 5E 2024 mechanical SRD Level 1 breadth remains automated-green at `55f79a1004c14eef1635e92c602e1fefa18cab15`. Issue #11 remains the separate accumulated owner runtime-QA/promotion gate.

BRP remains bounded to Basic Roleplaying: Universal Game Engine 2023 ORC content with corrections 1.05:

- source ID: `chaosium-brp-uge-orc-1.05`
- native schema: `brp-character/0.1`
- adapter: `0.5.0`
- no Call of Cthulhu-specific protected content

Random-table checkpoints remain green:

- core evaluator: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`, Actions `34364243890`, job `102508743773`;
- BRP Profession consumer: `d4b881b29bd763d9f7fd50e56223b00b37077be2`, Actions `34366600372`, job `102516809719`;
- BRP Scholar academic consumer: `54d471faa5a635e46ab9db90f8d05d26ac32944f`, Actions `34368120736`, job `102522033597`.

## Shared Creator Randomization Checkpoint

The first creator-level randomization orchestration slice is automated-green:

- checkpoint: `1f6ed5aee24f514fbc4fd9de39f9380e8df3719b`
- Actions: `34369619403`
- job: `102527165230`
- Verify conclusion: success
- full suite: 36 test files / 178 tests / 0 failures
- tracked paths: 153
- generated agent context: 4,132 characters
- web build identity: `Character Forge build 0.0.1 1f6ed5ae`

What changed:

- `creatorWorkspace` now owns one visible `Randomize All` interaction shared across systems.
- `creatorRandomization.ts` provides a system-neutral orchestration primitive that repeatedly resolves randomizer actions after each click. This matters because one random choice can re-render and expose dependent controls during the same pass.
- The helper coordinates interaction only. It knows no D&D classes, BRP professions, source IDs, probability distributions, or native-state semantics.
- D&D `Randomize All` invokes the existing field randomizers already exposed by the guided creator, plus the existing random-ability roll action when the Random ability method is currently selected.
- Because D&D field buttons already read their sticky acceptable pools, `Randomize All` does not broaden those pools or create a second random-choice implementation.
- D&D generation provenance remains the existing provenance produced by the same field controls and system generation path.
- BRP `Randomize All` invokes only the existing Profession suggestion and, when Standard Rolled is already selected, the existing characteristic re-roll action.
- BRP Scholar academic suggestions intentionally remain field-level. The current source-safe table has only two academic results and cannot legally populate five unique Scholar academic slots, so orchestration does not pretend otherwise.
- BRP Age, Gender, Wealth, name, and other fields remain unchanged because no explicit system-owned random distribution/generator exists for them yet.
- Shared creator-shell styling now lives in `styles.css` instead of the BRP-only injected stylesheet, so the system selector and `Randomize All` control are styled consistently even while D&D remains the default system.

No CharacterDocument, native schema, adapter, generator-core, system random-table dataset, dependency, or lockfile changed.

## Existing Evidence Reused

This slice deliberately delegates instead of duplicating:

- D&D sticky choice-pool tests already prove random selection stays inside the retained acceptable pool.
- BRP Profession suggestion tests already prove accepted random provenance is retained without native-state mutation and manual Profession selection supersedes stale suggestion state in the creator.
- BRP Scholar academic tests already prove per-row manual override and native-state match requirements.
- Standard D&D and BRP generation/build/adapter tests remain green.

## Remaining Creator QA Debt

D&D Random ability generation still has three accepted, nonblocking UX findings:

- hide the disabled `Roll First` assignment controls until rolls exist;
- move verbose per-roll dice history out of the cramped inline result display and into hover/detail text;
- when a roll is reassigned, swap the displaced ability's roll rather than allowing two abilities to reference one roll slot.

BRP still has intentionally unresolved randomization gaps:

- structured name generation only when the naming seam is ready;
- Age, Gender, Wealth, and similar randomizers only after deliberate distributions are defined.

The first shared `Randomize All` interaction now needs owner browser/runtime QA for clarity and behavior, especially with restricted D&D acceptable pools and dynamic class/species controls.

## Next Slice

Take the narrow D&D Random-ability UX debt while runtime-QA checking the new shared `Randomize All` interaction.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "D&D random ability UX and Randomize All QA"`

Priorities:

1. Verify `Randomize All` in D&D respects restricted class/background/species and nested acceptable pools.
2. Verify dynamic dependent controls can appear and still be randomized in the same pass without repeated/random-loop behavior.
3. Verify BRP `Randomize All` changes only Profession and rolled characteristics where applicable; Age/Gender/Wealth/name and Scholar academics should remain unchanged.
4. Fix the three bounded D&D Random-ability UX findings above.
5. Keep the Random ability rule and roll generation in `system-dnd5e`; the web change should only improve assignment/presentation interaction.
6. Add focused tests for any new assignment-swap helper or interaction state.
7. Do not expand this into a broader D&D creator rewrite.

## Relevant Files

- `refs/handoffs/next-dev-prompt.md`
- `refs/implementation/fileMap.yaml`
- `refs/planning/roadmap.yaml`
- `apps/web/src/creatorWorkspace.ts`
- `apps/web/src/creatorWorkspace.test.ts`
- `apps/web/src/creatorRandomization.ts`
- `apps/web/src/creatorRandomization.test.ts`
- `apps/web/src/guidedCreationPanel.ts`
- `apps/web/src/brpCreatorPanel.ts`
- `apps/web/src/brpCreatorPanelView.ts`
- `apps/web/src/styles.css`
- `packages/system-dnd5e/src/randomGenerate.ts`

Load deeper system source only if a concrete UX fix would otherwise change rule semantics.

## Do Not Reopen Without New Evidence

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Shared creator orchestration coordinates interactions only; system rules and distributions remain system-owned.
- Random-table evaluation is a generation primitive, not a character-state format.
- System datasets and mappings stay system-owned.
- The generic table evaluator must not learn D&D- or BRP-specific semantics.
- Preserve explicit replay provenance and version boundaries.
- Do not invent distributions merely to make `Randomize All` exhaustive.
- BRP Profession is not D&D class.
- Keep BRP base chance, professional contribution, personal contribution, and final rating distinct.
- Future BRP powers must not reuse D&D spell architecture.
- Keep generator-core system-neutral and Parchment system-agnostic.
- Do not import Call of Cthulhu-specific protected content.
- D&D Issue #11 remains a separate promotion gate.

## Validation

Milestone gate:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
