import { describe, expect, it } from "vitest";
import { parseCharacterDocument } from "../../character-model/src/index.js";
import {
  brpUge105Adapter,
  buildBrpFirstSliceCharacter,
  buildBrpStandardRolledFirstSliceCharacter,
  type BrpAcademicSkillSelection,
  type BrpNativeCharacter,
  type BrpScholarFirstSliceInput,
  type BrpScholarStandardRolledFirstSliceInput,
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
  return {
    skill: { skillId, specialty: { id, label } },
    points,
  };
}

function normalProfessionalAllocations(): BrpSkillAllocationInput[] {
  return [
    { skillKey: "language:other", points: 20 },
    { skillKey: "language:own", points: 5 },
    { skillKey: "persuade", points: 20 },
    { skillKey: "research", points: 25 },
    { skillKey: "teach", points: 20 },
    academicAllocation("knowledge", "history", "History", 35),
    academicAllocation("knowledge", "linguistics", "Linguistics", 30),
    academicAllocation("knowledge", "philosophy", "Philosophy", 25),
    academicAllocation("science", "biology", "Biology", 35),
    academicAllocation("science", "astronomy", "Astronomy", 35),
  ];
}

function heroicProfessionalAllocations(): BrpSkillAllocationInput[] {
  return [
    { skillKey: "language:other", points: 30 },
    { skillKey: "language:own", points: 10 },
    { skillKey: "persuade", points: 30 },
    { skillKey: "research", points: 55 },
    { skillKey: "teach", points: 30 },
    academicAllocation("knowledge", "history", "History", 40),
    academicAllocation("knowledge", "linguistics", "Linguistics", 40),
    academicAllocation("knowledge", "philosophy", "Philosophy", 35),
    academicAllocation("science", "biology", "Biology", 35),
    academicAllocation("science", "astronomy", "Astronomy", 20),
  ];
}

function personalAllocations(): BrpSkillAllocationInput[] {
  return [
    { skillKey: "first-aid", points: 30 },
    { skillKey: "stealth", points: 30 },
    { skillKey: "spot", points: 20 },
    academicAllocation("science", "chemistry", "Chemistry", 25),
    academicAllocation("knowledge", "history", "History", 25),
  ];
}

function normalExplicitInput(): BrpScholarFirstSliceInput {
  return {
    characterId: "character-scholar-1111-4222-8333-444444444444",
    nativeStateId: "native-brp-scholar-1111-4222-8333-444444444444",
    displayName: "Avery Rowan",
    age: 22,
    gender: "woman",
    wealth: "average",
    professionId: "scholar",
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
    professionalAllocations: normalProfessionalAllocations(),
    personalAllocations: personalAllocations(),
  };
}

function normalRolledInput(): BrpScholarStandardRolledFirstSliceInput {
  return {
    characterId: "character-scholar-aaaa-4bbb-8ccc-dddddddddddd",
    nativeStateId: "native-brp-scholar-aaaa-4bbb-8ccc-dddddddddddd",
    displayName: "Taylor Rowan",
    age: 22,
    gender: "nonbinary",
    wealth: "average",
    professionId: "scholar",
    seed: "brp-standard-roll-test",
    redistribution: [
      { from: "SIZ", to: "INT", points: 2 },
      { from: "CHA", to: "DEX", points: 1 },
    ],
    scholarAcademicSkills: structuredClone(ACADEMIC_SKILLS),
    professionalAllocations: normalProfessionalAllocations(),
    personalAllocations: personalAllocations(),
  };
}

function heroicExplicitInput(): BrpScholarFirstSliceInput {
  const input = normalExplicitInput();
  return {
    ...input,
    characterId: "character-scholar-heroic-1111-4222-833344444444",
    nativeStateId: "native-brp-scholar-heroic-1111-4222-833344444444",
    displayName: "Morgan Rowan",
    age: 20,
    defaultStartingAge: 20,
    powerLevel: "heroic",
    professionalAllocations: heroicProfessionalAllocations(),
  };
}

function heroicRolledInput(): BrpScholarStandardRolledFirstSliceInput {
  const input = normalRolledInput();
  return {
    ...input,
    characterId: "character-scholar-heroic-aaaa-4bbb-8cccdddddddd",
    nativeStateId: "native-brp-scholar-heroic-aaaa-4bbb-8cccdddddddd",
    displayName: "Riley Rowan",
    age: 20,
    defaultStartingAge: 20,
    powerLevel: "heroic",
    professionalAllocations: heroicProfessionalAllocations(),
  };
}

