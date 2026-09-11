const CREATOR_PANE_STORAGE_KEY = "character-forge.creator-pane-width";
const MIN_CREATOR_PANE_PX = 300;
const MIN_RESULT_PANE_PX = 360;
const SPLITTER_AND_GAPS_PX = 28;
const DEFAULT_CREATOR_PANE_PX = 430;
const KEYBOARD_STEP_PX = 24;

export interface WorkspaceSplitBounds {
  min: number;
  max: number;
}

export function workspaceSplitBounds(workspaceWidth: number): WorkspaceSplitBounds {
  const safeWidth = Math.max(0, workspaceWidth);
  return {
    min: MIN_CREATOR_PANE_PX,
    max: Math.max(MIN_CREATOR_PANE_PX, safeWidth - MIN_RESULT_PANE_PX - SPLITTER_AND_GAPS_PX),
  };
}

export function clampWorkspaceSplit(workspaceWidth: number, requestedWidth: number): number {
  const bounds = workspaceSplitBounds(workspaceWidth);
  const finite = Number.isFinite(requestedWidth) ? requestedWidth : DEFAULT_CREATOR_PANE_PX;
  return Math.min(bounds.max, Math.max(bounds.min, Math.round(finite)));
}

export function mountWorkspaceSplitter(workspace: HTMLElement, splitter: HTMLElement): () => void {
  let dragging = false;
  let currentWidth = readStoredWidth() ?? DEFAULT_CREATOR_PANE_PX;

  const apply = (requestedWidth: number, persist = false): void => {
    const workspaceWidth = workspace.getBoundingClientRect().width || workspace.clientWidth;
    currentWidth = clampWorkspaceSplit(workspaceWidth, requestedWidth);
    const bounds = workspaceSplitBounds(workspaceWidth);
    workspace.style.setProperty("--creator-pane-width", `${currentWidth}px`);
    splitter.setAttribute("aria-valuemin", String(bounds.min));
    splitter.setAttribute("aria-valuemax", String(bounds.max));
    splitter.setAttribute("aria-valuenow", String(currentWidth));
    if (persist) storeWidth(currentWidth);
  };

  const pointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    dragging = true;
    splitter.classList.add("dragging");
    splitter.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };
  const pointerMove = (event: PointerEvent): void => {
    if (!dragging) return;
    const left = workspace.getBoundingClientRect().left;
    apply(event.clientX - left);
  };
  const pointerUp = (event: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    splitter.classList.remove("dragging");
    splitter.releasePointerCapture?.(event.pointerId);
    apply(currentWidth, true);
  };
  const keyDown = (event: KeyboardEvent): void => {
    if (event.key === "ArrowLeft") {
      apply(currentWidth - KEYBOARD_STEP_PX, true);
    } else if (event.key === "ArrowRight") {
      apply(currentWidth + KEYBOARD_STEP_PX, true);
    } else if (event.key === "Home") {
      apply(workspaceSplitBounds(workspace.getBoundingClientRect().width || workspace.clientWidth).min, true);
    } else if (event.key === "End") {
      apply(workspaceSplitBounds(workspace.getBoundingClientRect().width || workspace.clientWidth).max, true);
    } else {
      return;
    }
    event.preventDefault();
  };
  const resized = (): void => apply(currentWidth);

  splitter.addEventListener("pointerdown", pointerDown);
  splitter.addEventListener("pointermove", pointerMove);
  splitter.addEventListener("pointerup", pointerUp);
  splitter.addEventListener("pointercancel", pointerUp);
  splitter.addEventListener("keydown", keyDown);
  window.addEventListener("resize", resized);
  apply(currentWidth);

  return () => {
    splitter.removeEventListener("pointerdown", pointerDown);
    splitter.removeEventListener("pointermove", pointerMove);
    splitter.removeEventListener("pointerup", pointerUp);
    splitter.removeEventListener("pointercancel", pointerUp);
    splitter.removeEventListener("keydown", keyDown);
    window.removeEventListener("resize", resized);
  };
}

function readStoredWidth(): number | null {
  try {
    const parsed = Number(window.localStorage.getItem(CREATOR_PANE_STORAGE_KEY));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function storeWidth(width: number): void {
  try {
    window.localStorage.setItem(CREATOR_PANE_STORAGE_KEY, String(width));
  } catch {
    // Storage is a convenience only; resizing remains functional without it.
  }
}
