import type { PullRequestFile } from "@/types/github";
import type { RuleFinding } from "@/types/review";
import { truncatePatch } from "@/lib/utils/truncate";

type FileContext = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  riskTags: string[];
  patchExcerpt: string;
};

export type ReviewContext = {
  files: FileContext[];
  truncated: boolean;
  limitations: string[];
};

const MAX_PATCH_LINES_HIGH_RISK = 200;
const MAX_PATCH_LINES_LOW_RISK = 30;
const MAX_TOTAL_PATCH_LINES = 800;

function getRiskScore(
  filename: string,
  ruleFindings: RuleFinding[]
): number {
  let score = 0;
  for (const finding of ruleFindings) {
    if (finding.file.includes(filename) || filename.includes(finding.file)) {
      if (finding.severity === "high") score += 3;
      else if (finding.severity === "medium") score += 2;
      else score += 1;
    }
  }
  return score;
}

function getRiskTags(
  filename: string,
  ruleFindings: RuleFinding[]
): string[] {
  const tags: string[] = [];
  for (const finding of ruleFindings) {
    if (finding.file.includes(filename) || filename.includes(finding.file)) {
      if (!tags.includes(finding.title)) {
        tags.push(finding.title);
      }
    }
  }
  return tags;
}

export function buildContext(
  files: PullRequestFile[],
  ruleFindings: RuleFinding[]
): ReviewContext {
  const limitations: string[] = [];
  let totalPatchLines = 0;
  let truncated = false;

  // 按风险分数排序，高风险文件优先
  const sortedFiles = [...files].sort((a, b) => {
    const scoreA = getRiskScore(a.filename, ruleFindings);
    const scoreB = getRiskScore(b.filename, ruleFindings);
    return scoreB - scoreA;
  });

  const resultFiles: FileContext[] = [];

  for (const file of sortedFiles) {
    const riskScore = getRiskScore(file.filename, ruleFindings);
    const riskTags = getRiskTags(file.filename, ruleFindings);
    const isHighRisk = riskScore >= 2;

    let patchExcerpt = "";

    if (file.patch) {
      const maxLines = isHighRisk
        ? MAX_PATCH_LINES_HIGH_RISK
        : MAX_PATCH_LINES_LOW_RISK;

      if (totalPatchLines + maxLines > MAX_TOTAL_PATCH_LINES) {
        const remaining = MAX_TOTAL_PATCH_LINES - totalPatchLines;
        if (remaining > 0) {
          patchExcerpt = truncatePatch(file.patch, remaining);
          totalPatchLines += remaining;
        } else {
          patchExcerpt = "(已达到上下文长度限制，跳过此文件 diff)";
        }
        truncated = true;
      } else {
        patchExcerpt = truncatePatch(file.patch, maxLines);
        const lineCount = patchExcerpt.split("\n").length;
        totalPatchLines += lineCount;
      }
    } else {
      patchExcerpt = "(patch 不可用)";
    }

    resultFiles.push({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      riskTags,
      patchExcerpt,
    });
  }

  if (truncated) {
    limitations.push("部分文件 diff 因长度限制被截断或跳过");
  }

  const highRiskCount = resultFiles.filter((f) => f.riskTags.length > 0).length;
  if (highRiskCount > 0) {
    limitations.push(`${highRiskCount} 个高风险文件被优先分析`);
  }

  return {
    files: resultFiles,
    truncated,
    limitations,
  };
}
