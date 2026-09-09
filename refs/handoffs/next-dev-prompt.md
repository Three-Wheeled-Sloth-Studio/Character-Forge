---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green first system-owned random-table consumer checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Do not reconstruct the full repository history.

Start with:

`python refs/tools/generate_agent_context.py --focus "second random table consumer"`

Treat that packet as derived orientation only. Then use `refs/implementation/fileMap.yaml`, this handoff, `refs/product/random-table-companion.md`, and targeted source reads. Load deeper architecture, system source material, or historical evidence only if the selected consumer crosses those boundaries.

Prefer diff-first continuation from the accepted checkpoint and conserve coding-agent context deliberately.

## Accepted Automated-Green Checkpoints

Random-table core:

- code checkpoint: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`
- Actions: `34364243890`
- job: `102508743773`
- focused evaluator tests: 5

First system-owned consumer:

- code checkpoint: `d4b881b29bd763d9f7fd50e56223b00b37077be2`
- Actions: `34366600372`
- job: `102516809719`
- Verify conclusion: success
- full suite: 34 test files / 168 tests / 0 failures
- focused BRP profession-suggestion tests: 4

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not implicitly promote accumulated D&D, BRP, or companion work. Preserve exact-SHA `dev -> qa -> main` promotion.

## What Is Proven

`packages/generator-core/src/randomTable.ts` provides the system-neutral deterministic weighted evaluator and provenance contract.

`packages/system-brp/src/professionSuggestion.ts` is the first concrete consumer:

- BRP owns the dataset, typed result, and source mapping;
- the table contains only the already-supported Detective and Scholar professions;
- BRP delegates selection to the generic evaluator;
- replay provenance retains evaluator/table/source versions, seed, drawIndex, selected entry, weights, and selected profession;
- the creator can request a profession suggestion, accept it, or override it manually;
- accepted suggestion provenance is stored in the normal generation decision list as `identity.profession-suggestion`;
- the native BRP payload remains authoritative and untouched by the provenance decorator;
- reopen reads the suggestion provenance only when it still agrees with the authoritative native profession.

The same slice fixed the accepted BRP left-panel containment issue while touching the relevant creator CSS. Remaining creator QA debt stays nonblocking and is listed in `refs/handoffs/currentHandoff.md`.

## Immediate Slice: Second System-Owned Consumer

Select and implement one source-safe consumer with a richer structured result than a single enum-like profession ID.

The purpose is to gather evidence about payload shape and consumer ergonomics before inventing any universal suggestion vocabulary.

Required approach:

1. Inspect already-licensed/repository-owned D&D or BRP content first.
2. Prefer a small flavor, equipment/trinket, or other structured suggestion that does not require a major ingestion project.
3. Keep the dataset, source provenance, result payload type, and mapping in the owning system package.
4. Keep `generator-core` system-neutral and unchanged unless a concrete table proves a missing generic capability.
5. Let the creator inspect/accept/override the suggestion where UI involvement is appropriate.
6. If the accepted result affects native state, route it through the ordinary system builder/adapter path.
7. Never patch native state directly from the generic evaluator.
8. Retain evaluator/table/source versions, seed, drawIndex, and selected entry identity wherever replay matters.
9. Add focused tests for deterministic replay, source/system ownership, persistence/override behavior, and native-state safety.

If no current source-safe richer consumer is small enough, stop after documenting that evidence and identify the smallest required content slice rather than inventing public rules text.

## Explicitly Deferred

Do not add without concrete consumer evidence:

- nested/subtable evaluation;
- dice-range table authoring syntax;
- without-replacement or uniqueness sampling;
- conditional table graphs;
- universal trait/ideal/bond/flaw ontology;
- user-authored table persistence or editor UI;
- direct native-state mutation from the generic evaluator;
- large structured naming work.

The structured naming watch remains separate. Do not scale or repurpose the temporary D&D flat name list as this consumer.

## Creator QA Debt To Fold Opportunistically

Do not create a cleanup-only cycle, but if the touched code naturally intersects these items:

- D&D Random: hide disabled `Roll First` until rolls exist;
- D&D Random: move verbose roll history to hover/detail text;
- D&D Random: swap displaced roll assignments rather than duplicate one roll slot;
- shared: introduce a consistent `Randomize All` and field-randomizer interaction pattern where appropriate;
- BRP: add name generation only through the proper naming seam;
- BRP: randomize Age/Gender/Wealth when creator randomization is next touched.

The BRP left-panel width/containment finding is already resolved.

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
