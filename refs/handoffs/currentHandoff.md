---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- brp
- productization
- rules-profile
- browser-qa
---
# Current Handoff

Date: 2026-09-10
Branch: `dev`
Active epic: GitHub Issue #14 - **Make BRP UGE a player-usable core character generator**

## Current Direction

BRP Player-Usable Core implementation is now feature-complete for the bounded v0.1 target. The remaining acceptance gate is representative owner/browser QA across the full player flow.

Accepted sequence remains:

1. close BRP Player-Usable Core after browser acceptance;
2. BRP Investigative Horror;
3. bounded Fate Condensed third-system probe;
4. Universal Grammar v0.1 from D&D + BRP + Fate evidence.

D&D Guided Narrative remains intentionally parked. Do not resume it by chronology.

## Current Exact Green Implementation Checkpoint

The campaign/rules-profile seam is green at:

- SHA: `fabbc6567ffa8a9d4d24af9a940baa17a86a1b03`
- Actions: `34527156423`
- Job: `103038733378`
- `npm run verify`: green
- 53 test files
- 263 tests passed
- 0 failures
- 208 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- Agent context: 3807 characters
- Build: `Character Forge build 0.0.1 fabbc656`

Any later documentation or implementation head requires its own exact-head Verify before being called green.

## Campaign / Rules-Profile Seam - Landed

`packages/system-brp/src/campaignProfile.ts` now owns the narrow BRP profile seam.

The first active profile is:

- stable ID: `generic`;
- label: `Generic BRP Core`;
- profile version: `0.1`; and
- defaults: Normal power level, Explicit characteristics, no enabled optional rules, no enabled power systems.

The important architecture boundary is that the profile reference and the effective rules state are separate:

```text
versioned profile reference
    -> explicit profile defaults when selected
    -> effective BrpRulesProfile retained in native state
```

The profile ID is provenance and creation context. It is not authority for interpreting an existing character.

Reopen reconstructs the exact effective `BrpRulesProfile` from authoritative BRP native state. It does not recalculate a character from the current profile catalog. Unknown or legacy profile provenance is preserved as existing rules context until the user explicitly selects a current profile.

Explicit profile selection may reapply that profile's current defaults for the working creation state. A post-construction profile-context operation refuses to change mechanically significant power-level or characteristic-generation state.

No Investigative Horror content, Sanity configuration, Call of Cthulhu content, or universal profile model was introduced.

## Adaptive Character Sheet First Proof - Landed

The earlier adaptive character-sheet proof remains green and unchanged:

```text
authoritative native character state
    -> system-owned sheet projection
    -> shared character-sheet renderer
    -> screen / browser print / PDF-via-print
```

BRP has a two-page play-oriented sheet, browser Print / Save as PDF, and full CharacterDocument Copy JSON / Download JSON controls. The shared renderer remains presentation-only and no PDF dependency or universal layout solver was introduced.

## Player-Usable BRP Coverage

The bounded v0.1 implementation now includes:

1. explicit and standard-rolled characteristics plus Normal and Heroic creation;
2. Detective, Scholar, Athlete, Beggar, and BRP-native Custom Profession;
3. broader ordinary skills, open specialties/languages, and exact allocation causality;
4. actionable allocation and validation UX;
5. bounded equipment, armor, modern pistols, and starting-weapon eligibility;
6. optional appearance/background/identity finishing state;
7. lossless save/reopen;
8. adaptive two-page review and browser print/Save as PDF;
9. full CharacterDocument JSON copy/download; and
10. the versioned BRP campaign/rules-profile selection seam.

## Immediate Next Work Package - Representative Browser QA

Run the complete player journey in a real browser:

```text
create -> finish -> review -> save -> reopen -> print/export
```

Exercise at minimum:

- Detective plus at least two other implemented professions, including Scholar or Custom Profession;
- explicit and standard-rolled characteristics;
- Normal and Heroic where practical;
- populated equipment including weapon and armor detail;
- long skill/specialty names;
- populated finishing/background fields;
- profile display and preservation after reopen;
- Copy JSON and Download JSON;
- browser Print and Save as PDF preview;
- page count, pagination, clipping, grayscale/readability, and absence of application/debug chrome in print.

Treat visual or workflow defects as bounded Issue #14 fixes. Do not use QA as an excuse to broaden profession catalogs, enable optional BRP systems, retrofit D&D, or start Investigative Horror early.

Close Issue #14 only if this browser pass satisfies the player-usable acceptance target.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP state remains canonical and lossless.
- Preserve `brp-character/0.1`.
- Preserve canonical adapter identity `0.7.0`.
- Profile identity is provenance/configuration context, not canonical rules state.
- Profile selection is BRP-owned and is not Universal Grammar.
- Profession is not class.
- Open specialties and languages remain source-owned.
- UI, review, sheet, export, and profile controls are projections or interaction layers over native state.
- Shared sheet code owns presentation mechanics only.
- Do not import Call of Cthulhu-only or branded content.

## Branch / Promotion Boundary

Work directly on `dev`.

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D or BRP work.

## Validation

Milestone gate:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
