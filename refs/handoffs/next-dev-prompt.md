---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green D&D generated-name provenance checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Bounded Re-entry

Do not reconstruct the full repository history.

Start with:

`python refs/tools/generate_agent_context.py --focus "BRP naming provider content boundary"`

Treat that packet as derived orientation only. Then use `refs/implementation/fileMap.yaml`, this handoff, `refs/handoffs/currentHandoff.md`, `refs/product/structured-naming.md`, `refs/integration/brp-uge-orc.md`, and targeted source reads.

Prefer diff-first continuation and conserve coding-agent context deliberately.

## Accepted Automated-Green Naming Provenance Checkpoint

D&D guided generated-name provenance integration:

- implementation checkpoint: `1a1eb5de957eabd87b63785ef8dafccafbd47a44`
- Actions: `34374497101`
- job: `102543733892`
- Verify conclusion: success
- 40 test files / 193 tests / 0 failures
- tracked paths: 161
- OKF: 19 concepts / 9 indexes
- generated agent context: 4,210 characters
- build identity: `Character Forge build 0.0.1 1a1eb5de`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not implicitly promote accumulated D&D, BRP, random-table, creator, or naming work. Preserve exact-SHA `dev -> qa -> main` promotion.

## What Is Proven

The generic naming mechanism remains `name-suggestion/0.1` in `generator-core`:

- provider ID/version;
- optional versioned source references;
- replay seed;
- opaque provider-owned context;
- provider result requiring only non-empty `displayName`.

It does not define species, culture, language, nationality, ethnicity, gender/presentation, given/family/clan name parts, transliteration, or character-state ownership.

D&D proves one provider and one persistence pattern:

- provider `DND5E_PLACEHOLDER_NAME_PROVIDER`;
- provider ID `dnd5e:placeholder-display-name`;
- provider version `0.1`;
- source `character-forge.dnd5e.placeholder-names@1`;
- exactly the existing six Character Forge placeholder names.

Guided D&D recipe `0.7` retains accepted generated-name provenance as `identity.name.suggestion` generation decisions while `CharacterDocument.displayName` and native D&D `identity.name` remain ordinary strings.

Explicit randomize-name and blank-name fallback are distinguishable. Blank fallback retains its effective replay seed. Current provider/source/version identity and seed replay are validated before a suggestion is accepted.

`apps/web/src/dndGuidedCreatorPanel.ts` retains the complete D&D suggestion around the existing creator. Manual name input clears it. The suggestion is applied only after canonical generation and only if the authoritative display/native name still matches. Native states are not mutated.

The same existing name button continues to participate in shared `Randomize All`; the shared workspace contains no naming-provider rules.

Reopen does not reconstruct a generated suggestion merely from display text and therefore cannot force stale provenance back over an authoritative retained name.

## Immediate Slice: BRP Naming Provider/Content Boundary Discovery

This is discovery-first. Do not begin by inventing a BRP name corpus.

Questions to resolve:

1. Does the authoritative BRP UGE 2023 ORC source actually provide naming content suitable for a provider? Confirm from source evidence rather than assumption.
2. If BRP rules do not own naming content, should Character Forge treat names as setting/campaign data supplied to the BRP creator rather than `system-brp` data?
3. Is a reusable future content-provider layer justified now, or is a caller-supplied provider interface enough until a real setting/world consumer exists?
4. What source/license provenance would any candidate naming dataset need to retain?
5. What context would a BRP naming provider legitimately consume? Do not infer culture, nationality, ethnicity, language, or naming convention from the current Human profile.
6. Can the existing `name-suggestion/0.1` contract express the legitimate provider without change? Prefer yes unless concrete evidence says otherwise.

Required output of the slice:

- a documented provider/content ownership decision;
- source/license findings and explicit non-findings;
- recommended next implementation boundary;
- any contract change only if evidence demands it;
- no fabricated culture data.

Implementation is optional in this slice. If a source-safe, clearly owned minimal provider becomes obvious from evidence, a very small proof may be appropriate. Otherwise stop at a durable discovery decision rather than manufacturing content to keep coding moving.

## Existing Evidence To Preserve

- D&D mechanical SRD Level 1: `55f79a1004c14eef1635e92c602e1fefa18cab15`.
- BRP first creator UI: `b5cb07ab7c8873694e438bcc6e3ab799bfdf3c02`.
- random-table core: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`.
- BRP Profession consumer: `d4b881b29bd763d9f7fd50e56223b00b37077be2`.
- BRP Scholar academic consumer: `54d471faa5a635e46ab9db90f8d05d26ac32944f`.
- shared creator randomization: `1f6ed5aee24f514fbc4fd9de39f9380e8df3719b`.
- D&D Random-ability UX: `e66003b9b6334218fb689d2da32ae5bf133251af`.
- structured naming provider proof: `978e145bb4614cf6d0f4872cea61c9f9ede613bf`.
- D&D generated-name provenance: `1a1eb5de957eabd87b63785ef8dafccafbd47a44`.

## Explicitly Deferred

Do not add without concrete evidence:

- a large D&D or BRP name corpus;
- a pseudo-BRP culture/nationality naming set;
- Human-equals-culture naming assumptions;
- universal race/ethnicity/culture ontology;
- universal given/family/clan/patronymic fields;
- transliteration/multi-script architecture;
- campaign-wide name uniqueness;
- random distributions for BRP Age, Gender, Wealth, or identity fields;
- Call of Cthulhu-specific protected naming/content data;
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
- BRP Profession is not D&D class.
- Parchment remains system-agnostic.
- Do not import Call of Cthulhu-specific protected content.
- Preserve exact-SHA promotion provenance.
- D&D Issue #11 remains a separate runtime-QA/promotion gate.

## Before Stopping

If code or durable project truth changes, run:

`npm run verify`

Do not claim green unless the exact committed SHA passes GitHub Actions.

Update the delta-oriented `refs/handoffs/currentHandoff.md` with accepted baseline, evidence/findings, chosen ownership boundary, next slice, relevant files, do-not-reopen constraints, and validation SHA/run/job when applicable. Update this prompt, roadmap, product references, and file map only where new evidence changes their truth. Do not promote `qa` or `main` unless explicitly instructed.
