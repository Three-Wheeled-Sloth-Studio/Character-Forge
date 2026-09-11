---
type: "Planning Backlog"
title: "Unprioritized Product TODOs - 2026-09-11"
tags:
- character-forge
- productization
- ux
- character-sheet
- vtt
- foundry
- naming
- universal-grammar
- roadmap
---
# Unprioritized Product TODOs - 2026-09-11

Status: **captured, not prioritized**

This document records owner QA findings and product-direction TODOs that must be prioritized against the existing Character Forge roadmap before implementation begins. It is deliberately not an execution sequence.

Do not treat ordering in this file as priority.

## Immediate QA Finding Still Open

### D&D adaptive pagination still over-paginates

Owner browser QA after the adaptive-pagination implementation still shows unnecessary pagination. The representative D&D character visually contains roughly one page of material, but the generated/printed sheet still splits content when it should fit comfortably on one page.

TODO:

- Reproduce the real browser/print result before changing thresholds again.
- Distinguish logical descriptor pagination from physical browser pagination.
- Prefer one dense, readable page when the actual character load fits.
- Add a second page only when content volume genuinely requires it.
- Do not solve this by shrinking typography or spacing below useful play/readability levels.

This remains an acceptance defect, not a request to force every D&D character onto one page.

## Branding And Product Readiness

The shared studio branding source now includes logo assets under:

`Three-Wheeled-Sloth-Studio/TWS-Design-Principles/Branding/`

TODO:

- Work appropriate studio/product branding into Character Forge before broader external shopping/demo activity.
- Preserve campaign/project-owned badging space on character sheets. Product branding should not displace user campaign identity on the play artifact.
- Determine which branding belongs in the application shell, loading/launch surfaces, export metadata, and other non-campaign sheet areas.
- Apply the same branding strategy consistently through Parchment Worlds where Character Forge is hosted.

## Portrait And Character Media UX

Current portrait/token attachment is only a first proof and is too detached from the artifact being edited.

TODO:

- Make the empty portrait region itself clickable to add a portrait.
- Once populated, clicking the portrait should provide a natural update/edit path.
- Evaluate a right-click context menu for Add / Replace / Remove when the platform allows it without harming discoverability or accessibility.
- Keep empty media space visually quiet. Do not add placeholder prose simply to explain the slot.
- Move durable portrait/token ownership to the Parchment Worlds character-asset relationship rather than RPG native rules state.

## VTT Token Workflow And Interoperability

Token handling should become a first-class character-media workflow rather than a static upload slot.

Product goal:

- Mimic useful VTT token functionality while reducing the friction players encounter in current VTT workflows, especially Foundry.
- Make it easy to pull in the current VTT token, update or regenerate it, and push/export the result back.

TODO / discovery questions:

- Define whether the default workflow is:
  - attach/edit first with Generate as an option; or
  - generate by default with explicit manual override/edit.
- Support manual token override regardless of generation default.
- Plan dynamic token generation from portrait/campaign/system context where useful.
- Preserve player control over crop, framing, border/mask, transparency, and final override.
- Define import/update/export semantics for Foundry and later VTT adapters.
- Keep VTT-specific IDs/paths out of canonical native RPG state.
- Treat token friction as a product opportunity, not just an export field.

## Foundry Integration Readiness And License Trigger

A Foundry export adapter remains near-term feasible, while direct push/sync is a later integration layer.

TODO:

- Add a roadmap tracker explicitly identifying **when to purchase a Foundry license for development/integration testing**.
- Do not purchase solely because Foundry is on the roadmap; tie the trigger to a concrete integration slice that requires a real instance.
- Candidate trigger: when the download/import adapter is stable enough that real Foundry Actor/Item import validation becomes the next blocker, or earlier if API/schema discovery requires the licensed runtime.
- Track supported Foundry version and supported D&D system version once integration begins.
- Preserve the staged path:
  1. export/import artifact;
  2. one-click push/update;
  3. later round-trip synchronization with explicit ownership/conflict rules.

## Name Generator

The current D&D six-name placeholder corpus is not a real naming system.

TODO:

- Begin the full name-generator module.
- Support a very broad generation space rather than a tiny lookup list.
- Naming should be context-aware where evidence supports it, including:
  - genre;
  - campaign/setting;
  - culture/region when available;
  - species/race/ancestry;
  - profession/class/archetype where appropriate;
  - other player/character characteristics that materially affect naming conventions.
- Preserve the existing architecture principle that naming mechanism, naming context, and naming datasets are separate concerns.
- Do not equate species with culture or naming language.
- Preserve deterministic seed/provenance support for replayable generation.

## Universal Grammar

TODO:

- Begin building the Universal Grammar / semantic translation layer.
- Continue deriving concepts from concrete D&D + BRP evidence instead of inventing a universal ontology up front.
- Native system state remains mandatory, canonical, and lossless.
- Universal Grammar remains a derived semantic/translation layer with explicit translation loss.
- Use future third-system evidence to challenge D&D/BRP-shaped assumptions rather than prematurely freezing the model.

## Proprietary RPG System

TODO:

