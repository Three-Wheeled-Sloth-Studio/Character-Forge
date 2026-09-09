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

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D, BRP, random-table, creator, naming, or Narrative work.

D&D 5E 2024 mechanical SRD Level 1 breadth remains automated-green at `55f79a1004c14eef1635e92c602e1fefa18cab15`. Issue #11 remains the separate accumulated owner runtime-QA/promotion gate.

Important later checkpoints include:

- D&D Quick top-level creator mode: `418db810828c6a44d7b24b88ef69a3b6ffdffc40`;
- first D&D Guided Narrative slice: `bd5de95193002cb7ad176c5b325d42d5e21ff78c`;
- Narrative choice-shape refinement: `3ff8b064e614f964e83ff7dfc5549ce96594a33a`;
- Narrative -> Guided Mechanical continuation: `b56efbadc5fcfdbb353cc3f8e74ebda10f6c905b`;
- Narrative alignment decomposition: `3d9be423d46c45c00ef2eed1b7d643186ed6530a`.

## D&D Guided Narrative Alignment Decomposition

The alignment slice is automated-green at:

- implementation checkpoint: `3d9be423d46c45c00ef2eed1b7d643186ed6530a`
- Actions: `34392030680`
- job: `102602424501`
- Verify conclusion: success
- full suite: 44 test files / 211 tests / 0 failures
- tracked paths: 170
- required project-memory files: 14
- OKF: 19 concepts / 9 indexes
- generated agent context: 3,959 characters
- web build identity: `Character Forge build 0.0.1 3d9be423`

## What Changed

The ordinary Guided Mechanical alignment catalog remains the existing nine D&D alignment IDs. Guided Narrative does not expose that nine-item catalog directly.

Instead, the D&D-owned Narrative contract adds two bounded fictional/preference questions:

1. how the character leans when rules and personal freedom conflict: structure, case-by-case judgment, or personal freedom;
2. how the character tends to weigh personal goals against others' well-being: protect others, balance needs, or self-first.

Each question has exactly three substantive choices plus `Choose for me`, so every step remains under the five-choice Narrative ceiling.

The two 3-way answers map deterministically across the ordinary 3 x 3 D&D alignment grid:

- structure + protect -> Lawful Good;
- structure + balance -> Lawful Neutral;
- structure + self-first -> Lawful Evil;
- case-by-case + protect -> Neutral Good;
- case-by-case + balance -> Neutral;
- case-by-case + self-first -> Neutral Evil;
- personal freedom + protect -> Chaotic Good;
- personal freedom + balance -> Chaotic Neutral;
- personal freedom + self-first -> Chaotic Evil.

This is a D&D-owned mapping, not a universal morality/personality ontology.

## Narrative Contract And Provenance

The Narrative mapping version is now `3` because the retained answer/mapping contract changed.

The Narrative question set is now five questions total:

- role -> Class narrowing;
- past -> Background narrowing;
- heritage -> Species narrowing;
- order -> one axis of Alignment;
- regard -> the other axis of Alignment.

All five support explicit `Choose for me`. Seeded resolution retains submitted and resolved answer IDs.

Direct Narrative Build now feeds the mapped alignment into the ordinary `GuidedDnd5eCoreChoices.alignmentId` path before native construction. The native character therefore contains the mapped alignment instead of the unrelated prior default.

Narrative generation recipe version is now `0.2`. Provenance includes `narrative.order`, `narrative.regard`, and `narrative.mapping.alignment`, plus the ordinary final `alignment` decision.

No D&D native schema, adapter, CharacterDocument contract, BRP contract, random-table contract, naming contract, dependency, or lockfile changed.

## Narrative -> Guided Mechanical Alignment Transfer

Continuation recipe version is now `0.2`.

The continuation record now retains the Narrative starting `alignmentId` alongside Class, Background, and Species. Replay validation covers both new answers and the alignment mapping.

The web controller initializes the existing Guided Mechanical alignment control from the Narrative result without dispatching a persisted change and without rewriting the user's sticky acceptable alignment pool.

Because the existing core controls can rerender when other Guided choices change, the controller reapplies the Narrative starting alignment until the player explicitly interacts with alignment itself. Explicit alignment select changes, alignment randomization, or acceptable-pool edits end that initialization behavior. Later Guided Mechanical alignment edits remain authoritative.

Final hybrid provenance retains both the Narrative alignment starting point and the final Guided Mechanical alignment, including whether it changed after continuation. Authoritative native state remains the ordinary Guided Mechanical result.

## Durable Narrative Rules

For current and future Narrative flows:

- every Narrative question/choice surface includes `Choose for me` or a semantic equivalent;
- target about 3 presented choices at a step where practical;
- hard upper limit 5 presented choices at any Narrative step, counting `Choose for me`;
- if a downstream Narrative choice set would exceed 5, add an upstream bounded question to narrow it first;
- Narrative overrides remain inside the narrowed branch;
- once the player explicitly enters Guided Mechanical, ordinary mechanical catalogs are no longer subject to the Narrative five-choice ceiling;
- direct answers and later Guided Mechanical edits remain authoritative;
- seeded resolution retains replay provenance where randomness is used.

