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

Preserve exact-SHA `dev -> qa -> main` promotion. Do not implicitly promote accumulated D&D, BRP, random-table, creator, naming, or narrative work.

D&D 5E 2024 mechanical SRD Level 1 breadth remains automated-green at `55f79a1004c14eef1635e92c602e1fefa18cab15`. Issue #11 remains the separate accumulated owner runtime-QA/promotion gate.

Important later green checkpoints include:

- random-table core: `0ace3aacc7e23a420377b6c4c8f2b9b243ec945e`;
- BRP Profession consumer: `d4b881b29bd763d9f7fd50e56223b00b37077be2`;
- BRP Scholar academic consumer: `54d471faa5a635e46ab9db90f8d05d26ac32944f`;
- shared creator randomization: `1f6ed5aee24f514fbc4fd9de39f9380e8df3719b`;
- D&D Random-ability UX: `e66003b9b6334218fb689d2da32ae5bf133251af`;
- structured naming provider proof: `978e145bb4614cf6d0f4872cea61c9f9ede613bf`;
- D&D generated-name provenance: `1a1eb5de957eabd87b63785ef8dafccafbd47a44`;
- D&D Quick top-level creator mode: `418db810828c6a44d7b24b88ef69a3b6ffdffc40`.

## D&D Guided Narrative First Vertical Slice

The first Guided Narrative implementation remains automated-green at:

- implementation checkpoint: `bd5de95193002cb7ad176c5b325d42d5e21ff78c`
- Actions: `34384877186`
- job: `102578522427`
- Verify conclusion: success
- full suite: 42 test files / 203 tests / 0 failures

The follow-up Narrative choice-shape refinement is automated-green at:

- implementation checkpoint: `3ff8b064e614f964e83ff7dfc5549ce96594a33a`
- Actions: `34386315636`
- job: `102583371487`
- Verify conclusion: success
- full suite: 42 test files / 204 tests / 0 failures
- tracked paths: 167
- OKF: 19 concepts / 9 indexes
- generated agent context: 3,945 characters
- web build identity: `Character Forge build 0.0.1 3ff8b064`

## What Changed

D&D exposes three top-level creation modes:

1. `Guided Mechanical` - still the default detailed creator;
2. `Guided Narrative` - narrative/preference front end;
3. `Quick Generate` - unchanged system-owned Quick generation.

Standard Array, Point Cost, Random, and Manual remain ability-generation methods inside Guided Mechanical only.

The system-owned `packages/system-dnd5e/src/guidedNarrative.ts` defines the Narrative contract and mappings. Browser code renders that contract but does not own the mapping logic.

The current first-slice questionnaire contains three deliberately narrow questions:

- preferred role in trouble;
- kind of life before adventuring;
- kind of heritage the player wants to explore.

Every Narrative question includes an explicit `Choose for me` option. When selected, the substantive answer is resolved deterministically from the visible Narrative seed and both the submitted `choose-for-me` answer and resolved answer are retained.

The mapping result exposes candidate IDs and one deterministic recommendation for:

- role -> Class candidates;
- past -> Background candidates;
- heritage -> Species candidates.

Narrative mechanical overrides are now limited to the narrowed candidate set produced by upstream answers. If the player wants a mechanical option outside that set, the intended Narrative interaction is to change an upstream answer, not to open the full rules catalog in the same Narrative step.

## Durable Narrative Choice-Shape Rule

For current and future Narrative flows:

- target about 3 presented choices at a step when practical;
- hard upper limit 5 presented choices at any Narrative step;
- `Choose for me` or a semantic equivalent counts as one of the presented choices;
- if the next Narrative choice set would exceed 5, insert an upstream Narrative question, itself within the same limit, to narrow the downstream set;
- do not solve a large Narrative choice set by showing a 10-20 item mechanical dropdown and calling it an override;
- once the user explicitly continues into Guided Mechanical, ordinary mechanical catalogs are no longer subject to the Narrative presentation ceiling.

The D&D contract now exports and enforces `DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES = 5`. Question sets are validated against that limit, mapped candidate sets are validated against it, and attempts to bypass a narrowed branch with an arbitrary out-of-branch Narrative override are rejected.

The current role and heritage question shapes were tightened to stay within the limit. The current mapped candidate sets are generally 1-3 choices.

The target of about 3 is a design heuristic rather than a hard validator. The maximum of 5 is the hard contract.

## Generation And Provenance Boundary

`guidedNarrativeGenerateDnd5eFirstSlice()` remains a front end over the existing guided/native generator.

It:

- uses ordinary supported Class, Background, and Species IDs;
- calls `defaultGuidedDnd5eCoreChoices()` for the current remaining mechanical defaults;
- uses a legal Standard Array assignment with class-aware priority;
- derives a legal +2/+1 background ability-increase plan from the selected background and class priority;
- uses the normal guided builder and D&D adapter path;
- does not introduce a Narrative-native schema or Narrative adapter.

Generation metadata retains:

