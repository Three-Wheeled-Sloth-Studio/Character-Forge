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
- play-focused
- project-context
---
# Adaptive Character Sheet Framework

Date: 2026-09-11
Status: accepted direction; BRP and D&D play-focused proofs implemented on `dev`; owner browser acceptance pending

## Decision

Character Forge builds a **universal character-sheet framework**, not a universal character sheet.

The shared layer owns presentation mechanics. Each game system owns the projection that decides what information matters during play, how it is calculated, grouped, prioritized, and placed.

The supported flow is:

```text
authoritative native character state
    -> system-owned play-focused sheet projection
    -> shared presentation-only renderer
    -> same play composition on screen
    -> standalone print document built from the current rendered sheet
```

Do not route sheet generation through a new universal RPG rules model.

## Play Artifact Boundary

A character sheet is a play artifact. It is not a duplicate creator, database dump, generation report, design report, or provenance report.

The sheet should maximize useful at-table information density and scanning. System-specific play loops determine the hierarchy.

Player-facing sheet content may include:

- compact character identity;
- high-frequency system statistics and resources;
- skills/actions;
- weapons, armor, equipment, spells, features, conditions, and other system-owned play state;
- useful character depth/logistics on a secondary page;
- campaign/project identity;
- optional portrait/token media; and
- at most a tiny rules/source footer.

It should not include:

- Character Forge branding;
- creator forms or system selectors;
- Randomize All or other creation actions;
- generation seed/method solely for provenance;
- rules/profile explanation blocks;
- native JSON inspection;
- designer/debug page labels; or
- visible placeholder prose inside empty media slots.

## Shared Presentation Vocabulary

The renderer may use broad presentation roles such as:

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

It also supports evidence-backed presentation hints:

- logical pages;
- `flow`, `play-3`, and `play-2` page compositions;
- `left`, `main`, `right`, and `wide` placement zones;
- header facts;
- preferred columns;
- split/no-split hints;
- optional system theme hooks;
- optional campaign badge context; and
- portrait/token presentation slots.

These are rendering hints only. They do not assert shared game mechanics or semantic equivalence between BRP, D&D, or future systems. Universal Grammar remains a later derived translation layer.

## System Ownership

Shared character-sheet code owns:

- page geometry and print sizing;
- responsive behavior;
- typography and hierarchy primitives;
- section/table/list/stat rendering;
- page-break behavior;
- grayscale/accessibility treatment;
- quiet portrait/token geometry;
- campaign badge presentation; and
- application-level attachment/export controls.

System packages own:

- which information belongs on each page;
- play frequency/priority;
- labels and terminology;
- calculations;
- grouping;
- page assignment;
- section placement; and
- omission of irrelevant/empty system-specific material.

Do not make BRP and D&D look structurally identical simply because they share a renderer.

## BRP Proof

`packages/system-brp/src/sheetProjection.ts` owns the BRP projection.

Page 1 currently uses a three-zone play composition:

- left: Characteristics and At a Glance resources/derived values;
- main: Communication and Mental skills;
- right: Perception, Physical, and Combat skills; and
- wide lower area: Weapons and Armor when present.

Page 2 uses a two-column depth/logistics composition:

- equipment and wealth;
- appearance/manner;
- background, reputation, beliefs, and personal item; and
- custom profession context when present.

Identity is compact in the header rather than repeated as a body section. Rules identity is the tiny footer `BRP UGE 2023 | ORC 1.05`.

## D&D Proof

`packages/system-dnd5e/src/sheetProjection.ts` owns the D&D projection.

Page 1 currently uses a three-zone play composition:

- left: at-a-glance resources and Saving Throws;
- main: Skills; and
- right: Ability scores and modifiers.

Page 2 uses a two-column composition for:

- equipment and currency;
- languages and proficiencies;
- features; and
- spellcasting.

Header facts carry Class, Species, Background, and Alignment. Concrete equipment is projected from authoritative native equipment state; generation-choice IDs such as `A`, `B`, or `C` are not player-facing sheet content. Rules identity is the tiny footer `D&D 5E 2024 | SRD 5.2.1`.

## Screen / Print Parity

Screen and print should express the same sheet information architecture and hierarchy.

Print does **not** call `window.print()` on the running creator application. The visible current `.character-sheet` is captured and placed into a temporary off-screen iframe whose standalone `srcdoc` contains only:

- the rendered character sheet;
- `sheet.css`; and
- `sheet-ui.css`.

The iframe uses a desktop/letter-like `816 x 1056` CSS-pixel viewport so narrow-screen media queries cannot collapse the sheet before pagination. Printing invokes the iframe's own `contentWindow.print()`.

Application header, creator controls, sheet toolbar, JSON inspector, and other product UI do not exist in the print document.

This architecture is intentionally stronger than maintaining a growing CSS deny-list over the live application.

## Logical vs Physical Pages

BRP and D&D each project exactly two logical pages.

The product target for representative characters is 1-2 physical Letter pages. Structural tests can prove logical page count and the print-document boundary, but browser print preview remains an owner acceptance gate because long content and browser layout can still expose density defects.

