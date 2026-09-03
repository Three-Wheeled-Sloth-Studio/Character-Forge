# Agent Instructions

Before changing this repository:

1. Read `refs/README.md`.
2. Read `refs/project.yaml` and `refs/agents.yaml`.
3. Read `refs/handoffs/currentHandoff.md`.
4. Read the relevant planning, architecture, product, testing, and integration references.
5. Treat `refs/` as durable project memory and update it when implementation changes a fact, decision, risk, validation command, or handoff state.
6. Read relevant shared studio guidance from `Three-Wheeled-Sloth-Studio/TWS-Design-Principles` when available.
7. Use `refs/index.md` for generic OKF-compatible discovery; `refs/okfProfile.yaml` defines the Agent Academy interoperability boundary while the reading order above remains authoritative.

## Repository workflow

This repository uses one active implementation path and exact-SHA promotion.

1. Work directly on `dev` unless the user explicitly directs otherwise.
2. Commit coherent, internally consistent milestones to `dev`.
3. Do not create routine feature branches or pull requests unless explicitly requested.
4. Promote the exact accepted commit through `dev -> qa -> main`.
5. Treat `qa` as the acceptance environment and `main` as production.
6. Keep planning, architecture, testing, and handoff references current in the same increment as the implementation they describe.
7. Prefer small, reversible vertical slices over speculative framework construction.

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

Run the narrowest useful checks while developing and run `npm run verify` before declaring a milestone complete. Do not claim validation passed unless it actually ran successfully.
