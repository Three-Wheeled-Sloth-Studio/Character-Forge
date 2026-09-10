---
type: "Product And Licensing Plan"
title: "BRP Investigative Horror Profile"
tags:
- character-forge
- brp
- investigative-horror
- licensing
---
# BRP Investigative Horror Profile

Date: 2026-09-10
Status: planned after BRP Player-Usable Core browser closeout

Parent direction: `refs/planning/brp-to-universal-grammar-path.md`

## Goal

Create a first-class investigative-horror character-generation profile using BRP Universal Game Engine material and independently sourced/original content, without presenting the product as Call of Cthulhu or importing Call of Cthulhu-only protected expression/content.

## Prerequisite Profile Seam - Landed

The generic BRP productization phase has now established the configuration boundary this phase should use.

Implementation checkpoint:

- SHA: `fabbc6567ffa8a9d4d24af9a940baa17a86a1b03`
- Actions: `34527156423`
- Job: `103038733378`

The implemented BRP-owned seam provides:

- versioned stable campaign/profile identity;
- `Generic BRP Core` as the only current active profile;
- deterministic profile -> source-native default mapping;
- effective `BrpRulesProfile` retained independently in authoritative native state;
- save/reopen reconstruction from effective native rules rather than current profile definitions;
- explicit application of current profile defaults only when a profile is selected; and
- legacy/unknown profile provenance handling that does not silently reinterpret a character.

The future `investigative-horror` profile should extend this BRP-owned catalog and mapping. It should not create a second profile architecture and should not make the profile ID the authority for existing characters.

No Investigative Horror rules, Sanity configuration, or branded horror content was introduced by the prerequisite seam.

## Rules / License Authority

At implementation time, re-check the current official sources and freeze the exact source/version/license metadata and required notices.

Current planned official references include:

- BRP ORC License page;
- BRP ORC Content Document; and
- Chaosium BRP licensing guidance relevant to open versus Product Identity content.

The prior source review identified simplified BRP Sanity material as potentially available through the BRP open content while Call of Cthulhu-specific Sanity rules are outside this product boundary. Re-verify that distinction against current official material before implementation.

This plan is engineering/product guidance, not legal advice. Obtain legal review before commercial positioning close to Chaosium trademarks.

## Naming / Marketing Boundary

Preferred working name:

**BRP: Universal Game Engine - Investigative Horror**

Do not describe Character Forge support as:

- Call of Cthulhu;
- CoC;
- a Call of Cthulhu character generator;
- 7th Edition Call of Cthulhu support; or
- compatible with Call of Cthulhu unless a future license explicitly permits that claim.

Do not use Call of Cthulhu logos, trade dress, artwork, protected setting content, or copied CoC-only occupation/rules text.

## Content Boundary

Keep three layers distinct:

1. **BRP-system content** - rules/configuration actually supported by the BRP ORC source;
2. **Character Forge original content** - independently authored profile prompts/tables/content with explicit provenance; and
3. **setting/content-package material** - campaign/world-owned material injected outside `system-brp`.

Never reconstruct allegedly generic horror content from Call of Cthulhu books.

If public-domain cosmic-horror material is later desired, audit the exact underlying work/source/rights separately and keep package provenance explicit.

## Candidate Player Experience

The target player should be able to build a grounded human investigator for an original investigative-horror campaign using coherent BRP profile defaults, including only source-supported optional mechanics and appropriate investigation/social/combat choices, without relying on Call of Cthulhu-owned mechanics or setting material.

The profile should feel deliberately configured rather than like a generic BRP creator with dozens of exposed optional-rule toggles.

## Architecture Contract

Investigative Horror should use the proven seam as follows:

```text
investigative-horror profile definition
    -> explicit BRP-native defaults/options
    -> creator initialization
    -> authoritative effective BrpRulesProfile in native state
```

Profile provenance may explain how a character began, but native effective rules remain authoritative after creation. A future change to the profile definition must not silently alter reopened characters.

Setting-owned flavor and original random-table content must remain separable from BRP-system mechanics.

## Explicit Non-goals

- Call of Cthulhu trademark/product support;
- CoC-only Sanity implementation;
- Chaosium Mythos setting/content ingestion;
- Miskatonic Repository as a software-license workaround;
- changing the campaign/profile seam into a universal RPG ontology; or
- Universal Grammar work beyond recording evidence from this second BRP profile.
