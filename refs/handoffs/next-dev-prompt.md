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

## Promoted baseline

Current promoted Character Forge branch heads are:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Those branches include the accepted persistence seam and direct-choice/acceptable-pool visibility correction. The **current eleven-class batch remains dev-only** pending explicit owner runtime acceptance.

## Current automated-green code checkpoint

- code: `e5863b9007d2fdac9f6bb053225c2587321821e3`
- batch implementation: `d2fd0be576e21351243ac44a683acc63b889c74c`
- Actions: `33820208614`
- job: `100861054551`
- **22 test files / 97 tests / 0 failures**
- refs / OKF green
- strict TypeScript green
- web build green
- native schema `dnd5e-character/0.3`
- adapter `0.12.0`

Read `refs/handoffs/currentHandoff.md` for the detailed batch state and owner QA checklist.

## Current support surface

Classes **11 / 12**:

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

Warlock remains intentionally unsupported.

Backgrounds **4 / 4**: Acolyte, Criminal, Sage, Soldier.

Species **6 / 9**: Dragonborn, Dwarf, Goliath, Halfling, Human, Orc.

Remaining species: Elf, Gnome, Tiefling.

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
- `apps/web/src/guidedCreationPanel.ts`
- `apps/web/src/main.ts`

## Proven class-spellcasting distinctions

`spells.grants[]` remains for independent sources such as Magic Initiate.

`spells.classCasting[]` currently serves Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, and Wizard where standard Level 1 slot semantics fit.

Preserve these source-owned distinctions:

- Druid `Speak with Animals` is always prepared through Druidic and excluded from ordinary prepared choices.
- Ranger `Hunter's Mark` is always prepared through Favored Enemy and excluded from ordinary prepared choices.
- Wizard owns six retained Level 1 spellbook spells; its four prepared spells must be a subset.
- Bard owns three explicit musical instrument proficiencies/foci and Bardic Inspiration.
- Paladin owns Lay on Hands and Weapon Mastery.
- Ranger owns Favored Enemy and Weapon Mastery.
- Sorcerer owns Innate Sorcery.
- Wizard owns Arcane Recovery.

## Immediate gate: owner batch QA

Do not promote before the requested batch test.

Recommended QA:

1. confirm visible build badge/source SHA;
2. confirm all supported classes except Warlock appear in the direct Class picker regardless of old acceptable-pool state;
3. build Bard, Druid, Paladin, Ranger, Sorcerer, Wizard and confirm `Native state valid`;
4. verify Druid `Speak with Animals` separation;
5. verify Ranger `Hunter's Mark` separation;
6. verify Wizard six-spell spellbook -> four prepared subset behavior;
7. verify Bard three-instrument direct/random choices;
8. exercise random-from-checked across several spell menus;
9. combine a new caster with Acolyte/Sage and confirm Magic Initiate stays a separate grant;
10. exercise a non-Standard-Array method;
11. save/reload/reopen representative new classes through Parchment;
12. retain sticky-pool/name/scrolling/equipment checks.

## Next substantive work after QA

### Warlock Level 1

Warlock is the sole unsupported class and must introduce real Pact Magic rather than masquerading as ordinary Long-Rest casting. Audit/model:

- Pact Magic slot count and slot level;
- Short Rest recharge;
- cantrip/spell choices;
- Level 1 Eldritch Invocation choices and prerequisites;
- invocation-created spell/capability state;
- focus/training/equipment;
- reopen/tamper validation.

Prefer a dedicated Pact Magic structure or explicit casting-mode contract if the source rules require it.

### Elf / Gnome / Tiefling

Model lineage/legacy selection and Level 1 spell grants through `spells.grants[]` where accurate. Keep future level-gated grants explicit without activating them early.

### Human-selected Magic Initiate

The Druid spell catalog now exists, but Human Versatile still needs the full general feat state/provenance path before this option is enabled.

## Random-tables watch point

Do not start solely because mechanical breadth is high. Start when traits/ideals/bonds/flaws/equipment or other concrete consumers define the generic table-result contract, and before Guided Narrative invents parallel randomization infrastructure.

## Architecture rules

- Native state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Spell grants, standard class spellcasting, and Pact Magic stay distinct where rules differ.
- Direct menus show all supported options; acceptable pools constrain randomization only.
- Sticky preferences are not authoritative state.
- Do not silently invent nested choices to improve support counts.
- Generator-core stays system-neutral; D&D content/rules stay `system-dnd5e`.
- Parchment remains ignorant of D&D mechanics.
- Preserve exact-SHA `dev -> qa -> main` promotion.
