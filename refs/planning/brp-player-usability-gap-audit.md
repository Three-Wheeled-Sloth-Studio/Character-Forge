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
| Profession and generic skill breadth | supported | Detective, Scholar, Athlete, Beggar, and Custom Profession provide credible generic coverage. Custom Profession keeps additional concepts available without flattening profession into a universal class model. Add more source professions only for demonstrated player gaps. |
| Profession customization seam | supported | Custom Profession retains a player-authored title, description/social role, wealth, and exactly ten essential source-supported skills in BRP native state. |
| Wealth boundaries | supported | Profession-specific creation supports Destitute, Poor, Average, Affluent, and Wealthy where the implemented source profiles allow them. |
| Knowledge/Science specialties and languages | supported | Scholar specialties and language identities remain open, named, and lossless in native state. |
| Professional/personal causality | supported | Base, professional, personal, and final skill values remain separate and validated; personal points can use the broader supported skill surface. |
| Allocation UX and validation clarity | supported | Budget cards show spent/total plus spend/remove/ready guidance, rows identify profession eligibility, numeric inputs expose current legal ceilings, cap headroom is visible, and a blocking checklist explains why Generate is unavailable. Builders and adapters remain authoritative. |
| Equipment finishing | supported | `equipment` remains a lossless native string-ID list backed by a source-audited BRP catalog. The creator can retain play-important gear, armor, and bounded modern pistols; weapon possession is checked against the source starting-skill threshold. |
| Equipment table projection | supported | The character review resolves retained item IDs into useful weapon attack/damage/range/ammo/malfunction or armor AV/burden/ENC details without making review state canonical. |
| Identity/background finishing | supported | Optional native finishing state retains size/build, appearance, mannerisms/motto, reputation, personal item/keepsake, background, and beliefs. The fields follow BRP Steps Nine and Ten while remaining setting-neutral and player-authored. |
| Save/reopen | supported | The creator reconstructs rules state from the authoritative BRP primary native state, while equipment and finishing companions reconstruct their retained native values from that same payload. |
| Final on-screen review | supported | Character review shows characteristics, derived values, identity, budgets, skill causality, selected equipment details, and populated finishing details. |
| Rules-profile foundation | supported | Power level, characteristic method, enabled options, and enabled power systems are already retained in BRP native state. |

## Missing for v0.1

| Capability | Classification | Bounded v0.1 need |
| --- | --- | --- |
| Adaptive sheet framework + BRP print/export proof | missing for v0.1 | Build a shared presentation/rendering framework, but prove only the descriptor features BRP needs now. BRP native state must project through a BRP-owned sheet description into a clean two-page play-oriented print view. Browser print/Save as PDF and existing CharacterDocument JSON export are preferred over a new PDF dependency. See `refs/architecture/adaptive-character-sheet-framework.md`. |
| Campaign/rules-profile selection seam | missing for v0.1 | The native rules profile is a good foundation, but the creator does not yet select a named campaign/content profile. Keep this seam narrow so the later Investigative Horror profile can configure BRP rather than fork it. |

## Deferred

- Characters under 18 and age 50+ aging/characteristic adjustments.
- Full optional skill-category systems and every era-specific base-chance variant.
- Additional source professions and specialty breadth unless owner/browser QA exposes a concrete generic-use gap.
- The optional CHA-driven Distinctive Features subsystem and exhaustive cosmetic feature tables; freeform appearance remains supported without enabling that optional rule.
- Exhaustive weapon, armor, vehicle, and specialty catalogs in the first pass.
- Complete Superpowers/Psychic catalogs and Magic, Mutations, or Sorcery.
- Broad non-human support.
- Setting-owned generated names.
- D&D retrofit to the adaptive sheet framework until the BRP proof is accepted.
- Multiple complete sheet modes beyond the first useful BRP play/print projection.
- Deterministic server-side PDF generation unless product evidence requires it.
- Fate Condensed implementation and Universal Grammar v0.1 freeze.

## First implementation slice

The first slice expanded the source-backed ordinary skill catalog and corrected professional versus personal allocation. Professional points remain profession-bound while personal points can use the broader currently supported BRP skill surface. The UI marks personal-only rows and adapter validation preserves base/professional/personal/final causality.

## Second implementation slice

The second slice broadened professions with Athlete, Beggar, all needed wealth levels, and Custom Profession. Custom Profession retains title, description/social role, wealth, and exactly ten supported essential skills without introducing a universal class model. The player-core builder/validator layer leaves the earlier Detective/Scholar and power-system probes bounded.

## Third implementation slice

The finish-the-character equipment slice preserves `brp-character/0.1`. Existing `equipment: string[]` becomes a stable native item-ID projection rather than being replaced by a second inventory schema.

The bounded source-audited catalog includes First Aid Kit and rope, Heavy Clothing and Soft Leather, and Light, Medium, and Heavy Pistols. Starting pistols require the related Handgun skill at 50% or better in this creator. Selected equipment IDs are canonical native state; creator controls and the readable character sheet are projections over those IDs and the source-owned catalog.

## Fourth implementation slice

BRP Steps Nine and Ten explicitly make size/build, physical and mental description, reputation, background, and similar details flexible. The bounded creator therefore adds optional player-authored size/build, appearance, mannerisms or motto, reputation, personal item or keepsake, background, and beliefs. These values are retained losslessly in BRP native state and projected into review only when populated. The optional CHA-driven Distinctive Features subsystem remains deferred.

## Fifth implementation slice

The allocation UX pass leaves all point arithmetic and legality in the established BRP builders/adapters while making that state actionable to a player. Professional and personal budget cards now show spent/total, progress, and exact spend/remove/ready guidance. Skill rows identify profession eligibility, show current legal input ceilings, and expose remaining cap headroom or overage. A blocking checklist names budget and cap problems before the disabled Generate action, while the existing rules validation remains visible as the authoritative detail.

## Accepted output architecture direction

The next output slice should not create a BRP-only printing dead end or a universal character rules model. Character Forge will use a shared adaptive character-sheet renderer with system-owned sheet projections:

```text
native system state -> system sheet projection -> shared renderer -> screen / print / PDF-via-print
```

The shared framework owns presentation mechanics such as page geometry, typography, layout primitives, print behavior, overflow, and accessibility. BRP owns which fields appear, their labels, grouping, priority, and rules meaning. Broad presentation-role hints such as `identity`, `primary_stats`, `resources`, `actions`, `equipment`, `abilities`, `conditions`, `narrative`, `notes`, and `provenance` are rendering vocabulary only, not Universal Grammar.

BRP is the first proof. D&D can later expose BRP-specific assumptions in the shared renderer, while Fate remains the stronger architecture stress test before Universal Grammar is frozen.

## Next bounded slice

Implement the adaptive character-sheet framework, proven first with BRP. Keep the implementation acceptance BRP-sized: a readable two-page default with Page 1 optimized for at-the-table play and Page 2 for equipment/background/logistics, clean browser printing, and reuse of existing JSON export where suitable. Do not build a universal layout solver, retrofit D&D, or add a PDF-generation dependency unless evidence requires it.

After that, add only the narrow campaign/rules-profile selection seam required to configure the future Investigative Horror profile, then run representative owner browser QA and Issue #14 closeout.
