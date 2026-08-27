import { describe, expect, it } from "vitest";
import { createSeededRandom, hashSeed } from "./seededRandom.js";

describe("seeded random", () => {
  it("replays the same sequence for the same seed", () => {
    const first = createSeededRandom("replay-me");
    const second = createSeededRandom("replay-me");
    expect([first(), first(), first(), first()]).toEqual([
      second(), second(), second(), second(),
    ]);
  });

  it("distinguishes different seeds", () => {
    expect(hashSeed("alpha")).not.toBe(hashSeed("beta"));
  });

  it("rejects an empty deterministic seed", () => {
    expect(() => createSeededRandom("   ")).toThrow("non-empty seed");
  });
});
