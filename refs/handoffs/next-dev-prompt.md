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
python refs/tools/generate_agent_context.py --focus "Stage 1 engineering health presentation shim BRP creator state"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/engineering-health-audit-2026-09-11.md`
3. `refs/planning/engineering-health-cleanup.md`
4. `refs/planning/owner-approved-priority-sequence-2026-09-11.md`
5. `apps/web/src/creatorPresentationAdapter.ts`
6. `apps/web/src/primaryUiMinimalism.ts`
7. the BRP/D&D renderers touched by the immediate cleanup slice

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Exact Green Checkpoint

Current accepted `dev` head:

- SHA: `c8ab49a6732eb99fc1adb6fec62e4b73a1b25141`
- Actions: `34634109473`
- Job: `103377729573`
- 61 test files / 294 tests / 0 failures
- 230 tracked paths
- 14 required project-memory files
- OKF 32 concepts / 10 indexes
- agent context 3806 characters
- build `Character Forge build 0.0.1 c8ab49a6`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Stage 1 Progress

Completed and exact-SHA validated:

1. extracted character result rendering from `main.ts` into `characterResultRenderer.ts`;
2. corrected print tests that over-specified source placement;
3. removed presentation cleanup and the global `MutationObserver` from workspace orchestration;
4. isolated the remaining temporary Stage 0 presentation behavior in `creatorPresentationAdapter.ts`.

Stage 0 owner-QA contracts remain green and must stay protected.

## Immediate Next Slice

Retire the presentation compatibility layer rather than normalizing it as permanent architecture.

Target behavior-preserving changes:

- encode BRP primary-UI minimalism directly in BRP renderer output;
- encode D&D Guided Mechanical and Guided Narrative minimalism directly in source output;
- delete `primaryUiMinimalism.ts` when no post-render rewriting remains;
- remove the scoped BRP observer from `creatorPresentationAdapter.ts` once BRP rerenders are intrinsically correct;
- update tests to assert durable output/contracts rather than source placement.

Do not include Issue #15 polish in this slice.

After the shim is fully retired, proceed to the next audit-ranked candidate: split `brpCreatorState.ts` by coherent responsibility while preserving native-state fidelity, save/reopen, allocation, and campaign-profile behavior.

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
