---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
---
# Current Handoff

Date: 2026-09-08
Branch: `dev`

## Accepted Baseline

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D or BRP work.

D&D mechanical SRD Level 1 breadth remains automated-green at code checkpoint `55f79a1004c14eef1635e92c602e1fefa18cab15`. Issue #11 remains open for accumulated owner runtime QA and exact-SHA promotion.

BRP named-language backend remains automated-green at code checkpoint `1ce3387491ccf859f56d7a0e92217c7737a56bf0`:

- native schema: `brp-character/0.1`
- adapter: `0.5.0`
- rules source: `chaosium-brp-uge-orc-1.05`
- 30 test files / 152 tests / 0 failures
- 35 BRP tests
- web build green

## What Landed

The BRP backend now supports one shared native pipeline across:

- explicit and deterministic standard-rolled characteristics;
- Normal and Heroic power levels;
- Detective and Scholar professions;
- bounded and open profession choice grammars;
- open Knowledge/Science specialties;
- named language identity with separate subject identity and Own/Other source role;
- character-specific Heroic age causality.

No shared CharacterDocument or semantic-schema change has been required.

Repository guidance is aligned to the current Agent Academy bounded re-entry model:

- routine coding-agent continuation begins with `refs/tools/generate_agent_context.py`;
- `refs/implementation/fileMap.yaml` supplies focused source/guidance hints;
- context loading is progressive and diff-first rather than broad rereading after resets;
- generated `.agent-context.md` is disposable scratch state;
- the active handoff is delta-oriented;
- a Git-index case-collision guard is part of ordinary validation.

Automated-green Agent Academy alignment checkpoint:

- code checkpoint: `1ff407a714b2730308e3d7a9493258f8fc168376`
- Actions: `34293471021`
- job: `102284877369`
- tracked-path guard: green on 137 tracked paths, including synthetic collision/non-collision self-test
- required project-memory/infrastructure files: 14
- OKF: 17 concepts / 9 indexes
- bounded re-entry packet: 3,395 characters against an 8,000-character routine ceiling
- strict TypeScript: green
- 30 test files / 152 tests / 0 failures
- web build: green
- build identity: `Character Forge build 0.0.1 1ff407a7`

No package dependency or lockfile change was required.

## Current Gap

BRP has no creator UI yet. The backend is now broad enough to expose without pretending unsupported BRP features exist.

The D&D owner runtime-QA gate is still separate and open.

## Next Slice

Implement the first narrow BRP creator UI in the existing Character Forge creator workspace.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "BRP creator UI"`

Then use `refs/implementation/fileMap.yaml` and `refs/handoffs/next-dev-prompt.md` to load only the source and guidance needed for the concrete task.

The UI must preserve:

- generation controls left, character review/details right;
- universal system/name controls at the top;
- one dynamic generation-method control surface;
- BRP-owned rules calculations and validation;
- lossless CharacterDocument/native-state persistence and reopen;
- D&D creator behavior and sticky preferences;
- current BRP scope only, without EDU, Sanity, Fatigue, powers, non-human rules, age-50+ rules, category bonuses, or broad profession ingestion.

## Relevant Files

- `refs/handoffs/next-dev-prompt.md`
- `refs/implementation/fileMap.yaml`
- `refs/integration/brp-uge-orc.md`
- `packages/system-brp/src/`
- `apps/web/src/`
- `packages/character-model/src/`

Load deeper architecture and evidence references only when a system boundary, semantic claim, or source-fidelity question requires them.

## Do Not Reopen Without New Evidence

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- BRP profession is not D&D class.
- Keep BRP rules/profile/age/language causality BRP-owned.
- Keep generator-core system-neutral.
- Parchment remains system-agnostic.
- Do not import Call of Cthulhu-specific protected content into the BRP adapter.
- Do not freeze universal profession, specialty, language, or contribution schemas from D&D + BRP alone.
- Random-table companion remains `ready_for_discovery`.
- D&D runtime QA remains its own promotion gate.

## Validation

Milestone gate:

`npm run verify`

The gate includes tracked-path case-collision validation, durable refs/OKF validation, bounded agent-context validation, strict TypeScript, unit tests, and the web build.
