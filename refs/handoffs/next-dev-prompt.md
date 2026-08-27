# Next Development Prompt

Continue Character Forge D&D 5E 2024 work from the guided core-choice checkpoint and 2026-08-27 owner QA.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Accepted cross-repo baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted. Do not reopen it without new evidence.

Accepted Character Forge `qa` / `main` checkpoint:

- `8041edb4009abce8a836faafce9a167883e92bda`

Parchment character persistence issue #24 is complete.

Background non-blockers:

- #2: trace historical effective-runtime name-derived IDs if new evidence makes it relevant;
- #3: compact icon-first Copy JSON / Download JSON controls.

## Current dev checkpoint

Guided core Level 1 choices are automated-green on `dev` at code checkpoint:

- `5e48aa5a5c7d40bff05d2506942bae1681d8a271`
- Actions `33098187264`
- job `98608540517`
- 15 test files / 63 tests / 0 failures
- refs validation green
- strict TypeScript green
- web build green

New guided characters use `dnd5e-character/0.3`; adapter version is `0.7.0`. Legacy `0.1` and `0.2` validation/reopen remain supported.

Subsequent documentation commits record owner QA; read current `dev` handoff rather than assuming the code checkpoint is branch head.

Issues:

- #9 guided class/background/species choice pools and creator workspace;
- #10 guided core Level 1 choices and generated-name regression;
- #11 broaden guided D&D to full SRD Level 1 catalog support;
- #12 creator workspace QA polish;
- #5/#7/#8 remain open for accumulated ability-generation runtime acceptance.

Do not promote current generation work to `qa` or `main` until the owner explicitly accepts the accumulated runtime pass.

## Read first

1. `AGENTS.md`
2. `refs/README.md`
3. `refs/project.yaml`
4. `refs/handoffs/currentHandoff.md`
5. `refs/architecture/character-architecture.md`
6. `refs/architecture/translation-bridge-rpg-notes.md`
7. `refs/integration/dnd5e-srd-5.2.1.md`
8. `refs/product/generation-methods.md`
9. `refs/product/choice-pools.md`
10. `refs/product/creator-workspace.md`
11. `refs/planning/roadmap.yaml`
12. `refs/testing/validationCommands.yaml`
13. GitHub issues #9, #10, #11, and #12

Relevant code seams now include:

- `packages/system-dnd5e/src/srdCatalog.ts`
- `packages/system-dnd5e/src/guidedChoices.ts`
- `packages/system-dnd5e/src/guidedDefaults.ts`
- `packages/system-dnd5e/src/guidedGenerate.ts`
- `packages/system-dnd5e/src/guidedFirstSlice.ts`
- `packages/system-dnd5e/src/guidedCoreValidation.ts`
- `packages/system-dnd5e/src/guidedAdapterValidation.ts`
- `packages/system-dnd5e/src/nameGeneration.ts`
- `packages/system-dnd5e/src/nativeCharacter.ts`
- `packages/system-dnd5e/src/adapter.ts`
- `apps/web/src/stickyChoicePool.ts`
- `apps/web/src/stickyMultiChoicePool.ts`
- `apps/web/src/guidedCreationPanel.ts`
- `apps/web/src/main.ts`
- `apps/web/src/styles.css`

## Product direction fixed for default D&D 2024

Use the official default sequence:

1. Class
2. Origin: Background, Species, related origin choices
3. Ability Scores
4. Remaining details

Do not turn this into a universal Character Forge ordering; future table/common variations may reorder creation.

For ordinary menus, reuse the acceptable-option pattern where practical:

- direct choice;
- check all acceptable choices;
- random from checked;
- user-sticky acceptable pools;
- sticky preference is not character state;
- pool used, selected result, and direct/random mode retained as generation provenance.

This pattern now supports both one-of and count-N decisions.

## Creator workspace standard + QA corrections

Keep:

- generation/editing controls left;
- character details right;
- universal controls before method-specific controls;
- one ability-generation dropdown;
- dynamic method-specific controls;
- compact/collapsible acceptable pools;
- compact icon-first randomization actions;
- responsive one-column collapse.

Add/fix from owner QA, tracked in #12:

