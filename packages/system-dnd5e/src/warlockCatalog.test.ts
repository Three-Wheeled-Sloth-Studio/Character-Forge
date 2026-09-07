import { describe, expect, it } from "vitest";
import {
  pactTomeCantripOptionsExcluding,
  pactTomeRitualSpellOptionsExcluding,
} from "./warlockCatalog.js";

describe("Pact of the Tome availability", () => {
  it("removes cantrips the Warlock already has prepared from another source", () => {
    const ids = pactTomeCantripOptionsExcluding(["eldritch-blast", "guidance"]).map((option) => option.id);
    expect(ids).not.toContain("eldritch-blast");
    expect(ids).not.toContain("guidance");
    expect(ids).toContain("vicious-mockery");
  });

  it("removes Level 1 rituals the Warlock already has prepared from another source", () => {
    const ids = pactTomeRitualSpellOptionsExcluding(["detect-magic", "find-familiar"]).map((option) => option.id);
    expect(ids).not.toContain("detect-magic");
    expect(ids).not.toContain("find-familiar");
    expect(ids).toContain("alarm");
  });
});
