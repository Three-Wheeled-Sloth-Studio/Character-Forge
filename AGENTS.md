# Agent Instructions

Before changing this repository:

1. For routine continuation or after a context reset, start with `python refs/tools/generate_agent_context.py --focus "<short task phrase>"`.
2. Treat the generated packet as derived orientation only. Load authoritative refs and source progressively as the task requires.
3. On first project bootstrap, or when project identity/branch policy is material, read `refs/README.md`, `refs/project.yaml`, and `refs/agents.yaml`.
4. Read `refs/implementation/fileMap.yaml` before searching broadly.
5. Read `refs/handoffs/currentHandoff.md` for the accepted baseline, recent delta, current gap, next slice, constraints, and validation.
6. Read deeper planning, architecture, product, testing, integration, and source references only when the task crosses those boundaries or compact evidence is insufficient.
7. Treat `refs/` as durable project memory and update it when implementation changes a fact, decision, risk, validation command, or handoff state.
8. Read relevant shared studio guidance from `Three-Wheeled-Sloth-Studio/TWS-Design-Principles` when available.
9. Use `refs/index.md` for generic OKF-compatible discovery; `refs/okfProfile.yaml` defines the Agent Academy interoperability boundary while authoritative structured refs remain the source of truth.

Generated `.agent-context.md` packets are disposable scratch context. Never commit them as an alternate source of truth.

## Context and token discipline

- Prefer diff-first continuation from the accepted checkpoint over reconstructing unchanged repository state after a reset.
- Prefer file-map hints, targeted file ranges, symbol/search results, deterministic diagnostics, and tests over broad whole-repository reads.
- Treat accepted decisions and do-not-reopen constraints as inputs unless new runtime, test, source, or user evidence contradicts them.
- If substantially the same diagnostic, search, comparison, or transformation is performed twice, make it a reusable script/helper/test before doing it a third time unless it is genuinely one-off.
- Keep the active handoff delta-oriented. Historical detail belongs in the roadmap, archived references, integration/source contracts, or architecture evidence ledger rather than accumulating indefinitely in `currentHandoff.md`.

## Repository workflow

This repository uses one active implementation path and exact-SHA promotion.

1. Work directly on `dev` unless the user explicitly directs otherwise.
2. Commit coherent, internally consistent milestones to `dev`.
3. Do not create routine feature branches or pull requests unless explicitly requested.
4. Promote the exact accepted commit through `dev -> qa -> main`.
5. Treat `qa` as the acceptance environment and `main` as production.
6. Keep planning, architecture, testing, and handoff references current in the same increment as the implementation they describe.
7. Prefer small, reversible vertical slices over speculative framework construction.

## Cross-platform path safety

- Never create, rename, or retain two tracked paths that differ only by letter casing.
- The Git index is authoritative for collision detection. Run `npm run validate:paths`; it uses `git ls-files`, normalizes separators, case-folds complete paths, and fails on distinct paths that collide.
- Match import/reference casing exactly to the tracked path.
- Use semantic companion names such as `Model`, `State`, `View`, `Adapter`, `Geometry`, or `Utils`; capitalization alone is not a valid distinction.
- Perform case-only renames through a temporary intermediate filename, then verify the Git diff and run the path guard.

## Character architecture invariants

- Native system state is mandatory. A Character Forge character must retain at least one complete system-owned native representation.
- Never discard or reconstruct native state from the universal semantic layer when an original native representation is available.
- The semantic character layer is a translation bridge, not the sole source of truth for a system-native character.
- Treat the semantic vocabulary as provisional and evidence-driven. Do not design a giant universal ontology before multiple systems demonstrate the need.
- Translation must eventually report information loss or approximation explicitly rather than silently inventing equivalence.
- Random generation must be replayable where practical through recorded recipes, seeds, choices, and rules-source versions.
- Guided narrative generation is a first-class generation family, not a UI-only shortcut.
- System adapters own system-specific rules behavior. Shared packages must not quietly become D&D-specific.

## Universal translator and bridge RPG learning loop

Whenever implementation exposes a reusable semantic concept, a translation mismatch, a system-specific assumption, or a mechanic that may inform the future original RPG, update `refs/architecture/translation-bridge-rpg-notes.md`.

That file is an evidence ledger, not a requirements dumping ground. Record what was observed, why it matters, confidence, and any future action. Keep bridge-RPG ideas as hypotheses until they are deliberately promoted into their own design contract.

The current bridge-RPG direction is explicitly non-d20 and favors bell-shaped resolution, persistent wound consequences, psychic and techno-magic capabilities, dark horror, and cyberpunk/steampunk aesthetics. Character Forge must leave space for that direction without prematurely encoding its mechanics into shared contracts.

## Licensing and public-repository safety

- Never commit secrets, credentials, private infrastructure values, user data, or machine-local configuration.
- Do not commit non-redistributable rules text or assets.
- Record source, version, and licensing provenance for system content.
- A compatible adapter may describe or map a protected system without copying protected corpus content into this repository.

## Validation

Run the narrowest useful checks while developing and run `npm run verify` before declaring a milestone complete. `npm run verify` includes tracked-path collision checking, refs/OKF validation, bounded re-entry-packet validation, strict TypeScript, tests, and the web build. Do not claim validation passed unless it actually ran successfully.
