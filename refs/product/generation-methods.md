---
type: "Product Reference"
title: "Generation Methods"
tags:
- character-forge
- product
---
# Generation Methods

Status: Base D&D ability-generation methods, Guided Mechanical, top-level Quick Generate, Guided Narrative with explicit continuation, bounded Alignment decomposition, starting-equipment preference, conditional Fighter Fighting Style mapping, the system-neutral random-table evaluator, structured D&D name-suggestion provenance, and BRP naming-content ownership discovery are implemented on `dev`. This remains product direction rather than a frozen engine API.

## Initial Families

### Manual

The user directly enters or selects legal character values. Character Forge validates system rules but does not invent choices.

Current D&D implementation accepts six explicit pre-background ability scores and records manual provenance without inventing a seed.

### Standard Array

The rules adapter supplies the legal array and assignment constraints. The generator records assignments as decisions.

Current D&D implementation requires 15, 14, 13, 12, 10, and 8 exactly once.

### Point Buy / Point Cost

The rules adapter owns costs, limits, and legality. Shared generation code must not hardcode D&D point-buy math.

Current D&D implementation uses the SRD 5.2.1 27-point Point Cost rules and retains construction spend in generation provenance rather than runtime character state.

### Dice Generation

The underlying dice-expression capability is system-neutral so different systems can use different dice procedures without creating one hard-coded helper per ritual.

Current D&D implementation uses six `4d6kh3` roll slots and preserves seed, raw dice, kept dice, totals, and roll-slot-to-ability assignment.

### Guided Mechanical

The user makes ordinary system-native character choices with rules-aware guidance. Guided creation calls the same native generation/validation APIs used by other methods rather than becoming a parallel character model.

The current D&D Guided Mechanical path supports:

- direct Class/Background/Species choices;
- sticky acceptable pools used specifically for random-from-acceptable behavior;
- all current Level 1 nested Class/Background/Species choices;
- Standard Array, Point Cost, Random, or Manual as interchangeable ability methods;
- provider/source/version/seed provenance when a generated display name is accepted.

A direct current selection is not required to belong to its sticky acceptable random pool. A random selection is required to belong to that pool.

### Guided Narrative

The user answers fictional or preference-oriented questions and the system maps those answers into ordinary mechanical recommendations. The mapping remains inspectable and important answers/mappings are retained in generation provenance.

D&D Guided Narrative is a top-level creation mode beside Guided Mechanical and Quick Generate.

The six current global questions cover:

- preferred contribution when trouble starts;
- prior life/background flavor;
- heritage interest;
- prepared gear versus starting coin;
- structure versus personal freedom;
- concern for others versus self-interest.

Those map to ordinary Class, Background, Species, equipment, and Alignment choices.

Narrative may also expose conditional system-owned questions after an upstream choice is known. The first implementation is Fighter Fighting Style.

Every Narrative question includes explicit `Choose for me`. Seeded resolution retains both the submitted `choose-for-me` answer and the resolved substantive answer.

#### Alignment decomposition

Two bounded fictional questions map across the ordinary nine D&D Alignment IDs without exposing a nine-item Narrative menu.

This mapping is D&D-owned and is not promoted into a universal morality, personality, or psychology contract.

#### Starting-equipment preference

The supported catalogs justify exactly one shared equipment discriminator:

- `prepared-gear` -> existing Class `A` plus Background `A`;
- `starting-gold` -> the current Class's existing legal gold choice plus Background `B:50-gp`.

Fighter starting gold maps to `C`; other currently supported Classes use `B`.

Fighter's alternate prepared kit remains a Fighter detail rather than a universal equipment category.

#### Conditional Fighter Fighting Style

Fighter Fighting Style is the first conditional Class-specific Narrative branch.

The question is shown only when the current Narrative Class is Fighter and maps one-to-one:

- `control-from-range` -> `archery`;
- `hold-the-line` -> `defense`;
- `heavy-weapon` -> `great-weapon-fighting`;
- `paired-weapons` -> `two-weapon-fighting`.

With `Choose for me`, the branch has exactly five presented choices.

The direct generator writes the resolved style into the existing `GuidedDnd5eCoreChoices.fightingStyleFeatId` input before ordinary Guided/native generation. No native state is patched after construction.

This is a Fighter-specific presentation contract, not a universal combat-role or class-feature ontology.

#### Build Directly

`guidedNarrativeGenerateDnd5eFirstSlice()` uses the ordinary Guided/native construction path.

The current path may apply:

- mapped Class, Background, Species, and Alignment;
- mapped existing Class and Background starting-equipment choices;
- mapped Fighter Fighting Style when the final Class is Fighter;
- current Guided defaults for remaining detailed choices;
- a legal Class-prioritized Standard Array assignment;
- a legal Background +2/+1 increase plan.

Narrative-specific information stays in generation metadata rather than a new native model.

Current Narrative mapping version is `5` and direct Narrative recipe version is `0.4`.

Fighter provenance retains submitted/resolved preference, mapping version, starting Fighting Style, final Fighting Style, and the ordinary final `class.fighting-style` decision.

#### Continue In Guided Mechanical

The user may explicitly continue from Narrative into the existing detailed Guided Mechanical editor.

`createDnd5eGuidedNarrativeContinuation()` retains a replayable transfer record containing:

- Narrative mapping ID/version;
- Narrative seed;
- submitted/resolved global answers;
- conditional Class-specific answer when applicable;
- narrowed candidate sets and recommendations;
- exact Narrative-final Class/Background/Species/Alignment values;
- exact Narrative starting Class and Background equipment choices;
- exact Narrative starting Fighter Fighting Style when Fighter applies.

