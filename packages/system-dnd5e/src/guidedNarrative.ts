import type { CharacterDocument, GenerationDecision, JsonObject } from "../../character-model/src/index.js";
import { createGeneratedSeed, createSeededRandom, type RandomSource } from "../../generator-core/src/index.js";
import { DND5E_STANDARD_ARRAY, type Dnd5eAbilityIncreasePlan } from "./abilityGeneration.js";
import { defaultGuidedDnd5eCoreChoices } from "./guidedDefaults.js";
import { guidedGenerateDnd5eFirstSlice } from "./guidedGenerate.js";
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
export const DND5E_GUIDED_NARRATIVE_MAPPING_VERSION = "1";
export const DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID = "choose-for-me";

export type Dnd5eGuidedNarrativeRoleAnswerId =
  | typeof DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID
  | "protect"
  | "outmaneuver"
  | "wield-magic"
  | "guide-others"
  | "overwhelm";
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
  | "uncanny"
  | "small-lucky";
export type Dnd5eGuidedNarrativeQuestionId = "role" | "past" | "heritage";

export interface Dnd5eGuidedNarrativeAnswers {
  role: Dnd5eGuidedNarrativeRoleAnswerId;
  past: Dnd5eGuidedNarrativePastAnswerId;
  heritage: Dnd5eGuidedNarrativeHeritageAnswerId;
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
      { id: "protect", label: "Stand between danger and other people" },
      { id: "outmaneuver", label: "Win through speed, stealth, or clever positioning" },
      { id: "wield-magic", label: "Solve problems with strange or learned magic" },
      { id: "guide-others", label: "Keep people focused, inspired, or on the right path" },
      { id: "overwhelm", label: "Hit the problem hard and keep going" },
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
      { id: "uncanny", label: "Visibly supernatural, dramatic, or touched by strange powers" },
      { id: "small-lucky", label: "Small, surprising, and difficult to pin down" },
    ],
  },
] as const;

const ROLE_CLASS_MAP: Record<Exclude<Dnd5eGuidedNarrativeRoleAnswerId, typeof DND5E_GUIDED_NARRATIVE_CHOOSE_FOR_ME_ID>, readonly GuidedDnd5eClassId[]> = {
  protect: ["fighter", "paladin"],
  outmaneuver: ["rogue", "ranger", "monk"],
  "wield-magic": ["wizard", "sorcerer", "warlock"],
  "guide-others": ["bard", "cleric", "druid"],
  overwhelm: ["barbarian", "fighter"],
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
  uncanny: ["tiefling", "dragonborn"],
  "small-lucky": ["halfling", "gnome"],
};

export interface Dnd5eGuidedNarrativeResolvedAnswer {
  submittedId: string;
  resolvedId: string;
}

export interface Dnd5eGuidedNarrativeMappedChoice<TId extends string> {
  candidateIds: readonly TId[];
  recommendedId: TId;
}

export interface Dnd5eGuidedNarrativeRecommendation {
  mappingId: typeof DND5E_GUIDED_NARRATIVE_MAPPING_ID;
  mappingVersion: typeof DND5E_GUIDED_NARRATIVE_MAPPING_VERSION;
  seed: string;
  answers: {
    role: Dnd5eGuidedNarrativeResolvedAnswer;
    past: Dnd5eGuidedNarrativeResolvedAnswer;
    heritage: Dnd5eGuidedNarrativeResolvedAnswer;
  };
  classChoice: Dnd5eGuidedNarrativeMappedChoice<GuidedDnd5eClassId>;
  backgroundChoice: Dnd5eGuidedNarrativeMappedChoice<GuidedDnd5eBackgroundId>;
  speciesChoice: Dnd5eGuidedNarrativeMappedChoice<GuidedDnd5eSpeciesId>;
}

export interface RecommendDnd5eGuidedNarrativeInput {
  answers: Dnd5eGuidedNarrativeAnswers;
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
  const seed = input.seed?.trim() || createGeneratedSeed("dnd5e-narrative");
  const random = createSeededRandom(`${DND5E_GUIDED_NARRATIVE_MAPPING_ID}:${DND5E_GUIDED_NARRATIVE_MAPPING_VERSION}:${seed}`);
  const role = resolveNarrativeAnswer("role", input.answers.role, random);
  const past = resolveNarrativeAnswer("past", input.answers.past, random);
  const heritage = resolveNarrativeAnswer("heritage", input.answers.heritage, random);

  const classCandidates = ROLE_CLASS_MAP[role.resolvedId as keyof typeof ROLE_CLASS_MAP];
  const backgroundCandidates = PAST_BACKGROUND_MAP[past.resolvedId as keyof typeof PAST_BACKGROUND_MAP];
  const speciesCandidates = HERITAGE_SPECIES_MAP[heritage.resolvedId as keyof typeof HERITAGE_SPECIES_MAP];
  if (!classCandidates || !backgroundCandidates || !speciesCandidates) {
    throw new Error("Guided Narrative resolved to an unmapped D&D answer.");
  }

  return {
    mappingId: DND5E_GUIDED_NARRATIVE_MAPPING_ID,
    mappingVersion: DND5E_GUIDED_NARRATIVE_MAPPING_VERSION,
    seed,
    answers: { role, past, heritage },
    classChoice: { candidateIds: [...classCandidates], recommendedId: pick(classCandidates, random) },
    backgroundChoice: { candidateIds: [...backgroundCandidates], recommendedId: pick(backgroundCandidates, random) },
    speciesChoice: { candidateIds: [...speciesCandidates], recommendedId: pick(speciesCandidates, random) },
  };
}

