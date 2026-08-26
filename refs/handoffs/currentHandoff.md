# Current Handoff

Date: 2026-08-26
Branch: dev
Phase: PI 0 repository foundation

## Current state

Character Forge began as a public license-only repository. The foundation slice establishes `dev -> qa -> main`, durable project memory, CI verification, a minimal TypeScript workspace, and the first CharacterDocument contract.

The most important invariant is explicit in both code and guidance: every character retains complete native system state. The semantic projection is optional and provisional so shared abstractions can evolve from evidence without endangering round-trip fidelity.

The initial rules target is D&D 5E 2024 using redistributable SRD material. Call of Cthulhu is the strongest current candidate for system two, but the decision remains intentionally open until the D&D slice reveals which assumptions most need a contrasting stress test. Pathfinder is expected later, likely system three or four.

## Immediate validation

Run:

```bash
npm install
npm run verify
```

CI runs the same verification workflow on pushes to dev, qa, and main.

## Next implementation slice

Begin D&D 5E 2024 Level 1 vertical-slice discovery and contracts without importing a giant rules corpus.

Priorities:

1. Define the rules-system adapter boundary and rules-source/version provenance.
2. Identify the minimum SRD 5.2.1 data needed for one legal Level 1 end-to-end character.
3. Implement one narrow generation path through native D&D state, validation, save, and reload.
4. Add standard array, point buy, 4d6 drop lowest, manual entry, quick generation, and guided narrative incrementally rather than simultaneously.
5. Record every reusable semantic observation or bridge-RPG implication in `refs/architecture/translation-bridge-rpg-notes.md`.
6. Do not build the translator package until real mappings justify its first primitives.

## Guardrails

- Work directly on dev.
- Keep native system payloads intact.
- Do not let Foundry schemas become the canonical model.
- Do not copy non-redistributable rules content.
- Keep the semantic layer provisional.
- Prefer a usable thin character over a comprehensive framework with no end-to-end flow.
