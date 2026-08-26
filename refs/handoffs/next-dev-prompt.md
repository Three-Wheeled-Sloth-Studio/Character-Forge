# Next Development Prompt

Continue the Character Forge / Parchment Worlds character path from the accepted embedded Quick Generate checkpoint.

Repositories:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`
- `https://github.com/Three-Wheeled-Sloth-Studio/Parchment-Worlds`

Work directly on `dev` in both repositories.

Accepted executable checkpoints:

- Character Forge: `7b7f89049b83da32cbc9898f3736915087c30c4e`
- Parchment Worlds: `45b5949ef204c3d44b5ca4957b8fb3129ceda34b`

Owner runtime QA on 2026-08-26 is green for the complete first user-visible seam: Parchment enables Character Creator, auto-starts Character Forge without a visible Windows terminal, embeds the browser surface, Quick Generate produces a valid D&D 5E 2024 Fighter, and the full CharacterDocument is received back by Parchment.

Treat that seam as accepted. Do not reopen it without new evidence.

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
6. the project-model Asset / Relationship / revision / provenance contracts
7. the Character Forge embed files under `apps/web/src/modules/character-forge/`
8. the project persistence/storage seams already used by other Parchment assets
9. GitHub issue `#24`

## Immediate next vertical slice: durable character assets

Make a generated Character Forge character a first-class Parchment project asset while preserving the full CharacterDocument losslessly.

The key architecture rule is simple:

**Parchment stores and relates the character; Character Forge interprets and validates the system-native character.**

Do not copy D&D mechanics into Parchment.

Recommended sequence:

1. Inspect Parchment's existing canonical `Asset`, relationship, revision, provenance, and storage contracts before adding anything.
2. Add only the smallest generic character-asset support those contracts are actually missing.
3. Choose/confirm the project-context UX for generation. A persisted character must belong to an explicit setting project; do not silently attach a global scratch character to an arbitrary recent project.
4. Persist the full Character Forge `CharacterDocument` losslessly, including:
   - stable `characterId`
   - `primaryNativeStateId`
   - every retained `nativeState`
   - rules/source/schema versions
   - generation method, seed, decisions, and provenance
   - optional semantic projection if one exists in the future
5. Parchment may index lightweight generic display metadata such as asset ID, display name, module/source, timestamps, revision, and project relationship. It must not normalize D&D ability scores, class features, HP, feats, or other system-specific fields into Parchment-owned character mechanics.
6. Add a project-level character inventory/list showing persisted characters.
7. Prove persistence across browser reload.
8. Add a reopen/edit handoff from Parchment back into Character Forge and prove the CharacterDocument returns unchanged before Character Forge performs any edits.
9. Add round-trip tests that compare retained native state and generation provenance exactly.
10. Only after persistence/reopen is green should broader generation work resume.

## Important UX constraints for the persistence slice

- Keep the existing global Character Forge entry usable, but require explicit project selection before a character is durably saved if no project context was supplied.
- Prefer a clear `Save to project` or equivalent ownership transition over invisible persistence if that makes project context unambiguous.
- A generated-but-unsaved character can remain transient during the session.
- Do not build full character maintenance/editor UX in this slice.
- Do not build hosted sharing, QR codes, Foundry sync, portrait generation, or semantic translation yet.

## Character Forge generation backlog after persistence

Return to the D&D generation pipeline one dimension at a time:

1. Extract shared D&D background-adjustment/final-score behavior.
2. Add manual ability entry with explicit provenance.
3. Add point cost.
4. Add 4d6 drop lowest through a reusable dice-expression pipeline.
5. Incrementally replace fixed Human / Soldier / Fighter choices with guided choices.
6. Add guided narrative as a front end that produces inspectable ordinary generation decisions and calls the same system APIs.
7. Keep Quick Generate as a fast GM path alongside guided creation.

## Translator and bridge-RPG note discipline

Continue updating `refs/architecture/translation-bridge-rpg-notes.md` when implementation reveals:

- reusable semantics that may matter across systems;
- a D&D-specific assumption that should not leak into shared contracts;
- translation loss or approximation categories;
- useful evidence for the future original RPG.

The future original RPG remains explicitly non-d20, with current direction toward a bell-shaped 2d10/2d12-like resolution family, persistent wound/consequence play instead of generic HP attrition, and strong native support for psychic abilities, techno-magic, dark horror, cyberpunk, and steampunk settings. These are evidence-gathering targets, not Character Forge mechanics.

Call of Cthulhu remains the strongest current second-system candidate because it would pressure-test percentile skills, occupations, Sanity/Luck, horror state, and non-class progression. Do not lock that decision yet.

## Hard requirements

- Native system state is mandatory and lossless. Full stop.
- Never reconstruct retained native state from semantic projection data.
- Character Forge remains the authority for D&D-native interpretation and validation.
- Parchment remains the authority for project ownership, asset lifecycle, relationships, persistence, and future sync/share concerns.
- Keep D&D and Foundry schemas out of shared Parchment project contracts.
- Keep semantic translation evidence-driven and provisional.
- Use only legally redistributable SRD 5.2.1 material in the public Character Forge repository.
- Preserve exact-SHA promotion through `dev -> qa -> main` in both repositories.
- Before promotion, run `npm run verify` in Character Forge and Parchment's authoritative metadata-safe validation against the exact promoted SHAs.
