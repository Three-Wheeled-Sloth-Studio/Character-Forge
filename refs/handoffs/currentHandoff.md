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

Shared creator randomization remains automated-green at `1f6ed5aee24f514fbc4fd9de39f9380e8df3719b`, Actions `34369619403`, job `102527165230`, 36 test files / 178 tests / 0 failures.

## D&D Random Ability UX Checkpoint

The bounded D&D Random-ability UX slice is automated-green:

- implementation checkpoint: `e66003b9b6334218fb689d2da32ae5bf133251af`
- Actions: `34371712699`
- job: `102534309918`
- Verify conclusion: success
- full suite: 37 test files / 181 tests / 0 failures
- tracked paths: 155
- generated agent context: 3,426 characters
- web build identity: `Character Forge build 0.0.1 e66003b9`

What changed:

- `apps/web/src/dndRandomAbilityUx.ts` now owns presentation-only enhancement for the existing D&D Random ability controls.
- Disabled pre-roll assignment controls are hidden until the six roll slots exist and are enabled, removing the confusing `Roll First` dropdown surface.
- The six roll cards retain the exact roll data but hide the cramped inline dice-history line after rendering. The same history is moved to card hover text and an accessible card label.
- Reassigning one rolled total now swaps the displaced ability back to the changed ability's prior roll slot, preserving a one-to-one permutation of the six rolled totals.
- `swapUniqueRandomAssignment()` is a pure tested helper. It rejects duplicate starting state, out-of-range assignment indexes, and values that are not one of the existing roll slots.
- `creatorWorkspace` mounts the D&D-only UX enhancer after the existing guided creator. No D&D rule, roll-generation, CharacterDocument, native schema, adapter, generation provenance, dependency, or lockfile changed.
- The large `guidedCreationPanel.ts` and `system-dnd5e` random-generation implementation were intentionally left unchanged because no rules defect was found.

## Randomize All QA Evidence

This environment does not provide a live browser surface, so owner browser QA of `Randomize All` remains outstanding. The automated/structural evidence remains strong and green:

- sticky single-choice and multi-choice pool tests prove random picks stay inside retained acceptable pools;
- creator randomization tests prove dependent controls exposed by earlier random actions can join the same pass and each stable action runs at most once;
- D&D `Randomize All` still delegates to the existing field buttons and random-roll action instead of reimplementing selection rules;
- BRP selector coverage still limits `Randomize All` to Profession suggestion and Standard-Rolled re-roll where available, excluding Scholar academic rows and demographic fields;
- all D&D, BRP, generator-core, and creator tests remain green after the UX change.

Do not convert the remaining owner browser check into a dedicated cleanup cycle. Fold any concrete finding into the next touched creator slice unless it is blocking.

## Remaining Creator QA / Product Gaps

D&D:

- owner runtime QA of representative classes/species/reopen behavior still gates Issue #11 promotion;
- owner browser check of shared `Randomize All` with restricted pools and dynamic dependent controls is still useful;
- structured naming still needs to replace the temporary flat generated-name approach before it is scaled.

BRP:

- structured name generation remains unavailable;
- Age, Gender, Wealth, and similar randomizers remain intentionally undefined until deliberate distributions are chosen;
- Scholar academic suggestions remain field-level because the current two-entry source-safe table cannot populate five unique required slots.

## Next Slice

Start structured naming-seam discovery. Two real systems now expose the need without requiring a speculative universal identity model: D&D has a temporary flat name generator, BRP has no name generator, and shared `Randomize All` needs a clean system-owned name-randomizer boundary before names participate consistently.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "structured naming seam discovery"`

Priorities:

1. Audit the existing D&D `resolveDnd5eCharacterName` implementation, its current flat dataset, and retained generation provenance.
2. Define the smallest reusable naming contract needed for generated display names while keeping datasets/culture/language assumptions outside shared creator code.
3. Preserve deterministic seed/provenance capability and easy manual override.
4. Do not equate biological species with culture or naming language. D&D species, BRP human identity, and future World/Parchment culture-language consumers must be able to supply different naming context.
5. Decide where the reusable mechanism belongs only from evidence: generator-core if it is truly system-neutral, otherwise keep provider seams system-owned.
6. Define how a future system name randomizer participates in `Randomize All` without inventing BRP names or expanding the temporary D&D flat list.
7. Prefer a discovery/contract slice before content ingestion or a large naming corpus.

## Relevant Files

- `refs/handoffs/next-dev-prompt.md`
- `refs/implementation/fileMap.yaml`
- `refs/planning/roadmap.yaml`
- `refs/product/generation-methods.md`
- `apps/web/src/creatorWorkspace.ts`
- `apps/web/src/creatorRandomization.ts`
- `apps/web/src/dndRandomAbilityUx.ts`
- `apps/web/src/dndRandomAbilityUx.test.ts`
- `packages/system-dnd5e/src`
- `packages/system-brp/src`

For the completed Random-ability UX, `packages/system-dnd5e/src/randomGenerate.ts` remains the rules source and was not changed.

## Do Not Reopen Without New Evidence

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Shared creator orchestration coordinates interactions only; system rules and distributions remain system-owned.
- Random-table evaluation is a generation primitive, not a character-state format.
- System datasets and mappings stay system-owned.
- The generic table evaluator must not learn D&D- or BRP-specific semantics.
- Preserve explicit replay provenance and version boundaries.
- Do not invent distributions merely to make `Randomize All` exhaustive.
- Do not make species synonymous with culture or naming language.
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
