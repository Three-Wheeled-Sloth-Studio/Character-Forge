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

Stage 0 player-usable acceptance is complete.

GitHub Issue #14, **Make BRP UGE a player-usable core character generator**, is closed as completed after owner browser QA confirmed:

- D&D adaptive print pagination;
- BRP adaptive print pagination;
- BRP save and reopen;
- system-switch clearing without native-state mutation;
- primary creator UI minimalism; and
- the representative BRP create -> finish -> review -> save -> reopen -> print/export journey.

Two explicitly nonblocking BRP polish items remain parked in Issue #15:

- equipment info interaction should not toggle the equipment checkbox; and
- a legal natural/base skill rating above the normal starting cap should not be styled as a cap violation.

Do not pull Issue #15 ahead of the approved sequence unless it becomes a blocker or the owner explicitly asks.

The authoritative stage order remains:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Do not reopen prioritization without materially new evidence.

## Exact Green Stage 1 Checkpoint

Current accepted `dev` head:

- SHA: `dc13c9e919163f144a2df8db931e0dee6dd78879`
- Actions: `34635026247`
- Job: `103380710114`
- `npm run verify`: green
- 61 test files
- 294 tests passed
- 0 failures
- 228 tracked paths
- 14 required project-memory files
- OKF: 32 concepts / 10 indexes
- Agent context: 3778 characters
- Build: `Character Forge build 0.0.1 dc13c9e9`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

No promotion is authorized unless the owner explicitly requests it.

## Stage 1 Audit

The bounded engineering-health audit is captured in:

`refs/planning/engineering-health-audit-2026-09-11.md`

The opening findings distinguish large coherent rules/catalog files from genuinely mixed-responsibility orchestration modules. Do not split files mechanically by line count.

High-value owner-QA regressions remain non-negotiable:

- system-switch clearing without native-state mutation;
- D&D and BRP adaptive print pagination;
- save/reopen fidelity;
- native-state validation and system ownership;
- primary UI minimalism; and
- isolated sheet-only print output.

## Stage 1 Work Completed So Far

### Result rendering extracted from app bootstrap

`apps/web/src/main.ts` no longer owns system validation, character-sheet routing, result rendering, print-sheet extraction, or failure rendering.

Those responsibilities now live behind:

`apps/web/src/characterResultRenderer.ts`

This preserves the accepted D&D/BRP sheet and print behavior while making `main.ts` primarily application bootstrap, project context, host messaging, and workspace coordination.

Tests that previously required extraction code to live physically in `main.ts` now protect the result-renderer/print contract instead of source placement.

### Stage 0 presentation compatibility shim retired

The temporary post-render UI rewrite layer has been removed rather than normalized as permanent architecture.

Deleted:

- `apps/web/src/primaryUiMinimalism.ts`
- `apps/web/src/creatorPresentationAdapter.ts`

Accepted primary-UI minimalism is now owned by the renderers themselves:

- BRP emits compact heading, allocation help/status, rules status, profile status, and suggestion presentation directly from `brpCreatorPanelView.ts`;
- Guided Narrative emits its compact primary surface directly;
- Guided Mechanical owns its local heading cleanup and concise Narrative-continuation note;
- `creatorWorkspace.ts` mounts BRP/D&D creators directly and contains no presentation rewrite or observer.

The two tests that still expected Stage 0-hidden verbose BRP copy were updated to assert the compact accepted UI instead. No Issue #15 behavior was folded into this refactor.

## Immediate Next Slice

The next audit-ranked candidate is a bounded responsibility split of:

`apps/web/src/brpCreatorState.ts`

Target seams, only where they remain clean under existing tests:

1. state types/default construction and campaign-profile selection;
2. preview/allocation projection and helpers;
3. CharacterDocument/native build;
4. reopen/from-document reconstruction.

Preserve all public behavior and exports needed by current callers unless there is a clear lower-risk migration path. In particular, keep native-state fidelity, save/reopen equality, allocation legality, campaign-profile provenance, whole-character randomization, and BRP adapter validation strongly covered.

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
