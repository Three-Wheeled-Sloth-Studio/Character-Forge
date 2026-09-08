---
type: "Architecture Reference"
title: "Translation and Bridge RPG Evidence Ledger"
tags:
- character-forge
- architecture
---
# Translation and Bridge RPG Evidence Ledger

This file captures lessons discovered while implementing real systems. It exists so useful translation and original-RPG design evidence survives day-to-day development without prematurely becoming architecture.

Agents must update this file when work reveals a reusable semantic concept, a translation mismatch, a system-specific assumption, or a mechanic worth considering for the future original RPG.

## Entry format

For each meaningful observation record:

- Date and implementation slice.
- Observation.
- Translator implication.
- Bridge-RPG implication, if any.
- Confidence: low, medium, or high.
- Follow-up or decision needed.

## Current hypotheses, not shared-contract requirements

### Resolution curve

Observation: The future original RPG is explicitly not intended to be d20 based. Current direction favors a bell-shaped resolution family, likely 2d10 or 2d12, with the exact mechanic still open.

Translator implication: Shared semantics must not assume a linear d20 bonus scale or a single target-number probability model.

Bridge-RPG implication: Later design should compare probability curves, degrees of success, opposed resolution, and how modifiers behave near the center versus tails.

Confidence: high on non-d20 direction; low on exact dice expression.

### Harm and wounds

Observation: The future original RPG should avoid generic hit-point attrition as its primary harm model. Desired play includes common minor wounds and rarer serious wounds that are meaningful and persistent, producing a tense knife-fight feel.

Translator implication: The semantic model should leave room for injuries, wound severity, impairment, recovery, scars, and persistent consequences rather than treating all harm as one numeric pool.

Bridge-RPG implication: Later design should explore wound-state and consequence models without forcing them into Character Forge before multiple systems justify the shared concepts.

Confidence: high on desired experience; low on implementation mechanic.

### Setting-native capability space

Observation: The future original RPG should support broad settings while feeling especially native to psychic abilities, techno-magic, dark horror, cyberpunk, and steampunk aesthetics.

Translator implication: Capability semantics should eventually handle supernatural, technological, hybrid, corruptive, and possibly risky power sources without assuming a classic spell-slot model.

Bridge-RPG implication: Power-source costs, corruption, side effects, augmentation, and persistent consequences are likely useful design axes to watch across source systems.

Confidence: medium until system evidence accumulates.

## System-sequencing evidence

### First target: D&D 5E 2024

Reason: Large user base, rich but understandable character structure, strong Foundry relevance, multiple generation methods, and a legally redistributable SRD baseline.

Risk: It can easily make shared abstractions accidentally d20-shaped.

Mitigation: Keep system state native and semantic vocabulary provisional.

### Second target: Basic Roleplaying Universal Game Engine

Decision: Accepted 2026-09-08. Implement the 2023 BRP Universal Game Engine ORC content with corrections 1.05 as the second full system stress test.

Reason: BRP pressures D&D-shaped assumptions through percentile skills, profession-guided rather than class-bounded starting competence, separate professional and personal skill allocation, open-ended skill specialties, campaign-profile-dependent optional rules, non-level advancement, and multiple possible power systems.

Licensing boundary: BRP UGE is the public implementation target. Branded Call of Cthulhu remains a possible separately licensed future product target and must not be treated as interchangeable with BRP UGE content.

First implementation result: No shared `CharacterDocument` change was needed. BRP-specific rules profile, characteristics, derived values, profession, layered skill construction, and specialties fit inside mandatory native state while the shared semantic layer remained unchanged.

### Pathfinder

Current direction: Likely system three or later rather than system two. It is strategically important but too close to D&D to be the first serious stress test of the universal semantic layer.

## Evidence log

### 2026-08-26 - D&D 5E 2024 first Level 1 native slice

Observation: In the 2024 rules represented by SRD 5.2.1, background choice is a source of ability-score increases while species is a separate origin component. A Human Soldier Fighter therefore carries meaningful mechanical contributions from class, background, and species that must remain distinguishable even when they affect the same final character sheet.

Translator implication: Do not flatten every numeric value into an unexplained final score. Translation will need source-aware grants or contributions so it can distinguish base values, origin adjustments, class grants, and derived values when the target system organizes those concepts differently.

