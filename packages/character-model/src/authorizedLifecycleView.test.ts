import { describe, expect, it, vi } from "vitest";
import { appendLifecycleEvent, createCharacterLifecycle } from "./characterLifecycle.js";
import type { CharacterLifecycleSnapshot } from "./characterLifecycleStore.js";
import { loadAuthorizedGmLifecycle, loadAuthorizedPlayerLifecycle } from "./authorizedLifecycleView.js";

const lifecycle = appendLifecycleEvent(
  appendLifecycleEvent(createCharacterLifecycle("hero"), {
    type: "choice-opened", eventId: "opened", choiceId: "slot", occurredAt: "2026-11-22T12:00:00Z",
    sourceId: "fate:stunt", prompt: "Choose a stunt", optionIds: ["a"], canDefer: true,
  }),
  { type: "choice-assessed", eventId: "assessed", choiceId: "slot", occurredAt: "2026-11-22T12:00:00Z", sourceNativeStateId: "native", rulesSourceId: "fate", eligibleOptionIds: ["a"], reason: "Private GM reasoning" },
);

function setup() {
  const load = vi.fn(async () => ({
    revision: "1", document: { characterId: "hero" }, lifecycle,
  } as CharacterLifecycleSnapshot));
  const canReadPlayerView = vi.fn(async () => true);
  const canReadGmView = vi.fn(async () => false);
  return { store: { load }, authorization: { canReadPlayerView, canReadGmView } };
}

describe("authorized lifecycle read boundary", () => {
  it("rejects a GM read before touching storage even if the player can read", async () => {
    const { store, authorization } = setup();
    await expect(loadAuthorizedGmLifecycle(store, "hero", authorization)).rejects.toThrow("GM access denied");
    expect(store.load).not.toHaveBeenCalled();
    const player = await loadAuthorizedPlayerLifecycle(store, "hero", authorization);
    expect(player.choices[0]?.prompt).toBe("Choose a stunt");
    expect(JSON.stringify(player)).not.toContain("Private GM reasoning");
    expect(authorization.canReadPlayerView).toHaveBeenCalledWith("hero");
  });

  it("requires independent player authorization and returns the GM details only after approval", async () => {
    const { store, authorization } = setup();
    authorization.canReadPlayerView.mockResolvedValue(false);
    authorization.canReadGmView.mockResolvedValue(true);
    await expect(loadAuthorizedPlayerLifecycle(store, "hero", authorization)).rejects.toThrow("Character access denied");
    expect(store.load).not.toHaveBeenCalled();
    const gm = await loadAuthorizedGmLifecycle(store, "hero", authorization);
    expect(gm.choices[0]?.assessment?.reason).toBe("Private GM reasoning");
  });

  it("rejects mismatched lifecycle identity and missing snapshots", async () => {
    const { store, authorization } = setup();
    store.load.mockResolvedValueOnce({ revision: "1", document: { characterId: "hero" }, lifecycle: createCharacterLifecycle("other") } as CharacterLifecycleSnapshot);
    await expect(loadAuthorizedPlayerLifecycle(store, "hero", authorization)).rejects.toThrow("identity mismatch");
    store.load.mockResolvedValueOnce(null as unknown as CharacterLifecycleSnapshot);
    await expect(loadAuthorizedPlayerLifecycle(store, "hero", authorization)).rejects.toThrow("not found");
  });
});
