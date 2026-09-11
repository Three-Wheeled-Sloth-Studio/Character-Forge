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

Status: **complete**

Accepted starting checkpoint: `02913690d859d4116661214c9f48b5899134cec3`

Final exact green Stage 1 checkpoint: `95ec2b8d9ae54119fc27e99166a4ebb86563a6ed`

Stage 0 player-usable acceptance was complete before this pass. This audit bounded the engineering-health work performed before productization.

## Findings And Disposition

### 1. Mixed-responsibility app bootstrap - addressed

Result validation/routing/rendering and print-sheet extraction moved from `apps/web/src/main.ts` into `apps/web/src/characterResultRenderer.ts`. `main.ts` remains app bootstrap, project context, host messaging, workspace coordination, and result-controller delegation.

### 2. Transitional presentation scaffolding - addressed

The Stage 0 post-render primary-UI rewrite/observer layer was removed. `primaryUiMinimalism.ts` and `creatorPresentationAdapter.ts` are deleted, BRP/D&D renderers emit accepted compact presentation directly, and `creatorWorkspace.ts` owns no presentation rewrite or observer.

### 3. BRP creator state mixed several responsibilities - addressed

`brpCreatorState.ts` remains the stable facade while focused modules own state/defaults, skill resolution, CharacterDocument build, preview/auto-allocation, and reopen reconstruction:

- `brpCreatorStateModel.ts`
- `brpCreatorSkillModel.ts`
- `brpCreatorBuild.ts`
- `brpCreatorPreview.ts`
- `brpCreatorReopen.ts`

This preserved caller imports, native-state fidelity, allocation behavior, campaign-profile provenance, randomization compatibility, adapter validation, and save/reopen behavior.

### 4. BRP creator view density - audited and deliberately not split

`brpCreatorPanelView.ts` is dense but already decomposes into named section functions for campaign/profile chrome, profession controls, characteristics, allocation guidance, skill rows, and HTML helpers.

A file split would mostly move markup without reducing responsibility coupling or improving independent testability. No refactor was made solely for line count.

### 5. D&D Guided Mechanical orchestration - one evidence-backed seam extracted

`guidedCreationPanel.ts` remains broad because it coordinates a broad Level 1 rules surface. Rather than broad-rewrite it, the independent ability-generation responsibility was extracted into `guidedAbilityControls.ts`.

That controller now owns:

- Standard Array / Manual / Point Cost / Random method rendering;
- random-roll state and assignment presentation;
- point-cost budget feedback; and
- conversion of method controls into `GuidedAbilityMethodInput`.

Focused tests protect the method-rendering contracts. Class/background/species choice orchestration and provenance remain untouched.

### 6. Brittle source-placement tests - repaired where encountered

Refactors exposed several tests that asserted implementation lived in a particular source file. Those were updated where necessary to protect rendered behavior or an actual architecture boundary instead.

No high-confidence stale or obsolete functional test was identified. Existing remaining source-inspection tests protect explicit architecture/presentation contracts and were not deleted merely to reduce test count.

## Stage 1 Exit Decision

The owner-approved Stage 1 was a bounded cleanup pass, not a standing rewrite project. The pass now covers:

- stale/obsolete-test review;
- redundant/low-value-test review;
- brittle implementation-detail assertions where encountered;
- missing regression coverage on the new ability-control seam;
- dead/transitional scaffolding removal;
- large-file/responsibility inventory;
- responsibility-boundary review; and
- bounded monolith remediation.

No further high-confidence, low-risk cleanup currently justifies delaying Stage 2. Future refactors should be triggered by concrete maintenance evidence, not by keeping Stage 1 nominally open.

## High-Value Regressions To Preserve

- system-switch clearing without native-state mutation;
- D&D and BRP adaptive print pagination;
- save/reopen fidelity;
- native-state validation and system ownership;
- primary UI minimalism;
- isolated sheet-only print output; and
- Guided Mechanical ability-method behavior.

## Deferred Product Polish

Issue #15 separately tracks BRP natural-base-cap display semantics and equipment help interaction. Those remain product polish, not engineering-health blockers.

## Guardrails Carried Forward

- Native system state remains canonical and lossless.
- Preserve exact-SHA validation.
- Preserve accepted browser behavior unless a concrete defect is separately identified.
- Avoid line-count refactors.
- `qa` and `main` remain unchanged unless explicitly promoted by the owner.
