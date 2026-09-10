---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- brp
- productization
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

The BRP second-system architecture stress test is complete and GitHub Issue #13 is closed. The next active epic is GitHub Issue #14: **Make BRP UGE a player-usable core character generator**.

The accepted longer sequence is:

1. BRP Player-Usable Core;
2. BRP Investigative Horror profile within BRP ORC/licensing boundaries;
3. bounded Fate Condensed third-system architecture probe;
4. Universal Grammar v0.1 from D&D + BRP + Fate evidence.

Do not skip ahead by chronology.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "BRP player usable core"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/brp-player-usable-core.md`
3. `refs/planning/brp-to-universal-grammar-path.md`
4. `refs/integration/brp-uge-orc.md`
5. `refs/implementation/fileMap.yaml`
6. GitHub Issue #14
7. only the BRP source/creator files needed by the selected first slice.

Do not reread the entire repository history.

## First Task — Bounded Player-Usability Gap Audit

Before editing, compare the authoritative BRP ORC 1.05 character-creation flow against the current BRP creator and classify relevant capabilities as:

- **supported**;
- **missing for v0.1**;
- **deferred**.

At minimum evaluate:

- profession breadth and source-supported profession customization;
- ordinary skills/specialties needed by credible generic professions;
- age and wealth boundaries;
- equipment, weapons, and armor needed to leave the creator with a table-usable character;
- identity/background/finishing details;
- professional/personal skill-allocation UX and validation clarity;
- final character review;
- print/export projection;
- save/reopen behavior;
- campaign/rules-profile seam needed by the later Investigative Horror profile.

Keep this audit bounded. Its purpose is to select the highest-value next implementation slice, not to generate an exhaustive BRP backlog.

## Then Implement

After the audit, implement the highest-value missing vertical slice in the same thread unless the audit exposes a genuine architecture/product decision requiring user input.

Likely priority order, subject to evidence:

1. profession + skill breadth;
2. finish-the-character/equipment breadth;
3. allocation UX/validation clarity;
4. final review + print/export;
5. campaign/rules-profile seam.

Prefer source-backed vertical product value over abstraction-first work.

## BRP v0.1 Acceptance Target

A player unfamiliar with the repository should be able to create, finish, review, save, reopen, and export/print a generic BRP character that feels like a usable product rather than an architecture demonstration.

Do not block that target on:

- complete Superpowers/Psychic catalogs;
- Magic, Mutations, or Sorcery;
- every BRP optional subsystem;
- non-human breadth;
- setting-owned generated-name content;
- Fate;
- Universal Grammar v0.1.

## Preserved BRP Architecture Baseline

The completed architecture work already proves:

- `brp-character/0.1` native state;
- canonical adapter `0.7.0`;
- explicit and standard-rolled characteristics;
- Normal/Heroic skill construction;
- Detective/Scholar profession grammars;
- open specialties/languages;
- separate base/professional/personal/final skill causality;
- creator save/reopen;
- random-table consumers;
- Superpowers character-point grammar;
- Psychic Abilities percentile/personal-pool grammar;
- no shared CharacterDocument change;
- no universal power/capability ontology.

Do not redesign those seams without concrete product evidence.

Accepted Psychic checkpoint:

- SHA `ae35b556dfc177f12e9f934fedd455803c6b74c7`
- Actions `34417631582`
- job `102685926895`
- 46 test files / 231 tests / 0 failures

The completed stress-test handoff is archived at:

- `refs/handoffs/archive/brp-second-system-stress-test-complete-2026-09-09.md`

## Later Investigative Horror Boundary

Do not import Call of Cthulhu-branded/protected content while productizing BRP.

The accepted future product is **BRP: Universal Game Engine — Investigative Horror**, using BRP ORC rules plus independently authored/sourced content with explicit provenance. See:

- `refs/planning/brp-investigative-horror-profile.md`

The simplified BRP Sanity rules may be source-audited from BRP ORC; Call of Cthulhu-specific Sanity/rules expression, branding, trade dress, copied occupation/content lists, and Chaosium Mythos material remain outside the BRP adapter absent a separate license.

## Later Fate / Universal Grammar Boundary

Do not freeze Universal Grammar before the bounded Fate Condensed probe has been reviewed.

Fate was chosen because it adds high-information evidence around freeform Aspects, Stunts, Stress, Consequences, and narrative-mechanical state. It is an architecture probe first, not an automatic full production implementation.

See:

- `refs/planning/fate-third-system-probe.md`
- `refs/planning/universal-grammar-v0.1.md`

Native system state remains canonical. Universal Grammar is a derived semantic/translation layer with explicit loss reporting.

## Branch / Promotion Boundary

No accumulated BRP work has been promoted.

Promoted branches remain:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D or BRP work.

## Parked D&D Work

D&D Guided Narrative remains parked at:

- `refs/handoffs/archive/dnd-guided-narrative-paused-2026-09-09.md`

Do not resume it unless explicitly selected.

## Validation

For every implementation milestone:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
