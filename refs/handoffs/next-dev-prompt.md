---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- healers-kit
- consumable
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

Stage 5 - Foundry Export / Import Validation is active. Stage 4 integrated portrait/token browser QA remains deferred to the owner's primary workstation and pinned in Issue #16; it does not block Stage 5 development.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 5 Foundry 2024 healers kit consumable uses"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`
3. `packages/foundry-adapter/src/dnd5eEquipmentItems.ts`
4. `packages/foundry-adapter/src/dnd5eEquipmentItems.test.ts`
5. `packages/foundry-adapter/src/target.ts`
6. exact pinned Foundry D&D5e 6.0:
   - `packs/_source/equipment24/adventuring-gear/healers-kit.yml`
   - `module/data/item/consumable.mjs`

Do not reread repository history or reopen Stage 4 implementation.

## Exact Green Implementation Checkpoint

- SHA: `049db0e7e72bc81c9ee9be4415e3300f67e8829c`
- Actions: `35524422860`
- Job: `106113998519`
- 68 test files / 337 tests / 0 failures
- 251 tracked paths
- 14 required project-memory files
- OKF 33 concepts / 10 indexes
- agent context 3645 characters
- build: `Character Forge build 0.0.1 049db0e7`
- Foundry adapter: `0.15.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Current Foundry Target

- Foundry VTT `14.367`
- D&D5e `6.0.0`

Character Forge native D&D state remains authoritative. Foundry remains an adapter target.

## Immediate Work - Healer's Kit Consumable State Only

Translate exactly:

`healers-kit` -> `healers-kit`

Pinned target:

- name: `Healer's Kit`
- Item type: `consumable`
- identifier: `healers-kit`
- price: `5 gp`
- weight: `3 lb`
- equipped: false
- uses:
  - max: `"10"`
  - autoDestroy: true
  - spent: 0
  - recovery: []
- damage:
  - base number: null
  - base denomination: null
  - types: []
  - custom enabled: false
  - scaling number: 1
  - replace: false
- `type.value = "trinket"`
- subtype: blank
- magical bonus: null
- properties: empty

The pinned fixture contains a `Stabilize` utility activity that consumes one item use. Do not export that activity in this slice.

### Rules

- Preserve the durable ten-use state.
- Emit `activities = {}`.
- Preserve native quantity exactly.
- Preserve original source ID in provenance and deterministic embedded-ID generation.
- Keep description empty.
- Do not copy compendium prose.
- Do not fabricate Medicine checks, Unconscious targeting, stabilization effects, or activity automation.
- Unsupported IDs remain explicit; no generic fallback.

### Coverage

Add focused deterministic tests proving:

- exact target identifier and `consumable` Item type;
- exact price, weight, type/subtype, uses, damage, magical bonus, properties, and unequipped state;
- native quantity and deterministic source-ID-based embedded ID;
- exact Character Forge source provenance;
- description empty;
- activities empty;
- no Stabilize/Medicine/Unconscious activity semantics copied; and
- `spellbook` remains explicitly deferred.

Then run exact-SHA GitHub Actions `Verify`.

## Do Not Pull Forward Yet

Do not combine this slice with:

- the Healer's Kit Stabilize activity;
- `spellbook`;
- `travelers-clothes`;
- general feature/activity Items;
- spell Items;
- Parchment portrait/token packaging;
- user-facing Foundry Download UX;
- real Foundry runtime import acceptance; or
- bidirectional Foundry synchronization.

The pinned D&D5e 6.0.x tree currently exposes only 2014-rule fixtures for `spellbook` and `travelers-clothes`. Do not map them until a cross-rules-version adapter policy is explicitly accepted.

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
