---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the completed BRP naming provider/content-boundary discovery.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Do not reconstruct the full repository history.

Start with:

`python refs/tools/generate_agent_context.py --focus "D&D Quick Generate top-level creator mode"`

Treat that packet as derived orientation only. Then use `refs/implementation/fileMap.yaml`, this handoff, `refs/handoffs/currentHandoff.md`, `refs/product/creator-workspace.md`, `refs/product/generation-methods.md`, and targeted source reads.

Prefer diff-first continuation and conserve coding-agent context deliberately.

## Accepted Baseline

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not implicitly promote accumulated D&D, BRP, random-table, creator, or naming work. Preserve exact-SHA `dev -> qa -> main` promotion.

Important automated-green checkpoints remain:

- D&D mechanical SRD Level 1: `55f79a1004c14eef1635e92c602e1fefa18cab15`;
- BRP first creator UI: `b5cb07ab7c8873694e438bcc6e3ab799bfdf3c02`;
- random-table core: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`;
- BRP Profession consumer: `d4b881b29bd763d9f7fd50e56223b00b37077be2`;
- BRP Scholar academic consumer: `54d471faa5a635e46ab9db90f8d05d26ac32944f`;
- shared creator randomization: `1f6ed5aee24f514fbc4fd9de39f9380e8df3719b`;
- D&D Random-ability UX: `e66003b9b6334218fb689d2da32ae5bf133251af`;
- structured naming provider proof: `978e145bb4614cf6d0f4872cea61c9f9ede613bf`;
- D&D generated-name provenance: `1a1eb5de957eabd87b63785ef8dafccafbd47a44`.

D&D Issue #11 remains the separate accumulated runtime-QA/promotion gate.

## Closed BRP Naming Discovery

Do not reopen BRP naming architecture in this slice.

The BRP ORC source review established:

- BRP tells players to choose names appropriate to the setting/game;
- optional cultural backgrounds are setting/GM-defined;
- the source supplies no generated-name table, BRP name corpus, or culture-to-name mapping;
- the current BRP `Human` profile is not naming-culture context.

Ownership decision:

- BRP naming data is setting/campaign/content-package owned, not `system-brp` owned;
- a future BRP name randomizer should consume a concrete provider supplied by the host/caller;
- the existing `name-suggestion/0.1` contract is sufficient;
- no generic content-provider framework is justified until a real consumer demonstrates a need;
- no pseudo-BRP fallback corpus should be invented for Randomize All.

See `refs/integration/brp-uge-orc.md` and `refs/product/structured-naming.md` for source/license detail.

## Immediate Slice: D&D Quick Generate As A Top-Level Creator Mode

Quick Generate already exists as an automated-tested system API. The missing product step is to place it correctly in the consolidated creator workspace.

Required behavior:

1. Quick Generate is a top-level creation mode, not another option inside the Standard Array / Point Cost / Random / Manual ability-generation dropdown.
2. Guided Mechanical remains the existing detailed D&D creator path and remains the default mode unless existing product evidence strongly requires otherwise.
3. Add a compact creation-mode control at the top of the D&D creator experience, consistent with the established left-controls/right-review workspace.
4. Quick mode must call the existing `quickGenerateDnd5eFirstSlice()` system API rather than duplicating template, seed, ability, background, class, species, or naming rules in browser code.
5. Expose only inputs the current Quick API legitimately supports, currently optional name and seed unless source/code review proves another already-supported option.
6. A blank seed should continue to use the existing generated-seed behavior. An explicit seed should remain replay-deterministic for mechanics while opaque character/native IDs remain newly generated as currently tested.
7. Generated character output must flow through the ordinary `onCharacter`/review/save boundary used by Guided creation. Do not create a parallel result or persistence model.
8. Keep Quick generation method/mode/recipe/seed decisions visible through existing CharacterDocument provenance and review surfaces.
9. Preserve the existing owner-accepted Quick Generate host/persistence/reopen seam. Do not alter its Human/Soldier/Fighter first-slice template mechanics as part of UI consolidation unless a concrete bug requires it.
10. Do not add a BRP Quick mode. BRP has no equivalent quick-generation contract yet.
11. Shared `Randomize All` must not accidentally target hidden Guided controls while Quick mode is active. Either disable/hide it in Quick mode or define an explicit Quick-mode behavior using the existing Quick action; choose the smaller behavior consistent with current UX.
12. Fold only directly adjacent nonblocking creator polish into touched areas. Do not turn this into a general cleanup cycle.

## Product/UI Shape

Use `refs/product/creator-workspace.md` as the UI contract:

- generation controls left;
- current character review right;
- compact progressive disclosure;
- no full-width duplicate Quick page;
- no fifth ability-generation method;
- easy to do/easy to undo;
- browser code orchestrates existing system APIs rather than owning D&D rules.

A reasonable first shape is a D&D creation-mode selector such as `Guided Mechanical | Quick Generate`, with the existing Guided panel mounted unchanged under Guided mode and a small Quick control block under Quick mode. Keep the exact control label/style consistent with current UI patterns rather than inventing a new shell.

## Relevant Files

Read only what the slice needs, starting with:

- `refs/product/creator-workspace.md`
- `refs/product/generation-methods.md`
- `refs/handoffs/currentHandoff.md`
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

Load BRP source only if a shared-workspace regression requires it. Do not broaden into BRP generation work.

## Explicitly Deferred

Do not add without concrete evidence:

- changes to Quick Generate's Human/Soldier/Fighter first-slice mechanics;
- broad Quick template catalogs;
- BRP Quick Generate;
- Guided Narrative in the same slice;
- BRP naming content/provider implementation without a real setting source;
- a generic content-provider framework;
- a large D&D or BRP name corpus;
- random distributions for BRP Age, Gender, Wealth, or identity fields;
- universal culture/language/ethnicity ontology;
- universal trait/ideal/bond/flaw ontology;
- user-authored naming/table persistence UI.

## Architecture Guardrails

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- `character-document/0.1` remains the shared contract unless concrete cross-system evidence requires change.
- Quick Generate is a creation front end over ordinary system-native generation, not a separate character-state format.
- Ability-generation method and top-level creation mode are distinct concepts.
- Shared creator code coordinates interactions only; system rules, distributions, and content datasets stay system-owned.
- Direct user-entered names remain authoritative over generated suggestions.
- Preserve provider/source/version/seed provenance boundaries.
- Parchment remains system-agnostic.
- Preserve exact-SHA promotion provenance.
- D&D Issue #11 remains a separate runtime-QA/promotion gate.

## Before Stopping

Run:

`npm run verify`

Do not claim green unless the exact committed SHA passes GitHub Actions.

Update the delta-oriented `refs/handoffs/currentHandoff.md` with accepted baseline, what changed, evidence/gaps, next slice, relevant files, do-not-reopen constraints, and validation SHA/run/job. Update this prompt, roadmap, product references, and file map only where new evidence changes their truth. Do not promote `qa` or `main` unless explicitly instructed.
