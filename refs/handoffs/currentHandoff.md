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

- `9c14843f6ee462c1531e1a4457d1f8d290a14fbb`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D, BRP, random-table, creator, naming, or Narrative work.

D&D 5E 2024 mechanical SRD Level 1 breadth remains automated-green at `55f79a1004c14eef1635e92c602e1fefa18cab15`. D&D Issue #11 remains the accumulated owner runtime-QA/promotion gate.

Important Narrative checkpoints include:

- Quick top-level creator mode: `418db810828c6a44d7b24b88ef69a3b6ffdffc40`;
- first Guided Narrative slice: `bd5de95193002cb7ad176c5b325d42d5e21ff78c`;
- Narrative choice-shape refinement: `3ff8b064e614f964e83ff7dfc5549ce96594a33a`;
- Narrative -> Guided Mechanical continuation: `b56efbadc5fcfdbb353cc3f8e74ebda10f6c905b`;
- Narrative Alignment decomposition: `3d9be423d46c45c00ef2eed1b7d643186ed6530a`;
- Narrative starting-equipment preference: `5760a079ad8e188320997dcc02ddf8f683bd1d99`;
- Fighter-specific Narrative Fighting Style: `0cc60281fc85d1c13511515b573f30dedf3ea2ab`.

## D&D Guided Narrative Fighter Fighting Style

The implementation checkpoint is automated-green at:

- SHA: `0cc60281fc85d1c13511515b573f30dedf3ea2ab`
- Actions: `34407597435`
- job: `102654207021`
- Verify conclusion: success
- suite shape: 44 test files / 216 tests / 0 failures
- tracked paths: 170
- required project-memory files: 14
- OKF: 19 concepts / 9 indexes
- agent context check: 4,114 characters
- web build identity: `Character Forge build 0.0.1 0cc60281`

An earlier implementation head, `001d40ddd6738cc163d6a7158f89dbbdbaa0cb2e`, failed only the strict TypeScript exact-optional-property check. The narrow typing correction landed at the accepted checkpoint above and the complete Verify gate then passed.

No `qa` or `main` promotion occurred.

## Class-Defining-Choice Audit

This slice began with the required discovery pass across the currently supported Level 1 Class-owned choices.

The important shapes are:

- Fighter Fighting Style: 4 supported choices;
- Cleric Divine Order: 2 supported choices, Protector versus Thaumaturge;
- Druid Primal Order: 2 supported choices, Warden versus Magician;
- Warlock Eldritch Invocation: 5 supported choices before adding `Choose for me`;
- prepared spell and cantrip catalogs: commonly about 10 to 20+ choices, often with multiple simultaneous selections;
- Weapon Mastery, skills, Expertise, and similar controls: broader mechanical catalogs rather than one clean fictional discriminator.

The audit found one partial shared semantic axis:

- Cleric Protector and Druid Warden lean toward physical resilience / martial capability;
- Cleric Thaumaturge and Druid Magician lean toward broader magical capability.

That axis does not honestly extend across Fighter, Warlock, or the other supported Classes. Warlock Invocations in particular mix defensive, concentration, weapon-pact, familiar, and spellbook utility semantics.

Therefore no universal Class-feature Narrative ontology is justified.

## Why Fighter Was The Smallest Next Slice

Fighter Fighting Style is a clean Class-specific proof because:

- it is materially playstyle-defining;
- the complete supported catalog has four options, so the full Narrative surface is exactly five choices when `Choose for me` is included;
- the four Narrative preferences map one-to-one onto existing legal `fightingStyleFeatId` values;
- no dependent spell-selection cascade is required;
- the existing Guided Mechanical Fighting Style control already has the direct-selection / sticky acceptable-pool behavior needed for continuation;
- the branch can be conditional on the already-resolved Class without a generic questionnaire engine.

The Fighter-specific Narrative question is:

`As a Fighter, what fighting approach sounds most fun?`

Mappings are D&D-owned and intentionally literal:

- `control-from-range` -> `archery`;
- `hold-the-line` -> `defense`;
- `heavy-weapon` -> `great-weapon-fighting`;
- `paired-weapons` -> `two-weapon-fighting`.

The question includes `Choose for me` and therefore has exactly five presented choices total, meeting the hard ceiling.

This is not a shared combat-role ontology. It is a Fighter-specific presentation over the existing four Fighting Styles.

## Narrative Mapping Contract

The six global Narrative questions remain unchanged:

- role -> Class narrowing;
- past -> Background narrowing;
- heritage -> Species narrowing;
- equipment -> prepared gear versus starting gold;
- order -> one Alignment axis;
- regard -> the other Alignment axis.

Fighter Fighting Style is a conditional Class-specific branch, not a seventh global question.

The branch appears only when the current narrowed/overridden Class selection is Fighter. If the player selects another Class, the Fighter-specific question is not presented or retained as an applicable final choice.

`Choose for me` resolves deterministically from the retained Narrative seed.

Narrative mapping version is now `5` because the retained mapping/replay contract gained the Fighter-specific answer and mapping.

## Direct Narrative Build

Direct Guided Narrative Build still constructs ordinary D&D native state through the existing Guided/native generator.

When the final Narrative Class is Fighter:

- the resolved Fighter preference maps to an existing Fighting Style ID;
- that ID initializes `GuidedDnd5eCoreChoices.fightingStyleFeatId` before ordinary generation;
- the ordinary `class.fighting-style` generation decision remains the final mechanical decision.

