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
Current product status: **BRP Superpowers and Psychic Abilities architecture probes are implemented and automated-green; D&D Guided Narrative remains parked.**

## Accepted BRP Psychic Abilities Checkpoint

Starting documented head for this slice:

- `9bcdf2008b078d81171872c4d88e00773c15d50d`

Automated-green implementation checkpoint:

- SHA: `ae35b556dfc177f12e9f934fedd455803c6b74c7`
- Actions: `34417631582`
- job: `102685926895`
- Verify: success
- 46 test files / 231 tests / 0 failures
- 178 tracked paths
- 14 required project-memory files
- OKF: 20 concepts / 10 indexes
- agent context check: 3,818 characters
- web build: `Character Forge build 0.0.1 ae35b556`
- new Psychic Abilities coverage: 8 tests

No `qa` or `main` promotion occurred.

Promoted branches remain:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion.

## What Psychic Abilities Proved

The BRP UGE source treats Psychic Abilities as percentile-rated abilities that behave like skills for rating/improvement while remaining a distinct power system. Their starting rating is `POW x 1`, personal skill points may improve them during character creation, and use commonly spends Power Points.

The bounded proof deliberately supports only:

- Psychic power level: `normal`;
- exactly two starting Psychic Abilities;
- `Empathy`;
- `Mind Shield`;
- Detective construction paths;
- explicit and standard-rolled characteristics;
- personal-skill-point training only.

The proof does **not** make Psychic Abilities ordinary entries in `skills`. They remain in a BRP-native `powerSystems` state because their runtime power semantics, Power Point use, and future ability-specific behavior are not ordinary skill semantics.

## Skill Pool And Power-Level Result

Psychic Ability training shares the existing personal `INT x 10` pool during creation.

The current construction path first builds a legal ordinary BRP character, then explicitly reallocates retained personal skill points from ordinary skills into Psychic Ability training. The final native state therefore validates:

`ordinary personal skill spend + Psychic Ability personal training = INT x 10`

The reallocation itself remains in generation provenance. The authoritative native state retains the resulting ordinary skill contributions and the Psychic Ability training contributions.

The existing `rulesProfile.powerLevel` remains the established skill-construction profile. Psychic Abilities retain their own independent power-system level. A test proves **Heroic skill construction with Normal Psychic Abilities**.

Psychic Ability training observes the retained skill-construction starting cap:

- Normal skill profile: 75%;
- Heroic skill profile: 90%.

For standard-rolled characters, Psychic base ratings use the final starting POW after the existing legal redistribution step. This differs intentionally from the Superpowers character-point budget, which uses initial/as-yet-unmodified characteristics.

## Implemented Psychic State

New BRP-owned files:

- `packages/system-brp/src/psychicAbilities.ts`
- `packages/system-brp/src/psychicAdapter.ts`
- `packages/system-brp/src/psychicAbilities.test.ts`

The retained Psychic state includes:

- `systemId: "psychic-abilities"`;
- independent Psychic `powerLevel`;
- total personal skill points spent on Psychic training;
- exact ability IDs and labels;
- `baseRatingMethod: "pow-x1"`;
- source-derived base rating;
- personal skill-point contribution;
- final percentile rating.

The bounded source catalog also retains the currently needed use metadata:

- Empathy: POW-meter range, instantaneous, 1 Power Point;
- Mind Shield: self range, one full turn per Power Point, variable cost of at least 1 Power Point.

Runtime activation, resistance rolls, failure/fumble Power Point handling, and combat resolution remain out of scope for this creation architecture proof.

## Adapter Stack

The BRP adapter layers are now intentionally explicit:

- `adapter.ts`: established BRP validator, adapter `0.5.0`;
- `poweredAdapter.ts`: Superpowers-aware validator, adapter `0.6.0`;
- `psychicAdapter.ts`: canonical package validator, adapter `0.7.0`.

`packages/system-brp/src/index.ts` exports:

- `brpUge105BaseAdapter` for the established base validator;
- `brpUge105PoweredAdapter` for the Superpowers-aware layer;
- `brpUge105Adapter` as the canonical current Psychic-aware validator.

Existing non-powered and Superpowers documents continue to validate through the canonical adapter.

## Architecture Result Across Two Power Systems

`brp-character/0.1` remains sufficient.

Character Forge now has concrete BRP evidence for two materially different capability grammars:

1. **Superpowers** — independent character-point purchasing, levels/costs, and direct derived-resource effects;
2. **Psychic Abilities** — skill-rated power abilities, `POW x 1` bases, shared personal skill-point training, and Power Point use semantics.

Neither required changing shared `CharacterDocument`, introducing a shared capability ontology, or reusing D&D spell-state structures.

That is strong evidence that BRP power systems should remain a tagged BRP-native family until additional systems demonstrate genuinely repeated semantics.

## Previous Superpowers Checkpoint

The first Superpowers proof remains automated-green at:

- SHA `bc0a05fb9b96c9777a73726100828712cd8bbb41`;
- Actions `34413436457`;
- job `102672848273`;
- 45 test files / 223 tests / 0 failures;
- adapter layer `0.6.0`;
- native schema `brp-character/0.1`.

It supports only Extra Energy and Extra Hit Points with source-derived Normal/Heroic character-point budgets.

## Deliberately Deferred

Do not infer or automatically add:

- Heroic/Epic/Superhuman Psychic profiles;
- the full Psychic Ability catalog;
- Psychic professional-skill-pool training;
- Scholar Psychic creation;
- multiple simultaneous BRP power systems/power sets;
- Psychic runtime activation/resistance/combat resolution;
- full Superpowers catalog;
- power failings/modifiers;
- Magic, Mutations, or Sorcery;
- Powers creator UI;
- power randomization;
- a universal D&D/BRP spell, power, or ability schema.

Any of those requires an explicit product slice and source audit.

## Stress-Test Status

The original BRP second-system architecture stress-test objective is now substantially satisfied. BRP has already forced and proven non-D&D shapes for percentile skills, professions, open specialties/languages, skill-construction profiles, Superpowers character-point capabilities, and Psychic skill-rated capabilities without requiring shared CharacterDocument distortion.

Further BRP work should be selected as **product breadth** or as a deliberately named additional architecture probe, not assumed necessary merely to keep Issue #13 growing.

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
- Do not generalize from Superpowers and Psychic Abilities until a repeated cross-system need is concrete.

## Validation

Milestone gate:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
