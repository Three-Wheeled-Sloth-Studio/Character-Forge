---
type: "Product Reference"
title: "Choice Pools"
tags:
- character-forge
- product
---
# Choice Pools

Status: Product pattern established by guided creation and now used for Class, Background, and Species.

## Pattern

For a creation step where a player is choosing one option from a menu, Character Forge should support both direct choice and an optional acceptable-options pool when the source rules permit it.

A choice pool lets the player:

- mark every option they would be happy to receive;
- choose one directly when they already know what they want; or
- ask Character Forge to select randomly from the marked acceptable options.

The marked acceptable set should be user-sticky when the same player returns to that decision later. Sticky preference is UI/user preference state, not character state.

The actual per-character result must remain explicit generation provenance. When Character Forge chooses randomly, provenance retains the acceptable pool used, the selected option, and that the selection was random.

## Current applications

D&D 5E 2024 guided creation applies the pattern to:

- Class;
- Background;
- Species.

The creator keeps these pools compact/collapsible and pairs each current selection with a compact random-from-checked action.

This pattern should later be reused for languages, skills, feats, equipment packages, spell choices, subclasses, and similar menu decisions where doing so does not conflict with the source system's rules.

## Multi-select extension

Do not force count-N or multi-select source choices into a single-choice pool abstraction. Class skills, Weapon Mastery, spell selections, and similar choices may need a related contract that distinguishes:

- the broader acceptable set;
- how many selections are required;
- the actual selected subset;
- direct versus random filling of one or more remaining slots.

Wait for concrete class-choice work before freezing that extension.

## Legality and stale preferences

Sticky preference state is advisory. It must be sanitized against the current legal option set whenever rules source, campaign constraints, earlier choices, or implementation support changes.

An unchecked option is not globally banned content. It means only that the current user does not want that option considered by random selection for that decision. Direct choice may still be available when rules permit it.

A previously checked option that becomes illegal or unsupported must not force generation failure merely because it remains in old browser preference state; sanitize it out and preserve a legal current selection.
