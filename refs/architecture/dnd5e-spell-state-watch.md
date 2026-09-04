---
type: "Architecture Reference"
title: "D&D 5E Spell-State Boundary Watch"
tags:
- character-forge
- architecture
---
# D&D 5E Spell-State Boundary Watch

Date: 2026-09-03
Status: independent spell grants, standard class spellcasting, spellbook state, and source-specific Level 1 class extensions proven; Pact Magic remains separate

## Current support

Guided generation now includes:

- classes: Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Wizard;
- backgrounds: Acolyte, Criminal, Sage, Soldier;
- species: Dragonborn, Dwarf, Goliath, Halfling, Human, Orc.

Current automated-green code checkpoint:

- `e5863b9007d2fdac9f6bb053225c2587321821e3`
- Actions `33820208614`
- job `100861054551`
- 22 test files / 97 tests / 0 failures
- adapter `0.12.0`

## Source concept 1: independent spell grants

`spells.grants[]` represents spell capability granted independently of class spellcasting.

Current Magic Initiate consumers:

- Acolyte -> Magic Initiate (Cleric)
- Sage -> Magic Initiate (Wizard)

Each grant retains:

- source/grant identity;
- spell-list identity;
- selected casting ability;
- cantrip IDs;
- prepared / always-prepared Level 1 spell;
- free-cast resource;
- recharge cadence.

This state coexists with class spellcasting and is not reconstructed from it.

## Source concept 2: standard class spellcasting

`spells.classCasting[]` now has seven real Level 1 consumers:

- Bard
- Cleric
- Druid
- Paladin
- Ranger
- Sorcerer
- Wizard

The common record can retain:

- source class and feature identity;
- spell-list identity;
- class casting ability;
- cantrips;
- ordinary prepared/selected Level 1 spells;
- always-prepared class spells;
- spell-slot level/current/maximum/recharge;
- preparation/replacement cadence;
- spellcasting focus capability;
- optional source-owned spellbook contents.

This is now evidence from several distinct classes, not a Cleric-only hypothesis. It is still not a declaration that Pact Magic must fit it.

## Source-specific state remains explicit

Common spell primitives do not replace class mechanics.

### Cleric

Retains Divine Order and its consequences:

- Protector training;
- Thaumaturge knowledge bonus;
- Divine Order-dependent cantrip count.

### Druid

Retains Primal Order and Druidic state:

- Warden training;
- Magician knowledge bonus;
- Druidic language;
- Herbalism Kit proficiency;
- `Speak with Animals` always prepared through Druidic.

`Speak with Animals` is excluded from the four ordinary prepared-spell selections. The adapter validates both sides of that distinction.

### Bard

Retains:

- Bardic Inspiration resource state;
- three explicit musical-instrument proficiencies;
- selected instruments as Bard spellcasting foci.

### Paladin

Retains:

- Lay on Hands 5-point pool;
- Martial/Simple Weapon training;
- Light/Medium/Heavy Armor + Shield training;
- two Weapon Mastery choices.

### Ranger

Retains:

- Favored Enemy resource state;
- `Hunter's Mark` always prepared separately from the two ordinary prepared spells;
- two free Favored Enemy uses;
- Martial/Simple Weapon and Light/Medium Armor + Shield training;
- two Weapon Mastery choices.

### Sorcerer

Retains Innate Sorcery 2-use resource state separately from ordinary spell slots.

### Wizard

Wizard proves that a standard-slot caster can still require a source-owned preparation substrate:

- six retained Level 1 spellbook spells;
- four prepared spells constrained to that spellbook subset;
- Arcane Recovery resource state;
- Arcane Focus + spellbook capability.

The adapter rejects a retained Wizard whose prepared spells are not contained in the retained spellbook.

## Composition rule

A character may have both class spellcasting and one or more independent spell grants. These coexist; neither overwrites or reconstructs the other.

Examples already covered by the architecture/tests include class casters combined with Acolyte or Sage Magic Initiate. Two capabilities may even reference the same source spell list while retaining different source identity and resource rules.

Generation provenance explains how choices were made but is not required to reconstruct capability.

## Independent validation

Current adapter validation checks, among other things:

- source/list identity;
- legal cantrip counts and source lists;
- legal ordinary prepared-spell counts/lists;
- always-prepared spell distinctions;
- fixed class casting abilities;
- Level 1 slot pools and Long Rest recharge for the standard-slot consumers;
- preparation/replacement cadence;
- class focus capability;
- Wizard spellbook contents and prepared subset relationship;
- class-specific training/resource state;
- Magic Initiate free-cast state separately from class slots.

Retained-state tampering tests cover class spell state, spellbook/subset behavior, Druid/Ranger always-prepared distinctions, and class-specific consequences.

## Compatibility rule

The retained `dnd5e-character/0.2` validator remains intentionally isolated from the expanding current guided class union. A new class becoming supported in `0.3` does not silently become valid in a historical schema version.

## Source concept 3 still unproven: Pact Magic

Warlock is intentionally the sole unsupported SRD class after the current batch.

Do not encode Warlock by merely changing `recharge` on an otherwise ordinary standard-slot entry unless the complete rule audit proves that representation retains the important semantics. The Warlock slice must explicitly account for:

- Pact Magic slot count and slot level;
- Short Rest recharge;
- cantrip and spell choices;
- Eldritch Invocation choices at Level 1;
- invocation-created spells/capabilities and prerequisites;
- future slot-level scaling without pretending Pact Magic is a standard caster table.

A dedicated Pact Magic structure or an explicit casting-mode contract should be chosen from the actual Warlock rules and validation needs.

## Remaining species consumers

Elf, Gnome, and Tiefling still require lineage/legacy state. Their spell-granting features should reuse `spells.grants[]` when mechanically accurate while retaining:

- lineage/legacy selection;
- casting-ability choice where required;
- Level 1 active effects;
- future level-gated grants without pretending future spells are already active.

## Human Magic Initiate boundary

The Druid spell catalog now exists as a real consumer. Human-selected Magic Initiate nevertheless remains disabled until the Human Versatile path explicitly retains the selected spell list, casting ability, cantrips, Level 1 spell, free-cast state, and provenance rather than borrowing the background-only Magic Initiate fixture.

## Suggested next evidence

After owner batch QA, the highest-value remaining spell-state evidence is:

1. Warlock Pact Magic + Eldritch Invocation state;
2. Elf/Gnome/Tiefling lineage/legacy grants;
3. Human-selected general Magic Initiate.

Choose based on concrete QA evidence and architecture value, not merely catalog completion percentage.

## Guardrails

- Spell state is D&D-native and belongs in `system-dnd5e`.
- CharacterDocument retains the native payload losslessly; Parchment remains unaware of D&D spell mechanics.
- Retained native state is authoritative; generation provenance explains history.
- Do not silently choose spells merely to enable catalog entries.
- Quick/random generation must use the same ordinary choice contracts and provenance as guided generation.
- Use common primitives only where source mechanics really align.
- Keep Pact Magic distinct if its source rules require a distinct contract.
- Support only legally redistributable SRD 5.2.1 / CC-BY-4.0 material in the public repository.
- Expand contracts from real consumers rather than prebuilding every future spellcasting rule.
