---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- armor
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

Stage 5 - Foundry Export / Import Validation is active. Stage 4 integrated portrait/token browser QA is intentionally deferred to the owner's primary workstation and pinned in Issue #16; it does not block Stage 5 development.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 5 Foundry armor and shield mapping"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`
3. `packages/foundry-adapter/src/dnd5eEquipmentItems.ts`
4. `packages/foundry-adapter/src/dnd5eActor.ts`
5. `packages/foundry-adapter/src/dnd5eEquipmentItems.test.ts`
6. `packages/foundry-adapter/src/dnd5eActor.test.ts`
7. exact pinned Foundry D&D5e 6.0 fixtures/schema for the four armor/shield IDs below

Do not reread repository history or reopen Stage 4 implementation.

## Exact Green Implementation Checkpoint

- SHA: `ba6a0422d061f5f2668307ffa461defa8ee5d77d`
- Actions: `34717871458`
- Job: `103618240347`
- 68 test files / 325 tests / 0 failures
- 251 tracked paths
- 14 required project-memory files
- OKF: 33 concepts / 10 indexes
- agent context: 3717 characters
- build: `Character Forge build 0.0.1 ba6a0422`
- Foundry adapter: `0.4.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Current Foundry Target

Pin this slice to:

- Foundry VTT `14.367`
- D&D5e `6.0.0`

Foundry remains an adapter target. Character Forge native D&D state remains authoritative.

## Immediate Work - Armor + Shield Breadth

Map only these currently emitted Character Forge IDs after inspecting their exact pinned Foundry 6.0 definitions:

- `chain-shirt`
- `shield`
- `leather-armor`
- `studded-leather-armor`

### Rules

- Use exact Foundry Item type/identifier/armor/type/properties/strength/weight/price fields supported by the pinned schema.
- Keep descriptions empty; do not copy compendium prose.
- Preserve deterministic embedded IDs and Character Forge source ID/quantity flags.
- Respect target quantity semantics rather than silently mutating native state.
- Do not infer Foundry advancement or activities.
- Do not change Actor AC calculation mode. `derived.armorClass` remains exported as flat authoritative state until a separate parity slice proves Foundry-derived AC.
- Do not assume equipped state from item identity alone. Preserve the existing adapter boundary unless native state explicitly proves more.
- Unsupported IDs remain explicit deferred mapping notes; no generic loot fallback.

### Coverage

Add focused tests proving:

- all four IDs map to the correct Foundry target type and identifier;
- armor category and key armor fields match the pinned target model;
- deterministic embedded IDs remain stable;
- no compendium prose or advancement/activity automation is copied;
- Actor AC remains flat when a representative mapped armor/shield Item is present;
- unrelated unsupported equipment remains explicit.

Then run exact-SHA GitHub Actions `Verify`.

## Do Not Pull Forward Yet

Do not combine this slice with:

- remaining weapon breadth;
- tool/instrument/focus alias translation;
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
