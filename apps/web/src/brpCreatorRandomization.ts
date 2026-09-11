import {
  createGeneratedSeed,
  createSeededRandom,
  type RandomSource,
} from "../../../packages/generator-core/src/index.js";
import {
  BRP_ATHLETE_ELECTIVE_SKILL_KEYS,
  BRP_DETECTIVE_ELECTIVE_SKILL_KEYS,
  allowedBrpWealthLevels,
  generateBrpStandardRolledCharacteristics,
  type BrpAcademicSkillSelection,
  type BrpProfessionId,
} from "../../../packages/system-brp/src/index.js";
import {
  previewBrpCreatorState,
  type BrpCreatorAllocationState,
  type BrpCreatorSkillRow,
  type BrpCreatorState,
} from "./brpCreatorState.js";

const BRP_RANDOMIZABLE_PROFESSIONS = [
  "detective",
  "scholar",
  "athlete",
  "beggar",
] as const satisfies readonly BrpProfessionId[];

// Character Forge convenience content, not BRP rules content. BRP identity fields and
// Knowledge/Science specialties are open text, so this catalog only supplies useful
// defaults for the explicit Randomize All action.
const BRP_RANDOM_DISPLAY_NAMES = [
  "Avery Stone",
  "Mara Voss",
  "Rowan Hale",
  "Tamsin Reed",
  "Jonas Vale",
  "Nia Calder",
  "Morgan Ward",
  "Elena Mercer",
] as const;

const BRP_RANDOM_GENDERS = ["Woman", "Man", "Nonbinary"] as const;

const BRP_RANDOM_ACADEMIC_SPECIALTIES = [
  academic("knowledge", "history", "History"),
  academic("knowledge", "law", "Law"),
  academic("knowledge", "philosophy", "Philosophy"),
  academic("knowledge", "anthropology", "Anthropology"),
  academic("knowledge", "literature", "Literature"),
  academic("science", "biology", "Biology"),
  academic("science", "chemistry", "Chemistry"),
  academic("science", "physics", "Physics"),
  academic("science", "forensics", "Forensics"),
  academic("science", "astronomy", "Astronomy"),
] as const satisfies readonly BrpAcademicSkillSelection[];

export interface BrpCreatorRandomizeAllResult {
  state: BrpCreatorState;
  seed: string;
}

export function randomizeBrpCreatorState(
  current: BrpCreatorState,
  seed?: string,
): BrpCreatorRandomizeAllResult {
  const effectiveSeed = seed?.trim() || createGeneratedSeed("brp-randomize-all");
  const random = createSeededRandom(effectiveSeed);
  const professionId = pickDifferent(BRP_RANDOMIZABLE_PROFESSIONS, current.professionId, random);
  const wealth = pick(allowedBrpWealthLevels(professionId), random);
  const age = randomAgeDifferentFrom(current.age, random);
  const defaultStartingAge = current.powerLevel === "heroic"
    ? 18 + Math.floor(random() * Math.max(1, Math.min(6, age - 17)))
    : current.defaultStartingAge;
  const rollSeed = `${effectiveSeed}:characteristics`;
  const randomizedCharacteristics = generateBrpStandardRolledCharacteristics(rollSeed).final;

  let state: BrpCreatorState = {
    ...current,
    displayName: pickDifferent(BRP_RANDOM_DISPLAY_NAMES, current.displayName, random),
    age,
    gender: pickDifferent(BRP_RANDOM_GENDERS, current.gender, random),
    wealth,
    professionId,
    defaultStartingAge,
    characteristics: current.characteristicMethod === "explicit"
      ? { ...randomizedCharacteristics }
      : { ...current.characteristics },
    rollSeed: current.characteristicMethod === "standard-rolled" ? rollSeed : current.rollSeed,
    redistribution: [],
    detectiveElectives: pickDistinct(BRP_DETECTIVE_ELECTIVE_SKILL_KEYS, 4, random),
    athleteElectives: pickDistinct(BRP_ATHLETE_ELECTIVE_SKILL_KEYS, 5, random),
    scholarAcademicSkills: pickDistinct(BRP_RANDOM_ACADEMIC_SPECIALTIES, 5, random).map(cloneAcademic),
    allocations: {},
  };

  state = randomizeAllocations(state, random);
  return { state, seed: effectiveSeed };
}

