import type {
  CharacterDocument,
  GenerationDecision,
  JsonObject,
} from "../../character-model/src/index.js";
import {
  buildBrpFirstSliceCharacter,
  buildBrpStandardRolledFirstSliceCharacter,
  type BrpFirstSliceInput,
  type BrpStandardRolledFirstSliceInput,
} from "./firstSlice.js";
import type {
  BrpCharacteristicId,
  BrpCharacteristicValues,
  BrpNativeCharacter,
  BrpPowerLevel,
} from "./nativeCharacter.js";
import { getBrpPowerLevelRules } from "./powerLevel.js";
import {
  BRP_FIRST_SLICE_SKILL_CATALOG,
  type BrpFirstSliceSkillKey,
} from "./skills.js";

export const BRP_PSYCHIC_ABILITIES_SYSTEM_ID = "psychic-abilities" as const;
export const BRP_PSYCHIC_BASE_RATING_METHOD = "pow-x1" as const;

export type BrpPsychicPowerLevel = "normal";
export type BrpSupportedPsychicAbilityId = "empathy" | "mind-shield";

export interface BrpPsychicAbilityDefinition {
  abilityId: BrpSupportedPsychicAbilityId;
  label: string;
  rangeRule: string;
  durationRule: string;
  powerPointCost:
    | { kind: "fixed"; points: number }
    | { kind: "variable"; minimum: number };
}

export const BRP_PSYCHIC_ABILITY_CATALOG = {
  empathy: {
    abilityId: "empathy",
    label: "Empathy",
    rangeRule: "POW in meters",
    durationRule: "instantaneous",
    powerPointCost: { kind: "fixed", points: 1 },
  },
  "mind-shield": {
    abilityId: "mind-shield",
    label: "Mind Shield",
    rangeRule: "self",
    durationRule: "1 full turn per power point spent",
    powerPointCost: { kind: "variable", minimum: 1 },
  },
} as const satisfies Record<BrpSupportedPsychicAbilityId, BrpPsychicAbilityDefinition>;

export interface BrpPsychicAbilityTrainingInput {
  abilityId: BrpSupportedPsychicAbilityId;
  personalSkillPoints: number;
  reallocateFromSkillKey: BrpFirstSliceSkillKey;
}

export interface BrpPsychicAbilitiesCreationInput {
  powerLevel: BrpPsychicPowerLevel;
  abilities: BrpPsychicAbilityTrainingInput[];
}

export interface BrpPsychicAbilityState extends JsonObject {
  abilityId: BrpSupportedPsychicAbilityId;
  label: string;
  baseRatingMethod: typeof BRP_PSYCHIC_BASE_RATING_METHOD;
  baseRating: number;
  personalSkillPoints: number;
  finalRating: number;
}

export interface BrpPsychicAbilitySystemState extends JsonObject {
  systemId: typeof BRP_PSYCHIC_ABILITIES_SYSTEM_ID;
  powerLevel: BrpPsychicPowerLevel;
  personalSkillPointSpend: number;
  abilities: BrpPsychicAbilityState[];
}

export interface BrpPsychicNativeCharacter extends BrpNativeCharacter {
  powerSystems: BrpPsychicAbilitySystemState[];
}

export type BrpPsychicFirstSliceInput = BrpFirstSliceInput & {
  psychicAbilities: BrpPsychicAbilitiesCreationInput;
};

export type BrpPsychicStandardRolledFirstSliceInput = BrpStandardRolledFirstSliceInput & {
  psychicAbilities: BrpPsychicAbilitiesCreationInput;
};

