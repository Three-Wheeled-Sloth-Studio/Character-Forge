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
  it("shows version and short source commit for QA", () => {
    expect(visibleCharacterForgeBuildLabel(cleanBuild)).toBe("v0.0.1 · 12345678");
  });

  it("makes dirty local builds explicit", () => {
    expect(visibleCharacterForgeBuildLabel({ ...cleanBuild, dirty: true })).toBe("v0.0.1 · 12345678+dirty");
    expect(characterForgeBuildTitle({ ...cleanBuild, dirty: true })).toContain("dirty working tree");
  });
});
