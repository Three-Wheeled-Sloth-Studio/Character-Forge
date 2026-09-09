---
type: "Integration Reference"
title: "BRP Universal Game Engine ORC Source Boundary"
tags:
- character-forge
- integration
- brp
- licensing
---
# BRP Universal Game Engine ORC Source Boundary

Status: Selected and implementation-pinned source contract for the second rules system.

Date reviewed: 2026-09-09

## Selected rules source

- Work: Basic Roleplaying: Universal Game Engine
- Creator: Chaosium Inc.; authors Jason Durall and Steve Perrin
- Edition/version boundary: 2023 Universal Game Engine released under the ORC License
- Canonical product/source page: https://www.chaosium.com/basic-roleplaying-universal-game-engine-pdf/
- Free ORC Content Document: https://www.chaosium.com/content/orclicense/BasicRoleplaying-ORC-Content-Document.pdf
- ORC license and required notice page: https://www.chaosium.com/orc-license/
- Corrections/errata boundary implemented: `CHA2036 BRP UGE Corrections 1.05`
- Resource page: https://www.chaosium.com/basic-roleplaying-resources/
- Character Forge rules-source ID: `chaosium-brp-uge-orc-1.05`
- Character Forge edition ID: `uge-2023`
- Adapter rules version: `1.05`

The adapter and tests are pinned to this source/errata boundary. Do not silently replace it with a newer correction document. A future update must deliberately change source metadata, validation, and tests.

## Authority and licensing boundary

Character Forge targets the 2023 BRP UGE ORC content, not the older 2020 BRP online SRD. The older SRD may be useful for orientation but is not implementation authority.

Only content available within the applicable ORC boundary may be implemented or redistributed. Before a public BRP release, verify the then-current Chaosium ORC notice instructions and place the required notice/credit exactly where the license requires it.

Do not import protected branded-game content merely because a game uses related BRP mechanics. Call of Cthulhu, RuneQuest, Pendragon, Rivers of London, and other branded-game material remain out of scope unless separately licensed or independently available under an applicable open-content grant.

## Implemented source evidence

The current `brp-character/0.1` backend implements a deliberately bounded subset including:

- STR, CON, SIZ, INT, POW, DEX, CHA;
- explicit characteristics;
- deterministic standard rolling with 3d6 for STR/CON/POW/DEX/CHA and 2d6+6 for INT/SIZ;
- standard up-to-three-point redistribution;
- Normal skill-construction profile: 250 professional points and 75% starting cap;
- Heroic skill-construction profile: 325 base professional points and 90% starting cap;
- personal skill budget `INT x 10`;
- Detective and Scholar profession probes;
- separate professional and personal skill contributions;
- open Knowledge/Science specialty identity;
- named language identity with Own/Other role semantics;
- core derived Hit Points, Major Wound level, Power Points, Experience Bonus, Move, and Damage Modifier;
- corrected `Charisma Roll` semantics using CHA x 5;
- Track in the supported skill set, consistent with corrections 1.05;
- optional bounded Superpowers state;
- optional bounded Psychic Abilities state.

## Skill level versus power level

BRP explicitly permits skill level and power level to be mixed rather than requiring them to move together.

Character Forge already used `rulesProfile.powerLevel` for the established Normal/Heroic skill-construction profile before Powers were implemented. Power-system work therefore does **not** reinterpret that existing field as a universal character power level.

Each implemented BRP power system owns the source-native state required by that system:

- Superpowers retains its own independent Normal/Heroic `powerLevel`;
- the current Psychic Abilities proof retains an independent Normal `powerLevel`.

Tests prove both directions needed to prevent accidental collapse:

- Normal skill construction with Heroic Superpowers;
- Heroic skill construction with Normal Psychic Abilities.

Do not promote these fields into a universal cross-system power-level ontology.

## Superpowers source behavior and implementation

BRP Superpowers use character points rather than the existing professional/personal skill budgets.

The bounded implementation supports Normal and Heroic Superpowers power levels:

- Normal character-point budget: one-half of the highest initial/as-yet-unmodified characteristic, rounded up;
- Heroic character-point budget: the highest initial/as-yet-unmodified characteristic.

For standard-rolled characters, this basis is the retained initial characteristic layer before the current redistribution step. Unused character points may remain unspent.

The first two supported Superpowers are:

### Extra Energy

- retained as `extra-energy`;
- one character point per level;
- each level adds 10 Power Points;
- does not change POW itself.

