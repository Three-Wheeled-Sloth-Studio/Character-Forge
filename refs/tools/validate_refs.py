from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]

REQUIRED_FILES = [
    "AGENTS.md",
    "refs/README.md",
    "refs/project.yaml",
    "refs/agents.yaml",
    "refs/planning/roadmap.yaml",
    "refs/architecture/character-architecture.md",
    "refs/architecture/translation-bridge-rpg-notes.md",
    "refs/product/generation-methods.md",
    "refs/handoffs/currentHandoff.md",
    "refs/testing/validationCommands.yaml",
]

REQUIRED_TEXT = {
    "AGENTS.md": [
        "dev -> qa -> main",
        "Native system state is mandatory",
        "translation-bridge-rpg-notes.md",
    ],
    "refs/project.yaml": [
        "native system state",
        "dnd5e",
        "call-of-cthulhu",
    ],
}


def main() -> int:
    failures: list[str] = []

    for relative_path in REQUIRED_FILES:
        path = ROOT / relative_path
        if not path.is_file():
            failures.append(f"Missing required file: {relative_path}")
        elif not path.read_text(encoding="utf-8").strip():
            failures.append(f"Required file is empty: {relative_path}")

    for relative_path, needles in REQUIRED_TEXT.items():
        path = ROOT / relative_path
        if not path.is_file():
            continue
        content = path.read_text(encoding="utf-8")
        for needle in needles:
            if needle not in content:
                failures.append(
                    f"{relative_path} must contain foundation guardrail: {needle}"
                )

    if failures:
        for failure in failures:
            print(f"ERROR: {failure}", file=sys.stderr)
        return 1

    print(f"Validated {len(REQUIRED_FILES)} required project-memory files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
