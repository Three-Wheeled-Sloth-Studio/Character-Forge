---
type: "Product Reference"
title: "Creator Workspace"
tags:
- character-forge
- product
---
# Creator Workspace

Status: Product/UI standard established by the D&D guided-creation refactor and extended with top-level D&D Guided Mechanical / Quick Generate creation modes on 2026-09-09.

## Core layout

Character Forge creation and maintenance surfaces should default to a two-part workspace:

- **left:** generation/editing controls;
- **right:** the current character summary and details.

The user should be able to adjust creation inputs without losing sight of the resulting character. On desktop, the character-detail surface may remain sticky while the control column scrolls. On narrow screens, the layout may collapse to one column without changing the conceptual separation.

## Control hierarchy

Put controls shared across creation modes and generation methods near the top of the left panel. Method-specific controls should not duplicate the whole creator.

For D&D, the rules-system selector remains above a compact top-level creation-mode selector. `Guided Mechanical` is the default and retains the full detailed creator. Within Guided Mechanical, ability generation still uses one method dropdown; Standard Array, Point Cost, Random, or Manual dynamically inserts only the controls needed by that method.

`Quick Generate` is a sibling creation mode, not a fifth ability method. Its current UI exposes only the inputs supported by the existing system API: optional character name and optional seed.

Do not add one full-width card/panel per ability-generation method.

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

All creation modes publish through the same ordinary CharacterDocument review/save boundary. Quick does not own a parallel result model.

Do not reserve equal visual weight for raw JSON. Keep inspection available as a drill-down rather than making it the primary character view.

## Creation mode versus sub-method

Not every generation concept belongs in the same dropdown.

Standard Array, Point Cost, Random, and Manual are alternate **ability-generation methods** within Guided Mechanical creation.

Quick Generate and Guided Narrative are broader **creation modes/front ends** because they can make multiple character decisions, not only produce ability scores. They belong at the higher creation-mode level while routing results through ordinary native generation/validation APIs.

D&D now proves this hierarchy with `Guided Mechanical | Quick Generate`. Both mode surfaces remain mounted while switching so an in-progress Guided form or Quick seed/name is not discarded merely by toggling modes.

Quick mode calls `quickGenerateDnd5eFirstSlice()` directly. Browser code does not duplicate its template, randomization, class/background/species, ability, or naming mechanics.

## Randomize All by creation mode

Shared `Randomize All` is an orchestration control, not a promise that every mode has identical random semantics.

- Guided Mechanical continues to delegate to its existing D&D field randomizers and random-roll control.
- Quick Generate owns randomization through its `Generate character` action, so the workspace hides and disables `Randomize All` while Quick is active.
- The workspace also guards the click path, so hidden Guided controls cannot be accidentally invoked in Quick mode.
- BRP behavior remains unchanged and no BRP Quick mode is implied.

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

## Current evidence

Automated-green D&D top-level Quick consolidation:

- implementation SHA: `418db810828c6a44d7b24b88ef69a3b6ffdffc40`;
- Actions: `34382893940`;
- job: `102571852183`;
- 41 test files / 197 tests / 0 failures.

Owner browser QA remains useful as accumulated creator QA, but this slice did not create a separate browser-QA gate.
