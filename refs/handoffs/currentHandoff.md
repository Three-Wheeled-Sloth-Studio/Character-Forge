# Current Handoff

Date: 2026-08-26
Branch: dev
Phase: D&D 5E 2024 PI 1, accepted embedded Quick Generate checkpoint
Accepted Character Forge executable checkpoint: `7b7f89049b83da32cbc9898f3736915087c30c4e`
Accepted Parchment integration checkpoint: `45b5949ef204c3d44b5ca4957b8fb3129ceda34b`

## Current state

Character Forge now has its first owner-tested user-visible path inside Parchment Worlds.

The accepted vertical slice includes:

- Mandatory, lossless `CharacterDocument.nativeStates`.
- A versioned `RulesSystemAdapter` boundary that keeps D&D mechanics outside shared character contracts.
- SRD 5.2.1 source/version/license provenance.
- A typed D&D 5E 2024 native character schema.
- A legal Human Soldier Fighter Level 1 path.
- Parameterized Standard Array assignment and legal 2024 background ability adjustments.
- Native validation and exact JSON round-trip retention.
- Seeded Quick Generate with optional user-supplied name and deterministic mechanics.
- A small browser surface that renders the generated character, reports native validation, and exposes the retained CharacterDocument for inspection.
- A postMessage handoff that sends the full generated CharacterDocument to Parchment Worlds without flattening or translating the native state.

Parchment Worlds now exposes Character Forge through both the landing-page Character Creator module and the global Characters header entry. Local development auto-starts a sibling Character-Forge checkout on port 5174 and embeds it. Windows startup is hidden and no longer opens a visible cmd window.

Owner runtime QA on 2026-08-26 is green for this complete seam:

1. Character Creator is enabled in Parchment.
2. Character Forge starts automatically from the sibling checkout.
3. No visible terminal window is opened on Windows.
4. The Character Forge browser surface embeds successfully.
5. Quick Generate produces a Fighter character.
6. Native state validation is green.
7. The generated CharacterDocument reaches Parchment successfully.

Treat this seam as accepted. Do not reopen it without new evidence.

## Validation evidence

Before browser integration, Character Forge checkpoint `7241dfb9976270b514e369199fd957dfa81c4eef` passed the full user-local Windows gate:

- refs validation: green
- strict TypeScript typecheck: green
- Vitest: 3 files, 16 tests, 0 failures
- `package-lock.json` committed

The browser checkpoint `7b7f89049b83da32cbc9898f3736915087c30c4e` was then exercised through the real Parchment integration rather than only as a standalone page. Owner runtime QA is green as described above.

Before any promotion to `qa`, rerun the repository's full `npm run verify` against the exact promoted Character Forge SHA and Parchment's normal metadata-safe validation against its exact promoted SHA.

## Architecture boundary proven by this slice

The first integration confirms the intended ownership split:

Character Forge owns:

- D&D rules data and validation
- generation methods and deterministic generation
- native character state
- generation provenance
- character review/rendering specific to the generator

Parchment Worlds owns:

- product navigation and module hosting
- project context
- future durable character asset persistence
- relationships to worlds, cultures, factions, items, campaigns, and other setting assets
- future hosted sharing/synchronization

Parchment currently acknowledges a generated character but does not persist it. That is intentional at this checkpoint.

## Translation and bridge-RPG evidence

The current implementation reinforces several durable lessons already captured in `refs/architecture/translation-bridge-rpg-notes.md`:

- Native state must remain authoritative and lossless even when semantic translation is added later.
- Base values, source contributions, and final values should remain distinguishable.
- Generation decisions are useful provenance and should not be reconstructed from the finished sheet.
- D&D hit points are D&D-native state, not a universal injury model.
- The host application can transport a full native character document without understanding D&D mechanics. This is the desired boundary for future system adapters.

No universal translator schema has been promoted from this D&D-only evidence.

## Next vertical slice

The next user-facing increment is **Parchment character asset persistence**, not broader D&D generation yet.

Recommended sequence:

1. In Parchment, define the smallest durable character-asset envelope using the existing project Asset / revision / provenance contracts rather than inventing a parallel persistence model.
2. Persist the full Character Forge `CharacterDocument` losslessly as the character asset's system-native payload or attachment. Parchment must not parse D&D mechanics into its own schema.
3. Associate the character with a setting project and retain stable asset/character IDs.
4. Show persisted characters in a project-level character inventory/list and prove they survive browser reload.
5. Reopen a persisted character in Character Forge and prove native state and generation provenance survive the Parchment round trip unchanged.
6. Add delete/archive and basic rename only if the existing Parchment asset lifecycle makes them cheap; do not expand into full editing yet.
7. Once persistence is proven, return to Character Forge generation breadth: manual ability entry, point cost, 4d6-drop-lowest, guided creation, and early guided narrative generation.

This ordering deliberately gives the generator somewhere durable to put characters before adding many more ways to create them.

## Generation backlog after persistence

Resume D&D generation by generalizing one dimension at a time:

1. Extract shared background-adjustment/final-score behavior so generation methods converge on one native ability-state path.
2. Add manual ability entry with explicit provenance.
3. Add point cost.
4. Add 4d6 drop lowest through a reusable dice-expression pipeline.
5. Replace the fixed Human/Soldier/Fighter path with guided choices incrementally.
6. Introduce guided narrative as a decision-producing front end to ordinary generation APIs, never as a bypass around validation.
7. Broaden classes/backgrounds/species only through legally redistributable SRD 5.2.1 content.

## Guardrails

- Work directly on `dev`; preserve `dev -> qa -> main` exact-SHA promotion.
- Native system state remains mandatory and lossless. Full stop.
- Never reconstruct retained D&D state from semantic projection data.
- Keep D&D and Foundry schemas out of shared character contracts and out of Parchment project contracts.
- Parchment may store opaque CharacterDocument data, but Character Forge remains the authority for interpreting and validating D&D-native state.
- Keep the semantic model evidence-driven and provisional.
- Record rules-source versions and generation choices in provenance.
- Use only legally redistributable SRD 5.2.1 material in this public repository.
- Continue updating `refs/architecture/translation-bridge-rpg-notes.md` whenever implementation exposes translator or future-RPG evidence.
- Keep Call of Cthulhu as the strongest current second-system candidate, but do not lock it until D&D/persistence/Foundry work reveals which assumptions most need stress-testing.
