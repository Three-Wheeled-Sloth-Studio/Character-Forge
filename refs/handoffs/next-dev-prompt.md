# Next Development Prompt

Continue Character Forge D&D 5E 2024 work from the Magic Initiate breadth checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Accepted cross-repo baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted. Do not reopen it without new evidence.

Accepted Character Forge `qa` / `main` checkpoint:

- `8041edb4009abce8a836faafce9a167883e92bda`

Parchment character persistence issue #24 is complete.

Background non-blockers:

- #2 historical effective-runtime name-derived IDs, only if new evidence makes it relevant;
- #3 compact Copy JSON / Download JSON controls.

## Current automated-green code checkpoint

Magic Initiate background support is green at:

- `523bc579065d81d2e144421ee080c1511a988a1a`
- Actions `33115103317`
- job `98667599352`
- 16 test files / 72 tests / 0 failures
- refs validation green
- strict TypeScript green
- web build green

New guided characters use `dnd5e-character/0.3`; adapter version is `0.9.0`. Legacy `0.1` and `0.2` reopen/validation remain supported through the isolated legacy adapter.

Read `refs/handoffs/currentHandoff.md` for the documentation head and latest owner-QA context. Do not promote current generation work to `qa` or `main` until explicit owner acceptance.

Issue #11 remains the active breadth epic. Issue #12 creator-workspace polish is complete/closed. Issues #5/#7/#8 still await accumulated runtime acceptance.

## Read first

1. `AGENTS.md`
2. `refs/README.md`
3. `refs/project.yaml`
4. `refs/handoffs/currentHandoff.md`
5. `refs/architecture/character-architecture.md`
6. `refs/architecture/translation-bridge-rpg-notes.md`
7. `refs/architecture/dnd5e-spell-state-watch.md`
8. `refs/integration/dnd5e-srd-5.2.1.md`
9. `refs/product/generation-methods.md`
10. `refs/product/choice-pools.md`
11. `refs/product/creator-workspace.md`
12. `refs/planning/roadmap.yaml`
13. `refs/testing/validationCommands.yaml`
14. GitHub issue #11

Relevant code seams:

- `packages/system-dnd5e/src/spellCatalog.ts`
- `packages/system-dnd5e/src/nativeCharacter.ts`
- `packages/system-dnd5e/src/srdCatalog.ts`
- `packages/system-dnd5e/src/guidedChoices.ts`
- `packages/system-dnd5e/src/guidedDefaults.ts`
- `packages/system-dnd5e/src/guidedGenerate.ts`
- `packages/system-dnd5e/src/guidedFirstSlice.ts`
- `packages/system-dnd5e/src/guidedCoreValidation.ts`
- `packages/system-dnd5e/src/guidedAdapterValidation.ts`
- `packages/system-dnd5e/src/adapter.ts`
- `packages/system-dnd5e/src/adapterLegacy.ts`
- `apps/web/src/stickyChoicePool.ts`
- `apps/web/src/stickyMultiChoicePool.ts`
- `apps/web/src/guidedCreationPanel.ts`
- `apps/web/src/styles.css`

## Current support surface

All source entries are cataloged. Guided generation currently enables:

- classes: Barbarian, Fighter, Monk, Rogue (4 / 12);
- backgrounds: Acolyte, Criminal, Sage, Soldier (4 / 4);
- species: Dragonborn, Dwarf, Goliath, Halfling, Human, Orc (6 / 9).

Remaining:

- classes: Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard;
- species: Elf, Gnome, Tiefling.

## Existing spell seam: preserve its meaning

The current spell model proves one reusable concept: **a spell grant from a feat or similar source**.

`Dnd5eSpellGrantState` retains:

- grant/source ID;
- spell list;
- casting ability;
- cantrips;
- prepared / always-prepared spell IDs;
- one free-cast resource and Long Rest recharge.

Acolyte uses Magic Initiate (Cleric); Sage uses Magic Initiate (Wizard). Their spell choices are explicit in the browser, generation provenance, native state, and independent adapter validation.

Do not reinterpret this as a complete class-spellcasting model. It intentionally does not encode class spell slots, prepared-count rules, known-spell rules, spellbooks, Pact Magic, or class progression.

Human-selected Magic Initiate remains disabled because the general feat also needs Druid-list support.

## Immediate substantive slice: first reusable class-spellcasting contract

Continue issue #11 by defining and implementing the smallest faithful **Level 1 class-spellcasting** extension that composes with `spells.grants[]` without conflating grants with class capability.

A strong default is Cleric or Wizard because part of the required SRD spell catalog already exists, but choose based on the cleanest reusable contract after reading the SRD source and current code. Do not choose solely because the data is already nearby.

Before enabling the class, model its actual Level 1 decisions. Examples that must not be silently defaulted include:

- Cleric: Divine Order and Level 1 spellcasting/preparation choices;
- Wizard: spellbook contents, prepared spells, and other Level 1 spellcasting semantics.

