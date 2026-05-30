import type { PullRequestFile } from "@/types/github";
import type { RuleFinding } from "@/types/review";
import { SEVERITY_ORDER } from "@/types/review";
import { riskRules, LARGE_DIFF_THRESHOLD } from "./risk-rules";

function matchPatterns(text: string, patterns: string[]): string[] {
  const matched: string[] = [];
  const lowerText = text.toLowerCase();
  for (const pattern of patterns) {
    if (lowerText.includes(pattern.toLowerCase())) {
      matched.push(pattern);
    }
  }
  return matched;
}

export function scanFile(file: PullRequestFile): RuleFinding[] {
  const findings: RuleFinding[] = [];

  for (const rule of riskRules) {
    if (rule.matchType === "filename") {
      const matched = matchPatterns(file.filename, rule.patterns);
      if (matched.length > 0) {
        findings.push({
          file: file.filename,
          ruleId: rule.ruleId,
          severity: rule.severity,
          title: rule.title,
          reason: rule.reason,
          evidence: `文件名匹配: ${matched.join(", ")}`,
        });
      }
    }

    if (rule.matchType === "content" && file.patch) {
      const matched = matchPatterns(file.patch, rule.patterns);
      if (matched.length > 0) {
        findings.push({
          file: file.filename,
          ruleId: rule.ruleId,
          severity: rule.severity,
          title: rule.title,
          reason: rule.reason,
          evidence: `内容匹配: ${matched.join(", ")}`,
        });
      }
    }

    if (rule.matchType === "meta" && rule.ruleId === "large-diff") {
      if (file.changes > LARGE_DIFF_THRESHOLD) {
        findings.push({
          file: file.filename,
          ruleId: rule.ruleId,
          severity: rule.severity,
          title: rule.title,
          reason: rule.reason,
          evidence: `变更行数: ${file.changes} (阈值: ${LARGE_DIFF_THRESHOLD})`,
        });
      }
    }
  }

  return findings;
}

export function scanAllFiles(files: PullRequestFile[]): RuleFinding[] {
  const allFindings: RuleFinding[] = [];

  // 检测测试删除
  const deletedTests = files.filter(
    (f) =>
      f.status === "removed" &&
      (f.filename.includes(".test.") ||
        f.filename.includes(".spec.") ||
        f.filename.includes("__tests__"))
  );
  if (deletedTests.length > 0) {
    allFindings.push({
      file: deletedTests.map((f) => f.filename).join(", "),
      ruleId: "test-deleted",
      severity: "high",
      title: "测试文件被删除",
      reason: "测试被删除可能导致回归验证缺失",
      evidence: `删除的测试文件: ${deletedTests.map((f) => f.filename).join(", ")}`,
    });
  }

  // 检测核心代码变更但没有测试变更
  const hasTestChanges = files.some(
    (f) =>
      f.filename.includes(".test.") ||
      f.filename.includes(".spec.") ||
      f.filename.includes("__tests__")
  );
  const hasSourceChanges = files.some(
    (f) =>
      !f.filename.includes(".test.") &&
      !f.filename.includes(".spec.") &&
      !f.filename.includes("__tests__") &&
      !f.filename.includes("package.json") &&
      !f.filename.includes("README") &&
      f.status !== "removed"
  );
  if (hasSourceChanges && !hasTestChanges) {
    allFindings.push({
      file: "(全局)",
      ruleId: "test-missing",
      severity: "medium",
      title: "代码变更但缺少测试",
      reason: "核心代码变更但没有对应的测试文件变更",
      evidence: "PR 中包含源代码变更但未包含测试变更",
    });
  }

  // 逐文件扫描
  for (const file of files) {
    allFindings.push(...scanFile(file));
  }

  // 按 severity 排序: high > medium > low
  allFindings.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  return allFindings;
}
