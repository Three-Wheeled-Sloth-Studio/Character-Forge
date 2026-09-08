import type {
  JsonObject,
  NativeSystemState,
  RulesSystemAdapter,
  RulesValidationIssue,
  RulesValidationResult,
} from "../../character-model/src/index.js";
import {
  createSeededRandom,
  rollDiceExpression,
} from "../../generator-core/src/index.js";
import {
  BRP_CHARACTERISTIC_IDS,
  BRP_STANDARD_CHARACTERISTIC_EXPRESSIONS,
  BRP_STANDARD_CHARACTERISTIC_ROLL_ORDER,
  BRP_STANDARD_REDISTRIBUTION_POINT_LIMIT,
  BRP_STANDARD_REDISTRIBUTION_SOURCE_ID,
} from "./characteristicGeneration.js";
import { calculateBrpDerivedState } from "./firstSlice.js";
import type {
  BrpCharacteristicGeneration,
  BrpCharacteristicId,
  BrpCharacteristicRedistributionTransfer,
  BrpCharacteristicValues,
  BrpPowerLevel,
  BrpProfessionId,
  BrpSkillSpecialty,
} from "./nativeCharacter.js";
import {
  BRP_DETECTIVE_ELECTIVE_SKILL_KEYS,
  BRP_DETECTIVE_REQUIRED_SKILL_KEYS,
  BRP_SCHOLAR_FIXED_SKILL_KEYS,
  type BrpDetectiveElectiveSkillKey,
} from "./professions.js";
import {
  BRP_DEFAULT_STARTING_AGE_MAXIMUM,
  BRP_DEFAULT_STARTING_AGE_MINIMUM,
  BRP_FIRST_SLICE_MAXIMUM_AGE,
  calculateBrpProfessionalAgeAdjustment,
  getBrpPowerLevelRules,
} from "./powerLevel.js";
import { BRP_UGE_ORC_1_05_SOURCE } from "./rulesSource.js";
import {
  brpSkillIdentityKey,
  identifyBrpSkillDefinition,
  resolveBrpAcademicSkillDefinition,
  resolveBrpStaticSkillDefinition,
  type BrpResolvedSkillDefinition,
} from "./skills.js";

interface ValidatedRulesProfile {
  powerLevel: BrpPowerLevel;
  characteristicGeneration: BrpCharacteristicGeneration;
}

interface ValidatedCharacteristicGeneration {
  method: BrpCharacteristicGeneration;
  initial?: BrpCharacteristicValues;
  redistribution: BrpCharacteristicRedistributionTransfer[];
}

interface ValidatedIdentity {
  professionId: BrpProfessionId;
  allowedProfessionalSkills: Map<string, BrpResolvedSkillDefinition>;
  professionalSkillPoints: number;
}

export const brpUge105Adapter: RulesSystemAdapter = {
  adapterId: "brp-uge",
  adapterVersion: "0.4.0",
  systemId: "brp",
  editionId: "uge-2023",
  supportedRulesSources: [BRP_UGE_ORC_1_05_SOURCE],
  validateNativeState,
};

