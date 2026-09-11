import {
  BRP_ATHLETE_ELECTIVE_SKILL_KEYS,
  BRP_DEFAULT_CAMPAIGN_PROFILE_ID,
  BRP_DETECTIVE_ELECTIVE_SKILL_KEYS,
  BRP_FIRST_SLICE_SKILL_CATALOG,
  resolveBrpCampaignProfileSelection,
  type BrpAcademicSkillSelection,
  type BrpAthleteElectiveSkillKey,
  type BrpCampaignProfileId,
  type BrpCampaignProfileReference,
  type BrpCharacteristicRedistributionInput,
  type BrpCharacteristicValues,
  type BrpDetectiveElectiveSkillKey,
  type BrpFirstSliceSkillKey,
  type BrpLanguageIdentity,
  type BrpPowerLevel,
  type BrpProfessionId,
  type BrpWealthLevel,
} from "../../../packages/system-brp/src/index.js";
import type { CharacterDocument } from "../../../packages/character-model/src/index.js";

export type BrpCreatorProfessionId = BrpProfessionId;
export type BrpCreatorCharacteristicMethod = "explicit" | "standard-rolled";

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

export function rerollBrpCreatorState(state: BrpCreatorState): BrpCreatorState {
  const nextSeed = `${state.rollSeed.trim() || "brp-creator"}-${Date.now().toString(36)}`;
  return { ...state, rollSeed: nextSeed, redistribution: [], allocations: {} };
}

export function defaultAcademicSkills(): BrpAcademicSkillSelection[] {
  return [
    academic("knowledge", "specialty-1", "Specialty 1"),
    academic("knowledge", "specialty-2", "Specialty 2"),
    academic("knowledge", "specialty-3", "Specialty 3"),
    academic("science", "specialty-4", "Specialty 4"),
    academic("science", "specialty-5", "Specialty 5"),
  ];
}

export function defaultCustomProfessionalSkills(): BrpFirstSliceSkillKey[] {
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

export function cloneAcademic(value: BrpAcademicSkillSelection): BrpAcademicSkillSelection {
  return { skillId: value.skillId, specialty: { ...value.specialty } };
}

export function isDetectiveElective(value: string): value is BrpDetectiveElectiveSkillKey {
  return (BRP_DETECTIVE_ELECTIVE_SKILL_KEYS as readonly string[]).includes(value);
}

export function isAthleteElective(value: string): value is BrpAthleteElectiveSkillKey {
  return (BRP_ATHLETE_ELECTIVE_SKILL_KEYS as readonly string[]).includes(value);
}

export function isFirstSliceSkillKey(value: string): value is BrpFirstSliceSkillKey {
  return Object.prototype.hasOwnProperty.call(BRP_FIRST_SLICE_SKILL_CATALOG, value);
}

export function zeroAllocation(): BrpCreatorAllocationState {
  return { professionalPoints: 0, personalPoints: 0 };
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
