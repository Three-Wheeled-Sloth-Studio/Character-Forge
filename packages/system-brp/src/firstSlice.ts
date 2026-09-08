import {
  createCharacterDocument,
  type CharacterDocument,
  type GenerationMode,
  type NativeSystemState,
} from "../../character-model/src/index.js";
import {
  generateBrpStandardRolledCharacteristics,
  type BrpCharacteristicRedistributionInput,
} from "./characteristicGeneration.js";
import type {
  BrpAcademicSkillSelection,
  BrpCharacteristicGeneration,
  BrpCharacteristicGenerationState,
  BrpCharacteristicValues,
  BrpCharacteristics,
  BrpDamageModifier,
  BrpDerivedState,
  BrpLanguageIdentity,
  BrpNativeCharacter,
  BrpPowerLevel,
  BrpSkillState,
  BrpWealthLevel,
} from "./nativeCharacter.js";
import {
  resolveBrpDetectiveProfession,
  resolveBrpScholarProfession,
  type BrpDetectiveElectiveSkillKey,
  type BrpResolvedProfession,
} from "./professions.js";
import { resolveBrpPowerLevelProfile } from "./powerLevel.js";
import { BRP_UGE_ORC_1_05_SOURCE } from "./rulesSource.js";
import {
  resolveBrpAllocationSkillDefinition,
  type BrpResolvedSkillDefinition,
  type BrpSkillAllocationInput,
} from "./skills.js";

export {
  BRP_HEROIC_PROFESSIONAL_SKILL_POINTS,
  BRP_HEROIC_STARTING_SKILL_CAP,
  BRP_NORMAL_PROFESSIONAL_SKILL_POINTS,
  BRP_NORMAL_STARTING_SKILL_CAP,
} from "./powerLevel.js";
export {
  BRP_DETECTIVE_ELECTIVE_SKILL_KEYS,
  BRP_DETECTIVE_REQUIRED_SKILL_KEYS,
  BRP_SCHOLAR_FIXED_SKILL_KEYS,
} from "./professions.js";
export { BRP_FIRST_SLICE_SKILL_CATALOG } from "./skills.js";
export type { BrpDetectiveElectiveSkillKey } from "./professions.js";
export type { BrpFirstSliceSkillKey, BrpSkillAllocationInput } from "./skills.js";

export interface BrpFirstSliceCommonInput {
  characterId: string;
  nativeStateId: string;
  displayName: string;
  age: number;
  gender: string;
  wealth: BrpWealthLevel;
  powerLevel?: BrpPowerLevel;
  defaultStartingAge?: number;
  professionalAllocations: BrpSkillAllocationInput[];
  personalAllocations: BrpSkillAllocationInput[];
}

export interface BrpFirstSliceBaseInput extends BrpFirstSliceCommonInput {
  professionId?: "detective";
  detectiveElectiveSkillKeys: BrpDetectiveElectiveSkillKey[];
}

export interface BrpScholarFirstSliceBaseInput extends BrpFirstSliceCommonInput {
  professionId: "scholar";
  scholarOwnLanguage: BrpLanguageIdentity;
  scholarOtherLanguage: BrpLanguageIdentity;
  scholarAcademicSkills: BrpAcademicSkillSelection[];
}

export interface BrpFirstSliceInput extends BrpFirstSliceBaseInput {
  characteristics: BrpCharacteristicValues;
}

export interface BrpScholarFirstSliceInput extends BrpScholarFirstSliceBaseInput {
  characteristics: BrpCharacteristicValues;
}

export interface BrpStandardRolledFirstSliceInput extends BrpFirstSliceBaseInput {
  seed: string;
  redistribution?: BrpCharacteristicRedistributionInput[];
}

export interface BrpScholarStandardRolledFirstSliceInput extends BrpScholarFirstSliceBaseInput {
  seed: string;
  redistribution?: BrpCharacteristicRedistributionInput[];
}

interface BrpCharacteristicConstruction {
  values: BrpCharacteristicValues;
  state: BrpCharacteristics;
  generationState: BrpCharacteristicGenerationState;
  method: BrpCharacteristicGeneration;
  generationMode: GenerationMode;
  methodId: string;
  seed?: string;
}

interface BrpResolvedAllocation {
  definition: BrpResolvedSkillDefinition;
  points: number;
}

export function buildBrpFirstSliceCharacter(input: BrpFirstSliceInput): CharacterDocument;
export function buildBrpFirstSliceCharacter(input: BrpScholarFirstSliceInput): CharacterDocument;
export function buildBrpFirstSliceCharacter(
  input: BrpFirstSliceInput | BrpScholarFirstSliceInput,
): CharacterDocument {
  validateCharacteristics(input.characteristics);
  return buildBrpFirstSliceCharacterFromConstruction(input, {
    values: input.characteristics,
    state: buildExplicitCharacteristicState(input.characteristics),
    generationState: { method: "explicit" },
    method: "explicit",
    generationMode: "manual",
    methodId: "brp-uge-first-slice-explicit",
  });
}

