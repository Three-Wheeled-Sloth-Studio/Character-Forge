# D&D 5E 2024 SRD 5.2.1 Source Boundary

Status: Active source contract for the first D&D vertical slice.

## Source

- Work: System Reference Document 5.2.1 (SRD 5.2.1)
- Creator: Wizards of the Coast LLC
- Published: 2025-05-01
- Canonical source page: https://www.dndbeyond.com/srd
- License: Creative Commons Attribution 4.0 International (CC-BY-4.0)
- License URL: https://creativecommons.org/licenses/by/4.0/
- Character Forge rules-source ID: `wotc-srd-5.2.1`

The upstream SRD contains the controlling legal information and attribution instructions. Character Forge records creator, work title, source URL, version, and license in machine-readable adapter metadata. Do not add non-SRD rulebook content merely because it is compatible with the adapter.

## First-slice evidence used

The first fixture and generation methods intentionally use only a small subset of SRD mechanics:

- Character creation sequence and Level 1 XP/proficiency rules.
- Standard Array ability generation using 15, 14, 13, 12, 10, and 8 assigned once each.
- Point Cost ability generation using a 27-point budget, scores 8 through 15, and costs 0/1/2/3/4/5/7/9 for scores 8 through 15 respectively.
- Random ability generation using four d6, retaining the highest three dice for a score, repeating that procedure six times, then assigning the six generated scores to abilities.
- 2024 background ability increases.
- Human species.
- Soldier background.
- Fighter Level 1, including Fighting Style, Second Wind, and Weapon Mastery.
- Alert and Savage Attacker origin feats plus Defense fighting style.
- Fighter starting equipment and basic armor values needed for the fixture.

Manual Ability Entry is a Character Forge input path rather than a separate SRD score-generation rule; its D&D legality is checked against the same native ability-state and first-slice validation boundary.

The system-neutral dice engine represents the SRD random procedure as `4d6kh3`, but that notation and reusable execution mechanism are Character Forge implementation details. The D&D system package remains responsible for selecting that dice expression, repeating it six times, and requiring later assignment of all six generated roll slots.

Relevant SRD sections are Character Creation, Fighter, Character Origins, Feats, and Equipment. The implementation stores identifiers and mechanical state rather than copying descriptive rules prose.

## Public-repository rule

Before adding a broader extracted SRD dataset, review the attribution surface and confirm that every included field is actually present in the SRD version named by its rules-source metadata. Keep source/version provenance attached to generated native state so later translations can be tested against the exact originating rules corpus.
