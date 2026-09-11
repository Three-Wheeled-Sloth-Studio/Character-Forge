import { describe, expect, it } from "vitest";
import {
  characterForgeBuildTitle,
  visibleCharacterForgeBuildLabel,
  type CharacterForgeBuildInfo,
} from "./buildInfo.js";

const cleanBuild: CharacterForgeBuildInfo = {
  version: "0.0.1",
  commit: "1234567890abcdef",
  builtAt: "2026-08-28T12:00:00.000Z",
  dirty: false,
};

describe("Character Forge build identity", () => {
  it("keeps the visible product badge quiet and version focused", () => {
    expect(visibleCharacterForgeBuildLabel(cleanBuild)).toBe("v0.0.1");
  });

  it("marks dirty local builds without exposing source hashes in primary chrome", () => {
    expect(visibleCharacterForgeBuildLabel({ ...cleanBuild, dirty: true })).toBe("v0.0.1+dirty");
    expect(characterForgeBuildTitle({ ...cleanBuild, dirty: true })).toContain("1234567890abcdef");
    expect(characterForgeBuildTitle({ ...cleanBuild, dirty: true })).toContain("dirty working tree");
  });
});
