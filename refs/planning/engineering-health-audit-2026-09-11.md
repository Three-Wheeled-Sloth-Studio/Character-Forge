---
type: "Engineering Audit"
title: "Engineering Health Audit - 2026-09-11"
tags:
- character-forge
- engineering-health
- refactoring
- testing
- maintainability
---
# Engineering Health Audit - 2026-09-11

Status: **active Stage 1 baseline**

Accepted starting checkpoint: `02913690d859d4116661214c9f48b5899134cec3`

Current exact green Stage 1 checkpoint: `dc13c9e919163f144a2df8db931e0dee6dd78879`

Stage 0 player-usable acceptance is complete. This audit identifies bounded engineering-health work to perform before productization or another major architecture layer.

## Findings

### 1. Mixed-responsibility orchestration

Opening finding: `apps/web/src/main.ts` owned application bootstrap, host messaging, system/native-state validation, result rendering, print-sheet extraction, failure rendering, and document-control binding.

Progress: **completed.** Result validation/routing/rendering and print-sheet extraction now live in `apps/web/src/characterResultRenderer.ts`. `main.ts` remains app bootstrap, project context, host messaging, workspace coordination, and result-controller delegation.

### 2. Transitional presentation scaffolding

Opening finding: `apps/web/src/primaryUiMinimalism.ts` plus a `MutationObserver` in `creatorWorkspace.ts` rewrote renderer output after the fact.

Progress: **completed.** Workspace orchestration no longer owns presentation rewriting or observation. The temporary adapter and shim were deleted, and accepted Stage 0 minimalism is now renderer-owned.

- BRP emits compact primary UI directly from `brpCreatorPanelView.ts`.
- Guided Narrative emits compact primary UI directly.
- Guided Mechanical owns its local heading cleanup and concise Narrative-continuation note.
- `creatorWorkspace.ts` mounts system creators directly.
- Focused tests now assert the durable compact output rather than the existence of a post-render rewriting layer.

### 3. BRP creator state has several named responsibilities

`apps/web/src/brpCreatorState.ts` is one of the largest mixed-behavior web modules. It owns:

- creator state/default construction;
- campaign-profile application;
- preview/validation projection;
- CharacterDocument construction;
- legal auto-allocation;
- reopen/from-document reconstruction;
- profession-specific allocation identity resolution; and
- low-level allocation helpers/default fixtures.

The size is not the problem by itself; the responsibility count is. This is now the next audit-ranked cleanup candidate. Split only along coherent seams, with native-state fidelity and save/reopen behavior strongly covered. A stable facade is preferable if it reduces caller churn.

### 4. BRP creator view is dense but has clean section boundaries

`apps/web/src/brpCreatorPanelView.ts` combines campaign-profile chrome, profession controls, characteristic controls, allocation guidance, skill rows, and generic HTML helpers. It is a good follow-on split by named view responsibility, not by arbitrary line count. Avoid inventing shared abstractions with D&D solely because both render forms.

### 5. D&D guided creator remains a high-risk orchestration monolith

`apps/web/src/guidedCreationPanel.ts` coordinates sticky acceptable pools, class/background/species rules, ability generation, class-specific controls, provenance, and form rendering. Much of the file is dense because the supported Level 1 rules surface is genuinely broad, but orchestration and rendering are interleaved. Refactor only through small seams backed by existing system behavior tests; do not broad-rewrite it during this pass.

### 6. Some tests over-specify source placement or obsolete visible copy

The result-renderer extraction exposed print assertions that required code to live in `main.ts`; those now protect the actual result-renderer/print contract instead.

The presentation-shim retirement exposed two BRP tests that still required verbose copy intentionally hidden during Stage 0. Those now protect compact allocation/profile status plus accessible detail rather than restoring obsolete visible prose.

When touching other seams, keep assertions that protect important architecture invariants, but prefer behavior/output contracts over requiring code to live in a specific file or preserving intentionally retired copy.

High-value owner-QA regressions remain non-negotiable, especially:

- system-switch clearing without native-state mutation;
- D&D and BRP adaptive print pagination;
- save/reopen fidelity;
- native-state validation and system ownership;
- primary UI minimalism; and
- isolated sheet-only print output.

## Ordered cleanup candidates

1. **Completed:** extract result rendering from `main.ts` while preserving UI and print behavior.
2. **Completed:** absorb Stage 0 primary-UI minimalism into BRP/D&D render owners and remove post-render rewriting/observation.
3. **Next:** split BRP creator state into state/defaults, preview/allocation, build, and reopen responsibilities where those seams remain clean.
4. Split BRP creator view by named sections if doing so materially improves local reasoning and tests.
5. Audit D&D guided creator for one responsibility seam at a time; avoid a wholesale rewrite.
6. Revisit source-string tests during each touched seam instead of running a destructive test purge.

## Stale / duplicate / missing coverage assessment

No high-confidence stale functional test was identified in the bounded opening audit. The clearest debt has been implementation-location and retired-copy coupling rather than obsolete product behavior.

Direct renderer-owned primary minimalism is now covered after the shim removal.

Still relevant future coverage when the associated seam is touched:

- BRP preview semantics for legal natural/base skill ratings above the normal cap, tracked separately as polish in Issue #15; and
- a dedicated result-renderer contract if future rendering behavior becomes independently complex.

## Cheap maintainability guardrail

Do not add a CI line-count threshold. The current file-map plus this audit is sufficient for the opening pass. If source growth continues, prefer an informational report of largest files and responsibility notes over a failing style gate.

## Guardrails

- No product feature work in Stage 1 cleanup slices.
- No schema changes merely to simplify refactoring.
- Native system state remains canonical and lossless.
- Preserve exact-SHA validation.
- Preserve accepted browser behavior unless a concrete defect is separately identified.
- `qa` and `main` remain unchanged unless explicitly promoted by the owner.
