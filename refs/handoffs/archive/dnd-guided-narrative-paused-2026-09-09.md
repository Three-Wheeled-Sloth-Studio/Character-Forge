---
type: "Handoff Record"
title: "D&D Guided Narrative Paused"
tags:
- character-forge
- handoffs
- dnd5e
- guided-narrative
- paused
---
# D&D Guided Narrative Paused

Date: 2026-09-09
Branch: `dev`
Status: **parked by product decision**

## Parking Point

The D&D Guided Narrative implementation line is intentionally paused after the Fighter Fighting Style slice and its documentation closeout.

Final documented `dev` head at parking:

- `5c343b3060c0294fa404b52d0428291f1e8862a4`
- Actions `34408070329`
- job `102655735014`
- Verify: success
- 44 test files / 216 tests / 0 failures
- 170 tracked paths
- 14 required project-memory files
- OKF: 19 concepts / 9 indexes
- build: `Character Forge build 0.0.1 5c343b30`

Promoted branches were not changed:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. D&D Issue #11 remains the accumulated runtime-QA/promotion gate.

## Current Narrative Capability

D&D Guided Narrative remains a front end over ordinary D&D native generation, not a separate character model.

Implemented behavior includes:

- six bounded global questions for Class, Background, Species, starting-equipment preference, and the two D&D Alignment axes;
- explicit `Choose for me` on every Narrative question;
- hard maximum of five presented choices per Narrative step;
- system-owned deterministic replay provenance;
- direct Narrative Build through ordinary Guided/native inputs;
- explicit Narrative -> Guided Mechanical continuation;
- current-choice transfer without rewriting sticky acceptable random pools;
- later Guided Mechanical edits remaining authoritative;
- Fighter-only conditional Fighting Style Narrative branch.

Current versions at parking:

- Narrative mapping version: `5`;
- direct Narrative recipe: `0.4`;
- continuation recipe: `0.4`.

Fighter branch mappings are:

- `control-from-range` -> Archery;
- `hold-the-line` -> Defense;
- `heavy-weapon` -> Great Weapon Fighting;
- `paired-weapons` -> Two-Weapon Fighting.

The branch exists only when the resolved/current Narrative Class is Fighter and initializes the existing Guided Mechanical Fighting Style control without rewriting its sticky acceptable pool.

## Audit Result Preserved For Later

The completed Class-defining-choice audit found no honest universal Class-feature ontology.

Relevant remaining evidence:

- Cleric Divine Order: Protector vs Thaumaturge;
- Druid Primal Order: Warden vs Magician;
- Warlock Eldritch Invocation: five supported options before `Choose for me`;
- prepared spell/cantrip catalogs: generally too broad for direct Narrative presentation;
- Weapon Mastery, skills, Expertise, and similar controls remain detailed mechanical catalogs.

There is limited evidence for a Cleric/Druid conditional discriminator around physical resilience / martial capability versus broader magical capability. That is only a **candidate** for a future slice, not approved work.

If this line is resumed, first verify the exact Protector/Thaumaturge and Warden/Magician mechanics. If shared wording is not fully honest, split them into Class-specific branches rather than inventing a shared abstraction.

Do not resume with Warlock, broad spell recommendation, a generic questionnaire engine, or a universal class-feature/combat-role ontology without new evidence.

## Durable Boundaries

Do not reopen these without concrete new evidence:

- authoritative native system state is mandatory and lossless;
- Guided Narrative and Quick Generate are creation front ends over ordinary native state;
- Narrative steps never exceed five presented choices including `Choose for me`;
- Alignment decomposition remains D&D-specific;
- equipment preference remains D&D-specific;
- Fighter Fighting Style remains Fighter-specific;
- direct current choices and sticky random-acceptable pools are separate concepts;
- shared creator code coordinates interaction only; rules and mappings remain system-owned;
- Parchment remains system-agnostic;
- random-table evaluation remains a separate generation primitive.

## Resume Instructions

Do **not** continue this line merely because it is the latest D&D handoff.

Resume only after an explicit product decision to return to D&D Guided Narrative. On resume, start from the then-current `dev` head, read this parking record and `refs/handoffs/currentHandoff.md`, and revalidate any proposed next slice against the current rules/source state before editing.