Bridge-RPG implication: Treat character origin, biology/species, culture/background, and professional training as separable design axes unless later evidence argues otherwise. This supports settings where upbringing or augmentation matters more than ancestry.

Confidence: high.

Follow-up: Preserve source attribution for grants when the semantic projection begins; do not yet define a universal `ability_score_bonus` trait from D&D alone.

### 2026-08-26 - Choice slots and granted capabilities

Observation: The first character receives capabilities through several different choice shapes: a fixed background feat, a species-granted open Origin-feat choice, class skill choices, a Fighting Style choice, and three Weapon Mastery choices.

Translator implication: A reusable bridge will likely need to distinguish a granted capability from a choice slot that selected that capability. The provenance of a choice matters for validation, regeneration, and translating to systems with different character-building budgets.

Bridge-RPG implication: Choice-slot provenance may be more flexible for the original RPG than hard-coded class packages, but that remains a hypothesis rather than a shared mechanic.

Confidence: medium-high.

Follow-up: Keep generation decisions separate from native state while retaining both. Revisit after guided narrative generation maps fictional answers into mechanical choices.

### 2026-08-26 - Derived state versus authoritative native state

Observation: Armor Class, Initiative, passive Perception, and Level 1 Hit Points can be recomputed from underlying D&D choices, but the native fixture retains their current values as well as the inputs that produced them.

Translator implication: Derived values should not automatically become universal facts. Some target systems may have no corresponding derived statistic. Native round-trip fidelity and semantic translation therefore need different data-retention rules.

Bridge-RPG implication: Avoid importing D&D-derived sheet conveniences into the original RPG merely because they are easy to compute.

Confidence: high.

Follow-up: When maintenance begins, define when derived native fields are recalculated and how stale derived values are detected without erasing imported source state.

### 2026-08-26 - Hit points are system state, not universal harm semantics

Observation: The first Fighter has a numeric Hit Point resource because D&D requires it, including a class-derived Level 1 maximum and Second Wind healing resource.

Translator implication: Preserve D&D Hit Points exactly in native state, but do not make `hitPoints` the universal representation of injury or survivability. The future bridge must be able to map a numeric attrition pool to wound, consequence, stress, or injury-state models with explicit approximation or loss.

Bridge-RPG implication: This reinforces the existing direction toward minor wounds and rarer persistent serious wounds rather than generic hit-point attrition.

Confidence: high.

Follow-up: BRP and later systems should pressure-test health, injury, and recovery semantics before any shared harm schema is promoted.

### 2026-08-26 - Ability values need causal layers

Observation: Parameterizing Standard Array exposed three distinct pieces of state that can lead to the same final ability score: the generated/assigned base value, the background-sourced adjustment, and the final score used by play. The generator must also retain the user's actual assignment and adjustment choices for replay.

Translator implication: A final scalar value is insufficient when translating a character. The bridge may need to understand both the resulting value and one or more source-aware contributions because a target system might encode training, origin, augmentation, age, injury, or supernatural modification as separate concepts.

Bridge-RPG implication: The original system should consider whether character attributes benefit from explicit contribution layers rather than destructive overwriting. That could make cybernetic augmentation, psychic alteration, lasting wounds, training, and corruption easier to represent consistently. This is a design hypothesis, not a shared Character Forge requirement.

Confidence: medium-high.

Follow-up: Watch manual, point-cost, random, and later non-D&D systems for whether base/contribution/final layering remains useful. Do not promote a universal modifier schema until a second system provides confirming evidence.

### 2026-08-26 - Generation intent must survive derived recomputation

Observation: Reassigning Standard Array values correctly changes Fighter HP, Alert-modified Initiative, and Passive Perception. Those derived values are recomputed from native choices, while the generation record separately keeps the assignment that caused them.

Translator implication: Provenance and derived state solve different problems. Translation and regeneration should not infer player intent from a derived total when the original choice can be retained directly.

Bridge-RPG implication: For the future system, derived statistics should be cheap to recompute and should not erase the underlying decisions, traits, wounds, equipment, or effects that produced them.

Confidence: high.

Follow-up: Preserve this separation when manual and narrative generation are added.

### 2026-08-26 - Generation method is provenance, not character ontology

