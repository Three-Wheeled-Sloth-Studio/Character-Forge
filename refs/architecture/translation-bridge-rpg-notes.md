---
type: "Architecture Reference"
title: "Translation and Bridge RPG Evidence Ledger"
tags:
- character-forge
- architecture
---
# Translation and Bridge RPG Evidence Ledger

This is the durable evidence ledger for reusable concepts exposed by real system implementations. Entries are observations and hypotheses, not automatic shared-contract requirements.

When implementation reveals a reusable semantic concept, translation mismatch, source-system assumption, or original-RPG design lesson, record the observation, translator implication, bridge-RPG implication, confidence, and follow-up.

## Current hypotheses, not shared requirements

### Resolution curve

Observation: The future original RPG is explicitly non-d20; current direction favors a bell-shaped family such as 2d10 or 2d12.

Translator implication: Shared semantics must not assume a linear d20 bonus scale.

Bridge-RPG implication: Compare probability curves, degrees of success, opposed resolution, and modifier behavior before fixing the mechanic.

Confidence: high on non-d20 direction; low on exact dice expression.

### Harm and wounds

Observation: The future original RPG should not use generic hit-point attrition as its primary harm model. Desired play favors common minor wounds and rarer persistent serious wounds.

Translator implication: Leave room for injuries, severity, impairment, recovery, scars, and consequences rather than one universal damage pool.

Bridge-RPG implication: Explore wound-state/consequence models later.

Confidence: high on desired experience; low on implementation mechanic.

### Setting-native capability space

Observation: The future original RPG should support broad settings while feeling native to psychic abilities, techno-magic, dark horror, cyberpunk, and steampunk.

Translator implication: Capability semantics must not assume classic spell slots or one supernatural source.

Bridge-RPG implication: Track source, cost, corruption, side effects, augmentation, and persistent consequences as possible design axes.

Confidence: medium.

## System-sequencing evidence

### D&D 5E 2024 first

Reason: broad use, strong Foundry relevance, rich Level 1 structure, multiple generation methods, and an open SRD boundary.

Risk: accidentally making shared abstractions d20-shaped.

Mitigation: native state remains authoritative and semantics remain provisional.

### Basic Roleplaying Universal Game Engine second

Decision: accepted 2026-09-08 using 2023 BRP UGE ORC content plus corrections 1.05.

Reason: percentile skills, profession-guided rather than class-bounded competence, professional/personal allocation, open specialties, modular rules profile, non-level advancement, and multiple possible power systems strongly pressure D&D assumptions.

Licensing boundary: BRP UGE is the public implementation target. Branded Call of Cthulhu remains separately licensed future scope.

Current result: explicit/rolled generation, Normal/Heroic profiles, Detective/Scholar professions, open academic specialties, age causality, and named language identity all fit inside `brp-character/0.1` without changing shared CharacterDocument or RulesSystemAdapter contracts.

### Pathfinder later

Pathfinder remains strategically important but is too D&D-adjacent to serve as the first serious semantic stress test.

## Evidence log

### 2026-08-26 - D&D origin sources remain distinguishable

Observation: D&D background, species, and class can all contribute mechanically to one final character.

Translator implication: Do not flatten final values without source attribution when source meaning matters.

Bridge-RPG implication: origin, biology/species, culture/background, and professional training are useful separable axes.

Confidence: high.

Follow-up: preserve source-aware grants; do not promote a D&D-specific universal bonus trait.

### 2026-08-26 - Choice slots differ from granted capabilities

Observation: fixed grants, open choices, bounded class skills, Fighting Style, Weapon Mastery, and species-origin choices have different construction semantics.

Translator implication: distinguish a capability from the choice slot/provenance that selected it.

Bridge-RPG implication: composable choice provenance may be more flexible than hard-coded packages.

Confidence: medium-high.

Follow-up: keep generation decisions separate from authoritative state.

### 2026-08-26 - Derived state is not automatically universal state

Observation: D&D AC, Initiative, passive Perception, and HP are recomputable conveniences but remain useful native values.

Translator implication: native round-trip fidelity and semantic translation need different retention rules.

