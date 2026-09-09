import type { CharacterDocument, GenerationDecision, JsonObject } from "../../character-model/src/index.js";
import { createGeneratedSeed, createSeededRandom, type RandomSource } from "../../generator-core/src/index.js";
import { DND5E_STANDARD_ARRAY, type Dnd5eAbilityIncreasePlan } from "./abilityGeneration.js";
import { classChoiceRules, DND5E_ALIGNMENT_OPTIONS, DND5E_FIGHTING_STYLE_OPTIONS } from "./guidedChoices.js";
import { defaultGuidedDnd5eCoreChoices } from "./guidedDefaults.js";
import { guidedGenerateDnd5eFirstSlice, type GuidedBackgroundEquipmentChoice } from "./guidedGenerate.js";
import { DND5E_ABILITY_IDS, type Dnd5eAbilityId, type Dnd5eAbilityScores } from "./nativeCharacter.js";
import {
  DND5E_SRD_521_BACKGROUND_OPTIONS,
  DND5E_SRD_521_CLASS_OPTIONS,
  isGuidedDnd5eBackgroundId,
  isGuidedDnd5eClassId,
  isGuidedDnd5eSpeciesId,
  type GuidedDnd5eBackgroundId,
  type GuidedDnd5eClassId,
  type GuidedDnd5eSpeciesId,
} from "./srdCatalog.js";

export const DND5E_GUIDED_NARRATIVE_MAPPING_ID = "character-forge.dnd5e.guided-narrative.first-slice";
export const DND5E_GUIDED_NARRATIVE_MAPPING_VERSION = "5";
export const DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID = "choose-for-me";
export const DND5E_GUIDED_NARRATIVE_TARGET_PRESENTED_CHOICES = 3;
export const DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES = 5;

export type Dnd5eGuidedNarrativeRoleAnswerId =
  | typeof DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID
  | "front-line"
  | "outmaneuver"
  | "wield-magic"
  | "guide-others";
export type Dnd5eGuidedNarrativePastAnswerId =
  | typeof DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID
  | "faith-service"
  | "study"
  | "hard-duty"
  | "outside-law";
export type Dnd5eGuidedNarrativeHeritageAnswerId =
  | typeof DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID
  | "adaptable"
  | "ancient"
  | "formidable"
  | "uncanny";
export type Dnd5eGuidedNarrativeEquipmentAnswerId =
  | typeof DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID
  | "prepared-gear"
  | "starting-gold";
export type Dnd5eGuidedNarrativeEquipmentPreferenceId = Exclude<
  Dnd5eGuidedNarrativeEquipmentAnswerId,
  typeof DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID
>;
export type Dnd5eGuidedNarrativeFighterStyleAnswerId =
  | typeof DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID
  | "control-from-range"
  | "hold-the-line"
  | "heavy-weapon"
  | "paired-weapons";
export type Dnd5eGuidedNarrativeFighterStylePreferenceId = Exclude<
  Dnd5eGuidedNarrativeFighterStyleAnswerId,
  typeof DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID
>;
export type Dnd5eGuidedNarrativeOrderAnswerId =
  | typeof DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID
  | "honor-structure"
  | "case-by-case"
  | "personal-freedom";
export type Dnd5eGuidedNarrativeRegardAnswerId =
  | typeof DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID
  | "protect-others"
  | "balance-needs"
  | "self-first";
export type Dnd5eGuidedNarrativeQuestionId = "role" | "past" | "heritage" | "equipment" | "order" | "regard";
type Dnd5eGuidedNarrativeDecisionQuestionId = Dnd5eGuidedNarrativeQuestionId | "fighter-style";

export interface Dnd5eGuidedNarrativeAnswers {
  role: Dnd5eGuidedNarrativeRoleAnswerId;
  past: Dnd5eGuidedNarrativePastAnswerId;
  heritage: Dnd5eGuidedNarrativeHeritageAnswerId;
  equipment: Dnd5eGuidedNarrativeEquipmentAnswerId;
  order: Dnd5eGuidedNarrativeOrderAnswerId;
  regard: Dnd5eGuidedNarrativeRegardAnswerId;
}

export interface Dnd5eGuidedNarrativeQuestionOption {
  id: string;
  label: string;
}

export interface Dnd5eGuidedNarrativeQuestion {
  id: Dnd5eGuidedNarrativeQuestionId;
  prompt: string;
  options: readonly Dnd5eGuidedNarrativeQuestionOption[];
}

