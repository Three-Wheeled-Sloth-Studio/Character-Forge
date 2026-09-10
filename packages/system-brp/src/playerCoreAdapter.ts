import type { JsonObject, NativeSystemState, RulesSystemAdapter } from "../../character-model/src/index.js";
import { brpPlayerCoreProfessionAdapter } from "./professionAdapter.js";
import { brpUge105Adapter as brpUge105PsychicAdapter } from "./psychicAdapter.js";

export const brpUge105Adapter: RulesSystemAdapter = {
  ...brpUge105PsychicAdapter,
  validateNativeState,
};

function validateNativeState(state: NativeSystemState) {
  if (!isObject(state.payload) || !isObject(state.payload.identity) || !isObject(state.payload.identity.profession)) {
    return brpUge105PsychicAdapter.validateNativeState(state);
  }
  const professionId = state.payload.identity.profession.professionId;
  const isPlayerCoreProfession = professionId === "athlete" || professionId === "beggar" || professionId === "custom";
  if (!isPlayerCoreProfession) return brpUge105PsychicAdapter.validateNativeState(state);

  const rulesProfile = isObject(state.payload.rulesProfile) ? state.payload.rulesProfile : null;
  const enabledPowerSystems = rulesProfile?.enabledPowerSystems;
  if (Array.isArray(enabledPowerSystems) && enabledPowerSystems.length === 0) {
    return brpPlayerCoreProfessionAdapter.validateNativeState(state);
  }
  return brpUge105PsychicAdapter.validateNativeState(state);
}

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
