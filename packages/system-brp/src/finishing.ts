import type { CharacterDocument, JsonObject } from "../../character-model/src/index.js";
import type { BrpNativeCharacter } from "./nativeCharacter.js";

export const BRP_FINISHING_FIELD_KEYS = [
  "sizeDescription",
  "appearance",
  "mannerisms",
  "reputation",
  "personalItem",
  "background",
  "beliefs",
] as const;

export type BrpFinishingFieldKey = typeof BRP_FINISHING_FIELD_KEYS[number];

export interface BrpFinishingDetails extends JsonObject {
  sizeDescription: string;
  appearance: string;
  mannerisms: string;
  reputation: string;
  personalItem: string;
  background: string;
  beliefs: string;
}

export function createEmptyBrpFinishingDetails(): BrpFinishingDetails {
  return {
    sizeDescription: "",
    appearance: "",
    mannerisms: "",
    reputation: "",
    personalItem: "",
    background: "",
    beliefs: "",
  };
}

export function normalizeBrpFinishingDetails(details: BrpFinishingDetails): BrpFinishingDetails {
  return Object.fromEntries(
    BRP_FINISHING_FIELD_KEYS.map((key) => [key, details[key].trim()]),
  ) as unknown as BrpFinishingDetails;
}

export function hasBrpFinishingDetails(details: BrpFinishingDetails): boolean {
  return BRP_FINISHING_FIELD_KEYS.some((key) => details[key].trim().length > 0);
}

export function isBrpFinishingDetails(value: unknown): value is BrpFinishingDetails {
  if (!isObject(value)) return false;
  return BRP_FINISHING_FIELD_KEYS.every((key) => typeof value[key] === "string");
}

export function applyBrpFinishingDetails(
  character: CharacterDocument,
  details: BrpFinishingDetails,
): CharacterDocument {
  const normalized = normalizeBrpFinishingDetails(details);
  const result = structuredClone(character);
  const payload = readPrimaryBrpPayload(result);
  const identity = payload.identity as JsonObject;
  if (hasBrpFinishingDetails(normalized)) identity.finishing = normalized;
  else delete identity.finishing;
  return result;
}

export function readBrpFinishingDetails(character: CharacterDocument): BrpFinishingDetails {
  return readBrpFinishingDetailsForPayload(readPrimaryBrpPayload(character));
}

export function readBrpFinishingDetailsForPayload(payload: BrpNativeCharacter): BrpFinishingDetails {
  const value = (payload.identity as JsonObject).finishing;
  if (value === undefined) return createEmptyBrpFinishingDetails();
  if (!isBrpFinishingDetails(value)) {
    throw new Error("BRP finishing details must retain the supported descriptive string fields.");
  }
  return normalizeBrpFinishingDetails(value);
}

export function brpFinishingReviewRows(
  payload: BrpNativeCharacter,
): Array<{ label: string; value: string }> {
  const details = readBrpFinishingDetailsForPayload(payload);
  return [
    { label: "Size / build", value: details.sizeDescription },
    { label: "Appearance", value: details.appearance },
    { label: "Mannerisms / motto", value: details.mannerisms },
    { label: "Reputation", value: details.reputation },
    { label: "Personal item", value: details.personalItem },
    { label: "Background", value: details.background },
    { label: "Beliefs", value: details.beliefs },
  ].filter((row) => row.value.length > 0);
}

function readPrimaryBrpPayload(character: CharacterDocument): BrpNativeCharacter {
  const nativeState = character.nativeStates.find((entry) => entry.id === character.primaryNativeStateId);
  if (!nativeState || nativeState.systemId !== "brp" || nativeState.editionId !== "uge-2023") {
    throw new Error("Character document does not contain a BRP UGE primary native state.");
  }
  return nativeState.payload as BrpNativeCharacter;
}

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
