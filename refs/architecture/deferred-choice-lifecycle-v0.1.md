---
type: "Architecture Contract"
title: "Deferred Choice and Advancement Lifecycle v0.1"
tags:
- character-forge
- architecture
- advancement
- deferred-choice
---
# Deferred Choice and Advancement Lifecycle v0.1

Date: 2026-11-21
Status: bounded headless contract implemented; no UI or automatic native rules effects

## Why a separate ledger

`CharacterDocument` and its source-owned native payload remain authoritative for
current game mechanics. The new `CharacterLifecycle` is a separately persisted,
versioned append-only record keyed by character ID. It does not become a second
canonical character representation, and it does not change document schema 0.1.

Events in `packages/character-model/src/characterLifecycle.ts`:

| Event | Purpose | Authority |
| --- | --- | --- |
| `experience-recorded` | Capture meaningful use, discovery, consequence or milestone | Campaign/GM or caller; descriptive, not automatic XP |
| `choice-opened` | Declare a choice with source-owned option identifiers and deferrability | System/campaign creator |
| `choice-assessed` | Snapshot currently eligible choices against a native-state ID and rules-source ID | System adapter |
| `choice-deferred` | Preserve player decision to wait | Player, if the choice allows it |
| `choice-selected` | Retain a selected eligible option and its exact assessment event | Player after system assessment |
| `native-revision-linked` | Link a resolved choice to a distinct resulting native-state ID | System adapter / persistence layer after native validation |

System-neutral sequencing enforces: unique event IDs, event-order timestamps,
single opening per choice, lawful deferral, legal subset eligibility, latest
assessment on selection, and exact assessment/source native-state linkage on
revision. The ledger does not evaluate prerequisites, grant benefits, compute
XP, set skill ranks, consume resources or mutate `CharacterDocument`.

**Important limitation:** `native-revision-linked` is a causal record, not proof
that a referenced native-state revision has been persisted. The host must verify
that the referenced state actually exists and was independently validated by
its system adapter before committing the event. Do not expose this helper as an
automatic advancement action without an atomic persistence boundary.

## Evidence and compatibility

- Fate Condensed: an initially unfilled Stunt slot and later narrative choice
  motivate the deferred-choice flow; actual stunt legality remains Fate-owned.
- BRP: use-driven skill development shows that observing experience and
  awarding a skill increment are separate operations.
- D&D: level/feature choices may be mandatory and should be non-deferrable
  when source rules require that.
- Original RPG: organic progression needs recorded events and deferred options,
  but should not count every trivial skill use or force a universal XP formula.

These are illustrative adapter inputs, **not implemented eligibility adapters**.

## Next vertical slice

1. Add one source-owned adapter assessment and persistence consumer (Fate's
   deferred Stunt is the smallest candidate) with a validated native revision.
2. Add a durable host transaction that saves the native revision and selection
   event together, or rolls both back.
3. Expose clear player choice and GM inspection controls without surfacing
   calculation details to players by default.
4. Add replay/serialization and re-open tests at the host persistence seam.
