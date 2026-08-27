import type { Dnd5eClassSpellcastingState, Dnd5eSpellSlotState } from "./nativeCharacter.js";
import type { GuidedDnd5eClericChoices } from "./guidedChoices.js";

export function createLevelOneClericSpellcasting(choices: GuidedDnd5eClericChoices): Dnd5eClassSpellcastingState {
  const slot: Dnd5eSpellSlotState = {
    level: 1,
    maximum: 2,
    current: 2,
    recharge: "long-rest",
  };
  return {
    sourceClassId: "cleric",
    featureId: "cleric:spellcasting",
    spellListId: "cleric",
    spellcastingAbilityId: "wisdom",
    cantripIds: [...choices.cantripIds],
    preparedSpellIds: [...choices.preparedSpellIds],
    alwaysPreparedSpellIds: [],
    spellSlots: [slot],
    preparationChange: "long-rest-any",
    focusItemIds: ["holy-symbol"],
  };
}