function validateNativeState(state: NativeSystemState): RulesValidationResult {
  const issues: RulesValidationIssue[] = [];

  if (state.systemId !== "brp") {
    error(issues, "brp.envelope.system", "BRP native state must use systemId brp.", "systemId");
  }
  if (state.editionId !== "uge-2023") {
    error(issues, "brp.envelope.edition", "BRP native state must use editionId uge-2023.", "editionId");
  }
  if (state.rulesVersion !== BRP_UGE_ORC_1_05_SOURCE.version) {
    error(issues, "brp.envelope.rules-version", `BRP native state must use rules version ${BRP_UGE_ORC_1_05_SOURCE.version}.`, "rulesVersion");
  }
  if (state.schemaVersion !== "brp-character/0.1") {
    error(issues, "brp.envelope.schema", "BRP first slice requires brp-character/0.1.", "schemaVersion");
  }

  if (!isObject(state.payload)) {
    error(issues, "brp.payload.object", "BRP native payload must be an object.", "payload");
    return result(issues);
  }

  const payload = state.payload;
  if (payload.schemaVersion !== "brp-character/0.1") {
    error(issues, "brp.payload.schema", "BRP payload schemaVersion must be brp-character/0.1.", "payload.schemaVersion");
  }
  if (!isStringArray(payload.rulesSourceIds) || payload.rulesSourceIds.length !== 1 || payload.rulesSourceIds[0] !== BRP_UGE_ORC_1_05_SOURCE.id) {
    error(issues, "brp.payload.rules-source", "BRP first slice must retain exactly the UGE ORC 1.05 rules source.", "payload.rulesSourceIds");
  }

  const rulesProfile = validateRulesProfile(payload.rulesProfile, issues);
  const generation = validateCharacteristicGenerationState(
    payload.characteristicGenerationState,
    rulesProfile?.characteristicGeneration ?? null,
    issues,
  );
  const characteristics = validateCharacteristics(payload.characteristics, generation, issues);
  const identity = validateIdentity(
    payload.identity,
    rulesProfile?.powerLevel ?? null,
    characteristics,
    issues,
  );

  if (characteristics) {
    validateCharacteristicRolls(payload.characteristicRolls, characteristics, issues);
    validateDerived(payload.derived, characteristics, issues);
    validateSkills(
      payload.skillBudgets,
      payload.skills,
      characteristics,
      identity,
      rulesProfile?.powerLevel ?? null,
      issues,
    );
  }

  if (!Array.isArray(payload.equipment) || !payload.equipment.every((entry) => typeof entry === "string")) {
    error(issues, "brp.equipment.shape", "BRP first-slice equipment must be a string array.", "payload.equipment");
  }

  return result(issues);
}

function validateRulesProfile(
  value: unknown,
  issues: RulesValidationIssue[],
): ValidatedRulesProfile | null {
  if (!isObject(value)) {
    error(issues, "brp.rules-profile.shape", "BRP rules profile must be retained as native state.", "payload.rulesProfile");
    return null;
  }

  let powerLevel: BrpPowerLevel | null = null;
  if (value.powerLevel === "normal" || value.powerLevel === "heroic") {
    powerLevel = value.powerLevel;
  } else {
    error(
      issues,
      "brp.rules-profile.power-level",
      "BRP first slice supports Normal or Heroic power level.",
      "payload.rulesProfile.powerLevel",
    );
  }

  let characteristicGeneration: BrpCharacteristicGeneration | null = null;
  if (value.characteristicGeneration === "explicit" || value.characteristicGeneration === "standard-rolled") {
    characteristicGeneration = value.characteristicGeneration;
  } else {
    error(
      issues,
      "brp.rules-profile.characteristics",
      "BRP first slice supports explicit or standard-rolled characteristic generation.",
      "payload.rulesProfile.characteristicGeneration",
    );
  }

  if (!isEmptyStringArray(value.enabledOptions)) {
    error(issues, "brp.rules-profile.options", "BRP first slice does not enable optional rules.", "payload.rulesProfile.enabledOptions");
  }
  if (!isEmptyStringArray(value.enabledPowerSystems)) {
    error(issues, "brp.rules-profile.powers", "BRP first slice is non-powered.", "payload.rulesProfile.enabledPowerSystems");
  }

  return powerLevel && characteristicGeneration
    ? { powerLevel, characteristicGeneration }
    : null;
}

