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
import { calculateBrpDerivedState } from "./firstSlice.js";
import type {
  BrpCharacteristicGeneration,
  BrpCharacteristicGenerationState,
  BrpCharacteristicValues,
  BrpCharacteristics,
  BrpNativeCharacter,
  BrpPowerLevel,
  BrpSkillState,
  BrpWealthLevel,
} from "./nativeCharacter.js";
import {
  resolveBrpAthleteProfession,
  resolveBrpBeggarProfession,
  resolveBrpCustomProfession,
  type BrpAthleteElectiveSkillKey,
  type BrpResolvedProfession,
} from "./professions.js";
import { resolveBrpPowerLevelProfile } from "./powerLevel.js";
import { BRP_UGE_ORC_1_05_SOURCE } from "./rulesSource.js";
import {
  resolveBrpAllocationSkillDefinition,
  type BrpFirstSliceSkillKey,
  type BrpResolvedSkillDefinition,
  type BrpSkillAllocationInput,
} from "./skills.js";

export interface BrpPlayerCoreCommonInput {
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

export interface BrpAthletePlayerCoreBaseInput extends BrpPlayerCoreCommonInput {
  professionId: "athlete";
  athleteElectiveSkillKeys: BrpAthleteElectiveSkillKey[];
}

export interface BrpBeggarPlayerCoreBaseInput extends BrpPlayerCoreCommonInput {
  professionId: "beggar";
}

export interface BrpCustomProfessionPlayerCoreBaseInput extends BrpPlayerCoreCommonInput {
  professionId: "custom";
  customProfessionTitle: string;
  customProfessionDescription: string;
  customProfessionalSkillKeys: BrpFirstSliceSkillKey[];
}

export interface BrpAthletePlayerCoreInput extends BrpAthletePlayerCoreBaseInput {
  characteristics: BrpCharacteristicValues;
}

export interface BrpBeggarPlayerCoreInput extends BrpBeggarPlayerCoreBaseInput {
  characteristics: BrpCharacteristicValues;
}

export interface BrpCustomProfessionPlayerCoreInput extends BrpCustomProfessionPlayerCoreBaseInput {
  characteristics: BrpCharacteristicValues;
}

export interface BrpAthleteStandardRolledPlayerCoreInput extends BrpAthletePlayerCoreBaseInput {
  seed: string;
  redistribution?: BrpCharacteristicRedistributionInput[];
}

export interface BrpBeggarStandardRolledPlayerCoreInput extends BrpBeggarPlayerCoreBaseInput {
  seed: string;
  redistribution?: BrpCharacteristicRedistributionInput[];
}

export interface BrpCustomProfessionStandardRolledPlayerCoreInput extends BrpCustomProfessionPlayerCoreBaseInput {
  seed: string;
  redistribution?: BrpCharacteristicRedistributionInput[];
}

type BrpPlayerCoreBaseInput =
  | BrpAthletePlayerCoreBaseInput
  | BrpBeggarPlayerCoreBaseInput
  | BrpCustomProfessionPlayerCoreBaseInput;

type BrpPlayerCoreExplicitInput =
  | BrpAthletePlayerCoreInput
  | BrpBeggarPlayerCoreInput
  | BrpCustomProfessionPlayerCoreInput;

type BrpPlayerCoreRolledInput =
  | BrpAthleteStandardRolledPlayerCoreInput
  | BrpBeggarStandardRolledPlayerCoreInput
  | BrpCustomProfessionStandardRolledPlayerCoreInput;

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

export function buildBrpPlayerCoreProfessionCharacter(input: BrpAthletePlayerCoreInput): CharacterDocument;
export function buildBrpPlayerCoreProfessionCharacter(input: BrpBeggarPlayerCoreInput): CharacterDocument;
export function buildBrpPlayerCoreProfessionCharacter(input: BrpCustomProfessionPlayerCoreInput): CharacterDocument;
export function buildBrpPlayerCoreProfessionCharacter(input: BrpPlayerCoreExplicitInput): CharacterDocument {
  validateIdentity(input);
  validateCharacteristics(input.characteristics);
  return buildFromConstruction(input, {
    values: input.characteristics,
    state: explicitCharacteristicState(input.characteristics),
    generationState: { method: "explicit" },
    method: "explicit",
    generationMode: "manual",
    methodId: "brp-uge-player-core-explicit",
  });
}

export function buildBrpStandardRolledPlayerCoreProfessionCharacter(
  input: BrpAthleteStandardRolledPlayerCoreInput,
): CharacterDocument;
export function buildBrpStandardRolledPlayerCoreProfessionCharacter(
  input: BrpBeggarStandardRolledPlayerCoreInput,
): CharacterDocument;
export function buildBrpStandardRolledPlayerCoreProfessionCharacter(
  input: BrpCustomProfessionStandardRolledPlayerCoreInput,
): CharacterDocument;
export function buildBrpStandardRolledPlayerCoreProfessionCharacter(input: BrpPlayerCoreRolledInput): CharacterDocument {
  validateIdentity(input);
  const generated = generateBrpStandardRolledCharacteristics(input.seed, input.redistribution ?? []);
  return buildFromConstruction(input, {
    values: generated.final,
    state: generated.characteristics,
    generationState: generated.generationState,
    method: "standard-rolled",
    generationMode: "mechanical",
    methodId: "brp-uge-player-core-standard-rolled",
    seed: generated.generationState.seed,
  });
}

function buildFromConstruction(input: BrpPlayerCoreBaseInput, construction: BrpCharacteristicConstruction): CharacterDocument {
  const profession = resolveProfession(input, construction.values);
  const powerProfile = resolveBrpPowerLevelProfile(
    input.powerLevel ?? "normal",
    input.age,
    input.defaultStartingAge,
  );
  const powerLevelLabel = powerProfile.powerLevel === "heroic" ? "Heroic" : "Normal";
  const professional = allocationMap(input.professionalAllocations, "professional", construction.values);
  const personal = allocationMap(input.personalAllocations, "personal", construction.values);

  for (const allocation of professional.values()) {
    const allowed = profession.allowedProfessionalSkills.get(allocation.definition.key);
    if (!allowed || !skillDefinitionsEqual(allowed, allocation.definition)) {
      throw new Error(`Professional skill ${allocation.definition.label} is not available to the selected ${profession.professionId} profile.`);
    }
  }

  const professionalSpent = sumAllocations(professional);
  if (professionalSpent !== powerProfile.professionalSkillPoints) {
    throw new Error(`${powerLevelLabel} BRP characters must allocate exactly ${powerProfile.professionalSkillPoints} professional skill points for the retained age profile.`);
  }
  const personalTotal = construction.values.INT * 10;
  const personalSpent = sumAllocations(personal);
  if (personalSpent !== personalTotal) {
    throw new Error(`BRP personal skill points must total INT x 10 (${personalTotal}).`);
  }

  const allSkillKeys = [...new Set([...professional.keys(), ...personal.keys()])].sort();
  const skills = allSkillKeys.map((skillKey) => {
    const professionalAllocation = professional.get(skillKey);
    const personalAllocation = personal.get(skillKey);
    const definition = professionalAllocation?.definition ?? personalAllocation?.definition;
    if (!definition) throw new Error(`Missing resolved BRP skill definition for ${skillKey}.`);
    if (professionalAllocation && personalAllocation && !skillDefinitionsEqual(professionalAllocation.definition, personalAllocation.definition)) {
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
    derived: calculateBrpDerivedState(construction.values),
    skillBudgets: {
      professional: { total: powerProfile.professionalSkillPoints, spent: professionalSpent },
      personal: { total: personalTotal, spent: personalSpent },
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
      notes: `BRP UGE player-core ${powerProfile.powerLevel} ${profession.professionId} ${construction.method} characteristics builder`,
    },
  };

  return createCharacterDocument({
    characterId: input.characterId,
    displayName: input.displayName.trim(),
    primaryNativeStateId: nativeState.id,
    nativeStates: [nativeState],
    generation: {
      methodId: construction.methodId,
      mode: construction.generationMode,
      recipeVersion: "brp-uge-player-core/0.1",
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
        ...professionDecisions(profession),
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

function professionDecisions(profession: BrpResolvedProfession) {
  if (profession.state.professionId === "athlete") {
    return [{ stepId: "identity.profession-electives", answer: [...profession.state.selectedElectiveSkillIds] }];
  }
  if (profession.state.professionId === "custom") {
    return [
      { stepId: "identity.profession-title", answer: profession.state.title },
      { stepId: "identity.profession-description", answer: profession.state.description },
      { stepId: "identity.profession-skills", answer: [...profession.state.selectedProfessionalSkillIds] },
    ];
  }
  return [];
}

function resolveProfession(input: BrpPlayerCoreBaseInput, characteristics: BrpCharacteristicValues): BrpResolvedProfession {
  if (input.professionId === "athlete") return resolveBrpAthleteProfession(input.wealth, input.athleteElectiveSkillKeys, characteristics);
  if (input.professionId === "beggar") return resolveBrpBeggarProfession(input.wealth, characteristics);
  return resolveBrpCustomProfession(
    input.wealth,
    input.customProfessionTitle,
    input.customProfessionDescription,
    input.customProfessionalSkillKeys,
    characteristics,
  );
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
    throw new Error(`Professional allocation raises ${definition.label} above the ${powerLevelLabel} starting cap of ${startingSkillCap}%.`);
  }
  if (finalRating > startingSkillCap) throw new Error(`Starting skill ${definition.label} exceeds the ${powerLevelLabel} cap of ${startingSkillCap}%.`);
  return {
    skillId: definition.skillId,
    label: definition.label,
    specialty: definition.specialty ? { ...definition.specialty } : null,
    baseChance: definition.baseChance,
    contributions: { professional: professionalPoints, personal: personalPoints },
    finalRating,
  };
}

function allocationMap(
  allocations: readonly BrpSkillAllocationInput[],
  source: "professional" | "personal",
  characteristics: BrpCharacteristicValues,
): Map<string, BrpResolvedAllocation> {
  const result = new Map<string, BrpResolvedAllocation>();
  for (const allocation of allocations) {
    if (!Number.isInteger(allocation.points) || allocation.points <= 0) throw new Error(`${source} skill allocations must use positive integer points.`);
    const definition = resolveBrpAllocationSkillDefinition(allocation, characteristics);
    if (result.has(definition.key)) throw new Error(`${source} skill allocations must not repeat ${definition.label}.`);
    result.set(definition.key, { definition, points: allocation.points });
  }
  return result;
}

function sumAllocations(allocations: ReadonlyMap<string, BrpResolvedAllocation>): number {
  let total = 0;
  for (const allocation of allocations.values()) total += allocation.points;
  return total;
}

function skillDefinitionsEqual(left: BrpResolvedSkillDefinition, right: BrpResolvedSkillDefinition): boolean {
  return left.key === right.key
    && left.skillId === right.skillId
    && left.label === right.label
    && left.baseChance === right.baseChance
    && left.specialty?.id === right.specialty?.id
    && left.specialty?.label === right.specialty?.label;
}

function explicitCharacteristicState(values: BrpCharacteristicValues): BrpCharacteristics {
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

function validateIdentity(input: BrpPlayerCoreCommonInput): void {
  if (!input.characterId.trim() || !input.nativeStateId.trim() || !input.displayName.trim()) throw new Error("BRP player-core identifiers and display name must be non-empty.");
  if (!input.gender.trim()) throw new Error("BRP player-core gender must be non-empty.");
  if (!Number.isInteger(input.age) || input.age < 18 || input.age > 49) throw new Error("BRP player-core age must be an integer from 18 through 49 so age-50+ characteristic adjustments remain out of scope.");
}

function validateCharacteristics(values: BrpCharacteristicValues): void {
  const ranges: Array<[keyof BrpCharacteristicValues, number, number]> = [
    ["STR", 3, 21], ["CON", 3, 21], ["SIZ", 8, 21], ["INT", 8, 21],
    ["POW", 3, 21], ["DEX", 3, 21], ["CHA", 3, 21],
  ];
  for (const [id, minimum, maximum] of ranges) {
    const value = values[id];
    if (!Number.isInteger(value) || value < minimum || value > maximum) throw new Error(`BRP player-core ${String(id)} must be an integer from ${minimum} through ${maximum}.`);
  }
}
