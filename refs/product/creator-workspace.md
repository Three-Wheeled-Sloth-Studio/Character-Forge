---
type: "Product Reference"
title: "Creator Workspace"
tags:
- character-forge
- product
---
# Creator Workspace

Status: Product/UI standard established by the D&D guided-creation refactor and extended with top-level D&D Guided Mechanical, Guided Narrative, and Quick Generate creation modes on 2026-09-09.

## Core layout

Character Forge creation and maintenance surfaces should default to a two-part workspace:

- **left:** generation/editing controls;
- **right:** the current character summary and details.

The user should be able to adjust creation inputs without losing sight of the resulting character. On desktop, the character-detail surface may remain sticky while the control column scrolls. On narrow screens, the layout may collapse to one column without changing the conceptual separation.

## Control hierarchy

Put controls shared across creation modes and generation methods near the top of the left panel. Method-specific controls should not duplicate the whole creator.

For D&D, the rules-system selector remains above a compact top-level creation-mode selector:

- `Guided Mechanical` - default detailed mechanical creator;
- `Guided Narrative` - fictional/preference-oriented recommendation flow;
- `Quick Generate` - minimal-input system-owned generator.

Within Guided Mechanical, ability generation still uses one method dropdown. Standard Array, Point Cost, Random, or Manual dynamically inserts only the controls needed by that method.

Quick Generate and Guided Narrative are sibling creation modes, not additional ability methods.

All D&D mode surfaces remain mounted while switching so a mode toggle does not discard in-progress form state.

## Guided Narrative Interaction Contract

Guided Narrative is a front end over ordinary system-native choices. It must not become a second character model or duplicate the detailed Guided Mechanical editor.

The first D&D implementation proves a narrow pattern:

1. system-owned Narrative questions produce explicit answer IDs;
2. system-owned mapping code converts them into candidate/recommended ordinary D&D choices;
3. the creator shows only the narrowed candidates for the current Narrative branch;
4. the player may override within that branch;
5. changing an upstream Narrative answer opens a different branch;
6. final construction uses the ordinary guided/native generator and review/save boundary.

### Choose for me

Every Narrative question or Narrative choice surface must provide an explicit `Choose for me` option, or a semantically equivalent explicit action.

This is a Narrative-flow product rule, not a requirement to add random choices to every ordinary mechanical dropdown.

When `Choose for me` uses randomness:

- eligible alternatives are defined by the owning system/content package;
- deterministic replay should be used where practical and the seed retained;
- submitted-versus-resolved values should be retained when meaningful;
- direct player choices and later overrides remain authoritative.

Do not hide this behavior behind a global randomizer or opaque browser logic.

### Narrative choice density

Narrative interaction should feel like a sequence of small, meaningful discriminators rather than a mechanical catalog browser.

Use these rules:

- target about 3 presented choices at a Narrative step where practical;
- hard maximum 5 presented choices at any Narrative step;
- `Choose for me` or semantic equivalent counts toward that maximum;
- if the next Narrative step would have more than 5 choices, add an upstream Narrative question, also within the limit, to narrow it first;
- do not expose the full Class, Species, profession, spell, equipment, or similar rules catalog as a Narrative override when it exceeds the limit;
- Narrative overrides remain within the narrowed branch;
- once the user explicitly continues into Guided Mechanical, ordinary mechanical catalogs are outside this Narrative ceiling and may use their normal interaction patterns.

The target of about 3 is a design goal. Five is the hard upper bound.

The first D&D Narrative slice maps only Class, Background, and Species. Detailed class skills, spells, origin details, equipment, and ability controls remain owned by Guided Mechanical.

The next preferred interaction is `Continue in Guided Mechanical`, carrying the Narrative result and provenance into the existing detailed editor rather than copying those controls into Narrative.

## Choice menus

Ordinary mechanical menu choices should use the established acceptable-option pattern when appropriate:

- current direct selection remains compact and obvious;
- random-from-acceptable uses a compact icon-first action;
- the acceptable pool is available without permanently occupying large vertical space, e.g. a collapsible disclosure;
- sticky preferences and per-character provenance remain separate.

Narrative `Choose for me` is separate from those sticky acceptable pools unless a future system-owned mapping deliberately connects them.

Do not apply the Narrative five-choice ceiling indiscriminately to Guided Mechanical. The ceiling is specifically a Narrative interaction constraint.

## Character review

The right-side review surface should prioritize information useful for evaluating the current generated character:

- identity and major origin/class selections;
- abilities and key derived values;
- meaningful granted capabilities/proficiencies;
- equipment/resources where relevant;
- validation status;
- generation seed/provenance when useful;
- drill-down to the complete native/CharacterDocument representation.

All creation modes publish through the same ordinary CharacterDocument review/save boundary. Quick and Narrative do not own parallel result models.

Do not reserve equal visual weight for raw JSON. Keep inspection available as a drill-down rather than making it the primary character view.

## Randomize All by creation mode

Shared `Randomize All` is an orchestration control, not a promise that every mode has identical random semantics.

- Guided Mechanical delegates to its existing D&D field randomizers and random-roll control.
- Guided Narrative hides/disables shared `Randomize All`; every Narrative question exposes its own `Choose for me`, resolved from the Narrative seed.
- Quick Generate hides/disables shared `Randomize All`; Quick owns randomization through its `Generate character` action.
- The workspace also guards the click path so hidden Guided controls cannot be invoked from Narrative or Quick.
- BRP behavior remains unchanged and no BRP Narrative/Quick mode is implied.

## Extension rule

New classes, backgrounds, species, systems, generators, or companion modules should extend this workspace rather than creating parallel page structures unless a materially different workflow proves the shell inadequate.

Prefer:

- compact controls;
- progressive disclosure;
- dynamic method-specific content;
- easy-to-change/easy-to-undo decisions;
- visible result feedback;
- inspectable recommendation/mapping behavior;
- small Narrative decision sets with upstream narrowing;
- icon-first secondary actions when meaning remains accessible through label/title/ARIA text.

Avoid:

- stacked walls of near-duplicate forms;
- validation popups for easily reversible creation changes;
- hiding the generated character below a long control surface;
- duplicating native-generation logic in browser-only handlers;
- duplicating Guided Mechanical detail controls inside Narrative;
- Narrative random choices without an explicit `Choose for me` equivalent;
- Narrative steps with more than 5 presented choices;
- full mechanical catalogs masquerading as Narrative overrides.

## Current evidence

Automated-green D&D Quick creator consolidation:

- SHA: `418db810828c6a44d7b24b88ef69a3b6ffdffc40`;
- Actions: `34382893940`;
- job: `102571852183`;
- 41 test files / 197 tests / 0 failures.

Automated-green first D&D Guided Narrative vertical slice:

- SHA: `bd5de95193002cb7ad176c5b325d42d5e21ff78c`;
- Actions: `34384877186`;
- job: `102578522427`;
- 42 test files / 203 tests / 0 failures.

Automated-green Narrative choice-shape refinement:

- SHA: `3ff8b064e614f964e83ff7dfc5549ce96594a33a`;
- Actions: `34386315636`;
- job: `102583371487`;
- 42 test files / 204 tests / 0 failures.

The current D&D Narrative contract enforces a maximum of 5 presented choices and mapped candidate sets. The browser now renders only narrowed Class/Background/Species candidates, and the system rejects out-of-branch Narrative overrides.

Owner browser QA remains useful as accumulated creator QA, but these slices do not create a separate browser-QA gate.
