---
type: "Integration Reference"
title: "D&D 5E 2024 SRD 5.2.1 Source Boundary"
tags:
- character-forge
- integration
---
# D&D 5E 2024 SRD 5.2.1 Source Boundary

Status: Active source contract for D&D 5E 2024 implementation.

## Source

- Work: System Reference Document 5.2.1 (SRD 5.2.1)
- Creator: Wizards of the Coast LLC
- Published: 2025-05-01
- Canonical source page: https://www.dndbeyond.com/srd
- License: Creative Commons Attribution 4.0 International (CC-BY-4.0)
- License URL: https://creativecommons.org/licenses/by/4.0/
- Character Forge rules-source ID: `wotc-srd-5.2.1`

The upstream SRD contains the controlling legal information and attribution instructions. Character Forge records creator, work title, source URL, version, and license in machine-readable adapter metadata. Do not add non-SRD rulebook content merely because it is compatible with the adapter.

## Character creation sequence

The default guided D&D 2024 path follows the SRD sequence rather than a Character Forge-wide assumption:

1. choose a class;
2. determine origin;
3. determine ability scores;
4. continue remaining character details.

Character Forge may support common table variations, but identifies them as alternate generation workflows rather than silently changing the adapter's default sequence.

## Ability generation evidence used

The current implementation supports:

- Standard Array: 15, 14, 13, 12, 10, and 8 exactly once.
- Point Cost: 27-point budget, scores 8 through 15, costs 0/1/2/3/4/5/7/9 respectively.
- Random Generation: roll 4d6, keep the highest 3, six times, then assign the six results.
- 2024 background ability increases using +2/+1 on two listed abilities or +1/+1/+1 on all three listed abilities.
- Manual Ability Entry as a Character Forge input/validation path rather than a separate SRD generation rule.

All four methods converge on the same guided native builder and retain method-specific provenance separately from authoritative character state.

## Current SRD Level 1 guided catalog

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

All twelve are guided-supported on `dev`. Source-specific Level 1 mechanics remain explicit rather than being flattened into one class template. Prepared casters, Wizard spellbook state, and Warlock Pact Magic retain distinct native semantics.

### Backgrounds: 4 / 4

- Acolyte: INT/WIS/CHA; Magic Initiate (Cleric); Insight and Religion; Calligrapher's Supplies; equipment package or 50 GP.
- Criminal: DEX/CON/INT; Alert; Sleight of Hand and Stealth; Thieves' Tools; equipment package or 50 GP.
- Sage: CON/INT/WIS; Magic Initiate (Wizard); Arcana and History; Calligrapher's Supplies; equipment package or 50 GP.
- Soldier: STR/DEX/CON; Savage Attacker; Athletics and Intimidation; Gaming Set; equipment package or 50 GP.

Acolyte and Sage retain Magic Initiate spell choices and spell grants explicitly rather than hiding them behind fixture defaults.

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

All nine are guided-supported on `dev` only after their required Level 1 decisions were modeled explicitly.

## Species nested-choice boundary

Character Forge stores identifiers and mechanical state rather than copying descriptive rules prose.

### Dragonborn

Dragonborn retains explicit Draconic Ancestry, ancestry damage type, Breath Weapon uses, resistance identity, Darkvision, and future Level 5 Draconic Flight capability identity.

### Goliath

Goliath retains explicit Giant Ancestry, ancestry uses, Speed 35, Powerful Build, and future Level 5 Large Form capability identity.

### Elf

Elf retains:

- Elven Lineage: Drow, High Elf, or Wood Elf;
- Keen Senses selection from Insight, Perception, or Survival;
- Intelligence, Wisdom, or Charisma lineage spellcasting ability;
- lineage-specific Speed and Darkvision;
- Level 1 lineage cantrip;
- High Elf Wizard-cantrip replacement semantics after a Long Rest;
- future Level 3 and Level 5 lineage spell grants as inactive future capability metadata.

### Gnome

Gnome retains:

- Gnomish Lineage: Forest or Rock;
- Intelligence, Wisdom, or Charisma lineage spellcasting ability;
- Small size, Speed 30, Darkvision 60, and Gnomish Cunning identity;
- Forest Gnome Minor Illusion, always-prepared Speak with Animals, and proficiency-bonus free casts per Long Rest;
- Rock Gnome Mending and Prestidigitation plus explicit three-device clockwork capacity.

### Human

Human retains:

- Small or Medium size;
- the Skillful proficiency choice;
- the Versatile Origin feat choice;
- explicit Skilled nested proficiencies when Skilled is selected;
- explicit Magic Initiate nested choices when Magic Initiate is selected: Cleric/Druid/Wizard list, INT/WIS/CHA casting ability, two cantrips, and one Level 1 spell.

Human Magic Initiate is retained as its own independent feat spell grant. If the background already grants Magic Initiate, Human may repeat the feat only with a different spell list. The background and Human grants remain separately identifiable and independently validated.

### Tiefling

Tiefling retains:

- Small or Medium size;
- Fiendish Legacy: Abyssal, Chthonic, or Infernal;
- Intelligence, Wisdom, or Charisma legacy spellcasting ability;
- legacy-specific damage resistance and Level 1 cantrip;
- Thaumaturgy from Otherworldly Presence;
- future Level 3 and Level 5 legacy spell grants as inactive future capability metadata.

## Spell source boundary

Three distinct source concepts are intentionally retained:

- `spells.grants[]`: independent feat-style grants such as background or Human Magic Initiate;
- `spells.speciesGrants[]`: species-owned magic and future level-gated species spells;
- `spells.classCasting[]`: class-owned spellcasting, including ordinary standard-slot casters and Warlock Pact Magic.

Do not reconstruct one source from another. Do not flatten them merely because all may eventually display in one spell list.

Multiple independent Magic Initiate grants may coexist when the repeatable-feat rule is satisfied. Each grant retains its own source, list, casting ability, cantrips, prepared Level 1 spell, and Long-Rest free-cast resource.

Pact of the Tome duplicate exclusion considers currently active species spells, class spellcasting, background Magic Initiate, and Human Magic Initiate.

## Current automated checkpoint

The mechanical SRD Level 1 closeout checkpoint is:

- Human Magic Initiate implementation: `732b0ad8c8c3469fd1edd1998ca5bbf2082dceef`
- current code checkpoint: `55f79a1004c14eef1635e92c602e1fefa18cab15`
- Actions: `34220401743`
- job: `102041913356`
- 25 Vitest files / 117 tests / 0 failures
- 108 class/species combinations validated through one native-state boundary
- adapter version `0.15.0`
- native schema `dnd5e-character/0.3`

Mechanical SRD Level 1 breadth is complete on `dev`. The remaining gate is owner accumulated runtime QA and exact-SHA promotion, not an unmodeled SRD Level 1 option.

## Public-repository rule

Before adding broader extracted SRD datasets, confirm that every included field is present in the named SRD version and that attribution remains correct. Keep source/version provenance attached to generated native state so later translations can be tested against the exact originating rules corpus.

Prefer catalog metadata, identifiers, numeric mechanics, and implementation-specific choice structures over copying descriptive SRD prose. When an option requires a nested rule choice, model that choice explicitly before declaring the option fully supported.
