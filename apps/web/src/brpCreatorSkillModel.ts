import {
  BRP_ATHLETE_FIXED_SKILL_KEYS,
  BRP_BEGGAR_SKILL_KEYS,
  BRP_DETECTIVE_REQUIRED_SKILL_KEYS,
  BRP_FIRST_SLICE_SKILL_CATALOG,
  BRP_SCHOLAR_FIXED_SKILL_KEYS,
  generateBrpStandardRolledCharacteristics,
  resolveBrpAllocationSkillDefinition,
  resolveBrpAthleteProfession,
  resolveBrpBeggarProfession,
  resolveBrpCustomProfession,
  resolveBrpDetectiveProfession,
  resolveBrpScholarProfession,
  type BrpAcademicSkillSelection,
  type BrpCharacteristicValues,
  type BrpFirstSliceSkillKey,
  type BrpLanguageSkillSelection,
  type BrpSkillAllocationInput,
} from "../../../packages/system-brp/src/index.js";
import {
  cloneAcademic,
  type BrpCreatorAllocationState,
  type BrpCreatorState,
} from "./brpCreatorStateModel.js";

export type BrpAllocationIdentity =
  | { skillKey: BrpFirstSliceSkillKey }
  | { skill: BrpAcademicSkillSelection }
  | { language: BrpLanguageSkillSelection };

export function resolvedCharacteristics(state: BrpCreatorState): BrpCharacteristicValues {
  if (state.characteristicMethod === "explicit") return { ...state.characteristics };
  return generateBrpStandardRolledCharacteristics(state.rollSeed, state.redistribution).final;
}

export function professionalSkillInputs(
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

export function personalSkillInputs(
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

export function dedupeAllocationIdentities(
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

export function resolveIdentity(identity: BrpAllocationIdentity, characteristics: BrpCharacteristicValues) {
  return resolveBrpAllocationSkillDefinition(allocationWithPoints(identity, 1), characteristics);
}

export function withPoints(
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

export function allocationWithPoints(identity: BrpAllocationIdentity, points: number): BrpSkillAllocationInput {
  if ("skillKey" in identity) return { skillKey: identity.skillKey, points };
  if ("language" in identity) {
    return {
      language: { role: identity.language.role, language: { ...identity.language.language } },
      points,
    };
  }
  return { skill: cloneAcademic(identity.skill), points };
}
