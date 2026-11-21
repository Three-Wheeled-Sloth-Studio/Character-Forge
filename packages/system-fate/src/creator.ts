import { createCharacterDocument, type CharacterDocument, type NativeSystemState } from "../../character-model/src/index.js";
import type { FateAspect, FateNativeCharacter, FateSkillRating, FateStunt } from "./nativeCharacter.js";
import { fateCondensedProbeAdapter } from "./adapter.js";
import { FATE_CONDENSED_PROBE_SOURCE } from "./rulesSource.js";

export interface FateProbeCreationInput {
  characterId: string;
  nativeStateId: string;
  displayName: string;
  highConcept: string;
  trouble: string;
  relationship: string;
  freeAspects: [string, string];
  skills: FateSkillRating[];
  stunts: FateStunt[];
}

function stressSize(rating: number): number {
  return rating >= 5 ? 6 : rating >= 3 ? 6 : rating >= 1 ? 4 : 3;
}

export function createFateProbeCharacter(input: FateProbeCreationInput): CharacterDocument {
  const aspects: FateAspect[] = [
    { role: "high-concept", text: input.highConcept },
    { role: "trouble", text: input.trouble },
    { role: "relationship", text: input.relationship },
    ...input.freeAspects.map((text): FateAspect => ({ role: "free", text })),
  ];
  const ratings = new Map(input.skills.map(({ skillId, rating }) => [skillId, rating]));
  const payload: FateNativeCharacter = {
    schemaVersion: "fate-condensed-character/0.1",
    rulesSourceIds: [FATE_CONDENSED_PROBE_SOURCE.id],
    aspects,
    skills: input.skills.map((entry) => ({ ...entry })),
    stunts: input.stunts.map((entry) => ({ ...entry })),
    stuntSlots: 3,
    refresh: 3,
    fatePoints: 3,
    stress: {
      physical: { boxes: Array(stressSize(ratings.get("physique") ?? 0)).fill(false) as boolean[] },
      mental: { boxes: Array(stressSize(ratings.get("will") ?? 0)).fill(false) as boolean[] },
    },
    consequences: ["mild", "moderate", "severe"].map((severity) => ({ severity: severity as "mild" | "moderate" | "severe", text: null })),
  };
  const native: NativeSystemState = {
    id: input.nativeStateId, systemId: "fate", editionId: "condensed",
    rulesVersion: FATE_CONDENSED_PROBE_SOURCE.version,
    schemaVersion: payload.schemaVersion, payload, provenance: { origin: "manual", sourceId: FATE_CONDENSED_PROBE_SOURCE.id },
  };
  const result = fateCondensedProbeAdapter.validateNativeState(native);
  if (!result.valid) throw new Error(result.issues.map((issue) => issue.message).join("; "));
  return createCharacterDocument({
    characterId: input.characterId, displayName: input.displayName,
    primaryNativeStateId: native.id, nativeStates: [native],
    generation: {
      methodId: "fate-condensed-freeform-probe", mode: "manual", recipeVersion: "0.1",
      rulesSourceIds: [FATE_CONDENSED_PROBE_SOURCE.id],
      recipe: { source: "freeform-player-choices" },
      decisions: [
        ...aspects.map((aspect, index) => ({ stepId: `aspect-${index}`, answer: aspect.text })),
        ...input.stunts.map((stunt, index) => ({ stepId: `stunt-${index}`, answer: stunt.text })),
      ],
    },
  });
}
