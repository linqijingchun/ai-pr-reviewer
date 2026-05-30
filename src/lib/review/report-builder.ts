import type { PullRequestInfo, PullRequestFile } from "@/types/github";
import type { RuleFinding, ReviewRisk, ReviewSuggestion, ReviewReport } from "@/types/review";
import type { AiReviewResult } from "./ai-reviewer";
import { buildContext } from "./context-builder";

function deduplicateRisks(
  ruleFindings: RuleFinding[],
  aiRisks: AiReviewResult["risks"]
): ReviewRisk[] {
  const merged: ReviewRisk[] = [];

  // 先加入 AI 风险（优先级更高）
  for (const risk of aiRisks) {
    merged.push({
      severity: risk.severity,
      confidence: risk.confidence,
      file: risk.file,
      title: risk.title,
      reason: risk.reason,
      evidence: risk.evidence,
      recommendation: risk.recommendation,
    });
  }

  // 再加入规则扫描结果，跳过与 AI 结果重复的
  for (const finding of ruleFindings) {
    const isDuplicate = merged.some((r) => {
      const sameFile =
        r.file.includes(finding.file) || finding.file.includes(r.file);
      const sameTitle =
        r.title.includes(finding.title) ||
        finding.title.includes(r.title);
      return sameFile && sameTitle;
    });

    if (!isDuplicate) {
      merged.push({
        severity: finding.severity,
        confidence: "medium",
        file: finding.file,
        title: finding.title,
        reason: finding.reason,
        evidence: finding.evidence,
        recommendation: "请人工确认",
      });
    }
  }

  // 按 severity 排序
  const order = { high: 0, medium: 1, low: 2 };
  merged.sort((a, b) => order[a.severity] - order[b.severity]);

  return merged;
}

export function buildReport(
  pr: PullRequestInfo,
  files: PullRequestFile[],
  ruleFindings: RuleFinding[],
  aiResult: AiReviewResult | null,
  aiError: string | null
): ReviewReport {
  const context = buildContext(files, ruleFindings);

  let summary: ReviewReport["summary"];
  let risks: ReviewRisk[];
  let suggestions: ReviewSuggestion[];
  let testSuggestions: string[];

  if (aiResult) {
    summary = aiResult.summary;
    risks = deduplicateRisks(ruleFindings, aiResult.risks);
    suggestions = aiResult.suggestions;
    testSuggestions = aiResult.testSuggestions;
  } else {
    // AI 不可用时，使用规则结果构建基础报告
    summary = {
      overview: "AI 分析不可用，以下为本地规则扫描结果",
      keyChanges: files.map((f) => `${f.filename} (${f.status})`).slice(0, 5),
      impactAreas: [],
    };
    risks = ruleFindings.map((f) => ({
      severity: f.severity,
      confidence: "medium" as const,
      file: f.file,
      title: f.title,
      reason: f.reason,
      evidence: f.evidence,
      recommendation: "请人工确认",
    }));
    suggestions = [];
    testSuggestions = [];
  }

  const limitations = [...context.limitations];
  if (aiError) {
    limitations.push(`AI 分析失败: ${aiError}`);
  }

  return {
    pr,
    files,
    summary,
    risks,
    suggestions,
    testSuggestions,
    meta: {
      analyzedAt: new Date().toISOString(),
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      truncated: context.truncated,
      limitations,
    },
  };
}
