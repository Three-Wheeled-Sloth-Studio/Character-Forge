# Next Development Prompt

Continue Character Forge D&D 5E 2024 work from the first class-owned spellcasting and runtime-build-identity checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Accepted baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted.

`qa` / `main` remain at:

- `8041edb4009abce8a836faafce9a167883e92bda`

Do not promote the accumulated guided-generation stack until explicit owner runtime acceptance.

## Current automated-green checkpoint

Current Character Forge `dev` includes Cleric Level 1 class spellcasting and visible runtime build identity:

- `b9c70a99ff30d423ea02cf094939f8da23fd3e37`
- Actions `33183512628`
- job `98890465975`
- 18 test files / 79 tests / 0 failures
- refs green
- strict TypeScript green
- web build green
- CI build stamp: `Character Forge build 0.0.1 b9c70a99`

The underlying Cleric implementation checkpoint is `80769e8854f4b9ee80e6fffa9e497115df5fda58`.

Guided native schema remains `dnd5e-character/0.3`; adapter is `0.10.0`. Legacy `0.1`/`0.2` reopen paths remain isolated.

Read `refs/handoffs/currentHandoff.md` for the documentation head and detailed state.

## Runtime freshness checkpoint

Owner QA proved a local-runtime failure mode: after Cleric was implemented on `dev`, the Parchment-hosted Character Forge UI still showed only the old four-class bundle.

Root cause was the local static-server lifecycle:

- Character Forge `dev:web` compiles once, then serves `dist` without watch/HMR;
- Parchment previously reused any healthy Character Forge process at localhost:5174;
- a process that survived a later source pull could therefore keep serving obsolete compiled JavaScript.

The correction is deliberately split across ownership boundaries:

### Character Forge

Every `build:web` now emits `dist/build-info.json` and `dist/build-info.js` with version, exact checked-out Character Forge SHA, build timestamp, and local dirty flag. The app header always shows a compact runtime badge such as `v0.0.1 · b9c70a99`; dirty local builds append `+dirty`. Hover/title exposes the full source commit and build time. `/__health` also returns the build identity.

### Parchment Worlds

Parchment `dev` checkpoint `b6095560cfbc2284623466911c8b054e0c05ec43` rebuilds the adjacent Character Forge checkout before reusing an already-live local server. Parchment Actions `33183438679` is green. This refreshes `dist` without requiring QA to kill port 5174.

Parchment and Character Forge remain separate Git checkouts. The launcher may rebuild Character Forge but must not silently pull or switch its Git branch. The visible SHA is the primary QA evidence for which Character Forge source is actually running.

Character Forge is also wired into the Parchment workspace build/deploy/promote chain. The private Parchment deployment workflow checks out the matching Character Forge branch, requires successful `verify.yml` validation for the exact source SHA, builds the web app, publishes `/apps/character-forge/`, and exposes `source.json`. The workflow availability does not override owner-acceptance promotion guards.

## Read first

1. `AGENTS.md`
2. `refs/README.md`
3. `refs/project.yaml`
4. `refs/handoffs/currentHandoff.md`
5. `refs/architecture/character-architecture.md`
6. `refs/architecture/translation-bridge-rpg-notes.md`
7. `refs/architecture/dnd5e-spell-state-watch.md`
8. `refs/implementation/cleric-level-one-slice-2026-08-27.md`
9. `refs/integration/dnd5e-srd-5.2.1.md`
10. `refs/product/generation-methods.md`
11. `refs/product/choice-pools.md`
12. `refs/product/creator-workspace.md`
13. `refs/planning/roadmap.yaml`
14. `refs/testing/validationCommands.yaml`
15. GitHub issue #11

Relevant code seams now include:

- `packages/system-dnd5e/src/spellCatalog.ts`
- `packages/system-dnd5e/src/clericCatalog.ts`
- `packages/system-dnd5e/src/classSpellcasting.ts`
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
- `apps/web/src/guidedCreationPanel.ts`
- `apps/web/src/main.ts`
- `apps/web/src/buildInfo.ts`
- `tools/write-build-info.mjs`
- `tools/web-server.mjs`

## Current support surface

- Classes 5 / 12: Barbarian, Cleric, Fighter, Monk, Rogue
- Backgrounds 4 / 4: Acolyte, Criminal, Sage, Soldier
- Species 6 / 9: Dragonborn, Dwarf, Goliath, Halfling, Human, Orc

Remaining classes: Bard, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard.
Remaining species: Elf, Gnome, Tiefling.

## Proven spell-state architecture

Do not collapse these two source concepts.

### `spells.grants[]`

