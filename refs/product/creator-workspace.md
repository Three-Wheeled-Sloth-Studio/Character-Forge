---
type: "Product Reference"
title: "Creator Workspace"
tags:
- character-forge
- product
---
# Creator Workspace

Status: Product/UI standard established by the D&D guided-creation refactor and extended with top-level Guided Mechanical, Guided Narrative, and Quick Generate modes, explicit Narrative -> Guided continuation, bounded Alignment decomposition, starting-equipment transfer, and the first conditional Class-specific Narrative branch on 2026-09-09.

## Core Layout

Character Forge creation and maintenance surfaces should default to a two-part workspace:

- **left:** generation/editing controls;
- **right:** the current character summary and details.

The user should be able to adjust creation inputs without losing sight of the resulting character. On desktop, long control and review columns should scroll independently. On narrow screens, the layout may collapse to one column without changing the conceptual separation.

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

## Character Review

The right-side review surface should prioritize information useful for evaluating the current generated character:

- identity and major origin/class selections;
- abilities and key derived values;
- meaningful granted capabilities/proficiencies;
- equipment/resources where relevant;
- validation status;
- generation seed/provenance when useful;
- drill-down to the complete native/CharacterDocument representation.

All creation modes publish through the same ordinary CharacterDocument review/save boundary. Quick and Narrative do not own parallel result models.

Raw JSON remains a drill-down, not the primary character view.

## Randomize All By Creation Mode

Shared `Randomize All` is orchestration, not a promise of identical semantics across modes.

- Guided Mechanical delegates to existing D&D field randomizers and random-roll controls.
- Guided Narrative hides/disables shared `Randomize All`; each Narrative question uses its own `Choose for me` behavior from the Narrative seed.
- Quick Generate hides/disables shared `Randomize All`; Quick owns randomization through `Generate character`.
- The workspace guards the click path so hidden Guided controls cannot run from Narrative or Quick.
- BRP behavior remains unchanged and no BRP Narrative/Quick mode is implied.

## Extension Rule

New classes, backgrounds, species, systems, generators, or companion modules should extend this workspace rather than creating parallel page structures unless a materially different workflow proves the shell inadequate.

Prefer:

- compact controls;
- progressive disclosure;
- conditional Narrative branches only where semantics justify them;
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
- generic branching/questionnaire infrastructure before repeated consumers require it;
- rewriting sticky acceptable pools merely to initialize an explicit direct choice;
- promoting one D&D preference mapping into a universal personality, combat-role, class-feature, or equipment ontology.

## Current Evidence

Latest automated-green Narrative checkpoints:

- Narrative -> Guided Mechanical continuation: `b56efbadc5fcfdbb353cc3f8e74ebda10f6c905b`, Actions `34388640406`, 44 test files / 210 tests;
- Alignment decomposition: `3d9be423d46c45c00ef2eed1b7d643186ed6530a`, Actions `34392030680`, 44 test files / 211 tests;
- starting-equipment preference: `5760a079ad8e188320997dcc02ddf8f683bd1d99`, Actions `34395268461`, 44 test files / 213 tests;
- Fighter Fighting Style branch: `0cc60281fc85d1c13511515b573f30dedf3ea2ab`, Actions `34407597435`, job `102654207021`, 44 test files / 216 tests / 0 failures.

The next bounded candidate is a conditional Cleric/Druid order preference. Verify that Protector/Warden and Thaumaturge/Magician honestly share a player-facing martial-resilience versus broader-magic discriminator before implementing it. If not, split the branch rather than forcing equivalence.

Owner browser QA remains useful as accumulated creator QA. D&D Issue #11 remains the promotion gate.
