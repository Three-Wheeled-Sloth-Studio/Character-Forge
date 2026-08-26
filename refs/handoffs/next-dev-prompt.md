# Next Development Prompt

Continue implementation in:

`https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

Start from the accepted Character Forge foundation implementation checkpoint:

- `4d03f93fbff55d3d833c941dad81d8e19cd2bf72`

The full local foundation gate passed on Windows on 2026-08-26:

- refs validation: 11 required project-memory files passed;
- strict TypeScript typecheck: passed;
- Vitest: 1 file passed, 3 tests passed, 0 failed.

Read these first:

1. `AGENTS.md`
2. `refs/README.md`
3. `refs/project.yaml`
4. `refs/handoffs/currentHandoff.md`
5. `refs/architecture/character-architecture.md`
6. `refs/architecture/translation-bridge-rpg-notes.md`
7. `refs/product/generation-methods.md`
8. `refs/planning/roadmap.yaml`
9. `refs/testing/validationCommands.yaml`
10. GitHub issue `#1`

Before expanding implementation, retain and commit `package-lock.json` if the local dependency installation generated it. It is still absent from remote `dev` as of the validation handoff. Continue running `npm run verify` before milestone completion and do not promote to `qa` unless the exact candidate SHA is green.

The immediate product target is the first D&D 5E 2024 SRD Level 1 vertical slice. Keep it intentionally narrow:

- Define a versioned rules-system adapter contract.
- Define rules-source and licensing provenance before adding rules data.
- Use only legally redistributable SRD 5.2.1 material.
- Identify the minimum data needed to construct one legal complete Level 1 character.
- Produce system-native D&D state through the existing CharacterDocument boundary.
- Validate, serialize, reload, and prove the native payload remains intact.
- Add generation methods incrementally after the end-to-end path works.

Generation order should favor learning over breadth. A sensible sequence is one fixed legal path, then manual ability assignment or standard array, then the remaining standard mechanical methods, then quick generation. Guided narrative generation should be introduced early enough to shape the generator contract, but not by delaying the first working character.

Hard requirements:

- Native system state is mandatory and lossless. Full stop.
- Do not reconstruct retained D&D state from semantic traits.
- Do not let D&D or Foundry schemas leak into the shared character model.
- Do not create a large universal trait ontology from D&D alone.
- Keep generation decisions, rules-source versions, and seeds or narrative answers as provenance where relevant.
- Update `refs/architecture/translation-bridge-rpg-notes.md` whenever implementation teaches us something about cross-system semantics or the future original RPG.
- Treat the future original RPG as non-d20, with current hypotheses around bell-shaped 2d10 or 2d12 resolution, persistent wound consequences, and strong support for psychic, techno-magic, dark-horror, cyberpunk, and steampunk play. These are design hypotheses, not shared Character Forge mechanics.

Call of Cthulhu remains the strongest current candidate for system two because it can stress percentile skills, Sanity, Luck, occupation-driven identity, and different advancement assumptions. Do not lock that decision yet. Pathfinder is likely system three or four rather than the first semantic stress test.

Preserve the normal promotion path: `dev -> qa -> main` using the exact accepted SHA.
