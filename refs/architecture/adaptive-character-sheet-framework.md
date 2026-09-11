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

Date: 2026-09-11
Status: accepted direction, BRP first proof and D&D second proof implemented on dev; isolated print boundary structurally green

## Decision

Character Forge should build a **universal character-sheet framework**, not a single universal character sheet.

The shared layer owns rendering and presentation mechanics. Each game system owns the projection that decides what character information exists on its sheet, how important it is, and how it should be grouped for play.

The intended flow is:

```text
Authoritative native character state
    -> system-owned sheet projection
    -> shared character-sheet renderer
    -> screen sheet
    -> isolated print-only sheet root
```

Do **not** route sheet generation through a new universal character rules model.

## Character artifact boundary

A character sheet is a character artifact. It is not a duplicate creator, a design/debug report, or a generation-provenance report.

The player-facing sheet may include:

- character identity;
- system-owned play statistics/resources;
- actions, skills, equipment, abilities, conditions, and character depth that are useful during play;
- portrait/token presentation slots; and
- at most a very small rules/source footer when provenance is useful.

The player-facing sheet should not include:

- Character Forge product branding;
- generation forms or creator controls;
- rules-system selectors;
- Randomize All or other creation actions;
- generation method or seed solely for provenance;
- profile/provenance explanation blocks;
- native JSON inspection; or
- document-action toolbar controls in printed output.

This distinction is now a tested product boundary rather than a styling preference.

## Why this architecture

A single fixed sheet layout would either encode assumptions from the first implemented system or collapse different games into a lowest-common-denominator form. BRP, D&D, and Fate already provide enough evidence that their high-frequency play state is materially different.

The shared framework should therefore standardize only genuinely shared presentation mechanics:

- page geometry and margins;
- typography and hierarchy;
- section/card/table primitives;
- responsive and print behavior;
- page-break and overflow behavior;
- grayscale/accessibility behavior;
- optional reference/help treatment;
- reserved character-media presentation slots;
- tiny footer treatment; and
- application-level export controls.

System packages retain ownership of rules meaning, labels, grouping, prioritization, calculations, and source-specific detail.

## Presentation roles, not a game ontology

A system sheet projection may use broad presentation roles such as:

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

These are rendering hints only. They do not assert shared mechanics or semantic equivalence between systems.

Universal Grammar remains a later derived translation layer and must not be inferred from sheet vocabulary.

## System-owned sheet projection

A system projection produces a renderer-facing description from authoritative native state. The framework has now been exercised by both BRP and D&D and supports only evidence-backed presentation features:

- character title/subtitle;
- optional tiny footer note;
- section title and presentation role;
- explicit priority/order metadata;
- deterministic logical page assignment by the system projection;
- preferred columns;
- section omission when optional content is empty;
- whether a section can split;
- repeatable table headers;
- optional help content; and
- optional first-page media slots.

Do not build a general constraint solver or speculative automatic layout engine until a later system demonstrates that need.

## Logical pages versus physical print pages

BRP and D&D both currently project exactly two logical pages. This is the product target for normal play sheets.

Automated tests can prove the logical two-page model and can prove that print CSS excludes application UI. They cannot prove that a real browser will always keep each logical page on one physical sheet of paper. Long content or browser layout differences can still cause overflow.

Therefore:

- 1-2 physical pages is an owner/browser acceptance target;
- a third physical page caused by content overflow is a layout defect to diagnose, not an accepted consequence of having only two logical page descriptors; and
- real Print / Save as PDF preview remains part of acceptance.

## Character portrait and VTT-token space

The shared renderer reserves first-page presentation space for:

- a character portrait; and
- a VTT token.

These are layout slots, not canonical asset fields and not native rules state. The current sheet renders placeholders so the space exists before image persistence and VTT integration arrive.

Future image/token ownership should follow:

```text
Parchment Worlds / character asset relationship
    -> Character Forge presentation reference
    -> sheet portrait/token rendering
    -> VTT adapter mapping when exported
```

Do not store Foundry file paths, Foundry document IDs, binary image content, or another VTT's asset schema in native D&D/BRP payloads merely to fill these slots.

## BRP first proof

The BRP first proof originally landed at `d6ba965b32c7d47eb2cfa1ef4b73e486787431cb` and has since been refined by owner/browser QA.