const CHOOSE_FOR_ME_OPTION = {
  id: DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
  label: "Choose for me",
} as const;

export const DND5E_GUIDED_NARRATIVE_QUESTIONS: readonly Dnd5eGuidedNarrativeQuestion[] = [
  {
    id: "role",
    prompt: "When trouble starts, how do you want to contribute?",
    options: [
      CHOOSE_FOR_ME_OPTION,
      { id: "front-line", label: "Meet danger head-on and hold the line" },
      { id: "outmaneuver", label: "Win through speed, stealth, or clever positioning" },
      { id: "wield-magic", label: "Solve problems with strange or learned magic" },
      { id: "guide-others", label: "Keep people focused, inspired, or on the right path" },
    ],
  },
  {
    id: "past",
    prompt: "What kind of life most shaped you before adventuring?",
    options: [
      CHOOSE_FOR_ME_OPTION,
      { id: "faith-service", label: "Faith, service, or a religious community" },
      { id: "study", label: "Study, research, books, or formal learning" },
      { id: "hard-duty", label: "Military service, guard duty, or organized conflict" },
      { id: "outside-law", label: "Survival outside the law or around dangerous people" },
    ],
  },
  {
    id: "heritage",
    prompt: "What kind of heritage sounds most fun to explore?",
    options: [
      CHOOSE_FOR_ME_OPTION,
      { id: "adaptable", label: "Familiar, flexible, and broadly adaptable" },
      { id: "ancient", label: "Old traditions, deep memory, or subtle magic" },
      { id: "formidable", label: "Physically imposing, durable, or hard to stop" },
      { id: "uncanny", label: "Unusual, uncanny, or unexpectedly hard to pin down" },
    ],
  },
  {
    id: "equipment",
    prompt: "When the adventure begins, how would you rather be outfitted?",
    options: [
      CHOOSE_FOR_ME_OPTION,
      { id: "prepared-gear", label: "Start ready with the gear my training and past provide" },
      { id: "starting-gold", label: "Carry more coin and choose my own gear" },
    ],
  },
  {
    id: "order",
    prompt: "When rules and personal freedom pull in opposite directions, how should this character usually lean?",
    options: [
      CHOOSE_FOR_ME_OPTION,
      { id: "honor-structure", label: "Keep promises, laws, and structure" },
      { id: "case-by-case", label: "Judge each situation on its own" },
      { id: "personal-freedom", label: "Follow personal judgment over imposed rules" },
    ],
  },
  {
    id: "regard",
    prompt: "When this character's goals conflict with someone else's well-being, what tendency sounds most interesting to play?",
    options: [
      CHOOSE_FOR_ME_OPTION,
      { id: "protect-others", label: "Protect others, even at real personal cost" },
      { id: "balance-needs", label: "Balance their own needs and others case by case" },
      { id: "self-first", label: "Put their own goals first, even when others may pay the price" },
    ],
  },
] as const;

export const DND5E_GUIDED_NARRATIVE_FIGHTER_STYLE_QUESTION = {
  id: "fighter-style",
  prompt: "As a Fighter, what fighting approach sounds most fun?",
  options: [
    CHOOSE_FOR_ME_OPTION,
    { id: "control-from-range", label: "Control the fight from range" },
    { id: "hold-the-line", label: "Stay hard to hurt while holding the line" },
    { id: "heavy-weapon", label: "Commit to heavy two-handed blows" },
    { id: "paired-weapons", label: "Fight with a weapon in each hand" },
  ],
} as const;

const ROLE_CLASS_MAP: Record<Exclude<Dnd5eGuidedNarrativeRoleAnswerId, typeof DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID>, readonly GuidedDnd5eClassId[]> = {
  "front-line": ["barbarian", "fighter", "paladin"],
  outmaneuver: ["rogue", "ranger", "monk"],
  "wield-magic": ["wizard", "sorcerer", "warlock"],
  "guide-others": ["bard", "cleric", "druid"],
};

const PAST_BACKGROUND_MAP: Record<Exclude<Dnd5eGuidedNarrativePastAnswerId, typeof DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID>, readonly GuidedDnd5eBackgroundId[]> = {
  "faith-service": ["acolyte"],
  study: ["sage"],
  "hard-duty": ["soldier"],
  "outside-law": ["criminal"],
};

