---
type: "Product Reference"
title: "Creator Workspace"
tags:
- character-forge
- product
---
# Creator Workspace

Status: Product/UI standard established by the D&D guided-creation refactor and extended through BRP/D&D player-usable browser QA on 2026-09-11.

## Core Layout

Character Forge creation and maintenance surfaces should default to a two-part workspace:

- **left:** generation/editing controls;
- **right:** the current character review/sheet.

The user should be able to adjust creation inputs without losing sight of the resulting character. On desktop, long control and review columns should scroll independently. On narrow screens, the layout may collapse to one column without changing the conceptual separation.

Every control and content block must remain inside the panel that owns it. Fixed child widths, action labels, grids, and form controls must not cross, clip through, or visually escape panel edges.

On desktop, the creator and result panes are user-resizable through a bounded vertical splitter. The splitter must:

- keep both panes above usable minimum widths;
- resize continuously while dragging;
- keep child controls contained while either pane changes width;
- expose a discoverable grab affordance without becoming a third visual panel;
- support keyboard adjustment through the semantic separator pattern where practical; and
- collapse away with the normal one-column layout when the viewport is too narrow for a useful split.

A remembered local pane width is a convenience only and must always be clamped to the current viewport.

## Interactive Control Affordance

Data-entry controls and actions must read differently at a glance.

- Text inputs and selects use the restrained form-control shape.
- Buttons should normally be more rounded than neighboring text inputs and selects.
- Enabled actions must look enabled before hover. Do not style clickable controls with the low-contrast/desaturated treatment reserved for disabled state.
- Compact secondary actions should default to icon-first when a familiar symbol carries the meaning.
- Icon-first actions must retain the full action name through `title`/tooltip text and an accessible label.
- Randomize, re-roll, suggest, edit, copy, download, print, expand/collapse, and similar compact actions are strong icon-first candidates.
- Use familiar conventional icons for common document actions. Copy should read as overlapping documents/rectangles; Download should read as a downward transfer/download symbol; Print should read as a printer.
- Do not replace visible text with an ambiguous icon merely to reduce width.
- Related action buttons should share shape, border, hover, active, and focus behavior so actions remain visually distinct from data-entry controls.

These are Character Forge applications of the studio-wide TWS Design Principles standards, not theme-specific exceptions.

## Control Hierarchy

Put controls shared across creation modes and generation methods near the top of the left panel. Method-specific controls should not duplicate the whole creator.

For D&D, the rules-system selector remains above a compact top-level creation-mode selector:

- `Guided Mechanical` - default detailed mechanical creator;
- `Guided Narrative` - fictional/preference-oriented recommendation flow;
- `Quick Generate` - minimal-input system-owned generator.

Within Guided Mechanical, Standard Array, Point Cost, Random, and Manual remain ability-generation methods, not sibling creator modes.

All three D&D mode roots remain mounted during ordinary mode switching so a simple toggle does not discard in-progress form state.

## Guided Narrative Interaction Contract

Guided Narrative is a front end over ordinary system-native choices. It must not become a second character model or duplicate the detailed Guided Mechanical editor.

The current D&D pattern is:

1. system-owned Narrative questions produce explicit answer IDs;
2. system-owned mapping converts answers into narrowed candidate/recommended ordinary D&D choices;
3. the creator shows only the narrowed candidates or mapped result for the current branch;
4. the player may override where the branch exposes an override;
5. changing an upstream answer may open or remove dependent branches;
6. the player may build immediately with defined Narrative defaults or explicitly `Continue in Guided Mechanical`;
7. continuation initializes the existing detailed editor rather than copying it;
8. final construction still uses ordinary native generation and the normal review/save boundary.

### Choose for me

Every Narrative question or Narrative choice surface must provide an explicit `Choose for me` option, or a semantically equivalent explicit action.

When `Choose for me` uses randomness:

- eligible alternatives are defined by the owning system/content package;
- deterministic replay should be used where practical and the seed retained;
- submitted-versus-resolved values should be retained when meaningful;
- direct player choices and later overrides remain authoritative.

Do not hide this behavior behind a global randomizer or opaque browser logic.

### Narrative choice density

Narrative should feel like a sequence of small meaningful discriminators rather than a mechanical catalog browser.

Use these rules:

- target about 3 presented choices at a Narrative step where practical;
- hard maximum 5 presented choices at any Narrative step;
- `Choose for me` or semantic equivalent counts toward that maximum;
- if the next Narrative step would exceed 5 choices, add an upstream bounded discriminator or leave that choice to Guided Mechanical;
- do not expose the full Class, Species, Alignment, profession, spell, equipment, Invocation, or similar rules catalog merely because the mechanical editor can;
- Narrative overrides remain within the narrowed branch;
- once the user explicitly continues into Guided Mechanical, ordinary mechanical catalogs are outside this Narrative ceiling.

Five is the hard upper bound, not the design target.

## Conditional Narrative Branches

A Narrative question does not need to be global. A Class-, species-, background-, setting-, or other system-owned branch may appear only when an already-resolved upstream choice makes that question meaningful.