function validateCharacteristicGenerationState(
  value: unknown,
  method: BrpCharacteristicGeneration | null,
  issues: RulesValidationIssue[],
): ValidatedCharacteristicGeneration | null {
  if (!method) return null;

  if (method === "explicit") {
    if (value === undefined) {
      return { method: "explicit", redistribution: [] };
    }
    if (!isObject(value) || value.method !== "explicit") {
      error(
        issues,
        "brp.characteristic-generation.explicit",
        "Explicit BRP characteristic state must identify the explicit generation method.",
        "payload.characteristicGenerationState",
      );
    }
    return { method: "explicit", redistribution: [] };
  }

  if (!isObject(value) || value.method !== "standard-rolled") {
    error(
      issues,
      "brp.characteristic-generation.shape",
      "Standard rolled BRP characteristics must retain generation state.",
      "payload.characteristicGenerationState",
    );
    return null;
  }
  if (typeof value.seed !== "string" || !value.seed.trim()) {
    error(
      issues,
      "brp.characteristic-generation.seed",
      "Standard rolled BRP characteristics must retain a non-empty seed.",
      "payload.characteristicGenerationState.seed",
    );
    return null;
  }
  if (!isObject(value.rolls)) {
    error(
      issues,
      "brp.characteristic-generation.rolls",
      "Standard rolled BRP characteristics must retain raw dice for every characteristic.",
      "payload.characteristicGenerationState.rolls",
    );
    return null;
  }

  const random = createSeededRandom(value.seed);
  const initial = {} as BrpCharacteristicValues;
  for (const id of BRP_STANDARD_CHARACTERISTIC_ROLL_ORDER) {
    const expected = rollDiceExpression(BRP_STANDARD_CHARACTERISTIC_EXPRESSIONS[id], random);
    initial[id] = expected.total;
    const actual = value.rolls[id];
    if (!isObject(actual)
      || actual.notation !== expected.notation
      || actual.modifier !== expected.modifier
      || actual.total !== expected.total
      || !numberArraysEqual(actual.rolls, expected.rolls)) {
      error(
        issues,
        "brp.characteristic-generation.rolls",
        `${id} raw dice do not match the retained BRP generation seed and recipe.`,
        `payload.characteristicGenerationState.rolls.${id}`,
      );
    }
  }

  const redistribution = validateRedistributionState(value.redistribution, issues);
  return { method: "standard-rolled", initial, redistribution };
}

function validateRedistributionState(
  value: unknown,
  issues: RulesValidationIssue[],
): BrpCharacteristicRedistributionTransfer[] {
  if (!Array.isArray(value)) {
    error(
      issues,
      "brp.characteristic-generation.redistribution",
      "Standard rolled BRP characteristics must retain redistribution transfers.",
      "payload.characteristicGenerationState.redistribution",
    );
    return [];
  }

  const result: BrpCharacteristicRedistributionTransfer[] = [];
  let totalPoints = 0;
  for (let index = 0; index < value.length; index += 1) {
    const transfer = value[index];
    const path = `payload.characteristicGenerationState.redistribution.${index}`;
    if (!isObject(transfer)
      || !isCharacteristicId(transfer.from)
      || !isCharacteristicId(transfer.to)
      || transfer.from === transfer.to
      || !isInteger(transfer.points)
      || transfer.points <= 0) {
      error(
        issues,
        "brp.characteristic-generation.redistribution",
        "BRP redistribution transfers require different valid characteristics and positive integer points.",
        path,
      );
      continue;
    }
    totalPoints += transfer.points;
    result.push({ from: transfer.from, to: transfer.to, points: transfer.points });
  }

  if (totalPoints > BRP_STANDARD_REDISTRIBUTION_POINT_LIMIT) {
    error(
      issues,
      "brp.characteristic-generation.redistribution-limit",
      `Standard BRP redistribution may move at most ${BRP_STANDARD_REDISTRIBUTION_POINT_LIMIT} points.`,
      "payload.characteristicGenerationState.redistribution",
    );
  }
  return result;
}

