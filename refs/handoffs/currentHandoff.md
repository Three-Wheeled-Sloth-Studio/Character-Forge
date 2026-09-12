---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- durable-assets
- portrait
- token
- stage-4
- roadmap
---
# Current Handoff

Date: 2026-09-12
Branch: `dev`
Current stage: **Stage 4 - Durable Portrait and Token Assets (feature-complete candidate; owner/browser QA pending)**

## Current State

Stages 0, 1, 2, and 3 are complete.

Stage 4 implementation is now complete enough for owner/browser acceptance. Do not begin Stage 5 until the integrated portrait/token workflow has been exercised and accepted.

The authoritative stage order remains:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Issue #15 remains parked and nonblocking.

## Exact Green Character Forge Stage 4 Checkpoint

Accepted `dev` implementation head:

- SHA: `824514fc6971cb2dd2a53bf84533b218922417e5`
- Actions: `34692945279`
- Job: `103551334264`
- `npm run verify`: green
- 66 test files
- 314 tests passed
- 0 failures
- 243 tracked paths
- 14 required project-memory files
- OKF: 32 concepts / 10 indexes
- Agent context: 3865 characters
- Build: `Character Forge build 0.0.1 824514fc`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

No promotion is authorized unless the owner explicitly requests it.

## Exact Green Parchment Worlds Companion Checkpoint

The complete durable-media Stage 4 candidate is coordinated in Parchment Worlds `dev`:

- SHA: `38aa8c865e81b4826265bd4ec2aa69c5592ad0c9`
- Actions: `34694067917`
- Job: `103554608657`
- `npm run verify:metadata-only`: green
- 58 test files
- 203 tests passed
- 0 failures
- production Vite bundle green
- existing `>500 kB` bundle warning remains nonblocking

Parchment project-memory was refreshed after that implementation checkpoint; treat `38aa8c...` as the exact Stage 4 implementation candidate.

## Stage 4 Ownership Boundary

The architecture audit resolved portrait/token ownership cleanly:

- portrait/token are independent Parchment `custom:media` assets;
- characters point to them through `character.portrait` and `character.token` relationships;
- the relationship records selection authority;
- Parchment owns binary storage, identity, lifecycle, revision, provenance, rights, and relationships;
- Character Forge consumes ephemeral presentation context only;
- CharacterDocument and native D&D/BRP state remain unchanged.

Do not add media IDs, file paths, base64, object URLs, upload URLs, or VTT-specific IDs to RPG native state.

## Durable Media Storage

Parchment stores browser-local media bytes in a dedicated IndexedDB media store outside project JSON.

Canonical manifestations retain only durable product/storage metadata such as:

- opaque provider identity;
- provider scope;
- opaque external ID;
- content hash; and
- manifestation kind.

Supported portrait/token imports now include PNG, JPEG, WebP, and SVG up to 10 MB.

## Character Forge Host Bridge

Character Forge now supports a narrow trusted host-media protocol:

- media context from Parchment supplies portrait/token bytes for presentation;
- portrait/token sheet regions become keyboard-accessible add/replace surfaces only when a Parchment host is present;
- role requests go back to the trusted Parchment origin;
- received bytes become temporary browser object URLs for sheet rendering;
- temporary URLs are presentation-only and never enter CharacterDocument.

Standalone Character Forge remains storage-agnostic.

## Parchment Hosted Interaction

Parchment owns the actual interaction and persistence:

- hidden file picker and validation;
- durable save/replace;
- role relationship removal;
- reload/reopen media resolution;
- project lifecycle/sync guards; and
- trusted context delivery back to Character Forge.

Removing a role withdraws the active relationship without deleting retained media/history.

## Token Suggestion / Editor

The owner-approved product hypothesis is now implemented:

`portrait -> Create token from portrait -> quick crop/frame editor -> Accept token`

The editor supports:

- deterministic cover-crop math;
- zoom;
- horizontal and vertical positioning;
- round or square framing;
- Reset;
- Cancel with no persistence; and
- explicit Accept that encodes/persists a PNG token.

A manual/imported token is never silently replaced. Regeneration is an explicit user action. Once a generated suggestion is explicitly accepted, that selected token is authoritative until explicit replace/regenerate/remove.

## Native-State Guardrail

All Stage 4 media behavior must preserve:

- full CharacterDocument round trip;
- primary native state identity;
- D&D/BRP native payloads;
- generation provenance; and
- native validation behavior.

Media is presentation/project state, not RPG-native state.

## Owner / Browser QA Required Before Stage 4 Closure

Use current Character Forge and Parchment Worlds `dev` builds and run this integrated acceptance path:

1. Open a persisted D&D character from a project and add a portrait from the sheet portrait region.
2. Reopen and confirm portrait persistence.
3. Replace the portrait and confirm replacement persistence.
4. Choose `Create token from portrait`; exercise zoom, horizontal/vertical positioning, round/square, and Reset.
5. Cancel and confirm no token mutation.
6. Reopen the editor, Accept, reopen the character, and confirm token persistence.
7. Import a manual token and confirm it replaces the accepted generated token only by explicit action.
8. Confirm portrait replacement does not silently replace a manual token; regeneration remains explicit.
9. Remove portrait and token individually, reopen, and confirm active relationships stay removed.
10. Repeat representative media persistence/presentation with BRP to prove the path is system-neutral.
11. Inspect/save/reopen CharacterDocument and confirm native state remains unchanged by media operations.
12. Sanity-check keyboard activation and compact/mobile token-editor behavior.

If this passes without material defects, formally close Stage 4 and enter **Stage 5 - Foundry Export / Import Validation**.

## Stage 5 Boundary - Do Not Start Yet

Once Stage 4 is owner-accepted, Stage 5 remains the next approved work:

1. bounded Foundry adapter;
2. authoritative Character Forge -> Foundry Actor/embedded Item mapping;
3. pin supported Foundry/game-system versions;
4. deterministic fixtures;
5. downloadable import artifact; and
6. real Foundry runtime validation when that becomes the next blocker.

Foundry data remains an adapter target, not canonical state.

## Future Generic Parchment Asset Retrieval Boundary

Keep the future generic Parchment API direction:

`(assetType, assetId) -> authorization/membership/revision -> canonical serializable asset`

The Stage 4 media architecture now fits that boundary without flattening module-owned CharacterDocument state.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Universal Grammar remains future derived semantic/translation state with explicit loss/confidence.
- Profession is not class.
- Species is not synonymous with culture or language.
- Shared generator code owns reusable mechanics, not system/culture semantics.
- Project/Campaign identity owns primary sheet branding.
- Portrait/token/VTT metadata belongs to Parchment-owned asset relationships, not RPG native state.
- Foundry Actor/Item data remains an adapter target.
- Parchment owns future generic cross-asset retrieval.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every Character Forge implementation milestone:

```bash
npm run verify
```

For coordinated Parchment work, use its exact committed SHA and repository validation gate.

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
