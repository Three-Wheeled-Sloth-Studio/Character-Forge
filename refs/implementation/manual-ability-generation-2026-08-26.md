# Manual Ability Generation Slice

Date: 2026-08-26
Status: implemented and automated-green; owner runtime QA pending
Tracking: GitHub issue #5

## Goal

Add Manual Ability Entry without creating a second character model or duplicating D&D background/final-score rules.

The slice intentionally keeps the rest of the first D&D path fixed at Human / Soldier / Fighter Level 1. Its purpose is to prove that multiple generation methods can converge on one native ability-state, validation, CharacterDocument, and persistence path.

## Implementation checkpoint

- Character Forge `dev`: `f48ee8ff92a6fb349a9c74f462121fe0eaa07021`
- GitHub Actions run: `33021611610`
- `npm run verify`: green
- 6 Vitest files / 29 tests: green
- TypeScript and web build: green

## Shared ability-state boundary

`packages/system-dnd5e/src/abilityGeneration.ts` now separates method-specific base-score selection from common D&D 2024 post-selection behavior.

The common `createAbilityState` path owns:

- normalization of background increase plans;
- validation of the background's three eligible abilities;
- +2/+1 and +1/+1/+1 patterns;
- prevention of increases on ineligible abilities;
- final = base + background contribution;
- final-score cap at 20.

Standard Array validates its own exact source array, then delegates to the common path.

Manual validates its own direct-entry base values, then delegates to the same common path.

This is the intended seam for point cost and random ability generation later.

## Manual method

`manualGenerateDnd5eFirstSlice` accepts:

- required display name;
- six pre-background integer scores from 3 through 18;
- a legal Soldier background increase plan.

It records:

- D&D native `generationMethod: manual`;
- generation mode `manual`;
- generation method ID `dnd5e:manual-first-slice`;
- explicit base-score and background-increase decisions;
- native provenance origin `manual`;
- no random seed.

The final native state is built by the ordinary first-slice character builder and validated by the same D&D adapter used for Standard Array and Quick Generate.

## Adapter change

Adapter version is now `0.2.0`.

The adapter accepts two ability methods in the current slice:

- `standard-array`, which must contain exactly 15, 14, 13, 12, 10, and 8;
- `manual`, whose pre-background base scores must be integers from 3 through 18.

Both use identical validation for background contributions, final score consistency, first-slice class/origin constraints, and dependent D&D state.

## Browser flow

The browser adds a Manual Ability Entry panel with:

- character name;
- STR / DEX / CON / INT / WIS / CHA inputs;
- all legal Soldier increase patterns;
- inline validation errors;
- ordinary character review;
- Ability Method display;
- generation seed shown only when present.

A successful Manual character is sent to Parchment with the same `character-forge:character-generated` message used by Quick Generate. No Parchment mechanics code changed.

## Automated proof

Tests prove:

- Standard Array still delegates correctly through the shared path;
- Manual uses the same background/final-score path;
- legal +2/+1 and +1/+1/+1 behavior remains supported;
- manual base range is enforced;
- background eligibility constraints apply consistently across methods;
- a Manual first-slice character passes native adapter validation;
- dependent Fighter HP is recomputed from final Constitution;
- Manual generation provenance is explicit and seedless;
- blank Manual names reject before character creation.

## Owner QA gate

Before promotion, verify through the normal Parchment-hosted UI:

1. Quick Generate remains functional.
2. Manual Ability Entry produces the requested base/final scores.
3. dependent values respond correctly;
4. document provenance says Manual and has no seed;
5. save/reload/reopen through Parchment remains valid;
6. invalid manual input fails inline.

After owner acceptance, close issue #5 and promote the accepted Character Forge SHA through `dev -> qa -> main`.

## Deferred

- Point cost.
- Dice-expression generation / 4d6 drop lowest.
- Guided choices.
- Guided narrative.
- Broader species, background, and class selection.
- Character maintenance and advancement.
- Background issues #2 and #3 from persistence QA.