function validateIdentity(
  value: unknown,
  powerLevel: BrpPowerLevel | null,
  characteristics: BrpCharacteristicValues | null,
  issues: RulesValidationIssue[],
): ValidatedIdentity | null {
  if (!isObject(value)) {
    error(issues, "brp.identity.shape", "BRP identity state is required.", "payload.identity");
    return null;
  }

  const age = value.age;
  if (!isInteger(age) || age < BRP_DEFAULT_STARTING_AGE_MINIMUM || age > BRP_FIRST_SLICE_MAXIMUM_AGE) {
    error(
      issues,
      "brp.identity.age",
      `BRP first-slice age must be an integer from ${BRP_DEFAULT_STARTING_AGE_MINIMUM} through ${BRP_FIRST_SLICE_MAXIMUM_AGE}.`,
      "payload.identity.age",
    );
  }
  if (typeof value.gender !== "string" || !value.gender.trim()) {
    error(issues, "brp.identity.gender", "BRP first-slice gender must be non-empty.", "payload.identity.gender");
  }
  if (!isObject(value.profession)) {
    error(issues, "brp.profession.shape", "BRP profession state is required.", "payload.identity.profession");
    return null;
  }

  const profession = validateProfession(value.profession, characteristics, issues);

  let professionalSkillPoints = powerLevel
    ? getBrpPowerLevelRules(powerLevel).baseProfessionalSkillPoints
    : 0;

  if (powerLevel && isInteger(age)) {
    professionalSkillPoints = validateAgeBasis(
      value.ageBasis,
      age,
      powerLevel,
      professionalSkillPoints,
      issues,
    );
  }

  if (!profession) return null;
  return {
    professionId: profession.professionId,
    allowedProfessionalSkills: profession.allowedProfessionalSkills,
    professionalSkillPoints,
  };
}

function validateProfession(
  value: JsonObject,
  characteristics: BrpCharacteristicValues | null,
  issues: RulesValidationIssue[],
): Pick<ValidatedIdentity, "professionId" | "allowedProfessionalSkills"> | null {
  if (value.wealth !== "average" && value.wealth !== "affluent") {
    error(
      issues,
      "brp.profession.wealth",
      "Current BRP Detective and Scholar profiles require Average or Affluent wealth.",
      "payload.identity.profession.wealth",
    );
  }

  if (value.professionId === "detective") {
    const selected = value.selectedElectiveSkillIds;
    if (!isStringArray(selected) || selected.length !== 4 || new Set(selected).size !== 4) {
      error(
        issues,
        "brp.profession.electives",
        "Detective must retain exactly four unique elective skill IDs.",
        "payload.identity.profession.selectedElectiveSkillIds",
      );
      return null;
    }
    const allowedElectives = new Set<string>(BRP_DETECTIVE_ELECTIVE_SKILL_KEYS);
    if (selected.some((entry) => !allowedElectives.has(entry))) {
      error(
        issues,
        "brp.profession.electives",
        "Detective retains an unsupported elective skill ID.",
        "payload.identity.profession.selectedElectiveSkillIds",
      );
      return null;
    }

    const allowedProfessionalSkills = new Map<string, BrpResolvedSkillDefinition>();
    if (characteristics) {
      for (const skillKey of [
        ...BRP_DETECTIVE_REQUIRED_SKILL_KEYS,
        ...(selected as BrpDetectiveElectiveSkillKey[]),
      ]) {
        const definition = resolveBrpStaticSkillDefinition(skillKey, characteristics);
        allowedProfessionalSkills.set(definition.key, definition);
      }
    }
    return { professionId: "detective", allowedProfessionalSkills };
  }

  if (value.professionId === "scholar") {
    const selected = value.selectedAcademicSkills;
    if (!Array.isArray(selected) || selected.length !== 5) {
      error(
        issues,
        "brp.profession.academic-skills",
        "Scholar must retain exactly five Knowledge or Science specialty choices.",
        "payload.identity.profession.selectedAcademicSkills",
      );
      return null;
    }

    const allowedProfessionalSkills = new Map<string, BrpResolvedSkillDefinition>();
    if (characteristics) {
      for (const skillKey of BRP_SCHOLAR_FIXED_SKILL_KEYS) {
        const definition = resolveBrpStaticSkillDefinition(skillKey, characteristics);
        allowedProfessionalSkills.set(definition.key, definition);
      }
    }

    const seen = new Set<string>();
    let validAcademicSelections = true;
    for (let index = 0; index < selected.length; index += 1) {
      const selection = selected[index];
      const path = `payload.identity.profession.selectedAcademicSkills.${index}`;
      if (!isObject(selection)
        || (selection.skillId !== "knowledge" && selection.skillId !== "science")
        || !isSpecialty(selection.specialty)
        || !selection.specialty.id.trim()
        || !selection.specialty.label.trim()) {
        error(
          issues,
          "brp.profession.academic-skills",
          "Scholar academic choices require a Knowledge or Science parent and non-empty specialty ID and label.",
          path,
        );
        validAcademicSelections = false;
        continue;
      }

      const specialty = {
        id: selection.specialty.id.trim(),
        label: selection.specialty.label.trim(),
      };
      const key = brpSkillIdentityKey(selection.skillId, specialty);
      if (seen.has(key)) {
        error(
          issues,
          "brp.profession.academic-duplicate",
          "Scholar academic specialty choices must be unique by parent skill and specialty ID.",
          path,
        );
        validAcademicSelections = false;
        continue;
      }
      seen.add(key);

      if (characteristics) {
        const definition = resolveBrpAcademicSkillDefinition({
          skillId: selection.skillId,
          specialty,
        });
        allowedProfessionalSkills.set(definition.key, definition);
      }
    }

    if (!validAcademicSelections) return null;
    return { professionId: "scholar", allowedProfessionalSkills };
  }

  error(
    issues,
    "brp.profession.id",
    "BRP first slice supports Detective or Scholar.",
    "payload.identity.profession.professionId",
  );
  return null;
}

