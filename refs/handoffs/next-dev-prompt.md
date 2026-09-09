---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green first D&D Guided Narrative vertical slice.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Do not reconstruct the full repository history.

Start with:

`python refs/tools/generate_agent_context.py --focus "D&D Guided Narrative continuation into Guided Mechanical"`

Treat that packet as derived orientation only. Then use `refs/implementation/fileMap.yaml`, this handoff, `refs/handoffs/currentHandoff.md`, `refs/product/creator-workspace.md`, `refs/product/generation-methods.md`, and targeted source reads.

Prefer diff-first continuation and conserve coding-agent context deliberately.

## Accepted Automated-Green Narrative Checkpoint

First D&D Guided Narrative vertical slice:

- implementation checkpoint: `bd5de95193002cb7ad176c5b325d42d5e21ff78c`
- Actions: `34384877186`
- job: `102578522427`
- Verify conclusion: success
- 42 test files / 203 tests / 0 failures
- tracked paths: 167
- OKF: 19 concepts / 9 indexes
- generated agent context: 3,710 characters
- build identity: `Character Forge build 0.0.1 bd5de951`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not implicitly promote accumulated D&D, BRP, random-table, creator, naming, Quick, or narrative work. Preserve exact-SHA `dev -> qa -> main` promotion.

## What The First Narrative Slice Proved

D&D now has three top-level creation modes:

- `Guided Mechanical` - default detailed creator;
- `Guided Narrative` - narrative/preference front end;
- `Quick Generate` - existing minimal-input system generator.

The Narrative mode is not an ability method and does not own a parallel native state.

`packages/system-dnd5e/src/guidedNarrative.ts` owns the initial question set, deterministic answer resolution, mechanical mappings, and narrative generation wrapper.

The current narrative questions address:

- preferred role in trouble;
- prior life/background flavor;
- heritage preference.

Each question includes an explicit `Choose for me` option. This is a durable product requirement: every future narrative question/choice must expose `Choose for me` or a semantically equivalent explicit option.

When `Choose for me` is used:

- the submitted answer remains `choose-for-me`;
- one substantive answer is deterministically resolved from the narrative seed;
- submitted and resolved values are both retained in generation provenance.

The first mappings produce only already-supported ordinary D&D choices:

- role -> Class candidate set and recommendation;
- past -> Background recommendation;
- heritage -> Species candidate set and recommendation.

The Narrative UI exposes the recommendations as normal Class, Background, and Species selects. The player can override them before building.

Final construction still goes through `guidedGenerateDnd5eFirstSlice()` with existing guided defaults, legal Standard Array behavior, ordinary D&D native construction, adapter validation, and the normal review/save/host boundary.

Generation metadata records narrative mapping ID/version, seed, submitted/resolved answers, candidates, recommendations, final choices, and override status. No narrative-specific CharacterDocument or native schema exists.

Shared `Randomize All` is hidden and guarded in Narrative mode. Narrative random/default behavior comes from the explicit per-question `Choose for me` options and visible seed instead of hidden Guided Mechanical controls.

## Immediate Slice: Continue Narrative Into Guided Mechanical

The first slice deliberately defaults all detailed mechanics after Class/Background/Species. The next product step is not to duplicate the detailed Guided Mechanical form inside Narrative. It is to let the user carry the narrative result into the existing detailed creator for continued customization.

Required behavior:

1. Add a clear `Continue in Guided Mechanical` action from the Narrative surface.
2. Define the smallest D&D-owned or D&D-web controller seam needed to initialize the existing Guided Mechanical Class, Background, and Species selections from the Narrative final choices.
3. Reuse the existing Guided Mechanical controls for class skills, spells, equipment, origin details, abilities, and other detailed choices. Do not duplicate those controls in Narrative.
4. Preserve narrative provenance when the user continues and eventually builds in Guided Mechanical:
   - mapping ID/version;
   - narrative seed;
   - submitted and resolved answers;
   - candidate/recommended choices;
   - Narrative overrides already made before continuation.
5. Later Guided Mechanical changes remain ordinary user overrides and authoritative final choices. Preserve enough provenance to distinguish the original Narrative recommendation from the eventual final character.
6. Do not overwrite user-sticky acceptable pools merely because Narrative initializes a current direct selection. Keep sticky preferences and per-character narrative provenance separate.
7. Preserve in-progress state when switching among Guided Mechanical, Guided Narrative, and Quick Generate.
8. Keep every current and future Narrative question equipped with explicit `Choose for me` or semantic equivalent. Do not replace this with a global hidden randomizer.
9. Keep shared `Randomize All` available only in Guided Mechanical; Narrative and Quick continue to suppress it.
10. Keep all Narrative mapping rules system-owned and inspectable. Browser code may coordinate continuation but must not invent D&D mappings.
11. Do not create a generic questionnaire engine yet. One D&D questionnaire is still insufficient evidence for a universal abstraction.
12. Do not promote personality, traits, ideals, bonds, flaws, psychology, culture, or identity semantics into shared schemas from this work.
13. Do not add BRP Guided Narrative.
14. Do not promote `qa` or `main`.

