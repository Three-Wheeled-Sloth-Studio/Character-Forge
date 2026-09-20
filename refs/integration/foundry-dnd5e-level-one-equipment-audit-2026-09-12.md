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
Character Forge adapter: `0.10.0`

## Purpose

Inventory every equipment `itemId` that the current D&D Level 1 generation paths can emit and separate Character Forge semantic IDs from pinned Foundry Item semantics before broadening export coverage.

This is an adapter audit, not a new canonical equipment model. Character Forge native D&D state remains authoritative.

## Implemented Coverage

Adapter `0.10.0` currently maps:

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

Implemented:

- `calligraphers-supplies` -> Foundry `tool`, type `art`, base item `calligrapher`, ability `dex`
- `thieves-tools` -> Foundry `tool`, blank type value, base item `thief`, ability `dex`
- `herbalism-kit` -> Foundry `tool`, blank type value, base item `herb`, ability `int`

All three preserve exact pinned identifier, price, weight, native quantity, deterministic embedded IDs, and Character Forge source provenance. Descriptions and activities remain empty, and proficiency/container relationships are not inferred.

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

The Character Forge prefix carries semantic context and is not part of the Foundry identifier.

All 17 `artisan-tools:*` variants and all 10 `musical-instrument:*` variants are implemented through explicit whitelists. Their compound Character Forge source IDs remain intact for deterministic IDs and provenance while Foundry receives exact pinned target identifiers and static tool fields.

Musical instruments preserve the pinned `type.value = "music"`, `ability = "cha"`, and the `pan-flute` base-item exception `panflute`.

### Compound Focus IDs

These require explicit decomposition/translation and must not be passed through as Foundry identifiers:

- `druidic-focus:quarterstaff` -> pinned weapon target `wooden-staff`
- `druidic-focus:sprig-of-mistletoe` -> pinned equipment target `sprig-of-mistletoe`
- `arcane-focus:crystal` -> pinned equipment target `crystal`
- `arcane-focus:orb` -> pinned equipment target `orb`
- `arcane-focus:quarterstaff` -> pinned weapon target `staff`

The two Character Forge `*:quarterstaff` aliases deliberately resolve to different Foundry target identifiers and must remain whitelist entries rather than a shared generic transform.

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
- `module/data/item/tool.mjs`
- `packs/_source/equipment24/tools/artisan/calligraphers-supplies.yml`
- `packs/_source/equipment24/tools/other/thieves-tools.yml`
- `packs/_source/equipment24/tools/other/herbalism-kit.yml`
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
- all 17 `packs/_source/equipment24/tools/artisan/*.yml` fixtures corresponding to the emitted artisan suffix set
- all 10 `packs/_source/equipment24/tools/other/musical-instrument/*.yml` fixtures corresponding to the emitted instrument suffix set
- pinned spellcasting-focus fixtures under `packs/_source/equipment24/adventuring-gear/spellcasting-focuses/`, including arcane `crystal`, `orb`, `staff`, and druidic `sprig-of-mistletoe`, `wooden-staff`
- prior pinned armor, ammunition, container, and Fighter proof fixtures recorded in repository history.

## Recommended Next Slice

Translate only the five emitted compound focus IDs.

1. map `arcane-focus:crystal` to pinned equipment target `crystal`;
2. map `arcane-focus:orb` to pinned equipment target `orb`;
3. map `arcane-focus:quarterstaff` to pinned weapon target `staff`;
4. map `druidic-focus:sprig-of-mistletoe` to pinned equipment target `sprig-of-mistletoe`;
5. map `druidic-focus:quarterstaff` to pinned weapon target `wooden-staff`;
6. use an explicit whitelist and preserve the original compound Character Forge source IDs for deterministic IDs and provenance;
7. preserve exact pinned static equipment/weapon fields while keeping descriptions and activities empty; and
8. keep `holy-symbol`, gaming/book aliases, healer's-kit activity semantics, simple gear, feature/activity Items, spell Items, media packaging, Download UX, and runtime acceptance deferred.

This is the next bounded semantic category because the pinned target family is known and it exercises deliberate cross-type aliasing: three equipment targets and two weapon targets.
