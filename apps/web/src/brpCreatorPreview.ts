import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  brpUge105Adapter,
  calculateBrpPersonalSkillPoints,
  resolveBrpPowerLevelProfile,
} from "../../../packages/system-brp/src/index.js";
import { buildBrpCreatorCharacter } from "./brpCreatorBuild.js";
import {
  zeroAllocation,
  type BrpCreatorAllocationState,
  type BrpCreatorPreview,
  type BrpCreatorState,
} from "./brpCreatorStateModel.js";
import {
  dedupeAllocationIdentities,
  personalSkillInputs,
  professionalSkillInputs,
  resolveIdentity,
  resolvedCharacteristics,
} from "./brpCreatorSkillModel.js";

export function previewBrpCreatorState(state: BrpCreatorState): BrpCreatorPreview {
  try {
    const characteristics = resolvedCharacteristics(state);
    const profile = resolveBrpPowerLevelProfile(
      state.powerLevel,
      state.age,
      state.powerLevel === "heroic" ? state.defaultStartingAge : undefined,
    );
    const professionalInputs = professionalSkillInputs(state, characteristics);
    const professionalKeys = new Set(
      professionalInputs.map((input) => resolveIdentity(input, characteristics).key),
    );
    const skillInputs = dedupeAllocationIdentities(
      [...professionalInputs, ...personalSkillInputs(state, characteristics)],
      characteristics,
    );
    const skillRows = skillInputs.map((allocation) => {
      const definition = resolveIdentity(allocation, characteristics);
      const saved = state.allocations[definition.key] ?? zeroAllocation();
      const finalRating = definition.baseChance + saved.professionalPoints + saved.personalPoints;
      return {
        key: definition.key,
        label: definition.label,
        baseChance: definition.baseChance,
        professionalPoints: saved.professionalPoints,
        personalPoints: saved.personalPoints,
        finalRating,
        overCap: finalRating > profile.startingSkillCap,
        professionalEligible: professionalKeys.has(definition.key),
      };
    });
    const professionalSpent = sum(skillRows.map((row) => row.professionalPoints));
    const personalSpent = sum(skillRows.map((row) => row.personalPoints));
    const personalBudget = calculateBrpPersonalSkillPoints(characteristics.INT);

    let validCharacter: CharacterDocument | null = null;
    let validationMessage = "Allocate the exact professional and personal budgets without exceeding the starting cap.";
    try {
      const candidate = buildBrpCreatorCharacter(state);
      const nativeState = candidate.nativeStates.find((entry) => entry.id === candidate.primaryNativeStateId);
      const validation = nativeState ? brpUge105Adapter.validateNativeState(nativeState) : null;
      if (validation?.valid) {
        validCharacter = candidate;
        validationMessage = "BRP native state is valid and ready to generate.";
      } else if (validation) {
        validationMessage = validation.issues.map((issue) => issue.message).join(" ") || "BRP native state validation failed.";
      }
    } catch (caught) {
      validationMessage = errorMessage(caught);
    }

    return {
      characteristics,
      professionalBudget: profile.professionalSkillPoints,
      professionalSpent,
      professionalRemaining: profile.professionalSkillPoints - professionalSpent,
      personalBudget,
      personalSpent,
      personalRemaining: personalBudget - personalSpent,
      startingSkillCap: profile.startingSkillCap,
      skillRows,
      validCharacter,
      validationMessage,
    };
  } catch (caught) {
    return {
      characteristics: { ...state.characteristics },
      professionalBudget: 0,
      professionalSpent: 0,
      professionalRemaining: 0,
      personalBudget: 0,
      personalSpent: 0,
      personalRemaining: 0,
      startingSkillCap: 0,
      skillRows: [],
      validCharacter: null,
      validationMessage: errorMessage(caught),
    };
  }
}

export function autoAllocateBrpCreatorState(state: BrpCreatorState): BrpCreatorState {
  const characteristics = resolvedCharacteristics(state);
  const profile = resolveBrpPowerLevelProfile(
    state.powerLevel,
    state.age,
    state.powerLevel === "heroic" ? state.defaultStartingAge : undefined,
  );
  const professionalInputs = professionalSkillInputs(state, characteristics);
  const personalInputs = personalSkillInputs(state, characteristics);
  const allocations: Record<string, BrpCreatorAllocationState> = {};
  let professionalRemaining = profile.professionalSkillPoints;
  let personalRemaining = calculateBrpPersonalSkillPoints(characteristics.INT);

  for (const input of professionalInputs) {
    const definition = resolveIdentity(input, characteristics);
    const professionalPoints = Math.min(professionalRemaining, profile.startingSkillCap - definition.baseChance);
    allocations[definition.key] = { professionalPoints, personalPoints: 0 };
    professionalRemaining -= professionalPoints;
  }
  if (professionalRemaining !== 0) {
    throw new Error("Current BRP profession does not have enough legal starting-cap room for the professional budget.");
  }

  for (const input of personalInputs) {
    const definition = resolveIdentity(input, characteristics);
    const current = allocations[definition.key] ?? zeroAllocation();
    const personalPoints = Math.min(
      personalRemaining,
      profile.startingSkillCap - definition.baseChance - current.professionalPoints,
    );
    allocations[definition.key] = { ...current, personalPoints };
    personalRemaining -= personalPoints;
  }
  if (personalRemaining !== 0) {
    throw new Error("Current BRP skill surface does not have enough legal starting-cap room for the personal budget.");
  }

  return { ...state, allocations };
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function errorMessage(caught: unknown): string {
  return caught instanceof Error ? caught.message : "BRP creator validation failed.";
}
