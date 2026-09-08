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
- Detective and Scholar as the implemented profession probes;
- specialty-bearing skills with source-owned parent plus specialty identity;
- core derived state including Hit Points, Major Wound level, Power Points, Experience Bonus, Move, and Damage Modifier;
- characteristic rolls using the corrections-1.05 `Charisma Roll` terminology and CHA x 5 calculation;
- Track in the supported skill catalog, consistent with corrections 1.05.

## Detective profession evidence

Detective remains the bounded-choice profession probe.

The current adapter retains and validates its required professional skills plus exactly four selected electives from the supported Detective elective set. Personal allocation can cross the profession boundary.

Detective remains evidence that BRP profession is a starting-training constraint, not a D&D-style class.

## Scholar profession evidence

Scholar is implemented as the open-choice profession probe.

The selected ORC source defines Scholar with:

- wealth Average or Affluent, usually Average;
- fixed professional skills Language (Other), Language (Own), Persuade, Research, and Teach;
- five Knowledge or Science skills appropriate to the setting and field of study.

Character Forge retains exactly five open academic specialty identities rather than a fixed subject catalog. The native state can therefore carry several Knowledge specialties and several Science specialties simultaneously.

Current source behavior used by this slice includes:

- Knowledge academic specialties use the current source base chance represented by the adapter separately from allocations;
- Science academic specialties begin from their source base chance separately from allocations;
- Persuade uses its source base chance before allocation;
- Research uses its source base chance before allocation;
- Teach uses its source base chance before allocation;
- Language (Own) currently uses INT x 5 because EDU is disabled in this profile;
- Language (Other) currently uses the 0% base represented by the selected source boundary.

The important implementation contract is not the example subjects. Knowledge (History), Knowledge (Linguistics), Science (Biology), and similar test fixtures are examples only. The adapter accepts open source-owned specialty IDs and labels.

Scholar professional points may be spent only on its five fixed skills and the exact five retained academic specialty identities. Personal learning remains independent from that eligibility boundary.

## Language identity limitation exposed by Scholar

Scholar exposed that Language (Own) and Language (Other) cannot safely collapse to one undifferentiated `language` skill identity.

The current implementation therefore keeps them distinct as BRP-native source variants:

- `language-own`, displayed as `Language (Own)`;
- `language-other`, displayed as `Language (Other)`.

This is a narrow source-fidelity fix, not complete language support.

The backend does not yet retain the actual named language associated with either role. It can currently distinguish that a skill is the character's own language versus another language, but it cannot yet distinguish, for example, one particular own-language identity from another or one other-language identity from another.

Do not present this as complete language modeling in BRP UI. The next source probe is to retain open named-language identity while preserving Own/Other role semantics and source base chances.

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
- Detective or Scholar profession;
- Average or Affluent wealth;
- open Scholar Knowledge/Science specialty identities;
- distinct Language (Own) versus Language (Other) source variants, without actual named-language identity yet;
- no EDU, Sanity, Fatigue, hit locations, cultural modifiers, non-human modifiers, or optional skill-category bonuses.

The native state preserves the effective rules profile, profession choices, open academic specialties, and any character-specific age causality needed for validation/reopen.

## Current code milestone status

The Scholar profession checkpoint is automated-green on `dev`:

- code checkpoint `96846485016c4b3082217db8de0b11a143d9e9e2`;
- Actions `34254069939`;
- job `102155313610`;
- 29 test files / 145 tests / 0 failures;
- 28 BRP tests;
- 9 Scholar tests;
- adapter `0.4.0`;
- native schema `brp-character/0.1`;
- web build green with build identity `Character Forge build 0.0.1 96846485`.

The Scholar matrix proves Normal/Heroic and explicit/standard-rolled construction, repeated parent skills with distinct specialties, duplicate rejection, professional eligibility, personal-learning independence, independent tamper detection, and CharacterDocument round trip.

## Next source probe: named language identity

Before BRP creator UI, close the language identity seam exposed by Scholar.

Target the smallest BRP-native representation that can retain:

- open language ID and display label;
- Own versus Other source role;
- source base chance for that role;
- exact profession eligibility;
- contribution/final-rating causality;
- generation provenance.

Do not create a global Character Forge language catalog or shared language schema from this one source system.

Verify the exact UGE 1.05 source behavior before expanding into bilingual characters, multiple native languages, or additional personal-language rules.

Before any public BRP release, the ORC attribution/notice text must still be checked against the then-current Chaosium instructions and added in the legally required location.

## Current external references

- Chaosium BRP UGE product page: https://www.chaosium.com/basic-roleplaying-universal-game-engine-pdf/
- Chaosium ORC License page: https://www.chaosium.com/orc-license/
- Chaosium BRP resources and errata: https://www.chaosium.com/basic-roleplaying-resources/
- Chaosium BRP version history: https://brp.chaosium.com/version-history/
- Chaosium BRP downloads: https://brp.chaosium.com/brp-downloads/
