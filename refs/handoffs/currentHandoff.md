---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
---
# Current Handoff

Date: 2026-09-03
Branch: `dev`
Phase: D&D 5E 2024 PI 1, broad Level 1 guided catalog expansion

## Promoted baseline

The embedded persistence/reopen seam and the later direct-choice/acceptable-pool visibility correction are already promoted. Current Character Forge branch heads are:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

The **current eleven-class batch has not been promoted**. Keep it on `dev` until explicit owner batch runtime acceptance.

Parchment remains system-agnostic. Character Forge owns D&D-native interpretation, generation, validation, and provenance.

## Current automated-green code checkpoint

- code: `e5863b9007d2fdac9f6bb053225c2587321821e3`
- batch implementation base: `d2fd0be576e21351243ac44a683acc63b889c74c`
- Actions: `33820208614`
- job: `100861054551`
- refs / OKF green
- strict TypeScript green
- **22 Vitest files / 97 tests / 0 failures**
- web build green
- native schema: `dnd5e-character/0.3`
- adapter: `0.12.0`

Legacy `0.1` and `0.2` validation remain isolated and preserve their historical supported surfaces.

## Current guided support

All 12 SRD classes, 4 backgrounds, and 9 species are cataloged.

### Classes: 11 / 12

Supported:

- Barbarian
- Bard
- Cleric
- Druid
- Fighter
- Monk
- Paladin
- Ranger
- Rogue
- Sorcerer
- Wizard

Blocked deliberately:

- Warlock

Warlock must not be represented as an ordinary Long-Rest caster. Pact Magic short-rest slots and Level 1 Eldritch Invocations are the next distinct class-owned seam.

### Backgrounds: 4 / 4

- Acolyte
- Criminal
- Sage
- Soldier

### Species: 6 / 9

- Dragonborn
- Dwarf
- Goliath
- Halfling
- Human
- Orc

Still blocked:

- Elf
- Gnome
- Tiefling

## Class expansion batch

### Druid

Retains Primal Order, Druidic language/focus, Herbalism Kit, Warden/Magician consequences, Wisdom spellcasting, 2/3 cantrips, four ordinary prepared Level 1 spells, and two Level 1 Long-Rest slots.

`Speak with Animals` is always prepared through Druidic and is **excluded from the four ordinary prepared-spell choices**. Adapter validation enforces both parts.

### Bard

Retains Charisma spellcasting, 2 cantrips, 4 Level 1 spells, two Level 1 slots, Bardic Inspiration, three explicit musical-instrument proficiencies, those selected instruments as spellcasting foci, and source training/equipment.

### Paladin

Retains Charisma spellcasting, 2 prepared Level 1 spells, two Level 1 slots, Holy Symbol focus, Lay on Hands 5-point pool, Martial/Simple training, Light/Medium/Heavy Armor + Shield training, two Weapon Masteries, and source equipment.

### Ranger

Retains Wisdom spellcasting, 2 ordinary prepared Level 1 spells, two Level 1 slots, Druidic Focus capability, Favored Enemy resource state, two Weapon Masteries, and source training/equipment.

`Hunter's Mark` is always prepared through Favored Enemy and is **excluded from the two ordinary prepared choices**.

### Sorcerer

Retains Charisma spellcasting, 4 cantrips, 2 Level 1 spells, two Level 1 slots, Arcane Focus capability, Innate Sorcery 2-use state, and source training/equipment.

### Wizard

Retains Intelligence spellcasting, 3 cantrips, an explicit **six-spell Level 1 spellbook**, four prepared Level 1 spells constrained to that retained spellbook, two Level 1 slots, Arcane Focus/spellbook capability, and Arcane Recovery state.

Adapter validation rejects prepared Wizard spells outside the retained spellbook.

## Spell architecture

Keep these source concepts distinct.

### `spells.grants[]`

Independent feat/species-style grants. Current consumers:

- Acolyte -> Magic Initiate (Cleric)
- Sage -> Magic Initiate (Wizard)

### `spells.classCasting[]`

Current standard-slot consumers:

- Bard
- Cleric
- Druid
- Paladin
- Ranger
- Sorcerer
- Wizard

