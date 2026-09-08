---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
---
# Current Handoff

Date: 2026-09-08
Branch: `dev`
Phase: BRP UGE second-system stress test, explicit and standard-rolled characteristic paths automated-green

## Promoted baseline

The promoted Character Forge baseline is unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not implicitly promote the accumulated D&D Level 1 batch or BRP work. Preserve exact-SHA `dev -> qa -> main` promotion.

## D&D gate remains separate

D&D 5E 2024 SRD 5.2.1 mechanical Level 1 breadth remains complete and automated-green on `dev`:

- D&D code/test checkpoint: `55f79a1004c14eef1635e92c602e1fefa18cab15`
- Actions: `34220401743`
- job: `102041913356`
- 25 test files / 117 tests / 0 failures at that checkpoint
- native schema: `dnd5e-character/0.3`
- adapter: `0.15.0`
- classes: 12 / 12
- backgrounds: 4 / 4
- species: 9 / 9
- class/species matrix: 108 combinations

Owner accumulated runtime QA is still the D&D promotion gate. Issue #11 remains open for that acceptance and exact-SHA promotion. BRP work does not waive that gate.

Parchment remains system-agnostic. Character Forge owns system-native interpretation, generation, validation, and provenance.

## BRP source boundary

The selected second system remains Basic Roleplaying: Universal Game Engine, 2023 ORC content, pinned to corrections `CHA2036 BRP UGE Corrections 1.05`.

- rules-source ID: `chaosium-brp-uge-orc-1.05`
- edition ID: `uge-2023`
- native schema: `brp-character/0.1`
- current adapter: `0.2.0`

Branded Call of Cthulhu remains a separately licensed future product target. Do not import Call of Cthulhu-specific protected content into the BRP adapter.

Read:

- `refs/architecture/brp-second-system-premortem.md`
- `refs/integration/brp-uge-orc.md`
- `refs/architecture/translation-bridge-rpg-notes.md`
- GitHub issue #13

## Architecture result so far

Two materially different characteristic-generation paths now converge on the same BRP native ontology without requiring a shared CharacterDocument or RulesSystemAdapter schema change.

That is now cross-system evidence, not merely a D&D assumption: generation method belongs primarily in provenance while validated native play state can converge on one system-owned shape.

The BRP-specific pressure remains in mandatory native state:

- effective rules profile;
- characteristic initial/adjustment/final causality;
- retained construction provenance where rules require it;
- profession and starting allocation eligibility;
- professional versus personal skill construction;
- open skill specialties;
- derived values;
- future optional-system and power-system context.

Do not add shared semantic fields just to make BRP look more like D&D or vice versa.

## Current BRP profile

The implemented profile remains intentionally narrow:

- Human.
- Normal power level.
- Non-powered.
- Age 18 through 49 so age-based characteristic changes remain out of scope.
- Detective profession.
- Average or Affluent wealth.
- No EDU, Sanity, Fatigue, hit locations, cultural modifiers, category bonuses, non-human rules, or powers.
- No BRP creator UI yet.

Both explicit and standard-rolled characteristic generation produce `brp-character/0.1`.

## Standard rolled characteristic generation

The second BRP generation path is now implemented using the existing system-neutral seeded PRNG and dice-expression utilities.

Source-faithful roll formulas:

- STR, CON, POW, DEX, CHA: `3d6`.
- INT, SIZ: `2d6+6`.

Character Forge pins a deterministic internal replay order for those rolls so a retained seed reproduces the same raw dice. The order is implementation provenance, not a claim that BRP requires a particular rolling sequence.

The native state retains:

- generation method `standard-rolled`;
- seed;
- notation, raw die values, modifier, and total for each characteristic;
- pre-redistribution characteristic values;
- each explicit redistribution transfer with source characteristic, destination characteristic, and amount;
- matching characteristic adjustment entries using source ID `characteristic-generation:standard-redistribution`;
- final characteristic values after redistribution.

