---
type: "Project Memory Guide"
title: "Character Forge Project Memory"
tags:
- character-forge
- project-memory
---
# Character Forge Project Memory

`refs/` is durable project memory for humans and coding agents.

## Routine re-entry

For ordinary continuation or after a coding-agent context reset, begin with:

```bash
python refs/tools/generate_agent_context.py --focus "<short task phrase>"
```

The packet is deliberately bounded and derived. It summarizes current handoff highlights, relevant active roadmap items, file-map hints, validation commands, and optional local Git delta. It is not authoritative project state.

Load context progressively:

1. generated re-entry packet;
2. `refs/implementation/fileMap.yaml` hints and targeted source/refs reads;
3. `refs/handoffs/currentHandoff.md`;
4. deeper roadmap, architecture, integration/source contracts, evidence history, or broad source only when the task requires them.

Use `--output .agent-context.md` if a local scratch file is helpful. `.agent-context.md` is ignored and must not be committed.

## Full/bootstrap reading

When bootstrapping the project, changing architecture boundaries, or resolving identity/provenance questions, read as relevant:

1. `AGENTS.md`
2. `refs/project.yaml`
3. `refs/agents.yaml`
4. `refs/handoffs/currentHandoff.md`
5. `refs/handoffs/next-dev-prompt.md`
6. `refs/architecture/character-architecture.md`
7. `refs/architecture/translation-bridge-rpg-notes.md`
8. relevant planning, product, integration, and testing references

## Maintenance rules

- Keep durable facts, decisions, architecture, risks, validation commands, and handoff state here.
- Use YAML for compact structured state and Markdown for explanatory guidance.
- Update references in the same increment that changes their truth.
- Keep `currentHandoff.md` delta-oriented rather than accumulating full project history.
- Record translator and bridge-RPG discoveries in `refs/architecture/translation-bridge-rpg-notes.md` as they are learned.
- Do not promote an observation into a universal semantic contract simply because D&D or BRP needs it.
- Do not store secrets, credentials, private user data, or non-redistributable rules content in `refs/`.
- Generated re-entry packets are scratch artifacts, never an alternate source of truth.

## Validation

```bash
npm run validate:paths
npm run validate:refs
npm run validate:agent-context
npm run verify
```

## OKF-compatible discovery

Character Forge uses the Agent Academy OKF-compatible profile so its project memory can participate in studio-wide discovery without weakening system-native or deterministic state contracts.

- Start generic OKF traversal at `refs/index.md`.
- Profile semantics and the pinned OKF baseline are in `refs/okfProfile.yaml`.
- Markdown knowledge files are OKF concepts; structured YAML remains authoritative where exact state matters.
- Generated `index.md` files are committed and checked by `npm run validate:okf`.
- OKF verification metadata is only added after actual source review; tests and structural validation do not imply factual verification.
