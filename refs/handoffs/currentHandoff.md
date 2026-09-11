---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- brp
- productization
- browser-qa
- character-sheet
- play-focused
- project-context
---
# Current Handoff

Date: 2026-09-11
Branch: `dev`
Active epic: GitHub Issue #14 - **Make BRP UGE a player-usable core character generator**

## Current Direction

BRP Player-Usable Core remains in owner/browser acceptance. The latest QA pass established that the previous print fixes had finally isolated the correct character data, but the artifact still read like a compact report rather than a polished play surface.

The current slice therefore changes character-sheet composition rather than adding another print workaround.

The product target is now explicit:

- character sheets optimize for use during play, not for mirroring native-state or creator structure;
- screen and print use the same information hierarchy and composition;
- BRP and D&D own different system-specific play layouts over the same presentation framework;
- high-frequency play information gets the strongest hierarchy and most useful page real estate;
- empty portrait/token space stays visually quiet instead of displaying placeholder prose;
- portrait, when attached, sits at the top-left of the identity block;
- campaign/project identity owns the badge area where commercial sheets often place product branding;
- rules/source identity remains a tiny footer at most; and
- Character Forge inherits authoritative project/campaign context rather than asking users to repeat upstream choices.

Issue #14 remains open until representative real-browser screen and print QA succeeds.

## Exact Green Play-Sheet Implementation Checkpoint

The current implementation is green at:

- SHA: `77783bbc67d733dccf1a6d71f54fb9168432bec6`
- Actions: `34615884732`
- Job: `103317568445`
- `npm run verify`: green
- 58 test files
- 280 tests passed
- 0 failures
- 218 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- Agent context: 4085 characters
- Build: `Character Forge build 0.0.1 77783bbc`

Any later documentation head requires its own exact-head Verify before being called green.

## Owner QA Sequence

### Passes 1-5

Earlier QA repaired creator containment/action affordance, the resizable split workspace, BRP Randomize All, D&D adoption of the shared sheet framework, player-facing equipment labels, stylesheet delivery, visible toolbar icons, removal of designer/provenance fluff, and replacement of whole-app printing with a standalone sheet-only print document.

The accepted print boundary before this slice was already:

```text
rendered .character-sheet
    -> standalone iframe document
    -> sheet.css + sheet-ui.css only
    -> iframe contentWindow.print()
```

That boundary remains in place.

### Pass 6 - play-focused sheet redesign

Owner QA showed that isolated print was now materially better but still looked like a plain report. Reference D&D and BRP sheets were provided as evidence for hierarchy, density, and system-specific arrangement, not as trade-dress templates.

The resulting implementation at `77783bbc67d733dccf1a6d71f54fb9168432bec6` adds:

- shared presentation-only `play-3` and `play-2` page layouts plus system-owned section zones;
- system theme hooks without adding a shared RPG rules ontology;
- compact identity/header facts instead of repeating identity as a large body section;
- top-left portrait geometry before the character name;
- quiet empty portrait/token geometry with no visible `Portrait` or `VTT Token` words;
- campaign/project badging in the sheet header;
- icon-only portrait and token attachment actions outside the sheet;
- a denser screen and print composition using the same hierarchy;
- BRP grouping into characteristics/resources, Communication/Mental, Perception/Physical/Combat, and full-width weapons/armor;
- D&D grouping into at-a-glance resources/saves, Skills, Abilities, then features/gear/spells on Page 2; and
- live print capture of the current rendered sheet so a session-attached portrait/token is included in Print / Save as PDF.

Portrait/token file attachment is deliberately session-scoped for now. Persistent image ownership belongs to the Parchment Worlds character-asset relationship, not BRP/D&D native rules state.

## Project / Campaign Context Inheritance

The owner also called out that Character Forge was asking for choices already established by the Parchment Worlds project.

A bounded context contract is now implemented.

Parchment Worlds `dev` passes the scoped project's:

- `projectId`;
- `projectName`;
- `rulesSystems`;
- `genres`; and
- project attributes

into the Character Forge embed URL.

Parchment implementation checkpoint:

- SHA: `96b2ea0ea214aaa700691befa17504f02e867a54`
- Actions: `34615785799`
- workflow `Validate Parchment Worlds`: green

Character Forge maps supported project rules systems to creator systems. When an actual project supplies exactly one supported non-agnostic system, Character Forge uses that system and does not display a redundant Rules system choice. `system-agnostic` projects and projects with multiple supported systems continue to permit explicit selection.

