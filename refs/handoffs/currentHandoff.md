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

Stages 0, 1, and 2 are complete.

The owner visually accepted the final Stage 2 branding treatment. Do not reopen general productization/branding work without a concrete new defect.

The authoritative stage order remains:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Two explicitly nonblocking BRP polish items remain parked in Issue #15. Do not pull them ahead of the approved sequence unless they become blockers or the owner explicitly asks.

## Exact Green Stage 3 Checkpoint

Current accepted `dev` implementation checkpoint before the BRP appearance-suggestion slice:

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
- Build: `Character Forge build 0.0.1 90af2bb9`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

No promotion is authorized unless the owner explicitly requests it.

## Stage 3 Name Generation

The shared generator layer includes `name-markov/0.1` in `packages/generator-core/src/nameMarkov.ts`.

D&D name suggestions now use that mechanism through a separate, versioned corpus boundary instead of choosing from six literal names. Existing explicit-randomize, blank fallback, editable final name behavior, deterministic replay, and provenance checks remain intact.

## Stage 3 Random-Table Proof Slice

The next active slice uses the existing `RandomTable` evaluator to suggest exactly one editable BRP finishing field: `appearance`.

Required behavior:

- table content is Character Forge-owned inspiration content, not BRP ORC rules text;
- deterministic seed/table/source provenance exists at suggestion time;
- the suggestion is written into the same editable appearance field already used by the creator;
- later user edits overwrite the suggestion normally;
- only the final descriptive text is persisted into BRP native identity finishing state;
- no hidden authoritative sidecar state or mechanical effect is introduced.

## Future Parchment Worlds Asset Retrieval Boundary

Keep a future generic Parchment Worlds API retrieval endpoint in the architecture. The intended boundary is asset-oriented rather than character-specific: callers should eventually be able to request a PW asset such as a project, character, world, or later asset type by stable identity and type and receive its canonical serializable representation.

Implications for Character Forge work now:

- preserve stable asset/document IDs;
- keep native character state canonical and serializable;
- avoid UI-only or hidden sidecar state required to reconstruct an asset;
- keep generation provenance explicit where retained, but do not make it a prerequisite for reading the canonical asset;
- do not implement the endpoint inside Character Forge; Parchment Worlds should own the cross-asset retrieval surface.

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
