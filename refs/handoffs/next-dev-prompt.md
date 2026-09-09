---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green D&D Guided Narrative alignment-decomposition slice.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Start with:

`python refs/tools/generate_agent_context.py --focus "D&D Guided Narrative starting equipment preference"`

Then read `refs/implementation/fileMap.yaml`, `refs/handoffs/currentHandoff.md`, `refs/product/creator-workspace.md`, `refs/product/generation-methods.md`, and only targeted D&D creator/source files. Prefer diff-first continuation and conserve agent context.

## Accepted Alignment Checkpoint

Latest automated-green implementation:

- SHA: `3d9be423d46c45c00ef2eed1b7d643186ed6530a`
- Actions: `34392030680`
- job: `102602424501`
- Verify: success
- 44 test files / 211 tests / 0 failures
- 170 tracked paths
- 14 required project-memory files
- OKF: 19 concepts / 9 indexes
- agent context: 3,959 characters
- build: `Character Forge build 0.0.1 3d9be423`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not promote unless explicitly instructed.

## Current D&D Narrative Shape

D&D Guided Narrative now has five bounded questions:

- role -> Class candidates/recommendation;
- past -> Background candidates/recommendation;
- heritage -> Species candidates/recommendation;
- order -> Alignment axis;
- regard -> Alignment axis.

Every question includes explicit `Choose for me` and stays at or below the five-choice ceiling. Alignment proves the upstream-decomposition rule: two 3-way fictional/preference discriminators map to the ordinary nine D&D alignments without displaying that nine-item catalog in Narrative.

Narrative mapping version is `3`. Direct Narrative Build feeds Class, Background, Species, and Alignment through ordinary Guided/native construction. Narrative recipe version is `0.2`.

Narrative -> Guided Mechanical continuation recipe version is `0.2`. It retains the Narrative starting Class, Background, Species, and Alignment and replay-validates the retained answers/mapping. Later Guided Mechanical edits remain authoritative.

Alignment transfer initializes the existing Guided Mechanical alignment control without persisting a change or rewriting its sticky acceptable pool. The controller preserves that initialization through unrelated core-control rerenders until the player explicitly interacts with alignment.

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

## Immediate Slice: Narrative Starting-Equipment Preference

Use starting equipment as the next concrete dependent-choice consumer. This is discovery-first because current Class and Background option shapes are not identical.

Required behavior and questions:

1. Audit the authoritative supported SRD Background equipment choices and each supported Class starting-equipment choice before designing the Narrative question.
2. Determine whether one small preference surface can coherently map across the supported choices, for example prepared kit, alternate supported kit where one exists, or starting gold.
3. Do not assume every Class has the same A/B meaning. The mapping may depend on the already-resolved Class and Background.
4. If the actual catalogs do not support one honest shared Narrative question, document the mismatch and implement a narrower equipment slice instead of fabricating semantics.
5. Every added Narrative choice surface includes `Choose for me` and presents no more than 5 total choices.
6. Keep wording fictional/preference-oriented rather than exposing raw mechanical option letters as Narrative concepts.
7. Keep the mapping D&D-owned and inspectable. Do not build a generic conditional-question engine solely for equipment.
8. Direct Narrative Build must route mapped equipment choices through existing Guided/native generation inputs. Do not patch native state afterward.
9. Narrative -> Guided Mechanical continuation should initialize existing equipment controls where the mapping is well-defined.
10. Preserve sticky acceptable random pools separately from explicit transferred current choices where those controls use pools.
11. Later Guided Mechanical equipment edits remain authoritative while retained Narrative provenance shows the initial recommendation/selection.
12. Version the Narrative mapping and continuation recipe if retained provenance shape changes.
13. Keep Class/Background/Species/Alignment behavior unchanged unless this slice exposes a concrete defect.
14. Keep Randomize All suppressed in Narrative and Quick.
15. Do not introduce universal equipment/loadout ontology, pricing redesign, encumbrance redesign, or equipment random tables.
16. Do not add BRP Guided Narrative.
17. Do not promote `qa` or `main`.

## Foundation Guardrails

Native system state is mandatory and lossless. Never reconstruct retained native state from semantic projection.

- `character-document/0.1` remains the shared contract unless concrete cross-system evidence requires change.
- Guided Narrative and Quick remain creation front ends over ordinary native state.
- Shared creator code coordinates interactions only; D&D rules/mappings stay system-owned.
- Direct current choices and sticky acceptable random pools remain separate concepts.
- Alignment decomposition remains D&D-specific, not a shared morality/personality model.
- BRP naming remains setting/campaign/content-package owned.
- Parchment remains system-agnostic.
- Preserve exact-SHA promotion provenance.
- D&D Issue #11 remains the accumulated runtime-QA/promotion gate.

## Relevant Files

- `packages/system-dnd5e/src/guidedNarrative.ts`
- `packages/system-dnd5e/src/guidedNarrative.test.ts`
- `packages/system-dnd5e/src/guidedNarrativeContinuation.ts`
- `packages/system-dnd5e/src/guidedNarrativeContinuation.test.ts`
- `packages/system-dnd5e/src/guidedGenerate.ts`
- `packages/system-dnd5e/src/guidedDefaults.ts`
- `packages/system-dnd5e/src/guidedChoices.ts`
- `packages/system-dnd5e/src/srdCatalog.ts`
- `apps/web/src/dndNarrativeCreatorPanel.ts`
- `apps/web/src/dndGuidedCreatorPanel.ts`
- `apps/web/src/guidedCreationPanel.ts`
- `apps/web/src/stickyChoicePool.ts`
- `refs/product/creator-workspace.md`
- `refs/product/generation-methods.md`

Load BRP files only if a shared-workspace regression requires them.

## Explicitly Deferred

- BRP Guided Narrative;
- generic questionnaire/branching engine;
- universal alignment/morality/personality/psychology ontology;
- universal equipment/loadout ontology;
- equipment random tables merely to exercise the random-table engine;
- broad new Narrative question sets beyond the bounded equipment slice;
- duplicated Guided Mechanical controls inside Narrative;
- changes to Quick Generate mechanics;
- BRP generated names without a real setting provider;
- unrelated creator cleanup.

## Validation

Run:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions. Update the delta-oriented handoff and related product/roadmap/file-map truth only after a green implementation checkpoint. Do not promote `qa` or `main` unless explicitly instructed.
