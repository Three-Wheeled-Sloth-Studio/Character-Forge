---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- productization
- branding
- roadmap
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

The owner-approved execution sequence is in:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Stages 0 and 1 are complete. Resume **Stage 2 - Productization and branding**. Do not reopen roadmap prioritization unless new evidence materially changes the plan.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 2 productization branding version identity"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/owner-approved-priority-sequence-2026-09-11.md`
3. relevant shell/build/version files in `apps/web`
4. shared branding guidance/assets from `Three-Wheeled-Sloth-Studio/TWS-Design-Principles/Branding/`
5. the World Forge version/build identity implementation used as the studio reference pattern
6. Parchment Worlds shell/handoff files only where needed for parent identity or duplicate-context cleanup

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Exact Green Checkpoint

Current accepted `dev` head:

- SHA: `95ec2b8d9ae54119fc27e99166a4ebb86563a6ed`
- Actions: `34637052478`
- Job: `103387386113`
- 62 test files / 298 tests / 0 failures
- 235 tracked paths
- 14 required project-memory files
- OKF 32 concepts / 10 indexes
- agent context 3725 characters
- build `Character Forge build 0.0.1 95ec2b8d`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Stage 1 Closeout

The bounded engineering-health pass is complete.

Completed exact-SHA-validated work includes:

- result-renderer extraction from `main.ts`;
- removal of post-render Stage 0 presentation scaffolding;
- BRP creator-state responsibility split behind a stable facade;
- explicit no-op decision on `brpCreatorPanelView.ts` because a split would be cosmetic;
- Guided Mechanical ability-generation controller extraction into `guidedAbilityControls.ts`;
- focused ability-control renderer tests;
- source-placement test repairs only where refactors exposed brittle coupling.

Do not keep Stage 1 open as a general license to rewrite large files.

## Stage 2 First Slice

Audit before editing:

- Character Forge shell branding and icon treatment;
- shared Three-Wheeled Sloth branding assets/guidance;
- Character Forge build/version display;
- World Forge `version:build:revision` implementation;
- Parchment Worlds parent build/version identity;
- creator inputs that duplicate project/campaign context.

Then implement the smallest coherent product-shell/version slice supported by that evidence.

Guardrails:

- do not change native RPG schemas or generation behavior for branding convenience;
- do not put dominant Character Forge branding on character sheets;
- Project/Campaign identity remains primary on the play artifact;
- a small subordinate maker's mark is acceptable when unobtrusive;
- reuse studio patterns/assets rather than creating a parallel visual language;
- do not fold deferred Issue #15 BRP polish into this work unless it becomes a blocker.

## Architecture Baseline

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Universal Grammar remains derived future semantic/translation state.
- Project/campaign context is authoritative where supplied.
- Portrait/token/VTT metadata remains outside native RPG state.
- Foundry schemas remain adapter targets.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every implementation milestone:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
