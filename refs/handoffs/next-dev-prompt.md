# Next Development Prompt

Continue Character Forge D&D 5E 2024 work from the automated-green Manual + Point Cost generation stack.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Accepted cross-repo baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted. Do not reopen it without new evidence.

Accepted Character Forge `qa` / `main` checkpoint:

- `8041edb4009abce8a836faafce9a167883e92bda`

Accepted Parchment Worlds `qa` / `main` closeout checkpoint:

- `ac704a471df1b4235112d7f3c63c3b5ee4b1236c`

Parchment issue #24 is complete.

Background, non-blocking Character Forge issues:

- #2: trace why the owner's effective runtime still displayed name-derived character/native-state IDs despite opaque UUID helpers being present in current dev code.
- #3: add compact icon-first Copy JSON / Download JSON controls to the CharacterDocument inspector.

Do not prioritize either ahead of the current generation sequence unless new evidence makes it blocking.

## Current development checkpoint

Manual Ability Entry and Point Cost are implemented together on `dev`.

Current code checkpoint:

- `914ffd38504c71e0af1785c2a4e839ca41dffd8c`
- GitHub Actions run `33022905653`
- full `npm run verify` green
- 7 test files / 36 tests green
- web build green

Manual/shared-ability implementation beneath it:

- `f48ee8ff92a6fb349a9c74f462121fe0eaa07021`

Tracked by issues #5 and #7.

The owner explicitly deferred Manual runtime QA and authorized proceeding. Do not promote the current stack to `qa` / `main` until later owner acceptance unless explicitly directed otherwise.

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
12. GitHub issues #5 and #7

Relevant current code seams:

- `packages/system-dnd5e/src/abilityGeneration.ts`
- `packages/system-dnd5e/src/manualGenerate.ts`
- `packages/system-dnd5e/src/pointCostGenerate.ts`
- `packages/system-dnd5e/src/firstSliceCharacter.ts`
- `packages/system-dnd5e/src/adapter.ts`
- `apps/web/src/main.ts`

## Current generation architecture

Standard Array, Manual Entry, and Point Cost all converge on the same D&D-native post-base-score behavior.

Method-specific code owns only how base scores are obtained or constrained. Shared ability-state code owns background contribution validation and final-score derivation. The ordinary first-slice builder then recalculates dependent D&D state, the same adapter validates it, and every method emits the same CharacterDocument shape and uses the same Parchment handoff.

Do not duplicate these downstream rules in the next slice.

## Immediate implementation slice: reusable dice expressions + D&D random abilities

Add the SRD 5.2.1 Random Generation ability method using a reusable dice-expression capability rather than a D&D-specific one-off roller.

The SRD method rolls four d6, records the total of the highest three, and repeats that process until six base scores exist.

### WP0 - Smallest reusable dice contract

Create the smallest system-neutral dice-expression representation justified by this first use case. It should support at minimum:

- number of dice;
- die size;
- keep-highest or equivalent keep/drop instruction;
- a deterministic random source / seed boundary;
- roll result detail containing individual dice and retained dice or indexes;
- total.

Do not build a complete tabletop dice grammar or parser yet. A typed expression object is enough if it cleanly supports future additions.

The reusable dice layer should not know about D&D ability scores, backgrounds, classes, or CharacterDocument.

### WP1 - Deterministic evaluator

Implement deterministic evaluation from a seed or seeded RNG abstraction.

Requirements:

- the same expression and seed reproduce the same raw dice and totals;
- different sequential rolls from one seeded stream advance deterministically;
- provenance can retain enough result detail to audit how each total was produced;
- invalid expressions fail explicitly.

Prefer a small package or generator-core seam if one already exists; otherwise add the smallest reusable location without polluting `character-model` with dice mechanics.

### WP2 - D&D random ability generator

Add a D&D-specific generation method that:

1. evaluates `4d6 keep highest 3` six times;
2. assigns the six generated totals to abilities for this first slice using an explicit input assignment or a clearly recorded deterministic assignment decision rather than hiding intent;
3. passes those six base values into the existing shared D&D ability-state path;
4. applies the ordinary Soldier background adjustment;
5. emits the normal first-slice CharacterDocument;
6. records the seed, expression, six raw roll groups, totals, assignment, and background choice in generation provenance.

The D&D adapter should validate the resulting random base scores to the extent the SRD method permits without attempting to prove a retained score was historically rolled if the raw provenance is absent. CharacterDocument persistence remains lossless; generation provenance should make replay possible when present.

### WP3 - Browser surface

Expose the random method as another compact creation panel.

Keep it small:

- character name;
- optional seed;
- Roll / Generate action;
- visible six generated totals and their assigned abilities, or a compact assignment control if needed for a legal first slice;
- legal Soldier background increase choice;
- the existing result review and Parchment handoff.

Do not turn this into the broader guided character-creation wizard yet.

### WP4 - Tests and evidence

Tests should prove:

- deterministic dice evaluation;
- keep-highest behavior;
- six independent sequential ability rolls;
- retained raw roll detail and totals;
- same seed reproduces mechanics but not durable Character Forge identity;
- random ability state uses the same shared background/final-score path;
- native adapter validation remains green;
- invalid dice expressions fail safely.

Update `refs/architecture/translation-bridge-rpg-notes.md` with any evidence about random provenance, replay, or dice expressions that may matter across systems.

Run full `npm run verify` before declaring the slice complete.

## Deferred runtime QA

Manual and Point Cost runtime QA can be combined with Random Generation later. Do not require a stop now unless implementation exposes new evidence in the already accepted Parchment/embed seam.

When the owner chooses to run the combined pass, check issues #5 and #7 plus the random-generation issue created for this slice, then promote one exact accepted stack through `dev -> qa -> main`.

## Subsequent order

1. guided choices replacing fixed Human / Soldier / Fighter incrementally;
2. early guided narrative generation that produces inspectable ordinary generation decisions;
3. broader legally redistributable SRD species/background/class breadth;
4. Foundry D&D 5E integration;
5. maintenance and advancement after those foundations.

## Architecture rules

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- All generation methods converge on the same system-native validation and persistence boundary.
- System adapters own system-specific rules behavior.
- A reusable dice evaluator must remain system-neutral; D&D owns the `4d6 keep-highest-3 repeated six times` character rule.
- Character Forge owns RPG-native interpretation, validation, and generation provenance.
- Parchment owns project membership, generic asset lifecycle, relationships, persistence, and future sync/share behavior.
- Keep D&D and Foundry schemas out of shared Character Forge and Parchment contracts.
- Keep semantic concepts provisional until cross-system evidence supports them.
- Use only legally redistributable SRD 5.2.1 content in this public repository.
- Preserve exact-SHA `dev -> qa -> main` promotion.
