---
type: "Product Reference"
title: "Structured Naming"
tags:
- character-forge
- product
- naming
---
# Structured Naming

Status: The first system-neutral name-suggestion contract and one D&D adapter proof are implemented on `dev`. This is a deliberately small boundary, not a universal identity or culture model.

## Why this exists

Character Forge now has two concrete naming needs:

- D&D already exposes a generated-name button, but its current six-name list is placeholder content and should not be scaled into a giant flat catalog.
- BRP currently has no generated-name provider, and adding one safely requires separating the reusable random/provenance mechanism from whatever culture, language, setting, or source data eventually supplies names.

Future Parchment/World consumers make the same separation important. Biological species, culture, language, nationality, ethnicity, and naming convention are related only when a concrete provider says they are. The shared naming contract must not make them synonyms.

## Implemented contract

`packages/generator-core/src/nameSuggestion.ts` defines `name-suggestion/0.1`.

The shared layer knows only:

- provider ID and version;
- optional provider/source references with explicit versions;
- a caller-supplied seed or a generated replay seed;
- an opaque, provider-owned typed context;
- a provider-owned result that must contain a non-empty `displayName`.

A provider may return a richer result type later, but the shared contract does not currently define given name, family name, patronymic, clan, title, honorific, gendered form, script, transliteration, culture, or language fields. Those concepts should be promoted only when real providers need the same semantics.

The core helper returns the provider result plus provenance. It does not write a CharacterDocument, patch native state, choose a species/culture mapping, or decide whether a generated suggestion should replace a user-entered name.

## Determinism and provenance

`NameSuggestionProvenance` retains:

- contract version;
- provider ID;
- provider version;
- source IDs and versions;
- the effective seed.

The same provider implementation/version, caller context, and seed must replay the same result.

The current helper intentionally seeds the provider random source directly from the retained seed rather than adding new hidden salt. This let the D&D placeholder provider adopt the contract without changing the existing seeded name-selection behavior.

Provider-owned context is not copied automatically into generic provenance. If a system needs context such as a culture choice or naming language to be replayable, that context should already be retained as an ordinary system/generation decision and passed back to the provider on replay.

## Manual override rule

Generated names are suggestions. Direct user entry remains authoritative.

A creator may retain generation provenance for the suggestion that produced the current display name, but a later manual edit must be allowed to supersede that suggestion without the provider forcing the generated value back into native or shared state.

No shared naming code owns `CharacterDocument.displayName`.

## D&D adapter proof

`packages/system-dnd5e/src/nameGeneration.ts` now exports `DND5E_PLACEHOLDER_NAME_PROVIDER` and `suggestDnd5eCharacterName()`.

The provider deliberately reuses the existing six placeholder names. The dataset is identified as Character Forge placeholder content:

- source ID: `character-forge.dnd5e.placeholder-names`
- source version: `1`

It is not represented as WotC SRD naming data.

`resolveDnd5eCharacterName()` remains the compatibility API used by current guided generation. Explicit user input still wins, and the same explicit seed produces the same placeholder selection as before the provider seam.

Quick Generate still uses the existing system-owned `pickDnd5eGeneratedName()` inside its single seeded quick-generation stream. That path was intentionally not rewritten in this discovery slice because changing random-consumption order would be a behavior change without product evidence.

## Creator and Randomize All boundary

The shared creator does not need to understand naming providers. It coordinates existing system-owned randomizer controls.

D&D already exposes its name randomizer as one of those controls, so it can participate in `Randomize All` without a naming rule in `creatorWorkspace`.

A future BRP name randomizer should follow the same pattern only after BRP owns a legitimate provider/dataset. The absence of a provider is a valid state; `Randomize All` must not invent names or distributions merely to be exhaustive.

## What is intentionally not modeled yet

Do not add these to the shared contract without concrete cross-provider evidence:

- species-to-culture or species-to-language mappings;
- universal culture, nationality, ethnicity, ancestry, or race identity schemas;
- universal given/family/clan/patronymic naming parts;
- gender or presentation distributions;
- transliteration or multi-script policy;
- uniqueness guarantees across a campaign/world;
- weighted culture mixing;
- user-authored naming corpora/editors;
- network or LLM-backed naming as a required core path;
- a large D&D or BRP name corpus.

## Next proof

The next narrow implementation should carry D&D creator-generated name provenance through the normal generation record while preserving manual override and existing native/display-name behavior.

That proof should answer the persistence/reopen question before a second provider is added. A BRP provider should follow only when its source/content boundary is deliberate rather than borrowing the D&D placeholder list or inventing a pseudo-cultural distribution.
