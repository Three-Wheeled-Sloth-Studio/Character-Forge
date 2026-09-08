---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
---
# Current Handoff

Date: 2026-09-08
Branch: `dev`
Phase: D&D 5E 2024 PI 1, mechanical SRD Level 1 closeout automated-green

## Promoted baseline

The embedded persistence/reopen seam and direct-choice/acceptable-pool visibility correction remain the promoted baseline:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

The accumulated Level 1 generation batch remains dev-only pending explicit owner runtime acceptance. Do not promote it implicitly.

Parchment remains system-agnostic. Character Forge owns D&D-native interpretation, generation, validation, and provenance.

## Current automated-green checkpoint

Mechanical SRD Level 1 breadth is now complete on `dev`.

- Human Magic Initiate implementation: `732b0ad8c8c3469fd1edd1998ca5bbf2082dceef`
- current code checkpoint: `55f79a1004c14eef1635e92c602e1fefa18cab15`
- Actions: `34220401743`
- job: `102041913356`
- refs / OKF green
- strict TypeScript green
- 25 Vitest files / 117 tests / 0 failures
- web build green
- build identity: `Character Forge build 0.0.1 55f79a10`
- native schema: `dnd5e-character/0.3`
- adapter: `0.15.0`

Legacy `0.1` and `0.2` validation remain isolated and preserve their historical supported surfaces.

## Mechanical SRD Level 1 support

All currently targeted SRD Level 1 catalog entries are guided-supported:

### Classes: 12 / 12

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

### Backgrounds: 4 / 4

- Acolyte
- Criminal
- Sage
- Soldier

### Species: 9 / 9

- Dragonborn
- Dwarf
- Elf
- Gnome
- Goliath
- Halfling
- Human
- Orc
- Tiefling

Automated coverage builds and validates all 12 classes x 9 species = 108 class/species combinations through the same native-state boundary.

## Human Versatile / Magic Initiate closeout

The last mechanical SRD Level 1 breadth seam is implemented.

Human Versatile can now select Magic Initiate as a real Origin feat. The creator explicitly captures:

- Cleric, Druid, or Wizard spell list;
- Intelligence, Wisdom, or Charisma casting ability;
- two cantrips from the selected list;
- one Level 1 spell from the selected list.

The resulting feat state is retained independently in `spells.grants[]` with Human source provenance. It is not disguised as a background grant.

Magic Initiate's repeatable rule is also modeled. If Acolyte or Sage already grants Magic Initiate, Human may select Magic Initiate again only from a different spell list. The background grant and Human grant remain separate native entries and survive reopen independently.

Adapter validation rejects invalid list, casting ability, cantrip, Level 1 spell, free-cast, duplicate-list, and source-state tampering. Generation provenance records the Human list, casting ability, cantrips, and Level 1 spell separately.

Warlock Pact of the Tome duplicate exclusion now considers both background Magic Initiate and Human Magic Initiate spells, in addition to Pact Magic and current species spells.

## Spell-state boundaries to preserve

These source concepts remain intentionally distinct:

- `spells.grants[]`: independent feat-style grants such as background or Human Magic Initiate;
- `spells.speciesGrants[]`: species-owned spell capability and future level-gated species grants;
- `spells.classCasting[]`: class-owned casting state, including ordinary slots and Warlock Pact Magic.

Preserve these source-specific rules:

- Druid `Speak with Animals` is always prepared through Druidic and excluded from ordinary prepared choices.
- Ranger `Hunter's Mark` is always prepared through Favored Enemy and excluded from ordinary prepared choices.
- Wizard owns six retained Level 1 spellbook spells; its four prepared spells must be a subset.
- Bard owns three explicit musical instrument proficiencies/foci and Bardic Inspiration.
- Paladin owns Lay on Hands and Weapon Mastery.
- Ranger owns Favored Enemy and Weapon Mastery.
- Sorcerer owns Innate Sorcery.
- Wizard owns Arcane Recovery.
- Warlock owns one Level 1 Pact Magic slot restored on Short or Long Rest and one Level-1-legal Eldritch Invocation.
- Pact of the Tome owns three cantrips and two Level 1 ritual spells and excludes already-prepared class, feat, and species spells.

