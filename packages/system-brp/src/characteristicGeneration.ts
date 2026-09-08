import {
  createSeededRandom,
  rollDiceExpression,
  type DiceExpression,
  type DiceRollResult,
} from "../../generator-core/src/index.js";
import type {
  BrpCharacteristicAdjustment,
  BrpCharacteristicDiceRoll,
  BrpCharacteristicDiceRollSet,
  BrpCharacteristicId,
  BrpCharacteristics,
  BrpCharacteristicValues,
  BrpStandardRolledCharacteristicGenerationState,
} from "./nativeCharacter.js";

export const BRP_CHARACTERISTIC_IDS = [
  "STR",
  "CON",
  "SIZ",
  "INT",
  "POW",
  "DEX",
  "CHA",
] as const satisfies readonly BrpCharacteristicId[];

export const BRP_STANDARD_CHARACTERISTIC_ROLL_ORDER = BRP_CHARACTERISTIC_IDS;

export const BRP_STANDARD_CHARACTERISTIC_EXPRESSIONS = {
  STR: { count: 3, sides: 6 },
  CON: { count: 3, sides: 6 },
  SIZ: { count: 2, sides: 6, modifier: 6 },
  INT: { count: 2, sides: 6, modifier: 6 },
  POW: { count: 3, sides: 6 },
  DEX: { count: 3, sides: 6 },
  CHA: { count: 3, sides: 6 },
} as const satisfies Record<BrpCharacteristicId, DiceExpression>;

export const BRP_STANDARD_REDISTRIBUTION_SOURCE_ID = "characteristic-generation:standard-redistribution";
export const BRP_STANDARD_REDISTRIBUTION_POINT_LIMIT = 3;

export interface BrpCharacteristicRedistributionInput {
  from: BrpCharacteristicId;
  to: BrpCharacteristicId;
  points: number;
}

export interface BrpStandardRolledCharacteristicsResult {
  initial: BrpCharacteristicValues;
  final: BrpCharacteristicValues;
  characteristics: BrpCharacteristics;
  generationState: BrpStandardRolledCharacteristicGenerationState;
}

export function generateBrpStandardRolledCharacteristics(
  seed: string,
  redistribution: readonly BrpCharacteristicRedistributionInput[] = [],
): BrpStandardRolledCharacteristicsResult {
  const random = createSeededRandom(seed);
  const validatedRedistribution = validateRedistribution(redistribution);
  const rolls = {} as BrpCharacteristicDiceRollSet;
  const initial = {} as BrpCharacteristicValues;

  for (const id of BRP_STANDARD_CHARACTERISTIC_ROLL_ORDER) {
    const result = rollDiceExpression(BRP_STANDARD_CHARACTERISTIC_EXPRESSIONS[id], random);
    rolls[id] = toNativeDiceRoll(result);
    initial[id] = result.total;
  }

  const adjustments = emptyAdjustmentRecord();
  for (const transfer of validatedRedistribution) {
    adjustments[transfer.from].push({
      sourceId: BRP_STANDARD_REDISTRIBUTION_SOURCE_ID,
      amount: -transfer.points,
    });
    adjustments[transfer.to].push({
      sourceId: BRP_STANDARD_REDISTRIBUTION_SOURCE_ID,
      amount: transfer.points,
    });
  }

  const final = {} as BrpCharacteristicValues;
  const characteristics = {} as BrpCharacteristics;
  for (const id of BRP_CHARACTERISTIC_IDS) {
    const finalValue = initial[id] + adjustments[id].reduce((sum, adjustment) => sum + adjustment.amount, 0);
    if (finalValue < 1 || finalValue > 21) {
      throw new Error(`Standard BRP redistribution must leave ${id} from 1 through 21.`);
    }
    final[id] = finalValue;
    characteristics[id] = {
      initial: initial[id],
      adjustments: adjustments[id],
      final: finalValue,
    };
  }

  return {
    initial,
    final,
    characteristics,
    generationState: {
      method: "standard-rolled",
      seed: seed.trim(),
      rolls,
      redistribution: validatedRedistribution.map((transfer) => ({ ...transfer })),
    },
  };
}

function validateRedistribution(
  redistribution: readonly BrpCharacteristicRedistributionInput[],
): BrpCharacteristicRedistributionInput[] {
  const supported = new Set<string>(BRP_CHARACTERISTIC_IDS);
  let totalPoints = 0;
  const result: BrpCharacteristicRedistributionInput[] = [];

  for (const transfer of redistribution) {
    if (!supported.has(transfer.from) || !supported.has(transfer.to)) {
      throw new Error("BRP characteristic redistribution references an unsupported characteristic.");
    }
    if (transfer.from === transfer.to) {
      throw new Error("BRP characteristic redistribution must move points between different characteristics.");
    }
    if (!Number.isInteger(transfer.points) || transfer.points <= 0) {
      throw new Error("BRP characteristic redistribution points must be positive integers.");
    }
    totalPoints += transfer.points;
    result.push({ ...transfer });
  }

  if (totalPoints > BRP_STANDARD_REDISTRIBUTION_POINT_LIMIT) {
    throw new Error(`Standard BRP characteristic redistribution may move at most ${BRP_STANDARD_REDISTRIBUTION_POINT_LIMIT} points.`);
  }

  return result;
}

function emptyAdjustmentRecord(): Record<BrpCharacteristicId, BrpCharacteristicAdjustment[]> {
  return {
    STR: [],
    CON: [],
    SIZ: [],
    INT: [],
    POW: [],
    DEX: [],
    CHA: [],
  };
}

function toNativeDiceRoll(result: DiceRollResult): BrpCharacteristicDiceRoll {
  return {
    notation: result.notation,
    rolls: [...result.rolls],
    modifier: result.modifier,
    total: result.total,
  };
}
