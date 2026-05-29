export type RuleFinding = {
  file: string;
  ruleId: string;
  severity: "high" | "medium" | "low";
  title: string;
  reason: string;
  evidence: string;
};

export type ReviewRisk = {
  severity: "high" | "medium" | "low";
  confidence: "high" | "medium" | "low";
  file: string;
  title: string;
  reason: string;
  evidence: string;
  recommendation: string;
};

export type ReviewSuggestion = {
  file: string;
  title: string;
  description: string;
  reviewComment: string;
  confidence: "high" | "medium" | "low";
};

export type ReviewReport = {
  pr: import("./github").PullRequestInfo;
  files: import("./github").PullRequestFile[];
  summary: {
    overview: string;
    keyChanges: string[];
    impactAreas: string[];
  };
  risks: ReviewRisk[];
  suggestions: ReviewSuggestion[];
  testSuggestions: string[];
  meta: {
    analyzedAt: string;
    model: string;
    truncated: boolean;
    limitations: string[];
  };
};