Conditional branches are appropriate when:

- the downstream choice is materially meaningful to the character concept;
- the owning rules/content package can express a small honest player-facing discriminator;
- the presented branch stays at or below the five-choice ceiling;
- the result maps to existing native/mechanical choices;
- the branch can be replayed deterministically when `Choose for me` is used;
- removing the upstream condition cleanly removes the downstream applicability;
- implementation does not require a generic questionnaire engine solely for one consumer.

Similar location in a mechanical form is not evidence of shared semantics. Prefer a narrow Class-specific question over inventing a universal class-feature or combat-role ontology.

## Current D&D Narrative Evidence

### Alignment decomposition

D&D Alignment proves that a mechanical catalog larger than the Narrative ceiling can be reached through bounded upstream questions.

Guided Narrative asks two D&D-owned questions with three substantive choices each plus `Choose for me`:

- structure versus case-by-case judgment versus personal freedom;
- protect others versus balance needs versus self-first.

Their 3 x 3 combinations map to the ordinary nine Alignment IDs. Narrative never displays a nine-item Alignment menu.

This remains D&D-specific and is not evidence for a universal morality/personality ontology.

### Starting-equipment preference

Starting equipment proves evidence-first abstraction.

The supported D&D catalogs show:

- 11 Classes with prepared kit `A` versus starting gold `B`;
- Fighter with prepared kits `A` and `B`, plus starting gold `C`;
- all four Backgrounds with prepared kit `A` versus 50 GP `B:50-gp`.

That justifies only one shared player-intent question:

- prepared gear -> existing Class `A` plus Background `A`;
- starting gold -> each Class's existing gold choice plus Background `B:50-gp`.

Fighter's alternate prepared kit remains a Fighter detail rather than a universal equipment category.

These option IDs are generation choices and retained provenance. They are not acceptable player-facing equipment summaries after character construction. Once the native character exists, review and sheet surfaces must show its concrete native `equipment` entries and currency rather than `A`, `B`, `C`, or generic `Equipment package` text.

### Fighter Fighting Style branch

Fighter is the first proof of a conditional Class-specific Narrative branch.

The branch appears only when the current Narrative Class is Fighter and asks:

`As a Fighter, what fighting approach sounds most fun?`

It presents exactly five choices total:

- `Choose for me`;
- control the fight from range -> Archery;
- stay hard to hurt while holding the line -> Defense;
- commit to heavy two-handed blows -> Great Weapon Fighting;
- fight with a weapon in each hand -> Two-Weapon Fighting.

The mapping is one-to-one with the existing D&D Fighting Style catalog. Direct Narrative Build sets the existing `fightingStyleFeatId` before ordinary native generation.

If the current Narrative Class changes away from Fighter, the branch becomes inapplicable. This does not erase retained Narrative history in a later hybrid character; it only means there is no final Fighter-specific mechanical choice to apply.

Fighter Fighting Style is not promoted into a universal combat-role or class-feature ontology.

## Narrative -> Guided Mechanical Continuation

`Continue in Guided Mechanical` is an explicit transfer operation, not merely a mode toggle.

The current continuation record may retain:

- Narrative mapping ID/version;
- Narrative seed;
- submitted and resolved global answers;
- conditional Class-specific answers when applicable;
- narrowed candidate sets and recommendations;
- exact Narrative-final Class/Background/Species/Alignment values;
- exact Narrative starting Class/Background equipment choices;
- exact Narrative starting Fighter Fighting Style when the starting Class is Fighter.

The final built CharacterDocument uses `hybrid` generation provenance. Later Guided Mechanical edits are authoritative while the Narrative starting point remains inspectable.

Continuation provenance is replay-validated before attachment. It never patches or reconstructs native state.

### Transfer initialization and rerenders

Class, Background, and Species use one-shot transient current selections so persisted acceptable random pools are not rewritten.

Alignment, Class equipment, and Fighter Fighting Style are detailed controls that may be recreated by dependent rerenders. The controller may reapply an untouched Narrative starting value until the player explicitly interacts with that control.

Initialization must not dispatch a persistence change.

Once the player changes a transferred control, invokes its randomizer, or edits its acceptable pool, that Guided Mechanical intent is authoritative and Narrative stops reapplying the starting value.

For Class equipment, an untouched Narrative preference is remapped against the current Class after a Class change so the current mechanical choice remains legal.

For Fighter Fighting Style, changing Class away from Fighter removes the applicable final style; changing back may expose the normal Guided control, but Narrative must not overwrite an explicit later Guided Fighting Style intent.

### Direct choice versus sticky acceptable pool

The current direct selection and the user-sticky acceptable random pool are separate UI concepts.

- A direct current choice may be outside the sticky random pool.
- A randomly selected choice must come from the acceptable pool.
- Narrative continuation may initialize a legal current direct choice without rewriting the persisted acceptable pool.
- Sticky preferences describe what the user is generally willing to randomize among; they are not a universal validity constraint on direct choices.

