---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green second system-owned random-table consumer checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Do not reconstruct the full repository history.

Start with:

`python refs/tools/generate_agent_context.py --focus "creator randomization orchestration"`

Treat that packet as derived orientation only. Then use `refs/implementation/fileMap.yaml`, this handoff, `refs/handoffs/currentHandoff.md`, and targeted source reads. Load deeper architecture, system source material, or historical evidence only if the touched randomization semantics cross those boundaries.

Prefer diff-first continuation and conserve coding-agent context deliberately.

## Accepted Automated-Green Checkpoints

Random-table core:

- code checkpoint: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`
- Actions: `34364243890`
- job: `102508743773`
- focused evaluator tests: 5

First BRP consumer, Profession suggestion:

- code checkpoint: `d4b881b29bd763d9f7fd50e56223b00b37077be2`
- Actions: `34366600372`
- job: `102516809719`
- focused tests: 4

Second BRP consumer, Scholar academic suggestion:

- code checkpoint: `54d471faa5a635e46ab9db90f8d05d26ac32944f`
- Actions: `34368120736`
- job: `102522033597`
- Verify conclusion: success
- full suite: 35 test files / 173 tests / 0 failures
- focused tests: 5

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not implicitly promote accumulated D&D, BRP, or companion work. Preserve exact-SHA `dev -> qa -> main` promotion.

## What Is Proven

The generic random-table evaluator remains system-neutral and unchanged.

BRP now has two concrete consumers:

1. Profession suggestion proves an enum-like result, creator override, retained provenance, reopen, and no direct native patching.
2. Scholar academic suggestion proves a richer nested result containing BRP skill key, Knowledge/Science parent, specialty identity, display label, and source base chance.

The Scholar consumer also proves multiple independent suggestion slots. Each of the five Scholar academic rows can retain its own suggestion record; re-suggesting one slot replaces only that slot; manual row editing clears only that slot's suggestion provenance. Reopen restores a record only while it still matches authoritative BRP native state.

A nested result object does not require nested random-table evaluation. No subtable feature was added.

## Immediate Slice: Creator Randomization Orchestration

Establish a consistent user-facing randomization pattern across D&D and BRP using existing system-owned random seams.

The goal is not to randomize every visible field. It is to separate shared interaction/orchestration from system-specific random semantics and provide a useful `Randomize All` pattern without inventing distributions.

Required approach:

1. Inventory existing random controls before editing:
   - D&D name generation;
   - D&D class/background/species acceptable-pool selection;
   - D&D sticky core-choice single and multi-selection randomizers;
   - D&D random ability generation;
   - BRP profession suggestion;
   - BRP Scholar academic suggestions;
   - BRP standard-rolled characteristics.
2. Define the smallest shared UI/orchestration seam needed for consistent `Randomize All` and field-level random actions.
3. Keep legal value generation and probability/distribution rules in system packages or existing system-owned helpers.
4. Preserve D&D sticky acceptable pools. `Randomize All` must not silently broaden them.
5. For BRP, use only already-supported random/suggestion semantics. Do not invent distributions for Age, Gender, Wealth, or other fields merely to make the button exhaustive.
6. Preserve easy manual override. A later direct edit must remain authoritative and clear stale suggestion provenance where relevant.
7. Preserve replay/provenance whenever a random result is retained in CharacterDocument generation state.
8. Add focused tests for orchestration boundaries, pool preservation, manual override, and any changed provenance behavior.

If a truly shared helper is added, it should coordinate callbacks/field intents only. It must not know D&D classes, BRP professions, rules source IDs, or random distributions.

## Opportunistic D&D Random UX Debt

Because this slice naturally touches randomization UI, fold in these accepted findings if they remain small and well-bounded:

- hide the disabled `Roll First` assignment control until rolls exist;
- move verbose 4d6 roll history out of the cramped inline result display and into hover/detail text;
- when a roll is reassigned, swap the displaced assignment rather than allowing two abilities to point at the same roll slot.

Do not let these become a broad D&D creator rewrite.

## Explicitly Deferred

Do not add without concrete evidence:

- random distributions for BRP Age, Gender, Wealth, or identity fields;
- structured naming architecture or expansion of the temporary flat D&D name list;
- nested/subtable evaluation;
- dice-range random-table authoring syntax;
- without-replacement or uniqueness sampling in the generic table engine;
- conditional table graphs;
- universal trait/ideal/bond/flaw ontology;
- user-authored table persistence/editor UI;
- direct native-state mutation from random-table evaluation.

## Architecture Guardrails

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- `character-document/0.1` remains the shared contract unless concrete cross-system evidence requires change.
- Shared creator code may coordinate interactions, but system rules and distributions stay system-owned.
- Random-table evaluation is a generation primitive, not a state model.
- System datasets/mappings remain system-owned.
- Generic evaluator code remains system-neutral.
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