Observation: Standard Array and Manual Ability Entry produce the same D&D-native ability-state shape after their method-specific base-score step. Background contributions, final scores, dependent statistics, adapter validation, CharacterDocument persistence, and reopen behavior are shared. Point Cost and Random Generation later confirmed the same convergence.

Translator implication: A cross-system character model should not require separate character ontologies for manual, purchased, rolled, quick, or narrative generation. Generation method belongs primarily in provenance and decision history; the resulting authoritative native state can remain method-agnostic except where the source system itself requires method metadata.

Bridge-RPG implication: Future original-RPG character creation can support multiple front ends without multiplying downstream character-state formats. Manual entry, point allocation, random generation, and narrative guidance should ideally converge on one validated character-state pipeline.

Confidence: high within the D&D implementation; medium as a cross-system claim until another RPG confirms it.

Follow-up: Watch whether a structurally different second RPG exposes cases where generation method must affect authoritative state more deeply.

### 2026-08-26 - Point budgets are construction provenance, not runtime traits

Observation: D&D Point Cost constrains how six pre-background ability values are purchased, but once those values enter the shared ability-state pipeline the resulting character has the same authoritative base/background/final ability structure as Standard Array or Manual Entry. The 27-point budget and score-cost table explain construction legality; they do not create an additional runtime character statistic.

Translator implication: Character translation should not automatically turn source-system creation currencies or point-buy budgets into persistent target-system traits. Retain them in generation provenance when useful for audit/replay, but translate the resulting capabilities unless the target system has a concrete reason to preserve construction currency.

Bridge-RPG implication: A future original RPG can use creation budgets without forcing those budgets into play-state. Keeping construction economy separate from runtime state makes it easier to support alternate creation modes, respec tools, narrative generation, or imported characters without inventing permanent point resources.

Confidence: high for the current D&D implementation; medium as a general cross-system principle.

Follow-up: Compare this against systems where unspent character points, advancement points, or build currencies remain live after creation. Do not generalize all point-based systems from D&D's one-time Point Cost method.

### 2026-08-26 - Acceptable-option pools are user intent, not character capability

Observation: Guided D&D creation distinguishes three related facts: the set of options a user is generally happy to receive, whether the current character's result was chosen directly or randomly from that set, and the single class/background/species actually possessed by the resulting character. The acceptable pool is sticky user preference; the selected result is native character state; the pool and selection mode used for that character are generation provenance.

Translator implication: Translation should operate on the selected character state, not on the user's broader acceptable-option preferences. Preference data can help future generation or recommendation but does not describe capabilities the character possesses.

Bridge-RPG implication: The original RPG can safely support Nethack-style random-from-acceptable menus without polluting runtime character state. This pattern also allows a player to maintain stable taste/preferences while each generated character retains an auditable individual decision history.

Confidence: high for the separation of preference, provenance, and state; medium on how broadly sticky pools should be reused until more menu types are implemented.

Follow-up: Reuse the pattern for other menu decisions. Watch for cases where acceptable options are conditional on earlier choices or campaign restrictions and make sure sticky preferences are sanitized rather than treated as authoritative legality.

### 2026-08-26 - Nested source choices must not be erased by convenient defaults

Observation: The SRD class/species/background catalog is broader than the guided-supported set. Several species require ancestry, lineage, or legacy choices; Acolyte/Sage and spellcasting classes require spell choices/native state. Character Forge can catalog those options, but marking them fully supported by silently selecting nested choices would lose real player intent and make the native document falsely look complete.

Translator implication: A source option that contains meaningful nested decisions cannot always be translated or generated faithfully as one flat identifier. The bridge may need to preserve a decision tree or explicitly report missing/substituted nested choices.

Bridge-RPG implication: Prefer explicit composable option trees over large packages whose internal choices are destructively defaulted. Defaults can still be useful UX, but they should remain visible decisions when they materially shape the character.

Confidence: high.

Follow-up: Model species ancestry/lineage/legacy and spell-state choices explicitly before enabling those catalog entries. Use the same discipline for future systems.

### 2026-08-26 - Background is a source-owned bundle, not a label

