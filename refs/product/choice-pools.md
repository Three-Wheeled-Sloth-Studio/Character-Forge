# Choice Pools

Status: Product pattern established by the D&D guided-creation slice.

## Pattern

For any creation step where a player is choosing one option from a menu, Character Forge should support both direct choice and an optional acceptable-options pool.

A choice pool lets the player:

- mark every option they would be happy to receive;
- choose one directly when they already know what they want; or
- ask Character Forge to select randomly from the marked acceptable options.

The marked acceptable set should be user-sticky when the same player returns to that decision later. The sticky preference is UI/user preference state, not character state.

The actual per-character result must remain explicit generation provenance. When Character Forge chooses randomly, provenance should retain the acceptable pool, the selected option, and that the selection was random.

## First application

D&D 5E 2024 guided creation applies the pattern first to Class and Species.

This pattern should later be reused for backgrounds, languages, skills, feats, equipment packages, spell choices, subclasses, and similar menu decisions where doing so does not conflict with the source system's rules.

## Guardrail

Do not interpret an unchecked option as globally banned content. It means only that the current user does not want that option considered by random selection for that decision. Direct choice may still be available when rules permit it.
