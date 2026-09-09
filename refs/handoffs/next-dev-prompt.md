---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
---
# Next Development Prompt

Continue Character Forge from the automated-green BRP UGE named-language backend checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Routine Re-entry

Do not reconstruct the full project history after a context reset.

Start with:

`python refs/tools/generate_agent_context.py --focus "BRP creator UI"`

Treat the generated packet as derived orientation only. Use `refs/implementation/fileMap.yaml` for focused source/guidance hints, then load deeper architecture, BRP source material, evidence history, or broad planning only if the task actually crosses those boundaries.

## Promoted Baseline Remains Unchanged

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not implicitly promote accumulated D&D or BRP work. Preserve exact-SHA `dev -> qa -> main` promotion.

## Current BRP Automated-Green Checkpoint

- code checkpoint: `1ce3387491ccf859f56d7a0e92217c7737a56bf0`
- Actions: `34291613617`
- job: `102279178820`
- refs / OKF green
- strict TypeScript green
- 30 test files / 152 tests / 0 failures
- BRP tests: 35
- named-language tests: 7
- web build green
- build identity: `Character Forge build 0.0.1 1ce33874`
- native schema: `brp-character/0.1`
- adapter: `0.5.0`
- rules source: `chaosium-brp-uge-orc-1.05`

The earlier feature commit `6e70083a8cc033b59ec2953e642dc3a44d5ba64e` failed only because a stale impossible TypeScript branch remained after language base calculation moved out of the static skill catalog. `1ce338...` removes that stale branch and is the accepted automated-green code checkpoint.

## D&D Gate Is Still Open And Separate

D&D 5E 2024 mechanical SRD Level 1 breadth remains automated-green on `dev` at `55f79a1004c14eef1635e92c602e1fefa18cab15`, with 12 classes, 4 backgrounds, 9 species, and all 108 class/species combinations covered.

Issue #11 remains open for accumulated owner runtime QA and exact-SHA promotion. BRP work does not waive that gate.

## Source Boundary

Implement Basic Roleplaying: Universal Game Engine, 2023 ORC content, pinned to corrections `CHA2036 BRP UGE Corrections 1.05` for this adapter family.

Do not use the older 2020 online BRP SRD as implementation authority. Do not import Call of Cthulhu-specific protected content.

## What Is Now Proven

The same `brp-character/0.1` native ontology supports:

- explicit and deterministic standard-rolled characteristics;
- Normal and Heroic power levels;
- Detective and Scholar professions;
- bounded and open profession choice grammars;
- open Knowledge/Science specialties;
- named language identity with Own/Other role semantics;
- character-specific Heroic age causality.

Scholar retains exact open `{ id, label }` values for its Own and Other languages. `Language (Own)` uses `INT x 5` in the current EDU-disabled profile; `Language (Other)` starts at 0. The same language ID cannot occupy both Scholar roles. Additional `Language (Other)` identities may be learned through personal allocation without becoming professionally eligible.

The adapter independently derives exact legal Scholar language skills from retained profession state and detects identity/base tampering.

No shared CharacterDocument or semantic schema change has been required.

## Immediate Implementation Slice: First BRP Creator UI

Expose the narrow supported BRP backend through the existing Character Forge creator without broadening the rules surface.

### UX Architecture

Follow the established creator standard:

- generation options in the left panel;
- character details/review in the right panel;
- universal character fields and rules-system selection at the top;
- one generation-method selector with method-specific controls appearing dynamically;
- independent desktop scrolling for long controls and review;
- direct selection remains independent from any future sticky/random acceptable pools;
- make actions easy to do and easy to undo rather than interrupting with validation popups where inline feedback is sufficient.

Do not create a second disconnected BRP page if the existing creator workspace can host a system-specific control surface cleanly.

### Supported BRP Controls

At minimum expose:

- rules system: BRP UGE;
- display name;
- age and gender;
- wealth: Average/Affluent;
- power level: Normal/Heroic;
- Heroic retained default starting age when required by the system layer;
- profession: Detective/Scholar;
- characteristic generation: Explicit/Standard Rolled;
- explicit STR/CON/SIZ/INT/POW/DEX/CHA entry;
- standard-rolled seed/re-roll and legal up-to-three-point redistribution controls;
- Detective four-of-supported-electives selection;
- Scholar Own language ID/label;
- Scholar Other language ID/label;
- Scholar five open Knowledge/Science specialty selections;
- professional and personal skill allocation controls sufficient to build a legal supported character;
- current budget, remaining points, and starting-cap feedback;
- generated/reviewed native values including derived state and skill causal layers where useful.

Do not expose unsupported EDU, Sanity, Fatigue, hit locations, powers, non-human rules, age-50+ rules, cultural modifiers, skill-category bonuses, or broad profession ingestion.

### System Ownership

The UI must call BRP-owned construction/validation seams rather than reimplementing BRP rules in browser code.

At minimum:

- source budgets/caps come from BRP system functions;
- language bases and profession eligibility remain BRP-owned;
- characteristic generation remains deterministic through generator-core/BRP APIs;
- browser code may present validation but must not become a second rules engine;
- native state and generation provenance produced by the backend remain authoritative.

If the current builders are too all-at-once for good UI feedback, introduce narrow BRP-owned preview/query helpers rather than duplicating formulas in the UI.

### Persistence / Reopen

The first UI slice must preserve existing CharacterDocument behavior:

- generated BRP character is a normal CharacterDocument with primary BRP native state;
- JSON round trip remains lossless;
- generation provenance survives;
- reopening a BRP CharacterDocument restores enough UI state to inspect/edit supported choices without reconstructing authoritative native state from semantic projection.

Do not make Parchment understand BRP mechanics. If host integration needs a generic system identifier/display capability, keep that boundary system-agnostic.

### Validation Target

The automated gate should prove at minimum:

- existing D&D browser tests remain green;
- BRP system selection does not alter D&D creator defaults or sticky preference behavior;
- explicit BRP creator path can produce a valid Detective and Scholar;
- standard-rolled BRP creator path can produce a valid Detective and Scholar;
- Normal/Heroic controls feed the retained BRP rules profile correctly;
- Scholar named Own/Other languages reach native state/provenance exactly;
- open Scholar academic specialty identities reach native state/provenance exactly;
- budget/cap feedback agrees with system-layer validation;
- invalid professional-language or specialty allocations cannot be presented as a valid character;
- generated CharacterDocument can be reopened without losing BRP native state;
- build identity remains visible for runtime QA.

Use targeted browser/unit tests; do not add broad end-to-end infrastructure unless the existing test seams cannot cover the risk.

## After The First BRP UI

Reassess from actual creator friction. Likely next candidates are:

- BRP UI polish and owner runtime QA;
- a third profession only if UI experience reveals a profession-shape gap;
- one optional BRP subsystem only if rules-profile architecture still needs pressure;
- age/experience expansion when a concrete user path needs it;
- the system-neutral random-table companion in parallel.

Do not automatically ingest the whole BRP profession catalog after the first UI.

## Architecture Rules

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Do not change shared CharacterDocument or semantic contracts without concrete cross-system evidence.
- BRP profession is not D&D class.
- Preserve skill base chance, professional contribution, personal contribution, and final rating separately.
- Keep open specialties and language identities source-owned.
- Preserve both language subject identity and Own/Other role when they affect source semantics.
- Preserve effective rules-profile and character-specific age causality.
- Do not model future BRP powers through D&D spell structures.
- Generator-core remains system-neutral.
- Parchment remains ignorant of system-specific mechanics.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Parallel Product Work

The system-neutral random-table companion remains `ready_for_discovery`; do not let BRP UI work erase that product thread.
