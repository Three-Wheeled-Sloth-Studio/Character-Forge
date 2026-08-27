# Current Handoff

Date: 2026-08-26
Branch: dev
Phase: D&D 5E 2024 PI 1, guided class/species choice pools implemented and automated-green; owner QA deferred

## Accepted baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted. Do not reopen it without new evidence.

Accepted Character Forge checkpoint on `qa` and `main`:

- `8041edb4009abce8a836faafce9a167883e92bda`

Parchment character persistence issue #24 is closed as completed.

Background non-blockers remain:

- Character Forge issue #2: trace the effective runtime path that still showed name-derived character/native-state IDs despite UUID helpers being present in current code.
- Character Forge issue #3: add compact icon-first Copy JSON / Download JSON controls to the CharacterDocument inspector.

## Current development checkpoint

Guided class/species generation plus the sticky acceptable-option pattern are implemented on `dev` at:

- code checkpoint `be4f6f116cdd3e238362cd8f29e93ad257ec7c1b`
- GitHub Actions run `33028213283`
- job `98374426066`
- full `npm run verify` green
- refs validation green
- strict TypeScript green
- 13 Vitest files / 54 tests / 0 failures
- web TypeScript build green

Tracking:

- issue #9 Guided D&D class/species choice pools with sticky random selection
- issues #5, #7, and #8 remain open for the deferred combined runtime acceptance of Manual / Point Cost / base ability methods

Nothing in the current generation stack has been promoted beyond `dev` since that owner QA remains deferred.

## Product direction established

The default guided D&D 2024 flow follows the official SRD sequence:

1. choose class;
2. determine origin;
3. determine ability scores.

Character Forge also now has a reusable menu-choice pattern inspired by the requested Nethack-style workflow:

- a player may choose one option directly;
- a player may mark every option they would be happy receiving and ask Character Forge to choose randomly from that checked pool;
- the acceptable pool is user-sticky across browser sessions;
- the sticky preference is not authoritative character state;
- the actual selected result, acceptable pool used for that character, and direct/random selection mode are retained in generation provenance.

This pattern should be reused for future backgrounds, skills, languages, feats, equipment packages, subclasses, spells, and similar single-choice menus when the source system permits it.

## SRD catalog boundary

`packages/system-dnd5e/src/srdCatalog.ts` now catalogs all SRD 5.2.1 classes and species available to this adapter.

All twelve SRD classes are represented in the catalog:

- Barbarian
- Bard
- Cleric
- Druid
- Fighter
- Monk
- Paladin
- Ranger
- Rogue
- Sorcerer
- Warlock
- Wizard

All nine SRD species are represented:

- Dragonborn
- Dwarf
- Elf
- Gnome
- Goliath
- Halfling
- Human
- Orc
- Tiefling

Catalog presence is intentionally separate from generation support. Options remain disabled when Character Forge cannot yet represent their required native decisions without invention.

### Initially guided-supported classes

- Barbarian
- Fighter
- Monk
- Rogue

Spellcasting classes remain cataloged but disabled until a real spell/native-state seam exists rather than generating incomplete class state.

### Initially guided-supported species

- Dwarf
- Halfling
- Human
- Orc

Dragonborn, Elf, Gnome, Goliath, and Tiefling remain cataloged but disabled because each requires a nested ancestry/lineage/legacy choice that should be modeled explicitly rather than silently defaulted.

## Guided native state

New guided characters use `dnd5e-character/0.2` while the adapter continues accepting the prior `dnd5e-character/0.1` Human Soldier Fighter documents.

The `0.2` shape generalizes only fields now justified by concrete SRD choices, including optional:

- class primary abilities;
- class expertise/tool/fighting-style state;
- species skill/origin-feat state;
- class/species resources such as Rage, Second Wind, Stonecunning, Adrenaline Rush, and Relentless Endurance.

The adapter is now `0.5.0` and independently validates both schema versions.

The first guided native builder supports all 16 combinations of the four enabled classes and four enabled species. Automated coverage builds and validates every combination.

