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

Stages 0, 1, and 2 are complete. Stage 3 has now proven both reusable name generation and a live editable random-table flavor suggestion.

The authoritative stage order remains:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Two explicitly nonblocking BRP polish items remain parked in Issue #15. Do not pull them ahead of the approved sequence unless they become blockers or the owner explicitly asks.

## Exact Green Stage 3 Checkpoint

Current accepted `dev` implementation head:

- SHA: `9202ce38ec22fdb68b6d4d917068d61d14a8de9f`
- Actions: `34691033880`
- Job: `103546180252`
- `npm run verify`: green
- 65 test files
- 309 tests passed
- 0 failures
- 241 tracked paths
- 14 required project-memory files
- OKF: 32 concepts / 10 indexes
- Agent context: 3755 characters
- Build: `Character Forge build 0.0.1 9202ce38`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

No promotion is authorized unless the owner explicitly requests it.

## Stage 3 Name Generation

The shared generator layer includes `name-markov/0.1` in `packages/generator-core/src/nameMarkov.ts`.

D&D name suggestions use that mechanism through a separate, versioned corpus boundary instead of choosing from literal complete names. Existing explicit-randomize, blank fallback, editable final-name behavior, deterministic replay, and provenance checks remain intact.

## Stage 3 Random-Table Proof Complete

BRP `appearance` now proves the random-table companion end to end.

Implemented:

- `packages/system-brp/src/appearanceSuggestion.ts` defines a small versioned appearance-inspiration table;
- content source identity is `character-forge.brp.appearance-inspiration`, explicitly separate from BRP ORC rules provenance;
- evaluation uses the existing system-neutral `RandomTable` / `evaluateRandomTable` engine;
- the finishing UI exposes exactly one compact appearance suggestion action;
- clicking it writes into the ordinary editable appearance textarea;
- later user typing overrides or clears the suggestion normally;
- submit persists only the final text into BRP native identity finishing state;
- suggestion provenance is not hidden inside native state or required to reconstruct the character;
- no BRP mechanical rules or calculations changed.

Focused tests cover deterministic replay, source/table identity, non-mechanical table content, the single UI affordance, manual override, and absence of hidden suggestion-seed state in the persisted character.

## Future Parchment Worlds Asset Retrieval Boundary

Keep a future generic Parchment Worlds API retrieval endpoint in the architecture. The intended boundary is asset-oriented rather than character-specific: callers should eventually be able to request a PW asset such as a project, character, world, or later asset type by stable identity and type and receive its canonical serializable representation.

Implications for Character Forge work now:

- preserve stable asset/document IDs;
- keep native character state canonical and serializable;
- avoid UI-only or hidden sidecar state required to reconstruct an asset;
- keep generation provenance explicit where retained, but do not make it a prerequisite for reading the canonical asset;
- do not implement the endpoint inside Character Forge; Parchment Worlds should own the cross-asset retrieval surface.

## Next Bounded Slice

Expand the proven BRP flavor-suggestion pattern across the remaining useful optional finishing fields without changing `generator-core`.

Prefer a small BRP-owned table catalog/helper over copy-pasted one-off suggestion functions. Candidate fields already present in native finishing state include:

- size/build;
- mannerisms;
- reputation;
- personal item;
- background;
- beliefs.

Keep each result editable and non-mechanical. Do not add a general random-table browser/editor yet. Keep source/version identity explicit, and do not misattribute studio-written inspiration content to BRP rules sources.

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
