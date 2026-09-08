import type {
  BrpAcademicSkillSelection,
  BrpCharacteristicValues,
  BrpSkillSpecialty,
} from "./nativeCharacter.js";

export interface BrpStaticSkillDefinitionTemplate {
  skillId: string;
  label: string;
  baseChance: number | "int-x5";
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
  "firearm:handgun": {
    skillId: "firearm",
    label: "Firearm (Handgun)",
    baseChance: 20,
    specialty: { id: "handgun", label: "Handgun" },
  },
  "knowledge:law": {
    skillId: "knowledge",
    label: "Knowledge (Law)",
    baseChance: 5,
    specialty: { id: "law", label: "Law" },
  },
  listen: { skillId: "listen", label: "Listen", baseChance: 25, specialty: null },
  persuade: { skillId: "persuade", label: "Persuade", baseChance: 15, specialty: null },
  spot: { skillId: "spot", label: "Spot", baseChance: 25, specialty: null },
  research: { skillId: "research", label: "Research", baseChance: 25, specialty: null },
  brawl: { skillId: "brawl", label: "Brawl", baseChance: 25, specialty: null },
  "fast-talk": { skillId: "fast-talk", label: "Fast Talk", baseChance: 5, specialty: null },
  hide: { skillId: "hide", label: "Hide", baseChance: 10, specialty: null },
  insight: { skillId: "insight", label: "Insight", baseChance: 5, specialty: null },
  "science:forensics": {
    skillId: "science",
    label: "Science (Forensics)",
    baseChance: 1,
    specialty: { id: "forensics", label: "Forensics" },
  },
  stealth: { skillId: "stealth", label: "Stealth", baseChance: 10, specialty: null },
  track: { skillId: "track", label: "Track", baseChance: 10, specialty: null },
  "first-aid": { skillId: "first-aid", label: "First Aid", baseChance: 30, specialty: null },
  "language:other": { skillId: "language", label: "Language (Other)", baseChance: 0, specialty: null },
  "language:own": { skillId: "language", label: "Language (Own)", baseChance: "int-x5", specialty: null },
  teach: { skillId: "teach", label: "Teach", baseChance: 10, specialty: null },
} as const satisfies Record<string, BrpStaticSkillDefinitionTemplate>;

export type BrpFirstSliceSkillKey = keyof typeof BRP_FIRST_SLICE_SKILL_CATALOG;

export interface BrpStaticSkillAllocationInput {
  skillKey: BrpFirstSliceSkillKey;
  points: number;
  skill?: never;
}

export interface BrpAcademicSkillAllocationInput {
  skill: BrpAcademicSkillSelection;
  points: number;
  skillKey?: never;
}

export type BrpSkillAllocationInput = BrpStaticSkillAllocationInput | BrpAcademicSkillAllocationInput;

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
    baseChance: definition.baseChance === "int-x5"
      ? characteristics.INT * 5
      : definition.baseChance,
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

export function resolveBrpAllocationSkillDefinition(
  allocation: BrpSkillAllocationInput,
  characteristics: BrpCharacteristicValues,
): BrpResolvedSkillDefinition {
  if ("skillKey" in allocation && allocation.skillKey !== undefined) {
    return resolveBrpStaticSkillDefinition(allocation.skillKey, characteristics);
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

function isSpecialty(value: unknown): value is BrpSkillSpecialty {
  return !!value
    && typeof value === "object"
    && !Array.isArray(value)
    && typeof (value as Record<string, unknown>).id === "string"
    && typeof (value as Record<string, unknown>).label === "string";
}
