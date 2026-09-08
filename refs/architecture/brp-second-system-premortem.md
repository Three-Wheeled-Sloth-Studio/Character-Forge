---
type: "Architecture Reference"
title: "BRP Second-System Architecture Premortem"
tags:
- character-forge
- architecture
- brp
- second-system
---
# BRP Second-System Architecture Premortem

Status: Accepted design spike for the second rules-system implementation.

Date: 2026-09-08

Tracking: GitHub issue #13.

## Decision

Character Forge will use Chaosium's Basic Roleplaying: Universal Game Engine (BRP UGE) as the second full rules-system stress test after D&D 5E 2024.

The goal is not to make Character Forge broadly "percentile compatible." The goal is to implement one real, source-faithful BRP path and use the resulting pressure to expose assumptions that only worked because D&D came first.

Branded Call of Cthulhu remains a possible future licensed product target. It is not the source boundary for this implementation.

## Why BRP is the right second test

BRP attacks several D&D-shaped assumptions at once while remaining structured enough to implement and validate precisely:

- competence is primarily skill-centric and percentile-rated rather than class/level/d20-centric;
- profession guides starting skill allocation but does not define what a character may learn later;
- personal skills intentionally cross profession boundaries;
- skill specialties are open-ended and setting-sensitive;
- power level and optional rules materially change character creation and derived state;
- powers can be magic, mutations, psychic abilities, sorcery, or superpowers rather than one spellcasting model;
- advancement is strongly tied to use and experience checks rather than primarily to level packages;
- age can have mechanical effects rather than being purely descriptive;
- derived resources such as Sanity, Fatigue, and hit-location state may be present or absent depending on campaign rules.

This gives much more architectural information than adding another class-and-level d20 family immediately after D&D.

## Source authority for this spike

The implementation target is the 2023 Basic Roleplaying: Universal Game Engine content released by Chaosium under the ORC License.

Before code freezes a rules-source version, apply the current BRP UGE published corrections/errata and record the exact source boundary in adapter metadata.

Do not use the older 2020 BRP online SRD as the authoritative implementation source for this adapter. It is useful historical/reference material, but it is not the selected product/version boundary.

See `refs/integration/brp-uge-orc.md`.

## Representative first character

The premortem uses a deliberately narrow representative character:

- Human.
- Normal power level.
- Non-powered campaign.
- Standard BRP characteristic set.
- No Education option.
- No Sanity option.
- No Fatigue option.
- No hit-location option.
- No cultural characteristic/skill modifiers.
- No non-human rules.
- One representative profession, initially Detective unless implementation evidence favors a simpler profession.
- Professional skill allocation and personal skill allocation both retained.
- At least one specialty skill retained with an explicit specialty identity.

This profile is intentionally boring. It gives us enough BRP structure to test the architecture without turning the first slice into a generic BRP campaign-builder.

## Premortem result: shared CharacterDocument

### Result

No CharacterDocument schema change is currently justified.

The existing shared boundary already provides:

- mandatory native system state;
- system, edition, rules version, schema version, and provenance identifiers;
- arbitrary JSON-safe native payload;
- optional semantic projection;
- generation method, recipe, seed, source IDs, and decisions.

A BRP character can fit inside this boundary without pretending that BRP profession is a D&D class or that percentile skills belong in a universal schema.

### Guardrail

Do not change `character-document/0.1` merely because BRP needs a richer native payload. Change the shared document only if actual BRP implementation evidence demonstrates a cross-system requirement that cannot live in native state or generation provenance.

## Premortem result: RulesSystemAdapter

### Result

The current adapter contract also appears sufficient for the first BRP slice.

BRP needs a BRP-owned adapter that declares its rules source and validates a BRP-native payload. The existing adapter contract already supports this.

### Watch item

BRP's modularity creates a validation-context problem: a character is not fully interpretable from "BRP UGE" alone if the campaign power level and character-affecting options are unknown.

The first BRP native schema should therefore retain an effective rules profile or equivalent source-owned snapshot containing the creation options required to validate and reopen that character later.

This is native BRP state, not a new universal campaign schema.

## Premortem result: rules profile is first-class native context

D&D 5E 2024 gave Character Forge a relatively fixed source rules profile. BRP does not.

BRP UGE allows materially different character construction through choices such as:

- Normal, Heroic, Epic, or Superhuman power level;
- standard rolled characteristics or point-based creation;
- optional Education;
- optional Sanity;
- optional Fatigue;
- optional hit locations;
- optional characteristic-based skill category bonuses;
- cultural modifiers;
- non-human characteristic rules;
- one or more power systems.

A BRP character therefore needs enough retained effective configuration to answer later questions such as:

- Was this skill cap legal for the selected power level?
- Why does this character have Sanity but another BRP character does not?
- Was EDU part of the characteristic set?
- Were category bonuses included in final skill ratings?
- Which power system, if any, was enabled when the character was generated?

Do not infer this profile from the final numbers after the fact.

## Premortem result: profession is not class

A BRP profession identifies a starting training opportunity and constrains where professional skill points may be spent. It does not define a permanent capability boundary and does not prevent learning other skills in play.

Translator implication:

- do not promote a universal `class` concept from D&D;
- do not simply map BRP profession to D&D class;
- preserve profession identity as a source of starting skill-allocation eligibility and provenance;
- preserve actual resulting skill competence independently from profession label.