The standard path allows at most three redistributed points. The current first-slice implementation additionally rejects post-redistribution characteristic values outside its supported 1 through 21 range; the upper bound reflects the source rule while the lower bound is an implementation safety boundary, not a new BRP rule claim.

Characteristic rolls, derived values, and the INT x 10 personal skill budget are recomputed from final characteristics.

## Explicit path compatibility

The explicit builder still uses the same `brp-character/0.1` schema and now records `characteristicGenerationState: { method: "explicit" }`.

Adapter 0.2.0 also accepts the already-generated first-slice explicit 0.1 payloads that predate that field, so this slice does not strand the prior checkpoint.

## Independent validation

`brpUge105Adapter` is now adapter version `0.2.0`.

In addition to the previous source/profile/profession/skills/derived validation, it now independently verifies standard rolled construction by:

- replaying the exact seeded dice stream through generator-core;
- comparing retained notation, modifier, totals, and raw dice;
- validating redistribution transfer shape and the three-point limit;
- matching rolled initial values to retained characteristic `initial` values;
- matching redistribution transfers to retained adjustment layers;
- recomputing final characteristics from initial values plus adjustments;
- recomputing characteristic rolls, derived values, and skill budgets from final values.

Tampering with raw dice or redistribution state is detected without trusting the builder that produced the character.

## Automated-green BRP checkpoint

The rolled-characteristic slice is automated-green at:

- code checkpoint: `fab012deed4a0f795aee3d163112f7fafb357c7f`
- Actions: `34230839209`
- job: `102076260630`
- refs validation: green, 11 required project-memory files
- OKF: green, 17 concepts / 9 indexes
- strict TypeScript: green
- Vitest: 27 files / 129 tests / 0 failures
- BRP tests: 12 total
- web build: green
- build identity: `Character Forge build 0.0.1 fab012de`
- BRP adapter: `0.2.0`
- BRP native schema: `brp-character/0.1`

The six new rolled-generation tests cover deterministic raw dice, replay from the same seed, retained redistribution causality, three-point-limit rejection, independent dice/redistribution tamper detection, and CharacterDocument round trip.

## Next BRP stressor

The higher-value next architecture stress test is a second BRP power level, starting with Heroic, rather than adding another profession immediately.

Reason: Detective already proves that profession is not class, while the retained `rulesProfile` boundary has only been exercised at Normal. Heroic directly tests whether one native ontology and validation path can scale when campaign configuration changes construction budgets and caps.

The current ORC source specifies:

- Normal: 250 professional skill points, starting cap 75%.
- Heroic: 325 professional skill points, starting cap 90%.
- Personal skill points remain INT x 10.

Age also becomes mechanically relevant at Heroic because professional skill points can change with age relative to the default starting-age roll. Do not simply replace 250 with 325 and call the profile complete. Before implementing Heroic, isolate and test the age/budget interaction explicitly, while keeping powers themselves disabled for this stress test.

The target should be one profile-aware construction path rather than separate Normal and Heroic builders.

Do not add BRP creator UI yet. The backend should first prove that multiple generation methods and multiple power levels converge cleanly on the same native schema.

## Random-table companion remains ready

The random-table companion remains `ready_for_discovery`. BRP work is active because the owner explicitly selected the second-system path, but the random-table work remains a parallel product candidate for traits, ideals, bonds, flaws, equipment/trinkets, weighted results, tags/native IDs, and provenance-bearing subtable evaluation.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state is mandatory and lossless.
- Never reconstruct retained system state from semantic projection.
- Keep D&D-native and BRP-native rules isolated in their system packages/source roots.
- Do not map BRP profession to D&D class.
- Do not map future BRP powers into D&D spell-state structures.
- Preserve effective BRP rules-profile context natively.
- Keep skill causality and specialty identity source-faithful.
- Keep generation method provenance separate from runtime ontology unless a source system proves otherwise.
- Do not promote a universal schema from two systems until the common concept and loss cases are actually understood.
- Keep call-of-cthulhu as a separately licensed future product boundary; no protected CoC content in the BRP adapter.
- D&D owner runtime QA remains a separate promotion gate.