export function guidedNarrativeGenerateDnd5eFirstSlice(
  input: GuidedNarrativeGenerateDnd5eInput,
): CharacterDocument {
  const recommendation = recommendDnd5eGuidedNarrative(input);
  const classId = resolveOverride(input.overrides?.classId, recommendation.classChoice.recommendedId, isGuidedDnd5eClassId, "class");
  const backgroundId = resolveOverride(input.overrides?.backgroundId, recommendation.backgroundChoice.recommendedId, isGuidedDnd5eBackgroundId, "background");
  const speciesId = resolveOverride(input.overrides?.speciesId, recommendation.speciesChoice.recommendedId, isGuidedDnd5eSpeciesId, "species");

  const character = guidedGenerateDnd5eFirstSlice({
    name: input.name ?? "",
    classChoice: { selectedId: classId, acceptableIds: [classId], selectionMode: "direct" },
    backgroundChoice: { selectedId: backgroundId, acceptableIds: [backgroundId], selectionMode: "direct" },
    speciesChoice: { selectedId: speciesId, acceptableIds: [speciesId], selectionMode: "direct" },
    coreChoices: defaultGuidedDnd5eCoreChoices(classId, backgroundId, speciesId),
    abilityMethod: { method: "standard-array", assignment: narrativeStandardArray(classId) },
    backgroundIncreases: narrativeBackgroundIncreases(classId, backgroundId),
    backgroundEquipmentChoice: "A",
  });

  const generation = character.generation;
  if (!generation) throw new Error("Guided Narrative generation did not produce provenance.");
  const baseGuidedRecipe = generation.recipe;
  const narrativeDecisions = createNarrativeDecisions(recommendation, { classId, backgroundId, speciesId });
  const filteredBaseDecisions = generation.decisions
    .filter((decision) => !["class.acceptable-pool", "background.acceptable-pool", "species.acceptable-pool"].includes(decision.stepId))
    .map((decision) => rewriteMappedChoiceRationale(decision, recommendation, { classId, backgroundId, speciesId }));

  generation.methodId = "dnd5e:guided-narrative-level-one";
  generation.mode = "guided-narrative";
  generation.recipeVersion = "0.1";
  generation.seed = recommendation.seed;
  generation.recipe = {
    mappingId: recommendation.mappingId,
    mappingVersion: recommendation.mappingVersion,
    sequence: ["narrative.role", "narrative.past", "narrative.heritage", "mapped-guided-generation"],
    classId,
    backgroundId,
    speciesId,
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

function createNarrativeDecisions(
  recommendation: Dnd5eGuidedNarrativeRecommendation,
  finalChoices: { classId: GuidedDnd5eClassId; backgroundId: GuidedDnd5eBackgroundId; speciesId: GuidedDnd5eSpeciesId },
): GenerationDecision[] {
  return [
    answerDecision("role", recommendation.answers.role),
    answerDecision("past", recommendation.answers.past),
    answerDecision("heritage", recommendation.answers.heritage),
    mappingDecision("class", recommendation.classChoice, finalChoices.classId),
    mappingDecision("background", recommendation.backgroundChoice, finalChoices.backgroundId),
    mappingDecision("species", recommendation.speciesChoice, finalChoices.speciesId),
    {
      stepId: "narrative.remaining-choices",
      answer: {
        abilityMethod: "standard-array",
        coreChoices: "current-guided-defaults",
        backgroundEquipmentChoice: "A",
      },
      rationale: "The first Guided Narrative slice maps Class, Background, and Species only; remaining legal choices use the existing guided defaults.",
    },
  ];
}

function answerDecision(
  questionId: Dnd5eGuidedNarrativeQuestionId,
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
  target: "class" | "background" | "species",
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
      ? `The player overrode the Guided Narrative ${target} recommendation.`
      : `The player accepted the Guided Narrative ${target} recommendation.`,
  };
}

function rewriteMappedChoiceRationale(
  decision: GenerationDecision,
  recommendation: Dnd5eGuidedNarrativeRecommendation,
  finalChoices: { classId: GuidedDnd5eClassId; backgroundId: GuidedDnd5eBackgroundId; speciesId: GuidedDnd5eSpeciesId },
): GenerationDecision {
  if (decision.stepId === "class") return { ...decision, rationale: mappedChoiceRationale("class", recommendation.classChoice.recommendedId, finalChoices.classId) };
  if (decision.stepId === "background") return { ...decision, rationale: mappedChoiceRationale("background", recommendation.backgroundChoice.recommendedId, finalChoices.backgroundId) };
  if (decision.stepId === "species") return { ...decision, rationale: mappedChoiceRationale("species", recommendation.speciesChoice.recommendedId, finalChoices.speciesId) };
  return decision;
}

function mappedChoiceRationale(target: string, recommendedId: string, finalId: string): string {
  return recommendedId === finalId
    ? `Accepted Guided Narrative ${target} recommendation.`
    : `Player override of Guided Narrative ${target} recommendation ${recommendedId}.`;
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
  recommendedId: TId,
  isSupported: (value: string) => value is TId,
  label: string,
): TId {
  if (override === undefined) return recommendedId;
  if (!isSupported(override)) throw new Error(`Unsupported Guided Narrative ${label} override.`);
  return override;
}

function pick<T>(values: readonly T[], random: RandomSource): T {
  const value = values[Math.floor(random() * values.length)];
  if (value === undefined) throw new Error("Guided Narrative choice set is empty.");
  return value;
}
