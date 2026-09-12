---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- foundry
- vtt
- stage-5
- stage-4-qa-hold
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

Stage 4 browser QA is intentionally deferred until the owner is back at a primary workstation. It is pinned in GitHub Issue #16 and is **not a Stage 5 development blocker**.

The owner-approved sequence remains:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Current development stage: **Stage 5 - Foundry Export / Import Validation**.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 5 Foundry D&D equipment Item mapping"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/owner-approved-priority-sequence-2026-09-11.md`
3. `packages/foundry-adapter/src/target.ts`
4. `packages/foundry-adapter/src/dnd5eActor.ts`
5. `packages/foundry-adapter/src/dnd5eIdentityItems.ts`
6. `packages/foundry-adapter/src/dnd5eActor.test.ts`
7. D&D native equipment/catalog generation code only as needed to inventory emitted IDs
8. pinned public Foundry D&D5e 6.0.0 Item schemas only for equipment types actually touched

Do not reread repository history. Do not perform the deferred Stage 4 browser QA away from a primary workstation.

## Exact Green Stage 5 Checkpoint

Accepted implementation checkpoint:

- SHA: `3ebf76461a7592878f66f089a51b261868460fa3`
- Actions: `34696689106`
- Job: `103561269477`
- 67 test files / 319 tests / 0 failures
- 248 tracked paths
- 14 required project-memory files
- OKF: 32 concepts / 10 indexes
- agent context: 3649 characters
- build: `Character Forge build 0.0.1 3ebf7646`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Stage 4 QA Hold

Issue #16 is the durable primary-workstation checklist for portrait/token acceptance.

Preserve while Stage 5 proceeds:

- Parchment owns media bytes/storage/lifecycle/relationships;
- Character Forge consumes presentation media only;
- no media state enters native RPG state;
- user-supplied or explicitly accepted tokens remain authoritative until explicit replace/regenerate/remove.

Do not mark Stage 4 owner-accepted or close Issue #16 without the real integrated browser pass.

## Foundry Target Contract

Pinned target:

- Foundry core `14.367`
- D&D5e system `6.0.0`
- Character Forge Foundry D&D Actor adapter `0.2.0`
- export wrapper `character-forge/foundry-dnd5e-actor-export/0.1`

Never replace version pins with `latest`.

Foundry is an adapter target. D&D native state stays canonical.

## Current Implemented Foundry Shape

`packages/foundry-adapter` currently provides:

- direct validated D&D5e 2024 native-state -> Foundry Actor mapping;
- deterministic pretty JSON serializer;
- mapping/deferred notes separate from raw import JSON;
- stable Character Forge source flags;
- Actor-level abilities/saves/HP/flat AC/initiative/movement/senses/alignment/XP/size/languages/currency/skills/spell slots;
- deterministic embedded identity Items for Class, Background, and Race;
- Actor detail references to those embedded Item IDs.

The embedded identity Items intentionally contain no copied Foundry rules descriptions, no advancement automation, and no starting-equipment automation. Character Forge is exporting an already-resolved character; do not double-apply choices through Foundry advancement.

## Immediate Slice - Equipment Item Proof

Audit first, then implement narrowly.

1. Inventory every equipment `itemId` actually emitted by current D&D Level 1 generation paths.
2. Group those IDs by actual Foundry D&D5e 6.0.0 Item semantics: `weapon`, `equipment`, `consumable`, `tool`, `container`, `loot`, or other proven type.
3. Inspect only the pinned public schemas/examples needed for those types.
4. Implement one representative coherent fixture path first, preferably Avery/Fighter, proving:
   - armor Item identity/state;
   - weapon Item identity/state;
   - quantity-bearing ammunition/stacking where applicable;
   - pack/container or simple gear behavior where the schema is clear;
   - deterministic embedded Item IDs.
5. Keep unsupported IDs explicit in the adapter report rather than silently dropping them or typing everything as `loot`.
6. Do not copy copyrighted Foundry/D&D rules text into Character Forge. Map Character Forge-owned native facts and minimal target fields only.
7. Do not let imported Items replay Character Forge-resolved advancement/equipment choices.
8. Keep Actor AC flat until Foundry equipment calculation parity is proven from the mapped Items.
9. Add deterministic tests and run exact-SHA `npm run verify`.

After one representative equipment path is green, expand by real semantic category only where the existing Level 1 catalog supplies evidence.

## Explicitly Deferred

Do not conflate the equipment slice with:

- feature/feat/activity mapping;
- spell Item mapping;
- Parchment portrait/token export packaging;
- a user-facing Download Foundry button;
- real Foundry runtime import acceptance;
- bidirectional sync.

Those are later Stage 5/9 slices.

## Foundry Runtime / License Trigger

Do not purchase/use Foundry merely because implementation is underway.

Runtime validation becomes the next required step when the export artifact is mature enough that actual import behavior is the blocker, or when public schema/API evidence is no longer sufficient.

The deferred Stage 4 browser QA and later real Foundry runtime acceptance may be performed during the same primary-workstation session if useful, but they remain separate acceptance gates.

## Guardrails

- Native system state is mandatory and lossless.
- Native D&D and BRP state remain canonical.
- Foundry Actor/Item data is target-specific export state only.
- Do not project D&D through Universal Grammar to produce Foundry output.
- Unsupported target semantics must be reported, not fabricated.
- No copied Foundry compendium rules text.
- No implicit advancement replay.
- Do not pull Issue #15 forward.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
