import type {
  BrpAcademicSkillSelection,
  BrpCharacteristicValues,
  BrpLanguageIdentity,
  BrpLanguageSkillSelection,
  BrpSkillSpecialty,
} from "./nativeCharacter.js";

export interface BrpStaticSkillDefinitionTemplate {
  skillId: string;
  label: string;
  baseChance: number | "DEXx2";
  specialty: BrpSkillSpecialty | null;
}

export interface BrpResolvedSkillDefinition {
  key: string;
  skillId: string;
  label: string;
  baseChance: number;
  specialty: BrpSkillSpecialty | null;
}

export const BRP_FIRST_SLICE_SKILL_CATALOG = {
  appraise: { skillId: "appraise", label: "Appraise", baseChance: 15, specialty: null },
  bargain: { skillId: "bargain", label: "Bargain", baseChance: 5, specialty: null },
  brawl: { skillId: "brawl", label: "Brawl", baseChance: 25, specialty: null },
  climb: { skillId: "climb", label: "Climb", baseChance: 40, specialty: null },
  command: { skillId: "command", label: "Command", baseChance: 5, specialty: null },
  disguise: { skillId: "disguise", label: "Disguise", baseChance: 1, specialty: null },
  dodge: { skillId: "dodge", label: "Dodge", baseChance: "DEXx2", specialty: null },
  "fast-talk": { skillId: "fast-talk", label: "Fast Talk", baseChance: 5, specialty: null },
  "firearm:handgun": {
    skillId: "firearm",
    label: "Firearm (Handgun)",
    baseChance: 20,
    specialty: { id: "handgun", label: "Handgun" },
  },
  "first-aid": { skillId: "first-aid", label: "First Aid", baseChance: 30, specialty: null },
  grapple: { skillId: "grapple", label: "Grapple", baseChance: 25, specialty: null },
  hide: { skillId: "hide", label: "Hide", baseChance: 10, specialty: null },
  insight: { skillId: "insight", label: "Insight", baseChance: 5, specialty: null },
  jump: { skillId: "jump", label: "Jump", baseChance: 25, specialty: null },
  "knowledge:law": {
    skillId: "knowledge",
    label: "Knowledge (Law)",
    baseChance: 5,
    specialty: { id: "law", label: "Law" },
  },
  "knowledge:region-local": {
    skillId: "knowledge",
    label: "Knowledge (Region: Local Area)",
    baseChance: 5,
    specialty: { id: "region-local", label: "Region: Local Area" },
  },
  listen: { skillId: "listen", label: "Listen", baseChance: 25, specialty: null },
  medicine: { skillId: "medicine", label: "Medicine", baseChance: 5, specialty: null },
  navigate: { skillId: "navigate", label: "Navigate", baseChance: 10, specialty: null },
  persuade: { skillId: "persuade", label: "Persuade", baseChance: 15, specialty: null },
  research: { skillId: "research", label: "Research", baseChance: 25, specialty: null },
  sense: { skillId: "sense", label: "Sense", baseChance: 10, specialty: null },
  "science:forensics": {
    skillId: "science",
    label: "Science (Forensics)",
    baseChance: 1,
    specialty: { id: "forensics", label: "Forensics" },
  },
  "sleight-of-hand": { skillId: "sleight-of-hand", label: "Sleight of Hand", baseChance: 5, specialty: null },
  spot: { skillId: "spot", label: "Spot", baseChance: 25, specialty: null },
  status: { skillId: "status", label: "Status", baseChance: 15, specialty: null },
  stealth: { skillId: "stealth", label: "Stealth", baseChance: 10, specialty: null },
  swim: { skillId: "swim", label: "Swim", baseChance: 25, specialty: null },
  teach: { skillId: "teach", label: "Teach", baseChance: 10, specialty: null },
  "technical:computer-use": {
    skillId: "technical",
    label: "Technical (Computer Use)",
    baseChance: 5,
    specialty: { id: "computer-use", label: "Computer Use" },
  },
  throw: { skillId: "throw", label: "Throw", baseChance: 25, specialty: null },
  track: { skillId: "track", label: "Track", baseChance: 10, specialty: null },
} as const satisfies Record<string, BrpStaticSkillDefinitionTemplate>;

export type BrpFirstSliceSkillKey = keyof typeof BRP_FIRST_SLICE_SKILL_CATALOG;

export interface BrpStaticSkillAllocationInput {
  skillKey: BrpFirstSliceSkillKey;
  points: number;
  skill?: never;
  language?: never;
}

export interface BrpAcademicSkillAllocationInput {
  skill: BrpAcademicSkillSelection;
  points: number;
  skillKey?: never;
  language?: never;
}

export interface BrpLanguageSkillAllocationInput {
  language: BrpLanguageSkillSelection;
  points: number;
  skillKey?: never;
  skill?: never;
}

export type BrpSkillAllocationInput =
  | BrpStaticSkillAllocationInput
  | BrpAcademicSkillAllocationInput
  | BrpLanguageSkillAllocationInput;

export function brpSkillIdentityKey(skillId: string, specialty: BrpSkillSpecialty | null): string {
  return JSON.stringify([skillId, specialty?.id ?? null]);
}