export function buildBrpStandardRolledFirstSliceCharacter(
  input: BrpStandardRolledFirstSliceInput,
): CharacterDocument;
export function buildBrpStandardRolledFirstSliceCharacter(
  input: BrpScholarStandardRolledFirstSliceInput,
): CharacterDocument;
export function buildBrpStandardRolledFirstSliceCharacter(
  input: BrpStandardRolledFirstSliceInput | BrpScholarStandardRolledFirstSliceInput,
): CharacterDocument {
  const generated = generateBrpStandardRolledCharacteristics(input.seed, input.redistribution ?? []);
  return buildBrpFirstSliceCharacterFromConstruction(input, {
    values: generated.final,
    state: generated.characteristics,
    generationState: generated.generationState,
    method: "standard-rolled",
    generationMode: "mechanical",
    methodId: "brp-uge-first-slice-standard-rolled",
    seed: generated.generationState.seed,
  });
}

function buildBrpFirstSliceCharacterFromConstruction(
  input:
    | BrpFirstSliceBaseInput
    | BrpScholarFirstSliceBaseInput,
  construction: BrpCharacteristicConstruction,
): CharacterDocument {
  validateIdentity(input);

  const profession = resolveProfession(input, construction.values);
  const powerProfile = resolveBrpPowerLevelProfile(
    input.powerLevel ?? "normal",
    input.age,
    input.defaultStartingAge,
  );
  const powerLevelLabel = powerProfile.powerLevel === "heroic" ? "Heroic" : "Normal";

  const professional = allocationMap(
    input.professionalAllocations,
    "professional",
    construction.values,
  );
  const personal = allocationMap(
    input.personalAllocations,
    "personal",
    construction.values,
  );

  for (const allocation of professional.values()) {
    const allowed = profession.allowedProfessionalSkills.get(allocation.definition.key);
    if (!allowed || !skillDefinitionsEqual(allowed, allocation.definition)) {
      throw new Error(
        `Professional skill ${allocation.definition.label} is not available to the selected ${profession.professionId} profile.`,
      );
    }
  }

  const professionalSpent = sumAllocations(professional);
  if (professionalSpent !== powerProfile.professionalSkillPoints) {
    throw new Error(
      `${powerLevelLabel} BRP characters must allocate exactly ${powerProfile.professionalSkillPoints} professional skill points for the retained age profile.`,
    );
  }

  const personalTotal = construction.values.INT * 10;
  const personalSpent = sumAllocations(personal);
  if (personalSpent !== personalTotal) {
    throw new Error(`BRP personal skill points must total INT x 10 (${personalTotal}).`);
  }

  const allSkillKeys = [...new Set<string>([
    ...professional.keys(),
    ...personal.keys(),
  ])].sort();

  const skills = allSkillKeys.map((skillKey) => {
    const professionalAllocation = professional.get(skillKey);
    const personalAllocation = personal.get(skillKey);
    const definition = professionalAllocation?.definition ?? personalAllocation?.definition;
    if (!definition) {
      throw new Error(`Missing resolved BRP skill definition for ${skillKey}.`);
    }
    if (professionalAllocation
      && personalAllocation
      && !skillDefinitionsEqual(professionalAllocation.definition, personalAllocation.definition)) {
      throw new Error(`BRP skill identity ${skillKey} has conflicting specialty labels across allocation sources.`);
    }
    return buildSkillState(
      definition,
      professionalAllocation?.points ?? 0,
      personalAllocation?.points ?? 0,
      powerProfile.startingSkillCap,
      powerLevelLabel,
    );
  });
  const derived = calculateBrpDerivedState(construction.values);

  const nativeCharacter: BrpNativeCharacter = {
    schemaVersion: "brp-character/0.1",
    rulesSourceIds: [BRP_UGE_ORC_1_05_SOURCE.id],
    rulesProfile: {
      powerLevel: powerProfile.powerLevel,
      characteristicGeneration: construction.method,
      enabledOptions: [],
      enabledPowerSystems: [],
    },
    identity: {
      age: input.age,
      gender: input.gender.trim(),
      profession: profession.state,
      ...(powerProfile.ageBasis ? { ageBasis: powerProfile.ageBasis } : {}),
    },
    characteristics: construction.state,
    characteristicGenerationState: construction.generationState,
    characteristicRolls: {
      effort: construction.values.STR * 5,
      stamina: construction.values.CON * 5,
      idea: construction.values.INT * 5,
      luck: construction.values.POW * 5,
      agility: construction.values.DEX * 5,
      charisma: construction.values.CHA * 5,
    },
    derived,
    skillBudgets: {
      professional: {
        total: powerProfile.professionalSkillPoints,
        spent: professionalSpent,
      },
      personal: {
        total: personalTotal,
        spent: personalSpent,
      },
    },
    skills,
    equipment: [],
  };

  const nativeState: NativeSystemState = {
    id: input.nativeStateId,
    systemId: "brp",
    editionId: "uge-2023",
    rulesVersion: BRP_UGE_ORC_1_05_SOURCE.version,
    schemaVersion: nativeCharacter.schemaVersion,
    payload: nativeCharacter,
    provenance: {
      origin: "generated",
      sourceId: BRP_UGE_ORC_1_05_SOURCE.id,
      notes: `BRP UGE first-slice ${powerProfile.powerLevel} ${profession.professionId} ${construction.method} characteristics builder`,
    },
  };

  const scholarLanguageDecisions = profession.state.professionId === "scholar"
    ? [
      {
        stepId: "identity.language-own",
        answer: { ...profession.state.ownLanguage },
      },
      {
        stepId: "identity.language-other",
        answer: { ...profession.state.otherLanguage },
      },
    ]
    : [];
  const scholarAcademicDecision = profession.state.professionId === "scholar"
    ? [{
      stepId: "identity.profession-academic-skills",
      answer: profession.state.selectedAcademicSkills.map((selection) => ({
        skillId: selection.skillId,
        specialty: { ...selection.specialty },
      })),
    }]
    : [];

  return createCharacterDocument({
    characterId: input.characterId,
    displayName: input.displayName.trim(),
    primaryNativeStateId: nativeState.id,
    nativeStates: [nativeState],
    generation: {
      methodId: construction.methodId,
      mode: construction.generationMode,
      recipeVersion: profession.professionId === "scholar"
        ? "brp-uge-first-slice/0.5"
        : "brp-uge-first-slice/0.3",
      ...(construction.seed ? { seed: construction.seed } : {}),
      rulesSourceIds: [BRP_UGE_ORC_1_05_SOURCE.id],
      recipe: {
        powerLevel: powerProfile.powerLevel,
        characteristicGeneration: construction.method,
        professionId: profession.professionId,
        enabledOptions: [],
        enabledPowerSystems: [],
        ...(powerProfile.ageBasis ? { ageBasis: powerProfile.ageBasis } : {}),
      },
      decisions: [
        { stepId: "rules.power-level", choiceId: powerProfile.powerLevel },
        { stepId: "identity.profession", choiceId: profession.professionId },
        { stepId: "identity.wealth", choiceId: input.wealth },
        ...scholarLanguageDecisions,
        ...scholarAcademicDecision,
        ...(powerProfile.ageBasis
          ? [
            { stepId: "identity.default-starting-age", answer: powerProfile.ageBasis.defaultStartingAge },
            { stepId: "identity.age-professional-adjustment", answer: powerProfile.ageBasis.professionalSkillPointAdjustment },
          ]
          : []),
        { stepId: "characteristics.method", choiceId: construction.method },
        ...(construction.method === "standard-rolled"
          ? [{
            stepId: "characteristics.redistribution",
            answer: construction.generationState.method === "standard-rolled"
              ? construction.generationState.redistribution
              : [],
          }]
          : []),
        { stepId: "skills.professional-allocation", answer: professionalSpent },
        { stepId: "skills.personal-allocation", answer: personalSpent },
      ],
    },
  });
}

