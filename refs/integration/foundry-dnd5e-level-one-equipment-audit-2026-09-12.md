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
Character Forge adapter: `0.15.0`

## Purpose

Inventory every equipment `itemId` that the current D&D Level 1 generation paths can emit and separate Character Forge semantic IDs from pinned Foundry Item semantics before broadening export coverage.

This is an adapter audit, not a new canonical equipment model. Character Forge native D&D state remains authoritative.

## Implemented Coverage

Adapter `0.15.0` currently maps:

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

- `healers-kit` - pinned 2024 target is a `consumable` with ten durable uses plus a separate Stabilize activity. The next bounded slice should preserve the ten-use state while keeping the activity deferred.

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

Implemented through an explicit whitelist:

- `druidic-focus:quarterstaff` -> pinned weapon target `wooden-staff`
- `druidic-focus:sprig-of-mistletoe` -> pinned equipment target `sprig-of-mistletoe`
- `arcane-focus:crystal` -> pinned equipment target `crystal`
- `arcane-focus:orb` -> pinned equipment target `orb`
- `arcane-focus:quarterstaff` -> pinned weapon target `staff`

The two Character Forge `*:quarterstaff` aliases deliberately resolve to different Foundry target identifiers. Source compound IDs remain intact for deterministic IDs and provenance. Descriptions and activities remain empty.

### Generic Holy Symbol

Implemented:

- `holy-symbol` -> pinned generic Foundry `loot` target `holy-symbol-varies`

The adapter preserves zero price/weight, gear type, blank subtype, empty properties, native quantity, deterministic source-ID-based embedded IDs, and `holy-symbol` provenance. It intentionally does not select amulet, emblem, or reliquary because Character Forge does not carry that form choice.

### Gaming Set

Implemented:

- `gaming-set:dice` -> pinned Foundry `tool` target `dice`

The adapter preserves `1 sp` price, zero weight, tool type `game`, base item `dice`, Wisdom ability, null proficiency, empty properties/bonus, native quantity, deterministic compound-source-ID-based embedded IDs, and source provenance. Descriptions and activities remain empty; the pinned Catch Cheating and Play to Win checks are intentionally not replayed.

### Book Semantic Aliases

Implemented:

- `book:prayers` -> Foundry identifier `book`, display name `Prayer Book`
- `book:history` -> Foundry identifier `book`, display name `History Book`
- `book:occult-lore` -> Foundry identifier `book`, display name `Occult Lore Book`

All three preserve the pinned generic 2024 Book physical/static fields while retaining Character Forge source semantics through distinct display names, deterministic source-ID-based embedded IDs, and full source provenance. Descriptions remain empty and the generic Book's +5 Intelligence-check rules text is not copied or automated.

### Literal Simple Gear With Confirmed 2024 Targets

Implemented:

- `parchment-sheet` -> 2024 `parchment` loot target
- `robe` -> 2024 `robe` equipment target
- `crowbar` -> 2024 `crowbar` loot target

All three preserve exact pinned static target fields, native quantity, deterministic source-ID-based embedded IDs, and Character Forge source provenance. Descriptions remain empty; the Crowbar Advantage rule and other compendium prose are not copied or automated.

### Literal Gear Requiring Rules-Version Decision

Deferred pending an explicit cross-rules-version adapter policy:

- `travelers-clothes` -> pinned 6.0.x tree currently exposes only a 2014 equipment fixture
- `spellbook` -> pinned 6.0.x tree currently exposes only a 2014 loot fixture

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
- pinned spellcasting-focus fixtures under `packs/_source/equipment24/adventuring-gear/spellcasting-focuses/`, including arcane `crystal`, `orb`, `staff`, druidic `sprig-of-mistletoe`, `wooden-staff`, and generic `holy-symbol-varies`
- pinned `packs/_source/equipment24/tools/other/gaming-set/dice.yml`
- pinned generic `packs/_source/equipment24/adventuring-gear/book.yml`
- pinned 2024 simple gear fixtures:
  - `packs/_source/equipment24/adventuring-gear/parchment.yml`
  - `packs/_source/equipment24/adventuring-gear/robe.yml`
  - `packs/_source/equipment24/adventuring-gear/crowbar.yml`
  - `packs/_source/equipment24/adventuring-gear/healers-kit.yml`
- pinned legacy-only fixtures currently found for remaining literal gear:
  - `packs/_source/items/loot/spellbook.yml` with `rules: '2014'`
  - `packs/_source/items/equipment/travelers-clothes.yml` with `rules: '2014'`
- prior pinned armor, ammunition, container, and Fighter proof fixtures recorded in repository history.

## Recommended Next Slice

Map only `healers-kit` to the pinned 2024 Foundry consumable target.

1. preserve name `Healer's Kit`, identifier `healers-kit`, `5 gp`, `3 lb`, and unequipped state;
2. preserve ten-use consumable state exactly: max `"10"`, auto-destroy true, spent 0, empty recovery;
3. preserve pinned empty/non-damaging consumable fields: null base number/denomination, empty damage types, custom disabled, scaling number 1, replace false, trinket type, blank subtype, null magical bonus, empty properties;
4. preserve native quantity, deterministic source-ID-based embedded IDs, and Character Forge source provenance;
5. keep description empty;
6. deliberately emit `activities = {}` and do not replay the pinned Stabilize utility activity yet; and
7. keep `spellbook`, `travelers-clothes`, general feature/activity Items, spell Items, media packaging, Download UX, and runtime acceptance deferred.

The pinned D&D5e 6.0.x tree still exposes only 2014-rule fixtures for `spellbook` and `travelers-clothes`; do not map them until the cross-rules-version adapter policy is explicit.
