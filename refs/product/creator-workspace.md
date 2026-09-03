---
type: "Product Reference"
title: "Creator Workspace"
tags:
- character-forge
- product
---
# Creator Workspace

Status: Product/UI standard established by the D&D guided-creation refactor on 2026-08-26.

## Core layout

Character Forge creation and maintenance surfaces should default to a two-part workspace:

- **left:** generation/editing controls;
- **right:** the current character summary and details.

The user should be able to adjust creation inputs without losing sight of the resulting character. On desktop, the character-detail surface may remain sticky while the control column scrolls. On narrow screens, the layout may collapse to one column without changing the conceptual separation.

## Control hierarchy

Put controls shared across generation methods near the top of the left panel. Method-specific controls should not duplicate the whole creator.

For the current D&D guided creator, universal controls include character identity and ordinary origin/class selections. Ability generation uses one method dropdown; selecting Standard Array, Point Cost, Random, or Manual dynamically inserts only the controls needed by that method.

Do not add one full-width card/panel per generation method.

## Choice menus

Ordinary menu choices should use the established acceptable-option pattern when appropriate:

- current direct selection remains compact and obvious;
- random-from-acceptable uses a compact icon-first action;
- the acceptable pool is available without permanently occupying large vertical space, e.g. a collapsible disclosure;
- sticky preferences and per-character provenance remain separate.

## Character review

The right-side review surface should prioritize information useful for evaluating the current generated character:

- identity and major origin/class selections;
- abilities and key derived values;
- meaningful granted capabilities/proficiencies;
- equipment/resources where relevant;
- validation status;
- generation seed/provenance when useful;
- drill-down to the complete native/CharacterDocument representation.

Do not reserve equal visual weight for raw JSON. Keep inspection available as a drill-down rather than making it the primary character view.

## Creation mode versus sub-method

Not every generation concept belongs in the same dropdown.

Standard Array, Point Cost, Random, and Manual are currently alternate **ability-generation methods** within guided creation.

Quick Generate and Guided Narrative are broader **creation modes/front ends** because they can make multiple character decisions, not only produce ability scores. When these are visually consolidated, expose them at the appropriate higher level while routing their results through the same ordinary native generation/validation APIs.

## Extension rule

New classes, backgrounds, species, systems, generators, or companion modules should extend this workspace rather than creating parallel page structures unless a materially different workflow proves the shell inadequate.

Prefer:

- compact controls;
- progressive disclosure;
- dynamic method-specific content;
- easy-to-change/easy-to-undo decisions;
- visible result feedback;
- icon-first secondary actions when the meaning remains accessible through label/title/ARIA text.

Avoid:

- stacked walls of near-duplicate forms;
- validation popups for easily reversible creation changes;
- hiding the generated character below a long control surface;
- duplicating native-generation logic in browser-only handlers.
