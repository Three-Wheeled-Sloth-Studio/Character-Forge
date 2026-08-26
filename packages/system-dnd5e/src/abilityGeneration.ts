import {
  DND5E_ABILITY_IDS,
  type Dnd5eAbilityId,
  type Dnd5eAbilityScores,
  type Dnd5eAbilityState,
} from "./nativeCharacter.js";

export const DND5E_STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

export type Dnd5eAbilityIncreasePlan = Partial<Record<Dnd5eAbilityId, 1 | 2>>;

export interface Dnd5eAbilityStateInput {
  generationMethod: Dnd5eAbilityState["generationMethod"];
  base: Dnd5eAbilityScores;
  backgroundAbilityIds: readonly Dnd5eAbilityId[];
  backgroundIncreases: Dnd5eAbilityIncreasePlan;
}

export interface Dnd5eStandardArrayInput {
  assignment: Dnd5eAbilityScores;
  backgroundAbilityIds: readonly Dnd5eAbilityId[];
  backgroundIncreases: Dnd5eAbilityIncreasePlan;
}

export interface Dnd5eManualAbilityInput {
  scores: Dnd5eAbilityScores;
  backgroundAbilityIds: readonly Dnd5eAbilityId[];
  backgroundIncreases: Dnd5eAbilityIncreasePlan;
}

function sortedAbilityValues(scores: Dnd5eAbilityScores): number[] {
  return DND5E_ABILITY_IDS
    .map((abilityId) => scores[abilityId])
    .sort((left, right) => right - left);
}

function assertStandardArrayAssignment(assignment: Dnd5eAbilityScores): void {
  const values = sortedAbilityValues(assignment);

  if (
    values.length !== DND5E_STANDARD_ARRAY.length ||
    values.some((value, index) => value !== DND5E_STANDARD_ARRAY[index])
  ) {
    throw new Error(
      "D&D 5E Standard Array assignment must use 15, 14, 13, 12, 10, and 8 exactly once.",
    );
  }
}

function assertManualBaseScores(scores: Dnd5eAbilityScores): void {
  for (const abilityId of DND5E_ABILITY_IDS) {
    const score = scores[abilityId];
    if (!Number.isInteger(score) || score < 3 || score > 18) {
      throw new Error(
        `Manual base ${abilityId} must be an integer from 3 through 18 before background increases.`,
      );
    }
  }
}

function expandIncreasePlan(plan: Dnd5eAbilityIncreasePlan): Dnd5eAbilityScores {
  return {
    strength: plan.strength ?? 0,
    dexterity: plan.dexterity ?? 0,
    constitution: plan.constitution ?? 0,
    intelligence: plan.intelligence ?? 0,
    wisdom: plan.wisdom ?? 0,
    charisma: plan.charisma ?? 0,
  };
}

function assertBackgroundIncreasePlan(
  backgroundAbilityIds: readonly Dnd5eAbilityId[],
  increases: Dnd5eAbilityScores,
): void {
  const allowed = new Set(backgroundAbilityIds);
  if (allowed.size !== 3 || backgroundAbilityIds.length !== 3) {
    throw new Error(
      "D&D 5E 2024 background ability adjustments require exactly three listed abilities.",
    );
  }

  const increasedAbilityIds = DND5E_ABILITY_IDS.filter(
    (abilityId) => increases[abilityId] > 0,
  );

  if (increasedAbilityIds.some((abilityId) => !allowed.has(abilityId))) {
    throw new Error(
      "Background ability increases may apply only to abilities listed by that background.",
    );
  }

  const pattern = increasedAbilityIds
    .map((abilityId) => increases[abilityId])
    .sort((left, right) => right - left);
  const isTwoPlusOne = pattern.length === 2 && pattern[0] === 2 && pattern[1] === 1;
  const isThreeOnes = pattern.length === 3 && pattern.every((increase) => increase === 1);

  if (!isTwoPlusOne && !isThreeOnes) {
    throw new Error(
      "Background ability increases must be +2/+1 to two different listed abilities or +1 to all three listed abilities.",
    );
  }
}

function addAbilityScores(
  base: Dnd5eAbilityScores,
  increases: Dnd5eAbilityScores,
): Dnd5eAbilityScores {
  const final: Dnd5eAbilityScores = {
    strength: base.strength + increases.strength,
    dexterity: base.dexterity + increases.dexterity,
    constitution: base.constitution + increases.constitution,
    intelligence: base.intelligence + increases.intelligence,
    wisdom: base.wisdom + increases.wisdom,
    charisma: base.charisma + increases.charisma,
  };

  if (DND5E_ABILITY_IDS.some((abilityId) => final[abilityId] > 20)) {
    throw new Error("Background ability increases cannot raise an ability score above 20.");
  }

  return final;
}

export function createAbilityState(input: Dnd5eAbilityStateInput): Dnd5eAbilityState {
  const backgroundIncreases = expandIncreasePlan(input.backgroundIncreases);
  assertBackgroundIncreasePlan(input.backgroundAbilityIds, backgroundIncreases);

  return {
    generationMethod: input.generationMethod,
    base: { ...input.base },
    backgroundIncreases,
    final: addAbilityScores(input.base, backgroundIncreases),
  };
}

export function createStandardArrayAbilityState(
  input: Dnd5eStandardArrayInput,
): Dnd5eAbilityState {
  assertStandardArrayAssignment(input.assignment);
  return createAbilityState({
    generationMethod: "standard-array",
    base: input.assignment,
    backgroundAbilityIds: input.backgroundAbilityIds,
    backgroundIncreases: input.backgroundIncreases,
  });
}

export function createManualAbilityState(
  input: Dnd5eManualAbilityInput,
): Dnd5eAbilityState {
  assertManualBaseScores(input.scores);
  return createAbilityState({
    generationMethod: "manual",
    base: input.scores,
    backgroundAbilityIds: input.backgroundAbilityIds,
    backgroundIncreases: input.backgroundIncreases,
  });
}
