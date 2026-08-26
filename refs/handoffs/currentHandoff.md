# Current Handoff

Date: 2026-08-26
Branch: dev
Phase: D&D 5E 2024 PI 1, first native Level 1 path
Foundation validation: green on user Windows environment 2026-08-26
Implementation checkpoint: `59ea8edc942619c3f931f6c748ca8c6820d5aef8`

## Current state

Character Forge now has its first real rules-system adapter boundary and one end-to-end D&D 5E 2024 native character path.

The shared `RulesSystemAdapter` contract carries adapter identity/version, supported rules-source metadata, and native-state validation without teaching the shared CharacterDocument about D&D classes, species, backgrounds, or ability scores.

`packages/system-dnd5e` currently implements a deliberately narrow SRD 5.2.1 slice:

- Machine-readable SRD source, creator, version, and CC-BY-4.0 license metadata.
- Typed D&D-native character state.
- One fixed legal Human Soldier Fighter Level 1 character using Standard Array.
- Human skill and Origin-feat choices, Soldier background grants, Fighter Level 1 features, Fighting Style, Weapon Mastery choices, starting equipment, resources, and derived sheet values.
- Validation for adapter/system/source/schema version, ability-state consistency, Standard Array legality, Soldier ability increases, Level 1 identity/proficiency, and Fighter HP from Constitution.
- CharacterDocument generation provenance and exact native JSON round-trip.

The fixture is intentionally not a universal model. It exists to prove the native system path before generation options are generalized.

## Source boundary

Use `refs/integration/dnd5e-srd-5.2.1.md` before adding D&D rules data. The public repository may use SRD 5.2.1 material under CC-BY-4.0, but non-SRD rulebook content must not leak into the adapter.

Rules-source ID: `wotc-srd-5.2.1`.

## Translation and bridge-RPG evidence

The first implementation-derived observations are now recorded in `refs/architecture/translation-bridge-rpg-notes.md`:

- Keep base values and source-aware grants distinct instead of flattening everything into final numbers.
- Distinguish granted capabilities from the choice slots that selected them.
- Keep native derived values for fidelity without assuming they are universal semantic facts.
- Treat D&D Hit Points as D&D-native state, not the universal representation of injury.

No universal translator schema was introduced.

## Validation state

The previous PI 0 gate passed on the user's Windows checkout:

- refs validation green
- strict TypeScript typecheck green
- 3 foundation tests green

For checkpoint `59ea8edc942619c3f931f6c748ca8c6820d5aef8`, an independent local development smoke was run in the available execution environment:

- TypeScript static compile green using the available TypeScript compiler.
- Executable adapter smoke green for the legal fixture.
- Exact JSON native-state round-trip green.
- Invalid Level 1 Fighter HP is correctly rejected.

The full repository `npm run verify` has not yet been run against this checkpoint in the user's normal environment. GitHub reports no CI status for the connector-created commit. Do not promote to `qa` until the user-local full gate is green.

Also note: `package-lock.json` is still absent from remote `dev`. If the user's local npm installation generated it, retain and commit it with the next accepted development increment.

## Next implementation slice after green verification

Generalize the fixed D&D path one dimension at a time rather than importing a large rules corpus.

Recommended order:

1. Turn the fixed Standard Array assignment into an input-driven builder while keeping Human + Soldier + Fighter 1 fixed.
2. Validate arbitrary legal Standard Array placement and legal Soldier +2/+1 assignment choices.
3. Add manual ability assignment through the same native validation boundary.
4. Extract generation decisions so both methods produce the same native state shape and provenance.
5. Only then broaden additional origin/class choices or add point cost and random 4d6-drop-lowest generation.
6. Introduce guided narrative inputs early enough that they exercise the same decision/provenance contract, but do not let narrative UI logic bypass native validation.

## Guardrails

- Work directly on `dev`.
- Native system state remains mandatory and lossless.
- Do not reconstruct retained D&D state from semantic traits.
- Keep D&D and Foundry schemas out of shared character contracts.
- Do not create a universal trait ontology from this first D&D slice.
- Update the translator/bridge-RPG evidence ledger as implementation exposes reusable semantics or system-specific assumptions.
- Preserve the exact-SHA promotion path `dev -> qa -> main`.
