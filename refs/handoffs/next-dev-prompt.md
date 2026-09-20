---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- holy-symbol
- loot
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

Stage 5 - Foundry Export / Import Validation is active. Stage 4 integrated portrait/token browser QA remains deferred to the owner's primary workstation and pinned in Issue #16; it does not block Stage 5 development.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 5 Foundry generic holy symbol loot mapping"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`
3. `packages/foundry-adapter/src/dnd5eEquipmentItems.ts`
4. `packages/foundry-adapter/src/dnd5eEquipmentItems.test.ts`
5. `packages/foundry-adapter/src/target.ts`
6. exact pinned Foundry D&D5e 6.0 `holy-symbol-varies.yml`
7. the pinned D&D5e 6.0 loot schema/model only if needed to confirm required fields

Do not reread repository history or reopen Stage 4 implementation.

## Exact Green Implementation Checkpoint

- SHA: `9d1d9ca941b29e04354f5ac3922f099365b94f26`
- Actions: `35511448798`
- Job: `106079940383`
- 68 test files / 333 tests / 0 failures
- 251 tracked paths
- 14 required project-memory files
- OKF 33 concepts / 10 indexes
- agent context 3552 characters
- build: `Character Forge build 0.0.1 9d1d9ca9`
- Foundry adapter: `0.11.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Current Foundry Target

- Foundry VTT `14.367`
- D&D5e `6.0.0`

Character Forge native D&D state remains authoritative. Foundry remains an adapter target.

## Immediate Work - Generic Holy Symbol Only

Translate:

`holy-symbol` -> `holy-symbol-varies`

Pinned target:

- name: `Holy Symbol (Varies)`
- Item type: `loot`
- identifier: `holy-symbol-varies`
- price: `0 gp`
- weight: `0 lb`
- type.value: `gear`
- type.subtype: blank
- properties: empty

### Rules

- Preserve original Character Forge source ID `holy-symbol` in provenance and deterministic embedded-ID generation.
- Preserve native quantity exactly.
- Keep description empty; do not copy compendium prose.
- Do not choose a specific holy-symbol form.
- Do not infer worn/held/shield relationships or spellcasting behavior.
- Unsupported IDs remain explicit; no generic fallback.

### Coverage

Add focused deterministic tests proving:

- `holy-symbol` maps to a Foundry `loot` Item with identifier `holy-symbol-varies`;
- exact pinned static price, weight, type/subtype, and properties are preserved;
- native quantity and deterministic source-ID-based embedded ID are preserved;
- Character Forge source provenance remains `holy-symbol`;
- description remains empty;
- no concrete amulet/emblem/reliquary form or relationship state is invented; and
- `gaming-set:dice` remains explicitly deferred.

Then run exact-SHA GitHub Actions `Verify`.

## Do Not Pull Forward Yet

Do not combine this slice with:

- concrete holy-symbol form selection;
- `gaming-set:dice`;
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
