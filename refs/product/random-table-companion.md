---
type: "Product Reference"
title: "Random Table Companion"
tags:
- character-forge
- generation
- random-tables
---
# Random Table Companion

Status: System-neutral evaluator plus two system-owned BRP creator consumers are implemented and automated-green on `dev`.

## Purpose

Character Forge needs reusable random-table evaluation for structured suggestions such as traits, ideals, bonds, flaws, equipment/trinkets, tags, and system-native IDs without turning those tables into a second character model.

The companion exists to answer one bounded question: given a versioned table and a deterministic draw identity, which typed result was selected and what provenance is required to replay it?

## Current contract

The evaluator lives in `packages/generator-core/src/randomTable.ts` because it is a system-neutral generation primitive alongside seeded randomness and dice expressions.

A table provides:

- a stable table ID;
- a table version;
- a source/dataset ID and source version;
- one or more stable entry IDs;
- optional positive weights, defaulting to 1;
- an arbitrary typed result payload owned by the caller.

An evaluation provides:

- evaluator version;
- table ID and version;
- source ID and version;
- caller-provided seed;
- explicit non-negative `drawIndex`;
- selected entry ID;
- selected and total weight;
- the typed result payload unchanged.

The evaluator is deterministic for the tuple of evaluator version, source identity/version, table identity/version, seed, and draw index.

## Why drawIndex is explicit

Random-table draws must not depend on a hidden global random-stream position. A caller can regenerate draw 7 later without replaying draws 0 through 6 first.

That supports partial regeneration, easy undo/retry behavior, and durable replay provenance without requiring a dependency graph before real consumers justify one.

## Ownership boundary

The generic evaluator does not know what a trait, ideal, flaw, bond, equipment item, language, species choice, profession choice, or academic specialty means.

System-owned packages remain responsible for:

- table datasets and source/licensing provenance;
- result payload types;
- mapping a selected result into an ordinary generation decision or structured suggestion;
- validating any accepted choice through normal native builders/adapters;
- deciding what accepted result belongs in native state and generation provenance.

The evaluator must never patch a `CharacterDocument` or a system-native payload directly.

## First concrete consumer: BRP profession suggestion

`packages/system-brp/src/professionSuggestion.ts` proves the first end-to-end system-owned boundary without adding new BRP rules breadth.

The BRP-owned table:

- uses table ID `brp-uge.profession.first-slice` version `1`;
- uses source `chaosium-brp-uge-orc-1.05` version `1.05`;
- contains only Detective and Scholar, the two professions already supported by the current BRP slice;
- returns a BRP-owned structured payload containing profession ID and label;
- delegates deterministic selection to the generic evaluator.

The creator exposes a `Suggest` action beside Profession. A user may accept the selected profession or override it with the ordinary selector. Profession validity still comes from the existing BRP creator state, builder, and adapter.

When a suggestion is accepted, BRP retains its replay provenance in the ordinary generation decision list as `identity.profession-suggestion`. The provenance decorator verifies that the retained native BRP profession matches the suggested profession and then changes only generation metadata; it does not patch or reconstruct native state.

Reopen reads the retained suggestion only when its source/table/evaluator provenance is current and it still agrees with the authoritative native profession.

Evidence:

- code checkpoint: `d4b881b29bd763d9f7fd50e56223b00b37077be2`
- Actions: `34366600372`
- job: `102516809719`
- 34 test files / 168 tests / 0 failures
- 4 focused profession-suggestion tests

## Second concrete consumer: BRP Scholar academic suggestion

`packages/system-brp/src/scholarAcademicSuggestion.ts` proves that result payloads can carry nested system-owned structure without changing the generic evaluator or inventing a universal suggestion schema.

The table:

- uses table ID `brp-uge.scholar-academic.first-slice` version `1`;
- uses source `chaosium-brp-uge-orc-1.05` version `1.05`;
- reuses only source-safe academic definitions already present in `BRP_FIRST_SLICE_SKILL_CATALOG`;
- currently suggests Knowledge (Law) or Science (Forensics);
- returns BRP skill key, nested `BrpAcademicSkillSelection`, display label, and source base chance.

The nested selection retains both the Knowledge/Science parent and specialty identity. This is a richer result payload, not a nested random table.

The creator exposes `Suggest` on each of the five Scholar academic rows. Suggestions are ordinary row values and remain manually editable. Manual editing clears only that row's suggestion provenance.

Accepted provenance is retained as `identity.profession-academic-suggestion` with:

- Scholar slot index;
- the complete structured result;
- evaluator/table/source versions;
- seed and draw index;
- selected entry and weight evidence.

Multiple Scholar slot records may coexist. Re-suggesting one slot replaces only that slot's prior record. Reopen restores records only while the structured result still agrees with the authoritative native Scholar academic selection.

As with the first consumer, the provenance decorator runs only after the ordinary BRP builder/adapter has produced a valid native character and does not patch native state.

Evidence:

- code checkpoint: `54d471faa5a635e46ab9db90f8d05d26ac32944f`
- Actions: `34368120736`
- job: `102522033597`
- 35 test files / 173 tests / 0 failures
- 5 focused Scholar academic-suggestion tests

## Evidence gained

The two consumers now prove:

- system-owned simple and nested result payloads;
- deterministic replay using the same generic evaluator;
- creator-visible suggestion and manual override;
- per-slot retained suggestion provenance;
- multiple independent suggestion records;
- stale/mismatched provenance rejection on reopen;
- no direct native-state mutation.

This still does not justify a universal trait/ideal/bond/flaw vocabulary. A BRP academic selection remains a BRP academic selection.

Likewise, nested result structure does not justify nested/subtable evaluation. No current consumer requires subtables.

## Next evidence direction

The immediate product need has shifted from another table payload to creator randomization orchestration. D&D and BRP now expose several independent random/suggestion actions, but the user-facing pattern is inconsistent and there is no shared `Randomize All` interaction.

Shared creator code should coordinate randomization interactions only. Legal choices, acceptable pools, system distributions, and table datasets remain system-owned.

Do not invent BRP Age, Gender, Wealth, or other distributions just to make `Randomize All` exhaustive. Fields without an explicit system-owned randomization rule can remain unchanged.

A future consumer from D&D or another system will still be useful cross-system evidence for the companion, but it is not required before the orchestration slice.

## Explicitly deferred

Do not add these until a real consumer requires them:

- nested/subtable evaluation;
- roll-range or dice-table authoring syntax;
- multi-draw uniqueness rules;
- without-replacement sampling;
- conditional table graphs;
- a universal trait/ideal/flaw ontology;
- direct native-state mutation;
- user-authored table persistence/editor UI.

Subtable references are a known likely requirement, but nesting remains intentionally deferred until an actual table needs it.

## Replay and versioning rule

Changing table entries or weights changes table behavior and therefore requires a table-version change. Changing the source dataset or source interpretation requires a source-version change. Changing evaluator semantics requires an evaluator-version change.

Consumers should retain the returned provenance with the generation decision or suggestion when replayability matters.
