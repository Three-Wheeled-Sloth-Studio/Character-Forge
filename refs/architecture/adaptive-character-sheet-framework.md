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
Status: accepted direction, BRP first proof and D&D second proof implemented on dev

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
- optional reference/help treatment;
- reserved character-media presentation slots; and
- export controls.

System packages retain ownership of rules meaning, labels, grouping, prioritization, calculations, and source-specific detail.

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

A system projection produces a renderer-facing description from authoritative native state. The framework has now been exercised by both BRP and D&D and supports only evidence-backed presentation features:

- section title and presentation role;
- explicit priority/order metadata;
- deterministic page assignment by the system projection;
- preferred columns;
- section omission by the system projection when optional content is empty;
- whether a section can split across pages;
- table headers suitable for print repetition;
- optional reference/help content; and
- optional first-page character-media slots.

Do not build a general constraint solver or speculative automatic layout engine until a later system demonstrates that need.

## Character portrait and VTT-token space

The shared renderer reserves first-page presentation space for:

- a character portrait; and
- a VTT token.

These are layout slots, not canonical asset fields and not native rules state. The current sheet renders explicit placeholders so the space exists before image persistence and VTT integration arrive.

Future image/token ownership should follow the existing architecture boundary:

```text
Parchment Worlds / character asset relationship
    -> Character Forge presentation reference
    -> sheet portrait/token rendering
    -> VTT adapter mapping when exported
```

Do not store Foundry file paths, Foundry document IDs, binary image content, or another VTT's asset schema in native D&D/BRP payloads merely to fill these slots. Parchment Worlds is expected to own project and asset relationships; a later small character-asset reference contract can bridge those relationships into Character Forge presentation and VTT adapters.

## BRP first proof

The BRP first proof landed on `dev` at implementation checkpoint `d6ba965b32c7d47eb2cfa1ef4b73e486787431cb`.

Implementation boundaries:

- `packages/character-sheet/src/index.ts` owns presentation-only descriptor types and semantic HTML rendering;
- `packages/system-brp/src/sheetProjection.ts` owns BRP labels, grouping, page assignment, final skill projection, equipment interpretation, finishing details, and rules context;
- `apps/web/src/characterSheetControls.ts` owns browser print plus lossless full-CharacterDocument JSON copy/download controls;
- `apps/web/sheet.css` owns core screen sheet styling and dedicated print behavior; and
- `apps/web/src/main.ts` routes validated characters through system projections and the shared renderer while leaving native state canonical.

No CharacterDocument schema, BRP native schema, or adapter-version change was required. `brp-character/0.1` and canonical BRP adapter identity `0.7.0` remain intact.

The BRP projection targets a readable two-page default rather than reproducing the dense official BRP form.

### BRP Page 1 - at-the-table play

The implemented page prioritizes:

- character identity and profession;
- characteristics and derived values;
- frequently changing resources/state;
- final skills only, rather than creation-budget causality;
- selected weapons and armor when present; and
- concise rules/profile identity.

### BRP Page 2 - character depth and logistics

The implemented second page carries:

- equipment and wealth;
- populated appearance and descriptive finishing details;
- populated reputation, background, beliefs, and keepsake/personal item;
- custom profession context when present; and
- useful BRP source/profile information.

Empty optional weapon, armor, appearance, background, and custom-profession-context sections are omitted rather than reserving permanent blank boxes.

## D&D second proof

Owner QA on 2026-09-11 exposed that D&D was still using an older custom result surface while BRP had moved to the dedicated sheet framework. That caused internal starting-equipment choice IDs such as `A` and `B` to leak into the review and left D&D without the visible print path already available to BRP.

The D&D second proof landed at implementation checkpoint `caff03275bc714f7189a5c7c9e30daeddd1a12b4`.

`packages/system-dnd5e/src/sheetProjection.ts` now owns a D&D-native two-page projection. It derives player-facing presentation from the authoritative D&D native payload and does not reconstruct native state from presentation data.

### D&D Page 1 - at-the-table play

The implemented page prioritizes:

