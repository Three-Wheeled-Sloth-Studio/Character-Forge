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
Status: accepted direction, BRP-first implementation pending

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

A system sheet projection may use a small set of broad **presentation roles** to help the renderer make layout decisions. Initial vocabulary may include:

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

The system projection should produce a renderer-facing description from authoritative native state. It may supply bounded layout hints such as:

- section title and presentation role;
- priority;
- preferred page or region;
- preferred columns;
- minimum useful row/space requirement;
- whether a section can split across pages;
- whether headers repeat;
- conditional visibility; and
- optional reference/help content.

Implement only the hints required by demonstrated layouts. Do not build a general constraint solver or speculative automatic layout engine in the first slice.

## BRP first proof

BRP is the first implementation proof because its player-usable core is already close to complete and its native state is stable.

The BRP projection should target a readable two-page default rather than reproducing the dense official BRP form.

### Page 1 - at-the-table play

Prioritize information expected to be referenced repeatedly during play:

- character identity and profession;
- characteristics and derived values;
- frequently changing resources/state;
- final skills;
- weapons and armor; and
- concise rules/profile identity where useful.

### Page 2 - character depth and logistics

Use the second page for lower-frequency or longer-form information:

- equipment and wealth;
- appearance and descriptive finishing details;
- reputation, background, beliefs, and keepsake/personal item;
- source/profile information; and
- optional provenance only when it benefits the player rather than debug inspection.

The projection should omit empty optional sections rather than reserve permanent blank boxes for unsupported or unused BRP subsystems.

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

The architecture should leave room for multiple projections of the same authoritative character:

- **Play** - high-frequency table use;
- **Reference** - play sheet plus compact rules reminders;
- **Compact** - constrained one-page/tablet/convention use;
- **Archive** - fuller character/background/provenance record.

For the first implementation slice, build only what BRP v0.1 needs. Do not implement four modes merely because the framework can eventually support them.

## Export strategy

Prefer browser-native printing and existing CharacterDocument JSON export before adding a PDF-generation dependency.

The first useful path should be:

1. project authoritative BRP native state into the system sheet description;
2. render it with shared character-sheet primitives;
3. apply dedicated `@media print` behavior that removes application controls and navigation; and
4. let the browser print or Save as PDF.

If later evidence requires deterministic server-side PDFs, the same system projection should feed that renderer rather than creating a second canonical sheet model.

## Evidence-driven rollout

The framework is intentionally proven in stages:

1. **BRP** establishes the first shared renderer and only the descriptor features BRP needs.
2. **D&D** is the next validation opportunity. Retrofitting D&D should expose any BRP-specific assumptions accidentally placed in the shared renderer.
3. **Fate Condensed** remains the stronger architecture stress test because Aspects, Stunts, Stress, Consequences, and narrative-mechanical state challenge conventional stat/skill-sheet assumptions.
4. **Universal Grammar** is still derived later from multi-system evidence. The character-sheet framework must not preempt it.

## Initial implementation acceptance

The first slice is complete when:

- a generic BRP character can project from authoritative native state into the shared sheet renderer;
- the resulting sheet is materially more readable than printing the existing web review directly;
- Page 1 supports credible at-the-table BRP use;
- Page 2 carries lower-frequency equipment/background material without crowding Page 1;
- empty optional sections collapse cleanly;
- browser print produces a clean result without creator/debug UI;
- existing CharacterDocument JSON copy/download remains available or is reused where suitable;
- no new canonical character or BRP sheet schema is introduced; and
- focused tests prove projection content and renderer behavior at the structural level.

Visual owner/browser QA remains required before Issue #14 closeout.

## Explicit non-goals for the first slice

- a fully automatic universal layout optimizer;
- a universal RPG semantic ontology;
- retrofitting D&D immediately;
- implementing Fate sheets early;
- four complete output modes;
- deterministic server-side PDF generation;
- recreating official BRP or other commercial character-sheet trade dress; or
- changing native BRP rules state to make printing easier.
