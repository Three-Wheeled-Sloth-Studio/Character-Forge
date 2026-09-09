---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- parked
---
# Current Handoff

Date: 2026-09-09
Branch: `dev`
Current product status: **D&D Guided Narrative line parked; no automatic next implementation slice selected.**

## Parking State

The D&D Guided Narrative line was intentionally parked after the Fighter Fighting Style slice and documentation closeout.

The last fully documented pre-parking head was:

- `5c343b3060c0294fa404b52d0428291f1e8862a4`
- Actions `34408070329`
- job `102655735014`
- Verify: success
- 44 test files / 216 tests / 0 failures
- 170 tracked paths
- 14 required project-memory files
- OKF: 19 concepts / 9 indexes
- build: `Character Forge build 0.0.1 5c343b30`

The explicit parking record is:

- `refs/handoffs/archive/dnd-guided-narrative-paused-2026-09-09.md`
- parking-record commit: `42cd7c4a1ab1cf41c849c71aff51f246cdc03121`

`refs/handoffs/next-dev-prompt.md` now explicitly prevents chronological continuation of the D&D Narrative line.

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D, BRP, random-table, creator, naming, or Narrative work.

## D&D Narrative State At Parking

Implemented and retained:

- six bounded global Guided Narrative questions covering Class, Background, Species, starting-equipment preference, and two D&D Alignment axes;
- explicit `Choose for me` on every Narrative choice surface;
- hard maximum of five presented choices per Narrative step;
- deterministic seed/replay provenance;
- direct Narrative Build through ordinary Guided/native generation;
- explicit Narrative -> Guided Mechanical continuation;
- current-choice initialization without rewriting sticky acceptable random pools;
- later Guided Mechanical edits remaining authoritative;
- conditional Fighter Fighting Style branch with all four supported styles.

Current versions:

- Narrative mapping: `5`;
- direct Narrative recipe: `0.4`;
- continuation recipe: `0.4`.

The completed Class-defining-choice audit found no justified universal Class-feature ontology. Cleric/Druid order preference remains only a possible future candidate; it is **not active work**.

D&D Issue #11 remains the accumulated owner runtime-QA/promotion gate.

## Other Active/Available Product Lines

Parking D&D Narrative does not park the rest of Character Forge.

Existing independent lines include:

- BRP UGE second-system stress test and creator;
- system-neutral random-table companion and real consumers;
- structured naming/provider work when a real setting/campaign provider exists;
- Foundry integration;
- character advancement/maintenance;
- later semantic/translation work after additional cross-system evidence.

Selection among these lines is a product decision, not an implication of this handoff.

## Re-entry Rule

On the next implementation request:

1. follow the user's explicitly selected product line;
2. generate a bounded context packet for that line;
3. read only the relevant handoff/product/source files;
4. preserve parked D&D Narrative behavior unless the user explicitly resumes it;
5. do not infer work from the old chronological next-slice history.

## Durable Boundaries

Do not reopen without concrete new evidence:

- authoritative native system state is mandatory and lossless;
- never reconstruct retained native state from semantic projection;
- Guided Narrative and Quick Generate are front ends over ordinary native state;
- Narrative steps remain bounded to five presented choices including `Choose for me`;
- Alignment decomposition remains D&D-specific;
- equipment preference remains D&D-specific;
- Fighter Fighting Style remains Fighter-specific;
- direct current choices and sticky acceptable random pools remain separate concepts;
- shared creator code coordinates interaction only; rules/mappings remain system-owned;
- Parchment remains system-agnostic;
- BRP naming content remains setting/campaign/content-package owned;
- random-table evaluation remains a separate generation primitive.

## Validation

Milestone gate:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
