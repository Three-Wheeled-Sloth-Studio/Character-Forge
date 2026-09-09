---
type: "Product Reference"
title: "Generation Methods"
tags:
- character-forge
- product
---
# Generation Methods

Status: Base D&D ability-generation methods, Guided Mechanical, top-level Quick Generate, Guided Narrative with explicit continuation into Guided Mechanical, bounded Alignment decomposition, Narrative starting-equipment preference, the system-neutral random-table evaluator, structured D&D name-suggestion provenance, and BRP naming-content ownership discovery are implemented on `dev`. This remains product direction rather than a frozen engine API.

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

### Guided Mechanical

The user makes ordinary system-native character choices with rules-aware guidance. Guided creation calls the same native generation/validation APIs used by other methods rather than becoming a parallel character model or one giant browser-only wizard.

The current D&D Guided Mechanical path supports:

- direct Class/Background/Species choices;
- sticky acceptable pools used specifically for random-from-acceptable behavior;
- all current Level 1 nested class/background/species choices;
- Standard Array, Point Cost, Random, or Manual as interchangeable ability methods;
- provider/source/version/seed provenance when a generated display name is accepted.

A direct current selection is not required to belong to its sticky acceptable random pool. A `random` selection is required to belong to that pool. This keeps explicit current intent separate from persistent randomization preferences.

### Guided Narrative

The user answers fictional or preference-oriented questions and the system maps those answers into ordinary mechanical recommendations. The mapping remains inspectable, recommendations remain overridable where the current narrowed branch permits it, and important answers/mappings are retained in generation provenance.

D&D Guided Narrative is a top-level creation mode beside Guided Mechanical and Quick Generate.

The current mapping asks six bounded questions about:

- preferred contribution when trouble starts;
- what kind of prior life shaped the character;
- what kind of heritage sounds interesting to explore;
- whether to begin with prepared gear or more starting coin;
- how the character leans when rules and personal freedom conflict;
- how the character weighs personal goals against other people's well-being.

Role, past, and heritage map to supported Class, Background, and Species candidates/recommendations. Equipment maps to existing legal Class and Background starting-equipment choices. The last two questions map orthogonally across the ordinary nine D&D Alignment IDs without showing a nine-item Narrative menu.

Every Narrative question includes explicit `Choose for me`. Seeded resolution retains both the submitted `choose-for-me` answer and the resolved substantive answer.

#### Alignment decomposition

Alignment demonstrates the Narrative bounded-choice rule rather than creating a new Alignment system.

The two three-way substantive questions map to:

- structure / case-by-case / personal freedom -> lawful / neutral / chaotic direction;
- protect others / balance needs / self-first -> good / neutral / evil direction.

The actual result remains an ordinary existing D&D `alignmentId`. The mapping is D&D-owned and is not promoted into a universal morality, personality, or psychology contract.

#### Starting-equipment preference

Starting equipment demonstrates the evidence-first abstraction rule.

The supported catalogs were audited before designing the Narrative question:

- 11 Classes expose prepared kit `A` and starting gold `B`;
- Fighter exposes prepared heavy/melee kit `A`, prepared lighter/ranged kit `B`, and starting gold `C`;
- all four supported Backgrounds expose prepared kit `A` and 50 GP `B:50-gp`.

Only one shared player-intent discriminator is therefore justified:

- `prepared-gear` -> existing Class `A` plus Background `A`;
- `starting-gold` -> the current Class's existing legal gold choice plus Background `B:50-gp`.

Fighter starting gold maps to `C`; all other currently supported Classes use `B`.

Fighter's alternate prepared kit `B` is not generalized into a universal alternate-kit concept because the other supported Classes do not provide equivalent semantics.

The Narrative equipment question presents only those two substantive preferences plus `Choose for me`.

#### Build directly

`guidedNarrativeGenerateDnd5eFirstSlice()` uses the ordinary Guided/native construction path. The current path uses:

- mapped Class, Background, Species, and Alignment;
- mapped existing Class and Background starting-equipment choices;
- current Guided defaults for the remaining detailed class/origin/species choices;
- a legal class-prioritized Standard Array assignment;
- a legal background +2/+1 increase plan.

Narrative-specific information stays in generation metadata rather than a new native model.

Current Narrative generation recipe version is `0.3`, with mapping version `4`.

