# Character Forge

Character Forge is a public, modular character-generation and character-translation engine for the Parchment Worlds ecosystem.

The first rules target is D&D 5E 2024, beginning with legally redistributable SRD material. The engine is designed to support many RPG systems without making any one system's character sheet the universal data model.

## Product direction

Character Forge is intended to grow toward:

- Character generation across major RPG systems and multiple generation methods.
- Loss-aware translation between systems through a shared semantic character layer.
- Native system state preservation for exact round-trip and translation testing.
- First-class character assets in Parchment Worlds.
- Foundry VTT integration, followed by additional VTT adapters.
- Hosted character maintenance, sharing, and QR access through Parchment Worlds.
- Portrait, token, and eventual 3D character asset generation.
- Evidence that helps shape a future original RPG without prematurely forcing that RPG into a d20 mold.

## Current foundation

PI 0 establishes:

- `dev -> qa -> main` promotion flow.
- Durable project memory under `refs/`.
- A minimal TypeScript workspace.
- The canonical CharacterDocument boundary.
- Mandatory, lossless native system state.
- A deliberately provisional semantic projection layer.
- Generation provenance with guided-narrative generation represented as a first-class mode.
- CI verification on development, QA, and production branches.

See `refs/handoffs/currentHandoff.md` for the current implementation state.

## Development

Requirements:

- Node.js 22 or newer
- Python 3 for refs validation

Install and verify:

```bash
npm install
npm run verify
```

Routine development happens directly on `dev`. Accepted commits promote unchanged through `qa` and then `main`.

The PW workspace pull/build scripts include Character Forge. Deployment is orchestrated from the private Parchment Worlds repository after exact-source CI verification and publishes this app at `apps/character-forge/`; deployment credentials do not live in this public repository.

## Licensing

Repository source code is licensed under the repository `LICENSE`.

Rules-system adapters and rules content have separate licensing concerns. A system adapter does not imply permission to redistribute publisher-owned rules text, art, trademarks, or other protected content. System-specific content must carry explicit source and licensing metadata before it is committed.
