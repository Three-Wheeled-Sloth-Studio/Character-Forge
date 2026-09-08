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

Status: Selected source contract for the second-system design and implementation spike.

Date reviewed: 2026-09-08

## Selected rules source

- Work: Basic Roleplaying: Universal Game Engine
- Creator: Chaosium Inc.; authors Jason Durall and Steve Perrin
- Edition/version boundary: 2023 Universal Game Engine released under the ORC License
- Canonical product/source page: https://www.chaosium.com/basic-roleplaying-universal-game-engine-pdf/
- ORC license and required notice page: https://www.chaosium.com/orc-license/
- Free ORC content document: linked from Chaosium's BRP ORC/download pages
- Current corrections/errata listing at review time: `CHA2036 BRP UGE Corrections 1.05`
- Resource page: https://www.chaosium.com/basic-roleplaying-resources/
- Candidate Character Forge rules-source ID: `chaosium-brp-uge-orc-2023`

The candidate rules-source ID should be frozen only when the first adapter implementation also records the exact errata/corrections boundary used by its tests.

## Why this is the authority

Chaosium identifies Basic Roleplaying: Universal Game Engine, released in 2023 under the ORC License, as the latest edition of BRP. Chaosium also states that the Universal Game Engine is available for personal and commercial use under ORC.

Character Forge therefore targets this UGE/ORC boundary rather than an earlier BRP rules document.

## Older online BRP SRD is not the implementation authority

Chaosium still hosts an online BRP SRD based on the earlier BRPSRD1.0/2020 material. It is useful for orientation and historical comparison, but it is not the selected rules source for the Character Forge BRP adapter.

This distinction matters because the newer UGE character-creation rules differ in details such as terminology, power-level-dependent skill budgets, and optional-rule presentation.

Implementation and tests must follow the selected UGE ORC content plus the recorded corrections boundary, not whichever BRP page is easiest to search.

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

## Character-creation evidence relevant to the first slice

The selected UGE content establishes several source rules that matter immediately to architecture:

- the core characteristics are STR, CON, SIZ, INT, POW, DEX, and CHA;
- standard creation rolls 3D6 for STR, CON, POW, DEX, and CHA, and 2D6+6 for INT and SIZ;
- up to 3 characteristic points may be redistributed under the standard process;
- BRP supports alternative characteristic-generation options, including point-based creation;
- campaign power level affects professional skill-point budgets and skill caps;
- profession identifies starting professional skills but does not permanently limit later learning;
- personal skill points are allocated separately from professional skill points;
- skill ratings can include base chance plus multiple contribution sources;
- specialty skills are common and setting-sensitive;
- derived state includes core values such as Hit Points, Major Wound level, Power Points, Experience Bonus, and Move;
- Sanity, Fatigue, hit locations, EDU, skill-category bonuses, cultures, non-human rules, and powers are modular/optional systems rather than mandatory fields on every BRP character.

The first code slice should implement only the subset explicitly selected in `refs/architecture/brp-second-system-premortem.md`.

## First-slice profile

The initial implementation profile is intentionally narrow:

- Human.
- Normal power level.
- Non-powered.
- No EDU.
- No Sanity.
- No Fatigue.
- No hit locations.
- No cultural modifiers.
- No non-human modifiers.
- No optional skill-category bonuses.
- One representative profession.
- Professional and personal skill allocations retained separately.

The native state must preserve this effective profile so future validation/reopen does not need to infer which optional rules were in force.

## Source-verification work required before first code milestone

Before declaring the first BRP adapter milestone complete:

1. Re-read the current Chaosium ORC notice and attribution instructions.
2. Confirm the exact UGE ORC content document used by implementation.
3. Review current `CHA2036 BRP UGE Corrections` and record the corrections version applied.
4. Record stable rules-source metadata in the adapter.
5. Ensure copied identifiers/rules content stay within the ORC Licensed Material boundary and that no protected artwork/trade dress is committed.
6. Add tests for any correction that affects the implemented first-slice rules.

## Current external references

- Chaosium BRP UGE product page: https://www.chaosium.com/basic-roleplaying-universal-game-engine-pdf/
- Chaosium ORC License page: https://www.chaosium.com/orc-license/
- Chaosium BRP resources and errata: https://www.chaosium.com/basic-roleplaying-resources/
- Chaosium BRP version history: https://brp.chaosium.com/version-history/
- Chaosium BRP downloads: https://brp.chaosium.com/brp-downloads/
