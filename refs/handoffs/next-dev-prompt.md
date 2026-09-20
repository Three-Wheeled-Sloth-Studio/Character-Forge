---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- foundry
- stage-5
- export
- download
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

Stage 5 - Foundry Export / Import Validation is active. Stage 4 integrated portrait/token browser QA remains deferred to the owner's primary workstation and pinned in Issue #16; it does not block Stage 5 development.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 5 downloadable Foundry D&D5e Actor import JSON"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/owner-approved-priority-sequence-2026-09-11.md` - Stage 5 only
3. `packages/foundry-adapter/src/dnd5eActor.ts`
4. `packages/foundry-adapter/src/dnd5eActor.test.ts`
5. `apps/web/src/characterSheetControls.ts`
6. `apps/web/src/characterResultRenderer.ts`
7. directly relevant existing web tests only; add a focused controls/download test rather than broadening unrelated suites

Do not reread repository history or reopen completed equipment mapping work.

## Exact Green Implementation Checkpoint

- SHA: `bc1e12d6a1434ef8d7003f922140a808896740f9`
- Actions: `35532475018`
- Job: `106135408145`
- 68 test files / 339 tests / 0 failures
- 251 tracked paths
- 14 required project-memory files
- OKF 33 concepts / 10 indexes
- agent context 3574 characters
- build: `Character Forge build 0.0.1 bc1e12d6`
- Foundry adapter: `0.17.0`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Current Stage 5 State

The pinned target remains:

- Foundry VTT `14.367`
- D&D5e `6.0.0`

The current Level 1 equipment audit is complete: all 48 literal IDs plus 27 dynamic prefixed tool/instrument IDs have supported mappings.

The Actor adapter already exposes:

```ts
exportCharacterToFoundryDnd5eActor(character)
serializeFoundryDnd5eActorDocument(exported)
```

The serializer returns only the raw Foundry Actor document JSON, with a trailing newline. It intentionally excludes Character Forge wrapper metadata such as `mappingNotes` and `schemaVersion`.

## Immediate Work - Downloadable Foundry Import Artifact

Add a D&D-only toolbar action that downloads the existing serialized Foundry Actor document.

Required behavior:

- action label/title: `Download Foundry D&D5e import JSON`;
- action is visible for a valid primary D&D 5E 2024 character;
- action is absent for BRP and unsupported systems;
- use `exportCharacterToFoundryDnd5eActor(character)` followed by `serializeFoundryDnd5eActorDocument(...)`;
- download MIME type `application/json;charset=utf-8`;
- stable sanitized filename: `<character-slug>-foundry-dnd5e.json`;
- use the existing Blob + `URL.createObjectURL` + hidden anchor pattern;
- revoke the object URL after triggering the download;
- keep existing CharacterDocument Copy JSON and Download JSON actions unchanged;
- report a concise toolbar status on success/failure rather than surfacing an uncaught UI exception.

Prefer a small pure filename helper and reuse/factor the existing slug logic rather than duplicating divergent sanitization.

Do not add adapter wrapper metadata to the downloaded file. Foundry import receives the raw Actor document only.

Do not bump the Foundry adapter version merely for browser download wiring unless the exported Actor document shape itself changes.

## Coverage

Add focused deterministic tests proving:

- repeated serialization of the same character is byte-identical;
- the artifact parses to the exact adapter `document`;
- `mappingNotes`, `schemaVersion`, and `character-forge/foundry-dnd5e-actor-export/0.1` are absent from the downloaded import JSON;
- the stable filename ends in `-foundry-dnd5e.json` and uses the same sanitized character slug behavior as CharacterDocument download;
- D&D controls include the Foundry action;
- BRP controls do not include it;
- the existing generic CharacterDocument download remains available.

Use the narrowest test surface that proves browser download wiring. Do not create a large UI integration harness if pure/control-level tests suffice.

Then run exact-SHA GitHub Actions `Verify`.

## Do Not Pull Forward Yet

Do not combine this slice with:

- Healer's Kit Stabilize activity automation;
- general feature/activity Items;
- spell Items;
- Parchment portrait/token packaging;
- real Foundry runtime import acceptance;
- one-click Foundry push/update; or
- bidirectional Foundry synchronization.

Once the downloadable artifact is green, real Foundry import testing becomes the next major Stage 5 blocker. At that point reevaluate the owner-approved Foundry-license purchase trigger; do not claim runtime acceptance before an actual Foundry import test.

## Guardrails

- Native system state is mandatory and lossless.
- Native D&D state remains canonical.
- Foundry Actor/Item data remains an adapter target.
- Do not project through Universal Grammar.
- No copied Foundry compendium prose.
- No Foundry advancement replay for already-resolved Character Forge choices.
- Do not fabricate fallback equipment.
- Actor AC remains flat until calculation parity is separately proven.
- Preserve exact-SHA `dev -> qa -> main` promotion.
- Keep Issue #16 pinned for deferred Stage 4 owner/browser QA.

## Validation

```bash
npm run verify
```

Do not call the slice green until the exact committed SHA passes GitHub Actions.
