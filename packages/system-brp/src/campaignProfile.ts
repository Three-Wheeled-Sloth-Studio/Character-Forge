import type {
  CharacterDocument,
  JsonObject,
  JsonValue,
} from "../../character-model/src/index.js";
import type {
  BrpNativeCharacter,
  BrpRulesProfile,
} from "./nativeCharacter.js";

export const BRP_DEFAULT_CAMPAIGN_PROFILE_ID = "generic" as const;
export type BrpCampaignProfileId = typeof BRP_DEFAULT_CAMPAIGN_PROFILE_ID;

export interface BrpCampaignProfileReference extends JsonObject {
  id: string;
  version: string;
}

export interface BrpCampaignProfileDefinition {
  id: BrpCampaignProfileId;
  version: string;
  label: string;
  description: string;
  rulesDefaults: BrpRulesProfile;
}

export interface BrpCampaignProfileSelection {
  reference: BrpCampaignProfileReference;
  rulesProfile: BrpRulesProfile;
}

export const BRP_CAMPAIGN_PROFILE_CATALOG: readonly BrpCampaignProfileDefinition[] = [
  {
    id: BRP_DEFAULT_CAMPAIGN_PROFILE_ID,
    version: "0.1",
    label: "Generic BRP Core",
    description: "Source-neutral BRP UGE core defaults. Optional rules and power systems remain off unless the effective native rules state says otherwise.",
    rulesDefaults: {
      powerLevel: "normal",
      characteristicGeneration: "explicit",
      enabledOptions: [],
      enabledPowerSystems: [],
    },
  },
];

export function isBrpCampaignProfileId(value: string): value is BrpCampaignProfileId {
  return BRP_CAMPAIGN_PROFILE_CATALOG.some((profile) => profile.id === value);
}

export function resolveBrpCampaignProfileDefinition(id: BrpCampaignProfileId): BrpCampaignProfileDefinition {
  const profile = BRP_CAMPAIGN_PROFILE_CATALOG.find((candidate) => candidate.id === id);
  if (!profile) throw new Error(`Unknown BRP campaign profile ${id}.`);
  return profile;
}

export function resolveBrpCampaignProfileSelection(id: BrpCampaignProfileId): BrpCampaignProfileSelection {
  const profile = resolveBrpCampaignProfileDefinition(id);
  return {
    reference: { id: profile.id, version: profile.version },
    rulesProfile: cloneRulesProfile(profile.rulesDefaults),
  };
}

export function resolveBrpCampaignProfileRules(
  id: BrpCampaignProfileId,
  overrides: Partial<Pick<BrpRulesProfile, "powerLevel" | "characteristicGeneration">> = {},
): BrpRulesProfile {
  const profile = resolveBrpCampaignProfileDefinition(id);
  return {
    powerLevel: overrides.powerLevel ?? profile.rulesDefaults.powerLevel,
    characteristicGeneration: overrides.characteristicGeneration ?? profile.rulesDefaults.characteristicGeneration,
    enabledOptions: [...profile.rulesDefaults.enabledOptions],
    enabledPowerSystems: [...profile.rulesDefaults.enabledPowerSystems],
  };
}

export function readBrpCampaignProfileReference(character: CharacterDocument): BrpCampaignProfileReference | null {
  const generation = character.generation;
  if (!generation) return null;

  if (isObject(generation.recipe)) {
    const recipeReference = parseProfileReference(generation.recipe.campaignProfile);
    if (recipeReference) return recipeReference;
  }

  const decision = generation.decisions.find((entry) => entry.stepId === "rules.campaign-profile");
  if (!decision?.choiceId || !isObject(decision.answer) || typeof decision.answer.version !== "string") return null;
  const version = decision.answer.version.trim();
  if (!version) return null;
  return { id: decision.choiceId, version };
}

export function applyBrpCampaignProfileContext(
  character: CharacterDocument,
  effectiveRulesProfile: BrpRulesProfile,
  campaignProfile: BrpCampaignProfileReference | null,
): CharacterDocument {
  const primaryIndex = character.nativeStates.findIndex((state) => state.id === character.primaryNativeStateId);
  if (primaryIndex < 0) throw new Error("BRP campaign profile context requires a retained primary native state.");

  const primaryState = character.nativeStates[primaryIndex]!;
  if (primaryState.systemId !== "brp" || primaryState.editionId !== "uge-2023" || !isObject(primaryState.payload)) {
    throw new Error("BRP campaign profile context requires a BRP UGE primary native state.");
  }

  const payload = primaryState.payload as unknown as BrpNativeCharacter;
  const existing = payload.rulesProfile;
  if (existing.powerLevel !== effectiveRulesProfile.powerLevel
    || existing.characteristicGeneration !== effectiveRulesProfile.characteristicGeneration) {
    throw new Error("BRP campaign profile context cannot reinterpret mechanically significant effective rules after character construction.");
  }

  const nextPayload: BrpNativeCharacter = {
    ...payload,
    rulesProfile: cloneRulesProfile(effectiveRulesProfile),
  };
  const nextPrimary = {
    ...primaryState,
    payload: nextPayload,
  };
  const mappedStates = character.nativeStates.map((state, index) => index === primaryIndex ? nextPrimary : state);
  const [firstState, ...remainingStates] = mappedStates;
  if (!firstState) throw new Error("BRP campaign profile context requires retained native state.");
  const nextNativeStates: CharacterDocument["nativeStates"] = [firstState, ...remainingStates];

  if (!character.generation) {
    return {
      ...character,
      nativeStates: nextNativeStates,
    };
  }

  const recipe: JsonObject = isObject(character.generation.recipe)
    ? { ...character.generation.recipe }
    : {};
  delete recipe.campaignProfile;
  recipe.powerLevel = effectiveRulesProfile.powerLevel;
  recipe.characteristicGeneration = effectiveRulesProfile.characteristicGeneration;
  recipe.enabledOptions = [...effectiveRulesProfile.enabledOptions];
  recipe.enabledPowerSystems = [...effectiveRulesProfile.enabledPowerSystems];
  if (campaignProfile) recipe.campaignProfile = cloneProfileReference(campaignProfile);

  const decisions = character.generation.decisions.filter((entry) => entry.stepId !== "rules.campaign-profile");
  if (campaignProfile) {
    decisions.unshift({
      stepId: "rules.campaign-profile",
      choiceId: campaignProfile.id,
      answer: { version: campaignProfile.version },
    });
  }

  return {
    ...character,
    nativeStates: nextNativeStates,
    generation: {
      ...character.generation,
      recipe,
      decisions,
    },
  };
}

export function cloneBrpRulesProfile(profile: BrpRulesProfile): BrpRulesProfile {
  return cloneRulesProfile(profile);
}

function cloneRulesProfile(profile: BrpRulesProfile): BrpRulesProfile {
  return {
    powerLevel: profile.powerLevel,
    characteristicGeneration: profile.characteristicGeneration,
    enabledOptions: [...profile.enabledOptions],
    enabledPowerSystems: [...profile.enabledPowerSystems],
  };
}

function cloneProfileReference(reference: BrpCampaignProfileReference): BrpCampaignProfileReference {
  return { id: reference.id, version: reference.version };
}

function parseProfileReference(value: JsonValue | undefined): BrpCampaignProfileReference | null {
  if (!isObject(value) || typeof value.id !== "string" || typeof value.version !== "string") return null;
  const id = value.id.trim();
  const version = value.version.trim();
  return id && version ? { id, version } : null;
}

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
