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
Phase: BRP UGE second-system stress test, named-language backend closure automated-green

## Promoted baseline

The promoted Character Forge baseline is unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903f0ca1882812`

Do not implicitly promote accumulated D&D or BRP work. Preserve exact-SHA `dev -> qa -> main` promotion.

## D&D gate remains separate

D&D 5E 2024 SRD Level 1 mechanical breadth remains automated-green on `dev` at `55f79a1004c14eef1635e92c602e1fefa18cab15` with 12 classes, 4 backgrounds, 9 species, and all 108 class/species combinations. Issue #11 remains open for accumulated owner runtime QA and exact-SHA promotion. BRP work does not waive that gate.

## BRP source boundary

- system: Basic Roleplaying: Universal Game Engine
- source: 2023 UGE ORC content
- corrections boundary: `CHA2036 BRP UGE Corrections 1.05`
- rules-source ID: `chaosium-brp-uge-orc-1.05`
- edition ID: `uge-2023`
- native schema: `brp-character/0.1`
- adapter: `0.5.0`

Branded Call of Cthulhu remains a separately licensed future target. Do not import protected branded-game content into this adapter.

## Proven BRP architecture

The same `brp-character/0.1` native ontology now supports:

1. explicit and deterministic standard-rolled characteristics;
2. Normal and Heroic power levels;
3. Detective and Scholar profession grammars;
4. open Knowledge/Science specialties;
5. open named language identity with distinct Own/Other source roles.

No shared `CharacterDocument` or `RulesSystemAdapter` contract change has been required.

BRP remains evidence that profession is not class, generation method can remain provenance, rules-profile context can change character legality, character-specific age history can affect construction legality, and source identity may require several orthogonal dimensions rather than one universal enum.

## Current supported BRP profile

- Human.
- Normal or Heroic power level.
- Non-powered (`enabledPowerSystems: []`).
- Explicit or standard-rolled characteristics.
- Detective or Scholar profession.
- Average or Affluent wealth.
- Age 18 through 49 inside the implemented age boundary.
- Open Scholar Knowledge/Science specialties.
- Named language identities for Scholar Own and Other language skills.
- Personal allocation may learn additional named `Language (Other)` skills outside Scholar professional choices.
- No EDU, Sanity, Fatigue, hit locations, cultural modifiers, category bonuses, non-human rules, or powers.
- No BRP creator UI yet.

## Named language identity closure

The Scholar language seam is now source-faithful for the current EDU-disabled profile.

Native profession state retains exact open language `{ id, label }` values for:

- `ownLanguage`;
- `otherLanguage`.

Skill identity retains both source role and language identity:

- `language-own` + named-language specialty: base `INT x 5`;
- `language-other` + named-language specialty: base `0`.

The exact same language ID cannot occupy both Scholar Own and Other roles. This follows the current source model where additional languages are separate language skills rather than a second copy of the native-language role.

Scholar professional allocation is bound to the exact retained Own and Other language identities. Changing retained profession language identity without changing the skill state invalidates the character.

Personal learning remains profession-independent. A Scholar may, for example, retain Latin as the professional Other language and learn French personally as another `Language (Other)` skill.

Language IDs are deliberately open and BRP-native. There is no Character Forge global language catalog and no new shared language schema.

## Generation provenance

Scholar generation recipe is now `brp-uge-first-slice/0.5`.

Generation decisions retain:

- `identity.language-own` with exact language ID/label;
- `identity.language-other` with exact language ID/label;
- the existing Scholar academic specialty choices;
- rules profile, age causality, characteristic-generation method, and skill-budget decisions.

Explicit and rolled construction still converge on the same native state.

## Independent validation

`brpUge105Adapter` version `0.5.0` independently validates:

- exact Scholar Own/Other language identity shape;
- contradictory same-language Own/Other roles;
- `Language (Own)` base as `INT x 5` in the current no-EDU profile;
- `Language (Other)` base as `0`;
- exact profession-language eligibility;
- open additional personal Other-language identities;
- skill contribution/final-rating causality;
- the prior profile, age, characteristic, profession, specialty, budget, cap, and derived-state rules.

The adapter recomputes legal language skills from retained native profession state rather than trusting builder output.

## Automated-green language checkpoint

- code checkpoint: `1ce3387491ccf859f56d7a0e92217c7737a56bf0`
- feature commit: `6e70083a8cc033b59ec2953e642dc3a44d5ba64e`
- first gate on feature commit failed only on a stale impossible TypeScript branch after language base calculation moved out of the static catalog
- corrective commit: `1ce3387491ccf859f56d7a0e92217c7737a56bf0`
- Actions: `34291613617`
- job: `102279178820`
- refs validation: green, 11 required project-memory files
- OKF: green, 17 concepts / 9 indexes
- strict TypeScript: green
- Vitest: 30 files / 152 tests / 0 failures
- BRP tests: 35 total
- named-language tests: 7
- web build: green
- build identity: `Character Forge build 0.0.1 1ce33874`
- adapter: `0.5.0`
- native schema: `brp-character/0.1`

The 7 named-language tests cover exact identities and source bases, same-language role conflict, blank identity rejection, personal additional-language learning, profession-language tamper detection, base-chance tamper detection, and CharacterDocument/generation-provenance round trip.

## Next slice: first BRP creator UI

Backend pressure testing is now sufficient to expose a narrow BRP creator path without lying about the supported rules surface.

The next slice should add the first BRP creator UI using the existing Character Forge creator standards:

- generation controls on the left;
- persistent character details/review on the right;
- universal controls first;
- dynamic controls for explicit versus standard-rolled characteristics;
- Normal/Heroic profile selection;
- Detective/Scholar profession selection;
- Scholar open Own/Other language ID/label fields and five open Knowledge/Science specialty choices;
- exact budget/cap feedback from the BRP system layer, not duplicated UI rules;
- preserve deterministic seed/provenance and native-state reopen behavior;
- do not expose unsupported EDU, powers, age-50+, non-human, Sanity, Fatigue, or optional-rule controls.

Keep D&D creator behavior unchanged. Do not broaden profession catalog or optional BRP systems in the same UI slice unless a concrete UI dependency proves necessary.

## Random-table companion remains ready

The system-neutral random-table companion remains `ready_for_discovery` as a parallel product candidate for traits, ideals, bonds, flaws, equipment/trinkets, weighted results, tags/native IDs, and provenance-bearing subtable evaluation.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Keep D&D and BRP mechanics system-owned.
- BRP profession is not D&D class.
- Keep specialties and language identities open-ended and source-owned.
- Do not freeze a universal profession, specialty, language, or contribution schema from two systems alone.
- Preserve rules-profile and character-specific age causality when they affect legality.
- Do not model future BRP powers through D&D spell-state structures.
- Parchment remains system-agnostic.
- D&D owner runtime QA remains a separate promotion gate.