For independent feat/species-style grants such as Magic Initiate. Retains source/list/casting ability/cantrips/always-prepared spell/free-cast resource/recharge.

### `spells.classCasting[]`

For class-owned spellcasting capability. Cleric proves:

- source class and feature identity;
- spell-list identity;
- fixed class casting ability;
- class cantrips;
- prepared spell state;
- slot pools with current/maximum/recharge;
- preparation cadence;
- focus capability.

A Cleric + Acolyte retains both entries independently and validates cleanly.

Do not infer either source from the other or from generation provenance.

## Cleric: accepted automated implementation shape

Current guided Cleric explicitly represents:

- two legal skills;
- starting package vs 110 GP;
- Divine Order Protector/Thaumaturge;
- 3 Cleric cantrips for Protector / 4 for Thaumaturge;
- 4 prepared Level 1 Cleric spells;
- two Level 1 slots restored on Long Rest;
- Wisdom casting and Holy Symbol focus;
- Protector Martial weapons + Heavy Armor;
- Thaumaturge Wisdom-derived knowledge bonus.

These choices use the existing sticky acceptable-pool/direct/random controls and are retained as native state plus provenance. Adapter tamper tests cover spell slots and casting ability.

Do not reopen this shape without owner QA evidence or a real reuse conflict from the next class.

## Immediate substantive direction: reuse the class-spellcasting seam

After owner confirms the runtime badge and Cleric are visible in the local Parchment embed, continue issue #11 by choosing the next smallest faithful consumer that teaches us something reusable.

Prefer one of these paths:

1. **Another standard-slot spellcasting class** if its Level 1 choices can compose naturally with the current common primitives. Model all source-specific Level 1 features rather than enabling the class with fixture defaults.
2. **Elf/Gnome/Tiefling** if a lineage/legacy slice can reuse `spells.grants[]` cleanly and give faster breadth without distorting class spellcasting.
3. **Complete Magic Initiate generality** by adding the Druid spell list, then enable Human-selected Magic Initiate, if that is a clean bounded slice.

When selecting the next class, explicitly inspect its Level 1 rules first. Candidate considerations:

- Druid has standard slots/preparation but Primal Order and its own spell list;
- Sorcerer has standard slots but Innate Sorcery and known/prepared semantics that may teach a different seam;
- Bard adds Bardic Inspiration and different spell-selection semantics;
- Paladin/Ranger may have distinct Level 1 preparation/feature details;
- Wizard must not be flattened because spellbook state is source-owned;
- Warlock must not be flattened into standard slots because Pact Magic is genuinely different.

Pick by reusable architectural value and bounded implementation cost, not catalog order.

## Requirements for every newly enabled option

- source legal options from D&D-owned SRD 5.2.1 data;
- expose every required Level 1 decision rather than hiding a default;
- use direct/acceptable-pool/random-from-checked where appropriate;
- retain selected capability in native state, not only provenance;
- adapter independently reconstructs/validates legality;
- include at least one retained-state tampering test;
- keep all four ability methods converging on the same builder;
- preserve legacy `0.1` / `0.2` semantics;
- preserve visible runtime source/version identity;
- full `npm run verify` green;
- do not promote before owner acceptance.

## Owner QA target before promotion

The next owner pass should include runtime identity plus a real magical class:

- header build badge is visible and identifies the Character Forge SHA under test;
- Cleric appears in Class menu;
- Protector and Thaumaturge both build `Native state valid`;
- cantrip/prepared-spell direct and random choices work;
- Thaumaturge changes cantrip count from 3 to 4;
- Cleric + Acolyte shows separate class casting and Magic Initiate sources;
- representative Cleric saves/reopens unchanged through Parchment;
- existing sticky pools, name randomization, independent scrolling, equipment labels, and all four ability methods remain functional.

## Random-tables watch point

Still do not start the companion merely because magical breadth is expanding. Begin it when concrete personality/flavor consumers are sufficient to define a generic table-result contract and before guided narrative invents parallel randomization machinery.

## Architecture rules

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Spell grants and class spellcasting remain distinct source concepts.
- Use common primitives, but preserve genuinely different class mechanisms explicitly.
- Sticky preferences are not authoritative character state.
- Do not silently invent nested choices to improve support counts.
- Generator-core stays system-neutral; D&D content/rules stay `system-dnd5e`.
- Character Forge owns RPG-native interpretation, validation, choices, and provenance.
- Parchment owns generic project membership, lifecycle, relationships, persistence, and future sync/share behavior.
- Local integration may rebuild an adjacent Character Forge checkout but must never silently mutate its Git source state.
- Preserve exact-SHA `dev -> qa -> main` promotion.
