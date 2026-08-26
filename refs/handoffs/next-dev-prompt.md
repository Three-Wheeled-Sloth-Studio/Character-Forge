# Next Development Prompt

Continue Character Forge D&D 5E 2024 work from the manual-ability-generation checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Accepted cross-repo baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted. Do not reopen it without new evidence.

Accepted Character Forge `qa` / `main` checkpoint:

- `8041edb4009abce8a836faafce9a167883e92bda`

Accepted Parchment Worlds `qa` / `main` checkpoint:

- `f5eb7224f71ed64d033aaac038a933fbd8850c48`

Parchment issue #24 is complete.

Background, non-blocking Character Forge issues:

- #2: trace why the owner's effective runtime still displayed name-derived character/native-state IDs despite opaque UUID helpers being present in current dev code.
- #3: add compact icon-first Copy JSON / Download JSON controls to the CharacterDocument inspector.

Do not prioritize either ahead of the current generation sequence unless new evidence makes it blocking.

## Current implementation checkpoint

Manual ability generation is implemented on `dev` at:

- `f48ee8ff92a6fb349a9c74f462121fe0eaa07021`
- GitHub Actions run `33021611610`
- full `npm run verify` green
- 6 test files / 29 tests green
- web build green

Tracked by issue #5.

## Read first

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
11. GitHub issue #1
12. GitHub issue #5

Relevant code seams:

- `packages/system-dnd5e/src/abilityGeneration.ts`
- `packages/system-dnd5e/src/manualGenerate.ts`
- `packages/system-dnd5e/src/firstSliceCharacter.ts`
- `packages/system-dnd5e/src/adapter.ts`
- `apps/web/src/main.ts`

## Immediate gate: owner runtime QA for Manual Ability Entry

Do not begin point cost until the current manual slice is owner-accepted.

Use the normal Parchment-hosted Character Forge flow and verify:

1. Quick Generate still works.
2. Manual Ability Entry accepts a required name and six integer base scores from 3 through 18.
3. A legal Soldier +2/+1 or +1/+1/+1 choice is applied correctly.
4. Final scores, Fighter HP, Initiative, and Passive Perception recalculate from the resulting final abilities.
5. The CharacterDocument records:
   - `abilities.generationMethod: manual`;
   - `generation.mode: manual`;
   - `generation.methodId: dnd5e:manual-first-slice`;
   - manual base scores and background increases as decisions;
   - no random seed;
   - native provenance origin `manual`.
6. Saving the manual character to Parchment, hard reloading, and reopening it preserves the document and native validation.
7. An invalid manual score is rejected inline rather than creating invalid native state.

If QA finds a defect, fix only the failing manual/shared-ability seam and rerun `npm run verify`.

If QA is green:

1. record owner acceptance in the handoff and issue #5;
2. close issue #5;
3. promote the exact accepted Character Forge SHA through `dev -> qa -> main`;
4. begin point cost below.

## Next implementation slice: point cost

Add D&D 5E point cost as another base-score generation method that converges on the existing shared ability-state path.

The point-cost slice should:

- put D&D-specific point costs and legal purchase limits in the D&D system package, not shared character contracts;
- produce six legal pre-background base scores;
- record spend, remaining budget if applicable, and important purchase decisions in generation provenance;
- pass the purchased base scores into the existing shared background-adjustment/final-score behavior;
- use the existing first-slice native character builder and adapter;
- expose the method in the browser without turning the page into a full character editor;
- save/reopen through the unchanged Parchment CharacterDocument boundary.

Do not duplicate background adjustment, final-score derivation, dependent-stat recalculation, or persistence logic.

## Subsequent order

1. reusable dice-expression generation, with 4d6 drop lowest as the first D&D expression;
2. guided choices replacing fixed Human / Soldier / Fighter incrementally;
3. early guided narrative generation that produces inspectable ordinary generation decisions;
4. broader legally redistributable SRD species/background/class breadth;
5. Foundry D&D 5E integration;
6. maintenance and advancement after those foundations.

## Architecture rules

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- All generation methods converge on the same system-native validation and persistence boundary.
- Character Forge owns RPG-native interpretation, validation, and generation provenance.
- Parchment owns project membership, generic asset lifecycle, relationships, persistence, and future sync/share behavior.
- Keep D&D and Foundry schemas out of shared Character Forge and Parchment contracts.
- Persistence does not require semantic translation.
- Keep semantic concepts provisional until cross-system evidence supports them.
- Use only legally redistributable SRD 5.2.1 content in this public repository.
- Preserve exact-SHA `dev -> qa -> main` promotion.
