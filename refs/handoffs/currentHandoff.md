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

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D, BRP, or random-table work.

D&D 5E 2024 mechanical SRD Level 1 breadth remains automated-green at `55f79a1004c14eef1635e92c602e1fefa18cab15`. Issue #11 remains the separate accumulated owner runtime-QA/promotion gate.

BRP remains bounded to Basic Roleplaying: Universal Game Engine 2023 ORC content with corrections 1.05:

- source ID: `chaosium-brp-uge-orc-1.05`
- native schema: `brp-character/0.1`
- adapter: `0.5.0`
- no Call of Cthulhu-specific protected content

The first BRP creator UI remains automated-green at `b5cb07ab7c8873694e438bcc6e3ab799bfdf3c02`, Actions `34295950302`, job `102292513584`.

Owner runtime/browser QA on 2026-09-09 accepted the BRP creator for continued work with no blocking findings. Do not schedule a dedicated polish cycle for the accepted findings below; fold them into later touched slices.

## Accepted Creator QA Debt

D&D Random ability generation:

- hide the disabled `Roll First` assignment control until rolls exist;
- move verbose per-roll dice history out of the cramped inline result display and into hover/detail text;
- when a roll is reassigned, swap the displaced ability's roll rather than allowing two abilities to reference one roll slot.

Shared creator randomization:

- add a clear `Randomize All` interaction pattern to both systems;
- support field-level randomizers where sensible;
- keep the interaction pattern shared while each system owns legal/random value generation.

BRP creator:

- add name generation when the structured naming seam is ready;
- add randomizers for Age, Gender, Wealth, and similar fields when creator randomization is next touched;
- fix left-pane containment so controls cannot render wider than the generation column or disappear under the review surface.

These are nonblocking UX debt, not a reason to reopen BRP architecture or expand BRP rules breadth.

## Random Table Companion Checkpoint

The first system-neutral random-table evaluator is automated-green on `dev`:

- code checkpoint: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`
- Actions: `34364243890`
- job: `102508743773`
- Verify conclusion: success
- new evaluator test suite: 5 focused tests

What landed in `generator-core`:

- `RandomTable<TResult>` with stable table ID/version, source ID/version, stable entry IDs, optional positive weights, and arbitrary typed result payloads;
- deterministic `evaluateRandomTable()` driven by caller seed plus explicit non-negative `drawIndex`;
- evaluator/table/source identity is included in the deterministic seed domain so replay does not depend on hidden global draw order;
- provenance records evaluator version, table/source identity and versions, caller seed, draw index, selected entry ID, selected weight, and total weight;
- low-level weighted selection remains system-neutral and validates the random source is in `[0, 1)`;
- table validation rejects empty identity, duplicate entry IDs, empty tables, invalid weights, non-finite total weight, empty seeds, and invalid draw indexes;
- the evaluator returns the caller-owned typed result unchanged and never patches CharacterDocument or native state.

The contract is documented in `refs/product/random-table-companion.md`.

No shared CharacterDocument, semantic contract, rules adapter, system-native schema, dependency, or lockfile change was required.

## Current Evidence / Gap

The generic evaluator seam is now proven, but there is intentionally no system-owned dataset or creator UI consumer yet.

Do not invent a universal trait/ideal/bond/flaw schema from the generic engine. The next evidence must come from one real source-safe system-owned consumer that maps the selected result into an ordinary generation decision or structured suggestion.

Subtable references remain a known likely requirement, but nesting is still deferred until an actual table requires it. The same applies to roll-range authoring, uniqueness sampling, conditional graphs, and user-authored table persistence.

## Next Slice

Build the first narrow system-owned random-table consumer on `dev`.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "first random table consumer"`

Before coding:

1. Identify one source-safe existing D&D or BRP consumer that benefits from a structured random suggestion.
2. Keep the dataset and result payload type in the owning system package.
3. Use `generator-core` only for evaluation and replay provenance.
4. Feed the result through an ordinary generation decision or suggestion seam rather than mutating native state directly.
5. Retain seed, table/source/evaluator versions, draw index, and selected entry identity wherever replayability matters.

Prefer a consumer small enough to prove the boundary without dragging in a large content-ingestion or naming project.

Do not add nested tables merely because the engine could support them. Add nesting only if the chosen real consumer requires it.

## Relevant Files

- `refs/handoffs/next-dev-prompt.md`
- `refs/implementation/fileMap.yaml`
- `refs/planning/roadmap.yaml`
- `refs/product/random-table-companion.md`
- `refs/product/generation-methods.md`
- `packages/generator-core/src/randomTable.ts`
- `packages/generator-core/src/randomTable.test.ts`
- `packages/system-dnd5e/src/`
- `packages/system-brp/src/`

Load deeper system source/licensing evidence only for the concrete consumer being selected.

## Do Not Reopen Without New Evidence

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Random-table evaluation is a generation primitive, not a character-state format.
- System datasets and mappings stay system-owned.
- The generic table evaluator must not learn D&D- or BRP-specific semantics.
- Table results feed ordinary generation decisions or structured suggestions; they do not patch native state directly.
- Preserve explicit replay provenance and version boundaries.
- Add nesting only when a concrete consumer requires it.
- BRP profession is not D&D class.
- Keep BRP base chance, professional contribution, personal contribution, and final rating distinct.
- Future BRP powers must not reuse D&D spell architecture.
- Keep generator-core system-neutral and Parchment system-agnostic.
- Do not import Call of Cthulhu-specific protected content.
- D&D Issue #11 remains a separate promotion gate.
- Creator QA findings above are nonblocking debt to fold into later touched work, not a dedicated cleanup cycle.

## Validation

Milestone gate:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
