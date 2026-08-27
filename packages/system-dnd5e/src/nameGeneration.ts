import { createGeneratedSeed, createSeededRandom, type RandomSource } from "../../generator-core/src/index.js";

const DND5E_GENERATED_NAMES = [
  "Avery Stone",
  "Mara Voss",
  "Rowan Hale",
  "Tamsin Reed",
  "Jonas Vale",
  "Nia Calder",
] as const;

export function pickDnd5eGeneratedName(random: RandomSource): string {
  const selected = DND5E_GENERATED_NAMES[Math.floor(random() * DND5E_GENERATED_NAMES.length)];
  if (!selected) throw new Error("D&D generated-name catalog is empty.");
  return selected;
}

export function resolveDnd5eCharacterName(name?: string, seed?: string): string {
  const explicit = name?.trim();
  if (explicit) return explicit;
  const effectiveSeed = seed?.trim() || createGeneratedSeed("name");
  return pickDnd5eGeneratedName(createSeededRandom(effectiveSeed));
}
