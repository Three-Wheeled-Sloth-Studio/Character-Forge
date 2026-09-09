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
- Narrative -> Guided Mechanical continuation: `b56efbadc5fcfdbb353cc3f8e74ebda10f6c905b`.

## Guided Narrative -> Guided Mechanical Continuation

The continuation slice is automated-green at:

- implementation checkpoint: `b56efbadc5fcfdbb353cc3f8e74ebda10f6c905b`
- Actions: `34388640406`
- job: `102591189046`
- Verify conclusion: success
- full suite: 44 test files / 210 tests / 0 failures
- tracked paths: 170
- OKF: 19 concepts / 9 indexes
- generated agent context: 3,945 characters
- web build identity: `Character Forge build 0.0.1 b56efbad`

An earlier code checkpoint, `eefb78dbdaf20c946ac06e7912fc0575e050ab9b`, had typecheck and 209/210 tests green but failed one pre-existing test that encoded the superseded invariant that a direct current selection must belong to the sticky random pool. The implementation intentionally separates those concepts. The test was corrected to retain the real invariant: a `random` selection must belong to its acceptable pool.

## What Changed

Guided Narrative now exposes an explicit `Continue in Guided Mechanical` action.

The continuation flow does not duplicate the detailed D&D form. Instead:

1. Narrative resolves and retains its mapping ID/version, seed, submitted/resolved answers, narrowed candidates, recommendations, and any in-branch overrides.
2. `createDnd5eGuidedNarrativeContinuation()` packages that replayable Narrative result plus the exact pre-Guided Class, Background, and Species selections.
3. The web controller initializes the existing Guided Mechanical form from those three selections.
4. The player uses the ordinary existing Guided Mechanical controls for skills, spells, equipment, origin details, abilities, and other Level 1 choices.
5. Final build runs through the ordinary Guided Mechanical/native generator.
6. `applyDnd5eGuidedNarrativeContinuation()` adds the retained Narrative provenance without changing authoritative native state.

The final generation mode is `hybrid` with method ID `dnd5e:guided-narrative-to-guided-level-one`. The recipe retains both the Narrative starting point and the underlying Guided Mechanical generation metadata.

Later Guided Mechanical edits are authoritative. Narrative mapping decisions retain both `narrativeFinalId` and final `finalId`, plus whether the player overrode the recommendation before continuation and whether the value changed afterward in Guided Mechanical.

Continuation replay validation rejects stale or tampered retained Narrative recommendation provenance.

## Sticky Choice-Pool Boundary

This slice exposed a useful distinction that is now explicit:

- the current **direct** Class/Background/Species choice and the user-sticky **acceptable random pool** are separate concepts;
- a direct current choice may be outside the sticky random pool;
- a randomly selected current choice must still come from the acceptable pool;
- Narrative continuation initializes the current direct choice without silently rewriting the user's sticky acceptable pool.

The web layer uses a one-shot transient selection override when remounting the existing Guided Mechanical form for explicit Narrative continuation. The transient value is consumed once and does not write storage. Tests prove the persisted acceptable pool remains unchanged.

This is deliberately narrower than inventing a general creator-state framework.

## Creator Behavior

All three D&D top-level mode roots remain mounted during ordinary mode switching.

`Continue in Guided Mechanical` is an explicit transfer action, so it intentionally reinitializes the existing Guided Mechanical inner form from the Narrative result. That is different from merely toggling among Guided Mechanical, Guided Narrative, and Quick Generate.

The Narrative name is transferred into Guided Mechanical. Existing generated-name provenance behavior remains intact for later Guided name randomization.

Shared `Randomize All` remains available only in Guided Mechanical. Quick and Narrative keep it hidden/disabled and click-guarded.

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

Do not generalize these D&D questions into a universal personality, psychology, trait, ideal, bond, or flaw ontology.

## No Contract Expansion

This slice did **not** change:

- `character-document/0.1`;
- D&D native schema `dnd5e-character/0.3`;
- the D&D adapter;
- BRP native/system contracts;
- generator-core random-table or naming contracts;
- Parchment persistence format;
- dependencies or lockfile.

Native system state remains authoritative and is not reconstructed from Narrative provenance.

## Accumulated QA

Owner browser QA remains useful but nonblocking unless it exposes a concrete defect. Fold these checks into later creator slices:

- Narrative -> Guided Mechanical transfer of Class/Background/Species and name;
- sticky acceptable pools remaining unchanged after transfer;
- later Guided edits showing as final authoritative choices;
- switching back to the still-mounted Narrative form;
- Guided / Narrative / Quick switching generally;
- Narrative `Choose for me`, `Choose again`, branch narrowing, and five-choice ceiling;
- existing Guided Mechanical Randomize All behavior.

D&D Issue #11 remains the promotion gate.

## Next Slice

With continuation/editing now proven, use a small real D&D choice to exercise the Narrative narrowing rule beyond Class/Background/Species.

Recommended next focus: **Narrative alignment decomposition**.

D&D alignment is a useful concrete case because the ordinary mechanical catalog is larger than the Narrative five-choice ceiling. Do not present the full alignment list inside Narrative. Instead, design a small D&D-owned set of upstream fictional/preference questions, each targeting about 3 choices and never exceeding 5 including `Choose for me`, that deterministically maps to the supported alignment IDs.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "D&D Guided Narrative alignment decomposition"`

Priorities:

1. Audit the existing D&D alignment catalog and current Guided Mechanical alignment control before editing.
2. Define the smallest D&D-owned answer/mapping contract needed to reach the supported alignments without a >5-item Narrative menu.
3. Every new Narrative question includes `Choose for me` and obeys the 5-choice maximum.
4. Prefer two small orthogonal discriminators over a generic conditional-question engine if that is sufficient for the actual alignment catalog.
5. Retain submitted/resolved answers, mapping version, seed behavior, recommendation, and later override provenance consistently with the existing Narrative contract.
6. Direct Narrative Build should feed the mapped alignment through ordinary Guided/native generation instead of hardcoding the current alignment default.
7. Narrative -> Guided Mechanical continuation should initialize the existing alignment control from the Narrative result without rewriting its sticky acceptable pool.
8. Later Guided Mechanical alignment edits remain authoritative and retain the Narrative starting point.
9. Do not broaden this slice into alignment philosophy, personality ontology, or cross-system morality semantics.
10. Do not add BRP Guided Narrative.
11. Do not promote `qa` or `main`.

## Relevant Files

- `packages/system-dnd5e/src/guidedNarrative.ts`
- `packages/system-dnd5e/src/guidedNarrativeContinuation.ts`
- `packages/system-dnd5e/src/guidedGenerate.ts`
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
