---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- brp
- powers
---
# Current Handoff

Date: 2026-09-09
Branch: `dev`
Current product status: **BRP Superpowers architecture proof is implemented and automated-green; D&D Guided Narrative remains parked.**

## Accepted BRP Superpowers Checkpoint

Starting head for this slice:

- `c553ba7195fbe52ea383de2df0310f3f9f3daf42`

Automated-green implementation checkpoint:

- SHA: `bc0a05fb9b96c9777a73726100828712cd8bbb41`
- Actions: `34413436457`
- job: `102672848273`
- Verify: success
- 45 test files / 223 tests / 0 failures
- 175 tracked paths
- 14 required project-memory files
- OKF: 20 concepts / 10 indexes
- agent context check: 3,730 characters
- web build: `Character Forge build 0.0.1 bc0a05fb`
- new Superpowers coverage: 7 tests

No `qa` or `main` promotion occurred.

Promoted branches remain:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion.

## Source Finding That Drove The Slice

The BRP UGE source treats skill construction level and power level as independently configurable. Do not assume the existing BRP `rulesProfile.powerLevel` field is a universal character power-level ontology: in the current Character Forge backend it already governs the established skill-construction profile.

Superpowers are a useful architecture probe because they use a separate character-point budget derived from the character's initial, as-yet-unmodified characteristics. The first slice therefore proves a powered capability model without mapping it into D&D spell state or ordinary BRP skills.

The narrow implemented Superpowers surface is:

- `Extra Energy`: one character point per retained level; each level adds 10 Power Points;
- `Extra Hit Points`: one character point per retained level; each level adds 1 Hit Point and therefore changes Major Wound level; current source-profile limit is no more levels than initial CON;
- Normal Superpowers budget: half the highest initial characteristic, rounded up;
- Heroic Superpowers budget: the highest initial characteristic;
- unused character points may remain unspent;
- power failings, power modifiers, fixed GM budgets, Epic/Superhuman power levels, and the broader Superpowers catalog remain out of scope.

## Architecture Result

`brp-character/0.1` remains sufficient.

The new powered state is optional and BRP-owned. Existing non-powered `brp-character/0.1` documents remain valid unchanged.

A powered character retains:

- the existing `rulesProfile.powerLevel` for the established skill-construction profile;
- `enabledPowerSystems: ["superpowers"]` when applicable;
- a separate Superpowers state with its own `powerLevel`;
- a retained character-point budget with method, highest-characteristic basis, total, spent, and remaining points;
- exact power IDs, levels, and character-point costs;
- powered derived Hit Points, Major Wound level, and Power Points;
- generation decisions/provenance for power system, power level, selections, and character-point budget.

The tests explicitly prove a **Normal skill profile with a Heroic Superpowers profile**. That is intentional evidence that the two dimensions must not be collapsed.

The rolled-characteristic test also proves that the Superpowers budget is calculated from initial characteristic values before the existing BRP redistribution step, not from final redistributed values.

## Implementation Shape

New BRP-owned files:

- `packages/system-brp/src/superpowers.ts`
- `packages/system-brp/src/poweredAdapter.ts`
- `packages/system-brp/src/superpowers.test.ts`

`superpowers.ts` composes the existing explicit or standard-rolled BRP builder during character creation, then adds source-owned Superpowers state before the CharacterDocument is returned. It does not introduce a shared capability schema.

`poweredAdapter.ts` makes adapter `0.6.0` the package-level BRP adapter. It keeps the existing `0.5.0` validator as the base validator for established BRP state and independently validates the added power-system state and powered derived causality.

The canonical package export remains `brpUge105Adapter`; `brpUge105BaseAdapter` is retained as the legacy/base validator export for internal architecture clarity.

## Important Guardrails

Do not infer any of the following from this first powered slice:

- a universal D&D/BRP spell or ability schema;
- a universal `powerLevel` field shared across systems;
- that all BRP power systems use character points;
- that Psychic Abilities are ordinary BRP skills merely because they are skill-rated;
- that Sorcery should reuse D&D spell-state structures;
- that all Superpowers can be represented by only `levels` and `characterPointCost`;
- that creator UI should expose unsupported power catalogs before their source rules are implemented.

Power-system-specific state should remain a tagged BRP-native union as additional real systems are implemented. Generalize only after repeated evidence.

## Candidate Next Powers Probe

If product direction explicitly continues BRP Powers architecture, the strongest next contrast is **Psychic Abilities**, because they are skill-rated, interact with personal skill points, and commonly consume Power Points. That would test whether the optional BRP power-system union can support a fundamentally different power grammar beside Superpowers.

Do not start that automatically. The current Superpowers proof is a complete bounded milestone.

Also do not broaden immediately into:

- full Superpowers catalog ingestion;
- power failings/modifiers;
- Magic, Mutations, Sorcery, or Psychic UI;
- power randomization;
- generic shared capability semantics;
- creator UI for this first backend proof.

## D&D Narrative Parking State

D&D Guided Narrative remains intentionally parked. Its durable state is retained in:

- `refs/handoffs/archive/dnd-guided-narrative-paused-2026-09-09.md`

Do not automatically resume Cleric/Druid Narrative work.

D&D Issue #11 remains the separate accumulated owner runtime-QA/promotion gate.

## Durable Foundation Boundaries

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Shared creator code coordinates interactions only; rules, mappings, distributions, and content remain system-owned.
- Parchment remains system-agnostic.
- BRP naming content remains setting/campaign/content-package owned.
- Random-table evaluation remains a separate generation primitive.
- BRP powers must not be modeled through D&D spell-state structures merely for reuse.

## Validation

Milestone gate:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
