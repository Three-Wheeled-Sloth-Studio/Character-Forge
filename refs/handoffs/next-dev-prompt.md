---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge D&D 5E 2024 work from the eleven-class guided Level 1 batch.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Accepted baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted.

`qa` / `main` remain at:

- `8041edb4009abce8a836faafce9a167883e92bda`

Do not promote the accumulated guided-generation stack until explicit owner runtime acceptance.

## Current automated-green code checkpoint

The eleven-class batch is green at:

- code checkpoint: `e5863b9007d2fdac9f6bb053225c2587321821e3`
- main batch implementation: `d2fd0be576e21351243ac44a683acc63b889c74c`
- Actions: `33820208614`
- job: `100861054551`
- 22 test files / 97 tests / 0 failures
- refs / OKF green
- strict TypeScript green
- web build green

Guided native schema remains `dnd5e-character/0.3`; adapter is `0.12.0`. Legacy `0.1` / `0.2` reopen paths remain isolated.

Read `refs/handoffs/currentHandoff.md` for detailed state and owner QA targets.

## Current support surface

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

Not yet supported:

- Warlock

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

Not yet supported:

- Elf
- Gnome
- Tiefling

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

Relevant implementation seams include:

- `packages/system-dnd5e/src/spellCatalog.ts`
- `packages/system-dnd5e/src/clericCatalog.ts`
- `packages/system-dnd5e/src/druidCatalog.ts`
- `packages/system-dnd5e/src/preparedCasterCatalog.ts`
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

## Proven spell-state architecture

Do not collapse distinct source concepts merely because they all produce spells.

### `spells.grants[]`

Independent feat/species-style capabilities such as Magic Initiate. Current consumers are Acolyte and Sage.

### `spells.classCasting[]`

Current standard-slot class consumers:

- Bard
- Cleric
- Druid
- Paladin
- Ranger
- Sorcerer
- Wizard

The common record handles source/list/casting ability/cantrips/prepared and always-prepared spells/slots/preparation cadence/foci and optional spellbook state. Source-specific class mechanics remain explicit in class/resource state.

Important proven distinctions:

- Druid `Speak with Animals` is always prepared via Druidic and excluded from the four ordinary prepared choices.
- Ranger `Hunter's Mark` is always prepared via Favored Enemy and excluded from the two ordinary prepared choices.
- Wizard owns a six-spell Level 1 spellbook; its four prepared spells must be selected from that retained spellbook.
- Bard owns three explicit instrument proficiencies/foci.
- Paladin owns Lay on Hands and Weapon Mastery state.
- Ranger owns Favored Enemy and Weapon Mastery state.
- Sorcerer owns Innate Sorcery state.
- Wizard owns Arcane Recovery state.

## Immediate gate: owner batch QA

The user explicitly asked to test the expanded class work together. Do not start promotion before that pass.

Recommended QA:

1. confirm visible build badge and source SHA;
2. confirm all supported classes except Warlock appear in the direct Class picker regardless of sticky acceptable-pool contents;
3. build Bard, Druid, Paladin, Ranger, Sorcerer, Wizard and confirm `Native state valid`;
4. verify Druid `Speak with Animals` is always prepared and absent from ordinary prepared choices;
5. verify Ranger `Hunter's Mark` is always prepared/Favored Enemy and absent from ordinary prepared choices;
6. verify Wizard six-spell spellbook -> four prepared subset behavior;
7. verify Bard three-instrument direct/random choices and retained focus state;
8. use random-from-checked on several spell menus;
9. combine a new caster with Acolyte or Sage and confirm Magic Initiate remains a separate grant;
10. run at least one new class through Point Cost, Random, or Manual ability generation;
11. save/reload/reopen representative new casters through Parchment;
12. retain prior workspace/sticky/name/equipment checks.

## Next substantive implementation after QA

Issue #11 remains open. Prefer one of these evidence-rich seams:

### 1. Warlock Level 1

Warlock is now the sole unsupported SRD class. Model it explicitly rather than adapting the standard-slot structure by fiction.

Required audit/design topics include:

- Pact Magic Level 1 slot count and spell level;
- Short Rest recharge;
- cantrip and spell choices;
- Level 1 Eldritch Invocation choices;
- invocation-created spells/features and any prerequisites;
- focus/training/equipment state;
- independent reopen/tamper validation.

A dedicated Pact Magic native structure or explicit slot-mode discriminator is preferable to weakening the meaning of ordinary Long-Rest `classCasting` slots.

### 2. Elf / Gnome / Tiefling

Model lineage/legacy selections and spell grants using `spells.grants[]` where mechanically accurate. Retain level-gated future capabilities without pretending future spells are already active.

### 3. Human-selected Magic Initiate

The Druid spell catalog now exists, but Human Versatile still needs the full feat choice path wired into Human native/provenance state before Magic Initiate can be marked supported there.

Choose the next slice from owner QA evidence and architectural value; do not optimize for support-count optics.

## Requirements for every newly enabled option

- source legal options from D&D-owned SRD 5.2.1 data;
- expose every required Level 1 decision rather than hiding a fixture default;
- use direct/acceptable-pool/random-from-checked where appropriate;
- retain selected capability in native state, not only provenance;
- adapter independently reconstructs/validates legality;
- include retained-state tampering tests;
- keep all four ability methods converging on the same builder;
- preserve legacy `0.1` / `0.2` semantics;
- preserve visible runtime source/version identity;
- full `npm run verify` green;
- do not promote before owner acceptance.

## Random-tables watch point

Still do not start the companion solely because the mechanical catalog is broad. Start when concrete personality/flavor consumers are sufficient to define a generic table-result contract and before guided narrative invents parallel table machinery.

Likely early consumers: traits, ideals, bonds, flaws, equipment/trinket suggestions, and system-specific flavor tables.

## Architecture rules

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Spell grants, standard class spellcasting, and Pact Magic remain distinct where their rules differ.
- Use common primitives without erasing source-specific mechanics.
- Sticky preferences are not authoritative character state.
- Direct dropdowns show all supported options; acceptable pools constrain randomization only.
- Do not silently invent nested choices to improve support counts.
- Generator-core stays system-neutral; D&D content/rules stay `system-dnd5e`.
- Character Forge owns RPG-native interpretation, validation, choices, and provenance.
- Parchment owns generic project membership, lifecycle, relationships, persistence, and future sync/share behavior.
- Preserve exact-SHA `dev -> qa -> main` promotion.
