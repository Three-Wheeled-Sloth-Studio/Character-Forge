---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- browser-qa
- character-sheet
- productization
- roadmap
- prioritization
---
# Current Handoff

Date: 2026-09-11
Branch: `dev`
Active acceptance epic: GitHub Issue #14 - **Make BRP UGE a player-usable core character generator**

## Current State

The owner has approved an opinionated near-to-mid-term execution sequence after reviewing the newly captured product and engineering backlog.

The authoritative sequencing document is now:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

The broader roadmap remains useful as capability/history context, but the approved sequencing document governs what should come next unless later evidence or an explicit owner decision changes it.

No application code was changed during this documentation/prioritization cycle.

## Exact Green Implementation Checkpoint

The latest code checkpoint remains:

- SHA: `3e8a73a6e0e960967e08b49abb132f49fe9fd378`
- Actions: `34620261296`
- Job: `103332185790`
- `npm run verify`: green
- 59 test files
- 283 tests passed
- 0 failures
- 221 tracked paths
- 14 required project-memory files
- OKF: 28 concepts / 10 indexes at the implementation checkpoint
- Agent context: 4092 characters
- Build: `Character Forge build 0.0.1 3e8a73a6`

Later commits are documentation-only and require their own exact-head Verify before being called green.

## Owner-Approved Stage Order

1. **Stage 0 - Close current player-usable acceptance**
2. **Stage 1 - Engineering health and refactoring**
3. **Stage 2 - Productization and branding**
4. **Stage 3 - Name generator and random tables**
5. **Stage 4 - Durable portrait and token assets**
6. **Stage 5 - Foundry export/import validation**
7. **Stage 6 - Universal Grammar v0.1**
8. **Stage 7 - Third-system stress test**
9. **Stage 8 - Proprietary RPG implementation**
10. **Stage 9 - Rich VTT push/update/synchronization**

A small Investigative Horror increment may fit opportunistically around Stages 3-4 when it can consume the new random-table/profile infrastructure without becoming a large detour.

## Stage 0 - Immediate Work

The next implementation thread should resume with the current acceptance boundary rather than reopening roadmap prioritization.

Known Stage 0 work:

- D&D real-browser/print pagination still splits a representative low-complexity character unnecessarily even though it should fit on one page;
- perform equivalent BRP sheet pagination/sanity confirmation after the shared fix;
- complete the BRP/D&D primary-UI minimalism sweep;
- define safe system-switch semantics so changing rules systems never leaves a generated character from the previous system presented as current;
- until real translation exists, clear/separate honestly rather than pretending to translate;
- complete BRP Issue #14 through `create -> finish -> review -> save -> reopen -> print/export`.

Do not pull branding, durable asset persistence, Foundry, Universal Grammar, or large new content into Stage 0 unless a concrete acceptance blocker genuinely requires it.

## Stage 1 - Engineering Health

Immediately after acceptance, run the bounded cleanup/refactoring pass in:

`refs/planning/engineering-health-cleanup.md`

This is intentionally early. Rapid vertical slicing has accumulated enough evidence that stale tests, transitional scaffolding, responsibility drift, and accidental monoliths should be addressed before another major architecture layer is added.

Do not use arbitrary line-count limits. Split by coherent responsibility and preserve valuable regression/native-state guarantees.

## Stage 2 - Productization / Branding Clarification

Shared branding assets now live under:

`Three-Wheeled-Sloth-Studio/TWS-Design-Principles/Branding/`

Application-shell/product branding should become externally presentable before broader demos/shopping.

On the character sheet itself:

- Project/Campaign identity remains primary;
- a very small, unobtrusive studio logo or wordmark is allowed if it fits naturally;
- that studio mark must never compete with character data, campaign identity, or play scanning;
- treat it as a maker's mark, not dominant branding.

Also include user-facing `version:build:revision` identity for Character Forge and a corresponding parent Parchment Worlds version pill while retaining exact SHA provenance internally.

## Stage 3 - Name Generation Clarification

The future name generator must not become a larger fixed word-list mashup.

Target a broad, distinctly flavored generation space using a probabilistic / Markov-style generation step or comparable sequence mechanism that captures phonotactic patterns.

Keep separate:

- generation mechanism;
- corpus/pattern data;
- naming context;
- culture/language inputs;
- post-generation constraints;
- deterministic seed/provenance.

Design the seam now with the explicit expectation that future language and culture generators will inform names through phonology, phonotactics, morphology, orthography, naming conventions, family-name structure, honorifics, region/social variation, and similar context.

Species is not culture or language.

BRP free-text flavor fields remain a good first proving ground for the system-neutral random-table companion in the same stage.

## Media / Foundry Direction

Preferred later sequence:

```text
Parchment-owned character assets
    -> clickable portrait workflow
    -> generated token suggestion + quick edit
    -> manual token import/override
    -> Foundry export/import artifact
    -> real Foundry validation
    -> later push/update
    -> later bidirectional synchronization
```

Once a user explicitly supplies a token, that token should remain authoritative until the user asks to regenerate it.

Purchase a Foundry license when the export/import artifact is mature enough that real runtime import validation is the next blocker, or earlier only if reliable schema/API discovery requires it.

## Universal Grammar / System Expansion Direction

After Foundry export validation, begin an evidence-backed Universal Grammar v0.1 from D&D + BRP rather than attempting a complete universal ontology.

Then use a structurally different third system to attack that concrete model before major proprietary-RPG implementation.

Native system state remains canonical and lossless. Universal Grammar is derived semantic/translation state with explicit loss/confidence.

## Primary UI Product Rule

> Nothing belongs in the primary creator UI unless it provides immediate player or GM value for the current task.

Apply this to both BRP and D&D:

- remove permanent explanatory prose;
- do not advertise absent/future features;
- move occasional explanation behind compact help/info affordances;
- use concise status/icon treatment where state is sufficient;
- show detail when invalid or explicitly requested;
- keep choices, state, and immediate play/GM value primary.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Universal Grammar is derived semantic/translation state.
- Profession is not class.
- Shared sheet code owns presentation mechanics only.
- System packages own system-specific play hierarchy and calculations.
- Screen and print share the same play-focused information architecture.
- Project/Campaign identity owns primary sheet branding; a tiny subordinate studio maker's mark is acceptable.
- Portrait/token/VTT metadata belongs to Parchment-owned asset relationships, not RPG native state.
- Foundry Actor/Item data remains an adapter target.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Branch / Promotion Boundary

Work directly on Character Forge `dev`.

Promoted branches remain unchanged unless explicitly requested:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not promote either branch implicitly.

## Validation

For every implementation milestone:

```bash
npm run verify
```

Do not call a Character Forge milestone green unless the exact committed SHA passes GitHub Actions.