## Design Preference

Prefer an explicit transfer/initialization seam over DOM-level automation.

A likely useful shape is a small Guided creator controller that can accept supported direct Class/Background/Species selections and, separately, generation decisions/provenance supplied by the Narrative mode. Do not blindly click/select hidden fields from another panel if a bounded controller seam can express the intent more safely and testably.

Keep the seam narrow. Do not turn the entire Guided form state into a new generic cross-system creator state merely to support this transfer.

## Choose For Me Product Rule

For narrative flows, `Choose for me` is part of the interaction contract:

- every narrative question has an explicit equivalent;
- the owning system/content package defines the eligible alternatives;
- deterministic replay is retained when seeded randomness is used;
- submitted-versus-resolved provenance is retained when it matters;
- direct answers and later overrides always win.

Do not infer that every ordinary mechanical dropdown needs `Choose for me`; this requirement applies to the narrative-choice flow.

## Existing Evidence To Preserve

- D&D mechanical SRD Level 1: `55f79a1004c14eef1635e92c602e1fefa18cab15`.
- random-table core: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`.
- BRP first creator UI: `b5cb07ab7c8873694e438bcc6e3ab799bfdf3c02`.
- BRP Profession consumer: `d4b881b29bd763d9f7fd50e56223b00b37077be2`.
- BRP Scholar academic consumer: `54d471faa5a635e46ab9db90f8d05d26ac32944f`.
- shared creator randomization: `1f6ed5aee24f514fbc4fd9de39f9380e8df3719b`.
- D&D Random-ability UX: `e66003b9b6334218fb689d2da32ae5bf133251af`.
- structured naming provider proof: `978e145bb4614cf6d0f4872cea61c9f9ede613bf`.
- D&D generated-name provenance: `1a1eb5de957eabd87b63785ef8dafccafbd47a44`.
- D&D Quick top-level creator mode: `418db810828c6a44d7b24b88ef69a3b6ffdffc40`.
- first D&D Guided Narrative slice: `bd5de95193002cb7ad176c5b325d42d5e21ff78c`.

D&D Issue #11 remains the separate accumulated runtime-QA/promotion gate.

## Closed Decisions

Do not reopen without concrete new evidence:

- BRP naming data is setting/campaign/content-package owned, not `system-brp` owned.
- `name-suggestion/0.1` is sufficient until a real second provider demonstrates a gap.
- Quick Generate and Guided Narrative are top-level creation modes, not ability methods.
- Guided Narrative is a front end over ordinary native system choices.
- every Narrative question includes `Choose for me` or semantic equivalent.
- shared creator code coordinates interactions only; D&D mappings/content remain D&D-owned.
- native state remains mandatory and lossless.
- do not reconstruct native state from semantic projection.
- no universal narrative/personality/trait schema from one D&D consumer.
- Parchment remains system-agnostic.

## Relevant Files

Start with:

- `packages/system-dnd5e/src/guidedNarrative.ts`
- `packages/system-dnd5e/src/guidedNarrative.test.ts`
- `packages/system-dnd5e/src/guidedGenerate.ts`
- `apps/web/src/dndNarrativeCreatorPanel.ts`
- `apps/web/src/dndCreatorPanel.ts`
- `apps/web/src/dndGuidedCreatorPanel.ts`
- `apps/web/src/guidedCreationPanel.ts`
- `apps/web/src/creatorWorkspace.ts`
- `refs/product/creator-workspace.md`
- `refs/product/generation-methods.md`

Load BRP files only if a shared-workspace regression requires them.

## Explicitly Deferred

Do not add without concrete evidence:

- BRP Guided Narrative;
- a universal questionnaire engine;
- universal personality or psychological schema;
- universal traits/ideals/bonds/flaws vocabulary;
- broad new Narrative question sets before the continuation/editing seam is proven;
- duplicated Guided Mechanical detail controls inside Narrative;
- changes to Quick Generate mechanics;
- BRP generated names without a real setting provider;
- random-table nesting merely for Narrative mapping;
- general creator cleanup unrelated to the slice.

## Before Stopping

Run:

`npm run verify`

Do not claim green unless the exact committed SHA passes GitHub Actions.

Update `refs/handoffs/currentHandoff.md` with the accepted baseline, implementation evidence, remaining gaps, next slice, and validation SHA/run/job. Update this prompt, roadmap, product references, and file map only where new evidence changes their truth. Do not promote `qa` or `main` unless explicitly instructed.
