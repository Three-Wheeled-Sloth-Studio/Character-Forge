import type { JsonObject } from "../../character-model/src/index.js";

export type FateAspectRole = "high-concept" | "trouble" | "relationship" | "free";
export type FateConsequenceSeverity = "mild" | "moderate" | "severe";

export interface FateAspect extends JsonObject {
  role: FateAspectRole;
  text: string;
}

export interface FateStunt extends JsonObject {
  id: string;
  text: string;
}

export interface FateSkillRating extends JsonObject {
  skillId: string;
  rating: number;
}

export interface FateStressTrack extends JsonObject {
  boxes: boolean[];
}

export interface FateConsequence extends JsonObject {
  severity: FateConsequenceSeverity;
  text: string | null;
}

export interface FateNativeCharacter extends JsonObject {
  schemaVersion: "fate-condensed-character/0.1";
  rulesSourceIds: string[];
  aspects: FateAspect[];
  skills: FateSkillRating[];
  stunts: FateStunt[];
  stuntSlots: number;
  refresh: number;
  fatePoints: number;
  stress: { physical: FateStressTrack; mental: FateStressTrack } & JsonObject;
  consequences: FateConsequence[];
}