Alignment proves the upstream-decomposition rule without introducing a generic questionnaire engine.

## Sticky Choice-Pool Boundary

Continue preserving the distinction established by the previous slice:

- the current direct selection and the user-sticky acceptable random pool are separate concepts;
- a direct current choice may be outside the sticky random pool;
- a randomly selected current choice must still come from the acceptable pool;
- Narrative continuation may initialize a legal direct value without silently rewriting the user's persisted randomization preferences.

Alignment now uses that same product boundary even though its transfer mechanism is a narrow controller initialization rather than the Class/Background/Species one-shot storage seam.

## Accumulated QA

Owner browser QA remains useful but nonblocking unless it exposes a concrete defect. Fold these checks into later creator slices:

- all five Narrative questions, including `Choose for me` and `Choose again`;
- every alignment answer pair reaching the expected ordinary alignment;
- direct Narrative Build retaining the mapped alignment;
- Narrative -> Guided Mechanical transfer retaining the mapped alignment after unrelated core-control rerenders;
- explicit Guided Mechanical alignment edits winning after transfer;
- alignment acceptable pools remaining unchanged by transfer initialization;
- Class/Background/Species transfer and sticky-pool preservation;
- Guided / Narrative / Quick switching;
- existing Guided Mechanical Randomize All behavior.

D&D Issue #11 remains the promotion gate.

## Next Slice

With a >5 mechanical catalog now successfully decomposed into bounded Narrative questions, use a small dependent D&D choice to prove that Narrative can map a preference into existing detailed controls without building a generic conditional engine.

Recommended next focus: **Narrative starting-equipment preference**.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "D&D Guided Narrative starting equipment preference"`

Priorities:

1. Audit current SRD Background equipment A/gold choices and per-Class starting-equipment choices before editing.
2. Determine whether one small fictional/preference question can cleanly express "take a prepared kit / prefer an alternate supported kit / take starting gold" across the currently supported Class and Background catalogs.
3. Keep every Narrative question at 5 or fewer presented choices including `Choose for me`; do not expose full mechanical equipment descriptions as a Narrative menu merely because Guided Mechanical can.
4. Keep the mapping D&D-owned and dependent on the already-resolved Class/Background where necessary. Do not create a generic conditional-question engine unless concrete repeated consumers require one.
5. Direct Narrative Build should feed mapped equipment decisions through the ordinary Guided/native inputs rather than patching native state.
6. Narrative -> Guided Mechanical continuation should initialize existing equipment controls where a clean mapping exists, without rewriting unrelated sticky acceptable pools.
7. Later Guided Mechanical equipment edits remain authoritative while retaining the Narrative starting preference/mapping provenance.
8. If the current SRD option shapes do not support one coherent Narrative question, document that finding and choose a narrower equipment slice rather than forcing a false universal mapping.
9. Do not broaden into universal inventory/loadout ontology, pricing, encumbrance redesign, or equipment random tables.
10. Do not add BRP Guided Narrative.
11. Do not promote `qa` or `main`.

## Relevant Files

- `packages/system-dnd5e/src/guidedNarrative.ts`
- `packages/system-dnd5e/src/guidedNarrativeContinuation.ts`
- `packages/system-dnd5e/src/guidedGenerate.ts`
- `packages/system-dnd5e/src/guidedChoices.ts`
- `packages/system-dnd5e/src/guidedDefaults.ts`
- `packages/system-dnd5e/src/srdCatalog.ts`
- `apps/web/src/dndNarrativeCreatorPanel.ts`
- `apps/web/src/dndGuidedCreatorPanel.ts`
- `apps/web/src/guidedCreationPanel.ts`
- `apps/web/src/stickyChoicePool.ts`
- `refs/product/creator-workspace.md`
- `refs/product/generation-methods.md`

## Do Not Reopen Without New Evidence

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Quick Generate and Guided Narrative are top-level creation front ends, not ability-generation methods.
- Guided Narrative is a front end over ordinary D&D system choices, not a new character-state model.
- Narrative steps target about 3 choices and never present more than 5, counting `Choose for me`.
- Alignment decomposition is D&D-owned and is not a universal morality/personality schema.
- Direct current choices and sticky random-acceptable pools are separate; random selections still come from the acceptable pool.
- Shared creator code coordinates interactions only; system rules, mappings, distributions, and content stay system-owned.
- Parchment remains system-agnostic.
- BRP naming content remains setting/campaign/content-package owned.
- Random-table evaluation remains a separate generation primitive.
- D&D Issue #11 remains a separate promotion gate.

## Validation

Milestone gate:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
