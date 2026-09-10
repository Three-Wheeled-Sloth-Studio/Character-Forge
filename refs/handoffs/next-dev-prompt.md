---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- brp
- productization
- rules-profile
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

The active epic is GitHub Issue #14: **Make BRP UGE a player-usable core character generator**.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "BRP campaign rules profile seam"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/brp-player-usability-gap-audit.md`
3. `refs/planning/brp-player-usable-core.md`
4. `refs/planning/brp-investigative-horror-profile.md`
5. `refs/integration/brp-uge-orc.md`
6. `refs/implementation/fileMap.yaml`
7. GitHub Issue #14
8. only BRP rules-profile/native-state/creator code needed for this seam.

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Green Implementation Checkpoint

The adaptive character-sheet first proof is green at:

- SHA: `d6ba965b32c7d47eb2cfa1ef4b73e486787431cb`
- Actions: `34525124229`
- Job: `103032033580`
- `npm run verify`: green
- 52 test files / 256 tests / 0 failures
- 206 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes
- agent context: 3725 characters
- build: `Character Forge build 0.0.1 d6ba965b`

Documentation may be ahead of this implementation checkpoint. Validate the exact current `dev` SHA before declaring a new milestone green.

## Player-Usable Core State

Implemented and retained through authoritative BRP native state:

- explicit and standard-rolled characteristics;
- Normal and Heroic skill construction;
- Detective, Scholar, Athlete, Beggar, and Custom Profession;
- broader ordinary skill surface and open Scholar specialties/languages;
- exact professional/personal skill causality;
- actionable allocation status and validation guidance;
- bounded equipment, armor, and modern pistols with starting-skill eligibility;
- optional identity/background finishing details;
- save/reopen for supported creator state;
- adaptive two-page BRP sheet projection through shared presentation-only rendering;
- browser-native Print / Save as PDF with application/debug chrome removed; and
- lossless full CharacterDocument Copy JSON / Download JSON controls.

Preserve `brp-character/0.1` and canonical adapter identity `0.7.0` unless concrete evidence proves them insufficient.

## Immediate Task - Narrow Campaign / Rules-Profile Selection Seam

Do not implement Investigative Horror content in this slice. Implement only the configuration seam it will need.

The architecture target from `refs/planning/brp-investigative-horror-profile.md` is:

- a profile selects a coherent set of BRP-native options/defaults;
- native state retains the actual effective rules/configuration;
- the profile label does not replace source-native state;
- profile switching/creation cannot silently reinterpret an existing character; and
- setting-owned flavor remains separable from BRP-system mechanics.

### Audit first

Before editing, inspect:

- current `BrpRulesProfile` shape and validation;
- `resolveBrpPowerLevelProfile` and other existing option/default resolution seams;
- creator state/default construction and save/reopen reconstruction;
- any existing profile-like IDs in generation provenance; and
- where the rules-system selector currently hands off to the BRP creator.

### Smallest acceptable seam

Prefer a BRP-owned profile definition/catalog with a stable ID and explicit source-native configuration mapping. The base/generic profile should be the only fully active product profile in this slice unless a second inert/test fixture is necessary to prove switching semantics.

A likely bounded shape is conceptually:

```text
BrpCampaignProfileDefinition
  -> stable profile ID / label
  -> BRP-native rules/default configuration
  -> creator initialization
  -> effective BrpRulesProfile in native state
```

Naming may differ to match the repo.

Keep the profile identity distinct from `BrpRulesProfile`. `BrpRulesProfile` remains the effective rules state. A profile ID may be retained as creation/provenance context if useful, but must not become the authority for interpreting an existing character.

### Required behavior

- generic/base BRP profile is explicitly selectable or clearly represented in the creator;
- profile mapping is deterministic and system-owned;
- creating under a profile produces the mapped effective BRP rules state;
- save/reopen retains the character's effective rules configuration losslessly;
- reopening does not recalculate old characters from a possibly changed future profile definition;
- changing a profile for a new creation may apply its defaults, but must not silently mutate or reinterpret an already-created/reopened character;
- the seam is ready for a later `investigative-horror` profile without containing that profile's substantive rules/content now.

### Tests

Add focused structural tests for:

- stable base profile identity and mapping;
- profile -> effective native rules state;
- save/reopen behavior;
- separation between profile label/provenance and authoritative rules state;
- switching/reset semantics; and
- canonical adapter/version/schema preservation.

Do not introduce a universal campaign/profile abstraction unless code evidence from another system already requires one.

## Guardrails

- Native system state is mandatory and lossless.
- Native BRP state remains canonical and lossless.
- Preserve `brp-character/0.1`.
- Preserve canonical adapter identity `0.7.0`.
- Profession is not class.
- Campaign/profile is not Universal Grammar.
- Do not import Call of Cthulhu-only/branded content.
- Do not enable BRP Sanity or other optional systems in this seam unless the generic/base profile already requires them from current implemented behavior.
- Do not modify the adaptive sheet architecture unless the profile seam exposes a concrete presentation bug.
- Do not retrofit D&D to the adaptive sheet renderer.
- Do not implement Fate early.
- Do not add a PDF-generation dependency.

## After This Slice

Run representative owner/browser QA across:

```text
create -> finish -> review -> save -> reopen -> print/export
```

Exercise multiple professions and representative long/filled content. Confirm actual browser pagination, printable density, grayscale/readability, JSON controls, profile persistence, and reopen behavior.

If that QA satisfies the player-usable acceptance target, update documentation and close Issue #14. Then proceed to BRP Investigative Horror, followed by the bounded Fate Condensed probe and only then Universal Grammar v0.1.

## Branch / Promotion Boundary

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every implementation milestone:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
