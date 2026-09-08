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
Phase: D&D 5E 2024 PI 1, full SRD Level 1 class/background/species breadth automated-green

## Promoted baseline

The embedded persistence/reopen seam and direct-choice/acceptable-pool visibility correction remain the promoted baseline:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

The accumulated Level 1 generation batch remains **dev-only** pending explicit owner runtime acceptance. Do not promote it implicitly.

Parchment remains system-agnostic. Character Forge owns D&D-native interpretation, generation, validation, and provenance.

## Current automated-green checkpoint

- code: `e8a0b1e778299a7ce0f4b2e6bfe1432c7cdd35cb`
- commit: `feat: expose all SRD species choices`
- Actions: `34215046544`
- job: `102024717908`
- refs / OKF green
- strict TypeScript green
- **25 Vitest files / 114 tests / 0 failures**
- web build green
- build identity: `Character Forge build 0.0.1 e8a0b1e7`
- native schema: `dnd5e-character/0.3`
- adapter: `0.14.0`

Legacy `0.1` and `0.2` validation remain isolated and preserve their historical supported surfaces.

## Current guided support

All currently targeted SRD Level 1 catalog entries are guided-supported:

### Classes: 12 / 12

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
- Warlock
- Wizard

### Backgrounds: 4 / 4

- Acolyte
- Criminal
- Sage
- Soldier

### Species: 9 / 9

- Dragonborn
- Dwarf
- Elf
- Gnome
- Goliath
- Halfling
- Human
- Orc
- Tiefling

Automated coverage now builds and validates all **12 classes x 9 species = 108 class/species combinations** through the same native-state boundary.

## Elf / Gnome / Tiefling checkpoint

The last three SRD species are now first-class guided choices rather than catalog-only placeholders.

### Elf

Retained native state includes:

- Elven Lineage: Drow, High Elf, or Wood Elf;
- Keen Senses choice: Insight, Perception, or Survival;
- Intelligence, Wisdom, or Charisma as the lineage spellcasting ability;
- lineage-specific Speed and Darkvision;
- Fey Ancestry and Trance feature identity;
- Level 1 lineage cantrip;
- High Elf Wizard-cantrip replacement semantics after a Long Rest;
- explicit Level 3 and Level 5 future spell grants without activating them at Level 1.

The creator avoids already-owned class/background skills when presenting Keen Senses choices.

### Gnome

Retained native state includes:

- Gnomish Lineage: Forest or Rock;
- Intelligence, Wisdom, or Charisma as the lineage spellcasting ability;
- Small size, Speed 30, Darkvision 60, and Gnomish Cunning identity;
- Forest Gnome Minor Illusion plus always-prepared Speak with Animals and proficiency-bonus free casts per Long Rest;
- Rock Gnome Mending and Prestidigitation plus explicit three-device clockwork capacity.

### Tiefling

Retained native state includes:

- Small or Medium size choice;
- Fiendish Legacy: Abyssal, Chthonic, or Infernal;
- Intelligence, Wisdom, or Charisma as the legacy spellcasting ability;
- legacy-specific resistance and Level 1 cantrip;
- Thaumaturgy from Otherworldly Presence;
- explicit Level 3 and Level 5 future spell grants without activating them early.

### Species spell-state seam

Species-owned magic is retained separately in `spells.speciesGrants[]`. It is not reconstructed from feature IDs and is not flattened into either Magic Initiate `spells.grants[]` or class-owned `spells.classCasting[]`.

Warlock Pact of the Tome duplicate exclusion now includes currently active species spells as well as Pact Magic and Magic Initiate spells.

Independent adapter validation rejects invalid lineage/legacy identity, casting ability, Speed/Darkvision/resistance state, future-grant semantics, and Rock Gnome clockwork capacity.

## Class spellcasting distinctions to preserve

`spells.grants[]` remains for independent feat-style sources such as Magic Initiate.

`spells.speciesGrants[]` remains for species-owned spell capability and future level-gated grants.

`spells.classCasting[]` remains for class-owned casting state. Standard-slot consumers are Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, and Wizard. Warlock retains class-owned Pact Magic with explicit Short-or-Long-Rest recharge semantics rather than ordinary Long-Rest slots.

Preserve these source-specific rules:

