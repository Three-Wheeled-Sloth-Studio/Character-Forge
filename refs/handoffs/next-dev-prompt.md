---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- roadmap
- prioritization
- productization
- browser-qa
---
# Next Development Prompt

Continue planning in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

**Do not begin implementation immediately.** The first task in this thread is to prioritize newly captured owner TODOs against the existing roadmap and current acceptance blockers.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "roadmap prioritization Character Forge productization sheets VTT naming universal grammar"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/unprioritized-product-todos-2026-09-11.md`
3. `refs/planning/roadmap.yaml`
4. `refs/architecture/adaptive-character-sheet-framework.md`
5. `refs/product/creator-workspace.md`
6. GitHub Issue #14

Do not reread the entire repository history.

## Exact Green Code Checkpoint

The latest implementation checkpoint before the documentation-only closeout is:

- `dev`: `3e8a73a6e0e960967e08b49abb132f49fe9fd378`
- Actions: `34620261296`
- Job: `103332185790`
- 59 test files / 283 tests / 0 failures
- 221 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- agent context: 4092 characters
- build: `Character Forge build 0.0.1 3e8a73a6`

Later commits in the handoff are documentation-only. Validate the exact current `dev` head before declaring any later milestone green.

## Current QA Acceptance Finding

Owner D&D browser testing after the adaptive-pagination change still shows **unnecessary pagination**. A representative character that should fit comfortably on one page continues to split.

Treat this as an open real-browser acceptance defect. Do not assume the logical one-page descriptor means physical browser pagination is correct.

No additional fix was attempted during the documentation closeout.

## Newly Captured Backlog

The unprioritized capture is authoritative at:

`refs/planning/unprioritized-product-todos-2026-09-11.md`

It includes, among other items:

- remaining sheet pagination acceptance work;
- studio/product branding using `TWS-Design-Principles/Branding/`;
- direct portrait-slot interaction and optional context-menu editing;
- VTT token generation/import/update/manual override/export workflow;
- a Foundry-license purchase trigger tied to actual integration need;
- full context-aware name generation;
- Universal Grammar work;
- proprietary RPG-system work;
- BRP random-table flavor suggestions;
- correct system-switch clear/translate semantics;
- BRP and D&D primary-UI minimalism cleanup;
- Character Forge `version:build:revision` user-facing version identity;
- a matching parent Parchment Worlds version pill; and
- deeper inheritance of authoritative project/campaign choices.

Do not infer priority from the order in that file.

## First Task - Propose Priority Order

Before editing code, compare the new backlog against the existing roadmap and propose an execution sequence.

Group the work into:

1. **Current acceptance blockers** - items that prevent closing active player-usability/browser acceptance.
2. **Productization / external-demo readiness** - items needed before actively shopping/demoing the product.
3. **Near-term companion capabilities** - valuable user-facing additions that fit naturally after acceptance.
4. **Architecture/platform investments** - Universal Grammar, proprietary-system foundations, durable media/assets, translation semantics, etc.
5. **Later integrations** - Foundry push/sync and other integrations that depend on earlier foundations.

For each proposed work package include:

- why it belongs at that point;
- dependencies;
- what it unblocks;
- rough size/risk if apparent; and
- whether it should be its own epic/issue or folded into an existing one.

Get owner agreement on the ordering before starting newly captured implementation work.

## Product Direction To Preserve During Prioritization

### Primary UI minimalism

Nothing belongs in the primary creator UI unless it provides immediate player or GM value for the current task.

Avoid:

- permanent explanatory prose;
- architectural commentary;
- callouts to unavailable/future functionality;
- success text where a simple state icon is enough; and
- rules explanations that are only useful occasionally.

Prefer compact info/help affordances for optional explanation and show detailed text when a state is invalid or a user explicitly asks for help.

Apply this principle to both BRP and D&D, not only the strings individually called out by the owner.

### Native-state boundary

- Native system state is mandatory and lossless.
- BRP and D&D native state remain canonical.
- Universal Grammar remains derived semantic/translation state with explicit loss.
- Portrait/token/VTT metadata does not belong in RPG native state.
- Foundry Actor/Item schemas remain adapter targets.

### Project/campaign authority

Do not ask the character creator to repeat project/campaign choices already supplied authoritatively upstream unless the project explicitly allows per-character variation.

### Sheet direction

The sheet is a play artifact. Preserve system-specific play hierarchy, screen/print parity, quiet empty media space, campaign-owned badging, and the standalone print-document boundary.

## Active Issue Boundary

GitHub Issue #14 remains open. Do not close it until representative BRP browser acceptance succeeds through:

```text
create -> finish -> review -> save -> reopen -> print/export
```

The D&D pagination finding should be considered during prioritization because the adaptive sheet framework is shared, but do not let D&D chronology automatically displace the owner-agreed next priority.

## Branch / Promotion Boundary

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not promote either branch unless explicitly requested.

## Validation

When implementation resumes, every milestone still requires:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.