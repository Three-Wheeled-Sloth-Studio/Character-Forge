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

### Strongest current second candidate: Call of Cthulhu

Reason: It creates useful pressure away from class/level/d20 assumptions through percentile skills, Sanity, Luck, occupation-driven identity, horror-oriented state, and different advancement expectations.

Open question: After the D&D vertical slice, compare Call of Cthulhu against at least one more structurally different candidate before locking system two. Candidates worth comparing include Fate, Traveller, and GURPS depending on which D&D assumptions most need breaking.

### Pathfinder

Current direction: Likely system three or four rather than system two. It is strategically important but too close to D&D to be the first serious stress test of the universal semantic layer.

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

Follow-up: Call of Cthulhu or another second system should be used to pressure-test health, injury, and recovery semantics before any shared harm schema is promoted.
