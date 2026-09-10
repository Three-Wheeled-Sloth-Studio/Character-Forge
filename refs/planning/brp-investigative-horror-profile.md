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

Date: 2026-09-09
Status: planned after BRP Player-Usable Core

Parent direction: `refs/planning/brp-to-universal-grammar-path.md`

## Goal

Create a first-class investigative-horror character-generation profile using BRP Universal Game Engine material and independently sourced/original content, without presenting the product as Call of Cthulhu or importing Call of Cthulhu-only protected expression/content.

## Rules/license authority

At implementation time, re-check the current official sources and freeze the exact source/version/license metadata and required notices.

Current official references:

- BRP ORC License page: https://www.chaosium.com/orc-license/
- BRP ORC Content Document: https://www.chaosium.com/blogdownload-the-free-basic-roleplaying-orc-content-document-sell-the-games-you-create-royaltyfree/
- Chaosium BRP Design Challenge licensing Q&A: https://www.chaosium.com/blogthe-basic-roleplaying-design-challenge/

The BRP ORC material may be used under its license subject to Product Identity exclusions. Chaosium's own licensing Q&A distinguishes the simplified BRP Sanity rules, which are part of BRP's open material, from Call of Cthulhu-specific Sanity rules, which are not.

This plan is engineering/product guidance, not legal advice. Before commercial positioning close to Chaosium trademarks, obtain legal review.

## Naming/marketing boundary

Preferred naming:

**BRP: Universal Game Engine — Investigative Horror**

Do not describe the Character Forge feature as:

- Call of Cthulhu;
- CoC;
- a Call of Cthulhu character generator;
- 7th Edition Call of Cthulhu support;
- compatible with Call of Cthulhu unless a future license explicitly permits that claim.

Do not use Call of Cthulhu logos, trade dress, artwork, protected setting content, or copied CoC-only occupation/rules text.

## Content boundary

Keep three layers distinct:

1. **BRP-system content** — rules/configuration actually supported by the BRP ORC source;
2. **Character Forge original content** — independently authored profile prompts/tables/content with its own provenance;
3. **setting/content-package material** — campaign/world-owned material injected outside `system-brp`.

Never reconstruct allegedly generic horror content from Chaosium Call of Cthulhu books.

If public-domain cosmic-horror material is later desired, audit the exact underlying work/source/rights separately and keep that package provenance explicit.

## Candidate player experience

The target player should be able to build a grounded human investigator for an original investigative-horror campaign using coherent BRP profile defaults, including source-supported Sanity and appropriate investigation/social/combat character options, without relying on Call of Cthulhu-owned mechanics or setting material.

The profile should feel deliberately configured rather than like a generic BRP sheet with dozens of optional-rule toggles.

## Architecture value

This phase should prove the campaign/rules-profile seam introduced during BRP productization:

- a profile selects a coherent set of BRP-native options/defaults;
- native state retains the actual effective rules/configuration;
- the profile label does not replace source-native state;
- profile switching/creation cannot silently reinterpret an existing character;
- setting-owned flavor remains separable from BRP-system mechanics.

## Explicit non-goals

- Call of Cthulhu trademark/product support;
- CoC-only Sanity implementation;
- Chaosium Mythos setting/content ingestion;
- Miskatonic Repository as a software-license workaround;
- Universal Grammar work beyond updating the evidence ledger with any new profile/configuration lessons.
