import type { PullRequestInfo } from "@/types/github";
import type { RuleFinding } from "@/types/review";
import type { ChatMessage } from "@/lib/model/deepseek-client";
import type { ReviewContext } from "./context-builder";

function buildSystemPrompt(): string {
  return `你是一位资深代码评审工程师，负责对 GitHub Pull Request 进行辅助 Review。

你的任务是基于 PR 的 diff 和本地规则扫描结果，生成结构化的 Review 报告。

要求：
1. 只分析实际出现的代码变更，不要编造未出现的代码
2. 每条建议必须基于 diff 中的证据
3. 风格类建议不要标记为高风险
4. 如果证据不足，将 confidence 标记为 low
5. 严格按指定 JSON 格式输出，不要输出其他内容

输出 JSON 格式：
{
  "summary": {
    "overview": "这个 PR 主要做了什么（1-3 句话）",
    "keyChanges": ["关键变更1", "关键变更2"],
    "impactAreas": ["影响范围1", "影响范围2"]
  },
  "risks": [
    {
      "severity": "high|medium|low",
      "confidence": "high|medium|low",
      "file": "文件路径",
      "title": "风险标题",
      "reason": "风险原因",
      "evidence": "来自 diff 的具体证据",
      "recommendation": "建议处理方式"
    }
  ],
  "suggestions": [
    {
      "file": "文件路径",
      "title": "建议标题",
      "description": "建议描述",
      "reviewComment": "可以直接复制到 GitHub Review 的评论内容",
      "confidence": "high|medium|low"
    }
  ],
  "testSuggestions": ["测试建议1", "测试建议2"]
}`;
}

function buildUserPrompt(
  pr: PullRequestInfo,
  context: ReviewContext,
  ruleFindings: RuleFinding[]
): string {
  const parts: string[] = [];

  // PR 基本信息
  parts.push(`## PR 信息`);
  parts.push(`- 标题: #${pr.number} ${pr.title}`);
  parts.push(`- 作者: ${pr.author}`);
  parts.push(`- 分支: ${pr.headBranch} → ${pr.baseBranch}`);
  parts.push(`- 状态: ${pr.state}`);
  parts.push(`- 变更: +${pr.additions} -${pr.deletions}, ${pr.changedFiles} 个文件`);
  if (pr.body) {
    parts.push(`- 描述: ${pr.body.slice(0, 500)}`);
  }

  // 规则扫描结果
  if (ruleFindings.length > 0) {
    parts.push(``);
    parts.push(`## 本地规则扫描发现`);
    for (const finding of ruleFindings) {
      parts.push(
        `- [${finding.severity.toUpperCase()}] ${finding.title} (${finding.file}): ${finding.evidence}`
      );
    }
  }

  // 文件变更详情（已由 context-builder 按风险优先级截断）
  parts.push(``);
  parts.push(`## 变更文件详情`);
  for (const file of context.files) {
    parts.push(``);
    parts.push(`### ${file.filename} (${file.status})`);
    parts.push(`+${file.additions} -${file.deletions}`);
    if (file.riskTags.length > 0) {
      parts.push(`风险标签: ${file.riskTags.join(", ")}`);
    }
    parts.push(`\`\`\`diff`);
    parts.push(file.patchExcerpt);
    parts.push(`\`\`\``);
  }

  if (context.truncated) {
    parts.push(``);
    parts.push(`> 注意：部分文件内容因长度限制被截断或跳过`);
  }

  parts.push(``);
  parts.push(`请基于以上信息生成结构化 Review 报告 JSON。`);

  return parts.join("\n");
}

export function buildReviewMessages(
  pr: PullRequestInfo,
  context: ReviewContext,
  ruleFindings: RuleFinding[]
): ChatMessage[] {
  return [
    { role: "system", content: buildSystemPrompt() },
    {
      role: "user",
      content: buildUserPrompt(pr, context, ruleFindings),
    },
  ];
}
