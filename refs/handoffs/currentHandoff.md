# Current Handoff

Date: 2026-08-27
Branch: `dev`
Phase: D&D 5E 2024 PI 1, guided breadth expansion; first class-owned spellcasting slice automated-green

## Accepted cross-repo baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted. Do not reopen it without new evidence.

Accepted Character Forge checkpoint on `qa` and `main`:

- `8041edb4009abce8a836faafce9a167883e92bda`

Parchment remains system-agnostic. Character Forge owns D&D-native interpretation, generation, validation, and provenance.

Background non-blockers:

- #2 historical effective-runtime name-derived ID path, only if new evidence makes it relevant;
- #3 compact Copy JSON / Download JSON controls.

## Current automated-green development checkpoint

First full class-owned spellcasting consumer: Cleric Level 1.

- code checkpoint: `80769e8854f4b9ee80e6fffa9e497115df5fda58`
- GitHub Actions run: `33128723547`
- job: `98712957299`
- full `npm run verify` green
- refs validation green
- strict TypeScript green
- 17 Vitest files / 77 tests / 0 failures
- web TypeScript build green

Guided native schema remains `dnd5e-character/0.3`; D&D adapter version is `0.10.0`. Legacy `0.1` and `0.2` validation remain isolated and preserve their historical supported surfaces.

Nothing in the accumulated generation stack has been promoted beyond `dev`. Owner runtime acceptance is still required before exact-SHA promotion.

## Current guided support surface

All 12 SRD classes, 4 backgrounds, and 9 species remain cataloged.

### Classes: 5 / 12

- Barbarian
- Cleric
- Fighter
- Monk
- Rogue

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

- classes: Bard, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard;
- species: Elf, Gnome, Tiefling.

Do not enable an option until its real Level 1 nested decisions and native mechanics are represented and independently validated.

## Cleric Level 1 slice

Cleric is the first genuinely magical class exposed in the browser class picker.

Explicit Level 1 state includes:

- d8 Hit Die;
- Wisdom primary ability and Wisdom/Charisma saves;
- two legal class-skill choices;
- descriptive package-vs-110-GP starting equipment choice;
- Divine Order: Protector or Thaumaturge;
- Wisdom class spellcasting;
- 3 Cleric cantrips for Protector or 4 for Thaumaturge;
- 4 prepared Level 1 Cleric spells;
- two Level 1 spell slots, current/maximum, Long Rest recharge;
- Holy Symbol spellcasting focus;
- Protector Martial-weapon proficiency and Heavy Armor training;
- Thaumaturge knowledge bonus derived from Wisdom modifier, minimum +1.

The browser uses the existing sticky acceptable-pool/direct/random pattern for Divine Order, cantrips, and prepared spells. The right-side character details now display Divine Order, class spellcasting, prepared spells, spell slots, and order-related training/bonus state.

Tests cover Protector, Thaumaturge, class spell-state tampering, and the supported 5-class × 6-species matrix.

## Spell architecture now proven at two distinct layers

### Independent spell grants

`spells.grants[]` remains for feat/species-style grants. Current consumers:

- Acolyte -> Magic Initiate (Cleric)
- Sage -> Magic Initiate (Wizard)

Each grant retains source/list/casting ability/cantrips/always-prepared Level 1 spell/free cast/Long Rest recharge.

### Class-owned spellcasting

`spells.classCasting[]` now retains class capability separately:

- source class / feature / spell-list identity;
- fixed class casting ability;
- class cantrips;
- prepared spells;
- slot pools with current/maximum/recharge;
- preparation cadence;
- spellcasting focus capability.

A Cleric with Acolyte correctly retains both a Cleric `classCasting` entry and a separate Magic Initiate (Cleric) `grant`. Neither source is reconstructed from the other or from generation provenance.

Independent adapter validation rejects illegal cantrip/prepared counts, wrong-list state, wrong Cleric casting ability, tampered slot pools, and Divine Order state mismatches.

## Legacy compatibility

