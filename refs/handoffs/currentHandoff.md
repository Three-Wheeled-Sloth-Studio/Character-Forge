# Current Handoff

Date: 2026-08-27
Branch: dev
Phase: D&D 5E 2024 PI 1, guided core choices automated-green; owner QA mostly positive with catalog-breadth and workspace-polish follow-ups

## Accepted baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted. Do not reopen it without new evidence.

Accepted Character Forge checkpoint on `qa` and `main`:

- `8041edb4009abce8a836faafce9a167883e92bda`

Parchment character persistence issue #24 is complete.

Background non-blockers remain:

- issue #2: trace the effective runtime path that once showed name-derived character/native-state IDs despite UUID helpers in current code;
- issue #3: add compact icon-first Copy JSON / Download JSON controls to the CharacterDocument inspector.

## Current development checkpoint

The guided core Level 1 choice slice is automated-green on `dev` at:

- code checkpoint `5e48aa5a5c7d40bff05d2506942bae1681d8a271`;
- GitHub Actions run `33098187264`;
- job `98608540517`;
- full `npm run verify` green;
- refs validation green;
- strict TypeScript green;
- 15 Vitest files / 63 tests / 0 failures;
- web TypeScript build green.

New guided characters use `dnd5e-character/0.3`; adapter version is `0.7.0`. Legacy `dnd5e-character/0.1` and `0.2` reopen/validation paths remain supported.

Nothing in the accumulated generation stack has been promoted beyond `dev`; owner runtime acceptance is still incomplete.

Tracking:

- issue #9: guided class/background/species choice pools and creator workspace;
- issue #10: guided D&D core Level 1 choices and blank-name regression;
- issue #11: broaden guided D&D toward full SRD Level 1 catalog support;
- issue #12: creator workspace QA polish: name randomize, equipment labels, independent scrolling, help;
- issues #5, #7, and #8 remain open for the accumulated ability-generation runtime acceptance.

## Current guided mechanics

The default D&D 2024 guided sequence follows the SRD order:

1. Class
2. Origin: Background, Species, and related origin decisions
3. Ability Scores
4. Remaining details

Character Forge uses a reusable acceptable-option pattern for menu decisions:

- direct choice remains available;
- the player may check every option they would accept;
- Character Forge may randomly select from that checked pool;
- acceptable pools are user-sticky across browser sessions;
- sticky preference state is not authoritative character state;
- the acceptable pool used, selection mode, and selected result are retained in per-character generation provenance.

The pattern now covers both single-choice and count-N choices where practical.

## Creator workspace standard

The established workspace is:

- generation/editing controls in the left column;
- current character details in the right column;
- universal controls first;
- ability-generation method selected through one dropdown;
- only method-specific controls render below it;
- acceptable pools stay compact/collapsible;
- random-from-acceptable uses compact icon-first actions;
- responsive narrow layouts collapse to one column.

Owner QA added an explicit refinement: on desktop, the left generation column and right character-detail column should scroll independently. Do not let a long creator form drag the character review surface away, or vice versa. Track in issue #12.

Quick Generate remains a complete-character recipe/front end, not a fifth ability-generation method. When visually consolidated later, make it a top-level creation mode over the same catalogs/preferences/native APIs.

## Core Level 1 choices now explicit

The `0.3` guided slice replaces previous hidden fixture decisions for the currently enabled classes/species with explicit native choices and provenance, including:

- class skill choices;
- Fighter Fighting Style;
- class starting equipment choice;
- Barbarian/Fighter/Rogue Weapon Mastery choices where granted;
- Monk tool/instrument proficiency;
- Rogue Expertise and bonus language;
- Common plus two origin language choices;
- alignment;
- Human Small/Medium size;
- Human Skillful skill choice;
- Human Versatile Origin-feat choice;
- Human Skilled follow-up proficiency choices where selected.

The adapter independently validates newly required `0.3` choice state while routing older legal `0.2` documents through the retained legacy guided validator.

## Generated-name behavior

The blank-name regression is fixed in the system layer rather than the browser.

Current implementation is intentionally minimal:

- `packages/system-dnd5e/src/nameGeneration.ts` owns generated-name selection;
- six hardcoded full names currently form the entire temporary catalog;
- the shared system-neutral seeded PRNG selects one;
- an explicit user-entered name always wins;
- when name is blank, the ability-generation seed is reused when available; otherwise a separate generated name seed is created.

