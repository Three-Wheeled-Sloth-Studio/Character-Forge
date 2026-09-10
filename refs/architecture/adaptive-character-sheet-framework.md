---
type: "Architecture Decision"
title: "Adaptive Character Sheet Framework"
tags:
- character-forge
- character-sheet
- projection
- print
- export
- architecture
---
# Adaptive Character Sheet Framework

Date: 2026-09-10
Status: accepted direction, BRP-first proof implemented on dev

## Decision

Character Forge should build a **universal character-sheet framework**, not a single universal character sheet.

The shared layer owns rendering and presentation mechanics. Each game system owns the projection that decides what information exists on its sheet, how important it is, and how it should be grouped for play.

The intended flow is:

```text
Authoritative native character state
    -> system-owned sheet projection
    -> shared character-sheet renderer
    -> screen / browser print / PDF-via-print
```

Do **not** route sheet generation through a new universal character rules model.

## Why this boundary

A single fixed sheet layout would either encode assumptions from the first implemented system or collapse very different games into a lowest-common-denominator form. BRP, D&D, and Fate already provide enough evidence that their high-frequency play state is materially different.

The shared framework should therefore standardize only the things that are genuinely shared across presentation:

- page geometry and margins;
- typography and hierarchy;
- section/card/table primitives;
- responsive and print behavior;
- page-break and overflow behavior;
- grayscale/accessibility behavior;
- optional reference/help treatment; and
- export controls.

System packages retain ownership of rules meaning, labels, grouping, prioritization, and source-specific detail.

## Presentation roles, not a game ontology

A system sheet projection may use a small set of broad **presentation roles** to help the renderer make layout decisions. Initial vocabulary includes:

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

These names are rendering hints only. They do not assert shared mechanics or semantic equivalence between systems.

For example:

- a BRP skill and a Fate skill may both appear in an `actions` region without becoming the same universal trait;
- D&D hit points and Fate stress may both appear in `resources` or `conditions` without being normalized into one rule concept; and
- a Fate Aspect can receive prominent narrative placement without being translated into a BRP background field.

Universal Grammar remains a later derived translation layer and must not be inferred from this sheet vocabulary.

## System-owned sheet projection

The system projection produces a renderer-facing description from authoritative native state. The first proof demonstrates only the hints BRP currently needs:

- section title and presentation role;
- explicit priority/order metadata;
- deterministic page assignment by the system projection;
- preferred columns;
- section omission by the system projection when optional content is empty;
- whether a section can split across pages;
- table headers suitable for print repetition; and
- optional reference/help content in the shared renderer contract.

Do not build a general constraint solver or speculative automatic layout engine until a later system demonstrates that need.

## BRP first proof

The BRP first proof landed on `dev` at implementation checkpoint `d6ba965b32c7d47eb2cfa1ef4b73e486787431cb`.

Implementation boundaries:

- `packages/character-sheet/src/index.ts` owns presentation-only descriptor types and semantic HTML rendering;
- `packages/system-brp/src/sheetProjection.ts` owns BRP labels, grouping, page assignment, final skill projection, equipment interpretation, finishing details, and rules context;
- `apps/web/src/characterSheetControls.ts` owns browser print plus lossless full-CharacterDocument JSON copy/download controls;
- `apps/web/sheet.css` owns screen sheet styling and dedicated print behavior; and
- `apps/web/src/main.ts` routes validated BRP characters through the projection and shared renderer while leaving native state canonical.

No CharacterDocument schema, BRP native schema, or adapter-version change was required. `brp-character/0.1` and canonical BRP adapter identity `0.7.0` remain intact.

The projection targets a readable two-page default rather than reproducing the dense official BRP form.

### Page 1 - at-the-table play

The implemented page prioritizes:

- character identity and profession;
- characteristics and derived values;
- frequently changing resources/state;
- final skills only, rather than creation-budget causality;
- selected weapons and armor when present; and
- concise rules/profile identity.