The web controller initializes existing Guided Mechanical controls from those values. It does not duplicate detailed controls and does not overwrite user-sticky acceptable random pools merely to transfer an explicit current choice.

After ordinary Guided Mechanical generation, `applyDnd5eGuidedNarrativeContinuation()` attaches retained Narrative provenance. Final generation uses mode `hybrid` and method ID `dnd5e:guided-narrative-to-guided-level-one`.

Continuation recipe version is `0.4`.

Later Guided Mechanical edits remain authoritative. Mapping provenance records starting and final values and whether the value changed after continuation.

If the player changes Class away from Fighter, the final Fighter Fighting Style becomes inapplicable and hybrid provenance records that change without inventing a style for the new Class.

There is no Narrative CharacterDocument schema, native schema, adapter, semantic personality model, universal equipment model, universal combat-role model, or universal class-feature model.

### Quick Generate

The system produces a legal complete character with minimal input while recording recipe, rules sources, seed, and major choices.

Quick Generate remains a complete-character front end over ordinary native generation behavior, not a separate character-state format and not another ability-score method.

## Product Rule

Generation methods converge on the same system-native validation and save boundary. A quick-generated, manually entered, Standard Array, Point Cost, randomly generated, Guided Mechanical, Guided Narrative, or Narrative-continued-into-Guided character should all result in equally valid authoritative native system state.

Method-specific information belongs primarily in generation provenance and decisions.

## Narrative Choice Rules

Every Narrative question or Narrative-choice step must expose `Choose for me` or a semantically equivalent explicit option.

Narrative choice surfaces follow a bounded-choice rule:

- target about 3 presented choices per step where practical;
- hard maximum 5 presented choices per step;
- `Choose for me` counts toward that maximum;
- conditional branches may depend on an already-resolved Class/Background/Species/setting choice;
- if a downstream choice would exceed 5, insert a bounded upstream discriminator or leave it to Guided Mechanical;
- do not present large mechanical catalogs and call them Narrative choices;
- Narrative overrides remain within the narrowed branch;
- once the user explicitly continues into Guided Mechanical, normal mechanical catalogs are not subject to the Narrative presentation ceiling.

The owning system/content package defines eligible alternatives. Seeded random resolution retains replay provenance. Direct answers and later Guided Mechanical edits remain authoritative.

Shared `Randomize All` is suppressed in Guided Narrative. Narrative uses explicit per-question `Choose for me`. Quick likewise suppresses shared Randomize All and owns randomization through `Generate character`.

## Sticky Acceptable Pools

Sticky acceptable pools are persistent randomization preferences, not a global legality boundary for direct selections.

For choice-pool fields:

- direct selection records the current user choice;
- acceptable IDs record what random-from-acceptable may select;
- random selection must resolve inside the acceptable pool;
- explicit transfer or direct selection may select a legal value outside the sticky pool without rewriting the pool;
- per-character provenance and user-sticky preferences remain separate.

Narrative continuation uses this distinction for Alignment, Class equipment, and Fighter Fighting Style.

## Current D&D Checkpoints

Latest automated-green Narrative checkpoints:

- Narrative -> Guided Mechanical continuation: `b56efbadc5fcfdbb353cc3f8e74ebda10f6c905b`, Actions `34388640406`, 44 test files / 210 tests;
- Alignment decomposition: `3d9be423d46c45c00ef2eed1b7d643186ed6530a`, Actions `34392030680`, 44 test files / 211 tests;
- starting-equipment preference: `5760a079ad8e188320997dcc02ddf8f683bd1d99`, Actions `34395268461`, 44 test files / 213 tests;
- Fighter Fighting Style branch: `0cc60281fc85d1c13511515b573f30dedf3ea2ab`, Actions `34407597435`, job `102654207021`, 44 test files / 216 tests / 0 failures.

The accumulated non-promoted D&D generation work remains on `dev` pending combined owner runtime QA under Issue #11.

## Future Considerations

### Cleric / Druid order preference

The class-defining-choice audit found limited shared evidence between:

- Cleric Protector and Druid Warden, which lean toward physical resilience / martial capability;
- Cleric Thaumaturge and Druid Magician, which lean toward broader magical capability.

Before implementation, verify the exact Level 1 mechanical effects and confirm that one player-facing martial/resilience versus broader-magic question is honest for both Classes.

If supported, keep the branch conditional to Cleric/Druid and map to the existing `divineOrderId` / `primalOrderId` controls. Do not promote it into a universal class-role ontology.

If the exact mechanics diverge materially, split the branches.

### Warlock and spell choices

Do not expose the five current Warlock Invocations directly in Narrative because adding `Choose for me` would produce six presented choices. A separate bounded upstream discriminator is required first.

Prepared spell/cantrip catalogs are also too broad and frequently multi-select. Do not add broad spell recommendation/optimization until a clear bounded player-intent consumer is identified.

### Partial regeneration

Generation methods should eventually support partial reroll or regeneration by step without rewriting unrelated character decisions. Do not generalize a full dependency graph until enough real choice interactions justify it.

### Random-table companion

The system-neutral random-table evaluator remains in `generator-core`. It supports versioned weighted tables, deterministic seed plus draw-index replay, and caller-owned typed results. Do not force Narrative mapping through this evaluator merely because both can use randomness.

### Structured naming

`refs/product/structured-naming.md` remains the naming contract. D&D uses the current placeholder provider; BRP naming content remains setting/campaign/content-package owned and caller/provider supplied.
