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

- SHA: `ba6a0422d061f5f2668307ffa461defa8ee5d77d`
- Actions: `34717871458`
- Job: `103618240347`
- `npm run verify`: green
- 68 test files
- 325 tests passed
- 0 failures
- 251 tracked paths
- 14 required project-memory files
- OKF: 33 concepts / 10 indexes
- Agent context: 3717 characters
- Build: `Character Forge build 0.0.1 ba6a0422`
- Foundry adapter: `0.4.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

No promotion is authorized unless the owner explicitly requests it.

## Stage 5 Target Boundary

The current adapter is pinned to:

- Foundry VTT `14.367`
- D&D5e `6.0.0`

Preserve these rules:

- Native system state is mandatory and lossless.
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

### Bounded Fighter equipment proof - complete

Checkpoint `e2e9470f90671ed7cdcb7032eb9720f0b1c0afe3` added a pinned equipment-definition registry and mapped the complete Avery/Fighter fixture:

- `chain-mail` -> equipment
- `greatsword` -> weapon
- `flail` -> weapon
- `javelin x8` -> weapon stack
- `dungeoneers-pack` -> container

### Ammunition and container breadth - complete

Checkpoint `ba6a0422d061f5f2668307ffa461defa8ee5d77d` expands the low-ambiguity inventory seam:

- `arrow` -> Foundry `consumable` with explicit target identifier `arrows`, subtype `arrow`, and native quantity preserved;
- `quiver` -> container with count capacity 20;
- `explorers-pack` -> container;
- `entertainers-pack` -> container;
- `priests-pack` -> container;
- `burglars-pack` -> container;
- `scholars-pack` -> container;
- `pouch` -> container.

The slice also proves:

- explicit Character Forge -> Foundry identifier translation rather than string guessing;
- deterministic embedded IDs remain source-ID based;
- no Foundry compendium prose is copied;
- no nested pack contents are manufactured;
- the live D&D5e 6.0 container model's quantity cap of 1 is respected by deferring unsupported multi-container native stacks rather than mutating source quantity;
- Actor AC remains flat and authoritative.

The equipment adapter still aggregates ordinary repeated stacks before export, retains Character Forge source ID/quantity flags, and emits explicit unsupported-equipment records instead of fabricating fallback Items.

## Level 1 Equipment Audit

The durable source/target inventory is:

`refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`

Key result:

- current Level 1 generation can emit 48 literal equipment IDs plus 27 dynamic prefixed tool/instrument IDs;
- Character Forge compound IDs are semantic IDs, not assumed Foundry identifiers;
- ammunition and all currently emitted mundane pack/container IDs now have pinned mappings;
- focus, book, gaming-set, artisan-tool, and musical-instrument compound IDs still require deliberate decomposition/translation.

## Next Bounded Stage 5 Slice

Expand armor/shield breadth only:

1. map `chain-shirt` from the exact pinned Foundry 6.0 fixture;
2. map `shield` from the exact pinned Foundry 6.0 fixture;
3. map `leather-armor` from the exact pinned Foundry 6.0 fixture;
4. map `studded-leather-armor` from the exact pinned Foundry 6.0 fixture;
5. preserve deterministic IDs and Character Forge source provenance;
6. keep Actor AC exported as flat authoritative state even when these equipment Items are present;
7. do not infer equipped state beyond what Character Forge native state and the existing adapter contract can prove;
8. leave all other unmapped equipment explicit and deferred.

Do not combine this with:

- remaining weapon breadth;
- tools/instruments/focus aliases;
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
