import { describe, expect, it } from "vitest";
import { parseCharacterDocument } from "../../character-model/src/index.js";
import {
  brpUge105Adapter,
  buildBrpFirstSliceCharacter,
  type BrpAcademicSkillSelection,
  type BrpNativeCharacter,
  type BrpScholarFirstSliceInput,
  type BrpSkillAllocationInput,
} from "./index.js";

const ACADEMIC_SKILLS: BrpAcademicSkillSelection[] = [
  { skillId: "knowledge", specialty: { id: "history", label: "History" } },
  { skillId: "knowledge", specialty: { id: "linguistics", label: "Linguistics" } },
  { skillId: "knowledge", specialty: { id: "philosophy", label: "Philosophy" } },
  { skillId: "science", specialty: { id: "biology", label: "Biology" } },
  { skillId: "science", specialty: { id: "astronomy", label: "Astronomy" } },
];

function academicAllocation(
  skillId: "knowledge" | "science",
  id: string,
  label: string,
  points: number,
): BrpSkillAllocationInput {
  return { skill: { skillId, specialty: { id, label } }, points };
}

function languageAllocation(
  role: "own" | "other",
  id: string,
  label: string,
  points: number,
): BrpSkillAllocationInput {
  return { language: { role, language: { id, label } }, points };
}

function validInput(): BrpScholarFirstSliceInput {
  return {
    characterId: "character-language-1111-4222-8333-444444444444",
    nativeStateId: "native-language-1111-4222-8333-444444444444",
    displayName: "Avery Rowan",
    age: 22,
    gender: "woman",
    wealth: "average",
    professionId: "scholar",
    scholarOwnLanguage: { id: "english", label: "English" },
    scholarOtherLanguage: { id: "latin", label: "Latin" },
    characteristics: {
      STR: 12,
      CON: 12,
      SIZ: 14,
      INT: 13,
      POW: 13,
      DEX: 12,
      CHA: 12,
    },
    scholarAcademicSkills: structuredClone(ACADEMIC_SKILLS),
    professionalAllocations: [
      languageAllocation("other", "latin", "Latin", 20),
      languageAllocation("own", "english", "English", 5),
      { skillKey: "persuade", points: 20 },
      { skillKey: "research", points: 25 },
      { skillKey: "teach", points: 20 },
      academicAllocation("knowledge", "history", "History", 35),
      academicAllocation("knowledge", "linguistics", "Linguistics", 30),
      academicAllocation("knowledge", "philosophy", "Philosophy", 25),
      academicAllocation("science", "biology", "Biology", 35),
      academicAllocation("science", "astronomy", "Astronomy", 35),
    ],
    personalAllocations: [
      { skillKey: "first-aid", points: 30 },
      { skillKey: "stealth", points: 30 },
      { skillKey: "spot", points: 20 },
      academicAllocation("science", "chemistry", "Chemistry", 25),
      academicAllocation("knowledge", "history", "History", 25),
    ],
  };
}

