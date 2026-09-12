import type {
  CharacterDocument,
  JsonObject,
  NativeSystemState,
} from "../../character-model/src/index.js";
import { dnd5eSrd521Adapter } from "../../system-dnd5e/src/adapter.js";
import {
  abilityModifier,
  type Dnd5eAbilityId,
  type Dnd5eNativeCharacter,
} from "../../system-dnd5e/src/nativeCharacter.js";
import { buildFoundryDnd5eIdentityItems } from "./dnd5eIdentityItems.js";
import {
  FOUNDRY_DND5E_ACTOR_ADAPTER_VERSION,
  FOUNDRY_DND5E_ACTOR_EXPORT_SCHEMA,
  FOUNDRY_DND5E_TARGET,
  type FoundryDnd5eActorExport,
  type FoundryMappingNote,
} from "./target.js";

const ABILITY_KEYS: Record<Dnd5eAbilityId, string> = {
  strength: "str",
  dexterity: "dex",
  constitution: "con",
  intelligence: "int",
  wisdom: "wis",
  charisma: "cha",
};

const SKILLS = {
  acrobatics: { key: "acr", ability: "dex" },
  "animal-handling": { key: "ani", ability: "wis" },
  arcana: { key: "arc", ability: "int" },
  athletics: { key: "ath", ability: "str" },
  deception: { key: "dec", ability: "cha" },
  history: { key: "his", ability: "int" },
  insight: { key: "ins", ability: "wis" },
  intimidation: { key: "itm", ability: "cha" },
  investigation: { key: "inv", ability: "int" },
  medicine: { key: "med", ability: "wis" },
  nature: { key: "nat", ability: "int" },
  perception: { key: "prc", ability: "wis" },
  performance: { key: "prf", ability: "cha" },
  persuasion: { key: "per", ability: "cha" },
  religion: { key: "rel", ability: "int" },
  "sleight-of-hand": { key: "slt", ability: "dex" },
  stealth: { key: "ste", ability: "dex" },
  survival: { key: "sur", ability: "wis" },
} as const;

type SkillId = keyof typeof SKILLS;

export function exportCharacterToFoundryDnd5eActor(
  character: CharacterDocument,
): FoundryDnd5eActorExport {
  const state = primaryNativeState(character);
  if (state.systemId !== "dnd5e" || state.editionId !== "2024") {
    throw new Error("Foundry D&D actor export requires a primary D&D 5E 2024 native state.");
  }

  const validation = dnd5eSrd521Adapter.validateNativeState(state);
  if (!validation.valid) {
    const issues = validation.issues
      .filter((issue) => issue.severity === "error")
      .map((issue) => issue.message)
      .join("; ");
    throw new Error(`Cannot export invalid D&D native state${issues ? `: ${issues}` : "."}`);
  }

  const payload = state.payload as Dnd5eNativeCharacter;
  const mappingNotes = buildMappingNotes(payload);
  return {
    schemaVersion: FOUNDRY_DND5E_ACTOR_EXPORT_SCHEMA,
    adapterVersion: FOUNDRY_DND5E_ACTOR_ADAPTER_VERSION,
    target: FOUNDRY_DND5E_TARGET,
    source: {
      characterId: character.characterId,
      nativeStateId: state.id,
      nativeSchemaVersion: state.schemaVersion,
      rulesVersion: state.rulesVersion,
    },
    document: buildActorDocument(character, state, payload),
    mappingNotes,
  };
}

export function serializeFoundryDnd5eActorDocument(
  exported: FoundryDnd5eActorExport,
): string {
  return `${JSON.stringify(exported.document, null, 2)}\n`;
}

function primaryNativeState(character: CharacterDocument): NativeSystemState {
  const state = character.nativeStates.find((candidate) => candidate.id === character.primaryNativeStateId);
  if (!state) throw new Error("CharacterDocument primary native state is missing.");
  return state;
}

