# Current Handoff

Date: 2026-08-26
Branch: dev
Phase: D&D 5E 2024 PI 1, Manual + Point Cost implemented, owner runtime QA intentionally deferred

## Accepted baseline

The first embedded Quick Generate plus durable Parchment save/reload/reopen slice is owner-accepted and promoted.

Accepted Character Forge checkpoint on `qa` and `main`:

- `8041edb4009abce8a836faafce9a167883e92bda`

Accepted Parchment Worlds closeout checkpoint on `qa` and `main`:

- `ac704a471df1b4235112d7f3c63c3b5ee4b1236c`

Parchment issue #24 is closed as completed. Do not reopen the accepted embed/persistence seam without new evidence.

Two non-blocking QA follow-ups remain deliberately backgrounded:

- Character Forge issue #2: the owner's effective runtime still showed name-derived character/native-state IDs even though current dev code contains opaque UUID helpers. Trace the effective runtime path later rather than blocking generation breadth.
- Character Forge issue #3: add compact icon-first Copy JSON / Download JSON controls to the CharacterDocument inspector.

## Current development checkpoint

Manual Ability Entry and Point Cost now both exist on `dev`. Neither has been promoted because the owner chose to defer runtime QA and continue generation work first.

Current Point Cost code checkpoint:

- `914ffd38504c71e0af1785c2a4e839ca41dffd8c`
- GitHub Actions run `33022905653`
- full `npm run verify` green
- refs validation green
- strict TypeScript green
- 7 Vitest files, 36 tests, 0 failures
- web TypeScript build green

Manual/shared-ability checkpoint beneath it:

- `f48ee8ff92a6fb349a9c74f462121fe0eaa07021`
- GitHub Actions run `33021611610`

Tracked by Character Forge issues #5 and #7.

## Ability-generation architecture now proven across three methods

`packages/system-dnd5e/src/abilityGeneration.ts` provides the common post-base-score path used by Standard Array, Manual Entry, and Point Cost.

The shared path owns:

- expansion of background increases into all six abilities;
- validation that a 2024 background exposes exactly three eligible abilities;
- legal +2/+1 or +1/+1/+1 increase patterns;
- rejection of increases outside the background's eligible abilities;
- final-score derivation from base score plus background contribution;
- the Level 1 cap that background increases cannot push a score above 20.

Each generation method owns only how its base values are obtained and the provenance needed to explain that choice.

## Manual Ability Entry

Manual generation remains implemented and automated-green.

It accepts:

- required character name;
- six explicit pre-background scores from 3 through 18;
- a legal Soldier background increase plan.

It records:

- `abilities.generationMethod: manual`;
- `generation.mode: manual`;
- `generation.methodId: dnd5e:manual-first-slice`;
- explicit manual base-score and background-increase decisions;
- native provenance origin `manual`;
- no invented random seed.

Owner runtime QA for this path is deferred by direction, not failed.

## Point Cost

Point Cost is now implemented as a distinct D&D generation method using the same native-state path.

The D&D system package owns the SRD 5.2.1 Point Cost rules:

- 27-point budget;
- pre-background scores from 8 through 15;
- costs 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9;
- allocations over 27 points are rejected;
- unspent points remain legal and visible rather than being silently redistributed.

`pointCostGenerateDnd5eFirstSlice` records:

- `abilities.generationMethod: point-cost`;
- `generation.mode: mechanical`;
- `generation.methodId: dnd5e:point-cost-first-slice`;
- the 27-point budget in the generation recipe;
- the chosen base scores and spend summary in generation decisions;
- no random seed.

The D&D adapter is now version `0.3.0` and independently validates Point Cost score range and total budget before accepting retained native state.

## Browser surface

Character Forge now exposes three creation surfaces:

1. Quick Generate;
2. Manual Ability Entry;
3. Point Cost.

The Point Cost panel provides:

- required character name;
- six compact numeric inputs constrained to 8 through 15;
- live points-spent / points-remaining feedback;
- disabled submission while the allocation is invalid or over budget;
- the same legal Soldier increase choices;
- inline error reporting;
- the same character review and `character-forge:character-generated` handoff used by the other methods.

No Parchment mechanics changes were required.

## Architecture evidence

The generation-method separation is now concrete across Standard Array, Manual, and Point Cost:

1. method-specific code obtains or validates six base values;
2. shared D&D rules apply background contributions and derive final abilities;
3. the ordinary first-slice native builder recomputes dependent state;
4. the same adapter validates final native state;
5. every method emits the same CharacterDocument shape and uses the same persistence boundary.

Point-buy budget is therefore construction provenance, not a separate character ontology or a shared universal Character Forge mechanic.

## Runtime QA state

Do not interpret the absence of owner Manual/Point Cost testing as a failure. The owner explicitly deferred that test pass on 2026-08-26 and authorized continuing to the next generation slice.

When a runtime pass is convenient later, Manual and Point Cost can be checked together against the normal Parchment-hosted flow. Keep issues #5 and #7 open until that acceptance pass or until the owner explicitly accepts them without it.

## Next implementation slice

Add reusable dice-expression generation, with D&D's SRD 5.2.1 random ability method as the first consumer.

The first D&D expression is four d6, keep the highest three, repeated six times. Do not implement this as a one-off `roll4d6DropLowest()` utility. Build the smallest reusable dice-expression layer that can represent:

- die count;
- die size;
- keep/drop behavior;
- deterministic seeded rolling;
- retained roll detail sufficient for provenance and replay.

Then use that general expression through a D&D-specific random-ability generator that hands its six resulting base scores into the same shared ability-state path already used by Standard Array, Manual, and Point Cost.

Do not begin broader species/background/class choice work in the same slice.

## After random ability generation

1. guided choices replacing fixed Human / Soldier / Fighter incrementally;
2. early guided narrative generation using the same ordinary generation APIs;
3. broader legally redistributable SRD content;
4. Foundry D&D 5E integration;
5. maintenance and advancement after those foundations.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Do not promote the current Manual/Point Cost stack until owner acceptance unless explicitly directed otherwise.
- Native system state remains mandatory and lossless.
- Never reconstruct retained D&D state from semantic projection data.
- Generation methods must converge on the same native-state validation and save boundary.
- System adapters own system-specific rules behavior; shared character contracts must not become D&D point-buy or d20 shaped.
- Character Forge remains authoritative for RPG-native interpretation, validation, and generation provenance.
- Parchment remains authoritative for project ownership, generic asset lifecycle, relationships, persistence, and future sync/share concerns.
- Keep issues #2 and #3 backgrounded unless new evidence makes either blocking.
- Use only legally redistributable SRD 5.2.1 material in this public repository.