function validateAgeBasis(
  value: unknown,
  age: number,
  powerLevel: BrpPowerLevel,
  baseProfessionalSkillPoints: number,
  issues: RulesValidationIssue[],
): number {
  if (value === undefined && powerLevel === "normal") {
    return baseProfessionalSkillPoints;
  }
  if (!isObject(value)) {
    error(
      issues,
      "brp.identity.age-basis",
      "Heroic BRP characters must retain the default starting age used for professional-skill age adjustments.",
      "payload.identity.ageBasis",
    );
    return baseProfessionalSkillPoints;
  }
  if (value.method !== "default-starting-age") {
    error(
      issues,
      "brp.identity.age-basis",
      "BRP first-slice age basis must use default-starting-age.",
      "payload.identity.ageBasis.method",
    );
  }

  const defaultStartingAge = value.defaultStartingAge;
  if (!isInteger(defaultStartingAge)
    || defaultStartingAge < BRP_DEFAULT_STARTING_AGE_MINIMUM
    || defaultStartingAge > BRP_DEFAULT_STARTING_AGE_MAXIMUM) {
    error(
      issues,
      "brp.identity.default-starting-age",
      `BRP default starting age must be an integer from ${BRP_DEFAULT_STARTING_AGE_MINIMUM} through ${BRP_DEFAULT_STARTING_AGE_MAXIMUM}.`,
      "payload.identity.ageBasis.defaultStartingAge",
    );
    return baseProfessionalSkillPoints;
  }
  if (age < defaultStartingAge) {
    error(
      issues,
      "brp.identity.age-below-start",
      "BRP first-slice age must not be below the retained default starting age.",
      "payload.identity.age",
    );
    return baseProfessionalSkillPoints;
  }

  const expectedAddedYears = age - defaultStartingAge;
  if (value.addedYears !== expectedAddedYears) {
    error(
      issues,
      "brp.identity.age-added-years",
      "BRP retained added years must match current age minus default starting age.",
      "payload.identity.ageBasis.addedYears",
    );
  }

  const expectedAdjustment = calculateBrpProfessionalAgeAdjustment(powerLevel, age, defaultStartingAge);
  if (value.professionalSkillPointAdjustment !== expectedAdjustment) {
    error(
      issues,
      "brp.identity.age-skill-adjustment",
      "BRP professional skill-point age adjustment does not match the retained power level and starting age.",
      "payload.identity.ageBasis.professionalSkillPointAdjustment",
    );
  }

  return baseProfessionalSkillPoints + expectedAdjustment;
}

