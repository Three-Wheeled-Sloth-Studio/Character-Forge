---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green D&D Guided Narrative -> Guided Mechanical continuation slice.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Start with:

`python refs/tools/generate_agent_context.py --focus "D&D Guided Narrative alignment decomposition"`

Then read `refs/implementation/fileMap.yaml`, `refs/handoffs/currentHandoff.md`, `refs/product/creator-workspace.md`, `refs/product/generation-methods.md`, and only targeted source files. Prefer diff-first continuation and conserve agent context.

## Accepted Continuation Checkpoint

Latest automated-green implementation:

- SHA: `b56efbadc5fcfdbb353cc3f8e74ebda10f6c905b`
- Actions: `34388640406`
- job: `102591189046`
- Verify: success
- 44 test files / 210 tests / 0 failures
- 170 tracked paths
- OKF: 19 concepts / 9 indexes
- agent context: 3,945 characters
- build: `Character Forge build 0.0.1 b56efbad`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not promote unless explicitly instructed.

## Current D&D Creation Flow

D&D has three top-level modes:

- `Guided Mechanical` - default detailed creator;
- `Guided Narrative` - bounded fictional/preference recommendation flow;
- `Quick Generate` - minimal-input system generator.

Narrative now has an explicit `Continue in Guided Mechanical` action.

The continuation contract lives in `packages/system-dnd5e/src/guidedNarrativeContinuation.ts`. It retains and replay-validates the Narrative mapping ID/version, seed, submitted/resolved answers, narrowed candidate sets, recommendations, and pre-continuation Class/Background/Species choices. Final Guided Mechanical edits remain authoritative, while the hybrid generation provenance records both the Narrative starting point and later final choices.

The continuation web controller initializes the existing Guided Mechanical form rather than duplicating detailed controls. It uses one-shot transient direct selections for Class/Background/Species so the player's user-sticky acceptable random pools are not overwritten.

A direct current choice may be outside its sticky acceptable random pool. A `random` current choice must still come from that pool. Preserve this distinction.

## Narrative Choice-Shape Contract

Treat this as a hard product constraint for Narrative flows:

- target about 3 choices per Narrative step where practical;
- hard maximum 5 presented choices per Narrative step;
- `Choose for me` or semantic equivalent counts toward that maximum;
- if a downstream Narrative choice would exceed 5, add an upstream Narrative question, also within the limit, that narrows the downstream branch;
- Narrative overrides stay inside the narrowed branch;
- once the player explicitly continues into Guided Mechanical, normal mechanical catalogs are not subject to the Narrative ceiling;
- direct answers and later Guided edits are authoritative;
- system/content owners define eligible alternatives and seeded resolution behavior.

`DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES = 5` remains the hard D&D validator. Do not weaken it for alignment.

## Immediate Slice: Narrative Alignment Decomposition

Alignment is a good next concrete consumer because the ordinary D&D alignment catalog is larger than the Narrative five-choice ceiling. Do not expose the full alignment dropdown in Narrative.

Required discovery and implementation behavior:

1. Audit the existing supported D&D alignment IDs, labels, defaults, Guided Mechanical control, generation input, and provenance before editing.
2. Define a small D&D-owned Narrative mapping that reaches the existing supported alignment IDs through bounded upstream questions.
3. Prefer two small orthogonal questions if the actual catalog supports that cleanly; do not build a generic conditional-question engine merely to solve alignment.
4. Every new Narrative question includes `Choose for me` and presents no more than 5 total choices including that option.
5. Keep question wording fictional/preference-oriented rather than asking the player to know mechanical alignment terminology.
6. Deterministic `Choose for me` resolution must retain submitted-versus-resolved answers and the Narrative seed.
7. Direct Narrative Build must feed the mapped alignment into the ordinary Guided/native generator instead of continuing to use an unrelated hardcoded Guided default.
8. Narrative -> Guided Mechanical continuation must initialize the existing alignment control from the Narrative result while keeping sticky acceptable-pool preferences separate.
9. If the player later changes alignment in Guided Mechanical, the final mechanical choice wins while the Narrative starting recommendation remains inspectable in provenance.
10. Version the Narrative mapping when the retained answer/mapping contract changes.
11. Keep Class/Background/Species narrowing behavior unchanged unless alignment work exposes a concrete defect.
12. Keep Randomize All suppressed in Narrative and Quick.
13. Do not introduce a universal alignment, morality, personality, or psychology ontology from one D&D system.
14. Do not add BRP Guided Narrative.
15. Do not promote `qa` or `main`.

## Foundation Guardrails

Native system state is mandatory and lossless.

Never reconstruct retained native state from semantic projection.

- `character-document/0.1` remains the shared contract unless concrete cross-system evidence requires change.
- Guided Narrative and Quick remain creation front ends over ordinary native state, not separate state formats.
- Shared creator code coordinates interactions only; system rules, mappings, distributions, and content remain system-owned.
- Direct current choices and sticky random acceptable pools remain separate concepts.
- BRP naming remains setting/campaign/content-package owned.
- No universal Narrative/personality/alignment schema from one D&D consumer.
- Parchment remains system-agnostic.
- Preserve exact-SHA promotion provenance.
- D&D Issue #11 remains the separate accumulated runtime-QA/promotion gate.

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
- broad new Narrative question sets beyond the bounded alignment slice;
- duplicated Guided Mechanical controls inside Narrative;
- changes to Quick Generate mechanics;
- BRP generated names without a real setting provider;
- random-table nesting merely for Narrative mapping;
- unrelated creator cleanup.

## Validation

Run:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions. Update the delta-oriented handoff and related product/roadmap/file-map truth only after a green implementation checkpoint. Do not promote `qa` or `main` unless explicitly instructed.
