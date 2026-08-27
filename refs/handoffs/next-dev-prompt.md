# Next Development Prompt

Continue Character Forge D&D 5E 2024 work from the guided background + consolidated creator-workspace checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Accepted cross-repo baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted. Do not reopen it without new evidence.

Accepted Character Forge `qa` / `main` checkpoint:

- `8041edb4009abce8a836faafce9a167883e92bda`

Parchment character persistence issue #24 is complete.

Background non-blockers:

- #2: trace why the owner's effective runtime still displayed name-derived character/native-state IDs despite UUID helpers in current code;
- #3: add compact icon-first Copy JSON / Download JSON controls to the CharacterDocument inspector.

Do not prioritize either ahead of guided generation unless new evidence makes it blocking.

## Current dev checkpoint

Guided class/background/species creation plus the consolidated workspace are automated-green on `dev` at:

- code `0d0b08fc8d5ff972ed2a0597cf388f02e0bb4977`;
- GitHub Actions run `33030732051`;
- job `98382400335`;
- full `npm run verify` green;
- 14 test files / 58 tests / 0 failures;
- strict TypeScript green;
- web build green.

The D&D adapter is `0.6.0` and accepts both legacy `dnd5e-character/0.1` and guided `dnd5e-character/0.2` native state.

Issue #9 tracks the guided creation slice. Issues #5, #7, and #8 remain open because owner runtime QA of the accumulated generation stack is deliberately deferred. Do not promote current `dev` work to `qa` or `main` yet.

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
13. GitHub issues #1, #5, #7, #8, and #9

Relevant code seams:

- `packages/system-dnd5e/src/srdCatalog.ts`
- `packages/system-dnd5e/src/guidedGenerate.ts`
- `packages/system-dnd5e/src/guidedFirstSlice.ts`
- `packages/system-dnd5e/src/abilityGeneration.ts`
- `packages/system-dnd5e/src/nativeCharacter.ts`
- `packages/system-dnd5e/src/adapter.ts`
- `apps/web/src/stickyChoicePool.ts`
- `apps/web/src/guidedCreationPanel.ts`
- `apps/web/src/main.ts`
- `apps/web/src/styles.css`

## Product direction fixed for the default D&D path

Follow the official SRD 5.2.1 order by default:

1. Class
2. Origin: Background, Species, and related origin choices
3. Ability Scores
4. Remaining details

Do not hardwire this as a universal Character Forge sequence; later common table variations may reorder creation. It is the adapter/product default for D&D 2024.

For ordinary menu choices, reuse the acceptable-option pattern when practical:

- direct choice remains available;
- users may check all options they would accept;
- Character Forge may randomly pick one from that checked pool;
- checked acceptable options are user-sticky;
- sticky preference state is not authoritative native state;
- the pool actually used, selection mode, and selected result are retained in per-character generation provenance.

Class, Background, and Species now all use this pattern.

## Creator workspace standard

Do not add another stacked/full-width creator panel.

The established shell is:

- generation/editing controls left;
- character details right;
- universal controls first;
- one ability-generation dropdown;
- method-specific controls injected dynamically beneath it;
- acceptable pools compact/collapsible;
- compact icon-first random-from-pool action;
- character details sticky/visible on desktop;
- responsive one-column collapse on narrow screens.

Quick Generate is a complete-character recipe, not an ability-generation method. Keep its accepted API/host behavior intact. When it is visually consolidated, make it a top-level creation mode over ordinary catalogs/preferences rather than pretending it belongs beside Standard Array / Point Cost / Random / Manual as an ability method.

## Current catalog/support boundary

### Classes

All twelve SRD classes are cataloged. Guided generation currently enables:

- Barbarian
- Fighter
- Monk
- Rogue

Do not enable spellcasting classes until their required spell/native choice state exists.

### Backgrounds

All four SRD backgrounds are cataloged:

- Acolyte
- Criminal
- Sage
- Soldier

Currently enabled:

- Criminal
- Soldier

Acolyte and Sage remain disabled because Magic Initiate requires spell choices that the current native schema does not yet model faithfully.

Criminal/Soldier selection drives eligible ability increases, Origin feat, skills, tool, equipment-package/50-GP choice, and derived state such as Alert Initiative.

