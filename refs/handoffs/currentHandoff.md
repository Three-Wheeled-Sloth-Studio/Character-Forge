---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
---
# Current Handoff

Date: 2026-09-07
Branch: `dev`
Phase: D&D 5E 2024 PI 1, broad Level 1 guided catalog expansion

## Promoted baseline

The embedded persistence/reopen seam and the direct-choice/acceptable-pool visibility correction remain the promoted baseline:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

The accumulated Level 1 generation batch remains **dev-only** pending explicit owner runtime acceptance. Do not promote it implicitly.

Parchment remains system-agnostic. Character Forge owns D&D-native interpretation, generation, validation, and provenance.

## Current automated-green code checkpoint

- code: `ede93e159a03beb51c077b4bd610a21d2bdaf56b`
- Actions: `34125730424`
- job: `101753835916`
- refs / OKF green
- strict TypeScript green
- **24 Vitest files / 107 tests / 0 failures**
- web build green
- native schema: `dnd5e-character/0.3`
- adapter: `0.13.0`

Legacy `0.1` and `0.2` validation remain isolated and preserve their historical supported surfaces.

## Current guided support

All 12 SRD classes, all 4 SRD backgrounds, and all 9 SRD species are cataloged.

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

### Species: 6 / 9

Supported:

- Dragonborn
- Dwarf
- Goliath
- Halfling
- Human
- Orc

Still blocked deliberately:

- Elf
- Gnome
- Tiefling

Do not enable the remaining species until their lineage/legacy choices and spell-grant behavior are represented faithfully.

## Warlock Level 1 checkpoint

Warlock is now a first-class guided class rather than being flattened into ordinary Long-Rest spellcasting.

Retained native state includes:

- Charisma Pact Magic;
- two Warlock cantrips;
- two prepared Level 1 Warlock spells;
- exactly one Level 1 Pact Magic slot at Warlock 1;
- Pact Magic slot recharge on **Short or Long Rest**;
- Arcane Focus capability;
- Simple weapon and Light Armor training;
- one explicit Level 1 Eldritch Invocation.

The guided Level 1 invocation catalog contains only choices genuinely legal at Level 1:

- Armor of Shadows
- Eldritch Mind
- Pact of the Blade
- Pact of the Chain
- Pact of the Tome

Use-time choices such as a pact weapon or familiar form are not falsely frozen during character creation.

### Pact of the Tome

Pact of the Tome retains the Book of Shadows choices explicitly:

- three cantrips;
- two Level 1 ritual spells.

The five Book of Shadows spell choices must not duplicate spells the Warlock already has prepared from another source. The rule is enforced across both:

- Warlock Pact Magic cantrips / prepared spells; and
- Acolyte or Sage Magic Initiate spell grants.

The browser filters already-prepared spells out of Tome menus rather than waiting for submit-time validation. Sticky acceptable pools and provenance are sanitized against the same filtered legal option set.

Dedicated tests cover class-cantrip duplication and Magic Initiate cross-source duplication in addition to Pact Magic slot/recharge and invocation validation.

## Other class-spellcasting distinctions to preserve

### `spells.grants[]`

Independent feat/species-style grants. Current consumers:

- Acolyte -> Magic Initiate (Cleric)
- Sage -> Magic Initiate (Wizard)

### `spells.classCasting[]`

Class-owned casting state. Standard-slot consumers:

- Bard
- Cleric
- Druid
- Paladin
- Ranger
- Sorcerer
- Wizard

Warlock also retains class-owned casting state, but with explicit `pact-magic` semantics and Short/Long-Rest slot recharge rather than standard slot semantics.

Preserve these source-specific rules:

- Druid `Speak with Animals` is always prepared through Druidic and excluded from ordinary prepared choices.
- Ranger `Hunter's Mark` is always prepared through Favored Enemy and excluded from ordinary prepared choices.
- Wizard owns six retained Level 1 spellbook spells; its four prepared spells must be a subset.
- Bard owns three explicit musical instrument proficiencies/foci and Bardic Inspiration.
- Paladin owns Lay on Hands and Weapon Mastery.
- Ranger owns Favored Enemy and Weapon Mastery.
- Sorcerer owns Innate Sorcery.
- Wizard owns Arcane Recovery.

