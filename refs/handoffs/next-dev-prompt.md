---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green D&D Random-ability UX checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Do not reconstruct the full repository history.

Start with:

`python refs/tools/generate_agent_context.py --focus "structured naming seam discovery"`

Treat that packet as derived orientation only. Then use `refs/implementation/fileMap.yaml`, this handoff, `refs/handoffs/currentHandoff.md`, and targeted source reads. Load deeper source/licensing evidence only when the naming design actually crosses those boundaries.

Prefer diff-first continuation and conserve coding-agent context deliberately.

## Accepted Automated-Green Checkpoints

Shared creator randomization orchestration:

- checkpoint: `1f6ed5aee24f514fbc4fd9de39f9380e8df3719b`
- Actions: `34369619403`
- job: `102527165230`
- 36 test files / 178 tests / 0 failures

D&D Random-ability UX:

- implementation checkpoint: `e66003b9b6334218fb689d2da32ae5bf133251af`
- Actions: `34371712699`
- job: `102534309918`
- Verify conclusion: success
- 37 test files / 181 tests / 0 failures
- build identity: `Character Forge build 0.0.1 e66003b9`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not implicitly promote accumulated D&D, BRP, random-table, or creator work. Preserve exact-SHA `dev -> qa -> main` promotion.

## What The Last Slice Proved

The accepted D&D Random-ability findings are now handled in a presentation-only enhancer rather than by changing D&D roll rules:

- pre-roll `Roll First` assignment controls stay hidden until six rolls exist;
- verbose roll history is removed from the cramped card line and exposed through hover/accessibility detail;
- assignment changes use swap semantics so every rolled total remains assigned exactly once;
- a pure `swapUniqueRandomAssignment()` helper enforces the permutation behavior with focused tests;
- `guidedCreationPanel.ts`, `system-dnd5e` roll generation, native state, and provenance remain unchanged.

Owner browser QA of shared `Randomize All` remains useful, but do not make it a dedicated implementation cycle. Existing automated evidence already proves pool-bounded selection and dynamic-action orchestration; fold any concrete browser finding into later touched creator work.

## Immediate Slice: Structured Naming Seam Discovery

The goal is to define the smallest naming architecture justified by current evidence before adding more names or wiring BRP name randomization.

Current evidence:

- D&D already has `resolveDnd5eCharacterName`, backed by a temporary flat generated-name approach that should not be scaled.
- BRP has no generated-name provider, and owner QA explicitly identified that gap.
- Shared `Randomize All` now needs a clean way to invoke a system-owned name generator when one exists.
- D&D species, BRP human identity, named BRP languages, and future Parchment/World culture-language consumers demonstrate that biological species must not be treated as equivalent to culture or naming language.

Required discovery work:

1. Audit the existing D&D name-generation function, data source, seed/random behavior, and any CharacterDocument generation provenance attached to generated names.
2. Identify the minimum reusable contract for requesting and returning a generated display name. Prefer a provider/interface seam over a universal identity ontology.
3. Separate reusable mechanism from datasets. Culture/language/system/setting-specific name corpora must remain owned by the appropriate provider or content pack.
4. Preserve deterministic generation and explicit provenance capability where generated names are retained.
5. Preserve manual override as authoritative; generated-name provenance must not force later edits back to a generated value.
6. Define optional naming context without making species synonymous with culture. Candidate context may include system ID, culture/language tags, species/ancestry hints, gender/presentation hints where a provider uses them, and locale/style, but add only fields justified by real consumers.
7. Decide whether any generic mechanism belongs in generator-core. Do not move naming into generator-core merely because it is reusable-looking.
8. Define how system-owned name randomizers advertise participation in creator `Randomize All` without teaching the workspace D&D or BRP naming rules.
9. Do not ingest a large corpus or add BRP names in this discovery slice unless the contract requires a tiny fixture to prove the boundary.

Expected output is primarily a durable contract/reference plus the smallest code seam or proof needed to make the architecture concrete. Avoid a naming mini-framework.

## Existing Evidence To Preserve

- D&D mechanical SRD Level 1: `55f79a1004c14eef1635e92c602e1fefa18cab15`.
- BRP first creator UI: `b5cb07ab7c8873694e438bcc6e3ab799bfdf3c02`.
- random-table core: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`.
- BRP Profession consumer: `d4b881b29bd763d9f7fd50e56223b00b37077be2`.
- BRP Scholar academic consumer: `54d471faa5a635e46ab9db90f8d05d26ac32944f`.
- shared creator randomization: `1f6ed5aee24f514fbc4fd9de39f9380e8df3719b`.
- D&D Random-ability UX: `e66003b9b6334218fb689d2da32ae5bf133251af`.

## Explicitly Deferred

Do not add without concrete evidence:

- a large D&D or BRP name corpus;
- species-equals-culture naming assumptions;
- universal race/ethnicity/culture ontology;
- random distributions for BRP Age, Gender, Wealth, or identity fields;
- nested/subtable evaluation;
- universal trait/ideal/bond/flaw ontology;
- user-authored table persistence/editor UI;
- direct native-state mutation from generation helpers.

## Architecture Guardrails

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- `character-document/0.1` remains the shared contract unless concrete cross-system evidence requires change.
- Shared creator code coordinates interactions only; system rules, distributions, and content datasets stay system-owned.
- Generated display name is not automatically a universal culture identity object.
- Do not conflate species, culture, language, nationality, ethnicity, or naming convention.
- Preserve manual override and provenance boundaries.
- Parchment remains system-agnostic.
- Do not import Call of Cthulhu-specific protected content.
- Preserve exact-SHA promotion provenance.
- D&D Issue #11 remains a separate runtime-QA/promotion gate.

## Before Stopping

Run:

`npm run verify`

Do not claim green unless the exact committed SHA passes GitHub Actions.

Update the delta-oriented `refs/handoffs/currentHandoff.md` with accepted baseline, what changed, evidence/gaps, next slice, relevant files, do-not-reopen constraints, and validation SHA/run/job. Update this prompt, roadmap, product references, and file map only where new evidence changes their truth. Do not promote `qa` or `main` unless explicitly instructed.
