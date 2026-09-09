---
type: "Product Reference"
title: "Structured Naming"
tags:
- character-forge
- product
- naming
---
# Structured Naming

Status: The first system-neutral name-suggestion contract, D&D placeholder provider, D&D guided-creator provenance integration, and BRP content-ownership discovery are complete on `dev`. This remains a deliberately small boundary, not a universal identity or culture model.

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

A creator may retain generation provenance for the suggestion that produced the current display name, but a later manual edit must supersede that suggestion without the provider forcing the generated value back into native or shared state.

No shared naming code owns `CharacterDocument.displayName`.

## D&D provider

`packages/system-dnd5e/src/nameGeneration.ts` exports `DND5E_PLACEHOLDER_NAME_PROVIDER` and `suggestDnd5eCharacterName()`.

The provider deliberately reuses the existing six placeholder names. The dataset is identified as Character Forge placeholder content:

- source ID: `character-forge.dnd5e.placeholder-names`
- source version: `1`

It is not represented as WotC SRD naming data.

`resolveDnd5eCharacterName()` remains a compatibility API. Explicit user input still wins, and the same explicit seed produces the same placeholder selection as before the provider seam.

Quick Generate still uses the existing system-owned `pickDnd5eGeneratedName()` inside its single seeded quick-generation stream. That path remains intentionally unchanged because moving it to an independently seeded suggestion would change random-consumption behavior without product evidence.

## D&D guided creator provenance

The guided D&D path now retains name-specific provenance without changing native identity state.

- Guided generation recipe version is `0.7`.
- `CharacterDocument.displayName` remains a plain string.
- D&D native `identity.name` remains the same plain authoritative string.
- Accepted generated-name provenance is retained as an `identity.name.suggestion` generation decision.
- The decision records the generated display name, whether the trigger was `explicit-randomize` or `blank-fallback`, and contract/provider/source/version/seed provenance.
- Blank-name fallback now retains its effective name-generation seed instead of silently discarding it.
- If random ability generation supplied the historical fallback seed, the naming provider may continue to use that seed so existing behavior is not changed accidentally. Otherwise the naming provider creates a name-specific replay seed.

`matchingDnd5eNameSuggestion()` accepts a retained suggestion only when its current provider/source/version identity is valid, its display name still matches, and replay from its retained seed reproduces the same name.

`applyDnd5eNameSuggestion()` attaches an accepted creator-held suggestion to generation provenance only after the canonical D&D character is built. It verifies both the authoritative `CharacterDocument.displayName` and native identity name, then changes generation decisions only. Native states are not mutated.

The web layer uses `apps/web/src/dndGuidedCreatorPanel.ts` as a thin D&D-specific wrapper around the existing guided panel. It retains the complete suggestion while the generated name remains current. Manual name input clears that creator-local suggestion. This avoids teaching the shared creator workspace any D&D naming rules.

Reopen does not infer or reconstruct a generated suggestion from the display string. An old suggestion therefore cannot overwrite the authoritative retained name simply because the text happens to match a placeholder entry.

Automated-green implementation checkpoint:

- SHA: `1a1eb5de957eabd87b63785ef8dafccafbd47a44`
- Actions: `34374497101`
- job: `102543733892`
- 40 test files / 193 tests / 0 failures

## BRP provider/content ownership decision

BRP UGE does not define a BRP-owned naming corpus.

The authoritative ORC content instead makes naming setting-dependent:

- the terminology section says character names and backgrounds are determined by the player with gamemaster assistance and/or approval;
- Character Creation, Step One says a character's name should be appropriate to the setting and game being played;
- the optional `Culture and Characters` section says the gamemaster may develop cultural backgrounds appropriate to an original or adapted setting, with language(s) among the optional background fields.

Source review found no BRP generated-name table, naming procedure, or concrete culture-to-name mapping. Therefore a generated-name dataset does not belong in `packages/system-brp` merely because the character uses BRP mechanics.

The ownership boundary is:

- BRP mechanics own the authoritative character name string and any BRP-native generation record that references it;
- a concrete setting/campaign/content package owns its naming data and provider-specific context;
- a host/caller may supply that provider to a BRP creator when such a setting exists;
- the current BRP `Human` profile supplies no naming-culture context;
- no pseudo-BRP fallback culture or name corpus should be invented for `Randomize All`.

The existing `name-suggestion/0.1` contract already supports this design. A setting-owned provider can carry its own provider ID/version, source ID/version, seed, opaque context, and result without changing the shared contract.

No separate universal content-provider layer is justified yet. The existing caller-supplied `NameSuggestionProvider<TContext, TResult>` is sufficient until a real Parchment/world/setting consumer exposes repeated needs beyond name suggestion.

## Source and license consequence

Chaosium's ORC release makes the applicable BRP UGE text available under the ORC license subject to the stated product-identity exclusions. That does not create a license for external setting or real-world naming datasets that are not part of BRP UGE.

Every future naming provider must therefore retain its own deliberate source/license boundary. Provider provenance must not claim that setting names came from `chaosium-brp-uge-orc-1.05` unless they actually did.

Call of Cthulhu, RuneQuest, Pendragon, Rivers of London, and other branded-setting content remain separate unless independently licensed/open for the intended use.

Detailed BRP source evidence is recorded in `refs/integration/brp-uge-orc.md`.

## Creator and Randomize All boundary

The shared creator does not understand naming providers. It coordinates existing system-owned randomizer controls.

D&D's existing name button remains the participation seam for `Randomize All`. The D&D creator wrapper intercepts that same control to retain the complete provider suggestion, so the shared orchestration does not need a naming-specific branch.

BRP should expose a name randomizer only when its caller supplies a legitimate setting/campaign/content provider. The absence of a provider is a valid state; `Randomize All` must not invent names or distributions merely to be exhaustive.

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
- a large D&D or BRP name corpus;
- a generic content-provider framework with no concrete non-name consumer.

## Next proof

Naming architecture is now waiting on a real setting/campaign/content consumer rather than another abstract layer.

When one arrives, the next naming proof should inject that concrete provider from the host/caller boundary into the BRP creator, preserve manual authority and provider/source/version/seed provenance, and keep `system-brp` free of invented naming data.

Until that consumer exists, naming should not block unrelated creator work. The next active implementation slice can return to a concrete product gap such as consolidating D&D Quick Generate as a top-level creator mode.
