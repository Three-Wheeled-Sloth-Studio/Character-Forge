---
type: "System Evidence Matrix"
title: "System Catalog and Universal Grammar Evidence - 2026-11-21"
tags:
- character-forge
- universal-grammar
- system-catalog
---
# System Catalog and Universal Grammar Evidence

Date: 2026-11-21
Status: first bounded implementation slice; external candidates are research targets, not committed adapters

## Catalog and purpose

| System | Status | Distinctive evidence | Next investigation |
| --- | --- | --- | --- |
| D&D 5E 2024 SRD 5.2.1 | Native creator implemented | Classes, levels, source-specific grants, abilities, spell resources | Semantic projections without erasing contribution history |
| BRP UGE ORC 1.05 | Native creator implemented | Percentile skill ratings, professions, open specialties, multiple power grammars | Semantic projections without treating characteristics as D&D scores |
| Fate Condensed | Small architecture probe planned | Freeform authoritative Aspects, Stunts, Stress and Consequences | Probe and revise provisional grammar |
| Blades in the Dark | Research only | Position/effect, clocks, stress, narrative consequences | Licensing and source audit before content |
| Traveller | Research only | Lifepath, careers, events and contingent construction | Version and licensing decision |
| GURPS | Research only | Classless point construction, advantages and disadvantages | Protected-content boundary and complexity UX |
| Dungeon Crawler Carl RPG | Research only | Deferred creation decisions, achievements and progression | Official rules access and license/compatibility review |
| Pathfinder 2E | Later candidate | Structured feats and class advancement | Revisit once non-D&D-shaped systems challenge grammar |

## Evidence matrix

| Candidate concept | D&D native | BRP native | Fate hypothesis (unverified) | Mapping judgment and known loss |
| --- | --- | --- | --- | --- |
| Display identity | `CharacterDocument.displayName` | `CharacterDocument.displayName` | Character identity expected | Exact shared document identity, not a rules-system field |
| Numeric characteristics | `abilities.final` + base/background layers | `characteristics.*.final` + adjustments | Conventional attributes may be absent | Contextual measurement only. No shared numerical scale, modifier or conversion |
| Competencies | Skill proficiency/expertise | Percentile skill ratings + specialties | Skill ladder | Contextual; proficiency is not a percentile rating |
| Class / profession / archetype | Mandatory class + level | Optional/custom profession construction | High Concept and Aspects | No honest universal equivalence; retain native classification |
| Capabilities | Feats, magic, class/species grants | Powers, characteristics and skills | Stunts / Aspects | No generic capability bucket yet; activation and source semantics differ |
| Harm | Hit points | Hit points + major-wound threshold | Stress + Consequences | No universal HP or wound transformation |
| Character creation choices | Class/species/background nested choices | Professional/personal allocations, specialties | Open narrative selections | Choice provenance repeats; eligibility and deferred availability remain unproven |
| Progression | Level/XP and feature unlocks | Experience/skill-dependent development | Milestone changes expected | Record lifecycle events separately; no universal advancement formula |

Confidence: high for identified D&D/BRP source fields and distinctions; Fate and other candidate descriptions are research hypotheses, **not** implemented source mappings. Validate version-specific mechanics against official sources before implementing their adapters.

## Implemented v0.1 provisional boundary

`packages/semantic-model/src/projection.ts` is a pure read-only view of the primary native state. It currently projects only document display identity (exact) and supported D&D/BRP final characteristic values (contextual). Every projected value names its native path and preserves source system, edition, rules version, schema version and state ID. Unsupported systems declare omissions. The projection does not mutate or attach itself to `CharacterDocument`, does not calculate cross-system equivalence, and does not affect Foundry exports.

Next: exercise this projection against validated full native fixtures; probe Fate's freeform mechanics; revise vocabulary from evidence. Add decision lifecycle and progression event contracts only after a native consumer demonstrates a real use case.
