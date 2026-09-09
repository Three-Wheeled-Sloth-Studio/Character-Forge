---
type: "Product Reference"
title: "Generation Methods"
tags:
- character-forge
- product
---
# Generation Methods

Status: Base D&D ability-generation methods, Guided Mechanical, top-level Quick Generate, the first Guided Narrative vertical slice, the system-neutral random-table evaluator, structured D&D name-suggestion provenance, and BRP naming-content ownership discovery are implemented on `dev`. This remains product direction rather than a frozen engine API.

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

- sticky/direct/random-from-acceptable Class choices;
- sticky/direct/random-from-acceptable Background choices;
- sticky/direct/random-from-acceptable Species choices;
- all current Level 1 nested class/background/species choices;
- Standard Array, Point Cost, Random, or Manual as interchangeable ability methods;
- provider/source/version/seed provenance when a generated display name is accepted.

### Guided Narrative

The user answers fictional or preference-oriented questions and the system maps those answers into ordinary mechanical recommendations. The mapping remains inspectable, recommendations remain overridable, and important answers/mappings are retained in generation provenance.

The first D&D Guided Narrative slice is implemented as a top-level creation mode beside Guided Mechanical and Quick Generate.

It currently asks three deliberately small questions about:

- preferred contribution when trouble starts;
- what kind of prior life shaped the character;
- what kind of heritage sounds interesting to explore.

The system-owned mapping currently targets only already-supported Class, Background, and Species IDs. It exposes candidate IDs plus a recommendation, and the creator exposes the recommended choices as normal selects so the player can override them before generation.

Every narrative question includes an explicit `Choose for me` option. This is a durable narrative product rule. The first D&D implementation resolves `Choose for me` deterministically from the visible narrative seed and retains both the submitted `choose-for-me` answer and the resolved substantive answer.

`guidedNarrativeGenerateDnd5eFirstSlice()` then uses the ordinary Guided/native construction path. The first slice uses:

- current Guided defaults for detailed class/origin/species choices;
- a legal class-prioritized Standard Array assignment;
- a legal background +2/+1 increase plan;
- current background equipment option A.

Narrative-specific information remains in generation metadata:

- mode `guided-narrative`;
- method ID and recipe version;
- narrative mapping ID/version;
- seed;
- submitted/resolved answers;
- candidate/recommended/final mapped choices;
- whether each mapped choice was overridden.

There is no Narrative CharacterDocument schema, native schema, adapter, or semantic personality model.

The next Narrative increment should carry the recommendation into the existing Guided Mechanical editor for detailed customization rather than duplicate that editor inside Narrative.

### Quick Generate

The system produces a legal complete character with minimal input, while still recording the recipe, rules sources, random seed where relevant, and major choices.

Quick Generate is a complete-character front end over ordinary native generation behavior, not a separate character-state format and not another ability-score method.

D&D exposes Quick Generate as a top-level creation mode beside Guided Mechanical and Guided Narrative. Its panel exposes only optional name and optional seed and calls `quickGenerateDnd5eFirstSlice()` directly.

Quick results publish through the same `onCharacter` review/save/host boundary as other modes. No parallel CharacterDocument or persistence model was introduced.

## Product rule

Generation methods converge on the same system-native validation and save boundary. A quick-generated, manually entered, Standard Array, Point Cost, randomly generated, Guided Mechanical, or Guided Narrative character should all result in equally valid native system state.

Method-specific information belongs primarily in generation provenance and decisions. Authoritative native state should differ only where the source system itself requires a mechanical difference.

## Creator UI rule

Do not represent every generation method as a separate full-width panel.

The Character Forge creator keeps generation controls in the left surface and current character details in the right review surface. Top-level creation modes sit above method-specific controls.

For D&D:

- Guided Mechanical owns the four ability-method choices;
- Guided Narrative owns its question/recommendation flow;
- Quick Generate owns its minimal name/seed flow.

All three remain ordinary front ends over system-native generation.

## Narrative Choose For Me rule

Every narrative question or narrative-choice step must expose `Choose for me` or a semantically equivalent explicit option.

This means:

- the user never has to fabricate a narrative preference merely to continue;
- the owning system/content package defines what may be selected;
- seeded random resolution retains replay provenance when used;
- direct answers and later overrides remain authoritative.

This rule applies to narrative choices. It does not imply that every ordinary mechanical select needs an additional random option.

Shared `Randomize All` is therefore suppressed in Guided Narrative. Narrative uses its explicit per-question `Choose for me` behavior. Quick likewise suppresses shared Randomize All and owns randomization through `Generate character`.

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

The accumulated non-promoted generation work remains on `dev` pending combined owner runtime QA under Issue #11.

## Future considerations

### Narrative continuation/editing

The next D&D slice should establish a narrow transfer/controller seam from Narrative into Guided Mechanical:

- initialize the existing Guided Mechanical Class, Background, and Species from the Narrative final choices;
- retain Narrative answer/mapping provenance;
- allow ordinary Guided Mechanical detail editing afterward;
- keep sticky acceptable pools separate from per-character Narrative provenance;
- avoid DOM-click automation when a bounded controller seam can express the transfer directly.

Do not generalize the whole Guided form into a cross-system creator-state model merely for this transfer.

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

BRP source discovery confirms that its rules engine does not own a generated-name corpus. Future BRP naming data remains setting/campaign/content-package owned and caller/provider supplied. Naming does not block Narrative continuation work.
