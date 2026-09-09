---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green shared creator randomization orchestration checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Do not reconstruct the full repository history.

Start with:

`python refs/tools/generate_agent_context.py --focus "D&D random ability UX and Randomize All QA"`

Treat that packet as derived orientation only. Then use `refs/implementation/fileMap.yaml`, this handoff, `refs/handoffs/currentHandoff.md`, and targeted source reads.

Prefer diff-first continuation and conserve coding-agent context deliberately.

## Accepted Automated-Green Checkpoint

Shared creator randomization orchestration:

- code checkpoint: `1f6ed5aee24f514fbc4fd9de39f9380e8df3719b`
- Actions: `34369619403`
- job: `102527165230`
- Verify conclusion: success
- full suite: 36 test files / 178 tests / 0 failures
- web build identity: `Character Forge build 0.0.1 1f6ed5ae`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903f0ca1882812`
- `main`: `c7b64ac774b9f903f0ca1882812`

Do not implicitly promote accumulated D&D, BRP, random-table, or creator-orchestration work. Preserve exact-SHA `dev -> qa -> main` promotion.

## What Is Proven

`creatorWorkspace` now exposes one shared `Randomize All` control while system rules remain outside the shell.

`apps/web/src/creatorRandomization.ts` provides only interaction orchestration:

- it repeatedly resolves the next available randomizer after each invocation;
- dependent controls exposed by a re-render may join the same pass;
- each stable control ID is invoked at most once per pass;
- disabled controls are skipped;
- it contains no D&D or BRP rules/distributions.

D&D uses its existing field-level random buttons and, only when the Random ability method is already active, its existing random-roll action. This preserves sticky acceptable pools and existing generation provenance because orchestration invokes the established controls instead of duplicating their semantics.

BRP `Randomize All` is deliberately narrower:

- Profession suggestion participates;
- characteristic re-roll participates only when Standard Rolled is already selected;
- Scholar academic suggestions remain field-level because the current source-safe suggestion table cannot populate five unique required slots;
- Age, Gender, Wealth, name, and other fields remain untouched because explicit distributions/generators are not defined.

## Immediate Slice: D&D Random Ability UX + Randomize All Runtime QA

First, browser/runtime check the new shared orchestration. Then make the three already-accepted D&D Random ability UX fixes.

Required runtime checks:

1. Restrict D&D class/background/species acceptable pools, invoke `Randomize All`, and confirm selections remain within those pools.
2. Exercise dynamic controls, especially class/species choices that reveal dependent controls, and confirm one pass randomizes newly exposed controls without repeated loops.
3. Select D&D Random ability generation and confirm `Randomize All` also produces a fresh roll set.
4. In BRP Explicit mode, confirm `Randomize All` changes only Profession.
5. In BRP Standard Rolled mode, confirm it may change Profession and re-roll characteristics.
6. Confirm BRP Age, Gender, Wealth, name, and Scholar academic rows remain unchanged by `Randomize All`.

Then fix these bounded D&D Random ability findings:

- hide the disabled `Roll First` assignment controls until rolls exist;
- move verbose 4d6 roll-history detail out of the cramped inline result display and into hover/detail text;
- when a roll is reassigned, swap the displaced ability's roll rather than allowing two abilities to reference one roll slot.

Implementation guidance:

- keep `rollDnd5eRandomAbilitySet` and random-roll rules unchanged unless runtime evidence proves a rule defect;
- prefer a small pure assignment-swap helper that can be unit tested;
- preserve the exact six rolled totals and only change their assignment interaction;
- keep provenance and the generated CharacterDocument path unchanged;
- keep the UI change limited to the Random method controls;
- do not broaden acceptable pools or add new random distributions.

## Existing Evidence To Preserve

- D&D mechanical SRD Level 1: `55f79a1004c14eef1635e92c602e1fefa18cab15`.
- BRP first creator UI: `b5cb07ab7c8873694e438bcc6e3ab799bfdf3c02`.
- random-table core: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`.
- BRP Profession consumer: `d4b881b29bd763d9f7fd50e56223b00b37077be2`.
- BRP Scholar academic consumer: `54d471faa5a635e46ab9db90f8d05d26ac32944f`.

## Explicitly Deferred

Do not add without new evidence:

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
- Shared creator code coordinates interactions only; system rules and distributions stay system-owned.
- Preserve sticky acceptable pools and existing D&D provenance semantics.
- Random-table evaluation is a generation primitive, not a state model.
- System datasets/mappings remain system-owned.
- Generic evaluator code remains system-neutral.
- Preserve replay provenance and explicit version boundaries.
- BRP Profession is not D&D class.
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
