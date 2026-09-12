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
Character Forge adapter: `0.7.0`

## Purpose

Inventory every equipment `itemId` that the current D&D Level 1 generation paths can emit and separate Character Forge semantic IDs from pinned Foundry Item semantics before broadening export coverage.

This is an adapter audit, not a new canonical equipment model. Character Forge native D&D state remains authoritative.

## Implemented Coverage

Adapter `0.7.0` currently maps:

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

Remaining martial-weapon breadth:

- `scimitar`
- `shortsword`
- `longbow`
- `greataxe`
- `longsword`

All currently emitted weapon IDs now have pinned mappings.

All weapon mappings preserve deterministic embedded IDs, native quantity, pinned price/weight, base damage, weapon category/base item, properties, mastery, and range. Activities remain empty.

`shortbow` and `longbow` preserve the pinned static `ammunition.type = "arrow"` filter without inventing a relationship to an Arrows Item. Quarterstaff, spear, and longsword preserve the accepted bounded versatile marker shape without inventing alternate-damage automation.

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

Pinned Foundry evidence establishes tool-family targets, but these remain deferred pending the next explicit tool translation slice:

- `calligraphers-supplies`
- `thieves-tools`
- `herbalism-kit`

These are the preferred next bounded category because they are literal Character Forge IDs and can prove the tool Item model before dynamic prefix decomposition is introduced.

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

The Character Forge prefix carries semantic context and is not assumed to be part of the Foundry identifier. These require explicit translation and remain outside the direct-tool slice.

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
- `packs/_source/equipment24/weapons/martial-melee/scimitar.yml`
- `packs/_source/equipment24/weapons/martial-melee/shortsword.yml`
- `packs/_source/equipment24/weapons/martial-ranged/longbow.yml`
- `packs/_source/equipment24/weapons/martial-melee/greataxe.yml`
- `packs/_source/equipment24/weapons/martial-melee/longsword.yml`
- prior pinned armor, ammunition, container, and Fighter proof fixtures recorded in repository history.

## Recommended Next Slice

Validate and map only the three direct tool concepts:

1. inspect the exact pinned Foundry D&D5e 6.0 schema/fixtures for `calligraphers-supplies`, `thieves-tools`, and `herbalism-kit`;
2. confirm exact target identifiers and the static tool Item fields needed for lossless adapter output;
3. retain deterministic IDs, native quantity, and explicit Character Forge source provenance;
4. keep descriptions and activities empty unless a pinned static tool-model field requires otherwise;
5. do not infer proficiency, equipped state, container relationships, or dynamic semantic aliases; and
6. keep `artisan-tools:*`, `musical-instrument:*`, focus aliases, healer's-kit activity semantics, feature/activity Items, spell Items, media packaging, Download UX, and runtime acceptance deferred.

This slice is intentionally narrower than dynamic tool/instrument translation. It first proves the direct literal-ID tool family with minimal semantic ambiguity.
