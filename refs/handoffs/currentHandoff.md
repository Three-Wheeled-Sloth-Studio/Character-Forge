---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- foundry
- vtt
- stage-5
- stage-4-qa-hold
- roadmap
---
# Current Handoff

Date: 2026-09-12
Branch: `dev`
Current development stage: **Stage 5 - Foundry Export / Import Validation**

## Current State

Stages 0, 1, 2, and 3 are complete.

Stage 4 durable portrait/token implementation is feature-complete and CI-green, but owner/browser acceptance is intentionally deferred until the owner is back at a primary workstation. That QA hold is pinned in GitHub Issue #16:

`[QA HOLD] Stage 4 integrated portrait/token browser acceptance`

Issue #16 is **not a Stage 5 development blocker**. Do not call Stage 4 owner-accepted, close Issue #16, or promote accumulated work until that integrated browser checklist is actually exercised.

The authoritative sequence remains:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Issue #15 remains parked and nonblocking.

## Exact Green Stage 5 Checkpoint

Current accepted `dev` implementation head:

- SHA: `3ebf76461a7592878f66f089a51b261868460fa3`
- Actions: `34696689106`
- Job: `103561269477`
- `npm run verify`: green
- 67 test files
- 319 tests passed
- 0 failures
- 248 tracked paths
- 14 required project-memory files
- OKF: 32 concepts / 10 indexes
- Agent context: 3649 characters
- Build: `Character Forge build 0.0.1 3ebf7646`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

No promotion is authorized unless the owner explicitly requests it.

## Stage 4 QA Hold

Accepted implementation checkpoints remain:

Character Forge media bridge:

- SHA `824514fc6971cb2dd2a53bf84533b218922417e5`
- Actions `34692945279`
- 66 test files / 314 tests / 0 failures

Parchment Worlds complete durable-media candidate:

- SHA `38aa8c865e81b4826265bd4ec2aa69c5592ad0c9`
- Actions `34694067917`
- Job `103554608657`
- 58 test files / 203 tests / 0 failures
- production bundle green

Parchment docs/OKF head after Stage 4 handoff refresh:

- `0472df7fa6c4fbe8dfda578b2ff67993d48873c7`
- Actions `34694307628` green

Issue #16 contains the full primary-workstation checklist for D&D + BRP portrait/token add, replace, remove, reopen persistence, token editor cancel/accept, manual-token authority, explicit regeneration, keyboard sanity, JPEG/PNG, and native-state non-mutation.

Preserve the accepted Stage 4 ownership boundary while Stage 5 proceeds:

- Parchment owns media binaries, storage metadata, lifecycle, and character-media relationships;
- Character Forge consumes presentation media only;
- no media state enters CharacterDocument or D&D/BRP native state;
- user-supplied/accepted tokens remain authoritative until explicit replace/regenerate/remove.

## Stage 5 Target Versions

The first Foundry adapter is explicitly pinned to:

- Foundry VTT core: `14.367`
- Foundry D&D5e system: `6.0.0`
- Character Forge Foundry D&D Actor adapter: `0.2.0`
- export wrapper schema: `character-forge/foundry-dnd5e-actor-export/0.1`

Do not replace these pins with `latest`. Add later target profiles deliberately when compatibility evidence justifies them.

Foundry data remains an adapter target. Character Forge native D&D state remains canonical.

## Stage 5 Slice 1 - Actor Shell

Initial green checkpoint:

- SHA `ca345ca693ac269f4ca900160a2611f8ebb93a01`
- Actions `34696468544`

New package boundary:

`packages/foundry-adapter/src/`

The adapter:

- requires the primary native state to be D&D 5E 2024;
- validates through the existing D&D adapter before export;
- never routes D&D -> Foundry through Universal Grammar or a lowest-common-denominator projection;
- maps authoritative actor-level state into the pinned Foundry/D&D Actor shape;
- serializes deterministic, pretty import JSON;
- keeps adapter metadata/mapping notes outside the raw import document;
- retains a small `character-forge` flag with source character/native-state/version identity.

Actor-level mappings include abilities/saves, HP, flat authoritative AC, initiative bonus without double-counting Dexterity, movement, darkvision where present, alignment, XP, size, languages, currency, skills/expertise, spell slot counts, and a linked prototype-token shell.

## Stage 5 Slice 2 - Identity-Bearing Embedded Items

Current green checkpoint `3ebf7646...` advances the adapter to `0.2.0`.

The Actor now carries deterministic embedded identity Items for:

- Class -> Foundry `class` Item;
- Background -> Foundry `background` Item;
- Species -> Foundry `race` Item.

Properties:

- stable 16-character alphanumeric Foundry document IDs derived from source character + role + native identifier;
- Actor `details.originalClass`, `details.background`, and `details.race` point to those embedded IDs;
- Class retains native class identifier, level, hit-die denomination, and spent hit dice;
- all three retain identifiers and empty descriptions rather than copying Foundry rules text;
- advancement is explicitly empty;
- Class/Background starting-equipment automation is explicitly empty.

This is intentional: Character Forge is exporting an already-resolved authoritative character. Importing the identity Items must not replay Foundry advancement and double-apply choices.

## Explicitly Deferred Foundry Mappings

The adapter reports, rather than hides, remaining target gaps:

- equipment Items;
- feature/feat Items and their activities/resources;
- spell Items;
- explicit weapon/armor proficiency-key translation where needed;
- non-HP feature resources until their owning Items/activities exist;
- Parchment portrait/token media paths until the downloadable packaging layer has a durable Foundry-relative path.

AC remains flat/authoritative until armor/equipment Items are mapped well enough for Foundry to derive it honestly.

## Next Bounded Slice

Continue Stage 5 with a **bounded equipment Item mapping audit and proof**, not a broad catalog dump.

1. Inventory the Character Forge equipment IDs actually emitted by current D&D Level 1 generation paths.
2. Group them by real Foundry Item semantics (`weapon`, `equipment`, `consumable`, `tool`, `container`, `loot`, etc.).
3. Inspect the pinned D&D5e 6.0.0 schemas for only those touched types.
4. Map one representative coherent path first - preferably the existing Avery/Fighter fixture covering armor, weapons, ammunition/quantity, and pack/container or simple gear.
5. Preserve stable Item IDs and quantities.
6. Do not collapse unknown equipment into fake generic `loot` merely to make the export look complete; report unsupported IDs explicitly until their type contract is proven.
7. Keep AC flat until armor calculation parity is actually demonstrated.
8. Add deterministic tests and exact-SHA validation.

Do not add a primary creator UI export button until the exported artifact shape is sufficiently complete to be useful.

## Foundry Runtime / License Boundary

A Foundry license is not needed merely because Stage 5 is active.

Purchase/use the runtime when either:

- schema/API discovery can no longer be completed reliably from the public system sources; or
- the exporter/import artifact is mature enough that actual Foundry import behavior is the next blocker.

Real Foundry runtime acceptance remains a later explicit Stage 5 checkpoint and can be performed from the primary workstation alongside the deferred Stage 4 QA if convenient.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Universal Grammar remains future derived semantic/translation state with explicit loss/confidence.
- Profession is not class.
- Species is not synonymous with culture or language.
- Parchment owns portrait/token/media relationships and future generic cross-asset retrieval.
- Foundry Actor/Item documents are target artifacts, never canonical state.
- Export mappings must state unsupported/deferred semantics rather than fabricate them.
- Existing resolved Character Forge choices must not be replayed through Foundry advancement automation.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every Character Forge implementation milestone:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
