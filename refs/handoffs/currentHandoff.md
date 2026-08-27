# Current Handoff

Date: 2026-08-27
Branch: `dev`
Phase: D&D 5E 2024 PI 1, guided breadth expansion; Magic Initiate background slice automated-green

## Accepted cross-repo baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted. Do not reopen it without new evidence.

Accepted Character Forge checkpoint on `qa` and `main`:

- `8041edb4009abce8a836faafce9a167883e92bda`

Parchment character persistence issue #24 is complete. Parchment remains system-agnostic; Character Forge owns D&D-native interpretation, generation, validation, and provenance.

Background non-blockers remain:

- issue #2: investigate the historical effective-runtime name-derived ID path only if new evidence makes it relevant;
- issue #3: compact icon-first Copy JSON / Download JSON controls for the CharacterDocument inspector.

## Current development checkpoint

Magic Initiate background support is automated-green on `dev` at code checkpoint:

- `523bc579065d81d2e144421ee080c1511a988a1a`
- commit: `feat: add Magic Initiate background spell grants`
- GitHub Actions run `33115103317`
- job `98667599352`
- full `npm run verify` green
- refs validation green
- strict TypeScript green
- 16 Vitest files / 72 tests / 0 failures
- web TypeScript build green

New guided characters continue to use `dnd5e-character/0.3`; D&D adapter version is now `0.9.0`. Legacy `dnd5e-character/0.1` and `0.2` reopen/validation paths remain isolated and supported.

Nothing in the accumulated generation stack has been promoted beyond `dev`; owner runtime acceptance is still required before exact-SHA promotion to `qa` / `main`.

Tracking:

- issue #11 remains open for full SRD Level 1 breadth;
- issue #12 creator-workspace polish is completed and closed;
- issues #5, #7, and #8 remain open for accumulated ability-generation runtime acceptance;
- issues #2 and #3 remain background non-blockers.

## Current guided support surface

All 12 SRD classes, 4 backgrounds, and 9 species are cataloged. Guided generation currently enables:

### Classes: 4 / 12

- Barbarian
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

- classes: Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard;
- species: Elf, Gnome, Tiefling.

Do not enable an item merely to improve counts. Its Level 1 nested choices and native mechanics must be represented and independently validated first.

## Magic Initiate spell-grant seam

The first D&D-native spell representation now exists, deliberately scoped to **feat-granted spells**, not class spellcasting.

`packages/system-dnd5e/src/spellCatalog.ts` owns the SRD spell IDs needed by the current Magic Initiate consumers:

- Cleric: 7 cantrips, 15 Level 1 spells;
- Wizard: 15 cantrips, 25 Level 1 spells.

A `Dnd5eSpellGrantState` retains:

- grant/source identity;
- spell-list identity;
- spellcasting ability;
- selected cantrips;
- prepared and always-prepared Level 1 spell;
- free-cast spell identity;
- one free cast current/maximum;
- Long Rest recharge.

For the current backgrounds:

- Acolyte fixes the Magic Initiate list to Cleric;
- Sage fixes the Magic Initiate list to Wizard;
- the player chooses Intelligence, Wisdom, or Charisma as casting ability;
- the player chooses two distinct cantrips from the required list;
- the player chooses one Level 1 spell from the same required list.

The browser uses the same direct choice / acceptable pool / random-from-checked pattern for these menus. Generation provenance retains the choices and acceptable pools.

The adapter independently validates retained spell grants. Tests cover wrong-list generation and retained-state tampering, including mismatched prepared/free-cast state.

### Important boundary

This is **not** a generic class spellcasting implementation yet. It intentionally does not invent:

- class spell slots;
- prepared-spell counts/rules;
- Wizard spellbooks;
- Pact Magic;
- class spellcasting progression;
- class-specific spell replacement/preparation semantics.

Future class work should extend the D&D-native spell state with class-owned structures rather than overloading the Magic Initiate grant.

Human-selected Magic Initiate remains disabled because the feat's general selection surface also requires Druid-list support. Do not falsely mark it supported by reusing only the Cleric/Wizard subset.

## Core guided mechanics already explicit

The official default D&D 2024 sequence remains:

1. Class
2. Origin: Background, Species, and related origin decisions
3. Ability Scores
4. Remaining details

Existing explicit choices include:

