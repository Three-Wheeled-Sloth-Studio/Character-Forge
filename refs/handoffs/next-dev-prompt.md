---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- productization
- branding
- name-generation
- random-tables
- roadmap
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

The owner-approved execution sequence is in:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Stages 0 and 1 are complete. Stage 2 implementation is complete and only needs a short owner browser visual check before formal closeout. Do not reopen roadmap prioritization unless new evidence materially changes the plan.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 3 name generator random tables"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/owner-approved-priority-sequence-2026-09-11.md`
3. existing name-generation code/tests in `packages/generator-core` and `packages/system-dnd5e`
4. BRP optional flavor-field state/rendering only where needed for random-table integration
5. Parchment project/culture/language context contracts only if required to define an interface boundary

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Character Forge Exact Green Implementation Checkpoint

Accepted `dev` implementation head before the documentation refresh:

- SHA: `0b0a4059e30b7f07a1b28a2c93e2ba29d6652cf5`
- Actions: `34637862811`
- Job: `103390045147`
- 63 test files / 299 tests / 0 failures
- 236 tracked paths
- 14 required project-memory files
- OKF 32 concepts / 10 indexes
- agent context 3765 characters
- build `Character Forge build 0.0.1 0b0a4059`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Stage 2 Companion Parchment Checkpoint

Parchment Worlds `dev`:

- SHA: `1eb8714849e0aa45384cdf0ca582649254544b96`
- Actions: `34647328140`
- Job: `103421124752`
- 54 test files / 184 tests / 0 failures
- production bundle green

Canonical TWS assets live in `Parchment-Worlds/Branding/` and are packaged locally into the Parchment web build. The parent shell uses the TWS Studio logo with underlay as the far-left maker mark and the TAGS logo as favicon. Character Forge keeps its own quiet text maker identity rather than introducing a cross-repository runtime asset dependency.

## Stage 2 Closure Check

Before implementing Stage 3, if owner browser feedback has not already been recorded, confirm only:

- the TWS Studio underlay logo appears cleanly at the far upper left of the Parchment header;
- Parchment product identity remains clear and visually primary;
- the TAGS favicon appears;
- Parchment `v0.2.0` and Character Forge `v0.0.1` badges are quiet and legible;
- embedded Character Forge has no new layout regression.

If accepted, mark Stage 2 complete. Do not do another general branding pass.

## Stage 3 - Name Generator And Random Tables

Begin with an architecture audit before implementation.

### Name generator

Do not grow the current placeholder corpus into a larger word-list or fragment mashup.

The intended mechanism should provide a distinctly flavored but very large generation space using a probabilistic / Markov-style sequence generator or comparable phonotactic approach.

Separate from the start:

- generation mechanism;
- training/reference corpora or pattern data;
- naming context;
- culture/language inputs;
- post-generation constraints/validation;
- deterministic seed/provenance.

The design must anticipate future language and culture generators providing phonology, phonotactics, morphology, syllable structure, orthography, naming customs, honorifics, family-name rules, social-class patterns, and regional variation.

Species must not be treated as synonymous with culture or language.

Prefer the first bounded slice to prove a reusable system-neutral generation contract before adding broad corpora or many UI surfaces.

### Random tables

Use BRP free-text flavor fields as an early proving ground for a system-neutral random-table companion, such as:

- build/size;
- appearance;
- mannerisms;
- reputation;
- background;
- distinctive details;
- similar optional inspiration fields already owned by native BRP state.

Suggestions remain editable/overridable and must feed ordinary creator decisions rather than bypass native state or create a parallel document model.

## Guardrails

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Do not add name/culture/language semantics to Universal Grammar prematurely.
- Do not equate species with culture or language.
- Preserve deterministic generation and provenance where practical.
- Random-table output is suggestion/input, not hidden authoritative state.
- Do not pull deferred Issue #15 BRP polish into Stage 3 unless it becomes a blocker.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every implementation milestone:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
