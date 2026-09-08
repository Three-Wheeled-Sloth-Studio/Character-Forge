---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge D&D 5E 2024 work from the automated-green full SRD Level 1 class/background/species breadth checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Promoted baseline

Current promoted Character Forge branch heads remain:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Those branches include the accepted persistence seam and direct-choice/acceptable-pool visibility correction. The broad generation batch remains **dev-only** pending explicit owner runtime acceptance.

## Current automated-green code checkpoint

- code: `e8a0b1e778299a7ce0f4b2e6bfe1432c7cdd35cb`
- Actions: `34215046544`
- job: `102024717908`
- **25 test files / 114 tests / 0 failures**
- refs / OKF green
- strict TypeScript green
- web build green
- native schema `dnd5e-character/0.3`
- adapter `0.14.0`

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

Species **9 / 9**: Dragonborn, Dwarf, Elf, Gnome, Goliath, Halfling, Human, Orc, Tiefling.

The automated matrix now covers **108 class/species combinations** through one native-state boundary.

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

Relevant code seams now include:

- `packages/system-dnd5e/src/speciesCatalog.ts`
- `packages/system-dnd5e/src/speciesState.ts`
- `packages/system-dnd5e/src/speciesAdapterValidation.ts`
- `packages/system-dnd5e/src/speciesGenerate.test.ts`
- `packages/system-dnd5e/src/spellCatalog.ts`
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

## Spell-state distinctions to preserve

- `spells.grants[]`: independent feat-style grants such as Magic Initiate.
- `spells.speciesGrants[]`: species-owned magic and explicit future level-gated spell grants.
- `spells.classCasting[]`: class-owned spellcasting, including ordinary standard-slot casters and Warlock Pact Magic with source-specific recharge semantics.

Do not flatten those into one generic spell bucket.

Preserve these source-owned distinctions:

- Druid `Speak with Animals` is always prepared through Druidic and excluded from ordinary prepared choices.
- Ranger `Hunter's Mark` is always prepared through Favored Enemy and excluded from ordinary prepared choices.
- Wizard owns six retained Level 1 spellbook spells; its four prepared spells must be a subset.
- Warlock owns one Level 1 Pact Magic slot restored on Short or Long Rest.
- Pact of the Tome owns three cantrips and two Level 1 rituals and excludes spells already prepared through Pact Magic, Magic Initiate, or species grants.
- Elf/Gnome/Tiefling lineage/legacy magic retains source identity and future Level 3/5 grants without activating those future spells at Level 1.

## Immediate gate: owner accumulated QA

Do not promote before the requested accumulated runtime test.

Recommended QA:

1. confirm visible build badge/source SHA;
2. confirm all 12 classes and all 9 species appear in direct pickers regardless of old acceptable-pool state;
3. build representative Bard, Druid, Paladin, Ranger, Sorcerer, Warlock, and Wizard characters and confirm `Native state valid`;
4. verify Warlock one-slot Short/Long-Rest Pact Magic semantics and all five Level 1 Invocations;
5. verify Pact of the Tome duplicate exclusion across class, feat, and species spell sources;
6. verify Druid `Speak with Animals`, Ranger `Hunter's Mark`, and Wizard spellbook/prepared distinctions;
7. exercise Drow, High Elf, and Wood Elf lineage state;
8. exercise Forest and Rock Gnome lineage state;
9. exercise Abyssal, Chthonic, and Infernal Tiefling legacies plus Small/Medium size;
10. exercise random-from-checked across class, lineage/legacy, spell, invocation, and Tome menus;
11. exercise a non-Standard-Array ability method;
12. save/reload/reopen representative new class/species combinations through Parchment;
13. retain sticky-pool/name/scrolling/equipment checks.

## Next substantive work after QA

### Human-selected Magic Initiate

This is the remaining important SRD Level 1 breadth seam tracked by issue #11.

Human Versatile needs a full general Origin-feat state/provenance path before Magic Initiate is enabled there. Unlike Acolyte/Sage, the Human path must support explicit selection of the Cleric, Druid, or Wizard list, casting ability, two cantrips, and one Level 1 spell while preserving the general feat source rather than pretending it came from a background.

Requirements:

- model a reusable general Origin-feat choice seam rather than a Human-only spell hack;
- preserve source/provenance separately from feat-derived spell state;
- avoid duplicating the selected background's fixed Origin feat;
- keep direct menus fully visible and acceptable pools randomization-only;
- independently validate reopen/tamper behavior;
- do not silently select nested Magic Initiate choices.

### Later Level 1 product work

After catalog breadth and owner acceptance, reassess:

- consolidating Quick Generate into the creator workspace as a top-level creation mode rather than an ability method;
- early guided narrative generation using the same catalogs and native generation APIs;
- the system-neutral random-table companion once concrete personality/flavor consumers define its result contract;
- the structured naming architecture rather than expanding the temporary flat name list.

## Architecture rules

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Independent feat grants, species grants, ordinary class spellcasting, and Pact Magic stay distinct where rules differ.
- Direct menus show all supported options; acceptable pools constrain randomization only.
- Sticky preferences are not authoritative state.
- Do not silently invent nested choices to improve support counts.
- Generator-core stays system-neutral; D&D content/rules stay `system-dnd5e`.
- Parchment remains ignorant of D&D mechanics.
- Preserve exact-SHA `dev -> qa -> main` promotion.
