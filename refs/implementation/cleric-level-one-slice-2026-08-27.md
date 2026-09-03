---
type: "Implementation Reference"
title: "Cleric Level 1 Guided Slice"
tags:
- character-forge
- implementation
---
# Cleric Level 1 Guided Slice

Date: 2026-08-27
Status: implementation slice

## Goal

Enable Cleric as the first class-owned spellcasting class in guided D&D 5E 2024 creation.

## SRD 5.2.1 Level 1 contract

Cleric Level 1 requires:

- d8 Hit Die;
- Wisdom primary ability;
- Wisdom and Charisma saving throw proficiencies;
- two class skills chosen from History, Insight, Medicine, Persuasion, and Religion;
- Simple weapon proficiency;
- Light/Medium armor and Shield training;
- starting equipment package A (Chain Shirt, Shield, Mace, Holy Symbol, Priest's Pack, 7 GP) or 110 GP;
- Spellcasting with Wisdom;
- three Cleric cantrips;
- four prepared Level 1 Cleric spells;
- two Level 1 spell slots, restored on Long Rest;
- Holy Symbol spellcasting focus;
- Divine Order choice: Protector or Thaumaturge.

Protector adds Martial weapon proficiency and Heavy Armor training.

Thaumaturge adds one additional Cleric cantrip and a bonus to Intelligence (Arcana or Religion) checks equal to Wisdom modifier, minimum +1.

## Architecture

Class spellcasting is distinct from feat/species spell grants.

- `spells.grants[]` remains source-granted independent spell access such as Magic Initiate.
- `spells.classCasting[]` owns class spellcasting capability, cantrips, prepared spells, slot pools, preparation cadence, and focus.
- A Cleric with Acolyte may therefore retain both a Cleric class-casting entry and a separate Magic Initiate (Cleric) grant without either reconstructing the other.

The class-native state must retain Divine Order and its resulting proficiencies/bonus, not merely record the choice in generation provenance.

## UI

Use the established creator workspace and acceptable-option pattern:

- Cleric appears in the main class picker;
- Divine Order is a direct/random-from-checked single choice;
- Cleric cantrips are an N-of-menu choice (3 for Protector, 4 for Thaumaturge);
- prepared Level 1 spells are an N-of-menu choice (4);
- all pools remain sticky preferences but selected results are stored in native state and provenance.

## Validation

Independent adapter validation must reject at least:

- illegal/wrong-count Cleric cantrips;
- illegal/wrong-count prepared spells;
- tampered slot maximum/current/recharge;
- incorrect fixed Wisdom spellcasting ability;
- Divine Order training/bonus mismatches.

Legacy `dnd5e-character/0.1` and `0.2` validation remains isolated and unchanged in meaning.
