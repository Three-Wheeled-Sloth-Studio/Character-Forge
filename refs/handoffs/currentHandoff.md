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

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D, BRP, random-table, creator-orchestration, or naming work.

D&D 5E 2024 mechanical SRD Level 1 breadth remains automated-green at `55f79a1004c14eef1635e92c602e1fefa18cab15`. Issue #11 remains the separate accumulated owner runtime-QA/promotion gate.

BRP remains bounded to Basic Roleplaying: Universal Game Engine 2023 ORC content with corrections 1.05:

- source ID: `chaosium-brp-uge-orc-1.05`
- native schema: `brp-character/0.1`
- adapter: `0.5.0`
- no Call of Cthulhu-specific protected content

Existing green checkpoints remain valid:

- random-table core: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`, Actions `34364243890`, job `102508743773`;
- BRP Profession consumer: `d4b881b29bd763d9f7fd50e56223b00b37077be2`, Actions `34366600372`, job `102516809719`;
- BRP Scholar academic consumer: `54d471faa5a635e46ab9db90f8d05d26ac32944f`, Actions `34368120736`, job `102522033597`;
- shared creator randomization: `1f6ed5aee24f514fbc4fd9de39f9380e8df3719b`, Actions `34369619403`, job `102527165230`;
- D&D Random-ability UX: `e66003b9b6334218fb689d2da32ae5bf133251af`, Actions `34371712699`, job `102534309918`;
- structured naming contract/provider proof: `978e145bb4614cf6d0f4872cea61c9f9ede613bf`, Actions `34372897196`, job `102538304875`;
- D&D generated-name provenance: `1a1eb5de957eabd87b63785ef8dafccafbd47a44`, Actions `34374497101`, job `102543733892`;
- BRP naming ownership discovery docs head: `515ca38960169f3476fcfdd9ffcc9f0195f36d5b`, Actions `34379945403`, job `102562036634`.

## D&D Quick Generate Top-Level Creator Mode Checkpoint

The creator-mode consolidation slice is automated-green:

- implementation checkpoint: `418db810828c6a44d7b24b88ef69a3b6ffdffc40`
- Actions: `34382893940`
- job: `102571852183`
- Verify conclusion: success
- full suite: 41 test files / 197 tests / 0 failures
- tracked paths: 164
- OKF: 19 concepts / 9 indexes
- generated agent context: 3,809 characters
- web build identity: `Character Forge build 0.0.1 418db810`

What changed:

- `apps/web/src/dndCreatorPanel.ts` now owns D&D top-level creation-mode selection.
- D&D exposes exactly two current creation modes: `Guided Mechanical` and `Quick Generate`.
- `Guided Mechanical` remains the default and keeps the existing detailed creator intact.
- Standard Array, Point Cost, Random, and Manual remain ability-generation methods inside Guided Mechanical. Quick was not added to that dropdown.
- Both D&D mode surfaces stay mounted while toggling, so switching modes does not discard the current Guided form or Quick name/seed inputs.
- `apps/web/src/dndQuickCreatorPanel.ts` exposes only optional name and optional seed, matching the existing `quickGenerateDnd5eFirstSlice()` API.
- Quick browser code does not reproduce the Human/Soldier/Fighter template or any randomization/rules logic. It delegates directly to the system package.
- Quick output flows through the same `onCharacter` callback used by Guided creation, preserving the existing review, host-message, save, and Parchment persistence boundary.
- Blank name/seed retain the system API's generated behavior. Explicit seed retains the existing deterministic-mechanics/new-opaque-ID behavior already covered by system tests.
- No Quick Generate native mechanics, recipe, template, adapter, CharacterDocument schema, dependency, or lockfile changed.

## Randomize All Decision

`Randomize All` remains available for D&D Guided Mechanical and BRP under their established semantics.

While D&D Quick mode is active:

- the workspace hides and disables `Randomize All`;
- the click path is also guarded in code;
- hidden Guided controls therefore cannot be triggered accidentally;
- Quick owns its randomization through the explicit `Generate character` action.

No BRP Quick mode was added or implied.

## Product Boundary Preserved

The creator hierarchy is now explicit:

1. rules system;
2. top-level creation mode;
3. method-specific controls inside that mode.

This keeps Quick and future Guided Narrative at the correct level without destabilizing the existing Guided Mechanical form.

The existing left-controls/right-review workspace remains unchanged. Generation seed and provenance continue to appear in the ordinary review/inspector surface.

## BRP Naming Decision Remains Closed

Do not reopen BRP naming architecture in the next slice.

The authoritative BRP source review established that names are setting/game dependent and optional culture is GM/setting defined. There is no BRP generated-name corpus or culture-to-name mapping. Future BRP naming data is setting/campaign/content-package owned and should be caller/provider supplied through the existing `name-suggestion/0.1` seam.

## Remaining QA Evidence

Owner browser QA of the accumulated creator workspace remains useful, including mode switching and Quick submission, but remains a nonblocking accumulated QA gate rather than a dedicated implementation cycle unless a concrete blocker appears.

D&D accumulated runtime QA remains separately tracked by Issue #11 before promotion.

## Next Slice

Begin the first D&D Guided Narrative vertical slice.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "D&D Guided Narrative first vertical slice"`