const HERITAGE_SPECIES_MAP: Record<Exclude<Dnd5eGuidedNarrativeHeritageAnswerId, typeof DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID>, readonly GuidedDnd5eSpeciesId[]> = {
  adaptable: ["human"],
  ancient: ["elf", "dwarf", "gnome"],
  formidable: ["goliath", "orc", "dragonborn"],
  uncanny: ["tiefling", "halfling", "gnome"],
};

const CLASS_STARTING_GOLD_CHOICES: Record<GuidedDnd5eClassId, string> = {
  barbarian: "B",
  bard: "B",
  cleric: "B",
  druid: "B",
  fighter: "C",
  monk: "B",
  paladin: "B",
  ranger: "B",
  rogue: "B",
  sorcerer: "B",
  warlock: "B",
  wizard: "B",
};

const FIGHTER_STYLE_MAP: Record<Dnd5eGuidedNarrativeFighterStylePreferenceId, string> = {
  "control-from-range": "archery",
  "hold-the-line": "defense",
  "heavy-weapon": "great-weapon-fighting",
  "paired-weapons": "two-weapon-fighting",
};

const ALIGNMENT_MAP: Record<string, string> = {
  "honor-structure:protect-others": "lawful-good",
  "honor-structure:balance-needs": "lawful-neutral",
  "honor-structure:self-first": "lawful-evil",
  "case-by-case:protect-others": "neutral-good",
  "case-by-case:balance-needs": "neutral",
  "case-by-case:self-first": "neutral-evil",
  "personal-freedom:protect-others": "chaotic-good",
  "personal-freedom:balance-needs": "chaotic-neutral",
  "personal-freedom:self-first": "chaotic-evil",
};

export interface Dnd5eGuidedNarrativeResolvedAnswer {
  submittedId: string;
  resolvedId: string;
}

export interface Dnd5eGuidedNarrativeMappedChoice<TId extends string> {
  candidateIds: readonly TId[];
  recommendedId: TId;
}

export interface Dnd5eGuidedNarrativeEquipmentChoices {
  preferenceId: Dnd5eGuidedNarrativeEquipmentPreferenceId;
  classEquipmentChoice: string;
  backgroundEquipmentChoice: GuidedBackgroundEquipmentChoice;
}

export interface Dnd5eGuidedNarrativeRecommendation {
  mappingId: typeof DND5E_GUIDED_NARRATIVE_MAPPING_ID;
  mappingVersion: typeof DND5E_GUIDED_NARRATIVE_MAPPING_VERSION;
  seed: string;
  answers: {
    role: Dnd5eGuidedNarrativeResolvedAnswer;
    past: Dnd5eGuidedNarrativeResolvedAnswer;
    heritage: Dnd5eGuidedNarrativeResolvedAnswer;
    equipment: Dnd5eGuidedNarrativeResolvedAnswer;
    order: Dnd5eGuidedNarrativeResolvedAnswer;
    regard: Dnd5eGuidedNarrativeResolvedAnswer;
  };
  fighterStyle: Dnd5eGuidedNarrativeResolvedAnswer;
  classChoice: Dnd5eGuidedNarrativeMappedChoice<GuidedDnd5eClassId>;
  backgroundChoice: Dnd5eGuidedNarrativeMappedChoice<GuidedDnd5eBackgroundId>;
  speciesChoice: Dnd5eGuidedNarrativeMappedChoice<GuidedDnd5eSpeciesId>;
  alignmentChoice: Dnd5eGuidedNarrativeMappedChoice<string>;
}

export interface RecommendDnd5eGuidedNarrativeInput {
  answers: Dnd5eGuidedNarrativeAnswers;
  fighterStyle?: Dnd5eGuidedNarrativeFighterStyleAnswerId;
  seed?: string;
}

export interface Dnd5eGuidedNarrativeOverrides {
  classId?: GuidedDnd5eClassId;
  backgroundId?: GuidedDnd5eBackgroundId;
  speciesId?: GuidedDnd5eSpeciesId;
}

export interface GuidedNarrativeGenerateDnd5eInput extends RecommendDnd5eGuidedNarrativeInput {
  name?: string;
  overrides?: Dnd5eGuidedNarrativeOverrides;
}

