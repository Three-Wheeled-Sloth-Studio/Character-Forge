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
Phase: BRP UGE second-system stress test, Detective/Scholar profession-aware backend automated-green

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
- current adapter: `0.4.0`

Branded Call of Cthulhu remains a separately licensed future product target. Do not import Call of Cthulhu-specific protected content into the BRP adapter.

Read:

- `refs/architecture/brp-second-system-premortem.md`
- `refs/integration/brp-uge-orc.md`
- `refs/architecture/translation-bridge-rpg-notes.md`
- GitHub issue #13

## Architecture result so far

BRP has now exercised three independent architecture axes without requiring a shared CharacterDocument or RulesSystemAdapter contract change:

1. explicit versus deterministic standard-rolled characteristic generation converges on one native play-state ontology;
2. Normal versus Heroic power level changes legal construction budgets and caps while remaining in the same `brp-character/0.1` schema;
3. Detective and Scholar use materially different profession choice shapes while sharing the same characteristic, profile, budget, skill, derived-state, CharacterDocument, and adapter pipeline.

Scholar confirms that profession cannot be reduced to a universal class-like menu. Detective owns six required skills plus four bounded electives. Scholar owns five fixed skills plus five open Knowledge or Science specialty choices. Both are source-owned construction constraints rather than separate runtime character ontologies.

Scholar also strengthens the open-specialty finding: several distinct Knowledge specialties and several distinct Science specialties can coexist. Uniqueness is parent-skill plus specialty identity, not parent skill alone.

## Current BRP supported profile

The backend remains intentionally narrow but now spans:

- Human.
- Normal or Heroic power level.
- Non-powered in both profiles.
- Explicit or standard-rolled characteristics.
- Detective or Scholar profession.
- Average or Affluent wealth.
- Age 18 through 49 within the implemented age boundary.
- No EDU, Sanity, Fatigue, hit locations, cultural modifiers, category bonuses, non-human rules, or powers.
- No BRP creator UI yet.

All supported combinations continue to produce `brp-character/0.1`.

## Scholar profession

Scholar is now implemented through the shared BRP builder rather than a separate character path.

Source shape retained by the current adapter:

- fixed professional skills: Language (Other), Language (Own), Persuade, Research, Teach;
- exactly five selected Knowledge or Science specialty skills appropriate to field and setting;
- Average or Affluent wealth within the current supported boundary.

Scholar academic choices are open identities, not a fixed Character Forge subject catalog. The implementation can retain, for example, Knowledge (History), Knowledge (Linguistics), Knowledge (Philosophy), Science (Biology), and Science (Astronomy) simultaneously.

Rules enforced:

- exactly five academic specialty choices;
- parent skill must be Knowledge or Science;
- specialty ID and label must be non-empty;
- multiple specialties under the same parent are legal;
- an identical parent plus specialty ID cannot be selected twice;
- professional points may be spent only on Scholar fixed skills and the exact five selected academic specialties;
- personal points remain independent from profession eligibility and may support other retained skills/specialties;
- Knowledge academic specialties use their current source base chance separately from professional/personal contributions;
- Science academic specialties do the same;
- generation provenance retains the exact five Scholar academic choices.

## Skill identity seam exposed by Scholar

The Scholar implementation exposed a real identity collision that the previous Detective slice did not reveal: Language (Own) and Language (Other) cannot both be represented as an undifferentiated `language` skill with no specialty.

The current narrow fix retains them as distinct BRP source skill identities:

- `language-own`, displayed as `Language (Own)`, with the current INT x 5 base because EDU is disabled;
- `language-other`, displayed as `Language (Other)`, with the current 0% base.

This is deliberately not claimed as complete language support. The actual named language identity is not yet retained. A character can distinguish Own from Other today, but cannot yet say which language is the native language or which other language is being trained.

Do not paper over that gap in UI with a generic language label or a hidden fixed language catalog.

## Power level and age behavior remains unchanged

The same shared construction path still resolves:

- Normal: 250 professional skill points, 75% starting cap;
- Heroic: 325 base professional skill points, 90% starting cap;
- personal skill points: `INT x 10` in both profiles.

Heroic retains default-starting-age causality. Within the current boundary, each full 10 years added after retained starting age adds 20 Heroic professional skill points. Below-starting-age characteristic penalties and age-50+ aging remain out of scope.

