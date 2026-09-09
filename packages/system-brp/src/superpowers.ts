import type {
  CharacterDocument,
  GenerationDecision,
  JsonObject,
} from "../../character-model/src/index.js";
import {
  buildBrpFirstSliceCharacter,
  buildBrpStandardRolledFirstSliceCharacter,
  calculateBrpDerivedState,
  type BrpFirstSliceInput,
  type BrpScholarFirstSliceInput,
  type BrpScholarStandardRolledFirstSliceInput,
  type BrpStandardRolledFirstSliceInput,
} from "./firstSlice.js";
import type {
  BrpCharacteristicId,
  BrpCharacteristicValues,
  BrpNativeCharacter,
} from "./nativeCharacter.js";

export const BRP_SUPERPOWERS_SYSTEM_ID = "superpowers" as const;
export const BRP_SUPERPOWERS_BUDGET_METHOD = "highest-characteristic" as const;

export type BrpSuperpowerPowerLevel = "normal" | "heroic";
export type BrpSupportedSuperpowerId = "extra-energy" | "extra-hit-points";

export interface BrpSuperpowerSelectionInput {
  powerId: BrpSupportedSuperpowerId;
  levels: number;
}

export interface BrpSuperpowersCreationInput {
  powerLevel: BrpSuperpowerPowerLevel;
  powers: BrpSuperpowerSelectionInput[];
}

export interface BrpSuperpowerState extends JsonObject {
  powerId: BrpSupportedSuperpowerId;
  levels: number;
  characterPointCost: number;
}

export interface BrpSuperpowerCharacterPointBudgetState extends JsonObject {
  method: typeof BRP_SUPERPOWERS_BUDGET_METHOD;
  highestCharacteristicValue: number;
  total: number;
  spent: number;
  remaining: number;
}

export interface BrpSuperpowerSystemState extends JsonObject {
  systemId: typeof BRP_SUPERPOWERS_SYSTEM_ID;
  powerLevel: BrpSuperpowerPowerLevel;
  characterPointBudget: BrpSuperpowerCharacterPointBudgetState;
  powers: BrpSuperpowerState[];
}

export interface BrpPoweredNativeCharacter extends BrpNativeCharacter {
  powerSystems: BrpSuperpowerSystemState[];
}

export type BrpPoweredFirstSliceInput = BrpFirstSliceInput & {
  superpowers: BrpSuperpowersCreationInput;
};

export type BrpPoweredScholarFirstSliceInput = BrpScholarFirstSliceInput & {
  superpowers: BrpSuperpowersCreationInput;
};

export type BrpPoweredStandardRolledFirstSliceInput = BrpStandardRolledFirstSliceInput & {
  superpowers: BrpSuperpowersCreationInput;
};

export type BrpPoweredScholarStandardRolledFirstSliceInput = BrpScholarStandardRolledFirstSliceInput & {
  superpowers: BrpSuperpowersCreationInput;
};

export function calculateBrpSuperpowerCharacterPointBudget(
  powerLevel: BrpSuperpowerPowerLevel,
  initialCharacteristics: BrpCharacteristicValues,
): number {
  const highestCharacteristicValue = highestCharacteristic(initialCharacteristics);
  return powerLevel === "normal"
    ? Math.ceil(highestCharacteristicValue / 2)
    : highestCharacteristicValue;
}

export function resolveBrpSuperpowerSystemState(
  input: BrpSuperpowersCreationInput,
  initialCharacteristics: BrpCharacteristicValues,
): BrpSuperpowerSystemState {
  if (!Array.isArray(input.powers) || input.powers.length === 0) {
    throw new Error("Enabled BRP Superpowers require at least one retained power.");
  }

  const seen = new Set<BrpSupportedSuperpowerId>();
  const powers = input.powers.map((power): BrpSuperpowerState => {
    if (power.powerId !== "extra-energy" && power.powerId !== "extra-hit-points") {
      throw new Error(`Unsupported BRP Superpower ${String(power.powerId)}.`);
    }
    if (seen.has(power.powerId)) {
      throw new Error(`BRP Superpower ${power.powerId} must not be repeated.`);
    }
    seen.add(power.powerId);
    if (!Number.isInteger(power.levels) || power.levels <= 0) {
      throw new Error(`BRP Superpower ${power.powerId} levels must be a positive integer.`);
    }
    if (power.powerId === "extra-hit-points" && power.levels > initialCharacteristics.CON) {
      throw new Error("BRP Extra Hit Points levels may not exceed the character's initial CON in this source profile.");
    }
    return {
      powerId: power.powerId,
      levels: power.levels,
      characterPointCost: power.levels,
    };
  });

  const highestCharacteristicValue = highestCharacteristic(initialCharacteristics);
  const total = calculateBrpSuperpowerCharacterPointBudget(input.powerLevel, initialCharacteristics);
  const spent = powers.reduce((sum, power) => sum + power.characterPointCost, 0);
  if (spent > total) {
    throw new Error(`BRP Superpowers spend ${spent} character points but the ${input.powerLevel} budget is ${total}.`);
  }

  return {
    systemId: BRP_SUPERPOWERS_SYSTEM_ID,
    powerLevel: input.powerLevel,
    characterPointBudget: {
      method: BRP_SUPERPOWERS_BUDGET_METHOD,
      highestCharacteristicValue,
      total,
      spent,
      remaining: total - spent,
    },
    powers,
  };
}

