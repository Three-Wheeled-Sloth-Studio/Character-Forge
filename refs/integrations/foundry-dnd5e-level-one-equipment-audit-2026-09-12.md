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
Character Forge adapter: `0.3.0`

## Purpose

Inventory every equipment `itemId` that the current D&D Level 1 generation paths can emit and separate Character Forge semantic IDs from pinned Foundry Item semantics before broadening export coverage.

This is an adapter audit, not a new canonical equipment model. Character Forge native D&D state remains authoritative.

## Current Proof

Adapter `0.3.0` maps the complete Avery/Fighter fixture:

- `chain-mail` -> Foundry `equipment`
- `greatsword` -> Foundry `weapon`
- `flail` -> Foundry `weapon`
- `javelin` -> Foundry `weapon`, including stack quantity
- `dungeoneers-pack` -> Foundry `container`

The proof uses deterministic embedded IDs, empty descriptions, no copied compendium prose, no Foundry advancement replay, and no copied attack activities. Actor AC remains the authoritative Character Forge flat value until Foundry calculation parity is separately proven.

Unknown equipment IDs are reported as deferred mappings rather than silently dropped or fabricated as generic loot.

## Emitted Character Forge Equipment Space

The current Level 1 generator has 48 literal equipment IDs plus 27 possible dynamic prefixed tool/instrument IDs, for 75 possible distinct Character Forge equipment IDs.

### Weapons

The following literal Character Forge IDs correspond to ordinary weapon concepts. The five-item proof already implements `greatsword`, `flail`, and `javelin`; the remaining weapon IDs still need pinned definition entries before export is considered complete.

- `dagger`
- `quarterstaff`
- `spear`
- `shortbow`
- `scimitar`
- `shortsword`
- `longbow`
- `greataxe`
- `handaxe`
- `mace`
- `sickle`
- `greatsword` - implemented
- `flail` - implemented
- `javelin` - implemented
- `longsword`

Do not infer weapon activities from Character Forge IDs. Activities are a separate Foundry automation layer.

### Armor and Shield Equipment

These are Foundry `equipment`-family targets and should retain Character Forge's resolved AC until recalculation parity is proven:

- `chain-mail` - implemented
- `chain-shirt`
- `shield`
- `leather-armor`
- `studded-leather-armor`

### Consumables / Ammunition

- `arrow` - Foundry target is ammunition/`consumable`; the 2024 equipment pack uses identifier `arrows`, so this requires explicit Character Forge ID translation rather than a 1:1 identifier assumption.
- `healers-kit` - Foundry target is `consumable`; its Foundry activity is intentionally outside the equipment-data proof and must not be copied implicitly.

### Containers and Packs

Pinned Foundry evidence establishes `dungeoneers-pack`, `explorers-pack`, and `quiver` as `container` Items. The remaining pack/container candidates should be fixture-checked before adding definitions, even where naming is strongly suggestive.

- `dungeoneers-pack` - implemented
- `explorers-pack` - target `container` proven
- `quiver` - target `container` proven
- `entertainers-pack` - container candidate; inspect exact pinned fixture before mapping
- `priests-pack` - container candidate; inspect exact pinned fixture before mapping
- `burglars-pack` - container candidate; inspect exact pinned fixture before mapping
- `scholars-pack` - container candidate; inspect exact pinned fixture before mapping
- `pouch` - container candidate; inspect exact pinned fixture before mapping

Container contents are not inferred from the Character Forge pack ID. A pack Item may be represented without manufacturing nested inventory unless Character Forge native state explicitly contains those contents or a later adapter rule deliberately expands them.

### Direct Tool Concepts

Pinned Foundry evidence establishes `calligraphers-supplies` as a `tool`. The same target family is expected for the other ordinary tool concepts, but each mapping must use an explicit target identifier/fixture rather than string-prefix guessing.

- `calligraphers-supplies`
- `thieves-tools`
- `herbalism-kit`

### Dynamic Tool and Instrument IDs

Character Forge can emit 17 artisan-tool variants and 10 musical-instrument variants through prefixed semantic IDs:

`artisan-tools:<tool-id>` where `<tool-id>` is one of:

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

`musical-instrument:<instrument-id>` where `<instrument-id>` is one of:

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

These Character Forge IDs intentionally encode both category and selected physical form. They require decomposition/translation and must not be passed through as Foundry identifiers:

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
- `holy-symbol` - pinned Foundry 2024 data uses a `loot` target such as `holy-symbol-varies`; do not assume identifier equality

### Simple Gear Still Requiring Exact Target Fixture Review

Do not classify these by intuition in code. Inspect the pinned Foundry 6.0 fixture first and then add a typed adapter definition:

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

Pinned Foundry D&D5e 6.0 examples/schema:

- `module/data/item/weapon.mjs`
- `module/data/item/equipment.mjs`
- `module/data/item/container.mjs`
- `module/data/item/templates/physical-item.mjs`
- `module/data/item/templates/identifiable.mjs`
- `module/data/item/templates/equippable-item.mjs`
- `packs/_source/equipment24/armor/heavy/chain-mail.yml`
- `packs/_source/equipment24/weapons/martial-melee/greatsword.yml`
- `packs/_source/equipment24/weapons/martial-melee/flail.yml`
- `packs/_source/equipment24/weapons/simple-melee/javelin.yml`
- `packs/_source/equipment24/adventuring-gear/dungeoneers-pack/_container.yml`
- `packs/_source/equipment24/adventuring-gear/explorers-pack/_container.yml`
- `packs/_source/equipment24/adventuring-gear/quiver/_container.yml`
- `packs/_source/equipment24/adventuring-gear/ammunition/arrows.yml`
- `packs/_source/equipment24/adventuring-gear/healers-kit.yml`
- `packs/_source/equipment24/tools/artisan/calligraphers-supplies.yml`
- `packs/_source/equipment24/adventuring-gear/spellcasting-focuses/holy-symbol-varies.yml`

## Recommended Next Slice

Expand only the low-ambiguity inventory seam:

1. map `arrow` explicitly to the pinned Foundry ammunition target while preserving quantity;
2. add `quiver` and the proven/fixture-checked mundane pack containers;
3. add tests proving Character Forge-to-Foundry identifier translation where IDs differ;
4. keep container contents unexpanded unless represented natively;
5. retain explicit deferred notes for all remaining equipment IDs.

Do not combine this with feature/activity Items, spell Items, media packaging, a Download UI, or real Foundry runtime acceptance.
