# Generation Methods

Status: Base D&D ability-generation methods implemented on `dev`; guided creation is the next product increment. This remains product direction rather than a frozen engine API.

## Initial families

### Manual

The user directly enters or selects legal character values. Character Forge validates system rules but does not invent choices.

Current D&D first-slice implementation accepts six explicit pre-background ability scores and records manual provenance without inventing a seed.

### Standard array

The rules adapter supplies the legal array and assignment constraints. The generator records assignments as decisions.

Current D&D first-slice implementation exposes Standard Array directly in the browser/API and requires 15, 14, 13, 12, 10, and 8 exactly once.

### Point buy / point cost

The rules adapter owns costs, limits, and legality. Shared generation code must not hardcode D&D point-buy math.

Current D&D first-slice implementation uses the SRD 5.2.1 27-point Point Cost rules and retains construction spend in generation provenance rather than runtime character state.

### Dice generation

The underlying dice-expression capability is system-neutral so different systems can use different dice procedures without creating one hard-coded helper per ritual.

Current D&D first-slice implementation uses six `4d6kh3` roll slots. It preserves seed, every raw die, kept dice, totals, and later roll-slot-to-ability assignment. Generated score identity is retained separately from the numeric score so duplicate rolled totals are not ambiguous.

### Guided mechanical creation

This is the next active family. The user makes ordinary system-native character choices with rules-aware guidance rather than receiving the fixed Human / Soldier / Fighter template.

Guided creation should open one meaningful decision dimension at a time and call the same generation/native-state APIs already used by the base ability methods. It must not become a parallel character model or one giant browser-only wizard.

### Guided narrative

The user answers fictional or preference-oriented questions and the system maps those answers to weighted mechanical choices. The mapping must remain inspectable and the important answers and generated decisions must be recorded in generation provenance.

This path should appear early enough to influence generator architecture rather than being bolted onto a completed form wizard. Narrative guidance must ultimately produce ordinary system choices that can be inspected, overridden, validated, and persisted normally.

### Quick generate

The system produces a legal complete character with minimal input, while still recording the recipe, rules sources, random seed where relevant, and major choices.

Quick Generate is a front end over ordinary native generation behavior, not a separate character-state format.

## Product rule

Generation methods converge on the same system-native validation and save boundary. A quick-generated fighter, manually entered fighter, Standard Array fighter, Point Cost fighter, randomly generated fighter, and narratively guided fighter should all result in equally valid native D&D character state.

Method-specific information belongs primarily in generation provenance and decisions. Authoritative native state should differ only where the source system itself requires a mechanical difference.

## Current D&D base-method checkpoint

Automated-green on Character Forge `dev`:

- Quick Generate
- Standard Array
- Manual Ability Entry
- Point Cost
- Random Generation

The accumulated non-Quick methods are awaiting a combined owner runtime QA pass before promotion.

## Future consideration

Generation methods should eventually support partial reroll or regeneration by step without rewriting unrelated character decisions. The random-generation implementation now provides useful evidence for this: generated roll slots have identities and can be reassigned without rerolling, while rerolling should be a separate explicit action.

Do not generalize a full dependency graph until guided creation creates enough real choice interactions to justify it.
