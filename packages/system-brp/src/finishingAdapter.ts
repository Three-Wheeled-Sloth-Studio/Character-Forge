import type {
  JsonObject,
  NativeSystemState,
  RulesSystemAdapter,
  RulesValidationIssue,
  RulesValidationResult,
} from "../../character-model/src/index.js";
import { isBrpFinishingDetails } from "./finishing.js";
import { brpUge105Adapter as brpUge105EquipmentAdapter } from "./equipmentAdapter.js";

export const brpUge105Adapter: RulesSystemAdapter = {
  ...brpUge105EquipmentAdapter,
  validateNativeState,
};

function validateNativeState(state: NativeSystemState): RulesValidationResult {
  const base = brpUge105EquipmentAdapter.validateNativeState(state);
  const issues: RulesValidationIssue[] = [...base.issues];
  if (!isObject(state.payload) || !isObject(state.payload.identity)) return result(issues);

  const finishing = state.payload.identity.finishing;
  if (finishing !== undefined && !isBrpFinishingDetails(finishing)) {
    error(
      issues,
      "brp.identity.finishing",
      "BRP finishing details must retain the supported descriptive string fields.",
      "payload.identity.finishing",
    );
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
