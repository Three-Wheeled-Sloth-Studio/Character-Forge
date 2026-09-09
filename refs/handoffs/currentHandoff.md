---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
---
# Current Handoff

Date: 2026-09-09
Branch: `dev`

## Accepted Baseline

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D, BRP, or random-table work.

D&D 5E 2024 mechanical SRD Level 1 breadth remains automated-green at `55f79a1004c14eef1635e92c602e1fefa18cab15`. Issue #11 remains the separate accumulated owner runtime-QA/promotion gate.

BRP remains bounded to Basic Roleplaying: Universal Game Engine 2023 ORC content with corrections 1.05:

- source ID: `chaosium-brp-uge-orc-1.05`
- native schema: `brp-character/0.1`
- adapter: `0.5.0`
- no Call of Cthulhu-specific protected content

The first BRP creator UI remains automated-green at `b5cb07ab7c8873694e438bcc6e3ab799bfdf3c02`, Actions `34295950302`, job `102292513584`.

Owner runtime/browser QA on 2026-09-09 accepted the BRP creator for continued work with no blocking findings. Do not schedule a dedicated polish cycle for the accepted findings below; fold them into later touched slices.

## Accepted Creator QA Debt

D&D Random ability generation:

- hide the disabled `Roll First` assignment control until rolls exist;
- move verbose per-roll dice history out of the cramped inline result display and into hover/detail text;
- when a roll is reassigned, swap the displaced ability's roll rather than allowing two abilities to reference one roll slot.

Shared creator randomization:

- add a clear `Randomize All` interaction pattern to both systems;
- support field-level randomizers where sensible;
- keep the interaction pattern shared while each system owns legal/random value generation.

BRP creator:

- add name generation when the structured naming seam is ready;
- add randomizers for Age, Gender, Wealth, and similar fields only when source/distribution semantics are explicit.

The BRP left-pane containment finding is resolved. These remaining items are nonblocking UX debt, not a reason to reopen BRP architecture or expand BRP rules breadth.

## Random Table Companion Checkpoints

The system-neutral evaluator remains automated-green:

- core checkpoint: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`
- Actions: `34364243890`
- job: `102508743773`
- focused evaluator tests: 5

The first real system-owned consumer remains automated-green:

- consumer checkpoint: `d4b881b29bd763d9f7fd50e56223b00b37077be2`
- Actions: `34366600372`
- job: `102516809719`
- focused BRP profession-suggestion tests: 4

The second, richer system-owned consumer is now automated-green:

- implementation checkpoint: `54d471faa5a635e46ab9db90f8d05d26ac32944f`
- Actions: `34368120736`
- job: `102522033597`
- Verify conclusion: success
- full suite: 35 test files / 173 tests / 0 failures
- focused BRP Scholar academic-suggestion tests: 5

## What The Second Consumer Proves

BRP now owns `BRP_SCHOLAR_ACADEMIC_SUGGESTION_TABLE`, a source-safe table built only from academic specialty definitions already present in the first-slice BRP catalog:

- Knowledge (Law), including parent skill, specialty identity, label, and base chance;
- Science (Forensics), including parent skill, specialty identity, label, and base chance.

The result is materially richer than the first profession enum-like payload. It retains:

- a BRP skill key;
- nested `BrpAcademicSkillSelection` with Knowledge/Science parent plus specialty ID/label;
- display label;
- source base chance.

The consumer also proves multi-slot suggestion persistence:

- any of the five Scholar academic slots can request a suggestion;
- each retained decision records slot index, structured result, and full random-table provenance;
- multiple slot records coexist independently;
- re-suggesting one slot replaces only that slot's prior suggestion decision;
- manual editing of a Scholar academic row clears that row's suggestion provenance in creator state;
- creator reopen restores only suggestion records whose structured result still matches the authoritative native Scholar slot.

Accepted academic suggestions still flow through the ordinary Scholar creator state and BRP builder/adapter before provenance is attached. `applyBrpScholarAcademicSuggestion()` changes only generation decisions and verifies the already-built authoritative native selection; it never patches or reconstructs native state.

The generic evaluator required no changes. No shared CharacterDocument, semantic contract, BRP native schema, adapter version, dependency, or lockfile changed.

## Current Evidence / Gap

Two concrete BRP consumers now prove both a simple enum-like payload and a nested structured payload, including replay, manual override, multiple independent suggestion slots, and native-state safety.

That is still not evidence for a universal trait/ideal/bond/flaw ontology. The structured payload remains explicitly BRP-owned. Nested/subtable evaluation is also still unneeded: the nested object shape is a result payload, not a nested random table.

The next useful product slice is creator-level randomization orchestration. The UI already has several independent random/suggestion seams, but the user-facing pattern is inconsistent and there is no shared `Randomize All` interaction. This should be solved as orchestration over system-owned random functions, not by moving system rules or demographic distributions into the web shell.

Do not invent random distributions for BRP Age, Gender, or Wealth merely to make `Randomize All` exhaustive. Randomize only fields with an explicit supported randomization seam; leave other fields unchanged until their distributions are deliberately defined.

## Next Slice

Implement the first shared creator randomization orchestration slice on `dev`.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "creator randomization orchestration"`

