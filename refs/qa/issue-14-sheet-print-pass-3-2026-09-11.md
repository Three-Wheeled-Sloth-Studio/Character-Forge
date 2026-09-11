# Issue #14 Browser QA Pass 3 - Sheet / Print Repair

Date: 2026-09-11

Owner browser QA found that the previous dedicated-sheet repair still did not match the actual user experience:

- D&D Guided Mechanical Starting equipment still rendered raw A/B/C labels;
- sheet document-action buttons rendered empty because the SVGs lacked visible stroke styling;
- Character Forge branding and rules/provenance text remained in player-facing sheet content; and
- browser print included the application shell and creator UI, producing many pages instead of the intended 1-2 page character sheet.

Implementation repair checkpoint:

- SHA: `ee63a0752e33e56aa94bce03e2ec69fa6099fc77`
- Actions: `34608731990`
- Job: `103293561221`
- `npm run verify`: green
- 57 test files / 276 tests / 0 failures
- 216 tracked paths
- build: `Character Forge build 0.0.1 ee63a075`

Repair summary:

- choice-pool reconciliation now compares both IDs and labels, so correct A/B/C values cannot hide regressed raw-code labels;
- toolbar SVGs have explicit visible stroke styling;
- Character Forge branding and large rules/provenance blocks are removed from BRP/D&D sheet bodies;
- rules identity is a tiny footer only;
- both systems still project exactly two logical sheet pages;
- main.ts maintains a dedicated `character-print-root` containing only rendered sheet HTML; and
- print CSS hides the entire interactive `.forge-shell` and exposes only the print root.

Structural tests now protect label reconciliation, character-only sheet content, visible icon styling, and print-root isolation.

Owner browser acceptance is still required. In particular, verify the actual browser Print / Save as PDF preview contains no application UI and remains 1-2 physical pages for representative characters. Do not close Issue #14 solely from automated structural coverage.
