import type {
  BrpAcademicSkillSelection,
  BrpCharacteristicValues,
  BrpLanguageIdentity,
  BrpProfessionState,
  BrpWealthLevel,
} from "./nativeCharacter.js";
import {
  brpSkillIdentityKey,
  normalizeBrpAcademicSkillSelection,
  normalizeBrpLanguageSkillSelection,
  resolveBrpAcademicSkillDefinition,
  resolveBrpLanguageSkillDefinition,
  resolveBrpStaticSkillDefinition,
  type BrpFirstSliceSkillKey,
  type BrpResolvedSkillDefinition,
} from "./skills.js";

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
  "fast-talk",
  "hide",
  "insight",
  "science:forensics",
  "stealth",
  "track",
] as const satisfies readonly BrpFirstSliceSkillKey[];

export type BrpDetectiveElectiveSkillKey = (typeof BRP_DETECTIVE_ELECTIVE_SKILL_KEYS)[number];

export const BRP_SCHOLAR_FIXED_SKILL_KEYS = [
  "persuade",
  "research",
  "teach",
] as const satisfies readonly BrpFirstSliceSkillKey[];

export interface BrpResolvedProfession {
  professionId: "detective" | "scholar";
  state: BrpProfessionState;
  allowedProfessionalSkills: Map<string, BrpResolvedSkillDefinition>;
}

export function resolveBrpDetectiveProfession(
  wealth: BrpWealthLevel,
  electives: readonly BrpDetectiveElectiveSkillKey[],
  characteristics: BrpCharacteristicValues,
): BrpResolvedProfession {
  if (electives.length !== 4 || new Set(electives).size !== 4) {
    throw new Error("Detective must select exactly four unique elective professional skills.");
  }
  const supported = new Set<BrpDetectiveElectiveSkillKey>(BRP_DETECTIVE_ELECTIVE_SKILL_KEYS);
  for (const skillKey of electives) {
    if (!supported.has(skillKey)) {
      throw new Error(`Unsupported Detective elective ${skillKey}.`);
    }
  }

  const allowedProfessionalSkills = new Map<string, BrpResolvedSkillDefinition>();
  for (const skillKey of [...BRP_DETECTIVE_REQUIRED_SKILL_KEYS, ...electives]) {
    const definition = resolveBrpStaticSkillDefinition(skillKey, characteristics);
    allowedProfessionalSkills.set(definition.key, definition);
  }

  return {
    professionId: "detective",
    state: {
      professionId: "detective",
      wealth,
      selectedElectiveSkillIds: [...electives],
    },
    allowedProfessionalSkills,
  };
}

export function resolveBrpScholarProfession(
  wealth: BrpWealthLevel,
  ownLanguage: BrpLanguageIdentity,
  otherLanguage: BrpLanguageIdentity,
  academicSkills: readonly BrpAcademicSkillSelection[],
  characteristics: BrpCharacteristicValues,
): BrpResolvedProfession {
  if (academicSkills.length !== 5) {
    throw new Error("Scholar must select exactly five Knowledge or Science specialty skills.");
  }

  const normalizedOwnLanguage = normalizeBrpLanguageSkillSelection({
    role: "own",
    language: ownLanguage,
  });
  const normalizedOtherLanguage = normalizeBrpLanguageSkillSelection({
    role: "other",
    language: otherLanguage,
  });
  if (normalizedOwnLanguage.language.id === normalizedOtherLanguage.language.id) {
    throw new Error("Scholar Own and Other language identities must be different languages.");
  }

  const selectedAcademicSkills = academicSkills.map(normalizeBrpAcademicSkillSelection);
  const seen = new Set<string>();
  for (const selection of selectedAcademicSkills) {
    const key = brpSkillIdentityKey(selection.skillId, selection.specialty);
    if (seen.has(key)) {
      throw new Error("Scholar academic specialty selections must be unique by parent skill and specialty ID.");
    }
    seen.add(key);
  }

  const allowedProfessionalSkills = new Map<string, BrpResolvedSkillDefinition>();
  for (const skillKey of BRP_SCHOLAR_FIXED_SKILL_KEYS) {
    const definition = resolveBrpStaticSkillDefinition(skillKey, characteristics);
    allowedProfessionalSkills.set(definition.key, definition);
  }
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
      selectedAcademicSkills: selectedAcademicSkills.map((selection) => ({
        skillId: selection.skillId,
        specialty: { ...selection.specialty },
      })),
    },
    allowedProfessionalSkills,
  };
}
