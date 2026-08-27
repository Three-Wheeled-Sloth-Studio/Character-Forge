import type { NativeSystemState, RulesSystemAdapter } from "../../character-model/src/index.js";
import { dnd5eSrd521Adapter as legacyAdapter } from "./adapterLegacy.js";
import { validateGuidedCoreNativeState } from "./guidedAdapterValidation.js";
import { DND5E_SRD_5_2_1_SOURCE } from "./rulesSource.js";

export const dnd5eSrd521Adapter: RulesSystemAdapter = {
  adapterId: "character-forge:dnd5e-2024",
  adapterVersion: "0.8.0",
  systemId: "dnd5e",
  editionId: "2024",
  supportedRulesSources: [DND5E_SRD_5_2_1_SOURCE],

  validateNativeState(state: NativeSystemState) {
    if (state.schemaVersion === "dnd5e-character/0.1" || state.schemaVersion === "dnd5e-character/0.2") {
      return legacyAdapter.validateNativeState(state);
    }
    return validateGuidedCoreNativeState(state);
  },
};
