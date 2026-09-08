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
- Free ORC content document: linked from Chaosium's BRP ORC/download pages
- Corrections/errata boundary implemented: `CHA2036 BRP UGE Corrections 1.05`
- Resource page: https://www.chaosium.com/basic-roleplaying-resources/
- Character Forge rules-source ID: `chaosium-brp-uge-orc-1.05`
- Character Forge edition ID: `uge-2023`
- Adapter rules version: `1.05`

The BRP adapter and tests are pinned to this source/errata boundary. Do not silently replace it with a newer correction document; a future update must change source metadata and corresponding validation/tests deliberately.

## Why this is the authority

Chaosium identifies Basic Roleplaying: Universal Game Engine, released in 2023 under the ORC License, as the current BRP Universal Game Engine product line and makes its open rules content available for personal and commercial use under ORC.

Character Forge therefore targets this UGE/ORC boundary rather than an earlier BRP rules document.

## Older online BRP SRD is not the implementation authority

Chaosium still hosts an online BRP SRD based on the earlier BRPSRD1.0/2020 material. It is useful for orientation and historical comparison, but it is not the selected rules source for the Character Forge BRP adapter.

Implementation and tests must follow the selected UGE ORC content plus corrections 1.05, not whichever BRP page is easiest to search.

## Licensing boundary

Chaosium states that, with limited Product Identity exceptions including trademarks and visual/trade-dress material, the text of Basic Roleplaying: Universal Game Engine is available under the ORC License for personal and commercial use.

Character Forge may implement and redistribute rules content only within that license boundary and must preserve the required attribution/notice obligations for any distributed ORC Licensed Material.

Before any public release containing BRP ORC content, verify the then-current Chaosium ORC notice page and copy the required legal notice/credit exactly where the license requires it. Do not rely on a paraphrase in this reference as the release notice.

## Product Identity and branded-game boundary

This adapter is for Basic Roleplaying: Universal Game Engine.

Do not import protected branded-game content merely because those games use related BRP mechanics. In particular:

- Call of Cthulhu-specific trademarks, setting material, monsters, occupations, text, art, trade dress, and other protected content are out of scope;
- RuneQuest, Pendragon, Rivers of London, and other Chaosium game-specific content are also out of scope unless separately licensed or independently available under an applicable open-content grant;
- compatibility or future translation work must not falsely imply official support or licensing for a branded Chaosium game.

Branded Call of Cthulhu support remains a possible future commercial-license conversation, not a shortcut around this source boundary.

## Implemented source evidence

The current `brp-character/0.1` backend uses these source rules:

- core characteristics STR, CON, SIZ, INT, POW, DEX, and CHA;
- explicit and standard rolled characteristic generation;
- standard rolls of 3d6 for STR, CON, POW, DEX, CHA and 2d6+6 for INT, SIZ;
- standard up-to-three-point characteristic redistribution;
- Normal power level with 250 professional skill points and 75% starting cap;
- Heroic power level with 325 base professional skill points and 90% starting cap;
- personal skill budget of INT x 10 in both implemented profiles;
- profession-constrained professional allocation kept distinct from personal allocation;
- Detective as the first representative profession;
- specialty-bearing skills including Firearm (Handgun), Knowledge (Law), and Science (Forensics);
- core derived state including Hit Points, Major Wound level, Power Points, Experience Bonus, Move, and Damage Modifier;
- characteristic rolls using the corrections-1.05 `Charisma Roll` terminology and CHA x 5 calculation;
- Track in the supported skill catalog, consistent with corrections 1.05.

## Implemented age boundary

The current Heroic slice models the source professional-skill age interaction narrowly rather than ignoring it.

- default starting age is retained in the source range produced by `17+1d6`, represented as 18 through 23;
- current age must be at least the retained starting age and no greater than 49;
- each full 10 years added after the retained starting age adds 20 Heroic professional skill points;
- fractions of a decade do not add points;
- the retained age basis records starting age, years added, and the resulting professional-skill adjustment;
- below-starting-age characteristic adjustments and age-50+ aging are not yet implemented.

This boundary is an implementation scope decision. It must not be misrepresented as the complete BRP age system.

## Current implementation profile

The backend currently supports:

- Human;
- Normal or Heroic power level;
- non-powered `enabledPowerSystems: []`;
- explicit or standard-rolled characteristics;
- ages within the implemented boundary above;
- Detective profession;
- no EDU, Sanity, Fatigue, hit locations, cultural modifiers, non-human modifiers, or optional skill-category bonuses.

The native state preserves the effective rules profile and any character-specific age causality needed for validation/reopen.

## Next source probe: Scholar

Scholar is selected as the second profession architecture probe because its skill-choice shape differs materially from Detective.

The ORC content defines Scholar with:

- wealth Average or Affluent, usually Average;
- Language (Other), Language (Own), Persuade, Research, and Teach;
- five Knowledge or Science skills appropriate to setting and field of study.

The implementation target is source-faithful open specialty identity, not a fixed Character Forge catalog of academic subjects.

## Current code milestone status

The Heroic profile checkpoint is automated-green on `dev`:

- code checkpoint `a780f82378e1477d77cf1076cc769491dcb3043d`;
- Actions `34237331940`;
- job `102098319676`;
- 28 test files / 136 tests / 0 failures;
- 19 BRP tests;
- adapter `0.3.0`;
- native schema `brp-character/0.1`.

Before any public BRP release, the ORC attribution/notice text must still be checked against the then-current Chaosium instructions and added in the legally required location.

## Current external references

- Chaosium BRP UGE product page: https://www.chaosium.com/basic-roleplaying-universal-game-engine-pdf/
- Chaosium ORC License page: https://www.chaosium.com/orc-license/
- Chaosium BRP resources and errata: https://www.chaosium.com/basic-roleplaying-resources/
- Chaosium BRP version history: https://brp.chaosium.com/version-history/
- Chaosium BRP downloads: https://brp.chaosium.com/brp-downloads/