### Extra Hit Points

- retained as `extra-hit-points`;
- one character point per level;
- each level adds 1 Hit Point;
- Major Wound level is recalculated from the powered Hit Point total;
- current source-profile limit: levels may not exceed initial CON.

The broader Superpowers catalog, power failings/modifiers, GM-fixed budgets, and Epic/Superhuman power levels remain out of scope.

## Psychic Abilities source behavior and implementation

Psychic Abilities provide a deliberately different BRP power grammar.

The source treats Psychic Abilities as percentile-rated abilities that work like skills for ratings and improvement while remaining a distinct power system. Relevant creation behavior for the current proof is:

- Normal power level begins with two Psychic Abilities;
- each begins at `POW x 1`;
- personal skill points may improve those starting ratings;
- Psychic Ability use commonly consumes Power Points;
- source power level and skill-construction level may be mixed.

The bounded implementation supports only a Normal Psychic power profile with exactly two selected abilities:

### Empathy

- retained as `empathy`;
- base rating `POW x 1`;
- range: POW in meters;
- duration: instantaneous;
- Power Point cost: 1.

### Mind Shield

- retained as `mind-shield`;
- base rating `POW x 1`;
- range: self;
- duration: one full turn per Power Point spent;
- Power Point cost: variable, minimum 1.

Psychic Abilities are **not** inserted into the ordinary `skills` array merely because they use percentile ratings. Their power-system identity, future activation semantics, and Power Point behavior remain BRP-native power state.

### Personal skill-point interaction

The current creation proof uses the standard personal `INT x 10` pool.

A legal ordinary BRP character is built first. During Psychic construction, explicit generation-time reallocations move retained personal skill points from supported ordinary skills into Psychic Ability training. The final native state must satisfy:

`ordinary personal skill contributions + Psychic Ability personal training = INT x 10`

The donor/reallocation choices are generation provenance; the authoritative native state retains the resulting ordinary contributions and Psychic training contributions.

The final Psychic rating is:

`POW x 1 + personal Psychic training`

and it remains subject to the retained skill-construction starting cap: 75% for Normal or 90% for Heroic.

For standard-rolled characters, Psychic base rating uses **final starting POW after legal redistribution**. This intentionally differs from Superpowers budgeting, which uses initial/as-yet-unmodified characteristics before redistribution.

### Psychic behavior deliberately not implemented

This creation architecture proof does not yet implement:

- Heroic/Epic/Superhuman Psychic profiles;
- the broader Psychic Ability catalog;
- professional-skill-pool Psychic training;
- Scholar Psychic construction;
- multiple simultaneous power systems or multiple power sets;
- runtime activation rolls;
- resistance resolution;
- failure/fumble Power Point handling;
- combat/runtime effects;
- creator UI or randomization.

## Power-system architecture boundary

`brp-character/0.1` remains sufficient after both power probes.

Existing non-powered documents remain valid. Superpowers and Psychic documents retain system-specific tagged power state rather than a premature universal capability structure.

The adapter stack is intentionally layered:

- `adapter.ts`: established BRP validation, adapter `0.5.0`;
- `poweredAdapter.ts`: Superpowers-aware validation, adapter `0.6.0`;
- `psychicAdapter.ts`: canonical current validation, adapter `0.7.0`.

The canonical adapter still validates non-powered and Superpowers states by delegation while independently validating Psychic state and its shared personal-pool causality.

The two implemented grammars now provide strong evidence against D&D-shaped generalization:

1. Superpowers use character-point purchasing and direct derived-resource effects;
2. Psychic Abilities use skill-rated power abilities, characteristic-derived bases, personal skill-point training, and Power Point use semantics.

Neither required changing shared `CharacterDocument` or reusing D&D spell-state structures.

## Profession evidence

Detective remains the bounded-choice profession probe: required professional skills plus four selected electives from the currently supported Detective set.

Scholar remains the open-choice probe with:

- Average or Affluent wealth, usually Average;
- Language (Other), Language (Own), Persuade, Research, Teach;
- five Knowledge or Science skills appropriate to field and setting.

Character Forge retains exactly five open academic specialty identities rather than a fixed academic subject catalog. Profession constrains professional allocation only; personal learning remains independent from profession eligibility.

The first Psychic proof deliberately uses Detective paths only. That is an implementation boundary, not source evidence that Scholars cannot be psychic.

## Named language source behavior

The named-language closure follows the selected UGE 1.05 source behavior:

