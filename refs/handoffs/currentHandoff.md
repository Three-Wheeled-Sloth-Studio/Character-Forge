# Current Handoff

Date: 2026-08-26
Branch: dev
Phase: D&D 5E 2024 PI 1, durable Parchment character persistence implemented, owner QA pending

Current Character Forge implementation checkpoint: `2a61e1b7a92e35640cb1a38aac3b85df9bad58d5`
Current Parchment Worlds implementation checkpoint: `145db1065f6483df34c1d5ff3210aafb0bc52389`
Parchment documentation head after implementation: `043dd09211eb3dce96e1914050ddbfdc2ffe9b89`

Earlier owner-accepted embedded Quick Generate checkpoints:

- Character Forge: `7b7f89049b83da32cbc9898f3736915087c30c4e`
- Parchment Worlds: `45b5949ef204c3d44b5ca4957b8fb3129ceda34b`

## Current state

The first durable Character Forge -> Parchment -> Character Forge round-trip is implemented on `dev`.

The previously accepted embed/generation slice remains unchanged:

- Mandatory, lossless `CharacterDocument.nativeStates`.
- Versioned `RulesSystemAdapter` boundary keeping D&D mechanics outside shared contracts.
- SRD 5.2.1 source/version/license provenance.
- Typed D&D 5E 2024 native character schema.
- Legal Human Soldier Fighter Level 1 Quick Generate path.
- Native validation and exact JSON round-trip retention.
- Seeded Quick Generate with optional user name and deterministic mechanics.
- Embedded browser surface inside Parchment Worlds.
- Full generated CharacterDocument posted to Parchment without flattening native state.

The new persistence/reopen seam adds:

- `parseCharacterDocument` for validating a retained CharacterDocument container without rebuilding it.
- `character-forge:open-character` host-to-Forge messaging.
- trusted Parchment-origin checking derived from the supplied return URL.
- retained primary-native-state lookup.
- D&D adapter validation before rendering a reopened D&D-native state.
- safe failure for unsupported system/edition or invalid retained native state.
- no edit/maintenance semantics in this slice.

On the Parchment side, the complete CharacterDocument is now stored as opaque module-owned content inside a generic character asset. Parchment owns project membership, asset identity, lifecycle, revision, provenance, lightweight display metadata, and persistence; it does not copy D&D mechanics into its own schema.

## Validation evidence

Character Forge:

- code checkpoint `2a61e1b7a92e35640cb1a38aac3b85df9bad58d5`
- GitHub Actions run `33015129238`
- full `npm run verify` green
- refs validation green
- strict TypeScript typecheck green
- Vitest green
- web production build green

Parchment Worlds:

- code checkpoint `145db1065f6483df34c1d5ff3210aafb0bc52389`
- GitHub Actions run `33015153131`
- refs validation green
- source-size validation green
- TypeScript green
- 52 Vitest files, 175 tests, 0 failures
- production Vite bundle green

Parchment's focused tests prove IndexedDB close/reopen retains the complete CharacterDocument, `primaryNativeStateId`, and generation record. Character Forge tests prove retained-document parsing and lossless reopen messaging.

## Owner runtime QA still required

The persistence slice is not accepted or promoted yet.

Use the exact current dev SHAs and test through the real Parchment browser flow:

1. open an active Parchment project;
2. open Character Forge from that project;
3. generate a character and inspect its CharacterDocument;
4. explicitly save it to the project;
5. return to project overview and confirm it appears in Characters;
6. hard reload and confirm it remains present;
7. reopen it in Character Forge;
8. confirm native validation remains green;
9. compare retained native state, primary ID, source/rules/schema versions, seed, recipe, decisions, and provenance with the pre-save CharacterDocument;
10. open global Character Forge and confirm durable save requires explicit project selection.

If QA finds a persistence/reopen defect, fix only the failing seam and rerun both repositories' authoritative gates. Do not reopen the previously accepted local launcher/embed behavior without new evidence.

## Architecture boundary proven by this slice

Character Forge owns:

- D&D rules data and validation;
- generation methods and deterministic generation;
- native character state;
- generation provenance;
- retained-document interpretation and validation;
- character review/rendering and future maintenance behavior.

Parchment Worlds owns:

- product navigation and module hosting;
- project ownership and asset membership;
- generic character asset identity/lifecycle/revision/provenance;
- durable persistence and future synchronization;
- generic relationships to setting assets;
- future hosted sharing/identity.

The host can persist and return a full native CharacterDocument without understanding D&D mechanics. This remains the desired boundary for future system adapters and semantic translation.

## Translation and bridge-RPG evidence

No universal translator schema is promoted by this persistence slice.

The slice strengthens one existing rule: native state can remain fully authoritative while a system-agnostic host handles identity, persistence, and relationships. Semantic projection is therefore not required for persistence and must never become the reconstruction source for retained native state.

## Next action after persistence acceptance

Once owner runtime QA is green and exact SHAs are promoted, return to Character Forge generation breadth.

Recommended order:

1. Extract shared D&D ability-state generation behavior so all methods converge on one native ability-state path.
2. Add manual ability entry with explicit provenance.
3. Add point cost.
4. Add reusable random dice-expression generation, including 4d6 drop lowest.
5. Incrementally replace fixed Human/Soldier/Fighter choices with guided choices.
6. Add guided narrative as a decision-producing front end to the same ordinary generation APIs.
7. Broaden classes/backgrounds/species only through legally redistributable SRD 5.2.1 content.
8. Add Foundry D&D 5E integration and maintenance/advancement after those foundations.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state remains mandatory and lossless.
- Never reconstruct retained D&D state from semantic projection data.
- Keep D&D and Foundry schemas out of shared character contracts and Parchment project contracts.
- Character Forge remains the authority for D&D-native interpretation and validation.
- Parchment remains the authority for project ownership, asset lifecycle, relationships, persistence, and future sync/share concerns.
- Keep semantic translation evidence-driven and provisional.
- Record rules-source versions and generation choices in provenance.
- Use only legally redistributable SRD 5.2.1 material in this public repository.
- Continue updating `refs/architecture/translation-bridge-rpg-notes.md` whenever implementation exposes translator or future-RPG evidence.
