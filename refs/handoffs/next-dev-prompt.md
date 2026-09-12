---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- name-generation
- random-tables
- stage-3
- roadmap
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

The owner-approved execution sequence is in:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Stages 0, 1, and 2 are complete. Resume **Stage 3 - Name Generator and Random Tables**. Do not reopen branding or roadmap prioritization without materially new evidence.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 3 BRP flavor suggestion catalog"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/owner-approved-priority-sequence-2026-09-11.md`
3. `packages/generator-core/src/randomTable.ts`
4. `packages/system-brp/src/appearanceSuggestion.ts`
5. `packages/system-brp/src/finishing.ts`
6. `apps/web/src/brpFinishingControls.ts`
7. focused finishing/random-table tests

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Exact Green Checkpoint

Current accepted implementation checkpoint:

- SHA: `9202ce38ec22fdb68b6d4d917068d61d14a8de9f`
- Actions: `34691033880`
- Job: `103546180252`
- 65 test files / 309 tests / 0 failures
- 241 tracked paths
- 14 required project-memory files
- OKF 32 concepts / 10 indexes
- agent context 3755 characters
- build `Character Forge build 0.0.1 9202ce38`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Stage 3 Status

Name generation:

- shared `name-markov/0.1` mechanism is complete;
- D&D provider uses a separate versioned demonstration corpus and deterministic replay/provenance.

Random-table integration:

- BRP `appearance` is the completed proof slice;
- it uses the shared `RandomTable` evaluator through a BRP-owned versioned table;
- studio-authored appearance inspiration is explicitly not labeled as BRP ORC rules content;
- suggestion writes into the ordinary editable field;
- user edits remain authoritative;
- only final text is persisted in BRP native state;
- no hidden suggestion seed/provenance is required to reconstruct the character.

## Next Bounded Slice - BRP Flavor Suggestion Catalog

Generalize only the proven BRP finishing-field pattern.

Required shape:

1. Prefer a small BRP-owned flavor table catalog/helper over one new bespoke suggestion module per field.
2. Reuse `evaluateRandomTable`; do not add another randomization engine.
3. Extend suggestions to useful existing optional finishing fields such as size/build, mannerisms, reputation, personal item, background, and beliefs.
4. Keep studio-written inspiration source/version identity explicit and separate from BRP rules provenance.
5. Keep each field editable and overridable through the existing finishing controls.
6. Persist only the final user-visible text into BRP native state.
7. Add compact suggestion affordances without adding a general random-table browser/editor UI.
8. Keep tables bounded; this is reusable infrastructure/content shape, not final corpus breadth.
9. Do not alter BRP mechanics, native-state authority, or finishing-field semantics.

## Future Parchment Worlds Asset Retrieval Boundary

Preserve the option for a future Parchment Worlds API endpoint that retrieves any PW asset - project, character, world, or later asset type - by stable asset type and identity and returns its canonical serializable representation.

Character Forge implications:

- preserve stable document/asset IDs;
- keep canonical native state self-contained and serializable;
- avoid reconstruction-critical UI-only sidecars;
- generation provenance may enrich an asset but must not be required simply to retrieve/read it;
- the generic cross-asset API belongs in Parchment Worlds, not Character Forge.

## Guardrails

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Do not add name/culture/language semantics to Universal Grammar prematurely.
- Species is not synonymous with culture or language.
- Shared generator code owns reusable mechanics, not system/culture semantics.
- Preserve deterministic generation where suggestions expose provenance.
- Random-table output is suggestion/input, not hidden authoritative state.
- User edits override generated flavor suggestions.
- Do not pull deferred Issue #15 BRP polish into Stage 3 unless it becomes a blocker.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every implementation milestone:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
