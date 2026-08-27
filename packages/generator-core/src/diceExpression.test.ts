import { describe, expect, it } from "vitest";
import { formatDiceExpression, rollDiceExpression } from "./diceExpression.js";

describe("dice expressions", () => {
  it("rolls and keeps the highest dice with inspectable raw results", () => {
    const values = [0, 0.2, 0.5, 0.99];
    let index = 0;
    const result = rollDiceExpression(
      { count: 4, sides: 6, keepHighest: 3 },
      () => values[index++]!,
    );

    expect(result.notation).toBe("4d6kh3");
    expect(result.rolls).toEqual([1, 2, 4, 6]);
    expect(result.keptValues).toEqual([2, 4, 6]);
    expect(result.droppedValues).toEqual([1]);
    expect(result.total).toBe(12);
  });

  it("supports keep-lowest and integer modifiers generically", () => {
    expect(formatDiceExpression({ count: 3, sides: 8, keepLowest: 2, modifier: 2 })).toBe("3d8kl2+2");
  });

  it("rejects contradictory keep rules", () => {
    expect(() => formatDiceExpression({
      count: 4,
      sides: 6,
      keepHighest: 3,
      keepLowest: 3,
    })).toThrow("cannot keep highest and lowest");
  });
});
