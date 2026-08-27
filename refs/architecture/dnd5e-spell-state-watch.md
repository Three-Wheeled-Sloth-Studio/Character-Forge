# D&D 5E Spell-State Boundary Watch

Date: 2026-08-27
Status: Magic Initiate grant seam proven; class spellcasting seam next

## Current state

The first D&D-owned spell-state consumer is now implemented and automated-green.

Guided support currently includes:

- classes: Barbarian, Fighter, Monk, Rogue;
- backgrounds: Acolyte, Criminal, Sage, Soldier;
- species: Dragonborn, Dwarf, Goliath, Halfling, Human, Orc.

Acolyte and Sage prove the first reusable spell primitive without pretending class spellcasting already exists:

- Acolyte grants Magic Initiate from the Cleric list;
- Sage grants Magic Initiate from the Wizard list;
- casting ability, two cantrips, and one Level 1 spell are explicit choices;
- the Level 1 spell is retained as always prepared with one free cast per Long Rest;
- generation provenance retains how the choices were made;
- the adapter independently reconstructs and validates the retained grant.

Code checkpoint:

- `523bc579065d81d2e144421ee080c1511a988a1a`
- Actions `33115103317`
- 16 test files / 72 tests / 0 failures

## Proven grant contract

`Dnd5eSpellGrantState` is source-owned spell capability for feats, species features, or similar grants. It retains:

- grant identity;
- granting source identity;
- spell-list identity;
- selected spellcasting ability;
- cantrip IDs;
- prepared spell IDs;
- always-prepared spell IDs;
- free-cast spell identity;
- free-cast maximum/current uses;
- recharge cadence.

The contract is deliberately not a generic class spellcasting bucket.

## Next architecture seam: Level 1 class spellcasting

The remaining class catalog requires source-owned class spellcasting state. The next implementation should determine the smallest reusable Level 1 contract that composes with `spells.grants[]` while preserving class distinctions.

Likely common concepts include:

- spellcasting source/class identity;
- casting ability;
- cantrips known where applicable;
- known versus prepared spell relationships;
- slot maximum/current state for classes that use standard slots;
- preparation or known-spell limits;
- reset/recharge semantics;
- class-specific source collections such as a Wizard spellbook only where the class actually owns one;
- independent reconstruction/validation of legal state.

Do not force Pact Magic or other genuinely different class mechanics into a flattened standard-slot model merely for schema uniformity. Prefer reusable primitives with explicit source-specific state.

## Composition rule

A character may have both class spellcasting and one or more independent spell grants. These must coexist rather than overwrite each other.

For example, a future Cleric with Sage background should retain:

- Cleric class spellcasting as class-owned state;
- Sage Magic Initiate (Wizard) as a separate grant;
- each source's casting ability, prepared/known relationships, uses, and provenance independently.

Do not infer one source's capability from the other.

## Human Magic Initiate boundary

Human-selected Magic Initiate remains intentionally disabled. The general feat permits a Druid-list choice in addition to Cleric and Wizard, while the currently licensed spell catalog slice only contains the Cleric/Wizard lists needed by Acolyte and Sage.

Do not mark Human Magic Initiate supported until the complete relevant choice surface is represented.

## Remaining species consumers

Elf, Gnome, and Tiefling still require lineage/legacy state. Their spell-granting features should reuse the grant primitive where that is mechanically accurate, while preserving:

- lineage/legacy selection;
- spellcasting-ability choice where required;
- Level 1 active effects;
- future level-gated spell grants without pretending those future spells are already active.

## Guardrails

- Spell state is D&D-native and belongs in `system-dnd5e`; do not put D&D spell structures in universal CharacterDocument contracts.
- CharacterDocument retains the native payload losslessly.
- Parchment remains unaware of D&D spell mechanics.
- Retained native state is authoritative; generation provenance explains history but is not needed to reconstruct capability.
- Do not use unversioned free-text spell names when versioned SRD spell IDs are available.
- Do not silently choose spells merely to enable a catalog option.
- Quick/random generation must use the same ordinary choice contracts and provenance as guided generation.
- Support only legally redistributable SRD 5.2.1 / CC-BY-4.0 material in the public repository.
- Build consumer-first slices and expand the contract from evidence rather than prebuilding every future spellcasting rule.

## Suggested unlock order

1. One faithful Level 1 class-spellcasting vertical slice.
2. Reuse/refine the class primitives across additional spellcasting classes.
3. Enable Elf/Gnome/Tiefling lineage spell choices using the proven grant model where appropriate.
4. Add the Druid Magic Initiate list before enabling Human-selected Magic Initiate.

Choose the first class for architectural clarity and reusable value, not player popularity or catalog order.
