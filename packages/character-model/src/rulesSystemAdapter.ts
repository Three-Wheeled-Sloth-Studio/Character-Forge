import type { NativeSystemState } from "./characterDocument.js";

export interface RulesLicenseReference {
  id: string;
  url: string;
  creator: string;
  workTitle: string;
}

export interface RulesSourceReference {
  id: string;
  systemId: string;
  editionId: string;
  version: string;
  title: string;
  sourceUrl: string;
  publishedDate?: string;
  license: RulesLicenseReference;
}

export type RulesValidationSeverity = "error" | "warning";

export interface RulesValidationIssue {
  code: string;
  message: string;
  severity: RulesValidationSeverity;
  path?: string;
}

export interface RulesValidationResult {
  valid: boolean;
  issues: RulesValidationIssue[];
}

export interface RulesSystemAdapter {
  readonly adapterId: string;
  readonly adapterVersion: string;
  readonly systemId: string;
  readonly editionId: string;
  readonly supportedRulesSources: readonly RulesSourceReference[];

  validateNativeState(state: NativeSystemState): RulesValidationResult;
}
