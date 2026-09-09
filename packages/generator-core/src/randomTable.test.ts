import { describe, expect, it } from "vitest";
import {
  evaluateRandomTable,
  pickWeightedRandomTableEntry,
  type RandomTable,
} from "./randomTable.js";

interface ExampleSuggestion {
  category: "trait" | "equipment";
  label: string;
  tags: string[];
  nativeId?: string;
}

const exampleTable: RandomTable<ExampleSuggestion> = {
  id: "example.character-flavor",
  version: "1",
  source: {
    id: "example-system-dataset",
    version: "2026-09-09",
  },
  entries: [
    {
      id: "quiet-observer",
      weight: 1,
      result: {
        category: "trait",
        label: "Quiet observer",
        tags: ["observant"],
      },
    },
    {
      id: "restless-scholar",
      weight: 3,
      result: {
        category: "trait",
        label: "Restless scholar",
        tags: ["curious", "academic"],
      },
    },
    {
      id: "well-used-toolkit",
      weight: 6,
      result: {
        category: "equipment",
        label: "Well-used toolkit",
        tags: ["practical"],
        nativeId: "example.toolkit",
      },
    },
  ],
};

describe("random table evaluator", () => {
  it("replays the same structured result and provenance for the same draw", () => {
    const first = evaluateRandomTable(exampleTable, { seed: "replay-me", drawIndex: 2 });
    const second = evaluateRandomTable(exampleTable, { seed: "replay-me", drawIndex: 2 });

    expect(first).toEqual(second);
    expect(first.provenance).toMatchObject({
      evaluatorVersion: "random-table/0.1",
      tableId: "example.character-flavor",
      tableVersion: "1",
      source: {
        id: "example-system-dataset",
        version: "2026-09-09",
      },
      seed: "replay-me",
      drawIndex: 2,
      totalWeight: 10,
    });
    expect(exampleTable.entries.map((entry) => entry.id)).toContain(first.provenance.selectedEntryId);
    expect(first.result.tags.length).toBeGreaterThan(0);
  });

  it("uses weights without making the core care about result shape", () => {
    expect(pickWeightedRandomTableEntry(exampleTable, () => 0).entry.id).toBe("quiet-observer");
    expect(pickWeightedRandomTableEntry(exampleTable, () => 0.099999).entry.id).toBe("quiet-observer");
    expect(pickWeightedRandomTableEntry(exampleTable, () => 0.1).entry.id).toBe("restless-scholar");
    expect(pickWeightedRandomTableEntry(exampleTable, () => 0.399999).entry.id).toBe("restless-scholar");
    expect(pickWeightedRandomTableEntry(exampleTable, () => 0.4).entry.id).toBe("well-used-toolkit");
    expect(pickWeightedRandomTableEntry(exampleTable, () => 0.999999).entry.id).toBe("well-used-toolkit");
  });

  it("treats drawIndex as explicit replay provenance rather than hidden global order", () => {
    const draws = [0, 1, 2, 3].map((drawIndex) =>
      evaluateRandomTable(exampleTable, { seed: "stable-seed", drawIndex }),
    );
    const replayed = [3, 1, 0, 2].map((drawIndex) =>
      evaluateRandomTable(exampleTable, { seed: "stable-seed", drawIndex }),
    );

    for (const evaluation of replayed) {
      const original = draws.find(
        (candidate) => candidate.provenance.drawIndex === evaluation.provenance.drawIndex,
      );
      expect(evaluation).toEqual(original);
    }
  });

  it("rejects malformed tables before choosing a result", () => {
    const firstEntry = exampleTable.entries[0]!;

    expect(() =>
      pickWeightedRandomTableEntry(
        {
          ...exampleTable,
          entries: [firstEntry, { ...firstEntry }],
        },
        () => 0,
      ),
    ).toThrow("Duplicate random table entry id");

    expect(() =>
      pickWeightedRandomTableEntry(
        {
          ...exampleTable,
          entries: [{ ...firstEntry, weight: 0 }],
        },
        () => 0,
      ),
    ).toThrow("positive finite weight");

    expect(() => pickWeightedRandomTableEntry(exampleTable, () => 1)).toThrow("range [0, 1)");
  });

  it("rejects empty seeds and invalid draw indexes", () => {
    expect(() => evaluateRandomTable(exampleTable, { seed: "   " })).toThrow("non-empty seed");
    expect(() => evaluateRandomTable(exampleTable, { seed: "seed", drawIndex: -1 })).toThrow(
      "non-negative integer",
    );
    expect(() => evaluateRandomTable(exampleTable, { seed: "seed", drawIndex: 1.5 })).toThrow(
      "non-negative integer",
    );
  });
});
