---
type: "Product Design Contract"
title: "Player and GM Surface Boundary"
tags:
- character-forge
- player-experience
- gm-experience
- original-rpg
---
# Player and GM Surface Boundary

Date: 2026-11-22
Status: accepted product direction; separate interfaces are not an immediate prerequisite

## Decision

Character Forge and the future original RPG must evolve toward distinct player
and GM experiences, backed by the same authoritative native character state
and lifecycle. Do not build a second character model or require two separate
applications yet. Preserve a clear ownership boundary in each new feature.

| Player-first surface | GM-first surface |
| --- | --- |
| State fictional intent and desired outcome | Quickly identify applicable rules and circumstances |
| View capabilities, resources and consequences in plain language | Inspect eligibility, difficulty, exceptions and source citations |
| Make choices and request progression | Confirm meaningful experience, adjudicate and approve changes |
| See clear current character state and save results | Review provenance, revision history, disputed outcomes and overrides |
| Hide routine internal calculations | Progressive disclosure: quick answer, details, complete rules |

## Rules and trust boundary

- A hidden UI control is not authorization. Approval of GM-owned actions must
  be verified at the trusted persistence/service boundary using authenticated
  project/campaign authority when that role system exists.
- Character Forge system adapters own legal mechanics; Parchment owns identity,
  project rights, durability, archive/sync conflicts and atomic paired saves.
- Read-only GM inspection can be offered before role-based access control, but
  label it as inspection, not secure GM-only information.
- A player should not need to know the experience-roll formula to understand
  that a skill improved; the GM must be able to inspect why it improved.
- Do not mix player and GM controls in one undifferentiated panel or require
  players to navigate rules administration to act.

## Near-term application

For BRP skill advancement, let the GM initiate and authorize the experience
check, while the player sees a concise improvement result on the character
sheet. Do not ship a client-supplied `gmApproved: true` as proof of GM rights.
The current service takes an explicit host-verified authorization callback;
the Parchment session-to-campaign role policy remains a future integration.

For our original classless RPG, preserve intent-first player interaction and
fast, progressively disclosed GM resolution. A dedicated GM workbench is a
future product slice, not a prerequisite for native-state or lifecycle work.

## Read-model proof (2026-11-22)

`packages/character-model/src/lifecyclePresentation.ts` provides separate,
read-only `projectPlayerLifecycle` and `projectGmLifecycle` projections from
one shared ledger. The player projection carries prompts, current choice
status, eligible identifiers and whether an advancement revision is linked;
the GM projection carries assessment reasons, rules sources and native revision
provenance. A selected choice without a linked revision is not yet presented
as applied. Recorded experience without a linked revision is not presented as
earned advancement. These are headless display contracts, **not role-filtered
API responses or security controls**. A host must enforce permissions before
serving GM detail and before accepting GM-owned mutations.

`packages/character-model/src/authorizedLifecycleView.ts` adds a host-facing
read boundary with separate asynchronous player and GM authorization callbacks.
Authorization runs before loading history; an unauthorized GM caller receives
neither the GM projection nor the raw ledger. Identity is checked after loading.
This is a composable contract, not an authentication or campaign-role policy:
Parchment must supply the callbacks from trusted session/project access, never
from a client-provided role flag. The existing Fate iframe GM inspector remains
unrestricted and must not be described as securely GM-only until host wiring.

## Future acceptance criteria

1. Independent player and GM entry points or contextual surfaces can share a
   saved character without duplicating canonical state.
2. GM-authorized mutations cannot be triggered by changing a browser flag.
3. Player gameplay and advancement UX remains low-friction and readable.
4. GM decision rationale and source citations are available on demand.
5. Role, visibility and permission rules are campaign-owned rather than
   inferred from character class, profession or system.
