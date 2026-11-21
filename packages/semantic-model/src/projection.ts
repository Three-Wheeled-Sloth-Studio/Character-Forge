import type { CharacterDocument, JsonObject, NativeSystemState } from "../../character-model/src/index.js";

// A read-only translation view. It is never a replacement for native payloads.
export type MappingKind = "exact" | "one-to-many" | "many-to-one" | "approximate" | "contextual" | "omitted";

export interface SemanticMapping {
  concept: "identity.display-name" | "characteristic.measurement";
  nativePath: string;
  nativeLabel: string;
  value: string | number;
  kind: MappingKind;
  note?: string;
}

export interface UniversalProjection {
  schemaVersion: "universal-grammar/0.1-provisional";
  sourceCharacterId: string;
  sourceNativeStateId: string;
  sourceSystemId: string;
  sourceEditionId: string;
  sourceRulesVersion: string;
  sourceSchemaVersion: string;
  mappings: SemanticMapping[];
  omissions: string[];
}

const DND_ABILITIES = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const;
const BRP_CHARACTERISTICS = ["STR", "CON", "SIZ", "INT", "POW", "DEX", "CHA"] as const;

function objectAt(value: unknown): JsonObject | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : null;
}

function nativeMeasurements(state: NativeSystemState): SemanticMapping[] {
  const payload = objectAt(state.payload);
  if (!payload) return [];
  const isDnd = state.systemId === "dnd5e" && state.schemaVersion.startsWith("dnd5e-character/");
  const isBrp = state.systemId === "brp" && state.schemaVersion === "brp-character/0.1";
  if (!isDnd && !isBrp) return [];
  const root = objectAt(isDnd ? payload.abilities : payload.characteristics);
  const values = objectAt(isDnd ? root?.final : root);
  if (!values) return [];
  const keys: readonly string[] = isDnd ? DND_ABILITIES : BRP_CHARACTERISTICS;
  return keys.flatMap((key): SemanticMapping[] => {
    const entry = isDnd ? values[key] : objectAt(values[key])?.final;
    if (typeof entry !== "number" || !Number.isFinite(entry)) return [];
    return [{
      concept: "characteristic.measurement",
      nativePath: isDnd ? `abilities.final.${key}` : `characteristics.${key}.final`,
      nativeLabel: key,
      value: entry,
      kind: "contextual",
      note: "Native numeric scale; not comparable or convertible across rules systems without a separate mapping.",
    }];
  });
}

export function projectUniversalCharacter(document: CharacterDocument): UniversalProjection {
  const native = document.nativeStates.find((state) => state.id === document.primaryNativeStateId);
  if (!native) throw new Error("Primary native state is missing.");
  const supported = (native.systemId === "dnd5e" && native.schemaVersion.startsWith("dnd5e-character/"))
    || (native.systemId === "brp" && native.schemaVersion === "brp-character/0.1");
  return {
    schemaVersion: "universal-grammar/0.1-provisional",
    sourceCharacterId: document.characterId,
    sourceNativeStateId: native.id,
    sourceSystemId: native.systemId,
    sourceEditionId: native.editionId,
    sourceRulesVersion: native.rulesVersion,
    sourceSchemaVersion: native.schemaVersion,
    mappings: [
      { concept: "identity.display-name", nativePath: "CharacterDocument.displayName", nativeLabel: "Display name", value: document.displayName, kind: "exact" },
      ...nativeMeasurements(native),
    ],
    omissions: supported
      ? ["Skills, origins, archetypes/classes/professions, resources, equipment, harm and progression remain native pending semantic evidence."]
      : [`No characteristic projection is defined for ${native.systemId}/${native.schemaVersion}; native state is preserved.`],
  };
}
