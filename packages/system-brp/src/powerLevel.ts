import type {
  BrpAgeBasisState,
  BrpPowerLevel,
} from "./nativeCharacter.js";

export const BRP_NORMAL_PROFESSIONAL_SKILL_POINTS = 250;
export const BRP_NORMAL_STARTING_SKILL_CAP = 75;
export const BRP_HEROIC_PROFESSIONAL_SKILL_POINTS = 325;
export const BRP_HEROIC_STARTING_SKILL_CAP = 90;
export const BRP_HEROIC_PROFESSIONAL_POINTS_PER_FULL_DECADE = 20;
export const BRP_DEFAULT_STARTING_AGE_MINIMUM = 18;
export const BRP_DEFAULT_STARTING_AGE_MAXIMUM = 23;
export const BRP_FIRST_SLICE_MAXIMUM_AGE = 49;

export interface BrpPowerLevelRules {
  baseProfessionalSkillPoints: number;
  startingSkillCap: number;
  professionalPointsPerFullDecade: number;
}

export interface BrpResolvedPowerLevelProfile {
  powerLevel: BrpPowerLevel;
  baseProfessionalSkillPoints: number;
  ageProfessionalSkillPointAdjustment: number;
  professionalSkillPoints: number;
  startingSkillCap: number;
  ageBasis: BrpAgeBasisState | null;
}

export function calculateBrpPersonalSkillPoints(intelligence: number): number {
  if (!Number.isInteger(intelligence) || intelligence < 1) {
    throw new Error("BRP personal skill budget requires a positive integer INT value.");
  }
  return intelligence * 10;
}

export function getBrpPowerLevelRules(powerLevel: BrpPowerLevel): BrpPowerLevelRules {
  if (powerLevel === "normal") {
    return {
      baseProfessionalSkillPoints: BRP_NORMAL_PROFESSIONAL_SKILL_POINTS,
      startingSkillCap: BRP_NORMAL_STARTING_SKILL_CAP,
      professionalPointsPerFullDecade: 0,
    };
  }

  return {
    baseProfessionalSkillPoints: BRP_HEROIC_PROFESSIONAL_SKILL_POINTS,
    startingSkillCap: BRP_HEROIC_STARTING_SKILL_CAP,
    professionalPointsPerFullDecade: BRP_HEROIC_PROFESSIONAL_POINTS_PER_FULL_DECADE,
  };
}

export function calculateBrpProfessionalAgeAdjustment(
  powerLevel: BrpPowerLevel,
  age: number,
  defaultStartingAge: number,
): number {
  const rules = getBrpPowerLevelRules(powerLevel);
  const addedYears = age - defaultStartingAge;
  return Math.floor(addedYears / 10) * rules.professionalPointsPerFullDecade;
}

export function resolveBrpPowerLevelProfile(
  powerLevel: BrpPowerLevel,
  age: number,
  defaultStartingAge?: number,
): BrpResolvedPowerLevelProfile {
  if (!Number.isInteger(age) || age < BRP_DEFAULT_STARTING_AGE_MINIMUM || age > BRP_FIRST_SLICE_MAXIMUM_AGE) {
    throw new Error(
      `BRP first-slice age must be an integer from ${BRP_DEFAULT_STARTING_AGE_MINIMUM} through ${BRP_FIRST_SLICE_MAXIMUM_AGE}.`,
    );
  }

  const rules = getBrpPowerLevelRules(powerLevel);
  if (powerLevel === "normal" && defaultStartingAge === undefined) {
    return {
      powerLevel,
      baseProfessionalSkillPoints: rules.baseProfessionalSkillPoints,
      ageProfessionalSkillPointAdjustment: 0,
      professionalSkillPoints: rules.baseProfessionalSkillPoints,
      startingSkillCap: rules.startingSkillCap,
      ageBasis: null,
    };
  }

  if (defaultStartingAge === undefined
    || !Number.isInteger(defaultStartingAge)
    || defaultStartingAge < BRP_DEFAULT_STARTING_AGE_MINIMUM
    || defaultStartingAge > BRP_DEFAULT_STARTING_AGE_MAXIMUM) {
    throw new Error(
      `BRP default starting age must be an integer from ${BRP_DEFAULT_STARTING_AGE_MINIMUM} through ${BRP_DEFAULT_STARTING_AGE_MAXIMUM}.`,
    );
  }
  if (age < defaultStartingAge) {
    throw new Error(
      "BRP first-slice age must not be below the retained default starting age because below-starting-age characteristic adjustments remain out of scope.",
    );
  }

  const addedYears = age - defaultStartingAge;
  const ageProfessionalSkillPointAdjustment = calculateBrpProfessionalAgeAdjustment(
    powerLevel,
    age,
    defaultStartingAge,
  );
  const ageBasis: BrpAgeBasisState = {
    method: "default-starting-age",
    defaultStartingAge,
    addedYears,
    professionalSkillPointAdjustment: ageProfessionalSkillPointAdjustment,
  };

  return {
    powerLevel,
    baseProfessionalSkillPoints: rules.baseProfessionalSkillPoints,
    ageProfessionalSkillPointAdjustment,
    professionalSkillPoints: rules.baseProfessionalSkillPoints + ageProfessionalSkillPointAdjustment,
    startingSkillCap: rules.startingSkillCap,
    ageBasis,
  };
}
