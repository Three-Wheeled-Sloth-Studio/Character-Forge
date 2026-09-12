import type { JsonObject } from "../../character-model/src/index.js";

export const FOUNDRY_DND5E_ACTOR_EXPORT_SCHEMA = "character-forge/foundry-dnd5e-actor-export/0.1" as const;
export const FOUNDRY_DND5E_ACTOR_ADAPTER_VERSION = "0.3.0" as const;
export const FOUNDRY_CORE_TARGET_VERSION = "14.367" as const;
export const FOUNDRY_DND5E_TARGET_VERSION = "6.0.0" as const;

export const FOUNDRY_DND5E_TARGET = {
  coreVersion: FOUNDRY_CORE_TARGET_VERSION,
  systemId: "dnd5e",
  systemVersion: FOUNDRY_DND5E_TARGET_VERSION,
} as const;

export type FoundryMappingDisposition = "mapped" | "derived" | "deferred";

export interface FoundryMappingNote {
  sourcePath: string;
  targetPath: string | null;
  disposition: FoundryMappingDisposition;
  detail: string;
}

export interface FoundryDnd5eActorExport {
  schemaVersion: typeof FOUNDRY_DND5E_ACTOR_EXPORT_SCHEMA;
  adapterVersion: typeof FOUNDRY_DND5E_ACTOR_ADAPTER_VERSION;
  target: typeof FOUNDRY_DND5E_TARGET;
  source: {
    characterId: string;
    nativeStateId: string;
    nativeSchemaVersion: string;
    rulesVersion: string;
  };
  document: JsonObject;
  mappingNotes: FoundryMappingNote[];
}
