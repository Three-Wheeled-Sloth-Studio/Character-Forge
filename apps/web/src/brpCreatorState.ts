import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  BRP_ATHLETE_ELECTIVE_SKILL_KEYS,
  BRP_ATHLETE_FIXED_SKILL_KEYS,
  BRP_BEGGAR_SKILL_KEYS,
  BRP_CHARACTERISTIC_IDS,
  BRP_DEFAULT_CAMPAIGN_PROFILE_ID,
  BRP_DETECTIVE_ELECTIVE_SKILL_KEYS,
  BRP_DETECTIVE_REQUIRED_SKILL_KEYS,
  BRP_FIRST_SLICE_SKILL_CATALOG,
  BRP_SCHOLAR_FIXED_SKILL_KEYS,
  applyBrpCampaignProfileContext,
  brpSkillIdentityKey,
  brpUge105Adapter,
  buildBrpFirstSliceCharacter,
  buildBrpPlayerCoreProfessionCharacter,
  buildBrpStandardRolledFirstSliceCharacter,
  buildBrpStandardRolledPlayerCoreProfessionCharacter,
  calculateBrpPersonalSkillPoints,
  generateBrpStandardRolledCharacteristics,
  readBrpCampaignProfileReference,
  resolveBrpAllocationSkillDefinition,
  resolveBrpAthleteProfession,
  resolveBrpBeggarProfession,
  resolveBrpCampaignProfileSelection,
  resolveBrpCustomProfession,
  resolveBrpDetectiveProfession,
  resolveBrpPowerLevelProfile,
  resolveBrpScholarProfession,
  type BrpAcademicSkillSelection,
  type BrpAthleteElectiveSkillKey,
  type BrpCampaignProfileId,
  type BrpCampaignProfileReference,
  type BrpCharacteristicId,
  type BrpCharacteristicRedistributionInput,
  type BrpCharacteristicValues,
  type BrpDetectiveElectiveSkillKey,
  type BrpFirstSliceSkillKey,
  type BrpLanguageIdentity,
  type BrpLanguageSkillSelection,
  type BrpNativeCharacter,
  type BrpPowerLevel,
  type BrpProfessionId,
  type BrpRulesProfile,
  type BrpSkillAllocationInput,
  type BrpWealthLevel,
} from "../../../packages/system-brp/src/index.js";

export type BrpCreatorProfessionId = BrpProfessionId;
export type BrpCreatorCharacteristicMethod = "explicit" | "standard-rolled";

type BrpAllocationIdentity =
  | { skillKey: BrpFirstSliceSkillKey }
  | { skill: BrpAcademicSkillSelection }
  | { language: BrpLanguageSkillSelection };

export interface BrpCreatorAllocationState {
  professionalPoints: number;
  personalPoints: number;
}

export interface BrpCreatorState {
  characterId: string;
  nativeStateId: string;
  displayName: string;
  campaignProfile: BrpCampaignProfileReference | null;
  enabledOptions: string[];
  enabledPowerSystems: string[];
  age: number;
  gender: string;
  wealth: BrpWealthLevel;
  powerLevel: BrpPowerLevel;
  defaultStartingAge: number;
  professionId: BrpCreatorProfessionId;
  characteristicMethod: BrpCreatorCharacteristicMethod;
  characteristics: BrpCharacteristicValues;
  rollSeed: string;
  redistribution: BrpCharacteristicRedistributionInput[];
  detectiveElectives: BrpDetectiveElectiveSkillKey[];
  athleteElectives: BrpAthleteElectiveSkillKey[];
  customProfessionTitle: string;
  customProfessionDescription: string;
  customProfessionalSkillKeys: BrpFirstSliceSkillKey[];
  scholarOwnLanguage: BrpLanguageIdentity;
  scholarOtherLanguage: BrpLanguageIdentity;
  scholarAcademicSkills: BrpAcademicSkillSelection[];
  allocations: Record<string, BrpCreatorAllocationState>;
}

export interface BrpCreatorSkillRow {
  key: string;
  label: string;
  baseChance: number;
  professionalPoints: number;
  personalPoints: number;
  finalRating: number;
  overCap: boolean;
  professionalEligible: boolean;
}

export interface BrpCreatorPreview {
  characteristics: BrpCharacteristicValues;
  professionalBudget: number;
  professionalSpent: number;
  professionalRemaining: number;
  personalBudget: number;
  personalSpent: number;
  personalRemaining: number;
  startingSkillCap: number;
  skillRows: BrpCreatorSkillRow[];
  validCharacter: CharacterDocument | null;
  validationMessage: string;
}