Equipment provenance retains the submitted/resolved Narrative answer, mapping version, resolved preference, starting Class/Background equipment choices, and final Class/Background equipment choices alongside the ordinary final equipment decisions.

#### Continue in Guided Mechanical

The user may explicitly continue from Narrative into the existing detailed Guided Mechanical editor.

`createDnd5eGuidedNarrativeContinuation()` retains a replayable transfer record containing:

- Narrative mapping ID/version;
- Narrative seed;
- submitted/resolved answers;
- narrowed candidate sets and recommendations;
- exact Narrative-final Class/Background/Species/Alignment selections before continuation;
- exact Narrative starting Class and Background equipment choices.

The web controller initializes the existing Guided Mechanical form from those values. It does not duplicate detailed controls and does not overwrite user-sticky acceptable random pools merely to transfer an explicit current choice.

After ordinary Guided Mechanical generation, `applyDnd5eGuidedNarrativeContinuation()` attaches the retained Narrative provenance. Final generation uses mode `hybrid` and method ID `dnd5e:guided-narrative-to-guided-level-one`.

Continuation recipe version is `0.3`.

Later Guided Mechanical edits remain authoritative. Mapping provenance records the Narrative starting value and the final value after detailed editing. Retained continuation provenance is replay-validated before use.

Alignment uses a narrow controller initialization because that core control can be recreated by dependent form rerenders. The Narrative starting Alignment is reapplied only until the player explicitly interacts with Alignment; initialization itself does not persist a change to the acceptable pool.

Class equipment now uses the same direct-versus-sticky boundary. While untouched, dependent rerenders reapply the Narrative equipment preference against the current Class so its mechanical choice remains legal. Changing the equipment select, invoking its randomizer, or editing its acceptable pool makes the Guided Mechanical choice authoritative and stops Narrative reapplication.

Background equipment is the existing direct selector and is initialized until explicitly changed.

There is no Narrative CharacterDocument schema, native schema, adapter, semantic personality model, or universal equipment model.

### Quick Generate

The system produces a legal complete character with minimal input, while still recording the recipe, rules sources, random seed where relevant, and major choices.

Quick Generate is a complete-character front end over ordinary native generation behavior, not a separate character-state format and not another ability-score method.

D&D exposes Quick Generate as a top-level creation mode beside Guided Mechanical and Guided Narrative. Its panel exposes only optional name and optional seed and calls `quickGenerateDnd5eFirstSlice()` directly.

Quick results publish through the same `onCharacter` review/save/host boundary as other modes. No parallel CharacterDocument or persistence model was introduced.

## Product rule

Generation methods converge on the same system-native validation and save boundary. A quick-generated, manually entered, Standard Array, Point Cost, randomly generated, Guided Mechanical, Guided Narrative, or Narrative-continued-into-Guided character should all result in equally valid authoritative native system state.

Method-specific information belongs primarily in generation provenance and decisions. Authoritative native state should differ only where the source system itself requires a mechanical difference.

## Creator UI rule

Do not represent every generation method as a separate full-width panel.

The Character Forge creator keeps generation controls in the left surface and current character details in the right review surface. Top-level creation modes sit above method-specific controls.

For D&D:

- Guided Mechanical owns the four ability-method choices;
- Guided Narrative owns its bounded question/recommendation flow plus explicit continuation into Guided Mechanical;
- Quick Generate owns its minimal name/seed flow.

All three remain ordinary front ends over system-native generation.

## Narrative choice rules

Every Narrative question or Narrative-choice step must expose `Choose for me` or a semantically equivalent explicit option.

Narrative choice surfaces follow a bounded-choice rule:

- target about 3 presented choices per step where practical;
- hard maximum 5 presented choices per step;
- `Choose for me` counts toward that maximum;
- if a downstream Narrative choice would exceed 5, insert an upstream Narrative question, also within the limit, that narrows the next branch;
- do not present a 9-, 12-, or 20-item mechanical catalog and call that a Narrative choice;
- Narrative overrides remain within the narrowed branch where an override is exposed;
- once the user explicitly continues into Guided Mechanical, normal mechanical catalogs are not subject to the Narrative presentation ceiling.

The owning system/content package defines eligible alternatives. Seeded random resolution retains replay provenance when used. Direct answers and later Guided Mechanical edits remain authoritative.