Observation: Opening Criminal and Soldier backgrounds showed that one D&D background simultaneously constrains ability increases and grants an Origin feat, two skill proficiencies, a tool proficiency, and an equipment/gold branch. Those grants can affect derived state: Criminal's Alert changes Initiative even though the selected class, species, and base Dexterity may be unchanged. Human's separate Versatile Origin-feat choice must also avoid duplicating the background-granted feat.

Translator implication: Translating only the background name or only the character's final derived totals would lose important causal information. Background-like concepts in other systems may map partly to training, social history, feats, resources, contacts, skills, or equipment. Translation should preserve source attribution long enough to map those contributions independently and to report when a target system has no equivalent bundle.

Bridge-RPG implication: If the original RPG uses backgrounds/origins, prefer them as composable sources of grants/choices rather than opaque packages whose only persistent meaning is a label. This can support richer lifepaths without forcing every grant to remain permanently tied to one monolithic package.

Confidence: high for D&D source attribution; medium as a cross-system design lesson until another RPG supplies a contrasting background/lifepath model.

Follow-up: Class-owned skill/mastery choices and a second RPG should test whether a generalized source-aware grant/choice concept is justified. Do not promote a universal `background` schema from D&D alone.

### 2026-09-08 - Species-owned magic and future capability are distinct source state

Observation: Implementing Elf, Gnome, and Tiefling showed that species-owned spell capability does not fit cleanly into either class spellcasting or general feat grants. A species can own current spells, a source-specific casting-ability choice, replacement or free-cast semantics, and future level-gated spells that must be retained without becoming active early. Character Forge therefore retains species magic in `spells.speciesGrants[]` separately from `spells.grants[]` and `spells.classCasting[]`.

Translator implication: A future bridge should not assume that all known or prepared spells are equivalent capabilities. Source, activation level, replacement cadence, and free-cast semantics can affect whether a target system maps a D&D spell to innate talent, learned magic, class training, supernatural trait, or no exact equivalent.

Bridge-RPG implication: Capability source and unlock timing are useful independent design axes. The original RPG may benefit from modeling where a capability comes from and when it becomes available without requiring species or lineage to be the only innate source.

Confidence: high for the D&D source separation; medium as a cross-system semantic claim until a second RPG tests it.

Follow-up: Use Foundry mapping and the second RPG stress test to determine whether a generalized source-aware capability grant is justified. Do not promote the current spell-specific schema directly into the universal semantic layer.

### 2026-09-08 - BRP confirms causal value layers beyond D&D

Observation: A BRP skill's starting percentage is not adequately described by one final scalar. The first BRP slice retains base chance, professional allocation, personal allocation, and final rating separately. This independently reproduces the causal-layer pressure first seen in D&D base/background/final ability scores, but in a different mechanic and a different rules family.

Translator implication: There is now cross-system evidence that final capability values can require causal layers for faithful validation, replay, and translation. This strengthens the case for a future generic contribution/provenance concept, but it still does not justify freezing one shared modifier schema because the source semantics differ.

Bridge-RPG implication: Explicit contribution layers remain attractive for training, origin, augmentation, age, injury, corruption, and other persistent causes. The design should favor inspectable causes over destructive overwrite where practical.

Confidence: high that causal layers recur; medium on the eventual universal representation.

Follow-up: Compare against FitD/Fate/Cypher or another third system before promoting a universal contribution contract.

### 2026-09-08 - BRP profession is evidence against universal class

Observation: BRP profession controls where starting professional skill points may be spent, while personal allocation can cross that boundary and later learning is not class-restricted. Treating Detective as a D&D-style class would misrepresent the source system.

Translator implication: `class` must remain D&D-owned. A future bridge may need separate concepts for current profession/social identity, training source, and actual competence rather than forcing them into one taxonomy.

Bridge-RPG implication: Separating professional history from current capability supports lifepaths, retraining, career changes, and settings where characters accumulate multiple forms of expertise.

Confidence: high.

Follow-up: Watch a lifepath-heavy system and a playbook-based system before defining any shared profession/training ontology.

### 2026-09-08 - BRP rules profile is part of native interpretability

Observation: `BRP UGE` alone is not enough context to validate every BRP character. Power level and optional systems can change creation budgets, caps, characteristic sets, derived state, and available powers. The first native schema therefore retains an effective rules profile even though the first profile is deliberately Normal, non-powered, and option-free.

