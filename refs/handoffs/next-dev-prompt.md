---
type: "Handoff Record"
title: "Next Development Prompt"
tags:
- character-forge
- handoffs
- browser-qa
- character-sheet
- acceptance
- roadmap
---
# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`. Do not promote `qa` or `main` unless explicitly requested.

The owner has approved the execution sequence in:

`refs/planning/owner-approved-priority-sequence-2026-09-11.md`

Do **not** reopen roadmap prioritization unless new evidence materially changes the plan. Resume with **Stage 0 - Close Current Player-Usable Acceptance**.

## Bounded Re-entry

First run:

```bash
python refs/tools/generate_agent_context.py --focus "Stage 0 acceptance D&D BRP sheet pagination UI minimalism system switching"
```

Then read only:

1. `refs/handoffs/currentHandoff.md`
2. `refs/planning/owner-approved-priority-sequence-2026-09-11.md`
3. `refs/planning/unprioritized-product-todos-2026-09-11.md` only for detailed Stage 0 callouts
4. `refs/architecture/adaptive-character-sheet-framework.md`
5. `refs/product/creator-workspace.md`
6. GitHub Issue #14
7. only the sheet projection/render/print, creator-shell, and system-switch code required by the Stage 0 finding

Do not reread the entire repository history. Do not resume D&D Guided Narrative by chronology.

## Exact Green Code Checkpoint

The latest implementation checkpoint before the documentation-only roadmap cycle is:

- `dev`: `3e8a73a6e0e960967e08b49abb132f49fe9fd378`
- Actions: `34620261296`
- Job: `103332185790`
- 59 test files / 283 tests / 0 failures
- 221 tracked paths
- 14 required project-memory files
- build `Character Forge build 0.0.1 3e8a73a6`

Later commits are documentation-only. Validate the exact current `dev` head before declaring any later milestone green.

## Immediate Stage 0 Goal

Close the known player-usable acceptance boundary before adding new capabilities.

### Slice 0A - Real browser/print pagination defect

Owner D&D testing still shows unnecessary physical pagination for a representative low-complexity character that should fit comfortably on one page.

Start by tracing the **actual physical browser pagination path**. Do not simply retune the logical descriptor threshold again.

Determine whether the extra page is caused by:

- page-break rules;
- fixed/min heights;
- print margins;
- hidden but space-consuming elements;
- header/footer geometry;
- overflow behavior;
- browser print sizing/scaling;
- second-page descriptor markup that remains present even when effectively empty; or
- another concrete layout cause.

Make the smallest evidence-backed fix. Preserve useful typography/readability and the play-focused hierarchy.

After D&D is corrected, run the equivalent BRP print sanity check because the renderer/print framework is shared.

Do not force every character onto one page. The goal is adaptive density: one page when the real content fits, two when it genuinely does not.

### Slice 0B - Primary UI minimalism sweep

Apply the owner rule to both BRP and D&D:

> Nothing belongs in the primary creator UI unless it provides immediate player or GM value for the current task.

Specific BRP callouts already captured include:

- remove unnecessary text under Rules system;
- remove the `Create a system-native character first. Translation magic comes later.` tagline;
- remove `BRP UGE creator` from primary UI;
- keep compact `2023 ORC rules` identity only if useful, without explanatory paragraphs;
- remove `Source-neutral BRP UGE...` prose;
- rename `Skill allocation` to `Allocation`;
- move Allocation explanation behind an info/help affordance;
- replace the large `Allocation ready` block with compact red/green status plus click-through/help;
- remove unnecessary Important Equipment explanatory copy;
- normalize equipment checkbox sizing;
- remove nonessential text beside equipment names;
- remove explanatory copy under Identity and Background;
- remove the Distinctive Features unavailable-feature explanation;
- make Rules Check green/red with no success prose and detailed text only on failure;
- clean up the two-dice Randomize All glyph so the dice read as offset rather than muddled.

Apply the same principle to D&D without waiting for duplicate owner callouts.

Occasional/first-time explanation belongs behind a compact blue `i` or `?` help affordance when useful.

### Slice 0C - System-switch correctness

Current defect: changing the selected RPG system does not reliably clear or translate an already generated character.

Until a real translation path exists:

- never present a character generated under System A as if it belongs to System B;
- prefer explicit clear/separate behavior over fake translation;
- preserve the original saved character if applicable rather than silently mutating its native state;
- leave a clean future seam for a Translate action once Universal Grammar/adapters support it.

Add focused regression coverage.

### Slice 0D - Finish BRP Issue #14 acceptance

After the above fixes are green, resume the complete BRP browser acceptance journey:

```text
create -> finish -> review -> save -> reopen -> print/export
```

Exercise representative Detective, Scholar, and Athlete/Beggar/Custom characters, including long specialties/languages/equipment/background content and at least one rolled/Heroic path where useful.

Close Issue #14 only after real-browser acceptance succeeds.

## Do Not Pull Forward Yet

Unless concrete Stage 0 evidence requires otherwise, do not implement in this thread:

- branding/productization;
- the engineering-health cleanup pass;
- full name generation;
- random-table expansion;
- durable portrait/token persistence;
- Foundry export/push;
- Universal Grammar;
- Fate/third-system work;
- proprietary RPG implementation.

Those have an approved order in `refs/planning/owner-approved-priority-sequence-2026-09-11.md`.

## Approved Future Clarifications To Preserve

### Character-sheet branding

Primary sheet branding belongs to Project/Campaign identity. A very small, unobtrusive studio logo/wordmark is acceptable later as a subordinate maker's mark if it does not compete with play information.

### Name generation

The future name generator is expected to use a probabilistic / Markov-style generation step or comparable sequence model for a vast but distinctly flavored space, not merely fixed word-list recombination. Keep the architecture ready for future language/culture generators to provide phonology, phonotactics, morphology, orthography, naming customs, and related context.

## Architecture Guardrails

- Native system state is mandatory and lossless.
- Native BRP and D&D state remain canonical.
- Universal Grammar remains derived semantic/translation state with explicit loss.
- Profession is not class.
- Shared sheet code owns presentation mechanics only.
- System packages own play hierarchy/grouping/calculations.
- Screen and print share the same play-focused information architecture.
- The print target is a standalone character-sheet document, never the creator application.
- Project/Campaign identity is authoritative where supplied upstream.
- Portrait/token/VTT metadata does not belong in RPG native state.
- Foundry schemas remain adapter targets.
- Preserve exact-SHA `dev -> qa -> main` promotion.

## Branch / Promotion Boundary

Promoted branches remain unchanged:

- `qa`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`
- `main`: `c7b64ac774b9f903baf5bad74f903f0ca1882812`

Do not promote either branch unless explicitly requested.

## Validation

For every implementation milestone:

```bash
npm run verify
```

Do not call a milestone green unless the exact committed SHA passes GitHub Actions.
