# BRP Player-Usability Gap Audit

Date: 2026-09-09
Epic: GitHub Issue #14 - Make BRP UGE a player-usable core character generator
Rules source: Basic Roleplaying: Universal Game Engine ORC Content Document, 2023, corrections 1.05

This is a bounded implementation-selection audit, not an exhaustive BRP backlog.

## Supported now

| Capability | Classification | Current evidence |
| --- | --- | --- |
| Characteristic construction | supported | Explicit and standard-rolled characteristics, retained roll provenance, and legal redistribution are system-owned. |
| Normal and Heroic creation | supported | Professional budgets, starting caps, and retained Heroic age causality are enforced by BRP native state and adapter validation. |
| Detective and Scholar profession grammars | supported | Both retain source-shaped profession choices rather than flattening them to presentation labels. |
| Knowledge/Science specialties and languages | supported | Scholar specialties and language identities remain open, named, and lossless in native state. |
| Professional/personal causality | supported | Base, professional, personal, and final skill values remain separate and validated. |
| Save/reopen | supported | The creator reconstructs state from the authoritative BRP primary native state and current tests cover lossless rebuild. |
| Final on-screen review | supported | Character review already shows characteristics, derived values, identity, budgets, and skill causality. |
| Rules-profile foundation | supported | Power level, characteristic method, enabled options, and enabled power systems are already retained in BRP native state. |

## Missing for v0.1

| Capability | Classification | Bounded v0.1 need |
| --- | --- | --- |
| Profession breadth | missing for v0.1 | Two professions still feel like an architecture demo. Add enough source-backed breadth, then support BRP's explicit profession adaptation/new-profession seam without replacing native profession state with a universal class model. |
| Profession customization | missing for v0.1 | The BRP source permits substitutions appropriate to era, setting, and concept. The current Detective elective surface is only a subset. |
| Ordinary skill breadth | missing for v0.1 | The creator needs a broader set of ordinary BRP skills so generic characters and personal interests are credible. Specialty-heavy skills can expand incrementally. |
| Personal-skill allocation UX | missing for v0.1 | BRP personal points may be spent beyond profession skills, but the current creator only exposes profession rows. The UI must make professional eligibility and personal freedom obvious. |
| Wealth boundaries | missing for v0.1 | Native state currently supports Average/Affluent only. Broader profession coverage will need Destitute, Poor, and Wealthy where source profiles require them. |
| Equipment, weapons, and armor | missing for v0.1 | Native state has an equipment slot, but creation currently emits an empty list. A finished character needs profession/wealth-appropriate possessions and table-usable combat gear. |
| Identity/background finishing | missing for v0.1 | Name and gender exist, but the BRP finishing steps call for background and distinctive details. Keep these BRP-native or clearly Character Forge-authored, not setting-generated names. |
| Print/export | missing for v0.1 | On-screen review exists, but there is no player-facing print/export projection. Export must project authoritative native state rather than becoming another rules model. |
| Campaign/rules-profile selection seam | missing for v0.1 | The native rules profile is a good foundation, but the creator does not yet select a named campaign/content profile. Keep this seam narrow so the later Investigative Horror profile can configure BRP rather than fork it. |

## Deferred

- Characters under 18 and age 50+ aging/characteristic adjustments.
- Full optional skill-category systems and every era-specific base-chance variant.
- Exhaustive weapon, armor, vehicle, and specialty catalogs in the first pass.
- Complete Superpowers/Psychic catalogs and Magic, Mutations, or Sorcery.
- Broad non-human support.
- Setting-owned generated names.
- Fate Condensed implementation and Universal Grammar v0.1 freeze.

## First implementation slice selected

Implement source-backed skill breadth and correct the professional/personal allocation surface before adding more profession grammars.

The BRP source explicitly says personal skill points can be spent on any skills with gamemaster approval, while profession skills are the legal professional pool. The current UI incorrectly makes the profession list do double duty for both pools. Fixing that seam has high leverage because it improves every current and future profession without changing the established native schema.

This slice will:

1. expand the static BRP skill catalog with common, source-audited ordinary skills;
2. expand the Detective elective subset with additional choices already named by the BRP Detective profile;
3. expose all currently supported ordinary skills for personal allocation;
4. mark non-profession rows as personal-only and disable professional allocation on them;
5. preserve existing native skill causality and adapter validation; and
6. add regression coverage proving personal-only skills survive generation and validation.

Profession count itself remains a v0.1 gap after this slice. The next profession-breadth increment should use the evidence from this broader skill surface rather than prematurely introducing a universal profession/class abstraction.
