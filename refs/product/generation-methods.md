# Generation Methods

Status: Product direction for early D&D work, not a frozen engine API.

## Initial families

### Manual

The user directly enters or selects legal character values. Character Forge validates system rules but does not invent choices.

### Standard array

The rules adapter supplies the legal array and assignment constraints. The generator records assignments as decisions.

### Point buy

The rules adapter owns costs, limits, and legality. Shared generation code should not hardcode D&D point-buy math.

### Dice generation

The first D&D method is 4d6 drop lowest. The underlying dice-expression capability should remain general enough to add other systems without creating one function per historical dice ritual.

### Guided narrative

The user answers fictional or preference-oriented questions and the system maps those answers to weighted mechanical choices. The mapping must remain inspectable and the important answers and generated decisions must be recorded in generation provenance.

This path should appear early enough to influence generator architecture rather than being bolted onto a completed form wizard.

### Quick generate

The system produces a legal complete character with minimal input, while still recording the recipe, rules sources, random seed where relevant, and major choices.

## Product rule

Generation methods should converge on the same system-native validation and save boundary. A quick-generated fighter, manually entered fighter, and narratively guided fighter should all result in equally valid native D&D character state.

## Future consideration

Generation methods should eventually support partial reroll or regeneration by step without rewriting unrelated character decisions. That capability should be implemented only when the first vertical slice demonstrates the correct dependency graph.
