import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  applyBrpCampaignProfileContext,
  buildBrpFirstSliceCharacter,
  buildBrpPlayerCoreProfessionCharacter,
  buildBrpStandardRolledFirstSliceCharacter,
  buildBrpStandardRolledPlayerCoreProfessionCharacter,
  type BrpRulesProfile,
} from "../../../packages/system-brp/src/index.js";
import { cloneAcademic, type BrpCreatorState } from "./brpCreatorStateModel.js";
import {
  personalSkillInputs,
  professionalSkillInputs,
  resolvedCharacteristics,
  withPoints,
} from "./brpCreatorSkillModel.js";

export function buildBrpCreatorCharacter(state: BrpCreatorState): CharacterDocument {
  const characteristics = resolvedCharacteristics(state);
  const professionalInputs = professionalSkillInputs(state, characteristics);
  const personalInputs = personalSkillInputs(state, characteristics);
  const professionalAllocations = withPoints(professionalInputs, state, "professionalPoints", characteristics);
  const personalAllocations = withPoints(personalInputs, state, "personalPoints", characteristics);
  const common = {
    characterId: state.characterId,
    nativeStateId: state.nativeStateId,
    displayName: state.displayName,
    age: state.age,
    gender: state.gender,
    wealth: state.wealth,
    powerLevel: state.powerLevel,
    ...(state.powerLevel === "heroic" ? { defaultStartingAge: state.defaultStartingAge } : {}),
    professionalAllocations,
    personalAllocations,
  };
  const finalize = (character: CharacterDocument): CharacterDocument => applyBrpCampaignProfileContext(
    character,
    effectiveRulesProfile(state),
    state.campaignProfile ? { ...state.campaignProfile } : null,
  );

  if (state.professionId === "scholar") {
    const profession = {
      ...common,
      professionId: "scholar" as const,
      scholarOwnLanguage: { ...state.scholarOwnLanguage },
      scholarOtherLanguage: { ...state.scholarOtherLanguage },
      scholarAcademicSkills: state.scholarAcademicSkills.map(cloneAcademic),
    };
    return finalize(state.characteristicMethod === "explicit"
      ? buildBrpFirstSliceCharacter({ ...profession, characteristics: { ...state.characteristics } })
      : buildBrpStandardRolledFirstSliceCharacter({
          ...profession,
          seed: state.rollSeed,
          redistribution: state.redistribution.map((transfer) => ({ ...transfer })),
        }));
  }

  if (state.professionId === "athlete") {
    const profession = {
      ...common,
      professionId: "athlete" as const,
      athleteElectiveSkillKeys: [...state.athleteElectives],
    };
    return finalize(state.characteristicMethod === "explicit"
      ? buildBrpPlayerCoreProfessionCharacter({ ...profession, characteristics: { ...state.characteristics } })
      : buildBrpStandardRolledPlayerCoreProfessionCharacter({
          ...profession,
          seed: state.rollSeed,
          redistribution: state.redistribution.map((transfer) => ({ ...transfer })),
        }));
  }

  if (state.professionId === "beggar") {
    const profession = { ...common, professionId: "beggar" as const };
    return finalize(state.characteristicMethod === "explicit"
      ? buildBrpPlayerCoreProfessionCharacter({ ...profession, characteristics: { ...state.characteristics } })
      : buildBrpStandardRolledPlayerCoreProfessionCharacter({
          ...profession,
          seed: state.rollSeed,
          redistribution: state.redistribution.map((transfer) => ({ ...transfer })),
        }));
  }

  if (state.professionId === "custom") {
    const profession = {
      ...common,
      professionId: "custom" as const,
      customProfessionTitle: state.customProfessionTitle,
      customProfessionDescription: state.customProfessionDescription,
      customProfessionalSkillKeys: [...state.customProfessionalSkillKeys],
    };
    return finalize(state.characteristicMethod === "explicit"
      ? buildBrpPlayerCoreProfessionCharacter({ ...profession, characteristics: { ...state.characteristics } })
      : buildBrpStandardRolledPlayerCoreProfessionCharacter({
          ...profession,
          seed: state.rollSeed,
          redistribution: state.redistribution.map((transfer) => ({ ...transfer })),
        }));
  }

  const profession = {
    ...common,
    professionId: "detective" as const,
    detectiveElectiveSkillKeys: [...state.detectiveElectives],
  };
  return finalize(state.characteristicMethod === "explicit"
    ? buildBrpFirstSliceCharacter({ ...profession, characteristics: { ...state.characteristics } })
    : buildBrpStandardRolledFirstSliceCharacter({
        ...profession,
        seed: state.rollSeed,
        redistribution: state.redistribution.map((transfer) => ({ ...transfer })),
      }));
}

function effectiveRulesProfile(state: BrpCreatorState): BrpRulesProfile {
  return {
    powerLevel: state.powerLevel,
    characteristicGeneration: state.characteristicMethod,
    enabledOptions: [...state.enabledOptions],
    enabledPowerSystems: [...state.enabledPowerSystems],
  };
}
