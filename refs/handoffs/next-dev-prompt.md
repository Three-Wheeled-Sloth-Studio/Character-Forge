---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green D&D Guided Narrative choice-shape refinement.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Start with:

`python refs/tools/generate_agent_context.py --focus "D&D Guided Narrative continuation into Guided Mechanical"`

Then read `refs/implementation/fileMap.yaml`, `refs/handoffs/currentHandoff.md`, `refs/product/creator-workspace.md`, `refs/product/generation-methods.md`, and only targeted source files. Prefer diff-first continuation and conserve agent context.

## Accepted Narrative Checkpoint

Latest automated-green Narrative refinement:

- implementation SHA: `3ff8b064e614f964e83ff7dfc5549ce96594a33a`
- Actions: `34386315636`
- job: `102583371487`
- Verify: success
- 42 test files / 204 tests / 0 failures
- 167 tracked paths
- OKF: 19 concepts / 9 indexes
- agent context: 3,945 characters
- build: `Character Forge build 0.0.1 3ff8b064`

The original first Narrative implementation remains at `bd5de95193002cb7ad176c5b325d42d5e21ff78c`.

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not promote unless explicitly instructed.

## Current D&D Creation Modes

D&D has:

- `Guided Mechanical` - default detailed creator;
- `Guided Narrative` - narrative/preference front end;
- `Quick Generate` - minimal-input system generator.

Standard Array, Point Cost, Random, and Manual remain ability methods inside Guided Mechanical only.

The Narrative system contract lives in `packages/system-dnd5e/src/guidedNarrative.ts`. It currently asks three questions and maps them to already-supported Class, Background, and Species candidates/recommendations.

Every Narrative question includes an explicit `Choose for me` option. When used, the submitted `choose-for-me` and deterministically resolved substantive answer are both retained with the Narrative seed.

Final Narrative construction still uses `guidedGenerateDnd5eFirstSlice()` and ordinary D&D native validation. Generation provenance records mapping ID/version, seed, submitted/resolved answers, narrowed candidates, recommendations, final choices, and override status. There is no Narrative-specific character-state model.

Shared `Randomize All` remains hidden/guarded in Narrative and Quick. Narrative default/random behavior is expressed through per-question `Choose for me`.

## Narrative Choice-Shape Contract

Treat this as a hard product constraint for Narrative flows:

- target about 3 choices per Narrative step where practical;
- hard maximum 5 presented choices per Narrative step;
- `Choose for me` or semantic equivalent counts toward that maximum;
- if the next Narrative set would exceed 5, add an upstream Narrative question, also within the limit, that narrows the downstream branch;
- do not expose a full 9- or 12-item mechanical catalog as a Narrative override;
- Narrative overrides stay within the narrowed candidate branch;
- to reach an option outside that branch, the player changes an upstream Narrative answer;
- once the player explicitly continues into Guided Mechanical, ordinary mechanical catalogs are no longer subject to the Narrative presentation ceiling.

`DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES = 5` is enforced in the D&D contract. The target of about 3 is a design heuristic, not a hard validator.

## Immediate Slice: Continue Narrative Into Guided Mechanical

Do not duplicate the detailed Guided Mechanical form inside Narrative. Add a narrow continuation seam that carries the Narrative result into the existing detailed editor.

Required behavior:

1. Add a clear `Continue in Guided Mechanical` action from Narrative.
2. Define the smallest D&D-owned/web-controller seam needed to initialize Guided Mechanical Class, Background, and Species from the Narrative final selections.
3. Reuse existing Guided Mechanical controls for skills, spells, equipment, origin details, abilities, and other detailed choices.
4. Preserve Narrative provenance through continuation and final build: mapping ID/version, seed, submitted/resolved answers, narrowed candidates/recommendations, and pre-continuation overrides.
5. Later Guided Mechanical edits remain authoritative final choices while retaining enough provenance to show where the Narrative recommendation began.
6. Do not overwrite user-sticky acceptable pools merely because Narrative initializes a direct current selection. Sticky preferences and per-character Narrative provenance remain separate.
7. Preserve in-progress state while switching among all three D&D modes.
8. Every current and future Narrative question must include `Choose for me` or a semantically equivalent explicit option.
9. Keep every Narrative step at 5 or fewer presented choices and target about 3 where practical. Insert an upstream narrowing question rather than exceeding the limit.
10. Keep Randomize All suppressed in Narrative and Quick.
11. Keep Narrative mappings system-owned and inspectable; browser code coordinates continuation only.
12. Do not create a generic questionnaire engine, personality ontology, trait/ideal/bond/flaw schema, or cross-system Narrative language from this D&D slice.
13. Do not add BRP Guided Narrative.
14. Do not promote `qa` or `main`.

Prefer an explicit transfer/controller seam over DOM-click automation. Keep the seam narrow rather than turning the entire Guided form into a new generic creator-state model.

## Foundation Guardrails

Native system state is mandatory and lossless.

Never reconstruct retained native state from semantic projection.

- `character-document/0.1` remains the shared contract unless concrete cross-system evidence requires change.
- Guided Narrative and Quick are creation front ends over ordinary native state, not separate state formats.
- Shared creator code coordinates interactions only; system rules, mappings, distributions, and content remain system-owned.
- BRP naming remains setting/campaign/content-package owned.
- No universal Narrative/personality/trait schema from one D&D consumer.
- Parchment remains system-agnostic.
- Preserve exact-SHA promotion provenance.
- D&D Issue #11 remains the separate accumulated runtime-QA/promotion gate.

## Relevant Files

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

- BRP Guided Narrative;
- generic questionnaire engine;
- universal personality/psychology/traits/ideals/bonds/flaws schemas;
- broad new Narrative question sets before continuation/editing is proven;
- duplicated Guided Mechanical detail controls inside Narrative;
- changes to Quick Generate mechanics;
- BRP generated names without a real setting provider;
- random-table nesting merely for Narrative mapping;
- unrelated creator cleanup.

## Validation

Run:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions. Update the delta-oriented handoff and related product/roadmap/file-map truth after a green implementation checkpoint. Do not promote `qa` or `main` unless explicitly instructed.
