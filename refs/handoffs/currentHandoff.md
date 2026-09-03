---
type: "Handoff Record"
title: "Current Handoff"
tags:
- character-forge
- handoffs
---
# Current Handoff

Date: 2026-08-28
Branch: `dev`
Phase: D&D 5E 2024 PI 1, guided breadth expansion; first class-owned spellcasting plus runtime-build identity automated-green

## Accepted cross-repo baseline

The embedded Quick Generate plus durable Parchment save/reload/reopen seam is owner-accepted and promoted. Do not reopen it without new evidence.

Accepted Character Forge checkpoint on `qa` and `main`:

- `8041edb4009abce8a836faafce9a167883e92bda`

Parchment remains system-agnostic. Character Forge owns D&D-native interpretation, generation, validation, and provenance.

Background non-blockers:

- #2 historical effective-runtime name-derived ID path, only if new evidence makes it relevant;
- #3 compact Copy JSON / Download JSON controls.

## Current automated-green development checkpoint

The current `dev` checkpoint includes the first full class-owned spellcasting consumer, Cleric Level 1, plus explicit runtime build identity for QA:

- current Character Forge `dev`: `b9c70a99ff30d423ea02cf094939f8da23fd3e37`
- GitHub Actions run: `33183512628`
- job: `98890465975`
- full `npm run verify` green
- refs validation green
- strict TypeScript green
- 18 Vitest files / 79 tests / 0 failures
- web TypeScript build green
- build stamping confirmed in CI as `Character Forge build 0.0.1 b9c70a99`

The underlying Cleric code checkpoint remains:

- `80769e8854f4b9ee80e6fffa9e497115df5fda58`
- Actions `33128723547`
- job `98712957299`

Guided native schema remains `dnd5e-character/0.3`; D&D adapter version is `0.10.0`. Legacy `0.1` and `0.2` validation remain isolated and preserve their historical supported surfaces.

Nothing in the accumulated generation stack has been promoted beyond `dev`. Owner runtime acceptance is still required before exact-SHA promotion.

## Current guided support surface

All 12 SRD classes, 4 backgrounds, and 9 species remain cataloged.

### Classes: 5 / 12

- Barbarian
- Cleric
- Fighter
- Monk
- Rogue

### Backgrounds: 4 / 4

- Acolyte
- Criminal
- Sage
- Soldier

### Species: 6 / 9

- Dragonborn
- Dwarf
- Goliath
- Halfling
- Human
- Orc

Still blocked:

- classes: Bard, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard;
- species: Elf, Gnome, Tiefling.

Do not enable an option until its real Level 1 nested decisions and native mechanics are represented and independently validated.

## Cleric Level 1 slice

Cleric is the first genuinely magical class exposed in the browser class picker.

Explicit Level 1 state includes:

- d8 Hit Die;
- Wisdom primary ability and Wisdom/Charisma saves;
- two legal class-skill choices;
- descriptive package-vs-110-GP starting equipment choice;
- Divine Order: Protector or Thaumaturge;
- Wisdom class spellcasting;
- 3 Cleric cantrips for Protector or 4 for Thaumaturge;
- 4 prepared Level 1 Cleric spells;
- two Level 1 spell slots, current/maximum, Long Rest recharge;
- Holy Symbol spellcasting focus;
- Protector Martial-weapon proficiency and Heavy Armor training;
- Thaumaturge knowledge bonus derived from Wisdom modifier, minimum +1.

The browser uses the existing sticky acceptable-pool/direct/random pattern for Divine Order, cantrips, and prepared spells. The right-side character details display Divine Order, class spellcasting, prepared spells, spell slots, and order-related training/bonus state.

Tests cover Protector, Thaumaturge, class spell-state tampering, and the supported 5-class x 6-species matrix.

## Spell architecture now proven at two distinct layers

### Independent spell grants

`spells.grants[]` remains for feat/species-style grants. Current consumers:

- Acolyte -> Magic Initiate (Cleric)
- Sage -> Magic Initiate (Wizard)

Each grant retains source/list/casting ability/cantrips/always-prepared Level 1 spell/free cast/Long Rest recharge.

### Class-owned spellcasting

`spells.classCasting[]` now retains class capability separately:

- source class / feature / spell-list identity;
- fixed class casting ability;
- class cantrips;
- prepared spells;
- slot pools with current/maximum/recharge;
- preparation cadence;
- spellcasting focus capability.

A Cleric with Acolyte correctly retains both a Cleric `classCasting` entry and a separate Magic Initiate (Cleric) `grant`. Neither source is reconstructed from the other or from generation provenance.

Independent adapter validation rejects illegal cantrip/prepared counts, wrong-list state, wrong Cleric casting ability, tampered slot pools, and Divine Order state mismatches.

## Legacy compatibility

The retained `dnd5e-character/0.2` validator is explicitly isolated from the expanding current class union. It still recognizes only its original four guided classes, two backgrounds, and historical species boundary. Adding Cleric to current guided creation does not retroactively change what an old document means.

## Runtime freshness / QA build identity

Owner QA on 2026-08-28 showed only Barbarian/Fighter/Monk/Rogue after Cleric had already landed on `dev`. The screenshot proved a real integration defect rather than a Cleric picker defect.

Root cause:

- `npm run dev:web` compiles Character Forge once and then starts the lightweight static `tools/web-server.mjs` server;
- the server is intentionally not a watcher/HMR process;
- Parchment's local launcher previously treated a healthy `localhost:5174` process as sufficient and reused it without rebuilding;
- therefore a Character Forge process that survived a later `git pull` could serve an obsolete `dist` indefinitely.

Character Forge now stamps every `build:web` output with:

- package/app version;
- exact checked-out Character Forge source commit;
- build timestamp;
- local dirty-working-tree flag where applicable.

Generated files in `dist`:

- `build-info.json`
- `build-info.js`

The Character Forge header always shows a compact QA badge such as:

- `v0.0.1 · b9c70a99`
- local modified builds append `+dirty`.

Hover/title exposes the full source SHA and build timestamp. `/__health` also exposes the current build metadata.

Parchment Worlds `dev` now contains the companion launcher fix at:

- `b6095560cfbc2284623466911c8b054e0c05ec43`
- Parchment Actions run `33183438679` green.

When Parchment encounters an already-live local Character Forge server, it now awaits `npm run build:web` in the local Character Forge checkout before returning the embed URL. The existing static server immediately serves the refreshed `dist`, so QA does not need to kill/rebind port 5174 after every pull.

Important local-development fact: Parchment Worlds and Character Forge remain separate Git checkouts. Parchment can rebuild the Character Forge checkout it finds, but it does not silently `git pull` that repository. The visible source SHA makes an outdated adjacent checkout immediately diagnosable.

## Existing creator/product standards

Preserve:

- controls left / character review right;
- independent desktop scrolling;
- one-column narrow fallback;
- universal controls before method-specific controls;
- one ability-generation dropdown with dynamic controls;
- compact/collapsible acceptable pools;
- icon-first randomization including Character Name;
- descriptive equipment labels while retaining canonical IDs underneath;
- compact contextual help;
- sticky acceptable pools as preference state, not authoritative character state;
- per-character pool/result/mode provenance;
- always-visible runtime build/version identity for QA.

Current name generation remains a temporary six-name catalog. Do not grow it into a giant flat list; future naming should be culture/species/language aware and interoperable with Worldbuilding language/culture systems.

## Ability methods

All continue through the same guided native builder:

- Standard Array
- Point Cost
- Random Generation (4d6 keep highest 3)
- Manual Entry

## Owner runtime QA still required

The next useful owner pass can now exercise magical-class behavior and confirm the runtime is current. Include:

