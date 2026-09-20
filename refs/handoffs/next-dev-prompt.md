---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- spellcasting-focuses
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

Stage 5 - Foundry Export / Import Validation is active. Stage 4 integrated portrait/token browser QA remains deferred to the owner's primary workstation and pinned in Issue #16; it does not block Stage 5 development.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 5 Foundry spellcasting focus alias translation"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`
3. `packages/foundry-adapter/src/dnd5eEquipmentItems.ts`
4. `packages/foundry-adapter/src/dnd5eEquipmentItems.test.ts`
5. `packages/foundry-adapter/src/target.ts`
6. the Character Forge source defining the emitted focus IDs, if needed to reconfirm the audit
7. exact pinned Foundry D&D5e 6.0 spellcasting-focus fixtures needed for the five IDs below

Do not reread repository history or reopen Stage 4 implementation.

## Exact Green Implementation Checkpoint

- SHA: `ec48798b5c05ccb08803e4a19a4af8ed24b8db3f`
- Actions: `35511196960`
- Job: `106079291713`
- 68 test files / 332 tests / 0 failures
- 251 tracked paths
- 14 required project-memory files
- OKF 33 concepts / 10 indexes
- agent context 4048 characters
- build: `Character Forge build 0.0.1 ec48798b`
- Foundry adapter: `0.10.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Current Foundry Target

- Foundry VTT `14.367`
- D&D5e `6.0.0`

Character Forge native D&D state remains authoritative. Foundry remains an adapter target.

## Current Equipment Coverage

All currently emitted weapons, ammunition, mundane containers, armor/shields, direct literal tools, all 17 `artisan-tools:*` variants, and all 10 `musical-instrument:*` variants now have pinned mappings.

## Immediate Work - Compound Focus IDs Only

Translate exactly these five Character Forge IDs:

- `arcane-focus:crystal`
- `arcane-focus:orb`
- `arcane-focus:quarterstaff`
- `druidic-focus:sprig-of-mistletoe`
- `druidic-focus:quarterstaff`

Pinned targets already identified:

- `arcane-focus:crystal` -> equipment `crystal`
- `arcane-focus:orb` -> equipment `orb`
- `arcane-focus:quarterstaff` -> weapon `staff`
- `druidic-focus:sprig-of-mistletoe` -> equipment `sprig-of-mistletoe`
- `druidic-focus:quarterstaff` -> weapon `wooden-staff`

### Rules

- Inspect each exact pinned Foundry D&D5e 6.0 fixture before registering it.
- Use an explicit whitelist. Do not implement a generic prefix-strip or suffix-only transform.
- Preserve the original compound Character Forge source ID in provenance flags and deterministic embedded-ID generation.
- Preserve native quantity exactly.
- Preserve exact pinned static fields appropriate to each target type.
- Keep descriptions empty; do not copy compendium prose.
- Keep activities empty; do not replay attack or spellcasting automation.
- Do not infer proficiency, equipped state, container relationships, spellcasting links, or focus usage.
- Unsupported IDs remain explicit; no generic fallback.

### Coverage

Add focused deterministic tests proving:

- all five compound focus IDs map to the exact pinned target identifiers and correct Foundry Item types;
- the two `*:quarterstaff` aliases map differently: arcane -> `staff`, druidic -> `wooden-staff`;
- original compound Character Forge IDs drive deterministic embedded IDs and remain in source provenance;
- exact pinned static fields and native quantities are preserved;
- descriptions and activities remain empty;
- no proficiency/equipped/relationship/automation state is invented; and
- `holy-symbol` remains explicitly deferred.

Then run exact-SHA GitHub Actions `Verify`.

## Do Not Pull Forward Yet

Do not combine this slice with:

- `holy-symbol` translation;
- gaming-set or book aliases;
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
