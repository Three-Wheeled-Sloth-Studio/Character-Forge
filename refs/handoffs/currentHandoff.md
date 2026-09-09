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
- D&D generated-name provenance: `1a1eb5de957eabd87b63785ef8dafccafbd47a44`, Actions `34374497101`, job `102543733892`.

## BRP Naming Provider/Content Boundary Discovery

The naming question is now resolved at the ownership level. This slice intentionally did not add runtime code or fabricate a BRP name corpus.

Authoritative source reviewed:

- Basic Roleplaying - Universal Game Engine - ORC Content Document;
- Chaosium BRP ORC License/notice page;
- existing Character Forge BRP 1.05 source boundary.

Positive source evidence:

1. The BRP terminology section says character names and backgrounds are determined by the player with gamemaster assistance and/or approval.
2. Character Creation, Step One says the character name should be appropriate to the setting and game being played and can be deferred if no idea suggests itself.
3. The optional `Culture and Characters` section says the gamemaster may develop cultural backgrounds appropriate to an original or adapted setting. Language(s) is one possible cultural-background field.

Explicit non-findings:

- no BRP generated-name table;
- no BRP-owned name corpus;
- no generic BRP culture-to-name mapping;
- no source basis for treating the current `Human` profile as a culture, nationality, ethnicity, language, or naming convention.

The durable source finding is recorded in `refs/integration/brp-uge-orc.md` and the product boundary in `refs/product/structured-naming.md`.

## Ownership Decision

BRP generated-name content is setting/campaign/content-package owned, not `packages/system-brp` owned.

A future BRP creator may consume a concrete naming provider supplied by its caller/host when a setting or campaign has one. That provider owns any setting/culture/language/naming-convention context it needs. Those concepts remain opaque provider context unless multiple real consumers justify promoting a shared schema.

The absence of a naming provider is valid. `Randomize All` must not invent a name, pseudo-culture, or distribution merely to be exhaustive.

`name-suggestion/0.1` already expresses the required mechanism:

- provider ID/version;
- source ID/version;
- replay seed;
- opaque typed context;
- provider result containing a display name.

No shared naming-contract change is justified. No generic content-provider framework is justified yet. The existing caller-supplied `NameSuggestionProvider<TContext, TResult>` is enough until a real Parchment/world/setting consumer demonstrates another requirement.

## License/Provenance Finding

Chaosium makes the applicable BRP UGE text available under the ORC license subject to its product-identity exclusions. That does not automatically license a naming dataset from another setting, source, or real-world corpus.

Any future BRP naming provider must therefore retain its own source/version and deliberate redistribution/license basis. Provider provenance must not claim that setting names came from `chaosium-brp-uge-orc-1.05` when they did not.

Call of Cthulhu, RuneQuest, Pendragon, Rivers of London, and other branded-setting content remain excluded unless separately licensed or independently open for the intended use.

## What Changed In Repo

Documentation/project truth only:

- `refs/integration/brp-uge-orc.md` now records the source evidence, non-findings, ownership decision, and license consequence.
- `refs/product/structured-naming.md` now records BRP as a setting/campaign/provider-owned naming consumer and closes the second-provider discovery question.
- `refs/product/generation-methods.md` now states that naming waits for a real setting consumer and no longer blocks unrelated creator work.
- `refs/implementation/fileMap.yaml` now routes BRP naming inspection to the source/decision docs and makes Quick Generate consolidation the next active creator task.

No CharacterDocument schema, D&D native schema, BRP native schema, adapter, generator-core contract, dependency, lockfile, or runtime creator code changed in this discovery slice.

## Naming Work Status

Naming architecture is not blocked technically. It is waiting on a real content owner.

When a concrete Parchment/world/setting naming source exists, the first BRP naming proof should:

- inject the concrete provider at the host/caller boundary;
- preserve direct user-entry authority;
- retain provider/source/version/seed provenance;
- leave authoritative display/native names as ordinary strings;
- keep `system-brp` free of invented naming datasets.

Do not create that seam speculatively before a real provider exists.

## Remaining QA Evidence

Owner browser QA of shared `Randomize All` remains useful but is not a dedicated cycle. Fold nonblocking creator polish into related touched slices.

D&D accumulated runtime QA remains a separate promotion gate under Issue #11.

## Next Slice

Return to a concrete creator product gap: consolidate existing D&D Quick Generate as a top-level creator mode.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "D&D Quick Generate top-level creator mode"`

Priorities:

1. Treat Quick Generate as a creation mode, not a fifth ability-generation method.
2. Reuse the existing automated-green `quickGenerateDnd5eFirstSlice()` API and ordinary CharacterDocument/native validation path rather than reimplementing quick mechanics in browser code.
3. Keep the existing Guided creator and its Standard Array / Point Cost / Random / Manual ability dropdown intact.
4. Add a compact top-level creation-mode selector in the established left-side creator workspace. Guided Mechanical should remain the current detailed form path; Quick should expose only controls it legitimately needs.
5. Preserve the existing owner-accepted Quick Generate host/persistence/reopen behavior and do not reopen its native template mechanics without evidence.
6. Keep D&D as the default rules system and do not make BRP pretend to support a Quick mode unless a BRP quick-generation contract exists.
7. Preserve shared Randomize All semantics. Decide deliberately whether Randomize All is visible/applicable in Quick mode rather than accidentally invoking hidden Guided controls.
8. Fold only directly adjacent nonblocking creator polish into this slice; do not turn it into a general UI cleanup cycle.
9. Keep Quick generation provenance, seed, and native validation visible in the ordinary review surface.
10. Do not promote `qa` or `main`.

## Relevant Files

- `refs/product/creator-workspace.md`
- `refs/product/generation-methods.md`
- `refs/handoffs/next-dev-prompt.md`
- `refs/implementation/fileMap.yaml`
- `packages/system-dnd5e/src/quickGenerate.ts`
- `packages/system-dnd5e/src/quickGenerate.test.ts`
- `packages/system-dnd5e/src/index.ts`
- `apps/web/src/creatorWorkspace.ts`
- `apps/web/src/guidedCreationPanel.ts`
- `apps/web/src/dndGuidedCreatorPanel.ts`
- `apps/web/src/main.ts`
- `apps/web/src/characterForgeHostBridge.ts`
- `apps/web/src/characterForgeHostBridge.test.ts`

## Do Not Reopen Without New Evidence

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Name suggestion is a generation primitive, not a universal identity object or character-state format.
- BRP naming content is setting/campaign/content-package owned unless a future source explicitly says otherwise.
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
