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
Phase: BRP UGE second-system stress test, Normal/Heroic profile-aware backend automated-green

## Promoted baseline

The promoted Character Forge baseline is unchanged:

- `qa`: `c7b64ac774b9f903f0ca1882812`
- `main`: `c7b64ac774b9f903f0ca1882812`

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
- current adapter: `0.3.0`

Branded Call of Cthulhu remains a separately licensed future product target. Do not import Call of Cthulhu-specific protected content into the BRP adapter.

Read:

- `refs/architecture/brp-second-system-premortem.md`
- `refs/integration/brp-uge-orc.md`
- `refs/architecture/translation-bridge-rpg-notes.md`
- GitHub issue #13

## Architecture result so far

BRP has now exercised two independent architecture axes without requiring a shared CharacterDocument or RulesSystemAdapter contract change:

1. explicit versus deterministic standard-rolled characteristic generation converges on one native play-state ontology;
2. Normal versus Heroic power level changes legal construction budgets and caps while still using the same `brp-character/0.1` schema and builder/validator path.

The second result confirms that retained rules-profile context is operational native state, not decorative metadata. The same skill allocation can be legal under Heroic and illegal under Normal, so validation must use the retained effective profile rather than infer rules from final numbers.

The Heroic slice also exposed character-specific context that affects construction legality: starting age and current age can change the professional skill budget. Character Forge now retains the age basis needed to validate that causality instead of depending on ambient campaign configuration.

Do not promote a universal power-level or age schema from this one source system. Keep the confirmed behavior BRP-native until another system provides comparable evidence.

## Current BRP supported profile

The backend remains intentionally narrow but now spans these dimensions:

- Human.
- Normal or Heroic power level.
- Non-powered in both profiles.
- Explicit or standard-rolled characteristics.
- Detective profession.
- Average or Affluent wealth.
- Age 18 through 49.
- No EDU, Sanity, Fatigue, hit locations, cultural modifiers, category bonuses, non-human rules, or powers.
- No BRP creator UI yet.

Both characteristic-generation methods and both power levels produce `brp-character/0.1`.

## Characteristic generation

Explicit entry and deterministic standard rolling share one downstream construction path.

Standard rolling retains:

- seed;
- exact raw dice, notation, modifiers, and totals;
- source roll slots through a deterministic internal replay order;
- pre-redistribution values;
- up to three explicit redistribution points;
- source/destination/amount for each transfer;
- matching source-aware characteristic adjustment layers;
- final characteristic values.

The adapter replays the seed and independently checks dice and redistribution causality. Characteristic rolls, derived state, and personal skill budget are recomputed from final characteristics.

Generation recipe version is now `brp-uge-first-slice/0.3`.

## Power-level profile

The shared BRP construction path now resolves professional budget and starting cap from retained power level:

- Normal: 250 professional skill points, 75% starting cap.
- Heroic: 325 base professional skill points, 90% starting cap.
- Personal skill points remain `INT x 10` in both profiles.
- `enabledPowerSystems` remains empty; Heroic does not imply implemented powers.

Normal remains backward-compatible with the prior first-slice documents and does not require age-basis state when no age adjustment is relevant.

## Heroic age boundary

The source age interaction is modeled rather than silently ignored.

For this slice:

- Heroic requires a retained default starting age from 18 through 23, corresponding to the source default `17+1d6` range;
- current age must be at least that retained starting age and no greater than 49;
- each full 10 years added after the retained starting age adds 20 Heroic professional skill points;
- fractions of a decade do not add points;
- native `identity.ageBasis` retains the starting age, added years, and professional-skill adjustment;
- generation recipe/decisions retain the same causal information;
- below-starting-age characteristic penalties and age-50+ aging remain explicitly out of scope.

Example: a Heroic character with retained starting age 20 and current age 41 receives 40 additional professional skill points, for a 365-point professional budget.

## Independent validation

`brpUge105Adapter` is now adapter version `0.3.0`.

In addition to the prior source/version, characteristic generation, profession, skill, and derived-state validation, it now independently checks:

- Normal versus Heroic rules-profile identity;
- profile-derived professional budget;
- 75% Normal versus 90% Heroic starting cap;
- retained Heroic default starting age;
- added-years arithmetic;
- full-decade professional-skill adjustment;
- consistency between age causality and professional budget;
- profile tampering that would make retained allocations illegal.

## Automated-green Heroic checkpoint

The Heroic power-level slice is automated-green at:

- code checkpoint: `a780f82378e1477d77cf1076cc769491dcb3043d`
- Actions: `34237331940`
- job: `102098319676`
- refs validation: green, 11 required project-memory files
- OKF: green, 17 concepts / 9 indexes
- strict TypeScript: green
- Vitest: 28 files / 136 tests / 0 failures
- BRP tests: 19 total
- web build: green
- build identity: `Character Forge build 0.0.1 a780f823`
- BRP adapter: `0.3.0`
- BRP native schema: `brp-character/0.1`

The seven new Heroic tests cover:

1. Heroic explicit construction with the 325-point pool and 90% cap.
2. +20 professional points per full Heroic decade after retained starting age.
3. Required Heroic starting-age provenance and rejection of below-starting-age cases.
4. Heroic standard-rolled construction through the same native schema and profile-aware builder.
5. Independent detection when a Heroic character is tampered to Normal.
6. Independent detection of age-causality tampering.
7. CharacterDocument round trip preserving Heroic profile and age provenance.

## Next BRP stressor: Scholar profession

The next high-value BRP slice is a second profession using Scholar, not another power level or an optional subsystem.

Reason: Heroic has now validated the retained rules-profile boundary under a real behavior change. The next missing architecture pressure is profession choice shape.

Scholar is materially different from Detective:

- Detective has fixed professional skills plus four choices from a bounded elective list.
- Scholar has five fixed skills and five Knowledge or Science skills chosen to fit the setting and field of study.

That makes Scholar a useful test of count-N open specialty selection, repeated parent skill IDs with distinct specialties, source-owned freeform specialty identity, and profession-specific validation without turning open BRP specialties into a universal enum.

Target the backend first. Do not add BRP creator UI until Detective and Scholar both work across the existing generation/profile matrix cleanly enough to expose honestly.

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
- Preserve character-specific context when it changes source-rule legality rather than depending on ambient campaign configuration.
- Keep skill causality and specialty identity source-faithful.
- Keep generation method provenance separate from runtime ontology unless a source system proves otherwise.
- Do not freeze a universal specialty or contribution schema from two systems alone.
- Keep call-of-cthulhu as a separately licensed future product boundary; no protected CoC content in the BRP adapter.
- D&D owner runtime QA remains a separate promotion gate.
