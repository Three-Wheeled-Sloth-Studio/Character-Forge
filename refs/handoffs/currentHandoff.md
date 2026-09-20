---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- equipment
---
# Current Handoff

Date: 2026-09-20
Branch: `dev`
Current stage: **Stage 5 - Foundry Export / Import Validation (active)**

## Current State

Stages 0 through 3 are complete.

Stage 4 durable portrait/token implementation is complete, but integrated owner/browser QA is intentionally deferred until the owner is back at a primary workstation. Character Forge Issue #16 is the durable QA return point. That deferred QA is **not** a Stage 5 development blocker.

Issue #15 remains parked and nonblocking.

The authoritative stage order remains:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

## Exact Green Stage 5 Equipment Checkpoint

Accepted `dev` implementation head:

- SHA: `0c06ec6aaf21f0719f54929890cf4f67f68093c9`
- Actions: `35514407369`
- Job: `106087797352`
- `npm run verify`: green
- 68 test files
- 336 tests passed
- 0 failures
- 251 tracked paths
- 14 required project-memory files
- OKF: 33 concepts / 10 indexes
- Agent context: 3582 characters
- Build: `Character Forge build 0.0.1 0c06ec6a`
- Foundry adapter: `0.14.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

No promotion is authorized unless the owner explicitly requests it.

## Stage 5 Target Boundary

The current adapter is pinned to:

- Foundry VTT `14.367`
- D&D5e `6.0.0`

Preserve these rules:

- Native system state is mandatory and lossless.
- Character Forge native D&D state is canonical.
- Foundry Actor/Item data is an adapter target only.
- Do not project through Universal Grammar.
- Do not copy Foundry compendium prose into exported Items.
- Do not replay Foundry advancement for choices Character Forge already resolved.
- Do not invent generic loot for unsupported Character Forge equipment IDs.
- Keep unsupported mappings explicit.

## Implemented Foundry Slices

### Actor shell - complete

Checkpoint `ca345ca693ac269f4ca900160a2611f8ebb93a01` proved deterministic Actor JSON with actor-level abilities, saves, HP, flat AC, initiative, movement, senses, alignment, XP, size, languages, currency, skills, spell slots, token shell, and Character Forge source flags.

### Identity Items - complete

Checkpoint `3ebf76461a7592878f66f089a51b261868460fa3` added deterministic embedded Class, Background, and Race Items with Actor detail references.

Identity Items intentionally contain:

- no copied rules text;
- no advancement automation; and
- no starting-equipment replay.

### Bounded Fighter equipment proof - complete

Checkpoint `e2e9470f90671ed7cdcb7032eb9720f0b1c0afe3` added a pinned equipment-definition registry and mapped the complete Avery/Fighter fixture:

- `chain-mail` -> equipment
- `greatsword` -> weapon
- `flail` -> weapon
- `javelin x8` -> weapon stack
- `dungeoneers-pack` -> container

### Ammunition and container breadth - complete

Checkpoint `ba6a0422d061f5f2668307ffa461defa8ee5d77d` added explicit `arrow` -> Foundry `arrows` ammunition translation and all currently emitted mundane pack/container IDs. Native quantities remain explicit and unsupported multi-container stacks are deferred rather than collapsed.

### Armor and shield breadth - complete

Checkpoint `8e4e0d61d75d96fb69f4fd50b35869360e30e4ae` added exact pinned mappings for:

- `chain-shirt`
- `shield`
- `leather-armor`
- `studded-leather-armor`

These Items remain unequipped and contain no copied prose or activity automation. Actor AC remains flat and authoritative.

### Simple weapon breadth - complete

Checkpoint `fc06c28973f23e5a962c121764509ab5e1545dce` added exact pinned mappings for:

- `dagger`
- `quarterstaff`
- `spear`
- `shortbow`
- `handaxe`
- `mace`
- `sickle`

The slice preserves deterministic embedded IDs, native quantities, pinned static weapon data, the accepted bounded versatile marker for quarterstaff and spear, and `shortbow`'s static `ammunition.type = "arrow"` without inventing an Item relationship.

### Remaining martial weapon breadth - complete

Checkpoint `1208bcd3ee134c5587d660bb7bd22a97bd05282d` adds exact pinned mappings for every remaining currently emitted martial weapon:

- `scimitar`
- `shortsword`
- `longbow`
- `greataxe`
- `longsword`

The slice proves:

- exact target identifiers and martial melee/ranged categories are preserved;
- pinned price, weight, base damage, properties, mastery, and range fields are mapped;
- `longbow` retains static `ammunition.type = "arrow"` without an Item relationship;
- `longsword` retains the accepted bounded versatile marker shape without pulling alternate-damage or attack automation forward;
- native quantities and deterministic Character Forge source-ID-based embedded IDs remain stable;
- descriptions and activities remain empty and equipped state remains uninferred; and
- compound tool IDs remain explicit deferred equipment rather than becoming fallback loot.

### Direct tool breadth - complete

Checkpoint `faefe3790f515abe530cb9c20863818cdacf8660` adds exact pinned mappings for:

- `calligraphers-supplies`
- `thieves-tools`
- `herbalism-kit`

The slice proves:

- all three literal Character Forge IDs map directly to Foundry `tool` Items;
- exact target identifier, price, weight, tool type/base item, and ability fields are preserved;
- native quantities and deterministic Character Forge source-ID-based embedded IDs remain stable;
- descriptions and activities remain empty;
- proficiency, container relationships, and semantic aliases remain uninferred; and
- `artisan-tools:smiths-tools` remains explicitly deferred.

### Artisan tool prefix breadth - complete

Checkpoint `cdd26447dccab3bd72374f1c66ece6a8cbc1f7ef` maps all 17 emitted `artisan-tools:<tool-id>` variants through an explicit whitelist.

The slice proves:

- the Character Forge compound source ID remains authoritative for deterministic embedded IDs and provenance;
- each target uses the exact pinned Foundry artisan-tool identifier rather than a generic prefix-strip fallback;
- exact pinned name, price, weight, `type.value = "art"`, base item, and ability are preserved;
- native quantities remain stable;
- descriptions and activities remain empty;
- proficiency, equipped state, and container relationships remain uninferred; and
- `musical-instrument:lute` remains explicit deferred equipment.

### Musical-instrument prefix breadth - complete

Checkpoint `ec48798b5c05ccb08803e4a19a4af8ed24b8db3f` maps all 10 emitted `musical-instrument:<instrument-id>` variants through an explicit whitelist.

The slice proves:

- the Character Forge compound source ID remains authoritative for deterministic embedded IDs and provenance;
- each target uses the exact pinned Foundry musical-instrument identifier rather than a generic prefix-strip fallback;
- exact pinned name, price, weight, `type.value = "music"`, base item, and `ability = "cha"` are preserved;
- the pinned `pan-flute` target exception `baseItem = "panflute"` is preserved;
- native quantities remain stable;
- descriptions and activities remain empty;
- proficiency, equipped state, and container relationships remain uninferred; and
- `arcane-focus:orb` remains explicit deferred equipment.

### Compound spellcasting-focus breadth - complete

Checkpoint `9d1d9ca941b29e04354f5ac3922f099365b94f26` maps all five emitted compound focus IDs through an explicit whitelist:

- `arcane-focus:crystal` -> equipment `crystal`
- `arcane-focus:orb` -> equipment `orb`
- `arcane-focus:quarterstaff` -> weapon `staff`
- `druidic-focus:sprig-of-mistletoe` -> equipment `sprig-of-mistletoe`
- `druidic-focus:quarterstaff` -> weapon `wooden-staff`

The slice proves:

- Character Forge compound source IDs remain authoritative for deterministic embedded IDs and provenance;
- the two `*:quarterstaff` aliases deliberately map to different pinned target identifiers;
- crystal/orb/mistletoe preserve pinned `equipment` + `trinket` static fields;
- both staff targets preserve quarterstaff base item, 1d6 bludgeoning, `foc` + `ver`, Topple mastery, and the bounded versatile marker;
- descriptions and activities remain empty;
- equipped/proficiency/spellcasting/container relationships remain uninferred; and
- `holy-symbol` remains explicit deferred equipment.

### Generic holy-symbol breadth - complete

Checkpoint `07dc02f79d144c7371df50576d39c1ec0a9e469f` maps the literal Character Forge `holy-symbol` concept to the pinned generic Foundry `holy-symbol-varies` target.

The slice proves:

- the target remains a Foundry `loot` Item rather than fabricating a tool/equipment form;
- pinned name, identifier, zero price/weight, gear type, blank subtype, and empty properties are preserved;
- native quantity, deterministic Character Forge source-ID-based embedded IDs, and source provenance remain stable;
- description remains empty;
- no amulet, emblem, reliquary, worn/held/shield relationship, or spellcasting behavior is invented; and
- `gaming-set:dice` remains explicit deferred equipment.

### Gaming-set dice breadth - complete

Checkpoint `d4908d19799b3925a0f609302866eaaf22f46e03` maps the compound Character Forge `gaming-set:dice` concept to the pinned Foundry `dice` tool target.

The slice proves:

- the complete Character Forge compound source ID remains authoritative for deterministic embedded IDs and provenance;
- pinned name, identifier, `1 sp` price, zero weight, `type.value = "game"`, base item `dice`, and `ability = "wis"` are preserved;
- native quantity remains stable;
- proficiency remains null and properties/bonus remain empty;
- descriptions and activities remain empty;
- the pinned Foundry Catch Cheating and Play to Win check activities are intentionally not replayed; and
- `book:history` remains explicit deferred equipment.

### Semantic book aliases - complete

Checkpoint `0c06ec6aaf21f0719f54929890cf4f67f68093c9` maps all three Character Forge book aliases to the pinned Foundry 2024 generic `book` loot target:

- `book:prayers` -> display name `Prayer Book`
- `book:history` -> display name `History Book`
- `book:occult-lore` -> display name `Occult Lore Book`

The slice proves:

- all three exported Items use Foundry identifier `book`;
- Character Forge source semantics remain visible through distinct display names and full source-ID provenance;
- pinned `25 gp`, `5 lb`, `gear`, blank subtype, and empty properties are preserved;
- native quantities and deterministic source-ID-based embedded IDs remain independent for each alias;
- descriptions remain empty;
- the generic Foundry Book's +5 Intelligence-check rules text is not copied or automated; and
- `spellbook` remains explicit deferred equipment.

The equipment adapter still aggregates ordinary repeated stacks before export, retains Character Forge source ID/quantity flags, and emits explicit unsupported-equipment records instead of fabricating fallback Items.

## Level 1 Equipment Audit

The durable source/target inventory is:

`refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`

Key result:

- current Level 1 generation can emit 48 literal equipment IDs plus 27 dynamic prefixed tool/instrument IDs;
- Character Forge compound IDs are semantic IDs, not assumed Foundry identifiers;
- all currently emitted weapon IDs now have pinned mappings;
- ammunition, all currently emitted mundane containers, and all currently emitted armor/shield IDs also have pinned mappings;
- the three direct literal tool concepts, all 17 artisan-tool compound IDs, all 10 musical-instrument compound IDs, all five compound focus IDs, generic `holy-symbol`, `gaming-set:dice`, and all three `book:*` aliases now have pinned mappings;
- all currently identified semantic-alias equipment groups are now covered; and
- remaining equipment work is literal simple gear plus the intentionally deferred healer's-kit activity/uses semantics.

## Next Bounded Stage 5 Slice

Map only the three remaining literal simple-gear IDs that have confirmed 2024 Foundry fixtures:

- `parchment-sheet` -> pinned `parchment` loot target
- `robe` -> pinned `robe` equipment target
- `crowbar` -> pinned `crowbar` loot target

Pinned Foundry 6.0.x 2024 fields:

### Parchment

- name: `Parchment`
- Item type: `loot`
- identifier: `parchment`
- price: `1 sp`
- weight: `0 lb`
- type: `gear`
- subtype: blank
- properties: empty

### Robe

- name: `Robe`
- Item type: `equipment`
- identifier: `robe`
- price: `1 gp`
- weight: `4 lb`
- `type.value = "clothing"`
- `type.baseItem = ""`
- equipped: false
- armor value/magical bonus/dex: null
- proficient: null
- properties: empty
- activities: empty

### Crowbar

- name: `Crowbar`
- Item type: `loot`
- identifier: `crowbar`
- price: `2 gp`
- weight: `5 lb`
- type: `gear`
- subtype: blank
- properties: empty

Preserve native quantity, deterministic Character Forge source-ID-based embedded IDs, and source provenance. Keep descriptions empty. Do not implement the Crowbar leverage Advantage rule.

Do not pull `spellbook` or `travelers-clothes` into this slice. In the pinned D&D5e 6.0.x source tree, those exact fixtures currently resolve only to 2014-rule Items, so they need an explicit cross-rules-version adapter decision before mapping.

Keep `healers-kit` separate. It has a 2024 consumable fixture with ten uses and a Stabilize activity; that activity/uses behavior remains intentionally outside this simple static-gear slice.

Do not combine this with:

- `spellbook` or `travelers-clothes`;
- healer's-kit activity/uses semantics;
- feature/activity Items;
- spell Items;
- Parchment portrait/token packaging;
- a user-facing Foundry Download button;
- real Foundry runtime acceptance; or
- bidirectional Foundry sync.

## Deferred QA Return Point

Character Forge Issue #16 remains the owner/browser Stage 4 acceptance checklist for the primary workstation. Do not lose or silently close it while Stage 5 proceeds.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Universal Grammar remains a future derived semantic/translation layer with explicit loss/confidence.
- Profession is not class.
- Species is not synonymous with culture or language.
- Portrait/token/VTT media identity belongs to Parchment-owned asset relationships, not RPG native state.
- Foundry schemas are adapter targets, not canonical state.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every Character Forge implementation milestone:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
