import type { CharacterLifecycleSnapshot, CharacterLifecycleStore } from "../../character-model/src/index.js";
import { applyBrpSkillExperience, type BrpSkillAdvancementInput } from "./skillAdvancement.js";

export interface BrpHostedAdvancementResult {
  snapshot: CharacterLifecycleSnapshot;
  succeeded: boolean;
  increase: number;
}

/**
 * This is a transaction consumer, not a user-role authorization implementation.
 * The host must establish GM authority from its trusted session before saving.
 */
export async function advanceBrpHostedSkill(
  store: CharacterLifecycleStore,
  characterId: string,
  input: BrpSkillAdvancementInput,
  verifyGmAuthorization: (characterId: string) => Promise<boolean>,
): Promise<BrpHostedAdvancementResult> {
  if (!await verifyGmAuthorization(characterId)) throw new Error("GM authorization is required for BRP advancement.");
  const current = await store.load(characterId);
  if (!current) throw new Error("Character not found.");
  const candidate = applyBrpSkillExperience(current.document, current.lifecycle, input);
  const snapshot = await store.compareAndSwap(characterId, current.revision, {
    document: candidate.document, lifecycle: candidate.lifecycle,
  });
  return { snapshot, succeeded: candidate.succeeded, increase: candidate.increase };
}
