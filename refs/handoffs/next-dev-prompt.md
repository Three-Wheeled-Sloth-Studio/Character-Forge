---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- brp
- productization
- character-sheet
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

The active epic is GitHub Issue #14: **Make BRP UGE a player-usable core character generator**.

Do not promote `qa` or `main` unless explicitly requested.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "adaptive character sheet BRP print"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/architecture/adaptive-character-sheet-framework.md`
3. `refs/planning/brp-player-usability-gap-audit.md`
4. `refs/planning/brp-player-usable-core.md`
5. `refs/integration/brp-uge-orc.md`
6. `refs/implementation/fileMap.yaml`
7. GitHub Issue #14
8. only the existing Character Forge review/export/style files needed to implement the selected sheet slice.

Do not reread the entire repository history.

## Accepted Green Starting Checkpoint

The documentation-prep slice starts from exact green `dev` head:

- SHA: `beba1b5a735e4e271f6c5c9c4e7ac052de0c5b27`
- Actions: `34520469695`
- Job: `103016416753`
- `npm run verify`: green
- 51 test files / 251 tests / 0 failures
- 200 tracked paths
- 14 required project-memory files
- OKF: 27 concepts / 10 indexes
- agent context: 4120 characters
- build: `Character Forge build 0.0.1 beba1b5a`

Documentation may be ahead of this implementation checkpoint. Always validate the exact current `dev` SHA before declaring a new milestone green.

## Current Player-Usable BRP Coverage

Implemented and retained through native state:

- explicit and standard-rolled characteristics;
- Normal and Heroic skill construction;
- Detective, Scholar, Athlete, Beggar, and Custom Profession;
- broader ordinary skill surface and open Scholar specialties/languages;
- exact professional/personal skill causality;
- player-facing allocation status with direct spend/remove guidance, profession eligibility, legal input ceilings, and cap headroom/overage;
- bounded equipment, armor, and modern pistols with table-use review details;
- starting-weapon 50% related-skill eligibility;
- optional finishing details: size/build, appearance, mannerisms/motto, reputation, personal item/keepsake, background, beliefs;
- save/reopen for the supported creator state; and
- readable on-screen review.

Preserve `brp-character/0.1` and canonical adapter identity `0.7.0` unless concrete evidence proves they are insufficient.

## Immediate Task - Adaptive Character Sheet Framework, BRP First

Do **not** implement a BRP-only print template and do **not** invent a universal character rules model.

Implement the smallest useful shared character-sheet presentation framework and prove it with BRP.

The accepted flow is:

```text
authoritative native character state
    -> system-owned sheet projection
    -> shared character-sheet renderer
    -> screen / browser print / PDF-via-print
```

### Step 1 - audit existing output code

Before editing, locate and understand:

- existing CharacterDocument JSON copy/download controls and helpers;
- current BRP review projection and any reusable formatting helpers;
- application shell/navigation/debug or native-state inspection that must disappear from print;
- current CSS organization and whether `@media print` already exists; and
- any generic display primitives that can be reused without making BRP rules shared.

Do not create a parallel export stack when existing behavior can be reused.

### Step 2 - establish the narrow shared seam

Prefer a small renderer-facing contract plus system projection, for example conceptually:

```text
BrpNativeCharacter -> BrpSheetProjection -> CharacterSheetRenderer
```

Naming may differ based on existing repo conventions.

The shared contract may use broad presentation roles such as:

- `identity`
- `primary_stats`
- `resources`
- `actions`
- `equipment`
- `abilities`
- `conditions`
- `narrative`
- `notes`
- `provenance`

These are **layout roles only**, not a universal game ontology and not Universal Grammar.

Implement only descriptor/layout hints BRP actually requires. Likely candidates are priority/order, preferred page or region, preferred columns, conditional visibility, and minimal split/repeat-header behavior. Avoid a speculative constraint solver.

### Step 3 - BRP two-page proof

Use the source and existing BRP review as the content authority, but improve information hierarchy rather than reproducing the official sheet's density.

Default target:

**Page 1 - at-the-table play**

- display identity and profession;
- characteristics and derived values;
- frequently changing resources/state;
- final skills;
- weapons and armor;
- concise BRP source/profile identity if useful.

**Page 2 - depth and logistics**

- equipment and wealth;
- appearance and populated finishing details;
- reputation, background, beliefs, personal item/keepsake;
- useful source/profile context; and
- only player-useful provenance.

Collapse empty optional sections. Do not reserve blank areas for unused power systems or optional subsystems.

### Step 4 - output behavior

Prefer:

- browser-native Print / Save as PDF;
- dedicated print CSS that removes app controls/navigation/debug inspection;
- reuse of existing CharacterDocument JSON copy/download; and
- a screen preview that uses the same sheet projection/rendering path where practical.

Do not add a PDF library unless browser output proves inadequate for the accepted v0.1 use case.

### Step 5 - validation

Add focused tests for:

- BRP native state -> sheet projection content;
- optional-section omission;
- correct projection of skills, equipment, weapon/armor details, and finishing information;
- structural page/section assignment where it is deterministic;
- print/export controls; and
- continued JSON export behavior if touched.

Do not make rendered sheet state canonical.

## Layout Inspiration Boundary

Use best-in-class patterns as design evidence, not templates to copy:

- Mothership 1E Advanced Character Profile: scan order, whitespace, separation of creation help from play sheet;
- Blades in the Dark: allocate space based on actual play frequency;
- Fate Condensed: hierarchy, low visual noise, contextual micro-help;
- official BRP UGE: BRP field-coverage checklist rather than density target;
- Call of Cthulhu 7E revisions: readable type, grayscale/print attention, overflow/detail separation;
- D&D/Demiplane: digital experience and printable sheet can be different projections.

Do not copy protected trade dress, branded content, or proprietary rules text.

## Guardrails

- Native system state is mandatory and lossless.
- Native BRP state remains canonical.
- UI/review/sheet/export are projections.
- Shared sheet code owns presentation mechanics, not BRP rules.
- Profession is not class.
- Do not generalize Universal Grammar from sheet presentation roles.
- Do not retrofit D&D in this slice.
- Fate remains later and should be allowed to challenge the shared sheet assumptions.
- Do not build a universal layout optimizer.
- Do not implement four sheet modes yet; only leave a clean seam for future Play/Reference/Compact/Archive projections.
- Do not enable optional BRP subsystems merely for output polish.
- The optional CHA-driven Distinctive Features rules remain deferred.
- Do not add setting-owned name generation.
- Do not import Call of Cthulhu-only/branded content.
- D&D Guided Narrative remains parked.

## After This Slice

Remaining Issue #14 v0.1 work should be:

1. a narrow campaign/rules-profile selection seam for later Investigative Horror;
2. representative owner browser QA across create -> finish -> review -> save -> reopen -> print/export; and
3. Issue #14 closeout if the acceptance target is met.

After this epic, the accepted sequence remains BRP Investigative Horror -> bounded Fate Condensed probe -> Universal Grammar v0.1.

D&D can later be used as a second sheet-renderer validation case, but do not pull that retrofit into this BRP acceptance slice.

## Branch / Promotion Boundary

Promoted branches remain:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every implementation milestone:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
