import { describe, expect, it } from "vitest";
import { createSeededRandom, type RandomSource } from "./seededRandom.js";
import {
  NAME_MARKOV_GENERATOR_VERSION,
  generateNameFromMarkovModel,
  trainNameMarkovModel,
} from "./nameMarkov.js";

function scriptedRandom(values: readonly number[]): RandomSource {
  let index = 0;
  return () => values[index++] ?? 0;
}

describe("system-neutral Markov name generation", () => {
  it("trains a reusable mechanism without embedding culture, species, or RPG-system semantics", () => {
    const model = trainNameMarkovModel(["Mara", "Mira", "Nara", "Nira"], { order: 2 });

    expect(model.generatorVersion).toBe(NAME_MARKOV_GENERATOR_VERSION);
    expect(model.order).toBe(2);
    expect(model.sampleCount).toBe(4);
    expect(Object.keys(model.transitions).length).toBeGreaterThan(0);
    expect(JSON.stringify(model)).not.toMatch(/species|culture|dnd|brp/i);
  });

  it("replays deterministically when driven by the same seeded random source", () => {
    const model = trainNameMarkovModel(["Mara", "Mira", "Nara", "Nira", "Vara", "Vira"]);
    const first = generateNameFromMarkovModel(model, createSeededRandom("markov-replay"), {
      minLength: 4,
      maxLength: 4,
    });
    const second = generateNameFromMarkovModel(model, createSeededRandom("markov-replay"), {
      minLength: 4,
      maxLength: 4,
    });

    expect(first).toBe(second);
  });

  it("uses observed transition frequency as weight instead of selecting whole names", () => {
    const model = trainNameMarkovModel(["ab", "ac"], { order: 1 });
    const generated = generateNameFromMarkovModel(model, scriptedRandom([0, 0.75, 0]), {
      minLength: 2,
      maxLength: 2,
    });

    expect(generated).toBe("ac");
  });

  it("lets callers reject candidates and retries without owning caller-specific naming rules", () => {
    const model = trainNameMarkovModel(["Ada", "Ava"], { order: 1 });
    const seen: string[] = [];
    const generated = generateNameFromMarkovModel(
      model,
      scriptedRandom([0, 0, 0, 0, 0, 0.75, 0, 0]),
      {
        minLength: 3,
        maxLength: 3,
        maxAttempts: 2,
        accept(candidate) {
          seen.push(candidate);
          return candidate === "Ava";
        },
      },
    );

    expect(seen).toEqual(["Ada", "Ava"]);
    expect(generated).toBe("Ava");
  });

  it("rejects invalid training, generation bounds, random sources, and impossible constraints", () => {
    expect(() => trainNameMarkovModel([])).toThrow("at least one sample");
    expect(() => trainNameMarkovModel(["   "])).toThrow("non-empty");
    expect(() => trainNameMarkovModel(["Ada"], { order: 0 })).toThrow("order");

    const model = trainNameMarkovModel(["Ada"]);
    expect(() => generateNameFromMarkovModel(model, () => 1)).toThrow("range [0, 1)");
    expect(() => generateNameFromMarkovModel(model, () => 0, { minLength: 5, maxLength: 4 })).toThrow("cannot exceed");
    expect(() => generateNameFromMarkovModel(model, createSeededRandom("reject-all"), {
      minLength: 3,
      maxLength: 3,
      maxAttempts: 2,
      accept: () => false,
    })).toThrow("could not produce an accepted name");
  });
});
