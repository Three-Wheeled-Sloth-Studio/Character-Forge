---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- brp
- productization
---
# Current Handoff

Date: 2026-09-09
Branch: `dev`
Current product status: **The BRP second-system architecture stress test is complete; the next active line is BRP Player-Usable Core (Issue #14), followed by BRP Investigative Horror, a bounded Fate Condensed third-system probe, then Universal Grammar v0.1.**

## Current Direction

Accepted sequence:

1. **BRP Player-Usable Core** — turn the architecture proof into a character generator players could reasonably use for an actual BRP game;
2. **BRP Investigative Horror** — add a legally clean BRP-native horror profile without Call of Cthulhu branding/protected content;
3. **Fate Condensed third-system probe** — deliberately stress D&D/BRP assumptions with Aspects, Stunts, Stress, and Consequences;
4. **Universal Grammar v0.1** — formalize the semantic/translation layer only after D&D + BRP + Fate evidence is reviewed.

Authoritative planning references:

- `refs/planning/brp-to-universal-grammar-path.md`
- `refs/planning/brp-player-usable-core.md`
- `refs/planning/brp-investigative-horror-profile.md`
- `refs/planning/fate-third-system-probe.md`
- `refs/planning/universal-grammar-v0.1.md`

Active tracking:

- GitHub Issue #14: **Make BRP UGE a player-usable core character generator**

The completed BRP architecture stress-test state is archived at:

- `refs/handoffs/archive/brp-second-system-stress-test-complete-2026-09-09.md`

## Immediate Next Work Package

Start Issue #14 with a bounded **BRP player-usability gap audit** against the authoritative BRP ORC 1.05 character-creation flow.

Classify each relevant capability as:

- supported;
- missing for v0.1;
- deferred.

The audit is only large enough to select implementation work. Do not create a giant catalog backlog before coding.

At minimum evaluate:

- profession breadth and source-supported profession customization;
- ordinary skill/specialty breadth;
- age and wealth boundaries;
- equipment, weapons, and armor required for table use;
- identity/background/finishing details;
- professional/personal allocation UX and validation clarity;
- final character review;
- print/export projection;
- save/reopen behavior;
- campaign/rules-profile seam needed by the future Investigative Horror phase.

After the audit, implement the highest-value missing vertical slice rather than continuing analysis by default.

## BRP Product Acceptance Target

A player unfamiliar with the repository should be able to create, finish, review, save, reopen, and export/print a generic BRP character that feels like a usable product rather than an architecture demonstration.

Do **not** block that target on complete Powers, every BRP optional subsystem, non-human breadth, setting-owned generated names, or Universal Grammar.

## Investigative Horror Boundary

The later horror profile is deliberately **BRP: Universal Game Engine — Investigative Horror**, not Call of Cthulhu support.

Use only current BRP ORC material plus independently authored/sourced content with explicit provenance. The simplified BRP Sanity rules may be source-audited from BRP ORC; Call of Cthulhu-specific rules, branding, trade dress, occupations/content copied from CoC books, and Chaosium Mythos material remain out of scope without a separate license.

Keep BRP-system rules, Character Forge original content, and setting/content-package material separate.

See `refs/planning/brp-investigative-horror-profile.md` for the durable boundary.

## Third-System / Universal Grammar Decision

Do **not** use CoC or Pathfinder as the third architecture probe merely because they are obvious market systems; they are too close to BRP and D&D respectively to provide the highest-value evidence.

Fate Condensed is the selected small third-system probe because it challenges:

- mechanically authoritative freeform Aspects;
- Stunts that resist a universal spell/feat/power/skill bucket;
- Stress and Consequences rather than conventional HP assumptions;
- narrative state as first-class mechanics.

Universal Grammar work may continue as an evidence ledger, but **do not freeze v0.1 before Fate has been implemented and reviewed**.

Native system state remains canonical and lossless. Universal Grammar is a derived portable semantic/translation layer with explicit translation-loss reporting, not a replacement CharacterDocument.

## Accepted BRP Architecture Baseline

The completed stress test established:

- native schema: `brp-character/0.1`;
- canonical BRP adapter: `0.7.0`;
- explicit and standard-rolled characteristics;
- Normal/Heroic skill construction;
- Detective/Scholar profession grammars;
- open specialties and named languages;
- separate base/professional/personal/final skill causality;
- BRP creator save/reopen;
- BRP random-table consumers;
- Superpowers character-point grammar;
- Psychic Abilities percentile/personal-pool grammar;
- no shared CharacterDocument change;
- no universal power/capability ontology.

Psychic implementation checkpoint:

- SHA `ae35b556dfc177f12e9f934fedd455803c6b74c7`
- Actions `34417631582`
- job `102685926895`
- 46 test files / 231 tests / 0 failures

Stress-test closeout roadmap checkpoint:

- SHA `aa7e6e54aa2dcd6dd2e029e90e2863bea0a29cb8`
- Actions `34420511173`
- job `102694668708`

Last exact-head validation before this planning increment:

- SHA `852df83c8fce571e2b0394c50f3b87f72de94c29`
- Actions `34420623648`
- job `102695013725`
- 46 test files / 231 tests / 0 failures

## Preserved Branch Boundary

No `qa` or `main` promotion has occurred.

Promoted branches remain:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion.

## Other Parked Work

D&D Guided Narrative remains intentionally parked. Its retained state is:

- `refs/handoffs/archive/dnd-guided-narrative-paused-2026-09-09.md`

Do not resume it by chronology.

D&D Issue #11 remains the separate accumulated owner runtime-QA/promotion gate.

## Foundation Guardrails

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Shared creator code coordinates interactions only; rules, mappings, distributions, and content remain system-owned.
- Parchment remains system-agnostic.
- Random-table evaluation remains a separate generation primitive.
- Naming mechanism/context/data remain separable.
- Do not generalize a universal capability or damage model from superficial similarities.
- Keep generation provenance separate from runtime ontology unless source evidence requires otherwise.

## Validation

Milestone gate:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
