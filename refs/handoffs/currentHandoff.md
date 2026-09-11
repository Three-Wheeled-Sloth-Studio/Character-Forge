---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- browser-qa
- character-sheet
- productization
- roadmap
- prioritization
---
# Current Handoff

Date: 2026-09-11
Branch: `dev`
Active acceptance epic: GitHub Issue #14 - **Make BRP UGE a player-usable core character generator**

## Current State

Character Forge is still in owner/browser acceptance. The recent character-sheet work finally produced a materially play-focused D&D presentation rather than a raw text report. Screen and print now share the same system-owned play composition, sheet presentation CSS is carried with the rendered artifact, and the isolated print target contains the character sheet rather than the creator application.

The latest owner D&D test found one remaining sheet-density defect: **the representative D&D character still paginates unnecessarily even though the total content should fit comfortably on one page.** The prior adaptive-pagination change did not resolve the real browser result.

No implementation should be started from this handoff until the newly captured TODO backlog has been prioritized against the existing roadmap.

## Exact Green Implementation Checkpoint Before Documentation-Only Closeout

The latest code checkpoint is green at:

- SHA: `3e8a73a6e0e960967e08b49abb132f49fe9fd378`
- Actions: `34620261296`
- Job: `103332185790`
- `npm run verify`: green
- 59 test files
- 283 tests passed
- 0 failures
- 221 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- Agent context: 4092 characters
- Build: `Character Forge build 0.0.1 3e8a73a6`

This documentation-only closeout intentionally makes no further code changes.

## New Unprioritized Backlog

All owner notes from the final QA/product-direction pass are captured in:

`refs/planning/unprioritized-product-todos-2026-09-11.md`

That backlog is explicitly **not priority ordered**. It must be compared with `refs/planning/roadmap.yaml` before implementation.

Captured areas include:

- D&D still unnecessarily paginating in the real browser/print path;
- branding/product-readiness work using the new shared assets in `TWS-Design-Principles/Branding/`;
- portrait interaction directly through the portrait region, with context-menu discovery as an option;
- VTT-token generation/import/update/override/export workflow and Foundry friction reduction;
- a roadmap trigger for when a real Foundry license should be purchased for integration testing;
- a full context-aware name-generator capability rather than the current tiny placeholder corpus;
- beginning Universal Grammar work from concrete multi-system evidence;
- beginning the proprietary studio RPG system;
- optional BRP random tables for free-text flavor fields;
- correct clear/translate semantics when changing RPG systems after generation;
- a broad primary-UI minimalism sweep across BRP and D&D;
- Character Forge user-facing version identity aligned to World Forge's version:build:revision pattern;
- a corresponding parent-level Parchment Worlds version pill; and
- further removal of character-level questions already answered by authoritative project/campaign context.

## Primary UI Direction Reconfirmed

The owner guidance is stronger than a copy-edit request:

> Nothing belongs in the primary creator UI unless it provides immediate player or GM value for the current task.

For BRP and D&D alike:

- remove fluffy/explanatory prose from the normal workflow;
- do not advertise unavailable or future features;
- do not expose architectural commentary to players;
- use compact info/help affordances for explanation that is useful only occasionally;
- use simple red/green status signals where the state itself is the important information;
- show failure detail when there is a failure rather than permanent success prose;
- prefer icons/tooltips over unnecessary labels where the action is obvious and accessible; and
- keep the UI focused on choices, state, and immediate play/GM value.

Specific BRP text and control cleanup items are enumerated in the new backlog and should be applied as a pattern to D&D rather than waiting for duplicate owner callouts.

## Sheet / Media Direction

The supported presentation path remains:

```text
authoritative native character state
    -> system-owned play-focused sheet projection
    -> shared presentation-only renderer
    -> same composition on screen and print
    -> isolated character-sheet print document
```

Current media work is still only a first proof. Future direction captured for prioritization:

```text
Parchment Worlds character asset relationship
    -> portrait interaction/editing
    -> token generation or manual override
    -> Character Forge sheet
    -> VTT adapter/export/update path
```

Empty portrait/token areas must remain visually quiet. Portrait/token/VTT references do not belong in canonical BRP or D&D rules state.

## Project / Campaign Context

Parchment Worlds already passes project ID/name, rules systems, genres, and project attributes into the Character Forge embed. A project with exactly one supported non-agnostic rules system should not ask the character creator to choose that system again.

The new backlog calls for a broader audit of what else should be inherited from project/campaign context, including setting, campaign profile/house rules, genre, and other choices that are not genuinely character-specific.

## Next Thread Must Prioritize Before Coding

The next thread should begin by reading:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/unprioritized-product-todos-2026-09-11.md`
3. `refs/planning/roadmap.yaml`
4. `refs/architecture/adaptive-character-sheet-framework.md`
5. GitHub Issue #14

Then propose a prioritized execution order grouped roughly as:

- current acceptance blockers;
- productization / external-demo readiness;
- near-term companion capabilities;
- architecture/platform investments; and
- later integrations.

Do not implement the newly captured items until the owner agrees to the order of work.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical and lossless.
- Universal Grammar is derived semantic/translation state, not a replacement for native state.
- Profession is not class.
- Shared sheet code owns presentation mechanics only.
- System packages own play hierarchy, grouping, calculations, and labels.
- Screen and print share the same play-focused information architecture.
- Campaign/project identity gets the user-facing sheet badge area before product branding.
- Portrait/token/VTT metadata does not belong in RPG native rules state.
- Foundry Actor/Item data remains an adapter target, not canonical Character Forge state.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Branch / Promotion Boundary

Work directly on Character Forge `dev`.

Promoted branches remain unchanged unless explicitly requested:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not promote either branch implicitly.

## Validation

For any later implementation milestone:

```bash
npm run verify
```

Do not call a Character Forge milestone green unless the exact committed SHA passes GitHub Actions.