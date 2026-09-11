---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
- name-generation
- random-tables
- stage-3
- roadmap
---
# Current Handoff

Date: 2026-09-11
Branch: `dev`
Current stage: **Stage 3 - Name Generator and Random Tables**

## Current State

Stages 0, 1, and 2 are complete.

The owner visually accepted the final Stage 2 branding treatment on 2026-09-11. Do not reopen general productization/branding work without a concrete new defect.

The authoritative stage order remains:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Two explicitly nonblocking BRP polish items remain parked in Issue #15. Do not pull them ahead of the approved sequence unless they become blockers or the owner explicitly asks.

## Exact Green Stage 3 Checkpoint

Current accepted `dev` implementation head:

- SHA: `7b535143e188dd26d1ff41f6517adffd9dc3d7b4`
- Actions: `34647775925`
- Job: `103422558786`
- `npm run verify`: green
- 64 test files
- 304 tests passed
- 0 failures
- 238 tracked paths
- 14 required project-memory files
- OKF: 32 concepts / 10 indexes
- Agent context: 3735 characters
- Build: `Character Forge build 0.0.1 7b535143`

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

No promotion is authorized unless the owner explicitly requests it.

## Stage 2 Closed

Final Parchment branding checkpoint:

- SHA: `1eb8714849e0aa45384cdf0ca582649254544b96`
- Actions: `34647328140`
- Job: `103421124752`
- 54 test files / 184 tests / 0 failures
- production bundle green

Accepted final treatment:

- canonical TWS Studio logo with underlay at the far upper left of the Parchment global header;
- TAGS logo as favicon;
- quiet Parchment `v0.2.0` and Character Forge `v0.0.1` version identity;
- Character Forge retains subordinate studio text identity rather than duplicating the parent shell's visual maker mark.

## Stage 3 Architecture Audit

The bounded audit found that two important system-neutral foundations already exist in `packages/generator-core`:

1. `NameSuggestionProvider` / `suggestGeneratedName` already own deterministic seed and provider/source provenance while leaving naming context opaque to the shared layer.
2. `RandomTable` / `evaluateRandomTable` already provide deterministic weighted evaluation and explicit source/table provenance.

The missing name-generation layer was the generation mechanism itself. D&D still uses a six-name literal placeholder catalog.

## Stage 3 First Slice Completed

Added `packages/generator-core/src/nameMarkov.ts` and focused tests.

The new `name-markov/0.1` mechanism:

- trains a character-level Markov transition model from caller-supplied samples;
- preserves observed transition frequency as weighting;
- is deterministic when driven by the existing seeded random source;
- accepts caller-owned min/max length and candidate acceptance constraints;
- has bounded retry behavior with explicit failure;
- carries no D&D, BRP, species, culture, or language semantics;
- keeps corpora/reference data outside the mechanism so future culture/language generators can supply different models cleanly.

`generator-core/index.ts` exports the mechanism.

No existing D&D provider, corpus, UI, native state, or generation behavior changed in this slice.

## Next Bounded Slice

Migrate the existing D&D placeholder name provider onto the new mechanism without turning Stage 3 into a corpus-building project.

Recommended shape:

1. move D&D reference/training samples into a separate corpus module with explicit source/version identity;
2. have the D&D `NameSuggestionProvider` train/use the shared Markov mechanism;
3. preserve current `NameSuggestion` seed/provider/source provenance and replay checks;
4. keep generated names as editable suggestions/fallbacks exactly as today;
5. add regression tests proving deterministic replay and that provenance invalidates when provider/corpus identity changes;
6. do not introduce species-as-culture assumptions or broad culture/language schema yet.

After that provider migration is green, use the already-existing random-table evaluator to prove one BRP flavor-field suggestion path rather than inventing a second randomization framework.

## Architecture Baseline To Preserve

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Universal Grammar remains future derived semantic/translation state with explicit loss/confidence.
- Profession is not class.
- Species is not synonymous with culture or language.
- Shared generator code owns reusable mechanics, not system/culture semantics.
- Random-table output is suggestion/input, not hidden authoritative state.
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
