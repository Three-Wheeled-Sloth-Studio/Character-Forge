---
type: "Product Reference"
title: "Generation Methods"
tags:
- character-forge
- product
---
# Generation Methods

Status: Base D&D ability-generation methods and the first guided class/background/species path are implemented on `dev`. This remains product direction rather than a frozen engine API.

## Initial families

### Manual

The user directly enters or selects legal character values. Character Forge validates system rules but does not invent choices.

Current D&D implementation accepts six explicit pre-background ability scores and records manual provenance without inventing a seed.

### Standard array

The rules adapter supplies the legal array and assignment constraints. The generator records assignments as decisions.

Current D&D implementation requires 15, 14, 13, 12, 10, and 8 exactly once.

### Point buy / point cost

The rules adapter owns costs, limits, and legality. Shared generation code must not hardcode D&D point-buy math.

Current D&D implementation uses the SRD 5.2.1 27-point Point Cost rules and retains construction spend in generation provenance rather than runtime character state.

### Dice generation

The underlying dice-expression capability is system-neutral so different systems can use different dice procedures without creating one hard-coded helper per ritual.

Current D&D implementation uses six `4d6kh3` roll slots. It preserves seed, every raw die, kept dice, totals, and later roll-slot-to-ability assignment. Generated score identity is retained separately from the numeric score so duplicate rolled totals are not ambiguous.

### Guided mechanical creation

The user makes ordinary system-native character choices with rules-aware guidance. Guided creation must call the same native generation/validation APIs used by other methods rather than becoming a parallel character model or one giant browser-only wizard.

The current D&D guided path supports:

- sticky/direct/random-from-acceptable Class choices;
- sticky/direct/random-from-acceptable Background choices;
- sticky/direct/random-from-acceptable Species choices;
- Criminal and Soldier as real enabled backgrounds;
- Standard Array, Point Cost, Random, or Manual as interchangeable ability methods inside one guided native builder.

### Guided narrative

The user answers fictional or preference-oriented questions and the system maps those answers to weighted mechanical choices. The mapping must remain inspectable and the important answers and generated decisions must be recorded in generation provenance.

This path should appear early enough to influence generator architecture rather than being bolted onto a completed form wizard. Narrative guidance must ultimately produce ordinary system choices that can be inspected, overridden, validated, and persisted normally.

### Quick generate

The system produces a legal complete character with minimal input, while still recording the recipe, rules sources, random seed where relevant, and major choices.

Quick Generate is a complete-character front end over ordinary native generation behavior, not a separate character-state format and not merely another ability-score method.

The existing owner-accepted Quick Generate API/host/persistence seam remains intact. The consolidated guided UI currently uses a single dropdown for the four ability-generation methods. When Quick is visually folded into that workspace, it should be represented as a top-level creation mode that can reuse sticky acceptable pools and ordinary catalogs rather than being mislabeled as a fifth ability method.

## Product rule

Generation methods converge on the same system-native validation and save boundary. A quick-generated character, manually entered character, Standard Array character, Point Cost character, randomly generated character, and narratively guided character should all result in equally valid native system state.

Method-specific information belongs primarily in generation provenance and decisions. Authoritative native state should differ only where the source system itself requires a mechanical difference.

## Creator UI rule

Do not represent every generation method as a separate full-width panel.

The Character Forge creator keeps universal choices in a stable left-side control surface and the current character details in the right-side review surface. Method-specific ability controls are selected from one dropdown and rendered dynamically. New generation methods should extend that interaction model unless they are genuinely different top-level creation modes such as Quick or Guided Narrative.

## Current D&D checkpoint

Automated-green on Character Forge `dev`:

- Quick Generate API/accepted host seam;
- Standard Array;
- Manual Ability Entry;
- Point Cost;
- Random Generation;
- guided Class / Background / Species creation;
- Criminal and Soldier background mechanics;
- all four explicit ability methods inside the guided creator.

The accumulated non-accepted generation work remains on `dev` pending combined owner runtime QA.

## Future considerations

### Partial regeneration

Generation methods should eventually support partial reroll or regeneration by step without rewriting unrelated character decisions. Random generation already provides evidence for this: roll slots have identities and can be reassigned without rerolling, while rerolling should be a separate explicit action.

Do not generalize a full dependency graph until guided creation creates enough real choice interactions to justify it.

### Random-table companion

Random tables are expected to become a companion generation capability for traits, ideals, bonds, flaws, equipment/trinket suggestions, and other structured flavor choices.

Do not implement that companion until concrete mechanical and narrative consumers define what a table result must contain. The generic table evaluator should eventually remain system-neutral while D&D datasets/mappings stay D&D-owned. Table results should feed inspectable generation decisions/suggestions with provenance rather than patching native state directly.
