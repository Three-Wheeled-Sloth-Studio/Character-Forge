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
Status: planned after BRP Investigative Horror

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
