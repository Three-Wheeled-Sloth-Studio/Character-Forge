---
type: "Product Reference"
title: "Generation Methods"
tags:
- character-forge
- product
---
# Generation Methods

Status: Base D&D ability-generation methods, guided mechanical creation, top-level Quick Generate, the first system-neutral random-table evaluator, structured D&D name-suggestion provenance, and BRP naming-content ownership discovery are implemented on `dev`. This remains product direction rather than a frozen engine API.

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
- Standard Array, Point Cost, Random, or Manual as interchangeable ability methods inside one guided native builder;
- provider/source/version/seed provenance when a generated display name is accepted.

### Guided narrative

The user answers fictional or preference-oriented questions and the system maps those answers to weighted mechanical choices. The mapping must remain inspectable and the important answers and generated decisions must be recorded in generation provenance.

This path should appear early enough to influence generator architecture rather than being bolted onto a completed form wizard. Narrative guidance must ultimately produce ordinary system choices that can be inspected, overridden, validated, and persisted normally.

Guided Narrative remains the next concrete D&D creation-mode proof. Do not turn narrative answers into a universal personality ontology or a second native character model. The first slice should map a small set of explicit answers to existing D&D choices through system-owned, inspectable mapping data and then use the ordinary guided/native generation path.

### Quick generate

The system produces a legal complete character with minimal input, while still recording the recipe, rules sources, random seed where relevant, and major choices.

Quick Generate is a complete-character front end over ordinary native generation behavior, not a separate character-state format and not merely another ability-score method.

D&D now exposes Quick Generate as a top-level creation mode beside Guided Mechanical. The Quick panel exposes only the current system API inputs, optional name and optional seed, and calls `quickGenerateDnd5eFirstSlice()` directly. Blank values retain the existing generated-name/generated-seed behavior. Explicit seeds retain the existing deterministic mechanics while opaque character/native IDs remain newly generated.

Quick results publish through the same `onCharacter` review/save/host boundary as Guided creation. No parallel CharacterDocument or persistence model was introduced.

`Randomize All` is hidden and disabled in Quick mode. Quick owns its own randomization through `Generate character`, preventing hidden Guided controls from being triggered accidentally.

## Product rule

Generation methods converge on the same system-native validation and save boundary. A quick-generated character, manually entered character, Standard Array character, Point Cost character, randomly generated character, and narratively guided character should all result in equally valid native system state.

Method-specific information belongs primarily in generation provenance and decisions. Authoritative native state should differ only where the source system itself requires a mechanical difference.

## Creator UI rule

Do not represent every generation method as a separate full-width panel.

The Character Forge creator keeps universal choices in a stable left-side control surface and the current character details in the right-side review surface. Top-level creation modes sit above method-specific controls. Guided Mechanical owns the ability-method dropdown; Quick Generate is a sibling creation mode rather than a fifth ability option.

## Current D&D checkpoint

Automated-green on Character Forge `dev`:

- Quick Generate API/accepted host seam;
- Quick Generate top-level creation mode;
- Standard Array;
- Manual Ability Entry;
- Point Cost;
- Random Generation;
- guided Class / Background / Species creation;
- Criminal and Soldier background mechanics;
- all four explicit ability methods inside Guided Mechanical;
- structured generated-name provenance while preserving plain native/display-name state;
- Quick-mode Randomize All suppression so hidden Guided controls cannot be invoked.

Quick creator consolidation checkpoint:

- SHA: `418db810828c6a44d7b24b88ef69a3b6ffdffc40`;
- Actions: `34382893940`;
- job: `102571852183`;
- 41 test files / 197 tests / 0 failures.

The accumulated non-accepted generation work remains on `dev` pending combined owner runtime QA.

## Future considerations

### Partial regeneration

Generation methods should eventually support partial reroll or regeneration by step without rewriting unrelated character decisions. Random generation already provides evidence for this: roll slots have identities and can be reassigned without rerolling, while rerolling should be a separate explicit action.

Do not generalize a full dependency graph until guided creation creates enough real choice interactions to justify it.

### Random-table companion

The first system-neutral random-table evaluator exists in `generator-core`; `refs/product/random-table-companion.md` is the current contract.

It supports versioned weighted tables, deterministic seed plus explicit draw-index replay, source/table/evaluator provenance, and arbitrary typed result payloads. The core does not know trait/ideal/bond/flaw/equipment semantics and never patches native character state directly.

Two BRP-owned consumers prove enum-like and nested structured suggestion results without requiring a universal suggestion ontology or nested-table engine. Keep system datasets/mappings system-owned. Do not add nesting, roll-range syntax, universal suggestion ontology, or user-authored table infrastructure until a concrete consumer requires them.

### Structured naming

`refs/product/structured-naming.md` is the current naming contract.

`generator-core` exposes a minimal provider-based name-suggestion seam with deterministic seed/provenance support and opaque provider-owned context. The shared contract requires only a non-empty display name and does not define species, culture, language, gender, given/family-name parts, or other identity ontology.

D&D adapts its existing six-name placeholder list to this contract without expanding the corpus or changing explicit-seed selection behavior. The guided creator retains accepted provider/source/version/seed provenance as generation decisions; manual edits supersede stale suggestions, blank fallback retains its effective replay seed, and native/display names remain ordinary strings.

BRP source discovery confirms that the rules engine does not own a generated-name corpus. BRP directs character names to be appropriate to the setting/game and makes optional cultural backgrounds setting/GM-defined. Therefore future BRP naming data is setting/campaign/content-package owned and should be supplied by a concrete caller/provider. `name-suggestion/0.1` already supports that boundary, so no generic content-provider framework or shared naming-contract expansion is justified now.

Naming work can wait for a real setting consumer. The next concrete creator implementation target is the first D&D Guided Narrative vertical slice.