Implementation boundaries:

- `packages/character-sheet/src/index.ts` owns presentation-only descriptor types and semantic HTML rendering;
- `packages/system-brp/src/sheetProjection.ts` owns BRP labels, grouping, logical page assignment, final skill projection, equipment interpretation, and finishing details;
- `apps/web/src/characterSheetControls.ts` owns application-level Print plus lossless full-CharacterDocument JSON copy/download controls;
- `apps/web/src/main.ts` maintains both the visible result sheet and the dedicated print-only sheet root; and
- `apps/web/sheet.css` owns sheet presentation plus the hard print boundary.

No CharacterDocument schema, BRP native schema, or adapter-version change was required. `brp-character/0.1` and canonical BRP adapter identity `0.7.0` remain intact.

### BRP Page 1 - at-the-table play

The current page prioritizes:

- character identity and profession;
- characteristics and derived values;
- frequently changing resources/state;
- final skills rather than creation-budget causality; and
- selected weapons and armor when present.

### BRP Page 2 - character depth and logistics

The current second page carries:

- equipment and wealth;
- populated appearance and descriptive finishing details;
- populated reputation, background, beliefs, and keepsake/personal item; and
- custom profession context when present.

Rules/profile explanation blocks were removed after browser QA showed they were not useful character-sheet content. Rules identity is now only the tiny footer `BRP UGE 2023 | ORC 1.05`.

## D&D second proof

Owner QA on 2026-09-11 exposed that D&D was still using an older custom result surface while BRP had moved to the dedicated sheet framework. D&D became the second system-owned proof at `caff03275bc714f7189a5c7c9e30daeddd1a12b4`, then received a follow-up label/print correction in the checkpoint below.

`packages/system-dnd5e/src/sheetProjection.ts` owns the D&D-native two-page projection. It derives player-facing presentation from authoritative D&D native state and does not reconstruct native state from presentation data.

### D&D Page 1 - at-the-table play

The current page prioritizes:

- Class, Species, Background, Alignment, size, and experience;
- ability scores and modifiers;
- HP, AC, initiative, passive perception, speed, proficiency, hit dice, and supported class/species resources;
- saving throws; and
- ordinary skills with proficiency/expertise detail.

### D&D Page 2 - features and gear

The current second page prioritizes:

- concrete native equipment entries and currency;
- languages and tool/weapon/armor proficiencies;
- weapon mastery and expertise where present;
- native feature identifiers projected to readable labels; and
- supported spellcasting state.

Starting-equipment option IDs such as `A`, `B`, `C`, or `B:50-gp` remain valid generation choices/provenance but are not player-facing equipment. The dedicated sheet reads concrete `payload.equipment` and `currencyGp`.

The Guided Mechanical creator may still use those IDs internally. Its visible select must use source-owned equipment-package descriptions rather than raw IDs. A regression test now specifically protects the case where IDs remain correct but labels have regressed.

Rules/generation context was removed from the sheet body after owner QA. The only D&D rules provenance on the sheet is the tiny footer `D&D 5E 2024 | SRD 5.2.1`.

## Print isolation

The print path now uses an explicit dedicated root rather than trying to hide individual pieces of the application shell in place.

At runtime:

```text
#app
  .forge-shell              <- interactive creator/result application
  #character-print-root     <- sheet HTML only
```

On screen, `character-print-root` is hidden. When printing:

- `#app > .forge-shell` is `display: none !important`;
- `#app > .character-print-root` is shown;
- the print root contains only the rendered character sheet; and
- toolbar, creator, header, native-document inspector, and other application chrome are structurally absent from the printable branch.

This is intentionally stronger than maintaining a growing deny-list of UI selectors inside the live application tree.

`apps/web/src/sheetPrintContract.test.ts` protects this separation.

## Document-action controls

The visible sheet toolbar is application chrome above the screen sheet. It currently provides familiar icon-only actions for:

- Print / Save as PDF;
- Copy full CharacterDocument JSON; and
- Download full CharacterDocument JSON.

The SVG icons use explicit stroke styling so the icon itself remains visible rather than rendering as empty button chrome. Full action names remain in tooltip/title and accessible labels.

These controls never print.

## Layout inspiration

The design direction combines patterns rather than copying another game's trade dress:

