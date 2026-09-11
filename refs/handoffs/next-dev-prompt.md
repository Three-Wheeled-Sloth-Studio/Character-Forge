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
python refs/tools/generate_agent_context.py --focus "Stage 1 BRP creator state responsibility split"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/engineering-health-audit-2026-09-11.md`
3. `refs/planning/engineering-health-cleanup.md`
4. `refs/planning/owner-approved-priority-sequence-2026-09-11.md`
5. `apps/web/src/brpCreatorState.ts`
6. `apps/web/src/brpCreatorState.test.ts`
7. BRP callers/tests directly affected by the proposed split

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Exact Green Checkpoint

Current accepted `dev` head:

- SHA: `dc13c9e919163f144a2df8db931e0dee6dd78879`
- Actions: `34635026247`
- Job: `103380710114`
- 61 test files / 294 tests / 0 failures
- 228 tracked paths
- 14 required project-memory files
- OKF 32 concepts / 10 indexes
- agent context 3778 characters
- build `Character Forge build 0.0.1 dc13c9e9`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Stage 1 Progress

Completed and exact-SHA validated:

1. extracted character result rendering from `main.ts` into `characterResultRenderer.ts`;
2. corrected print tests that over-specified source placement;
3. removed primary presentation cleanup and the global `MutationObserver` from workspace orchestration;
4. absorbed accepted Stage 0 BRP/D&D minimalism into renderer-owned output;
5. deleted `primaryUiMinimalism.ts` and `creatorPresentationAdapter.ts`;
6. updated stale tests to protect the compact accepted UI rather than hidden verbose copy.

Stage 0 owner-QA contracts remain green and must stay protected.

## Immediate Next Slice

Perform a bounded responsibility split of `apps/web/src/brpCreatorState.ts`.

Candidate seams:

- state types/default construction and campaign-profile selection;
- preview/allocation projection and helpers;
- CharacterDocument/native build;
- reopen/from-document reconstruction.

Do not split by line count. Preserve useful public exports or migrate callers deliberately. Prefer small internal modules with `brpCreatorState.ts` remaining a stable facade if that reduces caller churn.

Protect at minimum:

- native-state fidelity;
- exact save/reopen equality;
- campaign-profile provenance and no legacy-profile inference;
- legal allocation behavior and cap enforcement;
- randomization compatibility;
- adapter validation; and
- current creator UI behavior.

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
