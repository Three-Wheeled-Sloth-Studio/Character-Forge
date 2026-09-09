---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- parked
---
# Next Development Prompt

There is currently **no authorized next D&D Guided Narrative implementation slice**.

The D&D Guided Narrative line was explicitly parked on 2026-09-09 after the Fighter Fighting Style slice.

Before doing any D&D Narrative work, read:

1. `refs/handoffs/archive/dnd-guided-narrative-paused-2026-09-09.md`
2. `refs/handoffs/currentHandoff.md`
3. `refs/product/creator-workspace.md`
4. `refs/product/generation-methods.md`

Do not automatically continue into Cleric/Druid order-preference work. That is retained only as a possible future candidate if product direction explicitly returns to this line.

## Parking Checkpoint

The last fully documented D&D Narrative head before the explicit parking record was:

- `5c343b3060c0294fa404b52d0428291f1e8862a4`
- Actions `34408070329`
- job `102655735014`
- Verify: success
- 44 test files / 216 tests / 0 failures
- build: `Character Forge build 0.0.1 5c343b30`

The explicit parking record was then committed at:

- `42cd7c4a1ab1cf41c849c71aff51f246cdc03121`

Promoted branches remain intentionally separate unless an explicit promotion decision is made:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion.

## What To Do On Re-entry

Do not infer the next product line from chronology.

When a new Character Forge implementation request arrives:

- use the user's requested line of work as authoritative;
- generate a bounded agent-context packet for that line;
- prefer diff-first continuation and targeted source reads;
- preserve existing D&D Narrative behavior while it is parked;
- do not reopen deferred D&D Narrative abstractions merely because they are documented.

BRP, random-table, naming, Foundry, advancement, or other roadmap lines may be selected independently by product direction. This prompt does not authorize any one of them by default.

## Durable D&D Narrative State

At parking:

- six global bounded Narrative questions remain implemented;
- Fighter has one conditional Fighting Style branch;
- mapping version is `5`;
- direct Narrative recipe is `0.4`;
- continuation recipe is `0.4`;
- `Choose for me` remains required on Narrative choice surfaces;
- five presented choices remains the hard Narrative ceiling;
- later Guided Mechanical edits remain authoritative;
- direct current choices remain separate from sticky acceptable random pools;
- no universal class-feature, combat-role, equipment, Alignment/personality, or questionnaire ontology was created.

D&D Issue #11 remains the accumulated runtime-QA/promotion gate.

## Foundation Guardrails

Native system state is mandatory and lossless.

Never reconstruct retained native state from semantic projection. Shared creator code coordinates interactions only; system-owned rules, mappings, distributions, and content remain system-owned. Parchment remains system-agnostic. Preserve exact-SHA promotion provenance.

## Validation

For any future implementation milestone:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