This is a placeholder, not the desired long-term naming architecture. Do not expand it by merely growing a flat hardcoded list. Future name generation should be designed around concrete culture/species/language consumers, structured or weighted name components where useful, deterministic provenance, and eventual interoperability with Worldbuilding culture/language/name-generation systems.

Owner QA requests the same compact randomize action beside Character Name that other randomizable fields use. Track in issue #12.

## SRD catalog/support boundary and owner QA scope correction

All twelve SRD classes, all four SRD backgrounds, and all nine SRD species are cataloged, but guided generation still enables only:

### Classes

- Barbarian
- Fighter
- Monk
- Rogue

### Backgrounds

- Criminal
- Soldier

### Species

- Dwarf
- Halfling
- Human
- Orc

Owner QA explicitly called out that seeing only 4 / 2 / 4 is not the desired stopping point. The previous implementation interpreted "rest of core options" as deepening choices for the currently supported subset; that was too narrow. Treat broader SRD Level 1 enablement as the next substantive direction, tracked by issue #11.

Do not solve the breadth gap by silently defaulting nested source-system decisions. Remaining enablement requires real support for:

- Dragonborn / Elf / Gnome / Goliath / Tiefling ancestry, lineage, legacy, or other nested species choices;
- a faithful spell/native-state seam sufficient for Magic Initiate;
- Acolyte and Sage once their Magic Initiate choices are explicit;
- spellcasting classes and their real Level 1 spell/feature choices;
- any remaining class-specific Level 1 choices and derived native effects.

Use only legally redistributable SRD 5.2.1 / CC-BY-4.0 material in this public repository.

## Starting equipment QA

Mechanical equipment choices are now explicit, but the browser currently exposes source option identity too literally (for example, `A` / `B`). Owner QA rejected that presentation.

UI should display human-readable package contents / gold alternatives while retaining canonical source option identity underneath for native state and provenance. Track in issue #12.

## Help / information affordance

Owner QA requested compact information/help affordances for items such as generation methods. This is low priority but should not be lost.

Treat it as reusable creator-workspace behavior: explain choices on demand without permanently consuming panel space. Track in issue #12.

## Ability methods inside guided creation

The consolidated guided path supports:

- Standard Array;
- Point Cost;
- Random Generation;
- Manual Entry.

Random Generation retains seed, raw rolls, kept dice, roll-slot identity, and assignment provenance. Point Cost uses the SRD 27-point budget. Manual and Standard Array retain their existing legality/provenance rules.

## Random-tables companion watch point

Do not implement the random-tables companion solely because of this QA pass, but the integration trigger is getting closer.

The intended first consumers remain personality traits, ideals, bonds, flaws, equipment/trinket suggestions, and later system-specific flavor tables. Begin the companion once enough ordinary mechanical/catalog choice seams exist to define the producer/consumer contract and before guided narrative starts inventing parallel randomization infrastructure.

Guardrail: a generic table engine returns inspectable structured results and provenance. It does not patch CharacterDocument or D&D native state directly. System-specific datasets and mappings stay system-owned.

## Owner QA status, 2026-08-27

Positive / functional:

- consolidated left-controls/right-details workspace is broadly working;
- explicit core choices are broadly functional;
- overall direction and progress accepted as good.

Follow-ups before treating the accumulated guided stack as fully accepted:

1. broaden beyond the current 4 classes / 2 backgrounds / 4 species rather than treating that subset as complete;
2. add compact name randomize control;
3. replace equipment `A/B` UI with descriptive choices;
4. make left/right panel scrolling independent on desktop;
5. retain low-priority contextual info/help affordances;
6. continue checking representative generated characters report `Native state valid`;
7. eventually save/reload/reopen representative `0.3` guided characters through Parchment before promotion.

Do not promote to `qa` / `main` until the accumulated owner pass is explicitly accepted.

## Immediate next direction

1. Address the small creator-workspace QA polish from issue #12 where it is cheap and adjacent.
2. Begin issue #11 by broadening faithful SRD Level 1 support, choosing implementation order by the smallest useful dependency unlocks rather than by catalog order.
3. Likely establish the spell/native-state seam early because it unlocks Acolyte, Sage, and most remaining classes; do not overbuild spellcasting beyond Level 1 needs for this PI.
4. In parallel or immediately before spell work, enable additional non-spell species whose nested choices can be modeled cheaply and faithfully.
5. Keep the random-tables companion as a deliberate watch point rather than pulling it in prematurely.

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