## Creator standards to preserve

- controls left / character review right;
- independent desktop panel scrolling;
- one-column narrow fallback;
- universal controls before method-specific controls;
- one ability-generation dropdown with dynamic controls;
- direct dropdowns show all supported options;
- checked acceptable pools constrain randomization only;
- sticky acceptable pools are preference state, not authoritative character state;
- random-from-checked and direct choices retain provenance;
- icon-first randomization including Name;
- descriptive equipment labels;
- compact contextual help;
- visible runtime build/source badge for QA.

Current name generation is still a temporary six-full-name catalog. Do not expand it into a giant flat list; future naming should be culture/species/language aware.

## Ability methods

All converge on the same guided native builder:

- Standard Array
- Point Cost
- Random 4d6 keep highest 3
- Manual Entry

## Owner accumulated QA gate

Do not promote until explicit owner acceptance. The runtime pass should cover the accumulated SRD batch rather than treating the mechanical closeout as self-promoting.

Recommended QA:

1. Confirm the visible build badge identifies the pulled `dev` revision.
2. Confirm all 12 classes and all 9 species appear in direct pickers regardless of old acceptable-pool state.
3. Build representative Bard, Druid, Paladin, Ranger, Sorcerer, Warlock, and Wizard characters and confirm `Native state valid`.
4. Verify Warlock one-slot Short/Long-Rest Pact Magic semantics and all five Level 1 Invocations.
5. Verify Pact of the Tome excludes spells already prepared through Pact Magic, Magic Initiate, or the selected species.
6. Verify Druid `Speak with Animals`, Ranger `Hunter's Mark`, and Wizard spellbook/prepared distinctions.
7. Build Drow, High Elf, and Wood Elf variants and check lineage-specific Darkvision/Speed/spell state.
8. Build Forest and Rock Gnomes and check Speak with Animals free uses versus clockwork-device capacity.
9. Build all three Tiefling legacies, including Small and Medium size choices, and check resistance/cantrip/future-grant state.
10. Build a Human with Criminal or Soldier and select Magic Initiate; verify list, ability, spells, free cast, and reopen state.
11. Build a Human Acolyte or Sage and select Magic Initiate again; confirm the background spell list is excluded, two independent grants are retained, and reopen remains valid.
12. Exercise random-from-checked on lineage/legacy, spell, feat, invocation, and Tome menus.
13. Exercise a non-Standard-Array ability method.
14. Save/reload/reopen representative new class/species combinations through Parchment.
15. Retain prior sticky-pool/name/scrolling/equipment checks.

## Next substantive work

The mechanical SRD Level 1 closeout trigger for the random-table companion is now satisfied. The next design slice can define the system-neutral random-table result contract from concrete character consumers such as traits, ideals, bonds, flaws, equipment/trinkets, tags, native IDs, and subtable references.

Do not invent a broad universal table schema before those consumers establish what the engine actually needs to return. D&D table datasets and mappings remain D&D-owned; the table evaluator itself should remain system-neutral and provenance-bearing.

Other near product work remains:

- consolidate Quick Generate into the creator workspace as a top-level creation mode rather than an ability method;
- add early guided narrative generation through the same catalogs and native generation APIs;
- replace the temporary flat name list with structured naming informed by culture/species/language consumers.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state is mandatory and lossless.
- Never reconstruct retained D&D state from semantic projection.
- Independent feat grants, species grants, standard class spellcasting, and Pact Magic remain distinct where source rules differ.
- Do not silently default nested source decisions to improve support counts.
- Generator-core stays system-neutral; D&D rules/content stay in `system-dnd5e`.
- Character Forge owns RPG-native interpretation/validation/generation/provenance.
- Parchment owns generic project membership/lifecycle/persistence/sync.
- Keep visible runtime source/version identity available in QA builds.
- Use only legally redistributable SRD 5.2.1 / CC-BY-4.0 material in the public repo.
