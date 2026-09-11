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

Current exact green Stage 1 checkpoint: `c8ab49a6732eb99fc1adb6fec62e4b73a1b25141`

Stage 0 player-usable acceptance is complete. This audit identifies bounded engineering-health work to perform before productization or another major architecture layer.

## Findings

### 1. Mixed-responsibility orchestration

Opening finding: `apps/web/src/main.ts` owned application bootstrap, host messaging, system/native-state validation, result rendering, print-sheet extraction, failure rendering, and document-control binding.

Progress: **addressed in the opening Stage 1 slice.** Result validation/routing/rendering and print-sheet extraction now live in `apps/web/src/characterResultRenderer.ts`. `main.ts` remains app bootstrap, project context, host messaging, workspace coordination, and result-controller delegation.

### 2. Transitional presentation scaffolding

Opening finding: `apps/web/src/primaryUiMinimalism.ts` plus a `MutationObserver` in `creatorWorkspace.ts` rewrote renderer output after the fact.

Progress: **partially addressed.** Workspace orchestration no longer imports the cleanup function or owns a global observer. Remaining temporary behavior is isolated behind `apps/web/src/creatorPresentationAdapter.ts`:

- D&D cleanup is explicit after render/mode changes;
- BRP temporarily retains a scoped observer because its panel replaces markup on state changes.

Next action: absorb accepted minimalism into BRP/D&D source renderers, then delete `primaryUiMinimalism.ts` and the scoped BRP observer rather than letting the adapter become permanent architecture.

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

The size is not the problem by itself; the responsibility count is. Split only after the Stage 0 presentation shim is removed, with native-state fidelity and save/reopen behavior kept strongly covered.

### 4. BRP creator view is dense but has clean section boundaries

`apps/web/src/brpCreatorPanelView.ts` combines campaign-profile chrome, profession controls, characteristic controls, allocation guidance, skill rows, and generic HTML helpers. It is a good follow-on split by named view responsibility, not by arbitrary line count. Avoid inventing shared abstractions with D&D solely because both render forms.

### 5. D&D guided creator remains a high-risk orchestration monolith

`apps/web/src/guidedCreationPanel.ts` coordinates sticky acceptable pools, class/background/species rules, ability generation, class-specific controls, provenance, and form rendering. Much of the file is dense because the supported Level 1 rules surface is genuinely broad, but orchestration and rendering are interleaved. Refactor only through small seams backed by existing system behavior tests; do not broad-rewrite it during this pass.

### 6. Some tests over-specify source placement

A small set of tests read source files and assert exact implementation strings. These were useful during rapid acceptance work but can make behavior-preserving moves artificially expensive.

Progress: the result-renderer extraction exposed two such print assertions. They were rewritten to protect the moved result-renderer/print contract rather than requiring print extraction to remain in `main.ts`.

When touching other seams, keep assertions that protect important architecture invariants, but prefer behavior/output contracts over requiring code to live in a specific file.

High-value owner-QA regressions remain non-negotiable, especially:

- system-switch clearing without native-state mutation;
- D&D and BRP adaptive print pagination;
- save/reopen fidelity;
- native-state validation and system ownership;
- primary UI minimalism; and
- isolated sheet-only print output.

## Ordered cleanup candidates

1. **Completed:** extract result rendering from `main.ts` while preserving UI and print behavior.
2. **In progress:** absorb `primaryUiMinimalism.ts` into BRP/D&D renderers and remove post-render observation/rewriting.
3. Split BRP creator state into state/defaults, preview/allocation, build, and reopen responsibilities where those seams remain clean after step 2.
4. Split BRP creator view by named sections if doing so materially improves local reasoning and tests.
5. Audit D&D guided creator for one responsibility seam at a time; avoid a wholesale rewrite.
6. Revisit source-string tests during each touched seam instead of running a destructive test purge.

## Stale / duplicate / missing coverage assessment

No high-confidence stale functional test was identified in the bounded opening audit. The clearest debt is implementation-location coupling rather than obsolete product expectations.

Missing high-value coverage to add when the relevant seam is touched:

- direct primary-renderer output tests after the Stage 0 presentation shim is removed;
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
