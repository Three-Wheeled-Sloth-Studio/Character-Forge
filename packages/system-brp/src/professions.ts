import type {
  BrpAcademicSkillSelection,
  BrpCharacteristicValues,
  BrpLanguageIdentity,
  BrpProfessionId,
  BrpProfessionState,
  BrpWealthLevel,
} from "./nativeCharacter.js";
import {
  BRP_FIRST_SLICE_SKILL_CATALOG,
  brpSkillIdentityKey,
  normalizeBrpAcademicSkillSelection,
  normalizeBrpLanguageSkillSelection,
  resolveBrpAcademicSkillDefinition,
  resolveBrpLanguageSkillDefinition,
  resolveBrpStaticSkillDefinition,
  type BrpFirstSliceSkillKey,
  type BrpResolvedSkillDefinition,
} from "./skills.js";

export const BRP_ALL_WEALTH_LEVELS = [
  "destitute",
  "poor",
  "average",
  "affluent",
  "wealthy",
] as const satisfies readonly BrpWealthLevel[];

export const BRP_DETECTIVE_REQUIRED_SKILL_KEYS = [
  "firearm:handgun",
  "knowledge:law",
  "listen",
  "persuade",
  "spot",
  "research",
] as const satisfies readonly BrpFirstSliceSkillKey[];

export const BRP_DETECTIVE_ELECTIVE_SKILL_KEYS = [
  "brawl",
  "disguise",
  "dodge",
  "fast-talk",
  "grapple",
  "hide",
  "insight",
  "medicine",
  "science:forensics",
  "stealth",
  "technical:computer-use",
  "track",
] as const satisfies readonly BrpFirstSliceSkillKey[];

export type BrpDetectiveElectiveSkillKey = (typeof BRP_DETECTIVE_ELECTIVE_SKILL_KEYS)[number];

export const BRP_SCHOLAR_FIXED_SKILL_KEYS = [
  "persuade",
  "research",
  "teach",
] as const satisfies readonly BrpFirstSliceSkillKey[];

export const BRP_ATHLETE_FIXED_SKILL_KEYS = [
  "climb",
  "dodge",
  "jump",
  "stealth",
  "throw",
] as const satisfies readonly BrpFirstSliceSkillKey[];

export const BRP_ATHLETE_ELECTIVE_SKILL_KEYS = [
  "brawl",
  "first-aid",
  "grapple",
  "insight",
  "listen",
  "spot",
  "swim",
] as const satisfies readonly BrpFirstSliceSkillKey[];

export type BrpAthleteElectiveSkillKey = (typeof BRP_ATHLETE_ELECTIVE_SKILL_KEYS)[number];

export const BRP_BEGGAR_SKILL_KEYS = [
  "bargain",
  "fast-talk",
  "hide",
  "insight",
  "knowledge:region-local",
  "listen",
  "persuade",
  "sleight-of-hand",
  "spot",
  "stealth",
] as const satisfies readonly BrpFirstSliceSkillKey[];

export interface BrpResolvedProfession {
  professionId: BrpProfessionId;
  state: BrpProfessionState;
  allowedProfessionalSkills: Map<string, BrpResolvedSkillDefinition>;
}

export function allowedBrpWealthLevels(professionId: BrpProfessionId): readonly BrpWealthLevel[] {
  if (professionId === "detective" || professionId === "scholar") return ["average", "affluent"];
  if (professionId === "athlete") return ["poor", "average", "affluent", "wealthy"];
  if (professionId === "beggar") return ["destitute", "poor"];
  return BRP_ALL_WEALTH_LEVELS;
}

export function defaultBrpWealthForProfession(professionId: BrpProfessionId): BrpWealthLevel {
  return professionId === "beggar" ? "destitute" : "average";
}

export function resolveBrpDetectiveProfession(
  wealth: BrpWealthLevel,
  electives: readonly BrpDetectiveElectiveSkillKey[],
  characteristics: BrpCharacteristicValues,
): BrpResolvedProfession {
  requireWealth("Detective", wealth, allowedBrpWealthLevels("detective"));
  if (electives.length !== 4 || new Set(electives).size !== 4) {
    throw new Error("Detective must select exactly four unique elective professional skills.");
  }
  const supported = new Set<BrpDetectiveElectiveSkillKey>(BRP_DETECTIVE_ELECTIVE_SKILL_KEYS);
  for (const skillKey of electives) if (!supported.has(skillKey)) throw new Error(`Unsupported Detective elective ${skillKey}.`);
  return resolvedStaticProfession("detective", { professionId: "detective", wealth, selectedElectiveSkillIds: [...electives] }, [...BRP_DETECTIVE_REQUIRED_SKILL_KEYS, ...electives], characteristics);
}

