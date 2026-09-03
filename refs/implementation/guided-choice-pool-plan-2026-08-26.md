---
type: "Implementation Reference"
title: "Guided Choice Pool Plan"
tags:
- character-forge
- implementation
---
# Guided Choice Pool Plan

Date: 2026-08-26
Status: implementation slice

## Product direction

Use the official SRD 5.2.1 character-creation order as the default guided D&D flow: choose class, determine origin, then determine ability scores.

Whenever the player is presented with a menu of acceptable mechanical options, support a reusable choice-pool pattern:

- the player may choose one option directly;
- the player may check multiple acceptable options and ask Character Forge to choose randomly from that pool;
- the acceptable-option pool is user-sticky across browser sessions;
- the per-character selected result and whether it was direct or random belong in generation provenance;
- sticky UI preference state is not authoritative character state.

The first concrete use is class and species selection.

## Licensing boundary

SRD 5.2.1 contains twelve classes and nine species under CC-BY-4.0. The public repository may catalog those SRD options, but should enable generation only where Character Forge currently models enough native state to validate the result faithfully.

Initial mechanically supported guided choices:

Classes:
- Barbarian
- Fighter
- Monk
- Rogue

Species:
- Dwarf
- Halfling
- Human
- Orc

Remaining SRD classes and species stay visible in the D&D catalog but are not yet enabled in guided generation. Spellcasting classes require a real spell/native-state seam. Dragonborn, Elf, Gnome, Goliath, and Tiefling require nested species choices before they should be enabled rather than silently inventing those choices.

## Scope

- Add SRD class/species catalogs with support metadata.
- Add reusable sticky acceptable-option state helpers in the web app.
- Add guided Standard Array generation using class -> fixed Soldier background -> species -> ability assignment.
- Preserve current Quick/Standard/Manual/Point Cost/Random forms as regression surfaces.
- Add a schema-compatible guided native-state builder for the four initial classes/species.
- Preserve old `dnd5e-character/0.1` reopen support while emitting `dnd5e-character/0.2` for guided characters.
- Record acceptable pools, selection mode, chosen class/species, and ordinary ability decisions in provenance.

## Out of scope

- Opening all four SRD backgrounds.
- Spell preparation/casting state.
- Nested species subchoices.
- Subclasses.
- Replacing all existing generation forms with the guided flow in one step.