- `methodId`: `dnd5e:guided-narrative-level-one`;
- `mode`: `guided-narrative`;
- `recipeVersion`: `0.1`;
- Narrative seed;
- mapping ID/version;
- submitted and resolved Narrative answers;
- narrowed candidate, recommended, final, and override status for Class, Background, and Species;
- remaining defaulted choices as first-slice behavior.

The Narrative mapping version is now `2` because the choice taxonomy and narrowing behavior changed.

No CharacterDocument schema, D&D native schema, D&D adapter, BRP code, generator-core random-table contract, dependency, or lockfile changed.

## Creator Behavior

`apps/web/src/dndNarrativeCreatorPanel.ts`:

- renders the system-owned questions;
- defaults each question to `Choose for me`;
- exposes the replay seed;
- provides `Choose again` by generating a new seed;
- shows resolved answers and mapped candidate summary;
- populates Class, Background, and Species selects from the narrowed candidate IDs only;
- tells the player to change an earlier Narrative answer to explore another branch;
- publishes through the same ordinary `onCharacter` review/save/host boundary as the other D&D modes.

All three D&D mode surfaces remain mounted while switching, preserving in-progress form state.

Shared `Randomize All` remains available only in Guided Mechanical. It is hidden/disabled and click-guarded in both Quick and Guided Narrative. Narrative uses explicit per-question `Choose for me` behavior instead.

## Remaining QA Evidence

Owner browser QA of accumulated creator behavior remains useful, including:

- Guided / Narrative / Quick switching;
- Narrative `Choose for me` replay and `Choose again`;
- verifying every Narrative step presents no more than 5 choices;
- verifying mapped Class/Background/Species options stay within the narrowed branch;
- changing upstream Narrative answers to reach different branches;
- existing Randomize All behavior in Guided Mechanical.

Keep this as accumulated nonblocking creator QA unless a concrete blocker appears. D&D Issue #11 remains the promotion gate.

## Next Slice

Continue Guided Narrative into the existing Guided Mechanical customization surface instead of duplicating detailed D&D controls in the Narrative panel.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "D&D Guided Narrative continuation into Guided Mechanical"`

Priorities:

1. Define the smallest D&D-owned/controller seam for initializing the existing Guided Mechanical Class, Background, and Species from a Narrative recommendation/final selection.
2. Add a clear `Continue in Guided Mechanical` interaction rather than copying class skills, spells, equipment, origin details, or ability controls into the Narrative panel.
3. Preserve the Narrative answers, mapping ID/version, seed, recommendation, narrowed candidates, and overrides when the user continues into detailed Guided Mechanical editing and later builds the character.
4. Preserve direct user overrides as authoritative.
5. Keep every current and future Narrative question equipped with explicit `Choose for me` or semantic equivalent.
6. Keep Narrative presentation near 3 choices where practical and never above 5; add an upstream narrowing question when a downstream Narrative set would exceed 5.
7. Once explicitly in Guided Mechanical, ordinary mechanical catalogs may use their normal UI rather than inheriting the Narrative ceiling.
8. Keep all three top-level D&D mode surfaces mounted and avoid losing in-progress state merely from mode switching.
9. Keep Randomize All suppressed in Narrative and Quick; only Guided Mechanical owns the existing shared orchestration behavior.
10. Do not create a generic questionnaire engine or universal personality/trait ontology unless repeated concrete consumers require one.
11. Do not add BRP Guided Narrative in this slice.
12. Do not promote `qa` or `main`.

## Relevant Files

- `refs/product/creator-workspace.md`
- `refs/product/generation-methods.md`
- `refs/handoffs/next-dev-prompt.md`
- `refs/implementation/fileMap.yaml`
- `packages/system-dnd5e/src/guidedNarrative.ts`
- `packages/system-dnd5e/src/guidedNarrative.test.ts`
- `packages/system-dnd5e/src/guidedGenerate.ts`
- `apps/web/src/dndNarrativeCreatorPanel.ts`
- `apps/web/src/dndCreatorPanel.ts`
- `apps/web/src/dndGuidedCreatorPanel.ts`
- `apps/web/src/guidedCreationPanel.ts`
- `apps/web/src/creatorWorkspace.ts`

## Do Not Reopen Without New Evidence

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Quick Generate and Guided Narrative are top-level creation front ends, not ability-generation methods.
- Guided Narrative is a front end over ordinary D&D system choices, not a new character-state model.
- Every Narrative question must include an explicit `Choose for me` equivalent.
- Narrative steps target about 3 choices and must never present more than 5; add upstream narrowing rather than large downstream menus.
- Shared creator code coordinates interactions only; system rules, mappings, distributions, and content stay system-owned.
- Do not promote universal personality, trait, ideal, bond, flaw, culture, or naming schemas from one D&D questionnaire.
- BRP naming content remains setting/campaign/content-package owned.
- Random-table evaluation remains a separate generation primitive.
- Preserve explicit replay provenance and version boundaries.
- BRP Profession is not D&D class.
- Future BRP powers must not reuse D&D spell architecture.
- Parchment remains system-agnostic.
- Do not import Call of Cthulhu-specific protected content.
- D&D Issue #11 remains a separate promotion gate.

## Validation

Milestone gate:

`npm run verify`

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