export function calculateBrpPoweredDerivedState(
  finalCharacteristics: BrpCharacteristicValues,
  superpowers: BrpSuperpowerSystemState,
) {
  const base = calculateBrpDerivedState(finalCharacteristics);
  const extraEnergyLevels = superpowers.powers.find((power) => power.powerId === "extra-energy")?.levels ?? 0;
  const extraHitPointLevels = superpowers.powers.find((power) => power.powerId === "extra-hit-points")?.levels ?? 0;
  const hitPoints = base.hitPoints + extraHitPointLevels;

  return {
    ...base,
    hitPoints,
    majorWoundLevel: Math.ceil(hitPoints / 2),
    powerPoints: base.powerPoints + (extraEnergyLevels * 10),
  };
}

export function buildBrpPoweredFirstSliceCharacter(
  input: BrpPoweredFirstSliceInput,
): CharacterDocument;
export function buildBrpPoweredFirstSliceCharacter(
  input: BrpPoweredScholarFirstSliceInput,
): CharacterDocument;
export function buildBrpPoweredFirstSliceCharacter(
  input: BrpPoweredFirstSliceInput | BrpPoweredScholarFirstSliceInput,
): CharacterDocument {
  const { superpowers, ...baseInput } = input;
  const document = baseInput.professionId === "scholar"
    ? buildBrpFirstSliceCharacter(baseInput as BrpScholarFirstSliceInput)
    : buildBrpFirstSliceCharacter(baseInput as BrpFirstSliceInput);
  return attachSuperpowers(document, superpowers);
}

export function buildBrpPoweredStandardRolledFirstSliceCharacter(
  input: BrpPoweredStandardRolledFirstSliceInput,
): CharacterDocument;
export function buildBrpPoweredStandardRolledFirstSliceCharacter(
  input: BrpPoweredScholarStandardRolledFirstSliceInput,
): CharacterDocument;
export function buildBrpPoweredStandardRolledFirstSliceCharacter(
  input: BrpPoweredStandardRolledFirstSliceInput | BrpPoweredScholarStandardRolledFirstSliceInput,
): CharacterDocument {
  const { superpowers, ...baseInput } = input;
  const document = baseInput.professionId === "scholar"
    ? buildBrpStandardRolledFirstSliceCharacter(baseInput as BrpScholarStandardRolledFirstSliceInput)
    : buildBrpStandardRolledFirstSliceCharacter(baseInput as BrpStandardRolledFirstSliceInput);
  return attachSuperpowers(document, superpowers);
}

function attachSuperpowers(
  document: CharacterDocument,
  input: BrpSuperpowersCreationInput,
): CharacterDocument {
  const result = structuredClone(document);
  const nativeState = result.nativeStates.find((state) => state.id === result.primaryNativeStateId);
  if (!nativeState || nativeState.systemId !== "brp" || !isObject(nativeState.payload)) {
    throw new Error("BRP Superpowers can only be attached during BRP native character construction.");
  }

  const native = nativeState.payload as unknown as BrpNativeCharacter;
  const initialCharacteristics = readCharacteristics(native, "initial");
  const finalCharacteristics = readCharacteristics(native, "final");
  const superpowerState = resolveBrpSuperpowerSystemState(input, initialCharacteristics);
  const powered = native as unknown as BrpPoweredNativeCharacter;

  powered.rulesProfile.enabledPowerSystems = [BRP_SUPERPOWERS_SYSTEM_ID];
  powered.powerSystems = [superpowerState];
  powered.derived = calculateBrpPoweredDerivedState(finalCharacteristics, superpowerState);
  nativeState.payload = powered;
  nativeState.provenance = {
    ...nativeState.provenance,
    notes: `${nativeState.provenance.notes ?? "BRP UGE character builder"}; Superpowers ${input.powerLevel} creation profile`,
  };

  if (result.generation) {
    const baseRecipe = isObject(result.generation.recipe)
      ? { ...result.generation.recipe }
      : {};
    const powerDecisions: GenerationDecision[] = [
      { stepId: "rules.power-system", choiceId: BRP_SUPERPOWERS_SYSTEM_ID },
      { stepId: "powers.superpowers.power-level", choiceId: input.powerLevel },
      {
        stepId: "powers.superpowers.selection",
        answer: superpowerState.powers.map((power) => ({
          powerId: power.powerId,
          levels: power.levels,
          characterPointCost: power.characterPointCost,
        })),
      },
      {
        stepId: "powers.superpowers.character-point-budget",
        answer: { ...superpowerState.characterPointBudget },
      },
    ];

    result.generation = {
      ...result.generation,
      methodId: `${result.generation.methodId}+superpowers`,
      recipeVersion: "brp-uge-superpowers/0.1",
      recipe: {
        ...baseRecipe,
        enabledPowerSystems: [BRP_SUPERPOWERS_SYSTEM_ID],
        superpowers: {
          powerLevel: input.powerLevel,
          budgetMethod: BRP_SUPERPOWERS_BUDGET_METHOD,
          powers: superpowerState.powers.map((power) => ({
            powerId: power.powerId,
            levels: power.levels,
          })),
        },
      },
      decisions: [...result.generation.decisions, ...powerDecisions],
    };
  }

  return result;
}

function highestCharacteristic(values: BrpCharacteristicValues): number {
  return Math.max(...Object.values(values));
}

function readCharacteristics(
  native: BrpNativeCharacter,
  layer: "initial" | "final",
): BrpCharacteristicValues {
  const ids: BrpCharacteristicId[] = ["STR", "CON", "SIZ", "INT", "POW", "DEX", "CHA"];
  const result = {} as BrpCharacteristicValues;
  for (const id of ids) {
    const value = native.characteristics[id][layer];
    if (!Number.isInteger(value)) {
      throw new Error(`BRP ${id} ${layer} characteristic is required before Superpowers construction.`);
    }
    result[id] = value;
  }
  return result;
}

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