function validateCharacteristics(
  value: unknown,
  generation: ValidatedCharacteristicGeneration | null,
  issues: RulesValidationIssue[],
): BrpCharacteristicValues | null {
  if (!isObject(value)) {
    error(issues, "brp.characteristics.shape", "BRP characteristic state is required.", "payload.characteristics");
    return null;
  }

  const explicitRanges: Record<BrpCharacteristicId, [number, number]> = {
    STR: [3, 21],
    CON: [3, 21],
    SIZ: [8, 21],
    INT: [8, 21],
    POW: [3, 21],
    DEX: [3, 21],
    CHA: [3, 21],
  };
  const parsed = {} as BrpCharacteristicValues;

  for (const id of BRP_CHARACTERISTIC_IDS) {
    const characteristic = value[id];
    if (!isObject(characteristic)
      || !isInteger(characteristic.initial)
      || !isInteger(characteristic.final)
      || !Array.isArray(characteristic.adjustments)) {
      error(
        issues,
        "brp.characteristics.entry",
        `${id} must retain initial, adjustments, and final state.`,
        `payload.characteristics.${id}`,
      );
      return null;
    }

    if (generation?.method === "standard-rolled" && generation.initial) {
      const expectedInitial = generation.initial[id];
      if (characteristic.initial !== expectedInitial) {
        error(
          issues,
          "brp.characteristics.roll-origin",
          `${id} initial value does not match its retained standard roll.`,
          `payload.characteristics.${id}.initial`,
        );
      }
      const expectedAdjustments = expectedRedistributionAdjustments(id, generation.redistribution);
      if (!adjustmentsEqual(characteristic.adjustments, expectedAdjustments)) {
        error(
          issues,
          "brp.characteristics.redistribution",
          `${id} adjustments do not match retained standard redistribution transfers.`,
          `payload.characteristics.${id}.adjustments`,
        );
      }
      const expectedFinal = expectedInitial + expectedAdjustments.reduce((sum, adjustment) => sum + adjustment.amount, 0);
      if (characteristic.final !== expectedFinal) {
        error(
          issues,
          "brp.characteristics.final",
          `${id} final value does not match its rolled initial value and redistribution.`,
          `payload.characteristics.${id}.final`,
        );
      }
      if (characteristic.final < 1 || characteristic.final > 21) {
        error(
          issues,
          "brp.characteristics.range",
          `${id} is outside the supported standard-rolled starting range.`,
          `payload.characteristics.${id}.final`,
        );
      }
    } else {
      const [minimum, maximum] = explicitRanges[id];
      if (characteristic.initial !== characteristic.final || characteristic.adjustments.length !== 0) {
        error(
          issues,
          "brp.characteristics.adjustments",
          `Explicit BRP ${id} must have no characteristic adjustments.`,
          `payload.characteristics.${id}`,
        );
      }
      if (characteristic.final < minimum || characteristic.final > maximum) {
        error(
          issues,
          "brp.characteristics.range",
          `${id} is outside the supported explicit-entry range.`,
          `payload.characteristics.${id}.final`,
        );
      }
    }
    parsed[id] = characteristic.final;
  }
  return parsed;
}

function expectedRedistributionAdjustments(
  id: BrpCharacteristicId,
  redistribution: readonly BrpCharacteristicRedistributionTransfer[],
): Array<{ sourceId: string; amount: number }> {
  const expected: Array<{ sourceId: string; amount: number }> = [];
  for (const transfer of redistribution) {
    if (transfer.from === id) {
      expected.push({ sourceId: BRP_STANDARD_REDISTRIBUTION_SOURCE_ID, amount: -transfer.points });
    }
    if (transfer.to === id) {
      expected.push({ sourceId: BRP_STANDARD_REDISTRIBUTION_SOURCE_ID, amount: transfer.points });
    }
  }
  return expected;
}