This boundary applies to transferred Alignment, Class equipment, and Fighter Fighting Style.

## Choice Menus

Ordinary mechanical menu choices should use the established acceptable-option pattern when appropriate:

- current direct selection remains compact and obvious;
- random-from-acceptable uses a compact icon-first action;
- the acceptable pool is available through progressive disclosure rather than permanent vertical bulk;
- sticky preferences and per-character provenance remain separate.

Narrative `Choose for me` is separate from those sticky acceptable pools unless a future system-owned mapping deliberately connects them.

Do not apply the Narrative five-choice ceiling indiscriminately to Guided Mechanical.

## Character Review And Dedicated Sheet

For systems with an implemented sheet projection, the right-side result surface is the dedicated character sheet, not a parallel hand-written summary page.

The sheet should prioritize information useful during actual play while allowing drill-down to the complete native/CharacterDocument representation. Current supported systems are BRP and D&D.

The dedicated result surface must provide compact icon-only document actions above the sheet:

- Print / Save as PDF;
- Copy full CharacterDocument JSON; and
- Download full CharacterDocument JSON.

Visible button text is unnecessary when a conventional icon is clear; the complete action name remains available through hover/title and `aria-label`. The controls are application chrome and must not print.

The dedicated first page reserves presentation space for a character portrait and a VTT token. Those placeholders do not make images part of native rules state; actual image/token references will come from the future character-asset relationship boundary.

All creation modes publish through the same ordinary CharacterDocument review/save boundary. Quick and Narrative do not own parallel result models.

Raw JSON remains a drill-down, not the primary character view.

## Randomize All By Creation Mode

Shared `Randomize All` is orchestration, not a promise of identical semantics across modes, but its visible label is a product promise: when it is shown, it must produce an obvious meaningful randomized result rather than silently invoking only one or two narrow field helpers.

- Guided Mechanical delegates to existing D&D field randomizers and random-roll controls.
- Guided Narrative hides/disables shared `Randomize All`; each Narrative question uses its own `Choose for me` behavior from the Narrative seed.
- Quick Generate hides/disables shared `Randomize All`; Quick owns randomization through `Generate character`.
- The workspace guards the click path so hidden Guided controls cannot run from Narrative or Quick.
- BRP `Randomize All` performs a system-aware whole-character pass over randomizable player-facing creation state: display name, age, gender, supported profession, legal profession wealth/electives, characteristics, Scholar academic specialties when relevant, and complete legal professional/personal skill allocations.
- BRP `Randomize All` preserves campaign/rules configuration, the selected characteristic-generation method, freeform language identities, and finishing/background details unless those fields later gain explicit owned randomization semantics.
- BRP convenience name and open-specialty defaults are Character Forge generation content, not assertions that those names/specialties are BRP rules content.
- Randomized skill allocations must remain legal, fully spend the required budgets, respect the starting cap, and validate through the existing BRP builder/adapter path.

A whole-character randomizer must change enough visible state that the action is self-evident in the current form. Regression tests should cover deterministic seeded behavior and legal output; real-browser QA must still confirm the interaction is visually obvious.

## Extension Rule

New classes, backgrounds, species, systems, generators, or companion modules should extend this workspace rather than creating parallel page structures unless a materially different workflow proves the shell inadequate.

Prefer:

- compact controls;
- progressive disclosure;
- controls that remain contained at every supported pane width;
- a bounded resizable split when two persistent panes compete for legitimate space;
- conditional Narrative branches only where semantics justify them;
- easy-to-change/easy-to-undo decisions;
- visible result feedback;
- system-owned sheet projections instead of parallel custom result markup;
- concrete native state in player-facing review rather than internal option IDs;
- inspectable recommendation/mapping behavior;
- small Narrative decision sets with upstream narrowing;
- explicit transfer/controller seams rather than DOM-click automation;
- icon-first secondary actions when meaning remains accessible through title/ARIA text;
- enabled actions with unmistakable active affordance and more rounded action geometry than neighboring data-entry controls.

Avoid:

- stacked walls of near-duplicate forms;
- validation popups for easily reversible creation changes;
- hiding the generated character below a long control surface;
- controls that clip through or escape their owning panel;
- rigid split-pane ratios that leave either pane unusable;
- enabled buttons that visually read as disabled;
- wordy compact buttons where a familiar icon plus tooltip is clearer;
- separate custom review pages when the system has a dedicated sheet projection;
- exposing generation option IDs such as equipment `A/B/C` as final player-facing content;
- duplicating native-generation logic in browser-only handlers;
- duplicating Guided Mechanical detail controls inside Narrative;
- Narrative random choices without an explicit `Choose for me` equivalent;
- Narrative steps with more than 5 presented choices;
- full mechanical catalogs masquerading as Narrative overrides;
- generic branching/questionnaire infrastructure before repeated consumers require it;
- rewriting sticky acceptable pools merely to initialize an explicit direct choice;
- promoting one D&D preference mapping into a universal personality, combat-role, class-feature, or equipment ontology.