function randomizeAllocations(state: BrpCreatorState, random: RandomSource): BrpCreatorState {
  const preview = previewBrpCreatorState(state);
  if (!preview.skillRows.length || preview.startingSkillCap <= 0) {
    throw new Error(`BRP Randomize All could not build a legal skill surface: ${preview.validationMessage}`);
  }

  const allocations: Record<string, BrpCreatorAllocationState> = {};
  spendBudget(
    preview.professionalBudget,
    preview.skillRows.filter((row) => row.professionalEligible),
    "professionalPoints",
    allocations,
    preview.startingSkillCap,
    random,
  );
  spendBudget(
    preview.personalBudget,
    preview.skillRows,
    "personalPoints",
    allocations,
    preview.startingSkillCap,
    random,
  );

  const result = { ...state, allocations };
  const finalPreview = previewBrpCreatorState(result);
  if (!finalPreview.validCharacter) {
    throw new Error(`BRP Randomize All produced an invalid allocation: ${finalPreview.validationMessage}`);
  }
  return result;
}

function spendBudget(
  budget: number,
  rows: readonly BrpCreatorSkillRow[],
  source: keyof BrpCreatorAllocationState,
  allocations: Record<string, BrpCreatorAllocationState>,
  startingSkillCap: number,
  random: RandomSource,
): void {
  let remaining = budget;
  let guard = 0;
  while (remaining > 0) {
    guard += 1;
    if (guard > 10_000) throw new Error("BRP Randomize All exceeded its bounded allocation loop.");
    const eligible = rows.filter((row) => capacityFor(row, allocations, startingSkillCap) > 0);
    if (!eligible.length) throw new Error(`BRP Randomize All could not legally spend the remaining ${source} budget.`);
    const row = pick(eligible, random);
    const capacity = capacityFor(row, allocations, startingSkillCap);
    const maxChunk = Math.min(remaining, capacity, 25);
    const points = Math.max(1, Math.ceil(random() * maxChunk));
    const current = allocations[row.key] ?? { professionalPoints: 0, personalPoints: 0 };
    allocations[row.key] = { ...current, [source]: current[source] + points };
    remaining -= points;
  }
}

function capacityFor(
  row: BrpCreatorSkillRow,
  allocations: Record<string, BrpCreatorAllocationState>,
  startingSkillCap: number,
): number {
  const current = allocations[row.key] ?? { professionalPoints: 0, personalPoints: 0 };
  return Math.max(0, startingSkillCap - row.baseChance - current.professionalPoints - current.personalPoints);
}

function randomAgeDifferentFrom(current: number, random: RandomSource): number {
  const candidate = 18 + Math.floor(random() * 32);
  if (candidate !== current) return candidate;
  return candidate === 49 ? 18 : candidate + 1;
}

function pick<T>(values: readonly T[], random: RandomSource): T {
  if (!values.length) throw new Error("Cannot randomize from an empty BRP choice set.");
  const selected = values[Math.floor(random() * values.length)];
  if (selected === undefined) throw new Error("BRP random choice resolution failed.");
  return selected;
}

function pickDifferent<T extends string>(values: readonly T[], current: string, random: RandomSource): T {
  const eligible = values.filter((value) => value !== current);
  return pick(eligible.length ? eligible : values, random);
}

function pickDistinct<T>(values: readonly T[], count: number, random: RandomSource): T[] {
  if (count > values.length) throw new Error("BRP random choice set does not contain enough distinct values.");
  const remaining = [...values];
  const selected: T[] = [];
  while (selected.length < count) {
    const index = Math.floor(random() * remaining.length);
    const [choice] = remaining.splice(index, 1);
    if (choice === undefined) throw new Error("BRP distinct random choice resolution failed.");
    selected.push(choice);
  }
  return selected;
}

function academic(
  skillId: "knowledge" | "science",
  id: string,
  label: string,
): BrpAcademicSkillSelection {
  return { skillId, specialty: { id, label } };
}

function cloneAcademic(selection: BrpAcademicSkillSelection): BrpAcademicSkillSelection {
  return { skillId: selection.skillId, specialty: { ...selection.specialty } };
}