export function calculateBrpDerivedState(characteristics: BrpCharacteristicValues): BrpDerivedState {
  const hitPoints = Math.ceil((characteristics.CON + characteristics.SIZ) / 2);
  return {
    hitPoints,
    majorWoundLevel: Math.ceil(hitPoints / 2),
    powerPoints: characteristics.POW,
    experienceBonus: Math.ceil(characteristics.INT / 2),
    move: 10,
    damageModifier: calculateBrpDamageModifier(characteristics.STR + characteristics.SIZ),
  };
}

export function calculateBrpDamageModifier(strPlusSiz: number): BrpDamageModifier {
  if (strPlusSiz <= 12) return "-1D6";
  if (strPlusSiz <= 16) return "-1D4";
  if (strPlusSiz <= 24) return "None";
  if (strPlusSiz <= 32) return "+1D4";
  if (strPlusSiz <= 40) return "+1D6";
  return "+2D6";
}

function resolveProfession(
  input: BrpFirstSliceBaseInput | BrpScholarFirstSliceBaseInput,
  characteristics: BrpCharacteristicValues,
): BrpResolvedProfession {
  if (input.professionId === "scholar") {
    return resolveBrpScholarProfession(
      input.wealth,
      input.scholarOwnLanguage,
      input.scholarOtherLanguage,
      input.scholarAcademicSkills,
      characteristics,
    );
  }
  return resolveBrpDetectiveProfession(input.wealth, input.detectiveElectiveSkillKeys, characteristics);
}

