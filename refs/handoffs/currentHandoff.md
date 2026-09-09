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

The starting accepted `dev` head for this slice was:

- `25d6a462c831b4837c1c137e8ab1b4bd51831067`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D, BRP, random-table, creator, naming, or Narrative work.

D&D 5E 2024 mechanical SRD Level 1 breadth remains automated-green at `55f79a1004c14eef1635e92c602e1fefa18cab15`. D&D Issue #11 remains the accumulated owner runtime-QA/promotion gate.

Important later checkpoints include:

- D&D Quick top-level creator mode: `418db810828c6a44d7b24b88ef69a3b6ffdffc40`;
- first D&D Guided Narrative slice: `bd5de95193002cb7ad176c5b325d42d5e21ff78c`;
- Narrative choice-shape refinement: `3ff8b064e614f964e83ff7dfc5549ce96594a33a`;
- Narrative -> Guided Mechanical continuation: `b56efbadc5fcfdbb353cc3f8e74ebda10f6c905b`;
- Narrative alignment decomposition: `3d9be423d46c45c00ef2eed1b7d643186ed6530a`;
- Narrative starting-equipment preference: `5760a079ad8e188320997dcc02ddf8f683bd1d99`.

## D&D Guided Narrative Starting-Equipment Preference

The implementation checkpoint is automated-green at:

- SHA: `5760a079ad8e188320997dcc02ddf8f683bd1d99`
- Actions: `34395268461`
- job: `102613297986`
- Verify conclusion: success
- suite shape: 44 test files / 213 tests / 0 failures
- tracked paths: 170
- OKF remains 19 concepts / 9 indexes
- web build identity: `Character Forge build 0.0.1 5760a079`

No `qa` or `main` promotion occurred.

## Equipment Audit Finding

The slice began with the required catalog audit rather than assuming a shared abstraction.

Supported Class equipment shapes are:

- 11 of 12 supported Level 1 Classes: prepared Class kit `A` versus Class starting gold `B`;
- Fighter: prepared heavy/melee kit `A`, prepared lighter/ranged kit `B`, or starting gold `C`.

Supported Background equipment shapes are uniform across Acolyte, Criminal, Sage, and Soldier:

- thematic prepared Background kit `A`;
- 50 GP `B:50-gp`.

Therefore one coherent global Narrative discriminator is justified only at the higher player-intent level of "start ready with provided gear" versus "start with coin and choose my own gear".

Fighter's `A` versus `B` prepared-kit distinction is a real playstyle choice, but it is not shared across the other Classes. It remains an ordinary Guided Mechanical detail rather than being forced into a fake universal Narrative gear taxonomy.

## Narrative Mapping Contract

Guided Narrative now has six bounded questions:

- role -> Class narrowing;
- past -> Background narrowing;
- heritage -> Species narrowing;
- equipment -> starting-equipment preference;
- order -> one Alignment axis;
- regard -> the other Alignment axis.

The new equipment question has only three presented choices total:

- `Choose for me`;
- start ready with the gear the character's training and past provide;
- carry more coin and choose gear directly.

`Choose for me` is deterministic from the retained Narrative seed, like the other Narrative questions.

The D&D-owned mapping is deliberately narrow:

- `prepared-gear` -> Class `A` + Background `A`;
- `starting-gold` -> each Class's existing legal starting-gold option + Background `B:50-gp`;
- Fighter starting gold maps to `C`, while the other supported Classes map to `B`.

No universal equipment, loadout, inventory, or gear-category ontology was added.

Narrative mapping version is now `4`.

## Direct Narrative Build

Direct Guided Narrative Build still constructs ordinary D&D native state through the existing Guided/native generator.

The resolved equipment preference now initializes:

- `GuidedDnd5eCoreChoices.classEquipmentChoice`;
- the existing `backgroundEquipmentChoice` input.

Native state is never patched afterward.

Direct Narrative recipe version is now `0.3`.

Provenance retains:

- submitted and resolved `narrative.equipment` answers;
- mapping ID/version;
- the resolved Narrative preference;
- starting Class and Background equipment choices;
- final Class and Background equipment choices;
- ordinary `class.equipment` and `background.equipment` final decisions.

## Narrative -> Guided Mechanical Equipment Transfer

Continuation recipe version is now `0.3`.

The continuation record retains the Narrative starting:

