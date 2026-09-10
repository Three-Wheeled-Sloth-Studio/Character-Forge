---
type: "Implementation Audit"
title: "BRP Player-Usability Gap Audit"
tags:
- character-forge
- brp
- player-usability
- creator
---
# BRP Player-Usability Gap Audit

Date: 2026-09-10
Epic: GitHub Issue #14 - Make BRP UGE a player-usable core character generator
Rules source: Basic Roleplaying: Universal Game Engine ORC Content Document, 2023, corrections 1.05

This is a bounded implementation-selection audit, not an exhaustive BRP backlog.

## Supported now

| Capability | Classification | Current evidence |
| --- | --- | --- |
| Characteristic construction | supported | Explicit and standard-rolled characteristics, retained roll provenance, and legal redistribution are system-owned. |
| Normal and Heroic creation | supported | Professional budgets, starting caps, and retained Heroic age causality are enforced by BRP native state and adapter validation. |
| Profession grammar foundation | supported | Detective and Scholar retain their source-shaped choices; the player-core slice adds Athlete, Beggar, and BRP-native Custom Profession rather than flattening professions into a universal class model. |
| Profession customization seam | supported | Custom Profession retains a player-authored title, description/social role, wealth, and exactly ten essential source-supported skills in BRP native state. |
| Wealth boundaries | supported | Profession-specific creation supports Destitute, Poor, Average, Affluent, and Wealthy where the implemented source profiles allow them. |
| Knowledge/Science specialties and languages | supported | Scholar specialties and language identities remain open, named, and lossless in native state. |
| Professional/personal causality | supported | Base, professional, personal, and final skill values remain separate and validated; personal points can use the broader supported skill surface. |
| Equipment finishing | supported | `equipment` remains a lossless native string-ID list backed by a source-audited BRP catalog. The creator can retain play-important gear, armor, and bounded modern pistols; weapon possession is checked against the source starting-skill threshold. |
| Equipment table projection | supported | The character review resolves retained item IDs into useful weapon attack/damage/range/ammo/malfunction or armor AV/burden/ENC details without making review state canonical. |
| Save/reopen | supported | The creator reconstructs rules state from the authoritative BRP primary native state, while the equipment companion reconstructs retained item IDs from that same payload. |
| Final on-screen review | supported | Character review shows characteristics, derived values, identity, budgets, skill causality, and selected equipment details. |
| Rules-profile foundation | supported | Power level, characteristic method, enabled options, and enabled power systems are already retained in BRP native state. |

## Missing for v0.1

| Capability | Classification | Bounded v0.1 need |
| --- | --- | --- |
| Further profession/skill breadth | missing for v0.1 | Credible generic coverage exists, but some source professions still depend on skills or specialties outside the bounded catalog. Add only when they improve actual player coverage. |
| Identity/background finishing | missing for v0.1 | Name and gender exist, but BRP finishing calls for personal/background/distinctive details. Keep these BRP-native or clearly Character Forge-authored, not setting-generated names. |
| Allocation UX and validation clarity | missing for v0.1 | Legal allocation is enforced and example-filled, but a player still needs clearer progress/error guidance than raw numeric rows provide. |
| Print/export | missing for v0.1 | On-screen review exists, but there is no player-facing print/export projection. Export must project authoritative native state rather than becoming another rules model. |
| Campaign/rules-profile selection seam | missing for v0.1 | The native rules profile is a good foundation, but the creator does not yet select a named campaign/content profile. Keep this seam narrow so the later Investigative Horror profile can configure BRP rather than fork it. |

## Deferred

- Characters under 18 and age 50+ aging/characteristic adjustments.
- Full optional skill-category systems and every era-specific base-chance variant.
- Exhaustive profession, weapon, armor, vehicle, and specialty catalogs in the first pass.
- Complete Superpowers/Psychic catalogs and Magic, Mutations, or Sorcery.
- Broad non-human support.
- Setting-owned generated names.
- Fate Condensed implementation and Universal Grammar v0.1 freeze.

## First implementation slice

The first slice expanded the source-backed ordinary skill catalog and corrected professional versus personal allocation. Professional points remain profession-bound while personal points can use the broader currently supported BRP skill surface. The UI marks personal-only rows and adapter validation preserves base/professional/personal/final causality.

## Second implementation slice

The second slice broadened professions with Athlete, Beggar, all needed wealth levels, and Custom Profession. Custom Profession retains title, description/social role, wealth, and exactly ten supported essential skills without introducing a universal class model. The player-core builder/validator layer leaves the earlier Detective/Scholar and power-system probes bounded.

## Third implementation slice

The finish-the-character equipment slice preserves `brp-character/0.1`. Existing `equipment: string[]` becomes a stable native item-ID projection rather than being replaced by a second inventory schema.

The bounded source-audited catalog includes:

1. First Aid Kit and rope as useful play-important gear;
2. Heavy Clothing and Soft Leather with retained armor value, burden, ENC, skill modifier, and value metadata;
3. Light, Medium, and Heavy Pistols with retained BRP weapon-table damage, attacks, range, ammo, malfunction, and related Handgun skill identity; and
4. player-facing guidance that ordinary clothing and Wealth-based pocket money are implicit, while above-Wealth items may still be justified through Status, GM approval, or profession-issued equipment.

Starting pistols require the related Handgun skill at 50% or better in this creator. Selected equipment IDs are canonical native state; creator controls and the readable character sheet are projections over those IDs and the source-owned catalog.

## Next bounded slice

Identity/background finishing is now the highest-value remaining Step Eight product gap. Prefer a small set of player-authored fields or source-safe prompts for personal description, important relationships/background, and distinctive details. Do not turn this into setting-owned name generation or a universal personality ontology. After that, tighten allocation guidance and move to print/export.