Class-sensitive native state currently includes the Level 1 hit die, saving throws, fixed legal skill/tool defaults, starting equipment, Level 1 features/resources, weapon mastery where applicable, and derived AC/HP.

Species-sensitive state currently includes size/speed, core Level 1 species features/resources, Dwarf Toughness HP, Human fixed first-slice Skillful/Versatile choices, and Orc/Dwarf limited-use resources.

## Guided browser surface

A new guided creation panel appears before the older regression-generation forms.

Current guided order is:

1. character name;
2. acceptable class pool + direct choice or Random from checked;
3. Soldier background, still fixed for this slice;
4. acceptable species pool + direct choice or Random from checked;
5. Standard Array assignment;
6. Soldier ability increases;
7. build through the ordinary CharacterDocument/Parchment handoff.

The class/species acceptable pools are retained in localStorage under versioned keys. Unsupported SRD options remain visible as disabled `later` entries with a reason instead of disappearing from the catalog.

The existing Quick Generate, explicit Standard Array, Manual, Point Cost, and Random forms remain intact as regression surfaces.

## Provenance boundary

Guided generation records:

- `class.acceptable-pool`;
- selected class and whether it was direct or randomly chosen from the pool;
- fixed Soldier background;
- `species.acceptable-pool`;
- selected species and whether it was direct or randomly chosen;
- Standard Array assignment;
- background ability increases.

User-sticky preferences are deliberately separate from the generated character. A later preference change must not rewrite historical character provenance.

## Combined owner QA remains deferred

Do not treat the guided or accumulated ability-generation work as owner-accepted yet.

When the owner requests the next runtime pass, cover at least:

1. Quick Generate smoke.
2. Existing Standard Array / Manual / Point Cost / Random paths.
3. Guided class pool direct choice and random-from-checked behavior.
4. Reload the browser and confirm checked acceptable pools persist.
5. Guided species pool direct/random behavior.
6. Build representative combinations such as Dwarf Barbarian, Human Fighter, Halfling Rogue, and Orc Monk and confirm native validation is green.
7. Confirm disabled catalog options cannot be selected yet.
8. Save/reload/reopen at least one `dnd5e-character/0.2` guided character through Parchment and confirm native state and generation provenance survive unchanged.

Do not promote to `qa`/`main` until that accumulated owner pass is accepted.

## Next implementation slice

Open SRD backgrounds in the guided path.

The SRD 5.2.1 guided catalog should next support the four available backgrounds as real mechanical options rather than deepening the fixed Soldier assumption:

- Acolyte
- Criminal
- Sage
- Soldier

Use the same sticky acceptable-option pattern and retain direct/random selection provenance.

Background choice must own its real D&D consequences:

- its three eligible ability scores;
- the fixed Origin feat it grants;
- skill proficiencies;
- tool proficiency where applicable;
- starting-equipment choices / gold path.

Then make the guided ability-increase UI derive legal +2/+1 or +1/+1/+1 choices from the selected background rather than using Soldier-specific options.

After backgrounds, lift the existing ability-generation methods into the guided flow as interchangeable choices, then open the nested species decisions before enabling those five currently-disabled species. Spellcasting classes should wait until their native spell state can be represented faithfully.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state remains mandatory and lossless.
- Never reconstruct retained D&D state from semantic projection data.
- Generation methods and guided choices must converge on the same native validation and persistence boundary.
- Sticky preference state is not character state; historical per-character choice provenance is.
- Do not silently default nested source-system decisions merely to mark more catalog entries supported.
- Keep D&D and Foundry schemas out of shared Character Forge and Parchment contracts.
- Character Forge owns RPG-native interpretation, validation, generation choices, and provenance.
- Parchment owns project membership, generic asset lifecycle, relationships, persistence, and future sync/share behavior.
- Keep issues #2 and #3 backgrounded unless new evidence makes either blocking.
- Use only legally redistributable SRD 5.2.1 material in this public repository.
