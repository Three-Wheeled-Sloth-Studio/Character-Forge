---
type: "Architecture Plan"
title: "Universal Grammar v0.1"
tags:
- character-forge
- universal-grammar
- translation
- semantic-layer
---
# Universal Grammar v0.1

Date: 2026-09-09
Status: planned after Fate third-system probe

Parent direction: `refs/planning/brp-to-universal-grammar-path.md`

## Goal

Formalize the first versioned cross-system semantic grammar from implementation evidence rather than designing a universal character model in the abstract.

## Required evidence before freeze

Universal Grammar v0.1 should not be frozen until Character Forge has reviewed native implementation evidence from:

- D&D 5E 2024;
- BRP Universal Game Engine;
- Fate Condensed third-system probe.

The translation/bridge evidence ledger may evolve before then; only the v0.1 freeze is gated on the third-system evidence.

## Canonical-state rule

Native system state remains authoritative and lossless.

Universal Grammar is a derived semantic projection used for translation, comparison, interoperability, downstream consumers, and declared-loss reporting. It must never become the only retained representation of a character.

## Concept-promotion test

Promote a semantic concept only when implementation evidence shows that it is genuinely useful across systems and one of these conditions holds:

1. the systems share substantially the same meaning;
2. a common envelope preserves meaningful variants without hiding differences;
3. an approximate/common concept is useful and translation loss can be stated explicitly.

Similar labels, screen placement, or numeric shape are not enough.

## Translation requirements

The grammar must support mappings that are:

- exact/one-to-one;
- one-to-many;
- many-to-one;
- approximate;
- contextual;
- omitted/untranslatable.

Every non-exact mapping must be able to carry explicit loss/assumption information.

## Anti-goals

Do not create by default:

- a universal ability bucket combining feats, spells, powers, stunts, and skills;
- a universal hit-point/damage model;
- a universal class/profession/archetype model;
- a universal campaign power-level field;
- a universal fixed identity taxonomy for open specialties, languages, cultures, or names;
- a schema that requires native systems to discard source-specific semantics.

## Relationship to CharacterDocument

CharacterDocument continues to own durable character identity, native system states, and generation provenance. Universal Grammar may be stored/cached as a versioned projection only when its derivation/version/provenance are explicit and it can be regenerated or invalidated safely.

## Relationship to Bridge RPG

Bridge RPG is a downstream consumer of the grammar and accumulated translation evidence. It must not dictate the representation of D&D, BRP, or Fate merely because those systems may later translate into it.

## First deliverable after Fate

Produce an evidence matrix listing candidate concepts across D&D, BRP, and Fate with:

- native source concepts;
- proposed universal semantic concept, if any;
- exact/approximate/contextual relationship;
- known translation losses;
- systems where no honest mapping exists;
- confidence/evidence notes.

Review that matrix before writing or changing a shared schema.