Before coding:

1. Inventory existing D&D and BRP field-level randomizers/suggestions and distinguish shell interaction from system-owned random semantics.
2. Define a consistent `Randomize All` and field-randomizer interaction pattern in the creator workspace without creating a cross-system rules model.
3. Preserve D&D acceptable-pool/sticky behavior and existing provenance semantics.
4. Reuse BRP profession, Scholar academic, and characteristic-generation seams where they are actually applicable.
5. Do not randomize Age, Gender, Wealth, names, or other fields unless an explicit system-owned distribution/generator already exists or is separately justified.
6. Keep random actions easy to override and replay/provenance boundaries explicit where values enter CharacterDocument generation state.
7. Fold the accepted D&D Random ability UX findings only where the touched code makes that cheap and safe.

Do not reopen the generic random-table evaluator unless this real orchestration exposes a missing generic capability.

## Relevant Files

- `refs/handoffs/next-dev-prompt.md`
- `refs/implementation/fileMap.yaml`
- `refs/planning/roadmap.yaml`
- `refs/product/random-table-companion.md`
- `packages/generator-core/src/randomTable.ts`
- `packages/system-brp/src/professionSuggestion.ts`
- `packages/system-brp/src/scholarAcademicSuggestion.ts`
- `packages/system-brp/src/scholarAcademicSuggestion.test.ts`
- `apps/web/src/brpCreatorPanel.ts`
- `apps/web/src/brpCreatorPanelView.ts`
- `apps/web/src/guidedCreationPanel.ts`
- `apps/web/src/creatorWorkspace.ts`

Load deeper system source/licensing evidence only for randomization semantics actually being changed.

## Do Not Reopen Without New Evidence

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Random-table evaluation is a generation primitive, not a character-state format.
- System datasets and mappings stay system-owned.
- The generic table evaluator must not learn D&D- or BRP-specific semantics.
- Table results feed ordinary generation decisions or structured suggestions; they do not patch native state directly.
- Preserve explicit replay provenance and version boundaries.
- Add nesting only when a concrete consumer requires it.
- A nested result payload is not evidence for nested random-table evaluation.
- BRP profession is not D&D class.
- Keep BRP base chance, professional contribution, personal contribution, and final rating distinct.
- Future BRP powers must not reuse D&D spell architecture.
- Keep generator-core system-neutral and Parchment system-agnostic.
- Do not import Call of Cthulhu-specific protected content.
- D&D Issue #11 remains a separate promotion gate.
- Creator QA findings above are nonblocking debt to fold into later touched work, not a dedicated cleanup cycle.

## Validation

Milestone gate:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
