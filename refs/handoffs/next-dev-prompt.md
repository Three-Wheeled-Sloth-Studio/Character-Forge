---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- gaming-set
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

Stage 5 - Foundry Export / Import Validation is active. Stage 4 integrated portrait/token browser QA remains deferred to the owner's primary workstation and pinned in Issue #16; it does not block Stage 5 development.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 5 Foundry gaming set dice translation"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`
3. `packages/foundry-adapter/src/dnd5eEquipmentItems.ts`
4. `packages/foundry-adapter/src/dnd5eEquipmentItems.test.ts`
5. `packages/foundry-adapter/src/target.ts`
6. exact pinned Foundry D&D5e 6.0 `packs/_source/equipment24/tools/other/gaming-set/dice.yml`

Do not reread repository history or reopen Stage 4 implementation.

## Exact Green Implementation Checkpoint

- SHA: `07dc02f79d144c7371df50576d39c1ec0a9e469f`
- Actions: `35511885830`
- Job: `106081096259`
- 68 test files / 334 tests / 0 failures
- 251 tracked paths
- 14 required project-memory files
- OKF 33 concepts / 10 indexes
- agent context 3625 characters
- build: `Character Forge build 0.0.1 07dc02f7`
- Foundry adapter: `0.12.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Current Foundry Target

- Foundry VTT `14.367`
- D&D5e `6.0.0`

Character Forge native D&D state remains authoritative. Foundry remains an adapter target.

## Immediate Work - Gaming Dice Only

Translate:

`gaming-set:dice` -> `dice`

Pinned target:

- name: `Dice`
- Item type: `tool`
- identifier: `dice`
- price: `1 sp`
- weight: `0 lb`
- `type.value = "game"`
- `type.baseItem = "dice"`
- ability: `wis`
- proficient: null
- properties: empty
- bonus: blank

The pinned fixture includes two check activities. Do not export them in this slice.

### Rules

- Use an explicit mapping from the complete Character Forge compound source ID.
- Preserve original source ID `gaming-set:dice` in provenance and deterministic embedded-ID generation.
- Preserve native quantity exactly.
- Keep description empty.
- Keep activities empty.
- Do not infer proficiency or gameplay automation.
- Unsupported IDs remain explicit; no generic fallback.

### Coverage

Add focused deterministic tests proving:

- `gaming-set:dice` maps to Foundry tool identifier `dice`;
- exact pinned static price, weight, type/base item, ability, proficiency, properties, and bonus are preserved;
- native quantity and deterministic source-ID-based embedded ID are preserved;
- source provenance remains `gaming-set:dice`;
- descriptions and activities remain empty; and
- `book:history` remains explicitly deferred.

Then run exact-SHA GitHub Actions `Verify`.

## Do Not Pull Forward Yet

Do not combine this slice with:

- `book:prayers`, `book:history`, or `book:occult-lore`;
- healer's-kit activity semantics;
- simple gear fixture review;
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