export function recommendDnd5eGuidedNarrative(
  input: RecommendDnd5eGuidedNarrativeInput,
): Dnd5eGuidedNarrativeRecommendation {
  assertNarrativeQuestionShape();
  const seed = input.seed?.trim() || createGeneratedSeed("dnd5e-narrative");
  const random = createSeededRandom(`${DND5E_GUIDED_NARRATIVE_MAPPING_ID}:${DND5E_GUIDED_NARRATIVE_MAPPING_VERSION}:${seed}`);
  const role = resolveNarrativeAnswer("role", input.answers.role, random);
  const past = resolveNarrativeAnswer("past", input.answers.past, random);
  const heritage = resolveNarrativeAnswer("heritage", input.answers.heritage, random);
  const equipment = resolveNarrativeAnswer("equipment", input.answers.equipment, random);
  const order = resolveNarrativeAnswer("order", input.answers.order, random);
  const regard = resolveNarrativeAnswer("regard", input.answers.regard, random);
  const fighterStyle = resolveFighterStyleAnswer(input.fighterStyle ?? DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID, random);

  const classCandidates = ROLE_CLASS_MAP[role.resolvedId as keyof typeof ROLE_CLASS_MAP];
  const backgroundCandidates = PAST_BACKGROUND_MAP[past.resolvedId as keyof typeof PAST_BACKGROUND_MAP];
  const speciesCandidates = HERITAGE_SPECIES_MAP[heritage.resolvedId as keyof typeof HERITAGE_SPECIES_MAP];
  const alignmentId = ALIGNMENT_MAP[`${order.resolvedId}:${regard.resolvedId}`];
  if (!classCandidates || !backgroundCandidates || !speciesCandidates || !isEquipmentPreferenceId(equipment.resolvedId) || !isFighterStylePreferenceId(fighterStyle.resolvedId) || !alignmentId || !isSupportedAlignment(alignmentId)) {
    throw new Error("Guided Narrative resolved to an unmapped D&D answer.");
  }
  const alignmentCandidates = [alignmentId];
  assertPresentedChoiceCount("class", classCandidates);
  assertPresentedChoiceCount("background", backgroundCandidates);
  assertPresentedChoiceCount("species", speciesCandidates);
  assertPresentedChoiceCount("alignment", alignmentCandidates);

  return {
    mappingId: DND5E_GUIDED_NARRATIVE_MAPPING_ID,
    mappingVersion: DND5E_GUIDED_NARRATIVE_MAPPING_VERSION,
    seed,
    answers: { role, past, heritage, equipment, order, regard },
    fighterStyle,
    classChoice: { candidateIds: [...classCandidates], recommendedId: pick(classCandidates, random) },
    backgroundChoice: { candidateIds: [...backgroundCandidates], recommendedId: pick(backgroundCandidates, random) },
    speciesChoice: { candidateIds: [...speciesCandidates], recommendedId: pick(speciesCandidates, random) },
    alignmentChoice: { candidateIds: alignmentCandidates, recommendedId: alignmentId },
  };
}

export function resolveDnd5eGuidedNarrativeEquipmentChoices(
  preferenceId: string,
  classId: GuidedDnd5eClassId,
): Dnd5eGuidedNarrativeEquipmentChoices {
  if (!isEquipmentPreferenceId(preferenceId)) throw new Error("Unsupported Guided Narrative starting-equipment preference.");
  const classEquipmentChoice = preferenceId === "prepared-gear" ? "A" : CLASS_STARTING_GOLD_CHOICES[classId];
  const backgroundEquipmentChoice: GuidedBackgroundEquipmentChoice = preferenceId === "prepared-gear" ? "A" : "B:50-gp";
  if (!classChoiceRules(classId).equipmentChoices.some((option) => option.id === classEquipmentChoice)) {
    throw new Error(`Guided Narrative equipment preference does not map to a legal ${classId} starting-equipment choice.`);
  }
  return { preferenceId, classEquipmentChoice, backgroundEquipmentChoice };
}

export function resolveDnd5eGuidedNarrativeFighterStyle(answerId: string): string {
  if (!isFighterStylePreferenceId(answerId)) throw new Error("Unsupported Guided Narrative Fighter style preference.");
  const fightingStyleFeatId = FIGHTER_STYLE_MAP[answerId];
  if (!DND5E_FIGHTING_STYLE_OPTIONS.some((option) => option.id === fightingStyleFeatId)) {
    throw new Error("Guided Narrative Fighter style preference does not map to a supported Fighting Style.");
  }
  return fightingStyleFeatId;
}

