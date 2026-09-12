---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- equipment
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

Stage 5 - Foundry Export / Import Validation is active. Stage 4 integrated portrait/token browser QA is intentionally deferred to the owner's primary workstation and pinned in Issue #16; it does not block Stage 5 development.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 5 Foundry ammunition and container mapping"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`
3. `packages/foundry-adapter/src/dnd5eEquipmentItems.ts`
4. `packages/foundry-adapter/src/dnd5eActor.ts`
5. `packages/foundry-adapter/src/dnd5eEquipmentItems.test.ts`
6. `packages/foundry-adapter/src/dnd5eActor.test.ts`
7. the pinned Foundry D&D5e 6.0 ammunition/container schema or exact fixtures needed for the IDs being mapped

Do not reread repository history or reopen Stage 4 implementation.

## Exact Green Implementation Checkpoint

- SHA: `e2e9470f90671ed7cdcb7032eb9720f0b1c0afe3`
- Actions: `34697740762`
- Job: `103564028657`
- 68 test files / 322 tests / 0 failures
- 250 tracked paths
- 14 required project-memory files
- OKF: 32 concepts / 10 indexes
- agent context: 3877 characters
- build: `Character Forge build 0.0.1 e2e9470f`
- Foundry adapter: `0.3.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Current Foundry Target

Pin this slice to:

- Foundry VTT `14.367`
- D&D5e `6.0.0`

Foundry remains an adapter target. Character Forge native D&D state remains authoritative.

## Immediate Work - Ammunition + Container Breadth

Expand only low-ambiguity inventory mapping from the completed equipment audit.

### 1. Ammunition

Map Character Forge `arrow` explicitly to the pinned Foundry D&D5e ammunition/consumable representation.

Important:

- Character Forge uses `arrow`.
- Pinned Foundry 2024 equipment data uses an ammunition `consumable` such as identifier `arrows`.
- Implement this as an explicit translation rule, not string guessing.
- Preserve Character Forge quantity exactly (`arrow x20` -> target quantity 20).
- Do not add attack automation or infer ammunition linkage beyond what the pinned target schema requires for a valid Item.

### 2. Containers

Add `quiver` and the mundane pack containers that have exact pinned Foundry fixtures confirmed during the slice.

Start with:

- `quiver`
- `explorers-pack`

Then inspect before adding:

- `entertainers-pack`
- `priests-pack`
- `burglars-pack`
- `scholars-pack`
- `pouch`

Rules:

- use exact Foundry type/identifier/capacity fields from pinned sources;
- retain Character Forge quantity;
- do not copy descriptive compendium text;
- do not manufacture nested contents merely because Foundry's source pack describes contents;
- if an exact fixture is absent or semantics are ambiguous, leave the ID deferred.

### 3. Coverage

Add focused tests proving:

- explicit `arrow` -> Foundry identifier translation;
- quantity preservation;
- deterministic embedded IDs;
- `quiver`/pack container typing and capacity where target data actually provides it;
- no nested pack contents are invented;
- unsupported equipment remains explicit rather than becoming generic loot.

Then run exact-SHA GitHub Actions `Verify`.

## Do Not Pull Forward Yet

Do not combine this slice with:

- remaining weapon/armor breadth unless necessary to support the selected fixture;
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
