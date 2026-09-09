import type {
  JsonObject,
  NativeSystemState,
  RulesSystemAdapter,
  RulesValidationIssue,
  RulesValidationResult,
} from "../../character-model/src/index.js";
import { brpUge105Adapter as brpUge105BaseAdapter } from "./adapter.js";
import { calculateBrpDerivedState } from "./firstSlice.js";
import type {
  BrpCharacteristicId,
  BrpCharacteristicValues,
} from "./nativeCharacter.js";
import {
  BRP_SUPERPOWERS_BUDGET_METHOD,
  BRP_SUPERPOWERS_SYSTEM_ID,
  calculateBrpPoweredDerivedState,
  calculateBrpSuperpowerCharacterPointBudget,
  type BrpSuperpowerPowerLevel,
  type BrpSuperpowerState,
  type BrpSuperpowerSystemState,
} from "./superpowers.js";

const BRP_CHARACTERISTIC_IDS: BrpCharacteristicId[] = [
  "STR",
  "CON",
  "SIZ",
  "INT",
  "POW",
  "DEX",
  "CHA",
];

export const brpUge105Adapter: RulesSystemAdapter = {
  ...brpUge105BaseAdapter,
  adapterVersion: "0.6.0",
  validateNativeState,
};

function validateNativeState(state: NativeSystemState): RulesValidationResult {
  if (!isObject(state.payload)) {
    return brpUge105BaseAdapter.validateNativeState(state);
  }

  const issues: RulesValidationIssue[] = [];
  const payload = state.payload;
  const rulesProfile = isObject(payload.rulesProfile) ? payload.rulesProfile : null;
  const enabledPowerSystems = rulesProfile?.enabledPowerSystems;

  if (!isStringArray(enabledPowerSystems)) {
    const base = validateBaseStateWithPowersRemoved(state);
    issues.push(...base.issues);
    error(
      issues,
      "brp.rules-profile.powers",
      "BRP enabledPowerSystems must be retained as an array of supported power-system IDs.",
      "payload.rulesProfile.enabledPowerSystems",
    );
    return result(issues);
  }

  if (enabledPowerSystems.length === 0) {
    const base = brpUge105BaseAdapter.validateNativeState(state);
    issues.push(...base.issues);
    if (payload.powerSystems !== undefined) {
      error(
        issues,
        "brp.power-systems.disabled-state",
        "BRP native state must not retain power-system state when no power system is enabled.",
        "payload.powerSystems",
      );
    }
    return result(issues);
  }

  if (enabledPowerSystems.length !== 1 || enabledPowerSystems[0] !== BRP_SUPERPOWERS_SYSTEM_ID) {
    const base = validateBaseStateWithPowersRemoved(state);
    issues.push(...base.issues);
    error(
      issues,
      "brp.rules-profile.powers",
      "This BRP powered slice supports exactly the Superpowers power system when powers are enabled.",
      "payload.rulesProfile.enabledPowerSystems",
    );
    return result(issues);
  }

  const base = validateBaseStateWithPowersRemoved(state);
  issues.push(...base.issues);

  const initialCharacteristics = readCharacteristics(payload.characteristics, "initial");
  const finalCharacteristics = readCharacteristics(payload.characteristics, "final");
  if (!initialCharacteristics || !finalCharacteristics) {
    return result(issues);
  }

  const superpowers = validateSuperpowerSystems(
    payload.powerSystems,
    initialCharacteristics,
    issues,
  );
  if (superpowers) {
    validatePoweredDerived(payload.derived, finalCharacteristics, superpowers, issues);
  }

  return result(issues);
}

