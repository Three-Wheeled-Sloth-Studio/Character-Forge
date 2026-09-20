---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- artisan-tools
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

Stage 5 - Foundry Export / Import Validation is active. Stage 4 integrated portrait/token browser QA remains deferred to the owner's primary workstation and pinned in Issue #16; it does not block Stage 5 development.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 5 Foundry artisan tool prefix translation"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`
3. `packages/foundry-adapter/src/dnd5eEquipmentItems.ts`
4. `packages/foundry-adapter/src/dnd5eEquipmentItems.test.ts`
5. `packages/foundry-adapter/src/target.ts`
6. the Character Forge source that defines the emitted `artisan-tools:*` suffix set, if needed to confirm the audit
7. exact pinned Foundry D&D5e 6.0 artisan-tool fixtures for the 17 suffixes listed in the audit

Do not reread repository history or reopen Stage 4 implementation.

## Exact Green Implementation Checkpoint

- SHA: `faefe3790f515abe530cb9c20863818cdacf8660`
- Actions: `35510202339`
- Job: `106076655841`
- 68 test files / 330 tests / 0 failures
- 251 tracked paths
- 14 required project-memory files
- OKF 33 concepts / 10 indexes
- agent context 3951 characters
- build: `Character Forge build 0.0.1 faefe379`
- Foundry adapter: `0.8.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Current Foundry Target

Pin this slice to:

- Foundry VTT `14.367`
- D&D5e `6.0.0`

Character Forge native D&D state remains authoritative. Foundry remains an adapter target.

## Current Equipment Coverage

All currently emitted weapons, ammunition, mundane containers, armor/shields, and the three direct literal tool concepts now have pinned mappings.

Direct tool checkpoint `faefe3790f515abe530cb9c20863818cdacf8660` maps:

- `calligraphers-supplies`
- `thieves-tools`
- `herbalism-kit`

It preserves exact pinned static tool fields while leaving descriptions and activities empty. Compound `artisan-tools:*` IDs remain explicit unsupported mappings.

## Immediate Work - Dynamic Artisan Tools Only

Translate the 17 emitted Character Forge IDs in the form:

`artisan-tools:<tool-id>`

The complete allowed suffix set is recorded in the equipment audit. Do not broaden beyond that enumerated set.

### Rules

- Inspect each exact pinned Foundry D&D5e 6.0 artisan-tool fixture before registering it.
- Use an explicit whitelist from the complete Character Forge compound source ID to the Foundry target identifier. Do not implement a generic prefix-strip fallback.
- Preserve the original compound Character Forge source ID in provenance flags and deterministic embedded-ID generation.
- Preserve native quantity exactly.
- Preserve exact pinned price, weight, `type.value`, `type.baseItem`, ability, and other required static tool fields.
- Keep descriptions empty; do not copy compendium prose.
- Keep activities empty; do not replay tool checks or crafting behavior.
- Do not infer proficiency, equipped state, or container relationships.
- Unsupported IDs remain explicit; no generic loot or tool fallback.

### Coverage

Add focused deterministic tests proving:

- all 17 enumerated `artisan-tools:*` IDs map to their exact pinned Foundry target identifiers;
- the original compound Character Forge IDs drive deterministic embedded IDs and remain in source provenance;
- exact pinned static tool fields are preserved for every mapping;
- native quantities are preserved;
- descriptions and activities remain empty;
- no proficiency or relationship state is invented; and
- a representative `musical-instrument:*` ID remains explicitly deferred.

Then run exact-SHA GitHub Actions `Verify`.

## Do Not Pull Forward Yet

Do not combine this slice with:

- dynamic `musical-instrument:*` translation;
- focus aliases;
- gaming-set or book aliases;
- healer's-kit activity semantics;
- feature/activity Items;
- spell Items;
- Parchment portrait/token packaging;
- user-facing Foundry Download UX;
- real Foundry runtime import acceptance; or
- bidirectional Foundry synchronization.

## Guardrails

- Native system state is mandatory and lossless.
- No copied Foundry compendium prose.
- No Foundry advancement replay for already-resolved Character Forge choices.
- Do not use Universal Grammar as the Foundry source.
- Do not silently drop unsupported equipment.
- Do not fabricate fallback loot.
- Keep Actor AC flat until Foundry calculation parity is separately proven.
- Preserve exact-SHA `dev -> qa -> main` promotion.
- Keep Issue #16 pinned for deferred Stage 4 owner/browser QA.

## Validation

```bash
npm run verify
```

Do not call the slice green until the exact committed SHA passes GitHub Actions.
