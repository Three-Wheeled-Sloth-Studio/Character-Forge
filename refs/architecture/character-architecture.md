# Character Architecture

Status: Foundation contract, intentionally narrow.

## Architectural goal

Character Forge must support faithful system-native characters while gradually learning enough shared semantics to translate, integrate, and eventually inform an original RPG. Those are related goals, but they must not be collapsed into one data model prematurely.

## Layer 1: Character identity and project relationships

Character identity covers durable identity and cross-project relationships that do not belong to a specific rules implementation. Parchment Worlds will ultimately own project membership, asset relationships, permissions, hosted persistence, and sharing.

Character Forge should keep the standalone character contract independent enough to run without the Parchment host.

## Layer 2: Native system state

Native system state is mandatory and authoritative for round-tripping back to that native system.

A native state records:

- Stable state identifier.
- Rules system identifier.
- Edition identifier.
- Rules/content version.
- Native schema version.
- Complete JSON-safe native payload.
- Provenance.

A CharacterDocument can retain multiple native representations over its lifetime, for example an imported source character plus one or more translated targets. One retained state is explicitly primary.

### Hard invariant

Do not discard a native payload because an equivalent-looking semantic projection exists. Do not regenerate a retained native payload from semantic traits during ordinary save/load. Exact native preservation is required for later translation testing.

## Layer 3: Semantic projection

The semantic projection is optional in the foundation and deliberately marked provisional or validated.

Its purpose is to express cross-system meaning such as capability, resistance, training, relationships, possessions, conditions, or fictional truths. It is not initially expected to cover every native field.

New semantic vocabulary should be promoted only after concrete system work demonstrates a reusable concept. D&D alone is not sufficient evidence that a mechanic is universal.

## Generation provenance

Generation is recorded separately from native state. The record captures method, mode, recipe version, rules sources, seed where relevant, and important decisions or narrative answers.

This enables:

- Deterministic or near-deterministic replay.
- Targeted rerolls.
- Debugging.
- Comparison between generation methods.
- Later evaluation of narrative generation choices.

Guided narrative generation is a first-class mode because its inputs and decision path are meaningful provenance, not merely presentation state.

## Translation boundary

Future translation should follow:

`native source -> semantic interpretation -> target mapping -> native target`

The source native state remains retained throughout the operation. Translation output must eventually carry mapping quality such as exact, equivalent, approximate, substituted, unsupported, or lost.

No translator package is created in PI 0. The evidence ledger is the first translation artifact.

## Adapter boundaries

Planned adapters include rules systems and VTTs. These boundaries should translate between explicit contracts rather than leak external schemas into shared packages.

Foundry Actor or Item schemas must not become Character Forge's canonical character representation.

## Agile constraint

This architecture is a guardrail, not a frozen ontology. Change it when implementation evidence shows a better boundary, but preserve migrations, tests, and native source data while doing so.