function validateBaseStateWithPowersRemoved(state: NativeSystemState): RulesValidationResult {
  const baseState = structuredClone(state);
  if (!isObject(baseState.payload)) {
    return brpUge105BaseAdapter.validateNativeState(baseState);
  }
  const payload = baseState.payload;
  if (isObject(payload.rulesProfile)) {
    payload.rulesProfile.enabledPowerSystems = [];
  }
  delete payload.powerSystems;

  const finalCharacteristics = readCharacteristics(payload.characteristics, "final");
  if (finalCharacteristics) {
    payload.derived = calculateBrpDerivedState(finalCharacteristics);
  }
  return brpUge105BaseAdapter.validateNativeState(baseState);
}

function validateSuperpowerSystems(
  value: unknown,
  initialCharacteristics: BrpCharacteristicValues,
  issues: RulesValidationIssue[],
): BrpSuperpowerSystemState | null {
  if (!Array.isArray(value) || value.length !== 1 || !isObject(value[0])) {
    error(
      issues,
      "brp.power-systems.shape",
      "Enabled BRP Superpowers require exactly one retained Superpowers state.",
      "payload.powerSystems",
    );
    return null;
  }

  const system = value[0];
  if (system.systemId !== BRP_SUPERPOWERS_SYSTEM_ID) {
    error(
      issues,
      "brp.power-systems.id",
      "Retained BRP power-system state must identify Superpowers.",
      "payload.powerSystems.0.systemId",
    );
    return null;
  }

  let powerLevel: BrpSuperpowerPowerLevel | null = null;
  if (system.powerLevel === "normal" || system.powerLevel === "heroic") {
    powerLevel = system.powerLevel;
  } else {
    error(
      issues,
      "brp.superpowers.power-level",
      "This BRP Superpowers slice supports Normal or Heroic power level independently of the skill-construction profile.",
      "payload.powerSystems.0.powerLevel",
    );
  }

  const powers = validateSuperpowerEntries(system.powers, initialCharacteristics, issues);
  const budget = isObject(system.characterPointBudget) ? system.characterPointBudget : null;
  if (!budget) {
    error(
      issues,
      "brp.superpowers.budget.shape",
      "BRP Superpowers must retain a character-point budget.",
      "payload.powerSystems.0.characterPointBudget",
    );
  }

  if (!powerLevel || !powers || !budget) return null;

  const highestCharacteristicValue = Math.max(...Object.values(initialCharacteristics));
  const expectedTotal = calculateBrpSuperpowerCharacterPointBudget(powerLevel, initialCharacteristics);
  const expectedSpent = powers.reduce((sum, power) => sum + power.characterPointCost, 0);
  const expectedRemaining = expectedTotal - expectedSpent;

  if (budget.method !== BRP_SUPERPOWERS_BUDGET_METHOD) {
    error(
      issues,
      "brp.superpowers.budget.method",
      "BRP Superpowers character-point budget must retain the highest-characteristic source method.",
      "payload.powerSystems.0.characterPointBudget.method",
    );
  }
  if (budget.highestCharacteristicValue !== highestCharacteristicValue) {
    error(
      issues,
      "brp.superpowers.budget.characteristic",
      "BRP Superpowers highest-characteristic budget basis does not match retained initial characteristics.",
      "payload.powerSystems.0.characterPointBudget.highestCharacteristicValue",
    );
  }
  if (budget.total !== expectedTotal) {
    error(
      issues,
      "brp.superpowers.budget.total",
      "BRP Superpowers character-point total does not match the retained power level and initial characteristics.",
      "payload.powerSystems.0.characterPointBudget.total",
    );
  }
  if (expectedSpent > expectedTotal) {
    error(
      issues,
      "brp.superpowers.budget.overspent",
      "BRP Superpowers character-point selections exceed the retained source budget.",
      "payload.powerSystems.0.powers",
    );
  }
  if (budget.spent !== expectedSpent || budget.remaining !== expectedRemaining) {
    error(
      issues,
      "brp.superpowers.budget.causality",
      "BRP Superpowers spent and remaining character points must match retained power selections.",
      "payload.powerSystems.0.characterPointBudget",
    );
  }

  return {
    systemId: BRP_SUPERPOWERS_SYSTEM_ID,
    powerLevel,
    characterPointBudget: {
      method: BRP_SUPERPOWERS_BUDGET_METHOD,
      highestCharacteristicValue,
      total: expectedTotal,
      spent: expectedSpent,
      remaining: expectedRemaining,
    },
    powers,
  };
}

