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
Character Forge adapter: `0.5.0`

## Purpose

Inventory every equipment `itemId` that the current D&D Level 1 generation paths can emit and separate Character Forge semantic IDs from pinned Foundry Item semantics before broadening export coverage.

This is an adapter audit, not a new canonical equipment model. Character Forge native D&D state remains authoritative.

## Implemented Coverage

Adapter `0.5.0` currently maps:

### Weapons

- `greatsword` -> Foundry `weapon`
- `flail` -> Foundry `weapon`
- `javelin` -> Foundry `weapon`, including stack quantity

### Armor and shield

- `chain-mail` -> Foundry `equipment`
- `chain-shirt` -> Foundry `equipment`, medium armor, base item `chainshirt`
- `shield` -> Foundry `equipment`, shield, base item `shield`
- `leather-armor` -> Foundry `equipment`, light armor, base item `leather`
- `studded-leather-armor` -> Foundry `equipment`, light armor, base item `studded`

The four breadth mappings use exact pinned D&D5e 6.0 price, weight, armor, Dex-cap, category, and base-item fields. They remain unequipped because item identity alone does not prove equipped state. Actor AC remains the authoritative Character Forge flat value even when mapped armor/shield Items are present.

### Ammunition

- `arrow` -> Foundry `consumable`
  - explicit Character Forge source ID `arrow`
  - explicit Foundry target identifier `arrows`
  - target type `ammo`, subtype `arrow`
  - Character Forge quantity preserved

### Containers

- `dungeoneers-pack`
- `quiver`
- `explorers-pack`
- `entertainers-pack`
- `priests-pack`
- `burglars-pack`
- `scholars-pack`
- `pouch`

Container mapping uses the live D&D5e 6.0 model shape after fixture migration:

- weight-capacity containers use `capacity.weight.value/units`;
- `quiver` uses `capacity.count = 20`;
- Foundry containers have target quantity max 1, so an unsupported native multi-container stack is deferred rather than silently collapsed.

All mapped Items use deterministic embedded IDs, empty descriptions, no copied compendium prose, no Foundry advancement replay, and no copied attack/activity automation.

Unknown equipment IDs are reported as deferred mappings rather than silently dropped or fabricated as generic loot.

## Emitted Character Forge Equipment Space

The current Level 1 generator has 48 literal equipment IDs plus 27 possible dynamic prefixed tool/instrument IDs, for 75 possible distinct Character Forge equipment IDs.

### Weapons

Implemented:

- `greatsword`
- `flail`
- `javelin`

Next bounded simple-weapon targets:

- `dagger`
- `quarterstaff`
- `spear`
- `shortbow`
- `handaxe`
- `mace`
- `sickle`

Still deferred martial weapons:

- `scimitar`
- `shortsword`
- `longbow`
- `greataxe`
- `longsword`

Do not infer weapon activities from Character Forge IDs. Activities are a separate Foundry automation layer.

### Armor and Shield Equipment

All currently emitted armor/shield IDs are implemented:

- `chain-mail`
- `chain-shirt`
- `shield`
- `leather-armor`
- `studded-leather-armor`

Actor AC remains flat and authoritative; equipment presence does not trigger Foundry AC recalculation in the adapter yet.

### Consumables / Ammunition

- `arrow` - implemented with explicit translation to Foundry identifier `arrows`.
- `healers-kit` - deferred; Foundry target is `consumable`, but its activity remains outside the equipment-data proof.

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

Container contents are not inferred from the Character Forge pack ID. No nested inventory is manufactured from Foundry compendium descriptions.

### Direct Tool Concepts

Pinned Foundry evidence establishes `calligraphers-supplies` as a `tool`. These remain deferred pending an explicit tool translation slice:

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
- `holy-symbol` - pinned Foundry 2024 data uses a `loot` target such as `holy-symbol-varies`; do not assume identifier equality.

### Simple Gear Still Requiring Exact Target Fixture Review

- `parchment-sheet`
- `robe`
- `crowbar`
- `travelers-clothes`
- `spellbook`

## Source Paths Audited

Character Forge:

- `packages/system-dnd5e/src/guidedFirstSlice.ts`
- `packages/system-dnd5e/src/guidedChoices.ts`
- `packages/system-dnd5e/src/firstSliceCharacter.ts`
- `packages/foundry-adapter/src/dnd5eEquipmentItems.ts`

Pinned Foundry D&D5e 6.0 schema/examples:

- `module/data/item/weapon.mjs`
- `module/data/item/equipment.mjs`
- `module/data/item/consumable.mjs`
- `module/data/item/container.mjs`
- `module/data/item/templates/physical-item.mjs`
- `module/data/item/templates/identifiable.mjs`
- `module/data/item/templates/equippable-item.mjs`
- `module/data/shared/damage-field.mjs`
- `packs/_source/equipment24/armor/heavy/chain-mail.yml`
- `packs/_source/equipment24/armor/medium/chain-shirt.yml`
- `packs/_source/equipment24/armor/shield.yml`
- `packs/_source/equipment24/armor/light/leather-armor.yml`
- `packs/_source/equipment24/armor/light/studded-leather-armor.yml`
- `packs/_source/equipment24/weapons/martial-melee/greatsword.yml`
- `packs/_source/equipment24/weapons/martial-melee/flail.yml`
- `packs/_source/equipment24/weapons/simple-melee/javelin.yml`
- `packs/_source/equipment24/adventuring-gear/ammunition/arrows.yml`
- `packs/_source/equipment24/adventuring-gear/dungeoneers-pack/_container.yml`
- `packs/_source/equipment24/adventuring-gear/explorers-pack/_container.yml`
- `packs/_source/equipment24/adventuring-gear/entertainers-pack/_container.yml`
- `packs/_source/equipment24/adventuring-gear/priests-pack/_container.yml`
- `packs/_source/equipment24/adventuring-gear/burglars-pack/_container.yml`
- `packs/_source/equipment24/adventuring-gear/scholars-pack/_container.yml`
- `packs/_source/equipment24/adventuring-gear/quiver/_container.yml`
- `packs/_source/equipment24/adventuring-gear/pouch/_container.yml`
- `packs/_source/equipment24/adventuring-gear/healers-kit.yml`
- `packs/_source/equipment24/tools/artisan/calligraphers-supplies.yml`
- `packs/_source/equipment24/adventuring-gear/spellcasting-focuses/holy-symbol-varies.yml`

## Recommended Next Slice

Expand the simple-weapon seam only:

1. inspect and map exact pinned fixtures for `dagger`, `quarterstaff`, `spear`, `shortbow`, `handaxe`, `mace`, and `sickle`;
2. preserve native quantity, deterministic IDs, and explicit source provenance;
3. keep descriptions and activities empty;
4. do not infer equipped state or ammunition/container linkage;
5. keep the remaining martial weapons and all non-weapon gaps explicit and deferred.

Do not combine this with martial-weapon breadth, tool/focus alias translation, feature/activity Items, spell Items, media packaging, a Download UI, or real Foundry runtime acceptance.
