# Current Handoff

Date: 2026-08-26
Branch: dev
Phase: D&D 5E 2024 PI 1, parameterized Standard Array slice
Accepted native-path checkpoint: `59ea8edc942619c3f931f6c748ca8c6820d5aef8`
Current implementation candidate: `0b69c308bea52085abc279aa155f9c3d8e066611`

## Current state

Character Forge has a versioned rules-system adapter boundary and one end-to-end D&D 5E 2024 native Human Soldier Fighter Level 1 path. The fixed ability assignment has now been generalized into a parameterized Standard Array builder while keeping class, background, species, equipment, and feat choices intentionally narrow.

The shared `RulesSystemAdapter` still knows nothing about D&D classes, species, backgrounds, or ability scores. D&D-specific generation and validation stay under `packages/system-dnd5e`.

The current candidate adds:

- `DND5E_ABILITY_IDS` as the D&D-owned ability identifier list.
- `DND5E_STANDARD_ARRAY` as the SRD-owned six-score set without prescribing an assignment.
- Input-driven assignment of the Standard Array across all six abilities.
- Legal 2024 background adjustment handling for either +2/+1 on two different listed abilities or +1/+1/+1 on all three listed abilities.
- Rejection of duplicate/missing Standard Array scores, incomplete adjustment patterns, and adjustments outside the background's listed abilities.
- Recalculation of final scores and dependent D&D-native Fighter HP, Alert-influenced Initiative, and Perception-based Passive Perception.
- Generation provenance entries for the actual Standard Array assignment and background ability adjustments.
- Adapter acceptance of both legal Soldier adjustment patterns.

Human + Soldier + Fighter 1 remains fixed. This is intentional. Do not broaden the rules corpus merely because the ability seam is now parameterized.

## Source boundary

Use `refs/integration/dnd5e-srd-5.2.1.md` before adding D&D rules data. SRD 5.2.1 is the current source target and is tracked as `wotc-srd-5.2.1` with CC-BY-4.0 provenance.

The 2024 rules separate score generation/assignment from background ability adjustments. Standard Array uses 15, 14, 13, 12, 10, and 8 exactly once. A background lists three abilities and permits either +2 to one and +1 to a different one, or +1 to all three.

## Validation state

Checkpoint `59ea8edc942619c3f931f6c748ca8c6820d5aef8` passed the full user-local Windows gate on 2026-08-26:

- refs validation: 11 required files passed
- strict TypeScript typecheck: passed
- Vitest: 2 files passed, 8 tests passed, 0 failed

Candidate `0b69c308bea52085abc279aa155f9c3d8e066611` has been checked in the available execution environment with:

- strict TypeScript compile: green
- alternate Standard Array assignment smoke: green
- +1/+1/+1 background adjustment smoke: green
- native adapter validation on the alternate assignment: green
- dependent HP, Initiative, and Passive Perception recalculation: green
- rejection of an ability increase outside Soldier's listed abilities: green

The full repository `npm run verify` still needs to be run on the user's checkout for candidate `0b69c308...` before it is considered accepted or promoted to `qa`.

`package-lock.json` exists on the user's local checkout but is still untracked and absent from remote `dev`. Retain and commit it after pulling this candidate so subsequent installs become reproducible.

## Translation and bridge-RPG evidence

Implementation reinforces that final numbers alone are insufficient translation evidence. A D&D ability score now has explicit layers: generated/assigned base value, source-specific background adjustment, and final value. Generation decisions also record which values were chosen rather than relying on reconstruction from the final sheet.

This suggests the future semantic bridge will need causal/source-aware contributions, but no universal attribute-modifier schema should be promoted from D&D alone.

See `refs/architecture/translation-bridge-rpg-notes.md`.

## Next implementation slice after green verification

Add manual ability entry through the same native character boundary without duplicating background-adjustment logic.

Recommended sequence:

1. Extract the D&D-owned background-adjustment/finalization behavior so Standard Array and manual entry share it.
2. Add a manual ability-state builder with explicit pre-background scores.
3. Validate the legal manual-score domain appropriate to the supported D&D creation path rather than accepting arbitrary JSON numbers merely because the native schema can hold them.
4. Preserve generation method and actual manual inputs in provenance.
5. Prove Standard Array and manual generation converge on the same D&D-native shape and adapter validation.
6. Only after that, add point cost and 4d6-drop-lowest generation.

Guided narrative remains an early target, but it should emit ordinary generation decisions into these same builders rather than create a parallel character-construction path.

## Guardrails

- Work directly on `dev`.
- Native system state remains mandatory and lossless.
- Do not reconstruct retained D&D state from semantic traits.
- Keep D&D and Foundry schemas out of shared character contracts.
- Do not create a universal trait ontology from D&D evidence alone.
- Update the translator/bridge-RPG evidence ledger whenever generation reveals reusable semantics or system-specific assumptions.
- Do not promote to `qa` until the exact candidate SHA passes the full local gate.
- Preserve exact-SHA promotion through `dev -> qa -> main`.
