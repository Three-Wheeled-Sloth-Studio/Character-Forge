---
type: "Product Reference"
title: "Random Table Companion"
tags:
- character-forge
- generation
- random-tables
---
# Random Table Companion

Status: First system-neutral evaluator slice implemented on `dev`. No system dataset or creator UI is wired yet.

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

The generic evaluator does not know what a trait, ideal, flaw, bond, equipment item, language, species choice, or profession choice means.

System-owned packages remain responsible for:

- table datasets and source/licensing provenance;
- result payload types;
- mapping a selected result into an ordinary generation decision or structured suggestion;
- validating any accepted choice through normal native builders/adapters;
- deciding what accepted result belongs in native state and generation provenance.

The evaluator must never patch a `CharacterDocument` or a system-native payload directly.

## First concrete consumers

The existing product evidence is sufficient to justify the engine seam, but not yet enough to justify a universal suggestion schema. Expected consumers include:

- personality traits;
- ideals;
- bonds;
- flaws;
- equipment and trinket suggestions;
- system-owned tags or native IDs;
- weighted narrative or flavor suggestions.

The first system-owned consumer should prove the payload shape before any cross-system suggestion vocabulary is promoted.

## Explicitly deferred

Do not add these until a real consumer requires them:

- nested/subtable evaluation;
- roll-range or dice-table authoring syntax;
- multi-draw uniqueness rules;
- without-replacement sampling;
- conditional table graphs;
- a universal trait/ideal/flaw ontology;
- direct CharacterDocument mutation;
- user-authored table persistence/editor UI.

Subtable references are a known likely requirement, but nesting remains intentionally deferred until an actual table needs it.

## Replay and versioning rule

Changing table entries or weights changes table behavior and therefore requires a table-version change. Changing the source dataset or source interpretation requires a source-version change. Changing evaluator semantics requires an evaluator-version change.

Consumers should retain the returned provenance with the generation decision or suggestion when replayability matters.
