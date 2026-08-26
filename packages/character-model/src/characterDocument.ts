export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

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