Shared `Randomize All` is suppressed in Guided Narrative. Narrative uses explicit per-question `Choose for me`. Quick likewise suppresses shared Randomize All and owns randomization through `Generate character`.

## Sticky acceptable pools

Sticky acceptable pools are persistent randomization preferences, not a global legality boundary for direct selections.

For choice-pool fields:

- direct selection records the current user choice;
- acceptable IDs record what may be selected by random-from-acceptable behavior;
- `random` selection must resolve inside the acceptable pool;
- explicit transfer or direct selection may temporarily select a legal value outside the sticky pool without rewriting the pool;
- per-character provenance and user-sticky preferences remain separate.

This distinction is used by Narrative -> Guided continuation for Class/Background/Species, Alignment, and Class equipment and is covered directly by tests.

## Current D&D checkpoints

Automated-green Quick creator consolidation:

- SHA: `418db810828c6a44d7b24b88ef69a3b6ffdffc40`;
- Actions: `34382893940`;
- job: `102571852183`;
- 41 test files / 197 tests / 0 failures.

Automated-green first Guided Narrative vertical slice:

- SHA: `bd5de95193002cb7ad176c5b325d42d5e21ff78c`;
- Actions: `34384877186`;
- job: `102578522427`;
- 42 test files / 203 tests / 0 failures.

Automated-green Narrative choice-shape refinement:

- SHA: `3ff8b064e614f964e83ff7dfc5549ce96594a33a`;
- Actions: `34386315636`;
- job: `102583371487`;
- 42 test files / 204 tests / 0 failures.

Automated-green Narrative -> Guided Mechanical continuation:

- SHA: `b56efbadc5fcfdbb353cc3f8e74ebda10f6c905b`;
- Actions: `34388640406`;
- job: `102591189046`;
- 44 test files / 210 tests / 0 failures.

Automated-green Narrative Alignment decomposition:

- SHA: `3d9be423d46c45c00ef2eed1b7d643186ed6530a`;
- Actions: `34392030680`;
- job: `102602424501`;
- 44 test files / 211 tests / 0 failures.

Automated-green Narrative starting-equipment preference:

- SHA: `5760a079ad8e188320997dcc02ddf8f683bd1d99`;
- Actions: `34395268461`;
- job: `102613297986`;
- 44 test files / 213 tests / 0 failures.

The accumulated non-promoted generation work remains on `dev` pending combined owner runtime QA under Issue #11.

## Future considerations

### Narrative class-defining-choice audit

Before adding another D&D Narrative question, audit the actual supported Level 1 Class-owned choices that materially change playstyle, including Fighting Style, Cleric Divine Order, Druid Primal Order, Warlock Invocation, and meaningful spell/cantrip selections.

Determine which choices share a real player-intent discriminator, which are inherently Class-specific, and which catalogs would require further upstream narrowing because they exceed the Narrative five-choice ceiling.

Do not assume that controls occupying a similar mechanical layer belong to one universal concept. If the evidence is Class-specific, prefer one narrow Class-specific Narrative branch over a shared combat-role, magic-style, personality, or class-feature ontology.

Do not build a generic conditional-question engine until repeated concrete consumers justify one.

### Partial regeneration

Generation methods should eventually support partial reroll or regeneration by step without rewriting unrelated character decisions. Random generation already provides evidence for this: roll slots have identities and can be reassigned without rerolling, while rerolling is a separate explicit action.

Do not generalize a full dependency graph until enough real choice interactions justify it.

### Random-table companion

The system-neutral random-table evaluator exists in `generator-core`; `refs/product/random-table-companion.md` is the current contract.

It supports versioned weighted tables, deterministic seed plus explicit draw-index replay, source/table/evaluator provenance, and arbitrary typed result payloads. The core does not know trait/ideal/bond/flaw/equipment semantics and never patches native character state directly.

Two BRP-owned consumers prove enum-like and nested structured suggestion results without requiring a universal suggestion ontology or nested-table engine. Do not force Narrative mapping through the random-table engine merely because both may use randomness.

### Structured naming

`refs/product/structured-naming.md` is the current naming contract.

D&D adapts its existing small placeholder list through the provider seam and retains accepted name provenance while leaving display/native names ordinary strings.

BRP source discovery confirms that its rules engine does not own a generated-name corpus. Future BRP naming data remains setting/campaign/content-package owned and caller/provider supplied.
