# Next Development Prompt

Continue the Character Forge / Parchment Worlds character path from the implemented durable persistence checkpoint.

Repositories:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`
- `https://github.com/Three-Wheeled-Sloth-Studio/Parchment-Worlds`

Work directly on `dev` in both repositories.

Current implementation checkpoints:

- Character Forge: `2a61e1b7a92e35640cb1a38aac3b85df9bad58d5`
- Parchment Worlds code: `145db1065f6483df34c1d5ff3210aafb0bc52389`
- Parchment Worlds documentation head: `043dd09211eb3dce96e1914050ddbfdc2ffe9b89`

Automated validation is green in both repositories:

- Character Forge GitHub Actions run `33015129238`, full `npm run verify` green.
- Parchment Worlds GitHub Actions run `33015153131`, refs/source-size/typecheck, 52 test files / 175 tests, and production Vite bundle green.

The earlier local launcher/embed/Quick Generate seam is owner-accepted. Do not reopen it without new evidence.

## Read first

Character Forge:

1. `AGENTS.md`
2. `refs/README.md`
3. `refs/project.yaml`
4. `refs/handoffs/currentHandoff.md`
5. `refs/architecture/character-architecture.md`
6. `refs/architecture/translation-bridge-rpg-notes.md`
7. `refs/integration/dnd5e-srd-5.2.1.md`
8. `refs/product/generation-methods.md`
9. `refs/planning/roadmap.yaml`
10. `refs/testing/validationCommands.yaml`
11. GitHub issue `#1`

Parchment Worlds:

1. `AGENTS.md`
2. `refs/README.md`
3. `refs/project.yaml`
4. `refs/handoffs/currentHandoff.md`
5. `refs/handoffs/character-persistence-next-slice.md`
6. `refs/implementation/character-persistence-slice-2026-08-26.md`
7. GitHub issue `#24`

## Immediate action: owner runtime QA, not new feature work

The persistence implementation is automated-green but not yet owner-accepted.

Exercise the real browser path at the exact current dev SHAs:

1. Open an active Parchment project.
2. Open Character Forge from that project.
3. Generate a character and inspect the complete CharacterDocument.
4. Click `Save to project`.
5. Return to project overview and confirm the character is listed under Characters.
6. Hard reload Parchment and confirm the character remains listed.
7. Click `Open in Character Forge`.
8. Confirm the retained character renders and native validation remains green.
9. Compare the reopened CharacterDocument with the pre-save document, especially:
   - `characterId`
   - `primaryNativeStateId`
   - every retained `nativeState`
   - native schema/rules/source versions
   - generation method and seed
   - recipe and decisions
   - provenance
10. Open the global Character Forge route and confirm durable save requires explicit project selection.

If QA finds a defect, fix only the failing persistence/reopen seam and rerun both repositories' authoritative gates.

If QA is green:

1. record acceptance in both handoffs;
2. update/close Parchment issue #24 as appropriate;
3. promote the exact accepted SHAs through `dev -> qa -> main` according to repository policy;
4. then begin the next Character Forge generation slice below.

## Next implementation slice after persistence acceptance

Return to D&D generation breadth one dimension at a time. Do not expand Parchment into RPG mechanics.

Recommended sequence:

1. Extract shared D&D background-adjustment/final-score behavior so all ability-generation methods converge on one native ability-state representation.
2. Add manual ability entry with explicit generation provenance.
3. Add point cost.
4. Add 4d6 drop lowest through a reusable dice-expression pipeline rather than a one-off roller.
5. Incrementally replace fixed Human / Soldier / Fighter choices with guided choices.
6. Add guided narrative as a front end that produces inspectable ordinary generation decisions and calls the same system APIs.
7. Keep Quick Generate as a fast GM path alongside guided creation.

The smallest useful post-persistence code slice is therefore shared ability-state behavior plus manual entry. Do not jump directly to full character editing or maintenance.

## Architecture rules to preserve

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection data.
- Character Forge remains authoritative for RPG-native interpretation and validation.
- Parchment remains authoritative for project ownership, generic asset identity/lifecycle, relationships, persistence, and future sync/share concerns.
- Keep D&D and Foundry schemas out of shared Parchment project contracts.
- Persistence does not require semantic translation.
- Keep semantic translation evidence-driven and provisional.
- Use only legally redistributable SRD 5.2.1 material in the public Character Forge repository.
- Preserve exact-SHA promotion through `dev -> qa -> main` in both repositories.