export function resolveBrpScholarProfession(
  wealth: BrpWealthLevel,
  ownLanguage: BrpLanguageIdentity,
  otherLanguage: BrpLanguageIdentity,
  academicSkills: readonly BrpAcademicSkillSelection[],
  characteristics: BrpCharacteristicValues,
): BrpResolvedProfession {
  requireWealth("Scholar", wealth, allowedBrpWealthLevels("scholar"));
  if (academicSkills.length !== 5) throw new Error("Scholar must select exactly five Knowledge or Science specialty skills.");

  const normalizedOwnLanguage = normalizeBrpLanguageSkillSelection({ role: "own", language: ownLanguage });
  const normalizedOtherLanguage = normalizeBrpLanguageSkillSelection({ role: "other", language: otherLanguage });
  if (normalizedOwnLanguage.language.id === normalizedOtherLanguage.language.id) {
    throw new Error("Scholar Own and Other language identities must be different languages.");
  }

  const selectedAcademicSkills = academicSkills.map(normalizeBrpAcademicSkillSelection);
  const seen = new Set<string>();
  for (const selection of selectedAcademicSkills) {
    const key = brpSkillIdentityKey(selection.skillId, selection.specialty);
    if (seen.has(key)) throw new Error("Scholar academic specialty selections must be unique by parent skill and specialty ID.");
    seen.add(key);
  }

  const allowedProfessionalSkills = resolveStaticSkillMap(BRP_SCHOLAR_FIXED_SKILL_KEYS, characteristics);
  for (const languageSelection of [normalizedOwnLanguage, normalizedOtherLanguage]) {
    const definition = resolveBrpLanguageSkillDefinition(languageSelection, characteristics);
    allowedProfessionalSkills.set(definition.key, definition);
  }
  for (const selection of selectedAcademicSkills) {
    const definition = resolveBrpAcademicSkillDefinition(selection);
    allowedProfessionalSkills.set(definition.key, definition);
  }

  return {
    professionId: "scholar",
    state: {
      professionId: "scholar",
      wealth,
      ownLanguage: { ...normalizedOwnLanguage.language },
      otherLanguage: { ...normalizedOtherLanguage.language },
      selectedAcademicSkills: selectedAcademicSkills.map((selection) => ({ skillId: selection.skillId, specialty: { ...selection.specialty } })),
    },
    allowedProfessionalSkills,
  };
}

export function resolveBrpAthleteProfession(
  wealth: BrpWealthLevel,
  electives: readonly BrpAthleteElectiveSkillKey[],
  characteristics: BrpCharacteristicValues,
): BrpResolvedProfession {
  requireWealth("Athlete", wealth, allowedBrpWealthLevels("athlete"));
  if (electives.length !== 5 || new Set(electives).size !== 5) throw new Error("Athlete must select exactly five unique elective professional skills.");
  const supported = new Set<BrpAthleteElectiveSkillKey>(BRP_ATHLETE_ELECTIVE_SKILL_KEYS);
  for (const skillKey of electives) if (!supported.has(skillKey)) throw new Error(`Unsupported Athlete elective ${skillKey}.`);
  return resolvedStaticProfession("athlete", { professionId: "athlete", wealth, selectedElectiveSkillIds: [...electives] }, [...BRP_ATHLETE_FIXED_SKILL_KEYS, ...electives], characteristics);
}

export function resolveBrpBeggarProfession(wealth: BrpWealthLevel, characteristics: BrpCharacteristicValues): BrpResolvedProfession {
  requireWealth("Beggar", wealth, allowedBrpWealthLevels("beggar"));
  return resolvedStaticProfession("beggar", { professionId: "beggar", wealth }, BRP_BEGGAR_SKILL_KEYS, characteristics);
}

export function resolveBrpCustomProfession(
  wealth: BrpWealthLevel,
  title: string,
  description: string,
  skillKeys: readonly BrpFirstSliceSkillKey[],
  characteristics: BrpCharacteristicValues,
): BrpResolvedProfession {
  requireWealth("Custom profession", wealth, BRP_ALL_WEALTH_LEVELS);
  const normalizedTitle = title.trim();
  const normalizedDescription = description.trim();
  if (!normalizedTitle) throw new Error("Custom BRP profession title must be non-empty.");
  if (!normalizedDescription) throw new Error("Custom BRP profession description must be non-empty.");
  if (skillKeys.length !== 10 || new Set(skillKeys).size !== 10) throw new Error("Custom BRP professions must select exactly ten unique professional skills.");
  const supported = new Set(Object.keys(BRP_FIRST_SLICE_SKILL_CATALOG) as BrpFirstSliceSkillKey[]);
  for (const skillKey of skillKeys) if (!supported.has(skillKey)) throw new Error(`Unsupported custom BRP profession skill ${skillKey}.`);
  return resolvedStaticProfession("custom", { professionId: "custom", wealth, title: normalizedTitle, description: normalizedDescription, selectedProfessionalSkillIds: [...skillKeys] }, skillKeys, characteristics);
}

function resolvedStaticProfession(
  professionId: BrpProfessionId,
  state: BrpProfessionState,
  skillKeys: readonly BrpFirstSliceSkillKey[],
  characteristics: BrpCharacteristicValues,
): BrpResolvedProfession {
  return { professionId, state, allowedProfessionalSkills: resolveStaticSkillMap(skillKeys, characteristics) };
}

function resolveStaticSkillMap(skillKeys: readonly BrpFirstSliceSkillKey[], characteristics: BrpCharacteristicValues): Map<string, BrpResolvedSkillDefinition> {
  const result = new Map<string, BrpResolvedSkillDefinition>();
  for (const skillKey of skillKeys) {
    const definition = resolveBrpStaticSkillDefinition(skillKey, characteristics);
    result.set(definition.key, definition);
  }
  return result;
}

function requireWealth(label: string, wealth: BrpWealthLevel, allowed: readonly BrpWealthLevel[]): void {
  if (!allowed.includes(wealth)) throw new Error(`${label} does not support ${wealth} wealth in the current BRP source profile.`);
}
