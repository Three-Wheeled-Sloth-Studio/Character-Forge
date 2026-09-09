---
type: "Product Reference"
title: "Creator Workspace"
tags:
- character-forge
- product
---
# Creator Workspace

Status: Product/UI standard established by the D&D guided-creation refactor and extended with top-level Guided Mechanical, Guided Narrative, and Quick Generate modes, explicit Narrative -> Guided continuation, and bounded Narrative alignment decomposition on 2026-09-09.

## Core layout

Character Forge creation and maintenance surfaces should default to a two-part workspace:

- **left:** generation/editing controls;
- **right:** the current character summary and details.

The user should be able to adjust creation inputs without losing sight of the resulting character. On desktop, long control and review columns should scroll independently. On narrow screens, the layout may collapse to one column without changing the conceptual separation.

## Control hierarchy

Put controls shared across creation modes and generation methods near the top of the left panel. Method-specific controls should not duplicate the whole creator.

For D&D, the rules-system selector remains above a compact top-level creation-mode selector:

- `Guided Mechanical` - default detailed mechanical creator;
- `Guided Narrative` - fictional/preference-oriented recommendation flow;
- `Quick Generate` - minimal-input system-owned generator.

Within Guided Mechanical, Standard Array, Point Cost, Random, and Manual remain ability-generation methods, not sibling creator modes.

All three D&D mode roots remain mounted during ordinary mode switching so a simple toggle does not discard in-progress form state.

## Guided Narrative Interaction Contract

Guided Narrative is a front end over ordinary system-native choices. It must not become a second character model or duplicate the detailed Guided Mechanical editor.

The D&D implementation proves this pattern:

1. system-owned Narrative questions produce explicit answer IDs;
2. system-owned mapping converts them into narrowed candidate/recommended ordinary D&D choices;
3. the creator shows only the narrowed candidates or mapped result for the current Narrative branch;
4. the player may override where the branch exposes an override;
5. changing an upstream Narrative answer opens a different branch;
6. the player may either build immediately with defined Narrative defaults or explicitly `Continue in Guided Mechanical`;
7. continuation initializes the existing detailed editor rather than copying it;
8. final construction still uses ordinary native generation and the normal review/save boundary.

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
- do not expose the full Class, Species, alignment, profession, spell, equipment, or similar rules catalog as a Narrative override when it exceeds the limit;
- Narrative overrides remain within the narrowed branch;
- once the user explicitly continues into Guided Mechanical, ordinary mechanical catalogs are outside this Narrative ceiling and may use their normal interaction patterns.

The target of about 3 is a design goal. Five is the hard upper bound.

## Alignment decomposition proof

D&D alignment is the first concrete proof that a mechanical catalog larger than the Narrative ceiling can be reached without weakening the ceiling.

The ordinary Guided Mechanical control still contains all nine supported alignments. Guided Narrative instead asks two D&D-owned questions with three substantive choices each plus `Choose for me`:

- how the character leans when structure and personal freedom conflict;
- how the character weighs personal goals against other people's well-being.

The 3 x 3 answer combinations map to the ordinary nine alignment IDs. Narrative never displays a nine-item alignment menu.

This mapping is intentionally D&D-specific. It is not evidence for a universal morality, personality, psychology, or alignment ontology.

## Narrative -> Guided Mechanical Continuation

The existing D&D detailed editor is the destination for deeper mechanical customization.

`Continue in Guided Mechanical` is an explicit transfer operation, not merely a mode toggle. The current implementation transfers the Narrative name and exact pre-Guided Class, Background, Species, and Alignment selections into the existing Guided form.

The system-owned continuation record retains:

- Narrative mapping ID/version;
- Narrative seed;
- submitted and resolved answers;
- narrowed candidates and recommendations;
- the exact Narrative final Class/Background/Species/Alignment values before continuation.

The final built CharacterDocument uses `hybrid` generation provenance. Later Guided Mechanical edits are authoritative while the Narrative starting point remains inspectable.

Continuation provenance is replay-validated before being attached to a final character. It does not patch or reconstruct native state.

### Transfer initialization and rerenders

Class, Background, and Species use one-shot transient current selections so persisted acceptable random pools are not rewritten.

Alignment is a core control that may be recreated when dependent Guided controls rerender. The D&D controller therefore initializes the existing alignment select from the Narrative result and reapplies that initial value after unrelated core rerenders until the player explicitly interacts with alignment. It does not dispatch a persistence change during initialization.

Once the player changes alignment, invokes its randomizer, or edits its acceptable pool, that Guided Mechanical intent is authoritative and the controller stops reapplying the Narrative starting value.

### Direct choice versus sticky acceptable pool

The current direct selection and the user-sticky acceptable random pool are separate UI concepts.

- A direct current choice may be outside the sticky random pool.
- A randomly selected choice must still come from the acceptable pool.
- Narrative continuation may initialize the current direct choice without rewriting the persisted acceptable pool.
- Sticky preferences describe what the user is generally willing to randomize among; they are not a universal validity constraint on every direct choice.

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
- explicit transfer/controller seams rather than DOM-click automation;
- icon-first secondary actions when meaning remains accessible through label/title/ARIA text.

Avoid:

- stacked walls of near-duplicate forms;
- validation popups for easily reversible creation changes;
- hiding the generated character below a long control surface;
- duplicating native-generation logic in browser-only handlers;
- duplicating Guided Mechanical detail controls inside Narrative;
- Narrative random choices without an explicit `Choose for me` equivalent;
- Narrative steps with more than 5 presented choices;
- full mechanical catalogs masquerading as Narrative overrides;
- rewriting sticky acceptable pools merely to initialize an explicit direct choice;
- promoting one D&D preference mapping into a universal personality or equipment ontology.

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

Automated-green Narrative -> Guided Mechanical continuation:

- SHA: `b56efbadc5fcfdbb353cc3f8e74ebda10f6c905b`;
- Actions: `34388640406`;
- job: `102591189046`;
- 44 test files / 210 tests / 0 failures.

Automated-green Narrative alignment decomposition:

- SHA: `3d9be423d46c45c00ef2eed1b7d643186ed6530a`;
- Actions: `34392030680`;
- job: `102602424501`;
- 44 test files / 211 tests / 0 failures.

The next bounded Narrative consumer is starting-equipment preference. Audit the actual Class/Background option semantics first; do not force one generic Narrative question if the supported equipment catalogs do not justify it.

Owner browser QA remains useful as accumulated creator QA, but these slices do not create a separate browser-QA gate.
