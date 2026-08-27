# Current Handoff

Date: 2026-08-26
Branch: dev
Phase: D&D 5E 2024 PI 1, base ability-generation methods automated-green; combined owner QA deferred

## Accepted baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted. Do not reopen it without new evidence.

Accepted Character Forge checkpoint on `qa` and `main`:

- `8041edb4009abce8a836faafce9a167883e92bda`

Parchment character persistence issue #24 is closed as completed.

Two non-blocking follow-ups remain backgrounded:

- Character Forge issue #2: trace the effective runtime path that still showed name-derived character/native-state IDs despite UUID identity helpers being present in current code.
- Character Forge issue #3: add compact icon-first Copy JSON / Download JSON controls to the CharacterDocument inspector.

## Current development checkpoint

The complete base D&D ability-score generation family is implemented on `dev` at:

- code checkpoint `bfe90583c42a39317f03916f1ca51be7b8ddefb5`
- GitHub Actions run `33026099499`
- job `98367663310`
- full `npm run verify` green
- refs validation green
- strict TypeScript green
- 11 Vitest files / 47 tests / 0 failures
- web TypeScript build green

Manual, Point Cost, and the completed base-method stack remain intentionally unpromoted while owner runtime QA is deferred.

Tracking issues:

- #5 Manual Ability Entry
- #7 Point Cost
- #8 Complete base D&D ability generation methods

## Base method set now implemented

### Standard Array

Standard Array is now a first-class API/browser generation path rather than being reachable only indirectly through Quick Generate.

- Six values `15, 14, 13, 12, 10, 8` must each be assigned exactly once.
- Explicit generation provenance records the assignment.
- No seed is invented for a non-random method.
- The resulting scores enter the same shared background-adjustment and final-score pipeline as every other method.

### Manual Ability Entry

Manual remains an explicit Character Forge input/validation utility.

- Six pre-background scores are entered directly.
- Current first-slice range is integer 3 through 18.
- Provenance origin and generation mode remain explicitly manual.
- No random seed is invented.

### Point Cost

SRD 5.2.1 Point Cost is implemented as D&D-owned rules behavior.

- 27-point budget.
- Pre-background scores 8 through 15.
- Cost table `0,1,2,3,4,5,7,9` for scores 8 through 15.
- Browser surface shows live spent/remaining budget and blocks over-budget construction.
- Construction budget remains generation provenance, not runtime character state.

### Random Generation

SRD Random Generation is implemented through a reusable deterministic dice engine.

- Roll `4d6`, keep the highest 3, six times.
- A supplied seed exactly replays the six score rolls.
- A seed is generated and retained when the user leaves it blank.
- Every roll retains all four raw dice, the three kept dice, total, and roll-slot index.
- The six roll slots are then assigned to abilities exactly once.
- Assignment tracks roll-slot identity rather than only numeric score value, so duplicate totals remain unambiguous.
- Generation provenance retains the dice expression, raw/kept rolls, roll-slot assignment, resulting base scores, and background increases.

### Quick Generate

Quick Generate remains the minimal-input path and is unchanged as an owner-accepted workflow. It continues to produce an ordinary validated CharacterDocument and does not define a separate character-state format.

## Reusable generator core

A new `packages/generator-core` package now contains system-neutral deterministic generation primitives:

- seeded pseudo-random source;
- generated seed helper;
- generic dice-expression representation;
- dice rolling with raw/kept/dropped evidence;
- keep-highest / keep-lowest support;
- integer modifiers;
- canonical expression formatting such as `4d6kh3`.

The generic package does not know D&D rules. D&D owns the decision to use six `4d6kh3` rolls for ability generation.

## Shared D&D ability-state architecture

All supported ability methods now converge on the same post-base-score path:

1. the generation method obtains six base ability values;
2. shared D&D rules validate and apply the selected 2024 background ability increases;
3. final scores are derived from base plus background contribution;
4. the first-slice native builder recomputes dependent Fighter state including HP, Initiative, and Passive Perception;
5. the D&D adapter independently validates the final native state;
6. every method emits the same CharacterDocument shape and uses the same Parchment handoff/persistence boundary.

The D&D adapter is now version `0.4.0` and recognizes Standard Array, Manual, Point Cost, and Random as distinct base-score methods.

## Browser surface

The Character Forge browser now exposes:

- Quick Generate;
- Standard Array;
- Manual Ability Entry;
- Point Cost;
- Random Generation.

Random Generation shows the six score rolls before assignment, including each raw die and which values were kept. The user assigns roll slots to STR/DEX/CON/INT/WIS/CHA, then selects the legal Soldier increase plan and builds through the ordinary CharacterDocument path.

No Parchment mechanics changes were required.

## Combined owner QA checkpoint

The owner explicitly deferred Manual runtime QA while generation breadth continued. Do not treat the unpromoted methods as owner-accepted yet.

When the owner chooses to run the combined pass, one focused browser session should cover:

1. Quick Generate smoke remains green.
2. Standard Array accepts a legal permutation and rejects a duplicated/missing array value.
3. Manual accepts recognizable 3-18 scores and retains manual provenance/no seed.
4. Point Cost displays the correct spend, blocks >27, and retains point-cost provenance.
5. Random Generation shows six `4d6kh3` rolls, allows each roll slot exactly once, and reproduces the same rolls from the same seed.
6. Each built method reports `Native state valid`.
7. Save at least one representative non-Quick character to Parchment, reload, reopen, and confirm retained native state/generation provenance remains intact.

If this combined pass is green, close issues #5, #7, and #8 as appropriate and promote the exact accepted Character Forge SHA through `dev -> qa -> main`.

## Next implementation slice

Base ability generation is complete. The next generation work should move up one level into guided character creation rather than adding more ability-score methods.

Recommended sequence:

1. Incrementally replace fixed Human / Soldier / Fighter choices with ordinary guided mechanical choices, one decision dimension at a time.
2. Preserve the existing ability methods as interchangeable base-score steps inside guided creation.
3. Add early guided narrative as a front end that converts inspectable fictional/preferences answers into the same ordinary generation decisions and APIs.
4. Broaden legally redistributable SRD species/background/class content only as guided choice seams require it.
5. Add Foundry D&D 5E integration after the generation foundation is sufficiently broad.
6. Add maintenance/advancement after those foundations.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state remains mandatory and lossless.
- Never reconstruct retained D&D state from semantic projection data.
- Generation methods must converge on the same native-state validation and persistence boundary.
- Generator-core remains system-neutral; D&D-specific dice rituals, point costs, and legal score rules stay in `system-dnd5e`.
- Character Forge remains authoritative for RPG-native interpretation, validation, and generation provenance.
- Parchment remains authoritative for project ownership, generic asset lifecycle, relationships, persistence, and future sync/share concerns.
- Keep issues #2 and #3 backgrounded unless new evidence makes either blocking.
- Use only legally redistributable SRD 5.2.1 material in this public repository.
