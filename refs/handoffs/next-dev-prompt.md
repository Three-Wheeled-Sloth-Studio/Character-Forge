---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- equipment
- spellbook
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

Stage 5 - Foundry Export / Import Validation is active. Stage 4 integrated portrait/token browser QA remains deferred to the owner's primary workstation and pinned in Issue #16; it does not block Stage 5 development.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 5 Foundry final literal equipment travelers clothes spellbook"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`
3. `packages/foundry-adapter/src/dnd5eEquipmentItems.ts`
4. `packages/foundry-adapter/src/dnd5eEquipmentItems.test.ts`
5. `packages/foundry-adapter/src/target.ts`
6. exact pinned Foundry D&D5e 6.0 evidence:
   - `packs/_source/equipment24/adventuring-gear/clothes-travelers.yml`
   - `packs/_source/items/loot/spellbook.yml`
   - `packs/_source/classes24/wizard/wizard.yml` around the Spellbook equipment reference

Do not reread repository history or reopen Stage 4 implementation.

## Exact Green Implementation Checkpoint

- SHA: `c5800941dc4d42c5d3b051a8835971f9972a9f4a`
- Actions: `35529546838`
- Job: `106127595405`
- 68 test files / 338 tests / 0 failures
- 251 tracked paths
- 14 required project-memory files
- OKF 33 concepts / 10 indexes
- agent context 3644 characters
- build: `Character Forge build 0.0.1 c5800941`
- Foundry adapter: `0.16.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Current Foundry Target

- Foundry VTT `14.367`
- D&D5e `6.0.0`

Character Forge native D&D state remains authoritative. Foundry remains an adapter target.

## Immediate Work - Final Literal Equipment IDs

### Traveler's Clothes

Translate:

`travelers-clothes` -> `clothes-travelers`

Pinned 2024 target:

- name: `Clothes, Traveler's`
- Item type: `equipment`
- identifier: `clothes-travelers`
- price: `2 gp`
- weight: `4 lb`
- equipped: false
- cover: null
- crewed: false
- uses: empty
- armor value/magicalBonus/dex: null
- hp value/max/dt: null, conditions blank
- `type.value = "clothing"`
- `type.baseItem = ""`
- properties: empty
- speed value: null, conditions blank
- strength: null
- proficient: null
- activities: empty

### Spellbook

Translate:

`spellbook` -> `spellbook`

Pinned target shape comes from legacy Item `LBajgahniRJbAgDr`, because the pinned 2024 Wizard class explicitly references that exact Item in its starting equipment.

Static fields:

- name: `Spellbook`
- Item type: `loot`
- identifier: `spellbook`
- price: `50 gp`
- weight: `3 lb`
- type value: blank
- subtype: blank
- properties: empty

### Cross-pack reuse rule

This is not a general permission to mix 2014 and 2024 data.

Use the legacy Spellbook target only because pinned 2024 Foundry content explicitly references `Compendium.dnd5e.items.Item.LBajgahniRJbAgDr`. Treat that target-package reference as authoritative evidence for this adapter path.

Do not copy the legacy Spellbook's description or its `source.rules` field into Character Forge canonical state. Character Forge export provenance remains 2024-native.

### Coverage

Add focused deterministic tests proving:

- exact target Item type, name, identifier, price, and weight for both IDs;
- Traveler's Clothes exact pinned clothing/equipment static fields;
- Spellbook exact pinned loot static fields;
- native quantities and deterministic source-ID-based embedded IDs;
- exact Character Forge source provenance;
- descriptions remain empty;
- no legacy Spellbook prose is copied; and
- no unsupported record remains for either of these two generated IDs.

Then run exact-SHA GitHub Actions `Verify`.

## Do Not Pull Forward Yet

Do not combine this slice with:

- Healer's Kit Stabilize activity automation;
- general feature/activity Items;
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