- class skills;
- Fighter Fighting Style;
- class starting equipment;
- Barbarian/Fighter/Rogue Weapon Mastery;
- Monk tool/instrument;
- Rogue Expertise and bonus language;
- origin languages;
- alignment;
- Human size / Skillful / Versatile / Skilled follow-up choices;
- Dragonborn Draconic Ancestry and damage type;
- Goliath Giant Ancestry;
- Acolyte/Sage Magic Initiate choices;
- all four ability-generation methods.

Sticky acceptable pools are preference state, not authoritative character state. Per-character provenance retains the historical pool/result/mode used.

## Creator workspace status

Issue #12 is complete and closed.

Desktop behavior now includes:

- creator controls left, character details right;
- independent scrolling between the two columns;
- narrow-screen one-column fallback;
- compact icon-first randomization actions;
- Character Name randomize using the system-layer name generator;
- explicit provenance distinguishing name-button randomization from typed names;
- descriptive class/background equipment alternatives while retaining source option IDs underneath;
- compact collapsible help for ability-generation methods.

Current name generation remains intentionally temporary: six hardcoded names selected by the shared seeded PRNG. Do not grow this into a giant flat list. Future naming should become culture/species/language aware with structured/weighted components, deterministic provenance, and eventual Worldbuilding language/culture interoperability.

## Ability methods

Guided creation continues to route all four methods through the same native builder/validator boundary:

- Standard Array;
- Point Cost;
- Random Generation, 4d6 keep highest 3;
- Manual Entry.

Random retains seed, raw rolls, kept dice, roll-slot identity, and assignment provenance. Point Cost uses the 27-point budget.

## Owner QA status

The prior owner runtime pass was broadly positive, but the accumulated guided stack has not yet received final owner acceptance.

A future combined runtime pass should cover:

1. direct and random-from-checked class/background/species behavior;
2. sticky pools across reload;
3. name randomization and provenance behavior;
4. independent left/right scrolling and descriptive equipment labels;
5. all four ability methods;
6. representative Dragonborn and Goliath characters reporting `Native state valid`;
7. representative Acolyte and Sage characters with changed Magic Initiate choices reporting `Native state valid`;
8. Parchment save/reload/reopen of representative `dnd5e-character/0.3` characters, including one with a spell grant;
9. no regression of the previously accepted Quick/Parchment seam.

Do not promote to `qa` / `main` until the owner explicitly accepts the accumulated pass.

## Immediate next direction

Continue issue #11. The highest-leverage next decision is now between:

1. **first real Level 1 spellcasting class**, extending the spell state with class-owned slot/preparation/known-spell semantics; or
2. **remaining lineage species** (Elf, Gnome, Tiefling), using the existing spell-grant seam where appropriate while explicitly modeling lineage/legacy choices and level-gated future spell grants.

Prefer the smallest slice that creates reusable architecture rather than a one-class fixture. Cleric or Wizard are natural candidates because their spell catalogs are already partially present, but neither may be enabled by silently defaulting its real Level 1 class choices. In particular, preserve class-specific distinctions such as prepared casting, Divine Order, and Wizard spellbook semantics.

Before broad class implementation, define the minimum class-spellcasting contract needed at Level 1 and how it composes with existing `spells.grants[]` without conflating feat grants and class capabilities.

## Random-tables companion watch point

Do not start the random-tables companion solely because spell/catalog breadth is expanding. The intended first consumers remain personality traits, ideals, bonds, flaws, equipment/trinket suggestions, and later system-specific flavor tables.

A generic table engine should return inspectable structured results and provenance; it must not patch CharacterDocument or D&D native state directly. D&D datasets and mappings remain D&D-owned.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state remains mandatory and lossless.
- Never reconstruct retained D&D state from semantic projection data.
- Generation methods and guided choices converge on the same native validation/persistence boundary.
- Sticky preference state is not character state; historical per-character choice provenance is.
- Do not silently default nested source-system decisions merely to mark more catalog entries supported.
- Spell grants and class spellcasting are distinct concepts; do not collapse them prematurely.
- New creator UI must fit the left-controls/right-details workspace rather than multiplying full-width panels.
- Generator-core stays system-neutral; D&D content and rules stay in `system-dnd5e`.
- Character Forge owns RPG-native interpretation, validation, generation choices, and provenance.
- Parchment owns project membership, generic asset lifecycle, relationships, persistence, and future sync/share behavior.
- Keep issues #2 and #3 backgrounded unless new evidence makes either blocking.
- Use only legally redistributable SRD 5.2.1 / CC-BY-4.0 material in this public repository.
