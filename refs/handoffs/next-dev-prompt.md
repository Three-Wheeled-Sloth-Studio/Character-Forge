---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green D&D Guided Narrative starting-equipment slice.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Start with:

`python refs/tools/generate_agent_context.py --focus "D&D Guided Narrative class defining choices"`

Then read `refs/implementation/fileMap.yaml`, `refs/handoffs/currentHandoff.md`, `refs/product/creator-workspace.md`, `refs/product/generation-methods.md`, and only targeted D&D creator/source files. Prefer diff-first continuation and conserve agent context.

## Accepted Equipment Checkpoint

Latest automated-green implementation:

- SHA: `5760a079ad8e188320997dcc02ddf8f683bd1d99`
- Actions: `34395268461`
- job: `102613297986`
- Verify: success
- 44 test files / 213 tests / 0 failures
- 170 tracked paths
- OKF: 19 concepts / 9 indexes
- build: `Character Forge build 0.0.1 5760a079`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not promote unless explicitly instructed.

## Current D&D Narrative Shape

D&D Guided Narrative now has six bounded questions:

- role -> Class candidates/recommendation;
- past -> Background candidates/recommendation;
- heritage -> Species candidates/recommendation;
- equipment -> prepared gear versus starting gold;
- order -> Alignment axis;
- regard -> Alignment axis.

Every question includes explicit `Choose for me` and stays at or below the five-choice ceiling.

Narrative mapping version is `4`. Direct Narrative recipe version is `0.3`. Continuation recipe version is `0.3`.

Direct Narrative Build feeds Class, Background, Species, Alignment, Class equipment, and Background equipment through ordinary Guided/native construction.

Narrative -> Guided Mechanical continuation retains the Narrative starting Class, Background, Species, Alignment, Class equipment, and Background equipment. Later Guided Mechanical edits remain authoritative.

## Starting-Equipment Finding

Do not reopen the equipment abstraction without concrete new evidence.

The current supported catalogs show:

- 11 Classes: prepared kit `A` versus starting gold `B`;
- Fighter: prepared heavy/melee kit `A`, prepared lighter/ranged kit `B`, starting gold `C`;
- all four Backgrounds: prepared kit `A` versus 50 GP `B:50-gp`.

The only shared Narrative discriminator justified by the data is therefore:

- `prepared-gear` -> existing Class `A` + Background `A`;
- `starting-gold` -> the Class's existing legal gold option + Background `B:50-gp`.

Fighter `A` versus `B` is a real playstyle choice but remains Guided Mechanical. It does not justify a universal alternate-kit category.

Class equipment continuation initializes the existing current control without rewriting its sticky acceptable random pool. The untouched Narrative preference is reapplied through dependent rerenders; explicit Guided equipment interaction ends that initialization. Background equipment uses the existing direct selector. Hybrid provenance retains starting and final equipment choices.

## Narrative Choice-Shape Contract

Treat this as a hard product constraint:

- target about 3 choices per Narrative step where practical;
- hard maximum 5 presented choices per Narrative step;
- `Choose for me` or semantic equivalent counts toward that maximum;
- if a downstream choice set would exceed 5, add an upstream bounded discriminator rather than exposing the large mechanical catalog;
- Narrative overrides stay inside the narrowed branch;
- once the player explicitly enters Guided Mechanical, ordinary mechanical catalogs are outside the Narrative ceiling;
- direct answers and later Guided edits remain authoritative;
- owning system/content code defines legal mappings and seeded resolution.

Do not weaken `DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES = 5`.

## Immediate Slice: Class-Defining-Choice Audit

Start with discovery, not implementation.

Audit the actual currently supported Level 1 D&D Class-owned choices that materially change how a character plays. Include at least:

- Fighter Fighting Style;
- Cleric Divine Order;
- Druid Primal Order;
- Warlock Eldritch Invocation;
- class spell/cantrip selections where they create clear playstyle distinctions;
- any other already-supported Class-owned choice that is comparably character-defining.

Questions to answer before editing:

1. Which choices are truly character/playstyle-defining versus merely detailed mechanical configuration?
2. Which choices share a real player-intent discriminator across multiple Classes, if any?
3. Which are inherently Class-specific and should stay behind a Class-specific Narrative branch?
4. Which catalogs exceed the five-choice Narrative ceiling and would require an upstream discriminator?
5. Can the smallest useful next slice initialize existing Guided controls without introducing a generic conditional-question engine?
6. Can direct Narrative Build route the result through ordinary Guided/native inputs with clean replay provenance?

Do not assume that Fighting Style, Divine Order, Primal Order, Invocation, and spell selection belong to one universal concept. Similar UI position is not evidence of shared semantics.

## Decision Rule

If the audit exposes one small, honest cross-Class discriminator, summarize it and propose the narrowest implementation.

If the audit shows only Class-specific semantics, prefer one bounded Class-specific branch as the next proof rather than inventing a shared combat-role, magic-style, personality, or class-feature ontology.

If the smallest honest branch would require a generic conditional-question engine, stop after the audit and recommend a smaller prerequisite or different consumer.

Before making changes, summarize:

1. current state;
2. audited Class choice shapes;
3. shared versus Class-specific semantics;
4. whether a coherent next Narrative slice is justified;
5. the smallest proposed implementation shape.

## Foundation Guardrails

Native system state is mandatory and lossless. Never reconstruct retained native state from semantic projection.

- `character-document/0.1` remains the shared contract unless concrete cross-system evidence requires change.
- Guided Narrative and Quick remain creation front ends over ordinary native state.
- Shared creator code coordinates interactions only; D&D rules/mappings stay system-owned.
- Direct current choices and sticky acceptable random pools remain separate concepts.
- Alignment decomposition remains D&D-specific, not a shared morality/personality model.
- Equipment preference remains D&D-specific and does not create a universal gear ontology.
- Fighter's alternate prepared kit remains an ordinary detailed mechanical choice unless a future Class-specific Narrative branch explicitly targets it.
- BRP naming remains setting/campaign/content-package owned.
- Parchment remains system-agnostic.
- Preserve exact-SHA promotion provenance.
- D&D Issue #11 remains the accumulated runtime-QA/promotion gate.

## Explicitly Deferred

- BRP Guided Narrative;
- generic questionnaire/branching engine;
- universal alignment/morality/personality/psychology ontology;
- universal equipment/loadout ontology;
- universal combat-role or class-feature ontology;
- broad spell recommendation/optimization;
- equipment optimization, inventory management, or pricing redesign;
- equipment or spell random tables merely to exercise the random-table engine;
- changes to Quick Generate mechanics;
- BRP generated names without a real setting provider;
- unrelated creator cleanup.

## Validation

Run:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions. Update the delta-oriented handoff and related product/roadmap/file-map truth only after a green implementation checkpoint. Do not promote `qa` or `main` unless explicitly instructed.
