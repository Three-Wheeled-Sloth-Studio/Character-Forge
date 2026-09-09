---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green D&D Quick Generate top-level creator-mode checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Do not reconstruct the full repository history.

Start with:

`python refs/tools/generate_agent_context.py --focus "D&D Guided Narrative first vertical slice"`

Treat that packet as derived orientation only. Then use `refs/implementation/fileMap.yaml`, this handoff, `refs/handoffs/currentHandoff.md`, `refs/product/creator-workspace.md`, `refs/product/generation-methods.md`, and targeted source reads.

Prefer diff-first continuation and conserve coding-agent context deliberately.

## Accepted Automated-Green Quick Creator Checkpoint

D&D top-level Quick creator integration:

- implementation checkpoint: `418db810828c6a44d7b24b88ef69a3b6ffdffc40`
- Actions: `34382893940`
- job: `102571852183`
- Verify conclusion: success
- 41 test files / 197 tests / 0 failures
- tracked paths: 164
- OKF: 19 concepts / 9 indexes
- generated agent context: 3,809 characters
- build identity: `Character Forge build 0.0.1 418db810`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not implicitly promote accumulated D&D, BRP, random-table, creator, or naming work. Preserve exact-SHA `dev -> qa -> main` promotion.

## What The Quick Slice Proved

D&D now has a real creation-mode level above ability-generation methods:

- `Guided Mechanical` remains the default top-level mode;
- `Quick Generate` is a sibling top-level mode;
- Standard Array / Point Cost / Random / Manual remain inside Guided Mechanical only.

`apps/web/src/dndCreatorPanel.ts` owns this D&D-specific mode hierarchy. Both Guided and Quick surfaces stay mounted while toggling so users do not lose in-progress form state just by switching modes.

`apps/web/src/dndQuickCreatorPanel.ts` exposes only the existing Quick API inputs:

- optional name;
- optional seed.

It calls `quickGenerateDnd5eFirstSlice()` directly and publishes through the same `onCharacter` callback used by Guided generation. The browser does not duplicate the Quick template or any system mechanics.

Blank name/seed retain existing generated behavior. Explicit seed preserves deterministic mechanics while new opaque character/native IDs are assigned, as already proven by system tests.

Quick generation provenance remains the existing system provenance. No CharacterDocument, native schema, adapter, Quick template, recipe, dependency, or lockfile changed.

Shared `Randomize All` is hidden/disabled and click-guarded while D&D Quick mode is active. Quick owns randomization through its `Generate character` action, so hidden Guided randomizer controls cannot be invoked accidentally.

BRP remains unchanged and has no Quick mode.

## Immediate Slice: D&D Guided Narrative First Vertical Slice

Guided Narrative is the next top-level D&D creation-mode proof. Keep the first slice deliberately narrow.

Required behavior:

1. Guided Narrative is a third D&D top-level creation mode, not an ability-generation method.
2. Define a small D&D-owned narrative-question/mapping contract before building a large questionnaire.
3. Use only already-supported D&D choices in the first slice. Prefer Class, Background, and Species because the current Guided creator already owns those legal catalogs and generation paths.
4. Narrative answers and their mapping rules must be inspectable. Do not bury the behavior in browser event handlers or opaque prompt text.
5. Important answers and resulting mapped mechanical choices must be retained in generation provenance.
6. Final character construction must use existing guided/native generation APIs. Do not create `narrative-character` state or a parallel adapter.
7. The user must be able to inspect and override mapped ordinary choices. Narrative guidance is a front end for ordinary system choices, not an irreversible black box.
8. If weighted/random selection is used, keep it deterministic from an explicit/generated seed and retain enough provenance to replay the mapping.
9. Keep the first question set small and semantically modest. Do not infer a universal personality, psychological profile, alignment ontology, trait/ideal/bond/flaw schema, or cross-system narrative language from one D&D implementation.
10. Do not expand D&D SRD mechanical breadth merely to make the questionnaire broader. If an answer would map to unsupported mechanics, leave it out of this first slice.
11. Keep Quick and Guided Mechanical behavior unchanged unless a concrete integration bug demands a narrow correction.
12. Keep shared workspace code system-agnostic. D&D-specific question text, weights, and legal outputs belong in `packages/system-dnd5e` or another clearly D&D-owned boundary.
13. Do not add BRP Guided Narrative in this slice.
14. Do not reopen BRP naming architecture, random-table nesting, or general creator polish.

