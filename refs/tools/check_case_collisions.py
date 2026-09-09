#!/usr/bin/env python3
"""Fail when distinct tracked repository paths collide after case folding."""

from __future__ import annotations

import subprocess
import sys
from collections import defaultdict
from pathlib import PurePosixPath


def normalize_path(value: str) -> str:
    return PurePosixPath(value.replace("\\", "/")).as_posix()


def find_case_collisions(paths: list[str]) -> dict[str, list[str]]:
    by_folded: dict[str, set[str]] = defaultdict(set)
    for raw in paths:
        normalized = normalize_path(raw)
        if normalized:
            by_folded[normalized.casefold()].add(normalized)
    return {
        folded: sorted(values)
        for folded, values in by_folded.items()
        if len(values) > 1
    }


def self_test() -> None:
    collision = find_case_collisions(["src/Foo.ts", "src/foo.ts"])
    if not collision:
        raise RuntimeError("case-collision guard self-test failed to detect a collision")
    valid = find_case_collisions(["src/Foo.ts", "src/foo.test.ts"])
    if valid:
        raise RuntimeError("case-collision guard self-test reported a false positive")


def tracked_paths() -> list[str]:
    try:
        result = subprocess.run(
            ["git", "ls-files", "-z"],
            check=False,
            capture_output=True,
            timeout=10,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise SystemExit(f"Unable to inspect tracked paths with git ls-files: {exc}") from exc
    if result.returncode != 0:
        stderr = result.stderr.decode("utf-8", errors="replace").strip()
        raise SystemExit(f"git ls-files failed: {stderr or result.returncode}")
    return [
        value.decode("utf-8", errors="strict")
        for value in result.stdout.split(b"\0")
        if value
    ]


def main() -> int:
    self_test()
    paths = tracked_paths()
    collisions = find_case_collisions(paths)
    if collisions:
        print("Tracked-path case collision check failed:", file=sys.stderr)
        for values in collisions.values():
            print("  collision:", file=sys.stderr)
            for value in values:
                print(f"    - {value}", file=sys.stderr)
        return 1
    print(f"Tracked-path case collision check passed ({len(paths)} tracked paths).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
