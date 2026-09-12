---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- tools
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

Stage 5 - Foundry Export / Import Validation is active. Stage 4 integrated portrait/token browser QA is intentionally deferred to the owner's primary workstation and pinned in Issue #16; it does not block Stage 5 development.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 5 Foundry direct tool mapping"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`
3. `packages/foundry-adapter/src/dnd5eEquipmentItems.ts`
4. `packages/foundry-adapter/src/dnd5eEquipmentItems.test.ts`
5. `packages/foundry-adapter/src/target.ts`
6. exact pinned Foundry D&D5e 6.0 tool schema/fixtures needed for the three IDs below

Do not reread repository history or reopen Stage 4 implementation.

## Exact Green Implementation Checkpoint

- SHA: `1208bcd3ee134c5587d660bb7bd22a97bd05282d`
- Actions: `34726095617`
- Job: `103640344926`
- 68 test files / 329 tests / 0 failures
- 251 tracked paths
- 14 required project-memory files
- OKF 33 concepts / 10 indexes
- agent context 3817 characters
- build: `Character Forge build 0.0.1 1208bcd3`
- Foundry adapter: `0.7.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Current Foundry Target

Pin this slice to:

- Foundry VTT `14.367`
- D&D5e `6.0.0`

Foundry remains an adapter target. Character Forge native D&D state remains authoritative.

## Current Equipment Coverage

All currently emitted Character Forge weapon IDs now have exact pinned mappings, including the completed martial breadth:

- `scimitar`
- `shortsword`
- `longbow`
- `greataxe`
- `longsword`

Ammunition, currently emitted mundane containers, and currently emitted armor/shield IDs are also covered. Unsupported non-weapon IDs remain explicit rather than becoming generic loot.

## Immediate Work - Direct Tool Concepts Only

Map only these currently emitted literal Character Forge IDs after inspecting their exact pinned Foundry D&D5e 6.0 tool definitions/schema:

- `calligraphers-supplies`
- `thieves-tools`
- `herbalism-kit`

This category is deliberately chosen before dynamic artisan-tool/instrument translation because the three IDs are direct literal concepts with an already identified Foundry tool-family target. Use the slice to prove the static tool Item shape before adding compound semantic decomposition.

### Rules

- Confirm each exact Foundry target identifier rather than assuming Character Forge string equality.
- Preserve exact static tool Item fields supported by the pinned schema/fixture.
- Preserve native quantity exactly and keep deterministic embedded IDs source-ID based.
- Preserve Character Forge source provenance.
- Keep descriptions empty; do not copy compendium prose.
- Keep Foundry activities empty unless the tool schema demonstrates a required static non-activity field that must be represented separately.
- Do not infer proficiency, equipped state, or container relationships.
- Do not translate dynamic `artisan-tools:*` or `musical-instrument:*` IDs in this slice.
- Unsupported remaining equipment IDs stay explicit; no generic loot fallback.

### Coverage

Add focused deterministic tests proving:

- all three direct tool IDs map to their exact target identifiers and Item/tool categories;
- exact pinned price, weight, tool subtype/category, and other static fields are preserved where defined;
- native quantities and deterministic embedded IDs remain stable;
- Character Forge source provenance remains intact;
- descriptions and activities stay empty;
- no proficiency, equipped state, container relationship, or semantic alias is invented; and
- a representative compound gap such as `artisan-tools:smiths-tools` remains explicitly deferred.

Then run exact-SHA GitHub Actions `Verify`.

## Do Not Pull Forward Yet

Do not combine this slice with:

- dynamic `artisan-tools:*` translation;
- dynamic `musical-instrument:*` translation;
- focus aliases;
- gaming-set or book aliases;
- healer's-kit activity semantics;
- feature/activity Items;
- spell Items;
- Parchment portrait/token packaging;
- a user-facing Foundry Download action;
- real Foundry runtime import acceptance; or
- bidirectional Foundry sync.

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
