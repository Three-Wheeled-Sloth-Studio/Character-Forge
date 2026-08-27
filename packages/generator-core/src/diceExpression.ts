import type { RandomSource } from "./seededRandom.js";

export interface DiceExpression {
  count: number;
  sides: number;
  keepHighest?: number;
  keepLowest?: number;
  modifier?: number;
}

export interface DiceRollResult {
  notation: string;
  rolls: number[];
  keptIndices: number[];
  keptValues: number[];
  droppedValues: number[];
  modifier: number;
  total: number;
}

export function formatDiceExpression(expression: DiceExpression): string {
  validateDiceExpression(expression);
  const keep = expression.keepHighest !== undefined
    ? `kh${expression.keepHighest}`
    : expression.keepLowest !== undefined
      ? `kl${expression.keepLowest}`
      : "";
  const modifier = expression.modifier ?? 0;
  const modifierText = modifier > 0 ? `+${modifier}` : modifier < 0 ? String(modifier) : "";
  return `${expression.count}d${expression.sides}${keep}${modifierText}`;
}

export function rollDiceExpression(
  expression: DiceExpression,
  random: RandomSource,
): DiceRollResult {
  validateDiceExpression(expression);
  const rolls = Array.from({ length: expression.count }, () => rollDie(expression.sides, random));
  const keptIndices = chooseKeptIndices(expression, rolls);
  const kept = new Set(keptIndices);
  const keptValues = keptIndices.map((index) => rolls[index]!);
  const droppedValues = rolls.filter((_, index) => !kept.has(index));
  const modifier = expression.modifier ?? 0;

  return {
    notation: formatDiceExpression(expression),
    rolls,
    keptIndices,
    keptValues,
    droppedValues,
    modifier,
    total: keptValues.reduce((sum, value) => sum + value, 0) + modifier,
  };
}

function validateDiceExpression(expression: DiceExpression): void {
  if (!Number.isInteger(expression.count) || expression.count < 1) {
    throw new Error("Dice expression count must be a positive integer.");
  }
  if (!Number.isInteger(expression.sides) || expression.sides < 2) {
    throw new Error("Dice expression sides must be an integer of at least 2.");
  }
  if (expression.keepHighest !== undefined && expression.keepLowest !== undefined) {
    throw new Error("Dice expression cannot keep highest and lowest dice at the same time.");
  }
  const keepCount = expression.keepHighest ?? expression.keepLowest;
  if (keepCount !== undefined && (!Number.isInteger(keepCount) || keepCount < 1 || keepCount > expression.count)) {
    throw new Error("Dice expression keep count must be between 1 and the number of rolled dice.");
  }
  if (expression.modifier !== undefined && !Number.isInteger(expression.modifier)) {
    throw new Error("Dice expression modifier must be an integer.");
  }
}

function rollDie(sides: number, random: RandomSource): number {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new Error("Random source must return values from 0 inclusive to 1 exclusive.");
  }
  return Math.floor(value * sides) + 1;
}

function chooseKeptIndices(expression: DiceExpression, rolls: number[]): number[] {
  const requested = expression.keepHighest ?? expression.keepLowest;
  if (requested === undefined) return rolls.map((_, index) => index);

  const descending = expression.keepHighest !== undefined;
  return rolls
    .map((value, index) => ({ value, index }))
    .sort((left, right) => {
      const byValue = descending ? right.value - left.value : left.value - right.value;
      return byValue || left.index - right.index;
    })
    .slice(0, requested)
    .map(({ index }) => index)
    .sort((left, right) => left - right);
}
