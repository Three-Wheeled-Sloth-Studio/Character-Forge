---
type: "Planning Backlog"
title: "Engineering Health Cleanup Pass"
tags:
- character-forge
- engineering-health
- refactoring
- testing
- maintainability
- roadmap
---
# Engineering Health Cleanup Pass

Status: **active - owner approved Stage 1**

Stage 0 player-usable acceptance is complete. The owner explicitly authorized Stage 1 engineering-health work on 2026-09-11.

The bounded opening audit is captured in:

`refs/planning/engineering-health-audit-2026-09-11.md`

## Goal

Reduce accumulated maintenance debt before continued feature growth makes it harder to distinguish useful safeguards from stale scaffolding or healthy modularity from growing monoliths.

The pass should improve maintainability without changing product behavior unless a concrete defect is discovered and separately accepted for correction.

## Audit Findings In Force

- Prefer behavior/output contracts over brittle source-location assertions.
- Separate large coherent catalogs/rules surfaces from files that are large because they own too many responsibilities.
- `main.ts` result rendering was a mixed responsibility and has been extracted.
- Stage 0 post-render primary-UI rewriting was transitional scaffolding and has been retired.
- `brpCreatorState.ts` is now the next high-value responsibility split.
- `brpCreatorPanelView.ts` has clean named section boundaries if a later view split materially improves local reasoning.
- `guidedCreationPanel.ts` is high risk; refactor one evidence-backed seam at a time rather than broad-rewriting it.
- Do not add a failing line-count style gate. If file-growth diagnostics are added later, keep them informational and responsibility-oriented.

## Completed Stage 1 Slices

### Result-renderer extraction

Character result validation, system routing, sheet rendering, print-sheet extraction, and failure rendering moved from `main.ts` into `apps/web/src/characterResultRenderer.ts`.

Tests that previously required print extraction to live in `main.ts` were updated to protect the actual result-renderer/print contract instead.

### Presentation compatibility layer retired

`creatorWorkspace.ts` no longer owns primary-UI cleanup or a workspace-wide observer, and the temporary adapter/shim have been deleted:

- `apps/web/src/creatorPresentationAdapter.ts`
- `apps/web/src/primaryUiMinimalism.ts`

Accepted Stage 0 primary-UI minimalism is now renderer-owned:

- BRP emits compact primary markup directly from `brpCreatorPanelView.ts`;
- Guided Narrative emits compact primary markup directly;
- Guided Mechanical owns its local heading cleanup and concise continuation note;
- `creatorWorkspace.ts` mounts system creators directly.

Two tests that still expected verbose copy hidden during Stage 0 were updated to protect the compact accepted UI instead of restoring obsolete visible prose.

## Next Ordered Cleanup Candidates

1. Split BRP creator state into coherent responsibilities only where seams remain clean.
2. Split BRP creator view by named sections if that materially improves reasoning and testability.
3. Audit D&D Guided Mechanical orchestration one responsibility seam at a time; avoid wholesale rewrite.
4. Revisit source-string tests as each touched seam moves, preserving architecture invariants without pinning code to arbitrary files.

For `brpCreatorState.ts`, candidate seams are:

- state types/default construction and campaign-profile selection;
- preview/allocation projection and helpers;
- CharacterDocument/native build;
- reopen/from-document reconstruction.

Prefer keeping `brpCreatorState.ts` as a stable facade if that substantially reduces caller churn and risk.

## Test-Suite Rules

- Remove stale tests rather than preserving dead behavior merely because a test exists.
- Consolidate genuinely duplicated tests when doing so improves signal.
- Prefer durable behavior/contracts over brittle implementation-string assertions.
- Preserve high-value regression coverage for owner-QA defects.
- Keep native-state fidelity, provenance, validation, adapter, save/reopen, adaptive print, and exact behavior guarantees strongly covered.

## Cleanup Guardrails

- Behavior-preserving refactoring should remain behavior-preserving; do not mix unrelated feature work into the cleanup pass.
- Do not weaken validation or native-state fidelity to simplify code.
- Do not delete tests solely because they are inconvenient; first determine whether the behavior they protect is still authoritative.
- Do not keep tests solely because they exist; stale behavior should not become permanent architecture through test inertia.
- Shared abstractions must reflect real shared semantics, not merely similar control placement or markup.
- Do not pull deferred Issue #15 BRP polish into refactoring slices unless explicitly requested or proven blocking.
- Keep exact-SHA validation and normal `npm run verify` gates intact throughout cleanup.