export function guidedNarrativeGenerateDnd5eFirstSlice(
  input: GuidedNarrativeGenerateDnd5eInput,
): CharacterDocument {
  const recommendation = recommendDnd5eGuidedNarrative(input);
  const classId = resolveOverride(input.overrides?.classId, recommendation.classChoice, isGuidedDnd5eClassId, "class");
  const backgroundId = resolveOverride(input.overrides?.backgroundId, recommendation.backgroundChoice, isGuidedDnd5eBackgroundId, "background");
  const speciesId = resolveOverride(input.overrides?.speciesId, recommendation.speciesChoice, isGuidedDnd5eSpeciesId, "species");
  const alignmentId = recommendation.alignmentChoice.recommendedId;
  const equipmentChoices = resolveDnd5eGuidedNarrativeEquipmentChoices(recommendation.answers.equipment.resolvedId, classId);
  const fightingStyleFeatId = classId === "fighter"
    ? resolveDnd5eGuidedNarrativeFighterStyle(recommendation.fighterStyle.resolvedId)
    : undefined;
  const coreChoices = defaultGuidedDnd5eCoreChoices(classId, backgroundId, speciesId);
  coreChoices.alignmentId = alignmentId;
  coreChoices.classEquipmentChoice = equipmentChoices.classEquipmentChoice;
  if (fightingStyleFeatId) coreChoices.fightingStyleFeatId = fightingStyleFeatId;

  const character = guidedGenerateDnd5eFirstSlice({
    name: input.name ?? "",
    classChoice: { selectedId: classId, acceptableIds: [classId], selectionMode: "direct" },
    backgroundChoice: { selectedId: backgroundId, acceptableIds: [backgroundId], selectionMode: "direct" },
    speciesChoice: { selectedId: speciesId, acceptableIds: [speciesId], selectionMode: "direct" },
    coreChoices,
    abilityMethod: { method: "standard-array", assignment: narrativeStandardArray(classId) },
    backgroundIncreases: narrativeBackgroundIncreases(classId, backgroundId),
    backgroundEquipmentChoice: equipmentChoices.backgroundEquipmentChoice,
  });

  const generation = character.generation;
  if (!generation) throw new Error("Guided Narrative generation did not produce provenance.");
  const baseGuidedRecipe = generation.recipe;
  const narrativeDecisions = createNarrativeDecisions(recommendation, { classId, backgroundId, speciesId, alignmentId, ...equipmentChoices, fightingStyleFeatId });
  const filteredBaseDecisions = generation.decisions
    .filter((decision) => !["class.acceptable-pool", "background.acceptable-pool", "species.acceptable-pool"].includes(decision.stepId))
    .map((decision) => rewriteMappedChoiceRationale(decision, recommendation, { classId, backgroundId, speciesId, alignmentId, fightingStyleFeatId }));

  generation.methodId = "dnd5e:guided-narrative-level-one";
  generation.mode = "guided-narrative";
  generation.recipeVersion = "0.4";
  generation.seed = recommendation.seed;
  generation.recipe = {
    mappingId: recommendation.mappingId,
    mappingVersion: recommendation.mappingVersion,
    sequence: [
      "narrative.role",
      "narrative.past",
      "narrative.heritage",
      "narrative.equipment",
      ...(fightingStyleFeatId ? ["narrative.fighter-style"] : []),
      "narrative.order",
      "narrative.regard",
      "mapped-guided-generation",
    ],
    classId,
    backgroundId,
    speciesId,
    alignmentId,
    equipmentPreferenceId: equipmentChoices.preferenceId,
    classEquipmentChoice: equipmentChoices.classEquipmentChoice,
    backgroundEquipmentChoice: equipmentChoices.backgroundEquipmentChoice,
    ...(fightingStyleFeatId ? { fightingStyleFeatId } : {}),
    abilityMethod: "standard-array",
    baseGuidedRecipe,
  };
  generation.decisions = [...narrativeDecisions, ...filteredBaseDecisions];
  return character;
}

function resolveNarrativeAnswer(
  questionId: Dnd5eGuidedNarrativeQuestionId,
  submittedId: string,
  random: RandomSource,
): Dnd5eGuidedNarrativeResolvedAnswer {
  const question = DND5E_GUIDED_NARRATIVE_QUESTIONS.find((entry) => entry.id === questionId);
  if (!question) throw new Error(`Unknown Guided Narrative question ${questionId}.`);
  if (!question.options.some((option) => option.id === submittedId)) {
    throw new Error(`Unsupported answer ${submittedId} for Guided Narrative question ${questionId}.`);
  }
  if (submittedId !== DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID) return { submittedId, resolvedId: submittedId };
  const substantiveOptions = question.options.filter((option) => option.id !== DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID);
  const resolved = pick(substantiveOptions, random);
  return { submittedId, resolvedId: resolved.id };
}