function validateSuperpowerEntries(
  value: unknown,
  initialCharacteristics: BrpCharacteristicValues,
  issues: RulesValidationIssue[],
): BrpSuperpowerState[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    error(
      issues,
      "brp.superpowers.powers.shape",
      "Enabled BRP Superpowers require at least one retained power.",
      "payload.powerSystems.0.powers",
    );
    return null;
  }

  const powers: BrpSuperpowerState[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < value.length; index += 1) {
    const entry = value[index];
    const path = `payload.powerSystems.0.powers.${index}`;
    if (!isObject(entry)
      || (entry.powerId !== "extra-energy" && entry.powerId !== "extra-hit-points")
      || !isPositiveInteger(entry.levels)) {
      error(
        issues,
        "brp.superpowers.power.shape",
        "This BRP Superpowers slice supports positive integer levels of Extra Energy or Extra Hit Points.",
        path,
      );
      continue;
    }
    if (seen.has(entry.powerId)) {
      error(
        issues,
        "brp.superpowers.power.duplicate",
        "BRP Superpowers must not repeat the same retained power ID.",
        path,
      );
      continue;
    }
    seen.add(entry.powerId);

    if (entry.characterPointCost !== entry.levels) {
      error(
        issues,
        "brp.superpowers.power.cost",
        "Extra Energy and Extra Hit Points cost one character point per retained level in this slice.",
        `${path}.characterPointCost`,
      );
    }
    if (entry.powerId === "extra-hit-points" && entry.levels > initialCharacteristics.CON) {
      error(
        issues,
        "brp.superpowers.extra-hit-points.limit",
        "BRP Extra Hit Points levels may not exceed the retained initial CON in this source profile.",
        `${path}.levels`,
      );
    }

    powers.push({
      powerId: entry.powerId,
      levels: entry.levels,
      characterPointCost: entry.levels,
    });
  }

  return powers.length === value.length ? powers : null;
}

function validatePoweredDerived(
  value: unknown,
  finalCharacteristics: BrpCharacteristicValues,
  superpowers: BrpSuperpowerSystemState,
  issues: RulesValidationIssue[],
): void {
  if (!isObject(value)) {
    error(
      issues,
      "brp.derived.shape",
      "Powered BRP derived state is required.",
      "payload.derived",
    );
    return;
  }

  const expected = calculateBrpPoweredDerivedState(finalCharacteristics, superpowers);
  for (const key of [
    "hitPoints",
    "majorWoundLevel",
    "powerPoints",
    "experienceBonus",
    "move",
    "damageModifier",
  ] as const) {
    if (value[key] !== expected[key]) {
      error(
        issues,
        "brp.derived.powered-value",
        `Powered BRP derived ${key} is incorrect for the retained Superpowers state.`,
        `payload.derived.${key}`,
      );
    }
  }
}

function readCharacteristics(
  value: unknown,
  layer: "initial" | "final",
): BrpCharacteristicValues | null {
  if (!isObject(value)) return null;
  const result = {} as BrpCharacteristicValues;
  for (const id of BRP_CHARACTERISTIC_IDS) {
    const entry = value[id];
    if (!isObject(entry) || !isInteger(entry[layer])) return null;
    result[id] = entry[layer] as number;
  }
  return result;
}

function result(issues: RulesValidationIssue[]): RulesValidationResult {
  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    issues,
  };
}

function error(
  issues: RulesValidationIssue[],
  code: string,
  message: string,
  path: string,
): void {
  issues.push({ code, message, severity: "error", path });
}

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function isPositiveInteger(value: unknown): value is number {
  return isInteger(value) && value > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}
