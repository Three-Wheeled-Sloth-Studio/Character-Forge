#!/usr/bin/env python3
"""One-time non-destructive migration of this refs corpus to the Agent Academy OKF profile."""

from __future__ import annotations

import json
from pathlib import Path

try:
    import yaml
except ImportError as exc:
    raise SystemExit("PyYAML is required: python -m pip install -r requirements-dev.txt") from exc

ROOT = Path(__file__).resolve().parents[2]
REFS = ROOT / "refs"
SLUG = 'character-forge'
TYPE_MAP = {'README.md': 'Project Memory Guide', 'architecture': 'Architecture Reference', 'handoffs': 'Handoff Record', 'implementation': 'Implementation Reference', 'integration': 'Integration Reference', 'planning': 'Planning Reference', 'product': 'Product Reference', 'testing': 'Testing Reference'}
PROJECT_REPLACEMENTS = [('  testing: refs/testing\n', '  testing: refs/testing\n  okf_profile: refs/okfProfile.yaml\n  okf_discovery_index: refs/index.md\n')]


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def replace_once(path: Path, old: str, new: str) -> None:
    content = read(path)
    if new in content:
        return
    if old not in content:
        raise SystemExit(f"Expected migration anchor not found in {path.relative_to(ROOT)}")
    write(path, content.replace(old, new, 1))


def append_once(path: Path, marker: str, block: str) -> None:
    content = read(path)
    if marker in content:
        return
    if not content.endswith("\n"):
        content += "\n"
    write(path, content + block)


def first_heading(content: str) -> str:
    body = content
    if content.startswith("---\n"):
        end = content.find("\n---\n", 4)
        if end >= 0:
            body = content[end + 5:]
    for line in body.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return "Project Memory Reference"


def concept_type(path: Path) -> str:
    relative = path.relative_to(REFS)
    if len(relative.parts) == 1:
        return TYPE_MAP.get(relative.name, "Project Memory Reference")
    return TYPE_MAP.get(relative.parts[0], "Project Memory Reference")


def tag_for(path: Path) -> str:
    relative = path.relative_to(REFS)
    return relative.parts[0] if len(relative.parts) > 1 else "project-memory"


def migrate_markdown() -> int:
    changed = 0
    for path in sorted(REFS.rglob("*.md")):
        if path.name in {"index.md", "log.md"} or "__pycache__" in path.parts:
            continue
        content = read(path)
        ctype = concept_type(path)
        if content.startswith("---\n"):
            end = content.find("\n---\n", 4)
            if end < 0:
                raise SystemExit(f"Unclosed frontmatter in {path.relative_to(ROOT)}")
            raw = content[4:end]
            data = yaml.load(raw, Loader=yaml.BaseLoader) or {}
            if not isinstance(data, dict):
                raise SystemExit(f"Frontmatter must be a mapping in {path.relative_to(ROOT)}")
            if data.get("type"):
                continue
            insertion = f"type: {json.dumps(ctype)}\n"
            write(path, "---\n" + insertion + content[4:])
            changed += 1
            continue

        title = first_heading(content)
        frontmatter = (
            "---\n"
            f"type: {json.dumps(ctype)}\n"
            f"title: {json.dumps(title)}\n"
            "tags:\n"
            f"- {SLUG}\n"
            f"- {tag_for(path)}\n"
            "---\n"
        )
        write(path, frontmatter + content)
        changed += 1
    return changed


def update_gitignore() -> None:
    path = ROOT / ".gitignore"
    content = read(path)
    additions = []
    if "__pycache__/" not in content:
        additions.append("__pycache__/")
    if "*.py[cod]" not in content:
        additions.append("*.py[cod]")
    if additions:
        if not content.endswith("\n"):
            content += "\n"
        write(path, content + "\n".join(additions) + "\n")


def update_package() -> None:
    path = ROOT / "package.json"
    data = json.loads(read(path))
    scripts = data.setdefault("scripts", {})
    scripts["validate:okf"] = "python refs/tools/validate_okf.py"
    if 'character' == "world":
        scripts["validate"] = (
            "npm run validate:okf && npm run typecheck && npm test && "
            "npm run test:production-page-harness && npm run test:production-rerank"
        )
    else:
        scripts["validate:refs"] = "python refs/tools/validate_refs.py && npm run validate:okf"
    write(path, json.dumps(data, indent=2) + "\n")


