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

- SHA: `c8ab49a6732eb99fc1adb6fec62e4b73a1b25141`
- Actions: `34634109473`
- Job: `103377729573`
- `npm run verify`: green
- 61 test files
- 294 tests passed
- 0 failures
- 230 tracked paths
- 14 required project-memory files
- OKF: 32 concepts / 10 indexes
- Agent context: 3806 characters
- Build: `Character Forge build 0.0.1 c8ab49a6`

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

Two print tests that previously required extraction code to live physically in `main.ts` were corrected to protect the result-renderer/print contract instead of source placement.

### Presentation cleanup isolated from workspace orchestration

The Stage 0 primary-UI cleanup no longer creates a workspace-wide `MutationObserver` inside `creatorWorkspace.ts`.

Temporary compatibility behavior is isolated behind:

`apps/web/src/creatorPresentationAdapter.ts`

- BRP currently retains a scoped observer because its creator panel legitimately replaces its markup during state changes.
- D&D uses explicit one-shot cleanup after creator/mode rendering.
- `creatorWorkspace.ts` now coordinates systems and randomization without knowing the presentation-cleanup implementation.

This is an intermediate Stage 1 seam, not the final state.

## Immediate Next Slice

Retire the temporary Stage 0 presentation shim rather than letting the new adapter become permanent architecture.

Primary target:

1. move accepted BRP minimalism directly into BRP renderer output;
2. move accepted D&D Guided Mechanical / Guided Narrative minimalism directly into their source renderers;
3. remove `primaryUiMinimalism.ts` once no behavior depends on post-render rewriting;
4. remove the scoped BRP observer from `creatorPresentationAdapter.ts` when BRP output is intrinsically correct;
5. keep focused tests on final rendered behavior/contracts rather than requiring cleanup code to live in a specific file.

Do not mix Issue #15 polish into this slice.

After the presentation shim is gone, the next audit-ranked candidate is a bounded responsibility split of `apps/web/src/brpCreatorState.ts`, preserving native-state fidelity and save/reopen behavior.

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
