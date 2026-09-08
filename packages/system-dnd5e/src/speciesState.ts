import type { GuidedDnd5eCoreChoices } from "./guidedChoices.js";
import type { Dnd5eResourcesState, Dnd5eSpeciesSpellGrantState, Dnd5eSpellcastingAbilityId } from "./nativeCharacter.js";
import {
  DND5E_ELF_KEEN_SENSES_SKILL_OPTIONS,
  DND5E_ELF_LINEAGE_OPTIONS,
  DND5E_GNOME_LINEAGE_OPTIONS,
  DND5E_TIEFLING_LEGACY_OPTIONS,
  elfLineage,
  gnomeLineage,
  tieflingLegacy,
} from "./speciesCatalog.js";
import type { GuidedDnd5eSpeciesId } from "./srdCatalog.js";

export interface GuidedDnd5eLineageSpeciesState {
  size?: "small" | "medium";
  speedFeet?: number;
  speciesSkillId?: string;
  speciesAncestryId?: string;
  speciesResistanceDamageType?: string;
  speciesDarkvisionFeet?: number;
  featureIds: string[];
  resources: Partial<Dnd5eResourcesState>;
  spellGrant?: Dnd5eSpeciesSpellGrantState;
}

export function assertGuidedDnd5eLineageSpeciesChoices(speciesId: GuidedDnd5eSpeciesId, choices: GuidedDnd5eCoreChoices): void {
  if (speciesId === "elf") {
    if (!choices.elf) throw new Error("Elf requires Elven Lineage, Keen Senses, and spellcasting-ability choices.");
    if (!DND5E_ELF_LINEAGE_OPTIONS.some((option) => option.id === choices.elf!.lineageId)) throw new Error("Choose a supported Elven Lineage.");
    if (!DND5E_ELF_KEEN_SENSES_SKILL_OPTIONS.some((option) => option.id === choices.elf!.keenSensesSkillId)) throw new Error("Elf Keen Senses must grant Insight, Perception, or Survival.");
    assertSpellcastingAbility(choices.elf.spellcastingAbilityId, "Elven Lineage");
  } else if (choices.elf) throw new Error("Elf-only choices were supplied to a non-Elf character.");

  if (speciesId === "gnome") {
    if (!choices.gnome) throw new Error("Gnome requires Gnomish Lineage and spellcasting-ability choices.");
    if (!DND5E_GNOME_LINEAGE_OPTIONS.some((option) => option.id === choices.gnome!.lineageId)) throw new Error("Choose a supported Gnomish Lineage.");
    assertSpellcastingAbility(choices.gnome.spellcastingAbilityId, "Gnomish Lineage");
  } else if (choices.gnome) throw new Error("Gnome-only choices were supplied to a non-Gnome character.");

  if (speciesId === "tiefling") {
    if (!choices.tiefling) throw new Error("Tiefling requires size, Fiendish Legacy, and spellcasting-ability choices.");
    if (choices.tiefling.size !== "small" && choices.tiefling.size !== "medium") throw new Error("Tiefling size must be Small or Medium.");
    if (!DND5E_TIEFLING_LEGACY_OPTIONS.some((option) => option.id === choices.tiefling!.legacyId)) throw new Error("Choose a supported Fiendish Legacy.");
    assertSpellcastingAbility(choices.tiefling.spellcastingAbilityId, "Fiendish Legacy");
  } else if (choices.tiefling) throw new Error("Tiefling-only choices were supplied to a non-Tiefling character.");
}

