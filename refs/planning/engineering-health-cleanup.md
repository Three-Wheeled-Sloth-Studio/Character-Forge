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

Status: **complete - owner-approved Stage 1 closed 2026-09-11**

Stage 0 player-usable acceptance was complete before this pass. Stage 1 is now complete at exact green checkpoint `95ec2b8d9ae54119fc27e99166a4ebb86563a6ed`.

The completed audit is captured in:

`refs/planning/engineering-health-audit-2026-09-11.md`

## Goal Achieved

The pass reduced maintenance debt before the next architecture/product layer without changing native character semantics or turning cleanup into a rewrite.

## Completed Work

- extracted character-result routing/rendering and print extraction from `main.ts`;
- replaced brittle source-location print assertions with contract-oriented coverage where those seams moved;
- removed Stage 0 post-render primary-UI rewriting and observation;
- moved accepted compact BRP/D&D presentation into render owners;
- split BRP creator state into focused responsibilities behind the stable `brpCreatorState.ts` facade;
- audited `brpCreatorPanelView.ts` and intentionally skipped a cosmetic file split;
- extracted Guided Mechanical ability-method rendering/state/parsing into `guidedAbilityControls.ts`;
- added focused ability-control rendering coverage;
- reviewed remaining test/source coupling and found no high-confidence stale functional test requiring removal.

## Explicit Non-Work

- No broad rewrite of `guidedCreationPanel.ts`.
- No line-count-driven file splitting.
- No schema changes for refactoring convenience.
- No product feature work mixed into engineering cleanup.
- No Issue #15 BRP polish pulled ahead of sequence.
- No `qa` or `main` promotion.

## Future Refactor Trigger

Stage 1 is not a permanent backlog bucket. Additional cleanup should be opened only when concrete evidence appears, such as:

- a file becomes materially hard to reason about while changing a real feature;
- a test blocks a behavior-preserving move because it asserts arbitrary source placement;
- repeated defects expose missing ownership boundaries;
- duplicated logic develops real shared semantics; or
- a new architecture layer makes an existing seam demonstrably costly.

## Test-Suite Rules Carried Forward

- Prefer durable behavior/contracts over brittle implementation-string assertions.
- Preserve high-value regression coverage for owner-QA defects.
- Keep native-state fidelity, provenance, validation, adapter, save/reopen, adaptive print, and exact behavior guarantees strongly covered.
- Do not add duplicate unit tests merely because implementation moves into smaller modules unless those modules establish meaningful independent contracts.

## Guardrails Carried Forward

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Shared abstractions must reflect real shared semantics, not merely similar control placement or markup.
- Keep exact-SHA validation and normal `npm run verify` gates intact.
