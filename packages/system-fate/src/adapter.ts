import type { JsonObject, NativeSystemState, RulesSystemAdapter, RulesValidationIssue, RulesValidationResult } from "../../character-model/src/index.js";
import { FATE_CONDENSED_PROBE_SOURCE } from "./rulesSource.js";

function object(value: unknown): JsonObject | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : null;
}

function validText(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }

function validateNativeState(state: NativeSystemState): RulesValidationResult {
  const issues: RulesValidationIssue[] = [];
  const reject = (code: string, message: string, path: string) => issues.push({ code, message, path, severity: "error" as const });
  if (state.systemId !== "fate" || state.editionId !== "condensed" || state.rulesVersion !== FATE_CONDENSED_PROBE_SOURCE.version || state.schemaVersion !== "fate-condensed-character/0.1") {
    reject("fate.envelope", "Unsupported Fate Condensed native-state source or schema.", "state");
  }
  const p = object(state.payload);
  if (!p) return { valid: false, issues: [{ code: "fate.payload", message: "Native payload must be an object.", path: "payload", severity: "error" }] };
  if (p.schemaVersion !== state.schemaVersion || !Array.isArray(p.rulesSourceIds) || p.rulesSourceIds.length !== 1 || p.rulesSourceIds[0] !== FATE_CONDENSED_PROBE_SOURCE.id) {
    reject("fate.source", "Payload schema and rules source must match the pinned probe.", "payload.rulesSourceIds");
  }
  const roles = ["high-concept", "trouble", "relationship", "free", "free"];
  if (!Array.isArray(p.aspects) || p.aspects.length !== 5 || p.aspects.some((v, i) => object(v)?.role !== roles[i] || !validText(object(v)?.text))) {
    reject("fate.aspects", "Five nonempty Aspects in the probe's required role order are needed.", "payload.aspects");
  }
  const skills = Array.isArray(p.skills) ? p.skills.map(object) : [];
  const ratings = skills.map((s) => s?.rating);
  const names = skills.map((s) => s?.skillId);
  const count = (n: number) => ratings.filter((r) => r === n).length;
  if (skills.length !== 10 || names.some((n) => !validText(n) || n !== n.toLowerCase()) || new Set(names).size !== 10 || !skills.every((s) => typeof s?.rating === "number" && Number.isInteger(s.rating)) || count(4) !== 1 || count(3) !== 2 || count(2) !== 3 || count(1) !== 4) {
    reject("fate.skills", "The probe requires ten distinct skill IDs in the 1/2/3/4 Fate pyramid.", "payload.skills");
  }
  const stunts = Array.isArray(p.stunts) ? p.stunts.map(object) : [];
  if (stunts.length < 1 || stunts.length > 3 || stunts.some((s) => !validText(s?.id) || !validText(s?.text)) || new Set(stunts.map((s) => s?.id)).size !== stunts.length || p.stuntSlots !== 3) {
    reject("fate.stunts", "The probe needs one to three distinct freeform stunts within three starter slots.", "payload.stunts");
  }
  if (p.refresh !== 3 || typeof p.fatePoints !== "number" || !Number.isInteger(p.fatePoints) || p.fatePoints < 0) {
    reject("fate.points", "Refresh must be 3 and fate points a nonnegative integer.", "payload.fatePoints");
  }
  const skillMap = new Map(skills.map((s) => [s?.skillId, s?.rating]));
  const expectedBoxes = (rating: unknown) => typeof rating === "number" && rating >= 3 ? 6 : typeof rating === "number" && rating >= 1 ? 4 : 3;
  const stress = object(p.stress);
  for (const [track, skill] of [["physical", "physique"], ["mental", "will"]] as const) {
    const boxes = object(stress?.[track])?.boxes;
    if (!Array.isArray(boxes) || boxes.length !== expectedBoxes(skillMap.get(skill)) || boxes.some((b) => typeof b !== "boolean")) {
      reject("fate.stress", `Invalid ${track} one-point stress boxes.`, `payload.stress.${track}`);
    }
  }
  const consequences = Array.isArray(p.consequences) ? p.consequences.map(object) : [];
  if (consequences.length !== 3 || ["mild", "moderate", "severe"].some((role, i) => consequences[i]?.severity !== role || !(consequences[i]?.text === null || validText(consequences[i]?.text)))) {
    reject("fate.consequences", "Mild, moderate and severe consequence slots must retain text or null.", "payload.consequences");
  }
  return { valid: issues.length === 0, issues };
}

export const fateCondensedProbeAdapter: RulesSystemAdapter = {
  adapterId: "fate-condensed-probe", adapterVersion: "0.1.0",
  systemId: "fate", editionId: "condensed",
  supportedRulesSources: [FATE_CONDENSED_PROBE_SOURCE], validateNativeState,
};