Common class-casting state retains source/list/casting ability/cantrips/prepared and always-prepared state/slots/preparation cadence/focus capability and optional spellbook state. Source-specific class mechanics remain explicit in class/resource state.

### Future Pact Magic

Warlock remains separate until its Short Rest slot and invocation semantics are modeled faithfully. Prefer a dedicated Pact Magic contract or explicit casting-mode distinction over weakening the meaning of current standard class slots.

## Automated coverage

The green batch covers:

- supported **11-class x 6-species** generation matrix;
- dedicated prepared-caster catalog/generation tests;
- Bard/Paladin/Ranger/Sorcerer/Wizard reopen/tamper behavior;
- Wizard spellbook/prepared-subset validation;
- Ranger `Hunter's Mark` always-prepared distinction;
- Druid `Speak with Animals` always-prepared distinction;
- Cleric and Magic Initiate regressions;
- existing ability-method, choice-pool, build-identity, and native-state tests.

## Creator standards to preserve

- controls left / character review right;
- independent desktop panel scrolling;
- one-column narrow fallback;
- universal controls before method-specific controls;
- one ability-generation dropdown with dynamic controls;
- direct dropdowns show **all supported options**;
- checked acceptable pools constrain randomization only;
- sticky acceptable pools are preference state, not authoritative character state;
- random-from-checked and direct choices retain provenance;
- icon-first randomization including Name;
- descriptive equipment labels;
- compact contextual help;
- visible runtime build/source badge for QA.

Current name generation is still a temporary six-full-name catalog. Do not expand it into a giant flat list; future naming should be culture/species/language aware.

## Ability methods

All converge on the same guided native builder:

- Standard Array
- Point Cost
- Random 4d6 keep highest 3
- Manual Entry

## Owner batch QA target

The user explicitly requested testing this expansion together. Recommended pass:

1. confirm the visible build badge identifies the pulled `dev` revision;
2. confirm the Class picker shows all supported classes except Warlock regardless of old acceptable-pool checkmarks;
3. build Bard, Druid, Paladin, Ranger, Sorcerer, and Wizard and confirm `Native state valid`;
4. verify Druid `Speak with Animals` is always prepared but absent from ordinary prepared choices;
5. verify Ranger `Hunter's Mark` is always prepared/Favored Enemy but absent from ordinary prepared choices;
6. verify Wizard six-spell spellbook -> four prepared subset behavior;
7. change/randomize Bard's three instrument choices;
8. use random-from-checked on multiple spell menus;
9. combine a new caster with Acolyte or Sage and confirm Magic Initiate is a separate source;
10. use a non-Standard-Array ability method on a new caster;
11. save/reload/reopen representative new casters through Parchment;
12. retain prior sticky-pool/name/scrolling/equipment checks.

Do not promote until explicit owner acceptance.

## Next work after batch QA

Issue #11 remains open. Highest-value remaining breadth seams:

1. **Warlock Level 1**: Pact Magic + Eldritch Invocation native state;
2. **Elf/Gnome/Tiefling**: lineage/legacy choices and spell grants;
3. **Human-selected Magic Initiate**: full general feat path including Druid list selection.

Choose based on QA evidence and architectural value, not support-count optics.

## Random-tables watch point

Still defer the companion until concrete personality/flavor consumers define the generic result contract. Likely first consumers remain traits, ideals, bonds, flaws, equipment/trinkets, and later system-specific flavor tables. Start before Guided Narrative creates parallel table machinery.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native state is mandatory and lossless.
- Never reconstruct retained D&D state from semantic projection.
- Spell grants, standard class spellcasting, and Pact Magic remain distinct where mechanics differ.
- Do not silently default nested source decisions to improve support counts.
- Generator-core stays system-neutral; D&D rules/content stay in `system-dnd5e`.
- Character Forge owns RPG-native interpretation/validation/generation/provenance.
- Parchment owns generic project membership/lifecycle/persistence/sync.
- Keep visible runtime source/version identity available in QA builds.
- Use only legally redistributable SRD 5.2.1 / CC-BY-4.0 material in the public repo.
