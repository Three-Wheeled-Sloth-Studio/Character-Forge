# Current Handoff

Date: 2026-08-26
Branch: dev
Phase: D&D 5E 2024 PI 1, guided backgrounds plus consolidated creator workspace automated-green; owner QA deferred

## Accepted baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted. Do not reopen it without new evidence.

Accepted Character Forge checkpoint on `qa` and `main`:

- `8041edb4009abce8a836faafce9a167883e92bda`

Parchment character persistence issue #24 is complete.

Background non-blockers remain:

- issue #2: trace the effective runtime path that still showed name-derived character/native-state IDs despite UUID helpers in current code;
- issue #3: add compact icon-first Copy JSON / Download JSON controls to the CharacterDocument inspector.

## Current development checkpoint

Guided class/background/species creation and the consolidated creator workspace are implemented on `dev` at:

- code checkpoint `0d0b08fc8d5ff972ed2a0597cf388f02e0bb4977`;
- GitHub Actions run `33030732051`;
- job `98382400335`;
- full `npm run verify` green;
- refs validation green;
- strict TypeScript green;
- 14 Vitest files / 58 tests / 0 failures;
- web TypeScript build green.

Tracking:

- issue #9 Guided D&D class/species choice pools with sticky random selection now also covers the first background/UI consolidation increment;
- issues #5, #7, and #8 remain open for the deferred combined runtime acceptance of the accumulated ability-generation work.

Nothing in the current generation stack has been promoted beyond `dev` since owner runtime QA remains deferred.

## Product direction established

The default guided D&D 2024 flow follows the official SRD sequence:

1. choose class;
2. determine origin: background, species, and related origin decisions;
3. determine ability scores;
4. continue remaining character details.

Character Forge also uses a reusable Nethack-style acceptable-option pattern for menu choices:

- a player may choose one option directly;
- a player may mark every option they would be happy receiving and ask Character Forge to choose randomly from that checked pool;
- the acceptable pool is user-sticky across browser sessions;
- sticky preference state is not authoritative character state;
- the selected result, acceptable pool actually used for the character, and direct/random mode are retained in generation provenance.

The pattern is now active for Class, Background, and Species and should remain the default menu-choice affordance when the source system permits it.

## Creator workspace UI standard

The previous stack of separate generation panels was rejected as functionally useful but too clunky. The creator now follows this product standard:

- generation and editing controls stay in the left column;
- the current character summary/details stay in the right column;
- universal choices appear before method-specific controls;
- ability-generation method is a single dropdown;
- only controls required by the selected method appear below that dropdown;
- acceptable-option pools are compact/collapsible rather than permanently consuming vertical space;
- random-from-acceptable uses a compact icon-first control;
- the right-side character result remains visible/sticky on desktop while the left-side generation controls are adjusted;
- narrow layouts collapse responsively to one column.

This is a Character Forge workspace pattern, not a D&D-only exception. New generation features should fit this shell rather than adding parallel full-width panels.

Quick Generate remains conceptually distinct from Standard Array / Point Cost / Random / Manual: Quick is a complete-character recipe/front end, while the other four are ability-generation methods inside guided creation. Do not fake Quick as a fifth ability-score method merely to fit the dropdown. When Quick is consolidated into this workspace later, treat it as a top-level creation mode that can reuse ordinary catalogs, sticky preferences, and native generation APIs.

## SRD catalog/support boundary

`packages/system-dnd5e/src/srdCatalog.ts` catalogs all SRD 5.2.1 classes, species, and the four SRD backgrounds used by the public adapter.

### Classes

All twelve SRD classes are cataloged. Guided Level 1 generation currently supports:

- Barbarian;
- Fighter;
- Monk;
- Rogue.

Spellcasting classes remain cataloged but disabled until faithful native spell/choice state exists.

### Species

All nine SRD species are cataloged. Guided generation currently supports:

- Dwarf;
- Halfling;
- Human;
- Orc.

Dragonborn, Elf, Gnome, Goliath, and Tiefling remain cataloged but disabled because required ancestry/lineage/legacy choices must be explicit rather than silently defaulted.

### Backgrounds

All four SRD backgrounds are cataloged:

- Acolyte;
- Criminal;
- Sage;
- Soldier.

Guided generation currently enables:

- Criminal;
- Soldier.

Acolyte and Sage remain visible but disabled because their Magic Initiate Origin feats require spell choices/native spell state that Character Forge does not yet model faithfully.

## Background-owned mechanical state

Background is no longer a fixed Soldier assumption in guided generation.

The selected background now owns:

- its three eligible ability scores;
- its fixed Origin feat;
- its two skill proficiencies;
- its tool proficiency;
- its equipment-package versus 50 GP choice;
- the legal +2/+1 or +1/+1/+1 ability-increase options shown by the UI.

Criminal and Soldier are generated as real native background state. The adapter independently validates the selected background's eligible increases, feat, skills, tool, and equipment-choice shape.

