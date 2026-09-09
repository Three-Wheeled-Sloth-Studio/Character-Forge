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

The first Guided Narrative slice is automated-green at:

- implementation checkpoint: `bd5de95193002cb7ad176c5b325d42d5e21ff78c`
- Actions: `34384877186`
- job: `102578522427`
- Verify conclusion: success
- full suite: 42 test files / 203 tests / 0 failures
- tracked paths: 167
- OKF: 19 concepts / 9 indexes
- generated agent context: 3,710 characters
- web build identity: `Character Forge build 0.0.1 bd5de951`

One earlier checkpoint, `eb9b4c43ee11e86860f6bd6284cc165c445f3683`, failed only on `exactOptionalPropertyTypes` because an optional narrative name was explicitly passed as `undefined`. The correction passes `name: input.name ?? ""`; no system behavior changed beyond satisfying the existing guided input contract.

## What Changed

D&D now exposes three top-level creation modes:

1. `Guided Mechanical` - still the default detailed creator;
2. `Guided Narrative` - the new narrative/preference front end;
3. `Quick Generate` - unchanged system-owned Quick generation.

Standard Array, Point Cost, Random, and Manual remain ability-generation methods inside Guided Mechanical only.

The new system-owned `packages/system-dnd5e/src/guidedNarrative.ts` defines the first narrative contract and mappings. Browser code renders that contract but does not own the mapping logic.

The first questionnaire contains three deliberately narrow questions:

- preferred role in trouble;
- kind of life before adventuring;
- kind of heritage the player wants to explore.

Every narrative question includes an explicit `Choose for me` option. This is now a product requirement for narrative choice surfaces, not a one-off convenience. When chosen, the substantive answer is resolved deterministically from the visible narrative seed and both the submitted `choose-for-me` answer and resolved answer are retained.

Current mappings stay entirely within already-supported D&D choices:

- role -> Class candidates;
- past -> Background;
- heritage -> Species candidates.

The mapping result exposes candidate IDs and one deterministic recommendation. The creator shows the recommended Class, Background, and Species as ordinary editable selects so the player can override any recommendation before generation.

## Generation And Provenance Boundary

`guidedNarrativeGenerateDnd5eFirstSlice()` remains a front end over the existing guided/native generator.

It:

- uses ordinary supported Class, Background, and Species IDs;
- calls `defaultGuidedDnd5eCoreChoices()` for the current remaining mechanical defaults;
- uses a legal Standard Array assignment with class-aware priority;
- derives a legal +2/+1 background ability-increase plan from the selected background and class priority;
- uses the normal guided builder and D&D adapter path;
- does not introduce a narrative-native schema or narrative adapter.

After ordinary generation, generation metadata is made narrative-specific:

- `methodId`: `dnd5e:guided-narrative-level-one`;
- `mode`: `guided-narrative`;
- `recipeVersion`: `0.1`;
- narrative seed retained;
- mapping ID/version retained;
- submitted and resolved narrative answers retained;
- candidate, recommended, final, and override status retained for Class, Background, and Species;
- remaining defaulted choices explicitly recorded as first-slice behavior.

Narrative generation removes the Guided Mechanical sticky acceptable-pool provenance records because those pools were not used by the narrative path. Ordinary final Class/Background/Species decisions are retained with rationale showing recommendation acceptance or player override.

No CharacterDocument schema, D&D native schema, D&D adapter, BRP code, generator-core random-table contract, dependency, or lockfile changed.

## Creator Behavior

`apps/web/src/dndNarrativeCreatorPanel.ts`:

- renders the system-owned questions;
- defaults each question to `Choose for me`;
- exposes the replay seed;
- provides `Choose again` by generating a new seed;
- shows the resolved answers and mapped candidate summary;
- exposes overrideable Class, Background, and Species selects;
- publishes through the same ordinary `onCharacter` review/save/host boundary as the other D&D modes.

All three D&D mode surfaces remain mounted while switching, preserving in-progress form state.

Shared `Randomize All` remains available only in Guided Mechanical. It is hidden/disabled and click-guarded in both Quick and Guided Narrative. Narrative uses the explicit per-question `Choose for me` behavior instead of accidentally invoking hidden Guided Mechanical controls.

## Durable Narrative Choice Rule

For current and future narrative questionnaires:

- every narrative choice/question must include `Choose for me` or a semantically equivalent explicit option;
- the random/default resolution must be deliberate and system/content-owner defined, never inferred from hidden browser behavior;
- where replay matters, retain the seed and submitted-versus-resolved provenance;
- direct player answers and later mechanical overrides remain authoritative.

Do not generalize this into a universal personality or psychology schema from the first D&D consumer.

## Remaining QA Evidence

Owner browser QA of accumulated creator behavior remains useful, including:

- Guided / Narrative / Quick switching;
- Narrative `Choose for me` replay and `Choose again`;
- Class/Background/Species narrative override behavior;
- existing Randomize All behavior in Guided Mechanical.

Keep this as accumulated nonblocking creator QA unless a concrete blocker appears. D&D Issue #11 remains the promotion gate.

## Next Slice

Continue Guided Narrative into the existing Guided Mechanical customization surface instead of duplicating detailed D&D controls in the narrative panel.

Start routine work with:

`python refs/tools/generate_agent_context.py --focus "D&D Guided Narrative continuation into Guided Mechanical"`

Priorities:

1. Define the smallest D&D-owned/controller seam for initializing the existing Guided Mechanical Class, Background, and Species from a narrative recommendation/final selection.
2. Add a clear `Continue in Guided Mechanical` interaction rather than copying class skills, spells, equipment, origin details, or ability controls into the narrative panel.
3. Preserve the narrative answers, mapping ID/version, seed, recommendation, and override provenance when the user continues into detailed Guided Mechanical editing and later builds the character.
4. Preserve direct user overrides as authoritative.
5. Keep all existing and future narrative questions equipped with explicit `Choose for me` or semantic equivalent.
6. Keep all three top-level D&D mode surfaces mounted and avoid losing in-progress state merely from mode switching.
7. Keep Randomize All suppressed in Narrative and Quick; only Guided Mechanical owns the existing shared orchestration behavior.
8. Do not create a generic questionnaire engine or universal personality/trait ontology unless repeated concrete consumers require one.
9. Do not add BRP Guided Narrative in this slice.
10. Do not promote `qa` or `main`.

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
- Every narrative question must include an explicit `Choose for me` equivalent.
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
