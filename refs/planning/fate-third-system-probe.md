---
type: "Architecture Probe Plan"
title: "Fate Condensed Third-System Probe"
tags:
- character-forge
- fate
- third-system
- architecture
- universal-grammar
---
# Fate Condensed Third-System Probe

Date: 2026-09-09
Status: bounded native-state architecture probe implemented 2026-11-21; owner/browser UI and full source-package audit deferred

## 2026-11-21 implementation and findings

`packages/system-fate` provides a source-owned creation input contract, independent
adapter validation, native-state JSON round-trip, five mechanically authoritative
freeform Aspects, a 10-skill pyramid, freeform Stunts (one required in this probe),
refresh/fate points, one-point physical/mental stress tracks and consequence
slots. Tests exercise mutable stress and consequence state, invalid pyramid and
missing aspect rejection, and explicit preservation of narrative choices.

This is a headless creation contract, not yet a mounted Parchment Worlds UI or
a production-complete Fate creator. No Fate-specific rules are added to shared
CharacterDocument. Universal Grammar currently emits only document identity
for Fate and explicitly declares missing characteristic projection.

Findings:

1. Freeform Aspects are authoritative mechanical/narrative state, not merely
   character biography. A universal `trait` string would hide invoke/compel
   semantics and is therefore not justified yet.
2. Fate Stunts are not reliably equivalent to a D&D feat, BRP power or skill.
   Their conditional effects and rules exceptions remain opaque native text.
3. Stress tracks, consequence slots and fate-point refresh have incompatible
   lifecycles with D&D HP and BRP harm. Do not add generic HP/resource mapping.
4. Narrative creation requires open free-text inputs and explicit validation;
   the existing shared `GenerationRecord` already preserves the submitted text.
5. A deferred stunt slot is source-native evidence for delayed choices.
   Implementing a cross-system eligibility/event grammar requires a second
   consumer and explicit lifecycle tests.

Licensing/provenance: Official Fate licensing materials identify a CC-BY 3.0
route and require attribution. This probe records a date-stamped rules snapshot
`probe-2026-11-21`, not an invented SRD edition. Before broadening rules/content
or releasing an end-user Fate system, verify the official downloadable CC-BY
SRD artifact, package attribution and the complete starter options against it.
Source: https://fate-srd.com/official-licensing-fate and
https://fate-srd.com/official-licensing-fate/cc .

Parent direction: `refs/planning/brp-to-universal-grammar-path.md`

## Purpose

Use a deliberately small Fate Condensed implementation to challenge assumptions that survived D&D 5E and BRP UGE before Universal Grammar v0.1 is frozen.

This is not a commitment to make Fate the next full production system.

## Why Fate

Fate supplies high-information contrasts:

- mechanically authoritative freeform Aspects;
- Stunts that resist a simple spell/feat/power/skill taxonomy;
- Stress and Consequences instead of conventional hit-point/wound assumptions;
- narrative statements as first-class character mechanics;
- less dependence on classes, levels, and conventional attributes;
- context-sensitive mechanics that may not survive exact cross-system translation.

Call of Cthulhu would be too BRP-adjacent for this purpose, and Pathfinder would be too D&D-adjacent.

## Licensing/source boundary

At implementation time use the official Fate SRD licensing materials, preferring the CC-BY route unless source review establishes a reason to choose otherwise.

Official references:

- https://fate-srd.com/official-licensing-fate
- https://fate-srd.com/official-licensing-fate/cc
- https://fate-srd.com/fate-condensed

Freeze exact source/version/license metadata and required attribution before importing system content.

## Minimum architecture slice

Prove only enough to answer the cross-system questions:

- Fate-native CharacterDocument state and lossless round trip;
- core Aspects, including High Concept and Trouble if supported by the selected source path;
- the selected Fate Condensed skill/ability structure;
- at least one Stunt;
- Stress;
- Consequences;
- Fate Points/resource state where appropriate;
- adapter validation;
- a small generation/creator interaction proving that freeform narrative mechanics fit—or expose gaps in—the current creator architecture.

Do not build full Fate content breadth before this architecture review.

## Exit questions

Before Universal Grammar v0.1, document:

- which semantics genuinely repeat across D&D, BRP, and Fate;
- which apparently similar concepts are not equivalent;
- how mechanically authoritative freeform statements should project semantically;
- whether any common damage/condition envelope is honest;
- how resource mappings declare incompatibility/loss;
- whether open narrative construction requires a new shared creator interaction primitive.

The result should update the translation/bridge evidence ledger before any universal schema is frozen.