- Mothership 1E Advanced Character Profile - strong scan order and useful writable space;
- Blades in the Dark - page space allocated by play frequency;
- Fate Condensed - aggressive hierarchy and low visual noise;
- official BRP UGE sheet - field-coverage checklist, not a density target;
- Call of Cthulhu 7E sheet revisions - print/grayscale and overflow lessons; and
- D&D/Demiplane-style digital + print separation - creator/review and printed artifacts need not be the same application surface.

Use these as design-pattern evidence only. Do not copy protected trade dress, branded content, or proprietary rules content.

## Output modes

The architecture leaves room for multiple projections of the same authoritative character:

- Play - high-frequency table use;
- Reference - play sheet plus compact rules reminders;
- Compact - constrained one-page/tablet/convention use;
- Archive - fuller character/background/provenance record.

BRP and D&D currently implement play-oriented two-page projections. Do not implement the other modes merely because the framework can eventually support them.

## Export strategy

Browser-native printing and full CharacterDocument JSON export remain the implemented first path:

1. project authoritative native state into the owning system's sheet description;
2. render it with shared character-sheet primitives;
3. copy only that rendered sheet into the dedicated print root;
4. print with the interactive application shell completely excluded; and
5. let the browser print or Save as PDF.

CharacterDocument JSON copy/download operates on the complete current document and is a document utility, not a reduced sheet export or second canonical model.

No PDF-generation dependency was added. If isolated browser printing still demonstrates a concrete unresolved problem, the same system projection should feed any future deterministic renderer rather than creating another canonical sheet model.

## Foundry / VTT boundary

The dedicated sheet is not the Foundry contract. Foundry export should remain an adapter from authoritative CharacterDocument/native state into a versioned Foundry/system target schema:

```text
CharacterDocument + authoritative native state
    -> versioned Foundry adapter
    -> Foundry Actor / embedded Item export
```

The repository already preserves enough D&D native detail for a bounded export proof, but no Foundry adapter is implemented yet. Foundry Actor/Item JSON must not become Character Forge's canonical model.

Portrait and token references should be supplied through the future character-asset relationship boundary rather than embedded as Foundry-specific paths in native character state.

## Evidence-driven rollout

1. BRP established the first system-owned projection and shared renderer.
2. D&D became the second proof and exposed the need to separate generation-choice IDs from concrete player-facing state.
3. Owner browser QA established that screen and print need an explicit artifact boundary, not merely selective CSS hiding.
4. Fate Condensed remains the stronger architecture stress test because Aspects, Stunts, Stress, Consequences, and narrative-mechanical state challenge conventional stat/skill-sheet assumptions.
5. Universal Grammar is still derived later from multi-system evidence. The character-sheet framework must not preempt it.

## Current structural acceptance status

The latest sheet/print implementation checkpoint is `ee63a0752e33e56aa94bce03e2ec69fa6099fc77`, validated by Actions `34608731990`, job `103293561221`:

- `npm run verify`: green;
- 57 test files / 276 tests / 0 failures;
- 216 tracked paths;
- BRP and D&D project exactly two logical sheet pages;
- D&D concrete equipment remains sheet content while A/B/C IDs remain generation choice state;
- D&D creator label reconciliation now detects raw-code label regressions even when IDs are unchanged;
- `Character Forge` branding and large rules/provenance blocks are absent from sheet HTML;
- rules identity is reduced to tiny footer notes;
- toolbar SVG icons have explicit visible stroke styling;
- the print root is a separate DOM branch containing sheet HTML only; and
- build: `Character Forge build 0.0.1 ee63a075`.

Visual owner/browser QA remains required before Issue #14 closeout, especially actual physical page count, density, long-content overflow, media-slot balance, and ordinary-printer readability.

## Explicit non-goals for the current sheet work

- a fully automatic universal layout optimizer;
- a universal RPG semantic ontology;
- implementing Fate sheets before the accepted Fate probe;
- four complete output modes;
- actual portrait/token asset persistence or image generation inside the sheet renderer;
- direct Foundry push/synchronization as part of Issue #14;
- deterministic server-side PDF generation without evidence it is necessary;
- recreating official BRP, D&D, or other commercial character-sheet trade dress; or
- changing native rules state to make printing easier.
