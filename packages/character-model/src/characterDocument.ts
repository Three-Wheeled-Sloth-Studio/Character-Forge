export type JsonPrimitive = string | number | boolean | null;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonValue = JsonPrimitive | JsonValue[] | JsonObject;

export type NativeStateOrigin =
  | "generated"
  | "imported"
  | "translated"
  | "manual";

export interface NativeStateProvenance {
  origin: NativeStateOrigin;
  sourceId?: string;
  notes?: string;
}

export interface NativeSystemState {
  id: string;
  systemId: string;
  editionId: string;
  rulesVersion: string;
  schemaVersion: string;
  payload: JsonValue;
  provenance: NativeStateProvenance;
}

export interface SemanticTrait {
  key: string;
  category: string;
  value?: JsonValue;
  qualifiers?: { [key: string]: JsonValue };
  sourceNativeStateIds: string[];
}

export interface SemanticProjection {
  schemaVersion: string;
  status: "provisional" | "validated";
  traits: SemanticTrait[];
}

export type GenerationMode =
  | "manual"
  | "mechanical"
  | "guided-narrative"
  | "hybrid"
  | "quick";

export interface GenerationDecision {
  stepId: string;
  choiceId?: string;
  answer?: JsonValue;
  rationale?: string;
}

export interface GenerationRecord {
  methodId: string;
  mode: GenerationMode;
  recipeVersion: string;
  seed?: string;
  rulesSourceIds: string[];
  recipe: JsonValue;
  decisions: GenerationDecision[];
}

export interface CharacterDocument {
  schemaVersion: "character-document/0.1";
  characterId: string;
  displayName: string;
  primaryNativeStateId: string;
  nativeStates: [NativeSystemState, ...NativeSystemState[]];
  semanticProjection?: SemanticProjection;
  generation?: GenerationRecord;
}

export interface CharacterDocumentInput {
  characterId: string;
  displayName: string;
  primaryNativeStateId: string;
  nativeStates: NativeSystemState[];
  semanticProjection?: SemanticProjection;
  generation?: GenerationRecord;
}

export function createCharacterDocument(
  input: CharacterDocumentInput,
): CharacterDocument {
  const [firstNativeState, ...remainingNativeStates] = input.nativeStates;

  if (!firstNativeState) {
    throw new Error("CharacterDocument requires at least one native system state.");
  }

  if (!input.nativeStates.some((state) => state.id === input.primaryNativeStateId)) {
    throw new Error("primaryNativeStateId must reference a retained native system state.");
  }

  const nativeStates: [NativeSystemState, ...NativeSystemState[]] = [
    firstNativeState,
    ...remainingNativeStates,
  ];

  return {
    schemaVersion: "character-document/0.1",
    characterId: input.characterId,
    displayName: input.displayName,
    primaryNativeStateId: input.primaryNativeStateId,
    nativeStates,
    ...(input.semanticProjection
      ? { semanticProjection: input.semanticProjection }
      : {}),
    ...(input.generation ? { generation: input.generation } : {}),
  };
}

export function parseCharacterDocument(input: unknown): CharacterDocument | null {
  if (!isJsonObject(input) || input.schemaVersion !== "character-document/0.1") {
    return null;
  }
  if (!isNonEmptyString(input.characterId)
    || !isNonEmptyString(input.displayName)
    || !isNonEmptyString(input.primaryNativeStateId)) {
    return null;
  }
  if (!Array.isArray(input.nativeStates)
    || input.nativeStates.length === 0
    || !input.nativeStates.every(isNativeSystemState)) {
    return null;
  }
  const nativeStates = input.nativeStates.filter(isNativeSystemState);
  if (!nativeStates.some((state) => state.id === input.primaryNativeStateId)) {
    return null;
  }
  return input as unknown as CharacterDocument;
}

function isNativeSystemState(value: unknown): value is NativeSystemState {
  if (!isJsonObject(value)) return false;
  if (!isNonEmptyString(value.id)
    || !isNonEmptyString(value.systemId)
    || !isNonEmptyString(value.editionId)
    || !isNonEmptyString(value.rulesVersion)
    || !isNonEmptyString(value.schemaVersion)) {
    return false;
  }
  if (!isJsonObject(value.provenance)) return false;
  const origin = value.provenance.origin;
  if (origin !== "generated" && origin !== "imported" && origin !== "translated" && origin !== "manual") {
    return false;
  }
  if (value.provenance.sourceId !== undefined && typeof value.provenance.sourceId !== "string") return false;
  if (value.provenance.notes !== undefined && typeof value.provenance.notes !== "string") return false;
  return true;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isJsonObject(value: unknown): value is JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every(isJsonValue);
}

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  return isJsonObject(value);
}
