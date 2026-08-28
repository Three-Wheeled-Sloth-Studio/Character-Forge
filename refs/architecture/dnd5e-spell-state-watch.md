# D&D 5E Spell-State Boundary Watch

Date: 2026-08-27
Status: independent spell grants and first class-owned spellcasting seam proven

## Current support

Guided generation now includes:

- classes: Barbarian, Cleric, Fighter, Monk, Rogue;
- backgrounds: Acolyte, Criminal, Sage, Soldier;
- species: Dragonborn, Dwarf, Goliath, Halfling, Human, Orc.

Automated-green Cleric checkpoint:

- `80769e8854f4b9ee80e6fffa9e497115df5fda58`
- Actions `33128723547`
- 17 test files / 77 tests / 0 failures

## Two source concepts are now proven

### Independent spell grants: `spells.grants[]`

Current Magic Initiate consumers prove spell capability granted independently of class casting. Each grant retains:

- grant/source identity;
- spell-list identity;
- selected casting ability;
- cantrip IDs;
- prepared / always-prepared Level 1 spell;
- one free-cast resource;
- recharge cadence.

Current consumers:

- Acolyte -> Magic Initiate (Cleric)
- Sage -> Magic Initiate (Wizard)

### Class-owned spellcasting: `spells.classCasting[]`

Cleric proves the first standard-slot class capability. A class-casting entry retains:

- source class and feature identity;
- spell-list identity;
- class casting ability;
- class cantrips;
- prepared spell state;
- always-prepared spell state where applicable;
- spell-slot pools with level/current/maximum/recharge;
- preparation-change cadence;
- class spellcasting focus capability.

The common structure is intentionally small. It is evidence from one real class, not a declaration that every class must fit the same shape.

## Cleric-specific source state

Cleric also demonstrates that class spellcasting alone is not enough to model the class. `Dnd5eClassState` retains the Level 1 Divine Order consequence:

- `divineOrderId`;
- Protector weapon and armor training;
- Thaumaturge knowledge bonus;
- Holy Symbol focus capability.

Protector and Thaumaturge can therefore be validated from retained native state without consulting generation provenance.

Thaumaturge changes the class cantrip count from 3 to 4. This is validated against the selected Divine Order rather than represented as an unexplained extra cantrip.

## Composition rule

A character may have both class spellcasting and one or more independent spell grants. These coexist; neither overwrites or reconstructs the other.

This is now tested with Cleric + Acolyte:

- Cleric class spellcasting appears in `spells.classCasting[]`;
- Acolyte Magic Initiate (Cleric) appears separately in `spells.grants[]`;
- both may reference the Cleric list while preserving distinct source identity and resource rules.

Generation provenance explains how choices were made but is not required to reconstruct capability.

## Independent validation

Current adapter validation checks, among other things:

- legal source/list identity;
- legal cantrip counts and source lists;
- legal prepared Level 1 spell counts/lists;
- fixed Cleric Wisdom casting ability;
- Level 1 Cleric slot pool: 2/2 Level 1, Long Rest recharge;
- preparation cadence;
- Holy Symbol focus;
- Protector versus Thaumaturge native consequences;
- Magic Initiate free-cast state separately from class slots.

Tampering tests prove that a retained Cleric with an altered slot maximum or casting ability is rejected.

## Compatibility rule

The retained `dnd5e-character/0.2` validator is intentionally isolated from the expanding current guided class union. A new class becoming supported in `0.3` must not silently become valid in a historical schema version.

## What this does not prove yet

Do not treat Cleric as proof that all magical classes fit one flattened structure.

Still source-specific or unproven:

- known-spell versus prepared-spell classes;
- Wizard spellbook contents and preparation relationship;
- Warlock Pact Magic slots;
- class-specific recovery or replacement rules;
- future domain/subclass spell grants;
- Druid Primal Order and Druid spell catalog;
- other class-owned Level 1 resources such as Bardic Inspiration or Innate Sorcery.

Prefer common primitives plus explicit source-owned extensions when the rules genuinely differ.

## Remaining species consumers

Elf, Gnome, and Tiefling still require lineage/legacy state. Their spell-granting features should reuse `spells.grants[]` when mechanically accurate while retaining:

- lineage/legacy selection;
- casting-ability choice where required;
- Level 1 active effects;
- future level-gated grants without pretending future spells are already active.

## Human Magic Initiate boundary

Human-selected Magic Initiate remains disabled because the general feat includes the Druid spell list. Add the complete relevant list/choice surface before marking it supported.

## Suggested next evidence

Choose the next consumer for what it teaches:

1. another standard-slot class to test reuse of `classCasting[]`;
2. a known-spell class to test whether known/prepared state needs an explicit distinction;
3. Elf/Gnome/Tiefling to test species-grant reuse;
4. Druid-list Magic Initiate to complete the general Origin-feat choice.

Wizard and Warlock should be delayed until their distinctive spellbook/Pact Magic state can be modeled explicitly rather than squeezed into Cleric semantics.

## Guardrails

- Spell state is D&D-native and belongs in `system-dnd5e`.
- CharacterDocument retains the native payload losslessly; Parchment remains unaware of D&D spell mechanics.
- Retained native state is authoritative; generation provenance explains history.
- Do not silently choose spells merely to enable catalog entries.
- Quick/random generation must use the same ordinary choice contracts and provenance as guided generation.
- Support only legally redistributable SRD 5.2.1 / CC-BY-4.0 material in the public repository.
- Expand contracts from real consumers rather than prebuilding every future spellcasting rule.