- Class;
- Background;
- Species;
- Alignment;
- Class equipment choice;
- Background equipment choice.

Replay validation now covers the equipment answer and verifies that retained starting equipment still maps legally from the replayed preference and starting Class.

The web controller initializes the existing Guided Mechanical equipment controls rather than duplicating them.

Class equipment follows the established direct-selection versus sticky-pool boundary:

- Narrative initialization sets the current legal value without dispatching a persisted change;
- the user's sticky acceptable Class-equipment random pool is not rewritten;
- if another control rerenders Class equipment before the player touches it, the Narrative equipment preference is reapplied against the current Class;
- if the player changes, randomizes, or edits the Class-equipment acceptable pool, that Guided Mechanical intent becomes authoritative and Narrative stops reapplying the value.

Background equipment is the existing direct selector and is likewise initialized until the player explicitly changes it.

Hybrid provenance retains the Narrative starting equipment and final Guided Mechanical equipment, including whether equipment changed after continuation. Authoritative native state remains the ordinary Guided Mechanical result.

## Durable Narrative Rules

Continue preserving these rules:

- every Narrative question/choice surface includes `Choose for me` or a semantic equivalent;
- target about 3 presented choices at a step where practical;
- hard upper limit 5 presented choices at any Narrative step, counting `Choose for me`;
- large mechanical catalogs are reached through bounded upstream discrimination rather than displayed wholesale;
- Narrative mappings stay owned by the rules system/content that can justify them;
- direct current choices and sticky acceptable random pools remain separate concepts;
- random selections remain constrained to acceptable pools;
- Narrative continuation may initialize a legal direct value without silently rewriting persisted randomization preferences;
- later Guided Mechanical edits remain authoritative;
- Guided Narrative remains a front end over ordinary native generation, not a parallel character model.

Equipment is evidence for a shared player-intent discriminator only because the actual D&D catalogs support it. Fighter's alternate prepared kit is equally useful evidence for where not to generalize.

## Accumulated QA

Owner browser QA remains useful but nonblocking unless it exposes a concrete defect. Fold these checks into later creator slices:

- all six Narrative questions, including `Choose for me` and `Choose again`;
- direct Narrative Build for both prepared-gear and starting-gold paths;
- Fighter starting-gold mapping reaching `C`, not prepared kit `B`;
- Narrative -> Guided Mechanical transfer retaining both equipment controls after unrelated rerenders;
- Class changes before equipment interaction remapping the untouched Narrative preference to a legal current-Class equipment choice;
- explicit Guided Mechanical Class/Background equipment edits winning after transfer;
- Class-equipment acceptable pools remaining unchanged by transfer initialization;
- existing Alignment transfer behavior and sticky-pool preservation;
- Class/Background/Species transfer;
- Guided / Narrative / Quick switching;
- existing Guided Mechanical Randomize All behavior.

D&D Issue #11 remains the accumulated promotion gate.

## Recommended Next Bounded Slice

Do not immediately add another Narrative question just to keep the questionnaire growing.

Recommended next work is a discovery-first **D&D Guided Narrative class-defining-choice audit**.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "D&D Guided Narrative class defining choices"`

Audit the currently supported Level 1 Class-owned choices that materially change how a character plays, including examples such as Fighting Style, Cleric Divine Order, Druid Primal Order, Warlock Invocation, and spell/cantrip selections.

The goal is to identify the smallest useful next Narrative discriminator supported by real cross-Class or tightly bounded Class-specific evidence.

Do not assume these choices share one ontology. If the audit shows only Class-specific semantics, recommend the smallest Class-specific or branch-specific slice rather than inventing universal combat-role, magic-style, or personality categories.

Keep discovery bounded. Do not build a generic conditional-question engine, broad spell recommendation system, or universal class-feature ontology merely to support the next slice.

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
- `refs/planning/roadmap.yaml`

## Do Not Reopen Without New Evidence

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Quick Generate and Guided Narrative are top-level creation front ends, not ability-generation methods.
- Guided Narrative is a front end over ordinary D&D system choices, not a new character-state model.
- Narrative steps target about 3 choices and never present more than 5, counting `Choose for me`.
- Alignment decomposition is D&D-owned and is not a universal morality/personality schema.
- Equipment preference mapping is D&D-owned and does not justify a universal gear ontology.
- Fighter's alternate prepared equipment kit remains a detailed mechanical choice, not a universal Narrative category.
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
