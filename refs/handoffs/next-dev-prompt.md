---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- books
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
python refs/tools/generate_agent_context.py --focus "Stage 5 Foundry semantic book alias translation"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`
3. `packages/foundry-adapter/src/dnd5eEquipmentItems.ts`
4. `packages/foundry-adapter/src/dnd5eEquipmentItems.test.ts`
5. `packages/foundry-adapter/src/target.ts`
6. `packages/system-dnd5e/src/guidedFirstSlice.ts` only as needed to reconfirm the three source IDs
7. exact pinned Foundry D&D5e 6.0 `packs/_source/equipment24/adventuring-gear/book.yml`

Do not reread repository history or reopen Stage 4 implementation.

## Exact Green Implementation Checkpoint

- SHA: `d4908d19799b3925a0f609302866eaaf22f46e03`
- Actions: `35513128436`
- Job: `106084444614`
- 68 test files / 335 tests / 0 failures
- 251 tracked paths
- 14 required project-memory files
- OKF 33 concepts / 10 indexes
- agent context 3583 characters
- build: `Character Forge build 0.0.1 d4908d19`
- Foundry adapter: `0.13.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Current Foundry Target

- Foundry VTT `14.367`
- D&D5e `6.0.0`

Character Forge native D&D state remains authoritative. Foundry remains an adapter target.

## Immediate Work - Three Semantic Book Aliases Only

Translate exactly:

- `book:prayers`
- `book:history`
- `book:occult-lore`

All three use the pinned Foundry target identifier `book` and Item type `loot`.

Pinned static fields:

- price: `25 gp`
- weight: `5 lb`
- `type.value = "gear"`
- subtype: blank
- properties: empty

Preserve Character Forge's existing source semantics through exported display names:

- `book:prayers` -> `Prayer Book`
- `book:history` -> `History Book`
- `book:occult-lore` -> `Occult Lore Book`

### Rules

- Use explicit mappings for all three complete Character Forge source IDs.
- All three target Foundry identifier `book`; do not invent separate target identifiers.
- Preserve original source IDs in provenance and deterministic embedded-ID generation.
- Preserve native quantity exactly.
- Keep descriptions empty.
- Do not copy the generic Foundry Book description.
- Do not implement or infer the generic Book's +5 Intelligence-check behavior.
- Unsupported IDs remain explicit; no generic fallback.

### Coverage

Add focused deterministic tests proving:

- all three source IDs map to Foundry `loot` Items with target identifier `book`;
- exported names remain `Prayer Book`, `History Book`, and `Occult Lore Book`;
- exact pinned static price, weight, type/subtype, and properties are preserved;
- native quantities and deterministic source-ID-based embedded IDs are preserved independently for all three aliases;
- source provenance retains each complete Character Forge source ID;
- descriptions remain empty; and
- `spellbook` remains explicitly deferred.

Then run exact-SHA GitHub Actions `Verify`.

## Do Not Pull Forward Yet

Do not combine this slice with:

- `spellbook`;
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