Human's extra Origin feat avoids duplicating the background feat in the currently supported slice. Human + Criminal therefore uses Criminal's Alert plus Savage Attacker as the Human Versatile choice; Human + Soldier uses Soldier's Savage Attacker plus Alert.

The guided builder also avoids duplicate fixed skill grants where the current class/background defaults would otherwise overlap, e.g. the current Rogue + Criminal fixture substitutes a legal class skill rather than granting Stealth twice.

## Ability methods inside guided creation

The consolidated guided path now supports all four explicit ability methods through one native builder:

- Standard Array;
- Point Cost;
- Random Generation;
- Manual Entry.

The browser switches method-specific controls dynamically. Background increases are generated from the selected background rather than a Soldier-specific switch.

Random Generation still retains seed, raw rolls, kept dice, roll-slot identity, and assignment provenance. Point Cost still uses the SRD 27-point budget. Manual and Standard Array retain their existing legality/provenance rules.

The older method APIs/tests remain useful regression coverage even though the browser no longer renders five independent creator panels.

## Native-state and adapter boundary

New guided characters continue using `dnd5e-character/0.2`; the adapter continues accepting legacy `dnd5e-character/0.1` Human Soldier Fighter documents.

Adapter version is now `0.6.0`.

Guided native state distinguishes background skill/tool/feat/equipment contributions from class and species state. Derived HP, AC, Initiative, and Passive Perception are recomputed from the selected class/background/species/abilities. Criminal's Alert, for example, contributes to Initiative through ordinary derived-state computation rather than a UI patch.

## Combined owner QA remains deferred

Do not treat the accumulated guided work as owner-accepted yet.

When the owner requests the next runtime pass, cover at least:

1. the new two-column layout: generation left, character details right;
2. class/background/species direct choices and random-from-checked behavior;
3. browser reload confirms all three acceptable pools remain sticky;
4. Background changes regenerate the legal ability-increase menu;
5. Criminal and Soldier both build valid characters;
6. Acolyte/Sage and other unsupported catalog options remain visible but unavailable;
7. Standard Array / Point Cost / Random / Manual each work from the single method dropdown and reveal only their own controls;
8. representative class/background/species combinations report `Native state valid`;
9. save/reload/reopen at least one `dnd5e-character/0.2` guided character through Parchment and confirm native state/provenance survive unchanged;
10. Quick Generate's previously accepted persistence seam remains intact at the API/host boundary.

Do not promote to `qa`/`main` until that accumulated owner pass is accepted.

## Next mechanical slices

Backgrounds are open enough for current non-spell SRD use. The next useful D&D increments should deepen real choices rather than expand catalogs by defaulting required decisions:

1. open class-owned choices for the four supported martial classes, especially skills, Fighting Style, Weapon Mastery, Expertise/tool choices where applicable;
2. model nested non-spell species ancestry/lineage decisions and enable additional species only when their native state is faithful;
3. establish a real spell/native-state seam before enabling Acolyte/Sage or spellcasting classes that require spell choices;
4. bring Quick Generate back into the consolidated workspace as a top-level creation mode rather than another ability method;
5. add guided narrative through the same catalogs, choice pools, and generation APIs.

## Random-tables companion watch point

Do not implement the random-tables companion module yet, but keep the seam visible.

The right time to begin easing it in is after enough ordinary mechanical choice dimensions exist to define a real producer/consumer contract, but before guided narrative grows large enough to invent its own ad hoc table machinery. A practical trigger is after backgrounds plus one or two additional class/species choice slices are working.

Likely early consumers include:

- personality traits;
- ideals;
- bonds;
- flaws;
- equipment/trinket suggestions;
- later system-owned flavor or encounter/character-detail tables.

Guardrail: a generic random-table engine should return inspectable structured results/choices and provenance. It should not patch CharacterDocument or D&D native state directly. System-specific datasets and mappings belong with their system/companion layer; the generic table mechanism should remain reusable across systems.

Before implementation, use concrete consumers to decide whether a table entry needs plain text, weighted alternatives, tags, native IDs, follow-up subtable references, or other structured output. Do not design a universal table schema from D&D flavor tables alone.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state remains mandatory and lossless.
- Never reconstruct retained D&D state from semantic projection data.
- Generation methods and guided choices must converge on the same native validation and persistence boundary.
- Sticky preference state is not character state; historical per-character choice provenance is.
- Do not silently default nested source-system decisions merely to mark more catalog entries supported.
- New creator UI must fit the left-controls/right-details workspace rather than multiplying full-width panels.
- Keep D&D and Foundry schemas out of shared Character Forge and Parchment contracts.
- Character Forge owns RPG-native interpretation, validation, generation choices, and provenance.
- Parchment owns project membership, generic asset lifecycle, relationships, persistence, and future sync/share behavior.
- Keep issues #2 and #3 backgrounded unless new evidence makes either blocking.
- Use only legally redistributable SRD 5.2.1 material in this public repository.
