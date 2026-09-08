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
  BrpCharacteristicGeneration,
  BrpCharacteristicGenerationState,
  BrpCharacteristicValues,
  BrpCharacteristics,
  BrpDamageModifier,
  BrpDerivedState,
  BrpNativeCharacter,
  BrpPowerLevel,
  BrpSkillSpecialty,
  BrpSkillState,
  BrpWealthLevel,
} from "./nativeCharacter.js";
import { resolveBrpPowerLevelProfile } from "./powerLevel.js";
import { BRP_UGE_ORC_1_05_SOURCE } from "./rulesSource.js";

export {
  BRP_HEROIC_PROFESSIONAL_SKILL_POINTS,
  BRP_HEROIC_STARTING_SKILL_CAP,
  BRP_NORMAL_PROFESSIONAL_SKILL_POINTS,
  BRP_NORMAL_STARTING_SKILL_CAP,
} from "./powerLevel.js";

export interface BrpSkillAllocationInput {
  skillKey: BrpFirstSliceSkillKey;
  points: number;
}

export interface BrpFirstSliceBaseInput {
  characterId: string;
  nativeStateId: string;
  displayName: string;
  age: number;
  gender: string;
  wealth: BrpWealthLevel;
  powerLevel?: BrpPowerLevel;
  defaultStartingAge?: number;
  detectiveElectiveSkillKeys: BrpDetectiveElectiveSkillKey[];
  professionalAllocations: BrpSkillAllocationInput[];
  personalAllocations: BrpSkillAllocationInput[];
}

export interface BrpFirstSliceInput extends BrpFirstSliceBaseInput {
  characteristics: BrpCharacteristicValues;
}

export interface BrpStandardRolledFirstSliceInput extends BrpFirstSliceBaseInput {
  seed: string;
  redistribution?: BrpCharacteristicRedistributionInput[];
}

