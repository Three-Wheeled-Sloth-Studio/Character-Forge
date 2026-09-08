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

Date reviewed: 2026-09-08

## Selected rules source

- Work: Basic Roleplaying: Universal Game Engine
- Creator: Chaosium Inc.; authors Jason Durall and Steve Perrin
- Edition/version boundary: 2023 Universal Game Engine released under the ORC License
- Canonical product/source page: https://www.chaosium.com/basic-roleplaying-universal-game-engine-pdf/
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

Branded Call of Cthulhu remains a possible separately licensed future product target.

## Implemented source evidence

The current `brp-character/0.1` backend implements a deliberately narrow subset including:

- STR, CON, SIZ, INT, POW, DEX, CHA;
- explicit characteristics;
- deterministic standard rolling with 3d6 for STR/CON/POW/DEX/CHA and 2d6+6 for INT/SIZ;
- standard up-to-three-point redistribution;
- Normal power level: 250 professional points and 75% starting cap;
- Heroic power level: 325 base professional points and 90% starting cap;
- personal skill budget `INT x 10`;
- Detective and Scholar profession probes;
- separate professional and personal skill contributions;
- open Knowledge/Science specialty identity;
- named language identity with Own/Other role semantics;
- core derived Hit Points, Major Wound level, Power Points, Experience Bonus, Move, and Damage Modifier;
- corrected `Charisma Roll` semantics using CHA x 5;
- Track in the supported skill set, consistent with corrections 1.05.

## Profession evidence

Detective is the bounded-choice probe: required professional skills plus four selected electives from the currently supported Detective set.

Scholar is the open-choice probe. The selected source shape includes:

- Average or Affluent wealth, usually Average;
- Language (Other), Language (Own), Persuade, Research, Teach;
- five Knowledge or Science skills appropriate to field and setting.

Character Forge retains exactly five open academic specialty identities rather than a fixed academic subject catalog. Several Knowledge specialties or several Science specialties may coexist as long as exact parent+specialty identity is unique.

Profession constrains professional allocation only. Personal learning remains independent from profession eligibility.

## Named language source behavior

The named-language closure follows the selected UGE 1.05 source behavior:

- Language is specialized by actual language identity;
- the character's own/native language begins from `INT x 5` in the current profile because EDU is not enabled;
- an additional language is a separate Language skill and begins from the Other-language base represented by this source boundary, currently 0%;
- additional language skills are independent identities rather than extra copies of the native-language role;
- corrections 1.05 do not change this language behavior.

Character Forge therefore retains language along two independent BRP-native dimensions:

1. source role: `own` or `other`;
2. open language identity: `{ id, label }`.

The runtime skill identities are currently represented as:

- `language-own` plus named-language specialty;
- `language-other` plus named-language specialty.

The skill label remains source-style `Language (Own)` / `Language (Other)` while the actual language is retained as specialty identity.

Scholar profession state retains exact `ownLanguage` and `otherLanguage` values. The same language ID cannot occupy both roles for the same Scholar because the implemented source model treats an additional language as a separate language skill, not a second native-language role.

A character may retain more than one `language-other` skill. The Scholar-selected Other language is professionally eligible; additional Other languages may be learned personally without becoming Scholar professional choices.

This is BRP-native source identity. It is not a global Character Forge language catalog and does not justify a shared language schema from BRP alone.

## Implemented age boundary

The current Heroic age slice retains the starting-age context needed to validate professional-skill bonuses:

- default starting age retained in the current 18 through 23 source range;
- current age from retained starting age through 49;
- each full 10 years added after retained starting age adds 20 Heroic professional skill points;
- fractions of a decade do not add points;
- retained age basis includes starting age, years added, and professional-skill adjustment;
- below-starting-age characteristic effects and age-50+ aging remain out of scope.

This is an implementation boundary, not the complete BRP age system.

## Current supported profile

- Human;
- Normal or Heroic;
- non-powered;
- explicit or standard-rolled characteristics;
- Detective or Scholar;
- Average or Affluent wealth;
- age inside the boundary above;
- open Knowledge/Science specialties;
- open named Own/Other language identities;
- personal additional Other-language learning;
- no EDU, Sanity, Fatigue, hit locations, cultural modifiers, non-human modifiers, powers, or optional skill-category bonuses.

## Current code milestone

Named-language backend closure is automated-green at:

- code checkpoint `1ce3387491ccf859f56d7a0e92217c7737a56bf0`;
- Actions `34291613617`;
- job `102279178820`;
- 30 test files / 152 tests / 0 failures;
- 35 BRP tests;
- 7 named-language tests;
- adapter `0.5.0`;
- native schema `brp-character/0.1`;
- web build identity `Character Forge build 0.0.1 1ce33874`.

The language tests cover exact Own/Other identities, source bases, contradictory-role rejection, blank identity rejection, extra personal Other-language learning, profession-language tampering, base tampering, and CharacterDocument/generation provenance round trip.

## Next source/application probe

The backend now has enough source-faithful breadth for a narrow first BRP creator UI. The next slice should expose only implemented rules and continue to use BRP-owned builders/validators as the rules authority rather than reimplementing BRP formulas in browser code.

Do not broaden into a global language catalog, whole profession catalog, EDU, powers, Sanity, age-50+, or other optional systems as part of that UI slice unless a concrete dependency requires it.

## Current external references

- Chaosium BRP UGE product page: https://www.chaosium.com/basic-roleplaying-universal-game-engine-pdf/
- Chaosium ORC License page: https://www.chaosium.com/orc-license/
- Chaosium BRP resources and errata: https://www.chaosium.com/basic-roleplaying-resources/
- Chaosium BRP version history: https://brp.chaosium.com/version-history/
- Chaosium BRP downloads: https://brp.chaosium.com/brp-downloads/
