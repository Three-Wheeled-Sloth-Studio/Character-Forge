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
- First adapter rules version: `1.05`

The first BRP adapter and its tests are pinned to this source/errata boundary. Do not silently replace it with a newer correction document; a future update must change source metadata and corresponding validation/tests deliberately.

## Why this is the authority

Chaosium identifies Basic Roleplaying: Universal Game Engine, released in 2023 under the ORC License, as the current BRP Universal Game Engine product line and makes its open rules content available for personal and commercial use under ORC.

Character Forge therefore targets this UGE/ORC boundary rather than an earlier BRP rules document.

## Older online BRP SRD is not the implementation authority

Chaosium still hosts an online BRP SRD based on the earlier BRPSRD1.0/2020 material. It is useful for orientation and historical comparison, but it is not the selected rules source for the Character Forge BRP adapter.

This distinction matters because the newer UGE character-creation rules differ in details such as terminology, power-level-dependent skill budgets, and optional-rule presentation.

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

## First-slice source evidence

The implemented `brp-character/0.1` slice uses these source rules:

- core characteristics STR, CON, SIZ, INT, POW, DEX, and CHA;
- Normal power level;
- Normal professional skill budget of 250 points;
- Normal starting skill cap of 75%;
- personal skill budget of INT x 10;
- profession-constrained professional allocation kept distinct from personal allocation;
- Detective as the representative profession;
- specialty-bearing skills including Firearm (Handgun), Knowledge (Law), and Science (Forensics);
- core derived state including Hit Points, Major Wound level, Power Points, Experience Bonus, Move, and Damage Modifier;
- characteristic rolls using the corrections-1.05 `Charisma Roll` terminology and CHA x 5 calculation;
- Track in the supported skill catalog, consistent with corrections 1.05.

The first builder intentionally accepts explicit characteristic values rather than implementing the standard rolled-generation procedure. Standard rolled generation is a follow-on slice, not an inferred rule omission.

## First-slice profile

The first implementation remains intentionally narrow:

- Human.
- Normal power level.
- Non-powered.
- Explicit characteristics.
- Age 18 through 49 so age adjustment rules remain out of scope.
- No EDU.
- No Sanity.
- No Fatigue.
- No hit locations.
- No cultural modifiers.
- No non-human modifiers.
- No optional skill-category bonuses.
- Detective only.
- Professional and personal skill allocations retained separately.

The native state preserves this effective rules profile so future validation/reopen does not need to infer which optional rules were in force.

## First code milestone status

The first source-verification milestone is complete on `dev`:

- exact source ID and corrections boundary are recorded in adapter metadata;
- no branded Call of Cthulhu content is used;
- first-slice rules are independently validated rather than trusted from the builder;
- corrections 1.05 affect tested behavior through `Charisma Roll` and Track support;
- CharacterDocument round-trip preservation is covered by tests.

Before any public BRP release, the ORC attribution/notice text must still be checked against the then-current Chaosium instructions and added in the legally required location.

## Current external references

- Chaosium BRP UGE product page: https://www.chaosium.com/basic-roleplaying-universal-game-engine-pdf/
- Chaosium ORC License page: https://www.chaosium.com/orc-license/
- Chaosium BRP resources and errata: https://www.chaosium.com/basic-roleplaying-resources/
- Chaosium BRP version history: https://brp.chaosium.com/version-history/
- Chaosium BRP downloads: https://brp.chaosium.com/brp-downloads/
