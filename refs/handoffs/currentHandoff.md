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
- add randomizers for Age, Gender, Wealth, and similar fields when creator randomization is next touched.

The BRP left-pane containment finding is resolved in the first random-table consumer slice. These remaining items are nonblocking UX debt, not a reason to reopen BRP architecture or expand BRP rules breadth.

## Random Table Companion Checkpoints

The system-neutral evaluator remains automated-green:

- core checkpoint: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`
- Actions: `34364243890`
- job: `102508743773`
- focused evaluator tests: 5

The first real system-owned consumer is now automated-green:

- consumer checkpoint: `d4b881b29bd763d9f7fd50e56223b00b37077be2`
- Actions: `34366600372`
- job: `102516809719`
- Verify conclusion: success
- full suite: 34 test files / 168 tests / 0 failures
- focused BRP profession-suggestion tests: 4

What the first consumer proves:

- BRP owns `BRP_PROFESSION_SUGGESTION_TABLE`, its typed result, and mapping semantics;
- the table is intentionally tiny and source-safe: Detective and Scholar, the two already-supported BRP professions;
- the table carries BRP source/version provenance and calls the system-neutral evaluator rather than duplicating random logic;
- deterministic replay retains evaluator/table/source versions, seed, draw index, selected entry identity, selected weight, total weight, and selected profession;
- the creator exposes a `Suggest` action beside Profession and allows ordinary manual override;
- accepting the suggestion still changes profession through the existing BRP creator state and normal native builder/adapter path;
- accepted suggestion provenance is retained as the ordinary generation decision `identity.profession-suggestion`;
- the provenance decorator does not edit or reconstruct BRP native state;
- reopening a generated character restores retained suggestion provenance from the generation record when it still matches the authoritative native profession;
- touched BRP creator CSS now constrains controls, inputs, selects, fieldsets, and redistribution rows to the left generation column.

No shared CharacterDocument, semantic contract, BRP native schema, adapter version, dependency, or lockfile change was required.

## Current Evidence / Gap

The generic evaluator boundary and one end-to-end system-owned consumer are now proven. The first consumer is deliberately enum-like, so it does not yet justify a universal structured suggestion vocabulary for traits, ideals, bonds, flaws, equipment flavor, or similar richer payloads.

The next useful evidence should come from one richer source-safe consumer that has more structure than a single profession ID while still avoiding a large content-ingestion project. If no such licensed/repository-owned content is already available, document the smallest required content slice instead of inventing public rules text.

Subtable references remain a known likely requirement, but nesting is still deferred until an actual table requires it. The same applies to roll-range authoring, uniqueness sampling, conditional graphs, and user-authored table persistence.

## Next Slice

Identify and implement the second narrow system-owned random-table consumer, prioritizing a richer structured payload.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "second random table consumer"`

Before coding:

1. Inspect existing source-safe D&D and BRP content for a small structured suggestion such as flavor, equipment/trinket, or another already-owned choice.
2. Keep the dataset and payload type in the owning system package.
3. Keep `generator-core` unchanged unless the selected real table exposes a missing generic capability.
4. Route accepted results through ordinary system generation/build/adapter seams; never patch native state from the generic evaluator.
5. Preserve replay provenance and easy manual override.
6. Do not introduce a universal trait/ideal/bond/flaw schema from one system's payload.

Do not use the temporary D&D flat name list as the next consumer. Structured naming remains a separate discovery watch.

## Relevant Files

- `refs/handoffs/next-dev-prompt.md`
- `refs/implementation/fileMap.yaml`
- `refs/planning/roadmap.yaml`
- `refs/product/random-table-companion.md`
- `packages/generator-core/src/randomTable.ts`
- `packages/system-brp/src/professionSuggestion.ts`
- `packages/system-brp/src/professionSuggestion.test.ts`
- `apps/web/src/brpCreatorPanel.ts`
- `apps/web/src/brpCreatorPanelView.ts`
- `apps/web/src/brpCreatorStyles.ts`
- `packages/system-dnd5e/src/`

Load deeper system source/licensing evidence only for the concrete second consumer being selected.

## Do Not Reopen Without New Evidence

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Random-table evaluation is a generation primitive, not a character-state format.
- System datasets and mappings stay system-owned.
- The generic table evaluator must not learn D&D- or BRP-specific semantics.
- Table results feed ordinary generation decisions or structured suggestions; they do not patch native state directly.
- Preserve explicit replay provenance and version boundaries.
- Add nesting only when a concrete consumer requires it.
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