When the final Class is not Fighter, no Fighter Fighting Style is applied.

Direct Narrative recipe version is now `0.4`.

Fighter provenance includes:

- submitted and resolved `narrative.fighter-style` answer;
- mapping ID/version;
- starting Fighting Style;
- final Fighting Style;
- ordinary final `class.fighting-style` decision.

No native state is patched after generation.

## Narrative -> Guided Mechanical Fighter Transfer

Continuation recipe version is now `0.4`.

If the Narrative starting Class is Fighter, the continuation record retains the mapped starting `fightingStyleFeatId` alongside the existing Class, Background, Species, Alignment, and equipment values.

Replay validation verifies:

- the submitted/resolved Fighter preference;
- deterministic replay from the retained Narrative seed;
- the mapped starting Fighting Style;
- that non-Fighter continuations do not retain an applicable Fighter style.

The web controller initializes the existing Guided Mechanical Fighting Style control without dispatching a persisted change.

As with Alignment and Class equipment:

- the current direct Fighting Style may be initialized outside the user's sticky acceptable random pool;
- the sticky acceptable pool is not rewritten;
- the Narrative starting style is reapplied through unrelated control rerenders until the player explicitly interacts with Fighting Style;
- changing the select, invoking its randomizer, or editing the acceptable pool makes Guided Mechanical authoritative.

If the player changes Class away from Fighter after continuation, final hybrid provenance records that the Narrative Fighter style no longer applies. If the player remains Fighter but changes Fighting Style, the new Guided choice is final and authoritative.

## Durable Narrative Rules

Continue preserving these rules:

- every Narrative question/choice surface includes `Choose for me` or a semantic equivalent;
- target about 3 presented choices at a step where practical;
- hard upper limit 5 presented choices at any Narrative step, counting `Choose for me`;
- conditional Class-specific Narrative branches are acceptable when real Class-owned semantics justify them;
- similar UI placement does not justify a shared cross-Class ontology;
- large mechanical catalogs are reached through bounded upstream discrimination rather than displayed wholesale;
- Narrative mappings stay owned by the rules system/content that can justify them;
- direct current choices and sticky acceptable random pools remain separate concepts;
- random selections remain constrained to acceptable pools;
- Narrative continuation may initialize a legal direct value without silently rewriting persisted randomization preferences;
- later Guided Mechanical edits remain authoritative;
- Guided Narrative remains a front end over ordinary native generation, not a parallel character model.

## Accumulated QA

Owner browser QA remains useful but nonblocking unless it exposes a concrete defect. Fold these checks into later creator slices:

- all six global Narrative questions plus the conditional Fighter branch;
- Fighter branch appearing only when Fighter is the current Narrative Class;
- all four Fighter preferences reaching the expected ordinary Fighting Style;
- Fighter `Choose for me` replaying deterministically from the Narrative seed;
- direct Narrative Fighter Build retaining the mapped Fighting Style;
- Narrative -> Guided transfer retaining Fighting Style through unrelated rerenders;
- Fighting Style sticky acceptable pools remaining unchanged by transfer initialization;
- explicit Guided Fighting Style changes/randomization/pool edits winning after transfer;
- changing Class away from Fighter removing the applicable Fighter style while retaining Narrative history;
- existing equipment and Alignment transfer behavior;
- Guided / Narrative / Quick switching;
- existing Guided Mechanical Randomize All behavior.

D&D Issue #11 remains the accumulated promotion gate.

## Recommended Next Bounded Slice

The audit exposed one next candidate that has limited cross-Class evidence without becoming universal: **Cleric / Druid martial-versus-magic order preference**.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "D&D Guided Narrative Cleric Druid order preference"`

Before implementation, verify the exact Level 1 mechanical effects and current Guided controls for:

- Cleric Protector versus Thaumaturge;
- Druid Warden versus Magician.

The likely player-facing discriminator is a bounded conditional question such as whether the character should lean toward physical resilience / martial capability or broader magical capability.

If the exact rules data supports that wording cleanly:

- keep it conditional to Cleric and Druid only;
- use one small question with `Choose for me` plus the two substantive preferences;
- map to the existing `divineOrderId` or `primalOrderId` according to the already-resolved Class;
- direct Narrative Build must route through ordinary Guided/native generation;
- continuation must initialize the existing Guided control without rewriting sticky acceptable pools;
- later Guided Mechanical edits remain authoritative;
- retain replayable starting/final provenance.

If the mechanics do not support the same player-intent wording for both Classes, stop after the audit and split the work into smaller Class-specific branches rather than forcing a shared concept.

Do not move on to Warlock Invocation or broad spell recommendations until a separate bounded discriminator is justified. Five Warlock Invocations already exceed the Narrative ceiling once `Choose for me` is added.

## Relevant Files

- `packages/system-dnd5e/src/guidedNarrative.ts`
- `packages/system-dnd5e/src/guidedNarrativeContinuation.ts`
- `packages/system-dnd5e/src/guidedChoices.ts`
- `packages/system-dnd5e/src/guidedDefaults.ts`
- `packages/system-dnd5e/src/clericCatalog.ts`
- `packages/system-dnd5e/src/druidCatalog.ts`
- `packages/system-dnd5e/src/warlockCatalog.ts`
- `packages/system-dnd5e/src/preparedCasterCatalog.ts`
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
- Fighter Fighting Style mapping is Fighter-specific and does not justify a universal combat-role or class-feature ontology.
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
