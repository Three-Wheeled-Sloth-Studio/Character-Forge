---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- engineering-health
- refactoring
- acceptance
- roadmap
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

The owner-approved execution sequence is in:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Stage 0 is complete. Resume **Stage 1 - Engineering health and refactoring**. Do not reopen roadmap prioritization unless new evidence materially changes the plan.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 1 BRP creator panel view audit"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/engineering-health-audit-2026-09-11.md`
3. `refs/planning/engineering-health-cleanup.md`
4. `refs/planning/owner-approved-priority-sequence-2026-09-11.md`
5. `apps/web/src/brpCreatorPanelView.ts`
6. BRP view tests directly affected by a proposed extraction

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Exact Green Checkpoint

Current accepted `dev` head:

- SHA: `49b182d09e98af66723686ef6ec841555c30f987`
- Actions: `34635492842`
- Job: `103382233734`
- 61 test files / 294 tests / 0 failures
- 233 tracked paths
- 14 required project-memory files
- OKF 32 concepts / 10 indexes
- agent context 3596 characters
- build `Character Forge build 0.0.1 49b182d0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Stage 1 Progress

Completed and exact-SHA validated:

1. extracted character result rendering from `main.ts` into `characterResultRenderer.ts`;
2. corrected tests that over-specified source placement;
3. retired the Stage 0 primary-UI post-render rewrite and observer layer;
4. moved accepted BRP/D&D compact UI into renderer-owned output;
5. split BRP creator state into coherent model, skill-resolution, build, preview/allocation, and reopen modules while preserving `brpCreatorState.ts` as the stable facade.

Stage 0 owner-QA contracts remain green and must stay protected.

## Immediate Next Slice

Audit `apps/web/src/brpCreatorPanelView.ts` before editing it.

The file has named sections for campaign/profile chrome, profession controls, characteristic controls, allocation guidance, skill rows, and generic HTML helpers. Split only if extracting one or more of those responsibilities materially reduces local reasoning cost or improves direct testability.

Do not perform a line-count refactor. If the existing function boundaries are already sufficient and an extraction would mainly move markup between files, record that finding and skip to the next evidence-backed Stage 1 candidate.

If a split is justified:

- keep `brpCreatorHtml(...)` as a stable composition boundary unless there is a lower-risk alternative;
- preserve rendered HTML contracts exactly apart from harmless source placement;
- prefer BRP-specific section modules over cross-system form abstractions;
- update brittle source-string tests only when they encode implementation placement rather than product behavior.

Do not include Issue #15 polish in this slice.

## Guardrails

- No product feature work in Stage 1 cleanup slices.
- No schema changes merely to simplify refactoring.
- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Do not weaken validation, save/reopen, provenance, or adapter guarantees.
- Do not create cross-system abstractions from superficial UI similarity.
- Preserve adaptive one/two-page sheet behavior and isolated print output.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every implementation milestone:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
