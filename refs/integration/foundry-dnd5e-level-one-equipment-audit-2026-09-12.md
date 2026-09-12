---
type: "Integration Audit"
title: "Foundry D&D5e Level 1 Equipment Mapping Audit"
tags:
- character-forge
- foundry
- dnd5e
- stage-5
- equipment
---
# Foundry D&D5e Level 1 Equipment Mapping Audit

Date: 2026-09-12
Target: Foundry VTT `14.367` + D&D5e `6.0.0`
Character Forge adapter: `0.6.0`

## Purpose

Inventory every equipment `itemId` that the current D&D Level 1 generation paths can emit and separate Character Forge semantic IDs from pinned Foundry Item semantics before broadening export coverage.

This is an adapter audit, not a new canonical equipment model. Character Forge native D&D state remains authoritative.

## Implemented Coverage

Adapter `0.6.0` currently maps:

### Weapons

Initial proof:

- `greatsword`
- `flail`
- `javelin`

Simple-weapon breadth:

- `dagger`
- `quarterstaff`
- `spear`
- `shortbow`
- `handaxe`
- `mace`
- `sickle`

All weapon mappings preserve deterministic embedded IDs, native quantity, pinned price/weight, base damage, weapon category/base item, properties, mastery, and range. Activities remain empty.

`shortbow` preserves the pinned static `ammunition.type = "arrow"` filter without inventing a relationship to an Arrows Item. Quarterstaff and spear preserve the pinned versatile marker shape without inventing alternate-damage automation.

Remaining emitted martial weapon gap:

- `scimitar`
- `shortsword`
- `longbow`
- `greataxe`
- `longsword`

### Armor and Shield Equipment

Implemented:

- `chain-mail`
- `chain-shirt`
- `shield`
- `leather-armor`
- `studded-leather-armor`

All armor/shield Items use the pinned target category/base-item and armor fields. Newly broadened armor remains unequipped; Actor AC remains flat and authoritative until calculation parity is separately proven.

### Consumables / Ammunition

Implemented:

- `arrow` -> Foundry identifier `arrows`, type `ammo`, subtype `arrow`, native quantity preserved.

Deferred:

- `healers-kit` - Foundry target is `consumable`, but its activity remains outside the equipment-data proof.

### Containers and Packs

All currently emitted mundane container IDs are implemented:

- `dungeoneers-pack`
- `explorers-pack`
- `quiver`
- `entertainers-pack`
- `priests-pack`
- `burglars-pack`
- `scholars-pack`
- `pouch`

Container mapping uses the live D&D5e 6.0 model shape. Pack contents are not inferred, and unsupported multi-container native stacks are deferred rather than silently collapsed.

### Direct Tool Concepts

Pinned Foundry evidence establishes tool-family targets, but these remain deferred pending an explicit tool translation slice:

- `calligraphers-supplies`
- `thieves-tools`
- `herbalism-kit`

### Dynamic Tool and Instrument IDs

Character Forge can emit 17 artisan-tool variants and 10 musical-instrument variants through prefixed semantic IDs.

`artisan-tools:<tool-id>` may use:

- `alchemists-supplies`
- `brewers-supplies`
- `calligraphers-supplies`
- `carpenters-tools`
- `cartographers-tools`
- `cobblers-tools`
- `cooks-utensils`
- `glassblowers-tools`
- `jewelers-tools`
- `leatherworkers-tools`
- `masons-tools`
- `painters-supplies`
- `potters-tools`
- `smiths-tools`
- `tinkers-tools`
- `weavers-tools`
- `woodcarvers-tools`

`musical-instrument:<instrument-id>` may use:

- `bagpipes`
- `drum`
- `dulcimer`
- `flute`
- `horn`
- `lute`
- `lyre`
- `pan-flute`
- `shawm`
- `viol`

The Character Forge prefix carries semantic context and is not assumed to be part of the Foundry identifier. These require explicit translation.

### Compound Focus IDs

These require decomposition/translation and must not be passed through as Foundry identifiers:

- `druidic-focus:quarterstaff`
- `druidic-focus:sprig-of-mistletoe`
- `arcane-focus:crystal`
- `arcane-focus:orb`
- `arcane-focus:quarterstaff`

### Other Semantic Aliases Requiring Explicit Translation

- `gaming-set:dice`
- `book:prayers`
- `book:history`
- `book:occult-lore`
- `holy-symbol` - pinned Foundry 2024 data uses a target such as `holy-symbol-varies`; do not assume identifier equality.

### Simple Gear Still Requiring Exact Target Fixture Review

- `parchment-sheet`
- `robe`
- `crowbar`
- `travelers-clothes`
- `spellbook`

## Emitted Character Forge Equipment Space

The current Level 1 generator has 48 literal equipment IDs plus 27 possible dynamic prefixed tool/instrument IDs, for 75 possible distinct Character Forge equipment IDs.

The adapter intentionally treats these as Character Forge semantic IDs rather than assuming string equality with Foundry identifiers.

## Source Paths Audited

Character Forge:

- `packages/system-dnd5e/src/guidedFirstSlice.ts`
- `packages/system-dnd5e/src/guidedChoices.ts`
- `packages/system-dnd5e/src/firstSliceCharacter.ts`
- `packages/foundry-adapter/src/dnd5eEquipmentItems.ts`

Pinned Foundry D&D5e 6.0 schema/examples now include:

- `module/data/item/weapon.mjs`
- `module/data/item/equipment.mjs`
- `module/data/item/consumable.mjs`
- `module/data/item/container.mjs`
- `packs/_source/equipment24/weapons/simple-melee/dagger.yml`
- `packs/_source/equipment24/weapons/simple-melee/quarterstaff.yml`
- `packs/_source/equipment24/weapons/simple-melee/spear.yml`
- `packs/_source/equipment24/weapons/simple-ranged/shortbow.yml`
- `packs/_source/equipment24/weapons/simple-melee/handaxe.yml`
- `packs/_source/equipment24/weapons/simple-melee/mace.yml`
- `packs/_source/equipment24/weapons/simple-melee/sickle.yml`
- prior pinned armor, ammunition, container, and Fighter proof fixtures recorded in repository history.

## Recommended Next Slice

Expand only the remaining emitted martial weapon breadth:

1. inspect and map exact pinned fixtures for `scimitar`, `shortsword`, `longbow`, `greataxe`, and `longsword`;
2. retain deterministic IDs, native quantity, and explicit source provenance;
3. preserve exact static item data such as ammunition subtype where the target fixture defines it;
4. keep activities, descriptions, and equipped-state inference out of the slice;
5. retain explicit deferred notes for all remaining non-weapon equipment IDs.

Do not combine this with tool/focus alias translation, healer's-kit activity semantics, feature/activity Items, spell Items, media packaging, a Download UI, or real Foundry runtime acceptance.