describe("BRP UGE Scholar profession", () => {
  it("supports Scholar across Normal/Heroic and explicit/standard-rolled construction", () => {
    const documents = [
      buildBrpFirstSliceCharacter(normalExplicitInput()),
      buildBrpStandardRolledFirstSliceCharacter(normalRolledInput()),
      buildBrpFirstSliceCharacter(heroicExplicitInput()),
      buildBrpStandardRolledFirstSliceCharacter(heroicRolledInput()),
    ];

    expect(documents.map((document) => {
      const native = document.nativeStates[0].payload as BrpNativeCharacter;
      return [
        native.rulesProfile.powerLevel,
        native.rulesProfile.characteristicGeneration,
        native.identity.profession.professionId,
        native.skillBudgets.professional.total,
      ];
    })).toEqual([
      ["normal", "explicit", "scholar", 250],
      ["normal", "standard-rolled", "scholar", 250],
      ["heroic", "explicit", "scholar", 325],
      ["heroic", "standard-rolled", "scholar", 325],
    ]);

    for (const document of documents) {
      expect(document.nativeStates[0].schemaVersion).toBe("brp-character/0.1");
      expect(brpUge105Adapter.validateNativeState(document.nativeStates[0])).toEqual({ valid: true, issues: [] });
    }
  });

  it("retains five open academic specialties and accepts repeated parent skills with distinct specialties", () => {
    const document = buildBrpFirstSliceCharacter(normalExplicitInput());
    const native = document.nativeStates[0].payload as BrpNativeCharacter;

    expect(native.identity.profession).toEqual({
      professionId: "scholar",
      wealth: "average",
      selectedAcademicSkills: ACADEMIC_SKILLS,
    });
    const history = native.skills.find((skill) => skill.skillId === "knowledge" && skill.specialty?.id === "history");
    const linguistics = native.skills.find((skill) => skill.skillId === "knowledge" && skill.specialty?.id === "linguistics");
    const biology = native.skills.find((skill) => skill.skillId === "science" && skill.specialty?.id === "biology");
    const languageOwn = native.skills.find((skill) => skill.label === "Language (Own)");

    expect(history).toMatchObject({ baseChance: 5, contributions: { professional: 35, personal: 25 }, finalRating: 65 });
    expect(linguistics).toMatchObject({ baseChance: 5, contributions: { professional: 30, personal: 0 }, finalRating: 35 });
    expect(biology).toMatchObject({ baseChance: 1, contributions: { professional: 35, personal: 0 }, finalRating: 36 });
    expect(languageOwn).toMatchObject({ baseChance: 65, contributions: { professional: 5, personal: 0 }, finalRating: 70 });
  });

  it("rejects duplicate parent plus specialty identity while allowing the same parent with different specialties", () => {
    const input = normalExplicitInput();
    input.scholarAcademicSkills[1] = structuredClone(input.scholarAcademicSkills[0]);

    expect(() => buildBrpFirstSliceCharacter(input)).toThrow(/unique by parent skill and specialty ID/);
  });

  it("rejects a non-Knowledge/Science academic specialty identity", () => {
    const input = normalExplicitInput();
    input.scholarAcademicSkills[0] = {
      skillId: "art",
      specialty: { id: "history", label: "History" },
    } as unknown as BrpAcademicSkillSelection;

    expect(() => buildBrpFirstSliceCharacter(input)).toThrow(/Knowledge or Science parent skills/);
  });

  it("prevents professional allocation outside Scholar fixed skills and selected academics", () => {
    const input = normalExplicitInput();
    input.professionalAllocations[0] = { skillKey: "spot", points: 20 };

    expect(() => buildBrpFirstSliceCharacter(input)).toThrow(/not available to the selected scholar profile/);
  });

  it("keeps personal learning independent from Scholar professional eligibility", () => {
    const document = buildBrpFirstSliceCharacter(normalExplicitInput());
    const native = document.nativeStates[0].payload as BrpNativeCharacter;
    const chemistry = native.skills.find((skill) => skill.skillId === "science" && skill.specialty?.id === "chemistry");
    const firstAid = native.skills.find((skill) => skill.skillId === "first-aid");

    expect(chemistry).toMatchObject({ contributions: { professional: 0, personal: 25 }, finalRating: 26 });
    expect(firstAid).toMatchObject({ contributions: { professional: 0, personal: 30 }, finalRating: 60 });
    expect(brpUge105Adapter.validateNativeState(document.nativeStates[0])).toEqual({ valid: true, issues: [] });
  });

  it("applies Heroic budget and cap rules to Scholar through the same profile-aware skill pipeline", () => {
    const document = buildBrpFirstSliceCharacter(heroicExplicitInput());
    const native = document.nativeStates[0].payload as BrpNativeCharacter;
    const research = native.skills.find((skill) => skill.skillId === "research");

    expect(native.skillBudgets.professional).toEqual({ total: 325, spent: 325 });
    expect(native.skillBudgets.personal).toEqual({ total: 130, spent: 130 });
    expect(research).toMatchObject({ baseChance: 25, contributions: { professional: 55, personal: 0 }, finalRating: 80 });
    expect(brpUge105Adapter.validateNativeState(document.nativeStates[0])).toEqual({ valid: true, issues: [] });
  });

  it("detects Scholar specialty-choice tampering independently of the builder", () => {
    const document = buildBrpFirstSliceCharacter(normalExplicitInput());
    const state = structuredClone(document.nativeStates[0]);
    const native = state.payload as BrpNativeCharacter;
    if (native.identity.profession.professionId !== "scholar") {
      throw new Error("Expected Scholar profession state.");
    }
    native.identity.profession.selectedAcademicSkills[0].specialty.id = "history-tampered";

    const validation = brpUge105Adapter.validateNativeState(state);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain("brp.skills.profession");
  });

  it("round-trips Scholar specialty identities and generation provenance without reconstruction", () => {
    const document = buildBrpFirstSliceCharacter(normalExplicitInput());
    const parsed = parseCharacterDocument(JSON.parse(JSON.stringify(document)));
    const decision = parsed?.generation?.decisions.find((entry) => entry.stepId === "identity.profession-academic-skills");

    expect(parsed).toEqual(document);
    expect(parsed?.nativeStates[0].payload).toEqual(document.nativeStates[0].payload);
    expect(parsed?.generation).toMatchObject({
      recipeVersion: "brp-uge-first-slice/0.4",
      recipe: { professionId: "scholar" },
    });
    expect(decision?.answer).toEqual(ACADEMIC_SKILLS);
  });
});
