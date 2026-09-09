import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import {
  BRP_CHARACTERISTIC_IDS,
  BRP_DETECTIVE_ELECTIVE_SKILL_KEYS,
  BRP_DETECTIVE_REQUIRED_SKILL_KEYS,
  BRP_SCHOLAR_FIXED_SKILL_KEYS,
  brpSkillIdentityKey,
  brpUge105Adapter,
  buildBrpFirstSliceCharacter,
  buildBrpStandardRolledFirstSliceCharacter,
  calculateBrpPersonalSkillPoints,
  generateBrpStandardRolledCharacteristics,
  resolveBrpAllocationSkillDefinition,
  resolveBrpDetectiveProfession,
  resolveBrpPowerLevelProfile,
  resolveBrpScholarProfession,
  type BrpAcademicSkillSelection,
  type BrpCharacteristicId,
  type BrpCharacteristicRedistributionInput,
  type BrpCharacteristicValues,
  type BrpDetectiveElectiveSkillKey,
  type BrpFirstSliceSkillKey,
  type BrpLanguageIdentity,
  type BrpLanguageSkillSelection,
  type BrpNativeCharacter,
  type BrpPowerLevel,
  type BrpSkillAllocationInput,
  type BrpWealthLevel,
} from "../../../packages/system-brp/src/index.js";

export type BrpCreatorProfessionId = "detective" | "scholar";
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
  return {
    characterId: createId("character"),
    nativeStateId: createId("native-brp"),
    displayName: "New BRP Character",
    age: 18,
    gender: "Unspecified",
    wealth: "average",
    powerLevel: "normal",
    defaultStartingAge: 18,
    professionId: "detective",
    characteristicMethod: "explicit",
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
    scholarOwnLanguage: { id: "language-1", label: "Language 1" },
    scholarOtherLanguage: { id: "language-2", label: "Language 2" },
    scholarAcademicSkills: defaultAcademicSkills(),
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
    const skillInputs = professionalSkillInputs(state, characteristics);
    const skillRows = skillInputs.map((allocation) => {
      const definition = resolveBrpAllocationSkillDefinition(allocationWithPoints(allocation, 1), characteristics);
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
  const skillInputs = professionalSkillInputs(state, characteristics);
  const professionalAllocations = withPoints(skillInputs, state, "professionalPoints", characteristics);
  const personalAllocations = withPoints(skillInputs, state, "personalPoints", characteristics);
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

  if (state.professionId === "scholar") {
    const profession = {
      ...common,
      professionId: "scholar" as const,
      scholarOwnLanguage: { ...state.scholarOwnLanguage },
      scholarOtherLanguage: { ...state.scholarOtherLanguage },
      scholarAcademicSkills: state.scholarAcademicSkills.map(cloneAcademic),
    };
    return state.characteristicMethod === "explicit"
      ? buildBrpFirstSliceCharacter({ ...profession, characteristics: { ...state.characteristics } })
      : buildBrpStandardRolledFirstSliceCharacter({
          ...profession,
          seed: state.rollSeed,
          redistribution: state.redistribution.map((transfer) => ({ ...transfer })),
        });
  }

  const profession = {
    ...common,
    professionId: "detective" as const,
    detectiveElectiveSkillKeys: [...state.detectiveElectives],
  };
  return state.characteristicMethod === "explicit"
    ? buildBrpFirstSliceCharacter({ ...profession, characteristics: { ...state.characteristics } })
    : buildBrpStandardRolledFirstSliceCharacter({
        ...profession,
        seed: state.rollSeed,
        redistribution: state.redistribution.map((transfer) => ({ ...transfer })),
      });
}

export function autoAllocateBrpCreatorState(state: BrpCreatorState): BrpCreatorState {
  const characteristics = resolvedCharacteristics(state);
  const profile = resolveBrpPowerLevelProfile(
    state.powerLevel,
    state.age,
    state.powerLevel === "heroic" ? state.defaultStartingAge : undefined,
  );
  const inputs = professionalSkillInputs(state, characteristics);
  const allocations: Record<string, BrpCreatorAllocationState> = {};
  let professionalRemaining = profile.professionalSkillPoints;
  let personalRemaining = calculateBrpPersonalSkillPoints(characteristics.INT);

  for (const input of inputs) {
    const definition = resolveBrpAllocationSkillDefinition(allocationWithPoints(input, 1), characteristics);
    const professionalPoints = Math.min(professionalRemaining, profile.startingSkillCap - definition.baseChance);
    allocations[definition.key] = { professionalPoints, personalPoints: 0 };
    professionalRemaining -= professionalPoints;
  }
  if (professionalRemaining !== 0) {
    throw new Error("Current BRP profession does not have enough legal starting-cap room for the professional budget.");
  }

  for (const input of inputs) {
    const definition = resolveBrpAllocationSkillDefinition(allocationWithPoints(input, 1), characteristics);
    const current = allocations[definition.key] ?? zeroAllocation();
    const personalPoints = Math.min(
      personalRemaining,
      profile.startingSkillCap - definition.baseChance - current.professionalPoints,
    );
    allocations[definition.key] = { ...current, personalPoints };
    personalRemaining -= personalPoints;
  }
  if (personalRemaining !== 0) {
    throw new Error("Current BRP profession does not have enough legal starting-cap room for the personal budget.");
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

function withPoints(
  inputs: BrpAllocationIdentity[],
  state: BrpCreatorState,
  source: keyof BrpCreatorAllocationState,
  characteristics: BrpCharacteristicValues,
): BrpSkillAllocationInput[] {
  const result: BrpSkillAllocationInput[] = [];
  for (const input of inputs) {
    const definition = resolveBrpAllocationSkillDefinition(allocationWithPoints(input, 1), characteristics);
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

function zeroAllocation(): BrpCreatorAllocationState {
  return { professionalPoints: 0, personalPoints: 0 };
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function errorMessage(caught: unknown): string {
  return caught instanceof Error ? caught.message : "BRP creator validation failed.";
}
