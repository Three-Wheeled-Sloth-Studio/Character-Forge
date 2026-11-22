import type { CharacterLifecycleStore } from "./characterLifecycleStore.js";
import { projectGmLifecycle, projectPlayerLifecycle, type GmLifecycleView, type PlayerLifecycleView } from "./lifecyclePresentation.js";

/** The host must derive the actor and campaign role from its trusted session. */
export interface LifecycleReadAuthorization {
  canReadPlayerView(characterId: string): Promise<boolean>;
  canReadGmView(characterId: string): Promise<boolean>;
}

/** No raw lifecycle or native document is returned across this boundary. */
export async function loadAuthorizedPlayerLifecycle(
  store: Pick<CharacterLifecycleStore, "load">,
  characterId: string,
  authorization: LifecycleReadAuthorization,
): Promise<PlayerLifecycleView> {
  if (!await authorization.canReadPlayerView(characterId)) throw new Error("Character access denied.");
  const snapshot = await store.load(characterId);
  if (!snapshot) throw new Error("Character not found.");
  if (snapshot.document.characterId !== characterId || snapshot.lifecycle.characterId !== characterId) throw new Error("Character identity mismatch.");
  return projectPlayerLifecycle(snapshot.lifecycle);
}

export async function loadAuthorizedGmLifecycle(
  store: Pick<CharacterLifecycleStore, "load">,
  characterId: string,
  authorization: LifecycleReadAuthorization,
): Promise<GmLifecycleView> {
  if (!await authorization.canReadGmView(characterId)) throw new Error("GM access denied.");
  const snapshot = await store.load(characterId);
  if (!snapshot) throw new Error("Character not found.");
  if (snapshot.document.characterId !== characterId || snapshot.lifecycle.characterId !== characterId) throw new Error("Character identity mismatch.");
  return projectGmLifecycle(snapshot.lifecycle);
}
