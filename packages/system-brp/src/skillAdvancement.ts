import { appendLifecycleEvent, type CharacterDocument, type CharacterLifecycle } from "../../character-model/src/index.js";
import { brpUge105Adapter } from "./finishingAdapter.js";
import type { BrpNativeCharacter, BrpSkillExperienceCheck } from "./nativeCharacter.js";

export interface BrpSkillAdvancementInput {
  skillId: string;
  specialtyId: string | null;
  adventureId: string;
  experienceEventId: string;
  revisionEventId: string;
  resultingNativeStateId: string;
  occurredAt: string;
  significantUseDescription: string;
  gmApproved: true;
  percentileRoll: number;
  improvement: { method: "fixed-3" } | { method: "roll-1d6"; die: number };
}

export interface BrpSkillAdvancementResult {
  document: CharacterDocument;
  lifecycle: CharacterLifecycle;
  succeeded: boolean;
  increase: number;
}

/** A source-owned, externally supplied roll proof; no hidden reroll or XP inflation. */
export function applyBrpSkillExperience(
  document: CharacterDocument,
  lifecycle: CharacterLifecycle,
  input: BrpSkillAdvancementInput,
): BrpSkillAdvancementResult {
  if (document.characterId !== lifecycle.characterId) throw new Error("Lifecycle and character identity mismatch.");
  if (!input.gmApproved || !input.significantUseDescription.trim()) throw new Error("A GM-approved meaningful use is required.");
  if (!input.adventureId.trim() || !input.skillId.trim() || !input.resultingNativeStateId.trim()) throw new Error("Advancement requires skill, adventure and revision IDs.");
  if (!Number.isInteger(input.percentileRoll) || input.percentileRoll < 1 || input.percentileRoll > 100) throw new Error("Experience roll must be 1-100.");
  if (input.improvement.method === "roll-1d6" && (!Number.isInteger(input.improvement.die) || input.improvement.die < 1 || input.improvement.die > 6)) throw new Error("Improvement roll must be 1-6.");
  if (document.nativeStates.some((state) => state.id === input.resultingNativeStateId)) throw new Error("Resulting native state ID must be new.");
  const native = document.nativeStates.find((state) => state.id === document.primaryNativeStateId);
  if (!native || native.systemId !== "brp" || !brpUge105Adapter.validateNativeState(native).valid) throw new Error("A valid BRP native state is required.");
  const payload = structuredClone(native.payload) as BrpNativeCharacter;
  const skill = payload.skills.find((entry) => entry.skillId === input.skillId && (entry.specialty?.id ?? null) === input.specialtyId);
  if (!skill) throw new Error("Selected skill or specialty is not present in the native character.");
  if (skill.experienceChecks?.some((entry) => entry.adventureId === input.adventureId)) throw new Error("Only one experience check per skill and adventure is allowed.");

  const succeeded = skill.finalRating >= 100
    ? input.percentileRoll + payload.derived.experienceBonus >= 100
    : input.percentileRoll + payload.derived.experienceBonus > skill.finalRating;
  const increase = succeeded ? input.improvement.method === "fixed-3" ? 3 : input.improvement.die : 0;
  const check: BrpSkillExperienceCheck = {
    eventId: input.experienceEventId, adventureId: input.adventureId,
    ratingBefore: skill.finalRating, percentileRoll: input.percentileRoll,
    improvementMethod: succeeded ? input.improvement.method : "none", increase,
  };
  skill.experienceChecks = [...(skill.experienceChecks ?? []), check];
  skill.finalRating += increase;
  const revised = { ...structuredClone(native), id: input.resultingNativeStateId, payload };
  const result = brpUge105Adapter.validateNativeState(revised);
  if (!result.valid) throw new Error(`BRP advancement rejected: ${result.issues.map((issue) => issue.message).join("; ")}`);

  let updatedLifecycle = appendLifecycleEvent(lifecycle, {
    eventId: input.experienceEventId, type: "experience-recorded", occurredAt: input.occurredAt,
    sourceNativeStateId: native.id, category: "practice", description: input.significantUseDescription,
  });
  updatedLifecycle = appendLifecycleEvent(updatedLifecycle, {
    eventId: input.revisionEventId, type: "experience-revision-linked", occurredAt: input.occurredAt,
    experienceEventId: input.experienceEventId, sourceNativeStateId: native.id,
    resultingNativeStateId: revised.id, systemAdapterId: brpUge105Adapter.adapterId,
  });
  return {
    document: { ...document, nativeStates: [...document.nativeStates, revised], primaryNativeStateId: revised.id },
    lifecycle: updatedLifecycle, succeeded, increase,
  };
}
