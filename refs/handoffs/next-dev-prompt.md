# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

Start from the first D&D 5E 2024 native-path checkpoint:

- `59ea8edc942619c3f931f6c748ca8c6820d5aef8`

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

Before expanding implementation, run `npm run verify` on the checkpoint. Do not promote anything to `qa` unless the full gate is green. If a local `package-lock.json` exists from dependency installation, retain and commit it so installs are reproducible.

## Current implementation

The repository now contains:

- A shared versioned `RulesSystemAdapter` contract.
- D&D SRD 5.2.1 source and CC-BY-4.0 provenance metadata.
- A typed D&D-native character schema.
- One fixed legal Human Soldier Fighter Level 1 Standard Array character.
- Native validation for source/version/schema, ability consistency, Standard Array legality, Soldier ability increases, Level 1 proficiency, and Fighter HP.
- Exact native JSON round-trip tests and generation provenance.

The fixed character is a proving fixture, not the desired generator API.

## Immediate next slice

Generalize only the ability-generation seam while keeping Human + Soldier + Fighter 1 fixed.

1. Replace the fixed Standard Array placement with an input-driven Standard Array assignment builder.
2. Accept any permutation of 15, 14, 13, 12, 10, and 8 across the six abilities.
3. Accept either legal Soldier background increase pattern: +2 to one listed ability and +1 to another, or the SRD-supported alternative if/when that path is deliberately implemented and tested. Do not silently assume more than the current source data supports.
4. Recompute final ability scores and affected derived D&D values through D&D-owned code.
5. Record assignments and background adjustments as generation decisions.
6. Add manual ability assignment only after the Standard Array builder uses the same native-state creation/validation boundary.

Do not broaden classes, backgrounds, species, equipment packages, or feats in the same increment unless a concrete dependency forces it. Prefer one usable parameterized path over a partial rules database.

## Guided narrative preparation

Keep guided narrative generation visible in the design while generalizing the builder:

- The eventual narrative path should emit ordinary inspectable generation decisions.
- Narrative answers belong in generation provenance.
- Narrative generation must converge on the same native D&D validation and save boundary as manual and mechanical generation.
- Do not build narrative UI yet unless it is the smallest way to test the decision contract.

## Hard requirements

- Native system state is mandatory and lossless. Full stop.
- Do not reconstruct retained D&D state from semantic traits.
- Do not let D&D or Foundry schemas leak into the shared character model.
- Do not create a large universal trait ontology from D&D alone.
- Keep rules-source versions and generation choices in provenance.
- Use only legally redistributable SRD 5.2.1 material in this public repository.
- Update `refs/architecture/translation-bridge-rpg-notes.md` whenever implementation teaches us something about cross-system semantics or the future original RPG.
- Preserve the normal promotion path: `dev -> qa -> main` using the exact accepted SHA.