If another class provides a cleaner reusable first vertical slice, use it instead, but document why.

### Class spell-state design requirements

At minimum determine how native state represents, without duplication:

- spellcasting source/class identity;
- casting ability;
- spell-slot maximum/current state where the class uses slots;
- known versus prepared versus always-prepared spell distinctions where relevant;
- cantrip choices;
- preparation/known limits and legality;
- spellbook or equivalent source-owned collection only for classes that genuinely have one;
- how class spellcasting and feat/species spell grants coexist on one character;
- reset/recharge semantics needed for Level 1 state;
- generation provenance for each ordinary choice;
- independent adapter reconstruction/validation.

Do not force all classes into one flattened model if Pact Magic or another class genuinely needs a distinct native structure. Prefer common primitives plus explicit source-specific state.

### Definition of done for the first class slice

- one previously blocked spellcasting class is genuinely selectable in guided creation;
- all its required Level 1 source choices are explicit;
- browser controls use the established direct/acceptable-pool/random pattern where appropriate;
- native state retains its actual spellcasting capabilities without relying on generation provenance for reconstruction;
- adapter independently validates the class state and catches at least one tampering case;
- existing Acolyte/Sage Magic Initiate grants still validate and coexist cleanly with the new class state;
- all four ability-generation methods still converge on the same builder;
- legacy `0.1`/`0.2` and existing legal `0.3` documents remain reopenable;
- full `npm run verify` is green.

## Alternate adjacent slice: remaining species

If class-spellcasting design exposes a dependency that makes a clean first class slice premature, take one tightly bounded lineage species instead rather than adding a fake class fixture.

Remaining species:

- Elf;
- Gnome;
- Tiefling.

For any such species, explicitly model its lineage/legacy selection, Level 1 effects, spellcasting-ability choices where applicable, and future level-gated grants as source state/provenance rather than pretending future spells are already active.

Use the existing spell-grant primitive where it actually fits.

## Product direction fixed for default D&D 2024

Default guided sequence remains:

1. Class
2. Origin: Background, Species, related origin decisions
3. Ability Scores
4. Remaining details

Do not make this a universal Character Forge order; it is the D&D 2024 adapter/UI default.

Ordinary menus should continue using the acceptable-option model when useful:

- direct choice;
- check all acceptable choices;
- random from checked;
- user-sticky acceptable pools;
- sticky preference is not authoritative character state;
- pool/result/mode retained as per-character generation provenance.

## Creator workspace standard

Issue #12 is complete. Preserve:

- controls left, character details right;
- independent desktop scrolling;
- one-column narrow fallback;
- compact/collapsible acceptable pools;
- icon-first randomization;
- descriptive equipment labels over canonical IDs;
- compact contextual help;
- system-layer generated names with explicit provenance.

Do not expand the temporary six-name list as a substitute for a future culture/species/language-aware naming system.

## Existing core choices: do not redo without evidence

Already explicit and validated:

- class skills;
- Fighter Fighting Style;
- class equipment;
- Barbarian/Fighter/Rogue Weapon Mastery;
- Monk tool/instrument;
- Rogue Expertise and bonus language;
- origin languages;
- alignment;
- Human size / Skillful / Versatile / Skilled;
- Dragonborn Draconic Ancestry;
- Goliath Giant Ancestry;
- Acolyte/Sage Magic Initiate;
- Standard Array, Point Cost, Random Generation, Manual Entry.

## Owner QA still required before promotion

A later combined runtime pass should include:

- direct and random-from-checked behavior;
- sticky pools across reload;
- name randomization;
- independent scrolling;
- descriptive equipment choices;
- all four ability methods;
- representative native-valid Dragonborn/Goliath and Acolyte/Sage characters;
- representative new spellcasting-class character once implemented;
- Parchment save/reload/reopen of a `0.3` spell-grant character;
- no regression of the accepted Quick/Parchment seam.

Do not promote until explicitly accepted.

## Random-tables watch point

Do not start Random Tables just because spellcasting work is underway. Begin it when concrete flavor/narrative consumers are sufficient to define a clean generic result contract and before guided narrative invents parallel randomization infrastructure.

Generic table evaluation stays system-neutral; D&D datasets/mappings stay D&D-owned; results are structured/provenance-bearing and feed ordinary decisions rather than mutating native state directly.

## Architecture rules

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Generation and validation converge on one D&D-native persistence boundary.
- Sticky preferences are separate from authoritative state and historical provenance.
- Do not silently invent nested D&D choices to broaden support counts.
- Spell grants and class spellcasting are distinct concepts.
- Generator-core stays system-neutral; D&D rules/content stay `system-dnd5e`.
- Character Forge owns RPG-native interpretation, validation, choices, and provenance.
- Parchment owns generic project membership, lifecycle, relationships, persistence, and future sync/share behavior.
- Use only legally redistributable SRD 5.2.1 / CC-BY-4.0 material in the public repository.
- Preserve exact-SHA `dev -> qa -> main` promotion.