function resolveFighterStyleAnswer(
  submittedId: string,
  random: RandomSource,
): Dnd5eGuidedNarrativeResolvedAnswer {
  const question = DND5E_GUIDED_NARRATIVE_FIGHTER_STYLE_QUESTION;
  if (!question.options.some((option) => option.id === submittedId)) {
    throw new Error(`Unsupported answer ${submittedId} for Guided Narrative Fighter style question.`);
  }
  if (submittedId !== DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID) return { submittedId, resolvedId: submittedId };
  const substantiveOptions = question.options.filter((option) => option.id !== DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID);
  const resolved = pick(substantiveOptions, random);
  return { submittedId, resolvedId: resolved.id };
}

function createNarrativeDecisions(
  recommendation: Dnd5eGuidedNarrativeRecommendation,
  finalChoices: {
    classId: GuidedDnd5eClassId;
    backgroundId: GuidedDnd5eBackgroundId;
    speciesId: GuidedDnd5eSpeciesId;
    alignmentId: string;
    preferenceId: Dnd5eGuidedNarrativeEquipmentPreferenceId;
    classEquipmentChoice: string;
    backgroundEquipmentChoice: GuidedBackgroundEquipmentChoice;
    fightingStyleFeatId?: string | undefined;
  },
): GenerationDecision[] {
  return [
    answerDecision("role", recommendation.answers.role),
    answerDecision("past", recommendation.answers.past),
    answerDecision("heritage", recommendation.answers.heritage),
    answerDecision("equipment", recommendation.answers.equipment),
    ...(finalChoices.fightingStyleFeatId
      ? [
          answerDecision("fighter-style", recommendation.fighterStyle),
          fighterStyleMappingDecision(recommendation.fighterStyle, finalChoices.fightingStyleFeatId),
        ]
      : []),
    answerDecision("order", recommendation.answers.order),
    answerDecision("regard", recommendation.answers.regard),
    mappingDecision("class", recommendation.classChoice, finalChoices.classId),
    mappingDecision("background", recommendation.backgroundChoice, finalChoices.backgroundId),
    mappingDecision("species", recommendation.speciesChoice, finalChoices.speciesId),
    mappingDecision("alignment", recommendation.alignmentChoice, finalChoices.alignmentId),
    equipmentMappingDecision(finalChoices),
    {
      stepId: "narrative.remaining-choices",
      answer: {
        abilityMethod: "standard-array",
        coreChoices: "current-guided-defaults-except-mapped-narrative-choices",
      },
      rationale: "Guided Narrative maps the supported high-level and class-specific choices; remaining legal choices use the existing guided defaults.",
    },
  ];
}

function answerDecision(
  questionId: Dnd5eGuidedNarrativeDecisionQuestionId,
  resolution: Dnd5eGuidedNarrativeResolvedAnswer,
): GenerationDecision {
  const answer: JsonObject = {
    submittedId: resolution.submittedId,
    resolvedId: resolution.resolvedId,
    chooseForMe: resolution.submittedId === DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID,
  };
  return {
    stepId: `narrative.${questionId}`,
    choiceId: resolution.resolvedId,
    answer,
    rationale: resolution.submittedId === DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID
      ? "The player chose Choose for me; the substantive answer was resolved deterministically from the narrative seed."
      : "Direct narrative preference answer.",
  };
}

function mappingDecision<TId extends string>(
  target: "class" | "background" | "species" | "alignment",
  mapping: Dnd5eGuidedNarrativeMappedChoice<TId>,
  finalId: TId,
): GenerationDecision {
  const overridden = finalId !== mapping.recommendedId;
  const answer: JsonObject = {
    mappingId: DND5E_GUIDED_NARRATIVE_MAPPING_ID,
    mappingVersion: DND5E_GUIDED_NARRATIVE_MAPPING_VERSION,
    candidateIds: [...mapping.candidateIds],
    recommendedId: mapping.recommendedId,
    finalId,
    overridden,
  };
  return {
    stepId: `narrative.mapping.${target}`,
    choiceId: finalId,
    answer,
    rationale: overridden
      ? `The player overrode the Guided Narrative ${target} recommendation within the narrowed candidate set.`
      : `The player accepted the Guided Narrative ${target} recommendation.`,
  };
}

