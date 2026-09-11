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

Current exact green Stage 1 checkpoint: `49b182d09e98af66723686ef6ec841555c30f987`

Stage 0 player-usable acceptance is complete. This audit identifies bounded engineering-health work to perform before productization or another major architecture layer.

## Findings

### 1. Mixed-responsibility app bootstrap

Opening finding: `apps/web/src/main.ts` owned application bootstrap, host messaging, system/native-state validation, result rendering, print-sheet extraction, failure rendering, and document-control binding.

Progress: **addressed.** Result validation/routing/rendering and print-sheet extraction now live in `apps/web/src/characterResultRenderer.ts`. `main.ts` remains app bootstrap, project context, host messaging, workspace coordination, and result-controller delegation.

### 2. Transitional presentation scaffolding

Opening finding: Stage 0 used post-render UI rewriting and observation to achieve accepted primary-UI minimalism.

Progress: **addressed.** `primaryUiMinimalism.ts` and `creatorPresentationAdapter.ts` are deleted. BRP and D&D renderers now emit accepted compact presentation directly. `creatorWorkspace.ts` owns no presentation rewrite or observer.

### 3. BRP creator state mixed several responsibilities

Opening finding: `apps/web/src/brpCreatorState.ts` owned state/default construction, campaign-profile application, preview/validation, CharacterDocument construction, legal auto-allocation, reopen reconstruction, profession-specific skill resolution, and allocation helpers.

Progress: **addressed through a stable facade.** `brpCreatorState.ts` now re-exports a responsibility split:

- `brpCreatorStateModel.ts`
- `brpCreatorSkillModel.ts`
- `brpCreatorBuild.ts`
- `brpCreatorPreview.ts`
- `brpCreatorReopen.ts`

This preserved caller imports, native-state fidelity, allocation behavior, campaign-profile provenance, randomization compatibility, adapter validation, and save/reopen behavior.

### 4. BRP creator view is dense but has named section boundaries

`apps/web/src/brpCreatorPanelView.ts` combines campaign/profile chrome, profession controls, characteristic controls, allocation guidance, skill rows, and generic HTML helpers.

Next action: **audit before editing.** The presence of named functions alone may already provide enough local structure. Split only if extraction materially improves responsibility ownership, testability, or local reasoning. Do not move markup merely to reduce file length.

### 5. D&D guided creator remains a high-risk orchestration monolith

`apps/web/src/guidedCreationPanel.ts` coordinates sticky acceptable pools, class/background/species rules, ability generation, class-specific controls, provenance, and form rendering. Much of the file is dense because the supported Level 1 rules surface is genuinely broad, but orchestration and rendering are interleaved.

Refactor only through one evidence-backed seam at a time. Do not broad-rewrite it during this pass.

### 6. Some tests over-specify source placement

A small set of tests read source files and assert exact implementation strings. These were useful during rapid acceptance work but can make behavior-preserving moves artificially expensive.

Progress: print and primary-minimalism refactors exposed several such assertions. They were rewritten where necessary to protect rendered behavior or architectural boundaries rather than exact source placement.

When touching other seams, preserve assertions that protect important architecture invariants, but prefer behavior/output contracts over requiring code to live in a specific file.

High-value owner-QA regressions remain non-negotiable, especially:

- system-switch clearing without native-state mutation;
- D&D and BRP adaptive print pagination;
- save/reopen fidelity;
- native-state validation and system ownership;
- primary UI minimalism; and
- isolated sheet-only print output.

## Ordered Cleanup Candidates

1. **Completed:** extract result rendering from `main.ts`.
2. **Completed:** retire post-render primary-UI rewriting/observation and move accepted presentation into renderers.
3. **Completed:** split BRP creator state by coherent responsibility behind a stable facade.
4. **Audit next:** determine whether `brpCreatorPanelView.ts` warrants a responsibility split. Skip if the extraction would be cosmetic.
5. Audit D&D Guided Mechanical orchestration one responsibility seam at a time; avoid wholesale rewrite.
6. Revisit source-string tests during each touched seam instead of running a destructive test purge.

## Stale / Duplicate / Missing Coverage Assessment

No high-confidence stale functional test has been identified. The clearest debt has been implementation-location coupling rather than obsolete product expectations.

The BRP creator state split passed the existing broad contract suite without adding a new behavior surface. Additional module-unit tests should be added only where a future change creates independently meaningful contracts; do not duplicate facade-level tests merely because code moved.

Issue #15 separately tracks BRP natural-base-cap display semantics and equipment help interaction. Those are product polish, not Stage 1 refactor requirements.

## Cheap Maintainability Guardrail

Do not add a CI line-count threshold. The current file map plus this audit is sufficient. If source growth continues, prefer an informational report of largest files and responsibility notes over a failing style gate.

## Guardrails

- No product feature work in Stage 1 cleanup slices.
- No schema changes merely to simplify refactoring.
- Native system state remains canonical and lossless.
- Preserve exact-SHA validation.
- Preserve accepted browser behavior unless a concrete defect is separately identified.
- `qa` and `main` remain unchanged unless explicitly promoted by the owner.
