---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green D&D Guided Narrative Fighter Fighting Style slice.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Start with:

`python refs/tools/generate_agent_context.py --focus "D&D Guided Narrative Cleric Druid order preference"`

Then read `refs/implementation/fileMap.yaml`, `refs/handoffs/currentHandoff.md`, `refs/product/creator-workspace.md`, `refs/product/generation-methods.md`, and only targeted D&D creator/source files. Prefer diff-first continuation and conserve agent context.

## Accepted Fighter Checkpoint

Latest automated-green implementation:

- SHA: `0cc60281fc85d1c13511515b573f30dedf3ea2ab`
- Actions: `34407597435`
- job: `102654207021`
- Verify: success
- 44 test files / 216 tests / 0 failures
- 170 tracked paths
- 14 required project-memory files
- OKF: 19 concepts / 9 indexes
- agent context check: 4,114 characters
- build: `Character Forge build 0.0.1 0cc60281`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not promote unless explicitly instructed.

## Current D&D Narrative Shape

D&D Guided Narrative retains six global bounded questions:

- role -> Class candidates/recommendation;
- past -> Background candidates/recommendation;
- heritage -> Species candidates/recommendation;
- equipment -> prepared gear versus starting gold;
- order -> Alignment axis;
- regard -> Alignment axis.

Fighter adds one conditional Class-specific branch after Class is resolved/selected:

- `control-from-range` -> Archery;
- `hold-the-line` -> Defense;
- `heavy-weapon` -> Great Weapon Fighting;
- `paired-weapons` -> Two-Weapon Fighting.

That branch presents four substantive choices plus `Choose for me`, exactly meeting the five-choice ceiling.

Every global or conditional Narrative question includes explicit `Choose for me` and stays at or below the five-choice ceiling.

Narrative mapping version is `5`. Direct Narrative recipe version is `0.4`. Continuation recipe version is `0.4`.

Direct Narrative Build feeds Class, Background, Species, Alignment, Class/Background equipment, and applicable Fighter Fighting Style through ordinary Guided/native construction.

Narrative -> Guided Mechanical continuation retains the applicable Narrative starting choices. Later Guided Mechanical edits remain authoritative.

## Class-Defining-Choice Audit Finding

Do not reopen the audit unless new source data or implementation evidence requires it.

Current Level 1 choice shapes include:

- Fighter Fighting Style: 4 supported choices;
- Cleric Divine Order: Protector or Thaumaturge;
- Druid Primal Order: Warden or Magician;
- Warlock Eldritch Invocation: 5 supported choices before adding `Choose for me`;
- prepared spell/cantrip catalogs: commonly 10 to 20+ options, often with multiple simultaneous selections;
- Weapon Mastery, skills, Expertise, and related controls: broad mechanical catalogs rather than one clean fictional discriminator.

The audit found no honest universal Class-feature ontology.

There is one limited cross-Class semantic candidate:

- Cleric Protector and Druid Warden emphasize physical resilience / martial capability;
- Cleric Thaumaturge and Druid Magician emphasize broader magical capability.

Fighter and Warlock do not fit that axis cleanly. Warlock Invocations mix several unrelated playstyle dimensions.

## Fighter Branch Contract

Fighter Fighting Style is a Class-specific Narrative branch, not a seventh global question and not a shared combat-role ontology.

The branch appears only when the current Narrative Class is Fighter.

Direct Build maps the Narrative preference into existing `GuidedDnd5eCoreChoices.fightingStyleFeatId` before ordinary generation.

Continuation initializes the existing Guided Mechanical Fighting Style control without dispatching a persisted change or rewriting the sticky acceptable Fighting Style pool.

The initialization survives unrelated rerenders until the player explicitly changes/randomizes/edits Fighting Style. Later Guided Mechanical intent is authoritative.

Changing Class away from Fighter removes the applicable final Fighter style while retained Narrative provenance still shows the original starting recommendation.

## Narrative Choice-Shape Contract

Treat this as a hard product constraint:

