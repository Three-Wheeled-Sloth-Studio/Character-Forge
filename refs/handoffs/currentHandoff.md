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

- SHA: `1208bcd3ee134c5587d660bb7bd22a97bd05282d`
- Actions: `34726095617`
- Job: `103640344926`
- `npm run verify`: green
- 68 test files
- 329 tests passed
- 0 failures
- 251 tracked paths
- 14 required project-memory files
- OKF: 33 concepts / 10 indexes
- Agent context: 3817 characters
- Build: `Character Forge build 0.0.1 1208bcd3`
- Foundry adapter: `0.7.0`

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

Checkpoint `ba6a0422d061f5f2668307ffa461defa8ee5d77d` added explicit `arrow` -> Foundry `arrows` ammunition translation and all currently emitted mundane pack/container IDs. Native quantities remain explicit and unsupported multi-container stacks are deferred rather than collapsed.

### Armor and shield breadth - complete

Checkpoint `8e4e0d61d75d96fb69f4fd50b35869360e30e4ae` added exact pinned mappings for:

- `chain-shirt`
- `shield`
- `leather-armor`
- `studded-leather-armor`

These Items remain unequipped and contain no copied prose or activity automation. Actor AC remains flat and authoritative.

### Simple weapon breadth - complete

Checkpoint `fc06c28973f23e5a962c121764509ab5e1545dce` added exact pinned mappings for:

- `dagger`
- `quarterstaff`
- `spear`
- `shortbow`
- `handaxe`
- `mace`
- `sickle`

The slice preserves deterministic embedded IDs, native quantities, pinned static weapon data, the accepted bounded versatile marker for quarterstaff and spear, and `shortbow`'s static `ammunition.type = "arrow"` without inventing an Item relationship.

### Remaining martial weapon breadth - complete

Checkpoint `1208bcd3ee134c5587d660bb7bd22a97bd05282d` adds exact pinned mappings for every remaining currently emitted martial weapon:

- `scimitar`
- `shortsword`
- `longbow`
- `greataxe`
- `longsword`

The slice proves:

- exact target identifiers and martial melee/ranged categories are preserved;
- pinned price, weight, base damage, properties, mastery, and range fields are mapped;
- `longbow` retains static `ammunition.type = "arrow"` without an Item relationship;
- `longsword` retains the accepted bounded versatile marker shape without pulling alternate-damage or attack automation forward;
- native quantities and deterministic Character Forge source-ID-based embedded IDs remain stable;
- descriptions and activities remain empty and equipped state remains uninferred; and
- `thieves-tools` remains explicit deferred equipment rather than becoming fallback loot.

The equipment adapter still aggregates ordinary repeated stacks before export, retains Character Forge source ID/quantity flags, and emits explicit unsupported-equipment records instead of fabricating fallback Items.

## Level 1 Equipment Audit

The durable source/target inventory is:

`refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`

Key result:

- current Level 1 generation can emit 48 literal equipment IDs plus 27 dynamic prefixed tool/instrument IDs;
- Character Forge compound IDs are semantic IDs, not assumed Foundry identifiers;
- all currently emitted weapon IDs now have pinned mappings;
- ammunition, all currently emitted mundane containers, and all currently emitted armor/shield IDs also have pinned mappings;
- direct tool concepts remain a small coherent literal-ID gap; and
- focus, book, gaming-set, dynamic artisan-tool, and musical-instrument compound IDs still require deliberate decomposition/translation.

## Next Bounded Stage 5 Slice

Validate and map only the three direct tool concepts:

1. inspect the exact pinned Foundry D&D5e 6.0 schema/fixtures for `calligraphers-supplies`, `thieves-tools`, and `herbalism-kit`;
2. confirm whether each Character Forge literal ID maps directly or requires an explicit identifier translation;
3. preserve native quantity, deterministic source-ID-based embedded IDs, and Character Forge source provenance;
4. keep descriptions and activities empty unless the pinned tool data model requires a static non-activity field;
5. do not infer proficiency, equipped state, or container relationships; and
6. keep dynamic `artisan-tools:*`, `musical-instrument:*`, focus aliases, and all other non-tool gaps explicit and deferred.

Why this category next: these three literal IDs already have an identified Foundry tool-family target in the equipment audit, so they provide a bounded semantic proof before tackling compound prefixed IDs and broader translation rules.

Do not combine this with:

- dynamic artisan-tool or musical-instrument translation;
- focus aliases;
- healer's-kit activity semantics;
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
