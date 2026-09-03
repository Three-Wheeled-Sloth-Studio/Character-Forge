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

Character Forge may later support common table variations, but should identify them as alternate generation workflows rather than silently changing the adapter's default sequence.

## Ability generation evidence used

The current implementation supports:

- Standard Array: 15, 14, 13, 12, 10, and 8 exactly once.
- Point Cost: 27-point budget, scores 8 through 15, costs 0/1/2/3/4/5/7/9 respectively.
- Random Generation: roll 4d6, keep the highest 3, six times, then assign the six results.
- 2024 background ability increases using +2/+1 on two listed abilities or +1/+1/+1 on all three listed abilities.

Manual Ability Entry is a Character Forge input/validation path rather than a separate SRD generation rule.

All four explicit ability methods now run through the generalized guided native builder. The selected background supplies the three legal abilities for the background increase step.

## SRD class catalog

The SRD 5.2.1 class catalog represented by Character Forge contains:

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

Cataloging an SRD class does not mean the current generator can faithfully produce it.

The guided-enabled class subset is:

- Barbarian
- Fighter
- Monk
- Rogue

These classes can currently be represented at Level 1 without a spell-state implementation. The remaining classes stay disabled until Character Forge has enough native spell/choice state to generate them faithfully.

## SRD species catalog

The SRD 5.2.1 species catalog represented by Character Forge contains:

- Dragonborn
- Dwarf
- Elf
- Gnome
- Goliath
- Halfling
- Human
- Orc
- Tiefling

The guided-enabled species subset is:

- Dwarf
- Halfling
- Human
- Orc

Dragonborn, Elf, Gnome, Goliath, and Tiefling remain disabled until their required ancestry/lineage/legacy decisions are modeled explicitly. Do not silently choose those nested options merely to broaden the support list.

## SRD backgrounds

The SRD 5.2.1 backgrounds represented in the guided catalog are:

- Acolyte: INT/WIS/CHA; Magic Initiate (Cleric); Insight and Religion; Calligrapher's Supplies; equipment package or 50 GP.
- Criminal: DEX/CON/INT; Alert; Sleight of Hand and Stealth; Thieves' Tools; equipment package or 50 GP.
- Sage: CON/INT/WIS; Magic Initiate (Wizard); Arcana and History; Calligrapher's Supplies; equipment package or 50 GP.
- Soldier: STR/DEX/CON; Savage Attacker; Athletics and Intimidation; Gaming Set; equipment package or 50 GP.

Current guided support enables Criminal and Soldier.

Acolyte and Sage remain cataloged but disabled because their fixed Magic Initiate Origin feats require spell choices that the current native spell model cannot yet represent faithfully. Do not silently select those spells to mark the backgrounds supported.

For enabled backgrounds, generated native state retains:

- the background ID;
- its fixed Origin feat;
- its two skill proficiencies;
- its tool proficiency;
- package-A versus 50-GP equipment choice;
- its three eligible ability IDs through the D&D catalog and generation/validation path.

The adapter verifies background-owned ability increases against the selected background rather than a Soldier-specific rule.

## First guided native slice

The current guided builder uses a deliberately small subset of SRD mechanics while opening real class/background/species variance:

- Level 1 XP and Proficiency Bonus.
- Barbarian Level 1 including Rage, Unarmored Defense, Weapon Mastery, and the starting profile used by the generated fixture.
- Fighter Level 1 including Fighting Style, Second Wind, Weapon Mastery, and the starting profile used by the generated fixture.
- Monk Level 1 including Martial Arts, Unarmored Defense, and the starting profile used by the generated fixture.
- Rogue Level 1 including Expertise, Sneak Attack, Thieves' Cant, Weapon Mastery, and the starting profile used by the generated fixture.
- Criminal and Soldier background mechanics listed above.
- Dwarf, Halfling, Human, and Orc Level 1 species traits needed by generated state.
- Human Versatile currently selects a non-duplicating supported Origin feat: Soldier/Savage Attacker pairs with Alert; Criminal/Alert pairs with Savage Attacker.

Implementation stores identifiers and mechanical state rather than copying descriptive rules prose.

## Public-repository rule

Before adding broader extracted SRD datasets, confirm that every included field is present in the named SRD version and that attribution remains correct. Keep source/version provenance attached to generated native state so later translations can be tested against the exact originating rules corpus.

Prefer catalog metadata, identifiers, numeric mechanics, and implementation-specific choice structures over copying descriptive SRD prose. When an option requires a nested rule choice, model that choice explicitly before declaring the option fully supported.