export function createDefaultBrpCreatorState(): BrpCreatorState {
  const profile = resolveBrpCampaignProfileSelection(BRP_DEFAULT_CAMPAIGN_PROFILE_ID);
  return {
    characterId: createId("character"),
    nativeStateId: createId("native-brp"),
    displayName: "New BRP Character",
    campaignProfile: { ...profile.reference },
    enabledOptions: [...profile.rulesProfile.enabledOptions],
    enabledPowerSystems: [...profile.rulesProfile.enabledPowerSystems],
    age: 18,
    gender: "Unspecified",
    wealth: "average",
    powerLevel: profile.rulesProfile.powerLevel,
    defaultStartingAge: 18,
    professionId: "detective",
    characteristicMethod: profile.rulesProfile.characteristicGeneration,
    characteristics: {
      STR: 10,
      CON: 10,
      SIZ: 10,
      INT: 10,
      POW: 10,
      DEX: 10,
      CHA: 10,
    },
    rollSeed: "brp-creator",
    redistribution: [],
    detectiveElectives: [...BRP_DETECTIVE_ELECTIVE_SKILL_KEYS.slice(0, 4)],
    athleteElectives: [...BRP_ATHLETE_ELECTIVE_SKILL_KEYS.slice(0, 5)],
    customProfessionTitle: "Custom Profession",
    customProfessionDescription: "A player-defined profession using ten source-supported BRP skills.",
    customProfessionalSkillKeys: defaultCustomProfessionalSkills(),
    scholarOwnLanguage: { id: "language-1", label: "Language 1" },
    scholarOtherLanguage: { id: "language-2", label: "Language 2" },
    scholarAcademicSkills: defaultAcademicSkills(),
    allocations: {},
  };
}

export function selectBrpCampaignProfile(
  state: BrpCreatorState,
  profileId: BrpCampaignProfileId,
): BrpCreatorState {
  const selection = resolveBrpCampaignProfileSelection(profileId);
  return {
    ...state,
    campaignProfile: { ...selection.reference },
    powerLevel: selection.rulesProfile.powerLevel,
    characteristicMethod: selection.rulesProfile.characteristicGeneration,
    enabledOptions: [...selection.rulesProfile.enabledOptions],
    enabledPowerSystems: [...selection.rulesProfile.enabledPowerSystems],
    redistribution: selection.rulesProfile.characteristicGeneration === "standard-rolled"
      ? state.redistribution.map((transfer) => ({ ...transfer }))
      : [],
    allocations: {},
  };
}

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

export function rerollBrpCreatorState(state: BrpCreatorState): BrpCreatorState {
  const nextSeed = `${state.rollSeed.trim() || "brp-creator"}-${Date.now().toString(36)}`;
  return { ...state, rollSeed: nextSeed, redistribution: [], allocations: {} };
}

function effectiveRulesProfile(state: BrpCreatorState): BrpRulesProfile {
  return {
    powerLevel: state.powerLevel,
    characteristicGeneration: state.characteristicMethod,
    enabledOptions: [...state.enabledOptions],
    enabledPowerSystems: [...state.enabledPowerSystems],
  };
}

function resolvedCharacteristics(state: BrpCreatorState): BrpCharacteristicValues {
  if (state.characteristicMethod === "explicit") return { ...state.characteristics };
  return generateBrpStandardRolledCharacteristics(state.rollSeed, state.redistribution).final;
}

function professionalSkillInputs(
  state: BrpCreatorState,
  characteristics: BrpCharacteristicValues,
): BrpAllocationIdentity[] {
  if (state.professionId === "detective") {
    const profession = resolveBrpDetectiveProfession(state.wealth, state.detectiveElectives, characteristics);
    const keys = [...BRP_DETECTIVE_REQUIRED_SKILL_KEYS, ...state.detectiveElectives];
    if (profession.allowedProfessionalSkills.size !== keys.length) {
      throw new Error("BRP Detective profession skill resolution did not match retained choices.");
    }
    return keys.map((skillKey) => ({ skillKey }));
  }

  if (state.professionId === "athlete") {
    const profession = resolveBrpAthleteProfession(state.wealth, state.athleteElectives, characteristics);
    const keys = [...BRP_ATHLETE_FIXED_SKILL_KEYS, ...state.athleteElectives];
    if (profession.allowedProfessionalSkills.size !== keys.length) {
      throw new Error("BRP Athlete profession skill resolution did not match retained choices.");
    }
    return keys.map((skillKey) => ({ skillKey }));
  }

  if (state.professionId === "beggar") {
    const profession = resolveBrpBeggarProfession(state.wealth, characteristics);
    if (profession.allowedProfessionalSkills.size !== BRP_BEGGAR_SKILL_KEYS.length) {
      throw new Error("BRP Beggar profession skill resolution did not match the source profile.");
    }
    return BRP_BEGGAR_SKILL_KEYS.map((skillKey) => ({ skillKey }));
  }

  if (state.professionId === "custom") {
    const profession = resolveBrpCustomProfession(
      state.wealth,
      state.customProfessionTitle,
      state.customProfessionDescription,
      state.customProfessionalSkillKeys,
      characteristics,
    );
    if (profession.allowedProfessionalSkills.size !== state.customProfessionalSkillKeys.length) {
      throw new Error("Custom BRP profession skill resolution did not match retained choices.");
    }
    return state.customProfessionalSkillKeys.map((skillKey) => ({ skillKey }));
  }

  const profession = resolveBrpScholarProfession(
    state.wealth,
    state.scholarOwnLanguage,
    state.scholarOtherLanguage,
    state.scholarAcademicSkills,
    characteristics,
  );
  const inputs: BrpAllocationIdentity[] = [
    ...BRP_SCHOLAR_FIXED_SKILL_KEYS.map((skillKey) => ({ skillKey })),
    { language: { role: "own", language: { ...state.scholarOwnLanguage } } },
    { language: { role: "other", language: { ...state.scholarOtherLanguage } } },
    ...state.scholarAcademicSkills.map((skill) => ({ skill: cloneAcademic(skill) })),
  ];
  if (profession.allowedProfessionalSkills.size !== inputs.length) {
    throw new Error("BRP Scholar profession skill resolution did not match retained choices.");
  }
  return inputs;
}