export function resolveBrpStaticSkillDefinition(
  skillKey: BrpFirstSliceSkillKey,
  characteristics: BrpCharacteristicValues,
): BrpResolvedSkillDefinition {
  const definition = BRP_FIRST_SLICE_SKILL_CATALOG[skillKey];
  const specialty = definition.specialty ? { ...definition.specialty } : null;
  return {
    key: brpSkillIdentityKey(definition.skillId, specialty),
    skillId: definition.skillId,
    label: definition.label,
    baseChance: definition.baseChance === "DEXx2" ? characteristics.DEX * 2 : definition.baseChance,
    specialty,
  };
}

export function resolveBrpAcademicSkillDefinition(
  selection: BrpAcademicSkillSelection,
): BrpResolvedSkillDefinition {
  const specialty = {
    id: selection.specialty.id.trim(),
    label: selection.specialty.label.trim(),
  };
  const parentLabel = selection.skillId === "knowledge" ? "Knowledge" : "Science";
  return {
    key: brpSkillIdentityKey(selection.skillId, specialty),
    skillId: selection.skillId,
    label: `${parentLabel} (${specialty.label})`,
    baseChance: selection.skillId === "knowledge" ? 5 : 1,
    specialty,
  };
}

export function resolveBrpLanguageSkillDefinition(
  selection: BrpLanguageSkillSelection,
  characteristics: BrpCharacteristicValues,
): BrpResolvedSkillDefinition {
  const normalized = normalizeBrpLanguageSkillSelection(selection);
  const skillId = normalized.role === "own" ? "language-own" : "language-other";
  const label = normalized.role === "own" ? "Language (Own)" : "Language (Other)";
  const specialty = { ...normalized.language };
  return {
    key: brpSkillIdentityKey(skillId, specialty),
    skillId,
    label,
    baseChance: normalized.role === "own" ? characteristics.INT * 5 : 0,
    specialty,
  };
}

export function resolveBrpAllocationSkillDefinition(
  allocation: BrpSkillAllocationInput,
  characteristics: BrpCharacteristicValues,
): BrpResolvedSkillDefinition {
  if ("skillKey" in allocation && allocation.skillKey !== undefined) {
    return resolveBrpStaticSkillDefinition(allocation.skillKey, characteristics);
  }
  if ("language" in allocation && allocation.language !== undefined) {
    return resolveBrpLanguageSkillDefinition(allocation.language, characteristics);
  }
  return resolveBrpAcademicSkillDefinition(normalizeBrpAcademicSkillSelection(allocation.skill));
}

export function identifyBrpSkillDefinition(
  skillId: unknown,
  specialty: unknown,
  characteristics: BrpCharacteristicValues,
): BrpResolvedSkillDefinition | null {
  for (const skillKey of Object.keys(BRP_FIRST_SLICE_SKILL_CATALOG) as BrpFirstSliceSkillKey[]) {
    const candidate = resolveBrpStaticSkillDefinition(skillKey, characteristics);
    if (skillId !== candidate.skillId) continue;
    if (candidate.specialty === null) {
      if (specialty === null) return candidate;
      continue;
    }
    if (isSpecialty(specialty)
      && specialty.id === candidate.specialty.id
      && specialty.label === candidate.specialty.label) {
      return candidate;
    }
  }

  if ((skillId === "language-own" || skillId === "language-other") && isSpecialty(specialty)) {
    const id = specialty.id.trim();
    const label = specialty.label.trim();
    if (!id || !label) return null;
    return resolveBrpLanguageSkillDefinition({
      role: skillId === "language-own" ? "own" : "other",
      language: { id, label },
    }, characteristics);
  }

  if ((skillId === "knowledge" || skillId === "science") && isSpecialty(specialty)) {
    const id = specialty.id.trim();
    const label = specialty.label.trim();
    if (!id || !label) return null;
    return resolveBrpAcademicSkillDefinition({
      skillId,
      specialty: { id, label },
    });
  }

  return null;
}

export function normalizeBrpAcademicSkillSelection(value: BrpAcademicSkillSelection): BrpAcademicSkillSelection {
  if (value.skillId !== "knowledge" && value.skillId !== "science") {
    throw new Error("Scholar academic skills must use Knowledge or Science parent skills.");
  }
  const id = value.specialty?.id?.trim();
  const label = value.specialty?.label?.trim();
  if (!id || !label) {
    throw new Error("Scholar academic skills must retain non-empty specialty IDs and labels.");
  }
  return {
    skillId: value.skillId,
    specialty: { id, label },
  };
}

export function normalizeBrpLanguageIdentity(value: BrpLanguageIdentity): BrpLanguageIdentity {
  const id = value?.id?.trim();
  const label = value?.label?.trim();
  if (!id || !label) {
    throw new Error("BRP language identities must retain non-empty IDs and labels.");
  }
  return { id, label };
}

export function normalizeBrpLanguageSkillSelection(
  value: BrpLanguageSkillSelection,
): BrpLanguageSkillSelection {
  if (value.role !== "own" && value.role !== "other") {
    throw new Error("BRP language skills must retain an Own or Other source role.");
  }
  return {
    role: value.role,
    language: normalizeBrpLanguageIdentity(value.language),
  };
}

function isSpecialty(value: unknown): value is BrpSkillSpecialty {
  return !!value
    && typeof value === "object"
    && !Array.isArray(value)
    && typeof (value as Record<string, unknown>).id === "string"
    && typeof (value as Record<string, unknown>).label === "string";
}
