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
Character Forge adapter: `0.17.0`

## Purpose

Inventory every equipment `itemId` that the current D&D Level 1 generation paths can emit and separate Character Forge semantic IDs from pinned Foundry Item semantics before broadening export coverage.

This is an adapter audit, not a new canonical equipment model. Character Forge native D&D state remains authoritative.

## Implemented Coverage

Adapter `0.17.0` maps:

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

Implemented:

- `healers-kit` -> pinned 2024 `consumable` target with ten durable uses preserved.

The adapter preserves `5 gp`, `3 lb`, unequipped state, max `"10"`, auto-destroy true, spent 0, empty recovery, non-damaging consumable fields, trinket type, blank subtype, null magical bonus, empty properties, native quantity, deterministic embedded ID, and source provenance. Description and activities remain empty; Stabilize is deliberately not replayed.

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

### Final Literal Gear Targets

Implemented:

- `travelers-clothes` -> direct 2024 equipment target `clothes-travelers`
- `spellbook` -> loot target `spellbook` using legacy Item `LBajgahniRJbAgDr`, explicitly referenced by the pinned 2024 Wizard class

Traveler's Clothes preserves the pinned 2024 static equipment fields. Spellbook uses a deliberately narrow cross-pack exception: the target-package's own 2024 Wizard content references that exact legacy Item UUID. Character Forge export provenance remains 2024-native and no legacy compendium prose or `source.rules = "2014"` state is copied.

## Emitted Character Forge Equipment Space

The current Level 1 generator has 48 literal equipment IDs plus 27 possible dynamic prefixed tool/instrument IDs, for 75 possible distinct Character Forge equipment IDs.

The adapter intentionally treats these as Character Forge semantic IDs rather than assuming string equality with Foundry identifiers.

**Audit status: complete.** Adapter `0.17.0` has supported mappings for all 75 currently emit-able Level 1 equipment IDs. Unknown future IDs still remain explicit unsupported records rather than becoming fallback loot, and unsupported multi-container stacks remain explicit.

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
- pinned remaining literal gear evidence:
  - `packs/_source/equipment24/adventuring-gear/clothes-travelers.yml` with `rules: '2024'`
  - `packs/_source/items/loot/spellbook.yml` with `rules: '2014'`
  - `packs/_source/classes24/wizard/wizard.yml`, which explicitly references legacy Spellbook Item `LBajgahniRJbAgDr`
  - `packs/_source/origins24/backgrounds/criminal.yml` and `soldier.yml`, which demonstrate 2024 Traveler's Clothes usage
- prior pinned armor, ammunition, container, and Fighter proof fixtures recorded in repository history.

## Audit Conclusion

The Level 1 equipment mapping audit is complete at adapter `0.17.0`.

No currently emit-able equipment ID remains unmapped. Healer's Kit's Stabilize activity, feature/activity Items, spells, media packaging, and runtime Foundry acceptance are separate adapter/product concerns and are not equipment-coverage blockers.

Per the owner-approved Stage 5 sequence, the next work leaves this equipment audit: expose the already deterministic raw Foundry Actor JSON as a user-downloadable D&D import artifact. Do not reopen equipment mapping breadth unless generator output changes or regression evidence exposes a gap.