function equipmentMappingDecision(
  choices: {
    preferenceId: Dnd5eGuidedNarrativeEquipmentPreferenceId;
    classEquipmentChoice: string;
    backgroundEquipmentChoice: GuidedBackgroundEquipmentChoice;
  },
): GenerationDecision {
  return {
    stepId: "narrative.mapping.equipment",
    answer: {
      mappingId: DND5E_GUIDED_NARRATIVE_MAPPING_ID,
      mappingVersion: DND5E_GUIDED_NARRATIVE_MAPPING_VERSION,
      recommendedPreferenceId: choices.preferenceId,
      startingClassEquipmentChoice: choices.classEquipmentChoice,
      startingBackgroundEquipmentChoice: choices.backgroundEquipmentChoice,
      finalClassEquipmentChoice: choices.classEquipmentChoice,
      finalBackgroundEquipmentChoice: choices.backgroundEquipmentChoice,
      changedAfterContinuation: false,
    },
    rationale: "The Guided Narrative equipment preference mapped to the existing legal Class and Background starting-equipment choices.",
  };
}

function fighterStyleMappingDecision(
  fighterStyle: Dnd5eGuidedNarrativeResolvedAnswer,
  fightingStyleFeatId: string,
): GenerationDecision {
  return {
    stepId: "narrative.mapping.fighter-style",
    choiceId: fightingStyleFeatId,
    answer: {
      mappingId: DND5E_GUIDED_NARRATIVE_MAPPING_ID,
      mappingVersion: DND5E_GUIDED_NARRATIVE_MAPPING_VERSION,
      recommendedPreferenceId: fighterStyle.resolvedId,
      startingFightingStyleFeatId: fightingStyleFeatId,
      finalFightingStyleFeatId: fightingStyleFeatId,
      changedAfterContinuation: false,
    },
    rationale: "The Fighter-specific Guided Narrative preference mapped to the existing Fighting Style choice.",
  };
}

function rewriteMappedChoiceRationale(
  decision: GenerationDecision,
  recommendation: Dnd5eGuidedNarrativeRecommendation,
  finalChoices: {
    classId: GuidedDnd5eClassId;
    backgroundId: GuidedDnd5eBackgroundId;
    speciesId: GuidedDnd5eSpeciesId;
    alignmentId: string;
    fightingStyleFeatId?: string | undefined;
  },
): GenerationDecision {
  if (decision.stepId === "class") return { ...decision, rationale: mappedChoiceRationale("class", recommendation.classChoice.recommendedId, finalChoices.classId) };
  if (decision.stepId === "background") return { ...decision, rationale: mappedChoiceRationale("background", recommendation.backgroundChoice.recommendedId, finalChoices.backgroundId) };
  if (decision.stepId === "species") return { ...decision, rationale: mappedChoiceRationale("species", recommendation.speciesChoice.recommendedId, finalChoices.speciesId) };
  if (decision.stepId === "alignment") return { ...decision, rationale: mappedChoiceRationale("alignment", recommendation.alignmentChoice.recommendedId, finalChoices.alignmentId) };
  if (decision.stepId === "class.equipment" || decision.stepId === "background.equipment") {
    return { ...decision, rationale: "Mapped from the player's Guided Narrative starting-equipment preference." };
  }
  if (decision.stepId === "class.fighting-style" && finalChoices.fightingStyleFeatId) {
    return { ...decision, rationale: "Mapped from the player's Fighter-specific Guided Narrative fighting preference." };
  }
  return decision;
}

function mappedChoiceRationale(target: string, recommendedId: string, finalId: string): string {
  return recommendedId === finalId
    ? `Accepted Guided Narrative ${target} recommendation.`
    : `Player override of Guided Narrative ${target} recommendation ${recommendedId} within the narrowed candidate set.`;
}

