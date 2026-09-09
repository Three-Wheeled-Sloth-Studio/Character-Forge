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
- D&D Random-ability UX: `e66003b9b6334218fb689d2da32ae5bf133251af`, Actions `34371712699`, job `102534309918`.

## Structured Naming Contract Checkpoint

The first naming discovery/contract slice is automated-green:

- implementation checkpoint: `978e145bb4614cf6d0f4872cea61c9f9ede613bf`
- Actions: `34372897196`
- job: `102538304875`
- Verify conclusion: success
- full suite: 39 test files / 188 tests / 0 failures
- tracked paths: 158
- generated agent context: 3,644 characters
- web build identity: `Character Forge build 0.0.1 978e145b`

What changed:

- `refs/product/structured-naming.md` now records the durable naming boundary.
- `packages/generator-core/src/nameSuggestion.ts` implements the minimal `name-suggestion/0.1` contract.
- Shared naming requires only provider ID/version, optional source refs, an effective seed, opaque provider-owned typed context, and a provider result containing a non-empty `displayName`.
- The core returns the provider result plus provenance. It does not patch CharacterDocument/native state, decide manual-vs-generated authority, or define culture/language/species mappings.
- Context is deliberately generic and provider-owned. The shared contract does not define species, culture, language, nationality, ethnicity, gender, given/family-name parts, transliteration, or similar identity ontology.
- Provider results may become richer without changing the shared minimum because `displayName` is the only required result field.
- Same provider implementation/version, caller context, and retained seed replay the same result.
- Provider/source/version/seed provenance is explicit. Context that matters to replay remains an ordinary caller/system decision rather than being copied blindly into generic name provenance.

## D&D Adapter Proof

D&D now provides the first concrete provider without expanding its temporary content:

- provider: `DND5E_PLACEHOLDER_NAME_PROVIDER`
- provider ID: `dnd5e:placeholder-display-name`
- provider version: `0.1`
- placeholder source ID: `character-forge.dnd5e.placeholder-names`
- placeholder source version: `1`

The existing six names remain exactly the existing six placeholder names. They are explicitly Character Forge placeholder content, not WotC SRD naming data and not a culture/species/language corpus.

`suggestDnd5eCharacterName()` exposes the new provider/provenance seam. `resolveDnd5eCharacterName()` remains the compatibility API:

- explicit user entry still wins;
- explicit-seed generated selection remains behaviorally compatible;
- no corpus expansion occurred;
- Quick Generate still uses the existing `pickDnd5eGeneratedName()` inside its established quick-generation random stream, avoiding an unrequested random-consumption-order change.

No CharacterDocument, native schema, adapter, D&D rule source, dependency, lockfile, or creator UI changed in this discovery slice.

## Remaining Naming Gap

The contract exists, but D&D guided creator generation still retains only the existing `identity.name` answer/rationale. A button-generated suggestion's provider/source/seed provenance is not yet carried through the CharacterDocument generation record, and blank-name fallback may still generate an internal seed that is not retained as name-specific provenance.

BRP still intentionally has no name provider or corpus. The mechanism boundary is now available, but content/source selection remains a separate decision. Do not borrow the D&D placeholder list or infer naming culture from the BRP Human profile.

## Randomize All QA Evidence

Owner browser QA of shared `Randomize All` remains useful but is not a dedicated cycle. Automated evidence still proves bounded sticky-pool selection and dynamic control orchestration. D&D's existing name button already matches the shared D&D randomizer convention, so naming can participate without teaching `creatorWorkspace` naming rules.

## Next Slice

Carry D&D generated-name suggestion provenance through the ordinary guided creator generation path, while preserving manual override and current native/display-name behavior.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "D&D generated name provenance integration"`

Priorities:

1. Let the D&D creator retain the full `suggestDnd5eCharacterName()` result when the user presses the name randomizer.
2. Pass suggestion provenance through the existing guided generation boundary without changing `character-document/0.1` or native D&D identity shape.
3. Record provider/source/version/seed provenance in generation decisions only when the retained current name actually came from that suggestion.
4. Manual name edits must clear/supersede stale suggestion provenance.
5. Reopen/persistence must not force an old generated suggestion over the authoritative retained display/native name.
6. Blank-name fallback should retain enough name-specific provenance for replay, or be deliberately distinguished from explicit randomize-name action.
7. Preserve the existing six-name placeholder corpus and exact explicit-seed selection behavior.
8. Do not add BRP names or a large D&D corpus in this slice.
9. Keep shared creator orchestration unaware of naming rules; D&D's existing randomizer control should remain the participation seam.

## Relevant Files

- `refs/product/structured-naming.md`
- `refs/handoffs/next-dev-prompt.md`
- `refs/implementation/fileMap.yaml`
- `refs/planning/roadmap.yaml`
- `packages/generator-core/src/nameSuggestion.ts`
- `packages/generator-core/src/nameSuggestion.test.ts`
- `packages/system-dnd5e/src/nameGeneration.ts`
- `packages/system-dnd5e/src/nameGeneration.test.ts`
- `packages/system-dnd5e/src/guidedGenerate.ts`
- `packages/system-dnd5e/src/guidedGenerate.test.ts`
- `apps/web/src/guidedCreationPanel.ts`

Load BRP source only if a concrete content/provider decision is being evaluated; no BRP implementation is required for the next slice.

## Do Not Reopen Without New Evidence

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Shared creator orchestration coordinates interactions only; system rules, distributions, and content stay system-owned.
- Name suggestion is a generation primitive, not a universal identity object or character-state format.
- Direct user-entered names are authoritative over generated suggestions.
- Do not equate species with culture, language, nationality, ethnicity, or naming convention.
- Do not promote universal name-part fields until multiple real providers require the same semantics.
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
