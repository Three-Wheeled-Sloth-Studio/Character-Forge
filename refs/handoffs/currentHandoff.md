# Current Handoff

Date: 2026-08-26
Branch: dev
Phase: D&D 5E 2024 PI 1, durable Parchment persistence owner-green except narrow QA-fix spot check

Current Character Forge QA-fix checkpoint: `306b72026a052a7a92174ae2f77d17d2e8ff55fe`
Current Parchment Worlds QA-fix checkpoint: `482ed2804f7344a2b907ea97a4b288f2294dd916`

## Current state

The Character Forge -> Parchment -> Character Forge persistence path is implemented and owner runtime QA has confirmed save/load/reopen behavior works.

Two QA findings were raised after that successful round trip:

1. Parchment's global project selector navigated to project overview instead of simply selecting active project context.
2. Character Forge Quick Generate tied durable `characterId` partly to the display name.

Both findings are fixed on `dev`. Only a narrow owner spot check remains before persistence acceptance and promotion.

## Character Forge identity correction

Newly generated entity identity is now deliberately opaque and independent from mutable display names.

New Quick Generate characters receive:

- `character_<UUIDv4>` as `characterId`;
- `native_state_<UUIDv4>` as the primary generated native-state ID.

Display name remains ordinary character data and can later be renamed without changing durable character identity.

Seed semantics are intentionally narrower than entity identity. A supplied seed still makes the generated mechanics, choices, and provenance reproducible, but repeating a seed creates a new durable character identity rather than claiming to be the same character object. This prevents accidental identity collision or overwrite when a user generates the same mechanical recipe twice.

Existing retained characters with earlier non-UUID IDs remain supported. No destructive identity migration is required for the persistence slice.

Relevant new seam:

- `packages/character-model/src/identity.ts`

Quick Generate now calls the shared identity helpers instead of deriving IDs from a slugified name.

## Persistence/reopen behavior already owner-green

Owner runtime QA confirmed:

- generated characters can be saved to a Parchment project;
- saved characters survive durable storage;
- saved characters reopen through the Parchment -> Character Forge handoff;
- broader save/load behavior is functioning.

The previously implemented reopen boundary remains unchanged:

- retained CharacterDocument is returned intact;
- Character Forge validates the retained document/container;
- primary native state is retained;
- D&D adapter validates before rendering;
- Parchment does not reconstruct or interpret D&D-native mechanics.

## Validation evidence

Character Forge QA-fix checkpoint:

- `306b72026a052a7a92174ae2f77d17d2e8ff55fe`
- GitHub Actions run `33020027212`
- full `npm run verify` green
- refs validation green
- strict TypeScript typecheck green
- Vitest green
- production web build green

Parchment Worlds QA-fix checkpoint:

- `482ed2804f7344a2b907ea97a4b288f2294dd916`
- GitHub Actions run `33020184778`
- authoritative metadata-safe validation green
- 53 Vitest files, 177 tests, 0 failures
- production Vite bundle green

## Architecture boundary

Character Forge owns:

- RPG rules data and native validation;
- generation methods and deterministic mechanical generation;
- Character Forge character identity;
- native-state identity;
- generation provenance;
- retained-document interpretation;
- detailed character rendering and future maintenance behavior.

Parchment Worlds owns:

- project ownership and active project context;
- Parchment asset identity;
- asset membership, lifecycle, revision, and provenance;
- durable persistence and future sync/share concerns;
- generic relationships to setting assets.

Display names are not identity keys at either boundary.

## Immediate owner spot check

Do not require a full persistence QA rerun. Pull both current `dev` branches and check only:

1. Selecting a project in Parchment's header changes active project context without navigating into project overview/editing.
2. Global Character Forge defaults its save target to that active project.
3. A newly generated named character has a `character_<uuid>` ID unrelated to its name and a `native_state_<uuid>` primary native-state ID.
4. Optionally save/reopen that new character as a smoke test.

If these corrected seams are green, persistence is accepted and the exact SHAs can be promoted through `dev -> qa -> main` according to repository policy.

## Next action after persistence acceptance

Return to generation breadth:

1. Extract shared D&D ability-state generation behavior so generation methods converge on one native ability-state path.
2. Add manual ability entry with explicit provenance.
3. Add point cost.
4. Add reusable random dice-expression generation, including 4d6 drop lowest.
5. Incrementally replace fixed Human/Soldier/Fighter choices with guided choices.
6. Add guided narrative as a decision-producing front end to the same generation APIs.
7. Broaden classes/backgrounds/species only through legally redistributable SRD 5.2.1 content.
8. Add Foundry D&D 5E integration and maintenance/advancement after those foundations.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state remains mandatory and lossless.
- Never reconstruct retained D&D state from semantic projection data.
- Keep D&D and Foundry schemas out of shared character contracts and Parchment project contracts.
- Character Forge remains the authority for D&D-native interpretation and validation.
- Parchment remains the authority for project ownership, asset lifecycle, relationships, persistence, and future sync/share concerns.
- Character display name must remain independent from durable identity.
- Keep semantic translation evidence-driven and provisional.
- Use only legally redistributable SRD 5.2.1 material in this public repository.
