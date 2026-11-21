---
type: Validation Record
title: Deferred Stunt Integration Validation 2026-11-21
tags:
- testing
- character-forge
- deferred-choice
---
# Deferred Stunt Integration Validation 2026-11-21

Starting remote/local dev heads confirmed clean and equal:

- Character Forge: `0b90899213f8a156350ce6b1724e42ce4f96f44e`.
- Parchment Worlds: `bc28a81b564100f94d721769835c6b189f45e285`.

## Local verification

- Character Forge `npm run verify`: passed, 74 test files, 367 tests;
  paths, refs/OKF, bounded context, strict TypeScript and web build passed.
- Parchment `npm run verify:metadata-only`: passed, 63 test files, 219 tests;
  metadata starter, refs/OKF, source size, TypeScript and production bundle passed.
  Existing nonblocking production bundle warning above 500 kB remains.
- Real Chromium automated browser smoke passed against the local Parchment and
  Character Forge servers, in a fresh isolated browser context with synthetic data:
  create project/character, initial legacy-compatible save, defer, reopen, blank
  Stunt rejection with editor retained, selection, immediate native display,
  exact previous native state/generation preservation, ordered lifecycle history,
  competing stale-tab rejection with draft text retained, full page reload and GM
  inspection. No page errors. This is automated browser evidence, not owner QA.

## Added regression coverage

Character Forge: `lifecycleHostStore.test.ts` covers missing history, reply identity,
request correlation, durable acknowledgment timing, failed save, stale revision,
concurrent requests, uncertain timeout and unsupported history. `deferredStunt.test.ts`
adds the player action's single-write opening/selection, blank-input rollback, and
no-op repeat deferral; existing tests cover invalid/duplicate choice and native revisions.

Parchment: `CharacterLifecyclePersistence.test.ts` covers legacy upgrade, deferred
save/reopen, linked selection retention, generation/native history, two concurrent IDB
connections, rollback after the current-document put when revision put fails,
archive/conflict checks inside the transaction, append-only/identity/native-link guards.
`characterLifecycleEmbed.test.ts` covers origin/source, version, malformed revision,
project/asset/character identity, delayed durable completion and persistence failure.
`tools/character-lifecycle-browser-smoke.mjs` provides the actual hosted reload test.

## Acceptance and limitations

Owner/manual acceptance is pending. Use the checklist in
`refs/architecture/hosted-deferred-stunt-persistence-v1.md`. Genuine cross-device sync
conflict QA remains separately pending. No qa/main promotion or Foundry work occurred.
The next recommended slice is owner acceptance and evidence-backed fixes before
expanding advancement consumers. Fate remains the bounded original-text probe.

## Committed checkpoints

Implementation SHA and GitHub validation evidence are appended after commit.