- Druid `Speak with Animals` is always prepared through Druidic and excluded from ordinary prepared choices.
- Ranger `Hunter's Mark` is always prepared through Favored Enemy and excluded from ordinary prepared choices.
- Wizard owns six retained Level 1 spellbook spells; its four prepared spells must be a subset.
- Bard owns three explicit musical instrument proficiencies/foci and Bardic Inspiration.
- Paladin owns Lay on Hands and Weapon Mastery.
- Ranger owns Favored Enemy and Weapon Mastery.
- Sorcerer owns Innate Sorcery.
- Wizard owns Arcane Recovery.
- Warlock owns one Level 1 Pact Magic slot restored on Short or Long Rest and one Level-1-legal Eldritch Invocation.
- Pact of the Tome owns three cantrips and two Level 1 ritual spells and excludes already-prepared class, feat, and species spells.

## Creator standards to preserve

- controls left / character review right;
- independent desktop panel scrolling;
- one-column narrow fallback;
- universal controls before method-specific controls;
- one ability-generation dropdown with dynamic controls;
- direct dropdowns show all supported options;
- checked acceptable pools constrain randomization only;
- sticky acceptable pools are preference state, not authoritative character state;
- random-from-checked and direct choices retain provenance;
- icon-first randomization including Name;
- descriptive equipment labels;
- compact contextual help;
- visible runtime build/source badge for QA.

Current name generation is still a temporary six-full-name catalog. Do not expand it into a giant flat list; future naming should be culture/species/language aware.

## Ability methods

All converge on the same guided native builder:

- Standard Array
- Point Cost
- Random 4d6 keep highest 3
- Manual Entry

## Owner accumulated QA target

Do not promote until explicit owner acceptance. The next runtime pass should cover the now-complete class/species breadth as one batch:

1. confirm the visible build badge identifies the pulled `dev` revision;
2. confirm all 12 classes and all 9 species appear in direct pickers regardless of old acceptable-pool state;
3. build representative Bard, Druid, Paladin, Ranger, Sorcerer, Warlock, and Wizard characters and confirm `Native state valid`;
4. verify Warlock one-slot Short/Long-Rest Pact Magic semantics and all five Level 1 Invocations;
5. verify Pact of the Tome excludes spells already prepared through Pact Magic, Magic Initiate, or the selected species;
6. verify Druid `Speak with Animals`, Ranger `Hunter's Mark`, and Wizard spellbook/prepared distinctions;
7. build Drow, High Elf, and Wood Elf variants and check lineage-specific Darkvision/Speed/spell state;
8. build Forest and Rock Gnomes and check Speak with Animals free uses versus clockwork-device capacity;
9. build all three Tiefling legacies, including Small and Medium size choices, and check resistance/cantrip/future-grant state;
10. exercise random-from-checked on lineage/legacy and spell menus;
11. exercise a non-Standard-Array ability method;
12. save/reload/reopen representative new class/species combinations through Parchment;
13. retain prior sticky-pool/name/scrolling/equipment checks.

## Next substantive work after batch QA

Issue #11 remains open for one important Level 1 breadth seam: **Human-selected Magic Initiate as a general Origin-feat path**. Human Versatile needs explicit general feat state/provenance, including Cleric/Druid/Wizard list selection, casting ability, and spell selections. Do not treat the background-fixed Acolyte/Sage Magic Initiate path as a substitute.

After that, reassess:

- consolidating Quick Generate into the creator workspace as a top-level creation mode rather than an ability method;
- early guided narrative generation using the same catalogs and native generation APIs;
- the system-neutral random-table companion once concrete personality/flavor consumers define its result contract;
- structured naming rather than expanding the temporary flat list.

## Random-tables watch point

Still defer the companion until concrete personality/flavor consumers define the generic result contract. Likely first consumers remain traits, ideals, bonds, flaws, equipment/trinkets, and later system-specific flavor tables. Start before Guided Narrative creates parallel table machinery.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state is mandatory and lossless.
- Never reconstruct retained D&D state from semantic projection.
- Independent feat grants, species grants, standard class spellcasting, and Pact Magic remain distinct where source rules differ.
- Do not silently default nested source decisions to improve support counts.
- Generator-core stays system-neutral; D&D rules/content stay in `system-dnd5e`.
- Character Forge owns RPG-native interpretation/validation/generation/provenance.
- Parchment owns generic project membership/lifecycle/persistence/sync.
- Keep visible runtime source/version identity available in QA builds.
- Use only legally redistributable SRD 5.2.1 / CC-BY-4.0 material in the public repo.