interface BrpSkillDefinition {
  skillId: string;
  label: string;
  baseChance: number;
  specialty: BrpSkillSpecialty | null;
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

export const BRP_FIRST_SLICE_SKILL_CATALOG = {
  "firearm:handgun": {
    skillId: "firearm",
    label: "Firearm (Handgun)",
    baseChance: 20,
    specialty: { id: "handgun", label: "Handgun" },
  },
  "knowledge:law": {
    skillId: "knowledge",
    label: "Knowledge (Law)",
    baseChance: 5,
    specialty: { id: "law", label: "Law" },
  },
  listen: { skillId: "listen", label: "Listen", baseChance: 25, specialty: null },
  persuade: { skillId: "persuade", label: "Persuade", baseChance: 15, specialty: null },
  spot: { skillId: "spot", label: "Spot", baseChance: 25, specialty: null },
  research: { skillId: "research", label: "Research", baseChance: 25, specialty: null },
  brawl: { skillId: "brawl", label: "Brawl", baseChance: 25, specialty: null },
  "fast-talk": { skillId: "fast-talk", label: "Fast Talk", baseChance: 5, specialty: null },
  hide: { skillId: "hide", label: "Hide", baseChance: 10, specialty: null },
  insight: { skillId: "insight", label: "Insight", baseChance: 5, specialty: null },
  "science:forensics": {
    skillId: "science",
    label: "Science (Forensics)",
    baseChance: 1,
    specialty: { id: "forensics", label: "Forensics" },
  },
  stealth: { skillId: "stealth", label: "Stealth", baseChance: 10, specialty: null },
  track: { skillId: "track", label: "Track", baseChance: 10, specialty: null },
  "first-aid": { skillId: "first-aid", label: "First Aid", baseChance: 30, specialty: null },
} as const satisfies Record<string, BrpSkillDefinition>;

export type BrpFirstSliceSkillKey = keyof typeof BRP_FIRST_SLICE_SKILL_CATALOG;

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

export function buildBrpFirstSliceCharacter(input: BrpFirstSliceInput): CharacterDocument {
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
  input: BrpFirstSliceBaseInput,
  construction: BrpCharacteristicConstruction,
): CharacterDocument {
  validateIdentity(input);
  validateDetectiveElectives(input.detectiveElectiveSkillKeys);

  const powerProfile = resolveBrpPowerLevelProfile(
    input.powerLevel ?? "normal",
    input.age,
    input.defaultStartingAge,
  );
  const powerLevelLabel = powerProfile.powerLevel === "heroic" ? "Heroic" : "Normal";

  const professional = allocationMap(input.professionalAllocations, "professional");
  const personal = allocationMap(input.personalAllocations, "personal");
  const allowedProfessionalSkills = new Set<BrpFirstSliceSkillKey>([
    ...BRP_DETECTIVE_REQUIRED_SKILL_KEYS,
    ...input.detectiveElectiveSkillKeys,
  ]);

  for (const skillKey of professional.keys()) {
    if (!allowedProfessionalSkills.has(skillKey)) {
      throw new Error(`Professional skill ${skillKey} is not available to the selected Detective profile.`);
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

  const allSkillKeys = [...new Set<BrpFirstSliceSkillKey>([
    ...professional.keys(),
    ...personal.keys(),
  ])].sort();

  const skills = allSkillKeys.map((skillKey) => buildSkillState(
    skillKey,
    professional,
    personal,
    powerProfile.startingSkillCap,
    powerLevelLabel,
  ));
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
      profession: {
        professionId: "detective",
        wealth: input.wealth,
        selectedElectiveSkillIds: [...input.detectiveElectiveSkillKeys],
      },
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
      notes: `BRP UGE first-slice ${powerProfile.powerLevel} ${construction.method} characteristics builder`,
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
      recipeVersion: "brp-uge-first-slice/0.3",
      ...(construction.seed ? { seed: construction.seed } : {}),
      rulesSourceIds: [BRP_UGE_ORC_1_05_SOURCE.id],
      recipe: {
        powerLevel: powerProfile.powerLevel,
        characteristicGeneration: construction.method,
        professionId: "detective",
        enabledOptions: [],
        enabledPowerSystems: [],
        ...(powerProfile.ageBasis ? { ageBasis: powerProfile.ageBasis } : {}),
      },
      decisions: [
        { stepId: "rules.power-level", choiceId: powerProfile.powerLevel },
        { stepId: "identity.profession", choiceId: "detective" },
        { stepId: "identity.wealth", choiceId: input.wealth },
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

function buildSkillState(
  skillKey: BrpFirstSliceSkillKey,
  professional: ReadonlyMap<BrpFirstSliceSkillKey, number>,
  personal: ReadonlyMap<BrpFirstSliceSkillKey, number>,
  startingSkillCap: number,
  powerLevelLabel: string,
): BrpSkillState {
  const definition = BRP_FIRST_SLICE_SKILL_CATALOG[skillKey];
  const professionalPoints = professional.get(skillKey) ?? 0;
  const personalPoints = personal.get(skillKey) ?? 0;
  const professionalRating = definition.baseChance + professionalPoints;
  const finalRating = professionalRating + personalPoints;

  if (professionalRating > startingSkillCap) {
    throw new Error(
      `Professional allocation raises ${skillKey} above the ${powerLevelLabel} starting cap of ${startingSkillCap}%.`,
    );
  }
  if (finalRating > startingSkillCap) {
    throw new Error(`Starting skill ${skillKey} exceeds the ${powerLevelLabel} cap of ${startingSkillCap}%.`);
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

function validateIdentity(input: BrpFirstSliceBaseInput): void {
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

function validateDetectiveElectives(electives: readonly BrpDetectiveElectiveSkillKey[]): void {
  if (electives.length !== 4 || new Set(electives).size !== 4) {
    throw new Error("Detective must select exactly four unique elective professional skills.");
  }
  const supported = new Set<BrpDetectiveElectiveSkillKey>(BRP_DETECTIVE_ELECTIVE_SKILL_KEYS);
  for (const skillKey of electives) {
    if (!supported.has(skillKey)) {
      throw new Error(`Unsupported Detective elective ${skillKey}.`);
    }
  }
}

function allocationMap(
  allocations: readonly BrpSkillAllocationInput[],
  source: "professional" | "personal",
): Map<BrpFirstSliceSkillKey, number> {
  const result = new Map<BrpFirstSliceSkillKey, number>();
  for (const allocation of allocations) {
    if (!Number.isInteger(allocation.points) || allocation.points <= 0) {
      throw new Error(`${source} skill allocations must use positive integer points.`);
    }
    if (result.has(allocation.skillKey)) {
      throw new Error(`${source} skill allocations must not repeat ${allocation.skillKey}.`);
    }
    result.set(allocation.skillKey, allocation.points);
  }
  return result;
}

function sumAllocations(allocations: ReadonlyMap<BrpFirstSliceSkillKey, number>): number {
  let total = 0;
  for (const points of allocations.values()) total += points;
  return total;
}
