---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green D&D 5E 2024 SRD 5.2.1 mechanical Level 1 closeout checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Promoted baseline

Current promoted Character Forge branch heads remain:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

The broad Level 1 generation batch remains dev-only pending explicit owner runtime acceptance. Do not promote it implicitly.

## Current automated-green code checkpoint

- Human Magic Initiate implementation: `732b0ad8c8c3469fd1edd1998ca5bbf2082dceef`
- current code checkpoint: `55f79a1004c14eef1635e92c602e1fefa18cab15`
- Actions: `34220401743`
- job: `102041913356`
- 25 test files / 117 tests / 0 failures
- refs / OKF green
- strict TypeScript green
- web build green
- build identity: `Character Forge build 0.0.1 55f79a10`
- native schema: `dnd5e-character/0.3`
- adapter: `0.15.0`

Read `refs/handoffs/currentHandoff.md` for detailed state and the owner QA checklist.

## Mechanical SRD Level 1 status

The targeted SRD Level 1 mechanical breadth is complete on `dev`:

- Classes: 12 / 12
- Backgrounds: 4 / 4
- Species: 9 / 9
- Automated class/species matrix: 108 combinations
- Human Versatile general Magic Initiate path: complete

Human Magic Initiate supports explicit Cleric/Druid/Wizard list choice, INT/WIS/CHA casting ability, two cantrips, one Level 1 spell, independent native feat spell-grant state, provenance, reopen validation, and the repeatable-feat requirement that a second Magic Initiate use a different spell list.

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

## Spell-state distinctions to preserve

- `spells.grants[]`: independent feat-style grants, including background and Human Magic Initiate.
- `spells.speciesGrants[]`: species-owned magic and explicit future level-gated spell grants.
- `spells.classCasting[]`: class-owned spellcasting, including ordinary standard-slot casters and Warlock Pact Magic with source-specific recharge semantics.

Do not flatten those into one generic spell bucket.

Preserve these source-owned distinctions:

- Druid `Speak with Animals` is always prepared through Druidic and excluded from ordinary prepared choices.
- Ranger `Hunter's Mark` is always prepared through Favored Enemy and excluded from ordinary prepared choices.
- Wizard owns six retained Level 1 spellbook spells; its four prepared spells must be a subset.
- Warlock owns one Level 1 Pact Magic slot restored on Short or Long Rest.
- Pact of the Tome owns three cantrips and two Level 1 rituals and excludes spells already prepared through Pact Magic, either Magic Initiate grant, or active species grants.
- Elf/Gnome/Tiefling lineage/legacy magic retains source identity and future Level 3/5 grants without activating those future spells at Level 1.

## Immediate gate: owner accumulated QA

Do not promote before the requested accumulated runtime test.

Recommended QA:

1. Confirm visible build badge/source SHA.
2. Confirm all 12 classes and all 9 species appear in direct pickers regardless of old acceptable-pool state.
3. Build representative Bard, Druid, Paladin, Ranger, Sorcerer, Warlock, and Wizard characters and confirm `Native state valid`.
4. Verify Warlock one-slot Short/Long-Rest Pact Magic semantics and all five Level 1 Invocations.
5. Verify Pact of the Tome duplicate exclusion across class, feat, and species spell sources.
6. Verify Druid `Speak with Animals`, Ranger `Hunter's Mark`, and Wizard spellbook/prepared distinctions.
7. Exercise Drow, High Elf, and Wood Elf lineage state.
8. Exercise Forest and Rock Gnome lineage state.
9. Exercise Abyssal, Chthonic, and Infernal Tiefling legacies plus Small/Medium size.
10. Build a Human Criminal or Soldier with Magic Initiate and verify the selected list, ability, spells, free cast, and reopen state.
11. Build a Human Acolyte or Sage with Magic Initiate again; confirm the background list is not offered, both grants are retained independently, and reopen remains valid.
12. Exercise random-from-checked across class, lineage/legacy, spell, feat, invocation, and Tome menus.
13. Exercise a non-Standard-Array ability method.
14. Save/reload/reopen representative new class/species combinations through Parchment.
15. Retain sticky-pool/name/scrolling/equipment checks.

## Next substantive work: random-table companion

The prior SRD-closeout dependency is satisfied. Begin with a short contract/design pass before implementation.

Use concrete first consumers to define the generic result shape. Likely consumers include:

- traits;
- ideals;
- bonds;
- flaws;
- equipment and trinkets;
- tags or native IDs;
- weighted results;
- subtable references.

Target architecture:

- the evaluator and deterministic/provenance behavior belong in a system-neutral companion or reusable package;
- D&D-specific tables, IDs, mappings, and source metadata remain D&D-owned;
- table output feeds ordinary generation decisions or structured suggestions rather than directly mutating native character state;
- deterministic seeds and table/source provenance must survive generation records;
- support nested/subtable evaluation only when a concrete consumer needs it;
- do not freeze a universal table schema from D&D personality tables alone.

Before implementation, identify the smallest useful generic result contract and the first one or two D&D consumers that prove it.

## Later Level 1 product work

After owner acceptance, reassess:

- consolidating Quick Generate into the creator workspace as a top-level creation mode rather than an ability method;
- early guided narrative generation using the same catalogs and ordinary generation APIs;
- structured naming rather than expanding the temporary flat name list.

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