Translator implication: Some systems require campaign/rules-profile context to interpret character state correctly. Character Forge should preserve enough effective native configuration to validate and reopen a character rather than infer the profile from final numbers.

Bridge-RPG implication: If the original system becomes modular, character documents should retain the rules modules that materially shaped them rather than depending on ambient campaign configuration alone.

Confidence: high for BRP; medium as a cross-system architectural principle.

Follow-up: Revisit when a second BRP power level or optional subsystem is implemented and when another configurable RPG adapter exists.

### 2026-09-08 - Open-ended specialties should not become universal enums

Observation: BRP skill identity can include an open specialty, demonstrated in the first slice by Firearm (Handgun), Knowledge (Law), and Science (Forensics). Specialty identity is source-meaningful but cannot safely be reduced to a fixed universal catalog.

Translator implication: Preserve parent skill identity and source specialty identity natively. Translation can later map or approximate the specialization if a target system has an equivalent, while reporting loss when it does not.

Bridge-RPG implication: A controlled open-specialty mechanism may be more extensible than proliferating narrowly named skills, but that is a design hypothesis rather than a shared Character Forge requirement.

Confidence: high for native retention; medium for future shared or original-system design.

Follow-up: Compare with another system's specialization/tag mechanics before promoting a universal specialty concept.

### 2026-09-08 - BRP confirms generation method can remain provenance

Observation: BRP explicit characteristic entry and deterministic standard rolled characteristics now converge on the same `brp-character/0.1` characteristic, derived-value, and skill-state pipeline. Standard rolling retains additional source-required construction evidence such as seed, raw dice, and redistribution transfers, but those details do not require a second play-state ontology. This independently confirms the convergence pattern already observed across D&D Standard Array, manual, point-cost, and rolled creation.

Translator implication: There is now two-system evidence that generation method should generally remain provenance or source-owned construction state rather than becoming a universal character-type distinction. A translator can operate on authoritative native results while retaining construction evidence for audit or replay where meaningful.

Bridge-RPG implication: The original RPG can support multiple creation experiences without multiplying runtime character schemas. Random, purchased, manual, and guided creation can converge if the system retains any construction details that remain rules-relevant.

Confidence: high across D&D and BRP.

Follow-up: Keep this as an architectural principle, but still allow exceptions when a future source system makes creation path itself a persistent in-play mechanic.

### 2026-09-08 - BRP Heroic confirms rules profile changes character legality

Observation: The same BRP native character shape now supports both Normal and Heroic construction, but the retained power level changes the legal professional skill budget and starting skill cap. A skill allocation that is legal at Heroic can be illegal at Normal without any change to the shared `brp-character/0.1` ontology. Adapter validation therefore cannot treat power level as display metadata or infer it reliably from final values.

Translator implication: Rules-profile context may be required to interpret whether source-native state is valid even when the target translator only consumes the resulting capabilities. Translation should preserve source profile identity long enough to explain why a value or allocation exists, but should not assume that another system has an equivalent power-level label.

Bridge-RPG implication: If the original RPG supports campaign modes, power tiers, optional modules, or variant construction rules, the effective profile that shaped a character should be retained with the character rather than relying entirely on the campaign's current configuration.

Confidence: high for BRP native interpretability; medium as a cross-system semantic principle.

Follow-up: Compare with another configurable rules system before promoting any shared rules-profile contract beyond the existing native-state boundary.

### 2026-09-08 - Character-specific history can be required beside campaign profile

Observation: Heroic professional skill points can increase with full decades added after the character's default starting age. Current age alone is insufficient to reconstruct that construction budget because the source calculation also depends on the starting-age value. Character Forge therefore retains the default starting age, years added, and resulting professional-skill adjustment as BRP-native character causality.

Translator implication: Ambient campaign rules and current character values are not always enough to validate or explain a character. Some source systems require retained historical or construction context that is character-specific. Translation should not discard that context merely because it is not a current-play statistic.

Bridge-RPG implication: Lifepath, aging, training-time, augmentation history, or other historical construction effects may need explicit provenance if they change legal capabilities. A modular original RPG should avoid making old characters uninterpretable when campaign defaults later change.

Confidence: high for this BRP case; medium as a general design rule.

Follow-up: Watch Scholar and later lifepath-heavy systems for whether character-specific historical context recurs before promoting a universal history schema.