function buildActorDocument(
  character: CharacterDocument,
  state: NativeSystemState,
  payload: Dnd5eNativeCharacter,
): JsonObject {
  const identityItems = buildFoundryDnd5eIdentityItems(character.characterId, payload);
  const classItemId = identityItems.classItem._id as string;
  const backgroundItemId = identityItems.backgroundItem._id as string;
  const raceItemId = identityItems.raceItem._id as string;

  return {
    name: character.displayName,
    type: "character",
    img: null,
    system: {
      abilities: buildAbilities(payload),
      attributes: buildAttributes(payload),
      details: {
        biography: { value: "", public: "" },
        alignment: humanizeId(payload.identity.alignment),
        race: raceItemId,
        background: backgroundItemId,
        originalClass: classItemId,
        xp: { value: payload.identity.experiencePoints },
        appearance: "",
        trait: "",
        ideal: "",
        bond: "",
        flaw: "",
        eyes: "",
        height: "",
        faith: "",
        hair: "",
        weight: "",
        gender: "",
        skin: "",
        age: "",
      },
      traits: {
        size: payload.origin.size === "small" ? "sm" : "med",
        languages: { value: [...payload.origin.languages], custom: "" },
        weaponProf: { value: [], custom: "", mastery: { value: [], bonus: [] } },
        armorProf: { value: [], custom: "" },
      },
      currency: { pp: 0, gp: payload.currencyGp, ep: 0, sp: 0, cp: 0 },
      skills: buildSkills(payload),
      tools: {},
      spells: buildSpellSlots(payload),
    },
    prototypeToken: {
      name: character.displayName,
      actorLink: true,
      disposition: 1,
      bar1: { attribute: "attributes.hp" },
      bar2: { attribute: "attributes.ac.value" },
      texture: { src: null },
    },
    items: [
      identityItems.classItem,
      identityItems.backgroundItem,
      identityItems.raceItem,
    ],
    effects: [],
    flags: {
      "character-forge": {
        characterId: character.characterId,
        nativeStateId: state.id,
        nativeSchemaVersion: state.schemaVersion,
        rulesVersion: state.rulesVersion,
        adapterVersion: FOUNDRY_DND5E_ACTOR_ADAPTER_VERSION,
      },
    },
  };
}

function buildAbilities(payload: Dnd5eNativeCharacter): JsonObject {
  const savingThrowProficiencies = new Set(payload.class.savingThrowProficiencies);
  const abilities: JsonObject = {};
  for (const [abilityId, key] of Object.entries(ABILITY_KEYS) as [Dnd5eAbilityId, string][]) {
    abilities[key] = {
      value: payload.abilities.final[abilityId],
      proficient: savingThrowProficiencies.has(abilityId) ? 1 : 0,
      max: null,
      bonuses: { check: "", save: "" },
    };
  }
  return abilities;
}

function buildAttributes(payload: Dnd5eNativeCharacter): JsonObject {
  const dexterityModifier = abilityModifier(payload.abilities.final.dexterity);
  const initiativeBonus = payload.derived.initiativeModifier - dexterityModifier;
  const spellcastingAbility = payload.spells?.classCasting?.[0]?.spellcastingAbilityId;
  return {
    ac: {
      flat: payload.derived.armorClass,
      calc: "flat",
      formula: "",
    },
    hp: {
      value: payload.resources.hitPointsCurrent,
      max: payload.resources.hitPointsMaximum,
      temp: null,
      tempmax: null,
      bonuses: { level: "", overall: "" },
    },
    init: {
      ability: "",
      bonus: String(initiativeBonus),
      roll: { min: null, max: null, mode: 0 },
    },
    movement: {
      burrow: null,
      climb: null,
      fly: null,
      swim: null,
      walk: payload.origin.speedFeet,
      units: "ft",
      hover: false,
    },
    attunement: { max: 3 },
    senses: {
      darkvision: payload.origin.speciesDarkvisionFeet ?? null,
      blindsight: null,
      tremorsense: null,
      truesight: null,
      units: "ft",
      special: "",
    },
    spellcasting: spellcastingAbility ? ABILITY_KEYS[spellcastingAbility] : "",
    death: {
      success: 0,
      failure: 0,
      ability: "",
      roll: { min: null, max: null, mode: 0 },
    },
    exhaustion: 0,
    inspiration: false,
    concentration: {
      ability: "",
      roll: { min: null, max: null, mode: 0 },
      bonuses: { save: "" },
      limit: 1,
    },
  };
}

