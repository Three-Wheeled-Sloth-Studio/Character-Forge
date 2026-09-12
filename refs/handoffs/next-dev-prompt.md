---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- durable-assets
- portrait
- token
- stage-4
- roadmap
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Coordinate read-only architecture inspection with:

`https://github.com/Three-Wheeled-Sloth-Studio/Parchment-Worlds`

Work directly on Character Forge `dev`. Do not promote `qa` or `main` unless explicitly requested. If a proven Stage 4 boundary requires a Parchment change, use Parchment `dev` only and preserve its exact-SHA validation discipline.

The owner-approved execution sequence is in:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Stages 0 through 3 are complete. Resume **Stage 4 - Durable Portrait and Token Assets**.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 4 durable portrait token asset boundary"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/owner-approved-priority-sequence-2026-09-11.md`
3. `packages/character-model/src/characterDocument.ts`
4. Character Forge host/presentation seams that currently receive Parchment project context
5. Parchment `refs/handoffs/currentHandoff.md`
6. Parchment generic asset identity/persistence/relationship contracts
7. targeted portrait/token/media searches in both repos only as needed

Do not reread repository history. Do not resume D&D Guided Narrative or expand Stage 3 content by chronology.

## Exact Green Stage 3 Completion Checkpoint

Accepted Character Forge implementation checkpoint:

- SHA: `43c2a2a380a35137cc655afdb49c0a0f5551ee73`
- Actions: `34691975393`
- Job: `103548720467`
- 66 test files / 312 tests / 0 failures
- 243 tracked paths
- 14 required project-memory files
- OKF 32 concepts / 10 indexes
- agent context 3624 characters
- build `Character Forge build 0.0.1 43c2a2a3`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Stage 3 Closed

Name generation now has a system-neutral Markov mechanism, separate versioned provider/corpus boundaries, deterministic provenance, and a D&D demonstration provider.

Random tables now have a reusable BRP finishing-field integration across all seven existing descriptive fields through one typed catalog/helper. Suggestions remain ordinary editable input and only final user-visible text persists into native BRP state.

Do not broaden those corpora/tables unless a later system or concrete UX requirement supplies new evidence.

## Stage 4 Architecture Audit

Before media implementation, define the ownership and reference boundary.

Required questions to resolve:

1. What is the minimal stable media-reference contract Character Forge needs for portrait and token presentation?
2. Can existing Parchment generic asset identity/lifecycle contracts represent portrait/token media without a new special-purpose asset model?
3. Should character-to-portrait and character-to-token be typed relationships from the character asset to media assets, and what relationship payload is actually necessary?
4. How are replace/remove/regenerate semantics represented, especially the rule that an explicitly supplied token stays authoritative until the user asks to replace/regenerate it?
5. How should storage/provider-specific location information stay behind Parchment while canonical relationships use durable IDs rather than filesystem paths or expiring URLs?
6. How will future generic Parchment asset retrieval by `(assetType, assetId)` expose a character's media relationships while preserving the module-owned CharacterDocument payload unchanged?
7. What is the smallest implementation slice that proves durability and sheet consumption without prematurely building image generation/cropping/upload-provider complexity?

Preferred product flow remains:

`portrait add/import -> durable Parchment media asset -> character relationship -> Character Forge sheet display -> token suggestion -> optional crop/frame editor -> accepted durable token relationship`

## Future Generic Parchment Asset Retrieval Boundary

Preserve the future Parchment-owned API direction:

`(assetType, assetId) -> authorization/membership/revision -> canonical serializable asset`

This must work for projects, characters, worlds, media assets, and later PW asset types without forcing module-owned payloads into one flattened schema.

Character Forge implications:

- stable CharacterDocument/native-state identity;
- no reconstruction-critical UI-only sidecars;
- no media binaries, local paths, upload URLs, or VTT IDs in native RPG state;
- consume stable Parchment-owned references/relationships for presentation and adapters.

## Guardrails

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Portrait/token/media ownership belongs to Parchment asset relationships, not RPG native state.
- Project/campaign context remains authoritative upstream.
- User-supplied token remains authoritative until explicitly replaced/regenerated.
- Foundry schemas remain later adapter targets, not canonical media state.
- Do not pull Issue #15 into Stage 4 unless it blocks this work.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every Character Forge implementation milestone:

```bash
npm run verify
```

For any Parchment change, use its repository validation gate and exact committed SHA.

Do not call a milestone green unless its exact committed SHA passes GitHub Actions.
