---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green first random-table evaluator checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Do not reconstruct the full repository history.

Start with:

`python refs/tools/generate_agent_context.py --focus "first random table consumer"`

Treat that packet as derived orientation only. Then use `refs/implementation/fileMap.yaml`, this handoff, `refs/product/random-table-companion.md`, and targeted source reads. Load deeper architecture, system source material, or historical evidence only if the selected consumer crosses those boundaries.

Prefer diff-first continuation from the accepted checkpoint and conserve coding-agent context deliberately.

## Accepted Automated-Green Checkpoint

Random-table core:

- code checkpoint: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`
- Actions: `34364243890`
- job: `102508743773`
- Verify conclusion: success
- new evaluator suite: 5 focused tests

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not implicitly promote accumulated D&D, BRP, or companion work. Preserve exact-SHA `dev -> qa -> main` promotion.

The first BRP creator runtime/browser QA was owner-accepted on 2026-09-09 with no blocking findings. Its remaining UI findings are recorded in `refs/handoffs/currentHandoff.md` as nonblocking debt to fold into later touched slices.

## What The Random-Table Core Supports

`packages/generator-core/src/randomTable.ts` now provides a system-neutral weighted evaluator:

- stable table ID and table version;
- source/dataset ID and source version;
- stable entry IDs;
- optional positive weights, defaulting to 1;
- arbitrary typed result payloads owned by the caller;
- caller seed plus explicit non-negative `drawIndex`;
- deterministic replay scoped by evaluator/table/source versions and draw identity;
- returned provenance containing evaluator version, table/source identity, seed, drawIndex, selected entry ID, selected weight, and total weight;
- validation for malformed tables, invalid weights, invalid random-source values, empty seeds, and invalid draw indexes.

The core does not know trait/ideal/bond/flaw/equipment semantics and does not modify CharacterDocument or native state.

## Immediate Slice: First System-Owned Consumer

Select and implement one narrow source-safe consumer from D&D or BRP.

The purpose is to prove the ownership and persistence boundary, not to build a large random-table catalog.

Required shape:

1. The owning system package defines the table dataset and result payload type.
2. The dataset has explicit source/version provenance appropriate to that system.
3. The system calls the generic evaluator rather than duplicating weighted/random logic.
4. The selected result becomes either:
   - an ordinary system generation decision; or
   - a structured suggestion that the creator can inspect/accept/override.
5. If accepted into character state, it must pass through the ordinary native builder/adapter path.
6. Replay-relevant provenance retains evaluator/table/source versions, seed, drawIndex, and selected entry identity.
7. Add focused tests proving deterministic replay, system ownership, and no direct native-state patching.

Prefer a consumer that already has source-safe content available in the repository or licensed source boundary. Do not begin a major content-ingestion project merely to feed the evaluator.

If no current source-safe consumer is small enough, stop after documenting that evidence and identify the smallest required content slice rather than inventing public rules text.

## Explicitly Deferred

Do not add without concrete consumer evidence:

- nested/subtable evaluation;
- dice-range table authoring syntax;
- without-replacement or uniqueness sampling;
- conditional table graphs;
- universal trait/ideal/bond/flaw ontology;
- user-authored table persistence or editor UI;
- direct CharacterDocument mutation from the generic evaluator;
- large structured naming work.

The structured naming watch remains separate. Do not scale the temporary D&D flat name list as the random-table consumer.

## Creator QA Debt To Fold Opportunistically

Do not create a cleanup-only cycle, but if the touched code naturally intersects these items:

- D&D Random: hide disabled `Roll First` until rolls exist;
- D&D Random: move verbose roll history to hover/detail text;
- D&D Random: swap displaced roll assignments rather than duplicate one roll slot;
- shared: introduce a consistent `Randomize All` and field-randomizer interaction pattern where appropriate;
- BRP: add name generation only through the proper naming seam;
- BRP: randomize Age/Gender/Wealth when creator randomization is next touched;
- BRP: constrain left-panel controls to the generation column width.

## Architecture Guardrails

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- `character-document/0.1` remains the shared contract unless concrete cross-system evidence requires change.
- The random-table evaluator is a generation primitive, not a state model.
- System datasets/mappings remain system-owned.
- Generic evaluator code remains system-neutral.
- Table results feed normal decisions/suggestions and never patch native state directly.
- Preserve replay provenance and explicit version boundaries.
- Add nesting only when a real consumer requires it.
- BRP profession is not D&D class.
- Future BRP powers must not reuse D&D spell architecture.
- Parchment remains system-agnostic.
- Do not import Call of Cthulhu-specific protected content.
- Preserve exact-SHA promotion provenance.
- D&D Issue #11 remains a separate runtime-QA/promotion gate.

## Before Stopping

Run:

`npm run verify`

Do not claim green unless the exact committed SHA passes GitHub Actions.

Update the delta-oriented `refs/handoffs/currentHandoff.md` with accepted baseline, what changed, evidence/gaps, next slice, relevant files, do-not-reopen constraints, and validation SHA/run/job. Update this prompt, roadmap, product references, and file map only where new evidence changes their truth. Do not promote `qa` or `main` unless explicitly instructed.