Bridge-RPG implication:

Professional identity and learned competence are usefully separable concepts. This supports lifepath, training, retraining, and career-change models better than one opaque class package.

## Premortem result: skill values need causal layers

BRP final skill ratings can be assembled from multiple sources, including:

- base chance;
- optional personality contribution;
- professional skill-point allocation;
- personal skill-point allocation;
- optional category bonus;
- optional cultural contribution or setting adjustment;
- later experience/training changes.

This independently confirms the causal-layer lesson already exposed by D&D ability generation.

The BRP native state should not store only a final skill percentage when construction source matters for validation, replay, advancement, or translation.

A first-slice skill entry should be able to distinguish at minimum:

- stable skill identity;
- specialty identity where relevant;
- base chance used;
- professional allocation;
- personal allocation;
- final rating.

Optional contribution fields should be added only when their corresponding option is implemented.

## Premortem result: specialty identity must remain open-ended

BRP contains skills such as Knowledge, Science, Language, Firearm, Pilot, Craft, Repair, and others whose meaningful identity includes a specialty.

The first BRP slice should prove at least one specialty skill without turning every possible specialty into a universal enum.

A specialty should retain:

- its parent skill identity;
- a stable native specialty identifier where one is available;
- a display label or source value;
- provenance when it was user-authored or setting-authored.

The shared semantic layer should not yet define a universal skill-specialty schema from this evidence alone.

## Premortem result: derived state is conditional

BRP always has some derived values, but optional rules can add or alter others.

Examples include:

- Hit Points;
- Major Wound threshold;
- Power Points;
- Experience Bonus;
- Move;
- optional Sanity;
- optional Fatigue Points;
- optional hit-location Hit Points;
- optional skill-category bonuses.

This reinforces the existing Character Forge rule that a system-native derived value should not automatically become a universal semantic field.

The BRP native payload should retain source-faithful derived values required for play and validation. The universal layer can wait until a concrete translation requires one.

## Premortem result: powers must not inherit D&D spell architecture

BRP UGE can support magic, mutations, psychic abilities, sorcery, and superpowers.

The D&D native spell seams are D&D-owned evidence, not a template for BRP.

When BRP powers are added later:

- model the BRP source rules natively;
- keep power-system identity explicit;
- preserve resource/cost/recharge or activation semantics where they differ;
- only promote common capability semantics after comparing both native systems.

Do not rename a BRP power collection to `spells` simply because D&D implemented spells first.

## Premortem result: age is potentially mechanical

BRP age can modify characteristic values and professional skill-point budgets depending on age and campaign power level.

This is useful translator evidence because "age" can be simultaneously:

- descriptive identity;
- creation input;
- source of mechanical adjustments;
- provenance for later values.

Do not assume identity fields are mechanically inert across systems.

## Premortem result: advancement evidence appears early

BRP supports experience checks tied to successful use of abilities and later improvement.

The first generation slice does not need to implement advancement, but the native skill shape should avoid making later experience-check state impossible to add cleanly.

This is another reason to keep skill entries as structured native objects rather than a flat map of display names to final percentages.

## Candidate BRP native-state shape

This is a design sketch, not a frozen schema:

```text
brp-character/0.1
  rulesProfile
    powerLevel
    characteristicGeneration
    enabledOptions[]
    enabledPowerSystems[]
  identity
    age
    gender
    profession
  characteristics
    STR/CON/SIZ/INT/POW/DEX/CHA
      initial
      adjustments[]
      final
  characteristicRolls
  derived
    hitPoints
    majorWoundLevel
    powerPoints
    experienceBonus
    move
  skillBudgets
    professional
    personal
  skills[]
    skillId
    specialty?
    baseChance
    contributions
      professional
      personal
    finalRating
  equipment
  powers?  // absent for first slice
```

The implementation should change this sketch whenever source-faithful code exposes a better boundary.

## First implementation slice

Issue #13 should begin with a package-local, non-UI vertical slice:

1. Add a BRP-owned rules-system package.
2. Add BRP UGE source and ORC license metadata.
3. Define `brp-character/0.1` only far enough to represent the representative character.
4. Retain the effective Normal-power, non-powered rules profile.
5. Support explicit characteristics and calculate core derived values.
6. Support one profession and separate professional/personal skill allocation.
7. Support at least one specialty skill.
8. Validate the native state through a BRP adapter.
9. Wrap it in the existing CharacterDocument and prove JSON round-trip preservation.
10. Do not add creator UI in this first slice.

## Explicit non-goals for the first slice

- No Call of Cthulhu-specific content.
- No semantic-model expansion.
- No CharacterDocument version bump without concrete evidence.
- No powers.
- No Sanity.
- No Fatigue.
- No hit locations.
- No EDU.
- No non-human characters.
- No campaign-builder UI.
- No exhaustive profession catalog.
- No generic percentile-system abstraction.

## Exit criteria for the architecture spike

This premortem is complete when the repo records:

- BRP UGE as the selected second-system target;
- the ORC source/licensing boundary;
- the D&D-independent pressure points above;
- the decision not to change shared CharacterDocument before implementation evidence requires it;
- a constrained first code slice tracked in issue #13.

Those conditions are now satisfied. The next step is implementation of the first BRP-native vertical slice on `dev` while the separate accumulated D&D runtime QA gate remains pending.
