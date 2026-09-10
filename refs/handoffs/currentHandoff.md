---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- brp
- productization
- character-sheet
---
# Current Handoff

Date: 2026-09-10
Branch: `dev`
Active epic: GitHub Issue #14 - **Make BRP UGE a player-usable core character generator**

## Current Direction

The BRP second-system architecture stress test is complete. The active work is productizing the existing BRP UGE 2023 ORC / corrections 1.05 implementation into a narrow, credible player-facing character generator.

Accepted sequence remains:

1. BRP Player-Usable Core;
2. BRP Investigative Horror;
3. bounded Fate Condensed third-system probe;
4. Universal Grammar v0.1 from D&D + BRP + Fate evidence.

Do not skip ahead by chronology.

## Current BRP Player-Usable Core State

The bounded usability audit is at `refs/planning/brp-player-usability-gap-audit.md`.

Completed player-facing slices now include:

1. broader ordinary skill support plus correct professional/personal allocation causality;
2. Athlete, Beggar, and source-shaped Custom Profession, while preserving Detective and Scholar;
3. bounded source-audited equipment, armor, and modern pistol finishing with table-usable review projection;
4. optional identity/background finishing fields for size/build, appearance, mannerisms/motto, reputation, personal item/keepsake, background, and beliefs; and
5. allocation UX that turns exact-budget, profession-eligibility, and starting-cap validation into visible player actions without moving rules out of BRP-owned builders/adapters.

## Accepted Green Starting Checkpoint

The documentation-prep slice starts from exact green `dev` head:

- SHA: `beba1b5a735e4e271f6c5c9c4e7ac052de0c5b27`
- Actions: `34520469695`
- Job: `103016416753`
- `npm run verify`: green
- 51 test files
- 251 tests passed
- 0 failures
- 200 tracked paths
- 14 required project-memory files
- OKF: 27 concepts / 10 indexes
- Agent context: 4120 characters
- Build: `Character Forge build 0.0.1 beba1b5a`

The commits after this checkpoint are documentation preparation for the next implementation slice and require their own exact-head Verify before being called the current green head.

## Output Architecture Decision

Before implementing print/export, the product direction was broadened from a BRP-specific printed sheet to an **adaptive character-sheet framework, proven first with BRP**.

Read `refs/architecture/adaptive-character-sheet-framework.md` as the design contract.

The accepted boundary is:

```text
authoritative native character state
    -> system-owned sheet projection
    -> shared character-sheet renderer
    -> screen / browser print / PDF-via-print
```

This is deliberately **not** a universal character sheet and **not** a universal character rules model.

The shared renderer owns presentation mechanics such as page geometry, typography, section/table primitives, overflow, print behavior, and accessibility. Each system owns the projection that decides what appears, what it means, how important it is, and how it is grouped for play.

Broad sheet roles such as `identity`, `primary_stats`, `resources`, `actions`, `equipment`, `abilities`, `conditions`, `narrative`, `notes`, and `provenance` are layout vocabulary only. They must not be treated as Universal Grammar or semantic equivalence between systems.

## Immediate Next Work Package

The next bounded slice is **adaptive character-sheet framework, BRP-first proof**.

Keep the implementation ruthlessly BRP-sized while putting the shared seam in the right place.

### First inspect existing output affordances

- existing CharacterDocument JSON copy/download behavior;
- current BRP review projection and any reusable view helpers;
- current web application layout and print CSS behavior;
- how creator controls/debug/native-state inspectors are separated from review content; and
- existing styling primitives that can be reused without coupling the sheet renderer to BRP.

### Target architecture

Prefer a small shared renderer plus a BRP-owned sheet projection/descriptor. Do not route through a new universal character model.

Only implement descriptor hints that BRP demonstrates a need for. Reasonable first candidates include:

- presentation role;
- priority/order;
- preferred page/region;
- preferred columns;
- conditional visibility;
- split/repeat-header behavior where required; and
- optional compact reference/help text.

Do not build a layout constraint solver.

### BRP acceptance target

Default to a readable two-page sheet inspired by best-in-class layout patterns without copying another game's trade dress:

**Page 1 - at-the-table play**

- identity and profession;
- characteristics and derived values;
- frequently changing resources/state;
- final skills;
- weapons and armor;
- concise BRP profile/source identity where useful.

**Page 2 - depth and logistics**

- equipment and wealth;
- appearance and finishing details;
- reputation, background, beliefs, personal item/keepsake;
- useful source/profile context; and
- generation provenance only if it benefits the player rather than debug inspection.

Empty optional sections should collapse instead of leaving permanent blank boxes for unused subsystems.

Prefer browser-native print / Save as PDF and existing JSON export over a new PDF-generation dependency.

### Evidence sequence after BRP

Do not retrofit other systems in this slice. The intended future validation sequence is:

1. BRP proves the first renderer and only the features it needs;
2. D&D later exposes BRP-specific assumptions that leaked into shared rendering; and
3. Fate Condensed remains the stronger architecture stress test before Universal Grammar v0.1 is frozen.

## Remaining v0.1 Work After The Sheet Slice

1. narrow campaign/rules-profile selection seam needed by Investigative Horror;
2. representative owner/browser QA covering create -> finish -> review -> save -> reopen -> print/export; and
3. Issue #14 closeout if acceptance is met.

Further profession/skill/catalog breadth remains evidence-driven.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native schema remains `brp-character/0.1`.
- Canonical adapter identity remains `0.7.0`; later validation layers preserve that established adapter-version contract.
- Native BRP state is canonical and lossless.
- UI, review, sheet, and export are projections over native state.
- Profession is not class.
- Open specialties and languages remain source-owned.
- Equipment remains a native stable-ID list backed by source-owned catalog metadata.
- Descriptive finishing state remains optional and non-mechanical.
- Shared creator code coordinates interaction only; BRP owns BRP rules and content.
- Shared sheet code owns presentation mechanics only; system projections own game-specific sheet meaning.
- No universal power/capability/personality/allocation/sheet ontology should be inferred from the BRP implementation.
- Universal Grammar remains later and evidence-driven.

## Source / Licensing Boundary

Implementation authority remains the Basic Roleplaying: Universal Game Engine ORC Content Document, 2023, pinned to corrections 1.05.

Do not import Call of Cthulhu-only or other branded-game content. The later Investigative Horror profile is deliberately BRP-native and legally separate from Call of Cthulhu support.

Layout references may inspire hierarchy, density, page organization, and print behavior, but do not copy protected trade dress or proprietary content from Mothership, Blades in the Dark, Fate, Call of Cthulhu, D&D, or other games.

## Branch / Promotion Boundary

Work directly on `dev`.

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D or BRP work.

D&D Guided Narrative remains intentionally parked. Do not resume it by chronology.

## Validation

Milestone gate:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