function validateCharacteristicRolls(
  value: unknown,
  characteristics: BrpCharacteristicValues,
  issues: RulesValidationIssue[],
): void {
  if (!isObject(value)) {
    error(issues, "brp.characteristic-rolls.shape", "BRP characteristic rolls are required.", "payload.characteristicRolls");
    return;
  }
  const expected: Record<string, number> = {
    effort: characteristics.STR * 5,
    stamina: characteristics.CON * 5,
    idea: characteristics.INT * 5,
    luck: characteristics.POW * 5,
    agility: characteristics.DEX * 5,
    charisma: characteristics.CHA * 5,
  };
  for (const [key, expectedValue] of Object.entries(expected)) {
    if (value[key] !== expectedValue) {
      error(issues, "brp.characteristic-rolls.value", `${key} characteristic roll is incorrect.`, `payload.characteristicRolls.${key}`);
    }
  }
}

function validateDerived(
  value: unknown,
  characteristics: BrpCharacteristicValues,
  issues: RulesValidationIssue[],
): void {
  if (!isObject(value)) {
    error(issues, "brp.derived.shape", "BRP derived state is required.", "payload.derived");
    return;
  }
  const expected = calculateBrpDerivedState(characteristics);
  for (const key of ["hitPoints", "majorWoundLevel", "powerPoints", "experienceBonus", "move", "damageModifier"] as const) {
    if (value[key] !== expected[key]) {
      error(issues, "brp.derived.value", `BRP derived ${key} is incorrect.`, `payload.derived.${key}`);
    }
  }
}