## Recommended First Shape

A small first contract can prove the architecture with a handful of answer IDs and D&D-owned mappings to existing Class / Background / Species IDs.

Prefer a flow like:

- narrative questions produce explicit answer IDs;
- D&D mapping code converts those answers to scored/weighted existing choices;
- the result exposes both selected/recommended choices and why they were recommended;
- creator UI shows the recommendation and allows override or handoff into ordinary Guided selections;
- final generation records both answer provenance and the accepted mechanical choices.

Do not create a generic questionnaire engine unless the concrete D&D proof shows repeated mechanics that warrant one.

## Existing Evidence To Preserve

- D&D mechanical SRD Level 1: `55f79a1004c14eef1635e92c602e1fefa18cab15`.
- BRP first creator UI: `b5cb07ab7c8873694e438bcc6e3ab799bfdf3c02`.
- random-table core: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`.
- BRP Profession consumer: `d4b881b29bd763d9f7fd50e56223b00b37077be2`.
- BRP Scholar academic consumer: `54d471faa5a635e46ab9db90f8d05d26ac32944f`.
- shared creator randomization: `1f6ed5aee24f514fbc4fd9de39f9380e8df3719b`.
- D&D Random-ability UX: `e66003b9b6334218fb689d2da32ae5bf133251af`.
- structured naming provider proof: `978e145bb4614cf6d0f4872cea61c9f9ede613bf`.
- D&D generated-name provenance: `1a1eb5de957eabd87b63785ef8dafccafbd47a44`.
- BRP naming ownership docs head: `515ca38960169f3476fcfdd9ffcc9f0195f36d5b`.
- D&D Quick top-level creator mode: `418db810828c6a44d7b24b88ef69a3b6ffdffc40`.

D&D Issue #11 remains the separate accumulated runtime-QA/promotion gate.

## Closed BRP Naming Decision

Do not reopen BRP naming architecture in this slice.

BRP source evidence established:

- character names are player/GM determined and appropriate to the setting/game;
- optional culture is setting/GM-defined;
- no BRP-generated name corpus or culture-to-name mapping exists in the selected source boundary.

Future BRP naming data is setting/campaign/content-package owned and may be caller/provider supplied through `name-suggestion/0.1`. The absence of a provider is valid.

## Explicitly Deferred

Do not add without concrete evidence:

- BRP Guided Narrative;
- a universal narrative-question engine before the D&D proof needs one;
- a universal personality or psychological schema;
- universal traits/ideals/bonds/flaws vocabulary;
- changes to Quick Generate's first-slice mechanics;
- broad Quick template catalogs;
- BRP generated names without a real setting provider;
- a generic content-provider framework;
- random-table nesting/conditional graphs merely for narrative mapping;
- new D&D SRD mechanics solely to broaden questionnaire outputs;
- general creator cleanup unrelated to the slice.

## Architecture Guardrails

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- `character-document/0.1` remains the shared contract unless concrete cross-system evidence requires change.
- Top-level creation mode and ability-generation method are separate concepts.
- Guided Narrative is a front end over ordinary system-native choices, not a new character-state model.
- Shared creator code coordinates interactions only; system rules, narrative mappings, distributions, and datasets stay system-owned.
- Important narrative answers and accepted mapped choices belong in generation provenance.
- Direct user overrides of mapped choices remain authoritative.
- Preserve deterministic/replay provenance if randomness is used.
- Parchment remains system-agnostic.
- Preserve exact-SHA promotion provenance.
- D&D Issue #11 remains a separate runtime-QA/promotion gate.

## Before Stopping

Run:

`npm run verify`

Do not claim green unless the exact committed SHA passes GitHub Actions.

Update the delta-oriented `refs/handoffs/currentHandoff.md` with accepted baseline, what changed, evidence/gaps, next slice, relevant files, do-not-reopen constraints, and validation SHA/run/job. Update this prompt, roadmap, product references, and file map only where new evidence changes their truth. Do not promote `qa` or `main` unless explicitly instructed.
