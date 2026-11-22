---
type: "Architecture Contract"
title: "BRP Skill Experience Advancement v0.1"
tags:
- character-forge
- brp
- advancement
- lifecycle
---
# BRP Skill Experience Advancement v0.1

Date: 2026-11-21
Status: bounded source-owned native-state transition; host persistence and player/GM controls not wired

## Source and version

Basic Roleplaying Universal Game Engine ORC Content Document, skill improvement
section, pages 137-138, with the existing 1.05 corrections boundary. Official
source: https://www.chaosium.com/content/orclicense/BasicRoleplaying-ORC-Content-Document.pdf .
Use of the ORC material remains subject to the existing rules-source notices.

The source describes GM-authorized significant skill use, one check per skill
per adventure, a percentile experience roll with ceil(INT/2) added, a rating
comparison, and a successful +1D6 improvement or preselected fixed +3. At
ratings of 100 or higher, an effective result of 100 or higher permits further
improvement. Normal/Heroic *creation caps* do not cap earned improvements.

## Implementation

- `BrpSkillState.experienceChecks?` is an optional post-creation layer. Existing
  serialized characters without it are still valid and retain their old totals.
- Each check keeps event/adventure ID, prior rating, percentile roll,
  improvement method and increment, including explicit zero-gain failures.
- The BRP adapter independently recomputes each check in order, checks
  per-skill adventure uniqueness and global event identity, and verifies
  `finalRating = baseChance + professional + personal + earned increases`.
- `applyBrpSkillExperience` requires a GM-approved meaningful-use description,
  explicit dice outcomes and a new native-state ID. It validates before and
  after and keeps the previous native state retained in CharacterDocument.
- Two lifecycle events record the experience and link it to the resulting
  native-state revision. They do not represent a player-selected class or
  purchased capability.

The implementation intentionally does not award experience automatically after
each action, calculate training/research gains, or assume all source skills and
powers support the same improvement method. This v0.1 consumer handles only
existing listed BRP ordinary skills on valid BRP-native characters.

## Architectural findings

Fate's deferred Stunt is a player choice that can change native state later.
BRP's experience check is an earned, GM-authorized attempt with a potentially
zero increase. The shared lifecycle needs both a `choice-selected` / native
revision path and an `experience-recorded` / native revision path. Neither
path is a universal advancement formula. An original classless RPG can retain
these distinctions without copying BRP's roll mechanics.

## Outstanding integration

An initial `advanceBrpHostedSkill` service now consumes the shared
`CharacterLifecycleStore` interface (extracted from the Fate-specific
transaction signature). It requires an asynchronous trusted GM authorization
callback, loads the current paired snapshot, calculates the BRP-native candidate
and saves both records through the host's revision-checked compare-and-swap.
Tests cover unauthorized rejection, durable in-memory save, JSON round trip,
and concurrent stale-save conflict. The existing Character Forge hosted
message cache/parser now accepts `experience-revision-linked` history entries.

This is still a **host contract and test consumer**, not a wired Parchment
authorization implementation. Real Parchment project-role enforcement,
embedded GM controls, and full browser QA are pending. The player/GM interface
direction is recorded in `refs/product/player-gm-surface-boundary.md`.

The transition is headless and returns a candidate new CharacterDocument and
CharacterLifecycle. It does **not** independently persist either record. The
host must reuse the version-checked, atomic paired-save boundary already proven
for Fate in Parchment Worlds. Do not expose the action until the caller checks
active project/asset identity, source state freshness, archival/sync conflict
guards and durable response confirmation. Browser QA is not complete for BRP
advancement. Fate owner/manual acceptance remains separately pending.

Next: adapt this source-owned transition to the hosted atomic store, add a
compact GM-approved experience-check UI, and exercise save/reopen plus conflict
regressions. Avoid new universal mechanics until a third contrasting consumer
requires them.