A third physical page caused by ordinary representative content is a sheet composition problem to diagnose, not an accepted consequence of the framework.

## Portrait And Token Boundary

Page 1 reserves quiet space for portrait and VTT token presentation.

When empty:

- the geometry remains available;
- no visible `Portrait` or `VTT Token` words are rendered; and
- accessible labels retain semantic meaning for assistive technology.

When the current user attaches an image through the icon-only sheet toolbar, the local image is rendered into that slot and included in the current print artifact.

That attachment is intentionally session-only today. It is not written into D&D/BRP native rules state or the CharacterDocument merely to satisfy presentation.

Persistent ownership should follow:

```text
Parchment Worlds character asset relationship
    -> Character Forge presentation reference
    -> screen/print portrait or token
    -> VTT adapter mapping when exported
```

Do not store binary image content, local paths, Foundry document IDs, or VTT-specific asset schemas in native RPG payloads.

## Campaign / Project Identity

Commercial reference sheets often devote premium header space to publisher/game branding. Parchment Worlds should use that valuable player-facing area for the user's campaign/project identity instead.

Character Forge accepts presentation context separately from native character state. The current project name is rendered as a quiet campaign badge. Future campaign emblems/badges can extend the same presentation boundary without changing RPG native state.

Rules-source provenance remains subordinate in the footer.

## Upstream Project Context

Character Forge is normally launched from a Parchment Worlds project. That project already owns contextual decisions such as rules systems, genres, and attributes.

The embed contract now passes:

- project ID/name;
- project rules systems;
- project genres; and
- project attributes.

Character Forge maps supported project rules-system IDs to creator systems. If an actual project supplies exactly one supported non-agnostic rules system, Character Forge uses it and does not display a redundant system selector. `system-agnostic` and multi-system projects retain explicit choice.

This does not copy project metadata into character native rules state. It prevents redundant questions and supplies presentation context.

## Media And Document Controls

The visible toolbar is application chrome, not sheet content. It currently provides compact icon-only actions for:

- Attach Portrait;
- Attach VTT Token;
- Print / Save as PDF;
- Copy full CharacterDocument JSON; and
- Download full CharacterDocument JSON.

Full action names live in title/tooltip and accessible labels. The controls never print.

Copy/Download JSON remains a lossless CharacterDocument utility, not a reduced sheet export or second canonical model.

## Foundry / VTT Boundary

The character sheet is not the Foundry contract.

Future Foundry support should remain:

```text
CharacterDocument + authoritative native state
    -> versioned Foundry adapter
    -> Foundry Actor / embedded Item export
```

Portrait/token presentation references can be mapped by that adapter once durable Parchment asset ownership exists. Foundry Actor/Item JSON, file paths, and document IDs must not become Character Forge canonical state.

## Reference Design Use

Reference D&D and BRP sheets are evidence for layout patterns such as:

- strong at-table scan order;
- compact identity bands;
- horizontal grouping of related mechanics;
- high information density;
- intentional writable/media space; and
- system-specific hierarchy.

They are not templates for copied trade dress, logos, proprietary decorative geometry, or branded rules content.

## Output Modes

The architecture may eventually support several projections from the same authoritative character:

- Play;
- Reference;
- Compact; and
- Archive.

Only the play-oriented two-page projection is implemented now. Do not build the other modes merely because the renderer could support them.

## Evidence-Driven Rollout

1. BRP established the first system-owned projection.
2. D&D established that another system needs materially different grouping and exposed equipment-choice-ID leakage.
3. Browser QA established that print needs a standalone artifact document rather than whole-app hiding.
4. Owner reference-sheet comparison established that correct data is insufficient: the play artifact needs intentional hierarchy and density.
5. Parchment project integration established that upstream campaign context should suppress redundant downstream choices and supply player-owned badging.
6. Fate remains the stronger future sheet/architecture stress test because Aspects, Stress, Consequences, and Stunts challenge conventional stat-sheet assumptions.
7. Universal Grammar remains derived later from multi-system evidence.

## Current Structural Checkpoint

Character Forge implementation:

- SHA `77783bbc67d733dccf1a6d71f54fb9168432bec6`
- Actions `34615884732`
- Job `103317568445`
- 58 test files / 280 tests / 0 failures
- 218 tracked paths
- BRP and D&D each project exactly two logical pages
- campaign badging and silent media geometry are covered
- project-context mapping/locking is covered
- standalone print document remains covered
- build `Character Forge build 0.0.1 77783bbc`

Parchment Worlds context handoff:

- `dev` SHA `96b2ea0ea214aaa700691befa17504f02e867a54`
- Actions `34615785799`: green

Visual owner/browser QA is still required for actual hierarchy, physical page count, overflow, portrait/token balance, and ordinary-printer readability.

## Explicit Non-goals

- copying official D&D, BRP, or third-party character-sheet trade dress;
- a universal automatic layout solver;
- a universal RPG semantic ontology;
- Fate sheets before the accepted Fate probe;
- durable image/token persistence inside native rules state;
- direct Foundry push/synchronization as part of Issue #14;
- deterministic server-side PDF generation without evidence it is necessary; or
- changing native rules state to make presentation easier.
