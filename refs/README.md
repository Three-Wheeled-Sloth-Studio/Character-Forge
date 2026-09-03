---
type: "Project Memory Guide"
title: "Character Forge Project Memory"
tags:
- character-forge
- project-memory
---
# Character Forge Project Memory

`refs/` is durable project memory for humans and coding agents.

## Required reading

1. `AGENTS.md`
2. `refs/project.yaml`
3. `refs/agents.yaml`
4. `refs/handoffs/currentHandoff.md`
5. `refs/handoffs/next-dev-prompt.md`
6. `refs/architecture/character-architecture.md`
7. `refs/architecture/translation-bridge-rpg-notes.md`
8. Relevant planning, product, integration, and testing references

## Maintenance rules

- Keep durable facts, decisions, architecture, risks, validation commands, and handoff state here.
- Use YAML for compact structured state and Markdown for explanatory guidance.
- Update references in the same increment that changes their truth.
- Record translator and bridge-RPG discoveries in `refs/architecture/translation-bridge-rpg-notes.md` as they are learned.
- Do not promote an observation into a universal semantic contract simply because D&D needs it.
- Do not store secrets, credentials, private user data, or non-redistributable rules content in `refs/`.

## Validation

```bash
python refs/tools/validate_refs.py
```

## OKF-compatible discovery

Character Forge uses the Agent Academy OKF-compatible profile so its project memory can participate in studio-wide discovery without weakening system-native or deterministic state contracts.

- Start generic OKF traversal at `refs/index.md`.
- Profile semantics and the pinned OKF baseline are in `refs/okfProfile.yaml`.
- Markdown knowledge files are OKF concepts; structured YAML remains authoritative where exact state matters.
- Generated `index.md` files are committed and checked by `npm run validate:okf`.
- OKF verification metadata is only added after actual source review; tests and structural validation do not imply factual verification.