function validateSkills(
  budgetsValue: unknown,
  skillsValue: unknown,
  characteristics: BrpCharacteristicValues,
  identity: ValidatedIdentity | null,
  powerLevel: BrpPowerLevel | null,
  issues: RulesValidationIssue[],
): void {
  if (!isObject(budgetsValue) || !isObject(budgetsValue.professional) || !isObject(budgetsValue.personal)) {
    error(issues, "brp.skill-budgets.shape", "BRP skill budgets are required.", "payload.skillBudgets");
    return;
  }

  const personalTotal = characteristics.INT * 10;
  const expectedProfessionalTotal = identity?.professionalSkillPoints;
  const startingSkillCap = powerLevel ? getBrpPowerLevelRules(powerLevel).startingSkillCap : null;
  const powerLevelLabel = powerLevel === "heroic" ? "Heroic" : "Normal";

  if (expectedProfessionalTotal !== undefined
    && (budgetsValue.professional.total !== expectedProfessionalTotal
      || budgetsValue.professional.spent !== expectedProfessionalTotal)) {
    error(
      issues,
      "brp.skill-budgets.professional",
      `${powerLevelLabel} BRP professional budget must retain ${expectedProfessionalTotal} points spent of ${expectedProfessionalTotal} for the retained age profile.`,
      "payload.skillBudgets.professional",
    );
  }
  if (budgetsValue.personal.total !== personalTotal || budgetsValue.personal.spent !== personalTotal) {
    error(issues, "brp.skill-budgets.personal", `BRP personal budget must retain INT x 10 (${personalTotal}) points spent.`, "payload.skillBudgets.personal");
  }
  if (!Array.isArray(skillsValue)) {
    error(issues, "brp.skills.shape", "BRP skills must be an array.", "payload.skills");
    return;
  }

  const seen = new Set<string>();
  let professionalSpent = 0;
  let personalSpent = 0;

  for (let index = 0; index < skillsValue.length; index += 1) {
    const skill = skillsValue[index];
    const path = `payload.skills.${index}`;
    if (!isObject(skill) || !isObject(skill.contributions)) {
      error(issues, "brp.skills.entry", "BRP skill entries must retain contribution state.", path);
      continue;
    }

    const definition = identifyBrpSkillDefinition(skill.skillId, skill.specialty, characteristics);
    if (!definition) {
      error(issues, "brp.skills.identity", "BRP first slice contains an unknown or malformed skill identity.", path);
      continue;
    }
    if (seen.has(definition.key)) {
      error(issues, "brp.skills.duplicate", `BRP skill ${definition.label} is duplicated.`, path);
      continue;
    }
    seen.add(definition.key);

    if (skill.label !== definition.label || skill.baseChance !== definition.baseChance) {
      error(issues, "brp.skills.base", `BRP skill ${definition.label} has incorrect source identity or base chance.`, path);
    }

    const professional = skill.contributions.professional;
    const personal = skill.contributions.personal;
    if (!isNonNegativeInteger(professional) || !isNonNegativeInteger(personal)) {
      error(issues, "brp.skills.contributions", `BRP skill ${definition.label} contributions must be non-negative integers.`, `${path}.contributions`);
      continue;
    }

    if (professional > 0) {
      const allowed = identity?.allowedProfessionalSkills.get(definition.key);
      if (!allowed || !skillDefinitionsEqual(allowed, definition)) {
        const professionLabel = identity?.professionId ?? "retained";
        error(
          issues,
          "brp.skills.profession",
          `BRP skill ${definition.label} is not eligible for the selected ${professionLabel} professional allocation.`,
          `${path}.contributions.professional`,
        );
      }
    }

    const professionalRating = definition.baseChance + professional;
    const finalRating = professionalRating + personal;
    if (startingSkillCap !== null && (professionalRating > startingSkillCap || finalRating > startingSkillCap)) {
      error(
        issues,
        "brp.skills.cap",
        `BRP skill ${definition.label} exceeds the ${powerLevelLabel} starting cap of ${startingSkillCap}%.`,
        path,
      );
    }
    if (skill.finalRating !== finalRating) {
      error(issues, "brp.skills.final", `BRP skill ${definition.label} final rating does not match its retained causal layers.`, `${path}.finalRating`);
    }
    professionalSpent += professional;
    personalSpent += personal;
  }

  if (expectedProfessionalTotal !== undefined && professionalSpent !== expectedProfessionalTotal) {
    error(
      issues,
      "brp.skills.professional-total",
      `Retained professional skill contributions do not total ${expectedProfessionalTotal}.`,
      "payload.skills",
    );
  }
  if (personalSpent !== personalTotal) {
    error(issues, "brp.skills.personal-total", `Retained personal skill contributions do not total ${personalTotal}.`, "payload.skills");
  }
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

function adjustmentsEqual(
  actual: unknown[],
  expected: ReadonlyArray<{ sourceId: string; amount: number }>,
): boolean {
  if (actual.length !== expected.length) return false;
  return actual.every((entry, index) => {
    const expectedEntry = expected[index];
    return isObject(entry)
      && entry.sourceId === expectedEntry?.sourceId
      && entry.amount === expectedEntry?.amount;
  });
}

function numberArraysEqual(value: unknown, expected: readonly number[]): boolean {
  return Array.isArray(value)
    && value.length === expected.length
    && value.every((entry, index) => entry === expected[index]);
}

function isCharacteristicId(value: unknown): value is BrpCharacteristicId {
  return typeof value === "string" && (BRP_CHARACTERISTIC_IDS as readonly string[]).includes(value);
}

function isSpecialty(value: unknown): value is BrpSkillSpecialty {
  return isObject(value)
    && typeof value.id === "string"
    && typeof value.label === "string";
}

function result(issues: RulesValidationIssue[]): RulesValidationResult {
  return { valid: !issues.some((issue) => issue.severity === "error"), issues };
}

function error(issues: RulesValidationIssue[], code: string, message: string, path: string): void {
  issues.push({ code, message, severity: "error", path });
}

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return isInteger(value) && value >= 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isEmptyStringArray(value: unknown): value is string[] {
  return isStringArray(value) && value.length === 0;
}
