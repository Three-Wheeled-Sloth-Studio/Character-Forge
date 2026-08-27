# D&D 5E Spell-State Boundary Watch

Date: 2026-08-27
Status: next architecture seam

## Why this seam is next

The guided Level 1 creator now supports every SRD 5.2.1 option that can be represented faithfully without a general spell/native-state model:

- classes: Barbarian, Fighter, Monk, Rogue;
- backgrounds: Criminal, Soldier;
- species: Dragonborn, Dwarf, Goliath, Halfling, Human, Orc.

The remaining catalog is dominated by choices that grant or require spells:

- Acolyte and Sage require Magic Initiate spell choices;
- Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, and Wizard require Level 1 spell or pact-magic state;
- Elf, Gnome, and Tiefling lineages include spell-granting choices or spellcasting-ability decisions.

The next breadth increment should therefore establish one faithful D&D-owned spell-state seam and use it to unlock real consumers incrementally.

## Minimum useful contract

Do not model every future spellcasting rule at once. The first contract should be only rich enough to support actual Level 1 creation decisions and retained native state.

Likely minimum concepts:

- spell identifier from the licensed SRD source;
- source/grant provenance, such as class, Origin feat, or species lineage;
- spell level / cantrip distinction;
- selected spellcasting ability where the source rule requires a choice;
- known/prepared/always-prepared relationship where mechanically relevant;
- spell slots or pact slots when a class owns them;
- repeatable spell-choice menus with the standard sticky acceptable-pool / direct / random-from-checked affordance;
- validation that selections are legal for the granting source;
- retained decisions/provenance sufficient to explain how the spell entered the character.

## Guardrails

- Spell state is D&D-native and belongs in `system-dnd5e`; do not promote D&D spell structures into the universal CharacterDocument contract.
- CharacterDocument continues to retain the D&D native payload losslessly.
- Parchment remains unaware of D&D spell mechanics.
- Do not use spell names as unversioned free text when an SRD source identifier can be retained.
- Do not silently choose spells merely to enable a catalog option. If Quick Generate later chooses spells automatically, it must do so through ordinary generation decisions and provenance.
- Support only legally redistributable SRD 5.2.1 spell data in the public repository.
- Build the smallest consumer-first slice first, then expand from evidence.

## Suggested unlock order

A useful sequence is:

1. Magic Initiate grant state, because it unlocks Acolyte/Sage and exercises cantrip + Level 1 spell selection without first requiring a complete class spellcasting subsystem.
2. One straightforward prepared/known Level 1 spellcasting class to prove class-owned spell state.
3. Reuse the seam across the remaining classes.
4. Enable Elf/Gnome/Tiefling lineage spell choices once the same grant model is proven.

The exact class order should be chosen from implementation simplicity and architectural value, not player popularity alone.
