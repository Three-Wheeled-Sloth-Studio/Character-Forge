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
Phase: BRP UGE second-system stress test, first native vertical slice automated-green

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

Owner accumulated runtime QA is still the D&D promotion gate. Issue #11 remains open for that acceptance and exact-SHA promotion. Starting BRP work does not waive that gate.

Parchment remains system-agnostic. Character Forge owns system-native interpretation, generation, validation, and provenance.

## Second-system decision

The owner accepted Basic Roleplaying: Universal Game Engine as the second full rules-system stress test.

The public implementation boundary is:

- Basic Roleplaying: Universal Game Engine, 2023;
- Chaosium ORC Licensed Material;
- corrections boundary `CHA2036 BRP UGE Corrections 1.05`;
- Character Forge rules-source ID `chaosium-brp-uge-orc-1.05`;
- edition ID `uge-2023`.

Branded Call of Cthulhu remains a possible separately licensed future product target. Do not import Call of Cthulhu-specific protected content into the BRP adapter.

Read:

- `refs/architecture/brp-second-system-premortem.md`
- `refs/integration/brp-uge-orc.md`
- GitHub issue #13

## Architecture premortem result

The first BRP pass did not expose a need to change shared `character-document/0.1` or the current `RulesSystemAdapter` contract.

That is an important result, not an absence of work. BRP-specific pressure stays in mandatory native state:

- effective rules profile;
- characteristics and source adjustments;
- profession and starting allocation eligibility;
- professional versus personal skill construction;
- open skill specialties;
- derived values;
- future optional-system and power-system context.

Do not add shared semantic fields just to make BRP look more like D&D or vice versa.

## First BRP native slice

The first implementation is intentionally narrow:

- Human.
- Normal power level.
- Non-powered.
- Explicit characteristic entry.
- Age 18 through 49 so age adjustments remain out of scope.
- Detective profession.
- Average or Affluent wealth.
- No EDU, Sanity, Fatigue, hit locations, cultural modifiers, category bonuses, non-human rules, or powers.
- No creator UI yet.

Native schema: `brp-character/0.1`.

Implemented source state includes:

- STR, CON, SIZ, INT, POW, DEX, CHA with `initial`, `adjustments[]`, and `final` layers;
- corrected characteristic rolls including `Charisma Roll` as CHA x 5;
- Hit Points, Major Wound level, Power Points, Experience Bonus, Move, and Damage Modifier;
- Normal professional skill budget of 250 points;
- personal skill budget of INT x 10;
- Normal starting skill cap of 75%;
- Detective required skills and four selected elective professional skills;
- professional and personal allocation contributions retained separately;
- source skill base chance retained separately from contributions and final rating;
- specialty identity demonstrated with Firearm (Handgun), Knowledge (Law), and Science (Forensics);
- generation provenance and exact BRP rules-source metadata.

The builder wraps this native state in the existing CharacterDocument without semantic reconstruction.

## Independent validation

`brpUge105Adapter` is adapter version `0.1.0` and validates independently of the builder.

It checks:

- system, edition, rules version, schema, and source IDs;
- retained Normal/non-powered rules profile;
- first-slice identity and age constraints;
- Detective wealth and exactly four supported electives;
- characteristic shape/ranges and first-slice adjustment policy;
- characteristic-roll calculations;
- derived values;
- professional and personal skill budgets;
- profession eligibility for professional allocations;
- skill base chances, specialty identity, contribution math, final ratings, and the 75% cap;
- tamper detection.

## Automated-green BRP checkpoint

The first BRP slice is automated-green at:

- checkpoint: `da045ea71d9827ad756a706429399f2101f36498`
- Actions: `34225597834`
- job: `102058824469`
- refs validation: green, 11 required project-memory files
- OKF: green, 17 concepts / 9 indexes at that checkpoint
- strict TypeScript: green
- Vitest: 26 files / 123 tests / 0 failures
- BRP tests: 6
- web build: green
- build identity: `Character Forge build 0.0.1 da045ea7`

The six BRP tests cover:

1. Valid Normal non-powered Detective generation and independent validation.
2. Exact CharacterDocument JSON round-trip of BRP native payload.
3. Separation of personal learning from Detective professional eligibility.
4. Normal starting skill-cap rejection.
5. Independent adapter detection of characteristic-roll and skill-rating tampering.
6. Exact ORC source metadata exposure through the adapter.

## Cross-system evidence now recorded

The translation/Bridge-RPG evidence ledger has been updated with the first second-system findings:

- causal numeric layers recur outside D&D: BRP skill base/professional/personal/final reinforces the earlier D&D base/contribution/final pattern;
- profession is not class, so `class` must remain D&D-owned;
- BRP rules-profile context can be required to interpret native character state;
- open-ended specialties should remain source-owned rather than becoming a universal enum.

This is useful confirming evidence, but it is not yet permission to freeze a universal contribution, profession, or specialty schema.

## Next BRP slice

The next high-value implementation step is standard BRP characteristic generation, while still converging on `brp-character/0.1`:

- use the existing system-neutral seeded PRNG/dice-expression capability where appropriate;
- roll 3D6 for STR, CON, POW, DEX, and CHA;
- roll 2D6+6 for INT and SIZ;
- retain raw dice and pre-adjustment values;
- implement the standard up-to-3-point redistribution rule with explicit provenance;
- validate redistribution legality independently;
- keep downstream characteristic/derived/skill construction shared with the explicit builder rather than forking a second native ontology.

After that, choose the next stressor based on evidence rather than catalog size. The two leading options are:

- a second profession with more skill-choice branching; or
- a second BRP power level to pressure-test the retained rules-profile boundary.

Do not add BRP creator UI until at least two BRP generation paths demonstrably converge on the same native state.

## Random-table companion remains ready

The random-table companion is still `ready_for_discovery`. BRP work is now active because the owner explicitly selected the second-system path. Do not lose the random-table work; it remains a parallel next candidate for traits, ideals, bonds, flaws, equipment/trinkets, weighted results, tags/native IDs, and provenance-bearing subtable evaluation.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state is mandatory and lossless.
- Never reconstruct retained system state from semantic projection.
- Keep D&D-native and BRP-native rules isolated in their system packages/source roots.
- Do not map BRP profession to D&D class.
- Do not map future BRP powers into D&D spell-state structures.
- Preserve effective BRP rules-profile context natively.
- Keep skill causality and specialty identity source-faithful.
- Do not promote a universal schema from two systems until the common concept and loss cases are actually understood.
- Keep call-of-cthulhu as a separately licensed future product boundary; no protected CoC content in the BRP adapter.
- D&D owner runtime QA remains a separate promotion gate.
