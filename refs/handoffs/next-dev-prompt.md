---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- weapons
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

Stage 5 - Foundry Export / Import Validation is active. Stage 4 integrated portrait/token browser QA is intentionally deferred to the owner's primary workstation and pinned in Issue #16; it does not block Stage 5 development.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 5 Foundry simple weapon mapping"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`
3. `packages/foundry-adapter/src/dnd5eEquipmentItems.ts`
4. `packages/foundry-adapter/src/dnd5eActor.ts`
5. `packages/foundry-adapter/src/dnd5eEquipmentItems.test.ts`
6. exact pinned Foundry D&D5e 6.0 weapon fixtures/schema for the seven IDs below

Do not reread repository history or reopen Stage 4 implementation.

## Exact Green Implementation Checkpoint

- SHA: `8e4e0d61d75d96fb69f4fd50b35869360e30e4ae`
- Actions: `34718636640`
- Job: `103620274100`
- 68 test files / 327 tests / 0 failures
- 251 tracked paths
- 14 required project-memory files
- OKF: 33 concepts / 10 indexes
- agent context: 3674 characters
- build: `Character Forge build 0.0.1 8e4e0d61`
- Foundry adapter: `0.5.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Current Foundry Target

Pin this slice to:

- Foundry VTT `14.367`
- D&D5e `6.0.0`

Foundry remains an adapter target. Character Forge native D&D state remains authoritative.

## Immediate Work - Simple Weapon Breadth

Map only these currently emitted Character Forge IDs after inspecting their exact pinned Foundry D&D5e 6.0 definitions:

- `dagger`
- `quarterstaff`
- `spear`
- `shortbow`
- `handaxe`
- `mace`
- `sickle`

### Rules

- Use exact Foundry Item type, identifier, weapon type/base item, damage, properties, mastery, range, weight, and price fields supported by the pinned schema.
- Preserve native quantity exactly and keep deterministic embedded IDs source-ID based.
- Keep descriptions empty; do not copy compendium prose.
- Keep Foundry activities empty. Activity/attack automation remains a separate Stage 5 slice.
- Do not infer equipped state from weapon identity.
- Do not infer ammunition/container linkage beyond static target Item fields explicitly present in the pinned schema.
- Do not alter Actor AC, advancement, feature-resource, spell, or media behavior.
- Unsupported IDs remain explicit deferred mapping notes; no generic loot fallback.

### Coverage

Add focused tests proving:

- all seven IDs map to their exact target identifiers and weapon categories/base items;
- damage dice/types and weapon properties match the pinned target fixtures;
- thrown/ranged distance fields are exact where applicable;
- native quantities and deterministic embedded IDs remain stable;
- descriptions and activities stay empty;
- an unrelated martial weapon such as `longsword` remains explicitly deferred in this slice.

Then run exact-SHA GitHub Actions `Verify`.

## Do Not Pull Forward Yet

Do not combine this slice with:

- remaining martial weapon breadth (`scimitar`, `shortsword`, `longbow`, `greataxe`, `longsword`);
- tools/instruments/focus aliases;
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
