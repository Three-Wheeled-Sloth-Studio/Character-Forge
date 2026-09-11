---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- productization
- branding
- roadmap
- prioritization
---
# Current Handoff

Date: 2026-09-11
Branch: `dev`
Current stage: **Stage 2 implementation complete; visual acceptance pending**

## Current State

Stage 0 player-usable acceptance and Stage 1 engineering-health/refactoring are complete.

Stage 2 productization/branding implementation is now complete in code across Character Forge and the Parchment-hosted shell. The only remaining Stage 2 acceptance item is a short owner browser visual check of the final branding treatment. Do not reopen the Stage 2 architecture unless that check finds a concrete problem.

The authoritative stage order remains:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Do not reopen prioritization without materially new evidence.

Two explicitly nonblocking BRP polish items remain parked in Issue #15:

- equipment info interaction should not toggle the equipment checkbox; and
- a legal natural/base skill rating above the normal starting cap should not be styled as a cap violation.

Do not pull Issue #15 ahead of the approved sequence unless it becomes a blocker or the owner explicitly asks.

## Character Forge Exact Green Implementation Checkpoint

Accepted `dev` implementation head before this documentation refresh:

- SHA: `0b0a4059e30b7f07a1b28a2c93e2ba29d6652cf5`
- Actions: `34637862811`
- Job: `103390045147`
- `npm run verify`: green
- 63 test files
- 299 tests passed
- 0 failures
- 236 tracked paths
- 14 required project-memory files
- OKF: 32 concepts / 10 indexes
- Agent context: 3765 characters
- Build: `Character Forge build 0.0.1 0b0a4059`

Promoted Character Forge branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

No promotion is authorized unless the owner explicitly requests it.

## Stage 2 Companion Parchment Checkpoint

Parchment Worlds `dev` has the corresponding parent-shell branding implementation:

- SHA: `1eb8714849e0aa45384cdf0ca582649254544b96`
- Actions: `34647328140`
- Job: `103421124752`
- 54 test files
- 184 tests passed
- 0 failures
- production Vite bundle green

The owner added the canonical Three-Wheeled Sloth branding assets under `Parchment-Worlds/Branding/`. The Parchment shell now packages those same canonical Git blobs into `apps/web/public/branding/`, uses the TWS Studio logo with underlay as the far-left maker mark in the global header, and uses the TAGS logo as the favicon. There is no external runtime dependency on the design-principles repository.

## Stage 2 Completed Work

1. Audited current Character Forge and Parchment shell identity against the shared studio UI guidance.
2. Confirmed the current World Forge visible version convention is a quiet semantic version badge (`v0.3.81` on current World Forge `dev`) while commit provenance remains separate.
3. Character Forge now shows a quiet user-facing `v0.0.1` badge while preserving full commit/build provenance in the tooltip.
4. Character Forge shell now carries subordinate `Three-Wheeled Sloth Studio` identity without competing with product identity.
5. Parchment Worlds now has its own parent-shell build/version identity (`v0.2.0`) with source commit provenance retained separately.
6. Parchment now consumes the canonical TWS branding assets locally from the repo and packages them into the web build.
7. Parchment global header now uses the canonical TWS Studio logo with underlay at the far upper left; favicon/product-icon treatment uses the canonical TAGS logo.
8. Audited duplicate project/campaign inputs. BRP `Campaign / rules profile` is mechanical BRP rules configuration, not duplicate Parchment project metadata, and remains correctly owned by Character Forge.
9. No RPG-native schema, generation, persistence, print, or translation semantics changed during Stage 2.

## Stage 2 Final Browser Check

Verify only the final presentation boundary:

- the TWS Studio underlay logo appears cleanly at the far upper left of the Parchment header;
- Parchment product title remains clear and visually primary as the product identity;
- the browser favicon uses the TAGS logo;
- Parchment shows the quiet `v0.2.0` build badge;
- embedded Character Forge still shows its quiet `v0.0.1` badge and subordinate studio identity without duplicated/loud branding;
- no shell layout regression is visible on the Character Forge route.

If those checks pass, close Stage 2 and begin Stage 3 without another productization pass.

## Stage 3 Next Direction

Stage 3 is **Name Generator and Random Tables**.

Start with a bounded architecture pass. Do not expand the existing placeholder name corpus into a larger fragment list.

Name generation should be designed around a probabilistic / Markov-style sequence mechanism or comparable phonotactic model, with deterministic seed/provenance and clean separation of:

- generation mechanism;
- reference/training corpora or pattern data;
- naming context;
- culture/language inputs;
- post-generation constraints/validation.

Future language and culture generators must be able to inform naming. Species is not synonymous with culture or language.

For the random-table companion, use editable BRP flavor fields as an early system-neutral proving ground: build/size, appearance, mannerisms, reputation, background, distinctive details, and similar optional inspiration surfaces. Suggestions must feed ordinary generation decisions rather than bypassing native state.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Universal Grammar remains future derived semantic/translation state with explicit loss/confidence.
- Profession is not class.
- Shared sheet code owns presentation mechanics only.
- System packages own system-specific play hierarchy and calculations.
- Screen and print share the same play-focused information architecture.
- Sheets use adaptive density: one page when content comfortably fits, two when genuinely needed.
- Project/Campaign identity owns primary sheet branding.
- Portrait/token/VTT metadata belongs to Parchment-owned asset relationships, not RPG native state.
- Foundry Actor/Item data remains an adapter target.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Validation

For every Character Forge implementation milestone:

```bash
npm run verify
```

Do not call a Character Forge milestone green unless the exact committed SHA passes GitHub Actions.