function buildSkills(payload: Dnd5eNativeCharacter): JsonObject {
  const proficient = new Set([
    ...(payload.origin.backgroundSkillProficiencies ?? []),
    ...payload.class.skillProficiencies,
  ]);
  const expertise = new Set(payload.class.expertiseSkillIds ?? []);
  const skills: JsonObject = {};

  for (const [skillId, config] of Object.entries(SKILLS) as [SkillId, (typeof SKILLS)[SkillId]][]) {
    skills[config.key] = {
      value: expertise.has(skillId) ? 2 : proficient.has(skillId) ? 1 : 0,
      ability: config.ability,
      bonuses: { check: "", passive: "" },
      roll: { min: null, max: null, mode: 0 },
    };
  }
  return skills;
}

function buildSpellSlots(payload: Dnd5eNativeCharacter): JsonObject {
  const spells: JsonObject = {};
  for (let level = 0; level <= 9; level += 1) {
    spells[`spell${level}`] = { value: 0, override: null };
  }
  spells.pact = { value: 0, override: null };

  for (const casting of payload.spells?.classCasting ?? []) {
    for (const slot of casting.spellSlots) {
      const key = casting.castingMode === "pact-magic" ? "pact" : `spell${slot.level}`;
      const current = spells[key] as JsonObject;
      const priorValue = typeof current.value === "number" ? current.value : 0;
      const priorMaximum = typeof current.override === "number" ? current.override : 0;
      spells[key] = {
        value: priorValue + slot.current,
        override: priorMaximum + slot.maximum,
      };
    }
  }
  return spells;
}

function buildMappingNotes(payload: Dnd5eNativeCharacter): FoundryMappingNote[] {
  const notes: FoundryMappingNote[] = [
    {
      sourcePath: "identity/origin/abilities/class/resources/derived",
      targetPath: "Actor.system",
      disposition: "mapped",
      detail: "Core identity, ability, proficiency, hit-point, movement, skill, language, currency, and spell-slot state is mapped directly into the pinned D&D5e Actor data model.",
    },
    {
      sourcePath: "class.classId/origin.backgroundId/origin.speciesId",
      targetPath: "Actor.items + Actor.system.details",
      disposition: "mapped",
      detail: "Class, background, and species identities are represented by deterministic embedded Class, Background, and Race Items and referenced by the Actor detail fields.",
    },
    {
      sourcePath: "class/origin advancement causality",
      targetPath: "Actor.items[*].system.advancement",
      disposition: "deferred",
      detail: "Identity Items intentionally contain no Foundry advancement automation. Character Forge native state already contains the authoritative resolved character; later mapping must not replay advancements and double-apply choices.",
    },
    {
      sourcePath: "derived.armorClass",
      targetPath: "Actor.system.attributes.ac",
      disposition: "derived",
      detail: "Armor Class is exported as a flat value until equipment Items are mapped, preserving Character Forge's current authoritative derived value without pretending Foundry can recalculate it from missing Items.",
    },
    {
      sourcePath: "derived.initiativeModifier",
      targetPath: "Actor.system.attributes.init.bonus",
      disposition: "derived",
      detail: "Only the bonus beyond the Dexterity modifier is exported so Foundry does not double-count Dexterity.",
    },
    {
      sourcePath: "equipment/featureIds/spells",
      targetPath: "Actor.items",
      disposition: "deferred",
      detail: "Equipment, feature, and spell embedded Items remain intentionally deferred; adapter 0.2.0 adds identity-bearing Class, Background, and Race Items only.",
    },
    {
      sourcePath: "resources",
      targetPath: null,
      disposition: "deferred",
      detail: "Non-HP feature resources remain system-owned native state until their owning Foundry Items and activities are mapped.",
    },
    {
      sourcePath: "Parchment portrait/token relationships",
      targetPath: "Actor.img / Actor.prototypeToken.texture.src",
      disposition: "deferred",
      detail: "Media remains Parchment-owned and is not converted to a Foundry path until the export packaging layer can provide a durable packaged path.",
    },
  ];

  if (payload.class.weaponProficiencyIds?.length || payload.class.armorTrainingIds?.length) {
    notes.push({
      sourcePath: "class.weaponProficiencyIds/class.armorTrainingIds",
      targetPath: "Actor.system.traits.weaponProf / armorProf",
      disposition: "deferred",
      detail: "Character Forge proficiency identifiers are not assumed to be Foundry trait keys; explicit identifier mapping will accompany equipment and feature Item support.",
    });
  }
  return notes;
}

function humanizeId(value: string): string {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
