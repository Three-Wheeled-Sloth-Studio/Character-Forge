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
python refs/tools/generate_agent_context.py --focus "Stage 3 D&D name provider Markov corpus boundary"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/owner-approved-priority-sequence-2026-09-11.md`
3. `packages/generator-core/src/nameMarkov.ts`
4. `packages/generator-core/src/nameSuggestion.ts`
5. `packages/system-dnd5e/src/nameGeneration.ts` and its focused tests
6. BRP random-table/flavor code only after the D&D provider migration is green

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Exact Green Checkpoint

Current accepted `dev` implementation head:

- SHA: `7b535143e188dd26d1ff41f6517adffd9dc3d7b4`
- Actions: `34647775925`
- Job: `103422558786`
- 64 test files / 304 tests / 0 failures
- 238 tracked paths
- 14 required project-memory files
- OKF 32 concepts / 10 indexes
- agent context 3735 characters
- build `Character Forge build 0.0.1 7b535143`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Stage 3 First Slice Completed

The shared generator layer now includes `name-markov/0.1` in `packages/generator-core/src/nameMarkov.ts`.

It provides:

- corpus-trained character-level transition generation;
- frequency-weighted transitions;
- deterministic behavior through the existing seeded random source;
- caller-owned length and acceptance constraints;
- bounded retries and explicit failure;
- no embedded D&D, BRP, species, culture, or language semantics.

The existing `NameSuggestionProvider` remains the provenance/provider contract. The existing `RandomTable` evaluator remains the system-neutral random-table contract.

## Next Bounded Slice

Migrate only the existing D&D placeholder name provider onto the shared Markov mechanism.

Required shape:

1. Separate D&D training/reference samples into their own corpus module or data boundary.
2. Give that corpus explicit source/version identity and retain it through `NameSuggestion` provenance.
3. Train/use `name-markov/0.1` from the D&D provider instead of selecting one of six complete names.
4. Preserve existing explicit-randomize and blank-fallback behavior, replay validation, generation decisions, and editable final name behavior.
5. Add tests proving deterministic replay and stale provenance rejection when provider/corpus identity does not match.
6. Keep the first corpus intentionally bounded; this slice proves architecture, not linguistic completeness.
7. Do not infer culture or language from D&D species.

Once that is green, the next Stage 3 slice should use the existing random-table evaluator to populate one editable BRP flavor-field suggestion path as a proof of integration.

## Guardrails

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Do not add name/culture/language semantics to Universal Grammar prematurely.
- Species is not synonymous with culture or language.
- Shared generator code owns reusable mechanics, not system/culture semantics.
- Preserve deterministic generation and provenance.
- Random-table output is suggestion/input, not hidden authoritative state.
- Do not pull deferred Issue #15 BRP polish into Stage 3 unless it becomes a blocker.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every implementation milestone:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
