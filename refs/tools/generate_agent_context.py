#!/usr/bin/env python3
"""Generate a compact, derived re-entry packet for Character Forge coding-agent sessions."""

from __future__ import annotations

import argparse
import re
import subprocess
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError as exc:
    raise SystemExit("PyYAML is required: python -m pip install -r requirements-dev.txt") from exc

DEFAULT_MAX_CHARS = 8_000
DEFAULT_MAX_ITEMS = 6
DEFAULT_MAX_HANDOFF_SNIPPETS = 6
DEFAULT_MAX_CHANGED_PATHS = 12

_TOKEN_RE = re.compile(r"[a-z0-9]+")
_HEADING_RE = re.compile(r"^##\s+(.+?)\s*$")
_STOPWORDS = {
    "add", "agent", "and", "change", "code", "current", "for", "from",
    "into", "issue", "make", "project", "the", "this", "tool", "use",
    "with", "work",
}


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def run_git(root: Path, *args: str) -> str | None:
    try:
        result = subprocess.run(
            ["git", *args],
            cwd=root,
            capture_output=True,
            check=False,
            text=True,
            timeout=5,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    return result.stdout.strip() if result.returncode == 0 else None


def collect_git_context(root: Path, base_ref: str | None = None) -> dict[str, Any]:
    branch = run_git(root, "branch", "--show-current") or "detached"
    head = run_git(root, "rev-parse", "--short=12", "HEAD") or "unknown"
    status = run_git(root, "status", "--short") or ""
    dirty_paths = [
        line[3:].strip()
        for line in status.splitlines()
        if len(line) > 3 and line[3:].strip()
    ]
    changed_paths: list[str] = []
    resolved_base = base_ref
    if base_ref:
        exists = run_git(root, "rev-parse", "--verify", "--quiet", base_ref)
        if exists:
            changed = run_git(root, "diff", "--name-only", f"{base_ref}...HEAD") or ""
            changed_paths = [line.strip() for line in changed.splitlines() if line.strip()]
        else:
            resolved_base = None
    return {
        "branch": branch,
        "head": head,
        "base_ref": resolved_base or "handoff-defined",
        "changed_paths": changed_paths,
        "dirty_paths": dirty_paths,
    }


def read_yaml(path: Path) -> dict[str, Any]:
    if not path.is_file():
        return {}
    payload = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    return payload if isinstance(payload, dict) else {}


def clean(value: Any) -> str:
    text = " ".join(str(value or "").split()).strip()
    return "" if "TEMPLATE_TODO" in text else text


def tokens(value: str) -> set[str]:
    return {
        token
        for token in _TOKEN_RE.findall(value.casefold())
        if len(token) > 2 and token not in _STOPWORDS and not token.startswith("template")
    }


def relevance(value: str, focus_tokens: set[str]) -> int:
    return len(tokens(value) & focus_tokens) if focus_tokens else 0


def truncate(value: str, limit: int = 320) -> str:
    normalized = " ".join(value.split())
    if len(normalized) <= limit:
        return normalized
    return normalized[: limit - 3].rstrip() + "..."


def rank_records(
    records: list[tuple[str, str]],
    focus_tokens: set[str],
    limit: int = DEFAULT_MAX_ITEMS,
) -> list[tuple[str, str]]:
    if not records:
        return []
    ranked = sorted(
        records,
        key=lambda item: (relevance(f"{item[0]} {item[1]}", focus_tokens), item[0]),
        reverse=True,
    )
    if focus_tokens:
        matched = [
            item for item in ranked
            if relevance(f"{item[0]} {item[1]}", focus_tokens) > 0
        ]
        if matched:
            return matched[:limit]
    return ranked[:limit]


def active_roadmap(path: Path, focus_tokens: set[str]) -> list[tuple[str, str]]:
    payload = read_yaml(path)
    active = {"planned", "in_progress", "in-progress", "active", "ready_for_discovery"}
    records: list[tuple[str, str]] = []
    for item in payload.get("roadmap") or []:
        if not isinstance(item, dict):
            continue
        if str(item.get("status") or "").casefold() not in active:
            continue
        identifier = clean(item.get("id")) or "roadmap"
        goal = clean(item.get("summary") or item.get("goal"))
        horizon = clean(item.get("horizon"))
        current_slice = item.get("current_slice") or []
        slice_text = ""
        if isinstance(current_slice, list):
            selected = [clean(value) for value in current_slice if clean(value)][:2]
            slice_text = " Next: " + " ".join(selected) if selected else ""
        detail = " - ".join(part for part in [horizon, goal] if part) + slice_text
        if detail:
            records.append((identifier, detail))
    return rank_records(records, focus_tokens)


def markdown_blocks(path: Path) -> list[tuple[str, str]]:
    if not path.is_file():
        return []
    section = "Overview"
    blocks: list[tuple[str, str]] = []
    paragraph: list[str] = []
    in_frontmatter = False
    in_code = False

    def flush() -> None:
        if not paragraph:
            return
        text = " ".join(item.strip() for item in paragraph if item.strip()).strip()
        paragraph.clear()
        if text and "TEMPLATE_TODO" not in text:
            blocks.append((section, text))

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if line == "---" and not blocks and not paragraph:
            in_frontmatter = not in_frontmatter
            continue
        if in_frontmatter:
            continue
        if line.startswith("```"):
            flush()
            in_code = not in_code
            continue
        if in_code:
            continue
        heading = _HEADING_RE.match(line)
        if heading:
            flush()
            section = heading.group(1)
            continue
        if line.startswith("# "):
            flush()
            continue
        if not line:
            flush()
            continue
        if line.startswith(("- ", "* ")):
            flush()
            text = line[2:].strip()
            if text and "TEMPLATE_TODO" not in text:
                blocks.append((section, text))
            continue
        if re.match(r"^\d+\.\s+", line):
            flush()
            text = re.sub(r"^\d+\.\s+", "", line)
            if text and "TEMPLATE_TODO" not in text:
                blocks.append((section, text))
            continue
        paragraph.append(line)
    flush()
    return blocks


def handoff_snippets(path: Path, focus_tokens: set[str]) -> list[tuple[str, str]]:
    blocks = markdown_blocks(path)
    priority_words = {
        "next": 6, "gap": 6, "landed": 5, "accepted": 4, "constraint": 4,
        "current": 3, "validation": 2,
    }

    def score(item: tuple[str, str]) -> int:
        section, text = item
        folded = section.casefold()
        return relevance(f"{section} {text}", focus_tokens) * 10 + sum(
            weight for word, weight in priority_words.items() if word in folded
        )

    ranked = sorted(enumerate(blocks), key=lambda pair: (score(pair[1]), -pair[0]), reverse=True)
    if focus_tokens:
        matched = [
            item for _index, item in ranked
            if relevance(f"{item[0]} {item[1]}", focus_tokens) > 0
        ]
        if matched:
            return matched[:DEFAULT_MAX_HANDOFF_SNIPPETS]
    return [item for _index, item in ranked[:DEFAULT_MAX_HANDOFF_SNIPPETS]]


def file_hints(path: Path, focus_tokens: set[str]) -> list[tuple[str, list[str]]]:
    payload = read_yaml(path)
    hints: list[tuple[int, str, list[str]]] = []

    for item in payload.get("common_tasks") or []:
        if not isinstance(item, dict):
            continue
        label = clean(item.get("task"))
        paths = [clean(value) for value in item.get("look_in") or []]
        paths = [value for value in paths if value]
        if label and paths:
            hints.append((relevance(f"{label} {' '.join(paths)}", focus_tokens), label, paths))

    areas = payload.get("areas") or {}
    if isinstance(areas, dict):
        for area_name, item in areas.items():
            if not isinstance(item, dict):
                continue
            label = clean(area_name)
            paths: list[str] = []
            for key in ("guidance", "source_roots"):
                values = item.get(key) or []
                if isinstance(values, list):
                    paths.extend(clean(value) for value in values)
            paths = [value for value in paths if value]
            notes = clean(item.get("notes"))
            searchable = f"{label} {notes} {' '.join(paths)}"
            if label and (paths or notes):
                hints.append((relevance(searchable, focus_tokens), label, paths))

    hints.sort(key=lambda item: (item[0], item[1]), reverse=True)
    if focus_tokens and any(score > 0 for score, _label, _paths in hints):
        hints = [item for item in hints if item[0] > 0]
    return [(label, paths[:6]) for _score, label, paths in hints[:3]]


def validation_commands(path: Path) -> list[tuple[str, str]]:
    payload = read_yaml(path)
    commands = payload.get("commands") or {}
    records: list[tuple[str, str]] = []
    if isinstance(commands, dict):
        for command_id, item in commands.items():
            if isinstance(item, dict):
                command = clean(item.get("command"))
            else:
                command = clean(item)
            if command:
                records.append((clean(command_id) or "validation", command))
    elif isinstance(commands, list):
        for item in commands:
            if not isinstance(item, dict):
                continue
            command = clean(item.get("command"))
            if command:
                records.append((clean(item.get("id")) or "validation", command))
    return records[:DEFAULT_MAX_ITEMS]


def project_identity(path: Path) -> tuple[str, str]:
    payload = read_yaml(path)
    identity = payload.get("identity") or {}
    name = clean(identity.get("name")) or "Character Forge"
    phase = clean(identity.get("current_phase")) or "See current handoff"
    return name, phase


def build_packet(
    root: Path,
    *,
    focus: str = "",
    issue: int | None = None,
    base_ref: str | None = None,
) -> str:
    refs = root / "refs"
    git = collect_git_context(root, base_ref=base_ref)
    focus_tokens = tokens(focus)
    name, phase = project_identity(refs / "project.yaml")
    handoff = handoff_snippets(refs / "handoffs/currentHandoff.md", focus_tokens)
    roadmap = active_roadmap(refs / "planning/roadmap.yaml", focus_tokens)
    hints = file_hints(refs / "implementation/fileMap.yaml", focus_tokens)
    validation = validation_commands(refs / "testing/validationCommands.yaml")

    lines = [
        f"# {name} - Generated Agent Re-entry Context",
        "",
        "> Derived orientation only. Authoritative refs and source remain the source of truth.",
        "",
        "## Session",
        f"- Branch: `{git['branch']}`",
        f"- HEAD: `{git['head']}`",
        f"- Base ref: `{git['base_ref']}`",
        f"- Current phase: {phase}",
    ]
    if issue is not None:
        lines.append(f"- Issue: #{issue}")
    if focus.strip():
        lines.append(f"- Focus: {focus.strip()}")

    changed = list(dict.fromkeys([*git["changed_paths"], *git["dirty_paths"]]))
    if changed:
        lines.extend(["", "## Changed paths"])
        for value in changed[:DEFAULT_MAX_CHANGED_PATHS]:
            lines.append(f"- `{value}`")
        if len(changed) > DEFAULT_MAX_CHANGED_PATHS:
            lines.append(f"- ... {len(changed) - DEFAULT_MAX_CHANGED_PATHS} more")

    if handoff:
        lines.extend(["", "## Current handoff highlights"])
        for section, text in handoff:
            lines.append(f"- **{section}:** {truncate(text)}")

    if roadmap:
        lines.extend(["", "## Relevant active roadmap"])
        for identifier, detail in roadmap:
            lines.append(f"- **{identifier}:** {truncate(detail)}")

    if hints:
        lines.extend(["", "## File-map hints"])
        for label, paths in hints:
            if paths:
                lines.append(f"- **{label}:** " + ", ".join(f"`{value}`" for value in paths))
            else:
                lines.append(f"- **{label}**")

    if validation:
        lines.extend(["", "## Validation commands"])
        for command_id, command in validation:
            lines.append(f"- `{command_id}` - `{command}`")

    lines.extend([
        "",
        "## Context discipline",
        "- Start here, then load deeper architecture, source material, history, or broad planning only when the task requires it.",
        "- Continue diff-first from the accepted checkpoint; do not reconstruct unchanged repository history after a context reset.",
        "- Prefer the file map, targeted searches/ranges, deterministic diagnostics, and tests over broad repository reads.",
        "- Treat accepted decisions and do-not-reopen constraints as inputs unless new runtime, test, source, or user evidence contradicts them.",
        "- If substantially the same diagnostic, search, comparison, or transformation is performed twice, make it reusable before doing it a third time.",
    ])
    return "\n".join(lines).rstrip() + "\n"


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("--focus", default="", help="Short task phrase used to select relevant context.")
    result.add_argument("--issue", type=int, help="Optional issue number to display.")
    result.add_argument("--base-ref", help="Optional git ref used for changed-path context.")
    result.add_argument("--output", type=Path, help="Optional local scratch file; stdout is the default.")
    result.add_argument("--max-chars", type=int, default=DEFAULT_MAX_CHARS)
    result.add_argument(
        "--check",
        action="store_true",
        help="Validate deterministic packet generation within the bounded context budget.",
    )
    return result


def main() -> int:
    args = parser().parse_args()
    if args.max_chars < 2_000:
        raise SystemExit("--max-chars must be at least 2000")
    root = repo_root()
    packet = build_packet(
        root,
        focus=args.focus,
        issue=args.issue,
        base_ref=args.base_ref,
    )
    if len(packet) > args.max_chars:
        raise SystemExit(
            f"Generated packet is {len(packet)} characters; budget is {args.max_chars}. "
            "Tighten handoffs, file-map selectors, or source structure instead of increasing routine reset context."
        )
    if "TEMPLATE_TODO" in packet:
        raise SystemExit("Generated packet leaked template placeholders.")
    if args.check:
        second = build_packet(root, focus=args.focus, issue=args.issue, base_ref=args.base_ref)
        if second != packet:
            raise SystemExit("Generated agent context is not deterministic.")
        print(f"agent context check ok: {len(packet)} characters")
        return 0
    if args.output is not None:
        output = args.output if args.output.is_absolute() else root / args.output
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(packet, encoding="utf-8")
        print(f"Wrote generated agent context: {output}")
        return 0
    print(packet, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
