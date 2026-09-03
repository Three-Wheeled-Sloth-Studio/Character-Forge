import type { Dnd5eClassSpellcastingState, Dnd5eSpellSlotState } from "./nativeCharacter.js";
import type { GuidedDnd5eClericChoices, GuidedDnd5eDruidChoices } from "./guidedChoices.js";

function levelOneStandardSlot(): Dnd5eSpellSlotState {
  return {
    level: 1,
    maximum: 2,
    current: 2,
    recharge: "long-rest",
  };
}

export function createLevelOneClericSpellcasting(choices: GuidedDnd5eClericChoices): Dnd5eClassSpellcastingState {
  return {
    sourceClassId: "cleric",
    featureId: "cleric:spellcasting",
    spellListId: "cleric",
    spellcastingAbilityId: "wisdom",
    cantripIds: [...choices.cantripIds],
    preparedSpellIds: [...choices.preparedSpellIds],
    alwaysPreparedSpellIds: [],
    spellSlots: [levelOneStandardSlot()],
    preparationChange: "long-rest-any",
    focusItemIds: ["holy-symbol"],
  };
}

export function createLevelOneDruidSpellcasting(choices: GuidedDnd5eDruidChoices): Dnd5eClassSpellcastingState {
  return {
    sourceClassId: "druid",
    featureId: "druid:spellcasting",
    spellListId: "druid",
    spellcastingAbilityId: "wisdom",
    cantripIds: [...choices.cantripIds],
    preparedSpellIds: [...choices.preparedSpellIds],
    alwaysPreparedSpellIds: ["speak-with-animals"],
    spellSlots: [levelOneStandardSlot()],
    preparationChange: "long-rest-any",
    focusItemIds: ["druidic-focus"],
  };
}
