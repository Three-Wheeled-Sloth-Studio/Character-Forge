---
type: Architecture Contract
title: Hosted Deferred Stunt Persistence v1
tags:
- character-forge
- persistence
- deferred-choice
---
# Hosted Deferred Stunt Persistence v1

Date: 2026-11-21. Scope: bounded Fate Condensed Stunt maintenance on dev.

## Ownership and storage

Character Forge owns the complete CharacterDocument, Fate native validation,
Stunt selection and append-only CharacterLifecycle. Parchment owns asset identity,
project lifecycle, synchronization, revisions and durable storage. Native state is
never reconstructed from Universal Grammar. No Foundry, D&D or BRP mechanics change.

The existing `pworld.character-asset.v1` payload gains optional `lifecycle` JSON
beside `document`. Missing history is supported: Character Forge initializes an
empty in-memory ledger and persists it on the first explicit deferral/selection.
No database migration or parallel character database is needed. Project export and
sync carry both fields as one asset record. Existing conflict review remains required.

`IndexedDbProjectModelProvider.updateProject` runs a synchronous transform under
one read/write transaction spanning `projects` and `revisions`. The service checks
archive/conflict state and expected character revision inside that lock; validation,
current-document put and revision-snapshot put either all commit or all abort.
The promise resolves only on transaction completion. Unrelated current project assets
are retained. `runUnitOfWork` is still not a general transaction API and the provider
continues to advertise `supportsTransactions: false` for that broader interface.

Updates to existing characters require `expectedRevision` (except unchanged legacy
idempotent saves). New saves use revision 0. Lifecycle storage enforces matching
identity, append-only history, unique/ordered event IDs, native link existence,
retained prior native states and generation provenance. These are storage invariants,
not an independent Fate rules engine. The trusted embedded Character Forge build
validates Fate before sending a proposal. This is not server-side anti-cheat validation.

## Versioned messages

All messages use `{ type, payload }`. Receivers require both exact source Window and
origin. Replies use the exact trusted origin, never wildcard routing.

| Type | Payload |
| --- | --- |
| `character-forge:lifecycle-context:v1` | projectId, assetId, characterId, numeric revision, document, lifecycle (null for legacy) |
| `character-forge:lifecycle-save:v1` | requestId, projectId, assetId, characterId, numeric expectedRevision, document, lifecycle |
| `character-forge:lifecycle-result:v1` | requestId, projectId, assetId, characterId, ok; on success revision/document/lifecycle, on failure error |

The host requires the active project, asset and character to match before saving.
Character Forge correlates replies by all identities and request ID, and updates its
cache/display only after a successful durable response. A 15-second missing response
is explicitly uncertain: the player must reopen to establish whether the save committed.
Malformed messages are ignored; valid requests with wrong active identity get errors.
Old hosts do not expose lifecycle controls because they do not send v1 context.

## Player and GM surfaces

Fate Condensed is selectable in the existing creator workspace. Its bounded manual
creator accepts original aspects and a first Stunt, with an editable skill pyramid.
The existing probe adapter remains authoritative; this is not a complete Fate catalog.
The saved sheet displays aspects, skills, Stunts, points, stress and consequences.

An unfilled slot exposes a compact disclosure with original-Stunt text, accept/save
and leave-deferred icons with accessible names/tooltips. Blank input remains visible
with a red actionable error. Saving disables actions; green feedback follows durable
acknowledgment. Opening/deferring/selecting a new choice can be staged in the Fate
adapter and committed once. Leaving an already-deferred choice alone is a no-op.
A secondary read-only GM disclosure shows availability, deferrals, experiences,
selections, retained native revisions and full event provenance. No advancement editor
or automatic progression is included.

## Validation and manual acceptance

Required gates: Character Forge `npm run verify`; Parchment `npm run verify:metadata-only`.
The browser smoke runner is `tools/character-lifecycle-browser-smoke.mjs` in Parchment.
It requires local Parchment on 5273, the sibling Character Forge build/server on 5174,
and Playwright (optionally supplied with PLAYWRIGHT_MODULE and CHROMIUM_PATH).
Run `node tools/character-lifecycle-browser-smoke.mjs`. It uses an isolated browser
context with synthetic local data, exercises the real iframe and IndexedDB, and never
signs in or touches the owner's browser profile. SMOKE_SCREENSHOT can set its output
path. Do not commit generated screenshots or machine-local configuration.

Automated browser testing is separate from owner/manual acceptance. Manual checklist:

1. Start current dev builds; open a local Parchment project with System Agnostic or Fate rules.
2. Open Character Forge, select Fate Condensed, enter a name, five original Aspects and a first original Stunt. Review/edit the skill pyramid; create and Save to project.
3. Expand Stunt available. Choose the clock icon to leave the choice deferred; require green project-storage confirmation.
4. Return to the project, Open in Character Forge, then reload. Confirm the choice is still available and GM inspection reports deferred.
5. Expand the choice and accept blank text. Confirm a red description error, retained editor and unchanged native sheet/history.
6. Enter an original Stunt and accept. Confirm saving indication, green saved feedback and immediate sheet update without navigation.
7. Reopen/reload. Confirm the Stunt, previous native state, generation provenance and ordered opening/deferral/assessment/selection/link events remain in GM inspection.
8. Open the same saved character in two tabs. In one, accept the remaining slot. Attempt a competing save from the older tab: require a reopen/conflict error and retained text with no overwrite.
9. Confirm no choice is offered once all three slots are filled. Duplicate selection of a completed choice is also covered by adapter regression tests.
10. Check keyboard activation, disclosure focus, narrow/mobile layout, and green/red/orange feedback. Try an archived project or a project with unresolved sync conflict and require a clear save rejection.

Limitations: manual owner acceptance and genuine cross-device sync QA remain pending;
Fate remains the existing bounded probe, with authored Stunt text validated structurally
rather than adjudicated for fictional/mechanical balance. GM inspection is a secondary
read-only surface, not role-based authorization. Broader asset services retain their
existing persistence APIs; the new atomic transform is the character save boundary.
Next slice: owner acceptance and any resulting UX fixes, then broader source-owned
choice consumers only when justified by concrete system requirements.