function narrativeStandardArray(classId: GuidedDnd5eClassId): Dnd5eAbilityScores {
  const classOption = DND5E_SRD_521_CLASS_OPTIONS.find((option) => option.id === classId);
  if (!classOption) throw new Error(`Unknown Guided Narrative class ${classId}.`);
  const fallbackPriority: readonly Dnd5eAbilityId[] = ["constitution", "dexterity", "wisdom", "charisma", "intelligence", "strength"];
  const priority: Dnd5eAbilityId[] = [];
  for (const id of [...classOption.primaryAbilityIds, ...fallbackPriority]) if (!priority.includes(id)) priority.push(id);
  if (priority.length !== DND5E_ABILITY_IDS.length) throw new Error("Unable to build Guided Narrative Standard Array priority.");
  const scores: Dnd5eAbilityScores = { strength: 8, dexterity: 8, constitution: 8, intelligence: 8, wisdom: 8, charisma: 8 };
  for (let index = 0; index < DND5E_STANDARD_ARRAY.length; index += 1) scores[priority[index]!] = DND5E_STANDARD_ARRAY[index]!;
  return scores;
}

function narrativeBackgroundIncreases(
  classId: GuidedDnd5eClassId,
  backgroundId: GuidedDnd5eBackgroundId,
): Dnd5eAbilityIncreasePlan {
  const classOption = DND5E_SRD_521_CLASS_OPTIONS.find((option) => option.id === classId);
  const background = DND5E_SRD_521_BACKGROUND_OPTIONS.find((option) => option.id === backgroundId);
  if (!classOption || !background) throw new Error("Unable to resolve Guided Narrative background ability increases.");
  const primary = classOption.primaryAbilityIds.find((id) => background.abilityScoreIds.includes(id)) ?? background.abilityScoreIds[0];
  const secondary = background.abilityScoreIds.find((id) => id !== primary);
  if (!primary || !secondary) throw new Error("Guided Narrative background does not expose enough legal abilities.");
  const plan: Dnd5eAbilityIncreasePlan = {};
  plan[primary] = 2;
  plan[secondary] = 1;
  return plan;
}

function resolveOverride<TId extends string>(
  override: string | undefined,
  mapping: Dnd5eGuidedNarrativeMappedChoice<TId>,
  isSupported: (value: string) => value is TId,
  label: string,
): TId {
  if (override === undefined) return mapping.recommendedId;
  if (!isSupported(override)) throw new Error(`Unsupported Guided Narrative ${label} override.`);
  if (!mapping.candidateIds.includes(override)) {
    throw new Error(`Guided Narrative ${label} override must stay within the narrowed narrative candidate set.`);
  }
  return override;
}

function isEquipmentPreferenceId(value: string): value is Dnd5eGuidedNarrativeEquipmentPreferenceId {
  return value === "prepared-gear" || value === "starting-gold";
}

function isFighterStylePreferenceId(value: string): value is Dnd5eGuidedNarrativeFighterStylePreferenceId {
  return value === "control-from-range" || value === "hold-the-line" || value === "heavy-weapon" || value === "paired-weapons";
}

function isSupportedAlignment(value: string): boolean {
  return DND5E_ALIGNMENT_OPTIONS.some((option) => option.id === value);
}

function assertNarrativeQuestionShape(): void {
  for (const question of DND5E_GUIDED_NARRATIVE_QUESTIONS) assertQuestionShape(question.id, question.options);
  assertQuestionShape(DND5E_GUIDED_NARRATIVE_FIGHTER_STYLE_QUESTION.id, DND5E_GUIDED_NARRATIVE_FIGHTER_STYLE_QUESTION.options);
}

function assertQuestionShape(id: string, options: readonly Dnd5eGuidedNarrativeQuestionOption[]): void {
  if (options.length > DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES) {
    throw new Error(`Guided Narrative question ${id} exceeds the ${DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES}-choice presentation limit.`);
  }
  if (!options.some((option) => option.id === DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID)) {
    throw new Error(`Guided Narrative question ${id} must include Choose for me.`);
  }
}

function assertPresentedChoiceCount(label: string, values: readonly string[]): void {
  if (values.length === 0) throw new Error(`Guided Narrative ${label} candidate set is empty.`);
  if (values.length > DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES) {
    throw new Error(`Guided Narrative ${label} candidate set exceeds the ${DND5E_GUIDED_NARRATIVE_MAX_PRESENTED_CHOICES}-choice presentation limit; add an upstream narrowing question.`);
  }
}

function pick<T>(values: readonly T[], random: RandomSource): T {
  const value = values[Math.floor(random() * values.length)];
  if (value === undefined) throw new Error("Guided Narrative choice set is empty.");
  return value;
}
