---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- equipment
---
# Current Handoff

Date: 2026-09-12
Branch: `dev`
Current stage: **Stage 5 - Foundry Export / Import Validation (active)**

## Current State

Stages 0 through 3 are complete.

Stage 4 durable portrait/token implementation is complete, but integrated owner/browser QA is intentionally deferred until the owner is back at a primary workstation. Character Forge Issue #16 is the durable QA return point. That deferred QA is **not** a Stage 5 development blocker.

Issue #15 remains parked and nonblocking.

The authoritative stage order remains:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

## Exact Green Stage 5 Equipment Checkpoint

Accepted `dev` implementation head:

- SHA: `e2e9470f90671ed7cdcb7032eb9720f0b1c0afe3`
- Actions: `34697740762`
- Job: `103564028657`
- `npm run verify`: green
- 68 test files
- 322 tests passed
- 0 failures
- 250 tracked paths
- 14 required project-memory files
- OKF: 32 concepts / 10 indexes
- Agent context: 3877 characters
- Build: `Character Forge build 0.0.1 e2e9470f`
- Foundry adapter: `0.3.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

No promotion is authorized unless the owner explicitly requests it.

## Stage 5 Target Boundary

The current adapter is pinned to:

- Foundry VTT `14.367`
- D&D5e `6.0.0`

Preserve these rules:

- Character Forge native D&D state is canonical.
- Foundry Actor/Item data is an adapter target only.
- Do not project through Universal Grammar.
- Do not copy Foundry compendium prose into exported Items.
- Do not replay Foundry advancement for choices Character Forge already resolved.
- Do not invent generic loot for unsupported Character Forge equipment IDs.
- Keep unsupported mappings explicit.

## Implemented Foundry Slices

### Actor shell - complete

Checkpoint `ca345ca693ac269f4ca900160a2611f8ebb93a01` proved deterministic Actor JSON with actor-level abilities, saves, HP, flat AC, initiative, movement, senses, alignment, XP, size, languages, currency, skills, spell slots, token shell, and Character Forge source flags.

### Identity Items - complete

Checkpoint `3ebf76461a7592878f66f089a51b261868460fa3` added deterministic embedded Class, Background, and Race Items with Actor detail references.

Identity Items intentionally contain:

- no copied rules text;
- no advancement automation; and
- no starting-equipment replay.

### Bounded equipment proof - complete

Checkpoint `e2e9470f90671ed7cdcb7032eb9720f0b1c0afe3` adds a pinned equipment-definition registry and maps the complete Avery/Fighter fixture:

- `chain-mail` -> equipment
- `greatsword` -> weapon
- `flail` -> weapon
- `javelin x8` -> weapon stack
- `dungeoneers-pack` -> container

The equipment adapter:

- aggregates repeated native stacks before export;
- uses deterministic embedded IDs;
- retains Character Forge source ID/quantity flags;
- emits explicit unsupported-equipment records instead of fabricating fallback Items;
- leaves Foundry attack activities empty;
- keeps Actor AC flat and authoritative until calculation parity is proven.

## Level 1 Equipment Audit

The durable source/target inventory is:

`refs/integrations/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`

Key result:

- current Level 1 generation can emit 48 literal equipment IDs plus 27 dynamic prefixed tool/instrument IDs;
- Character Forge compound IDs are semantic IDs, not assumed Foundry identifiers;
- `arrow` requires explicit translation to the pinned Foundry ammunition representation;
- `holy-symbol` likewise requires explicit target translation;
- focus, book, gaming-set, artisan-tool, and musical-instrument compound IDs must be decomposed/translated deliberately.

## Next Bounded Stage 5 Slice

Expand the low-ambiguity equipment seam only:

1. map `arrow` to the pinned Foundry ammunition/consumable target while preserving quantity;
2. add `quiver` and proven/fixture-checked mundane pack containers;
3. prove Character Forge -> Foundry identifier translation where IDs differ;
4. do not manufacture pack contents that are absent from native state;
5. leave all other equipment IDs explicitly deferred.

Do not combine this with:

- feature/activity Items;
- spell Items;
- Parchment portrait/token packaging;
- a user-facing Foundry Download button;
- real Foundry runtime acceptance; or
- bidirectional Foundry sync.

## Deferred QA Return Point

Character Forge Issue #16 remains the owner/browser Stage 4 acceptance checklist for the primary workstation. Do not lose or silently close it while Stage 5 proceeds.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Universal Grammar remains a future derived semantic/translation layer with explicit loss/confidence.
- Profession is not class.
- Species is not synonymous with culture or language.
- Portrait/token/VTT media identity belongs to Parchment-owned asset relationships, not RPG native state.
- Foundry schemas are adapter targets, not canonical state.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every Character Forge implementation milestone:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
