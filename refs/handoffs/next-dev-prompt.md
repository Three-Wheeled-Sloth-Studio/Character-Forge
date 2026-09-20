---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- import
- runtime-validation
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

Stage 5 - Foundry Export / Import Validation is active. Stage 4 integrated portrait/token browser QA remains deferred to the owner's primary workstation and pinned in Issue #16; it does not block Stage 5 development.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 5 real Foundry D&D5e runtime import validation"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. Stage 5 of `refs/planning/owner-approved-priority-sequence-2026-09-11.md`
3. `packages/foundry-adapter/src/dnd5eActor.ts`
4. `packages/foundry-adapter/src/dnd5eActor.test.ts`
5. `apps/web/src/characterSheetControls.ts`
6. `refs/integration/foundry-dnd5e-level-one-equipment-audit-2026-09-12.md`
7. only the exact adapter files implicated by any runtime defect

Do not reread repository history or reopen completed equipment mapping work without runtime evidence.

## Exact Green Implementation Checkpoint

- SHA: `2e642d67d1033e0a917077c246b38bb36e5d80a7`
- Actions: `35533225275`
- Job: `106137552956`
- `npm run verify`: green
- 69 test files
- 342 tests passed
- 0 failures
- 252 tracked paths
- 14 required project-memory files
- OKF: 33 concepts / 10 indexes
- Agent context: 3797 characters
- Build: `Character Forge build 0.0.1 2e642d67`
- Foundry adapter: `0.17.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Current Stage 5 State

Pinned target:

- Foundry VTT `14.367`
- D&D5e `6.0.0`

The Level 1 equipment audit is complete. All 75 currently emit-able Character Forge equipment IDs have supported Foundry mappings.

The first downloadable Foundry import artifact is also complete:

- D&D-only toolbar action: `Download Foundry D&D5e import JSON`;
- raw Actor document only, with no Character Forge adapter wrapper metadata;
- MIME type `application/json;charset=utf-8`;
- stable filename `<character-slug>-foundry-dnd5e.json`;
- existing CharacterDocument Copy JSON and Download JSON actions preserved;
- deterministic artifact coverage is green;
- adapter version remains `0.17.0`.

## Immediate Work - Real Foundry Runtime Import Validation

Real Foundry import testing is now the next major Stage 5 blocker.

The owner-approved license purchase/use trigger has been reached because the exporter/import artifact is mature enough that runtime validation is the next required evidence.

Use an actual runtime pinned to:

- Foundry VTT `14.367`;
- D&D5e `6.0.0`.

Generate and download a representative D&D 5E 2024 character artifact through the Character Forge UI, then import that raw Actor JSON into Foundry.

Record concrete runtime evidence for:

- whether Foundry accepts the artifact without manual structural repair;
- Actor identity and core system state;
- abilities and saving throws;
- HP and authoritative flat AC;
- initiative, movement, senses, alignment, XP, size, languages, currency, skills, and spell slots;
- embedded Class, Background, Race, and mapped equipment Items;
- deterministic embedded IDs and Character Forge source provenance;
- Foundry/D&D5e migration, normalization, warnings, rejected fields, or schema mutations;
- any mismatch between pre-import JSON and the resulting runtime Actor.

Do not claim runtime acceptance unless the actual import is performed and inspected.

If runtime evidence exposes an adapter defect:

1. isolate the smallest failing field or Item shape;
2. confirm the expected pinned-runtime shape;
3. make only the evidence-backed adapter correction;
4. update deterministic fixture coverage;
5. bump the Foundry adapter version only if the exported Actor/Item document shape changes;
6. run exact-SHA `Verify` before updating handoff documentation.

If the runtime is unavailable because a Foundry license has not yet been purchased or installed, record that as the active blocker rather than inventing runtime acceptance.

## Do Not Pull Forward Yet

Do not combine runtime acceptance with:

- Healer's Kit Stabilize activity automation;
- general feature/activity Items;
- spell Items;
- Parchment portrait/token packaging;
- one-click Foundry push/update;
- bidirectional Foundry synchronization.

## Guardrails

- Native system state is mandatory and lossless.
- Native D&D and BRP state remain canonical.
- Foundry Actor/Item data remains an adapter target.
- Do not project through Universal Grammar.
- Universal Grammar remains a future derived translation/semantic layer.
- Do not copy Foundry compendium prose.
- Do not replay Foundry advancement for choices Character Forge already resolved.
- Unsupported equipment remains explicit.
- Do not fabricate fallback equipment.
- Actor AC remains flat and authoritative until Foundry calculation parity is separately proven.
- Portrait/token/VTT media identity remains Parchment-owned, not RPG native state.
- Preserve exact-SHA `dev -> qa -> main` promotion.
- Keep Character Forge Issue #16 open as the deferred Stage 4 owner/browser portrait-token QA return point.
- Issue #15 remains parked and nonblocking.

## Validation

```bash
npm run verify
```

For every milestone:

1. commit implementation;
2. push exact SHA to `dev`;
3. validate that exact SHA in GitHub Actions;
4. capture Actions run, job, test counts, tracked paths, OKF, agent-context size, and build identity;
5. only then update handoff/audit documentation;
6. validate the exact documentation SHA too.

Do not promote `qa` or `main` without explicit owner authorization.