- Language is specialized by actual language identity;
- the character's own/native language begins from `INT x 5` in the current EDU-disabled profile;
- an additional language is a separate Language skill with the represented Other-language base, currently 0%;
- source role (`own`/`other`) and open language identity `{ id, label }` are independent retained dimensions.

The same language ID cannot occupy both Scholar roles. Additional Other languages may be learned personally without becoming Scholar professional choices.

This is BRP-native source identity and does not justify a global Character Forge language catalog.

## Implemented age boundary

The current Heroic skill-profile age slice retains the starting-age context needed to validate professional-skill bonuses:

- default starting age retained in the current 18 through 23 source range;
- current age from retained starting age through 49;
- each full 10 years added after retained starting age adds 20 Heroic professional skill points;
- fractions of a decade do not add points;
- below-starting-age characteristic effects and age-50+ aging remain out of scope.

## Current supported backend profile

- Human;
- Normal or Heroic skill-construction profile;
- explicit or standard-rolled characteristics;
- Detective or Scholar for established non-powered/Superpowers construction;
- Average or Affluent wealth;
- age inside the current boundary;
- open Knowledge/Science specialties;
- open named Own/Other language identities;
- either non-powered, bounded Superpowers, or bounded Psychic Abilities;
- Superpowers: Normal/Heroic, Extra Energy and Extra Hit Points only;
- Psychic: Normal only, Empathy and Mind Shield only, Detective creation path only;
- no EDU, Sanity, Fatigue, hit locations, cultural modifiers, non-human modifiers, optional skill-category bonuses, Magic, Mutations, Sorcery, broader power catalogs, Powers creator UI, or runtime Powers engine.

## BRP naming source finding

The authoritative BRP ORC text does not supply a generated-name table, naming corpus, or BRP-owned culture-to-name mapping. Character names are setting/game dependent, and optional cultural backgrounds are setting/GM-defined.

BRP generated-name content is therefore setting/campaign/content-package owned, not `system-brp` owned. The current Human profile must not be used as a proxy for culture, nationality, ethnicity, language, or naming convention.

The existing `name-suggestion/0.1` provider contract remains sufficient for a future caller-supplied setting provider. Do not create a pseudo-BRP default culture or fallback name corpus merely so Randomize All can change the name field.

Any future naming provider must retain its own source ID/version and a deliberate redistribution/license basis for its dataset.

## Current code milestones

### Superpowers

- checkpoint `bc0a05fb9b96c9777a73726100828712cd8bbb41`;
- Actions `34413436457`;
- job `102672848273`;
- 45 test files / 223 tests / 0 failures;
- adapter layer `0.6.0`;
- native schema `brp-character/0.1`.

### Psychic Abilities

- checkpoint `ae35b556dfc177f12e9f934fedd455803c6b74c7`;
- Actions `34417631582`;
- job `102685926895`;
- 46 test files / 231 tests / 0 failures;
- 8 Psychic-specific tests;
- canonical adapter `0.7.0`;
- native schema remains `brp-character/0.1`;
- build `Character Forge build 0.0.1 ae35b556`.

The Psychic tests cover independent skill/power levels, source ability metadata, POW x1 rating causality, final-POW behavior after redistribution, exact Normal starting count, skill-profile caps, personal-pool reallocation constraints, tamper detection, backward validation through the adapter stack, and CharacterDocument/generation provenance round trip.

## Next source/application probes

The original BRP second-system architecture stress-test objective is substantially satisfied after these two distinct power grammars.

No broader BRP implementation is implied by chronology. Future work should be explicitly selected as product breadth, runtime/creator support, a deliberately named additional architecture probe, or promotion/closeout work.

A Sorcery or Magic audit could test list/preparation-style capability grammars, but should not begin without explicit product intent. It may provide less architecture value than defining the intended BRP product breadth and closing/reframing the original stress-test issue.

## Current external references

- Chaosium BRP UGE product page: https://www.chaosium.com/basic-roleplaying-universal-game-engine-pdf/
- Chaosium free BRP ORC Content Document: https://www.chaosium.com/content/orclicense/BasicRoleplaying-ORC-Content-Document.pdf
- Chaosium ORC License page: https://www.chaosium.com/orc-license/
- Chaosium BRP resources and errata: https://www.chaosium.com/basic-roleplaying-resources/
- Chaosium BRP version history: https://brp.chaosium.com/version-history/
- Chaosium BRP downloads: https://brp.chaosium.com/brp-downloads/
