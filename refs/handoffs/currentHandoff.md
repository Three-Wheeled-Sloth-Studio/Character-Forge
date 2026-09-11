---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- engineering-health
- refactoring
- character-sheet
- roadmap
- prioritization
---
# Current Handoff

Date: 2026-09-11
Branch: `dev`
Current stage: **Stage 1 - Engineering health and refactoring**

## Current State

Stage 0 player-usable acceptance is complete. GitHub Issue #14 is closed after owner browser QA passed the representative D&D/BRP creation, save/reopen, system-switch, and adaptive print acceptance boundary.

Two explicitly nonblocking BRP polish items remain parked in Issue #15:

- equipment info interaction should not toggle the equipment checkbox; and
- a legal natural/base skill rating above the normal starting cap should not be styled as a cap violation.

Do not pull Issue #15 ahead of the approved sequence unless it becomes a blocker or the owner explicitly asks.

The authoritative stage order remains:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Do not reopen prioritization without materially new evidence.

## Exact Green Stage 1 Checkpoint

Current accepted `dev` head:

- SHA: `49b182d09e98af66723686ef6ec841555c30f987`
- Actions: `34635492842`
- Job: `103382233734`
- `npm run verify`: green
- 61 test files
- 294 tests passed
- 0 failures
- 233 tracked paths
- 14 required project-memory files
- OKF: 32 concepts / 10 indexes
- Agent context: 3596 characters
- Build: `Character Forge build 0.0.1 49b182d0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

No promotion is authorized unless the owner explicitly requests it.

## Stage 1 Work Completed

### Result rendering extracted from app bootstrap

`apps/web/src/main.ts` no longer owns system validation, character-sheet routing, result rendering, print-sheet extraction, or failure rendering. Those responsibilities live behind `apps/web/src/characterResultRenderer.ts`.

Tests that previously required extraction code to live physically in `main.ts` now protect the result-renderer/print contract instead of source placement.

### Stage 0 presentation compatibility shim retired

The temporary post-render rewrite layer is gone:

- `apps/web/src/primaryUiMinimalism.ts` deleted;
- `apps/web/src/creatorPresentationAdapter.ts` deleted;
- BRP and D&D renderers now emit the accepted compact UI directly;
- `creatorWorkspace.ts` mounts creators directly and owns no presentation rewrite or observer.

### BRP creator state split by responsibility

`apps/web/src/brpCreatorState.ts` remains the stable public facade so current callers did not require a repo-wide import migration.

Implementation responsibilities are now separated into:

- `brpCreatorStateModel.ts`: state types, defaults, campaign-profile selection, reroll state;
- `brpCreatorSkillModel.ts`: characteristic resolution, profession/personal skill identities, allocation helpers;
- `brpCreatorBuild.ts`: CharacterDocument/native BRP construction and campaign-profile context;
- `brpCreatorPreview.ts`: preview projection, validation and legal auto-allocation;
- `brpCreatorReopen.ts`: supported-native-state validation and exact reopen reconstruction.

The split preserved existing allocation, campaign-profile, randomization, adapter-validation, save/reopen, and UI tests without schema changes.

## Immediate Next Slice

Audit `apps/web/src/brpCreatorPanelView.ts` as the next Stage 1 candidate.

Do not split it merely because it is large. Proceed only if extracting named sections materially improves local reasoning, testability, or responsibility ownership while keeping rendered output unchanged.

Candidate seams already visible in the audit include:

1. campaign/profile and identity chrome;
2. profession-specific controls;
3. characteristic-generation controls;
4. allocation summary/guidance and skill rows;
5. generic HTML helpers.

If the audit shows those sections are already coherent and a split would mostly shuffle markup, record that decision and move to the next evidence-backed candidate instead. `guidedCreationPanel.ts` remains high risk and must be approached one seam at a time rather than through a broad rewrite.

Do not mix Issue #15 polish or product feature work into this slice.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Universal Grammar remains future derived semantic/translation state with explicit loss/confidence.
- Profession is not class.
- Shared sheet code owns presentation mechanics only.
- System packages own system-specific play hierarchy and calculations.
- Screen and print share the same play-focused information architecture.
- Sheets use adaptive density: one page when content comfortably fits, two when genuinely needed.
- Project/Campaign identity owns primary sheet branding; a tiny subordinate studio maker's mark may be added later.
- Portrait/token/VTT metadata belongs to Parchment-owned asset relationships, not RPG native state.
- Foundry Actor/Item data remains an adapter target.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every implementation milestone:

```bash
npm run verify
```

Do not call a Character Forge milestone green unless the exact committed SHA passes GitHub Actions.
