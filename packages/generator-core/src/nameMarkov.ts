import type { RandomSource } from "./seededRandom.js";

export const NAME_MARKOV_GENERATOR_VERSION = "name-markov/0.1" as const;

const START_TOKEN = "\u0002";
const END_TOKEN = "\u0003";
const DEFAULT_ORDER = 2;
const DEFAULT_MIN_LENGTH = 2;
const DEFAULT_MAX_LENGTH = 18;
const DEFAULT_MAX_ATTEMPTS = 64;

export interface NameMarkovTrainingOptions {
  order?: number;
  normalize?: (sample: string) => string;
}

export interface NameMarkovModel {
  generatorVersion: typeof NAME_MARKOV_GENERATOR_VERSION;
  order: number;
  sampleCount: number;
  transitions: Readonly<Record<string, readonly string[]>>;
}

export interface NameMarkovGenerationOptions {
  minLength?: number;
  maxLength?: number;
  maxAttempts?: number;
  accept?: (candidate: string) => boolean;
}

function stateKey(tokens: readonly string[]): string {
  return JSON.stringify(tokens);
}

function requireIntegerInRange(value: number, label: string, min: number, max: number): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${label} must be an integer from ${min} through ${max}.`);
  }
}

function nextRandomIndex(random: RandomSource, length: number): number {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new Error("Random source must return a finite value in the range [0, 1)." );
  }
  return Math.floor(value * length);
}

export function trainNameMarkovModel(
  samples: readonly string[],
  options: NameMarkovTrainingOptions = {},
): NameMarkovModel {
  if (samples.length === 0) throw new Error("Name Markov training requires at least one sample.");

  const order = options.order ?? DEFAULT_ORDER;
  requireIntegerInRange(order, "Name Markov order", 1, 6);
  const normalize = options.normalize ?? ((sample: string) => sample.trim());
  const transitions: Record<string, string[]> = {};

  for (const sourceSample of samples) {
    const sample = normalize(sourceSample);
    if (!sample) throw new Error("Name Markov training samples must be non-empty after normalization.");
    if (sample.includes(START_TOKEN) || sample.includes(END_TOKEN)) {
      throw new Error("Name Markov training samples contain a reserved boundary character.");
    }

    const sequence = [
      ...Array<string>(order).fill(START_TOKEN),
      ...Array.from(sample),
      END_TOKEN,
    ];
    for (let index = order; index < sequence.length; index += 1) {
      const state = stateKey(sequence.slice(index - order, index));
      const next = sequence[index];
      if (!next) continue;
      (transitions[state] ??= []).push(next);
    }
  }

  return {
    generatorVersion: NAME_MARKOV_GENERATOR_VERSION,
    order,
    sampleCount: samples.length,
    transitions,
  };
}

export function generateNameFromMarkovModel(
  model: NameMarkovModel,
  random: RandomSource,
  options: NameMarkovGenerationOptions = {},
): string {
  if (model.generatorVersion !== NAME_MARKOV_GENERATOR_VERSION) {
    throw new Error(`Unsupported Name Markov generator version: ${model.generatorVersion}`);
  }
  requireIntegerInRange(model.order, "Name Markov model order", 1, 6);

  const minLength = options.minLength ?? DEFAULT_MIN_LENGTH;
  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  requireIntegerInRange(minLength, "Name Markov minimum length", 1, 100);
  requireIntegerInRange(maxLength, "Name Markov maximum length", 1, 100);
  requireIntegerInRange(maxAttempts, "Name Markov maximum attempts", 1, 1000);
  if (minLength > maxLength) {
    throw new Error("Name Markov minimum length cannot exceed maximum length.");
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let state = Array<string>(model.order).fill(START_TOKEN);
    const output: string[] = [];

    while (output.length <= maxLength) {
      const choices = model.transitions[stateKey(state)];
      if (!choices?.length) break;
      const next = choices[nextRandomIndex(random, choices.length)];
      if (!next) break;

      if (next === END_TOKEN) {
        const candidate = output.join("");
        if (output.length >= minLength && (options.accept?.(candidate) ?? true)) return candidate;
        break;
      }

      if (output.length === maxLength) break;
      output.push(next);
      state = [...state.slice(1), next];
    }
  }

  throw new Error(`Name Markov generator could not produce an accepted name in ${maxAttempts} attempts.`);
}