### Page 2 - character depth and logistics

The implemented second page carries:

- equipment and wealth;
- populated appearance and descriptive finishing details;
- populated reputation, background, beliefs, and keepsake/personal item;
- custom profession context when present; and
- useful BRP source/profile information.

Empty optional weapon, armor, appearance, background, and custom-profession-context sections are omitted rather than reserving permanent blank boxes.

## Layout inspiration

The design direction combines patterns rather than copying another game's trade dress:

- **Mothership 1E Advanced Character Profile** - strong scan order, distinct creation versus play layouts, useful writable space;
- **Blades in the Dark** - page space allocated according to actual play frequency rather than schema completeness;
- **Fate Condensed** - aggressive hierarchy, large meaningful regions, contextual micro-help, low visual noise;
- **official BRP UGE sheet** - authoritative BRP field-coverage checklist, not a density target;
- **Call of Cthulhu 7E sheet revisions** - larger text, print/grayscale attention, and overflow/background information separated from the core play page; and
- **D&D/Demiplane-style digital + print separation** - the interactive creator/review surface and printed sheet do not need to be the same rendering.

Use these as design-pattern evidence only. Do not copy protected trade dress, branded content, or another game's proprietary rules content.

## Output modes

The architecture leaves room for multiple projections of the same authoritative character:

- **Play** - high-frequency table use;
- **Reference** - play sheet plus compact rules reminders;
- **Compact** - constrained one-page/tablet/convention use;
- **Archive** - fuller character/background/provenance record.

Only the BRP v0.1 two-page play-oriented projection is implemented. Do not implement the other modes merely because the framework can eventually support them.

## Export strategy

Browser-native printing and full CharacterDocument JSON export are the implemented first path:

1. project authoritative BRP native state into the system sheet description;
2. render it with shared character-sheet primitives;
3. apply dedicated `@media print` behavior that removes application controls, creator chrome, and debug inspection; and
4. let the browser print or Save as PDF.

CharacterDocument JSON copy/download operates on the complete current document and is a document utility, not a reduced sheet export or second canonical model.

No PDF-generation dependency was added. If later evidence requires deterministic server-side PDFs, the same system projection should feed that renderer rather than creating a second canonical sheet model.

## Evidence-driven rollout

The framework remains intentionally proven in stages:

1. **BRP** has established the first shared renderer and only the descriptor features BRP needs.
2. **D&D** is the next validation opportunity, but is not part of the current BRP epic. Retrofitting D&D should expose any BRP-specific assumptions accidentally placed in the shared renderer.
3. **Fate Condensed** remains the stronger architecture stress test because Aspects, Stunts, Stress, Consequences, and narrative-mechanical state challenge conventional stat/skill-sheet assumptions.
4. **Universal Grammar** is still derived later from multi-system evidence. The character-sheet framework must not preempt it.

## First-proof acceptance status

Automated structural acceptance is green at implementation checkpoint `d6ba965b32c7d47eb2cfa1ef4b73e486787431cb`:

- authoritative BRP native state projects into the shared renderer without mutation;
- deterministic Page 1/Page 2 assignment is tested;
- final skills, weapons, armor, equipment, and finishing details are tested;
- empty optional sections collapse;
- semantic page/section markers and table headers are tested;
- print controls and full CharacterDocument JSON controls are tested; and
- the complete repository Verify gate passed with 52 test files / 256 tests / 0 failures.

Visual owner/browser QA remains required before Issue #14 closeout, especially to confirm real-browser pagination and print density with representative characters.

## Explicit non-goals for the first slice

- a fully automatic universal layout optimizer;
- a universal RPG semantic ontology;
- retrofitting D&D to the adaptive sheet renderer;
- implementing Fate sheets early;
- four complete output modes;
- deterministic server-side PDF generation;
- recreating official BRP or other commercial character-sheet trade dress; or
- changing native BRP rules state to make printing easier.