### Species

All nine SRD species are cataloged. Guided generation currently enables:

- Dwarf
- Halfling
- Human
- Orc

Do not simply flip Dragonborn / Elf / Gnome / Goliath / Tiefling to supported. Model their ancestry/lineage/legacy choices first.

## Ability methods

Guided creation now routes these through one native builder:

- Standard Array;
- Point Cost;
- Random Generation;
- Manual Entry.

The selected method's controls appear dynamically. Background ability-increase controls derive from the selected background's three eligible abilities.

Legacy standalone APIs/tests remain regression coverage; do not rebuild separate browser panels for them.

## Immediate next slice: open real martial-class choices

Deepen the four already-supported martial classes rather than broadening support with invented defaults.

Start with the smallest class-owned choices that create reusable menu/validation seams, likely:

- class skill choices;
- Fighter Fighting Style;
- Fighter / Barbarian / Rogue Weapon Mastery choices where applicable;
- Rogue Expertise selections;
- Monk tool/artisan choice where relevant.

Requirements:

- source legal choices from D&D-owned catalog/contracts;
- use the ordinary acceptable-option pool pattern where the user is selecting one from a menu and random-from-acceptable makes sense;
- for multi-select/count-N choices, extend the pattern carefully rather than forcing a single-choice abstraction;
- keep choices explicit in generation provenance;
- route them into native construction before derived-state calculation;
- adapter validates the resulting native class state independently;
- prevent duplicate proficiency grants where source rules require replacement/alternate choices;
- keep the creator inside the established left-controls/right-details workspace.

Do not build a giant all-class option dataset in one pass.

## Following slices

1. Model nested non-spell species choices and enable additional species incrementally.
2. Establish a faithful spell/native-state seam; this unblocks Acolyte/Sage and then spellcasting classes.
3. Consolidate Quick Generate into the same workspace as a top-level creation mode while preserving its accepted native/persistence path.
4. Add guided narrative through the same catalogs, choice pools, ordinary generation APIs, and provenance.
5. Add Foundry D&D 5E integration after generation is broad enough to make the adapter useful.
6. Add maintenance/advancement after those foundations.

## Random-tables companion watch point

Do not implement the companion random-tables module in this immediate slice.

Keep a deliberate integration seam. Begin the companion when backgrounds plus one or two more class/species choice slices provide concrete consumers, and before guided narrative becomes large enough to invent parallel randomization infrastructure.

Likely first consumers:

- personality traits;
- ideals;
- bonds;
- flaws;
- equipment/trinket suggestions;
- later system-specific flavor tables.

Architecture intent:

- generic table evaluation should be system-neutral;
- D&D table datasets/mappings remain D&D-owned;
- results should be inspectable and provenance-bearing;
- tables should feed ordinary generation decisions or structured suggestions, never patch CharacterDocument directly;
- do not freeze a universal table schema until concrete consumers tell us whether entries need text, weights, tags, native IDs, subtable references, or other structure.

## Deferred combined owner QA

When the owner requests the accumulated runtime pass, include:

- two-column creator layout;
- class/background/species direct and random-from-checked behavior;
- sticky pools across reload;
- Criminal/Soldier background behavior;
- dynamic background ability-increase options;
- each guided ability method via the single method dropdown;
- representative native-valid class/background/species combinations;
- Parchment save/reload/reopen of at least one `dnd5e-character/0.2` character.

Until then keep feature work automated-green on `dev`; do not promote unaccepted generation work.

## Architecture rules

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Generation methods and guided choices converge on the same system-native validation and persistence boundary.
- Sticky user preference state is separate from authoritative character state and historical generation provenance.
- Do not silently invent nested D&D choices just to broaden a support list.
- Generator-core stays system-neutral; D&D content/rules belong in `system-dnd5e`.
- Character Forge owns RPG-native interpretation, validation, generation choices, and provenance.
- Parchment owns project membership, generic asset lifecycle, relationships, persistence, and future sync/share behavior.
- Keep semantic concepts provisional until cross-system evidence supports them.
- Use only legally redistributable SRD 5.2.1 content in this public repository.
- Preserve exact-SHA `dev -> qa -> main` promotion.
