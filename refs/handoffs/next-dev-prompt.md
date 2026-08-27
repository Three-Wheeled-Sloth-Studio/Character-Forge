# Next Development Prompt

Continue Character Forge D&D 5E 2024 work from the completed base ability-generation checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Accepted cross-repo baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted. Do not reopen it without new evidence.

Accepted Character Forge `qa` / `main` checkpoint:

- `8041edb4009abce8a836faafce9a167883e92bda`

Parchment character persistence issue #24 is complete.

Background non-blockers:

- #2: trace the effective runtime path that still displayed name-derived character/native-state IDs despite UUID helpers in current code.
- #3: add compact icon-first Copy JSON / Download JSON controls to the CharacterDocument inspector.

Do not prioritize either ahead of generation work unless new evidence makes it blocking.

## Current dev checkpoint

The base D&D ability-score generation family is implemented on `dev` at:

- code `bfe90583c42a39317f03916f1ca51be7b8ddefb5`
- GitHub Actions run `33026099499`
- job `98367663310`
- full `npm run verify` green
- 11 test files / 47 tests green
- web build green

The current stack includes:

- Quick Generate;
- explicit Standard Array;
- Manual Ability Entry;
- SRD Point Cost;
- SRD Random Generation (`4d6kh3` six times plus roll-slot assignment);
- reusable deterministic generator-core dice/seed primitives;
- D&D adapter `0.4.0` validating all four explicit ability methods.

Issues #5, #7, and #8 remain open because owner runtime QA for these unpromoted generation methods was deliberately deferred. Continued `dev` feature work is explicitly allowed; do not promote them to `qa`/`main` until the combined owner pass is accepted.

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
11. GitHub issues #1, #5, #7, and #8

Relevant code seams:

- `packages/generator-core/src/seededRandom.ts`
- `packages/generator-core/src/diceExpression.ts`
- `packages/system-dnd5e/src/abilityGeneration.ts`
- `packages/system-dnd5e/src/standardArrayGenerate.ts`
- `packages/system-dnd5e/src/manualGenerate.ts`
- `packages/system-dnd5e/src/pointCostGenerate.ts`
- `packages/system-dnd5e/src/randomGenerate.ts`
- `packages/system-dnd5e/src/firstSliceCharacter.ts`
- `packages/system-dnd5e/src/adapter.ts`
- `apps/web/src/main.ts`

## Next implementation slice: guided mechanical character creation

Do not add another ability-score generation method. Move up one level and begin replacing the fixed Human / Soldier / Fighter fixture with ordinary guided mechanical choices.

Start with the smallest decision dimension that creates real architectural value without requiring a broad rules-dataset extraction. Good candidates are one origin or class-owned choice already represented by the first-slice native schema, such as Fighting Style, a Human Origin feat choice, class skills, or Weapon Mastery selection.

The slice should:

- expose the legal choices through D&D-owned data/contracts;
- record the user's selection as an ordinary GenerationDecision;
- route the selected choice through the existing native character builder rather than patching the rendered document afterward;
- recompute dependent native state where the choice affects it;
- validate independently through the D&D adapter;
- preserve all existing ability-generation methods as interchangeable base-score steps;
- keep Human / Soldier / Fighter fixed except for the single decision dimension deliberately opened by the slice;
- use the unchanged CharacterDocument and Parchment persistence boundary.

Prefer a small reusable choice seam over a large form wizard or broad SRD import.

## After the first guided choice

1. Open additional mechanical choice dimensions incrementally until the fixed first-slice template becomes a real guided Level 1 builder.
2. Add guided narrative early enough to shape the architecture: fictional/preference answers should produce inspectable weights/decisions and then call the same ordinary generation APIs.
3. Broaden legally redistributable SRD species/background/class choices only as those guided seams need them.
4. Add Foundry D&D 5E integration after generation is broad enough to make the adapter useful.
5. Add maintenance and advancement after those foundations.

## Deferred combined QA

When the owner requests the accumulated runtime QA pass, cover Standard Array, Manual, Point Cost, and Random in one session, plus at least one Parchment save/reload/reopen. Until then, keep these methods on `dev` and automated-green rather than repeatedly stopping feature work for separate acceptance passes.

## Architecture rules

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- All generation methods converge on the same system-native validation and persistence boundary.
- Generator-core is system-neutral; system-specific dice procedures and creation budgets belong to adapters/system packages.
- Character Forge owns RPG-native interpretation, validation, generation choices, and provenance.
- Parchment owns project membership, generic asset lifecycle, relationships, persistence, and future sync/share behavior.
- Keep semantic concepts provisional until cross-system evidence supports them.
- Use only legally redistributable SRD 5.2.1 content in this public repository.
- Preserve exact-SHA `dev -> qa -> main` promotion.
