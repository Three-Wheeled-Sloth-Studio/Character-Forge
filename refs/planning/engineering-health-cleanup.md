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

Status: **captured, not prioritized**

Character Forge is due for a deliberate engineering-health pass. This work should be prioritized against the existing roadmap and the owner backlog before implementation begins; it is not authorization to refactor immediately.

## Goal

Reduce accumulated maintenance debt before continued feature growth makes it harder to distinguish useful safeguards from stale scaffolding or healthy modularity from growing monoliths.

The pass should improve maintainability without changing product behavior unless a concrete defect is discovered and separately accepted for correction.

## Test-Suite Audit

TODO:

- Identify tests that assert obsolete product behavior, retired UI structure, transitional implementation details, or superseded architecture.
- Remove stale tests rather than preserving dead behavior merely because a test exists.
- Identify duplicated tests that exercise the same contract without materially increasing confidence.
- Consolidate repetitive fixtures/helpers where doing so improves readability without hiding important system-specific intent.
- Prefer tests against durable behavior/contracts over brittle implementation-string assertions.
- Preserve high-value regression coverage for defects found during owner QA.
- Look for tests that make future refactoring artificially expensive because they over-specify internal structure.
- Identify missing tests around boundaries that have become important through recent growth.
- Keep native-state fidelity, replay/provenance, validation, adapter, save/reopen, and exact behavior guarantees strongly covered.

## Refactoring Audit

TODO:

- Review current package/module responsibility boundaries for leakage or duplication.
- Identify code that has accumulated multiple unrelated responsibilities and should be split by responsibility.
- Look for repeated creator/rendering/generation patterns that merit a shared helper only where semantics are genuinely shared.
- Avoid creating universal abstractions from superficial UI similarity.
- Identify dead code, transitional compatibility scaffolding that is no longer needed, unreachable branches, and obsolete comments/TODOs.
- Review public/internal API surfaces for accidental coupling introduced during rapid vertical-slice work.
- Prefer small evidence-backed refactors over broad rewrites.

## Monolith / File-Growth Audit

Explicitly inspect file and module growth rather than waiting for obvious pain.

TODO:

- Inventory the largest source and test files by line count and responsibility count.
- Flag files that are large because they own one coherent data catalog separately from files that are large because they own too many behaviors.
- Identify classes/modules/functions that are becoming orchestration monoliths.
- Split files when distinct responsibilities can be named cleanly and tested independently.
- Pay particular attention to creator panels/state, system projection/builders, host integration, sheet rendering, generation orchestration, and large system catalogs.
- Do not split mechanically just to satisfy a line-count target; cohesion and responsibility are the deciding factors.
- Consider adding a lightweight maintainability diagnostic or report if it can identify future file-growth drift cheaply without turning CI into a style-policing burden.

## Cleanup Guardrails

- Behavior-preserving refactoring should remain behavior-preserving; do not mix unrelated feature work into the cleanup pass.
- Do not weaken validation or native-state fidelity to simplify code.
- Do not delete tests solely because they are inconvenient; first determine whether the behavior they protect is still authoritative.
- Do not keep tests solely because they exist; stale behavior should not become permanent architecture through test inertia.
- Shared abstractions must reflect real shared semantics, not merely similar control placement or markup.
- Keep exact-SHA validation and normal `npm run verify` gates intact throughout cleanup.

## Suggested Output Of The Audit

Before significant refactoring, produce a bounded findings list containing:

1. stale/obsolete tests to remove or rewrite;
2. duplicate/low-value tests to consolidate;
3. missing high-value regression coverage;
4. files/modules with mixed responsibilities;
5. largest files with a short explanation of whether size is justified;
6. concrete refactoring candidates ordered by risk/value;
7. dead/transitional code candidates; and
8. any cheap maintainability guardrail worth adding.

The owner should approve the cleanup scope before broad refactoring begins.
