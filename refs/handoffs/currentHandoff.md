# Current Handoff

Date: 2026-08-26
Branch: dev
Phase: D&D 5E 2024 PI 1, manual ability generation implemented, owner QA pending

## Accepted baseline

The first embedded Quick Generate plus durable Parchment save/reload/reopen slice is owner-accepted and promoted.

Accepted Character Forge checkpoint on `qa` and `main`:

- `8041edb4009abce8a836faafce9a167883e92bda`

Accepted Parchment Worlds checkpoint on `qa` and `main`:

- `f5eb7224f71ed64d033aaac038a933fbd8850c48`

Parchment issue #24 is closed as completed. Do not reopen the accepted embed/persistence seam without new evidence.

Two non-blocking QA follow-ups are deliberately backgrounded:

- Character Forge issue #2: the owner's effective runtime still showed name-derived character/native-state IDs even though current dev code contains opaque UUID helpers. Trace the effective runtime path later rather than blocking generation breadth.
- Character Forge issue #3: add compact icon-first Copy JSON / Download JSON controls to the CharacterDocument inspector.

## Current implementation checkpoint

Manual ability generation and the shared ability-state path are implemented on `dev` at:

- `f48ee8ff92a6fb349a9c74f462121fe0eaa07021`
- GitHub Actions run `33021611610`
- full `npm run verify` green
- refs validation green
- strict TypeScript green
- 6 Vitest files, 29 tests, 0 failures
- web TypeScript build green

Tracked by Character Forge issue #5.

## What changed

### Shared ability-state behavior

`packages/system-dnd5e/src/abilityGeneration.ts` now provides one common path for ability state after a generation method chooses base scores.

The shared path owns:

- expansion of background increases into all six abilities;
- validation that a 2024 background exposes exactly three eligible abilities;
- legal +2/+1 or +1/+1/+1 increase patterns;
- rejection of increases outside the background's eligible abilities;
- final-score derivation from base score plus background contribution;
- the Level 1 cap that background increases cannot push a score above 20.

Standard Array and Manual now both converge on this path. Future point-cost and random methods should do the same rather than reimplementing background/final-score behavior.

### Manual generation method

`manualGenerateDnd5eFirstSlice` now accepts:

- an explicit character name;
- six pre-background ability scores;
- a legal Soldier background increase plan.

For this first slice, manual base scores must be integers from 3 through 18. Human, Soldier, and Fighter remain intentionally fixed.

Manual generation records:

- `generationMethod: manual` in D&D native ability state;
- `generation.mode: manual`;
- `generation.methodId: dnd5e:manual-first-slice`;
- explicit `abilities.manual` and background-increase decisions;
- native provenance origin `manual`;
- no invented random seed.

The resulting character still goes through the ordinary D&D adapter and the same full CharacterDocument save/handoff boundary as Quick Generate.

### Adapter behavior

The D&D adapter is now version `0.2.0`.

It validates Standard Array and Manual as distinct supported base-score methods while keeping shared validation for:

- complete base/increase/final state;
- final = base + background increase;
- final score range;
- Soldier increase legality;
- fixed first-slice Human / Soldier / Fighter rules;
- Level 1 Fighter HP and other existing native constraints.

### Browser surface

The current Character Forge browser now exposes a second creation panel for Manual Ability Entry.

It provides:

- required character name;
- six compact numeric base-score inputs;
- the legal Soldier increase choices;
- inline error reporting;
- the same character review surface used by Quick Generate;
- an Ability Method row in review;
- generation seed display only when the method actually has a seed;
- the same `character-forge:character-generated` postMessage boundary to Parchment.

No Parchment mechanics changes were required.

## Architecture evidence

This slice strengthens the generator architecture rather than adding a parallel manual-character model.

The important separation is now concrete:

1. a generation method chooses or receives base ability values;
2. shared D&D rules apply background contributions and derive final ability state;
3. the ordinary first-slice native character builder derives HP, Initiative, Passive Perception, and other dependent state;
4. the normal adapter validates the final native state;
5. every generation method emits the same CharacterDocument shape and uses the same persistence boundary.

Manual provenance and mechanical state remain separate. Character Forge does not need semantic translation to persist or reopen either Manual or Standard Array characters.

## Immediate owner QA

Pull Character Forge `dev` and use the normal Parchment-hosted Character Forge flow. A focused check is enough:

1. Confirm Quick Generate still works and still saves/reopens through Parchment.
2. In Manual Ability Entry, enter a name and six scores between 3 and 18.
3. Choose a Soldier increase plan and build the character.
4. Confirm the displayed final scores reflect the selected increases.
5. Confirm HP / Initiative / Passive Perception react to the final ability values where applicable.
6. Expand the document and confirm:
   - `abilities.generationMethod` is `manual`;
   - `generation.mode` is `manual`;
   - `generation.methodId` is `dnd5e:manual-first-slice`;
   - the manual base scores and background increases are retained as decisions;
   - there is no generation seed;
   - native provenance origin is `manual`.
7. Save the manual character to Parchment, reload, reopen it, and confirm native validation remains green.
8. Optionally verify an out-of-range manual score is rejected inline rather than producing an invalid character.

If this is green, close issue #5 and promote the exact accepted Character Forge SHA through `dev -> qa -> main`.

## Next implementation slice after acceptance

Add D&D 5E point cost through the same shared ability-state boundary.

Do not build another final-score/background-adjustment implementation. The point-cost method should own only the rules and decisions specific to buying the base scores, then hand those base scores into the shared path already used by Standard Array and Manual.

After point cost:

1. reusable dice-expression generation, including 4d6 drop lowest;
2. guided choices replacing fixed Human / Soldier / Fighter incrementally;
3. early guided narrative generation using the same ordinary generation APIs;
4. broader legally redistributable SRD content;
5. Foundry D&D 5E integration and later maintenance/advancement.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state remains mandatory and lossless.
- Never reconstruct retained D&D state from semantic projection data.
- Generation methods must converge on the same native-state validation and save boundary.
- Keep D&D and Foundry schemas out of shared character contracts and Parchment project contracts.
- Character Forge remains authoritative for RPG-native interpretation, validation, and generation provenance.
- Parchment remains authoritative for project ownership, generic asset lifecycle, relationships, persistence, and future sync/share concerns.
- Keep issues #2 and #3 backgrounded unless new evidence makes either blocking.
- Use only legally redistributable SRD 5.2.1 material in this public repository.
