---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- simple-gear
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

Stage 5 - Foundry Export / Import Validation is active. Stage 4 integrated portrait/token browser QA remains deferred to the owner's primary workstation and pinned in Issue #16; it does not block Stage 5 development.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 5 Foundry 2024 simple gear parchment robe crowbar"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`
3. `packages/foundry-adapter/src/dnd5eEquipmentItems.ts`
4. `packages/foundry-adapter/src/dnd5eEquipmentItems.test.ts`
5. `packages/foundry-adapter/src/target.ts`
6. exact pinned Foundry D&D5e 6.0 fixtures:
   - `packs/_source/equipment24/adventuring-gear/parchment.yml`
   - `packs/_source/equipment24/adventuring-gear/robe.yml`
   - `packs/_source/equipment24/adventuring-gear/crowbar.yml`

Do not reread repository history or reopen Stage 4 implementation.

## Exact Green Implementation Checkpoint

- SHA: `0c06ec6aaf21f0719f54929890cf4f67f68093c9`
- Actions: `35514407369`
- Job: `106087797352`
- 68 test files / 336 tests / 0 failures
- 251 tracked paths
- 14 required project-memory files
- OKF 33 concepts / 10 indexes
- agent context 3582 characters
- build: `Character Forge build 0.0.1 0c06ec6a`
- Foundry adapter: `0.14.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Current Foundry Target

- Foundry VTT `14.367`
- D&D5e `6.0.0`

Character Forge native D&D state remains authoritative. Foundry remains an adapter target.

## Immediate Work - Confirmed 2024 Simple Gear Only

Translate exactly:

- `parchment-sheet` -> `parchment`
- `robe` -> `robe`
- `crowbar` -> `crowbar`

### Pinned Parchment Target

- name: `Parchment`
- Item type: `loot`
- identifier: `parchment`
- price: `1 sp`
- weight: `0 lb`
- `type.value = "gear"`
- subtype: blank
- properties: empty

### Pinned Robe Target

- name: `Robe`
- Item type: `equipment`
- identifier: `robe`
- price: `1 gp`
- weight: `4 lb`
- `type.value = "clothing"`
- `type.baseItem = ""`
- equipped: false
- armor value/magicalBonus/dex: null
- strength: null
- proficient: null
- properties: empty
- activities: empty

### Pinned Crowbar Target

- name: `Crowbar`
- Item type: `loot`
- identifier: `crowbar`
- price: `2 gp`
- weight: `5 lb`
- `type.value = "gear"`
- subtype: blank
- properties: empty

### Rules

- Use explicit Character Forge source-ID mappings.
- Preserve original source IDs in provenance and deterministic embedded-ID generation.
- Preserve native quantities exactly.
- Keep descriptions empty.
- Do not copy Parchment/Robe/Crowbar compendium prose.
- Do not implement Crowbar's leverage Advantage rule.
- Do not infer equipped state beyond the pinned Robe `false`.
- Unsupported IDs remain explicit; no generic fallback.

### Coverage

Add focused deterministic tests proving:

- exact target identifiers and Item types for all three IDs;
- exact pinned static price, weight, type/base-item or subtype, properties, and Robe armor/proficiency/activity fields;
- native quantities and deterministic source-ID-based embedded IDs;
- exact Character Forge source provenance;
- empty descriptions;
- no copied Crowbar Advantage rule; and
- `spellbook` remains explicitly deferred.

Then run exact-SHA GitHub Actions `Verify`.

## Do Not Pull Forward Yet

Do not combine this slice with:

- `spellbook`;
- `travelers-clothes`;
- healer's-kit uses/activity semantics;
- feature/activity Items;
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