- Class, Species, Background, Alignment, size, and experience;
- ability scores and modifiers;
- HP, AC, initiative, passive perception, speed, proficiency, hit dice, and supported class/species resources;
- saving throws; and
- ordinary skills with proficiency/expertise detail.

### D&D Page 2 - features and gear

The implemented page prioritizes:

- actual concrete native equipment entries and currency;
- languages and tool/weapon/armor proficiencies;
- weapon mastery and expertise where present;
- native feature identifiers projected to readable labels;
- supported spellcasting state; and
- concise rules/generation context.

Starting-equipment option IDs such as `A`, `B`, `C`, or `B:50-gp` remain valid generation choices/provenance but are not the player-facing equipment representation. The dedicated sheet reads concrete `payload.equipment` and `currencyGp` from authoritative native D&D state.

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

BRP and D&D currently implement play-oriented two-page projections. Do not implement the other modes merely because the framework can eventually support them.

## Export strategy

Browser-native printing and full CharacterDocument JSON export are the implemented first path:

1. project authoritative native state into the owning system's sheet description;
2. render it with shared character-sheet primitives;
3. apply dedicated `@media print` behavior that removes application controls, creator chrome, and debug inspection; and
4. let the browser print or Save as PDF.

The sheet toolbar uses compact icon-only Print, Copy JSON, and Download JSON actions with tooltip/title and accessible labels. CharacterDocument JSON copy/download operates on the complete current document and is a document utility, not a reduced sheet export or second canonical model.

No PDF-generation dependency was added. If later evidence requires deterministic server-side PDFs, the same system projection should feed that renderer rather than creating a second canonical sheet model.

## Foundry / VTT boundary

The dedicated sheet is not itself the Foundry contract. Foundry export should remain an adapter from authoritative CharacterDocument/native state into a versioned Foundry/system target schema:

```text
CharacterDocument + authoritative native state
    -> versioned Foundry adapter
    -> Foundry Actor / embedded Item export
```

The repository already preserves enough D&D native detail for a bounded export proof, but no Foundry adapter is implemented yet. Foundry Actor/Item JSON must not become Character Forge's canonical model.

Portrait and token references should be supplied to the adapter through the future character-asset relationship boundary rather than being embedded as Foundry-specific paths in native character state.

## Evidence-driven rollout

The framework remains intentionally proven in stages:

1. **BRP** established the first system-owned projection and shared renderer.
2. **D&D** is now the second proof. It exposed the need to keep generation-choice provenance separate from player-facing concrete equipment and proved that the same renderer can support materially different system content.
3. **Fate Condensed** remains the stronger architecture stress test because Aspects, Stunts, Stress, Consequences, and narrative-mechanical state challenge conventional stat/skill-sheet assumptions.
4. **Universal Grammar** is still derived later from multi-system evidence. The character-sheet framework must not preempt it.

## Current structural acceptance status

The D&D second-proof checkpoint `caff03275bc714f7189a5c7c9e30daeddd1a12b4` passed Actions `34605994371`, job `103284429489`:

- `npm run verify`: green;
- 56 test files / 273 tests / 0 failures;
- 215 tracked paths;
- authoritative D&D native state projects into a dedicated two-page sheet without exposing raw A/B/C equipment choice IDs;
- D&D skill and saving-throw ratings are projected from native ability/proficiency state;
- BRP and D&D sheets reserve portrait and VTT-token presentation space;
- Print, Copy JSON, and Download JSON controls are icon-only with tooltip/accessibility text; and
- build: `Character Forge build 0.0.1 caff0327`.

Visual owner/browser QA remains required before Issue #14 closeout. In particular, actual browser print pagination, density, media-slot balance, and ordinary-printer readability still require owner acceptance.

## Explicit non-goals for the current sheet work

- a fully automatic universal layout optimizer;
- a universal RPG semantic ontology;
- implementing Fate sheets before the accepted Fate probe;
- four complete output modes;
- actual portrait/token asset persistence or image generation inside the sheet renderer;
- direct Foundry push/synchronization as part of Issue #14;
- deterministic server-side PDF generation;
- recreating official BRP, D&D, or other commercial character-sheet trade dress; or
- changing native rules state to make printing easier.
