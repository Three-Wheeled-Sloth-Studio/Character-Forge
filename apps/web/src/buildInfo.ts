export interface CharacterForgeBuildInfo {
  version: string;
  commit: string;
  builtAt: string;
  dirty?: boolean;
}

declare global {
  interface Window {
    __CHARACTER_FORGE_BUILD__?: CharacterForgeBuildInfo;
  }
}

const FALLBACK_BUILD: CharacterForgeBuildInfo = {
  version: "dev",
  commit: "unknown",
  builtAt: "unknown",
};

export function currentCharacterForgeBuildInfo(target: Window = window): CharacterForgeBuildInfo {
  return target.__CHARACTER_FORGE_BUILD__ ?? FALLBACK_BUILD;
}

export function visibleCharacterForgeBuildLabel(info: CharacterForgeBuildInfo): string {
  return `v${info.version}${info.dirty ? "+dirty" : ""}`;
}

export function characterForgeBuildTitle(info: CharacterForgeBuildInfo): string {
  const dirty = info.dirty ? " (dirty working tree)" : "";
  return `Character Forge v${info.version} · ${info.commit}${dirty} · built ${info.builtAt}`;
}