Scholar works under both Normal and Heroic and under both explicit and standard-rolled characteristic generation.

## Independent validation

`brpUge105Adapter` is now adapter version `0.4.0`.

In addition to previous source/profile/age/characteristic validation, it independently reconstructs profession-eligible skill identities from retained native profession state.

For Scholar it verifies:

- profession identity and wealth boundary;
- exactly five academic choices;
- Knowledge/Science parent restriction;
- non-empty specialty identity;
- duplicate parent+specialty rejection;
- fixed Scholar skill eligibility;
- exact selected academic professional eligibility;
- source base chances, including INT-derived Language (Own);
- professional/personal causal layers and final rating;
- profile-derived budget and cap;
- tampering where retained Scholar specialty choices no longer justify professional allocations.

The adapter does not trust the builder's profession decisions to validate the resulting character.

## Automated-green Scholar checkpoint

The Scholar slice is automated-green at:

- code checkpoint: `96846485016c4b3082217db8de0b11a143d9e9e2`
- Actions: `34254069939`
- job: `102155313610`
- refs validation: green, 11 required project-memory files
- OKF: green, 17 concepts / 9 indexes
- strict TypeScript: green
- Vitest: 29 files / 145 tests / 0 failures
- BRP tests: 28 total
- Scholar tests: 9
- web build: green
- build identity: `Character Forge build 0.0.1 96846485`
- BRP adapter: `0.4.0`
- BRP native schema: `brp-character/0.1`

The Scholar test matrix covers Normal/Heroic plus explicit/standard-rolled construction, repeated parent skills with distinct specialties, duplicate and invalid specialty rejection, professional eligibility, personal-learning independence, Heroic budget/cap behavior, independent specialty tamper detection, and CharacterDocument round trip.

## Next BRP stressor: named language identity closure

Before exposing BRP in the creator UI, close the language identity seam Scholar revealed.

The next slice should make Language (Own) and Language (Other) source-faithful enough to retain the actual language identities without inventing a global language catalog.

Target:

- retain open language ID/label values for the character's own language and Scholar's other-language skill;
- keep Own and Other source roles distinct because they have different starting semantics;
- preserve Language (Own) INT x 5 behavior while EDU remains disabled;
- preserve Language (Other) 0% base in the current profile;
- prevent the same retained language from occupying contradictory Own/Other roles for the same character unless source evidence says otherwise;
- make Scholar professional eligibility refer to the exact retained language skill identities;
- preserve language choices in native state and generation provenance;
- independently validate language role, identity, base chance, and professional allocation;
- keep the existing Normal/Heroic and explicit/rolled matrix green;
- keep `brp-character/0.1` unless the source-faithful state cannot fit cleanly.

Do not broaden this into a universal Character Forge language ontology or a large named-language catalog. The language IDs remain BRP-native source identity.

After this closure, reassess whether the backend is honest enough for the first BRP creator UI slice. It will then have two characteristic methods, two power levels, two materially different profession shapes, retained age causality, and source-faithful open specialty/language identity.

## Random-table companion remains ready

The random-table companion remains `ready_for_discovery`. BRP work is active because the owner explicitly selected the second-system path, but random tables remain a parallel product candidate for traits, ideals, bonds, flaws, equipment/trinkets, weighted results, tags/native IDs, and provenance-bearing subtable evaluation.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state is mandatory and lossless.
- Never reconstruct retained system state from semantic projection.
- Keep D&D-native and BRP-native rules isolated in their system packages/source roots.
- Do not map BRP profession to D&D class.
- Do not map future BRP powers into D&D spell-state structures.
- Preserve effective BRP rules-profile context natively.
- Preserve character-specific age context when it changes construction legality.
- Preserve source-owned skill variants and specialty identity when parent skill alone is insufficient.
- Keep skill causality source-faithful.
- Keep generation method provenance separate from runtime ontology unless a source system proves otherwise.
- Do not freeze a universal profession, specialty, language, or contribution schema from the current two systems.
- Keep call-of-cthulhu as a separately licensed future product boundary; no protected CoC content in the BRP adapter.
- D&D owner runtime QA remains a separate promotion gate.
