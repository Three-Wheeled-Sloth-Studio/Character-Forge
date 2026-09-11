import type { CreatorSystemId } from "./creatorWorkspace.js";

export interface CharacterForgeProjectContext {
  source: string;
  projectId: string;
  projectName: string;
  rulesSystems: string[];
  genres: string[];
  attributes: string[];
}

const PROJECT_RULES_TO_CREATOR_SYSTEM: Record<string, CreatorSystemId> = {
  "dnd-5e-2024": "dnd5e-2024",
  "basic-roleplaying": "brp-uge",
};

export function readCharacterForgeProjectContext(params: URLSearchParams): CharacterForgeProjectContext {
  return {
    source: params.get("pwSource") ?? "",
    projectId: params.get("pwProjectId") ?? "",
    projectName: params.get("pwProjectName") ?? "",
    rulesSystems: unique(params.getAll("pwRulesSystem")),
    genres: unique(params.getAll("pwGenre")),
    attributes: unique(params.getAll("pwAttribute")),
  };
}

export function creatorSystemsForProjectContext(context: CharacterForgeProjectContext): CreatorSystemId[] {
  const mapped = context.rulesSystems
    .map((ruleSystem) => PROJECT_RULES_TO_CREATOR_SYSTEM[ruleSystem])
    .filter((system): system is CreatorSystemId => Boolean(system));
  return unique(mapped);
}

export function projectContextLocksCreatorSystem(context: CharacterForgeProjectContext): CreatorSystemId | null {
  if (!context.projectId) return null;
  if (context.rulesSystems.includes("system-agnostic")) return null;
  const supported = creatorSystemsForProjectContext(context);
  return supported.length === 1 ? supported[0]! : null;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
