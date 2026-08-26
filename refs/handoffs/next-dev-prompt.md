# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

Start from the parameterized D&D Standard Array candidate:

- `0b69c308bea52085abc279aa155f9c3d8e066611`

Read these first:

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

Before expanding implementation, pull `dev` and run `npm run verify`. The previous native-path checkpoint passed 8 tests on the user's Windows checkout, but the current Standard Array candidate still requires the full local gate. Do not promote to `qa` unless the exact candidate is green.

A local `package-lock.json` exists but is still untracked. Retain and commit it after pulling the remote changes so dependency installs become reproducible.

## Current implementation

The repository now has:

- Mandatory, lossless native system state in `CharacterDocument`.
- A shared versioned `RulesSystemAdapter` boundary.
- SRD 5.2.1 source and CC-BY-4.0 provenance metadata.
- A typed D&D-native character schema.
- One Human Soldier Fighter Level 1 character path.
- A parameterized Standard Array builder that accepts any legal assignment of 15, 14, 13, 12, 10, and 8.
- Legal 2024 background ability adjustments in either +2/+1 or +1/+1/+1 form.
- Recalculation of affected D&D-native derived values.
- Generation provenance for the actual ability assignment and background adjustments.
- Adapter validation and negative tests around Standard Array legality and Soldier adjustment rules.

Class, background, species, equipment, and feat choices remain deliberately fixed in this slice.

## Immediate next slice

Add manual ability entry through the same D&D-owned ability-state and native validation path.

1. Extract shared background adjustment/final-score logic from the Standard Array builder rather than copying it.
2. Add a manual ability builder whose output is the same `Dnd5eAbilityState` shape with `generationMethod: "manual"`.
3. Define and test the supported legal pre-background score domain from SRD 5.2.1 before accepting manual values.
4. Recompute all affected D&D-native values from the resulting final abilities.
5. Record manual inputs and background adjustments in generation provenance.
6. Prove both Standard Array and manual methods serialize, reload, and validate through the same native state boundary.

Do not broaden classes, backgrounds, species, equipment packages, feats, or Foundry integration in this increment unless a concrete dependency forces it.

## Guided narrative preparation

Keep guided narrative generation visible while generalizing the ability seam:

- Narrative answers should become inspectable generation decisions.
- Narrative generation should call ordinary system generation APIs rather than bypassing them.
- Narrative answers and resulting choices must be retained as provenance.
- Do not build a separate narrative-only native schema or validation path.

## Hard requirements

- Native system state is mandatory and lossless. Full stop.
- Never reconstruct retained D&D state from semantic projection data.
- Keep D&D and Foundry schemas out of shared character contracts.
- Keep the semantic model evidence-driven and provisional.
- Record rules-source versions and generation choices in provenance.
- Use only legally redistributable SRD 5.2.1 material in this public repository.
- Update `refs/architecture/translation-bridge-rpg-notes.md` whenever implementation teaches us something about translation or the future original RPG.
- Treat the future original RPG as non-d20, with current hypotheses around bell-shaped 2d10/2d12 resolution, persistent wound consequences, and strong support for psychic, techno-magic, dark-horror, cyberpunk, and steampunk play. These remain design hypotheses, not Character Forge mechanics.
- Preserve the exact-SHA promotion path `dev -> qa -> main`.
