---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
---
# Current Handoff

Date: 2026-09-03
Branch: `dev`
Phase: D&D 5E 2024 PI 1, broad Level 1 guided catalog expansion

## Accepted cross-repo baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted. Do not reopen it without new evidence.

Accepted Character Forge checkpoint on `qa` and `main`:

- `8041edb4009abce8a836faafce9a167883e92bda`

Parchment remains system-agnostic. Character Forge owns D&D-native interpretation, generation, validation, and provenance.

Nothing in the accumulated guided-generation stack has been promoted beyond `dev`. Owner batch runtime acceptance is still required before exact-SHA promotion.

## Current automated-green development checkpoint

The current `dev` code checkpoint is:

- `e5863b9007d2fdac9f6bb053225c2587321821e3`
- implementation base: `d2fd0be576e21351243ac44a683acc63b889c74c` (`feat: expand guided SRD classes to eleven`)
- GitHub Actions run: `33820208614`
- job: `100861054551`
- full `npm run verify` green
- refs / OKF validation green
- strict TypeScript green
- 22 Vitest files / 97 tests / 0 failures
- web TypeScript build green

Guided native schema remains `dnd5e-character/0.3`. D&D adapter is `0.12.0`. Legacy `0.1` and `0.2` validation remain isolated and preserve their historical supported surfaces.

## Current guided support surface

All 12 SRD classes, 4 backgrounds, and 9 species remain cataloged.

### Classes: 11 / 12

- Barbarian
- Bard
- Cleric
- Druid
- Fighter
- Monk
- Paladin
- Ranger
- Rogue
- Sorcerer
- Wizard

Still blocked:

- Warlock

Warlock is intentionally not forced into the ordinary spell-slot model. Pact Magic short-rest slots and the Level 1 Eldritch Invocation choice tree are the next distinct class-owned spellcasting seam.

### Backgrounds: 4 / 4

- Acolyte
- Criminal
- Sage
- Soldier

### Species: 6 / 9

- Dragonborn
- Dwarf
- Goliath
- Halfling
- Human
- Orc

Still blocked:

- Elf
- Gnome
- Tiefling

These require explicit lineage/legacy state and spell-grant choices before enablement.

## Class expansion batch

The class-owned spellcasting seam now has multiple real consumers instead of being a Cleric-only abstraction.

### Druid

Level 1 Druid retains:

- Primal Order: Warden / Magician;
- 2 base cantrips, 3 for Magician;
- 4 ordinary prepared Level 1 Druid spells;
- 2 Level 1 spell slots restored on Long Rest;
- Wisdom casting and Druidic Focus;
- Druidic language and Herbalism Kit proficiency;
- `Speak with Animals` always prepared through Druidic;
- Warden Martial weapons + Medium Armor;
- Magician Wisdom-derived knowledge bonus.

Important corrected distinction: `Speak with Animals` is excluded from the four ordinary prepared-spell choices because it is already always prepared through Druidic. Adapter validation independently rejects a retained Druid that places it in the ordinary prepared selection or loses the always-prepared grant.

### Bard

Level 1 Bard retains:

- Charisma spellcasting;
- 2 Bard cantrips;
- 4 Level 1 Bard spells;
- 2 Level 1 spell slots;
- Bardic Inspiration resource state;
- 3 explicit musical-instrument proficiencies;
- those selected instruments as valid Bard spellcasting foci;
- Light Armor and Simple Weapon training;
- descriptive package-vs-gold starting equipment.

### Paladin

Level 1 Paladin retains:

- Charisma spellcasting;
- 2 prepared Level 1 Paladin spells;
- 2 Level 1 spell slots;
- Holy Symbol focus;
- Lay on Hands 5-point pool;
- Simple + Martial Weapon proficiency;
- Light + Medium + Heavy Armor + Shield training;
- 2 Weapon Mastery choices;
- descriptive package-vs-gold equipment.

### Ranger

Level 1 Ranger retains:

- Wisdom spellcasting;
- 2 ordinary prepared Level 1 Ranger spells;
- 2 Level 1 spell slots;
- Druidic Focus capability;
- `Hunter's Mark` always prepared through Favored Enemy;
- Favored Enemy 2-use free-cast resource;
- 2 Weapon Mastery choices;
- Martial/Simple Weapon and Light/Medium Armor + Shield training.

`Hunter's Mark` is excluded from the ordinary two-spell prepared selector and retained separately as always prepared.

### Sorcerer

Level 1 Sorcerer retains:

- Charisma spellcasting;
- 4 cantrips;
- 2 Level 1 spells;
- 2 Level 1 spell slots;
- Arcane Focus capability;
- Innate Sorcery 2-use resource;
- Simple Weapon training and no armor training.

### Wizard

Level 1 Wizard explicitly retains source-owned spellbook state:

- Intelligence spellcasting;
- 3 Wizard cantrips;
- 6 distinct Level 1 spells in the spellbook;
- 4 prepared Level 1 spells selected from that retained spellbook subset;
- 2 Level 1 spell slots;
- Arcane Focus + spellbook capability;
- Arcane Recovery 1-use / Level-1 recovery budget state.

The adapter rejects prepared spells not present in the retained spellbook. Wizard is therefore not flattened into the Cleric prepared-spell model even though both use standard Long-Rest spell slots.

## Spell architecture evidence

### Independent grants: `spells.grants[]`

Keep this for feat/species-style grants. Current consumers remain:

- Acolyte -> Magic Initiate (Cleric)
- Sage -> Magic Initiate (Wizard)

Grant state retains source/list/casting ability/cantrips/always-prepared Level 1 spell/free cast/recharge.

### Class-owned spellcasting: `spells.classCasting[]`

Current standard-slot consumers are:

- Bard
- Cleric
- Druid
- Paladin
- Ranger
- Sorcerer
- Wizard

The common structure retains source class, list, casting ability, cantrips, prepared/always-prepared spell state, slots, preparation cadence, focus capability, and optional spellbook state. Source-specific class state remains outside the generic spell entry where appropriate: Divine Order, Primal Order, Bardic Inspiration, Lay on Hands, Favored Enemy, Innate Sorcery, Arcane Recovery, etc.

A character may retain class spellcasting and independent Magic Initiate grants simultaneously. Neither source is reconstructed from the other or from generation provenance.

### Warlock boundary

Warlock remains the one intentionally unsupported SRD class. Do not represent Pact Magic as ordinary 2/2 Long-Rest Level 1 slots. The next Warlock slice must explicitly model:

- Pact Magic slot count/level;
- Short Rest recharge;
- Level 1 cantrip/spell choices;
- the Level 1 Eldritch Invocation choice tree and any invocation-created spell/capability state;
- Warlock-specific focus/training/equipment state.

## Automated coverage

The green batch includes:

- the full supported 11-class x 6-species generation matrix through the common native-state boundary;
- dedicated prepared-caster catalog tests;
- Bard/Paladin/Ranger/Sorcerer/Wizard generation and reopen checks;
- Wizard spellbook/subset tamper validation;
- Ranger `Hunter's Mark` always-prepared separation;
- Druid `Speak with Animals` always-prepared separation;
- retained Cleric and Magic Initiate regression coverage;
- all existing Standard Array, Point Cost, Random, Manual, persistence-contract, acceptable-pool, and build-identity tests.

## Existing creator/product standards

Preserve:

- controls left / character review right;
- independent desktop scrolling;
- one-column narrow fallback;
- universal controls before method-specific controls;
- one ability-generation dropdown with dynamic controls;
- compact/collapsible acceptable pools;
- direct dropdowns show every supported option, while checked acceptable pools constrain only randomization;
- icon-first randomization including Character Name;
- descriptive equipment labels while retaining canonical IDs underneath;
- compact contextual help;
- sticky acceptable pools as preference state, not authoritative character state;
- per-character pool/result/mode provenance;
- always-visible runtime build/version identity for QA.

Current name generation remains a temporary six-name catalog. Do not grow it into a giant flat list; future naming should be culture/species/language aware and interoperable with Worldbuilding language/culture systems.

## Ability methods

All continue through the same guided native builder:

- Standard Array
- Point Cost
- Random Generation (4d6 keep highest 3)
- Manual Entry

## Owner batch QA target

The user explicitly requested testing this class expansion as a batch. Recommended runtime pass:

1. confirm the visible Character Forge badge identifies the pulled `dev` revision;
2. confirm the Class picker exposes all supported classes except Warlock;
3. build at least one Bard, Druid, Paladin, Ranger, Sorcerer, and Wizard and confirm `Native state valid`;
4. Druid: confirm `Speak with Animals` appears as always prepared but is not an ordinary prepared-spell option;
5. Ranger: confirm `Hunter's Mark` appears as always prepared/Favored Enemy state but is not one of the two ordinary prepared choices;
6. Wizard: choose six spellbook spells, then verify the four prepared choices are constrained to that spellbook and survive generation/reopen;
7. Bard: change/randomize three instruments and confirm retained instrument/focus state;
8. exercise direct vs random-from-checked spell choices on multiple casters;
9. combine at least one new caster with Acolyte or Sage and confirm Magic Initiate remains a separate spell source;
10. exercise a non-Standard-Array ability method on a new caster;
11. save/reload/reopen representative new classes through Parchment and confirm native state/provenance unchanged;
12. retain prior checks for sticky pools, name randomization, independent scrolling, and descriptive equipment.

Do not promote until explicit owner acceptance.

## Immediate next direction after batch QA

Issue #11 remains open. The two clearest remaining breadth seams are:

1. **Warlock Level 1** as a deliberately separate Pact Magic / Eldritch Invocation native-state slice; and
2. **Elf/Gnome/Tiefling** lineage/legacy support using `spells.grants[]` where mechanically accurate.

Human-selected Magic Initiate also remains disabled until its full general feat path, including the Druid list, is wired through Human Versatile state.

## Random-tables companion watch point

Still defer implementation until concrete personality/flavor/table consumers are sufficient to define the generic producer contract. Likely first consumers remain traits, ideals, bonds, flaws, equipment/trinket suggestions, and later system-specific flavor tables.

A generic table engine returns structured, inspectable, provenance-bearing results. It does not mutate CharacterDocument/native state directly.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state remains mandatory and lossless.
- Never reconstruct retained D&D state from semantic projection.
- Generation methods and choices converge on one native validation/persistence boundary.
- Spell grants, standard class spellcasting, and future Pact Magic remain distinct source concepts where mechanics differ.
- Sticky preferences are separate from authoritative state and historical provenance.
- Do not silently default nested source-system decisions to improve support counts.
- Generator-core stays system-neutral; D&D rules/content stay in `system-dnd5e`.
- Character Forge owns RPG-native interpretation, validation, choices, and provenance.
- Parchment owns generic project membership, lifecycle, relationships, persistence, and future sync/share behavior.
- Local Parchment launcher may rebuild an adjacent Character Forge checkout but must not silently mutate its Git branch or pull source.
- Keep visible runtime source/version identity available in QA builds.
- Use only legally redistributable SRD 5.2.1 / CC-BY-4.0 material in the public repository.

## Agent Academy OKF compatibility

Character Forge uses the Agent Academy `agent-academy-okf-v1` compatibility profile pinned to OKF v0.2. This remains project-memory interoperability only; native character-state ownership, translation-loss rules, licensing boundaries, and exact-SHA promotion are unchanged.
