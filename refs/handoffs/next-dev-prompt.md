---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge D&D 5E 2024 work from the automated-green full-class guided Level 1 checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Promoted baseline

Current promoted Character Forge branch heads remain:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Those branches include the accepted persistence seam and direct-choice/acceptable-pool visibility correction. The current broad generation batch remains **dev-only** pending explicit owner runtime acceptance.

## Current automated-green code checkpoint

- code: `ede93e159a03beb51c077b4bd610a21d2bdaf56b`
- Actions: `34125730424`
- job: `101753835916`
- **24 test files / 107 tests / 0 failures**
- refs / OKF green
- strict TypeScript green
- web build green
- native schema `dnd5e-character/0.3`
- adapter `0.13.0`

Read `refs/handoffs/currentHandoff.md` for detailed state and the owner QA checklist.

## Current support surface

Classes **12 / 12**:

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
- Warlock
- Wizard

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
- `packages/system-dnd5e/src/warlockCatalog.ts`
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

## Proven spellcasting distinctions

`spells.grants[]` remains for independent sources such as Magic Initiate.

Standard Long-Rest class slots remain distinct from Warlock Pact Magic.

Preserve these source-owned distinctions:

- Druid `Speak with Animals` is always prepared through Druidic and excluded from ordinary prepared choices.
- Ranger `Hunter's Mark` is always prepared through Favored Enemy and excluded from ordinary prepared choices.
- Wizard owns six retained Level 1 spellbook spells; its four prepared spells must be a subset.
- Bard owns three explicit musical instrument proficiencies/foci and Bardic Inspiration.
- Paladin owns Lay on Hands and Weapon Mastery.
- Ranger owns Favored Enemy and Weapon Mastery.
- Sorcerer owns Innate Sorcery.
- Wizard owns Arcane Recovery.
- Warlock owns one Level 1 Pact Magic slot at Level 1, restored on Short or Long Rest.
- Warlock chooses one genuinely Level-1-legal Eldritch Invocation; use-time choices are not frozen prematurely.
- Pact of the Tome owns three cantrips and two Level 1 ritual spells, all of which must exclude spells already prepared through Pact Magic or Magic Initiate.

## Immediate gate: owner batch QA

Do not promote before the requested accumulated runtime test.

Recommended QA:

1. confirm visible build badge/source SHA;
2. confirm all 12 SRD classes appear in the direct Class picker regardless of old acceptable-pool state;
3. build representative Bard, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard characters and confirm `Native state valid`;
4. verify Warlock one-slot Short/Long-Rest Pact Magic semantics;
5. verify all five Level 1 Warlock Invocations and Pact-of-the-Tome-only nested choices;
6. combine Warlock with Acolyte/Sage and verify Tome options exclude already-prepared Magic Initiate spells;
7. verify Druid `Speak with Animals` separation;
8. verify Ranger `Hunter's Mark` separation;
9. verify Wizard six-spell spellbook -> four prepared subset behavior;
10. exercise random-from-checked across several spell/invocation/Tome menus;
11. exercise a non-Standard-Array method;
12. save/reload/reopen representative new classes through Parchment;
13. retain sticky-pool/name/scrolling/equipment checks.

## Next substantive work after QA

### Elf / Gnome / Tiefling

This is now the largest remaining SRD Level 1 breadth seam. Audit the exact SRD 5.2.1 species text before implementation and model each species' lineage/legacy decision faithfully. Requirements:

- explicit lineage/legacy selection where the source requires it;
- Level 1 spell grants through native `spells.grants[]` where appropriate;
- future level-gated grants retained as explicit future capability metadata rather than activated early;
- source-owned spellcasting ability semantics;
- sticky direct/random acceptable-pool behavior for source menus;
- independent reopen/tamper validation;
- do not broaden generic character state just to fit D&D lineage mechanics.

Do not enable a species until all required Level 1 decisions are represented and validated.

### Human-selected Magic Initiate

Human Versatile still needs a full general Origin-feat state/provenance path before Magic Initiate is enabled there. Unlike Acolyte/Sage, the Human path must support selection of the Cleric, Druid, or Wizard list as an explicit choice, plus casting ability and spell selections. Do not treat a background-fixed Magic Initiate grant as a substitute for this general feat contract.

### Later Level 1 product work

After catalog breadth and owner acceptance, reassess:

- consolidating Quick Generate into the creator workspace as a top-level creation mode rather than an ability method;
- early guided narrative generation using the same catalogs and native generation APIs;
- the system-neutral random-table companion once concrete personality/flavor consumers define its result contract;
- the structured naming architecture rather than expanding the temporary flat name list.

## Architecture rules

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Independent grants, ordinary class spellcasting, and Pact Magic stay distinct where rules differ.
- Direct menus show all supported options; acceptable pools constrain randomization only.
- Sticky preferences are not authoritative state.
- Do not silently invent nested choices to improve support counts.
- Generator-core stays system-neutral; D&D content/rules stay `system-dnd5e`.
- Parchment remains ignorant of D&D mechanics.
- Preserve exact-SHA `dev -> qa -> main` promotion.
