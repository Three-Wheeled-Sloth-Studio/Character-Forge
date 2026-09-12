import type { JsonObject } from "../../character-model/src/index.js";
import type { Dnd5eNativeCharacter } from "../../system-dnd5e/src/nativeCharacter.js";

export interface FoundryDnd5eIdentityItems {
  classItem: JsonObject;
  backgroundItem: JsonObject;
  raceItem: JsonObject;
}

export function buildFoundryDnd5eIdentityItems(
  characterId: string,
  payload: Dnd5eNativeCharacter,
): FoundryDnd5eIdentityItems {
  const classId = stableFoundryDocumentId(`${characterId}:class:${payload.class.classId}`);
  const backgroundId = stableFoundryDocumentId(`${characterId}:background:${payload.origin.backgroundId}`);
  const raceId = stableFoundryDocumentId(`${characterId}:race:${payload.origin.speciesId}`);

  return {
    classItem: {
      _id: classId,
      name: humanizeId(payload.class.classId),
      type: "class",
      img: null,
      system: {
        description: emptyDescription(),
        identifier: payload.class.classId,
        advancement: {},
        startingEquipment: [],
        wealth: "",
        hd: {
          additional: "",
          denomination: `d${payload.class.hitDie}`,
          spent: payload.resources.hitDiceSpent,
        },
        levels: payload.class.level,
      },
      effects: [],
      flags: identityFlags("class", payload.class.classId),
    },
    backgroundItem: {
      _id: backgroundId,
      name: humanizeId(payload.origin.backgroundId),
      type: "background",
      img: null,
      system: {
        description: emptyDescription(),
        identifier: payload.origin.backgroundId,
        advancement: {},
        startingEquipment: [],
        wealth: "",
      },
      effects: [],
      flags: identityFlags("background", payload.origin.backgroundId),
    },
    raceItem: {
      _id: raceId,
      name: humanizeId(payload.origin.speciesId),
      type: "race",
      img: null,
      system: {
        description: emptyDescription(),
        identifier: payload.origin.speciesId,
        advancement: {},
      },
      effects: [],
      flags: identityFlags("species", payload.origin.speciesId),
    },
  };
}

export function stableFoundryDocumentId(value: string): string {
  const first = hash32(value, 0x811c9dc5);
  const second = hash32(value, 0x9e3779b9);
  return `${first.toString(16).padStart(8, "0")}${second.toString(16).padStart(8, "0")}`;
}

function hash32(value: string, seed: number): number {
  let hash = seed >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

function emptyDescription(): JsonObject {
  return { value: "", chat: "" };
}

function identityFlags(role: string, sourceId: string): JsonObject {
  return {
    "character-forge": {
      role,
      sourceId,
      identityOnly: true,
    },
  };
}

function humanizeId(value: string): string {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