describe("BRP named language identity", () => {
  it("retains exact Own and Other language identities with source-derived bases", () => {
    const document = buildBrpFirstSliceCharacter(validInput());
    const native = document.nativeStates[0].payload as BrpNativeCharacter;
    if (native.identity.profession.professionId !== "scholar") {
      throw new Error("Expected Scholar profession state.");
    }

    expect(native.identity.profession.ownLanguage).toEqual({ id: "english", label: "English" });
    expect(native.identity.profession.otherLanguage).toEqual({ id: "latin", label: "Latin" });

    const own = native.skills.find((skill) => skill.skillId === "language-own" && skill.specialty?.id === "english");
    const other = native.skills.find((skill) => skill.skillId === "language-other" && skill.specialty?.id === "latin");
    expect(own).toMatchObject({
      label: "Language (Own)",
      specialty: { id: "english", label: "English" },
      baseChance: 65,
      contributions: { professional: 5, personal: 0 },
      finalRating: 70,
    });
    expect(other).toMatchObject({
      label: "Language (Other)",
      specialty: { id: "latin", label: "Latin" },
      baseChance: 0,
      contributions: { professional: 20, personal: 0 },
      finalRating: 20,
    });
    expect(brpUge105Adapter.validateNativeState(document.nativeStates[0])).toEqual({ valid: true, issues: [] });
  });

  it("rejects one identical language identity in contradictory Own and Other roles", () => {
    const input = validInput();
    input.scholarOtherLanguage = { id: "english", label: "English (Other)" };

    expect(() => buildBrpFirstSliceCharacter(input)).toThrow(/Own and Other language identities must be different/);
  });

  it("rejects blank language identity fields", () => {
    const input = validInput();
    input.scholarOwnLanguage = { id: " ", label: "English" };

    expect(() => buildBrpFirstSliceCharacter(input)).toThrow(/language identities must retain non-empty IDs and labels/);
  });

  it("allows personal learning of an additional Other language outside Scholar professional choices", () => {
    const input = validInput();
    input.personalAllocations = [
      { skillKey: "first-aid", points: 30 },
      { skillKey: "stealth", points: 30 },
      languageAllocation("other", "french", "French", 20),
      academicAllocation("science", "chemistry", "Chemistry", 25),
      academicAllocation("knowledge", "history", "History", 25),
    ];

    const document = buildBrpFirstSliceCharacter(input);
    const native = document.nativeStates[0].payload as BrpNativeCharacter;
    const french = native.skills.find((skill) => skill.skillId === "language-other" && skill.specialty?.id === "french");

    expect(french).toMatchObject({
      specialty: { id: "french", label: "French" },
      baseChance: 0,
      contributions: { professional: 0, personal: 20 },
      finalRating: 20,
    });
    expect(brpUge105Adapter.validateNativeState(document.nativeStates[0])).toEqual({ valid: true, issues: [] });
  });

  it("detects retained Scholar language identity tampering independently of the builder", () => {
    const document = buildBrpFirstSliceCharacter(validInput());
    const state = structuredClone(document.nativeStates[0]);
    const native = state.payload as BrpNativeCharacter;
    if (native.identity.profession.professionId !== "scholar") {
      throw new Error("Expected Scholar profession state.");
    }
    native.identity.profession.otherLanguage.id = "greek";
    native.identity.profession.otherLanguage.label = "Greek";

    const validation = brpUge105Adapter.validateNativeState(state);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain("brp.skills.profession");
  });

  it("independently validates Own INT x 5 and Other zero-percent source bases", () => {
    const document = buildBrpFirstSliceCharacter(validInput());
    const state = structuredClone(document.nativeStates[0]);
    const native = state.payload as BrpNativeCharacter;
    const own = native.skills.find((skill) => skill.skillId === "language-own");
    const other = native.skills.find((skill) => skill.skillId === "language-other");
    if (!own || !other) throw new Error("Expected language fixture skills.");
    own.baseChance = 60;
    other.baseChance = 5;

    const validation = brpUge105Adapter.validateNativeState(state);
    expect(validation.valid).toBe(false);
    expect(validation.issues.filter((issue) => issue.code === "brp.skills.base")).toHaveLength(2);
  });

  it("round-trips language identity and generation decisions without reconstruction", () => {
    const document = buildBrpFirstSliceCharacter(validInput());
    const parsed = parseCharacterDocument(JSON.parse(JSON.stringify(document)));
    const ownDecision = parsed?.generation?.decisions.find((entry) => entry.stepId === "identity.language-own");
    const otherDecision = parsed?.generation?.decisions.find((entry) => entry.stepId === "identity.language-other");

    expect(parsed).toEqual(document);
    expect(parsed?.generation?.recipeVersion).toBe("brp-uge-first-slice/0.5");
    expect(ownDecision?.answer).toEqual({ id: "english", label: "English" });
    expect(otherDecision?.answer).toEqual({ id: "latin", label: "Latin" });
  });
});
