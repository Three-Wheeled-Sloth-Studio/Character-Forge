---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- durable-assets
- portrait
- token
- stage-4
- acceptance
---
# Next Development Prompt

Continue coordinated implementation/QA in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

and:

`https://github.com/Three-Wheeled-Sloth-Studio/Parchment-Worlds`

Work directly on `dev` only. Do not promote Character Forge `qa` or `main` unless explicitly requested. Do not begin Stage 5 until Stage 4 browser acceptance is complete.

The owner-approved sequence remains:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Stages 0 through 3 are complete. Stage 4 is a **feature-complete candidate with owner/browser QA pending**.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 4 durable portrait token browser acceptance"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/owner-approved-priority-sequence-2026-09-11.md`
3. Character Forge `apps/web/src/characterForgeHostBridge.ts`
4. Character Forge `apps/web/src/characterResultRenderer.ts`
5. Parchment `refs/handoffs/currentHandoff.md`
6. Parchment `apps/web/src/modules/character-forge/CharacterMediaHost.tsx`
7. Parchment `apps/web/src/modules/character-forge/CharacterTokenEditor.tsx`
8. Parchment `apps/web/src/projects/data/CharacterMediaService.ts`

Do not reread repository history or reopen Stage 3 work.

## Exact Green Stage 4 Implementation Checkpoints

Character Forge:

- SHA: `824514fc6971cb2dd2a53bf84533b218922417e5`
- Actions: `34692945279`
- Job: `103551334264`
- 66 test files / 314 tests / 0 failures
- 243 tracked paths
- 14 required project-memory files
- OKF: 32 concepts / 10 indexes
- agent context: 3865 characters
- build: `Character Forge build 0.0.1 824514fc`

Parchment Worlds:

- SHA: `38aa8c865e81b4826265bd4ec2aa69c5592ad0c9`
- Actions: `34694067917`
- Job: `103554608657`
- 58 test files / 203 tests / 0 failures
- production bundle green
- existing bundle-size warning nonblocking

Character Forge promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

## Stage 4 Implemented Shape

Preserve these boundaries during QA/fixes:

- Parchment `custom:media` assets own portrait/token media identity and lifecycle.
- `character.portrait` / `character.token` relationships attach media to character assets.
- browser-local bytes live in Parchment's IndexedDB media store outside project JSON.
- canonical manifestations use opaque provider refs + content hashes, never raw paths/object URLs/base64 identity.
- Character Forge receives ephemeral presentation bytes and turns them into temporary object URLs only for rendering.
- no media state enters CharacterDocument or native D&D/BRP payloads.
- manual/accepted token remains authoritative until explicit replacement, regeneration, or removal.

Supported manual media imports: PNG, JPEG, WebP, SVG, <= 10 MB.

Implemented token flow:

`portrait -> Create token from portrait -> zoom/pan + round/square editor -> explicit Accept -> durable PNG token`

Cancel must make no durable change.

## Immediate Work - Integrated Browser Acceptance

Do not add more architecture before exercising the real flow.

Validate in a real browser from project-scoped Parchment using current `dev` checkouts:

1. Persisted D&D character -> click empty portrait region -> select portrait -> verify immediate render.
2. Reopen -> portrait remains.
3. Replace portrait -> reopen -> replacement remains.
4. Create token from portrait -> exercise zoom, horizontal/vertical pan, round/square, Reset.
5. Cancel -> verify no token is created/replaced.
6. Create again -> Accept -> verify immediate token render and reopen persistence.
7. Click token region -> import a manual token -> verify explicit replacement.
8. Replace portrait -> verify the manual token is not silently replaced.
9. Explicitly choose Regenerate token from portrait -> verify replacement only after Accept.
10. Remove portrait and token independently -> reopen -> verify relationships remain removed.
11. Repeat representative persisted BRP character checks to prove the media path is system-neutral.
12. Inspect/save/reopen CharacterDocument before/after media operations and verify RPG-native state is unchanged.
13. Exercise keyboard activation for portrait/token sheet slots.
14. Sanity-check the token editor at a narrow/mobile viewport.

Fix only concrete acceptance defects exposed by this flow. Preserve the current ownership model unless the runtime evidence proves a real boundary flaw.

## Stage 4 Closure Rule

If the integrated acceptance flow passes, update project memory to mark Stage 4 complete and enter:

**Stage 5 - Foundry Export / Import Validation**

Do not automatically promote `qa`/`main` during closure.

## Stage 5 Preview - Parked Until Acceptance

After Stage 4 closure:

1. bounded Foundry adapter;
2. authoritative Character Forge -> Foundry Actor/embedded Item mapping;
3. pin supported Foundry/game-system versions;
4. deterministic fixtures;
5. downloadable import artifact; and
6. real Foundry runtime validation when it becomes the next blocker.

Foundry schemas are adapter targets, not canonical state.

## Guardrails

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Portrait/token/media ownership belongs to Parchment asset relationships, not RPG native state.
- Project/campaign context remains authoritative upstream.
- User-supplied or accepted tokens remain authoritative until explicit replacement/regeneration/removal.
- Foundry remains a later adapter target.
- Do not pull Issue #15 into Stage 4 unless it becomes a blocker.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For Character Forge changes:

```bash
npm run verify
```

For Parchment changes, use its repository exact-SHA validation gate.

Do not call any milestone green unless its exact committed SHA passes GitHub Actions.