function buildSkillState(
  definition: BrpResolvedSkillDefinition,
  professionalPoints: number,
  personalPoints: number,
  startingSkillCap: number,
  powerLevelLabel: string,
): BrpSkillState {
  const professionalRating = definition.baseChance + professionalPoints;
  const finalRating = professionalRating + personalPoints;

  if (professionalRating > startingSkillCap) {
    throw new Error(
      `Professional allocation raises ${definition.label} above the ${powerLevelLabel} starting cap of ${startingSkillCap}%.`,
    );
  }
  if (finalRating > startingSkillCap) {
    throw new Error(`Starting skill ${definition.label} exceeds the ${powerLevelLabel} cap of ${startingSkillCap}%.`);
  }

  return {
    skillId: definition.skillId,
    label: definition.label,
    specialty: definition.specialty ? { ...definition.specialty } : null,
    baseChance: definition.baseChance,
    contributions: {
      professional: professionalPoints,
      personal: personalPoints,
    },
    finalRating,
  };
}

function buildExplicitCharacteristicState(values: BrpCharacteristicValues): BrpCharacteristics {
  return {
    STR: { initial: values.STR, adjustments: [], final: values.STR },
    CON: { initial: values.CON, adjustments: [], final: values.CON },
    SIZ: { initial: values.SIZ, adjustments: [], final: values.SIZ },
    INT: { initial: values.INT, adjustments: [], final: values.INT },
    POW: { initial: values.POW, adjustments: [], final: values.POW },
    DEX: { initial: values.DEX, adjustments: [], final: values.DEX },
    CHA: { initial: values.CHA, adjustments: [], final: values.CHA },
  };
}

function validateIdentity(input: BrpFirstSliceCommonInput): void {
  if (!input.characterId.trim() || !input.nativeStateId.trim() || !input.displayName.trim()) {
    throw new Error("BRP first-slice identifiers and display name must be non-empty.");
  }
  if (!input.gender.trim()) {
    throw new Error("BRP first-slice gender must be non-empty.");
  }
  if (!Number.isInteger(input.age) || input.age < 18 || input.age > 49) {
    throw new Error("BRP first-slice age must be an integer from 18 through 49 so age-50+ characteristic adjustments remain out of scope.");
  }
}

function validateCharacteristics(values: BrpCharacteristicValues): void {
  const standardRange: Array<[keyof BrpCharacteristicValues, number, number]> = [
    ["STR", 3, 21],
    ["CON", 3, 21],
    ["SIZ", 8, 21],
    ["INT", 8, 21],
    ["POW", 3, 21],
    ["DEX", 3, 21],
    ["CHA", 3, 21],
  ];

  for (const [id, minimum, maximum] of standardRange) {
    const value = values[id];
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
      throw new Error(`BRP first-slice ${id} must be an integer from ${minimum} through ${maximum}.`);
    }
  }
}

function allocationMap(
  allocations: readonly BrpSkillAllocationInput[],
  source: "professional" | "personal",
  characteristics: BrpCharacteristicValues,
): Map<string, BrpResolvedAllocation> {
  const result = new Map<string, BrpResolvedAllocation>();
  for (const allocation of allocations) {
    if (!Number.isInteger(allocation.points) || allocation.points <= 0) {
      throw new Error(`${source} skill allocations must use positive integer points.`);
    }
    const definition = resolveBrpAllocationSkillDefinition(allocation, characteristics);
    if (result.has(definition.key)) {
      throw new Error(`${source} skill allocations must not repeat ${definition.label}.`);
    }
    result.set(definition.key, { definition, points: allocation.points });
  }
  return result;
}

function sumAllocations(allocations: ReadonlyMap<string, BrpResolvedAllocation>): number {
  let total = 0;
  for (const allocation of allocations.values()) total += allocation.points;
  return total;
}

function skillDefinitionsEqual(
  left: BrpResolvedSkillDefinition,
  right: BrpResolvedSkillDefinition,
): boolean {
  return left.key === right.key
    && left.skillId === right.skillId
    && left.label === right.label
    && left.baseChance === right.baseChance
    && left.specialty?.id === right.specialty?.id
    && left.specialty?.label === right.specialty?.label;
}
