import type { PullRequestInfo, PullRequestFile } from "./github";

export type SeverityLevel = "high" | "medium" | "low";

export const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export type RuleFinding = {
  file: string;
  ruleId: string;
  severity: SeverityLevel;
  title: string;
  reason: string;
  evidence: string;
};

export type ReviewRisk = {
  severity: SeverityLevel;
  confidence: SeverityLevel;
  file: string;
  title: string;
  reason: string;
  evidence: string;
  recommendation?: string;
};

export type ReviewSuggestion = {
  file: string;
  title: string;
  description: string;
  reviewComment: string;
  confidence: SeverityLevel;
};

export type ReviewSummary = {
  overview: string;
  keyChanges: string[];
  impactAreas: string[];
};

export type ReviewMeta = {
  analyzedAt: string;
  model: string;
  truncated: boolean;
  limitations: string[];
};

export type ReviewReport = {
  pr: PullRequestInfo;
  files: PullRequestFile[];
  summary: ReviewSummary;
  risks: ReviewRisk[];
  suggestions: ReviewSuggestion[];
  testSuggestions: string[];
  meta: ReviewMeta;
};
