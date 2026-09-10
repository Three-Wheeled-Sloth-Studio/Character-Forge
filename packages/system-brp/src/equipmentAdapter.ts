import type {
  JsonObject,
  NativeSystemState,
  RulesSystemAdapter,
  RulesValidationIssue,
  RulesValidationResult,
} from "../../character-model/src/index.js";
import {
  brpStartingEquipmentEligibilityForPayload,
  isBrpEquipmentId,
  type BrpEquipmentId,
} from "./equipment.js";
import type { BrpNativeCharacter } from "./nativeCharacter.js";
import { brpUge105Adapter as brpUge105PlayerCoreAdapter } from "./playerCoreAdapter.js";

export const brpUge105Adapter: RulesSystemAdapter = {
  ...brpUge105PlayerCoreAdapter,
  validateNativeState,
};

function validateNativeState(state: NativeSystemState): RulesValidationResult {
  const base = brpUge105PlayerCoreAdapter.validateNativeState(state);
  const issues: RulesValidationIssue[] = [...base.issues];
  if (!isObject(state.payload) || !Array.isArray(state.payload.equipment)) return result(issues);

  const payload = state.payload as BrpNativeCharacter;
  const seen = new Set<BrpEquipmentId>();
  for (let index = 0; index < payload.equipment.length; index += 1) {
    const value = payload.equipment[index];
    const path = `payload.equipment.${index}`;
    if (!isBrpEquipmentId(value)) {
      error(issues, "brp.equipment.item-id", "BRP starting equipment must use a supported source-audited item ID.", path);
      continue;
    }
    if (seen.has(value)) {
      error(issues, "brp.equipment.duplicate", `BRP starting equipment must not repeat ${value}.`, path);
      continue;
    }
    seen.add(value);

    const eligibility = brpStartingEquipmentEligibilityForPayload(payload, value);
    if (!eligibility.eligible) {
      error(
        issues,
        "brp.equipment.weapon-skill",
        eligibility.reason ?? "BRP starting weapon does not meet its source skill threshold.",
        path,
      );
    }
  }

  return result(issues);
}

function result(issues: RulesValidationIssue[]): RulesValidationResult {
  return { valid: !issues.some((issue) => issue.severity === "error"), issues };
}

function error(issues: RulesValidationIssue[], code: string, message: string, path: string): void {
  issues.push({ code, message, severity: "error", path });
}

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}