# Next Development Prompt

Continue Character Forge D&D 5E 2024 work from the guided class/species choice-pool checkpoint.

Repository:

- `https://github.com/Three-Wheeled-Sloth-Studio/Character-Forge`

Work directly on `dev`.

## Accepted cross-repo baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted. Do not reopen it without new evidence.

Accepted Character Forge `qa` / `main` checkpoint:

- `8041edb4009abce8a836faafce9a167883e92bda`

Parchment character persistence issue #24 is complete.

Background non-blockers:

- #2: trace why the owner's effective runtime still displayed name-derived character/native-state IDs despite UUID helpers in current code.
- #3: add compact icon-first Copy JSON / Download JSON controls to the CharacterDocument inspector.

Do not prioritize either ahead of guided generation unless new evidence makes it blocking.

## Current dev checkpoint

Guided class/species generation is automated-green on `dev` at:

- code `be4f6f116cdd3e238362cd8f29e93ad257ec7c1b`
- GitHub Actions run `33028213283`
- job `98374426066`
- full `npm run verify` green
- 13 test files / 54 tests / 0 failures
- web build green

The D&D adapter is `0.5.0` and accepts both legacy `dnd5e-character/0.1` and guided `dnd5e-character/0.2` native state.

Issue #9 tracks the guided class/species slice. Issues #5, #7, and #8 remain open because owner runtime QA of the accumulated generation stack is deliberately deferred. Do not promote current `dev` work to `qa` or `main` yet.

## Read first

1. `AGENTS.md`
2. `refs/README.md`
3. `refs/project.yaml`
4. `refs/handoffs/currentHandoff.md`
5. `refs/architecture/character-architecture.md`
6. `refs/architecture/translation-bridge-rpg-notes.md`
7. `refs/integration/dnd5e-srd-5.2.1.md`
8. `refs/product/generation-methods.md`
9. `refs/product/choice-pools.md`
10. `refs/implementation/guided-choice-pool-plan-2026-08-26.md`
11. `refs/implementation/srd-guided-choice-slice-2026-08-26.md`
12. `refs/planning/roadmap.yaml`
13. `refs/testing/validationCommands.yaml`
14. GitHub issues #1, #5, #7, #8, and #9

Relevant code seams:

- `packages/system-dnd5e/src/srdCatalog.ts`
- `packages/system-dnd5e/src/guidedFirstSlice.ts`
- `packages/system-dnd5e/src/guidedStandardArrayGenerate.ts`
- `packages/system-dnd5e/src/abilityGeneration.ts`
- `packages/system-dnd5e/src/nativeCharacter.ts`
- `packages/system-dnd5e/src/adapter.ts`
- `apps/web/src/stickyChoicePool.ts`
- `apps/web/src/guidedCreationPanel.ts`
- `apps/web/src/main.ts`

## Product direction now fixed for the default D&D path

Follow the official SRD 5.2.1 order by default:

1. Class
2. Origin
3. Ability Scores

Do not hardwire this sequence as a universal Character Forge assumption; later common table variations may use different orderings. It is the adapter/product default for D&D 2024.

For any ordinary single-choice menu, reuse the choice-pool pattern when practical:

- direct choice remains available;
- users may check all options they would accept;
- Character Forge may randomly pick one from the checked pool;
- checked acceptable options are user-sticky;
- sticky preference state is not written into authoritative native character state;
- the pool actually used, selection mode, and selected result are retained in per-character generation provenance.

## Current catalog/support boundary

All twelve SRD classes and all nine SRD species are present in the D&D catalog.

Currently enabled guided classes:

- Barbarian
- Fighter
- Monk
- Rogue

Currently enabled guided species:

- Dwarf
- Halfling
- Human
- Orc

Do not simply flip the other catalog entries to supported.

Spellcasting classes need a real spell/native-state seam first. Dragonborn, Elf, Gnome, Goliath, and Tiefling need their required ancestry/lineage/legacy decision modeled explicitly. The catalog should continue showing them as future options with blocking reasons rather than silently defaulting those decisions.

## Immediate next slice: SRD backgrounds

Replace the fixed Soldier assumption in guided creation with the four SRD 5.2.1 backgrounds:

- Acolyte
- Criminal
- Sage
- Soldier

Use the existing sticky acceptable-option helper for background direct/random choice.

The background catalog/contract must retain enough D&D-owned information to drive the actual generated state:

- three eligible ability IDs;
- Origin feat granted by the background;
- skill proficiencies;
- tool proficiency where applicable;
- starting equipment choices and/or gold path needed by the current generated fixture.

Then generalize the ability-increase UI/API:

- derive the legal +2/+1 and +1/+1/+1 choices from the selected background's three eligible abilities;
- do not retain a Soldier-specific switch/table in the guided surface;
- keep the existing shared ability-state validation for the actual increase pattern;
- record selected background and acceptable background pool as normal generation provenance.

Preserve class-first ordering: background selection happens after class and before species/abilities in the guided path.

## After backgrounds

1. Expose Standard Array / Point Cost / Random / Manual as interchangeable ability-method choices inside guided creation while keeping their existing standalone regression surfaces temporarily.
2. Open nested species choices and then enable Dragonborn / Elf / Gnome / Goliath / Tiefling only when their required ancestry/lineage/legacy state is explicit.
3. Add additional class-owned guided choices for the four currently supported martial classes instead of leaving permanent fixture defaults.
4. Build a proper spell/native-state seam, then enable SRD spellcasting classes incrementally.
5. Add guided narrative early enough to reuse these same catalogs, choice pools, and ordinary generation APIs rather than producing a parallel character format.
6. Add Foundry D&D 5E integration after generation is broad enough to make the adapter useful.
7. Add maintenance/advancement after those foundations.

## Deferred combined owner QA

When the owner requests the accumulated runtime pass, include the older ability methods plus the new guided class/species surface. Confirm localStorage choice-pool stickiness across reload and Parchment save/reopen of at least one `dnd5e-character/0.2` character.

Until then keep feature work automated-green on `dev`; do not promote unaccepted generation work.

## Architecture rules

- Native system state is mandatory and lossless.
- Never reconstruct retained native state from semantic projection.
- Generation methods and guided choices converge on the same system-native validation and persistence boundary.
- Sticky user preference state is separate from authoritative character state and historical generation provenance.
- Do not silently invent nested D&D choices just to broaden a support list.
- Generator-core stays system-neutral; D&D content/rules belong in `system-dnd5e`.
- Character Forge owns RPG-native interpretation, validation, generation choices, and provenance.
- Parchment owns project membership, generic asset lifecycle, relationships, persistence, and future sync/share behavior.
- Keep semantic concepts provisional until cross-system evidence supports them.
- Use only legally redistributable SRD 5.2.1 content in this public repository.
- Preserve exact-SHA `dev -> qa -> main` promotion.