The retained `dnd5e-character/0.2` validator is explicitly isolated from the expanding current class union. It still recognizes only its original four guided classes, two backgrounds, and historical species boundary. Adding Cleric to current guided creation does not retroactively change what an old document means.

## Existing creator/product standards

Preserve:

- controls left / character review right;
- independent desktop scrolling;
- one-column narrow fallback;
- universal controls before method-specific controls;
- one ability-generation dropdown with dynamic controls;
- compact/collapsible acceptable pools;
- icon-first randomization including Character Name;
- descriptive equipment labels while retaining canonical IDs underneath;
- compact contextual help;
- sticky acceptable pools as preference state, not authoritative character state;
- per-character pool/result/mode provenance.

Current name generation remains a temporary six-name catalog. Do not grow it into a giant flat list; future naming should be culture/species/language aware and interoperable with Worldbuilding language/culture systems.

## Ability methods

All continue through the same guided native builder:

- Standard Array
- Point Cost
- Random Generation (4d6 keep highest 3)
- Manual Entry

## Owner runtime QA still required

The next useful owner pass can now actually exercise magical-class behavior. Include:

1. confirm Cleric appears in the Class picker alongside Barbarian/Fighter/Monk/Rogue;
2. build Protector and Thaumaturge variants and confirm `Native state valid`;
3. change/randomize Cleric cantrips and prepared Level 1 spells;
4. verify Thaumaturge exposes four cantrips and Protector three;
5. build Cleric + Acolyte and confirm class spells and Magic Initiate both appear as separate sources in the right details/native document;
6. exercise a different ability-generation method with Cleric;
7. save/reload/reopen a representative Cleric through Parchment and confirm native spell state is unchanged;
8. retain prior checks for sticky pools, name randomization, independent scrolling, and descriptive equipment.

Do not promote until explicit owner acceptance.

## Deployment integration

Character Forge is now part of the local PW checkout, pull, verify/build, deploy, and promotion chain. Private orchestration in Parchment Worlds checks out the matching Character Forge branch, requires a successful `verify.yml` run for the exact source SHA, builds the web app, and publishes only `/apps/character-forge/`. The hosted deployment includes `source.json` so smoke tests can verify exact commit provenance.

This integration does not change the acceptance gate above: do not run the QA or production promotion helpers until the owner accepts the accumulated runtime pass.

## Immediate next direction

Continue issue #11 from the now-proven class-spellcasting primitive.

Good next slices are:

1. reuse/refine standard class spellcasting with another class whose Level 1 semantics fit the proven slot/preparation primitives without hiding source-specific choices; or
2. take Elf/Gnome/Tiefling lineage spell grants, reusing `spells.grants[]` where mechanically accurate; or
3. add the Druid Magic Initiate list and then enable Human-selected Magic Initiate if that can be done without prematurely opening Druid class mechanics.

Do not force Wizard spellbook or Warlock Pact Magic into the Cleric structure. Common primitives are desirable; source-specific state remains explicit when mechanics genuinely differ.

## Random-tables companion watch point

Still defer implementation until concrete personality/flavor/table consumers are sufficient to define the generic producer contract. Likely first consumers remain traits, ideals, bonds, flaws, equipment/trinket suggestions, and later system-specific flavor tables.

A generic table engine returns structured, inspectable, provenance-bearing results. It does not mutate CharacterDocument/native state directly.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state remains mandatory and lossless.
- Never reconstruct retained D&D state from semantic projection.
- Generation methods and choices converge on one native validation/persistence boundary.
- Spell grants and class spellcasting are distinct source concepts.
- Sticky preferences are separate from authoritative state and historical provenance.
- Do not silently default nested source-system decisions to improve support counts.
- Generator-core stays system-neutral; D&D rules/content stay in `system-dnd5e`.
- Character Forge owns RPG-native interpretation, validation, choices, and provenance.
- Parchment owns generic project membership, lifecycle, relationships, persistence, and future sync/share behavior.
- Use only legally redistributable SRD 5.2.1 / CC-BY-4.0 material in the public repository.
