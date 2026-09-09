---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green structured naming discovery/contract checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Do not reconstruct the full repository history.

Start with:

`python refs/tools/generate_agent_context.py --focus "D&D generated name provenance integration"`

Treat that packet as derived orientation only. Then use `refs/implementation/fileMap.yaml`, this handoff, `refs/handoffs/currentHandoff.md`, `refs/product/structured-naming.md`, and targeted source reads.

Prefer diff-first continuation and conserve coding-agent context deliberately.

## Accepted Automated-Green Naming Checkpoint

Structured naming contract plus D&D provider proof:

- implementation checkpoint: `978e145bb4614cf6d0f4872cea61c9f9ede613bf`
- Actions: `34372897196`
- job: `102538304875`
- Verify conclusion: success
- 39 test files / 188 tests / 0 failures
- tracked paths: 158
- build identity: `Character Forge build 0.0.1 978e145b`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not implicitly promote accumulated D&D, BRP, random-table, creator, or naming work. Preserve exact-SHA `dev -> qa -> main` promotion.

## What The Naming Discovery Slice Proved

`packages/generator-core/src/nameSuggestion.ts` defines the deliberately small `name-suggestion/0.1` boundary:

- provider ID and version;
- optional versioned source references;
- caller-supplied or generated replay seed;
- opaque provider-owned typed context;
- provider-owned result requiring only non-empty `displayName`;
- returned provider/source/version/seed provenance.

The core does not persist names, patch native state, decide whether a generated suggestion overrides user input, or define culture/language/species identity semantics.

The contract deliberately does not define given/family/clan parts, culture, language, nationality, ethnicity, gender/presentation, script, transliteration, or species mapping. Promote such concepts only from repeated concrete provider evidence.

D&D provides the first adapter proof:

- `DND5E_PLACEHOLDER_NAME_PROVIDER`
- provider ID `dnd5e:placeholder-display-name`
- provider version `0.1`
- source `character-forge.dnd5e.placeholder-names@1`

The existing six names remain temporary Character Forge placeholder data. No corpus expansion occurred and they are not represented as WotC SRD, culture, language, or species naming data.

`resolveDnd5eCharacterName()` remains compatible: direct user input wins, and an explicit seed preserves the previous selection behavior. `suggestDnd5eCharacterName()` exposes the richer provider/provenance result.

Quick Generate was intentionally left on its existing `pickDnd5eGeneratedName()` call inside the established quick-generation random stream. Do not change random-consumption order without evidence.

## Immediate Slice: D&D Generated Name Provenance Integration

Use the new provider seam in the existing guided creator without changing shared/native identity contracts.

Required behavior:

1. When the D&D name randomizer is pressed, retain the complete `suggestDnd5eCharacterName()` suggestion in creator-local state rather than only copying its display string.
2. The ordinary guided generation call should receive enough information to retain provider/source/version/seed provenance for the current generated name.
3. Keep `CharacterDocument.displayName` and native D&D `identity.name` exactly as ordinary string state. Generated-name provenance belongs in generation decisions, not native identity structure.
4. Manual edits to the name field must clear/supersede any stale retained suggestion. A generated-name provenance record is valid only while its result still equals the current submitted name.
5. Explicit randomize-name and blank-name fallback may use the same provider but should remain distinguishable in generation rationale/provenance where useful.
6. Blank-name fallback must no longer discard its effective name-generation seed if replay provenance can be retained cheaply.
7. Reopen/persistence must not force an old generated suggestion over the authoritative retained display/native name. If current D&D reopen does not restore creator-local name provenance, that is acceptable unless concrete UX requires it; do not reconstruct provenance from the display string.
8. D&D's name button should continue to participate in shared `Randomize All` through the existing control convention. Do not teach `creatorWorkspace` naming rules.
9. Preserve the existing six-name placeholder dataset and explicit-seed selection behavior.
10. Do not add BRP names, culture mappings, or a large D&D corpus in this slice.

Implementation guidance:

- Prefer a small D&D-owned helper/typed input for turning a `NameSuggestion` into a `GenerationDecision` rather than leaking generic provider types throughout the creator.
- Keep manual-vs-generated authority explicit.
- Do not change `character-document/0.1`, `dnd5e-character/0.3`, or the D&D adapter solely to store naming provenance.
- Avoid coupling name generation to ability-generation seed unless deliberately preserving an existing fallback behavior; name-specific provenance should identify its own effective seed.
- If guided generation currently creates a name internally when the field is blank, refactor only enough to retain the suggestion/provenance rather than creating a parallel naming path.

## Existing Evidence To Preserve

- D&D mechanical SRD Level 1: `55f79a1004c14eef1635e92c602e1fefa18cab15`.
- BRP first creator UI: `b5cb07ab7c8873694e438bcc6e3ab799bfdf3c02`.
- random-table core: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`.
- BRP Profession consumer: `d4b881b29bd763d9f7fd50e56223b00b37077be2`.
- BRP Scholar academic consumer: `54d471faa5a635e46ab9db90f8d05d26ac32944f`.
- shared creator randomization: `1f6ed5aee24f514fbc4fd9de39f9380e8df3719b`.
- D&D Random-ability UX: `e66003b9b6334218fb689d2da32ae5bf133251af`.
- structured naming provider proof: `978e145bb4614cf6d0f4872cea61c9f9ede613bf`.

## Explicitly Deferred

Do not add without concrete evidence:

- a large D&D or BRP name corpus;
- BRP generated names before choosing a deliberate provider/content source;
- species-equals-culture naming assumptions;
- universal race/ethnicity/culture ontology;
- universal given/family/clan/patronymic fields;
- transliteration/multi-script architecture;
- campaign-wide name uniqueness;
- random distributions for BRP Age, Gender, Wealth, or identity fields;
- nested/subtable evaluation changes;
- universal trait/ideal/bond/flaw ontology;
- user-authored naming/table persistence UI.

## Architecture Guardrails

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- `character-document/0.1` remains the shared contract unless concrete cross-system evidence requires change.
- Name suggestion is a generation primitive, not a universal identity model.
- Direct user-entered names are authoritative over generated suggestions.
- Shared creator code coordinates interactions only; system rules, distributions, and content datasets stay system-owned.
- Do not conflate species, culture, language, nationality, ethnicity, or naming convention.
- Preserve provider/source/version/seed provenance boundaries.
- Parchment remains system-agnostic.
- Do not import Call of Cthulhu-specific protected content.
- Preserve exact-SHA promotion provenance.
- D&D Issue #11 remains a separate runtime-QA/promotion gate.

## Before Stopping

Run:

`npm run verify`

Do not claim green unless the exact committed SHA passes GitHub Actions.

Update the delta-oriented `refs/handoffs/currentHandoff.md` with accepted baseline, what changed, evidence/gaps, next slice, relevant files, do-not-reopen constraints, and validation SHA/run/job. Update this prompt, roadmap, product references, and file map only where new evidence changes their truth. Do not promote `qa` or `main` unless explicitly instructed.