- target about 3 choices per Narrative step where practical;
- hard maximum 5 presented choices per Narrative step;
- `Choose for me` or semantic equivalent counts toward that maximum;
- conditional Class-specific questions are allowed when the owning Class semantics justify them;
- similar mechanical location does not imply shared semantics;
- if a downstream catalog would exceed 5, add a bounded upstream discriminator or leave it to Guided Mechanical;
- Narrative overrides stay inside the narrowed branch;
- once the player explicitly enters Guided Mechanical, ordinary mechanical catalogs are outside the Narrative ceiling;
- direct answers and later Guided edits remain authoritative;
- owning system/content code defines legal mappings and seeded resolution.

Do not weaken `DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES = 5`.

## Immediate Slice: Cleric / Druid Order Preference

Start with a short verification audit, not implementation by assumption.

Inspect the exact Level 1 mechanics and current Guided controls for:

- Cleric Protector versus Thaumaturge;
- Druid Warden versus Magician.

The candidate player-facing discriminator is:

- lean toward physical resilience / martial capability;
- lean toward broader magical capability.

Questions to answer before editing:

1. Do the exact Protector/Warden mechanics support the same player-facing "physical resilience / martial" wording without hiding an important difference?
2. Do the exact Thaumaturge/Magician mechanics support the same "broader magical capability" wording without overstating equivalence?
3. Can one conditional question be shown only for Cleric and Druid, with mapping dependent on the already-resolved Class?
4. Can the result initialize the existing `divineOrderId` / `primalOrderId` controls without a generic conditional-question engine?
5. Can direct Narrative Build route the mapped choice through ordinary Guided/native inputs with clean replay provenance?
6. Can continuation preserve sticky acceptable pools while later Guided Mechanical edits remain authoritative?

If the evidence supports the shared wording, the smallest implementation should be:

- one conditional Cleric/Druid Narrative question;
- `Choose for me` plus exactly two substantive preferences;
- Cleric mapping: martial/resilience -> Protector, magic -> Thaumaturge;
- Druid mapping: martial/resilience -> Warden, magic -> Magician;
- question absent for every other Class;
- direct Build through existing core choices;
- continuation into existing Guided controls;
- retained submitted/resolved answer, mapping version, seed behavior, starting choice, final choice, and changed-after-continuation provenance.

If the exact mechanics do not support one honest shared wording, stop after the audit and split the work into smaller Cleric-only and Druid-only branches rather than forcing equivalence.

## Do Not Add Yet

Keep this narrow. Do not add:

- Warlock Invocation Narrative mapping;
- broad spell/cantrip recommendation or optimization;
- a generic conditional-question/branching engine;
- universal combat-role, magic-style, class-feature, personality, or psychology ontology;
- BRP Guided Narrative;
- Quick Generate changes;
- unrelated creator cleanup.

Warlock has five Invocation choices already, so adding `Choose for me` would exceed the Narrative ceiling. It needs a separate upstream discriminator before becoming a Narrative surface.

## Foundation Guardrails

Native system state is mandatory and lossless. Never reconstruct retained native state from semantic projection.

- `character-document/0.1` remains the shared contract unless concrete cross-system evidence requires change.
- Guided Narrative and Quick remain creation front ends over ordinary native state.
- Shared creator code coordinates interactions only; D&D rules/mappings stay system-owned.
- Direct current choices and sticky acceptable random pools remain separate concepts.
- Alignment decomposition remains D&D-specific, not a shared morality/personality model.
- Equipment preference remains D&D-specific and does not create a universal gear ontology.
- Fighter Fighting Style remains Fighter-specific and does not create a universal combat-role ontology.
- BRP naming remains setting/campaign/content-package owned.
- Parchment remains system-agnostic.
- Preserve exact-SHA promotion provenance.
- D&D Issue #11 remains the accumulated runtime-QA/promotion gate.

## Validation

Run:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions. Update delta-oriented handoff/product/roadmap/file-map truth only after a green implementation checkpoint. Do not promote `qa` or `main` unless explicitly instructed.
