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
python refs/tools/generate_agent_context.py --focus "Stage 3 BRP random table flavor suggestion"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/owner-approved-priority-sequence-2026-09-11.md`
3. `packages/generator-core/src/randomTable.ts` and its focused tests
4. BRP native state/schema for optional free-text flavor fields
5. the narrow BRP creator-state/view path for the selected field
6. existing BRP suggestion/provenance patterns only where useful

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Exact Green Checkpoint

Current accepted `dev` implementation head:

- SHA: `90af2bb90165f314a75c758f69484043720dac36`
- Actions: `34690245360`
- Job: `103544104724`
- 64 test files / 305 tests / 0 failures
- 239 tracked paths
- 14 required project-memory files
- OKF 32 concepts / 10 indexes
- agent context 3764 characters
- build `Character Forge build 0.0.1 90af2bb9`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Stage 3 Name Generator Status

Two name-generation slices are complete:

1. shared `name-markov/0.1` mechanism in `generator-core`;
2. D&D provider migration to a separate versioned demonstration corpus using that mechanism.

The D&D provider now generates novel given/family sequences, preserves deterministic replay and source/provider provenance, keeps names editable, and does not infer culture/language from species.

Do not broaden the D&D corpus in the next slice.

## Next Bounded Slice - BRP Random-Table Proof

Use the existing `RandomTable` / `evaluateRandomTable` contract to populate exactly one optional BRP free-text flavor field as an editable suggestion.

Preferred target: `appearance`, if the current BRP native schema and creator UI confirm it is an optional non-mechanical free-text field. If `appearance` is not a clean boundary, select the nearest equivalent flavor-only field already present rather than adding a new schema field.

Required shape:

1. Define a small, explicitly versioned BRP flavor table outside `generator-core`.
2. Evaluate it through `evaluateRandomTable` using a retained deterministic seed.
3. Retain table/source provenance through the creator/generation path where provenance already belongs; do not invent a parallel document model.
4. Write the suggestion into the ordinary editable BRP field.
5. Manual user edits remain authoritative and may replace or clear the suggestion.
6. Add focused tests for deterministic replay, table/source provenance, and editability/override behavior.
7. Keep the table intentionally bounded; this is an integration proof, not final content breadth.
8. Do not add a general random-table browser/editor UI in this slice.
9. Do not modify mechanical BRP calculations or validation behavior.

If the proof is clean, the following slice can expand the same pattern to the remaining optional BRP inspiration fields such as mannerisms, reputation, background, distinctive details, or equivalent existing fields.

## Guardrails

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Do not add name/culture/language semantics to Universal Grammar prematurely.
- Species is not synonymous with culture or language.
- Shared generator code owns reusable mechanics, not system/culture semantics.
- Preserve deterministic generation and provenance.
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