- Begin planning and implementation of the proprietary Parchment Worlds / studio RPG system.
- Use it as both a real playable system and an architectural stress test for Character Forge / Universal Grammar.
- Preserve previously established direction: 2d10/2d12 normal resolution space, wounds rather than generic HP, psychic/techno-magic/dark-horror/cyber-steam-punk support, and system design that is not merely a reskinned D&D/BRP hybrid.
- Define when this enters implementation relative to Universal Grammar, additional external-system stress tests, and current player-usability closeout work.

## Random Tables And BRP Flavor Generation

BRP free-text flavor fields are a good first proving ground for optional random-table assistance.

TODO:

- Add initial random-table offerings for fields such as:
  - Size / build;
  - Appearance;
  - Mannerisms;
  - Reputation;
  - Background;
  - Distinctive features where applicable;
  - other flavor fields that benefit from inspiration without becoming mandatory mechanics.
- Generated suggestions must remain editable and overridable.
- Random tables should feed normal generation decisions/suggestions rather than directly mutating native state through a special bypass.
- Avoid turning optional inspiration into noisy primary UI.

## System Switching Semantics

Current defect: changing the selected RPG system does not clear or translate an already generated character.

TODO:

- Define explicit behavior when the user changes systems after a character has been generated.
- At minimum, never leave a character from System A presented as if it belongs to System B.
- Decide when to:
  - clear the generated character;
  - offer translation when an appropriate translation path exists;
  - preserve the original character while opening a translated/new derivative;
  - warn about translation loss.
- Do not fake translation before Universal Grammar / adapter support exists.

## Primary UI Minimalism Sweep

Product rule to reinforce across BRP and D&D:

> Nothing belongs in the primary creator UI unless it provides immediate player or GM value for the current task.

Explanatory or educational text that is useful only the first few times should normally move behind an info/help affordance rather than remaining permanently in the workflow.

Do not call out features that are not present. Do not explain internal architecture in player-facing UI. Do not repeat source/rules prose where the current selection/validation state already communicates the answer.

### Shared UI TODOs

- Offset the dice in the Randomize All icon so the two-dice glyph reads cleanly.
- Remove unnecessary text under the Rules system selector.
- Remove the application tagline `Create a system-native character first. Translation magic comes later.` A future translation capability should use an icon/action when it actually exists.
- Normalize explanatory-copy treatment using a compact blue info `i` or `?` affordance where explanation is useful but not continuously valuable.
- Apply this minimalism review to both BRP and D&D, even where the exact owner callout below came from BRP.

### BRP creator TODOs

- Remove `BRP UGE creator` from the primary UI.
- Keep `2023 ORC rules` only if needed as compact source/rules identity; remove the explanatory prose following it.
- Remove `Source-neutral BRP UGE...` explanatory copy from the primary UI.
- Rename `Skill allocation` to `Allocation`.
- Move Allocation explanation behind an info/help affordance.
- Replace the large `Allocation ready` block with a simple red/green status icon; clicking it may expose relevant rules/details.
- Remove explanatory text under `Important equipment` from primary UI.
- Normalize equipment checkbox sizing.
- Remove explanatory text beside equipment names from primary UI unless the information is immediately necessary for the choice itself.
- Remove explanatory prose under Identity and Background from primary UI.
- Remove the text `The optional CHA-driven Distinctive Features rules are not enabled in this creator slice; appearance remains freeform and cosmetic.` from primary UI. Do not advertise absent functionality.
- Rules Check should present a simple green/red state. When green, no additional success prose is needed. When red, show the actual failure/reason.

### D&D parity TODO

Perform the same sweep on D&D rather than waiting for every redundant string to be called out individually:

- no fluffy explanatory copy in the primary workflow;
- no callouts to unavailable/future features;
- no over-explaining rules or generator internals;
- no permanent prose where a status/icon/info affordance carries the same value;
- retain only information that helps the player or GM make the current decision.

## Version / Build Identity

### Character Forge

TODO:

- Change the Character Forge version pill to the same conceptual format used by World Forge: `version:build:revision`.
- Do not use a raw Git hash as the user-facing version stamp.
- Preserve exact commit/SHA provenance internally and in diagnostics/CI even when the user-facing pill is friendlier.

### Parchment Worlds

TODO:

- Add a corresponding version/build/revision pill at the parent Parchment Worlds level.
- Keep module/app build identity distinguishable from the parent shell identity.
- Make support/QA provenance easy to report without forcing users to interpret Git hashes.

## Project / Campaign Context Follow-Through

Character Forge now receives basic project context from Parchment Worlds. Continue reducing redundant character-creation choices as project/campaign authority expands.

TODO:

- Audit which current character-creation choices are actually project/campaign-level decisions.
- Inherit setting, rules-system, campaign-profile/house-rule, genre, and related context when authoritative upstream values exist.
- Ask at character level only when the project permits variation or the answer is genuinely character-specific.
- Never copy presentation/workflow context into native RPG state merely because it is available upstream.

## Prioritization Step For Next Thread

Before implementing any item in this backlog:

1. Read `refs/planning/roadmap.yaml`.
2. Read this document.
3. Read the current Issue #14 acceptance state.
4. Group items into:
   - current acceptance blockers;
   - productization / external-demo readiness;
   - near-term companion capabilities;
   - architecture/platform investments;
   - later integrations.
5. Propose an execution order with dependencies and rationale.
6. Get owner agreement on ordering before starting the newly captured work.

Existing roadmap commitments are not automatically displaced by this capture. The purpose of this document is to make the tradeoff explicit.