1. confirm the header build badge is present and records the Character Forge source SHA being tested;
2. confirm Cleric appears in the Class picker alongside Barbarian/Fighter/Monk/Rogue;
3. build Protector and Thaumaturge variants and confirm `Native state valid`;
4. change/randomize Cleric cantrips and prepared Level 1 spells;
5. verify Thaumaturge exposes four cantrips and Protector three;
6. build Cleric + Acolyte and confirm class spells and Magic Initiate both appear as separate sources in the right details/native document;
7. exercise a different ability-generation method with Cleric;
8. save/reload/reopen a representative Cleric through Parchment and confirm native spell state is unchanged;
9. retain prior checks for sticky pools, name randomization, independent scrolling, and descriptive equipment.

Do not promote until explicit owner acceptance.

## Deployment integration

Character Forge is now part of the local PW checkout, verify/build, deploy, and promotion chain. Private orchestration in Parchment Worlds checks out the matching Character Forge branch, requires a successful `verify.yml` run for the exact source SHA, builds the web app, and publishes only `/apps/character-forge/`. The hosted deployment includes `source.json`; the Character Forge bundle itself also carries `dist/build-info.json` and the visible build badge.

This integration does not change the acceptance gate above: do not run the QA or production promotion helpers until the owner accepts the accumulated runtime pass.

## Immediate next direction

Continue issue #11 from the now-proven class-spellcasting primitive after the runtime QA checkpoint is confirmed.

Good next slices are:

1. reuse/refine standard class spellcasting with another class whose Level 1 semantics fit the proven slot/preparation primitives without hiding source-specific choices; or
2. take Elf/Gnome/Tiefling lineage spell grants, reusing `spells.grants[]` where mechanically accurate; or
3. add the Druid Magic Initiate list and then enable Human-selected Magic Initiate if that can be done without prematurely opening Druid class mechanics.

Do not force Wizard spellbook or Warlock Pact Magic into the Cleric structure. Common primitives are desirable; source-specific state remains explicit when mechanics genuinely differ.

## Random-tables companion watch point

Still defer implementation until concrete personality/flavor/table consumers are sufficient to define the generic producer contract. Likely first consumers remain traits, ideals, bonds, flaws, equipment/trinket suggestions, and later system-specific flavor tables.

A generic table engine returns structured, inspectable, provenance-bearing results. It does not mutate CharacterDocument/native state directly.

## Guardrails

- Work directly on `dev`; preserve exact-SHA `dev -> qa -> main` promotion.
- Native system state remains mandatory and lossless.
- Never reconstruct retained D&D state from semantic projection.
- Generation methods and choices converge on one native validation/persistence boundary.
- Spell grants and class spellcasting are distinct source concepts.
- Sticky preferences are separate from authoritative state and historical provenance.
- Do not silently default nested source-system decisions to improve support counts.
- Generator-core stays system-neutral; D&D rules/content stay in `system-dnd5e`.
- Character Forge owns RPG-native interpretation, validation, choices, and provenance.
- Parchment owns generic project membership, lifecycle, relationships, persistence, and future sync/share behavior.
- Local Parchment launcher may rebuild an adjacent Character Forge checkout but must not silently mutate its Git branch or pull source.
- Keep visible runtime source/version identity available in QA builds.
- Use only legally redistributable SRD 5.2.1 / CC-BY-4.0 material in the public repository.

## Agent Academy OKF compatibility

On 2026-09-03, Character Forge adopted the Agent Academy `agent-academy-okf-v1` compatibility profile pinned to OKF v0.2 and Agent Academy commit `16691651776151a7eb1f13d99a92658e0684e6`.

This is a project-memory interoperability increment. Native character state, system-adapter ownership, translation-loss rules, generation replayability, licensing boundaries, and exact-SHA promotion remain unchanged. Markdown refs are now OKF concepts and committed deterministic indexes expose the corpus to generic OKF consumers and the future studio catalog.