export function createGuidedDnd5eLineageSpeciesState(
  speciesId: GuidedDnd5eSpeciesId,
  choices: GuidedDnd5eCoreChoices,
  proficiencyBonus: number,
): GuidedDnd5eLineageSpeciesState {
  assertGuidedDnd5eLineageSpeciesChoices(speciesId, choices);

  if (speciesId === "elf") {
    const selection = choices.elf!;
    const lineage = elfLineage(selection.lineageId);
    return {
      size: "medium",
      speedFeet: lineage.speedFeet,
      speciesSkillId: selection.keenSensesSkillId,
      speciesAncestryId: selection.lineageId,
      speciesDarkvisionFeet: lineage.darkvisionFeet,
      featureIds: [
        "elf:darkvision",
        "elf:elven-lineage",
        `elf:elven-lineage:${selection.lineageId}`,
        "elf:fey-ancestry",
        "elf:keen-senses",
        "elf:trance",
      ],
      resources: {},
      spellGrant: {
        sourceSpeciesId: "elf",
        featureId: "elf:elven-lineage",
        lineageId: selection.lineageId,
        spellcastingAbilityId: selection.spellcastingAbilityId,
        cantripIds: [lineage.initialCantripId],
        preparedSpellIds: [],
        alwaysPreparedSpellIds: [],
        freeCasts: [],
        futureSpellGrants: lineage.levelGatedSpells.map((grant) => ({
          characterLevel: grant.characterLevel,
          spellId: grant.spellId,
          alwaysPrepared: true,
          freeCastMaximum: 1,
          freeCastRecharge: "long-rest" as const,
        })),
        ...(lineage.cantripReplacementListId ? {
          cantripReplacementListId: lineage.cantripReplacementListId,
          cantripReplacementRecharge: "long-rest" as const,
        } : {}),
      },
    };
  }

  if (speciesId === "gnome") {
    const selection = choices.gnome!;
    const lineage = gnomeLineage(selection.lineageId);
    const forest = selection.lineageId === "forest";
    return {
      size: "small",
      speedFeet: 30,
      speciesAncestryId: selection.lineageId,
      speciesDarkvisionFeet: 60,
      featureIds: [
        "gnome:darkvision",
        "gnome:gnomish-cunning",
        "gnome:gnomish-lineage",
        `gnome:gnomish-lineage:${selection.lineageId}`,
      ],
      resources: forest ? {} : { rockGnomeClockworkDevicesMaximum: lineage.clockworkDeviceCapacity ?? 3, rockGnomeClockworkDevicesCurrent: 0 },
      spellGrant: {
        sourceSpeciesId: "gnome",
        featureId: "gnome:gnomish-lineage",
        lineageId: selection.lineageId,
        spellcastingAbilityId: selection.spellcastingAbilityId,
        cantripIds: [...lineage.cantripIds],
        preparedSpellIds: [...lineage.alwaysPreparedSpellIds],
        alwaysPreparedSpellIds: [...lineage.alwaysPreparedSpellIds],
        freeCasts: forest ? [{ spellId: "speak-with-animals", maximum: proficiencyBonus, current: proficiencyBonus, recharge: "long-rest" }] : [],
        futureSpellGrants: [],
      },
    };
  }

  if (speciesId === "tiefling") {
    const selection = choices.tiefling!;
    const legacy = tieflingLegacy(selection.legacyId);
    return {
      size: selection.size,
      speedFeet: 30,
      speciesAncestryId: selection.legacyId,
      speciesResistanceDamageType: legacy.resistanceDamageType,
      speciesDarkvisionFeet: 60,
      featureIds: [
        "tiefling:darkvision",
        "tiefling:fiendish-legacy",
        `tiefling:fiendish-legacy:${selection.legacyId}`,
        `tiefling:resistance:${legacy.resistanceDamageType}`,
        "tiefling:otherworldly-presence",
      ],
      resources: {},
      spellGrant: {
        sourceSpeciesId: "tiefling",
        featureId: "tiefling:fiendish-legacy",
        lineageId: selection.legacyId,
        spellcastingAbilityId: selection.spellcastingAbilityId,
        cantripIds: [legacy.legacyCantripId, "thaumaturgy"],
        preparedSpellIds: [],
        alwaysPreparedSpellIds: [],
        freeCasts: [],
        futureSpellGrants: legacy.levelGatedSpells.map((grant) => ({
          characterLevel: grant.characterLevel,
          spellId: grant.spellId,
          alwaysPrepared: true,
          freeCastMaximum: 1,
          freeCastRecharge: "long-rest" as const,
        })),
      },
    };
  }

  return { featureIds: [], resources: {} };
}

export function currentGuidedDnd5eSpeciesSpellIds(speciesId: GuidedDnd5eSpeciesId, choices: GuidedDnd5eCoreChoices): string[] {
  if (speciesId === "elf" && choices.elf) return [elfLineage(choices.elf.lineageId).initialCantripId];
  if (speciesId === "gnome" && choices.gnome) {
    const lineage = gnomeLineage(choices.gnome.lineageId);
    return [...lineage.cantripIds, ...lineage.alwaysPreparedSpellIds];
  }
  if (speciesId === "tiefling" && choices.tiefling) {
    return [tieflingLegacy(choices.tiefling.legacyId).legacyCantripId, "thaumaturgy"];
  }
  return [];
}

function assertSpellcastingAbility(value: Dnd5eSpellcastingAbilityId, label: string): void {
  if (value !== "intelligence" && value !== "wisdom" && value !== "charisma") throw new Error(`${label} spellcasting ability must be Intelligence, Wisdom, or Charisma.`);
}