Bridge-RPG implication: do not import source-system derived conveniences merely because they are easy to compute.

Confidence: high.

### 2026-08-26 - Hit points are source state, not universal harm semantics

Observation: D&D requires numeric HP and healing resources.

Translator implication: retain D&D HP natively without making HP the universal injury model.

Bridge-RPG implication: reinforces persistent wound/consequence direction.

Confidence: high.

### 2026-08-26 - Values can require causal layers

Observation: D&D ability scores retain base assignment, background adjustment, and final value.

Translator implication: a final scalar can be insufficient when source causes matter.

Bridge-RPG implication: explicit contribution layers may help represent training, augmentation, age, injury, corruption, and similar causes.

Confidence: medium-high.

Follow-up: require additional-system evidence before freezing a universal modifier schema.

### 2026-08-26 - Generation intent survives derived recomputation

Observation: changing D&D base assignments recomputes dependent values while the generation record retains the choice that caused them.

Translator implication: do not infer player intent from derived totals when the original decision can be retained.

Bridge-RPG implication: derived statistics should be cheap to recompute without erasing causes.

Confidence: high.

### 2026-08-26 - Generation method is primarily provenance

Observation: Standard Array, Manual Entry, Point Cost, and Random D&D generation converge on one D&D-native play-state shape.

Translator implication: creation method normally belongs in provenance, not a separate character ontology.

Bridge-RPG implication: multiple creation front ends can converge on one runtime model.

Confidence: high within D&D; later confirmed cross-system by BRP.

### 2026-08-26 - Construction budgets are not automatically runtime traits

Observation: D&D point-buy currency explains construction legality but is not a live character resource after creation.

Translator implication: do not automatically translate creation currency as persistent capability.

Bridge-RPG implication: creation economy can remain separate from runtime state.

Confidence: high for D&D; medium generally.

### 2026-08-26 - Acceptable-option pools are user intent

Observation: sticky acceptable choices, per-character random/direct selection mode, and final selected character state are three separate facts.

Translator implication: translate the selected character, not the user's broader preference pool.

Bridge-RPG implication: Nethack-style random-from-acceptable menus can remain generation UX/provenance rather than character capability.

Confidence: high.

### 2026-08-26 - Nested source choices must remain explicit

Observation: species lineage, spell choices, and other nested D&D decisions cannot be silently defaulted without losing intent.

Translator implication: some source options require decision trees or explicit loss reporting rather than one flat identifier.

Bridge-RPG implication: prefer composable option trees to opaque packages where internal choices matter.

Confidence: high.

### 2026-08-26 - Background is a source-owned bundle

Observation: a D&D background can grant ability adjustments, feat, skills, tool, and equipment branch together.

Translator implication: translating only the background label or only final totals loses causal information.

Bridge-RPG implication: origin packages can be composable sources of grants/choices rather than opaque labels.

Confidence: high for D&D; medium cross-system.

### 2026-09-08 - Species-owned magic is distinct source state

Observation: D&D species magic has source-specific casting ability, current/future grants, replacement cadence, and free-cast semantics that do not fit class spellcasting or general feat grants.

Translator implication: source and unlock timing matter when mapping magical capabilities.

Bridge-RPG implication: capability source and unlock timing are useful independent design axes.

Confidence: high for D&D; medium cross-system.

### 2026-09-08 - BRP confirms causal value layers beyond D&D

Observation: BRP skills retain base chance, professional allocation, personal allocation, and final rating separately.

Translator implication: there is now two-system evidence that causal value layers recur, while the source semantics remain different.

Bridge-RPG implication: inspectable causes remain attractive for training, origin, augmentation, age, injury, and corruption.

Confidence: high that causal layers recur; medium on universal representation.

Follow-up: compare with a third structurally different system before promoting a shared contribution contract.

### 2026-09-08 - BRP profession is evidence against universal class

Observation: BRP profession constrains starting professional allocation while personal learning and later capability are not class-bounded.

Translator implication: `class` must remain D&D-owned; profession/social identity, training source, and actual competence may be separate concepts.

Bridge-RPG implication: separating professional history from capability supports retraining, career changes, and lifepaths.

Confidence: high.