export function resolveBrpPsychicAbilitySystemState(
  input: BrpPsychicAbilitiesCreationInput,
  pow: number,
  skillPowerLevel: BrpPowerLevel,
): BrpPsychicAbilitySystemState {
  if (input.powerLevel !== "normal") {
    throw new Error("This BRP Psychic Abilities slice supports Normal psychic power level only.");
  }
  if (!Number.isInteger(pow) || pow <= 0) {
    throw new Error("BRP Psychic Abilities require a positive integer POW value.");
  }
  if (!Array.isArray(input.abilities) || input.abilities.length !== 2) {
    throw new Error("Normal BRP Psychic Abilities require exactly two starting abilities in this slice.");
  }

  const startingSkillCap = getBrpPowerLevelRules(skillPowerLevel).startingSkillCap;
  const seen = new Set<BrpSupportedPsychicAbilityId>();
  const abilities = input.abilities.map((ability): BrpPsychicAbilityState => {
    const definition = BRP_PSYCHIC_ABILITY_CATALOG[ability.abilityId];
    if (!definition) {
      throw new Error(`Unsupported BRP Psychic Ability ${String(ability.abilityId)}.`);
    }
    if (seen.has(ability.abilityId)) {
      throw new Error(`BRP Psychic Ability ${ability.abilityId} must not be repeated.`);
    }
    seen.add(ability.abilityId);
    if (!Number.isInteger(ability.personalSkillPoints) || ability.personalSkillPoints < 0) {
      throw new Error(`BRP Psychic Ability ${definition.label} personal skill points must be a non-negative integer.`);
    }

    const baseRating = pow;
    const finalRating = baseRating + ability.personalSkillPoints;
    if (finalRating > startingSkillCap) {
      throw new Error(
        `Starting psychic ability ${definition.label} exceeds the ${skillPowerLevel === "heroic" ? "Heroic" : "Normal"} skill cap of ${startingSkillCap}%.`,
      );
    }

    return {
      abilityId: ability.abilityId,
      label: definition.label,
      baseRatingMethod: BRP_PSYCHIC_BASE_RATING_METHOD,
      baseRating,
      personalSkillPoints: ability.personalSkillPoints,
      finalRating,
    };
  });

  return {
    systemId: BRP_PSYCHIC_ABILITIES_SYSTEM_ID,
    powerLevel: input.powerLevel,
    personalSkillPointSpend: abilities.reduce((sum, ability) => sum + ability.personalSkillPoints, 0),
    abilities,
  };
}

export function buildBrpPsychicFirstSliceCharacter(
  input: BrpPsychicFirstSliceInput,
): CharacterDocument {
  const { psychicAbilities, ...baseInput } = input;
  const document = buildBrpFirstSliceCharacter(baseInput);
  return attachPsychicAbilities(document, baseInput, psychicAbilities);
}

export function buildBrpPsychicStandardRolledFirstSliceCharacter(
  input: BrpPsychicStandardRolledFirstSliceInput,
): CharacterDocument {
  const { psychicAbilities, ...baseInput } = input;
  const document = buildBrpStandardRolledFirstSliceCharacter(baseInput);
  return attachPsychicAbilities(document, baseInput, psychicAbilities);
}

