import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  BRP_ATHLETE_ELECTIVE_SKILL_KEYS,
  BRP_CHARACTERISTIC_IDS,
  BRP_DETECTIVE_ELECTIVE_SKILL_KEYS,
  brpSkillIdentityKey,
  brpUge105Adapter,
  readBrpCampaignProfileReference,
  type BrpCharacteristicValues,
  type BrpNativeCharacter,
} from "../../../packages/system-brp/src/index.js";
import {
  cloneAcademic,
  defaultAcademicSkills,
  defaultCustomProfessionalSkills,
  isAthleteElective,
  isDetectiveElective,
  isFirstSliceSkillKey,
  type BrpCreatorAllocationState,
  type BrpCreatorState,
} from "./brpCreatorStateModel.js";

export function reopenBrpCreatorState(character: CharacterDocument): BrpCreatorState {
  const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId);
  if (!nativeState || nativeState.systemId !== brpUge105Adapter.systemId || nativeState.editionId !== brpUge105Adapter.editionId) {
    throw new Error("Character document does not contain a supported BRP UGE primary native state.");
  }
  const validation = brpUge105Adapter.validateNativeState(nativeState);
  if (!validation.valid) {
    throw new Error(validation.issues.map((issue) => issue.message).join(" ") || "BRP native state validation failed.");
  }

  const payload = nativeState.payload as BrpNativeCharacter;
  const profession = payload.identity.profession;
  const allocations: Record<string, BrpCreatorAllocationState> = {};
  for (const skill of payload.skills) {
    allocations[brpSkillIdentityKey(skill.skillId, skill.specialty)] = {
      professionalPoints: skill.contributions.professional,
      personalPoints: skill.contributions.personal,
    };
  }
  const generationState = payload.characteristicGenerationState;
  const characteristics = Object.fromEntries(
    BRP_CHARACTERISTIC_IDS.map((id) => [id, payload.characteristics[id].final]),
  ) as unknown as BrpCharacteristicValues;

  return {
    characterId: character.characterId,
    nativeStateId: nativeState.id,
    displayName: character.displayName,
    campaignProfile: readBrpCampaignProfileReference(character),
    enabledOptions: [...payload.rulesProfile.enabledOptions],
    enabledPowerSystems: [...payload.rulesProfile.enabledPowerSystems],
    age: payload.identity.age,
    gender: payload.identity.gender,
    wealth: profession.wealth,
    powerLevel: payload.rulesProfile.powerLevel,
    defaultStartingAge: payload.identity.ageBasis?.defaultStartingAge ?? 18,
    professionId: profession.professionId,
    characteristicMethod: payload.rulesProfile.characteristicGeneration,
    characteristics,
    rollSeed: generationState.method === "standard-rolled" ? generationState.seed : "brp-creator",
    redistribution: generationState.method === "standard-rolled"
      ? generationState.redistribution.map((transfer) => ({ ...transfer }))
      : [],
    detectiveElectives: profession.professionId === "detective"
      ? profession.selectedElectiveSkillIds.filter(isDetectiveElective)
      : [...BRP_DETECTIVE_ELECTIVE_SKILL_KEYS.slice(0, 4)],
    athleteElectives: profession.professionId === "athlete"
      ? profession.selectedElectiveSkillIds.filter(isAthleteElective)
      : [...BRP_ATHLETE_ELECTIVE_SKILL_KEYS.slice(0, 5)],
    customProfessionTitle: profession.professionId === "custom"
      ? profession.title
      : "Custom Profession",
    customProfessionDescription: profession.professionId === "custom"
      ? profession.description
      : "A player-defined profession using ten source-supported BRP skills.",
    customProfessionalSkillKeys: profession.professionId === "custom"
      ? profession.selectedProfessionalSkillIds.filter(isFirstSliceSkillKey)
      : defaultCustomProfessionalSkills(),
    scholarOwnLanguage: profession.professionId === "scholar"
      ? { ...profession.ownLanguage }
      : { id: "language-1", label: "Language 1" },
    scholarOtherLanguage: profession.professionId === "scholar"
      ? { ...profession.otherLanguage }
      : { id: "language-2", label: "Language 2" },
    scholarAcademicSkills: profession.professionId === "scholar"
      ? profession.selectedAcademicSkills.map(cloneAcademic)
      : defaultAcademicSkills(),
    allocations,
  };
}