1. **Name randomize control**: add the same compact randomize affordance beside Character Name. It must call the system-layer name generator.
2. **Starting equipment presentation**: do not show bare source identities such as `A` / `B`. Show descriptive package contents / gold alternatives while retaining canonical source IDs underneath.
3. **Independent scrolling**: on desktop, the generation column and character-details column scroll independently.
4. **Contextual info/help**: low priority, but retain compact help affordances for generation methods and other choices that need explanation without permanently consuming layout space.

Current name generation is a temporary six-name hardcoded catalog selected by the shared seeded PRNG. Do not expand it into a giant flat list. Future naming should become a structured culture/species/language-aware system with deterministic provenance and eventual Worldbuilding language/culture interoperability.

## Core choices already opened

Do not redo the `0.3` martial/core-choice slice without new evidence. It now includes:

- class skills;
- Fighter Fighting Style;
- class starting equipment;
- Barbarian/Fighter/Rogue Weapon Mastery;
- Monk tool/instrument;
- Rogue Expertise and bonus language;
- origin languages;
- alignment;
- Human size / Skillful / Versatile / supported Skilled follow-up choices;
- explicit provenance and independent adapter validation.

Blank name now generates in the D&D system layer.

## Immediate substantive slice: broaden SRD Level 1 support (#11)

Owner QA explicitly rejected treating the current 4 classes / 2 backgrounds / 4 species as sufficient breadth.

Current enabled subset:

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

All 12 SRD classes, 4 SRD backgrounds, and 9 SRD species are already cataloged. The next job is to make more of them genuinely generatable.

### Implementation strategy

Choose order by dependency unlock and smallest faithful vertical slices, not alphabetically.

Strong likely sequence:

1. Model one or more additional non-spell species whose nested choices are cheap and well-bounded.
2. Establish the minimum faithful **spell/native-state seam** needed for Level 1 generation.
3. Use that seam to enable Magic Initiate correctly, which unlocks Acolyte and Sage.
4. Incrementally enable spellcasting classes with their real Level 1 spell/feature decisions.
5. Continue species lineage/ancestry/legacy support until all SRD species are enabled.

Do not overbuild spellcasting beyond what Level 1 generation needs for this PI.

### Requirements for every newly enabled option

- source legal choices from D&D-owned SRD contracts/data;
- no invented defaults for nested choices;
- route selections into native construction before derived-state calculation;
- record inspectable generation decisions/provenance;
- adapter independently validates native state;
- use sticky acceptable-pool/random-from-checked behavior where the source presents an ordinary menu and it improves generation;
- older `dnd5e-character/0.1`, `0.2`, and `0.3` documents remain valid/reopenable;
- public repo includes only legally redistributable SRD 5.2.1 / CC-BY-4.0 material.

## Ability methods

Guided creation continues to support through one native builder:

- Standard Array
- Point Cost
- Random Generation
- Manual Entry

Do not recreate separate full browser panels for them.

## Random-tables companion watch point

Do not start Random Tables merely because catalog breadth work is beginning, but reassess the seam as this slice progresses.

The companion should begin once concrete consumers are sufficient to define its result contract and before guided narrative creates parallel randomization infrastructure.

Likely consumers:

- personality traits;
- ideals;
- bonds;
- flaws;
- equipment/trinket suggestions;
- later system-specific flavor tables.

Architecture:

- generic evaluation remains system-neutral;
- D&D datasets/mappings stay D&D-owned;
- results are structured, inspectable, and provenance-bearing;
- tables feed ordinary generation decisions or suggestions rather than mutating CharacterDocument/native state directly.

## Owner QA still required before promotion

Future combined runtime acceptance should include:

- left/right workspace including independent scroll behavior;
- direct and random-from-checked behavior including Name;
- sticky pools across reload;
- descriptive equipment choices;
- all four ability methods through the dynamic dropdown;
- representative native-valid combinations from newly enabled class/background/species breadth;
- Parchment save/reload/reopen of representative `dnd5e-character/0.3` or later guided characters;
- no regression of the previously accepted Quick/Parchment seam.

## Architecture rules

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Generation methods and guided choices converge on one system-native validation/persistence boundary.
- Sticky preferences are separate from authoritative state and historical provenance.
- Do not silently invent nested D&D choices to broaden support counts.
- Generator-core stays system-neutral; D&D content/rules stay `system-dnd5e`.
- Character Forge owns RPG-native interpretation, validation, choices, and provenance.
- Parchment owns project membership, generic lifecycle, relationships, persistence, and future sync/share behavior.
- Preserve exact-SHA `dev -> qa -> main` promotion.
