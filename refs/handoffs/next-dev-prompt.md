---
type: "Handoff Record"
title: "Next Development Prompt"
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
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

The active epic is GitHub Issue #14: **Make BRP UGE a player-usable core character generator**.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "play-focused adaptive sheets campaign context portrait token browser QA"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/architecture/adaptive-character-sheet-framework.md`
3. `refs/product/creator-workspace.md`
4. `refs/planning/brp-player-usability-gap-audit.md`
5. `refs/planning/brp-player-usable-core.md`
6. GitHub Issue #14
7. only system sheet projection, renderer, project-context, print, and save/reopen code needed for the next owner QA finding.

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Exact Green Implementation Checkpoint

The play-focused adaptive-sheet implementation is green at:

- SHA: `77783bbc67d733dccf1a6d71f54fb9168432bec6`
- Actions: `34615884732`
- Job: `103317568445`
- `npm run verify`: green
- 58 test files / 280 tests / 0 failures
- 218 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- agent context: 4085 characters
- build: `Character Forge build 0.0.1 77783bbc`

Parchment Worlds project-context handoff is green at:

- `dev`: `96b2ea0ea214aaa700691befa17504f02e867a54`
- Actions: `34615785799`
- workflow `Validate Parchment Worlds`: green

Documentation may be ahead of the Character Forge implementation checkpoint. Validate the exact current `dev` SHA before declaring a new milestone green.

## Critical Change From QA Pass 6

Owner QA confirmed the standalone print boundary removed application fluff, but the result still looked like a plain report rather than a polished, play-focused character sheet.

The current implementation therefore changes composition rather than adding another print workaround:

- BRP and D&D now use system-owned play layouts over shared presentation primitives;
- Page 1 is a dense multi-column at-table surface rather than a vertical stack of generic sections;
- identity is compact in the header rather than repeated as a large body card;
- portrait space is top-left before the character name;
- empty portrait/token geometry contains no visible placeholder text;
- portrait/token attachment actions are icon-only application controls outside the sheet;
- campaign/project identity occupies the sheet badge area;
- screen and print use the same rendered sheet composition;
- Print still creates a standalone iframe document containing only the current rendered `.character-sheet` and sheet styles; and
- the Parchment Worlds embed now supplies project rules systems, genres, and attributes so Character Forge can stop re-asking choices already established upstream.

When an actual project supplies exactly one supported non-agnostic rules system, Character Forge uses it and hides the redundant Rules system selector. `system-agnostic` and multi-system projects still allow an explicit system choice.

## Immediate Task - Owner Browser Re-check

After pulling current Character Forge `dev` and current Parchment Worlds `dev`, restart the local apps and inspect representative D&D and BRP characters.

Verify:

1. Screen result reads like a polished play sheet rather than a report/database view.
2. Page 1 has an obvious high-frequency scan path and uses horizontal page space efficiently.
3. BRP grouping is useful at the table: characteristics/resources, Communication/Mental, Perception/Physical/Combat, weapons/armor.
4. D&D grouping is useful at the table: resources/saves, Skills, Abilities, then features/gear/spells on Page 2.
5. No visible `Portrait` or `VTT Token` placeholder words appear in empty media slots.
6. Portrait geometry is at the top-left of the identity header.
7. Attach Portrait / Attach Token controls are compact icons with useful hover/accessibility text and attached images flow into the current sheet.
8. Project name appears as quiet campaign badging when launched from a project.
9. A single supported project rules system is inherited instead of being asked again.
10. Print preserves the same hierarchy and composition and occupies no more than 1-2 physical pages for representative characters.
11. Long skills, specialties, equipment, and background content remain readable.
12. Ordinary office/grayscale printing remains usable.

Do not infer visual acceptance from structural tests. If the sheet still misses the target, capture the actual browser result and make the smallest evidence-backed play-composition correction. Do not add explanatory text to solve layout problems.

## Media Persistence Boundary

The current Attach Portrait / Attach Token controls are intentionally session-only. They support browser QA and current Print / Save as PDF without contaminating native rules state.

Future durability should be implemented through a Parchment Worlds character-asset relationship:

```text
Parchment Worlds character asset
    -> portrait/token presentation references
    -> Character Forge sheet
    -> future VTT adapter mapping
```

Do not store binary images, local file paths, Foundry IDs, or VTT-specific asset paths in BRP/D&D native state.

## Then Complete BRP Issue #14 Acceptance

After the sheet re-check passes, run:

```text
create -> finish -> review -> save -> reopen -> print/export
```

Exercise at least three BRP characters:

1. Detective, Normal, explicit characteristics, selected pistol and armor, populated finishing details.
2. Scholar, standard-rolled characteristics, deliberately long language/specialty labels, equipment, and background text.
3. Athlete, Beggar, or Custom Profession, preferably Heroic for one case, with enough content to stress sheet and reopen behavior.

Verify exact effective rules, profession choices, skills, equipment, finishing data, Copy JSON, Download JSON, browser Print / Save as PDF, physical page count, and ordinary-printer readability survive the full flow.

## Guardrails

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical and lossless.
- Preserve `brp-character/0.1` and canonical BRP adapter identity `0.7.0` unless concrete evidence requires a change.
- Preserve exact-SHA `dev -> qa -> main` promotion.
- Profile identity is provenance/configuration context, not effective rules authority.
- Campaign/profile is not Universal Grammar.
- Profession is not class.
- Shared sheet code owns presentation mechanics only.
- System packages own play hierarchy, grouping, calculations, and labels.
- Screen and print share the same play-focused information architecture.
- The print target is a standalone character-sheet document, never the running creator/application document.
- Internal generation IDs such as equipment `A/B/C` are not acceptable player-facing labels when the source owns meaningful labels.
- Rules/provenance belongs in a tiny footer at most.
- Empty reserved media spaces must not contain visible placeholder prose.
- User campaign/project identity gets the sheet branding zone before Character Forge/product branding.
- Inherit authoritative project-level system/setting/context instead of asking the user again when the contract supplies it.
- Portrait/token media belongs to a future Parchment asset relation, not RPG native state.
- Do not implement Investigative Horror before Issue #14 closeout.
- Do not resume D&D Guided Narrative by chronology.
- Do not implement Fate early.
- Do not implement Foundry export/push unless explicitly reprioritized.
- Do not add a PDF-generation dependency unless the standalone browser-print document demonstrates a concrete unresolved need.

## Branch / Promotion Boundary

Promoted Character Forge branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not promote either branch unless explicitly requested.

## Validation

For every Character Forge repair or milestone:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