## Automated coverage

The current green batch covers:

- all **12 classes x 6 supported species = 72 class/species combinations** through one native-state boundary;
- all four backgrounds and Magic Initiate source separation;
- Warlock Pact Magic slot/recharge semantics;
- all five Level 1 legal Eldritch Invocations;
- Pact of the Tome retained choices and duplicate exclusion across class and feat spell sources;
- Bard/Cleric/Druid/Paladin/Ranger/Sorcerer/Warlock/Wizard reopen/tamper behavior;
- Wizard spellbook/prepared-subset validation;
- Ranger `Hunter's Mark` always-prepared distinction;
- Druid `Speak with Animals` always-prepared distinction;
- existing ability-method, choice-pool, build-identity, and native-state tests.

## Creator standards to preserve

- controls left / character review right;
- independent desktop panel scrolling;
- one-column narrow fallback;
- universal controls before method-specific controls;
- one ability-generation dropdown with dynamic controls;
- direct dropdowns show **all supported options**;
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

## Owner batch QA target

The user requested testing the accumulated class expansion together. Recommended pass:

1. confirm the visible build badge identifies the pulled `dev` revision;
2. confirm the Class picker shows **all 12 SRD classes** regardless of old acceptable-pool checkmarks;
3. build representative Bard, Druid, Paladin, Ranger, Sorcerer, Warlock, and Wizard characters and confirm `Native state valid`;
4. for Warlock, verify Pact Magic shows one Level 1 slot with Short/Long-Rest recharge rather than ordinary two-slot Long-Rest state;
5. switch among all five Level 1 Warlock invocations and confirm Pact of the Tome alone exposes Book of Shadows choices;
6. combine Warlock + Acolyte or Sage and confirm Tome menus exclude Magic Initiate spells already prepared;
7. verify Druid `Speak with Animals` separation;
8. verify Ranger `Hunter's Mark` separation;
9. verify Wizard six-spell spellbook -> four prepared subset behavior;
10. exercise random-from-checked across class, spell, invocation, and Tome menus;
11. use a non-Standard-Array ability method on a new class;
12. save/reload/reopen representative new classes through Parchment;
13. retain prior sticky-pool/name/scrolling/equipment checks.

Do not promote until explicit owner acceptance.

## Next substantive work after batch QA

Issue #11 remains open because species breadth is incomplete. Highest-value remaining Level 1 seams are:

1. **Elf / Gnome / Tiefling**: lineage/legacy choices and their Level 1/future-gated spell grants;
2. **Human-selected Magic Initiate**: full general Origin-feat choice state/provenance, including Cleric/Druid/Wizard list choice;
3. then revisit Quick Generate consolidation, guided narrative, and the random-table companion based on concrete consumers.

Choose based on rules fidelity and architectural value, not support-count optics.

## Random-tables watch point

Still defer the companion until concrete personality/flavor consumers define the generic result contract. Likely first consumers remain traits, ideals, bonds, flaws, equipment/trinkets, and later system-specific flavor tables. Start before Guided Narrative creates parallel table machinery.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native state is mandatory and lossless.
- Never reconstruct retained D&D state from semantic projection.
- Independent spell grants, standard class spellcasting, and Pact Magic remain mechanically distinct where the source rules differ.
- Do not silently default nested source decisions to improve support counts.
- Generator-core stays system-neutral; D&D rules/content stay in `system-dnd5e`.
- Character Forge owns RPG-native interpretation/validation/generation/provenance.
- Parchment owns generic project membership/lifecycle/persistence/sync.
- Keep visible runtime source/version identity available in QA builds.
- Use only legally redistributable SRD 5.2.1 / CC-BY-4.0 material in the public repo.
