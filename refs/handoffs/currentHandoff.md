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
- structured naming contract/provider proof: `978e145bb4614cf6d0f4872cea61c9f9ede613bf`, Actions `34372897196`, job `102538304875`.

## D&D Generated Name Provenance Checkpoint

The guided-creator naming-provenance slice is automated-green:

- implementation checkpoint: `1a1eb5de957eabd87b63785ef8dafccafbd47a44`
- Actions: `34374497101`
- job: `102543733892`
- Verify conclusion: success
- full suite: 40 test files / 193 tests / 0 failures
- tracked paths: 161
- OKF: 19 concepts / 9 indexes
- generated agent context: 4,210 characters
- web build identity: `Character Forge build 0.0.1 1a1eb5de`

What changed:

- D&D guided generation recipe is now `0.7`.
- `CharacterDocument.displayName` remains a plain authoritative string.
- D&D native `identity.name` remains the same plain authoritative string.
- Accepted generated-name provider/source/version/seed provenance is retained separately as an `identity.name.suggestion` generation decision.
- The provenance record distinguishes `explicit-randomize` from `blank-fallback`.
- Blank-name fallback now retains its effective name-generation replay seed instead of silently discarding it.
- The historical random-ability-seed fallback is preserved where it already existed; non-random ability paths get a name-specific generated seed.

D&D-owned validation/application seams now exist in `nameGeneration.ts`:

- `matchingDnd5eNameSuggestion()` requires the current name to match, provider/source/version identity to be current, and replay from the retained seed to reproduce the same name.
- `createDnd5eNameSuggestionDecision()` creates the D&D generation-decision form without changing native identity state.
- `applyDnd5eNameSuggestion()` verifies `CharacterDocument.displayName` and the native identity name, then changes generation provenance only. Tests prove the native-state object references are preserved.

## Creator Integration

`apps/web/src/dndGuidedCreatorPanel.ts` is a thin D&D-specific wrapper around the existing guided creator.

- The existing `#creator-name-random` control remains the UI and Randomize All participation seam.
- Pressing it now retains the complete `suggestDnd5eCharacterName()` result in creator-local state rather than only retaining its string.
- The wrapper attaches the suggestion after the canonical D&D character is built, only if the current authoritative name still matches.
- Manual name input clears the creator-local suggestion.
- The shared `creatorWorkspace` remains unaware of provider IDs, naming datasets, culture/language semantics, or name-generation rules.
- Reopen does not reconstruct provider provenance from display text and therefore cannot force an old suggestion back over authoritative retained name state.

This wrapper approach deliberately avoids turning the large existing guided creator into a naming-state owner and follows the same general boundary already proven by BRP suggestion consumers: canonical native state first, suggestion provenance second, no direct native patching.

## Naming Content Boundary

The D&D provider still contains exactly the same six placeholder names and is explicitly identified as Character Forge placeholder data:

- provider ID: `dnd5e:placeholder-display-name`
- provider version: `0.1`
- source: `character-forge.dnd5e.placeholder-names@1`

It is not WotC SRD naming data and must not be expanded as if it were a D&D culture/species/language corpus.

BRP still intentionally has no name provider or corpus. The generic mechanism and one persistence pattern are now proven; the unresolved question is ownership/content, not the random/provenance machinery.

## Remaining QA Evidence

Owner browser QA of shared `Randomize All` remains useful but is not a dedicated cycle. Automated evidence proves bounded sticky-pool selection and dynamic control orchestration. D&D name randomization continues to participate through the same control convention.

No CharacterDocument schema, D&D native schema, D&D adapter, BRP schema/adapter, dependency, lockfile, or random-table contract changed in this slice.

## Next Slice

Take a discovery-first BRP naming provider/content-boundary slice.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "BRP naming provider content boundary"`

Priorities:

1. Determine whether the BRP UGE source itself provides legitimate naming content. Do not assume that it does.
2. If BRP rules do not own names, decide whether the provider should instead be setting/campaign-owned or live in a future shared content/provider layer.
3. Treat BRP's current Human profile as species/creature identity only; do not infer culture, nationality, ethnicity, language, or naming convention from it.
4. Use the existing `name-suggestion/0.1` contract as the default mechanism. Expand it only if a concrete second-provider requirement proves a gap.
5. Preserve source/license provenance for any candidate dataset.
6. Do not borrow the six D&D placeholder names, add a pseudo-BRP culture corpus, or import Call of Cthulhu-specific protected content.
7. If no defensible BRP-specific name source exists, document that name generation requires a setting/caller provider rather than fabricating one.
8. Do not turn this discovery into a broad culture/language ontology project.

## Relevant Files

- `refs/product/structured-naming.md`
- `refs/handoffs/next-dev-prompt.md`
- `refs/implementation/fileMap.yaml`
- `refs/planning/roadmap.yaml`
- `packages/generator-core/src/nameSuggestion.ts`
- `packages/system-dnd5e/src/nameGeneration.ts`
- `packages/system-dnd5e/src/guidedGenerate.ts`
- `packages/system-dnd5e/src/guidedNameProvenance.test.ts`
- `apps/web/src/dndGuidedCreatorPanel.ts`
- `packages/system-brp/src`
- `refs/integration/brp-uge-orc.md`

## Do Not Reopen Without New Evidence

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Name suggestion is a generation primitive, not a universal identity object or character-state format.
- Direct user-entered names are authoritative over generated suggestions.
- Do not equate species with culture, language, nationality, ethnicity, or naming convention.
- Do not promote universal name-part fields until multiple real providers require the same semantics.
- Shared creator orchestration coordinates interactions only; system rules, distributions, and content stay system-owned.
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