### 2026-09-08 - BRP rules profile is native interpretive context

Observation: power level and optional modules can change legal budgets, caps, and other rules without changing the basic character ontology.

Translator implication: retain enough effective source profile to validate/reopen a character rather than inferring it from final numbers.

Bridge-RPG implication: campaign modes and optional modules that shaped a character may need to travel with that character.

Confidence: high for BRP; medium generally.

### 2026-09-08 - Open specialties should not become universal enums

Observation: BRP Firearm, Knowledge, Science, and now Language identities can carry source-meaningful open specialties.

Translator implication: preserve parent and source specialty identity without assuming a fixed global catalog.

Bridge-RPG implication: controlled open specialization may be useful but remains a design hypothesis.

Confidence: high for BRP-native retention; medium for shared design.

### 2026-09-08 - BRP independently confirms generation-method convergence

Observation: explicit and deterministic standard-rolled BRP characteristics converge on the same `brp-character/0.1` play-state pipeline while retaining method-specific dice/seed/redistribution provenance.

Translator implication: two systems now support the principle that generation method normally belongs in provenance rather than universal character type.

Bridge-RPG implication: manual, random, purchased, and guided creation can share one runtime schema if rules-relevant construction evidence survives.

Confidence: high across D&D and BRP.

### 2026-09-08 - BRP Heroic confirms profile-dependent legality

Observation: the same BRP state shape can be legal under Heroic and illegal under Normal because professional budgets and starting caps differ.

Translator implication: rules-profile metadata can be operational validation context, not display decoration.

Bridge-RPG implication: retain the effective profile that shaped a character when campaign modes materially affect legality.

Confidence: high for BRP; medium generally.

### 2026-09-08 - Character-specific history can be required beside campaign profile

Observation: Heroic age bonuses depend on retained starting age as well as current age.

Translator implication: current values and campaign profile may be insufficient to explain construction legality; historical character-specific provenance can matter.

Bridge-RPG implication: lifepath, aging, augmentation, training-time, and similar history may need durable causal records.

Confidence: high for BRP; medium generally.

### 2026-09-08 - BRP professions can own different choice grammars

Observation: Detective uses required skills plus bounded electives; Scholar uses fixed skills plus open Knowledge/Science specialties. Both converge on one BRP runtime ontology.

Translator implication: profession/career labels do not imply one universal menu grammar.

Bridge-RPG implication: heterogeneous profession/lifepath templates can converge on one runtime capability model.

Confidence: high for BRP; medium cross-system.

Follow-up: compare with playbook and lifepath systems before promoting a shared profession-choice contract.

### 2026-09-08 - Open skill identity can require parent, variant, and specialty

Observation: Scholar first exposed that parent skill alone is insufficient. Multiple Knowledge/Science specialties coexist, and Language (Own) versus Language (Other) has different source semantics even before a named language is considered.

Translator implication: preserve enough source identity to distinguish parent family, source role/variant, and open specialty when those dimensions affect meaning.

Bridge-RPG implication: stable identity should be separable from display label and from source-role semantics.

Confidence: high for BRP-native retention; medium for universal representation.

### 2026-09-08 - Named language proves role and subject identity are orthogonal

Observation: closing Scholar language identity required retaining both the actual language (`{ id, label }`) and its source role (`own` or `other`). Neither dimension alone is sufficient. English-as-Own and Latin-as-Other have different source bases in the current profile, while additional personal Other languages can coexist without becoming Scholar professional choices. All of this still fits `brp-character/0.1`.

Translator implication: a translator must not collapse "what capability is this?" and "what source role does it occupy?" into one universal enum when either dimension affects source rules. Named language identity should survive long enough to distinguish subject identity from native/learned role, but another system need not use the same role labels.

Bridge-RPG implication: some capabilities benefit from orthogonal identity dimensions: subject/domain plus source/role. That pattern may apply to languages, weapons, schools, disciplines, augmentations, and other open taxonomies.

Confidence: high for BRP-native modeling; medium as a cross-system design principle.

Follow-up: do not promote a shared Character Forge language schema from BRP alone. Use the first BRP UI and a third system to see whether subject-versus-role identity recurs before standardizing it.
