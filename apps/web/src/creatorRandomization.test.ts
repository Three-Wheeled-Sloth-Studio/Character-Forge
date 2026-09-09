import { describe, expect, it } from "vitest";
import { runCreatorRandomizerSequence, type CreatorRandomizerAction } from "./creatorRandomization.js";

describe("creator randomization orchestration", () => {
  it("re-resolves after every action so dynamic controls can join the same Randomize All pass", () => {
    const executed: string[] = [];
    let phase = 0;

    const resolve = (seenIds: ReadonlySet<string>): CreatorRandomizerAction | null => {
      const available = phase === 0 ? ["identity"] : ["identity", "dependent", "final"];
      const id = available.find((candidate) => !seenIds.has(candidate));
      if (!id) return null;
      return {
        id,
        invoke: () => {
          executed.push(id);
          if (id === "identity") phase = 1;
        },
      };
    };

    expect(runCreatorRandomizerSequence(resolve)).toEqual(["identity", "dependent", "final"]);
    expect(executed).toEqual(["identity", "dependent", "final"]);
  });

  it("skips disabled actions without retrying them", () => {
    const invoked: string[] = [];
    const actions: CreatorRandomizerAction[] = [
      { id: "enabled", invoke: () => invoked.push("enabled") },
      { id: "disabled", disabled: true, invoke: () => invoked.push("disabled") },
    ];

    const result = runCreatorRandomizerSequence((seenIds) => actions.find((action) => !seenIds.has(action.id)) ?? null);

    expect(result).toEqual(["enabled"]);
    expect(invoked).toEqual(["enabled"]);
  });

  it("rejects unstable blank action identities", () => {
    expect(() => runCreatorRandomizerSequence(() => ({ id: "  ", invoke: () => undefined }))).toThrow(
      "stable non-empty IDs",
    );
  });
});