function personalSkillInputs(
  state: BrpCreatorState,
  characteristics: BrpCharacteristicValues,
): BrpAllocationIdentity[] {
  const staticInputs = (Object.keys(BRP_FIRST_SLICE_SKILL_CATALOG) as BrpFirstSliceSkillKey[])
    .map((skillKey) => ({ skillKey }) satisfies BrpAllocationIdentity);
  const openProfessionInputs = state.professionId === "scholar"
    ? [
      { language: { role: "own" as const, language: { ...state.scholarOwnLanguage } } },
      { language: { role: "other" as const, language: { ...state.scholarOtherLanguage } } },
      ...state.scholarAcademicSkills.map((skill) => ({ skill: cloneAcademic(skill) })),
    ] satisfies BrpAllocationIdentity[]
    : [];
  return dedupeAllocationIdentities([...staticInputs, ...openProfessionInputs], characteristics);
}

function dedupeAllocationIdentities(
  inputs: BrpAllocationIdentity[],
  characteristics: BrpCharacteristicValues,
): BrpAllocationIdentity[] {
  const seen = new Set<string>();
  const result: BrpAllocationIdentity[] = [];
  for (const input of inputs) {
    const key = resolveIdentity(input, characteristics).key;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(input);
  }
  return result;
}

function resolveIdentity(identity: BrpAllocationIdentity, characteristics: BrpCharacteristicValues) {
  return resolveBrpAllocationSkillDefinition(allocationWithPoints(identity, 1), characteristics);
}

function withPoints(
  inputs: BrpAllocationIdentity[],
  state: BrpCreatorState,
  source: keyof BrpCreatorAllocationState,
  characteristics: BrpCharacteristicValues,
): BrpSkillAllocationInput[] {
  const result: BrpSkillAllocationInput[] = [];
  for (const input of inputs) {
    const definition = resolveIdentity(input, characteristics);
    const points = state.allocations[definition.key]?.[source] ?? 0;
    if (points <= 0) continue;
    result.push(allocationWithPoints(input, points));
  }
  return result;
}

function allocationWithPoints(identity: BrpAllocationIdentity, points: number): BrpSkillAllocationInput {
  if ("skillKey" in identity) return { skillKey: identity.skillKey, points };
  if ("language" in identity) {
    return {
      language: { role: identity.language.role, language: { ...identity.language.language } },
      points,
    };
  }
  return { skill: cloneAcademic(identity.skill), points };
}

function defaultAcademicSkills(): BrpAcademicSkillSelection[] {
  return [
    academic("knowledge", "specialty-1", "Specialty 1"),
    academic("knowledge", "specialty-2", "Specialty 2"),
    academic("knowledge", "specialty-3", "Specialty 3"),
    academic("science", "specialty-4", "Specialty 4"),
    academic("science", "specialty-5", "Specialty 5"),
  ];
}

function defaultCustomProfessionalSkills(): BrpFirstSliceSkillKey[] {
  return [
    "bargain",
    "brawl",
    "climb",
    "dodge",
    "first-aid",
    "insight",
    "listen",
    "persuade",
    "spot",
    "stealth",
  ];
}

function createId(prefix: string): string {
  const randomPart = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomPart}`;
}

function academic(skillId: "knowledge" | "science", id: string, label: string): BrpAcademicSkillSelection {
  return { skillId, specialty: { id, label } };
}

function cloneAcademic(value: BrpAcademicSkillSelection): BrpAcademicSkillSelection {
  return { skillId: value.skillId, specialty: { ...value.specialty } };
}

function isDetectiveElective(value: string): value is BrpDetectiveElectiveSkillKey {
  return (BRP_DETECTIVE_ELECTIVE_SKILL_KEYS as readonly string[]).includes(value);
}

function isAthleteElective(value: string): value is BrpAthleteElectiveSkillKey {
  return (BRP_ATHLETE_ELECTIVE_SKILL_KEYS as readonly string[]).includes(value);
}

function isFirstSliceSkillKey(value: string): value is BrpFirstSliceSkillKey {
  return Object.prototype.hasOwnProperty.call(BRP_FIRST_SLICE_SKILL_CATALOG, value);
}

function zeroAllocation(): BrpCreatorAllocationState {
  return { professionalPoints: 0, personalPoints: 0 };
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function errorMessage(caught: unknown): string {
  return caught instanceof Error ? caught.message : "BRP creator validation failed.";
}
