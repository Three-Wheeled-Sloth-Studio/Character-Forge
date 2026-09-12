---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- durable-assets
- portrait
- token
- stage-4
- roadmap
---
# Current Handoff

Date: 2026-09-12
Branch: `dev`
Current stage: **Stage 4 - Durable Portrait and Token Assets**

## Current State

Stages 0, 1, 2, and 3 are complete.

The authoritative stage order remains:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Two explicitly nonblocking BRP polish items remain parked in Issue #15. Do not pull them ahead of the approved sequence unless they become blockers or the owner explicitly asks.

## Exact Green Stage 3 Completion Checkpoint

Accepted `dev` implementation head:

- SHA: `43c2a2a380a35137cc655afdb49c0a0f5551ee73`
- Actions: `34691975393`
- Job: `103548720467`
- `npm run verify`: green
- 66 test files
- 312 tests passed
- 0 failures
- 243 tracked paths
- 14 required project-memory files
- OKF: 32 concepts / 10 indexes
- Agent context: 3624 characters
- Build: `Character Forge build 0.0.1 43c2a2a3`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

No promotion is authorized unless the owner explicitly requests it.

## Stage 3 Completed - Name Generator and Random Tables

Name generation now has the reusable architecture required for future language/culture integration:

- shared `name-markov/0.1` sequence-generation mechanism in `generator-core`;
- separate mechanism versus corpus/provider boundaries;
- deterministic seeded replay and provider/source provenance;
- D&D demonstration provider migrated away from literal complete-name selection;
- species remains distinct from culture/language assumptions.

Random-table support now has a live reusable creator pattern:

- the existing system-neutral `RandomTable` evaluator remains the only table engine;
- `packages/system-brp/src/flavorSuggestion.ts` provides one typed finishing-field suggestion contract;
- all seven existing BRP finishing fields have bounded Character Forge-owned inspiration tables: size/build, appearance, mannerisms, reputation, personal item, background, and beliefs;
- all tables share explicit studio-owned source/version identity rather than being mislabeled as BRP rules text;
- every finishing field exposes the same compact suggestion affordance;
- generated text enters the ordinary editable field and may be replaced or cleared normally;
- only final visible text persists into canonical BRP native state;
- no reconstruction-critical hidden seed/provenance sidecar is introduced;
- the original appearance API remains as a compatibility wrapper over the generic catalog.

Do not expand corpora or table content merely for volume. Reopen Stage 3 only when a later culture/language system, new RPG system, or concrete UX need supplies useful new requirements.

## Future Parchment Worlds Asset Retrieval Boundary

Keep a future generic Parchment Worlds API retrieval endpoint in the architecture. The intended boundary is asset-oriented rather than character-specific: callers should eventually be able to request a PW asset such as a project, character, world, portrait/token/media asset, or later asset type by stable identity and type and receive its canonical serializable representation.

Implications for Character Forge work:

- preserve stable asset/document IDs;
- keep native character state canonical and serializable;
- avoid UI-only or hidden sidecar state required to reconstruct an asset;
- keep generation provenance explicit where retained, but do not make it a prerequisite for reading the canonical asset;
- do not implement the generic endpoint inside Character Forge; Parchment Worlds owns the cross-asset retrieval surface.

## Stage 4 Goal - Durable Portrait and Token Assets

Move portrait/token handling beyond session-only presentation while preserving ownership boundaries.

Core rule:

- portrait/token binaries, storage metadata, lifecycle, and relationships are Parchment-owned assets/relationships;
- Character Forge may consume stable references for creator/sheet presentation and future adapters;
- do not place image binaries, local paths, upload URLs, or VTT-specific IDs into D&D/BRP native RPG state.

Preferred UX direction remains:

`empty portrait region -> add/import -> durable portrait -> generated token suggestion -> quick crop/frame editor -> accept`

A user-supplied token remains authoritative until explicitly replaced or regenerated.

## Next Bounded Slice

Begin Stage 4 with an architecture audit before adding media code.

Inspect only the current CharacterDocument/host-presentation seams and Parchment's generic asset persistence/relationship contracts. Determine:

1. the minimal stable portrait/token reference shape Character Forge needs to consume;
2. which existing Parchment generic asset identity/lifecycle fields can be reused unchanged;
3. whether portrait and token should be media assets related to a character asset or typed relationship payloads pointing to media assets;
4. replacement/removal semantics and authoritative-user-token behavior;
5. how local development and hosted storage references remain durable without leaking local filesystem paths into canonical assets;
6. how the future generic `(assetType, assetId)` retrieval API can return characters and their media relationships without flattening module-owned CharacterDocument state;
7. the smallest first implementation slice after the boundary is proven.

Do not implement image generation, cropping, upload providers, or Foundry mapping during the audit unless an existing contract requires a tiny enabling change.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Universal Grammar remains future derived semantic/translation state with explicit loss/confidence.
- Profession is not class.
- Species is not synonymous with culture or language.
- Shared generator code owns reusable mechanics, not system/culture semantics.
- Project/Campaign identity owns primary sheet branding.
- Portrait/token/VTT metadata belongs to Parchment-owned asset relationships, not RPG native state.
- Foundry Actor/Item data remains an adapter target.
- Parchment owns future generic cross-asset retrieval.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every Character Forge implementation milestone:

```bash
npm run verify
```

Do not call a Character Forge milestone green unless the exact committed SHA passes GitHub Actions.