def update_project_memory() -> None:
    project = REFS / "project.yaml"
    replace_once(project, "updated: 2026-08-28\n", "updated: 2026-09-03\n")
    for old, new in PROJECT_REPLACEMENTS:
        replace_once(project, old, new)

    validation = REFS / "testing" / "validationCommands.yaml"
    replace_once(validation, "updated: 2026-08-26\n", "updated: 2026-09-03\n")
    replace_once(validation, '  refs:\n    command: python refs/tools/validate_refs.py\n    purpose: Confirm required durable project-memory files exist and contain the foundation guardrails.\n', '  refs:\n    command: npm run validate:refs\n    purpose: Confirm required durable project-memory files and foundation guardrails, then validate the Agent Academy OKF profile and deterministic discovery indexes.\n  okf:\n    command: npm run validate:okf\n    purpose: Validate OKF v0.2 concept frontmatter, the pinned Agent Academy profile, and deterministic discovery indexes.\n')
    pass

    append_once(
        REFS / "README.md",
        "## OKF-compatible discovery",
        '\n## OKF-compatible discovery\n\nCharacter Forge uses the Agent Academy OKF-compatible profile so its project memory can participate in studio-wide discovery without weakening system-native or deterministic state contracts.\n\n- Start generic OKF traversal at `refs/index.md`.\n- Profile semantics and the pinned OKF baseline are in `refs/okfProfile.yaml`.\n- Markdown knowledge files are OKF concepts; structured YAML remains authoritative where exact state matters.\n- Generated `index.md` files are committed and checked by `npm run validate:okf`.\n- OKF verification metadata is only added after actual source review; tests and structural validation do not imply factual verification.\n',
    )
    append_once(
        REFS / "handoffs" / "currentHandoff.md",
        "## Agent Academy OKF compatibility",
        '\n## Agent Academy OKF compatibility\n\nOn 2026-09-03, Character Forge adopted the Agent Academy `agent-academy-okf-v1` compatibility profile pinned to OKF v0.2 and Agent Academy commit `16691651776151a7eb1f13d99a92658e0684e6`.\n\nThis is a project-memory interoperability increment. Native character state, system-adapter ownership, translation-loss rules, generation replayability, licensing boundaries, and exact-SHA promotion remain unchanged. Markdown refs are now OKF concepts and committed deterministic indexes expose the corpus to generic OKF consumers and the future studio catalog.\n',
    )

    refs_agents = REFS / "agents.yaml"
    replace_once(refs_agents, "updated: 2026-08-26\n", "updated: 2026-09-03\n")
    append_once(
        refs_agents,
        "okf_profile:",
        "\nokf_profile:\n  profile: refs/okfProfile.yaml\n  discovery_index: refs/index.md\n",
    )

    agents = ROOT / "AGENTS.md"
    replace_once(agents, '6. Read relevant shared studio guidance from `Three-Wheeled-Sloth-Studio/TWS-Design-Principles` when available.\n', '6. Read relevant shared studio guidance from `Three-Wheeled-Sloth-Studio/TWS-Design-Principles` when available.\n7. Use `refs/index.md` for generic OKF-compatible discovery; `refs/okfProfile.yaml` defines the Agent Academy interoperability boundary while the reading order above remains authoritative.\n')
    pass


def update_workflow() -> None:
    replace_once(ROOT / '.github/workflows/verify.yml', '      - name: Checkout\n        uses: actions/checkout@v6\n      - name: Setup Node\n', "      - name: Checkout\n        uses: actions/checkout@v6\n      - name: Setup Python\n        uses: actions/setup-python@v6\n        with:\n          python-version: '3.11'\n      - name: Install refs dependencies\n        run: python -m pip install -r requirements-dev.txt\n      - name: Setup Node\n")


def main() -> int:
    changed = migrate_markdown()
    update_gitignore()
    update_package()
    update_project_memory()
    update_workflow()
    print(f"Added or completed OKF frontmatter on {changed} Markdown concepts.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
