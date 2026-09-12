---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- name-generation
- random-tables
- stage-3
- roadmap
---
# Current Handoff

Date: 2026-09-12
Branch: `dev`
Current stage: **Stage 3 - Name Generator and Random Tables**

## Current State

Stages 0, 1, and 2 are complete. Stage 3 is active.

The owner visually accepted the final Stage 2 branding treatment on 2026-09-11. Do not reopen general productization/branding work without a concrete new defect.

The authoritative stage order remains:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Two explicitly nonblocking BRP polish items remain parked in Issue #15. Do not pull them ahead of the approved sequence unless they become blockers or the owner explicitly asks.

## Exact Green Stage 3 Checkpoint

Current accepted `dev` implementation head:

- SHA: `90af2bb90165f314a75c758f69484043720dac36`
- Actions: `34690245360`
- Job: `103544104724`
- `npm run verify`: green
- 64 test files
- 305 tests passed
- 0 failures
- 239 tracked paths
- 14 required project-memory files
- OKF: 32 concepts / 10 indexes
- Agent context: 3764 characters
- Build: `Character Forge build 0.0.1 90af2bb9`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

No promotion is authorized unless the owner explicitly requests it.

## Stage 3 Foundation

The shared generator layer now has three distinct responsibilities:

1. `NameSuggestionProvider` / `suggestGeneratedName` own deterministic seed and provider/source provenance while keeping naming context opaque to the shared layer.
2. `name-markov/0.1` owns reusable character-sequence generation from caller-supplied training samples.
3. `RandomTable` / `evaluateRandomTable` own deterministic weighted random-table evaluation and explicit table/source provenance.

The shared layer contains no D&D, BRP, species, culture, or language semantics.

## Stage 3 Name-Generator Slices Completed

### Slice 1 - shared Markov mechanism

Added `packages/generator-core/src/nameMarkov.ts` and focused tests.

The mechanism:

- trains a character-level Markov transition model from caller-supplied samples;
- preserves observed transition frequency as weighting;
- is deterministic when driven by the existing seeded random source;
- accepts caller-owned min/max length and candidate acceptance constraints;
- has bounded retry behavior with explicit failure;
- keeps corpora/reference data outside the mechanism.

### Slice 2 - D&D provider migration

The D&D name suggestion provider no longer selects one of six complete placeholder names.

Implemented:

- `packages/system-dnd5e/src/nameGenerationCorpus.ts` as a separate, explicitly versioned demonstration corpus boundary;
- separate given-name and family-name Markov models trained from that corpus;
- `DND5E_MARKOV_NAME_PROVIDER` with new provider/version identity and retained corpus source provenance;
- rejection of exact training exemplars so generated suggestions are sequence-generated rather than direct corpus picks;
- preservation of explicit-randomize, blank-fallback, editable final names, deterministic replay, stale-provenance rejection, and generation-decision recording;
- compatibility alias `DND5E_PLACEHOLDER_NAME_PROVIDER` only to avoid unnecessary caller breakage while new code uses the Markov provider identity.

The corpus is original Character Forge demonstration data, not D&D rules content or setting canon. It is intentionally bounded; this slice proves architecture rather than linguistic completeness.

## Companion Parchment Development Portability Fix

While testing from a clean backup laptop, Parchment Worlds exposed a dev-only workspace-resolution defect: the web app depended on a previously built `packages/project-model/dist/index.js`.

Parchment `dev` now resolves `@parchment-worlds/project-model` directly to workspace source for Vite development while leaving production/API package exports unchanged.

- Parchment SHA: `1039c98ba8c023be74432eb93980a8b0ef956cc0`
- Actions: `34688623418`
- Job: `103539899056`
- validation: green

## Next Bounded Slice

Use the already-existing random-table evaluator to prove one editable BRP flavor-field suggestion path.

Recommended boundary:

1. choose one optional BRP free-text flavor field already owned by native BRP state, preferably `appearance` or another field with no mechanical meaning;
2. define a small, explicitly versioned suggestion table outside `generator-core`;
3. evaluate it through `evaluateRandomTable` with retained seed/table/source provenance;
4. place the result into the ordinary editable creator field rather than a parallel hidden state model;
5. user edits remain authoritative and may replace the suggestion freely;
6. add focused tests for deterministic replay, provenance, and editability;
7. do not widen this slice into all BRP flavor fields or a general random-table UI yet.

If that proof is clean, expand the same pattern to the remaining optional BRP inspiration fields before considering richer table composition.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Universal Grammar remains future derived semantic/translation state with explicit loss/confidence.
- Profession is not class.
- Species is not synonymous with culture or language.
- Shared generator code owns reusable mechanics, not system/culture semantics.
- Random-table output is suggestion/input, not hidden authoritative state.
- Project/Campaign identity owns primary sheet branding.
- Portrait/token/VTT metadata belongs to Parchment-owned asset relationships, not RPG native state.
- Foundry Actor/Item data remains an adapter target.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every Character Forge implementation milestone:

```bash
npm run verify
```

Do not call a Character Forge milestone green unless the exact committed SHA passes GitHub Actions.