This is presentation/workflow context only. Project genres/attributes are available to the integration seam but are not copied into canonical character native state merely because they exist upstream.

The project name currently occupies the campaign badge area on the sheet. A future campaign-specific badge/image asset can extend that presentation context without changing RPG native state.

## Character Sheet Product Boundary

The supported path is now:

```text
authoritative native character state
    -> system-owned play-focused sheet projection
    -> shared presentation-only renderer
    -> same play composition on screen
    -> standalone print document built from the current rendered sheet
```

The sheet is a play artifact, not a creator, database dump, design report, or provenance report.

Shared code may own:

- page geometry;
- responsive/print mechanics;
- layout primitives;
- typography/hierarchy;
- media geometry;
- compact tables/lists/stat blocks; and
- presentation context such as campaign badging.

System packages continue to own:

- what matters during play;
- labels;
- calculations;
- grouping;
- section priority;
- page assignment; and
- system-specific mechanics.

Do not infer Universal Grammar from sheet presentation vocabulary.

## Portrait / Token Boundary

The screen sheet reserves quiet media geometry rather than showing placeholder labels.

Current attachment flow is:

```text
icon-only Attach Portrait / Attach Token action
    -> local image file
    -> session-only sheet image
    -> current screen sheet
    -> current standalone print document
```

This is intentionally not durable yet. Future persistence should be:

```text
Parchment Worlds character asset relationship
    -> Character Forge presentation reference
    -> portrait/token rendering
    -> VTT adapter mapping when exported
```

Do not store image binaries, local paths, Foundry IDs, or VTT-specific asset references in D&D or BRP native state.

## Shared Design Guidance

`TWS-Design-Principles` now has a `Play-Focused Artifacts And Sheets` section at commit:

`6809550583c3b164d8b1e24ff2f65f88430a1d45`

Actions `34616010988` is green.

The shared guidance now explicitly covers play-first hierarchy, dense/useful page allocation, system-adaptive composition, screen/print parity, silent empty media slots, campaign-owned branding zones, and inheritance of authoritative upstream project context rather than repeat questions.

## Immediate Next Work Package - Owner Browser Re-check

Pull current Character Forge `dev` and current Parchment Worlds `dev`, restart the local apps, and verify both a D&D and BRP character:

1. The screen result reads as a polished character sheet rather than a vertical report.
2. Page 1 has a clear at-table scan path and materially better use of horizontal page space.
3. Empty portrait/token areas contain no visible placeholder prose.
4. Portrait is top-left of the identity block and the portrait/token attachment actions are icon-only with useful hover/accessibility text.
5. The project name appears as quiet campaign badging when Character Forge is launched from a project.
6. A project with one supported non-agnostic rules system does not ask the user to choose that system again.
7. Print uses the same composition as screen and remains only 1-2 physical pages for representative characters.
8. Long skills/specialties/equipment remain readable and ordinary-printer/grayscale output is usable.

If density or hierarchy still misses the target, treat it as a bounded play-sheet composition defect. Do not regress to a generic report layout and do not solve it by adding explanatory text.

After sheet acceptance, resume the complete BRP Issue #14 journey:

```text
create -> finish -> review -> save -> reopen -> print/export
```

Close Issue #14 only after real-browser acceptance succeeds.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical and lossless.
- Preserve `brp-character/0.1` and canonical BRP adapter identity `0.7.0` unless concrete evidence requires a change.
- Profile identity is provenance/configuration context, not canonical rules state.
- Profession is not class.
- Shared sheet code owns presentation mechanics only.
- System sheet projections own system-specific play hierarchy and grouping.
- Screen and print should share the same play-focused information architecture.
- The print target is a standalone character-sheet document, never the running creator/application document.
- Internal generation IDs are not acceptable player-facing labels when richer source-owned labels exist.
- Rules provenance belongs in a tiny footer at most.
- Empty reserved media space should not display visible placeholder prose.
- Campaign/project identity owns user-facing sheet badging before product branding.
- Do not repeat project-level choices downstream when authoritative context is available.
- Portrait/token media does not belong in RPG native rules state.
- Foundry Actor/Item schemas remain adapter targets rather than canonical Character Forge state.
- Do not import Call of Cthulhu-only or branded content.

## Branch / Promotion Boundary

Work directly on Character Forge `dev`.

Promoted Character Forge branches remain unchanged unless explicitly requested:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D or BRP work.

## Validation

Milestone gate:

```bash
npm run verify
```

Do not call a Character Forge milestone green unless the exact committed SHA passes GitHub Actions.
