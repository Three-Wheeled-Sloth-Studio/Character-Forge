import type { Dnd5eClassSpellcastingState, Dnd5eSpellSlotState } from "./nativeCharacter.js";
import type { GuidedDnd5eClericChoices, GuidedDnd5eDruidChoices, GuidedDnd5ePreparedCasterChoices } from "./guidedChoices.js";
import { preparedCasterCatalog } from "./preparedCasterCatalog.js";

function levelOneStandardSlot(): Dnd5eSpellSlotState {
  return { level: 1, maximum: 2, current: 2, recharge: "long-rest" };
}

export function createLevelOneClericSpellcasting(choices: GuidedDnd5eClericChoices): Dnd5eClassSpellcastingState {
  return {
    sourceClassId: "cleric", featureId: "cleric:spellcasting", spellListId: "cleric", spellcastingAbilityId: "wisdom",
    cantripIds: [...choices.cantripIds], preparedSpellIds: [...choices.preparedSpellIds], alwaysPreparedSpellIds: [],
    spellSlots: [levelOneStandardSlot()], preparationChange: "long-rest-any", focusItemIds: ["holy-symbol"],
  };
}

export function createLevelOneDruidSpellcasting(choices: GuidedDnd5eDruidChoices): Dnd5eClassSpellcastingState {
  return {
    sourceClassId: "druid", featureId: "druid:spellcasting", spellListId: "druid", spellcastingAbilityId: "wisdom",
    cantripIds: [...choices.cantripIds], preparedSpellIds: [...choices.preparedSpellIds], alwaysPreparedSpellIds: ["speak-with-animals"],
    spellSlots: [levelOneStandardSlot()], preparationChange: "long-rest-any", focusItemIds: ["druidic-focus"],
  };
}

export function createLevelOnePreparedCasterSpellcasting(
  choices: GuidedDnd5ePreparedCasterChoices,
  focusItemIds?: readonly string[],
): Dnd5eClassSpellcastingState {
  const catalog = preparedCasterCatalog(choices.classId);
  if (!catalog || choices.classId === "warlock") throw new Error(`No standard Level 1 prepared-caster catalog for ${choices.classId}.`);
  return {
    sourceClassId: choices.classId,
    featureId: `${choices.classId}:spellcasting`,
    spellListId: choices.classId,
    spellcastingAbilityId: catalog.spellcastingAbilityId,
    cantripIds: [...choices.cantripIds],
    preparedSpellIds: [...choices.preparedSpellIds],
    alwaysPreparedSpellIds: [...catalog.alwaysPreparedSpellIds],
    ...(choices.spellbookSpellIds ? { spellbookSpellIds: [...choices.spellbookSpellIds] } : {}),
    spellSlots: [levelOneStandardSlot()],
    preparationChange: catalog.preparationChange,
    focusItemIds: [...(focusItemIds ?? catalog.focusItemIds)],
  };
}

export function createLevelOneWarlockPactMagic(choices: GuidedDnd5ePreparedCasterChoices): Dnd5eClassSpellcastingState {
  if (choices.classId !== "warlock") throw new Error("Warlock Pact Magic requires Warlock spell choices.");
  return {
    sourceClassId: "warlock",
    featureId: "warlock:pact-magic",
    spellListId: "warlock",
    spellcastingAbilityId: "charisma",
    cantripIds: [...choices.cantripIds],
    preparedSpellIds: [...choices.preparedSpellIds],
    alwaysPreparedSpellIds: [],
    spellSlots: [{ level: 1, maximum: 1, current: 1, recharge: "short-or-long-rest" }],
    preparationChange: "level-one",
    focusItemIds: ["arcane-focus"],
    castingMode: "pact-magic",
  };
}