function attachPsychicAbilities(
  document: CharacterDocument,
  baseInput: BrpFirstSliceInput | BrpStandardRolledFirstSliceInput,
  input: BrpPsychicAbilitiesCreationInput,
): CharacterDocument {
  const result = structuredClone(document);
  const nativeState = result.nativeStates.find((state) => state.id === result.primaryNativeStateId);
  if (!nativeState || nativeState.systemId !== "brp" || !isObject(nativeState.payload)) {
    throw new Error("BRP Psychic Abilities can only be attached during BRP native character construction.");
  }

  const native = nativeState.payload as unknown as BrpNativeCharacter;
  const finalCharacteristics = readCharacteristics(native, "final");
  const psychicState = resolveBrpPsychicAbilitySystemState(
    input,
    finalCharacteristics.POW,
    native.rulesProfile.powerLevel,
  );

  const transfers = new Map<BrpFirstSliceSkillKey, number>();
  for (const ability of input.abilities) {
    transfers.set(
      ability.reallocateFromSkillKey,
      (transfers.get(ability.reallocateFromSkillKey) ?? 0) + ability.personalSkillPoints,
    );
  }

  for (const [skillKey, points] of transfers) {
    if (points === 0) continue;
    const originalAllocation = baseInput.personalAllocations.find(
      (allocation) => "skillKey" in allocation && allocation.skillKey === skillKey,
    );
    if (!originalAllocation || originalAllocation.points < points) {
      throw new Error(
        `BRP Psychic Abilities cannot reallocate ${points} personal skill points from ${skillKey}; the retained personal allocation is too small or absent.`,
      );
    }

    const definition = BRP_FIRST_SLICE_SKILL_CATALOG[skillKey];
    const skill = native.skills.find((entry) => entry.skillId === definition.skillId
      && (entry.specialty?.id ?? null) === (definition.specialty?.id ?? null));
    if (!skill || skill.contributions.personal < points) {
      throw new Error(`BRP Psychic Abilities could not resolve retained personal skill funding from ${skillKey}.`);
    }

    skill.contributions.personal -= points;
    skill.finalRating = skill.baseChance
      + skill.contributions.professional
      + skill.contributions.personal;
  }

  const ordinaryPersonalSpend = native.skills.reduce(
    (sum, skill) => sum + skill.contributions.personal,
    0,
  );
  if (ordinaryPersonalSpend + psychicState.personalSkillPointSpend !== native.skillBudgets.personal.total) {
    throw new Error(
      "BRP Psychic Abilities personal training plus retained ordinary personal skill allocations must equal the INT x 10 personal pool.",
    );
  }

  const psychicNative = native as unknown as BrpPsychicNativeCharacter;
  psychicNative.rulesProfile.enabledPowerSystems = [BRP_PSYCHIC_ABILITIES_SYSTEM_ID];
  psychicNative.powerSystems = [psychicState];
  nativeState.payload = psychicNative;
  nativeState.provenance = {
    ...nativeState.provenance,
    notes: `${nativeState.provenance.notes ?? "BRP UGE character builder"}; Psychic Abilities ${input.powerLevel} creation profile`,
  };

  if (result.generation) {
    const baseRecipe = isObject(result.generation.recipe)
      ? { ...result.generation.recipe }
      : {};
    const transferAnswer = input.abilities.map((ability) => ({
      abilityId: ability.abilityId,
      personalSkillPoints: ability.personalSkillPoints,
      reallocateFromSkillKey: ability.reallocateFromSkillKey,
    }));
    const powerDecisions: GenerationDecision[] = [
      { stepId: "rules.power-system", choiceId: BRP_PSYCHIC_ABILITIES_SYSTEM_ID },
      { stepId: "powers.psychic-abilities.power-level", choiceId: input.powerLevel },
      {
        stepId: "powers.psychic-abilities.selection",
        answer: psychicState.abilities.map((ability) => ({
          abilityId: ability.abilityId,
          baseRating: ability.baseRating,
          personalSkillPoints: ability.personalSkillPoints,
          finalRating: ability.finalRating,
        })),
      },
      {
        stepId: "powers.psychic-abilities.personal-skill-reallocation",
        answer: transferAnswer,
      },
      {
        stepId: "powers.psychic-abilities.personal-skill-allocation",
        answer: psychicState.personalSkillPointSpend,
      },
    ];

    result.generation = {
      ...result.generation,
      methodId: `${result.generation.methodId}+psychic-abilities`,
      recipeVersion: "brp-uge-psychic-abilities/0.1",
      recipe: {
        ...baseRecipe,
        enabledPowerSystems: [BRP_PSYCHIC_ABILITIES_SYSTEM_ID],
        psychicAbilities: {
          powerLevel: input.powerLevel,
          baseRatingMethod: BRP_PSYCHIC_BASE_RATING_METHOD,
          abilities: psychicState.abilities.map((ability) => ({
            abilityId: ability.abilityId,
            personalSkillPoints: ability.personalSkillPoints,
          })),
        },
      },
      decisions: result.generation.decisions
        .map((decision) => decision.stepId === "skills.personal-allocation"
          ? { ...decision, answer: ordinaryPersonalSpend }
          : decision)
        .concat(powerDecisions),
    };
  }

  return result;
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
      throw new Error(`BRP ${id} ${layer} characteristic is required before Psychic Abilities construction.`);
    }
    result[id] = value;
  }
  return result;
}

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