Priorities:

1. Treat Guided Narrative as a third top-level D&D creation mode, not an ability-generation method.
2. Start with a deliberately small set of narrative/preference questions that can map to already-supported D&D mechanical choices.
3. Keep narrative mapping data system-owned and inspectable. Browser code should render questions and orchestrate selection, not own hidden D&D rules logic.
4. Record the important narrative answers and resulting mapped choices in generation provenance.
5. Route final results through existing guided/native generation APIs rather than creating a narrative-specific character-state model.
6. Prefer mapping first to already-supported Class / Background / Species choices. Do not add new SRD mechanics merely to broaden narrative coverage.
7. Make mapped choices inspectable and overridable before or during final generation. Narrative guidance should suggest/direct ordinary choices, not trap the user in an opaque result.
8. Keep random/weighted behavior deterministic if randomness is introduced and retain its seed/provenance.
9. Do not promote a universal personality, trait, ideal, bond, flaw, or psychological ontology from the first D&D questionnaire.
10. Do not combine this slice with BRP narrative generation, BRP naming, a large random-table expansion, or general creator cleanup.
11. Preserve Quick and Guided Mechanical behavior exactly unless a concrete integration bug requires a narrow fix.
12. Do not promote `qa` or `main`.

A good first proof is a small D&D-owned narrative mapping contract plus the minimum creator integration needed to produce ordinary Class / Background / Species selections with retained answer/mapping provenance. Keep the first question set small enough that every mapped output is already legal in the current D&D creator.

## Relevant Files

- `refs/product/creator-workspace.md`
- `refs/product/generation-methods.md`
- `refs/handoffs/next-dev-prompt.md`
- `refs/implementation/fileMap.yaml`
- `packages/system-dnd5e/src/guidedGenerate.ts`
- `packages/system-dnd5e/src/index.ts`
- `apps/web/src/dndCreatorPanel.ts`
- `apps/web/src/guidedCreationPanel.ts`
- `apps/web/src/dndQuickCreatorPanel.ts`
- `apps/web/src/creatorWorkspace.ts`

## Do Not Reopen Without New Evidence

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Quick Generate and Guided Narrative are top-level creation front ends, not ability-generation methods.
- Shared creator code coordinates interactions only; system rules, mappings, distributions, and content stay system-owned.
- Name suggestion is a generation primitive, not a universal identity object or character-state format.
- BRP naming content is setting/campaign/content-package owned unless a future source explicitly says otherwise.
- Do not equate species with culture, language, nationality, ethnicity, or naming convention.
- Do not promote universal trait/ideal/bond/flaw or personality schemas from one D&D narrative implementation.
- Random-table evaluation remains a separate generation primitive.
- Preserve explicit replay provenance and version boundaries.
- Do not invent distributions merely to make `Randomize All` exhaustive.
- BRP Profession is not D&D class.
- Keep BRP base chance, professional contribution, personal contribution, and final rating distinct.
- Future BRP powers must not reuse D&D spell architecture.
- Parchment remains system-agnostic.
- Do not import Call of Cthulhu-specific protected content.
- D&D Issue #11 remains a separate promotion gate.

## Validation

Milestone gate:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
