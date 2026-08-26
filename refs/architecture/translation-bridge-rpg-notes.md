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

No implementation-derived semantic entries yet. The first entries should come from the D&D 5E 2024 Level 1 vertical slice rather than from speculative taxonomy work.
